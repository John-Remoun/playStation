import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Trash2, Coffee, Utensils, MonitorPlay } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { MenuItem } from '../types';
import { translations } from '../lib/translations';

export default function Menu() {
  const { state, dispatch } = useApp();
  const [newItem, setNewItem] = useState<Partial<MenuItem>>({ category: 'drink' });
  const [selectedItemForOrder, setSelectedItemForOrder] = useState<MenuItem | null>(null);
  const t = translations[state.settings.language];

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItem.name && newItem.price) {
      dispatch({
        type: 'ADD_MENU_ITEM',
        payload: {
          id: Math.random().toString(36).substr(2, 9),
          name: newItem.name,
          price: Number(newItem.price),
          category: newItem.category as 'drink' | 'food',
        },
      });
      setNewItem({ category: 'drink', name: '', price: 0 });
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      dispatch({ type: 'DELETE_MENU_ITEM', payload: id });
    }
  };

  const handleAddToDevice = (deviceId: string) => {
    if (selectedItemForOrder) {
      dispatch({
        type: 'ADD_ORDER',
        payload: { deviceId, item: selectedItemForOrder, quantity: 1 }
      });
      setSelectedItemForOrder(null);
      alert(t.itemAdded);
    }
  };

  const activeDevices = state.devices.filter(d => d.status === 'active');

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t.menu}</h2>
          <p className="text-gray-500 dark:text-gray-400">Manage items and orders</p>
        </div>
      </header>

      {/* Add New Item Form - Only for Admin */}
      {state.user?.role === 'admin' && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">Add New Item</h3>
          <form onSubmit={handleAdd} className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Item Name</label>
              <input
                type="text"
                required
                value={newItem.name || ''}
                onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                placeholder="e.g., Cola"
              />
            </div>
            <div className="w-full md:w-32">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price ($)</label>
              <input
                type="number"
                step="0.5"
                required
                value={newItem.price || ''}
                onChange={e => setNewItem({ ...newItem, price: parseFloat(e.target.value) })}
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                placeholder="0.00"
              />
            </div>
            <div className="w-full md:w-40">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
              <select
                value={newItem.category}
                onChange={e => setNewItem({ ...newItem, category: e.target.value as any })}
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
              >
                <option value="drink">Drink</option>
                <option value="food">Food</option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Plus size={18} /> Add
            </button>
          </form>
        </div>
      )}

      {/* Menu List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {['drink', 'food'].map(category => (
          <div key={category} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className={`p-4 ${category === 'drink' ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-100 dark:border-indigo-900/30' : 'bg-orange-50 dark:bg-orange-900/20 border-orange-100 dark:border-orange-900/30'} border-b flex items-center gap-2`}>
              {category === 'drink' ? <Coffee className="text-indigo-600 dark:text-indigo-400" size={20} /> : <Utensils className="text-orange-600 dark:text-orange-400" size={20} />}
              <h3 className="font-bold capitalize text-gray-900 dark:text-white">{category}s</h3>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {state.menu.filter(i => i.category === category).map(item => (
                <div key={item.id} className="p-4 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                    <p className="text-sm text-gray-500">{formatCurrency(item.price)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setSelectedItemForOrder(item)}
                      className="px-3 py-1.5 text-xs font-medium bg-gray-100 dark:bg-gray-700 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                    >
                      {t.addToDevice}
                    </button>
                    {state.user?.role === 'admin' && (
                      <button onClick={() => handleDelete(item.id)} className="text-red-400 hover:text-red-600 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Select Device Modal */}
      {selectedItemForOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-gray-100 dark:border-gray-700">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">{t.selectDevice}</h3>
              <p className="text-sm text-gray-500">Adding: {selectedItemForOrder.name}</p>
            </div>
            <div className="p-4 space-y-2 max-h-[60vh] overflow-y-auto">
              {activeDevices.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MonitorPlay className="mx-auto mb-2 opacity-50" size={32} />
                  <p>{t.noActiveDevices}</p>
                </div>
              ) : (
                activeDevices.map(device => (
                  <button
                    key={device.id}
                    onClick={() => handleAddToDevice(device.id)}
                    className="w-full flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                        <MonitorPlay size={20} />
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-gray-900 dark:text-white">{device.name}</p>
                        <p className="text-xs text-gray-500">{device.type} • {device.mode}</p>
                      </div>
                    </div>
                    <Plus className="text-gray-400 group-hover:text-indigo-600" />
                  </button>
                ))
              )}
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700 flex justify-end">
              <button 
                onClick={() => setSelectedItemForOrder(null)}
                className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                {t.cancel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
