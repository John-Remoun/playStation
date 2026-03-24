import React from 'react';
import { useApp } from '../context/AppContext';
import { Globe } from 'lucide-react';
import { translations } from '../lib/translations';

export default function Settings() {
  const { state, dispatch } = useApp();
  const t = translations[state.settings.language];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <header>
        <h2 className="text-2xl font-bold text-gray-900">{t.settings}</h2>
        <p className="text-gray-500">Customize your application experience</p>
      </header>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm divide-y divide-gray-100">
        
        {/* Language */}
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
              <Globe size={24} />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">{t.language}</h3>
              <p className="text-sm text-gray-500">Select your preferred language</p>
            </div>
          </div>
          <select 
            value={state.settings.language}
            onChange={(e) => dispatch({ type: 'UPDATE_SETTINGS', payload: { language: e.target.value as 'en' | 'ar' } })}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5"
          >
            <option value="en">English</option>
            <option value="ar">العربية (Arabic)</option>
          </select>
        </div>

      </div>
    </div>
  );
}
