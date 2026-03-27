import React, { useState } from 'react';
import { View, Text, Switch, TouchableOpacity, ScrollView } from 'react-native';
import { ChevronRight, Crown, BellRing, UserCircle, LogOut, Clock } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { NotificationService } from '../../services/NotificationService';

export default function SettingsScreen() {
  const router = useRouter();
  const { logout } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [isPro, setIsPro] = useState(false); // Mock for now

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <View className="flex-1 bg-slate-900">
      {/* Solid Header */}
      <View className="w-full z-10 bg-slate-900 pt-14 border-b border-white/10">
        <View className="px-6 py-4 flex-row-reverse justify-between items-center">
          <TouchableOpacity onPress={() => router.back()} className="bg-slate-800 p-2 rounded-full">
            <ChevronRight color="#94a3b8" size={24} />
          </TouchableOpacity>
          <Text className="text-white text-2xl font-bold text-center">פרופיל והגדרות</Text>
          <View style={{ width: 40 }} />
        </View>
      </View>

      <ScrollView className="flex-1 pt-4 px-4">
        {/* Profile Card */}
        <View className="mb-8 items-center justify-center pt-4">
          <View className="w-24 h-24 rounded-full bg-slate-800 border-2 border-slate-700 items-center justify-center mb-4">
            <UserCircle color="#94a3b8" size={48} />
          </View>
          <Text className="text-white text-2xl font-bold mb-1">עידן האלופה</Text>
          <Text className="text-slate-400 text-base">idan@taskmaster.ai</Text>
          
          <TouchableOpacity 
            onPress={() => router.push('/pricing')}
            className={`mt-4 px-6 py-2 rounded-full border flex-row-reverse items-center justify-center ${isPro ? 'bg-amber-500/20 border-amber-500/50' : 'bg-slate-800 border-slate-600'}`}
          >
            <Crown color={isPro ? "#f59e0b" : "#94a3b8"} size={16} className="ml-3" />
            <Text className={isPro ? "text-amber-500 font-bold" : "text-slate-400 font-bold"}>
              {isPro ? 'Premium Member' : 'שדרג ל-Pro'}
            </Text>
          </TouchableOpacity>
        </View>

        <View className="gap-y-6">
          <View className="bg-slate-800/50 rounded-3xl border border-white/5 overflow-hidden">
            <View className="p-4 border-b border-white/5 flex-row-reverse items-center justify-between">
              <View className="flex-row-reverse items-center" style={{ gap: 20 }}>
                <BellRing color="#3b82f6" size={22} />
                <Text className="text-white text-lg font-medium">התראות חכמות</Text>
              </View>
              <Switch 
                value={notifications} 
                onValueChange={async (val) => {
                  setNotifications(val);
                  if (val) await NotificationService.registerForPushNotificationsAsync();
                }} 
                trackColor={{ false: '#334155', true: '#3b82f6' }}
                thumbColor="#fff"
              />
            </View>

            <TouchableOpacity 
              onPress={() => router.push('/focus-settings')}
              className="p-4 border-b border-white/5 flex-row-reverse items-center justify-between"
            >
              <View className="flex-row-reverse items-center" style={{ gap: 20 }}>
                <Clock color="#a855f7" size={22} />
                <Text className="text-white text-lg font-medium">הגדרות Focus</Text>
              </View>
              <ChevronRight color="#64748b" size={20} className="rotate-180" />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push('/pricing')} className="p-4 flex-row-reverse items-center justify-between">
              <View className="flex-row-reverse items-center" style={{ gap: 20 }}>
                <Crown color="#f59e0b" size={22} />
                <Text className="text-white text-lg font-medium">ניהול מנוי AI</Text>
              </View>
              <ChevronRight color="#64748b" size={20} className="rotate-180" />
            </TouchableOpacity>
          </View>

          <View className="bg-slate-800/50 rounded-3xl border border-white/5 overflow-hidden">
            <TouchableOpacity onPress={handleLogout} className="p-4 flex-row-reverse items-center justify-center">
              <View className="flex-row-reverse items-center" style={{ gap: 20 }}>
                <LogOut color="#ef4444" size={22} />
                <Text className="text-red-500 text-lg font-medium">התנתק</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
        <View className="h-24" />
      </ScrollView>
    </View>
  );
}
