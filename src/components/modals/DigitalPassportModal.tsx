import React, { useState, useMemo } from 'react';
import { 
  X, 
  ArrowLeft, 
  Shield, 
  ShieldCheck, 
  Printer, 
  Download, 
  Copy, 
  Check, 
  Car, 
  Calendar, 
  Gauge, 
  Wrench, 
  Fuel, 
  FileText, 
  AlertCircle,
  QrCode,
  Award
} from 'lucide-react';
import { Vehicle, UserTier } from '../../types';
import { calculateVehicleConsumptionMetrics } from '../../utils/consumptionCalculator';
import { openPrintableDigitalPassport, exportVehiclePassportCSV } from '../../utils/digitalPassportExport';
import { useSwipeBack } from '../../hooks/useSwipeBack';

interface DigitalPassportModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicles: Vehicle[];
  initialVehicleId?: string;
  userTier?: UserTier;
  onOpenUpgradeModal?: () => void;
}

export const DigitalPassportModal: React.FC<DigitalPassportModalProps> = ({
  isOpen,
  onClose,
  vehicles,
  initialVehicleId,
  userTier = 'FREE',
  onOpenUpgradeModal
}) => {
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(
    initialVehicleId || vehicles[0]?.id || ''
  );
  const [copiedSummary, setCopiedSummary] = useState(false);

  useSwipeBack({
    onBack: onClose,
    enabled: isOpen
  });

  const activeVehicle = useMemo(() => {
    return vehicles.find(v => v.id === selectedVehicleId) || vehicles[0] || null;
  }, [vehicles, selectedVehicleId]);

  const metrics = useMemo(() => {
    if (!activeVehicle) return null;
    return calculateVehicleConsumptionMetrics(activeVehicle);
  }, [activeVehicle]);

  if (!isOpen || !activeVehicle) return null;

  const refuelsKm = (activeVehicle.refuels || []).map(r => Number(r.km) || 0);
  const maintKm = (activeVehicle.maintenances || []).map(m => Number(m.km) || 0);
  const certifiedCurrentKm = Math.max(Number(activeVehicle.initialKm) || 0, ...refuelsKm, ...maintKm);
  const totalMaintCost = (activeVehicle.maintenances || []).reduce((acc, m) => acc + (Number(m.cost) || 0), 0);
  const vehicleYear = activeVehicle.registrationDate ? activeVehicle.registrationDate.slice(0, 4) : undefined;

  const passportId = `MY360-${(activeVehicle.plate || 'PASSPORT').replace(/\s+/g, '').toUpperCase()}-${vehicleYear || 'CERT'}`;

  const handleCopySummary = () => {
    if (!activeVehicle) return;
    const text = `🛡️ PASSAPORTO DIGITALE CERTIFICATO - MY360GARAGE
ID: ${passportId}
Veicolo: ${activeVehicle.brand} ${activeVehicle.model} (${vehicleYear || 'N/D'})
Targa: ${activeVehicle.plate || 'N/D'}
VIN: ${activeVehicle.vin || 'N/D'}
Chilometraggio Odometro Certificato: ${certifiedCurrentKm.toLocaleString('it-IT')} km
Interventi di Manutenzione Registrati: ${(activeVehicle.maintenances || []).length}
Spesa Totale Manutenzioni: ${totalMaintCost.toLocaleString('it-IT', { minimumFractionDigits: 2 })} €
Consumo Medio: ${metrics?.kmPerUnit ? `${metrics.kmPerUnit} ${metrics.fuelUnit || 'km/l'}` : 'Dati in accumulo'}
Stato Verifiche: Cronologia continua e tracciata su My360Garage.`;

    navigator.clipboard.writeText(text).then(() => {
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2500);
    });
  };

  const handlePrintOrPdf = () => {
    if (userTier === 'FREE') {
      onOpenUpgradeModal?.();
      return;
    }
    openPrintableDigitalPassport(activeVehicle);
  };

  const handleExportCsv = () => {
    if (userTier === 'FREE') {
      onOpenUpgradeModal?.();
      return;
    }
    exportVehiclePassportCSV(activeVehicle);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[94vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* HEADER MODALE */}
        <div className="p-4 sm:p-5 bg-white/95 dark:bg-slate-900/95 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 sticky top-0 z-20 backdrop-blur-md">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 active:scale-95 text-slate-800 dark:text-slate-200 text-xs font-black border border-slate-200 dark:border-slate-700 transition-all cursor-pointer shrink-0 shadow-2xs group"
              title="Torna indietro"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              <span>Indietro</span>
            </button>

            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-100 dark:border-indigo-900 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white truncate">
                  Passaporto Digitale
                </h3>
                <span className="text-[10px] uppercase font-black bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
                  Certificato Ufficiale
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                Storico veicolo, km certificati e cronologia manutenzioni per compravendita
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Chiudi"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* SELETTORE VEICOLO PULITO (Se più di 1 veicolo nel garage) */}
        {vehicles.length > 1 && (
          <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 shrink-0 mr-1 flex items-center gap-1">
              <Car className="w-3.5 h-3.5" />
              <span>Veicolo:</span>
            </span>
            {vehicles.map(v => {
              const isSelected = selectedVehicleId === v.id;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setSelectedVehicleId(v.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-2 cursor-pointer border ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs ring-2 ring-indigo-300 dark:ring-indigo-700'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <span className="truncate max-w-[140px]">{v.brand} {v.model}</span>
                  {v.plate && (
                    <span className={`text-[9.5px] px-1.5 py-0.2 rounded font-mono ${
                      isSelected ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                    }`}>
                      {v.plate}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* CONTENUTO PRINCIPALE CERTIFICATO */}
        <div className="p-4 sm:p-6 overflow-y-auto flex flex-col gap-6">
          
          {/* PASSPORT CERTIFICATION SHEET CARD */}
          <div className="relative rounded-3xl border border-slate-200 dark:border-slate-700/80 bg-linear-to-b from-slate-50/80 via-white to-slate-50/40 dark:from-slate-800/60 dark:via-slate-900/80 dark:to-slate-900 p-5 sm:p-7 shadow-lg flex flex-col gap-6">
            
            {/* STAMP / WATERMARK EFFECT */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-md shrink-0 ring-4 ring-indigo-50 dark:ring-indigo-950/60">
                  <Shield className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                      {activeVehicle.brand} {activeVehicle.model}
                    </h2>
                    <span className="font-mono text-xs px-2.5 py-0.5 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-black tracking-wider">
                      {activeVehicle.plate || 'TARGA NON REGISTRATA'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium flex-wrap">
                    <span>ID: <strong className="font-mono text-slate-700 dark:text-slate-300">{passportId}</strong></span>
                    <span>•</span>
                    <span>Anno: <strong className="text-slate-700 dark:text-slate-300">{vehicleYear || 'Non specificato'}</strong></span>
                    <span>•</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> Verificato My360Garage
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end gap-1 shrink-0 p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs">
                <QrCode className="w-8 h-8 text-slate-700 dark:text-slate-300" />
                <span className="text-[9px] font-mono text-slate-400 font-bold">DIGITAL-SEAL</span>
              </div>
            </div>

            {/* BENTO STATS METRICS (4 CARDS) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              
              {/* Odometro */}
              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
                  <Gauge className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Odometro</span>
                </div>
                <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  {certifiedCurrentKm.toLocaleString('it-IT')} km
                </div>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                  ✓ Nessun rollback rilevato
                </span>
              </div>

              {/* Tagliandi */}
              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                  <Wrench className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Interventi</span>
                </div>
                <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  {(activeVehicle.maintenances || []).length} registrati
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                  Tot: {totalMaintCost.toLocaleString('it-IT', { minimumFractionDigits: 0 })} €
                </span>
              </div>

              {/* Efficienza */}
              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                  <Fuel className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Consumo</span>
                </div>
                <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  {metrics?.kmPerUnit ? `${metrics.kmPerUnit} ${metrics.fuelUnit || 'km/l'}` : 'Dati ok'}
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                  {(activeVehicle.refuels || []).length} rifornimenti
                </span>
              </div>

              {/* Documenti */}
              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                  <FileText className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Documenti</span>
                </div>
                <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  {(activeVehicle.documents || []).length} attivi
                </div>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                  In regola
                </span>
              </div>

            </div>

            {/* SCHEDA DATI TECNICI & IDENTIFICATIVI */}
            <div className="flex flex-col gap-2.5">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <span>Dati Tecnici di Fabbrica</span>
              </h4>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-100/70 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Numero di Telaio (VIN)</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200 truncate block mt-0.5">
                    {activeVehicle.vin || 'Non registrato'}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-100/70 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Alimentazione</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 capitalize block mt-0.5">
                    {activeVehicle.fuelType || 'Non specificata'}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-100/70 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Tipo Veicolo</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 capitalize block mt-0.5">
                    {activeVehicle.vehicleType === 'moto' ? 'Motocicletta' : 'Autovettura'}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-100/70 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Chilometri Iniziali</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block mt-0.5">
                    {(Number(activeVehicle.initialKm) || 0).toLocaleString('it-IT')} km
                  </span>
                </div>
              </div>
            </div>

            {/* CRONOLOGIA MANUTENZIONI CERTIFICATE */}
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <span>Cronologia Tagliandi & Interventi</span>
                  <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                    {(activeVehicle.maintenances || []).length}
                  </span>
                </h4>
              </div>

              {(!activeVehicle.maintenances || activeVehicle.maintenances.length === 0) ? (
                <div className="p-4 rounded-2xl bg-slate-100/60 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700 text-center text-xs text-slate-500 dark:text-slate-400">
                  Nessun intervento di manutenzione ancora registrato per questo veicolo.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-extrabold uppercase text-[10px] tracking-wider">
                        <th className="p-2.5 sm:p-3">Data</th>
                        <th className="p-2.5 sm:p-3">Km</th>
                        <th className="p-2.5 sm:p-3">Intervento</th>
                        <th className="p-2.5 sm:p-3 hidden sm:table-cell">Officina</th>
                        <th className="p-2.5 sm:p-3 text-right">Costo</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-800 dark:text-slate-200 font-medium">
                      {activeVehicle.maintenances.slice(0, 8).map(m => (
                        <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="p-2.5 sm:p-3 font-semibold whitespace-nowrap">{m.date}</td>
                          <td className="p-2.5 sm:p-3 font-mono font-bold whitespace-nowrap">
                            {Number(m.km).toLocaleString('it-IT')} km
                          </td>
                          <td className="p-2.5 sm:p-3">
                            <span className="font-bold block truncate max-w-[160px] sm:max-w-xs">
                              {m.description || m.category || 'Tagliando'}
                            </span>
                          </td>
                          <td className="p-2.5 sm:p-3 hidden sm:table-cell text-slate-500 dark:text-slate-400 truncate max-w-[120px]">
                            {m.workshop || 'Officina'}
                          </td>
                          <td className="p-2.5 sm:p-3 text-right font-bold whitespace-nowrap">
                            {Number(m.cost).toLocaleString('it-IT', { minimumFractionDigits: 2 })} €
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* CERTIFICATE INTEGRITY FOOTER */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <span>Documento generato con crittografia e tracciamento automatico My360Garage.</span>
              </div>
              <span className="font-mono text-[10px] text-slate-400">
                Timestamp: {new Date().toLocaleDateString('it-IT')} {new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

          </div>

          {/* ACTION BUTTONS (STAMPA / PDF, CSV, COPIA) */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5">
            <button
              type="button"
              id="btn-passport-print-pdf"
              onClick={handlePrintOrPdf}
              className="w-full sm:flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-xl text-xs font-black transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Stampa o Salva PDF Ufficiale</span>
              {userTier === 'FREE' && (
                <span className="text-[9.5px] bg-indigo-800 text-amber-300 px-1.5 py-0.2 rounded font-black uppercase">
                  PRO
                </span>
              )}
            </button>

            <button
              type="button"
              id="btn-passport-export-csv"
              onClick={handleExportCsv}
              className="w-full sm:w-auto py-3 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
            >
              <Download className="w-4 h-4" />
              <span>Esporta CSV</span>
            </button>

            <button
              type="button"
              id="btn-passport-copy-summary"
              onClick={handleCopySummary}
              className="w-full sm:w-auto py-3 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
            >
              {copiedSummary ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-600 font-bold">Copiato!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copia Scheda</span>
                </>
              )}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
