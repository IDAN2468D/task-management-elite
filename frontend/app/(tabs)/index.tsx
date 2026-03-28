import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, StyleSheet, Image, Pressable } from 'react-native';
import { Plus, LayoutTemplate, ListTodo, Bot, Sparkles, Brain, AlertCircle, TrendingUp } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../../context/AuthContext';
import { Project, TaskItem, ProjectService, TaskService, AiService, BurnoutAssessment } from '../../services/api';
import TaskComponent from '../../components/TaskComponent';
import Animated, { FadeInUp, LinearTransition, useAnimatedStyle, useSharedValue, withSpring, FadeIn, FadeOut, withRepeat, withTiming, Easing } from 'react-native-reanimated';

// AI Overlay Component
const AIOverlay = () => {
  const rotation = useSharedValue(0);
  const breath = useSharedValue(1);

  useEffect(() => {
    rotation.value = withRepeat(withTiming(360, { duration: 4000, easing: Easing.linear }), -1, false);
    breath.value = withRepeat(withTiming(1.2, { duration: 1500, easing: Easing.inOut(Easing.ease) }), -1, true);
  }, []);
  
  const animatedMesh = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }, { scale: breath.value }]
  }));

  return (
    <Animated.View entering={FadeIn} exiting={FadeOut} style={StyleSheet.absoluteFill} className="z-[100] items-center justify-center">
      <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
      <Animated.View style={[{ width: 300, height: 300, borderRadius: 150, backgroundColor: '#818cf8', opacity: 0.15, position: 'absolute' }, animatedMesh]} />
      <Animated.View style={[{ width: 250, height: 250, borderRadius: 125, backgroundColor: '#c084fc', opacity: 0.15, position: 'absolute' }, animatedMesh]} />
      
      <View className="items-center z-10 p-8 rounded-3xl bg-slate-900/60 border border-white/10 shadow-2xl">
        <Animated.View style={{ transform: [{ scale: breath }] }}>
           <Sparkles color="#818cf8" size={48} className="mb-4" />
        </Animated.View>
        <Text className="text-white text-2xl font-black text-center mb-2">AI חושב...</Text>
        <Text className="text-indigo-200 text-sm text-center">מסנכרן כוונות, מנתח עומס ומסדר מחדש...</Text>
      </View>
    </Animated.View>
  );
};

