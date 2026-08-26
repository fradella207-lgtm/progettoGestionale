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
  Sparkles
} from 'lucide-react';
import { UserAccount } from '../../types';
import { useSwipeBack } from '../../hooks/useSwipeBack';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: UserAccount;
  vehiclesCount: number;
  onSaveAccount: (account: UserAccount) => void;
  onOpenAuthModal: () => void;
  onLogout: () => void;
}

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  account,
  vehiclesCount,
  onSaveAccount,
  onOpenAuthModal,
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
      <div className="bg-white rounded-[24px] w-full max-w-lg p-6 sm:p-7 shadow-2xl flex flex-col gap-5 max-h-[90vh] overflow-y-auto font-['Plus_Jakarta_Sans',sans-serif]">
        
        {/* HEADER */}
        <div className="flex items-center justify-between gap-2 border-b border-[#e2e8f0] pb-4">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            {/* Top-Left Indietro Button */}
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 text-xs font-black border border-slate-200 transition-all cursor-pointer shrink-0 shadow-2xs group"
              title="Torna indietro"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              <span>Indietro</span>
            </button>

            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100 shrink-0 hidden xs:flex">
              <User className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-extrabold text-[#0f172a] truncate">Profilo Account</h3>
              <p className="text-xs text-[#64748b] truncate">Credenziali e sincronizzazione cloud</p>
            </div>
          </div>
          <button 
            id="btn-close-account-modal"
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PROFILE CARD */}
        <div className="bg-[#f8fafc] border border-[#e2e8f0] p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-[#2563eb] text-white flex items-center justify-center text-xl font-black shadow-xs shrink-0">
              {name ? name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-base font-extrabold text-[#0f172a]">{name || 'Utente Garage'}</h4>
                <span className="text-[10px] font-extrabold text-[#059669] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md uppercase">
                  {account.plan}
                </span>
              </div>
              <p className="text-xs text-[#64748b]">{email}</p>
              <div className="flex items-center gap-2 mt-1">
                {account.provider === 'google' ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                    <Globe className="w-3 h-3 text-blue-600" /> Account Google
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                    <Mail className="w-3 h-3 text-slate-500" /> Email & Password
                  </span>
                )}
                <span className="text-[11px] text-[#94a3b8]">• {vehiclesCount} veicoli</span>
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
              className="flex-1 sm:flex-none text-xs font-bold bg-white hover:bg-slate-50 text-[#2563eb] border border-blue-200 px-3 py-2 rounded-xl transition-colors shadow-2xs flex items-center justify-center gap-1.5"
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
              className="flex-1 sm:flex-none text-xs font-bold bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 border border-slate-200 hover:border-red-200 px-3 py-2 rounded-xl transition-colors flex items-center justify-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Disconnetti</span>
            </button>
          </div>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#0f172a] uppercase tracking-wider">Nome e Cognome</label>
            <input 
              id="input-account-name"
              type="text" 
              required 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border border-[#e2e8f0] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#2563eb]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#0f172a] uppercase tracking-wider">Indirizzo Email</label>
            <input 
              id="input-account-email"
              type="email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border border-[#e2e8f0] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#2563eb]"
            />
          </div>

          {/* STORAGE & SYNC STATUS */}
          <div className="flex flex-col gap-2.5 border-t border-[#e2e8f0] pt-4">
            <label className="text-xs font-bold text-[#0f172a] uppercase tracking-wider">Archiviazione & Sincronizzazione</label>
            
            <div className="p-3.5 rounded-xl border border-[#e2e8f0] bg-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
                  <Cloud className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-[#0f172a] block">Micro-Cache Locale + Cloud Sync</span>
                  <span className="text-[11px] text-[#64748b]">Tutti i veicoli e rifornimenti salvati in tempo reale</span>
                </div>
              </div>
              <span className="text-[10px] font-extrabold text-[#059669] bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 uppercase">
                Attivo
              </span>
            </div>
          </div>

          {/* SECURITY BADGE */}
          <div className="flex items-center gap-2 text-xs text-[#64748b] bg-[#f8fafc] p-3 rounded-xl border border-[#e2e8f0]">
            <ShieldCheck className="w-4 h-4 text-[#059669] shrink-0" />
            <span>I tuoi dati sono protetti e accessibili offline grazie all'architettura Service Worker PWA.</span>
          </div>

          {/* ACTIONS */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#e2e8f0]">
            <button 
              type="button" 
              onClick={onClose}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl transition-colors"
            >
              Chiudi
            </button>
            <button 
              type="submit" 
              id="btn-save-account-submit"
              className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-colors shadow-xs flex items-center gap-1.5"
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
