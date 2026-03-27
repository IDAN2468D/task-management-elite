import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { ToastService } from '../components/ToastProvider';

// Defensive check for Expo Go to avoid crashing on SDK 53+ push restrictions
const isExpoGo = Constants.appOwnership === 'expo';

export const NotificationService = {
  async registerForPushNotificationsAsync() {
    if (isExpoGo) {
      console.log('[NotificationService] Running in Expo Go: Remote Push disabled to prevent SDK 53+ crash. Using Premium In-App Alerts instead.');
      return null;
    }

    try {
      // Only require if NOT in Expo Go to avoid side-effect crash
      const Notifications = require('expo-notifications');
      
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#818cf8',
        });
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') return null;

      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });

      console.log('[NotificationService] System notifications enabled (Development Build)');
      return null;
    } catch (e) {
      console.log('[NotificationService] Failed to initialize system notifications:', e);
      return null;
    }
  },

  async sendLocalNotification(title: string, body: string, data = {}) {
    if (isExpoGo) {
      // Premium Fallback: Show a custom In-App Toast
      ToastService.show(title, body, 'ai');
      console.log(`[AI-NUDGE-FALLBACK] ${title}: ${body}`);
      return;
    }

    try {
      const Notifications = require('expo-notifications');
      await Notifications.scheduleNotificationAsync({
        content: { title, body, data, sound: true },
        trigger: null,
      });
    } catch (e) {
      console.log('[NotificationService] Failed to send local notification:', e);
    }
  },

  async scheduleSmartAITip() {
    const tips = [
      "AI: שמת לב שיש לך 3 משימות ב'משימות חדשות'? אולי כדאי להתחיל אחת מהן?",
      "AI: זמן מצוין לעשות הפסקת ריכוז של 5 דקות.",
      "AI: המשימה 'גמר פרוייקט' מחכה לך כבר יומיים. אולי נפרק אותה?",
    ];
    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    
    await this.sendLocalNotification("טיפ חכם מ-TaskMaster", randomTip);
  }
};
