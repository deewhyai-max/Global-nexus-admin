import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Delete, AlertCircle } from 'lucide-react';

interface PinOverlayProps {
  onUnlock: () => void;
  verifyPin: (pin: string) => Promise<boolean>;
  key?: string;
}

export default function PinOverlay({ onUnlock, verifyPin }: PinOverlayProps) {
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const maxPinLength = 4;

  const handleNumberClick = (num: number) => {
    if (pin.length < maxPinLength && !isVerifying) {
      setError(null);
      setPin(prev => prev + num);
    }
  };

  const handleDelete = () => {
    if (!isVerifying) {
      setError(null);
      setPin(prev => prev.slice(0, -1));
    }
  };

  const handleUnlock = async () => {
    setIsVerifying(true);
    const isValid = await verifyPin(pin);
    
    if (isValid) {
      onUnlock();
    } else {
      setIsShaking(true);
      setError("Wrong PIN. Access Denied.");
      setPin('');
      setTimeout(() => setIsShaking(false), 500);
    }
    setIsVerifying(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xl">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ 
          opacity: 1, 
          scale: 1,
          x: isShaking ? [0, -10, 10, -10, 10, 0] : 0
        }}
        transition={{ duration: isShaking ? 0.4 : 0.3 }}
        className="w-full max-w-md p-8 mx-4 bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20"
      >
        <div className="flex flex-col items-center space-y-8">
          <div className="p-4 bg-fedex-purple/10 rounded-full">
            <Lock className="w-8 h-8 text-fedex-purple" />
          </div>
          
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Secure Access</h1>
            <p className="text-slate-500 text-sm">Enter terminal authorization PIN</p>
          </div>

          <div className="flex flex-col items-center space-y-4">
            <div className="flex space-x-4">
              {[...Array(maxPinLength)].map((_, i) => (
                <div 
                  key={i}
                  className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                    i < pin.length ? 'bg-fedex-purple border-fedex-purple scale-110' : 'border-slate-300'
                  }`}
                />
              ))}
            </div>
            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center space-x-2 text-red-500 text-xs font-bold uppercase tracking-wider"
                >
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="grid grid-cols-3 gap-4 w-full max-w-[280px]">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                onClick={() => handleNumberClick(num)}
                className="h-16 w-16 rounded-full flex items-center justify-center text-xl font-semibold text-slate-700 hover:bg-slate-100 active:bg-slate-200 transition-colors"
              >
                {num}
              </button>
            ))}
            <div className="h-16 w-16" />
            <button
              onClick={() => handleNumberClick(0)}
              className="h-16 w-16 rounded-full flex items-center justify-center text-xl font-semibold text-slate-700 hover:bg-slate-100 active:bg-slate-200 transition-colors"
            >
              0
            </button>
            <button
              onClick={handleDelete}
              className="h-16 w-16 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 active:bg-slate-200 transition-colors"
            >
              <Delete className="w-6 h-6" />
            </button>
          </div>

          <button
            onClick={handleUnlock}
            disabled={pin.length < maxPinLength}
            className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all transform active:scale-95 ${
              pin.length === maxPinLength 
                ? 'bg-fedex-purple hover:bg-fedex-purple/90 shadow-fedex-purple/20' 
                : 'bg-slate-300 cursor-not-allowed'
            }`}
          >
            UNLOCK
          </button>
        </div>
      </motion.div>
    </div>
  );
}
