import React from 'react';
import { motion } from 'motion/react';
import { Search, Package, X, LogOut } from 'lucide-react';
import { Shipment } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  shipments: Shipment[];
  onSelectShipment: (shipment: Shipment) => void;
  onLogout: () => void;
}

export default function Sidebar({ isOpen, onClose, shipments, onSelectShipment, onLogout }: SidebarProps) {
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <motion.aside
        initial={{ x: '-100%' }}
        animate={{ x: isOpen ? 0 : '-100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed top-0 left-0 h-full w-80 bg-white shadow-2xl z-50 flex flex-col border-r border-slate-100"
      >
        <div className="p-6 flex items-center justify-between border-b border-slate-50">
          <h2 className="font-bold text-slate-900 tracking-tight uppercase">SHIPMENT HISTORY</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg lg:hidden">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Find Tracking ID..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-fedex-purple/20 focus:border-fedex-purple transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {shipments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-slate-400 space-y-2">
              <Package className="w-8 h-8 opacity-20" />
              <p className="text-xs font-medium">No shipments found</p>
            </div>
          ) : (
            shipments.map((item) => (
              <div 
                key={item.id}
                onClick={() => {
                  onSelectShipment(item);
                  onClose();
                }}
                className="p-4 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all cursor-pointer group"
              >
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-white transition-colors">
                    <Package className="w-5 h-5 text-fedex-purple" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-mono font-medium text-slate-900 truncate">{item.id}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      <p className="text-xs text-slate-500 font-medium truncate">
                        {item.status} {item.history[0]?.timestamp && (
                          <span className="text-slate-400 font-normal ml-1">
                            - {(() => {
                              try {
                                const date = new Date(item.history[0].timestamp);
                                if (isNaN(date.getTime())) return item.history[0].timestamp;
                                return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
                              } catch (e) {
                                return item.history[0].timestamp;
                              }
                            })()}
                          </span>
                        )}
                      </p>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">{item.createdAt}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-slate-50 space-y-4">
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-red-500 hover:bg-red-50 transition-colors font-bold text-sm"
          >
            <LogOut className="w-4 h-4" />
            <span>LOG OUT</span>
          </button>
          <p className="text-center text-[10px] font-bold text-slate-400 tracking-widest uppercase">
            Global Nexus v1.0.4
          </p>
        </div>
      </motion.aside>
    </>
  );
}
