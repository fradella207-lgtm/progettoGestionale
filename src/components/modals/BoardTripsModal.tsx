import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft,
  BarChart3, 
  TrendingUp, 
  Gauge, 
  Calendar, 
  Receipt, 
  Info, 
  ChevronDown, 
  ChevronUp, 
  Zap, 
  Fuel, 
  Route
} from 'lucide-react';
import { Vehicle, AppSettings } from '../../types';
import { DetailedConsumptionMetrics, BoardTrip } from '../../utils/consumptionCalculator';
import { useSwipeBack } from '../../hooks/useSwipeBack';

interface BoardTripsModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle;
  metrics: DetailedConsumptionMetrics;
  settings: AppSettings;
}

export const BoardTripsModal: React.FC<BoardTripsModalProps> = ({
  isOpen,
  onClose,
  vehicle,
  metrics,
  settings
}) => {
  const [expandedTripId, setExpandedTripId] = useState<string | null>(null);

  // Prevent background scrolling when page is active
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Support swipe right gesture to go back / close
  useSwipeBack({
    onBack: onClose,
    enabled: isOpen
  });

  if (!isOpen) return null;

  const isBEV = vehicle.fuelType.includes('Elettrica') || vehicle.fuelType.includes('BEV');
  const unitLabel = isBEV ? 'kWh' : (vehicle.fuelType.includes('Metano') ? 'Kg' : 'L');

  const trips = [...metrics.boardTrips].sort((a, b) => {
    return b.tripIndex - a.tripIndex; // newest first by default
  });

  const toggleExpand = (id: string) => {
    setExpandedTripId(prev => prev === id ? null : id);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#f8fafc] flex flex-col overflow-y-auto min-h-screen font-['Plus_Jakarta_Sans',sans-serif] animate-in fade-in duration-150">
      
      {/* STICKY TOP APP BAR - Clean & Minimal with ONLY the Top-Left Back Arrow */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs px-4 sm:px-8 py-3.5 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          {/* Top-Left Indietro Button */}
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 text-xs font-black border border-slate-200 transition-all cursor-pointer shrink-0 shadow-2xs group"
            title="Torna alla scheda veicolo"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform text-slate-700" />
            <span>Indietro</span>
          </button>

          <div className="h-6 w-px bg-slate-200 hidden xs:block shrink-0" />

          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0 hidden sm:flex">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-slate-900 leading-tight truncate">
                  Computer di Bordo & Trip Pieno-Pieno
                </h1>
                <span className="bg-blue-100 text-blue-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-blue-200 shrink-0">
                  {trips.length} Trip
                </span>
              </div>
              <p className="text-xs text-slate-500 truncate">
                {vehicle.brand} {vehicle.model} • <span className="font-bold text-slate-700">{vehicle.plate || 'Garage'}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Right Status Badge */}
        <div className="hidden sm:flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600">
          <Route className="w-4 h-4 text-blue-600" />
          <span>Metodo Full-to-Full</span>
        </div>
      </header>

      {/* MAIN PAGE BODY */}
      <main className="max-w-5xl mx-auto w-full px-4 sm:px-8 py-6 space-y-6 flex-1 flex flex-col">
        
        {/* Top KPI Cards */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Trip Registrati</span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 block mt-1">
              {trips.length}
            </span>
            <span className="text-[11px] text-slate-500 block mt-0.5 font-medium">
              Cicli Pieno-Pieno
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-blue-600 block tracking-wider">Consumo Medio</span>
            <span className="text-xl sm:text-2xl font-black text-blue-600 block mt-1">
              {metrics.kmPerUnit} <span className="text-xs font-bold text-blue-700">km/{unitLabel}</span>
            </span>
            <span className="text-[11px] text-blue-800 block mt-0.5 font-medium">
              {metrics.unitPer100Km} {unitLabel}/100km
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-emerald-600 block tracking-wider">Autonomia Media</span>
            <span className="text-xl sm:text-2xl font-black text-emerald-600 block mt-1">
              {metrics.avgTripDistanceKm} <span className="text-xs font-bold text-emerald-700">km</span>
            </span>
            <span className="text-[11px] text-emerald-800 block mt-0.5 font-medium">
              Per ciascun pieno
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-amber-600 block tracking-wider">Spesa Media Trip</span>
            <span className="text-xl sm:text-2xl font-black text-amber-600 block mt-1">
              {settings.currency} {metrics.avgTripCost.toFixed(2)}
            </span>
            <span className="text-[11px] text-amber-800 block mt-0.5 font-medium">
              {metrics.fuelCostPerKm} {settings.currency}/km
            </span>
          </div>
        </section>

        {/* Explanation Banner */}
        <section className="bg-white border border-blue-100 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 shadow-2xs">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100 mt-0.5">
            <Info className="w-5 h-5" />
          </div>
          <div className="text-xs text-slate-600 leading-relaxed">
            <p className="font-bold text-slate-900 text-sm">Come viene calcolato un Trip di Bordo?</p>
            <p className="mt-1">
              Un <strong>Trip di Bordo</strong> corrisponde all&apos;intervallo esatto tra due rifornimenti con <strong>Pieno</strong> (Full Tank). Eventuali rifornimenti parziali intermedi vengono automaticamente accorpati, garantendo una precisione metrologica del 100% su km percorsi, carburante consumato e costo al km.
            </p>
          </div>
        </section>

        {/* Visual Trend Bars (Trip Chart) */}
        {trips.length > 0 && (
          <section className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-slate-900 tracking-wider flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                Andamento Efficienza (km/{unitLabel})
              </span>
              <span className="text-xs font-medium text-slate-400">
                Grafico cronologico dei trip
              </span>
            </div>

            <div className="space-y-3 pt-2">
              {[...trips].reverse().map((trip) => {
                const maxKmPerUnit = Math.max(...trips.map(t => t.kmPerUnit), 1);
                const barWidthPercent = Math.min(100, Math.max(15, (trip.kmPerUnit / maxKmPerUnit) * 100));
                
                return (
                  <div key={`bar-${trip.id}`} className="flex items-center gap-3 text-xs">
                    <span className="w-16 font-bold text-slate-500 shrink-0">
                      Trip #{trip.tripIndex}
                    </span>
                    <div className="flex-1 bg-slate-100 h-6 rounded-lg overflow-hidden relative">
                      <div 
                        className={`h-full rounded-lg transition-all flex items-center px-2 text-[11px] font-black text-white ${
                          trip.kmPerUnit >= metrics.kmPerUnit ? 'bg-emerald-500' : 'bg-blue-600'
                        }`}
                        style={{ width: `${barWidthPercent}%` }}
                      >
                        <span className="truncate">{trip.kmPerUnit} km/{unitLabel}</span>
                      </div>
                    </div>
                    <span className="w-24 text-right font-bold text-slate-700 shrink-0">
                      +{trip.distanceKm.toLocaleString('it-IT')} km
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Detailed Trips Accordion List */}
        <section className="space-y-3 pb-8 flex-1">
          <div className="flex items-center justify-between pb-1">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-500">
              Storico Dettagliato Singoli Trip
            </h2>
            <span className="text-xs font-bold text-slate-400">
              {trips.length} intervalli pieno-pieno
            </span>
          </div>

          {trips.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/90 p-12 text-center flex flex-col items-center justify-center shadow-2xs">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 border border-blue-100">
                <Route className="w-7 h-7" />
              </div>
              <h3 className="text-base font-black text-slate-800">Nessun trip calcolabile</h3>
              <p className="text-xs text-slate-500 max-w-md mt-1 leading-relaxed">
                Per calcolare un trip di bordo sono necessari almeno due rifornimenti con <strong>Pieno</strong> (Full Tank). Registra i tuoi rifornimenti indicando il pieno per visualizzare consumi, costi chilometrici e distanze esatte.
              </p>
            </div>
          ) : (
            trips.map((trip) => {
              const isExpanded = expandedTripId === trip.id;

              return (
                <div 
                  key={trip.id}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:border-blue-300 transition-all overflow-hidden"
                >
                  {/* Trip Summary Card Header */}
                  <div 
                    onClick={() => toggleExpand(trip.id)}
                    className="p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/70 transition-colors"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0 font-black text-sm">
                        #{trip.tripIndex}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-black text-slate-900">
                            +{trip.distanceKm.toLocaleString('it-IT')} km
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="text-xs font-bold text-slate-500">
                            {trip.startDate ? new Date(trip.startDate).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' }) : ''} 
                            {' → '}
                            {new Date(trip.endDate).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 flex-wrap">
                          <span className="font-bold text-emerald-600 flex items-center gap-1">
                            <Gauge className="w-3.5 h-3.5" />
                            {trip.kmPerUnit} km/{unitLabel} ({trip.unitPer100Km} {unitLabel}/100km)
                          </span>
                          <span className="text-slate-300">•</span>
                          <span>
                            {trip.totalFuelConsumed.toFixed(2)} {unitLabel}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right hidden xs:block">
                        <span className="text-base font-black text-slate-900 block">
                          {settings.currency} {trip.totalTripCost.toFixed(2)}
                        </span>
                        <span className="text-[11px] font-bold text-slate-400 block">
                          {trip.costPerKm} {settings.currency}/km
                        </span>
                      </div>

                      <div className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 bg-slate-100">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Breakdown */}
                  {isExpanded && (
                    <div className="px-4 sm:px-5 pb-5 pt-2 border-t border-slate-100 bg-slate-50/50 space-y-3">
                      <h4 className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">
                        Rifornimenti associati a questo Trip:
                      </h4>

                      <div className="space-y-2">
                        {trip.associatedRefuels.map((r, rIdx) => (
                          <div 
                            key={r.id || rIdx}
                            className="bg-white p-3 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs"
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-800">
                                {r.date ? new Date(r.date).toLocaleDateString('it-IT') : 'Data n.d.'}
                              </span>
                              <span className="text-slate-400">•</span>
                              <span className="font-medium text-slate-600">
                                {r.km.toLocaleString('it-IT')} km
                              </span>
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                                r.type === 'full' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                              }`}>
                                {r.type === 'full' ? 'Pieno' : 'Parziale'}
                              </span>
                            </div>

                            <div className="text-right font-bold text-slate-800">
                              {r.quantity} {unitLabel} • {settings.currency} {Number(r.price).toFixed(2)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </section>

      </main>
    </div>
  );
};
