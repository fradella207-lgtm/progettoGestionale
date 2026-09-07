import React, { useState, useEffect } from 'react';
import { X, ArrowLeft, Settings, Sliders, Database, Download, Upload, Trash2, RefreshCw, CheckCircle2, Car, Palette, Check } from 'lucide-react';
import { AppSettings, Vehicle, AppThemeColor } from '../../types';
import { useSwipeBack } from '../../hooks/useSwipeBack';
import { 
  exportAllVehiclesToJSON, 
  exportVehicleToJSON, 
  readJsonFile, 
  sanitizeImportedGarage, 
  sanitizeImportedVehicle 
} from '../../utils/vehicleExportImport';

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
  onSaveSettings: (newSettings: AppSettings) => void;
  onResetGarage: () => void;
  onImportGarage: (importedVehicles: Vehicle[]) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  vehicles,
  onSaveSettings,
  onResetGarage,
  onImportGarage
}) => {
  const [unitDistance, setUnitDistance] = useState<'km' | 'mi'>(settings.unitDistance);
  const [currency, setCurrency] = useState<'€' | '$' | '£'>(settings.currency);
  const [fuelPriceAlerts, setFuelPriceAlerts] = useState<boolean>(settings.fuelPriceAlerts);
  const [predictiveAlerts, setPredictiveAlerts] = useState<boolean>(settings.predictiveAlerts);
  const [autoBackup, setAutoBackup] = useState<boolean>(settings.autoBackup);
  const [stationDisplayMode, setStationDisplayMode] = useState<'auto' | 'fuel_only' | 'ev_only' | 'all'>(settings.stationDisplayMode || 'auto');
  const [themeColor, setThemeColor] = useState<AppThemeColor>(settings.themeColor || 'indigo');

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
    }
  }, [isOpen, settings]);

  if (!isOpen) return null;

  const handleSelectTheme = (theme: AppThemeColor) => {
    setThemeColor(theme);
    document.documentElement.setAttribute('data-theme', theme);
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
      themeColor
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

            <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#2563eb] flex items-center justify-center border border-blue-100 shrink-0 hidden xs:flex">
              <Settings className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-extrabold text-[#0f172a] truncate">Impostazioni</h3>
              <p className="text-xs text-[#64748b] truncate">Personalizza unità, notifiche e dati</p>
            </div>
          </div>
          <button 
            id="btn-close-settings-modal"
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* FORM / SETTINGS SECTIONS */}
        <form onSubmit={handleSave} className="flex flex-col gap-5">
          
          {/* SECTION 1: UNIT & CURRENCY */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-extrabold text-[#0f172a] uppercase tracking-wider">Unità di Misura & Valuta</h4>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-[#64748b] font-semibold">Distanza</label>
                <select
                  value={unitDistance}
                  onChange={(e) => setUnitDistance(e.target.value as 'km' | 'mi')}
                  className="border border-[#e2e8f0] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#2563eb] bg-white font-medium"
                >
                  <option value="km">Chilometri (km)</option>
                  <option value="mi">Miglia (mi)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-[#64748b] font-semibold">Valuta</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as '€' | '$' | '£')}
                  className="border border-[#e2e8f0] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#2563eb] bg-white font-medium"
                >
                  <option value="€">Euro (€)</option>
                  <option value="$">Dollaro ($)</option>
                  <option value="£">Sterlina (£)</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 2: TEMA & COLORI APPLICAZIONE */}
          <div className="flex flex-col gap-3 border-t border-[#e2e8f0] pt-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold text-[#0f172a] uppercase tracking-wider flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-indigo-600" />
                <span>Tema & Colori Applicazione</span>
              </h4>
              <span className="text-[11px] font-bold text-slate-500">
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
                    onClick={() => handleSelectTheme(t.id)}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-slate-900 bg-slate-50 shadow-2xs ring-2 ring-slate-900/10 font-bold'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                    }`}
                  >
                    <span 
                      className="w-5 h-5 rounded-full shrink-0 flex items-center justify-center text-white shadow-2xs"
                      style={{ backgroundColor: t.hex }}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </span>
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-slate-900 block truncate">{t.name}</span>
                      <span className="text-[10px] text-slate-400 block truncate leading-tight">{t.desc.split(',')[0]}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

            {/* SECTION 2: MAP & STATIONS PREFERENCES */}
          <div className="flex flex-col gap-3 border-t border-[#e2e8f0] pt-4">
            <h4 className="text-xs font-extrabold text-[#0f172a] uppercase tracking-wider">Mappa Distributori & Colonnine</h4>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-[#64748b] font-semibold">Filtro Automatico Stazioni</label>
              <select
                value={stationDisplayMode}
                onChange={(e) => setStationDisplayMode(e.target.value as 'auto' | 'fuel_only' | 'ev_only' | 'all')}
                className="border border-[#e2e8f0] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#2563eb] bg-white font-medium"
              >
                <option value="auto">Automatico (in base ai veicoli nel tuo Garage)</option>
                <option value="fuel_only">Mostra solo Distributori Carburante (Benzina/Diesel/GPL/Metano)</option>
                <option value="ev_only">Mostra solo Colonnine Elettriche (EV / Tesla / Fast DC)</option>
                <option value="all">Mostra sempre tutto (Distributori + Colonnine)</option>
              </select>
              <span className="text-[11px] text-slate-500">
                {stationDisplayMode === 'auto'
                  ? 'Se hai solo auto termiche/ibride nasconde di default le colonnine. Se hai solo elettriche BEV mostra solo colonnine.'
                  : 'Preferenza fissa per la mappa distributori.'}
              </span>
            </div>
          </div>

          {/* SECTION 3: AI & NOTIFICATIONS PREFERENCES */}
          <div className="flex flex-col gap-3 border-t border-[#e2e8f0] pt-4">
            <h4 className="text-xs font-extrabold text-[#0f172a] uppercase tracking-wider">Funzionalità Smart</h4>
            
            <label className="flex items-center justify-between p-3 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] hover:bg-white transition-colors cursor-pointer">
              <div>
                <span className="text-sm font-bold text-[#0f172a] block">Avvisi Manutenzione Predittiva AI</span>
                <span className="text-xs text-[#64748b]">Suggerimenti automatici basati su età veicolo, carburante e chilometri</span>
              </div>
              <input 
                type="checkbox" 
                checked={predictiveAlerts}
                onChange={(e) => setPredictiveAlerts(e.target.checked)}
                className="w-4 h-4 text-[#2563eb] rounded-sm focus:ring-[#2563eb]"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] hover:bg-white transition-colors cursor-pointer">
              <div>
                <span className="text-sm font-bold text-[#0f172a] block">Notifiche Scadenze e Tagliandi</span>
                <span className="text-xs text-[#64748b]">Avvisi su revisione, filtri, cinghie e controllo liquidi</span>
              </div>
              <input 
                type="checkbox" 
                checked={fuelPriceAlerts}
                onChange={(e) => setFuelPriceAlerts(e.target.checked)}
                className="w-4 h-4 text-[#2563eb] rounded-sm focus:ring-[#2563eb]"
              />
            </label>
          </div>

          {/* SECTION 3: BACKUP & GARAGE DATA */}
          <div className="flex flex-col gap-3 border-t border-[#e2e8f0] pt-4">
            <h4 className="text-xs font-extrabold text-[#0f172a] uppercase tracking-wider">Dati & Backup Garage</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={handleExportJSON}
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-[#e2e8f0] hover:bg-slate-50 text-xs font-bold text-[#0f172a] transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4 text-[#2563eb]" />
                <span>Esporta Garage ({vehicles.length})</span>
              </button>

              <label className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-[#e2e8f0] hover:bg-slate-50 text-xs font-bold text-[#0f172a] transition-colors cursor-pointer">
                <Upload className="w-4 h-4 text-[#059669]" />
                <span>Importa File JSON</span>
                <input 
                  type="file" 
                  accept=".json,application/json" 
                  onChange={handleImportJSON} 
                  className="hidden" 
                />
              </label>
            </div>

            {/* Singoli Veicoli Esportabili */}
            {vehicles.length > 0 && (
              <div className="flex flex-col gap-1.5 p-2.5 bg-slate-50 rounded-xl border border-slate-200/70">
                <span className="text-[10.5px] font-extrabold text-slate-500 uppercase tracking-wider">Esporta singolo veicolo:</span>
                <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
                  {vehicles.map(v => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => exportVehicleToJSON(v)}
                      className="flex items-center gap-1.5 px-2.5 py-1 bg-white hover:bg-indigo-50 text-slate-800 hover:text-indigo-700 text-xs font-bold rounded-lg border border-slate-200 hover:border-indigo-200 transition-all active:scale-95 cursor-pointer shadow-2xs"
                      title={`Esporta dati completi di ${v.brand} ${v.model} in JSON`}
                    >
                      <Download className="w-3 h-3 text-indigo-600" />
                      <span>{v.brand} {v.model} ({v.plate})</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                if (confirm('Attenzione: sei sicuro di voler rimuovere tutti i veicoli e i registri dal tuo garage?')) {
                  onResetGarage();
                  onClose();
                }
              }}
              className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-red-200 bg-red-50/60 hover:bg-red-100 text-xs font-bold text-[#dc2626] transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Svuota / Azzera Dati Garage</span>
            </button>
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
              id="btn-save-settings-submit"
              className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-colors shadow-xs"
            >
              Salva Impostazioni
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
