import React from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../lib/utils';
import { Clock, DollarSign, ShoppingBag, User } from 'lucide-react';

export default function AdminUsers() {
  const { state } = useApp();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h3 className="font-bold text-gray-900 text-lg">Shift Report & User Performance</h3>
          <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            Total Users: {state.users.length}
          </span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Last Login</th>
                <th className="px-6 py-4">Total Sessions</th>
                <th className="px-6 py-4">Total Playtime</th>
                <th className="px-6 py-4 text-right">Total Sales</th>
              </tr>
            </thead>
            <tbody>
              {state.users.map(user => {
                const userSessions = state.sessions.filter(s => s.userId === user.id);
                const totalSales = userSessions.reduce((acc, s) => acc + s.totalCost, 0);
                const totalTime = userSessions.reduce((acc, s) => acc + s.durationMinutes, 0);
                
                return (
                  <tr key={user.id} className="bg-white border-b hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{user.username}</div>
                          <div className="text-xs text-gray-400 capitalize">{user.role}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {user.lastLogin 
                        ? new Date(user.lastLogin).toLocaleString() 
                        : <span className="text-gray-400 italic">Never</span>}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {userSessions.length} sessions
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-gray-600">
                        <Clock size={14} />
                        {Math.floor(totalTime / 60)}h {totalTime % 60}m
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-bold text-green-600 text-base">
                        {formatCurrency(totalSales)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
