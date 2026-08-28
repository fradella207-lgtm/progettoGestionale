import React from 'react';
import { Warehouse, Fuel, Car } from 'lucide-react';

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
    <nav 
      aria-label="Navigazione principale" 
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#e2e8f0] shadow-lg pb-[max(0.5rem,env(safe-area-inset-bottom))] font-['Plus_Jakarta_Sans',sans-serif]"
    >
      <div className="max-w-lg mx-auto px-3 py-2 flex items-center justify-around gap-1">
        
        {/* TAB 1: IL MIO GARAGE */}
        <button
          type="button"
          id="nav-tab-garage"
          onClick={() => onSelectTab('garage')}
          className={`flex-1 flex flex-col items-center justify-center py-1.5 px-2 rounded-2xl transition-all cursor-pointer relative group ${
            activeTab === 'garage'
              ? 'text-[#2563eb]'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <div className="relative">
            <div className={`w-9 h-7 rounded-xl flex items-center justify-center transition-all ${
              activeTab === 'garage' ? 'bg-blue-50 text-[#2563eb] shadow-2xs font-bold' : 'text-slate-400 group-hover:text-slate-600'
            }`}>
              <Warehouse className="w-4.5 h-4.5" />
            </div>
            {vehiclesCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-slate-900 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-white">
                {vehiclesCount}
              </span>
            )}
          </div>
          <span className={`text-[11px] font-black mt-1 tracking-tight ${
            activeTab === 'garage' ? 'text-[#2563eb]' : 'text-slate-600'
          }`}>
            Garage
          </span>
          {activeTab === 'garage' && (
            <div className="w-5 h-1 bg-[#2563eb] rounded-full mt-0.5 animate-in fade-in zoom-in-50 duration-150"></div>
          )}
        </button>

        {/* DIVIDER */}
        <div className="w-px h-6 bg-slate-200 shrink-0"></div>

        {/* TAB 2: LA MIA AUTO (Scheda Tecnica Quattroruote + DUC + AI) */}
        <button
          type="button"
          id="nav-tab-my-car"
          onClick={() => onSelectTab('my_car')}
          className={`flex-1 flex flex-col items-center justify-center py-1.5 px-2 rounded-2xl transition-all cursor-pointer relative group ${
            activeTab === 'my_car'
              ? 'text-[#2563eb]'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <div className="relative">
            <div className={`w-9 h-7 rounded-xl flex items-center justify-center transition-all ${
              activeTab === 'my_car' ? 'bg-blue-50 text-[#2563eb] shadow-2xs font-bold' : 'text-slate-400 group-hover:text-slate-600'
            }`}>
              <Car className="w-4.5 h-4.5" />
            </div>
            <span className="absolute -top-1 -right-1.5 bg-blue-600 text-white text-[8px] font-black px-1 rounded-full border border-white">
              AI
            </span>
          </div>
          <span className={`text-[11px] font-black mt-1 tracking-tight ${
            activeTab === 'my_car' ? 'text-[#2563eb]' : 'text-slate-600'
          }`}>
            La mia Auto
          </span>
          {activeTab === 'my_car' && (
            <div className="w-5 h-1 bg-[#2563eb] rounded-full mt-0.5 animate-in fade-in zoom-in-50 duration-150"></div>
          )}
        </button>

        {/* DIVIDER */}
        <div className="w-px h-6 bg-slate-200 shrink-0"></div>

        {/* TAB 3: DISTRIBUTORI E COLONNINE */}
        <button
          type="button"
          id="nav-tab-stations"
          onClick={() => onSelectTab('stations')}
          className={`flex-1 flex flex-col items-center justify-center py-1.5 px-2 rounded-2xl transition-all cursor-pointer relative group ${
            activeTab === 'stations'
              ? 'text-[#2563eb]'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <div className="relative">
            <div className={`w-9 h-7 rounded-xl flex items-center justify-center transition-all ${
              activeTab === 'stations' ? 'bg-blue-50 text-[#2563eb] shadow-2xs font-bold' : 'text-slate-400 group-hover:text-slate-600'
            }`}>
              <Fuel className="w-4.5 h-4.5" />
            </div>
            <span className="absolute -top-1 -right-1.5 bg-emerald-600 text-white text-[8px] font-black px-1 rounded-full border border-white">
              LIVE
            </span>
          </div>
          <span className={`text-[11px] font-black mt-1 tracking-tight ${
            activeTab === 'stations' ? 'text-[#2563eb]' : 'text-slate-600'
          }`}>
            Distributori & EV
          </span>
          {activeTab === 'stations' && (
            <div className="w-5 h-1 bg-[#2563eb] rounded-full mt-0.5 animate-in fade-in zoom-in-50 duration-150"></div>
          )}
        </button>

      </div>
    </nav>
  );
};