const ProjectCard = ({ project, count }: { project: any, count: number }) => {
  const router = useRouter();
  const themeColor = project.themeColor || '#6366f1';
  
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/project/${project._id}`);
  };

  return (
    <Animated.View style={animatedStyle} className="ml-4">
      <Pressable 
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        className="w-44 h-52 rounded-[32px] overflow-hidden border border-white/10 relative shadow-2xl"
      >
        <BlurView intensity={10} tint="dark" style={StyleSheet.absoluteFill} />
        <View className="p-6 h-full justify-between">
          <View className="flex-row-reverse justify-between items-start">
            <View 
              className="w-12 h-12 rounded-2xl items-center justify-center border border-white/5" 
              style={{ backgroundColor: `${themeColor}20` }}
            >
              <LayoutTemplate color={themeColor} size={24} />
            </View>
            {project.isAIGenerated && (
              <View className="bg-indigo-500/10 p-1.5 rounded-full border border-indigo-500/20">
                <Sparkles color="#818cf8" size={12} />
              </View>
            )}
          </View>

          <View className="items-end">
            <Text className="text-white text-xl font-black text-right tracking-tight leading-6 mb-2" numberOfLines={2}>
              {project.name}
            </Text>
            <View className="flex-row-reverse items-center">
              <View className="w-1.5 h-1.5 rounded-full ml-2" style={{ backgroundColor: themeColor }} />
              <Text className="text-slate-500 text-[10px] font-black uppercase tracking-widest">
                {count} Tasks
              </Text>
            </View>
          </View>
        </View>
        
        {/* Decorative Glow */}
        <View 
          className="absolute -top-10 -right-10 w-24 h-24 rounded-full opacity-20 blur-3xl pointer-events-none"
          style={{ backgroundColor: themeColor }}
        />
      </Pressable>
    </Animated.View>
  );
};

export default function DashboardScreen() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOptimizing, setIsOptimizing] = useState(false);
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
      setIsOptimizing(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      const newOrder = await AiService.getSchedule(tasks);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      // Wait a moment for aesthetic feel
      await new Promise(resolve => setTimeout(resolve, 800));
      fetchData();
    } catch (e) {
      console.error('Optimization error:', e);
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    <View className="flex-1 bg-[#020617]">
      {isOptimizing && <AIOverlay />}
      <View className="w-full absolute top-0 z-50 bg-[#020617]">
        <View className="pt-12 pb-4 px-6 border-b border-white/5 flex-row-reverse justify-between items-center">
          <View className="items-end">
            <Text className="text-white text-2xl font-black tracking-tighter">השלט שלי</Text>
            <Text className="text-slate-500 text-[9px] font-bold uppercase tracking-[2px]">Elite Dashboard</Text>
          </View>
          <View className="flex-row items-center gap-3">
            <TouchableOpacity 
              onPress={() => router.push('/ai-assistant')}
              className="bg-indigo-500/10 p-2.5 rounded-xl border border-indigo-500/20"
            >
              <Sparkles color="#818cf8" size={20} />
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => router.push('/settings')}
              className="w-10 h-10 rounded-xl border border-white/5 overflow-hidden bg-slate-900 shadow-sm"
            >
               {user?.picture ? (
                 <Image source={{ uri: user.picture }} className="w-full h-full" />
               ) : (
                 <View className="flex-1 items-center justify-center bg-slate-800">
                    <Text className="text-white text-xs font-black">{user?.name?.charAt(0) || 'U'}</Text>
                 </View>
               )}
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => router.push('/add-task')}
              className="bg-blue-500/10 p-2.5 rounded-xl border border-blue-400/20"
            >
              <Plus color="#60a5fa" size={20} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 120, paddingHorizontal: 16, paddingTop: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchData} tintColor="#6366f1" colors={["#6366f1"]} />
        }
      >
        {burnout && (
          <Animated.View 
            entering={FadeInUp.delay(200)} 
            className="mb-8 overflow-hidden rounded-[32px] border border-white/10 bg-white/5 relative shadow-2xl"
          >
            <BlurView intensity={15} tint="dark" style={StyleSheet.absoluteFill} />
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
          <View className="flex-row-reverse items-center mb-6 px-1">
            <View className="items-end flex-1">
              <Text className="text-white text-lg font-black">הפרויקטים שלי</Text>
              <Text className="text-slate-500 text-[8px] font-bold uppercase tracking-widest">Active Workspace</Text>
            </View>
            <View className="w-10 h-10 bg-indigo-500/10 rounded-xl items-center justify-center ml-3 border border-indigo-500/10">
              <LayoutTemplate color="#818cf8" size={18} />
            </View>
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
              <ProjectCard 
                key={project._id} 
                project={project} 
                count={tasks.filter(t => t.projectId === project._id || (typeof t.projectId === 'object' && t.projectId?._id === project._id)).length} 
              />
            ))}
          </ScrollView>
        </View>

        <View className="flex-1">
          <View className="flex-row-reverse items-center mb-6 px-1">
             <View className="flex-1 items-end">
              <Text className="text-white text-lg font-black">משימות להיום</Text>
              <Text className="text-slate-500 text-[8px] font-bold uppercase tracking-widest">Daily Execution Plan</Text>
            </View>
            <View className="w-10 h-10 bg-blue-500/10 rounded-xl items-center justify-center ml-3 border border-blue-500/10">
              <ListTodo color="#60a5fa" size={18} />
            </View>
          </View>
          
          <View className="mb-4 flex-row-reverse justify-between items-center px-1">
              <View className="bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                <Text className="text-emerald-400 text-[10px] font-bold">{tasks.filter(t => t.completed).length}/{tasks.length} Completed</Text>
              </View>
              {tasks.length > 1 && (
                <TouchableOpacity 
                  onPress={handleOptimizeSchedule}
                  className="flex-row-reverse items-center gap-1.5"
                >
                  <Sparkles color="#818cf8" size={12} />
                  <Text className="text-indigo-400 text-[10px] font-black uppercase tracking-wider">AI Optimize</Text>
                </TouchableOpacity>
              )}
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
