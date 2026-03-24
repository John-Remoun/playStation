import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { LayoutDashboard, Coffee, Settings, LogOut, ShieldCheck, User as UserIcon } from 'lucide-react';
import { cn } from '../lib/utils';
import { translations } from '../lib/translations';

export default function Layout() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const t = translations[state.settings.language];

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
    navigate('/login');
  };

  if (!state.user) return null;

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: t.dashboard },
    { to: '/menu', icon: Coffee, label: t.menu },
    { to: '/settings', icon: Settings, label: t.settings },
  ];

  if (state.user.role === 'admin') {
    navItems.push({ to: '/admin', icon: ShieldCheck, label: t.adminPanel });
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col md:flex-row transition-colors duration-200">
      {/* Sidebar / Navbar */}
      <aside className="w-full md:w-64 bg-white border-b md:border-r md:border-b-0 border-gray-200 flex-shrink-0 transition-colors duration-200">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-500/30">
            {state.settings.siteName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight text-gray-900">{state.settings.siteName}</h1>
            <p className="text-xs text-gray-500">Manager Pro</p>
          </div>
        </div>

        <nav className="px-4 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm font-medium",
                  isActive
                    ? "bg-indigo-50 text-indigo-600 shadow-sm border-l-4 border-indigo-600"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )
              }
            >
              <item.icon size={20} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 mt-auto border-t border-gray-200">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700">
              <UserIcon size={16} />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate text-gray-900">{state.user.username}</p>
              <p className="text-xs text-gray-500 capitalize">{state.user.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut size={16} />
            {t.signOut}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-4 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}
