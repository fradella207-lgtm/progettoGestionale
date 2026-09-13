import React from 'react';
import { Warehouse, Fuel } from 'lucide-react';
import { motion } from 'motion/react';

interface BottomNavigationProps {
  activeTab: 'garage' | 'stations';
  onSelectTab: (tab: 'garage' | 'stations') => void;
  vehiclesCount: number;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  onSelectTab,
  vehiclesCount
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 pointer-events-none flex justify-center font-['Plus_Jakarta_Sans',sans-serif]">
      <nav 
        aria-label="Navigazione principale" 
        className="pointer-events-auto w-full max-w-xs sm:max-w-sm bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 shadow-2xl shadow-slate-950/40 rounded-full p-1.5 transition-all text-white select-none"
      >
        <div className="flex items-center justify-between gap-1 relative">
          
          {/* TAB 1: GARAGE */}
          <button
            type="button"
            id="nav-tab-garage"
            onClick={() => onSelectTab('garage')}
            className={`flex-1 flex flex-col items-center justify-center py-2 px-3 rounded-full transition-colors cursor-pointer relative z-10 group active:scale-95 ${
              activeTab === 'garage' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {activeTab === 'garage' && (
              <motion.div 
                layoutId="active-nav-indicator"
                className="absolute inset-0 bg-indigo-600 rounded-full shadow-md shadow-indigo-600/40 -z-10"
                transition={{ type: "spring", stiffness: 420, damping: 32 }}
              />
            )}
            <div className="relative">
              <Warehouse className={`w-5 h-5 transition-transform duration-200 ${activeTab === 'garage' ? 'scale-105 text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
              {vehiclesCount > 0 && (
                <span className={`absolute -top-1 -right-2.5 text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-slate-900 shadow-xs transition-colors ${
                  activeTab === 'garage' ? 'bg-white text-indigo-700' : 'bg-indigo-500 text-white'
                }`}>
                  {vehiclesCount}
                </span>
              )}
            </div>
            <span className={`text-[11px] mt-0.5 tracking-tight font-black whitespace-nowrap transition-colors ${
              activeTab === 'garage' ? 'text-white font-black' : 'text-slate-400'
            }`}>
              Garage
            </span>
          </button>

          {/* TAB 2: DISTRIBUTORI */}
          <button
            type="button"
            id="nav-tab-stations"
            onClick={() => onSelectTab('stations')}
            className={`flex-1 flex flex-col items-center justify-center py-2 px-3 rounded-full transition-colors cursor-pointer relative z-10 group active:scale-95 ${
              activeTab === 'stations' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {activeTab === 'stations' && (
              <motion.div 
                layoutId="active-nav-indicator"
                className="absolute inset-0 bg-emerald-600 rounded-full shadow-md shadow-emerald-600/40 -z-10"
                transition={{ type: "spring", stiffness: 420, damping: 32 }}
              />
            )}
            <div className="relative">
              <Fuel className={`w-5 h-5 transition-transform duration-200 ${activeTab === 'stations' ? 'scale-105 text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
              <span className={`absolute -top-1.5 -right-3.5 text-[8px] font-black px-1.5 py-0.2 rounded-full border border-slate-900 shadow-xs transition-colors ${
                activeTab === 'stations' ? 'bg-white text-emerald-900' : 'bg-emerald-500 text-white'
              }`}>
                LIVE
              </span>
            </div>
            <span className={`text-[11px] mt-0.5 tracking-tight font-black whitespace-nowrap transition-colors ${
              activeTab === 'stations' ? 'text-white font-black' : 'text-slate-400'
            }`}>
              Distributori
            </span>
          </button>

        </div>
      </nav>
    </div>
  );
};



