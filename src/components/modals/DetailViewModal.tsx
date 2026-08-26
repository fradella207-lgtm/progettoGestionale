import React, { useEffect } from 'react';
import { 
  ArrowLeft,
  Fuel, 
  Wrench, 
  Sparkles, 
  Calendar, 
  Gauge, 
  Receipt, 
  MapPin, 
  Edit3, 
  CheckCircle2, 
  AlertTriangle,
  Info,
  Car,
  Zap,
  BatteryCharging,
  Flame,
  Clock,
  ArrowRight
} from 'lucide-react';
import { RefuelRecord, MaintenanceRecord, AIAdvice, Vehicle, AppSettings } from '../../types';
import { useSwipeBack } from '../../hooks/useSwipeBack';

export type DetailModalData = 
  | { type: 'refuel'; item: RefuelRecord; deltaKm?: number | null; unitPrice?: string | null }
  | { type: 'maintenance'; item: MaintenanceRecord }
  | { type: 'advice'; item: AIAdvice };

interface DetailViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: DetailModalData | null;
  vehicle: Vehicle;
  settings: AppSettings;
  onEditRefuel?: (refuel: RefuelRecord) => void;
  onEditMaintenance?: (maint: MaintenanceRecord) => void;
  onAddMaintenanceFromAdvice?: () => void;
}

