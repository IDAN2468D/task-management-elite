import React, { createContext, useContext, useState, useCallback } from 'react';
import { View, Text, Animated, StyleSheet, Dimensions } from 'react-native';
import { BellRing, Info, AlertTriangle, CheckCircle } from 'lucide-react-native';

const { width } = Dimensions.get('window');

type ToastType = 'info' | 'success' | 'warning' | 'ai';

interface Toast {
  id: string;
  title: string;
  body: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (title: string, body: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

let toastRef: ((title: string, body: string, type?: ToastType) => void) | null = null;

export const ToastService = {
  show: (title: string, body: string, type: ToastType = 'info') => {
    if (toastRef) toastRef(title, body, type);
    else console.log(`[Fallback Toast] ${title}: ${body}`);
  }
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((title: string, body: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(7);
    setToasts(prev => [...prev, { id, title, body, type }]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  React.useEffect(() => {
    toastRef = showToast;
    return () => { toastRef = null; };
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <View style={styles.container} pointerEvents="none">
        {toasts.map((toast, index) => (
          <ToastItem key={toast.id} toast={toast} index={index} />
        ))}
      </View>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, index }: { toast: Toast, index: number }) {
  const opacity = new Animated.Value(0);
  const translateY = new Animated.Value(-20);

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.spring(translateY, { toValue: 0, tension: 50, useNativeDriver: true }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }).start();
    }, 3700);

    return () => clearTimeout(timer);
  }, []);

  const getIcon = () => {
    switch (toast.type) {
      case 'ai': return <BellRing color="#818cf8" size={20} />;
      case 'success': return <CheckCircle color="#10b981" size={20} />;
      case 'warning': return <AlertTriangle color="#f59e0b" size={20} />;
      default: return <Info color="#3b82f6" size={20} />;
    }
  };

  return (
    <Animated.View 
      style={[
        styles.toast, 
        { opacity, transform: [{ translateY }] },
        { marginTop: index * 10 }
      ]}
      className="bg-slate-800 border border-white/10 shadow-2xl rounded-2xl p-4 flex-row-reverse items-center"
    >
      <View className="ml-5 p-2 bg-slate-700/50 rounded-xl">
        {getIcon()}
      </View>
      <View className="flex-1 items-end">
        <Text className="text-white font-bold text-base text-right">{toast.title}</Text>
        <Text className="text-slate-400 text-sm text-right mt-0.5">{toast.body}</Text>
      </View>
    </Animated.View>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 9999,
  },
  toast: {
    width: width * 0.9,
    maxWidth: 400,
    elevation: 10,
  }
});
