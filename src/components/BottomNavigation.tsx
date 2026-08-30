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
    <div className="fixed bottom-3 left-0 right-0 z-40 px-4 pointer-events-none flex justify-center font-['Plus_Jakarta_Sans',sans-serif]">
      <nav 
        aria-label="Navigazione principale" 
        className="pointer-events-auto w-full max-w-md bg-white/90 backdrop-blur-xl border border-slate-200/90 shadow-xl shadow-slate-900/10 rounded-3xl px-2 py-1.5 transition-all"
      >
        <div className="flex items-center justify-around gap-1">
          
          {/* TAB 1: IL MIO GARAGE */}
          <button
            type="button"
            id="nav-tab-garage"
            onClick={() => onSelectTab('garage')}
            className={`flex-1 flex flex-col items-center justify-center py-2 px-2 rounded-2xl transition-all cursor-pointer relative group active:scale-95 ${
              activeTab === 'garage'
                ? 'text-blue-600 bg-blue-50/80 font-black shadow-2xs'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <div className="relative">
              <Warehouse className={`w-5 h-5 transition-transform ${activeTab === 'garage' ? 'scale-110 text-blue-600' : 'text-slate-400 group-hover:text-slate-700'}`} />
              {vehiclesCount > 0 && (
                <span className="absolute -top-1.5 -right-2.5 bg-slate-900 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white shadow-2xs">
                  {vehiclesCount}
                </span>
              )}
            </div>
            <span className={`text-[11px] mt-1 tracking-tight font-extrabold ${
              activeTab === 'garage' ? 'text-blue-600' : 'text-slate-500'
            }`}>
              Garage
            </span>
          </button>

          {/* DIVIDER */}
          <div className="w-px h-6 bg-slate-200/70 shrink-0"></div>

          {/* TAB 2: LA MIA AUTO (Scheda Tecnica Quattroruote + DUC + AI) */}
          <button
            type="button"
            id="nav-tab-my-car"
            onClick={() => onSelectTab('my_car')}
            className={`flex-1 flex flex-col items-center justify-center py-2 px-2 rounded-2xl transition-all cursor-pointer relative group active:scale-95 ${
              activeTab === 'my_car'
                ? 'text-blue-600 bg-blue-50/80 font-black shadow-2xs'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <div className="relative">
              <Car className={`w-5 h-5 transition-transform ${activeTab === 'my_car' ? 'scale-110 text-blue-600' : 'text-slate-400 group-hover:text-slate-700'}`} />
              <span className="absolute -top-1.5 -right-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[8px] font-black px-1.5 py-0.2 rounded-full border border-white shadow-2xs">
                AI
              </span>
            </div>
            <span className={`text-[11px] mt-1 tracking-tight font-extrabold ${
              activeTab === 'my_car' ? 'text-blue-600' : 'text-slate-500'
            }`}>
              La mia Auto
            </span>
          </button>

          {/* DIVIDER */}
          <div className="w-px h-6 bg-slate-200/70 shrink-0"></div>

          {/* TAB 3: DISTRIBUTORI E COLONNINE */}
          <button
            type="button"
            id="nav-tab-stations"
            onClick={() => onSelectTab('stations')}
            className={`flex-1 flex flex-col items-center justify-center py-2 px-2 rounded-2xl transition-all cursor-pointer relative group active:scale-95 ${
              activeTab === 'stations'
                ? 'text-emerald-600 bg-emerald-50/80 font-black shadow-2xs'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <div className="relative">
              <Fuel className={`w-5 h-5 transition-transform ${activeTab === 'stations' ? 'scale-110 text-emerald-600' : 'text-slate-400 group-hover:text-slate-700'}`} />
              <span className="absolute -top-1.5 -right-3.5 bg-emerald-600 text-white text-[8px] font-black px-1.5 py-0.2 rounded-full border border-white shadow-2xs">
                LIVE
              </span>
            </div>
            <span className={`text-[11px] mt-1 tracking-tight font-extrabold ${
              activeTab === 'stations' ? 'text-emerald-600' : 'text-slate-500'
            }`}>
              Distributori
            </span>
          </button>

        </div>
      </nav>
    </div>
  );
};


