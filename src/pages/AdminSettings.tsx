import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Trash2, Edit2, Save, X, Monitor, Type } from 'lucide-react';
import { translations } from '../lib/translations';
import { generateId } from '../lib/utils';
import { Device } from '../types';

export default function AdminSettings() {
  const { state, dispatch } = useApp();
  const t = translations[state.settings.language];
  const [isAddingDevice, setIsAddingDevice] = useState(false);
  const [siteNameInput, setSiteNameInput] = useState(state.settings.siteName);
  
  const [newDevice, setNewDevice] = useState<Partial<Device>>({
    name: '',
    type: 'PS5',
    hourlyRateSingle: 5,
    hourlyRateMulti: 8,
  });

  const handleSaveSiteName = () => {
    if (siteNameInput.trim()) {
      dispatch({ type: 'UPDATE_SETTINGS', payload: { siteName: siteNameInput } });
      dispatch({ 
        type: 'ADD_TOAST', 
        payload: { id: generateId(), message: 'Site name updated successfully!', type: 'success' } 
      });
    }
  };

  const handleAddDevice = () => {
    // Validation
    if (!newDevice.name) {
      dispatch({ 
        type: 'ADD_TOAST', 
        payload: { id: generateId(), message: 'Device name is required.', type: 'error' } 
      });
      return;
    }

    try {
      const device: Device = {
        id: generateId(),
        name: newDevice.name,
        type: newDevice.type as any,
        status: 'idle',
        mode: 'single',
        startTime: null,
        endTime: null,
        selectedDuration: 'open',
        orders: [],
        hourlyRateSingle: Number(newDevice.hourlyRateSingle) || 0,
        hourlyRateMulti: Number(newDevice.hourlyRateMulti) || 0,
        notes: '',
      };

      // Dispatch action to update state immediately
      dispatch({ type: 'ADD_DEVICE', payload: device });
      
      // Reset form and show success toast
      setIsAddingDevice(false);
      setNewDevice({ name: '', type: 'PS5', hourlyRateSingle: 5, hourlyRateMulti: 8 });
      
      dispatch({ 
        type: 'ADD_TOAST', 
        payload: { id: generateId(), message: `Device "${device.name}" added successfully!`, type: 'success' } 
      });

    } catch (error) {
      dispatch({ 
        type: 'ADD_TOAST', 
        payload: { id: generateId(), message: 'Failed to add device.', type: 'error' } 
      });
    }
  };

  const handleDeleteDevice = (id: string) => {
    if (confirm('Delete this device permanently?')) {
      dispatch({ type: 'DELETE_DEVICE', payload: id });
      dispatch({ 
        type: 'ADD_TOAST', 
        payload: { id: generateId(), message: 'Device deleted.', type: 'info' } 
      });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
      
      {/* General Settings Section */}
      <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
         <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
            <Type size={20} /> General Settings
         </h3>
         <div className="flex items-end gap-4 max-w-md">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Site Name</label>
              <input 
                type="text"
                value={siteNameInput}
                onChange={(e) => setSiteNameInput(e.target.value)}
                className="w-full rounded-lg border-gray-300 bg-gray-50 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button 
              onClick={handleSaveSiteName}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              Save
            </button>
         </div>
         <p className="text-xs text-gray-500 mt-2">This name will appear on the dashboard and printed invoices.</p>
      </section>

      {/* Device Management Section */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Monitor size={20} /> Device Management
          </h3>
          <button 
            onClick={() => setIsAddingDevice(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <Plus size={16} /> {t.addDevice}
          </button>
        </div>

        {isAddingDevice && (
          <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100 mb-6 animate-in fade-in slide-in-from-top-2">
            <h4 className="font-bold text-indigo-900 mb-4">New Device Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">{t.deviceName}</label>
                <input 
                  type="text" 
                  value={newDevice.name}
                  onChange={e => setNewDevice({...newDevice, name: e.target.value})}
                  className="w-full rounded-lg border-gray-300 bg-white px-3 py-2 text-sm"
                  placeholder="e.g. Station 5"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">{t.deviceType}</label>
                <select 
                  value={newDevice.type}
                  onChange={e => setNewDevice({...newDevice, type: e.target.value as any})}
                  className="w-full rounded-lg border-gray-300 bg-white px-3 py-2 text-sm"
                >
                  <option value="PS5">PS5</option>
                  <option value="PS4">PS4</option>
                  <option value="PS3">PS3</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">{t.rateSingle}</label>
                <input 
                  type="number" 
                  value={newDevice.hourlyRateSingle}
                  onChange={e => setNewDevice({...newDevice, hourlyRateSingle: Number(e.target.value)})}
                  className="w-full rounded-lg border-gray-300 bg-white px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">{t.rateMulti}</label>
                <input 
                  type="number" 
                  value={newDevice.hourlyRateMulti}
                  onChange={e => setNewDevice({...newDevice, hourlyRateMulti: Number(e.target.value)})}
                  className="w-full rounded-lg border-gray-300 bg-white px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setIsAddingDevice(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-200 rounded-lg">{t.cancel}</button>
              <button onClick={handleAddDevice} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">{t.confirm}</button>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-6 py-3">{t.deviceName}</th>
                <th className="px-6 py-3">{t.deviceType}</th>
                <th className="px-6 py-3">{t.rateSingle}</th>
                <th className="px-6 py-3">{t.rateMulti}</th>
                <th className="px-6 py-3 text-right">{t.actions}</th>
              </tr>
            </thead>
            <tbody>
              {state.devices.map(device => (
                <tr key={device.id} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{device.name}</td>
                  <td className="px-6 py-4">{device.type}</td>
                  <td className="px-6 py-4">${device.hourlyRateSingle}</td>
                  <td className="px-6 py-4">${device.hourlyRateMulti}</td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleDeleteDevice(device.id)}
                      className="text-red-500 hover:text-red-700 p-2"
                      disabled={device.status === 'active'}
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
