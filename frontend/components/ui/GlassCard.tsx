import React from 'react';
import { View, Platform, ViewProps } from 'react-native';
import { BlurView } from 'expo-blur';

interface GlassCardProps extends ViewProps {
  intensity?: number;
  tint?: 'light' | 'dark' | 'default';
  children: React.ReactNode;
  className?: string; // Support NativeWind
}

/**
 * Atom: GlassCard (Elite UI)
 * Creative UI/UX Role
 */
export function GlassCard({ intensity = 20, tint = 'dark', children, className, style, ...props }: GlassCardProps) {
  const isWeb = Platform.OS === 'web';

  if (isWeb) {
    return (
      <View 
        className={`p-5 rounded-3xl border border-white/10 bg-slate-900/60 shadow-xl ${className || ''}`}
        style={[{ 
          // @ts-ignore - backdropFilter is supported by web browsers
          backdropFilter: 'blur(20px)',
        }, style]} 
        {...props}
      >
        {children}
      </View>
    );
  }

  return (
    <BlurView 
      intensity={intensity} 
      tint={tint} 
      className={`p-5 rounded-3xl border border-white/10 overflow-hidden bg-white/5 ${className || ''}`}
      style={style}
      {...props}
    >
      {children}
    </BlurView>
  );
}

