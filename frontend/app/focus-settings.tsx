import React, { useState } from 'react';
import { View, Text, Switch, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { ChevronRight, Clock, ShieldCheck, Music, BellOff, Zap, BrainCircuit, Timer } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

export default function FocusSettingsScreen() {
  const router = useRouter();
  const [deepWorkGuard, setDeepWorkGuard] = useState(true);
  const [autoBlock, setAutoBlock] = useState(true);
  const [sessionTime, setSessionTime] = useState(45); // in minutes
  const [ambientSound, setAmbientSound] = useState('Lo-Fi Beats');

  const timeOptions = [25, 45, 60, 90];

  return (
    <View className="flex-1 bg-slate-950">
      <SafeAreaView className="flex-1">
        {/* Elite Header */}
        <View className="px-6 py-6 flex-row-reverse justify-between items-center border-b border-white/5 bg-slate-900/50">
          <TouchableOpacity onPress={() => router.back()} className="w-11 h-11 bg-slate-800 rounded-2xl items-center justify-center border border-white/10">
            <ChevronRight color="#f8fafc" size={26} />
          </TouchableOpacity>
          <Text className="text-white text-2xl font-black tracking-tighter">הגדרות Focus ✨</Text>
          <View className="w-11" />
        </View>

        <ScrollView className="flex-1 px-5 pt-8">
          {/* AI Focus Insights Card */}
          <LinearGradient
            colors={['#1e1b4b', '#0f172a']}
            className="p-6 rounded-[32px] border border-indigo-500/30 mb-8"
          >
            <View className="flex-row-reverse items-center mb-4">
              <BrainCircuit color="#818cf8" size={24} />
              <Text className="text-indigo-200 text-lg font-bold mr-3 text-right">הניתוח החכם של AI</Text>
            </View>
            <Text className="text-indigo-100/80 text-right leading-6 text-base font-medium">
              ה-AI זיהה שזמני הפוקוס הכי פרודוקטיביים שלך הם בין 09:00 ל-11:00. 
              מומלץ להפעיל את ה-"Deep Work Guard" בשעות אלו לביצועים מקסימליים.
            </Text>
          </LinearGradient>

          {/* Main Focus Controls */}
          <View className="gap-y-6">
            <Text className="text-slate-500 text-sm font-black uppercase tracking-[3px] text-right mb-2">מצב עבודה עמוקה</Text>
            
            <View className="bg-slate-900/80 rounded-[32px] border border-white/5 overflow-hidden">
              {/* Deep Work Guard */}
              <View className="p-5 border-b border-white/5 flex-row-reverse items-center justify-between">
                <View className="flex-row-reverse items-center flex-1 pr-2" style={{ gap: 20 }}>
                  <ShieldCheck color="#3b82f6" size={24} />
                  <View className="items-end flex-1">
                     <Text className="text-white text-lg font-bold text-right">Deep Work Guard</Text>
                     <Text className="text-slate-400 text-sm text-right">חסימת מסיחי דעת אוטומטית</Text>
                  </View>
                </View>
                <Switch 
                  value={deepWorkGuard} 
                  onValueChange={setDeepWorkGuard}
                  trackColor={{ false: '#334155', true: '#3b82f6' }}
                  thumbColor="#fff"
                />
              </View>

              {/* Auto Block */}
              <View className="p-5 flex-row-reverse items-center justify-between">
                <View className="flex-row-reverse items-center flex-1 pr-2" style={{ gap: 20 }}>
                  <BellOff color="#f43f5e" size={24} />
                  <View className="items-end flex-1">
                     <Text className="text-white text-lg font-bold text-right">חסימת התראות</Text>
                     <Text className="text-slate-400 text-sm text-right">השתקת כל ההתראות בזמן סשן</Text>
                  </View>
                </View>
                <Switch 
                  value={autoBlock} 
                  onValueChange={setAutoBlock}
                  trackColor={{ false: '#334155', true: '#f43f5e' }}
                  thumbColor="#fff"
                />
              </View>
            </View>

            <Text className="text-slate-500 text-sm font-black uppercase tracking-[3px] text-right mt-4 mb-2">תזמון ומוזיקה</Text>

            <View className="bg-slate-900/80 rounded-[32px] border border-white/5 p-6">
               <View className="flex-row-reverse items-center mb-6" style={{ gap: 20 }}>
                 <Timer color="#a855f7" size={24} />
                 <Text className="text-white text-lg font-bold text-right">זמן סשן מומלץ (דקות)</Text>
               </View>
               
               <View className="flex-row-reverse justify-between">
                  {timeOptions.map(time => (
                    <TouchableOpacity 
                      key={time}
                      onPress={() => setSessionTime(time)}
                      className={`w-16 h-12 rounded-2xl items-center justify-center border ${sessionTime === time ? 'bg-purple-500 border-purple-400 shadow-lg shadow-purple-500/50' : 'bg-slate-800/50 border-white/5'}`}
                    >
                      <Text className={`font-black ${sessionTime === time ? 'text-white' : 'text-slate-400'}`}>{time}</Text>
                    </TouchableOpacity>
                  ))}
               </View>
            </View>

            <TouchableOpacity className="bg-slate-900/80 rounded-[32px] border border-white/5 p-6 flex-row-reverse items-center justify-between">
               <View className="flex-row-reverse items-center flex-1" style={{ gap: 20 }}>
                 <Music color="#10b981" size={24} />
                 <View className="items-end flex-1">
                   <Text className="text-white text-lg font-bold text-right">מוזיקת רקע (Ambient)</Text>
                   <Text className="text-emerald-400 text-sm text-right font-medium">{ambientSound}</Text>
                 </View>
               </View>
               <ChevronRight color="#64748b" size={22} className="rotate-180" />
            </TouchableOpacity>

            <TouchableOpacity className="bg-indigo-600 p-5 rounded-[28px] mt-6 shadow-xl shadow-indigo-500/30 active:bg-indigo-700">
               <View className="flex-row-reverse items-center justify-center" style={{ gap: 15 }}>
                  <Zap color="#fff" size={24} />
                  <Text className="text-white text-xl font-black text-center">הפעל מצב Focus עכשיו</Text>
               </View>
            </TouchableOpacity>

          </View>
          <View className="h-20" />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
