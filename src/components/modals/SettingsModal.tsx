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
  Check,
  Sun,
  Moon,
  Crown,
  Bell,
  User,
  ChevronRight,
  Sparkles,
  HelpCircle,
  MessageSquareHeart,
  Globe,
  SlidersHorizontal,
  FileSpreadsheet
} from 'lucide-react';
import { AppSettings, Vehicle, AppThemeColor, AppThemeMode, AppLanguage, UserTier, ProFeatureName, UserAccount } from '../../types';
import { useSwipeBack } from '../../hooks/useSwipeBack';
import { exportAllVehiclesToJSON, readJsonFile, sanitizeImportedGarage } from '../../utils/vehicleExportImport';

const THEME_OPTIONS: { id: AppThemeColor; name: string; hex: string; bgClass: string; desc: string }[] = [
  { id: 'indigo', name: 'Indaco', hex: '#4f46e5', bgClass: 'bg-indigo-600', desc: 'Predefinito, sobrio ed elegante' },
  { id: 'blue', name: 'Blu Cobalto', hex: '#2563eb', bgClass: 'bg-blue-600', desc: 'Sportivo e tecnologico' },
  { id: 'emerald', name: 'Verde Smeraldo', hex: '#059669', bgClass: 'bg-emerald-600', desc: 'Racing Green & Eco' },
  { id: 'violet', name: 'Viola', hex: '#7c3aed', bgClass: 'bg-violet-600', desc: 'Moderno ed espressivo' },
  { id: 'amber', name: 'Ambra GT', hex: '#d97706', bgClass: 'bg-amber-600', desc: 'Caldo e dinamico' },
  { id: 'rose', name: 'Rosso Corsa', hex: '#e11d48', bgClass: 'bg-rose-600', desc: 'Passione automobilistica' },
  { id: 'slate', name: 'Grafite', hex: '#334155', bgClass: 'bg-slate-700', desc: 'Monocromatico minimal' },
];

