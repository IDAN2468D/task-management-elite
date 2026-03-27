import React from 'react';
import { View, Text, TouchableOpacity, Alert, Platform } from 'react-native';
import * as Calendar from 'expo-calendar';
import Animated, { FadeInRight, FadeOutLeft, LinearTransition } from 'react-native-reanimated';
import { CheckCircle2, Circle, Trash2, Play, CalendarPlus, ChevronLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';

interface TaskProps {
  task: any;
  onToggle: () => void;
  onDelete: () => void;
}

export default function TaskComponent({ task, onToggle, onDelete }: TaskProps) {
  const router = useRouter();
  
  const addToCalendar = async () => {
    try {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('שגיאה', 'יש לאשר גישה ליומן כדי להוסיף משימות');
        return;
      }
      
      const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      const defaultCalendar = Platform.OS === 'ios'
        ? await Calendar.getDefaultCalendarAsync()
        : calendars.find(cal => cal.isPrimary) || calendars[0];

      if (!defaultCalendar) {
        Alert.alert('שגיאה', 'לא נמצא יומן זמין במכשיר');
        return;
      }

      await Calendar.createEventAsync(defaultCalendar.id, {
        title: task.title,
        startDate: new Date(),
        endDate: new Date(Date.now() + 60 * 60 * 1000),
        notes: (task.projectId && task.projectId.name) ? `פרויקט: ${task.projectId.name}` : '',
      });
      
      Alert.alert('מצוין!', 'המשימה נוספה ליומן האישי שלך בהצלחה');
    } catch (error) {
      console.log('Calendar error:', error);
      Alert.alert('שגיאה', 'לא הצלחנו להוסיף את המשימה ליומן');
    }
  };

  const projectColor = task.projectId?.themeColor || '#6366f1';

  return (
    <Animated.View 
      entering={FadeInRight.springify()} 
      exiting={FadeOutLeft.springify()}
      layout={LinearTransition.springify()}
      className="mb-3"
    >
      <View className="bg-slate-900/95 rounded-[32px] border border-white/5 overflow-hidden shadow-xl flex-row-reverse items-center justify-between py-5 px-6">
        
        {/* 'Ayin' - Premium Priority Pill (Left side trailing edge) */}
        <View 
          className="absolute left-1.5 top-5 bottom-5 w-1 rounded-full" 
          style={{ 
            backgroundColor: projectColor,
            shadowColor: projectColor,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.8,
            shadowRadius: 4,
            elevation: 5
          }}
        />

        <View className="flex-row-reverse items-center flex-1 pr-3">
          {/* Custom Checkbox */}
          <TouchableOpacity 
            onPress={onToggle} 
            className={`w-11 h-11 rounded-2xl items-center justify-center ml-8 ${task.completed ? 'bg-emerald-500/20' : 'bg-slate-800/80 shadow-sm'}`}
          >
            {task.completed ? (
              <CheckCircle2 color="#10b981" size={24} />
            ) : (
              <Circle color="#475569" size={24} />
            )}
          </TouchableOpacity>

          <View className="flex-1">
            <Text 
              className={`text-lg text-right font-bold tracking-tight ${task.completed ? 'line-through text-slate-500' : 'text-slate-100'}`}
              numberOfLines={1}
            >
              {task.title}
            </Text>
            {task.projectId && (
              <View className="flex-row-reverse items-center mt-1 opacity-70">
                <Text className="text-[10px] text-right font-black uppercase tracking-[2px]" style={{ color: projectColor }}>
                  {task.projectId.name}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Action Buttons */}
        <View className="flex-row-reverse items-center gap-2">
          {!task.completed && (
             <TouchableOpacity 
                onPress={() => router.push({ pathname: '/focus', params: { title: task.title } })}
                className="w-10 h-10 bg-amber-500/10 rounded-2xl items-center justify-center border border-amber-500/10"
              >
                <Play color="#f59e0b" size={18} fill="#f59e0b" style={{ opacity: 0.8 }} />
              </TouchableOpacity>
          )}

          <TouchableOpacity 
            onPress={addToCalendar}
            className="w-10 h-10 bg-indigo-500/10 rounded-2xl items-center justify-center border border-indigo-500/10"
          >
            <CalendarPlus color="#818cf8" size={18} />
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={onDelete}
            className="w-10 h-10 bg-red-500/10 rounded-2xl items-center justify-center border border-red-500/10"
          >
            <Trash2 color="#ef4444" size={18} />
          </TouchableOpacity>
        </View>

      </View>
    </Animated.View>
  );
}
