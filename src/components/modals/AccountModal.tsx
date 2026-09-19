import React, { useState, useEffect } from 'react';
import { 
  X, 
  ArrowLeft,
  User, 
  ShieldCheck, 
  Mail, 
  Calendar, 
  Key, 
  Check, 
  Cloud, 
  Database,
  Globe,
  LogIn,
  LogOut,
  Sparkles,
  Crown
} from 'lucide-react';
import { UserAccount, UserTier, ProFeatureName } from '../../types';
import { useSwipeBack } from '../../hooks/useSwipeBack';
import { ProBadge } from '../common/ProBadge';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: UserAccount;
  vehiclesCount: number;
  userTier?: UserTier;
  onSaveAccount: (account: UserAccount) => void;
  onOpenAuthModal: () => void;
  onOpenUpgradeModal?: (feature?: ProFeatureName) => void;
  onLogout: () => void;
}

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  account,
  vehiclesCount,
  userTier = 'FREE',
  onSaveAccount,
  onOpenAuthModal,
  onOpenUpgradeModal,
  onLogout
}) => {
  const [name, setName] = useState(account.name);
  const [email, setEmail] = useState(account.email);
  const [syncStatus, setSyncStatus] = useState<UserAccount['syncStatus']>(account.syncStatus);
  const [isSaved, setIsSaved] = useState(false);

  // Support swipe right gesture to go back / close
  useSwipeBack({
    onBack: onClose,
    enabled: isOpen
  });

  useEffect(() => {
    if (isOpen) {
      setName(account.name);
      setEmail(account.email);
      setSyncStatus(account.syncStatus);
      setIsSaved(false);
    }
  }, [isOpen, account]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveAccount({
      ...account,
      name: name.trim(),
      email: email.trim(),
      syncStatus
    });
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-[24px] w-full max-w-lg p-6 sm:p-7 shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col gap-5 max-h-[90vh] overflow-y-auto font-['Plus_Jakarta_Sans',sans-serif]">
        
        {/* HEADER */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            {/* Top-Left Indietro Button */}
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 text-slate-800 dark:text-slate-100 text-xs font-black border border-slate-200 dark:border-slate-700 transition-all cursor-pointer shrink-0 shadow-2xs group"
              title="Torna indietro"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              <span>Indietro</span>
            </button>

            <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-100 dark:border-purple-900/60 shrink-0 hidden xs:flex">
              <User className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white truncate">Profilo Account</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">Credenziali e sincronizzazione cloud</p>
            </div>
          </div>
          <button 
            id="btn-close-account-modal"
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PROFILE CARD */}
        <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-xl font-black shadow-xs shrink-0">
              {name ? name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-base font-extrabold text-slate-900 dark:text-white">{name || 'Utente Garage'}</h4>
                {userTier === 'PRO' ? (
                  <span className="text-[10px] font-extrabold text-amber-900 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 px-2 py-0.5 rounded-md uppercase inline-flex items-center gap-1">
                    <Crown className="w-3 h-3 text-amber-600 dark:text-amber-400" /> PRO ACCOUNT
                  </span>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-extrabold text-slate-700 dark:text-slate-300 bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-md uppercase">
                      PIANO FREE
                    </span>
                    <button
                      type="button"
                      id="btn-account-upgrade-pro"
                      onClick={() => {
                        onClose();
                        onOpenUpgradeModal?.();
                      }}
                      className="text-[10px] font-black text-amber-950 bg-linear-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 px-2 py-0.5 rounded-md transition-transform active:scale-95 shadow-2xs cursor-pointer"
                    >
                      ★ Passa a PRO
                    </button>
                  </div>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">{email}</p>
              <div className="flex items-center gap-2 mt-1">
                {account.provider === 'google' ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md border border-blue-100 dark:border-blue-900/60">
                    <Globe className="w-3 h-3 text-blue-600 dark:text-blue-400" /> Account Google
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-600">
                    <Mail className="w-3 h-3 text-slate-500 dark:text-slate-400" /> Email & Password
                  </span>
                )}
                <span className="text-[11px] text-slate-400 dark:text-slate-500">• {vehiclesCount} veicoli</span>
              </div>
            </div>
          </div>

          <div className="flex sm:flex-col gap-2 w-full sm:w-auto">
            <button
              type="button"
              id="btn-switch-account"
              onClick={() => {
                onClose();
                onOpenAuthModal();
              }}
              className="flex-1 sm:flex-none text-xs font-bold bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/60 px-3 py-2 rounded-xl transition-colors shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Cambia Account</span>
            </button>
            <button
              type="button"
              id="btn-logout"
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="flex-1 sm:flex-none text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 border border-slate-200 dark:border-slate-700 hover:border-rose-200 dark:hover:border-rose-900/60 px-3 py-2 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Disconnetti</span>
            </button>
          </div>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Nome e Cognome</label>
            <input 
              id="input-account-name"
              type="text" 
              required 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Indirizzo Email</label>
            <input 
              id="input-account-email"
              type="email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* STORAGE & SYNC STATUS */}
          <div className="flex flex-col gap-2.5 border-t border-slate-200 dark:border-slate-800 pt-4">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Archiviazione & Sincronizzazione</label>
            
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-800">
                  <Cloud className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">Micro-Cache Locale + Cloud Sync</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">Tutti i veicoli e rifornimenti salvati in tempo reale</span>
                </div>
              </div>
              <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-md border border-emerald-200 dark:border-emerald-800 uppercase">
                Attivo
              </span>
            </div>
          </div>

          {/* SECURITY BADGE */}
          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>I tuoi dati sono protetti e accessibili offline grazie all'architettura Service Worker PWA.</span>
          </div>

          {/* ACTIONS */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button 
              type="button" 
              onClick={onClose}
              className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
            >
              Chiudi
            </button>
            <button 
              type="submit" 
              id="btn-save-account-submit"
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              {isSaved ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>Salvato!</span>
                </>
              ) : (
                <span>Aggiorna Profilo</span>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