type SettingsTab = 'general' | 'appearance' | 'notifications' | 'data';

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
  onOpenFeedback?: (mode?: 'report' | 'improvement') => void;
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
  onOpenTutorial,
  onOpenFeedback
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');

  // Controlled form state
  const [unitDistance, setUnitDistance] = useState<'km' | 'mi'>(settings.unitDistance);
  const [currency, setCurrency] = useState<'€' | '$' | '£'>(settings.currency);
  const [fuelPriceAlerts, setFuelPriceAlerts] = useState<boolean>(settings.fuelPriceAlerts);
  const [predictiveAlerts, setPredictiveAlerts] = useState<boolean>(settings.predictiveAlerts);
  const [autoBackup, setAutoBackup] = useState<boolean>(settings.autoBackup);
  const [stationDisplayMode, setStationDisplayMode] = useState<'auto' | 'fuel_only' | 'ev_only' | 'all'>(settings.stationDisplayMode || 'auto');
  const [themeColor, setThemeColor] = useState<AppThemeColor>(settings.themeColor || 'indigo');
  const [themeMode, setThemeMode] = useState<AppThemeMode>(settings.themeMode || 'light');
  const [language, setLanguage] = useState<AppLanguage>(settings.language || 'it');

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

      if (initialSection === 'feedback' || initialSection === 'report' || initialSection === 'improvement') {
        setActiveTab('data');
      } else if (initialSection === 'account') {
        setActiveTab('data');
      } else {
        setActiveTab('general');
      }
    }
  }, [isOpen, settings, initialSection]);

  useSwipeBack({
    onBack: onClose,
    enabled: isOpen
  });

  if (!isOpen) return null;

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
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

  const handleExportJSON = () => {
    exportAllVehiclesToJSON(vehicles);
  };

  const handleImportJSON = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const content = await readJsonFile(file);
      const parsed = JSON.parse(content);
      const sanitized = sanitizeImportedGarage(parsed);
      if (sanitized.length > 0) {
        onImportGarage(sanitized);
        alert(`Garage importato con successo! ${sanitized.length} veicoli caricati.`);
        onClose();
      } else {
        alert('Nessun veicolo valido trovato nel file.');
      }
    } catch (err) {
      console.error(err);
      alert('Errore nella lettura del file JSON. Assicurati che sia un export valido di My360Garage.');
    }
    e.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* MODAL HEADER */}
        <div className="p-4 sm:p-5 bg-white/95 dark:bg-slate-900/95 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 sticky top-0 z-20 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 active:scale-95 text-slate-800 dark:text-slate-200 text-xs font-black border border-slate-200 dark:border-slate-700 transition-all cursor-pointer shrink-0 shadow-2xs group"
              title="Torna indietro"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              <span>Indietro</span>
            </button>
            <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-2xs">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-tight">
                Impostazioni
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Personalizza preferenze, tema e dati
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
            aria-label="Chiudi impostazioni"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* TABS NAVIGATION BAR (Simplified & Direct) */}
        <div className="px-4 pt-3 pb-2 bg-slate-50/70 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {[
            { id: 'general', label: 'Generale', icon: SlidersHorizontal },
            { id: 'appearance', label: 'Aspetto & Tema', icon: Sun },
            { id: 'notifications', label: 'Notifiche', icon: Bell },
            { id: 'data', label: 'Dati & Aiuto', icon: Database }
          ].map(t => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id as SettingsTab)}
                className={`flex items-center gap-2 py-2 px-3.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                  isActive 
                    ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-xs' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB CONTENTS */}
        <form onSubmit={handleSave} className="p-4 sm:p-6 overflow-y-auto flex-1 flex flex-col gap-5">
          
          {/* TAB 1: GENERALE */}
          {activeTab === 'general' && (
            <div className="flex flex-col gap-4 animate-in fade-in duration-150">
              
              {/* Unità di Misura & Valuta in una griglia ordinata */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col gap-2">
                  <label className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                    Unità di Distanza
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setUnitDistance('km')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
                        unitDistance === 'km'
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>Chilometri (km)</span>
                      {unitDistance === 'km' && <Check className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => setUnitDistance('mi')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
                        unitDistance === 'mi'
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>Miglia (mi)</span>
                      {unitDistance === 'mi' && <Check className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col gap-2">
                  <label className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                    Valuta Principale
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: '€', label: 'Euro (€)' },
                      { id: '$', label: 'Dollaro ($)' },
                      { id: '£', label: 'Sterlina (£)' }
                    ].map(c => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setCurrency(c.id as any)}
                        className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer border ${
                          currency === c.id
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span>{c.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Lingua dell'Applicazione */}
              <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <label className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                    Lingua dell&apos;Interfaccia
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setLanguage('it')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      language === 'it'
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>🇮🇹 Italiano</span>
                    {language === 'it' && <Check className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setLanguage('en')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      language === 'en'
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>🇬🇧 English</span>
                    {language === 'en' && <Check className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Filtro Mappa Distributori */}
              <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col gap-2">
                <label className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                  Visualizzazione Mappa Prezzi & Colonnine
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {[
                    { id: 'auto', label: 'Auto (Veicolo)' },
                    { id: 'fuel_only', label: 'Solo Pompe' },
                    { id: 'ev_only', label: 'Solo Elettrico' },
                    { id: 'all', label: 'Tutti i Punti' }
                  ].map(opt => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setStationDisplayMode(opt.id as any)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer border truncate ${
                        stationDisplayMode === opt.id
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ASPETTO & TEMA (Zero contrast clashes, high legibility) */}
          {activeTab === 'appearance' && (
            <div className="flex flex-col gap-4 animate-in fade-in duration-150">
              
              {/* Modalità Chiaro / Scuro */}
              <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col gap-2.5">
                <label className="text-xs font-extrabold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                  <span>Modalità Schermo</span>
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    {themeMode === 'dark' ? 'Tema Notturno Attivo' : 'Tema Diurno Attivo'}
                  </span>
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setThemeMode('light')}
                    className={`p-3 rounded-2xl border text-xs font-bold transition-all flex items-center gap-3 cursor-pointer ${
                      themeMode === 'light'
                        ? 'bg-white text-slate-900 border-indigo-600 ring-2 ring-indigo-500/20 shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shrink-0">
                      <Sun className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <span className="block font-black">Tema Chiaro</span>
                      <span className="text-[10px] text-slate-500 font-normal">Sfondo pulito ad alto contrasto</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setThemeMode('dark')}
                    className={`p-3 rounded-2xl border text-xs font-bold transition-all flex items-center gap-3 cursor-pointer ${
                      themeMode === 'dark'
                        ? 'bg-slate-900 text-white border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-indigo-950 text-indigo-300 border border-indigo-800 flex items-center justify-center shrink-0">
                      <Moon className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <span className="block font-black">Tema Scuro</span>
                      <span className="text-[10px] text-slate-400 font-normal">Nero profondo, riposante per gli occhi</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Colore di Accento dell'App */}
              <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col gap-2.5">
                <label className="text-xs font-extrabold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                  <span>Colore Primario dell&apos;App</span>
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    {THEME_OPTIONS.find(t => t.id === themeColor)?.name}
                  </span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {THEME_OPTIONS.map(color => (
                    <button
                      key={color.id}
                      type="button"
                      onClick={() => setThemeColor(color.id)}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                        themeColor === color.id
                          ? 'bg-white dark:bg-slate-800 border-slate-900 dark:border-white shadow-2xs ring-1 ring-slate-900 dark:ring-white'
                          : 'bg-white/60 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div 
                          className="w-5 h-5 rounded-full shrink-0 shadow-2xs border border-black/10"
                          style={{ backgroundColor: color.hex }}
                        />
                        <div className="text-left min-w-0">
                          <span className="text-slate-900 dark:text-white block font-bold truncate">{color.name}</span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate block font-normal">{color.desc}</span>
                        </div>
                      </div>
                      {themeColor === color.id && (
                        <Check className="w-4 h-4 text-slate-900 dark:text-white shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: NOTIFICHE & PROMEMORIA */}
          {activeTab === 'notifications' && (
            <div className="flex flex-col gap-3.5 animate-in fade-in duration-150">
              <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-200 dark:border-amber-900">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                      Promemoria Scadenze (Bollo, Revisione, Assicurazione)
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                      Ricevi avvisi preventivi all&apos;avvicinarsi della data di scadenza dei documenti ministeriali.
                    </p>
                  </div>
                </div>
                <input 
                  type="checkbox" 
                  checked={fuelPriceAlerts} 
                  onChange={(e) => setFuelPriceAlerts(e.target.checked)}
                  className="w-5 h-5 rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer shrink-0" 
                />
              </div>

              <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-200 dark:border-indigo-900">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                      Suggerimenti Manutenzione Predittiva
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                      Stima automatica dei tagliandi in base al tuo ritmo di percorrenza chilometrica mensile.
                    </p>
                  </div>
                </div>
                <input 
                  type="checkbox" 
                  checked={predictiveAlerts} 
                  onChange={(e) => setPredictiveAlerts(e.target.checked)}
                  className="w-5 h-5 rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer shrink-0" 
                />
              </div>

              <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-200 dark:border-emerald-900">
                    <Database className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                      Salvataggio & Backup Automatico
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                      Persistenza immediata di ogni rifornimento, spesa e chilometraggio in memoria e su cloud.
                    </p>
                  </div>
                </div>
                <input 
                  type="checkbox" 
                  checked={autoBackup} 
                  onChange={(e) => setAutoBackup(e.target.checked)}
                  className="w-5 h-5 rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer shrink-0" 
                />
              </div>
            </div>
          )}

          {/* TAB 4: DATI, SUPPORTO & FILO DIRETTO (Simplified & Unified) */}
          {activeTab === 'data' && (
            <div className="flex flex-col gap-4 animate-in fade-in duration-150">
              
              {/* Account Quick Card */}
              <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black text-sm shrink-0">
                    {account?.name ? account.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {account?.name || 'Utente My360Garage'}
                      </span>
                      <span className={`text-[9px] font-black px-1.5 py-0.2 rounded uppercase ${
                        userTier === 'PRO' ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}>
                        {userTier === 'PRO' ? 'PRO' : 'FREE'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {account?.email || 'Nessun account cloud sincronizzato (offline)'}
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
                    className="px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold rounded-xl transition-all shadow-2xs flex items-center gap-1 shrink-0 cursor-pointer active:scale-95"
                  >
                    <span>Profilo</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                )}
              </div>

              {/* UNIFIED FEEDBACK & SUPPORT COMMAND (Unico comando unificato per segnalazioni e miglioramenti) */}
              <div className="p-3.5 rounded-2xl border border-indigo-100 dark:border-indigo-900/60 bg-gradient-to-r from-indigo-50/60 via-purple-50/40 to-white dark:from-indigo-950/40 dark:via-purple-950/20 dark:to-slate-900 flex items-center justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                    <MessageSquareHeart className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-indigo-950 dark:text-indigo-200">
                      Filo Diretto con lo Sviluppatore
                    </h4>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-snug">
                      Hai trovato un bug o hai un&apos;idea per migliorare l&apos;applicazione? Invia una comunicazione diretta in 1 click.
                    </p>
                  </div>
                </div>

                {onOpenFeedback && (
                  <button
                    type="button"
                    id="btn-settings-open-feedback"
                    onClick={() => {
                      onClose();
                      onOpenFeedback('report');
                    }}
                    className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95"
                  >
                    <span>Segnala o Suggerisci</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* GUIDA & TUTORIAL DELL'APP */}
              {onOpenTutorial && (
                <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-200 dark:border-blue-900">
                      <HelpCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        Guida & Tutorial Introduttivo
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Rivedi come calcolare i consumi, gestire i tagliandi e leggere le statistiche.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenTutorial();
                    }}
                    className="px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-bold rounded-xl transition-all shadow-2xs shrink-0 cursor-pointer"
                  >
                    Avvia Guida
                  </button>
                </div>
              )}

              {/* ESPORTAZIONE & IMPORTAZIONE JSON */}
              <div className="flex flex-col gap-2 pt-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Backup & Ripristino Garage
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleExportJSON}
                    className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-bold text-slate-900 dark:text-white transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>Esporta Dati JSON ({vehicles.length})</span>
                  </button>

                  <label className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-bold text-slate-900 dark:text-white transition-colors cursor-pointer">
                    <Upload className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Importa Dati JSON</span>
                    <input 
                      type="file" 
                      accept=".json,application/json" 
                      onChange={handleImportJSON} 
                      className="hidden" 
                    />
                  </label>
                </div>
              </div>

              {/* DEV MODE SWITCH TIER (COMPACT PILL) */}
              {onToggleUserTier && (
                <div className="p-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/40 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-amber-500" />
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Stato Account Simulata: {userTier}</span>
                      <span className="text-[10px] text-slate-400 block">Cambia piano per testare limitazioni FREE o sblocco PRO</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={onToggleUserTier}
                    className="px-2.5 py-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-white rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0"
                  >
                    {userTier === 'FREE' ? 'Passa a PRO' : 'Passa a FREE'}
                  </button>
                </div>
              )}

              {/* AZZERA GARAGE */}
              <button
                type="button"
                onClick={() => {
                  if (confirm('Attenzione: sei sicuro di voler rimuovere tutti i veicoli e i registri dal tuo garage?')) {
                    onResetGarage();
                    onClose();
                  }
                }}
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-xs font-bold text-rose-600 dark:text-rose-400 transition-colors cursor-pointer mt-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Azzera Dati Garage</span>
              </button>
            </div>
          )}

          {/* ACTIONS FOOTER */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-slate-800 mt-auto">
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
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-colors shadow-xs cursor-pointer active:scale-95"
            >
              Salva Impostazioni
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
