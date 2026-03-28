import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, ActivityIndicator, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { TaskService } from '../services/api';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { UserPlus, Sparkles, ChevronLeft, Lock, User, AtSign, ChevronRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Animated, { 
  FadeIn, 
  FadeInDown, 
  FadeInUp, 
  ZoomIn, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  interpolate,
  useSharedValue,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

const BackgroundDecoration = () => {
    const anim1 = useSharedValue(0);
    const anim2 = useSharedValue(0);
  
    useEffect(() => {
      anim1.value = withRepeat(withTiming(1, { duration: 12000 }), -1, true);
      anim2.value = withRepeat(withTiming(1, { duration: 9000 }), -1, true);
    }, []);
  
    const circle1Style = useAnimatedStyle(() => ({
      transform: [
        { translateX: interpolate(anim1.value, [0, 1], [-100, 100]) },
        { translateY: interpolate(anim1.value, [0, 1], [-50, 50]) },
      ],
    }));
  
    const circle2Style = useAnimatedStyle(() => ({
      transform: [
        { translateX: interpolate(anim2.value, [0, 1], [100, -100]) },
        { translateY: interpolate(anim2.value, [0, 1], [50, -50]) },
      ],
    }));
  
    return (
      <View className="absolute inset-0 overflow-hidden">
        <LinearGradient colors={['#020617', '#0f172a', '#1e1b4b']} className="absolute inset-0" />
        <Animated.View 
          style={circle1Style}
          className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-indigo-600/30 blur-3xl opacity-50" 
        />
        <Animated.View 
          style={circle2Style}
          className="absolute top-1/4 -right-20 w-96 h-96 rounded-full bg-purple-500/20 blur-3xl opacity-40" 
        />
        <View className="absolute bottom-0 left-0 right-0 h-1/2 bg-slate-950/20 shadow-2xl" />
      </View>
    );
};

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('שגיאת רישום', 'נא למלא את כל הפרטים הנדרשים');
      return;
    }
    
    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const response = await TaskService.register(name.trim(), email.trim(), password);
      await login(response.token, response.user);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(tabs)');
    } catch (error: any) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert('תהליך הרישום נכשל', error.response?.data?.error || 'אירעה שגיאה ביצירת החשבון החדש');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-slate-950">
      <BackgroundDecoration />
      
      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
          className="flex-1 px-6 justify-center"
        >
          <Animated.View entering={FadeInUp.duration(1000).springify()} className="items-center mb-10">
            <View className="relative">
              <Animated.View 
                entering={ZoomIn.delay(400).duration(800)}
                className="w-20 h-20 bg-indigo-500/20 rounded-3xl items-center justify-center border border-indigo-400/30 shadow-2xl"
              >
                <UserPlus color="#818cf8" size={40} strokeWidth={2.5} />
              </Animated.View>
            </View>
            
            <View className="mt-6 items-center">
              <Text className="text-white text-3xl font-black tracking-tighter text-center" style={{ fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-condensed' }}>
                הצטרפות לקהילת ה-<Text className="text-indigo-400">ELITE</Text>
              </Text>
              <View className="flex-row-reverse items-center mt-2">
                <View className="h-[1px] w-4 bg-indigo-500/40 ml-2" />
                <Text className="text-indigo-300/60 text-[9px] font-black uppercase tracking-[3px]">פרוטוקול יצירת זהות חדשה</Text>
                <View className="h-[1px] w-4 bg-indigo-500/40 mr-2" />
              </View>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200).duration(1000).springify()}>
            <BlurView intensity={20} tint="dark" className="rounded-[40px] overflow-hidden border border-white/10 shadow-2xl bg-white/5">
              <View className="p-8">
                <View className="mb-5">
                  <View className="flex-row-reverse items-center justify-start mb-2">
                    <User size={12} color="#6366f1" className="ml-2" />
                    <Text className="text-slate-400 font-bold text-[10px] uppercase tracking-elite text-right">זהות מלאה</Text>
                  </View>
                  <TextInput
                    className="bg-white/5 text-white px-6 py-4 rounded-2xl border border-white/5 text-right font-bold text-lg focus:border-indigo-500/50"
                    placeholder="השם האישי שלך"
                    placeholderTextColor="#475569"
                    value={name}
                    onChangeText={setName}
                    textAlign="right"
                  />
                </View>

                <View className="mb-5">
                  <View className="flex-row-reverse items-center justify-start mb-2">
                    <AtSign size={12} color="#6366f1" className="ml-2" />
                    <Text className="text-slate-400 font-bold text-[10px] uppercase tracking-elite text-right">דואר אלקטרוני</Text>
                  </View>
                  <TextInput
                    className="bg-white/5 text-white px-6 py-4 rounded-2xl border border-white/5 text-right font-bold text-lg focus:border-indigo-500/50"
                    placeholder="user@example.com"
                    placeholderTextColor="#475569"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                    textAlign="right"
                  />
                </View>

                <View className="mb-8">
                  <View className="flex-row-reverse items-center justify-start mb-2">
                    <Lock size={12} color="#6366f1" className="ml-2" />
                    <Text className="text-slate-400 font-bold text-[10px] uppercase tracking-elite text-right">קוד אבטחה</Text>
                  </View>
                  <TextInput
                    className="bg-white/5 text-white px-6 py-4 rounded-2xl border border-white/5 text-right font-bold text-lg focus:border-indigo-500/50"
                    placeholder="מינימום 6 תווים"
                    placeholderTextColor="#475569"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                    textAlign="right"
                  />
                </View>

                <TouchableOpacity 
                  className="bg-indigo-600 py-5 rounded-2xl items-center shadow-lg active:scale-95 overflow-hidden"
                  onPress={handleRegister}
                  disabled={isLoading}
                >
                  <LinearGradient 
                    colors={['#6366f1', '#4f46e5']} 
                    start={{x: 0, y: 0}} 
                    end={{x: 1, y: 1}} 
                    className="absolute inset-0" 
                  />
                  {isLoading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="text-white font-black text-lg tracking-tight">צור חשבון ELITE</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity 
                  className="mt-6 flex-row items-center justify-center opacity-70 active:opacity-100"
                  onPress={() => router.back()}
                >
                  <ChevronRight color="#6366f1" size={16} className="ml-2" />
                  <Text className="text-slate-400 font-bold text-sm">כבר חבר? <Text className="text-indigo-400">חזרה להתחברות</Text></Text>
                </TouchableOpacity>
              </View>
            </BlurView>
          </Animated.View>

          <View className="mt-8 items-center">
             <Text className="text-slate-600 font-bold text-[10px] uppercase tracking-[4px]">פרוטוקול אבטחה מאומת</Text>
          </View>

        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
