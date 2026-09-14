import React from 'react';
import { motion } from 'motion/react';

export const StartupSplash: React.FC = () => {
  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className="fixed inset-0 z-[999999] flex flex-col items-center justify-center bg-slate-950 text-white p-6 select-none"
    >
      <div className="flex flex-col items-center max-w-xs text-center">
        {/* Logo Container with Glow & Subtle Scale */}
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="relative mb-6"
        >
          <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-blue-900/60 to-slate-900 border border-blue-500/40 flex items-center justify-center shadow-2xl shadow-blue-500/20">
            <img 
              src="/logo.png" 
              alt="My360Garage Logo" 
              className="w-20 h-20 object-contain drop-shadow-[0_4px_16px_rgba(0,0,0,0.5)]"
            />
          </div>
        </motion.div>

        {/* Brand Name */}
        <motion.h1 
          initial={{ y: 8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="text-2xl font-black tracking-tight text-white mb-2"
        >
          My360Garage
        </motion.h1>

        {/* Tagline */}
        <motion.p 
          initial={{ y: 8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="text-xs font-medium text-slate-400 mb-8"
        >
          Gestione Veicolo a 360° • Auto, Moto & EV
        </motion.p>

        {/* Pulsing Dots */}
        <div className="flex items-center justify-center gap-2 mb-10">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping opacity-75" />
          <span className="w-2 h-2 rounded-full bg-blue-400" />
          <span className="w-2 h-2 rounded-full bg-blue-600" />
        </div>

        {/* Platform Badge */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.35 }}
          className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[10px] font-semibold text-slate-500 tracking-wider uppercase"
        >
          iOS & Android • v2.5 Ready
        </motion.div>
      </div>
    </motion.div>
  );
};
