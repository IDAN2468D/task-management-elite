import axios from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const getApiUrl = () => {
  // Hardcoded to your computer's local IP address (from Expo logs) 
  // so physical devices connected to the same WiFi can reach the backend.
  return process.env.EXPO_PUBLIC_API_URL || 'https://task-management-elite.onrender.com/api';
};

const api = axios.create({
  baseURL: getApiUrl(),
  timeout: 60000, // 60s for Render cold starts
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  }
});

api.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem('@TaskMaster:token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (err) {
    console.error('[AXIOS INTERCEPTOR] Error fetching token:', err);
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      await AsyncStorage.removeItem('@TaskMaster:token');
      await AsyncStorage.removeItem('@TaskMaster:user');
      // On 401, we might want to redirect but we can't easily access router here without a circular dep.
      // However, RootLayout's NavigationResolver will pick up the null token next time it renders or on state change if we had a global state.
    }
    return Promise.reject(error);
  }
);

export interface Project {
  _id: string;
  name: string;
  description?: string;
  themeColor?: string;
  meshGradientColors?: string[];
  aiSummary?: string;
  isAIGenerated?: boolean;
  metadata?: {
    suggestedSubtasks?: string[];
    targetAudience?: string;
    category?: string;
  };
  createdAt?: string;
}

export interface TaskItem {
  _id: string;
  title: string;
  description?: string;
  completed: boolean;
  status?: 'todo' | 'in-progress' | 'done';
  priority?: 'low' | 'med' | 'high';
  projectId?: Project | string;
  dueDate?: string;
  createdAt?: string;
}

export interface BurnoutAssessment {
  riskScore: number;
  level: 'low' | 'medium' | 'high' | 'critical';
  insights: string[];
  recommendation: string;
}

export const ProjectService = {
  getAll: async () => {
    const response = await api.get<Project[]>('/projects');
    return response.data;
  },
  create: async (data: Partial<Project>) => {
    const response = await api.post<Project>('/projects', data);
    return response.data;
  },
  aiGenerate: async (text: string) => {
    const response = await api.post<Project>('/projects/ai-generate', { text });
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/projects/${id}`);
    return response.data;
  }
};

export const TaskService = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  register: async (name: string, email: string, password: string) => {
    const response = await api.post('/auth/register', { name, email, password });
    return response.data;
  },
  googleLogin: async (idToken: string) => {
    const response = await api.post('/auth/google-login', { idToken });
    return response.data;
  },
  getAll: async (projectId?: string) => {
    const response = await api.get<TaskItem[]>(`/tasks${projectId ? `?projectId=${projectId}` : ''}`);
    return response.data;
  },
  create: async (task: Partial<TaskItem>) => {
    const response = await api.post<TaskItem>('/tasks', task);
    return response.data;
  },
  update: async (id: string, updates: Partial<TaskItem>) => {
    const response = await api.put<TaskItem>(`/tasks/${id}`, updates);
    return response.data;
  },
  delete: async (id: string) => {
    await api.delete(`/tasks/${id}`);
  }
};

export const AiService = {
  getChatReply: async (message: string, context?: any) => {
    const response = await api.post('/ai/chat', { message, context });
    return response.data.reply;
  },
  breakdownTask: async (taskTitle: string) => {
    const response = await api.post('/ai/breakdown', { taskTitle });
    return response.data.subtasks;
  },
  parseQuickAdd: async (text: string) => {
    const response = await api.post('/ai/parse-quick-add', { text });
    return response.data; // { title, dueDate }
  },
  getSchedule: async (tasks: any[]) => {
    const response = await api.post('/ai/schedule', { tasks });
    return response.data.order;
  },
  analyzeTasks: async (tasks: any[]) => {
    const response = await api.post('/ai/analyze', { tasks });
    return response.data; // { analysis: string }
  },
  summarizeDriveFile: async (fileId: string, accessToken: string) => {
    const response = await api.post('/ai/summarize-file', { fileId, accessToken });
    return response.data;
  },
  searchTasksSemantically: async (query: string, projectId?: string) => {
    const response = await api.post('/ai/search-tasks', { query, projectId });
    return response.data;
  },
  saveToDrive: async (content: string, accessToken: string, fileName?: string) => {
    const response = await api.post('/ai/save-to-drive', { content, accessToken, fileName });
    return response.data;
  },
  getBurnoutRisk: async () => {
    const response = await api.get<BurnoutAssessment>('/ai/burnout-risk');
    return response.data;
  },
  // Simple probe to wake up the server (Render free tier)
  warmup: async () => {
    try {
      // Hit the health endpoint (which is at the root, so we use axios directly or a relative path if handled)
      const rootUrl = getApiUrl().replace('/api', '');
      await axios.get(`${rootUrl}/health`, { timeout: 10000 });
      console.log('[API] Server warmed up successfully');
    } catch (err) {
      console.log('[API] Warmup probe failed or server still waking up');
    }
  }
};

export default api;