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
  currentView: 'garage' | 'detail';
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
    <nav className="sticky top-0 z-40 bg-white border-b border-[#e2e8f0] px-4 sm:px-8 py-3.5 shadow-xs flex items-center justify-between">
      {/* LEFT SECTION */}
      <div className="flex items-center gap-3 sm:gap-4">
        {currentView === 'detail' ? (
          <div className="flex items-center gap-2">
            <button
              id="btn-back-to-garage"
              onClick={onNavigateGarage}
              className="flex items-center gap-2 px-3 sm:px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-[#0f172a] transition-all border border-[#cbd5e1] cursor-pointer shadow-2xs group"
              title="Torna al Garage"
            >
              <ArrowLeft className="w-4 h-4 text-[#2563eb] group-hover:-translate-x-0.5 transition-transform" />
              <span className="text-xs sm:text-sm font-black">Indietro</span>
            </button>
            
            {selectedVehicle && (
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-slate-300 font-bold hidden xs:inline">/</span>
                <span className="text-xs sm:text-sm font-bold text-slate-800 truncate max-w-[130px] sm:max-w-[200px]">
                  {selectedVehicle.brand} {selectedVehicle.model}
                </span>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="w-10 h-10 rounded-xl bg-[#2563eb] flex items-center justify-center text-white shadow-xs shrink-0">
              <Car className="w-5 h-5" />
            </div>

            <div className="min-w-0">
              <h1 className="text-base sm:text-xl font-bold tracking-tight text-[#0f172a] leading-tight truncate flex items-center gap-1.5">
                <span>Il mio garage</span>
              </h1>
              <p className="text-xs text-[#64748b] hidden sm:block truncate">
                Panoramica veicoli, consumi e manutenzioni
              </p>
            </div>
          </>
        )}
      </div>

      {/* RIGHT SECTION: ACTIONS & UNIFIED TOP-RIGHT MENU */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* ADD VEHICLE BUTTON (in Garage View) */}
        {currentView === 'garage' && (
          <button 
            id="btn-add-vehicle-nav"
            onClick={onOpenAddCar}
            className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition-colors flex items-center gap-1.5"
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
            className="bg-slate-100 hover:bg-slate-200 text-[#0f172a] border border-[#e2e8f0] px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5"
          >
            <Edit3 className="w-4 h-4 text-[#2563eb]" />
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
