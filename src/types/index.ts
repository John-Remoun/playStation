export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  username: string;
  role: UserRole;
  password?: string;
  createdAt: number;
  lastLogin?: number; // Added for Shift Report
}

export interface MenuItem {
  id: string;
  name: string;
  category: 'drink' | 'food';
  price: number;
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Device {
  id: string;
  name: string;
  type: 'PS1' | 'PS2' | 'PS3' | 'PS4' | 'PS5';
  status: 'idle' | 'active';
  mode: 'single' | 'multi';
  startTime: number | null;
  endTime: number | null;
  selectedDuration: number | 'open';
  orders: OrderItem[];
  hourlyRateSingle: number;
  hourlyRateMulti: number;
  notes: string;
  currentUserId?: string;
}

export interface SessionLog {
  id: string;
  deviceId: string;
  deviceName: string;
  userId?: string;
  userName?: string;
  startTime: number;
  endTime: number;
  durationMinutes: number;
  mode: 'single' | 'multi';
  timeCost: number;
  ordersCost: number;
  totalCost: number;
  orders: OrderItem[];
}

export interface AppSettings {
  theme: 'light'; // Forced to light
  language: 'en' | 'ar';
  siteName: string; // Added dynamic site name
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}
