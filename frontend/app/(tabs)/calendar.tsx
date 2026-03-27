import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Calendar as RNCourseCalendar, LocaleConfig } from 'react-native-calendars';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { CalendarDays, AlertCircle } from 'lucide-react-native';
import { TaskItem, TaskService } from '../../services/api';
import TaskComponent from '../../components/TaskComponent';

// Set up Hebrew Locale
LocaleConfig.locales['he'] = {
  monthNames: ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'],
  monthNamesShort: ['ינו', 'פבר', 'מרץ', 'אפר', 'מאי', 'יונ', 'יול', 'אוג', 'ספט', 'אוק', 'נוב', 'דצמ'],
  dayNames: ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'],
  dayNamesShort: ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'],
  today: 'היום'
};
LocaleConfig.defaultLocale = 'he';

export default function CalendarScreen() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const data = await TaskService.getAll();
      setTasks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleToggleTask = async (taskId: string, currentStatus: boolean) => {
    try {
      await TaskService.update(taskId, { completed: !currentStatus });
      fetchTasks();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await TaskService.delete(taskId);
      fetchTasks();
    } catch (error) {
      console.error(error);
    }
  };

  // Build marked dates
  const markedDates: any = {};
  tasks.forEach(t => {
    // Determine the date to mark. 
    // If dueDate exists, use it. Otherwise, fallback to createdAt for demonstration.
    const dateStr = t.dueDate ? format(new Date(t.dueDate), 'yyyy-MM-dd') : format(new Date(t.createdAt!), 'yyyy-MM-dd');
    if (!markedDates[dateStr]) {
      markedDates[dateStr] = { dots: [] };
    }
    // Add a dot
    const color = t.completed ? '#4ade80' : (t.priority === 'high' ? '#ef4444' : '#818cf8');
    markedDates[dateStr].dots.push({ key: t._id, color, selectedDotColor: color });
  });

  // Mark selected date
  if (markedDates[selectedDate]) {
    markedDates[selectedDate] = { ...markedDates[selectedDate], selected: true, selectedColor: '#312e81' };
  } else {
    markedDates[selectedDate] = { selected: true, selectedColor: '#312e81' };
  }

  // Filter tasks for the selected date
  const selectedTasks = tasks.filter(t => {
    const d = t.dueDate ? new Date(t.dueDate) : new Date(t.createdAt!);
    return format(d, 'yyyy-MM-dd') === selectedDate;
  });

  return (
    <View className="flex-1 bg-slate-900">
      {/* Solid Header */}
      <View className="w-full z-10 bg-slate-900 pt-14 border-b border-white/10">
        <View className="px-6 py-4 flex-row-reverse justify-between items-center">
          <Text className="text-white text-3xl font-bold tracking-tight text-right">לוח שנה חכם</Text>
          <View className="bg-indigo-500/20 p-2 rounded-full border border-indigo-400/30">
            <CalendarDays color="#818cf8" size={24} />
          </View>
        </View>
      </View>

      <ScrollView 
        className="flex-1 pt-4 px-4" 
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchTasks} tintColor="#fff" />}
      >
        <View className="bg-slate-800/50 rounded-3xl overflow-hidden border border-white/5 mb-6">
          <RNCourseCalendar
            current={selectedDate}
            onDayPress={(day: any) => setSelectedDate(day.dateString)}
            markingType={'multi-dot'}
            markedDates={markedDates}
            theme={{
              backgroundColor: 'transparent',
              calendarBackground: 'transparent',
              textSectionTitleColor: '#94a3b8',
              selectedDayBackgroundColor: '#4f46e5',
              selectedDayTextColor: '#ffffff',
              todayTextColor: '#818cf8',
              dayTextColor: '#f8fafc',
              textDisabledColor: '#334155',
              dotColor: '#818cf8',
              selectedDotColor: '#ffffff',
              arrowColor: '#818cf8',
              monthTextColor: '#f8fafc',
              indicatorColor: '#818cf8',
              textDayFontWeight: '500',
              textMonthFontWeight: 'bold',
              textDayHeaderFontWeight: '600',
              textDayFontSize: 16,
              textMonthFontSize: 18,
            }}
          />
        </View>

        <View className="mb-4 flex-row-reverse items-center justify-between px-2">
          <Text className="text-slate-300 text-xl font-bold">משימות ליום זה</Text>
          <View className="bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
            <Text className="text-indigo-400 font-medium">{format(new Date(selectedDate), 'dd MMMM yyyy')}</Text>
          </View>
        </View>

        <View className="gap-y-4 mb-24">
          {selectedTasks.length > 0 ? (
            selectedTasks.map(task => (
              <TaskComponent 
                key={task._id} 
                task={task} 
                onToggle={() => handleToggleTask(task._id, task.completed)}
                onDelete={() => handleDeleteTask(task._id)}
              />
            ))
          ) : (
            <View className="bg-slate-800/30 rounded-3xl p-8 items-center justify-center border border-dashed border-slate-700 mt-2">
              <AlertCircle color="#64748b" size={48} className="mb-4" />
              <Text className="text-slate-400 text-lg font-medium text-center">אין משימות מתוכננות ליום זה!</Text>
              <Text className="text-slate-500 text-sm mt-1 text-center">תוכל לנוח או למשוך משימות מהיומן המסונכרן.</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
