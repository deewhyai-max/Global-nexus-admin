import React, { useState, useEffect } from 'react';
import { Menu, Zap, Globe, Package, MapPin, DollarSign, Calendar, ArrowLeft, CheckCircle2, Truck } from 'lucide-react';
import { Shipment } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface DashboardProps {
  onMenuClick: () => void;
  onCreateShipment: (shipment: Shipment) => void;
  onUpdateShipment: (id: string, update: { status: string; location: string; time: string }) => void;
  selectedShipment: Shipment | null;
  onClearSelection: () => void;
}

export default function Dashboard({ onMenuClick, onCreateShipment, onUpdateShipment, selectedShipment, onClearSelection }: DashboardProps) {
  const getCurrentDateTimeLocal = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(now.getTime() - offset)).toISOString().slice(0, 16);
    return localISOTime;
  };

  const formatDateTimeDisplay = (dateTimeStr: string) => {
    try {
      const date = new Date(dateTimeStr);
      if (isNaN(date.getTime())) return dateTimeStr;
      return date.toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      }) + ' • ' + date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (e) {
      return dateTimeStr;
    }
  };

  const [formData, setFormData] = useState({
    recipientName: '',
    destinationAddress: '',
    originCityState: '',
    fedExHub: 'Memphis SuperHub (MEM)',
    assetValue: '',
    serviceFee: '',
    estimatedDeliveryDate: '',
    timeOfEntry: getCurrentDateTimeLocal(),
  });

  const [lastCreatedId, setLastCreatedId] = useState<string | null>(null);

  const [updateData, setUpdateData] = useState({
    status: 'Shipping label created',
    location: '',
    eventTime: getCurrentDateTimeLocal(),
  });

  useEffect(() => {
    if (selectedShipment) {
      setUpdateData(prev => ({
        ...prev,
        eventTime: getCurrentDateTimeLocal()
      }));
    }
  }, [selectedShipment]);

  const statusOptions = [
    'Shipping label created',
    'Package received by FedEx',
    'In Transit',
    'On the way',
    'Out for Delivery',
    'Arriving at destination facility',
    'Delivered'
  ];

  const generateTrackingId = () => {
    const segment = () => Math.floor(1000 + Math.random() * 9000).toString();
    return `${segment()} ${segment()} ${segment()}`;
  };

  const handleCreateShipment = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newId = generateTrackingId();
    const newShipment: Shipment = {
      id: newId,
      ...formData,
      status: 'Shipping label created',
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      history: [
        {
          status: 'Shipping label created',
          location: formData.originCityState || 'Origin Address',
          timestamp: formData.timeOfEntry
        }
      ]
    };

    onCreateShipment(newShipment);
    setLastCreatedId(newId);
    
    // Clear form
    setFormData({
      recipientName: '',
      destinationAddress: '',
      originCityState: '',
      fedExHub: 'Memphis SuperHub (MEM)',
      assetValue: '',
      serviceFee: '',
      estimatedDeliveryDate: '',
      timeOfEntry: getCurrentDateTimeLocal(),
    });
  };

  const [showSuccess, setShowSuccess] = useState(false);

  const handleSaveUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedShipment) {
      onUpdateShipment(selectedShipment.id, {
        status: updateData.status,
        location: updateData.location,
        time: updateData.eventTime
      });
      setUpdateData({
        status: updateData.status,
        location: '',
        eventTime: getCurrentDateTimeLocal(),
      });
      
      // Show success feedback
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center px-6 sticky top-0 z-30">
        <button 
          onClick={onMenuClick}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <Menu className="w-6 h-6 text-slate-700" />
        </button>
        
        <div className="flex-1 flex justify-center">
          <div className="flex items-center space-x-2">
            <Globe className="w-5 h-5 text-fedex-purple" />
            <h1 className="text-sm font-black tracking-[0.2em] text-slate-900">
              GLOBAL NEXUS TERMINAL
            </h1>
          </div>
        </div>

        <div className="w-10" />
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-12 flex justify-center items-start">
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait">
            {selectedShipment ? (
              <motion.div 
                key="details"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden"
              >
                <div className="p-8 border-b border-slate-50 bg-fedex-purple/5 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button 
                      onClick={onClearSelection}
                      className="p-2 hover:bg-white rounded-lg transition-colors text-slate-500"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                      <h2 className="text-3xl font-black text-slate-900 tracking-tight">{selectedShipment.id}</h2>
                      <p className="text-xs font-mono text-fedex-purple font-bold tracking-wider uppercase mt-1">Active Tracking Session</p>
                    </div>
                  </div>
                  <div className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-[10px] font-black tracking-widest uppercase">
                    Active
                  </div>
                </div>

                <div className="p-8 space-y-8">
                  <form onSubmit={handleSaveUpdate} className="space-y-6">
                    <div className="grid grid-cols-1 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Update Status</label>
                        <select 
                          value={updateData.status}
                          onChange={(e) => setUpdateData({...updateData, status: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-fedex-purple/20 focus:border-fedex-purple transition-all appearance-none"
                        >
                          {statusOptions.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Current Location</label>
                          <input 
                            required
                            type="text" 
                            value={updateData.location}
                            onChange={(e) => setUpdateData({...updateData, location: e.target.value})}
                            placeholder="e.g. Memphis Hub"
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-fedex-purple/20 focus:border-fedex-purple transition-all"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Event Date & Time</label>
                          <input 
                            required
                            type="datetime-local" 
                            value={updateData.eventTime}
                            onChange={(e) => setUpdateData({...updateData, eventTime: e.target.value})}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-fedex-purple/20 focus:border-fedex-purple transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 items-center">
                      <button 
                        type="submit"
                        className="flex-1 w-full py-4 bg-fedex-purple hover:bg-fedex-purple/90 text-white rounded-xl font-black tracking-widest flex items-center justify-center space-x-3 shadow-lg shadow-fedex-purple/20 transition-all transform active:scale-[0.98]"
                      >
                        <Zap className="w-4 h-4 fill-white" />
                        <span>SAVE UPDATE</span>
                      </button>
                      <button 
                        type="button"
                        onClick={onClearSelection}
                        className="flex-1 w-full py-4 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-black tracking-widest flex items-center justify-center space-x-3 transition-all transform active:scale-[0.98]"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>BACK TO CREATE</span>
                      </button>
                    </div>

                    <AnimatePresence>
                      {showSuccess && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center justify-center space-x-2 text-green-600 font-bold text-sm bg-green-50 py-2 rounded-xl border border-green-100"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Status Updated Successfully</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </form>

                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex justify-between items-center mb-4">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">SHIPMENT HISTORY</p>
                      <p className="text-[10px] font-bold text-fedex-purple uppercase tracking-widest">
                        {(() => {
                          const idx = statusOptions.indexOf(selectedShipment.status);
                          return idx === -1 ? 1 : idx + 1;
                        })()} of 7 SHIPMENT HISTORY
                      </p>
                    </div>
                    <div className="space-y-4">
                      {selectedShipment.history.map((h, i) => (
                        <div key={i} className="flex space-x-4">
                          <div className="flex flex-col items-center">
                            {i === 0 ? (
                              <div className="bg-orange-100 p-1 rounded-lg">
                                <Truck className="w-4 h-4 text-orange-500" />
                              </div>
                            ) : (
                              <div className="w-2 h-2 rounded-full mt-1.5 bg-slate-300" />
                            )}
                            {i !== selectedShipment.history.length - 1 && <div className="w-px flex-1 bg-slate-200 my-1" />}
                          </div>
                          <div className="flex-1 pb-4">
                            <div className="flex justify-between items-start">
                              <p className={`text-xs font-bold ${i === 0 ? 'text-fedex-purple' : 'text-slate-700'}`}>
                                {h.status}
                              </p>
                            </div>
                            <p className="text-[10px] text-slate-900 font-bold mt-0.5">{h.location}</p>
                            <p className="text-[10px] text-slate-400 font-medium">{formatDateTimeDisplay(h.timestamp)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden"
              >
                <div className="p-8 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
                      <Package className="w-6 h-6 text-fedex-purple" />
                      <span>THE FORGE</span>
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">Initialize new global shipment asset</p>
                  </div>
                  {lastCreatedId && (
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Last Created</p>
                      <p className="text-sm font-mono font-black text-fedex-purple">{lastCreatedId}</p>
                    </div>
                  )}
                </div>

                <form onSubmit={handleCreateShipment} className="p-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recipient Full Name</label>
                      <input 
                        required
                        type="text" 
                        value={formData.recipientName}
                        onChange={(e) => setFormData({...formData, recipientName: e.target.value})}
                        placeholder="e.g. Alexander Pierce"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-fedex-purple/20 focus:border-fedex-purple transition-all"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Destination Address</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                          required
                          type="text" 
                          value={formData.destinationAddress}
                          onChange={(e) => setFormData({...formData, destinationAddress: e.target.value})}
                          placeholder="Street, City, Country, Zip"
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-fedex-purple/20 focus:border-fedex-purple transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Origin City/State</label>
                      <input 
                        required
                        type="text" 
                        value={formData.originCityState}
                        onChange={(e) => setFormData({...formData, originCityState: e.target.value})}
                        placeholder="e.g. Memphis, TN"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-fedex-purple/20 focus:border-fedex-purple transition-all"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">FedEx Hub Location</label>
                      <input 
                        required
                        type="text" 
                        value={formData.fedExHub}
                        onChange={(e) => setFormData({...formData, fedExHub: e.target.value})}
                        placeholder="e.g. Memphis Superhub"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-fedex-purple/20 focus:border-fedex-purple transition-all"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Asset Value ($)</label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                          required
                          type="number" 
                          value={formData.assetValue}
                          onChange={(e) => setFormData({...formData, assetValue: e.target.value})}
                          placeholder="0.00"
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-fedex-purple/20 focus:border-fedex-purple transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Service Fee ($)</label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                          required
                          type="number" 
                          value={formData.serviceFee}
                          onChange={(e) => setFormData({...formData, serviceFee: e.target.value})}
                          placeholder="0.00"
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-fedex-purple/20 focus:border-fedex-purple transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Time of Entry</label>
                      <input 
                        required
                        type="datetime-local" 
                        value={formData.timeOfEntry}
                        onChange={(e) => setFormData({...formData, timeOfEntry: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-fedex-purple/20 focus:border-fedex-purple transition-all"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Estimated Delivery Date</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                          required
                          type="date" 
                          value={formData.estimatedDeliveryDate}
                          onChange={(e) => setFormData({...formData, estimatedDeliveryDate: e.target.value})}
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-fedex-purple/20 focus:border-fedex-purple transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-6">
                    <button 
                      type="submit"
                      className="w-full py-5 bg-fedex-purple hover:bg-fedex-purple/90 text-white rounded-2xl font-black tracking-widest flex items-center justify-center space-x-3 shadow-xl shadow-fedex-purple/20 transition-all transform active:scale-[0.98]"
                    >
                      <Zap className="w-5 h-5 fill-white" />
                      <span>CREATE NEW SHIPMENT</span>
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
          
          <p className="text-center text-[10px] text-slate-400 mt-8 font-bold tracking-[0.3em] uppercase">
            Secure Terminal Connection • Encrypted Session
          </p>
        </div>
      </main>
    </div>
  );
}