export const DetailViewModal: React.FC<DetailViewModalProps> = ({
  isOpen,
  onClose,
  data,
  vehicle,
  settings,
  onEditRefuel,
  onEditMaintenance,
  onAddMaintenanceFromAdvice
}) => {
  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen && !!data) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen, data]);

  // Support swipe right gesture to go back / close
  useSwipeBack({
    onBack: onClose,
    enabled: isOpen && !!data
  });

  if (!isOpen || !data) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh] overflow-hidden font-['Plus_Jakarta_Sans',sans-serif] border border-[#e2e8f0]">
        
        {/* MODAL HEADER - Only Top-Left Indietro Button */}
        <div className="px-4 sm:px-6 py-4 border-b border-[#e2e8f0] flex items-center justify-between gap-2 bg-[#fafbfc]">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Top-Left Indietro Button */}
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 text-xs font-black border border-slate-200 transition-all cursor-pointer shrink-0 shadow-2xs group"
              title="Torna indietro"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              <span>Indietro</span>
            </button>

            {data.type === 'refuel' && (() => {
              const isEV = data.item.energyType === 'electricity' || data.item.unit === 'kWh';
              return (
                <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center shadow-2xs border shrink-0 hidden xs:flex ${
                  isEV ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-blue-50 text-[#2563eb] border-blue-100'
                }`}>
                  {isEV ? <Zap className="w-4 h-4 sm:w-5 sm:h-5" /> : <Fuel className="w-4 h-4 sm:w-5 sm:h-5" />}
                </div>
              );
            })()}

            {data.type === 'maintenance' && (
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-emerald-50 text-[#059669] border border-emerald-100 flex items-center justify-center shadow-2xs shrink-0 hidden xs:flex">
                <Wrench className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            )}

            {data.type === 'advice' && (
              <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center shadow-2xs shrink-0 hidden xs:flex ${
                data.item.urgency === 'high' ? 'bg-amber-100 text-amber-800' : 'bg-blue-50 text-blue-600'
              }`}>
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            )}

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black text-[#0f172a] leading-tight truncate">
                  {data.type === 'refuel' && (data.item.energyType === 'electricity' ? 'Dettaglio Ricarica' : 'Dettaglio Rifornimento')}
                  {data.type === 'maintenance' && 'Dettaglio Intervento'}
                  {data.type === 'advice' && 'Consiglio AI'}
                </h3>
              </div>
              <p className="text-xs text-[#64748b] mt-0.5 truncate">
                {vehicle.brand} {vehicle.model} • <span className="font-bold text-[#0f172a]">{vehicle.plate}</span>
              </p>
            </div>
          </div>
        </div>

        {/* MODAL BODY */}
        <div className="p-6 overflow-y-auto flex flex-col gap-4.5">
          
          {/* 1. REFUEL / ELECTRIC CHARGE DETAILS */}
          {data.type === 'refuel' && (() => {
            const refuel = data.item;
            const isFull = refuel.type === 'full';
            const isEV = refuel.energyType === 'electricity' || refuel.unit === 'kWh';
            const unit = refuel.unit || (isEV ? 'kWh' : (refuel.energyType === 'cng' ? 'Kg' : 'L'));
            const unitPrice = data.unitPrice || ((Number(refuel.price) && Number(refuel.quantity) > 0) 
              ? (Number(refuel.price) / Number(refuel.quantity)).toFixed(3) 
              : null);

            return (
              <div className="flex flex-col gap-4">
                {/* Main Hero Card: Cost & Volume */}
                <div className={`p-5 rounded-2xl border flex items-center justify-between ${
                  isEV 
                    ? 'bg-gradient-to-br from-amber-50/70 via-slate-50 to-amber-50/40 border-amber-200' 
                    : 'bg-gradient-to-br from-blue-50/60 via-slate-50 to-blue-50/30 border-blue-100'
                }`}>
                  <div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider block ${isEV ? 'text-amber-700' : 'text-[#2563eb]'}`}>
                      {isEV ? 'Spesa Ricarica' : 'Importo Rifornimento'}
                    </span>
                    <span className="text-2xl sm:text-3xl font-black text-[#0f172a] mt-0.5 block">
                      {settings.currency} {Number(refuel.price).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider block">
                      {isEV ? 'Energia Immessa' : 'Volume Erogato'}
                    </span>
                    <span className={`text-xl sm:text-2xl font-black mt-0.5 block ${isEV ? 'text-amber-600' : 'text-[#2563eb]'}`}>
                      {Number(refuel.quantity).toLocaleString('it-IT', { minimumFractionDigits: 2 })} {unit}
                    </span>
                  </div>
                </div>

                {/* Technical Specifications Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#f8fafc] p-3 rounded-xl border border-[#e2e8f0]">
                    <span className="text-[10px] font-bold text-[#64748b] uppercase flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" /> Data Evento
                    </span>
                    <span className="text-sm font-bold text-[#0f172a] mt-1 block">
                      {refuel.date.split('-').reverse().join('/')}
                    </span>
                  </div>

                  <div className="bg-[#f8fafc] p-3 rounded-xl border border-[#e2e8f0]">
                    <span className="text-[10px] font-bold text-[#64748b] uppercase flex items-center gap-1.5">
                      <Gauge className="w-3.5 h-3.5 text-[#2563eb]" /> Odometro (Km)
                    </span>
                    <span className="text-sm font-bold text-[#0f172a] mt-1 block">
                      {refuel.km.toLocaleString('it-IT')} km
                      {data.deltaKm !== undefined && data.deltaKm !== null && data.deltaKm > 0 && (
                        <span className="text-xs font-semibold text-blue-600 ml-1.5">
                          (+{data.deltaKm.toLocaleString('it-IT')} km)
                        </span>
                      )}
                    </span>
                  </div>

                  <div className="bg-[#f8fafc] p-3 rounded-xl border border-[#e2e8f0]">
                    <span className="text-[10px] font-bold text-[#64748b] uppercase block">
                      Costo Unitario
                    </span>
                    <span className="text-sm font-bold text-[#0f172a] mt-1 block">
                      {unitPrice ? `${unitPrice} ${settings.currency} / ${unit}` : 'N/D'}
                    </span>
                  </div>

                  <div className="bg-[#f8fafc] p-3 rounded-xl border border-[#e2e8f0]">
                    <span className="text-[10px] font-bold text-[#64748b] uppercase block">
                      {isEV ? 'Livello di Ricarica' : 'Stato Serbatoio'}
                    </span>
                    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-md mt-1 ${
                      isFull ? 'bg-emerald-50 text-[#059669] border border-emerald-100' : 'bg-slate-100 text-[#64748b] border border-slate-200'
                    }`}>
                      {isFull ? (isEV ? '✓ 100% Carica Completa' : '✓ Pieno Completo') : 'Parziale'}
                    </span>
                  </div>
                </div>

                {/* Charging Power Kw if EV */}
                {refuel.chargingPowerKw && (
                  <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-200 flex items-center justify-between text-xs">
                    <span className="font-bold text-amber-900 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-600" /> Potenza Colonnina Erogata:
                    </span>
                    <span className="font-black text-amber-950">{refuel.chargingPowerKw} kW</span>
                  </div>
                )}

                {/* Notes & Station Location */}
                <div className="bg-[#f8fafc] p-3.5 rounded-xl border border-[#e2e8f0]">
                  <span className="text-[10px] font-bold text-[#64748b] uppercase flex items-center gap-1.5 mb-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" /> {isEV ? 'Punto Ricarica / Note' : 'Note & Distributore'}
                  </span>
                  <p className="text-xs text-[#0f172a] font-medium leading-relaxed">
                    {refuel.notes || 'Nessuna nota o stazione indicata.'}
                  </p>
                </div>
              </div>
            );
          })()}

          {/* 2. MAINTENANCE DETAILS */}
          {data.type === 'maintenance' && (() => {
            const maint = data.item;
            return (
              <div className="flex flex-col gap-4">
                {/* Main Hero Card: Cost & Category */}
                <div className="bg-gradient-to-br from-emerald-50/60 via-slate-50 to-emerald-50/30 p-5 rounded-2xl border border-emerald-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-[#059669] uppercase tracking-wider block">
                      Totale Fattura / Spesa
                    </span>
                    <span className="text-2xl sm:text-3xl font-black text-[#0f172a] mt-0.5 block">
                      {settings.currency} {Number(maint.cost).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider block">
                      Categoria Intervento
                    </span>
                    <span className="inline-block text-xs font-bold text-[#059669] bg-emerald-100/70 border border-emerald-200 px-2.5 py-1 rounded-lg mt-1 uppercase">
                      {maint.category}
                    </span>
                  </div>
                </div>

                {/* Technical Specifications Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#f8fafc] p-3 rounded-xl border border-[#e2e8f0]">
                    <span className="text-[10px] font-bold text-[#64748b] uppercase flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" /> Data Intervento
                    </span>
                    <span className="text-sm font-bold text-[#0f172a] mt-1 block">
                      {maint.date.split('-').reverse().join('/')}
                    </span>
                  </div>

                  <div className="bg-[#f8fafc] p-3 rounded-xl border border-[#e2e8f0]">
                    <span className="text-[10px] font-bold text-[#64748b] uppercase flex items-center gap-1.5">
                      <Gauge className="w-3.5 h-3.5 text-[#059669]" /> Chilometraggio
                    </span>
                    <span className="text-sm font-bold text-[#0f172a] mt-1 block">
                      {maint.km.toLocaleString('it-IT')} km
                    </span>
                  </div>
                </div>

                {/* Workshop / Officina */}
                <div className="bg-[#f8fafc] p-3.5 rounded-xl border border-[#e2e8f0]">
                  <span className="text-[10px] font-bold text-[#64748b] uppercase flex items-center gap-1.5 mb-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" /> Officina / Centro Assistenza
                  </span>
                  <p className="text-xs text-[#0f172a] font-bold">
                    {maint.workshop || 'Officina non specificata'}
                  </p>
                </div>

                {/* Description of work */}
                <div className="bg-[#f8fafc] p-3.5 rounded-xl border border-[#e2e8f0]">
                  <span className="text-[10px] font-bold text-[#64748b] uppercase block mb-1">
                    Descrizione Lavori & Ricambi
                  </span>
                  <p className="text-xs text-[#0f172a] leading-relaxed whitespace-pre-line">
                    {maint.description || 'Nessun dettaglio aggiuntivo specificato.'}
                  </p>
                </div>
              </div>
            );
          })()}

          {/* 3. AI ADVICE DETAILS */}
          {data.type === 'advice' && (() => {
            const advice = data.item;
            const isUrgent = advice.urgency === 'high';

            return (
              <div className="flex flex-col gap-4">
                <div className={`p-4 rounded-2xl border flex items-center justify-between ${
                  isUrgent ? 'bg-amber-50 border-amber-200' : 'bg-blue-50 border-blue-100'
                }`}>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748b] block">
                      Livello di Priorità
                    </span>
                    <span className={`text-sm font-black uppercase mt-0.5 block ${
                      isUrgent ? 'text-amber-900' : 'text-blue-800'
                    }`}>
                      {isUrgent ? 'Attenzione Richiesta' : 'Consigliato dal Sistema'}
                    </span>
                  </div>
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase ${
                    isUrgent ? 'bg-amber-200 text-amber-900' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {advice.urgency === 'high' ? 'Urgente' : 'Ordinario'}
                  </span>
                </div>

                <div className="bg-[#f8fafc] p-4 rounded-2xl border border-[#e2e8f0] flex flex-col gap-2">
                  <h4 className="text-sm font-bold text-[#0f172a]">{advice.title}</h4>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {advice.desc}
                  </p>
                </div>

                <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 text-[11px] text-[#2563eb] flex items-center gap-2">
                  <Info className="w-4 h-4 shrink-0" />
                  <span>
                    La previsione viene ricalcolata in tempo reale in base ai km percorsi e all'intervallo standard di fabbrica.
                  </span>
                </div>
              </div>
            );
          })()}

        </div>

        {/* MODAL FOOTER ACTIONS */}
        {((data.type === 'refuel' && onEditRefuel) || (data.type === 'maintenance' && onEditMaintenance) || (data.type === 'advice' && onAddMaintenanceFromAdvice)) && (
          <div className="px-6 py-4 border-t border-[#e2e8f0] bg-[#fafbfc] flex items-center justify-end gap-3">
            {data.type === 'refuel' && onEditRefuel && (
              <button
                onClick={() => {
                  onClose();
                  onEditRefuel(data.item);
                }}
                className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" /> Modifica Registrazione
              </button>
            )}

            {data.type === 'maintenance' && onEditMaintenance && (
              <button
                onClick={() => {
                  onClose();
                  onEditMaintenance(data.item);
                }}
                className="bg-[#059669] hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" /> Modifica Manutenzione
              </button>
            )}

            {data.type === 'advice' && onAddMaintenanceFromAdvice && (
              <button
                onClick={() => {
                  onClose();
                  onAddMaintenanceFromAdvice();
                }}
                className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Wrench className="w-3.5 h-3.5" /> Registra Intervento Correlato
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
