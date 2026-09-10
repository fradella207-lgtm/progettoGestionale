import React from 'react';
import { 
  Car, 
  ArrowLeft, 
  Plus, 
  Edit3,
  Sun,
  Moon,
  Globe
} from 'lucide-react';
import { Vehicle, AppNotification, AppSettings, UserAccount } from '../types';
import { TopRightMenu } from './TopRightMenu';
import { getTranslation } from '../i18n/translations';

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
  onToggleThemeMode?: () => void;
  onChangeLanguage?: (lang: 'it' | 'en') => void;
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
  onLogout,
  onToggleThemeMode,
  onChangeLanguage
}) => {
  const lang = settings.language || 'it';
  const isDark = settings.themeMode === 'dark';

  return (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-slate-200/90 px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 shadow-xs flex items-center justify-between transition-all">
      {/* LEFT SECTION */}
      <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
        {currentView === 'detail' ? (
          <div className="flex items-center gap-2 min-w-0">
            <button
              id="btn-back-to-garage"
              onClick={onNavigateGarage}
              className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 transition-all border border-slate-200 cursor-pointer shadow-2xs group shrink-0"
              title={getTranslation(lang, 'btn_back_to_garage')}
            >
              <ArrowLeft className="w-4 h-4 text-theme-primary group-hover:-translate-x-0.5 transition-transform" />
              <span className="text-xs sm:text-sm font-bold">{getTranslation(lang, 'nav_garage')}</span>
            </button>
          </div>
        ) : currentView === 'stations' ? (
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center text-white shadow-xs shrink-0">
              <span className="text-base sm:text-lg">⛽</span>
            </div>

            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-black tracking-tight text-slate-950 leading-tight truncate flex items-center gap-1.5">
                <span>{getTranslation(lang, 'nav_stations')}</span>
                <span className="text-[9.5px] bg-emerald-100 text-emerald-900 border border-emerald-300/80 font-black px-1.5 py-0.2 rounded-md">LIVE</span>
              </h1>
              <p className="text-[11px] text-slate-500 hidden sm:block truncate">
                {getTranslation(lang, 'header_stations_subtitle')}
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
                <span>{getTranslation(lang, 'nav_my_car')}</span>
                <span className="text-[9.5px] bg-indigo-100 text-indigo-900 border border-indigo-200 font-black px-1.5 py-0.2 rounded-md">AI</span>
              </h1>
              <p className="text-[11px] text-slate-500 hidden sm:block truncate">
                {getTranslation(lang, 'header_my_car_subtitle')}
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
                {getTranslation(lang, 'garage_title')}
              </h1>
              <p className="text-[11px] text-slate-500 hidden sm:block truncate">
                {getTranslation(lang, 'header_garage_subtitle')}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* RIGHT SECTION: ACTIONS & FAST TOGGLES */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        
        {/* FAST THEME TOGGLE (LIGHT / DARK) */}
        {onToggleThemeMode && (
          <button
            id="btn-header-theme-toggle"
            type="button"
            onClick={onToggleThemeMode}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 border border-slate-200 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
            title={isDark ? 'Passa a Tema Chiaro' : 'Passa a Tema Scuro'}
            aria-label="Toggle tema chiaro/scuro"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400 animate-in spin-in-180 duration-200" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700 animate-in spin-in-180 duration-200" />
            )}
          </button>
        )}

        {/* FAST LANGUAGE SWITCH (IT / EN) */}
        {onChangeLanguage && (
          <button
            id="btn-header-lang-toggle"
            type="button"
            onClick={() => onChangeLanguage(lang === 'it' ? 'en' : 'it')}
            className="h-8 sm:h-9 px-2 sm:px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 border border-slate-200 flex items-center gap-1 text-xs font-black transition-all cursor-pointer shadow-2xs"
            title={lang === 'it' ? 'Switch to English' : 'Passa a Italiano'}
            aria-label="Cambia lingua"
          >
            <span className="text-xs">{lang === 'it' ? '🇮🇹 IT' : '🇬🇧 EN'}</span>
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
            <span className="hidden sm:inline">{getTranslation(lang, 'btn_edit_vehicle')}</span>
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

