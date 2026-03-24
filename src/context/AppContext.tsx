import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { AppSettings, Device, MenuItem, User, SessionLog, Toast } from '../types';
import { generateId } from '../lib/utils';

// --- Initial State ---
const initialDevices: Device[] = [
  { id: '1', name: 'Station 1', type: 'PS5', status: 'idle', mode: 'single', startTime: null, endTime: null, selectedDuration: 'open', orders: [], hourlyRateSingle: 5, hourlyRateMulti: 8, notes: '' },
  { id: '2', name: 'Station 2', type: 'PS4', status: 'idle', mode: 'single', startTime: null, endTime: null, selectedDuration: 'open', orders: [], hourlyRateSingle: 4, hourlyRateMulti: 6, notes: '' },
  { id: '3', name: 'Station 3', type: 'PS4', status: 'idle', mode: 'single', startTime: null, endTime: null, selectedDuration: 'open', orders: [], hourlyRateSingle: 4, hourlyRateMulti: 6, notes: '' },
  { id: '4', name: 'Station 4', type: 'PS3', status: 'idle', mode: 'single', startTime: null, endTime: null, selectedDuration: 'open', orders: [], hourlyRateSingle: 3, hourlyRateMulti: 5, notes: '' },
];

const initialMenu: MenuItem[] = [
  { id: 'm1', name: 'Pepsi', category: 'drink', price: 1.5 },
  { id: 'm2', name: '7Up', category: 'drink', price: 1.5 },
  { id: 'm3', name: 'Water', category: 'drink', price: 1.0 },
  { id: 'm4', name: 'Coffee', category: 'drink', price: 2.5 },
  { id: 'm5', name: 'Club Sandwich', category: 'food', price: 5.0 },
  { id: 'm6', name: 'Pizza Slice', category: 'food', price: 3.5 },
  { id: 'm7', name: 'Mixed Nuts', category: 'food', price: 4.0 },
];

const initialUsers: User[] = [
  { id: 'admin-1', username: 'admin', role: 'admin', password: '123', createdAt: Date.now(), lastLogin: Date.now() },
];

interface State {
  user: User | null;
  users: User[];
  devices: Device[];
  menu: MenuItem[];
  settings: AppSettings;
  sessions: SessionLog[];
  toasts: Toast[];
}

type Action =
  | { type: 'LOGIN'; payload: User }
  | { type: 'REGISTER_USER'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<AppSettings> }
  | { type: 'START_DEVICE'; payload: { deviceId: string; mode: 'single' | 'multi'; duration: number | 'open'; userId?: string } }
  | { type: 'STOP_DEVICE'; payload: { deviceId: string; log: SessionLog } }
  | { type: 'ADD_ORDER'; payload: { deviceId: string; item: MenuItem; quantity: number } }
  | { type: 'UPDATE_DEVICE_SETTINGS'; payload: { deviceId: string; name?: string; notes?: string; hourlyRateSingle?: number; hourlyRateMulti?: number } }
  | { type: 'ADD_DEVICE'; payload: Device }
  | { type: 'DELETE_DEVICE'; payload: string }
  | { type: 'ADD_MENU_ITEM'; payload: MenuItem }
  | { type: 'DELETE_MENU_ITEM'; payload: string }
  | { type: 'ADD_TOAST'; payload: Toast }
  | { type: 'REMOVE_TOAST'; payload: string };

const initialState: State = {
  user: null,
  users: initialUsers,
  devices: initialDevices,
  menu: initialMenu,
  settings: { theme: 'light', language: 'en', siteName: 'GameZone' },
  sessions: [],
  toasts: [],
};

// --- Reducer ---
function appReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'LOGIN':
      // Update lastLogin for the user
      const updatedUsers = state.users.map(u => 
        u.id === action.payload.id ? { ...u, lastLogin: Date.now() } : u
      );
      return { ...state, user: { ...action.payload, lastLogin: Date.now() }, users: updatedUsers };
    case 'REGISTER_USER':
      return { ...state, users: [...state.users, action.payload] };
    case 'LOGOUT':
      return { ...state, user: null };
    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };
    case 'START_DEVICE':
      return {
        ...state,
        devices: state.devices.map(d =>
          d.id === action.payload.deviceId
            ? {
                ...d,
                status: 'active',
                startTime: Date.now(),
                mode: action.payload.mode,
                selectedDuration: action.payload.duration,
                currentUserId: action.payload.userId,
                orders: [],
              }
            : d
        ),
      };
    case 'STOP_DEVICE':
      return {
        ...state,
        sessions: [action.payload.log, ...state.sessions],
        devices: state.devices.map(d =>
          d.id === action.payload.deviceId
            ? { ...d, status: 'idle', startTime: null, endTime: null, currentUserId: undefined }
            : d
        ),
      };
    case 'ADD_ORDER':
      return {
        ...state,
        devices: state.devices.map(d => {
          if (d.id !== action.payload.deviceId) return d;
          const existingOrder = d.orders.find(o => o.menuItemId === action.payload.item.id);
          let newOrders;
          if (existingOrder) {
            newOrders = d.orders.map(o =>
              o.menuItemId === action.payload.item.id
                ? { ...o, quantity: o.quantity + action.payload.quantity }
                : o
            );
          } else {
            newOrders = [
              ...d.orders,
              {
                id: generateId(),
                menuItemId: action.payload.item.id,
                name: action.payload.item.name,
                price: action.payload.item.price,
                quantity: action.payload.quantity,
              },
            ];
          }
          return { ...d, orders: newOrders };
        }),
      };
    case 'UPDATE_DEVICE_SETTINGS':
      return {
        ...state,
        devices: state.devices.map(d =>
          d.id === action.payload.deviceId
            ? { ...d, ...action.payload }
            : d
        ),
      };
    case 'ADD_DEVICE':
      return { ...state, devices: [...state.devices, action.payload] };
    case 'DELETE_DEVICE':
      return { ...state, devices: state.devices.filter(d => d.id !== action.payload) };
    case 'ADD_MENU_ITEM':
      return { ...state, menu: [...state.menu, action.payload] };
    case 'DELETE_MENU_ITEM':
      return { ...state, menu: state.menu.filter(m => m.id !== action.payload) };
    case 'ADD_TOAST':
      return { ...state, toasts: [...state.toasts, action.payload] };
    case 'REMOVE_TOAST':
      return { ...state, toasts: state.toasts.filter(t => t.id !== action.payload) };
    default:
      return state;
  }
}

// --- Context ---
const AppContext = createContext<{
  state: State;
  dispatch: React.Dispatch<Action>;
} | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState, (initial) => {
    const persisted = localStorage.getItem('ps-cafe-state-v3'); // Bumped version
    return persisted ? JSON.parse(persisted) : initial;
  });

  useEffect(() => {
    localStorage.setItem('ps-cafe-state-v3', JSON.stringify(state));
    
    // Force Light Mode - Remove 'dark' class always
    document.documentElement.classList.remove('dark');

    // Language Direction
    document.documentElement.dir = state.settings.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = state.settings.language;

  }, [state]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
