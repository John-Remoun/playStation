import React from 'react';
import { useApp } from '../context/AppContext';
import DeviceCard from '../components/DeviceCard';
import { translations } from '../lib/translations';

export default function Dashboard() {
  const { state } = useApp();
  const t = translations[state.settings.language];

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t.dashboard}</h2>
        <p className="text-gray-500 dark:text-gray-400">{t.activeSessions}</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {state.devices.map(device => (
          <DeviceCard key={device.id} device={device} />
        ))}
      </div>
    </div>
  );
}
