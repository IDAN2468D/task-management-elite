import React from 'react';
import { Tabs } from 'expo-router';
import { LayoutTemplate, UserCircle, CalendarDays, LineChart as ChartIcon } from 'lucide-react-native';
import { View, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  
  // Refined height to sit slightly lower for a more integrated feel
  const tabHeight = Platform.OS === 'ios' ? 80 + insets.bottom : 64 + (insets.bottom / 1.5);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0f172a', // Solid Slate 900
          borderTopWidth: 1,
          borderTopColor: 'rgba(255, 255, 255, 0.08)',
          height: tabHeight,
          // Tuned padding to sit slightly closer to the system threshold without overlapping
          paddingBottom: Platform.OS === 'android' ? (insets.bottom > 0 ? insets.bottom / 2 : 8) : insets.bottom / 1.2,
          paddingTop: 8,
          elevation: 0,
          shadowOpacity: 0,
          position: 'relative', 
        },
        tabBarActiveTintColor: '#60a5fa',
        tabBarInactiveTintColor: '#475569',
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'דאשבורד',
          tabBarIcon: ({ color, focused }) => (
            <View className="items-center justify-center">
              {focused && (
                <View 
                  className="absolute -top-[10px] w-10 h-1 bg-blue-500 rounded-b-full shadow-lg shadow-blue-500/80" 
                  style={{ zIndex: 50 }}
                />
              )}
              <View className={`w-11 h-11 items-center justify-center rounded-2xl ${focused ? 'bg-blue-500/10' : ''}`}>
                <LayoutTemplate color={color} size={24} strokeWidth={focused ? 2.5 : 2} />
              </View>
            </View>
          ),
        }}
      />
      
      <Tabs.Screen
        name="insights"
        options={{
          title: 'תובנות',
          tabBarIcon: ({ color, focused }) => (
            <View className="items-center justify-center">
               {focused && (
                <View 
                  className="absolute -top-[10px] w-10 h-1 bg-indigo-500 rounded-b-full shadow-lg shadow-indigo-500/80" 
                  style={{ zIndex: 50 }}
                />
              )}
              <View className={`w-11 h-11 items-center justify-center rounded-2xl ${focused ? 'bg-indigo-500/10' : ''}`}>
                <ChartIcon color={color} size={24} strokeWidth={focused ? 2.5 : 2} />
              </View>
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="calendar"
        options={{
          title: 'לוח שנה',
          tabBarIcon: ({ color, focused }) => (
            <View className="items-center justify-center">
               {focused && (
                <View 
                  className="absolute -top-[10px] w-10 h-1 bg-indigo-500 rounded-b-full shadow-lg shadow-indigo-500/80" 
                  style={{ zIndex: 50 }}
                />
              )}
              <View className={`w-11 h-11 items-center justify-center rounded-2xl ${focused ? 'bg-indigo-500/10' : ''}`}>
                <CalendarDays color={color} size={24} strokeWidth={focused ? 2.5 : 2} />
              </View>
            </View>
          ),
        }}
      />
      
      <Tabs.Screen
        name="settings"
        options={{
          title: 'הגדרות',
          tabBarIcon: ({ color, focused }) => (
            <View className="items-center justify-center">
               {focused && (
                <View 
                  className="absolute -top-[10px] w-10 h-1 bg-blue-500 rounded-b-full shadow-lg shadow-blue-500/80" 
                  style={{ zIndex: 50 }}
                />
              )}
              <View className={`w-11 h-11 items-center justify-center rounded-2xl ${focused ? 'bg-blue-500/10' : ''}`}>
                <UserCircle color={color} size={24} strokeWidth={focused ? 2.5 : 2} />
              </View>
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
