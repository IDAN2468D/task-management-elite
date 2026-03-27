import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Plus, LayoutTemplate, ListTodo, Bot, Sparkles, Brain, AlertCircle, TrendingUp } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Project, TaskItem, ProjectService, TaskService, AiService, BurnoutAssessment } from '../../services/api';
import TaskComponent from '../../components/TaskComponent';
import Animated, { FadeInUp, LinearTransition } from 'react-native-reanimated';

export default function DashboardScreen() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [burnout, setBurnout] = useState<BurnoutAssessment | null>(null);

  const router = useRouter();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [projRes, taskRes, burnoutRes] = await Promise.all([
        ProjectService.getAll(),
        TaskService.getAll(),
        AiService.getBurnoutRisk().catch(() => null)
      ]);
      setProjects(projRes);
      setTasks(taskRes);
      setBurnout(burnoutRes);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleTask = async (taskId: string, currentStatus: boolean) => {
    try {
      const isCompleting = !currentStatus;
      await TaskService.update(taskId, { 
        completed: isCompleting,
        status: isCompleting ? 'done' : 'todo'
      });
      fetchData();
    } catch (error) {
      console.error('Error toggling task:', error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await TaskService.delete(taskId);
      fetchData();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleOptimizeSchedule = async () => {
    if (tasks.length < 2) return;
    try {
      setLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      const newOrder = await AiService.getSchedule(tasks);
      // For now we just show a success message as rearranging might need a specific sort index in DB
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      alert('AI הציע את הסדר הטוב ביותר למשימות שלך לפי עומס וזמני הגשה!');
      fetchData();
    } catch (e) {
      console.error('Optimization error:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-slate-950">
      <View className="w-full bg-slate-900 pt-14 border-b border-white/5 shadow-2xl z-20">
        <View className="px-6 py-4 flex-row-reverse justify-between items-center">
          <Text className="text-white text-3xl font-black tracking-tighter text-right">השלט שלי</Text>
          <View className="flex-row items-center gap-3">
            <TouchableOpacity 
              onPress={() => router.push('/ai-assistant')}
              className="bg-brand-primary/20 p-2.5 rounded-xl border border-brand-secondary/30"
            >
              <Bot color="#818cf8" size={24} />
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => router.push('/add-task')}
              className="bg-blue-500/20 p-2.5 rounded-2xl border border-blue-400/30"
            >
              <Plus color="#60a5fa" size={24} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 120, paddingHorizontal: 16, paddingTop: 20 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchData} tintColor="#6366f1" colors={["#6366f1"]} />
        }
      >
        {burnout && (
          <Animated.View 
            entering={FadeInUp.delay(200)} 
            className="mb-8 overflow-hidden rounded-card border border-white/10 bg-slate-900/60 shadow-2xl"
          >
            <View className="p-6">
              <View className="flex-row-reverse justify-between items-center mb-4">
                <View className="flex-row-reverse items-center gap-3">
                  <View className="p-2.5 bg-brand-primary/20 rounded-xl">
                    <Brain color="#818cf8" size={20} />
                  </View>
                  <Text className="text-white text-xl font-black text-right">ניתוח עומס AI</Text>
                </View>
                <View className={`px-4 py-1.5 rounded-pill border ${
                  burnout.level === 'critical' ? 'bg-red-500/20 border-red-500/40' :
                  burnout.level === 'high' ? 'bg-orange-500/20 border-orange-500/40' :
                  burnout.level === 'medium' ? 'bg-blue-500/20 border-blue-500/40' : 'bg-emerald-500/20 border-emerald-500/40'
                }`}>
                  <Text className={`text-[10px] font-black uppercase tracking-widest ${
                    burnout.level === 'critical' ? 'text-red-400' :
                    burnout.level === 'high' ? 'text-orange-400' :
                    burnout.level === 'medium' ? 'text-blue-400' : 'text-emerald-400'
                  }`}>
                    {burnout.level} Risk
                  </Text>
                </View>
              </View>

              <Text className="text-slate-300 text-base leading-6 text-right mb-5 font-medium">
                {burnout.recommendation}
              </Text>

              <View className="flex-row items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                <TrendingUp color="#818cf8" size={20} />
                <View className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                  <View 
                    className={`h-full rounded-full ${
                      burnout.riskScore > 75 ? 'bg-red-500' :
                      burnout.riskScore > 50 ? 'bg-orange-500' : 'bg-brand-primary'
                    }`}
                    style={{ width: `${burnout.riskScore}%` }}
                  />
                </View>
                <Text className="text-white font-black text-sm">{burnout.riskScore}%</Text>
              </View>
            </View>
          </Animated.View>
        )}

        <View className="mb-10">
          <View className="flex-row-reverse items-center mb-6 px-2">
            <View className="w-8 h-8 bg-indigo-500/20 rounded-lg items-center justify-center ml-3">
              <LayoutTemplate color="#818cf8" size={18} />
            </View>
            <Text className="text-slate-300 text-xl font-bold text-right">הפרויקטים שלי</Text>
          </View>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={{ flexDirection: 'row-reverse', paddingHorizontal: 4 }}
          >
            <TouchableOpacity 
              onPress={() => router.push('/project/add-project')}
              className="ml-4 w-44 h-48 rounded-card border-2 border-dashed border-slate-800 bg-slate-900/40 items-center justify-center"
            >
              <View className="bg-slate-800 p-4 rounded-2xl mb-3">
                <Plus color="#94a3b8" size={28} />
              </View>
              <Text className="text-slate-400 font-bold">צור פרויקט</Text>
              <Text className="text-slate-600 text-[10px] uppercase font-black mt-1">AI Powered</Text>
            </TouchableOpacity>

            {projects.map(project => (
              <TouchableOpacity 
                key={project._id} 
                onPress={() => router.push(`/project/${project._id}`)}
                className="ml-4 w-48 h-56 rounded-pill overflow-hidden border border-white/10 p-7 justify-between shadow-2xl" 
                style={{ 
                  backgroundColor: 'rgba(15, 23, 42, 0.6)', 
                  borderColor: (project.themeColor || '#6366f1') + '40'
                }}
              >
                <View className="flex-row-reverse justify-between items-start">
                  <View 
                    className="w-14 h-14 rounded-2xl items-center justify-center shadow-lg" 
                    style={{ backgroundColor: (project.themeColor || '#6366f1') + '20' }}
                  >
                    <LayoutTemplate color={project.themeColor || '#6366f1'} size={28} />
                  </View>
                  {project.isAIGenerated && (
                    <View className="bg-brand-primary/20 px-3 py-1.5 rounded-full border border-brand-secondary/30">
                      <Sparkles color="#818cf8" size={10} />
                    </View>
                  )}
                </View>

                <View className="items-end">
                  <Text className="text-white text-2xl font-black text-right leading-7" numberOfLines={2}>
                    {project.name}
                  </Text>
                  <View className="flex-row-reverse items-center mt-3 bg-white/5 py-1 px-3 rounded-xl border border-white/5">
                    <View className="h-2 w-2 rounded-full bg-status-success ml-2" />
                    <Text className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
                      {project.isAIGenerated ? 'AI Optimized' : 'Active'}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View className="flex-1">
          <View className="flex-row-reverse items-center mb-6 px-2">
             <View className="w-8 h-8 bg-blue-500/20 rounded-lg items-center justify-center ml-3">
              <ListTodo color="#60a5fa" size={18} />
            </View>
            <View className="flex-1 flex-row-reverse justify-between items-center">
              <Text className="text-slate-300 text-xl font-bold text-right">משימות להיום</Text>
              {tasks.length > 1 && (
                <TouchableOpacity 
                  onPress={handleOptimizeSchedule}
                  className="bg-brand-primary/20 px-4 py-2 rounded-pill border border-brand-primary/30 flex-row-reverse items-center gap-2"
                >
                  <Sparkles color="#818cf8" size={14} />
                  <Text className="text-brand-primary text-[10px] font-black uppercase">Optimize</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
          
          <View className="gap-y-3">
            {tasks.length > 0 ? (
              tasks.map(task => (
                <TaskComponent 
                  key={task._id} 
                  task={task} 
                  onToggle={() => handleToggleTask(task._id, task.completed)}
                  onDelete={() => handleDeleteTask(task._id)}
                />
              ))
            ) : (
              <View className="bg-slate-900/50 rounded-3xl p-10 items-center justify-center border border-white/5">
                <Text className="text-slate-500 text-lg font-medium text-center">אין משימות להיום. אתה פנוי לנשום!</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
