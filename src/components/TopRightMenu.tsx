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
  Crown,
  Mail,
  HelpCircle,
  Lightbulb,
  Bug
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
  onOpenFeedback?: (mode?: 'report' | 'improvement') => void;
  onOpenTutorial?: () => void;
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
  onLogout,
  onOpenFeedback,
  onOpenTutorial
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
        className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border transition-all cursor-pointer ${
          isOpen
            ? 'bg-slate-100 dark:bg-slate-800 border-[#2563eb] dark:border-blue-500 text-slate-900 dark:text-white shadow-xs'
            : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white shadow-xs'
        }`}
      >
        <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs border border-slate-200 dark:border-slate-700">
          {account.name ? account.name.charAt(0).toUpperCase() : 'U'}
        </div>

        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-slate-100 hidden sm:flex">
          <span>{account.name.split(' ')[0]}</span>
        </div>

        <div className="relative flex items-center justify-center text-slate-500 dark:text-slate-400 ml-0.5">
          <Sliders className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-rose-600 text-white text-[9px] font-extrabold rounded-full flex items-center justify-center animate-pulse">
              {unreadCount}
            </span>
          )}
        </div>
      </button>

      {/* DROPDOWN MENU */}
      {isOpen && (
        <div 
          id="top-right-hub-dropdown"
          className="absolute right-0 mt-2 w-80 sm:w-88 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl z-50 overflow-hidden font-['Plus_Jakarta_Sans',sans-serif] animate-in fade-in slide-in-from-top-2 duration-150"
        >
          {/* USER QUICK BAR */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-extrabold text-sm shadow-xs">
                {account.name ? account.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{account.name || 'Utente Garage'}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[160px]">{account.email}</p>
              </div>
            </div>
            {userTier === 'PRO' ? (
              <span className="text-[10px] font-black text-amber-900 bg-linear-to-r from-amber-300 to-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1 shadow-2xs">
                <Crown className="w-3 h-3 fill-amber-900" />
                <span>PRO</span>
              </span>
            ) : (
              <span className="text-[10px] font-extrabold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-md uppercase">
                FREE
              </span>
            )}
          </div>

          {/* UPGRADE PRO BANNER FOR FREE USERS */}
          {userTier === 'FREE' && (
            <div className="p-3 bg-linear-to-r from-amber-500/15 via-amber-400/10 to-indigo-50 dark:from-amber-950/40 dark:via-amber-900/20 dark:to-indigo-950/40 border-b border-amber-200 dark:border-amber-800/60 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-2xs shrink-0">
                  <Crown className="w-4 h-4 fill-slate-950" />
                </div>
                <div>
                  <span className="text-xs font-black text-slate-900 dark:text-white block leading-tight">MyGarage360 PRO</span>
                  <span className="text-[10px] text-slate-600 dark:text-slate-300 font-medium">3,99 €/anno o 11,99 € a vita</span>
                </div>
              </div>
              <button
                type="button"
                id="btn-dropdown-upgrade-pro"
                onClick={() => {
                  setIsOpen(false);
                  onOpenUpgradeModal?.();
                }}
                className="px-2.5 py-1.5 bg-linear-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-[11px] rounded-lg shadow-2xs hover:brightness-105 active:scale-95 cursor-pointer shrink-0"
              >
                Passa a PRO
              </button>
            </div>
          )}

          {/* QUICK AUTH BAR */}
          <div className="px-3 py-2 bg-blue-50/70 dark:bg-blue-950/40 border-b border-blue-100/80 dark:border-blue-900/40 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-blue-900 dark:text-blue-200">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
              <span>{account.provider === 'google' ? 'Connesso con Google' : 'Connesso con Email'}</span>
            </div>
            <button
              id="btn-quick-open-login"
              type="button"
              onClick={() => {
                setIsOpen(false);
                onOpenAuthModal();
              }}
              className="text-[11px] font-extrabold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline cursor-pointer"
            >
              Cambia / Accedi
            </button>
          </div>

          {/* MAIN ACTIONS (RECAP, NOTIFICHE, IMPOSTAZIONI, ACCOUNT, FEEDBACK) */}
          <div className="p-2 flex flex-col gap-1">
            
            {/* 0. RECAP MENSILE & ANNUALE (STORY WRAPPED) */}
            {onOpenRecap && (
              <button
                id="menu-item-recap"
                onClick={() => {
                  setIsOpen(false);
                  onOpenRecap();
                }}
                className="w-full text-left p-3 rounded-xl bg-linear-to-r from-indigo-50/80 to-purple-50/60 dark:from-indigo-950/50 dark:to-purple-950/40 hover:from-indigo-100/80 hover:to-purple-100/70 dark:hover:from-indigo-900/60 dark:hover:to-purple-900/50 border border-indigo-100/80 dark:border-indigo-900/60 transition-colors flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-extrabold text-indigo-950 dark:text-indigo-200">Recap Mese & Anno</span>
                      <span className="bg-indigo-600 text-white text-[9px] font-extrabold px-1.5 py-0.2 rounded-full uppercase tracking-wider">
                        Story
                      </span>
                    </div>
                    <p className="text-xs text-indigo-700/90 dark:text-indigo-300 font-medium">Km, spese e scadenze condivisibili</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-indigo-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors" />
              </button>
            )}

            {/* 1. NOTIFICHE */}
            <button
              id="menu-item-notifications"
              onClick={() => {
                setIsOpen(false);
                onOpenNotifications();
              }}
              className="w-full text-left p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-colors flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center border border-orange-100 dark:border-orange-900/60 group-hover:bg-orange-100 dark:group-hover:bg-orange-900/80 transition-colors">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">Notifiche & Avvisi</span>
                    {unreadCount > 0 && (
                      <span className="bg-rose-600 text-white text-[10px] font-extrabold px-1.5 py-0.2 rounded-full">
                        {unreadCount} nuove
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Promemoria tagliandi e scadenze</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
            </button>

            {/* 1.5 PIANO & UPGRADE PRO */}
            <button
              id="menu-item-upgrade-pro"
              onClick={() => {
                setIsOpen(false);
                onOpenUpgradeModal?.();
              }}
              className="w-full text-left p-3 rounded-xl hover:bg-amber-50/60 dark:hover:bg-amber-950/40 transition-colors flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center border border-amber-200 dark:border-amber-800/60 group-hover:bg-amber-100 dark:group-hover:bg-amber-900/80 transition-colors">
                  <Crown className="w-4 h-4 fill-amber-500" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">Piano MyGarage360</span>
                    {userTier === 'PRO' ? (
                      <span className="text-[9px] font-black text-amber-900 bg-amber-100 px-1.5 py-0.2 rounded uppercase">
                        PRO ATTIVO
                      </span>
                    ) : (
                      <span className="text-[9px] font-black text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 rounded uppercase">
                        FREE
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {userTier === 'PRO' ? 'Gestisci o vedi dettagli del tuo piano PRO' : 'Scopri i vantaggi di MyGarage360 PRO'}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors" />
            </button>

            {/* 2. IMPOSTAZIONI GENERALI */}
            <button
              id="menu-item-settings"
              onClick={() => {
                setIsOpen(false);
                onOpenSettings();
              }}
              className="w-full text-left p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-colors flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-900/60 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/80 transition-colors">
                  <Settings className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">Impostazioni Generali</span>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Unità ({settings.unitDistance}), Valuta ({settings.currency}), Tema & Backup</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
            </button>

            {/* 3. ACCOUNT */}
            <button
              id="menu-item-account"
              onClick={() => {
                setIsOpen(false);
                onOpenAccount();
              }}
              className="w-full text-left p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-colors flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-100 dark:border-purple-900/60 group-hover:bg-purple-100 dark:group-hover:bg-purple-900/80 transition-colors">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">Account & Cloud Sync</span>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Gestione profilo e credenziali</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" />
            </button>

            {/* 4. GUIDA & TUTORIAL DELL'APP */}
            {onOpenTutorial && (
              <button
                id="menu-item-tutorial"
                onClick={() => {
                  setIsOpen(false);
                  onOpenTutorial();
                }}
                className="w-full text-left p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-colors flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-900/60 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/80 transition-colors">
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">Guida & Tutorial App</span>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Come leggere dati e usare le funzioni</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
              </button>
            )}

            {/* 5. SEGNALA UN BUG / PROBLEMA TECNICO */}
            <button
              id="menu-item-report-bug"
              onClick={() => {
                setIsOpen(false);
                if (onOpenFeedback) {
                  onOpenFeedback('report');
                } else {
                  onOpenSettings();
                }
              }}
              className="w-full text-left p-3 rounded-xl hover:bg-rose-50/50 dark:hover:bg-rose-950/30 transition-colors flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-100 dark:border-rose-900/60 group-hover:bg-rose-100 dark:group-hover:bg-rose-900/80 transition-colors">
                  <Bug className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">Segnala un Bug</span>
                    <span className="text-[9px] font-black text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 px-1.5 py-0.2 rounded uppercase border border-rose-100 dark:border-rose-800">
                      Supporto
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Errori o problemi tecnici riscontrati</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors" />
            </button>

            {/* 6. PROPONI UN MIGLIORAMENTO */}
            <button
              id="menu-item-improvement"
              onClick={() => {
                setIsOpen(false);
                if (onOpenFeedback) {
                  onOpenFeedback('improvement');
                } else {
                  onOpenSettings();
                }
              }}
              className="w-full text-left p-3 rounded-xl hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 transition-colors flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-100 dark:border-indigo-900/60 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/80 transition-colors">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">Proponi Miglioramento</span>
                    <span className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.2 rounded uppercase border border-indigo-100 dark:border-indigo-800">
                      Idee
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Suggerisci nuove funzioni o grafica</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
            </button>

            {/* 5. DISCONNETTI */}
            {onLogout && (
              <button
                id="menu-item-logout"
                onClick={() => {
                  setIsOpen(false);
                  onLogout();
                }}
                className="w-full text-left p-3 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 transition-colors flex items-center justify-between group border-t border-slate-100 dark:border-slate-800 mt-1 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-100 dark:border-rose-900/60 group-hover:bg-rose-100 dark:group-hover:bg-rose-900/80 transition-colors">
                    <LogOut className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-rose-600 dark:text-rose-400">Disconnetti</span>
                    <p className="text-xs text-rose-400 dark:text-rose-500">Esci dal tuo account</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-rose-400 group-hover:text-rose-600 transition-colors" />
              </button>
            )}

          </div>

          {/* FOOTER QUICK STATS */}
          <div className="p-3 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
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
