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
  Database
} from 'lucide-react';
import { AppNotification, AppSettings, UserAccount } from '../types';

interface TopRightMenuProps {
  notifications: AppNotification[];
  settings: AppSettings;
  account: UserAccount;
  onOpenSettings: () => void;
  onOpenNotifications: () => void;
  onOpenAccount: () => void;
  onOpenAuthModal: () => void;
  onMarkAllNotificationsRead: () => void;
}

export const TopRightMenu: React.FC<TopRightMenuProps> = ({
  notifications,
  settings,
  account,
  onOpenSettings,
  onOpenNotifications,
  onOpenAccount,
  onOpenAuthModal,
  onMarkAllNotificationsRead
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
            <span className="text-[10px] font-extrabold text-[#059669] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md uppercase">
              {account.plan}
            </span>
          </div>

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

          {/* MAIN 3 ACTIONS (NOTIFICHE, IMPOSTAZIONI, ACCOUNT) */}
          <div className="p-2 flex flex-col gap-1">
            
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
                  <p className="text-xs text-[#64748b]">Gestione profilo e Micro-Cache</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#2563eb] transition-colors" />
            </button>

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
