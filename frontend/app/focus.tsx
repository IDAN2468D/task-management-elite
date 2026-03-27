import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Dimensions, Platform, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { X, Pause, Play, Square, Coffee, Sparkles, Brain } from 'lucide-react-native';
import Animated, { FadeInUp, useAnimatedProps, useSharedValue, withTiming, Easing, withRepeat, withSequence, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');
const CIRCLE_LENGTH = 1000;
const R = CIRCLE_LENGTH / (2 * Math.PI);

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function FocusModeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ title?: string, duration?: string }>();
  
  const title = params.title || "משימה ממוקדת";
  const durationStr = params.duration || "25";
  
  const [focusTime, setFocusTime] = useState(parseInt(durationStr) * 60);
  const [timeLeft, setTimeLeft] = useState(focusTime);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);

   const progress = useSharedValue(1);
  const ringScale = useSharedValue(1);
  const ringOpacity = useSharedValue(0.1);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          const nextVal = prev - 1;
          progress.value = nextVal / focusTime;
          return nextVal;
        });
      }, 1000);
    } else if (timeLeft === 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setIsActive(false);
      if (!isBreak) {
        setIsBreak(true);
        const breakVal = 5 * 60;
        setFocusTime(breakVal);
        setTimeLeft(breakVal);
      } else {
        setIsBreak(false);
        const originalTime = parseInt(durationStr) * 60;
        setFocusTime(originalTime);
        setTimeLeft(originalTime);
      }
      progress.value = 1;
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, isBreak, focusTime]);

  useEffect(() => {
    if (isActive) {
      ringScale.value = withRepeat(
        withSequence(
          withTiming(1.5, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 4000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
      ringOpacity.value = withRepeat(
        withSequence(
          withTiming(0.4, { duration: 4000 }),
          withTiming(0.1, { duration: 4000 })
        ),
        -1,
        true
      );
    } else {
      ringScale.value = withTiming(1);
      ringOpacity.value = withTiming(0.1);
    }
  }, [isActive]);

  const animatedRingStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
    opacity: ringOpacity.value,
  }));

  const toggleTimer = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsActive(!isActive);
  };

  const stopTimer = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsActive(false);
    const resetTime = isBreak ? 5 * 60 : parseInt(durationStr) * 60;
    setFocusTime(resetTime);
    setTimeLeft(resetTime);
    progress.value = 1;
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: withTiming(CIRCLE_LENGTH * (1 - progress.value), { duration: 1000, easing: Easing.linear }),
  }));

  const optimizeWithAi = () => {
    setAiAnalyzing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setTimeout(() => {
      const optimalSeconds = 40 * 60;
      setFocusTime(optimalSeconds);
      setTimeLeft(optimalSeconds);
      setAiAnalyzing(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, 1500);
  };

  return (
    <View className="flex-1 bg-slate-950">
      <View className="absolute inset-0 bg-slate-950" />
      
      <View className="w-full z-10 pt-16 px-8 flex-row-reverse justify-between items-center">
        <TouchableOpacity 
          onPress={() => router.back()} 
          className="bg-slate-900 w-12 h-12 rounded-2xl items-center justify-center border border-white/5 active:bg-slate-800"
        >
          <X color="#94a3b8" size={26} />
        </TouchableOpacity>
        
        <View className="flex-row-reverse items-center bg-brand-primary/10 px-5 py-2.5 rounded-pill border border-brand-primary/20 shadow-sm">
          <Brain color="#818cf8" size={18} />
          <Text className="text-white text-xs font-black mr-2.5 tracking-elite uppercase">Smart Focus</Text>
        </View>
        
        <View className="w-12 h-12" />
      </View>

      <View className="flex-1 items-center justify-center -mt-20">
        <Animated.View entering={FadeInUp.delay(200).springify()} className="px-6 items-center mb-16">
          <View className="bg-amber-500/20 px-4 py-1 rounded-full mb-4 border border-amber-500/30 flex-row-reverse items-center">
            <View className="ml-2">
              {isBreak ? <Coffee color="#f59e0b" size={16} /> : <Play color="#f59e0b" size={16} />}
            </View>
            <Text className="text-amber-500 font-bold uppercase tracking-widest text-[10px]">
              {isBreak ? "Break Mode" : "Focus Session"}
            </Text>
          </View>
          <Text className="text-white text-3xl font-extrabold text-center px-4" numberOfLines={2}>
            {title}
          </Text>
        </Animated.View>

         <Animated.View entering={FadeInUp.delay(400).springify()} className="items-center justify-center">
          {/* Breathing Aura Rings */}
          <Animated.View 
            style={[{ position: 'absolute', width: width * 0.9, height: width * 0.9, borderRadius: 1000, borderWidth: 1, borderColor: isBreak ? '#3b82f6' : '#f59e0b' }, animatedRingStyle]} 
          />
          <Animated.View 
            style={[{ position: 'absolute', width: width * 1.1, height: width * 1.1, borderRadius: 1000, borderWidth: 1, borderColor: isBreak ? '#3b82f6' : '#f59e0b' }, animatedRingStyle]} 
          />

          <View className="absolute items-center justify-center z-10">
            <Text className="text-white text-7xl font-black tabular-nums tracking-tighter shadow-2xl">
              {formatTime(timeLeft)}
            </Text>
            {!isActive && timeLeft === focusTime && !isBreak && (
              <TouchableOpacity 
                onPress={optimizeWithAi}
                className="mt-6 flex-row-reverse items-center bg-brand-primary/20 px-6 py-3 rounded-pill border border-brand-primary/30 shadow-2xl active:bg-brand-primary/30"
              >
                {aiAnalyzing ? (
                  <ActivityIndicator size="small" color="#818cf8" />
                ) : (
                  <>
                    <Sparkles color="#818cf8" size={16} />
                    <Text className="text-indigo-200 font-black text-xs mr-2.5 tracking-widest uppercase">Optimize with AI</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
          <Svg width={width * 0.85} height={width * 0.85} viewBox={`0 0 ${width} ${width}`}>
            <Circle 
              cx={width / 2} cy={width / 2} r={R} 
              stroke="#1e293b" strokeWidth={12} fill="transparent" 
              opacity={0.3}
            />
            <AnimatedCircle
              cx={width / 2} cy={width / 2} r={R}
              stroke={isBreak ? "#3b82f6" : "#f59e0b"} strokeWidth={12} fill="transparent"
              strokeDasharray={CIRCLE_LENGTH}
              animatedProps={animatedProps}
              strokeLinecap="round"
              rotation={-90}
              origin={`${width / 2}, ${width / 2}`}
            />
          </Svg>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(600).springify()} className="mt-16 flex-row items-center justify-center">
          <TouchableOpacity 
            onPress={stopTimer} 
            className="w-16 h-16 rounded-full bg-slate-900 items-center justify-center border border-white/10 shadow-lg mx-4"
          >
            <Square color="#94a3b8" size={24} fill="#94a3b8" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={toggleTimer} 
            className={`w-28 h-28 rounded-full items-center justify-center shadow-2xl mx-4 ${isActive ? 'bg-slate-900 border-2 border-amber-500/50' : 'bg-amber-500 shadow-amber-500/40'}`}
          >
            {isActive ? <Pause color="#f59e0b" size={40} fill="#f59e0b" /> : <Play color="#0f172a" size={44} style={{ marginLeft: 4 }} fill="#0f172a" />}
          </TouchableOpacity>
          <View className="w-16 h-16 mx-4" />
        </Animated.View>
      </View>
    </View>
  );
}
