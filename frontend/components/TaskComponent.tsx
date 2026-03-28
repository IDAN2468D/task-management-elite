import React from 'react';
import { View, Text, TouchableOpacity, Alert, Platform, Pressable } from 'react-native';
import * as Calendar from 'expo-calendar';
import Animated, { FadeInRight, FadeOutLeft, LinearTransition, useAnimatedStyle, useSharedValue, withSpring, withSequence, withTiming } from 'react-native-reanimated';
import { CheckCircle2, Circle, Trash2, Play, CalendarPlus, ChevronLeft, Clock } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { StyleSheet } from 'react-native';

interface TaskProps {
  task: any;
  onToggle: () => void;
  onDelete: () => void;
}

export default function TaskComponent({ task, onToggle, onDelete }: TaskProps) {
  const router = useRouter();
  
  // Animation Values
  const scale = useSharedValue(1);
  const checkScale = useSharedValue(task.completed ? 1 : 0.8);
  
  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  const animatedCheckStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }]
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const handleToggle = () => {
    Haptics.impactAsync(task.completed ? Haptics.ImpactFeedbackStyle.Light : Haptics.ImpactFeedbackStyle.Medium);
    checkScale.value = withSequence(
      withTiming(0.7, { duration: 100 }),
      withSpring(1.2, { damping: 12, stiffness: 200 }),
      withSpring(1)
    );
    onToggle();
  };
  
  const addToCalendar = async () => {
    try {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('שגיאה', 'יש לאשר גישה ליומן כדי להוסיף משימות');
        return;
      }
      
      const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      const defaultCalendar = Platform.OS === 'ios'
        ? await Calendar.getDefaultCalendarAsync()
        : calendars.find(cal => cal.isPrimary) || calendars[0];

      if (!defaultCalendar) {
        Alert.alert('שגיאה', 'לא נמצא יומן זמין במכשיר');
        return;
      }

      await Calendar.createEventAsync(defaultCalendar.id, {
        title: task.title,
        startDate: new Date(),
        endDate: new Date(Date.now() + 60 * 60 * 1000),
        notes: (task.projectId && task.projectId.name) ? `פרויקט: ${task.projectId.name}` : '',
      });
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('מצוין!', 'המשימה נוספה ליומן האישי שלך בהצלחה');
    } catch (error) {
      console.log('Calendar error:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('שגיאה', 'לא הצלחנו להוסיף את המשימה ליומן');
    }
  };

  const handleDelete = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    onDelete();
  };

  const projectColor = task.projectId?.themeColor || '#6366f1';

  return (
    <Animated.View 
      entering={FadeInRight.duration(500).springify()} 
      exiting={FadeOutLeft}
      layout={LinearTransition.springify()}
      className="mb-4"
      style={animatedContainerStyle}
    >
      <Pressable 
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handleToggle}
        className="overflow-hidden rounded-[28px] border border-white/10 shadow-2xl relative"
      >
        <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
        
        <View className="flex-row-reverse items-center justify-between py-4 px-5">
          {/* Priority Glow Indicator */}
          <View 
            className="absolute left-0 top-0 bottom-0 w-1.5" 
            style={{ 
              backgroundColor: projectColor,
              shadowColor: projectColor,
              shadowOffset: { width: 10, height: 0 },
              shadowOpacity: 0.6,
              shadowRadius: 10,
              elevation: 4
            }}
          />

          <Animated.View 
            className={`w-10 h-10 rounded-2xl items-center justify-center ml-4 ${task.completed ? 'bg-emerald-500/20' : 'bg-white/5 border border-white/10'}`}
            style={animatedCheckStyle}
          >
            {task.completed ? (
              <CheckCircle2 color="#10b981" size={20} />
            ) : (
              <Circle color="#94a3b8" size={20} strokeWidth={2.5} />
            )}
          </Animated.View>
          
          <View className="flex-1 mr-2">
            <Text 
              className={`text-[15px] text-right font-black tracking-tight ${task.completed ? 'line-through text-slate-600' : 'text-slate-100'}`}
              numberOfLines={1}
            >
              {task.title}
            </Text>
            <View className="flex-row-reverse items-center mt-1">
               <View className="flex-row-reverse items-center bg-white/5 px-2 py-0.5 rounded-lg">
                  <Clock size={8} color={projectColor} className="ml-1" />
                  <Text className="text-[9px] text-right font-bold uppercase tracking-widest text-slate-500">
                    {task.projectId?.name || 'Quick Task'}
                  </Text>
               </View>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="flex-row-reverse items-center gap-2 pr-4 pb-4">
          {!task.completed && (
             <TouchableOpacity 
                onPress={() => router.push({ pathname: '/focus', params: { title: task.title } })}
                className="w-10 h-10 bg-indigo-500/10 rounded-xl items-center justify-center border border-indigo-500/20 z-10"
              >
                <Play color="#818cf8" size={14} fill="#818cf8" />
              </TouchableOpacity>
          )}

          <TouchableOpacity 
            onPress={addToCalendar}
            className="w-10 h-10 bg-emerald-500/10 rounded-xl items-center justify-center border border-emerald-500/20 z-10"
          >
            <CalendarPlus color="#10b981" size={16} />
          </TouchableOpacity>
  
          <TouchableOpacity 
            onPress={handleDelete}
            className="w-10 h-10 bg-rose-500/10 rounded-xl items-center justify-center border border-rose-500/20 z-10"
          >
            <Trash2 color="#f43f5e" size={16} />
          </TouchableOpacity>
        </View>

      </Pressable>
    </Animated.View>
  );
}
