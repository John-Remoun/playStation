import React, { useState, useEffect } from 'react';
import { Device, MenuItem, SessionLog } from '../types';
import { useApp } from '../context/AppContext';
import { Play, Square, User, Users, Plus, Settings2, Printer, CheckCircle, X } from 'lucide-react';
import { formatCurrency, cn, generateId } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import { translations } from '../lib/translations';

interface DeviceCardProps {
  device: Device;
}

export default function DeviceCard({ device }: DeviceCardProps) {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const [elapsed, setElapsed] = useState(0);
  const [selectedMode, setSelectedMode] = useState<'single' | 'multi'>(device.mode);
  const [selectedDuration, setSelectedDuration] = useState<number | 'open'>('open');
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [showOrderModal, setShowOrderModal] = useState(false);
  
  // Invoice State
  const [showInvoice, setShowInvoice] = useState(false);
  const [invoiceData, setInvoiceData] = useState<SessionLog | null>(null);
  
  const t = translations[state.settings.language];

  // Timer Logic
  useEffect(() => {
    let interval: any;
    if (device.status === 'active' && device.startTime) {
      interval = setInterval(() => {
        const now = Date.now();
        const diff = now - device.startTime!;
        setElapsed(diff);
      }, 1000);
    } else {
      setElapsed(0);
    }
    return () => clearInterval(interval);
  }, [device.status, device.startTime]);

  const hours = Math.floor(elapsed / (1000 * 60 * 60));
  const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((elapsed % (1000 * 60)) / 1000);

  // Calculate Costs
  const rate = device.mode === 'single' ? device.hourlyRateSingle : device.hourlyRateMulti;
  const timeCost = (elapsed / (1000 * 60 * 60)) * rate;
  const ordersCost = device.orders.reduce((acc, order) => acc + (order.price * order.quantity), 0);
  const totalCost = timeCost + ordersCost;

  const handleStart = () => {
    dispatch({
      type: 'START_DEVICE',
      payload: { 
        deviceId: device.id, 
        mode: selectedMode, 
        duration: selectedDuration,
        userId: selectedUser || undefined 
      },
    });
  };

  const handleStopClick = () => {
    // Generate snapshot for invoice
    const log: SessionLog = {
      id: generateId(),
      deviceId: device.id,
      deviceName: device.name,
      userId: device.currentUserId,
      userName: state.users.find(u => u.id === device.currentUserId)?.username || 'Guest',
      startTime: device.startTime!,
      endTime: Date.now(),
      durationMinutes: Math.floor(elapsed / 60000),
      mode: device.mode,
      timeCost,
      ordersCost,
      totalCost,
      orders: device.orders
    };
    setInvoiceData(log);
    setShowInvoice(true);
  };

  const confirmPayment = () => {
    if (invoiceData) {
      dispatch({ type: 'STOP_DEVICE', payload: { deviceId: device.id, log: invoiceData } });
      setShowInvoice(false);
      setInvoiceData(null);
      dispatch({ 
        type: 'ADD_TOAST', 
        payload: { id: generateId(), message: 'Session closed and payment recorded.', type: 'success' } 
      });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleAddOrder = (item: MenuItem) => {
    dispatch({
      type: 'ADD_ORDER',
      payload: { deviceId: device.id, item, quantity: 1 },
    });
    setShowOrderModal(false);
    dispatch({ 
        type: 'ADD_TOAST', 
        payload: { id: generateId(), message: `${item.name} added to ${device.name}`, type: 'success' } 
    });
  };

  const currentUser = state.users.find(u => u.id === device.currentUserId);

  return (
    <>
      <div className={cn(
        "rounded-xl border shadow-sm transition-all overflow-hidden flex flex-col",
        device.status === 'active' 
          ? "bg-white border-indigo-500 ring-1 ring-indigo-500" 
          : "bg-white border-gray-200"
      )}>
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex justify-between items-start bg-gray-50/50">
          <div>
            <h3 className="font-bold text-lg text-gray-900">{device.name}</h3>
            <span className="text-xs font-medium px-2 py-0.5 rounded bg-gray-200 text-gray-600">
              {device.type}
            </span>
          </div>
          <button 
            onClick={() => navigate(`/device/${device.id}`)}
            className="p-2 hover:bg-gray-200 rounded-lg text-gray-500 transition-colors"
          >
            <Settings2 size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 flex-1 flex flex-col gap-4">
          {/* Timer Display */}
          <div className="text-center py-2">
            <div className={cn(
              "text-4xl font-mono font-bold tracking-wider",
              device.status === 'active' ? "text-indigo-600" : "text-gray-400"
            )}>
              {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {device.status === 'active' ? t.sessionInProgress : t.readyToStart}
            </p>
          </div>

          {/* Controls (Only if idle) */}
          {device.status === 'idle' && (
            <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
              <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-lg">
                <button
                  onClick={() => setSelectedMode('single')}
                  className={cn(
                    "flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all",
                    selectedMode === 'single' ? "bg-white shadow text-indigo-600" : "text-gray-500 hover:text-gray-700"
                  )}
                >
                  <User size={16} /> {t.single}
                </button>
                <button
                  onClick={() => setSelectedMode('multi')}
                  className={cn(
                    "flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all",
                    selectedMode === 'multi' ? "bg-white shadow text-indigo-600" : "text-gray-500 hover:text-gray-700"
                  )}
                >
                  <Users size={16} /> {t.multi}
                </button>
              </div>
              
              <div className="flex items-center justify-between text-sm px-1">
                <span className="text-gray-500">{t.duration}:</span>
                <select 
                  className="bg-transparent border-none text-right font-medium text-gray-900 focus:ring-0 cursor-pointer"
                  value={selectedDuration}
                  onChange={(e) => setSelectedDuration(e.target.value === 'open' ? 'open' : Number(e.target.value))}
                >
                  <option value="open">{t.openTime}</option>
                  <option value="1">1 {t.hour}</option>
                  <option value="2">2 {t.hours}</option>
                </select>
              </div>

              <div className="flex items-center justify-between text-sm px-1">
                <span className="text-gray-500">User:</span>
                <select 
                  className="bg-transparent border-none text-right font-medium text-gray-900 focus:ring-0 cursor-pointer max-w-[120px]"
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                >
                  <option value="">Guest</option>
                  {state.users.map(u => (
                    <option key={u.id} value={u.id}>{u.username}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Active Session Info */}
          {device.status === 'active' && (
            <div className="space-y-3">
              <div className="flex flex-col gap-1 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-indigo-900 font-medium flex items-center gap-2">
                    {device.mode === 'single' ? <User size={14} /> : <Users size={14} />}
                    {device.mode === 'single' ? t.single : t.multi}
                  </span>
                  <span className="text-indigo-700 font-bold">
                    {formatCurrency(rate)}/hr
                  </span>
                </div>
                {currentUser && (
                  <div className="text-xs text-indigo-500 flex items-center gap-1 mt-1">
                    <UserIcon size={12} /> {currentUser.username}
                  </div>
                )}
              </div>

              {/* Orders Preview */}
              {device.orders.length > 0 && (
                <div className="text-sm space-y-1 border-t border-gray-100 pt-2">
                  <p className="text-xs text-gray-500 font-medium mb-1">{t.orders}</p>
                  {device.orders.map(order => (
                    <div key={order.id} className="flex justify-between text-gray-600">
                      <span>{order.quantity}x {order.name}</span>
                      <span>{formatCurrency(order.price * order.quantity)}</span>
                    </div>
                  ))}
                </div>
              )}
              
              <button
                onClick={() => setShowOrderModal(true)}
                className="w-full py-2 border border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50 transition-all flex items-center justify-center gap-2"
              >
                <Plus size={16} /> {t.addOrder}
              </button>
            </div>
          )}
        </div>

        {/* Footer / Actions */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 mt-auto">
          <div className="flex justify-between items-end mb-4">
            <span className="text-sm text-gray-500">{t.totalDue}</span>
            <span className="text-2xl font-bold text-gray-900">{formatCurrency(totalCost)}</span>
          </div>

          {device.status === 'idle' ? (
            <button
              onClick={handleStart}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow-lg shadow-indigo-500/30 transition-all flex items-center justify-center gap-2"
            >
              <Play size={18} fill="currentColor" /> {t.startSession}
            </button>
          ) : (
            <button
              onClick={handleStopClick}
              className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold shadow-lg shadow-red-500/30 transition-all flex items-center justify-center gap-2"
            >
              <Square size={18} fill="currentColor" /> {t.stopCheckout}
            </button>
          )}
        </div>

        {/* Quick Order Modal */}
        {showOrderModal && (
          <div className="absolute inset-0 z-40 bg-white p-4 animate-in fade-in zoom-in-95 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-bold text-lg text-gray-900">{t.addOrder}</h4>
              <button onClick={() => setShowOrderModal(false)} className="text-gray-500 hover:text-gray-700">{t.cancel}</button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2">
              {state.menu.map(item => (
                <button
                  key={item.id}
                  onClick={() => handleAddOrder(item)}
                  className="w-full flex justify-between items-center p-3 rounded-lg border border-gray-200 hover:bg-indigo-50 hover:border-indigo-200 transition-all text-left"
                >
                  <span className="text-gray-900">{item.name}</span>
                  <span className="font-medium text-indigo-600">{formatCurrency(item.price)}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Invoice Modal */}
      {showInvoice && invoiceData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div 
            id="invoice-modal"
            className="bg-white w-full max-w-sm rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-8"
          >
            {/* Invoice Header */}
            <div className="p-6 text-center border-b border-gray-200 bg-gray-50">
              <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold text-xl">
                {state.settings.siteName.charAt(0).toUpperCase()}
              </div>
              <h2 className="text-xl font-bold text-gray-900 uppercase tracking-wider">{state.settings.siteName}</h2>
              <p className="text-xs text-gray-500">Receipt / فاتورة</p>
              <p className="text-xs text-gray-400 mt-1">{new Date().toLocaleString()}</p>
            </div>

            {/* Invoice Details */}
            <div className="p-6 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Device</span>
                <span className="font-bold text-gray-900">{invoiceData.deviceName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Customer</span>
                <span className="font-medium text-gray-900">{invoiceData.userName}</span>
              </div>
              
              <div className="border-t border-dashed border-gray-300 my-4"></div>

              {/* Time Charge */}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Play Time ({invoiceData.durationMinutes}m)</span>
                <span className="font-medium text-gray-900">{formatCurrency(invoiceData.timeCost)}</span>
              </div>

              {/* Orders List */}
              {invoiceData.orders.length > 0 && (
                <div className="space-y-1 mt-2">
                  {invoiceData.orders.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm text-gray-600">
                      <span>{item.quantity}x {item.name}</span>
                      <span>{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="border-t border-gray-800 my-4"></div>

              {/* Total */}
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-gray-900">TOTAL</span>
                <span className="text-2xl font-bold text-black">{formatCurrency(invoiceData.totalCost)}</span>
              </div>
            </div>

            {/* Actions (Hidden when printing) */}
            <div className="p-4 bg-gray-50 grid grid-cols-2 gap-3 no-print">
              <button 
                onClick={handlePrint}
                className="flex items-center justify-center gap-2 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 font-medium hover:bg-gray-100 transition-colors"
              >
                <Printer size={18} /> Print
              </button>
              <button 
                onClick={confirmPayment}
                className="flex items-center justify-center gap-2 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold shadow-lg shadow-green-500/30 transition-colors"
              >
                <CheckCircle size={18} /> Pay & Close
              </button>
            </div>
            
            {/* Close without paying (Cancel) */}
            <button 
              onClick={() => { setShowInvoice(false); setInvoiceData(null); }}
              className="absolute top-2 right-2 p-2 text-gray-400 hover:text-gray-600 no-print"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
