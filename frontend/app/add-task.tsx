import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Plus, X, Calendar as CalendarIcon, Flag, CircleDashed, Sparkles, Wand2, Bot, ChevronLeft, ChevronRight, Zap, BrainCircuit } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import Animated, { FadeIn, FadeInDown, SlideInDown, SlideOutDown, ZoomIn } from 'react-native-reanimated';
import { Project, ProjectService, TaskService, AiService } from '../services/api';
import { LinearGradient } from 'expo-linear-gradient';

export default function AddTaskScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [title, setTitle] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        let data = await ProjectService.getAll();
        if (data.length === 0) {
          const newInbox = await ProjectService.create({ 
            name: 'תיבת דואר נכנס', 
            description: 'משימות כלליות ללא פרויקט', 
            themeColor: '#4dc9f1' 
          });
          data = [newInbox];
        }
        setProjects(data);
        if (data.length > 0) setSelectedProjectId(data[0]._id as string);
      } catch (err) {
        console.error('Failed to fetch projects', err);
      }
    };
    fetchProjects();
  }, []);

  const handleAddTask = async () => {
    if (!title.trim() || loading || isAiLoading || !selectedProjectId) return;
    setLoading(true);
    try {
      await TaskService.create({ title, projectId: selectedProjectId });
      router.back();
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleAiBreakdown = async () => {
    if (!title.trim() || loading || isAiLoading || !selectedProjectId) return;
    setIsAiLoading(true);
    try {
      const subtasks = await AiService.breakdownTask(title);
      await Promise.all(
        subtasks.map((t: string) => TaskService.create({ title: t, projectId: selectedProjectId }))
      );
      router.back();
    } catch (err) {
      console.error("AI Creation Failed:", err);
      setIsAiLoading(false);
    }
  };

  const handleQuickAdd = async () => {
    if (!title.trim() || loading || isAiLoading) return;
    setIsAiLoading(true);
    try {
      const result = await AiService.parseQuickAdd(title);
      if (result.title) {
        setTitle(result.title);
      }
    } catch (err) {
      console.error("Quick Add Parse Failed:", err);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-slate-950">
      <LinearGradient 
        colors={['#020617', '#1e1b4b', '#020617']} 
        className="absolute inset-0"
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView 
          className="flex-1" 
          contentContainerStyle={{ paddingTop: insets.top + 20, paddingBottom: insets.bottom + 40 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Elite Header */}
          <View className="px-6 flex-row-reverse justify-between items-start mb-10">
            <View>
              <View className="flex-row-reverse items-center mb-1">
                <Text className="text-brand-primary text-[10px] font-black tracking-elite uppercase text-right">SYSTEM NODE v3.1</Text>
                <View className="w-1 h-1 bg-brand-primary rounded-full mr-2 shadow-[0_0_5px_#6366f1]" />
              </View>
              <Text className="text-white text-4xl font-black text-right tracking-tight">צור משימה</Text>
            </View>
            <TouchableOpacity onPress={() => router.back()} className="w-14 h-14 bg-slate-900/80 rounded-2xl items-center justify-center border border-white/5 active:bg-slate-800 shadow-2xl">
              <ChevronRight color="white" size={32} />
            </TouchableOpacity>
          </View>

          {/* AI Strategy Banner */}
          <Animated.View entering={FadeInDown.delay(200)} className="mx-6 mb-10 rounded-card overflow-hidden border border-brand-primary/20 shadow-2xl bg-slate-900/40">
            <BlurView intensity={20} tint="dark" className="p-8 flex-row-reverse items-center justify-between">
              <View className="flex-1 ml-4 items-end">
                <View className="flex-row-reverse items-center mb-2">
                  <Sparkles color="#818cf8" size={18} />
                  <Text className="text-white text-xl font-black mr-2.5">הנחיה חכמה</Text>
                </View>
                <Text className="text-slate-400 text-sm text-right leading-5 font-medium">המערכת תנתח את הטקסט ותפרק אותו למשימות ביצועיות באופן אוטונומי.</Text>
              </View>
              <View className="w-16 h-16 bg-brand-primary/10 rounded-2xl items-center justify-center border border-brand-primary/20 shadow-inner">
                <BrainCircuit color="#818cf8" size={36} />
              </View>
            </BlurView>
          </Animated.View>

          {/* Core Input Canvas */}
          <View className="mx-6 bg-slate-900/60 rounded-card p-10 mb-10 border border-white/5 shadow-inner">
            <View className="flex-row-reverse justify-between items-center mb-6">
              <Text className="text-slate-500 text-[10px] font-black uppercase text-right tracking-widest">INPUT DEFINITION</Text>
              <View className="bg-brand-primary/20 px-3 py-1 rounded-full border border-brand-primary/30">
                <Text className="text-brand-primary text-[10px] font-black uppercase tracking-widest">LIVE EDITOR</Text>
              </View>
            </View>
            
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="מה התוכנית האסטרטגית להיום?..."
              placeholderTextColor="#334155"
              autoFocus
              multiline
              textAlign="right"
              className="text-white text-3xl font-black text-right tracking-tight min-h-[140px]"
              style={{ textAlignVertical: 'top' }}
            />
            
            <View className="flex-row items-center justify-between mt-8 pt-8 border-t border-white/5">
              <TouchableOpacity 
                onPress={handleQuickAdd}
                disabled={!title.trim() || isAiLoading}
                className={`flex-row-reverse items-center px-8 py-4 rounded-pill ${title.trim() ? 'bg-brand-primary/20 border border-brand-primary/40 shadow-xl' : 'bg-slate-800/10 opacity-30 shadow-none'}`}
              >
                {isAiLoading ? <ActivityIndicator size="small" color="#818cf8" /> : (
                  <>
                    <Zap color={title.trim() ? "#818cf8" : "#475569"} size={18} />
                    <Text className={`text-xs font-black mr-3 ${title.trim() ? 'text-indigo-200' : 'text-slate-600'}`}>ניתוח אסינכרוני</Text>
                  </>
                )}
              </TouchableOpacity>
              <View className="flex-row items-baseline">
                 <Text className="text-slate-400 text-base font-black tracking-tight">{title.length}</Text>
                 <Text className="text-slate-700 text-[10px] font-black tracking-widest ml-1">/100</Text>
              </View>
            </View>
          </View>

          {/* Context Assignment (Projects) */}
          <View className="mb-14">
             <View className="flex-row-reverse items-center px-10 mb-6">
               <View className="w-1.5 h-1.5 bg-brand-primary rounded-full ml-3" />
               <Text className="text-slate-400 text-[11px] font-black uppercase text-right tracking-elite">CONTEXT SELECTION</Text>
             </View>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              className="px-6"
              contentContainerStyle={{ paddingRight: 24, paddingLeft: 0, flexDirection: 'row-reverse' }}
            >
              {projects.map(project => {
                const isSelected = selectedProjectId === project._id;
                const color = project.themeColor || '#6366f1';
                return (
                  <TouchableOpacity
                    key={project._id}
                    onPress={() => setSelectedProjectId(project._id as string)}
                    className={`flex-row-reverse items-center px-8 py-5 rounded-card mr-4 border ${isSelected ? 'border-white/20' : 'border-white/5 bg-slate-900/40'}`}
                    style={{ 
                      backgroundColor: isSelected ? color : 'rgba(15, 23, 42, 0.4)',
                      shadowColor: color,
                      shadowOpacity: isSelected ? 0.3 : 0,
                      shadowRadius: 15,
                    }}
                  >
                    <View className={`w-2 h-2 rounded-full ml-4 shadow-sm ${isSelected ? 'bg-white' : ''}`} style={!isSelected ? { backgroundColor: color } : {}} />
                    <Text className={`text-lg transition-all ${isSelected ? 'text-white font-black' : 'text-slate-500 font-extrabold'}`}>
                      {project.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Execution Matrix (Primary Actions) */}
          <View className="px-6 mt-4">
            <TouchableOpacity 
              onPress={handleAddTask}
              disabled={!title.trim() || loading || isAiLoading || !selectedProjectId}
              className={`rounded-elite overflow-hidden shadow-2xl mb-6 ${!title.trim() ? 'opacity-40' : ''}`}
            >
              <LinearGradient
                colors={['#6366f1', '#4f46e5']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="py-6 items-center justify-center flex-row-reverse"
              >
                {loading ? <ActivityIndicator color="white" /> : (
                  <>
                    <Plus color="#fff" size={30} className="ml-3" strokeWidth={4} />
                    <Text className="text-white text-2xl font-black tracking-tight">אשר ושלח למערכת</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={handleAiBreakdown}
              disabled={!title.trim() || isAiLoading}
              className={`py-5 rounded-elite bg-slate-900/80 border border-brand-primary/20 items-center justify-center flex-row-reverse shadow-xl ${!title.trim() || isAiLoading ? 'opacity-40' : 'active:bg-slate-800'}`}
            >
              <BrainCircuit color="#818cf8" size={22} className="ml-3" />
              <Text className="text-indigo-300 text-lg font-black tracking-tight">פירוק AI למשימות משנה</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
