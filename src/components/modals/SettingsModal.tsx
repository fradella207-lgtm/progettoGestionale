import React, { useState, useEffect } from 'react';
import { 
  X, 
  ArrowLeft, 
  Settings, 
  Sliders, 
  Database, 
  Download, 
  Upload, 
  Trash2, 
  RefreshCw, 
  CheckCircle2, 
  Car, 
  Palette, 
  Check,
  Sun,
  Moon,
  Languages,
  Crown,
  Shield,
  FileSpreadsheet,
  Printer,
  Sparkles,
  Bell,
  Cloud,
  Send,
  Mail,
  MessageSquare,
  ExternalLink,
  User,
  ShieldCheck,
  ChevronRight,
  Bug,
  Lightbulb,
  HelpCircle
} from 'lucide-react';
import { AppSettings, Vehicle, AppThemeColor, AppThemeMode, AppLanguage, UserTier, ProFeatureName, UserAccount } from '../../types';
import { useSwipeBack } from '../../hooks/useSwipeBack';
import { 
  exportAllVehiclesToJSON, 
  exportVehicleToJSON, 
  readJsonFile, 
  sanitizeImportedGarage, 
  sanitizeImportedVehicle 
} from '../../utils/vehicleExportImport';
import { ProBadge } from '../common/ProBadge';
import { exportVehiclePassportCSV, openPrintableDigitalPassport } from '../../utils/digitalPassportExport';
import { submitAppFeedback, buildOwnerMailtoLink, OWNER_EMAIL, AppFeedbackData } from '../../utils/feedbackService';

