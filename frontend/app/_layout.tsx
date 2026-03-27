import '../global.css';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { NotificationService } from '../services/NotificationService';
import { ToastProvider } from '../components/ToastProvider';

function NavigationResolver() {
  const { token, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === 'login' || segments[0] === 'register';

    if (!token && !inAuthGroup) {
      router.replace('/login');
    } else if (token && inAuthGroup) {
      router.replace('/(tabs)');
    }
    setIsReady(true);
  }, [token, loading, segments]);

  return null;
}

export default function RootLayout() {
  useEffect(() => {
    let isMounted = true;
    const setupNotifications = async () => {
      try {
        await NotificationService.registerForPushNotificationsAsync();
        // Initial smart tip after a delay for safety
        if (isMounted) {
          setTimeout(() => {
            if (isMounted) NotificationService.scheduleSmartAITip().catch(() => null);
          }, 10000);
        }
      } catch (err) {
        console.log('[RootLayout] Notification setup error:', err);
      }
    };
    setupNotifications();
    return () => { isMounted = false; };
  }, []);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ToastProvider>
          <StatusBar style="light" />
          <NavigationResolver />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: '#0f172a' },
            }}
          >
            <Stack.Screen name="login" options={{ animation: 'fade' }} />
            <Stack.Screen name="register" options={{ animation: 'fade' }} />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="project/[id]" options={{ presentation: 'transparentModal', animation: 'fade' }} />
            <Stack.Screen name="add-task" options={{ presentation: 'transparentModal', animation: 'fade' }} />
            <Stack.Screen name="pricing" options={{ presentation: 'fullScreenModal', animation: 'fade' }} />
            <Stack.Screen name="focus" options={{ presentation: 'fullScreenModal', animation: 'fade' }} />
            <Stack.Screen name="ai-assistant" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
          </Stack>
        </ToastProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
