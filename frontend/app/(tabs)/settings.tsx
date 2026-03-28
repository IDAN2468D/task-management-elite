import React, { useState } from 'react';
import { View, Text, Switch, TouchableOpacity, ScrollView, Dimensions, Platform, StyleSheet, Image } from 'react-native';
import { 
  ChevronLeft, 
  Crown, 
  BellRing, 
  UserCircle, 
  LogOut, 
  Clock, 
  ShieldCheck, 
  Mail, 
  Settings as SettingsIcon,
  CreditCard,
  Zap,
  LayoutDashboard,
  Brain,
  Lock,
  Power,
  ChevronRight
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { NotificationService } from '../../services/NotificationService';
import { AiService } from '../../services/api';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp, FadeInDown, ZoomIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

export default function SettingsScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState(true);

  const handleLogout = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    await logout();
    router.replace('/login');
  };

  React.useEffect(() => {
    // Proactively warm up the Render server when settings page is opened
    AiService.warmup();
  }, []);

  const ActionRow = ({ 
    icon: Icon, 
    title, 
    subtitle, 
    color, 
    onPress, 
    showChevron = true,
    rightContent
  }: any) => (
    <TouchableOpacity 
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress && onPress();
      }}
      activeOpacity={0.7}
      className="flex-row-reverse items-center justify-between p-4 border-b border-white/5 last:border-0"
    >
      <View className="flex-row-reverse items-center flex-1">
        <View style={{ backgroundColor: `${color}15` }} className="p-2.5 rounded-xl ml-3.5">
          <Icon color={color} size={18} strokeWidth={2} />
        </View>
        <View className="items-end flex-1">
          <Text className="text-white text-[15px] font-black tracking-tight mb-0.2">{title}</Text>
          {subtitle && <Text className="text-slate-400 text-[10px] font-bold leading-tight">{subtitle}</Text>}
        </View>
      </View>
      
      {rightContent ? rightContent : (
        showChevron && <ChevronLeft color="#475569" size={16} />
      )}
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-[#020617]">
      {/* Immersive Background */}
      <LinearGradient 
        colors={['#020617', '#0f172a', '#1e1b4b']} 
        className="absolute inset-0" 
      />
      
      <SafeAreaView className="flex-1">
        {/* Elite Navigation Bar */}
        <View className="px-6 pb-0 pt-2 flex-row-reverse justify-between items-center bg-transparent">
            <View className="items-end">
                <Text className="text-white text-lg font-black tracking-tighter">ניהול המערכת</Text>
                <View className="flex-row-reverse items-center mt-0.2">
                    <View className="w-1.2 h-1.2 rounded-full bg-emerald-500 ml-1.5 shadow shadow-emerald-500/50" />
                    <Text className="text-slate-500 text-[8px] font-bold tracking-widest uppercase">Elite Online</Text>
                </View>
            </View>
            <TouchableOpacity 
                onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.back();
                }} 
                className="bg-white/5 p-2.5 rounded-xl border border-white/10"
            >
                <LayoutDashboard color="#818cf8" size={18} />
            </TouchableOpacity>
        </View>

        <ScrollView 
          className="flex-1" 
          contentContainerStyle={{ 
            paddingHorizontal: 20, 
            paddingTop: 8,
            paddingBottom: 20
          }}
          showsVerticalScrollIndicator={false}
          decelerationRate="normal"
          alwaysBounceVertical={false}
        >
          {/* Profile Section */}
          <Animated.View entering={FadeInUp.delay(200).duration(800)} className="items-center mt-0 mb-4">
            <View className="relative">
                <View className="w-20 h-20 rounded-[30px] bg-slate-900 border border-white/10 items-center justify-center shadow-xl overflow-hidden">
                   <LinearGradient 
                     colors={['rgba(99, 102, 241, 0.2)', 'rgba(30, 27, 75, 0.6)']} 
                     className="absolute inset-0" 
                   />
                   {user?.picture ? (
                     <Image source={{ uri: user.picture }} className="w-full h-full" />
                   ) : (
                     <UserCircle color="#818cf8" size={55} strokeWidth={1} />
                   )}
                </View>
               <View className="absolute -bottom-1 -right-1 bg-indigo-600 p-1.5 rounded-xl border-4 border-[#020617]">
                  <ShieldCheck color="white" size={14} strokeWidth={2.5} />
               </View>
            </View>

            <View className="mt-4 items-center">
              <Text className="text-white text-2xl font-black tracking-tight text-center leading-tight">
                {user?.name || 'חבר אנונימי'}
              </Text>
              <View className="flex-row-reverse items-center mt-1.5 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                 <Mail size={10} color="#818cf8" className="ml-2" />
                 <Text className="text-indigo-200/60 font-bold text-[11px]">{user?.email || 'email@example.com'}</Text>
              </View>
            </View>
          </Animated.View>

          {/* Action Cards */}
          <Animated.View entering={FadeInDown.delay(400).duration(1000)} className="gap-y-3">
            
            <View className="overflow-hidden bg-white/5 rounded-[24px] border border-white/10 relative">
              <BlurView intensity={25} tint="dark" style={StyleSheet.absoluteFill} />
              <View>
                <ActionRow 
                  icon={BellRing}
                  title="ניהול התראות חכם"
                  subtitle="סיכומים ועדכוני מערכת בזמן אמת"
                  color="#3b82f6"
                  rightContent={
                    <Switch 
                      value={notifications} 
                      onValueChange={async (val) => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        setNotifications(val);
                        if (val) await NotificationService.registerForPushNotificationsAsync();
                      }} 
                      trackColor={{ false: '#1e293b', true: '#6366f1' }}
                      thumbColor="#fff"
                      style={{ transform: [{ scale: 0.75 }] }}
                    />
                  }
                />
                <ActionRow 
                  icon={Brain}
                  title="הגדרות בינה מלאכותית"
                  color="#f59e0b"
                  onPress={() => router.push('/ai-config')}
                />
                <ActionRow 
                  icon={Clock}
                  title="מצב עבודה עמוקה (Focus)"
                  color="#a855f7"
                  onPress={() => router.push('/focus-settings')}
                />
              </View>
            </View>

            <View className="overflow-hidden bg-white/5 rounded-[24px] border border-white/10 relative">
              <BlurView intensity={25} tint="dark" style={StyleSheet.absoluteFill} />
              <View>
                <ActionRow 
                  icon={CreditCard}
                  title="מנוי וחיובים"
                  color="#10b981"
                  onPress={() => router.push('/pricing')}
                />
                <ActionRow 
                  icon={Lock}
                  title="פרטיות ואבטחה"
                  color="#ef4444"
                  onPress={() => router.push('/security')}
                />
              </View>
            </View>

            {/* Logout Redesign: Minimalist Neon Ruby Row */}
            <TouchableOpacity 
              onPress={handleLogout} 
              activeOpacity={0.8}
              className="mt-2 overflow-hidden rounded-[24px] border border-red-500/30 bg-red-500/5 relative"
            >
              <BlurView intensity={15} tint="dark" style={StyleSheet.absoluteFill} />
              <View className="flex-row-reverse items-center justify-between p-4">
                 <View className="flex-row-reverse items-center flex-1">
                    <View className="bg-red-500/20 p-2.5 rounded-xl ml-3">
                       <Power color="#ef4444" size={20} strokeWidth={2.5} />
                    </View>
                    <View className="items-end flex-1 pr-1">
                       <Text className="text-red-500 text-[16px] font-black tracking-tight">התנתקות מהמערכת</Text>
                       <Text className="text-red-400/40 text-[8.5px] font-bold uppercase tracking-widest">Secure Logout Protocol</Text>
                    </View>
                 </View>
                 <LogOut color="#ef444440" size={18} />
              </View>
            </TouchableOpacity>

            <Text className="text-slate-600 text-center text-[10px] font-bold uppercase tracking-[3px] mt-6 opacity-30">
              Elite AI Task Master • Build 2026.04.2
            </Text>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
