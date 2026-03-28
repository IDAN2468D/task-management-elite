import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';

interface User {
  id: string;
  name: string;
  email: string;
  picture?: string;
}

interface AuthContextData {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string, user: User) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStorageData();
  }, []);

  async function loadStorageData() {
    try {
      const storagedToken = await AsyncStorage.getItem('@TaskMaster:token');
      const storagedUser = await AsyncStorage.getItem('@TaskMaster:user');

      if (storagedToken && storagedUser) {
        setToken(storagedToken);
        setUser(JSON.parse(storagedUser));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function login(newToken: string, newUser: User) {
    setToken(newToken);
    setUser(newUser);
    await AsyncStorage.setItem('@TaskMaster:token', newToken);
    await AsyncStorage.setItem('@TaskMaster:user', JSON.stringify(newUser));
  }

  async function logout() {
    setToken(null);
    setUser(null);
    await AsyncStorage.removeItem('@TaskMaster:token');
    await AsyncStorage.removeItem('@TaskMaster:user');
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
