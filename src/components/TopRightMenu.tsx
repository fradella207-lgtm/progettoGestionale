import React, { useState, useRef, useEffect } from 'react';
import { 
  Settings, 
  Bell, 
  User, 
  Sliders, 
  ChevronRight, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle,
  Database,
  LogOut,
  Crown
} from 'lucide-react';
import { AppNotification, AppSettings, UserAccount, UserTier, ProFeatureName } from '../types';

interface TopRightMenuProps {
  notifications: AppNotification[];
  settings: AppSettings;
  account: UserAccount;
  userTier?: UserTier;
  onOpenSettings: () => void;
  onOpenNotifications: () => void;
  onOpenAccount: () => void;
  onOpenAuthModal: () => void;
  onMarkAllNotificationsRead: () => void;
  onOpenRecap?: () => void;
  onOpenUpgradeModal?: (feature?: ProFeatureName) => void;
  onLogout?: () => void;
}

export const TopRightMenu: React.FC<TopRightMenuProps> = ({
  notifications,
  settings,
  account,
  userTier = 'FREE',
  onOpenSettings,
  onOpenNotifications,
  onOpenAccount,
  onOpenAuthModal,
  onMarkAllNotificationsRead,
  onOpenRecap,
  onOpenUpgradeModal,
  onLogout
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={menuRef}>
      {/* THE UNIFIED TOP-RIGHT BUTTON */}
      <button
        id="btn-top-right-hub"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Menu opzioni, notifiche e account"
        className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border transition-all ${
          isOpen
            ? 'bg-slate-100 border-[#2563eb] text-[#0f172a] shadow-xs'
            : 'bg-white hover:bg-slate-50 border-[#e2e8f0] text-[#0f172a] shadow-xs'
        }`}
      >
        <div className="w-7 h-7 rounded-lg bg-[#f1f5f9] text-[#2563eb] flex items-center justify-center font-bold text-xs border border-[#e2e8f0]">
          {account.name ? account.name.charAt(0).toUpperCase() : 'U'}
        </div>

        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#0f172a] hidden sm:flex">
          <span>{account.name.split(' ')[0]}</span>
        </div>

        <div className="relative flex items-center justify-center text-[#64748b] ml-0.5">
          <Sliders className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#dc2626] text-white text-[9px] font-extrabold rounded-full flex items-center justify-center animate-pulse">
              {unreadCount}
            </span>
          )}
        </div>
      </button>

      {/* DROPDOWN MENU */}
      {isOpen && (
        <div 
          id="top-right-hub-dropdown"
          className="absolute right-0 mt-2 w-80 sm:w-88 bg-white rounded-2xl border border-[#e2e8f0] shadow-xl z-50 overflow-hidden font-['Plus_Jakarta_Sans',sans-serif] animate-in fade-in slide-in-from-top-2 duration-150"
        >
          {/* USER QUICK BAR */}
          <div className="p-4 bg-[#f8fafc] border-b border-[#e2e8f0] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#2563eb] text-white flex items-center justify-center font-extrabold text-sm shadow-xs">
                {account.name ? account.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#0f172a] leading-tight">{account.name || 'Utente Garage'}</h4>
                <p className="text-xs text-[#64748b] truncate max-w-[160px]">{account.email}</p>
              </div>
            </div>
            {userTier === 'PRO' ? (
              <span className="text-[10px] font-black text-amber-900 bg-gradient-to-r from-amber-300 to-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1 shadow-2xs">
                <Crown className="w-3 h-3 fill-amber-900" />
                <span>PRO</span>
              </span>
            ) : (
              <span className="text-[10px] font-extrabold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md uppercase">
                FREE
              </span>
            )}
          </div>

          {/* UPGRADE PRO BANNER FOR FREE USERS */}
          {userTier === 'FREE' && (
            <div className="p-3 bg-gradient-to-r from-amber-500/15 via-amber-400/10 to-indigo-50 border-b border-amber-200 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-2xs shrink-0">
                  <Crown className="w-4 h-4 fill-slate-950" />
                </div>
                <div>
                  <span className="text-xs font-black text-slate-900 block leading-tight">MyGarage360 PRO</span>
                  <span className="text-[10px] text-slate-600 font-medium">3,99 €/anno o 11,99 € a vita</span>
                </div>
              </div>
              <button
                type="button"
                id="btn-dropdown-upgrade-pro"
                onClick={() => {
                  setIsOpen(false);
                  onOpenUpgradeModal?.();
                }}
                className="px-2.5 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-[11px] rounded-lg shadow-2xs hover:brightness-105 active:scale-95 cursor-pointer shrink-0"
              >
                Passa a PRO
              </button>
            </div>
          )}

          {/* QUICK AUTH BAR */}
          <div className="px-3 py-2 bg-blue-50/50 border-b border-blue-100/60 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-blue-900">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>{account.provider === 'google' ? 'Connesso con Google' : 'Connesso con Email'}</span>
            </div>
            <button
              id="btn-quick-open-login"
              type="button"
              onClick={() => {
                setIsOpen(false);
                onOpenAuthModal();
              }}
              className="text-[11px] font-extrabold text-[#2563eb] hover:text-[#1d4ed8] hover:underline"
            >
              Cambia / Accedi
            </button>
          </div>

          {/* MAIN ACTIONS (RECAP, NOTIFICHE, IMPOSTAZIONI, ACCOUNT) */}
          <div className="p-2 flex flex-col gap-1">
            
            {/* 0. RECAP MENSILE & ANNUALE (STORY WRAPPED) */}
            {onOpenRecap && (
              <button
                id="menu-item-recap"
                onClick={() => {
                  setIsOpen(false);
                  onOpenRecap();
                }}
                className="w-full text-left p-3 rounded-xl bg-gradient-to-r from-indigo-50/80 to-purple-50/60 hover:from-indigo-100/80 hover:to-purple-100/70 border border-indigo-100/80 transition-colors flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-extrabold text-indigo-950">Recap Mese & Anno</span>
                      <span className="bg-indigo-600 text-white text-[9px] font-extrabold px-1.5 py-0.2 rounded-full uppercase tracking-wider">
                        Story
                      </span>
                    </div>
                    <p className="text-xs text-indigo-700/80 font-medium">Km, spese e scadenze condivisibili</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-indigo-400 group-hover:text-indigo-700 transition-colors" />
              </button>
            )}

            {/* 1. NOTIFICHE */}
            <button
              id="menu-item-notifications"
              onClick={() => {
                setIsOpen(false);
                onOpenNotifications();
              }}
              className="w-full text-left p-3 rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-100 group-hover:bg-orange-100 transition-colors">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[#0f172a]">Notifiche & Avvisi</span>
                    {unreadCount > 0 && (
                      <span className="bg-[#dc2626] text-white text-[10px] font-extrabold px-1.5 py-0.2 rounded-full">
                        {unreadCount} nuove
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#64748b]">Promemoria tagliandi e scadenze</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#2563eb] transition-colors" />
            </button>

            {/* 1.5 PIANO & UPGRADE PRO */}
            <button
              id="menu-item-upgrade-pro"
              onClick={() => {
                setIsOpen(false);
                onOpenUpgradeModal?.();
              }}
              className="w-full text-left p-3 rounded-xl hover:bg-amber-50/60 transition-colors flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200 group-hover:bg-amber-100 transition-colors">
                  <Crown className="w-4 h-4 fill-amber-500" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-[#0f172a]">Piano MyGarage360</span>
                    {userTier === 'PRO' ? (
                      <span className="text-[9px] font-black text-amber-900 bg-amber-100 px-1.5 py-0.2 rounded uppercase">
                        PRO ATTIVO
                      </span>
                    ) : (
                      <span className="text-[9px] font-black text-slate-700 bg-slate-100 px-1.5 py-0.2 rounded uppercase">
                        FREE
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#64748b]">
                    {userTier === 'PRO' ? 'Gestisci o vedi dettagli del tuo piano PRO' : 'Scopri i vantaggi di MyGarage360 PRO'}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-700 transition-colors" />
            </button>

            {/* 2. IMPOSTAZIONI GENERALI */}
            <button
              id="menu-item-settings"
              onClick={() => {
                setIsOpen(false);
                onOpenSettings();
              }}
              className="w-full text-left p-3 rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#2563eb] flex items-center justify-center border border-blue-100 group-hover:bg-blue-100 transition-colors">
                  <Settings className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-sm font-bold text-[#0f172a]">Impostazioni Generali</span>
                  <p className="text-xs text-[#64748b]">Unità ({settings.unitDistance}), Valuta ({settings.currency}), Backup</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#2563eb] transition-colors" />
            </button>

            {/* 3. ACCOUNT */}
            <button
              id="menu-item-account"
              onClick={() => {
                setIsOpen(false);
                onOpenAccount();
              }}
              className="w-full text-left p-3 rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100 group-hover:bg-purple-100 transition-colors">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-sm font-bold text-[#0f172a]">Account & Cloud Sync</span>
                  <p className="text-xs text-[#64748b]">Gestione profilo e credenziali</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#2563eb] transition-colors" />
            </button>


            {/* 4. DISCONNETTI */}
            {onLogout && (
              <button
                id="menu-item-logout"
                onClick={() => {
                  setIsOpen(false);
                  onLogout();
                }}
                className="w-full text-left p-3 rounded-xl hover:bg-red-50 text-red-600 transition-colors flex items-center justify-between group border-t border-slate-100 mt-1"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center border border-red-100 group-hover:bg-red-100 transition-colors">
                    <LogOut className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-red-600">Disconnetti</span>
                    <p className="text-xs text-red-400">Esci dal tuo account</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-red-400 group-hover:text-red-600 transition-colors" />
              </button>
            )}

          </div>

          {/* FOOTER QUICK STATS */}
          <div className="p-3 bg-[#f8fafc] border-t border-[#e2e8f0] flex items-center justify-between text-[11px] text-[#64748b]">
            <div className="flex items-center gap-1.5 text-emerald-600 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Micro-Cache Locale Attiva</span>
            </div>
            <span className="font-mono text-[10px] text-slate-400">v1.2 PWA</span>
          </div>

        </div>
      )}
    </div>
  );
};
