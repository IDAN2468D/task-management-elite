import React from 'react';
import { Tabs } from 'expo-router';
import { LayoutTemplate, UserCircle, CalendarDays, LineChart as ChartIcon } from 'lucide-react-native';
import { View, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  
  // Refined height to sit slightly lower for a more integrated feel
  // Standardized premium height for a sleek feel
  const tabHeight = Platform.OS === 'ios' ? 95 + insets.bottom : 70 + insets.bottom;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0f172a', // Solid Elite Slate
          borderTopWidth: 1.5,
          borderTopColor: 'rgba(255, 255, 255, 0.1)',
          height: tabHeight,
          // Compact padding for a more integrated look
          paddingBottom: Platform.OS === 'ios' ? insets.bottom + 8 : insets.bottom + 5,
          paddingTop: 12,
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
                  className="absolute -top-[16px] w-12 h-1 bg-blue-500 rounded-b-full shadow-lg shadow-blue-500/80" 
                  style={{ zIndex: 50 }}
                />
              )}
              <View className={`w-13 h-13 items-center justify-center rounded-2xl ${focused ? 'bg-blue-500/10' : ''}`}>
                <LayoutTemplate color={color} size={26} strokeWidth={focused ? 2.5 : 2} />
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
                  className="absolute -top-[16px] w-12 h-1 bg-indigo-500 rounded-b-full shadow-lg shadow-indigo-500/80" 
                  style={{ zIndex: 50 }}
                />
              )}
              <View className={`w-13 h-13 items-center justify-center rounded-2xl ${focused ? 'bg-indigo-500/10' : ''}`}>
                <ChartIcon color={color} size={26} strokeWidth={focused ? 2.5 : 2} />
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
                  className="absolute -top-[16px] w-12 h-1 bg-indigo-500 rounded-b-full shadow-lg shadow-indigo-500/80" 
                  style={{ zIndex: 50 }}
                />
              )}
              <View className={`w-13 h-13 items-center justify-center rounded-2xl ${focused ? 'bg-indigo-500/10' : ''}`}>
                <CalendarDays color={color} size={26} strokeWidth={focused ? 2.5 : 2} />
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
                  className="absolute -top-[16px] w-12 h-1 bg-blue-500 rounded-b-full shadow-lg shadow-blue-500/80" 
                  style={{ zIndex: 50 }}
                />
              )}
              <View className={`w-13 h-13 items-center justify-center rounded-2xl ${focused ? 'bg-blue-500/10' : ''}`}>
                <UserCircle color={color} size={26} strokeWidth={focused ? 2.5 : 2} />
              </View>
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
