import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
export type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  favorites: string[];
};
export type Service = {
  _id: string;
  name: string;
  description: string;
  category: string;
  photo: string;
  price: number;
  duration: number;
  active: boolean;
};
export type Staff = {
  _id: string;
  name: string;
  bio: string;
  specialties: string[];
  services: string[];
};
export type Booking = {
  _id: string;
  service: Service;
  serviceName: string;
  staff: Staff;
  start: string;
  end: string;
  price: number;
  status: string;
  history: { status: string; reason?: string; at: string }[];
};
export type Settings = {
  timezone: string;
  currency: string;
  cancelHours: number;
  requestExpiryMinutes: number;
};
export type Slot = { start: string; end: string; staffId: string; staffName: string };
const base = process.env.EXPO_PUBLIC_API_URL;
let token: string | null = null;
export async function api<T>(path: string, method = 'GET', body?: unknown): Promise<T> {
  if (!base)
    throw new Error('Set EXPO_PUBLIC_API_URL to your computer’s LAN API address in mobile/.env');
  let response: Response;
  try {
    response = await fetch(`${base}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(15000),
    });
  } catch {
    throw new Error('Cannot reach the salon. Check your connection and try again.');
  }
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Request failed');
  return data;
}
const Session = createContext<{
  user: User | null;
  ready: boolean;
  signIn: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  update: (u: User) => void;
}>({ user: null, ready: false, signIn: async () => {}, logout: async () => {}, update: () => {} });
export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    void (async () => {
      try {
        if (Platform.OS !== 'web') token = await SecureStore.getItemAsync('saloon-token');
        if (token) setUser(await api<User>('/auth/me'));
      } catch {
        token = null;
      } finally {
        setReady(true);
      }
    })();
  }, []);
  async function signIn(email: string, password: string, name?: string) {
    const result = await api<{ token: string; user: User }>(
      name ? '/auth/register' : '/auth/login',
      'POST',
      { email, password, ...(name ? { name } : {}) },
    );
    token = result.token;
    if (Platform.OS !== 'web') await SecureStore.setItemAsync('saloon-token', token);
    setUser(result.user);
  }
  async function logout() {
    try {
      await api('/auth/logout', 'POST');
    } finally {
      token = null;
      if (Platform.OS !== 'web') await SecureStore.deleteItemAsync('saloon-token');
      setUser(null);
    }
  }
  return (
    <Session.Provider value={{ user, ready, signIn, logout, update: setUser }}>
      {children}
    </Session.Provider>
  );
}
export const useSession = () => useContext(Session);
export const money = (price: number, currency = 'NGN') =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency, maximumFractionDigits: 0 }).format(
    price,
  );
export const when = (value: string, timezone: string) =>
  new Date(value).toLocaleString('en-GB', {
    timeZone: timezone,
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
