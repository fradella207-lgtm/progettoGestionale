import React from 'react';
import { Warehouse, Fuel, Car, Sparkles } from 'lucide-react';

interface BottomNavigationProps {
  activeTab: 'garage' | 'my_car' | 'stations';
  onSelectTab: (tab: 'garage' | 'my_car' | 'stations') => void;
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
        className="pointer-events-auto w-full max-w-sm sm:max-w-md bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 shadow-2xl shadow-slate-950/40 rounded-full px-2 py-1.5 transition-all text-white select-none"
      >
        <div className="flex items-center justify-between gap-1">
          
          {/* TAB 1: IL MIO GARAGE */}
          <button
            type="button"
            id="nav-tab-garage"
            onClick={() => onSelectTab('garage')}
            className={`flex-1 flex flex-col items-center justify-center py-2 px-1 sm:px-2 rounded-full transition-all cursor-pointer relative group active:scale-90 ${
              activeTab === 'garage'
                ? 'bg-indigo-600 text-white font-black shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <div className="relative">
              <Warehouse className={`w-5 h-5 transition-transform ${activeTab === 'garage' ? 'scale-105 text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
              {vehiclesCount > 0 && (
                <span className={`absolute -top-1 -right-2.5 text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-slate-900 shadow-xs ${
                  activeTab === 'garage' ? 'bg-white text-indigo-700' : 'bg-indigo-500 text-white'
                }`}>
                  {vehiclesCount}
                </span>
              )}
            </div>
            <span className={`text-[10px] sm:text-[11px] mt-0.5 tracking-tight font-black whitespace-nowrap ${
              activeTab === 'garage' ? 'text-white' : 'text-slate-400'
            }`}>
              Garage
            </span>
          </button>

          {/* TAB 2: LA MIA AUTO */}
          <button
            type="button"
            id="nav-tab-my-car"
            onClick={() => onSelectTab('my_car')}
            className={`flex-1 flex flex-col items-center justify-center py-2 px-1 sm:px-2 rounded-full transition-all cursor-pointer relative group active:scale-90 ${
              activeTab === 'my_car'
                ? 'bg-indigo-600 text-white font-black shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <div className="relative">
              <Car className={`w-5 h-5 transition-transform ${activeTab === 'my_car' ? 'scale-105 text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
              <span className={`absolute -top-1.5 -right-3 text-[8px] font-black px-1.5 py-0.2 rounded-full border border-slate-900 shadow-xs ${
                activeTab === 'my_car' ? 'bg-amber-400 text-slate-950' : 'bg-indigo-500 text-white'
              }`}>
                AI
              </span>
            </div>
            <span className={`text-[10px] sm:text-[11px] mt-0.5 tracking-tight font-black whitespace-nowrap ${
              activeTab === 'my_car' ? 'text-white' : 'text-slate-400'
            }`}>
              La Mia Auto
            </span>
          </button>

          {/* TAB 3: DISTRIBUTORI E COLONNINE */}
          <button
            type="button"
            id="nav-tab-stations"
            onClick={() => onSelectTab('stations')}
            className={`flex-1 flex flex-col items-center justify-center py-2 px-1 sm:px-2 rounded-full transition-all cursor-pointer relative group active:scale-90 ${
              activeTab === 'stations'
                ? 'bg-emerald-600 text-white font-black shadow-md shadow-emerald-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <div className="relative">
              <Fuel className={`w-5 h-5 transition-transform ${activeTab === 'stations' ? 'scale-105 text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
              <span className={`absolute -top-1.5 -right-3.5 text-[8px] font-black px-1.5 py-0.2 rounded-full border border-slate-900 shadow-xs ${
                activeTab === 'stations' ? 'bg-white text-emerald-900' : 'bg-emerald-500 text-white'
              }`}>
                LIVE
              </span>
            </div>
            <span className={`text-[10px] sm:text-[11px] mt-0.5 tracking-tight font-black whitespace-nowrap ${
              activeTab === 'stations' ? 'text-white' : 'text-slate-400'
            }`}>
              Distributori
            </span>
          </button>

        </div>
      </nav>
    </div>
  );
};



