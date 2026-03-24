import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Save, ArrowLeft } from 'lucide-react';

export default function DeviceSettings() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const device = state.devices.find(d => d.id === id);

  const [name, setName] = useState(device?.name || '');
  const [notes, setNotes] = useState(device?.notes || '');

  if (!device) return <div>Device not found</div>;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch({
      type: 'UPDATE_DEVICE_SETTINGS',
      payload: { deviceId: device.id, name, notes },
    });
    navigate('/');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <button 
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
      >
        <ArrowLeft size={18} /> Back to Dashboard
      </button>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Device Settings: {device.name}</h2>
        </div>
        
        <form onSubmit={handleSave} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Device Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Special Notes / Requests</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white resize-none"
              placeholder="e.g. Defective controller, Reserved for VIP..."
            />
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
             <h3 className="text-sm font-medium text-gray-500 mb-4">Current Stats</h3>
             <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <p className="text-xs text-gray-500">Hourly Rate (Single)</p>
                    <p className="font-mono font-medium dark:text-white">${device.hourlyRateSingle}/hr</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <p className="text-xs text-gray-500">Hourly Rate (Multi)</p>
                    <p className="font-mono font-medium dark:text-white">${device.hourlyRateMulti}/hr</p>
                </div>
             </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-lg shadow-indigo-500/20"
            >
              <Save size={18} /> Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
