import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { ChevronRight, Crown, Zap, BrainCircuit, CalendarCheck, CheckCircle2 } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function PricingScreen() {
  const router = useRouter();

  const features = [
    { icon: <BrainCircuit color="#f59e0b" size={20} />, title: "פירוק משימות אוטומטי (AI)" },
    { icon: <Zap color="#f59e0b" size={20} />, title: "תעדוף חכם למשימות" },
    { icon: <CalendarCheck color="#f59e0b" size={20} />, title: "סנכרון מלא ליומן גוגל" },
    { icon: <Crown color="#f59e0b" size={20} />, title: "טיימר 'מצב ריכוז' מתקדם" },
  ];

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      {/* Header */}
      <View className="absolute top-0 w-full z-10 pt-12">
        <BlurView intensity={40} tint="dark" className="px-6 py-4 flex-row-reverse justify-between items-center">
          <TouchableOpacity onPress={() => router.back()} className="bg-slate-800 p-2 rounded-full border border-white/10">
            <ChevronRight color="#94a3b8" size={24} />
          </TouchableOpacity>
        </BlurView>
      </View>

      <ScrollView className="flex-1 pt-24 px-4">
        
        <Animated.View entering={FadeInDown.duration(600).springify()} className="items-center mb-8">
          <View className="bg-amber-500/20 p-4 rounded-full mb-4 border border-amber-500/30">
            <Crown color="#f59e0b" size={48} />
          </View>
          <Text className="text-white text-3xl font-extrabold text-center mb-2">TaskMaster Pro</Text>
          <Text className="text-slate-400 text-lg text-center max-w-[80%]">
            שחרר את מלוא הפוטנציאל שלך עם כלי ה-AI המתקדמים ביותר.
          </Text>
        </Animated.View>

        {/* Pricing Card */}
        <Animated.View entering={FadeInUp.delay(200).duration(800).springify()} className="bg-slate-800/80 rounded-3xl p-6 border border-amber-500/50 relative overflow-hidden mb-8">
          <View className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/20 rounded-full blur-3xl opacity-50" />
          
          <View className="flex-row-reverse items-end mb-6">
            <Text className="text-amber-400 text-5xl font-black">₪29</Text>
            <Text className="text-slate-400 text-lg mb-2 ml-2">/ לחודש</Text>
          </View>

          <View className="gap-y-4 mb-8">
            {features.map((feature, index) => (
              <View key={index} className="flex-row-reverse items-center">
                <View className="bg-slate-900 p-2 rounded-full ml-3 border border-white/5">
                  {feature.icon}
                </View>
                <Text className="text-white text-lg font-medium">{feature.title}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity className="bg-amber-500 py-4 rounded-2xl items-center shadow-lg shadow-amber-500/30">
            <Text className="text-slate-900 text-xl font-bold">שדרג עכשיו</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Free Tier Comparison */}
        <Animated.View entering={FadeInUp.delay(400).duration(800).springify()} className="bg-slate-800/40 rounded-3xl p-6 border border-white/5 mb-8">
          <Text className="text-slate-400 text-xl font-bold text-center mb-4">או הישאר בתוכנית החינמית</Text>
          <View className="flex-row-reverse items-center justify-center">
            <CheckCircle2 color="#64748b" size={16} className="ml-2" />
            <Text className="text-slate-500">ניהול עד 3 פרויקטים ומשימות בסיסיות</Text>
          </View>
        </Animated.View>
        
        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}
