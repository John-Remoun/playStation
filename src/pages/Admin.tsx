import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Navigate } from 'react-router-dom';
import { TrendingUp, Users, ShoppingBag, DollarSign, Settings, UserCog, LayoutGrid } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { translations } from '../lib/translations';
import AdminUsers from './AdminUsers';
import AdminSettings from './AdminSettings';

export default function Admin() {
  const { state } = useApp();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'settings'>('dashboard');
  const t = translations[state.settings.language];

  // Protect Route
  if (state.user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  // Calculate Stats from Sessions
  const totalSales = state.sessions.reduce((acc, s) => acc + s.totalCost, 0);
  const totalOrders = state.sessions.reduce((acc, s) => acc + s.orders.length, 0);
  const activeSessionsCount = state.devices.filter(d => d.status === 'active').length;

  const stats = [
    { label: t.totalSales, value: formatCurrency(totalSales), icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
    { label: t.activeSessions, value: activeSessionsCount, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: t.totalOrders, value: totalOrders, icon: ShoppingBag, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20' },
    { label: t.registeredUsers, value: state.users.length, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
  ];

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t.adminDashboard}</h2>
          <p className="text-gray-500 dark:text-gray-400">System overview and management</p>
        </div>
        
        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-all ${activeTab === 'dashboard' ? 'bg-white dark:bg-gray-700 shadow text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`}
          >
            <LayoutGrid size={16} /> {t.dashboard}
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-all ${activeTab === 'users' ? 'bg-white dark:bg-gray-700 shadow text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`}
          >
            <UserCog size={16} /> {t.manageUsers}
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-all ${activeTab === 'settings' ? 'bg-white dark:bg-gray-700 shadow text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`}
          >
            <Settings size={16} /> {t.systemConfig}
          </button>
        </div>
      </header>

      {activeTab === 'dashboard' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, idx) => (
              <div key={idx} className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-4">
                <div className={`p-3 rounded-lg ${stat.bg} ${stat.color}`}>
                  <stat.icon size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Activity Table */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-bold text-gray-900 dark:text-white">{t.recentTransactions}</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                  <tr>
                    <th className="px-6 py-3">Device</th>
                    <th className="px-6 py-3">User</th>
                    <th className="px-6 py-3">Duration</th>
                    <th className="px-6 py-3">Mode</th>
                    <th className="px-6 py-3">Total</th>
                    <th className="px-6 py-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {state.sessions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500">No transactions yet.</td>
                    </tr>
                  ) : (
                    state.sessions.slice(0, 10).map(session => (
                      <tr key={session.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{session.deviceName}</td>
                        <td className="px-6 py-4">{session.userName}</td>
                        <td className="px-6 py-4">{session.durationMinutes}m</td>
                        <td className="px-6 py-4 capitalize">{session.mode}</td>
                        <td className="px-6 py-4 font-bold text-green-600 dark:text-green-400">{formatCurrency(session.totalCost)}</td>
                        <td className="px-6 py-4">{new Date(session.endTime).toLocaleDateString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && <AdminUsers />}
      {activeTab === 'settings' && <AdminSettings />}
    </div>
  );
}
