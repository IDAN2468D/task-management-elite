import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { TaskService } from '../services/api';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp, ZoomIn } from 'react-native-reanimated';
import { UserPlus, Sparkles, ChevronRight } from 'lucide-react-native';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('שגיאה', 'נא למלא את כל השדות');
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await TaskService.register(name, email, password);
      await login(response.token, response.user);
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('שגיאת הרשמה', error.message || 'אירעה שגיאה בהרשמה');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-950/80 justify-center">
      <LinearGradient colors={['#020617', '#1e1b4b']} className="absolute inset-0" />
      
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="px-6 w-full">
        <View className="items-center mb-10">
          <Animated.View entering={ZoomIn.delay(200)} className="w-20 h-20 bg-brand-primary/10 rounded-card items-center justify-center mb-6 border border-brand-primary/20 shadow-2xl">
             <UserPlus color="#818cf8" size={40} />
          </Animated.View>
          <Text className="text-white text-4xl font-black mb-2 tracking-tight">הצטרף ל-Elite</Text>
          <Text className="text-slate-500 text-lg font-extrabold tracking-elite uppercase">System Registration</Text>
        </View>

        <View className="bg-slate-900/60 p-8 rounded-card border border-white/5 gap-y-6 shadow-2xl">
          <View>
            <Text className="text-slate-400 mb-2 font-black text-right text-[10px] uppercase tracking-elite">Full Identity</Text>
            <TextInput
              className="bg-slate-800/80 text-white px-5 py-4 rounded-pill border border-white/10 text-right font-extrabold text-lg"
              placeholder="שם מלא"
              placeholderTextColor="#475569"
              value={name}
              onChangeText={setName}
              textAlign="right"
            />
          </View>
          
          <View>
            <Text className="text-slate-400 mb-2 font-black text-right text-[10px] uppercase tracking-elite">Digital Mail</Text>
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
            <Text className="text-slate-400 mb-2 font-black text-right text-[10px] uppercase tracking-elite">Security Pattern</Text>
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
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? <ActivityIndicator color="white" /> : (
              <Text className="text-white font-black text-xl tracking-tight">צור חשבון מערכת</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => router.back()} className="mt-4 flex-row-reverse items-center justify-center">
             <ChevronRight color="#818cf8" size={18} className="ml-2" />
             <Text className="text-slate-500 text-center font-bold text-sm">כבר חבר בקהילה? <Text className="text-brand-primary">חזור להתחברות</Text></Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
