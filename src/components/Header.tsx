import React from 'react';
import { 
  Car, 
  ArrowLeft, 
  Plus, 
  Edit3
} from 'lucide-react';
import { Vehicle, AppNotification, AppSettings, UserAccount } from '../types';
import { TopRightMenu } from './TopRightMenu';

interface HeaderProps {
  currentView: 'garage' | 'detail' | 'stations' | 'my_car';
  selectedVehicle?: Vehicle;
  notifications: AppNotification[];
  settings: AppSettings;
  account: UserAccount;
  onNavigateGarage: () => void;
  onOpenAddCar: () => void;
  onOpenEditCar?: () => void;
  onOpenSettings: () => void;
  onOpenNotifications: () => void;
  onOpenAccount: () => void;
  onOpenAuthModal: () => void;
  onMarkAllNotificationsRead: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  selectedVehicle,
  notifications,
  settings,
  account,
  onNavigateGarage,
  onOpenAddCar,
  onOpenEditCar,
  onOpenSettings,
  onOpenNotifications,
  onOpenAccount,
  onOpenAuthModal,
  onMarkAllNotificationsRead,
  onLogout
}) => {
  return (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-slate-200/90 px-3 sm:px-6 lg:px-8 py-3 shadow-xs flex items-center justify-between transition-all">
      {/* LEFT SECTION */}
      <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
        {currentView === 'detail' ? (
          <div className="flex items-center gap-2 min-w-0">
            <button
              id="btn-back-to-garage"
              onClick={onNavigateGarage}
              className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-90 text-slate-900 transition-all border border-slate-300/80 cursor-pointer shadow-2xs group shrink-0"
              title="Torna al Garage"
            >
              <ArrowLeft className="w-4 h-4 text-indigo-600 group-hover:-translate-x-0.5 transition-transform" />
              <span className="text-xs sm:text-sm font-bold">Garage</span>
            </button>
            
            {selectedVehicle && (
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-slate-300 font-bold hidden sm:inline">/</span>
                <span className="text-xs sm:text-sm font-black text-slate-900 truncate max-w-[120px] xs:max-w-[160px] sm:max-w-[240px]">
                  {selectedVehicle.brand} {selectedVehicle.model}
                </span>
                <span className="text-[10px] font-mono font-bold bg-slate-900 text-white px-1.5 py-0.5 rounded-md hidden xs:inline shrink-0">
                  {selectedVehicle.plate}
                </span>
              </div>
            )}
          </div>
        ) : currentView === 'stations' ? (
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center text-white shadow-xs shrink-0">
              <span className="text-base sm:text-lg">⛽</span>
            </div>

            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-black tracking-tight text-slate-950 leading-tight truncate flex items-center gap-1.5">
                <span>Distributori & EV</span>
                <span className="text-[9.5px] bg-emerald-100 text-emerald-900 border border-emerald-300/80 font-black px-1.5 py-0.2 rounded-md">LIVE</span>
              </h1>
              <p className="text-[11px] text-slate-500 hidden sm:block truncate">
                Prezzi carburanti MIMIT e colonnine elettriche
              </p>
            </div>
          </div>
        ) : currentView === 'my_car' ? (
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-indigo-600 to-slate-900 flex items-center justify-center text-white shadow-xs shrink-0">
              <Car className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-indigo-200" />
            </div>

            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-black tracking-tight text-slate-950 leading-tight truncate flex items-center gap-1.5">
                <span>La Mia Auto</span>
                <span className="text-[9.5px] bg-indigo-100 text-indigo-900 border border-indigo-200 font-black px-1.5 py-0.2 rounded-md">AI</span>
              </h1>
              <p className="text-[11px] text-slate-500 hidden sm:block truncate">
                Scheda tecnica, libretto DUC e assistente di bordo
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 flex items-center justify-center text-white shadow-xs shrink-0 border border-slate-800">
              <Car className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-indigo-400" />
            </div>

            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-black tracking-tight text-slate-950 leading-tight truncate">
                Il Mio Garage
              </h1>
              <p className="text-[11px] text-slate-500 hidden sm:block truncate">
                Gestione veicoli, consumi e scadenze
              </p>
            </div>
          </div>
        )}
      </div>

      {/* RIGHT SECTION: ACTIONS & UNIFIED TOP-RIGHT MENU */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {/* ADD VEHICLE BUTTON (in Garage View) */}
        {currentView === 'garage' && (
          <button 
            id="btn-add-vehicle-nav"
            onClick={onOpenAddCar}
            className="bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold shadow-xs hover:shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nuova Auto</span>
            <span className="sm:hidden text-xs">Aggiungi</span>
          </button>
        )}

        {/* EDIT VEHICLE BUTTON (in Detail View) */}
        {currentView === 'detail' && onOpenEditCar && (
          <button 
            id="btn-edit-car-nav"
            onClick={onOpenEditCar}
            className="bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-900 border border-slate-200 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden sm:inline">Modifica</span>
          </button>
        )}

        {/* UNIFIED TOP-RIGHT BUTTON (Settings, Notifications, Account) */}
        <TopRightMenu 
          notifications={notifications}
          settings={settings}
          account={account}
          onOpenSettings={onOpenSettings}
          onOpenNotifications={onOpenNotifications}
          onOpenAccount={onOpenAccount}
          onOpenAuthModal={onOpenAuthModal}
          onMarkAllNotificationsRead={onMarkAllNotificationsRead}
          onLogout={onLogout}
        />
      </div>
    </nav>
  );
};

