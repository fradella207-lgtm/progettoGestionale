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
    <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 shadow-2xs flex items-center justify-between transition-all">
      {/* LEFT SECTION */}
      <div className="flex items-center gap-3 sm:gap-4">
        {currentView === 'detail' ? (
          <div className="flex items-center gap-2">
            <button
              id="btn-back-to-garage"
              onClick={onNavigateGarage}
              className="flex items-center gap-2 px-3 sm:px-3.5 py-2 rounded-xl bg-slate-100/90 hover:bg-slate-200 active:scale-95 text-[#0f172a] transition-all border border-slate-300 cursor-pointer shadow-2xs group"
              title="Torna al Garage"
            >
              <ArrowLeft className="w-4 h-4 text-blue-600 group-hover:-translate-x-0.5 transition-transform" />
              <span className="text-xs sm:text-sm font-bold">Indietro</span>
            </button>
            
            {selectedVehicle && (
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-slate-300 font-bold hidden xs:inline">/</span>
                <span className="text-xs sm:text-sm font-black text-slate-800 truncate max-w-[130px] sm:max-w-[220px]">
                  {selectedVehicle.brand} {selectedVehicle.model}
                </span>
                <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200 hidden sm:inline">
                  {selectedVehicle.plate}
                </span>
              </div>
            )}
          </div>
        ) : currentView === 'stations' ? (
          <>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-xs shrink-0">
              <span className="text-lg">⛽</span>
            </div>

            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 leading-tight truncate flex items-center gap-2">
                <span>Distributori & Colonnine</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full hidden sm:inline-block">Live</span>
              </h1>
              <p className="text-xs text-slate-500 hidden sm:block truncate">
                Prezzi carburanti MIMIT e colonnine elettriche in tempo reale
              </p>
            </div>
          </>
        ) : currentView === 'my_car' ? (
          <>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-700 flex items-center justify-center text-white shadow-xs shrink-0">
              <Car className="w-5 h-5" />
            </div>

            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 leading-tight truncate flex items-center gap-2">
                <span>La Mia Auto</span>
                <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full hidden sm:inline-block">Quattroruote + AI</span>
              </h1>
              <p className="text-xs text-slate-500 hidden sm:block truncate">
                Scheda tecnica, libretto DUC e assistente manuale di bordo
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-xs shrink-0">
              <Car className="w-5 h-5" />
            </div>

            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 leading-tight truncate flex items-center gap-1.5">
                <span>Il Mio Garage</span>
              </h1>
              <p className="text-xs text-slate-500 hidden sm:block truncate">
                Gestione flotta, consumi, rifornimenti e scadenze
              </p>
            </div>
          </>
        )}
      </div>

      {/* RIGHT SECTION: ACTIONS & UNIFIED TOP-RIGHT MENU */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* ADD VEHICLE BUTTON (in Garage View) */}
        {currentView === 'garage' && (
          <button 
            id="btn-add-vehicle-nav"
            onClick={onOpenAddCar}
            className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-xs hover:shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nuovo Veicolo</span>
          </button>
        )}

        {/* EDIT VEHICLE BUTTON (in Detail View) */}
        {currentView === 'detail' && onOpenEditCar && (
          <button 
            id="btn-edit-car-nav"
            onClick={onOpenEditCar}
            className="bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-900 border border-slate-200 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Edit3 className="w-4 h-4 text-blue-600" />
            <span className="hidden sm:inline">Modifica Auto</span>
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