const THEME_OPTIONS: { id: AppThemeColor; name: string; hex: string; bgClass: string; borderClass: string; desc: string }[] = [
  { id: 'indigo', name: 'Indaco Elegante', hex: '#4f46e5', bgClass: 'bg-indigo-600', borderClass: 'border-indigo-600', desc: 'Predefinito, sobrio e raffinato' },
  { id: 'blue', name: 'Blu Cobalto', hex: '#2563eb', bgClass: 'bg-blue-600', borderClass: 'border-blue-600', desc: 'Sportivo e tecnologico' },
  { id: 'emerald', name: 'Verde Smeraldo', hex: '#059669', bgClass: 'bg-emerald-600', borderClass: 'border-emerald-600', desc: 'Racing Green ed eco-friendly' },
  { id: 'violet', name: 'Viola Ametista', hex: '#7c3aed', bgClass: 'bg-violet-600', borderClass: 'border-violet-600', desc: 'Moderno ed espressivo' },
  { id: 'amber', name: 'Ambra GT', hex: '#d97706', bgClass: 'bg-amber-600', borderClass: 'border-amber-600', desc: 'Caldo e dinamico' },
  { id: 'rose', name: 'Rosso Corsa', hex: '#e11d48', bgClass: 'bg-rose-600', borderClass: 'border-rose-600', desc: 'Passione automobilistica' },
  { id: 'slate', name: 'Grafite Minimal', hex: '#334155', bgClass: 'bg-slate-700', borderClass: 'border-slate-700', desc: 'Monocromatico ed essenziale' },
];

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  vehicles: Vehicle[];
  userTier?: UserTier;
  account?: UserAccount;
  initialSection?: 'general' | 'feedback' | 'account' | 'report' | 'improvement';
  onSaveSettings: (newSettings: AppSettings) => void;
  onResetGarage: () => void;
  onImportGarage: (importedVehicles: Vehicle[]) => void;
  onOpenUpgradeModal?: (feature?: ProFeatureName) => void;
  onToggleUserTier?: () => void;
  onOpenAccount?: () => void;
  onOpenTutorial?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  vehicles,
  userTier = 'FREE',
  account,
  initialSection = 'general',
  onSaveSettings,
  onResetGarage,
  onImportGarage,
  onOpenUpgradeModal,
  onToggleUserTier,
  onOpenAccount,
  onOpenTutorial
}) => {
  const [unitDistance, setUnitDistance] = useState<'km' | 'mi'>(settings.unitDistance);
  const [currency, setCurrency] = useState<'€' | '$' | '£'>(settings.currency);
  const [fuelPriceAlerts, setFuelPriceAlerts] = useState<boolean>(settings.fuelPriceAlerts);
  const [predictiveAlerts, setPredictiveAlerts] = useState<boolean>(settings.predictiveAlerts);
  const [autoBackup, setAutoBackup] = useState<boolean>(settings.autoBackup);
  const [stationDisplayMode, setStationDisplayMode] = useState<'auto' | 'fuel_only' | 'ev_only' | 'all'>(settings.stationDisplayMode || 'auto');
  const [themeColor, setThemeColor] = useState<AppThemeColor>(settings.themeColor || 'indigo');
  const [themeMode, setThemeMode] = useState<AppThemeMode>(settings.themeMode || 'light');
  const [language, setLanguage] = useState<AppLanguage>(settings.language || 'it');

  // Separated feedback/report mode: 'report' for technical bugs, 'improvement' for ideas & features
  const [feedbackMode, setFeedbackMode] = useState<'report' | 'improvement'>('report');

  // Scroll to section when requested
  useEffect(() => {
    if (isOpen) {
      if (initialSection === 'report') {
        setFeedbackMode('report');
      } else if (initialSection === 'improvement' || initialSection === 'feedback') {
        setFeedbackMode('improvement');
      }

      if (initialSection === 'feedback' || initialSection === 'report' || initialSection === 'improvement') {
        const timer = setTimeout(() => {
          const el = document.getElementById('section-feedback');
          el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
        return () => clearTimeout(timer);
      }
    }
  }, [isOpen, initialSection]);

  // Feedback state for application improvements & reports to owner (my360garage@gmail.com)
  const [feedbackType, setFeedbackType] = useState<'improvement' | 'bug' | 'feature' | 'other'>('bug');
  const [feedbackSubject, setFeedbackSubject] = useState<string>('');
  const [feedbackMessage, setFeedbackMessage] = useState<string>('');
  const [feedbackSenderEmail, setFeedbackSenderEmail] = useState<string>('');
  const [feedbackSenderName, setFeedbackSenderName] = useState<string>('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState<boolean>(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<boolean>(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  const handleSubmitFeedback = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!feedbackMessage.trim()) {
      setFeedbackError('Inserisci un messaggio o una descrizione per il suggerimento.');
      return;
    }

    setIsSubmittingFeedback(true);
    setFeedbackError(null);

    try {
      const feedbackPayload: AppFeedbackData = {
        type: feedbackType,
        subject: feedbackSubject.trim() || 'Suggerimento per My360Garage',
        message: feedbackMessage.trim(),
        senderName: feedbackSenderName.trim(),
        senderEmail: feedbackSenderEmail.trim()
      };

      await submitAppFeedback(feedbackPayload);
      setFeedbackSubmitted(true);
      setFeedbackMessage('');
      setFeedbackSubject('');
    } catch (err) {
      console.error('Error submitting feedback:', err);
      setFeedbackError('Errore durante l\'invio. Puoi comunque inviare un\'email diretta a my360garage@gmail.com.');
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  // Support swipe right gesture to go back / close
  useSwipeBack({
    onBack: onClose,
    enabled: isOpen
  });

  useEffect(() => {
    if (isOpen) {
      setUnitDistance(settings.unitDistance);
      setCurrency(settings.currency);
      setFuelPriceAlerts(settings.fuelPriceAlerts);
      setPredictiveAlerts(settings.predictiveAlerts);
      setAutoBackup(settings.autoBackup);
      setStationDisplayMode(settings.stationDisplayMode || 'auto');
      setThemeColor(settings.themeColor || 'indigo');
      setThemeMode(settings.themeMode || 'light');
      setLanguage(settings.language || 'it');
    }
  }, [isOpen, settings]);

  if (!isOpen) return null;

  const handleSelectThemeColor = (theme: AppThemeColor) => {
    setThemeColor(theme);
    document.documentElement.setAttribute('data-theme', theme);
  };

  const handleSelectThemeMode = (mode: AppThemeMode) => {
    setThemeMode(mode);
    if (mode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleSelectLanguage = (lang: AppLanguage) => {
    setLanguage(lang);
    document.documentElement.setAttribute('lang', lang);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      unitDistance,
      currency,
      fuelPriceAlerts,
      predictiveAlerts,
      autoBackup,
      stationDisplayMode,
      themeColor,
      themeMode,
      language
    });
    onClose();
  };

  // Export garage as JSON
  const handleExportJSON = () => {
    if (vehicles.length === 0) {
      alert('Non ci sono veicoli nel garage da esportare.');
      return;
    }
    exportAllVehiclesToJSON(vehicles);
  };

  // Import JSON (Supports both single vehicle export and full garage backups)
  const handleImportJSON = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const parsed = await readJsonFile(file);
      if (!parsed) {
        alert('Il file selezionato è vuoto o non leggibile.');
        return;
      }

      if (parsed.exportType === 'single_vehicle' && parsed.vehicle) {
        const singleCar = sanitizeImportedVehicle(parsed.vehicle);
        // Merge single car into existing
        const existingWithoutThis = vehicles.filter(v => v.id !== singleCar.id);
        onImportGarage([singleCar, ...existingWithoutThis]);
        alert(`Veicolo "${singleCar.brand} ${singleCar.model}" (${singleCar.plate}) importato con successo!`);
        onClose();
      } else if (parsed.exportType === 'full_garage' && Array.isArray(parsed.vehicles)) {
        const sanitizedList = sanitizeImportedGarage(parsed.vehicles);
        onImportGarage(sanitizedList);
        alert(`Garage ripristinato con successo! ${sanitizedList.length} veicoli importati.`);
        onClose();
      } else if (parsed.brand && parsed.model) {
        // Direct single vehicle JSON
        const singleCar = sanitizeImportedVehicle(parsed);
        const existingWithoutThis = vehicles.filter(v => v.id !== singleCar.id);
        onImportGarage([singleCar, ...existingWithoutThis]);
        alert(`Veicolo "${singleCar.brand} ${singleCar.model}" importato con successo!`);
        onClose();
      } else if (Array.isArray(parsed)) {
        // Direct array
        const sanitizedList = sanitizeImportedGarage(parsed);
        onImportGarage(sanitizedList);
        alert(`Importazione completata con successo! ${sanitizedList.length} veicoli ripristinati.`);
        onClose();
      } else {
        alert('Il file JSON selezionato non ha una struttura valida per il garage.');
      }
    } catch (err) {
      alert('Errore nella lettura del file JSON.');
    } finally {
      e.target.value = '';
    }
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

            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-900/60 shrink-0 hidden xs:flex">
              <Settings className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white truncate">Impostazioni</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">Personalizza unità, notifiche e dati</p>
            </div>
          </div>
          <button 
            id="btn-close-settings-modal"
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* FORM / SETTINGS SECTIONS */}
        <form onSubmit={handleSave} className="flex flex-col gap-5">
          
          {/* BANNER GUIDA & TUTORIAL DELL'APP */}
          {onOpenTutorial && (
            <div className="p-3.5 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 flex items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-200 dark:border-blue-800">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-blue-950 dark:text-blue-200">
                    Guida Completa & Tutorial App
                  </h4>
                  <p className="text-[11px] text-blue-700 dark:text-blue-300 mt-0.5">
                    Rivedi il tutorial interattivo per scoprire al meglio tutte le funzionalità
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenTutorial();
                }}
                className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-black transition-all shadow-xs cursor-pointer shrink-0"
              >
                Avvia Guida
              </button>
            </div>
          )}

          {/* SECTION 1: UNIT & CURRENCY */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">Unità di Misura & Valuta</h4>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-600 dark:text-slate-400 font-semibold">Distanza</label>
                <select
                  value={unitDistance}
                  onChange={(e) => setUnitDistance(e.target.value as 'km' | 'mi')}
                  className="border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium cursor-pointer"
                >
                  <option value="km">Chilometri (km)</option>
                  <option value="mi">Miglia (mi)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-600 dark:text-slate-400 font-semibold">Valuta</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as '€' | '$' | '£')}
                  className="border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium cursor-pointer"
                >
                  <option value="€">Euro (€)</option>
                  <option value="$">Dollaro ($)</option>
                  <option value="£">Sterlina (£)</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 2: TEMA APPLICAZIONE (CHIARO O SCURO) & LINGUA */}
          <div className="flex flex-col gap-4 border-t border-slate-200 dark:border-slate-800 pt-4">
            
            {/* 2A. MODALITÀ TEMA: CHIARO O SCURO */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  {themeMode === 'dark' ? (
                    <Moon className="w-3.5 h-3.5 text-indigo-400" />
                  ) : (
                    <Sun className="w-3.5 h-3.5 text-amber-500" />
                  )}
                  <span>Tema dell'App</span>
                </h4>
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  {themeMode === 'dark' ? 'Modalità Scura attiva' : 'Modalità Chiara attiva'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleSelectThemeMode('light')}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    themeMode === 'light'
                      ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 ring-2 ring-indigo-600/20 shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <Sun className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Chiaro (Light)</span>
                  {themeMode === 'light' && <Check className="w-3.5 h-3.5 text-indigo-600 ml-auto" />}
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectThemeMode('dark')}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    themeMode === 'dark'
                      ? 'border-indigo-500 bg-slate-900 text-white ring-2 ring-indigo-500/30 shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <Moon className="w-4 h-4 text-indigo-300 shrink-0" />
                  <span>Scuro (Dark)</span>
                  {themeMode === 'dark' && <Check className="w-3.5 h-3.5 text-indigo-400 ml-auto" />}
                </button>
              </div>
            </div>

            {/* 2B. SELETTORE LINGUA: ITALIANO O INGLESE */}
            <div className="flex flex-col gap-2 pt-1">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Languages className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Lingua / Language</span>
                </h4>
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  {language === 'it' ? 'Italiano predefinito' : 'English active'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleSelectLanguage('it')}
                  className={`flex items-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    language === 'it'
                      ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/50 text-blue-950 dark:text-blue-200 ring-2 ring-blue-600/20 shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className="text-base leading-none">🇮🇹</span>
                  <span>Italiano (IT)</span>
                  {language === 'it' && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 ml-auto" />}
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectLanguage('en')}
                  className={`flex items-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    language === 'en'
                      ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/50 text-blue-950 dark:text-blue-200 ring-2 ring-blue-600/20 shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className="text-base leading-none">🇬🇧</span>
                  <span>English (EN)</span>
                  {language === 'en' && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 ml-auto" />}
                </button>
              </div>
            </div>

            {/* 2C. PALETTE COLORI ACCENTO */}
            <div className="flex flex-col gap-2 pt-1">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>Colore Accento</span>
                </h4>
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  {THEME_OPTIONS.find(t => t.id === themeColor)?.name}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {THEME_OPTIONS.map((t) => {
                  const isSelected = themeColor === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => handleSelectThemeColor(t.id)}
                      className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-slate-900 dark:border-slate-100 bg-slate-50 dark:bg-slate-800 shadow-2xs ring-2 ring-slate-900/10 dark:ring-white/10 font-bold'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50/60 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <span 
                        className="w-5 h-5 rounded-full shrink-0 flex items-center justify-center text-white shadow-2xs"
                        style={{ backgroundColor: t.hex }}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </span>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">{t.name}</span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 block truncate leading-tight">{t.desc.split(',')[0]}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* SECTION 2: MAP & STATIONS PREFERENCES */}
          <div className="flex flex-col gap-3 border-t border-slate-200 dark:border-slate-800 pt-4">
            <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">Mappa Distributori & Colonnine</h4>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-600 dark:text-slate-400 font-semibold">Filtro Automatico Stazioni</label>
              <select
                value={stationDisplayMode}
                onChange={(e) => setStationDisplayMode(e.target.value as 'auto' | 'fuel_only' | 'ev_only' | 'all')}
                className="border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium cursor-pointer"
              >
                <option value="auto">Automatico (in base ai veicoli nel tuo Garage)</option>
                <option value="fuel_only">Mostra solo Distributori Carburante (Benzina/Diesel/GPL/Metano)</option>
                <option value="ev_only">Mostra solo Colonnine Elettriche (EV / Tesla / Fast DC)</option>
                <option value="all">Mostra sempre tutto (Distributori + Colonnine)</option>
              </select>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                {stationDisplayMode === 'auto'
                  ? 'Se hai solo auto termiche/ibride nasconde di default le colonnine. Se hai solo elettriche BEV mostra solo colonnine.'
                  : 'Preferenza fissa per la mappa distributori.'}
              </span>
            </div>
          </div>

          {/* SECTION 3: AI & NOTIFICATIONS PREFERENCES */}
          <div className="flex flex-col gap-3 border-t border-slate-200 dark:border-slate-800 pt-4">
            <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center justify-between">
              <span>Funzionalità Smart & Notifiche</span>
              {userTier === 'FREE' && <ProBadge variant="pill" />}
            </h4>
            
            <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100/80 dark:hover:bg-slate-800 transition-colors cursor-pointer">
              <div>
                <span className="text-sm font-bold text-slate-900 dark:text-white block">Avvisi Manutenzione Predittiva</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">Suggerimenti basati su età veicolo, carburante e chilometri</span>
              </div>
              <input 
                type="checkbox" 
                checked={predictiveAlerts}
                onChange={(e) => setPredictiveAlerts(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded-sm focus:ring-blue-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100/80 dark:hover:bg-slate-800 transition-colors cursor-pointer">
              <div>
                <span className="text-sm font-bold text-slate-900 dark:text-white block">Notifiche Scadenze e Tagliandi</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">Avvisi su revisione, bollo, assicurazione e controllo liquidi</span>
              </div>
              <input 
                type="checkbox" 
                checked={fuelPriceAlerts}
                onChange={(e) => setFuelPriceAlerts(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded-sm focus:ring-blue-500"
              />
            </label>

            {/* PRO FEATURE: Avvisi Prezzi Carburante di Zona */}
            <div 
              onClick={() => {
                if (userTier === 'FREE') {
                  onOpenUpgradeModal?.('fuel_alerts');
                }
              }}
              className={`p-3 rounded-xl border flex items-center justify-between transition-colors ${
                userTier === 'FREE' 
                  ? 'border-amber-200 dark:border-amber-800/60 bg-amber-50/50 dark:bg-amber-950/40 hover:bg-amber-50 dark:hover:bg-amber-950/60 cursor-pointer' 
                  : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60'
              }`}
            >
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-slate-900 dark:text-white block">Avvisi Prezzi Carburante di Zona</span>
                  {userTier === 'FREE' ? <ProBadge variant="lock" /> : <ProBadge variant="mini" />}
                </div>
                <span className="text-xs text-slate-600 dark:text-slate-400">
                  Notifica automatica quando i distributori vicini abbassano i prezzi sotto la media
                </span>
              </div>
              <div>
                {userTier === 'FREE' ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenUpgradeModal?.('fuel_alerts');
                    }}
                    className="text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 hover:bg-amber-200 dark:hover:bg-amber-900/60 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                  >
                    Sblocca
                  </button>
                ) : (
                  <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                    Attivo
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 4: DATI, BACKUP & PASSAPORTO DIGITALE */}
          <div className="flex flex-col gap-3 border-t border-slate-200 dark:border-slate-800 pt-4">
            <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">Dati, Backup & Passaporto</h4>
            
            {/* Cloud Backup (PRO vs Local FREE) */}
            <div className={`p-3 rounded-xl border ${userTier === 'FREE' ? 'border-indigo-100 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-indigo-950/40' : 'border-emerald-200 dark:border-emerald-850 bg-emerald-50/50 dark:bg-emerald-950/40'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cloud className={`w-4 h-4 ${userTier === 'FREE' ? 'text-indigo-600 dark:text-indigo-400' : 'text-emerald-600 dark:text-emerald-400'}`} />
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {userTier === 'FREE' ? 'Salvataggio Dati Locale (FREE)' : 'Cloud Backup & Sincronizzazione (PRO)'}
                  </span>
                </div>
                {userTier === 'FREE' ? (
                  <button
                    type="button"
                    onClick={() => onOpenUpgradeModal?.('cloud_backup')}
                    className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                  >
                    Attiva Cloud PRO
                  </button>
                ) : (
                  <span className="text-[10px] font-extrabold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full">
                    Sincronizzato
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                {userTier === 'FREE' 
                  ? 'I tuoi dati sono memorizzati in locale su questo dispositivo. Passa a PRO per backup su cloud e sync automatico.'
                  : 'I tuoi veicoli e registri sono salvati in sicurezza e sincronizzati su tutti i tuoi dispositivi.'}
              </p>
            </div>

            {/* Passaporto Digitale Certificato (PRO Feature: PDF / CSV) */}
            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Passaporto Digitale (PDF & CSV)</span>
                  {userTier === 'FREE' && <ProBadge variant="mini" />}
                </div>
                {userTier === 'FREE' && (
                  <button
                    type="button"
                    onClick={() => onOpenUpgradeModal?.('export_pdf')}
                    className="text-[11px] font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded-md hover:bg-amber-200 dark:hover:bg-amber-900/60 cursor-pointer"
                  >
                    Solo PRO
                  </button>
                )}
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                Esporta lo storico completo del veicolo certificato per compravendita, assicurazione o contabilità personale.
              </p>

              {vehicles.length > 0 && (
                <div className="flex flex-col gap-1.5 pt-1">
                  {vehicles.map(v => (
                    <div key={v.id} className="flex items-center justify-between p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
                      <span className="font-bold text-slate-800 dark:text-slate-100 truncate">{v.brand} {v.model} ({v.plate})</span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            if (userTier === 'FREE') {
                              onOpenUpgradeModal?.('export_pdf');
                            } else {
                              openPrintableDigitalPassport(v);
                            }
                          }}
                          className="px-2 py-1 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-900 dark:text-indigo-200 font-bold text-[11px] rounded-md inline-flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Printer className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                          <span>PDF</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (userTier === 'FREE') {
                              onOpenUpgradeModal?.('export_csv');
                            } else {
                              exportVehiclePassportCSV(v);
                            }
                          }}
                          className="px-2 py-1 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200 font-bold text-[11px] rounded-md inline-flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <FileSpreadsheet className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          <span>CSV</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Esportazione / Importazione standard JSON */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={handleExportJSON}
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-xs font-bold text-slate-900 dark:text-white transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Esporta Garage JSON ({vehicles.length})</span>
              </button>

              <label className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-xs font-bold text-slate-900 dark:text-white transition-colors cursor-pointer">
                <Upload className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Importa File JSON</span>
                <input 
                  type="file" 
                  accept=".json,application/json" 
                  onChange={handleImportJSON} 
                  className="hidden" 
                />
              </label>
            </div>

            {/* DEV MODE: SWITCH USER TIER (FREE <-> PRO) */}
            <div className="mt-2 p-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/50 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Crown className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    Stato Account: <span className={userTier === 'PRO' ? 'text-amber-600 dark:text-amber-400' : 'text-slate-600 dark:text-slate-400'}>{userTier}</span>
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">DEV MODE</span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] text-slate-600 dark:text-slate-400">
                  {userTier === 'FREE' 
                    ? 'Attualmente su piano FREE (max 1 veicolo). Puoi simulare il passaggio a PRO.' 
                    : 'Attualmente su piano PRO (Garage illimitato, AI, PDF/CSV). Puoi testare il piano FREE.'}
                </span>

                <button
                  type="button"
                  id="btn-dev-toggle-tier"
                  onClick={onToggleUserTier}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer shadow-2xs ${
                    userTier === 'FREE'
                      ? 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                      : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100'
                  }`}
                >
                  {userTier === 'FREE' ? '⚡ Simula Upgrade a PRO' : '↩ Torna a Piano FREE'}
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                if (confirm('Attenzione: sei sicuro di voler rimuovere tutti i veicoli e i registri dal tuo garage?')) {
                  onResetGarage();
                  onClose();
                }
              }}
              className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/60 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-xs font-bold text-rose-600 dark:text-rose-400 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Svuota / Azzera Dati Garage</span>
            </button>
          </div>

          {/* SECTION 5: ACCOUNT & CLOUD SYNC */}
          <div className="flex flex-col gap-3.5 border-t border-slate-200 dark:border-slate-800 pt-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 border border-purple-100 dark:border-purple-900/60 shadow-2xs mt-0.5">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <span>Account & Cloud Sync</span>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                      account?.isLoggedIn 
                        ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800' 
                        : 'text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-900/60'
                    }`}>
                      {account?.isLoggedIn ? 'Cloud Connesso' : 'Profilo Locale'}
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                    Gestione profilo conducente, credenziali di accesso e sincronizzazione dei dati del garage su cloud.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl border border-slate-200/90 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-black text-sm text-purple-700 dark:text-purple-300 shrink-0 shadow-2xs">
                  {account?.name ? account.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                      {account?.name || 'Utente My360Garage'}
                    </span>
                    <span className={`text-[9.5px] font-black px-1.5 py-0.2 rounded uppercase ${
                      userTier === 'PRO' ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}>
                      {userTier === 'PRO' ? 'PRO ATTIVO' : 'FREE'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {account?.email || 'Nessun account cloud collegato (salvataggio locale offline)'}
                  </p>
                </div>
              </div>

              {onOpenAccount && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenAccount();
                  }}
                  className="px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-slate-700 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-xs font-bold rounded-xl transition-all shadow-2xs flex items-center gap-1 shrink-0 cursor-pointer active:scale-95"
                >
                  <span>Gestisci</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* SECTION 6: SEGNALAZIONI & MIGLIORAMENTI SEPARATI (FILO DIRETTO AL PROPRIETARIO) */}
          <div id="section-feedback" className="flex flex-col gap-3.5 border-t border-slate-200 dark:border-slate-800 pt-4 scroll-mt-6">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2.5">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border shadow-2xs mt-0.5 ${
                  feedbackMode === 'report'
                    ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/60'
                    : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900/60'
                }`}>
                  {feedbackMode === 'report' ? <Bug className="w-4 h-4" /> : <Lightbulb className="w-4 h-4" />}
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <span>{feedbackMode === 'report' ? 'Segnalazione Bug & Errori' : 'Proposte di Miglioramento'}</span>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                      feedbackMode === 'report'
                        ? 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-900/60'
                        : 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-900/60'
                    }`}>
                      {feedbackMode === 'report' ? 'Assistenza Tecnica' : 'Idee & Sviluppo'}
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                    {feedbackMode === 'report'
                      ? 'Hai riscontrato un problema tecnico o un malfunzionamento? Segnalalo per consentirci di correggerlo rapidamente.'
                      : 'Hai un\'idea o una funzione che vorresti vedere su My360Garage? Invia i tuoi suggerimenti direttamente allo sviluppatore.'}
                  </p>
                </div>
              </div>
            </div>

            {/* SEPARATED TABS: SEGNALAZIONE VS MIGLIORAMENTO */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
              <button
                type="button"
                onClick={() => {
                  setFeedbackMode('report');
                  setFeedbackType('bug');
                }}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  feedbackMode === 'report'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Bug className="w-3.5 h-3.5" />
                <span>Segnala Errore / Bug</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setFeedbackMode('improvement');
                  setFeedbackType('improvement');
                }}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  feedbackMode === 'improvement'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Lightbulb className="w-3.5 h-3.5" />
                <span>Proponi Miglioramento</span>
              </button>
            </div>

            {feedbackSubmitted ? (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex flex-col gap-3 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-black text-emerald-900 dark:text-emerald-200">
                      {feedbackMode === 'report' ? 'Segnalazione inviata con successo!' : 'Proposta registrata con successo!'}
                    </h5>
                    <p className="text-[11px] text-emerald-800 dark:text-emerald-300 mt-0.5 leading-relaxed">
                      {feedbackMode === 'report' 
                        ? 'Abbiamo ricevuto la tua segnalazione tecnica e la analizzeremo al più presto.'
                        : 'Grazie per il tuo prezioso contributo al miglioramento di My360Garage!'}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <a
                    href={buildOwnerMailtoLink({
                      type: feedbackType,
                      subject: feedbackSubject || (feedbackMode === 'report' ? 'Segnalazione Bug' : 'Proposta Miglioramento'),
                      message: feedbackMessage || '(Dettagli...)',
                      senderName: feedbackSenderName,
                      senderEmail: feedbackSenderEmail
                    })}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-emerald-100/70 dark:hover:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 text-xs font-bold transition-all shadow-2xs"
                  >
                    <Mail className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Invia anche via Email</span>
                    <ExternalLink className="w-3 h-3 text-emerald-600 dark:text-emerald-400 opacity-60" />
                  </a>

                  <button
                    type="button"
                    onClick={() => setFeedbackSubmitted(false)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all cursor-pointer shadow-2xs"
                  >
                    Invia un'altra comunicazione
                  </button>
                </div>
              </div>
            ) : (
              <div className={`border rounded-2xl p-3.5 sm:p-4 flex flex-col gap-3 transition-colors ${
                feedbackMode === 'report'
                  ? 'bg-rose-50/30 dark:bg-rose-950/20 border-rose-200/80 dark:border-rose-900/40'
                  : 'bg-indigo-50/30 dark:bg-indigo-950/20 border-indigo-200/80 dark:border-indigo-900/40'
              }`}>
                {/* Sotto-categoria */}
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    {feedbackMode === 'report' ? 'Tipologia di Problema' : 'Ambito del Miglioramento'}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    {feedbackMode === 'report' ? [
                      { id: 'bug', label: 'Bug / Blocco', icon: '🐛' },
                      { id: 'ui', label: 'Grafica / Testo', icon: '🖥️' },
                      { id: 'calc', label: 'Calcoli / Dati', icon: '🔢' },
                      { id: 'other', label: 'Altro Errore', icon: '⚠️' }
                    ].map(t => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setFeedbackType(t.id as any)}
                        className={`px-2 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 border ${
                          feedbackType === t.id
                            ? 'bg-rose-600 text-white border-rose-600 shadow-2xs'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-rose-300'
                        }`}
                      >
                        <span>{t.icon}</span>
                        <span className="truncate">{t.label}</span>
                      </button>
                    )) : [
                      { id: 'improvement', label: 'Miglioramento', icon: '💡' },
                      { id: 'feature', label: 'Nuova Funzione', icon: '⚡' },
                      { id: 'ui_ux', label: 'Interfaccia / UX', icon: '🎨' },
                      { id: 'other', label: 'Altra Idea', icon: '✨' }
                    ].map(t => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setFeedbackType(t.id as any)}
                        className={`px-2 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 border ${
                          feedbackType === t.id
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                        }`}
                      >
                        <span>{t.icon}</span>
                        <span className="truncate">{t.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Oggetto */}
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                    {feedbackMode === 'report' ? 'Oggetto dell\'errore' : 'Titolo della proposta'}
                  </label>
                  <input
                    type="text"
                    value={feedbackSubject}
                    onChange={(e) => setFeedbackSubject(e.target.value)}
                    placeholder={
                      feedbackMode === 'report'
                        ? 'Es: Errore durante il salvataggio del rifornimento...'
                        : 'Es: Integrazione telepass, esportazione PDF avanzata...'
                    }
                    className="border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                  />
                </div>

                {/* Messaggio */}
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                    {feedbackMode === 'report' ? 'Descrizione del problema riscontrato' : 'Descrizione del miglioramento desiderato'}{' '}
                    <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    value={feedbackMessage}
                    onChange={(e) => {
                      setFeedbackMessage(e.target.value);
                      if (feedbackError) setFeedbackError(null);
                    }}
                    rows={3}
                    placeholder={
                      feedbackMode === 'report'
                        ? 'Descrivi cosa stavi facendo, cosa è andato storto o quale messaggio è apparso...'
                        : 'Spiega in dettaglio cosa vorresti aggiungere e come ti piacerebbe che funzionasse...'
                    }
                    className="border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs focus:outline-none focus:border-indigo-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium resize-none"
                  />
                </div>

                {/* Mittente opzionale */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Tuo Nome (facoltativo)</label>
                    <input
                      type="text"
                      value={feedbackSenderName}
                      onChange={(e) => setFeedbackSenderName(e.target.value)}
                      placeholder="Es: Marco"
                      className="border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Tua Email (per eventuale risposta)</label>
                    <input
                      type="email"
                      value={feedbackSenderEmail}
                      onChange={(e) => setFeedbackSenderEmail(e.target.value)}
                      placeholder="nome@email.com"
                      className="border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                    />
                  </div>
                </div>

                {feedbackError && (
                  <p className="text-[11px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 p-2 rounded-lg border border-rose-200 dark:border-rose-900/60">
                    {feedbackError}
                  </p>
                )}

                {/* Pulsanti invio */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-1 border-t border-slate-200/80 dark:border-slate-700">
                  <a
                    href={buildOwnerMailtoLink({
                      type: feedbackType,
                      subject: feedbackSubject || (feedbackMode === 'report' ? 'Segnalazione Bug My360Garage' : 'Miglioramento My360Garage'),
                      message: feedbackMessage || '(Scrivi qui il tuo messaggio...)',
                      senderName: feedbackSenderName,
                      senderEmail: feedbackSenderEmail
                    })}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-all text-center"
                  >
                    <Mail className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                    <span>Scrivi a {OWNER_EMAIL}</span>
                    <ExternalLink className="w-3 h-3 text-slate-400 opacity-80" />
                  </a>

                  <button
                    type="button"
                    onClick={() => handleSubmitFeedback()}
                    disabled={isSubmittingFeedback || !feedbackMessage.trim()}
                    className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer shadow-xs ${
                      isSubmittingFeedback || !feedbackMessage.trim()
                        ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                        : feedbackMode === 'report'
                          ? 'bg-rose-600 hover:bg-rose-700 active:scale-95 text-white shadow-rose-600/20'
                          : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white shadow-indigo-600/20'
                    }`}
                  >
                    {isSubmittingFeedback ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : feedbackMode === 'report' ? (
                      <Bug className="w-3.5 h-3.5" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                    <span>
                      {isSubmittingFeedback 
                        ? 'Invio in corso...' 
                        : feedbackMode === 'report' 
                          ? 'Invia Segnalazione Bug' 
                          : 'Invia Proposta Miglioramento'}
                    </span>
                  </button>
                </div>
              </div>
            )}
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
              id="btn-save-settings-submit"
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-colors shadow-xs cursor-pointer"
            >
              Salva Impostazioni
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
