import React from 'react';
import { 
  Car, 
  ArrowLeft, 
  Plus, 
  Edit3,
  Sun,
  Moon,
  Globe,
  Sparkles,
  Crown
} from 'lucide-react';
import { Vehicle, AppNotification, AppSettings, UserAccount, UserTier, ProFeatureName } from '../types';
import { TopRightMenu } from './TopRightMenu';
import { getTranslation } from '../i18n/translations';

interface HeaderProps {
  currentView: 'garage' | 'detail' | 'stations' | 'my_car';
  selectedVehicle?: Vehicle;
  notifications: AppNotification[];
  settings: AppSettings;
  account: UserAccount;
  userTier?: UserTier;
  onNavigateGarage: () => void;
  onOpenAddCar: () => void;
  onOpenEditCar?: () => void;
  onOpenSettings: () => void;
  onOpenNotifications: () => void;
  onOpenAccount: () => void;
  onOpenAuthModal: () => void;
  onMarkAllNotificationsRead: () => void;
  onOpenRecap?: () => void;
  onOpenUpgradeModal?: (feature?: ProFeatureName) => void;
  onLogout: () => void;
  onToggleThemeMode?: () => void;
  onChangeLanguage?: (lang: 'it' | 'en') => void;
  onOpenFeedback?: (mode?: 'report' | 'improvement') => void;
  onOpenTutorial?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  selectedVehicle,
  notifications,
  settings,
  account,
  userTier = 'FREE',
  onNavigateGarage,
  onOpenAddCar,
  onOpenEditCar,
  onOpenSettings,
  onOpenNotifications,
  onOpenAccount,
  onOpenAuthModal,
  onMarkAllNotificationsRead,
  onOpenRecap,
  onOpenUpgradeModal,
  onLogout,
  onToggleThemeMode,
  onChangeLanguage,
  onOpenFeedback,
  onOpenTutorial
}) => {
  const lang = settings.language || 'it';
  const isDark = settings.themeMode === 'dark';

  return (
    <nav className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-2.5 sm:px-6 lg:px-8 pt-[max(0.5rem,env(safe-area-inset-top))] pb-2 sm:pb-2.5 shadow-2xs flex items-center justify-between select-none transition-none">
      {/* LEFT SECTION */}
      <div className="flex items-center gap-2 sm:gap-3.5 min-w-0">
        {currentView === 'detail' ? (
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <button
              id="btn-back-to-garage"
              onClick={onNavigateGarage}
              className="flex items-center gap-1 px-2.5 py-1.5 sm:py-2 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 transition-all border border-slate-200 cursor-pointer shadow-2xs group shrink-0"
              title={getTranslation(lang, 'btn_back_to_garage')}
            >
              <ArrowLeft className="w-3.5 h-3.5 text-theme-primary group-hover:-translate-x-0.5 transition-transform" />
              <span className="text-xs sm:text-sm font-bold">{getTranslation(lang, 'nav_garage')}</span>
            </button>
          </div>
        ) : currentView === 'stations' ? (
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center text-white shadow-xs shrink-0">
              <span className="text-sm sm:text-lg">⛽</span>
            </div>

            <div className="min-w-0">
              <h1 className="text-xs sm:text-base font-black tracking-tight text-slate-950 dark:text-white leading-tight truncate flex items-center gap-1 sm:gap-1.5">
                <span>{getTranslation(lang, 'nav_stations')}</span>
                <span className="text-[9px] bg-emerald-100 text-emerald-900 border border-emerald-300/80 font-black px-1.5 py-0.2 rounded-md">LIVE</span>
              </h1>
              <p className="text-[10px] sm:text-[11px] text-slate-500 hidden sm:block truncate">
                {getTranslation(lang, 'header_stations_subtitle')}
              </p>
            </div>
          </div>
        ) : currentView === 'my_car' ? (
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-indigo-600 to-slate-900 flex items-center justify-center text-white shadow-xs shrink-0">
              <Car className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-200" />
            </div>

            <div className="min-w-0">
              <h1 className="text-xs sm:text-base font-black tracking-tight text-slate-950 dark:text-white leading-tight truncate flex items-center gap-1 sm:gap-1.5">
                <span>{getTranslation(lang, 'nav_my_car')}</span>
                <span className="text-[9px] bg-indigo-100 text-indigo-900 border border-indigo-200 font-black px-1.5 py-0.2 rounded-md">AI</span>
              </h1>
              <p className="text-[10px] sm:text-[11px] text-slate-500 hidden sm:block truncate">
                {getTranslation(lang, 'header_my_car_subtitle')}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <img 
              src="/logo.png" 
              alt="My360Garage" 
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl object-cover shadow-xs shrink-0 border border-slate-200 bg-slate-900"
            />

            <div className="min-w-0">
              <h1 className="text-xs sm:text-base font-black tracking-tight text-slate-950 dark:text-white leading-tight truncate flex items-center gap-1">
                <span>My360Garage</span>
              </h1>
              <p className="text-[10px] sm:text-[11px] text-slate-500 hidden sm:block truncate">
                {getTranslation(lang, 'header_garage_subtitle')}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* RIGHT SECTION: ACTIONS & FAST TOGGLES */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        
        {/* FAST THEME TOGGLE (LIGHT / DARK) - Visibile da tablet in su per non sovrapporre elementi su smartphone */}
        {onToggleThemeMode && (
          <button
            id="btn-header-theme-toggle"
            type="button"
            onClick={onToggleThemeMode}
            className="hidden md:flex w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 border border-slate-200 items-center justify-center transition-all cursor-pointer shadow-2xs"
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

        {/* FAST LANGUAGE SWITCH (IT / EN) - Visibile da tablet in su */}
        {onChangeLanguage && (
          <button
            id="btn-header-lang-toggle"
            type="button"
            onClick={() => onChangeLanguage(lang === 'it' ? 'en' : 'it')}
            className="hidden md:flex h-8 sm:h-9 px-2 sm:px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 border border-slate-200 items-center gap-1 text-xs font-black transition-all cursor-pointer shadow-2xs"
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
            className="bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-900 border border-slate-200 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden xs:inline">{getTranslation(lang, 'btn_edit_vehicle')}</span>
          </button>
        )}

        {/* QUICK RECAP BUTTON (Nascosto su mobile stretto, disponibile nel menu) */}
        {onOpenRecap && currentView !== 'stations' && (
          <button
            id="btn-header-recap"
            type="button"
            onClick={onOpenRecap}
            className="hidden sm:flex h-8 sm:h-9 px-2 sm:px-3 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 active:scale-95 text-indigo-900 border border-indigo-200/80 items-center gap-1 text-xs font-extrabold transition-all cursor-pointer shadow-2xs"
            title="Visualizza Recap Mensile & Annuale"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden md:inline">Recap</span>
          </button>
        )}

        {/* PRO BADGE / UPGRADE CTA */}
        {userTier === 'FREE' ? (
          <button
            id="btn-header-upgrade-pro"
            type="button"
            onClick={() => onOpenUpgradeModal?.()}
            className="h-7 sm:h-8 px-2 sm:px-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-700 active:scale-95 text-slate-950 flex items-center gap-1 text-[11px] sm:text-xs font-black transition-all cursor-pointer shadow-xs shadow-amber-500/20 shrink-0"
            title="Sblocca MyGarage360 PRO: Garage illimitato, AI e Passaporto Digitale"
          >
            <Crown className="w-3 h-3 fill-slate-950" />
            <span className="hidden sm:inline">Passa a PRO</span>
            <span className="sm:hidden">PRO</span>
          </button>
        ) : (
          <div 
            className="h-7 sm:h-8 px-2 sm:px-2.5 rounded-xl bg-gradient-to-r from-slate-900 to-indigo-950 text-amber-300 border border-amber-500/30 flex items-center gap-1 text-[11px] sm:text-xs font-black shadow-xs cursor-default select-none shrink-0"
            title="Account MyGarage360 PRO Attivo"
          >
            <Crown className="w-3 h-3 fill-amber-300" />
            <span>PRO</span>
          </div>
        )}

        {/* UNIFIED TOP-RIGHT BUTTON (Settings, Notifications, Account) */}
        <TopRightMenu 
          notifications={notifications}
          settings={settings}
          account={account}
          userTier={userTier}
          onOpenSettings={onOpenSettings}
          onOpenNotifications={onOpenNotifications}
          onOpenAccount={onOpenAccount}
          onOpenAuthModal={onOpenAuthModal}
          onMarkAllNotificationsRead={onMarkAllNotificationsRead}
          onOpenRecap={onOpenRecap}
          onOpenUpgradeModal={onOpenUpgradeModal}
          onLogout={onLogout}
          onOpenFeedback={onOpenFeedback}
          onOpenTutorial={onOpenTutorial}
        />
      </div>
    </nav>
  );
};

