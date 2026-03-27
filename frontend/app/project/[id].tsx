import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, RefreshControl, Dimensions, Alert, Modal } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { ChevronRight, MoreVertical, Plus, Sparkles, BrainCircuit, AlertCircle, Trash2, CheckCircle2, ListTodo, LayoutPanelTop } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Project, TaskItem, ProjectService, TaskService, AiService } from '../../services/api';
import TaskComponent from '../../components/TaskComponent';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = width * 0.88;

export default function ProjectScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [menuVisible, setMenuVisible] = useState(false);

  const fetchProjectData = async () => {
    try {
      setLoading(true);
      const allProjects = await ProjectService.getAll();
      const current = allProjects.find((p: Project) => p._id === id);
      if (current) setProject(current);

      const projectTasks = await TaskService.getAll(id);
      setTasks(projectTasks);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchProjectData();
  }, [id]);

  const handleDeleteTask = async (taskId: string) => {
    await TaskService.delete(taskId);
    fetchProjectData();
  };

  const handleDeleteProject = async () => {
    Alert.alert(
      'מחיקת פרויקט',
      'האם אתה בטוח שברצונך למחוק את הפרויקט וכל המשימות המשויכות אליו? פעולה זו אינה ניתנת לביטול.',
      [
        { text: 'ביטול', style: 'cancel' },
        { 
          text: 'מחק', 
          style: 'destructive', 
          onPress: async () => {
            await ProjectService.delete(id as string);
            router.replace('/(tabs)');
          } 
        }
      ]
    );
  };

  const handleAiSummary = async () => {
    setMenuVisible(false);
    Alert.alert('AI Insights', 'מנתח את סטטוס הפרויקט... (Gemini 2.5 Flash)');
    try {
      const summary = await AiService.analyzeTasks(tasks);
      Alert.alert('סיכום פרויקט חכם', summary.analysis);
    } catch (err) {
      Alert.alert('שגיאה', 'לא הצלחנו ליצור סיכום כרגע');
    }
  };

  const moveTask = async (taskId: string, newStatus: 'todo' | 'in-progress' | 'done') => {
    setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status: newStatus, completed: newStatus === 'done' } : t));
    await TaskService.update(taskId, { status: newStatus, completed: newStatus === 'done' });
  };

  if (!project) return <View className="flex-1 bg-slate-950" />;

  const todoTasks = tasks.filter(t => !t.completed && (t.status === 'todo' || !t.status));
  const inProgressTasks = tasks.filter(t => !t.completed && t.status === 'in-progress');
  const doneTasks = tasks.filter(t => t.completed || t.status === 'done');

  const renderColumn = (title: string, columnTasks: TaskItem[], status: 'todo'|'in-progress'|'done', nextStatus: 'todo'|'in-progress'|'done', color: string) => (
    <View style={{ width: COLUMN_WIDTH }} className="ml-5 flex-1 p-1">
      <View className="flex-row-reverse items-center justify-between mb-8 px-4 py-3 rounded-card bg-slate-900 border border-white/5 shadow-lg">
        <View className="flex-row-reverse items-center">
          <View className={`w-2 h-2 rounded-full ml-3 ${status === 'done' ? 'bg-emerald-400 shadow-[0_0_10px_#10b981]' : ''}`} style={status !== 'done' ? { backgroundColor: color } : {}} />
          <Text className={`text-xl font-black tracking-tight ${status === 'done' ? 'text-emerald-400' : 'text-white'}`}>{title}</Text>
          {status !== 'done' && (
            <View className="bg-white/10 px-2.5 py-0.5 rounded-lg ml-3 border border-white/5">
              <Text className="text-white text-[10px] font-black">{columnTasks.length}</Text>
            </View>
          )}
        </View>
        
        <TouchableOpacity 
          onPress={() => router.push({ pathname: '/add-task', params: { initialStatus: status } })}
          className="w-10 h-10 rounded-2xl items-center justify-center bg-white/10 border border-white/10 active:bg-white/20"
        >
          {status === 'done' ? (
            <Sparkles color="#10b981" size={18} />
          ) : (
            <Text className="text-xl font-light" style={{ color: color }}>+</Text>
          )}
        </TouchableOpacity>
      </View>
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 150 }}>
        {columnTasks.map(task => (
          <View key={task._id} className="mb-4">
            <TaskComponent 
              task={task} 
              onToggle={() => moveTask(task._id, nextStatus)}
              onDelete={() => handleDeleteTask(task._id)}
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <View className="flex-1 bg-slate-950">
      <SafeAreaView className="flex-1">
        {/* Floating Glass Header */}
        <View className="mx-6 my-2 p-1 rounded-card overflow-hidden border border-white/5 bg-slate-900 shadow-2xl">
          <View className="px-5 py-4 flex-row-reverse justify-between items-center rounded-card">
            <TouchableOpacity onPress={() => router.back()} className="w-11 h-11 bg-slate-800 rounded-2xl items-center justify-center border border-white/10 shadow-sm active:bg-slate-700">
              <ChevronRight color="#f8fafc" size={26} />
            </TouchableOpacity>
            
            <View className="flex-1 items-end mr-4">
               <View className="flex-row-reverse items-center mb-0.5">
                 <Text className="text-brand-primary text-[9px] font-black uppercase tracking-elite">BOARD VIEW</Text>
                 {tasks.length > 0 && (
                   <View className="bg-status-success/20 px-2 py-0.5 rounded-full mr-3 border border-status-success/30 flex-row-reverse items-center">
                     <CheckCircle2 color="#10b981" size={8} style={{ marginLeft: 3 }} />
                     <Text className="text-status-success text-[8px] font-black">
                       {Math.round((tasks.filter(t => t.status === 'done').length / tasks.length) * 100)}% DONE
                     </Text>
                   </View>
                 )}
               </View>
               <Text className="text-white text-2xl font-black text-right tracking-tighter" numberOfLines={1}>{project.name}</Text>
            </View>

            <TouchableOpacity 
              onPress={() => setMenuVisible(true)}
              className="w-11 h-11 bg-slate-800 rounded-2xl items-center justify-center border border-white/10 shadow-sm active:bg-slate-700"
            >
              <MoreVertical color="#f8fafc" size={22} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Action Menu Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={menuVisible}
          onRequestClose={() => setMenuVisible(false)}
        >
          <TouchableOpacity 
            activeOpacity={1} 
            className="flex-1 bg-black/80 justify-end"
            onPress={() => setMenuVisible(false)}
          >
            <View className="w-full bg-slate-900 rounded-t-elite border-t-2 border-white/10 p-8 pb-24 shadow-2xl">
               <View className="w-16 h-1.5 bg-white/10 rounded-full self-center mb-8" />
               <Text className="text-white text-2xl font-black text-center mb-10 uppercase tracking-elite opacity-90">ניהול פרויקט</Text>
               
               <TouchableOpacity 
                onPress={handleAiSummary}
                className="p-5 bg-slate-800/80 rounded-[30px] mb-5 border border-white/10 h-24 flex-row-reverse items-center shadow-sm"
                style={{ gap: 24 }}
               >
                 <View className="w-14 h-14 bg-indigo-500/20 rounded-2xl items-center justify-center border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                   <Sparkles color="#a5b4fc" size={28} />
                 </View>
                 <Text className="text-white font-black text-xl tracking-tight">ניתוח פרויקט חכם (AI)</Text>
               </TouchableOpacity>

               <TouchableOpacity 
                onPress={() => {
                  setMenuVisible(false);
                  router.push('/add-task');
                }}
                className="p-5 bg-slate-800/80 rounded-[30px] mb-5 border border-white/10 h-24 flex-row-reverse items-center shadow-sm"
                style={{ gap: 24 }}
               >
                 <View className="w-14 h-14 bg-slate-700/50 rounded-2xl items-center justify-center border border-white/10">
                   <LayoutPanelTop color="#f8fafc" size={28} />
                 </View>
                 <Text className="text-white font-black text-xl tracking-tight">הוספת משימה מהירה</Text>
               </TouchableOpacity>

               <TouchableOpacity 
                onPress={() => {
                  setMenuVisible(false);
                  handleDeleteProject();
                }}
                className="p-5 bg-red-500/5 rounded-[30px] border border-red-500/20 h-24 flex-row-reverse items-center shadow-sm"
                style={{ gap: 24 }}
               >
                 <View className="w-14 h-14 bg-red-500/10 rounded-2xl items-center justify-center border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
                   <Trash2 color="#fca5a5" size={28} />
                 </View>
                 <Text className="text-red-300 font-black text-xl tracking-tight">מחיקת פרויקט לצמיתות</Text>
               </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Kanban Board */}
        <ScrollView 
          horizontal 
          className="flex-row-reverse mt-4"
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: 24, paddingLeft: 10 }}
          snapToInterval={COLUMN_WIDTH + 20}
          decelerationRate="fast"
        >
          {renderColumn('משימות חדשות', todoTasks, 'todo', 'in-progress', '#3b82f6')}
          {renderColumn('בתהליך העבודה', inProgressTasks, 'in-progress', 'done', '#f59e0b')}
          {renderColumn('הושלם בהצלחה', doneTasks, 'done', 'todo', '#10b981')}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
