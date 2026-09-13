import React, { useState } from 'react';
import { 
  X, 
  AlertTriangle, 
  CheckCircle2, 
  Send, 
  Fuel, 
  MapPin, 
  Store, 
  Clock, 
  HelpCircle,
  MessageSquare
} from 'lucide-react';
import { Station } from '../../types';
import { useSwipeBack } from '../../hooks/useSwipeBack';

export interface StationReport {
  id: string;
  stationId?: string;
  stationName: string;
  stationAddress?: string;
  reportType: 'price_mismatch' | 'station_closed' | 'fuel_unavailable' | 'wrong_location' | 'other';
  fuelType?: string;
  reportedPrice?: number;
  notes?: string;
  timestamp: string;
}

interface StationReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  station?: Station | null;
  onReportSubmitted?: (report: StationReport) => void;
}

export const StationReportModal: React.FC<StationReportModalProps> = ({
  isOpen,
  onClose,
  station,
  onReportSubmitted
}) => {
  useSwipeBack({
    onBack: onClose,
    enabled: isOpen
  });

  const [reportType, setReportType] = useState<'price_mismatch' | 'station_closed' | 'fuel_unavailable' | 'wrong_location' | 'other'>('price_mismatch');
  const [selectedFuel, setSelectedFuel] = useState<string>('Benzina');
  const [isSelf, setIsSelf] = useState<boolean>(true);
  const [actualPrice, setActualPrice] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [stationNameInput, setStationNameInput] = useState<string>(station?.name || '');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const report: StationReport = {
      id: `report_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      stationId: station?.id,
      stationName: station?.name || stationNameInput || 'Distributore non specificato',
      stationAddress: station ? `${station.address}, ${station.city}` : undefined,
      reportType,
      fuelType: reportType === 'price_mismatch' ? `${selectedFuel} (${isSelf ? 'Self' : 'Servito'})` : undefined,
      reportedPrice: actualPrice ? parseFloat(actualPrice.replace(',', '.')) : undefined,
      notes: notes.trim() || undefined,
      timestamp: new Date().toISOString()
    };

    // Save to localStorage
    try {
      const existingStr = localStorage.getItem('mygarage_station_reports');
      const existing: StationReport[] = existingStr ? JSON.parse(existingStr) : [];
      localStorage.setItem('mygarage_station_reports', JSON.stringify([report, ...existing]));
    } catch {
      // ignore
    }

    if (onReportSubmitted) {
      onReportSubmitted(report);
    }

    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setNotes('');
      setActualPrice('');
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs font-['Plus_Jakarta_Sans',sans-serif] animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-lg rounded-2xl sm:rounded-3xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                Segnala e Aiutaci a Migliorare
              </h2>
              <p className="text-xs text-slate-500">
                Contribuisci alla trasparenza dei prezzi e dei dati
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MODAL CONTENT */}
        {isSubmitted ? (
          <div className="p-8 flex flex-col items-center justify-center text-center gap-3 animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black text-slate-900">Grazie per la segnalazione!</h3>
            <p className="text-xs text-slate-600 max-w-xs">
              Il tuo contributo aiuta tutta la community di automobilisti a trovare prezzi reali e distributori funzionanti.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto flex flex-col gap-4">
            
            {/* NOTICE BANNER */}
            <div className="bg-amber-50/80 border border-amber-200/90 rounded-xl p-3 flex items-start gap-2.5 text-xs text-amber-900">
              <span className="text-base leading-none shrink-0">ℹ️</span>
              <p className="leading-relaxed">
                I prezzi ufficiali provengono dai dati aperti del <strong>Ministero delle Imprese e del Made in Italy (MIMIT)</strong>. Se noti differenze con il totem alla pompa o un distributore chiuso, segnalacelo subito!
              </p>
            </div>

            {/* STATION INFO */}
            {station ? (
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex items-start gap-2.5">
                <Store className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block">Distributore selezionato</span>
                  <p className="text-xs font-black text-slate-800 truncate">{station.name}</p>
                  <p className="text-[11px] text-slate-500 truncate flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>{station.address}, {station.city}</span>
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Nome distributore o via
                </label>
                <input 
                  type="text"
                  value={stationNameInput}
                  onChange={(e) => setStationNameInput(e.target.value)}
                  placeholder="Es. Eni Station Corso Sempione..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden"
                  required
                />
              </div>
            )}

            {/* REPORT TYPE SELECTOR */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Cosa vuoi segnalare?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {[
                  { id: 'price_mismatch', label: 'Prezzo totem differente', icon: Fuel },
                  { id: 'station_closed', label: 'Distributore chiuso/inattivo', icon: Clock },
                  { id: 'fuel_unavailable', label: 'Carburante esaurito/guasto', icon: AlertTriangle },
                  { id: 'wrong_location', label: 'Posizione o via errata', icon: MapPin },
                  { id: 'other', label: 'Altro suggerimento', icon: HelpCircle },
                ].map(item => {
                  const Icon = item.icon;
                  const isSelected = reportType === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setReportType(item.id as any)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold text-left flex items-center gap-2 border transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-blue-50 text-[#2563eb] border-blue-300 ring-2 ring-blue-100' 
                          : 'bg-slate-50 text-slate-700 border-slate-200/80 hover:bg-slate-100'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* CONDITIONAL: PRICE DETAILS */}
            {reportType === 'price_mismatch' && (
              <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-3 flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Carburante</label>
                    <select
                      value={selectedFuel}
                      onChange={(e) => setSelectedFuel(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-semibold"
                    >
                      <option value="Benzina">⛽ Benzina</option>
                      <option value="Diesel">⛽ Diesel</option>
                      <option value="GPL">🟡 GPL</option>
                      <option value="Metano">🟢 Metano</option>
                      <option value="Elettrico">⚡ Elettrico EV</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Modalità</label>
                    <div className="flex bg-white border border-slate-200 rounded-lg p-0.5 text-xs">
                      <button
                        type="button"
                        onClick={() => setIsSelf(true)}
                        className={`flex-1 py-1 rounded-md font-bold text-center transition-all ${isSelf ? 'bg-slate-900 text-white' : 'text-slate-600'}`}
                      >
                        Self
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsSelf(false)}
                        className={`flex-1 py-1 rounded-md font-bold text-center transition-all ${!isSelf ? 'bg-slate-900 text-white' : 'text-slate-600'}`}
                      >
                        Servito
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    Prezzo reale visto al totem (€/L o €/kg)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={actualPrice}
                    onChange={(e) => setActualPrice(e.target.value)}
                    placeholder="Es. 1.769"
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-bold focus:ring-2 focus:ring-blue-500/20 outline-hidden"
                  />
                </div>
              </div>
            )}

            {/* NOTES */}
            <div>
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1 mb-1">
                <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                <span>Note o dettagli aggiuntivi (opzionale)</span>
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Es. Pompa GPL fuori servizio da ieri, cartello con orario modificato..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden"
              />
            </div>

            {/* SUBMIT BUTTON */}
            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Annulla
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Invia Segnalazione</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
