import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { TaskService } from '../services/api';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { LogIn, Sparkles } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { ZoomIn } from 'react-native-reanimated';

GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_WEB_CLIENT_ID,
  scopes: ['https://www.googleapis.com/auth/drive.file'],
  offlineAccess: true,
});

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('שגיאה', 'נא למלא את כל השדות');
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await TaskService.login(email, password);
      await login(response.token, response.user);
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('שגיאת התחברות', error.message || 'אימייל או סיסמה שגויים');
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
        const { idToken, user: gUser } = response.data;
        
        if (idToken) {
          const backendRes = await TaskService.googleLogin(idToken);
          await login(backendRes.token, backendRes.user);
          router.replace('/(tabs)');
        }
      }
    } catch (error: any) {
      if (error.code !== statusCodes.SIGN_IN_CANCELLED) {
        Alert.alert('שגיאה', 'התחברות עם Google נכשלה');
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-950/80 justify-center">
      <LinearGradient colors={['#020617', '#1e1b4b']} className="absolute inset-0" />
      
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="px-6 w-full">
        <View className="items-center mb-12">
          <Animated.View entering={ZoomIn.delay(200)} className="w-24 h-24 bg-brand-primary/10 rounded-card items-center justify-center mb-6 border border-brand-primary/20 shadow-2xl">
             <Sparkles color="#818cf8" size={50} />
          </Animated.View>
          <Text className="text-white text-5xl font-black mb-2 tracking-tight">TaskMaster AI</Text>
          <Text className="text-slate-500 text-lg font-extrabold tracking-elite uppercase">System Authorization</Text>
        </View>

        <View className="bg-slate-900/60 p-8 rounded-card border border-white/5 gap-y-6 shadow-2xl">
          <View>
            <Text className="text-slate-400 mb-3 font-black text-right text-[10px] uppercase tracking-elite">Access Identifier</Text>
            <TextInput
              className="bg-slate-800/80 text-white px-5 py-4 rounded-pill border border-white/10 text-right font-extrabold text-lg"
              placeholder="user@example.com"
              placeholderTextColor="#475569"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              textAlign="right"
            />
          </View>

          <View>
            <Text className="text-slate-400 mb-3 font-black text-right text-[10px] uppercase tracking-elite">Security Key</Text>
            <TextInput
              className="bg-slate-800/80 text-white px-5 py-4 rounded-pill border border-white/10 text-right font-extrabold text-lg"
              placeholder="••••••••"
              placeholderTextColor="#475569"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              textAlign="right"
            />
          </View>

          <TouchableOpacity 
            className="bg-brand-primary py-5 rounded-pill items-center mt-3 shadow-2xl active:opacity-80"
            onPress={handleLogin}
            disabled={isLoading || isGoogleLoading}
          >
            {isLoading ? <ActivityIndicator color="white" /> : <Text className="text-white font-black text-xl tracking-tight">התחבר למערכת</Text>}
          </TouchableOpacity>

          <View className="flex-row items-center my-3 px-4">
            <View className="flex-1 h-[0.5px] bg-white/10" />
            <Text className="px-6 text-slate-600 font-black text-[10px] uppercase tracking-widest">or integrate</Text>
            <View className="flex-1 h-[0.5px] bg-white/10" />
          </View>

          <TouchableOpacity 
            className="bg-slate-800/80 py-4 rounded-pill items-center flex-row-reverse justify-center border border-white/5 shadow-xl active:bg-slate-700"
            onPress={handleGoogleLogin}
            disabled={isLoading || isGoogleLoading}
          >
            {isGoogleLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <LogIn color="#fff" size={20} className="ml-3" />
                <Text className="text-white font-black text-base mr-3">Google Cloud Identity</Text>
              </>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => router.push('/register')} className="mt-4">
            <Text className="text-slate-500 text-center font-bold text-sm">יצירת חשבון חדש? <Text className="text-brand-primary">הצטרף עכשיו</Text></Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
