import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, ActivityIndicator, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { TaskService } from '../services/api';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { LogIn, Sparkles, ShieldCheck, Mail, Lock, Fingerprint } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, { 
  FadeIn, 
  FadeInDown, 
  FadeInUp, 
  ZoomIn, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  withSequence,
  interpolate,
  useSharedValue,
  withSpring
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_WEB_CLIENT_ID,
  scopes: ['https://www.googleapis.com/auth/drive.file'],
  offlineAccess: true,
});

const BackgroundDecoration = () => {
  const anim1 = useSharedValue(0);
  const anim2 = useSharedValue(0);

  useEffect(() => {
    anim1.value = withRepeat(withTiming(1, { duration: 10000 }), -1, true);
    anim2.value = withRepeat(withTiming(1, { duration: 8000 }), -1, true);
  }, []);

  const circle1Style = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(anim1.value, [0, 1], [-50, 50]) },
      { translateY: interpolate(anim1.value, [0, 1], [-30, 30]) },
    ],
  }));

  const circle2Style = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(anim2.value, [0, 1], [50, -50]) },
      { translateY: interpolate(anim2.value, [0, 1], [30, -30]) },
    ],
  }));

  return (
    <View className="absolute inset-0 overflow-hidden">
      <LinearGradient colors={['#020617', '#0f172a', '#1e1b4b']} className="absolute inset-0" />
      <Animated.View 
        style={circle1Style}
        className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-indigo-600/20 blur-3xl opacity-50" 
      />
      <Animated.View 
        style={circle2Style}
        className="absolute top-1/2 -right-20 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl opacity-40" 
      />
      <View className="absolute bottom-0 left-0 right-0 h-1/2 bg-slate-950/20 shadow-2xl" />
    </View>
  );
};

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('שגיאת מערכת', 'נא להזין פרטי גישה מלאים');
      return;
    }
    
    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const response = await TaskService.login(email.trim(), password);
      await login(response.token, response.user);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(tabs)');
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('אימות נכשל', error.response?.data?.error || 'פרטי הזיהוי אינם תואמים את המערכת');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsGoogleLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      
      if (response.type === 'success') {
        const { idToken } = response.data;
        if (idToken) {
          const backendRes = await TaskService.googleLogin(idToken);
          await login(backendRes.token, backendRes.user);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          router.replace('/(tabs)');
        }
      }
    } catch (error: any) {
      if (error.code !== statusCodes.SIGN_IN_CANCELLED) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert('שגיאת זיהוי גוגל', 'תהליך האימות החיצוני נכשל');
      }
    } finally {
      setIsGoogleLoading(false);
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
          <Animated.View entering={FadeInUp.duration(1000).springify()} className="items-center mb-12">
            <View className="relative">
              <Animated.View 
                entering={ZoomIn.delay(400).duration(800)}
                className="w-24 h-24 bg-indigo-500/20 rounded-[32px] items-center justify-center border border-indigo-400/30 shadow-2xl"
              >
                <Sparkles color="#818cf8" size={48} strokeWidth={2.5} />
              </Animated.View>
              <View className="absolute -bottom-2 -right-2 bg-slate-950 p-1 rounded-full border border-indigo-500/50">
                  <ShieldCheck color="#818cf8" size={20} />
              </View>
            </View>
            
            <View className="mt-6 items-center">
              <Text className="text-white text-4xl font-black tracking-tighter text-center">
                ניהול משימות <Text className="text-indigo-400">ELITE</Text>
              </Text>
              <View className="flex-row-reverse items-center mt-2">
                <View className="h-[1px] w-4 bg-indigo-500/40 ml-2" />
                <Text className="text-indigo-300/60 text-[10px] font-black uppercase tracking-[3px]">פורטל גישה מאובטח</Text>
                <View className="h-[1px] w-4 bg-indigo-500/40 mr-2" />
              </View>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200).duration(1000).springify()}>
            <BlurView intensity={20} tint="dark" className="rounded-[40px] overflow-hidden border border-white/10 shadow-2xl bg-white/5">
              <View className="p-8">
                <View className="mb-6">
                  <View className="flex-row-reverse items-center justify-start mb-2">
                    <Mail size={12} color="#6366f1" className="ml-2" />
                    <Text className="text-slate-400 font-bold text-[10px] uppercase tracking-elite text-right">מזהה משתמש</Text>
                  </View>
                  <TextInput
                    className="bg-white/5 text-white px-6 py-4 rounded-2xl border border-white/5 text-right font-bold text-lg focus:border-indigo-500/50"
                    placeholder="אימייל או שם משתמש"
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
                    <Text className="text-slate-400 font-bold text-[10px] uppercase tracking-elite text-right">מפתח אבטחה</Text>
                  </View>
                  <TextInput
                    className="bg-white/5 text-white px-6 py-4 rounded-2xl border border-white/5 text-right font-bold text-lg focus:border-indigo-500/50"
                    placeholder="סיסמה חסויה"
                    placeholderTextColor="#475569"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                    textAlign="right"
                  />
                  <TouchableOpacity className="mt-3">
                    <Text className="text-indigo-400/60 text-right font-bold text-[11px] uppercase">שכחת מפתח אבטחה?</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity 
                  className="bg-indigo-600 py-5 rounded-2xl items-center shadow-lg active:scale-95 overflow-hidden"
                  onPress={handleLogin}
                  disabled={isLoading || isGoogleLoading}
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
                    <Text className="text-white font-black text-lg tracking-tight">כניסה למערכת</Text>
                  )}
                </TouchableOpacity>

                <View className="flex-row items-center my-6">
                  <View className="flex-1 h-[0.5px] bg-white/10" />
                  <Text className="px-4 text-slate-500 font-bold text-[9px] uppercase tracking-[3px]">ממשק אימות חיצוני</Text>
                  <View className="flex-1 h-[0.5px] bg-white/10" />
                </View>

                <TouchableOpacity 
                  className="bg-white/5 py-4 rounded-2xl items-center flex-row-reverse justify-center border border-white/10 active:bg-white/10 shadow-sm"
                  onPress={handleGoogleLogin}
                  disabled={isLoading || isGoogleLoading}
                >
                  <View className="bg-white p-1 rounded-full ml-3">
                     <Fingerprint color="#020617" size={16} />
                  </View>
                  <Text className="text-white font-bold text-base">זיהוי מול Google</Text>
                </TouchableOpacity>
              </View>
            </BlurView>
          </Animated.View>

          <Animated.View entering={FadeIn.delay(800)} className="mt-8">
            <TouchableOpacity onPress={() => router.push('/register')} className="active:opacity-60">
              <Text className="text-slate-500 text-center font-bold text-sm">
                מצטרף חדש? <Text className="text-indigo-400">יצירת זהות ELITE</Text>
              </Text>
            </TouchableOpacity>
          </Animated.View>

        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
