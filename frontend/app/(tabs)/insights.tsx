import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { Sparkles, TrendingUp, Zap, Target, Brain } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import Animated, { FadeInUp, Layout } from 'react-native-reanimated';
import { TaskService } from '../../services/api';

const screenWidth = Dimensions.get('window').width;

export default function InsightsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  
  // Dummy data for now - will be connected to API later
  const taskCompletionData = {
    labels: ["א'", "ב'", "ג'", "ד'", "ה'", "ו'"],
    datasets: [{
      data: [3, 7, 5, 8, 12, 10],
      color: (opacity = 1) => `rgba(129, 140, 248, ${opacity})`,
      strokeWidth: 3
    }]
  };

  const chartConfig = {
    backgroundGradientFrom: "#0f172a",
    backgroundGradientTo: "#1e293b",
    color: (opacity = 1) => `rgba(148, 163, 184, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.6,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
    propsForDots: {
      r: "6",
      strokeWidth: "2",
      stroke: "#818cf8"
    }
  };

  return (
    <View className="flex-1 bg-slate-950">
      {/* Solid Header */}
      <View className="w-full z-10 bg-slate-900 pt-14 border-b border-white/10">
        <View className="px-6 py-4 flex-row-reverse justify-between items-center">
          <View>
            <Text className="text-white text-2xl font-extrabold text-right">התקדמות</Text>
            <Text className="text-slate-400 text-sm text-right">ניתוח ביצועים מבוסס AI</Text>
          </View>
          <View className="bg-indigo-500/20 p-2 rounded-xl border border-indigo-500/30">
            <TrendingUp color="#818cf8" size={24} />
          </View>
        </View>
      </View>

      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
          
          {/* Stats Grid */}
          <View className="flex-row-reverse justify-between gap-4 mb-8">
            <Animated.View entering={FadeInUp.delay(100)} className="flex-1 bg-slate-900/50 p-4 rounded-3xl border border-white/5 items-center">
              <Zap color="#fbbf24" size={24} />
              <Text className="text-white text-2xl font-bold mt-2">84%</Text>
              <Text className="text-slate-500 text-xs">מיקוד</Text>
            </Animated.View>
            <Animated.View entering={FadeInUp.delay(200)} className="flex-1 bg-slate-900/50 p-4 rounded-3xl border border-white/5 items-center">
              <Target color="#ef4444" size={24} />
              <Text className="text-white text-2xl font-bold mt-2">12</Text>
              <Text className="text-slate-500 text-xs">משימות</Text>
            </Animated.View>
            <Animated.View entering={FadeInUp.delay(300)} className="flex-1 bg-slate-900/50 p-4 rounded-3xl border border-white/5 items-center">
              <Brain color="#818cf8" size={24} />
              <Text className="text-white text-2xl font-bold mt-2">High</Text>
              <Text className="text-slate-500 text-xs">אנרגיה</Text>
            </Animated.View>
          </View>

          {/* Chart Card */}
          <Animated.View entering={FadeInUp.delay(400)} className="bg-slate-900/80 rounded-[40px] overflow-hidden border border-white/5 mb-8">
            <View className="p-6">
              <Text className="text-white text-xl font-bold text-right mb-6">משימות שהושלמו השבוע</Text>
              <LineChart
                data={taskCompletionData}
                width={screenWidth - 80}
                height={220}
                chartConfig={chartConfig}
                bezier
                style={{
                  marginVertical: 8,
                  borderRadius: 16,
                  paddingRight: 40
                }}
                withInnerLines={false}
                withOuterLines={true}
                withVerticalLines={false}
                yAxisLabel=""
                yAxisSuffix=""
              />
            </View>
          </Animated.View>

          {/* AI Insight Card */}
          <Animated.View entering={FadeInUp.delay(500)} layout={Layout.springify()}>
            <BlurView intensity={20} tint="dark" className="overflow-hidden rounded-[35px] border border-indigo-500/20 bg-indigo-500/5">
              <View className="p-6 flex-row-reverse items-start">
                <View className="bg-indigo-500/20 p-3 rounded-full ml-4">
                  <Sparkles color="#818cf8" size={24} />
                </View>
                <View className="flex-1">
                  <Text className="text-indigo-400 font-bold text-lg text-right mb-1">תובנת AI</Text>
                  <Text className="text-slate-300 text-right leading-6">
                    עידן, שים לב שביצועי המשימות שלך ביום חמישי הם בשיא (12 משימות). מומלץ לתזמן משימות מורכבות ליום זה ולהשאיר את ימי ו' למשימות "אנרגיה נמוכה".
                  </Text>
                </View>
              </View>
            </BlurView>
          </Animated.View>

          {/* Productivity Tip Button */}
          <TouchableOpacity 
            onPress={() => router.push('/focus?title=ריכוז מוגבר - תובנות שבועיות')}
            className="mt-8 bg-slate-800/80 p-5 rounded-3xl border border-white/5 flex-row-reverse justify-between items-center"
          >
            <View className="flex-row-reverse items-center">
               <View className="bg-blue-500/20 p-2 rounded-full ml-3">
                 <Zap color="#60a5fa" size={20} />
               </View>
               <Text className="text-white font-bold">הפעל מצב Focus חכם</Text>
            </View>
            <Text className="text-slate-500">←</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </View>
  );
}
