import React, { useState, useEffect } from 'react';
import PinOverlay from './components/PinOverlay';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import { AnimatePresence } from 'motion/react';
import { Shipment } from './types';
import { supabase } from './lib/supabase';

export default function App() {
  const [isUnlocked, setIsUnlocked] = useState(() => {
    return localStorage.getItem('nexus_terminal_unlocked') === 'true';
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchShipments = async () => {
    try {
      const { data, error } = await supabase
        .from('shipments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const mappedShipments: Shipment[] = data.map(item => ({
          id: item.tracking_id,
          recipientName: item.recipient_name,
          destinationAddress: item.recipient_address,
          originCityState: item.origin_address,
          fedExHub: item.fedex_hub,
          assetValue: item.asset_value?.toString() || '',
          serviceFee: item.service_fee?.toString() || '',
          estimatedDeliveryDate: item.delivery_date || '',
          status: item.current_status,
          createdAt: new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
          history: item.status_history || []
        }));
        setShipments(mappedShipments);
      }
    } catch (error) {
      console.error('Error fetching shipments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isUnlocked) {
      fetchShipments();
    }
  }, [isUnlocked]);

  const handleUnlock = () => {
    setIsUnlocked(true);
    localStorage.setItem('nexus_terminal_unlocked', 'true');
  };

  const handleCreateShipment = async (newShipment: Shipment) => {
    // Step 1: Instant Update (Optimistic UI)
    setShipments(prev => [newShipment, ...prev]);
    
    // Step 2: Background Save
    try {
      const { error } = await supabase
        .from('shipments')
        .insert([{
          tracking_id: newShipment.id,
          recipient_name: newShipment.recipientName,
          recipient_address: newShipment.destinationAddress,
          origin_address: newShipment.originCityState,
          fedex_hub: newShipment.fedExHub,
          asset_value: parseFloat(newShipment.assetValue) || 0,
          service_fee: parseFloat(newShipment.serviceFee) || 0,
          delivery_date: newShipment.estimatedDeliveryDate,
          current_status: newShipment.status,
          status_history: newShipment.history
        }]);

      if (error) {
        console.error('Background save failed:', error);
      } else {
        fetchShipments();
      }
    } catch (error) {
      console.error('Error in background shipment creation:', error);
    }
  };

  const handleUpdateShipment = async (shipmentId: string, update: { status: string; location: string; time: string }) => {
    const targetShipment = shipments.find(s => s.id === shipmentId);
    if (!targetShipment) return;

    const newUpdate = {
      status: update.status,
      location: update.location,
      timestamp: update.time
    };

    const updatedHistory = [newUpdate, ...targetShipment.history];

    // Optimistic UI update
    const updatedShipment = {
      ...targetShipment,
      status: update.status,
      history: updatedHistory
    };
    
    setShipments(prev => prev.map(s => s.id === shipmentId ? updatedShipment : s));
    if (selectedShipment?.id === shipmentId) {
      setSelectedShipment(updatedShipment);
    }

    try {
      const { error } = await supabase
        .from('shipments')
        .update({
          current_status: update.status,
          status_history: updatedHistory
        })
        .eq('tracking_id', shipmentId);

      if (error) throw error;
      fetchShipments();
    } catch (error) {
      console.error('Error updating shipment in Supabase:', error);
    }
  };

  const handleLogout = () => {
    setIsUnlocked(false);
    localStorage.removeItem('nexus_terminal_unlocked');
    setIsSidebarOpen(false);
    setSelectedShipment(null);
  };

  const verifyPin = async (enteredPin: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'terminal_pin')
        .single();

      if (error) throw error;
      // Accept the new PIN 7458 immediately, or the value from database
      return data?.value === enteredPin || enteredPin === "7458";
    } catch (error) {
      console.error('Error verifying PIN:', error);
      // Fallback to the new PIN 7458
      return enteredPin === "7458";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-fedex-purple/10 selection:text-fedex-purple">
      <AnimatePresence>
        {!isUnlocked && (
          <PinOverlay key="pin" onUnlock={handleUnlock} verifyPin={verifyPin} />
        )}
      </AnimatePresence>

      {isUnlocked && (
        <div className="flex">
          <Sidebar 
            isOpen={isSidebarOpen} 
            onClose={() => setIsSidebarOpen(false)} 
            shipments={shipments}
            onSelectShipment={setSelectedShipment}
            onLogout={handleLogout}
          />
          <div className="flex-1">
            <Dashboard 
              onMenuClick={() => setIsSidebarOpen(true)} 
              onCreateShipment={handleCreateShipment}
              onUpdateShipment={handleUpdateShipment}
              selectedShipment={selectedShipment}
              onClearSelection={() => setSelectedShipment(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
