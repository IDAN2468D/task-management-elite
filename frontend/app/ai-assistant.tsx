import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, Image, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { BlurView } from 'expo-blur';
import { ChevronRight, Send, Bot, User, Image as ImageIcon, Mic, X, Sparkles, HardDrive, CheckCircle2, AlertCircle, Info, FileText, History, LogIn, LogOut, Rocket, BrainCircuit, Search, Flame, Lightbulb } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInUp, FadeInDown, FadeIn, FadeOut, ZoomIn, ZoomOut } from 'react-native-reanimated';
import { GoogleSignin, statusCodes, User as GoogleUser } from '@react-native-google-signin/google-signin';
import * as Haptics from 'expo-haptics';
import { useSharedValue, withRepeat, withTiming, withSequence, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { AiService, TaskService, ProjectService } from '../services/api';

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  image?: string;
}

export default function AiAssistantScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: 'היי עידן! במה אוכל לעזור היום?🤖', isBot: true }
  ]);
  
  const suggestions = [
    { text: 'תכנן לי את היום', icon: Rocket, color: '#f59e0b' },
    { text: 'סכם פרויקט פעיל', icon: BrainCircuit, color: '#8b5cf6' },
    { text: 'חפש משימות חכמות', icon: Search, color: '#10b981' },
    { text: 'נתח קובץ מה-Drive', icon: FileText, color: '#3b82f6' },
  ];

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const [alertConfig, setAlertConfig] = useState({ visible: false, title: '', message: '', type: 'info' as 'info' | 'success' | 'error' });
  const [isListening, setIsListening] = useState(false);
  const pulseScale = useSharedValue(1);

  const showAlert = (title: string, message: string, type: 'info' | 'success' | 'error' = 'info') => {
    setAlertConfig({ visible: true, title, message, type });
    if (type === 'error') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    else Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleSaveToDrive = async (content: string, fileName: string) => {
    try {
      let token = googleToken;
      if (!token) {
        try {
          const tokens = await GoogleSignin.getTokens();
          token = tokens.accessToken;
          setGoogleToken(token);
        } catch (e) {
          showAlert('נדרשת התחברות', 'אנא התחבר עם Google כדי לשמור קבצים', 'info');
          return;
        }
      }
      setExporting(true);
      await AiService.saveToDrive(content, token, fileName);
      showAlert('הצלחה', 'הקובץ נשמר ב-Google Drive', 'success');
    } catch (err) { showAlert('שגיאה', 'שמירה ל-Drive נכשלה', 'error'); } finally { setExporting(false); }
  };

  const generateFullWorkspaceReport = async () => {
    try {
      setExporting(true);
      const [tasks, projects] = await Promise.all([TaskService.getAll(), ProjectService.getAll()]);
      const date = new Date().toLocaleDateString('he-IL');
      let report = `TaskMaster AI Report - ${date}\n------------------\n`;
      report += `Projects: ${projects.length}\n`;
      projects.forEach(p => report += `- ${p.name}\n`);
      report += `\nTasks: ${tasks.length}\n`;
      report += tasks.filter(t => !t.completed).map(t => `- [ ] ${t.title}`).join('\n');
      await handleSaveToDrive(report, `Workspace_Report_${Date.now()}.txt`);
    } catch (err) { showAlert('שגיאה', 'יצירת הדוח נכשלה', 'error'); } finally { setExporting(false); }
  };

  const sendMessage = async (customMsg?: string) => {
    const textToSend = (customMsg || input).trim();
    if (!textToSend || loading) return;
    setInput('');
    setMessages(prev => [...prev, { id: Date.now().toString(), text: textToSend, isBot: false }]);
    setLoading(true);
    Haptics.selectionAsync();

    try {
      if (textToSend.includes('חפש')) {
        const searchRes = await AiService.searchTasksSemantically(textToSend);
        setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), text: searchRes.results, isBot: true }]);
        return;
      }
      
      const [tasks, projects] = await Promise.all([TaskService.getAll(), ProjectService.getAll()]);
      const reply = await AiService.getChatReply(textToSend, { activeTasks: tasks.filter((t: any) => !t.completed).slice(0, 5), projects: projects.map((p: any) => ({ name: p.name, id: p._id })) });
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), text: reply, isBot: true }]);
    } catch (err) { showAlert('שגיאת חיבור', 'לא ניתן להתחבר לשרת - אנא וודא שאתה מחובר', 'error'); } finally { setLoading(false); }
  };

  return (
    <View className="flex-1 bg-slate-950">
      {/* Premium Alert Modal */}
      <Modal transparent visible={alertConfig.visible} animationType="none">
        <View className="flex-1 justify-center items-center p-5">
          <Animated.View entering={FadeIn} exiting={FadeOut} className="absolute inset-0">
            <BlurView intensity={30} tint="dark" className="absolute inset-0" />
          </Animated.View>
          <Animated.View entering={ZoomIn.springify()} exiting={ZoomOut} className="bg-slate-900 w-[90%] rounded-card p-8 items-center border border-white/10 shadow-2xl">
            <View className={`w-16 h-16 rounded-full justify-center items-center mb-6 shadow-2xl ${alertConfig.type === 'success' ? 'bg-status-success' : alertConfig.type === 'error' ? 'bg-status-error' : 'bg-brand-primary'}`}>
              {alertConfig.type === 'success' && <CheckCircle2 color="#fff" size={32} />}
              {alertConfig.type === 'error' && <AlertCircle color="#fff" size={32} />}
              {alertConfig.type === 'info' && <Info color="#fff" size={32} />}
            </View>
            <Text className="text-white text-2xl font-black mb-2 text-center">{alertConfig.title}</Text>
            <Text className="text-slate-400 text-base text-center leading-6 mb-8">{alertConfig.message}</Text>
            <TouchableOpacity onPress={() => setAlertConfig(p => ({ ...p, visible: false }))} className="bg-slate-800 py-4 px-12 rounded-2xl border border-white/10 active:bg-slate-700">
              <Text className="text-white text-lg font-black">הבנתי, תודה</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>

      {/* Modern Header */}
      <View className="bg-slate-950 pt-12">
        <View className="flex-row-reverse justify-between items-center px-6 pb-6 mt-2">
          <TouchableOpacity onPress={() => router.back()} className="w-11 h-11 bg-slate-900 rounded-xl items-center justify-center border border-white/5 active:bg-slate-800">
            <ChevronRight color="white" size={28} />
          </TouchableOpacity>
          
          <View className="flex-row-reverse items-center absolute right-0 left-0 justify-center pointer-events-none">
            <View className="w-9 h-9 rounded-xl bg-brand-primary/10 justify-center items-center ml-3 border border-brand-primary/20">
              <Bot color="#818cf8" size={22} />
            </View>
            <Text className="text-white text-xl font-black">AI Assistant</Text>
            <View className="w-2 h-2 rounded-full ml-3 bg-status-success shadow-[0_0_10px_#10b981]" />
          </View>

          <View className="flex-row-reverse items-center gap-x-2">
            <TouchableOpacity onPress={generateFullWorkspaceReport} className="w-11 h-11 bg-slate-900 rounded-xl items-center justify-center border border-white/5">
              <FileText color="#94a3b8" size={20} />
            </TouchableOpacity>
          </View>
        </View>
        <View className="h-[1px] bg-white/5 w-full" />
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: 20, paddingTop: 30 }} showsVerticalScrollIndicator={false}>
        <View className="absolute inset-0 justify-center items-center opacity-5 pointer-events-none">
          <Bot color="#6366f1" size={250} />
        </View>

        {messages.map((message) => (
          <View key={message.id} className={`mb-5 w-full ${message.isBot ? 'items-end' : 'items-start'}`}>
            <View className={`max-w-[85%] rounded-card p-5 ${message.isBot ? 'bg-slate-900/80 border border-white/5 rounded-tr-none' : 'bg-brand-primary rounded-tl-none shadow-lg'}`}>
              <Text className={`text-base leading-6 text-right ${message.isBot ? 'text-slate-100' : 'text-white font-extrabold'}`}>
                {message.text}
              </Text>
            </View>
          </View>
        ))}
        {loading && (
          <Animated.View entering={FadeIn} className="items-end mb-5">
            <View className="bg-slate-900 p-5 rounded-card rounded-tr-none border border-white/5">
              <ActivityIndicator color="#818cf8" />
            </View>
          </Animated.View>
        )}
      </ScrollView>

      {/* Input Area */}
      <View className="bg-slate-950 pb-8 pt-2">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="max-h-[60px] mb-4" contentContainerStyle={{ paddingHorizontal: 20, flexDirection: 'row-reverse', alignItems: 'center', gap: 12 }}>
          {suggestions.map((suggestion, index) => (
            <TouchableOpacity key={index} className="flex-row-reverse items-center bg-slate-900 py-3.5 px-6 rounded-pill border border-brand-primary/20 shadow-sm active:bg-slate-800" onPress={() => sendMessage(typeof suggestion === 'string' ? suggestion : suggestion.text)}>
              {typeof suggestion !== 'string' && suggestion.icon && <suggestion.icon color={suggestion.color} size={16} />}
              <Text className="text-slate-200 text-sm font-black mr-2.5">{typeof suggestion === 'string' ? suggestion : suggestion.text}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={100} className="px-5">
          <View className="flex-row-reverse items-center bg-slate-900 rounded-elite px-5 py-3 border border-white/10 shadow-2xl">
            <TouchableOpacity 
              onPressIn={() => {
                setIsListening(true);
                pulseScale.value = withRepeat(withTiming(1.6, { duration: 1000 }), -1, true);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
              }}
              onPressOut={() => {
                setIsListening(false);
                pulseScale.value = withSpring(1);
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                sendMessage("צלק משימה חדשה: פגישת צוות מחר ב-10:00"); // Simulated Voice result
              }}
              className="relative w-11 h-11 items-center justify-center pointer-events-auto"
            >
              {isListening && (
                <Animated.View 
                  style={useAnimatedStyle(() => ({ transform: [{ scale: pulseScale.value }], opacity: 1 - (pulseScale.value - 1) }))}
                  className="absolute w-12 h-12 rounded-full bg-brand-primary/40 border border-brand-primary/60"
                />
              )}
              <View className={`w-11 h-11 rounded-full items-center justify-center border shadow-lg ${isListening ? 'bg-brand-primary border-brand-secondary/40' : 'bg-slate-800/40 border-white/5'}`}>
                <Mic color={isListening ? 'white' : '#94a3b8'} size={20} />
              </View>
            </TouchableOpacity>

            <TextInput value={input} onChangeText={setInput} placeholder="הקלד הודעה חכמה..." placeholderTextColor="#475569" className="flex-1 text-white text-lg text-right max-h-[120px] pb-1 mx-3" multiline textAlign="right" />
            
            <TouchableOpacity onPress={() => sendMessage()} disabled={!input.trim() || loading} className={`w-11 h-11 rounded-xl justify-center items-center shadow-lg ${input.trim() ? 'bg-brand-primary' : 'bg-slate-800/50'}`}>
              {loading ? <ActivityIndicator color="white" size="small" /> : <Send color="white" size={18} />}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
}
