import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Gamepad2, User, Lock, Shield } from 'lucide-react';
import { translations } from '../lib/translations';

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const t = translations[state.settings.language];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Admin Login
    if (username === 'admin' && password === 'admin123') {
      const adminUser = state.users.find(u => u.username === 'admin');
      dispatch({
        type: 'LOGIN',
        payload: adminUser || { id: 'admin-1', username: 'admin', role: 'admin', createdAt: Date.now() },
      });
      navigate('/');
      return;
    }

    if (isSignUp) {
      // Check if user exists
      if (state.users.some(u => u.username === username)) {
        setError('Username already taken');
        return;
      }
      const newUser = { id: Date.now().toString(), username, role: 'user' as const, password, createdAt: Date.now() };
      dispatch({ type: 'REGISTER_USER', payload: newUser });
      dispatch({ type: 'LOGIN', payload: newUser });
      navigate('/');
    } else {
      // Login Check
      const user = state.users.find(u => u.username === username && u.password === password);
      if (user) {
        dispatch({ type: 'LOGIN', payload: user });
        navigate('/');
      } else {
        // Fallback for demo simplicity if user not in list (e.g. initial state)
        if (password.length > 3) {
             const tempUser = { id: 'temp-'+Date.now(), username, role: 'user' as const, createdAt: Date.now() };
             dispatch({ type: 'LOGIN', payload: tempUser });
             navigate('/');
        } else {
            setError('Invalid credentials');
        }
      }
    }
  };

  return (
    // Updated: Changed background to black for pitch black theme
    <div className="min-h-screen bg-gray-900 dark:bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-32 left-20 w-96 h-96 bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-8 rounded-2xl w-full max-w-md shadow-2xl z-10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg transform rotate-3">
            <Gamepad2 className="text-white w-8 h-8" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">GameZone</h2>
          <p className="text-gray-300">PlayStation Cafe Manager</p>
        </div>

        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setIsSignUp(false)}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
              !isSignUp ? 'bg-white text-gray-900 shadow' : 'text-gray-400 hover:text-white'
            }`}
          >
            {t.existingUser}
          </button>
          <button
            onClick={() => setIsSignUp(true)}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
              isSignUp ? 'bg-white text-gray-900 shadow' : 'text-gray-400 hover:text-white'
            }`}
          >
            {t.signUp}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">{t.username}</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 rtl:right-3 rtl:left-auto" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-gray-800/50 border border-gray-600 text-white rounded-lg pl-10 pr-4 rtl:pr-10 rtl:pl-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder-gray-500"
                placeholder="Enter username"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">{t.password}</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 rtl:right-3 rtl:left-auto" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-800/50 border border-gray-600 text-white rounded-lg pl-10 pr-4 rtl:pr-10 rtl:pl-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder-gray-500"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition-all shadow-lg hover:shadow-indigo-500/25 flex items-center justify-center gap-2"
          >
            {isSignUp ? t.createAccount : t.login}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-700 text-center">
          <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
            <Shield size={12} />
            {t.adminAccess}: user "-", pass "-"
          </p>
        </div>
      </div>
    </div>
  );
}
