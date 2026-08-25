import React, { useState, useEffect } from 'react';
import { X, Settings, Sliders, Database, Download, Upload, Trash2, RefreshCw, CheckCircle2 } from 'lucide-react';
import { AppSettings, Vehicle } from '../../types';

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

  useEffect(() => {
    if (isOpen) {
      setUnitDistance(settings.unitDistance);
      setCurrency(settings.currency);
      setFuelPriceAlerts(settings.fuelPriceAlerts);
      setPredictiveAlerts(settings.predictiveAlerts);
      setAutoBackup(settings.autoBackup);
    }
  }, [isOpen, settings]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      unitDistance,
      currency,
      fuelPriceAlerts,
      predictiveAlerts,
      autoBackup
    });
    onClose();
  };

  // Export garage as JSON
  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(vehicles, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `garage_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import JSON
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (Array.isArray(parsed) && parsed.length > 0) {
            onImportGarage(parsed);
            alert(`Importazione completata con successo! ${parsed.length} veicoli ripristinati.`);
            onClose();
          } else {
            alert('Il file JSON selezionato non ha una struttura valida per il garage.');
          }
        } catch (err) {
          alert('Errore nella lettura del file JSON.');
        }
      };
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-[24px] w-full max-w-lg p-6 sm:p-7 shadow-2xl flex flex-col gap-5 max-h-[90vh] overflow-y-auto font-['Plus_Jakarta_Sans',sans-serif]">
        
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#2563eb] flex items-center justify-center border border-blue-100">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-[#0f172a]">Impostazioni Generali</h3>
              <p className="text-xs text-[#64748b]">Personalizza unità di misura, notifiche e gestione dati</p>
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

          {/* SECTION 2: AI & NOTIFICATIONS PREFERENCES */}
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
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-[#e2e8f0] hover:bg-slate-50 text-xs font-bold text-[#0f172a] transition-colors"
              >
                <Download className="w-4 h-4 text-[#2563eb]" />
                <span>Esporta Garage (JSON)</span>
              </button>

              <label className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-[#e2e8f0] hover:bg-slate-50 text-xs font-bold text-[#0f172a] transition-colors cursor-pointer">
                <Upload className="w-4 h-4 text-[#059669]" />
                <span>Importa Backup JSON</span>
                <input 
                  type="file" 
                  accept=".json" 
                  onChange={handleImportJSON} 
                  className="hidden" 
                />
              </label>
            </div>

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
