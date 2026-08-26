import React, { useState } from 'react';
import { 
  X, 
  ArrowLeft,
  Car, 
  Fuel, 
  Zap, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Gauge, 
  ChevronDown, 
  ChevronUp, 
  Info, 
  Award, 
  ArrowRight,
  Receipt,
  Sparkles,
  BarChart3
} from 'lucide-react';
import { Vehicle, AppSettings } from '../../types';
import { DetailedConsumptionMetrics, BoardTrip, RefuelWithCalculation } from '../../utils/consumptionCalculator';
import { useSwipeBack } from '../../hooks/useSwipeBack';

interface BoardTripsModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle;
  metrics: DetailedConsumptionMetrics;
  settings: AppSettings;
  onSelectRefuel?: (refuel: RefuelWithCalculation) => void;
}

export const BoardTripsModal: React.FC<BoardTripsModalProps> = ({
  isOpen,
  onClose,
  vehicle,
  metrics,
  settings,
  onSelectRefuel
}) => {
  const [expandedTripId, setExpandedTripId] = useState<string | null>(null);
  const [selectedSort, setSelectedSort] = useState<'chronological' | 'efficiency' | 'distance'>('chronological');

  // Support swipe right gesture to go back / close
  useSwipeBack({
    onBack: onClose,
    enabled: isOpen
  });

  if (!isOpen) return null;

  const trips = metrics.boardTrips;
  const isBEV = metrics.isBEV;
  const unitLabel = metrics.fuelUnit;

  const sortedTrips = [...trips].sort((a, b) => {
    if (selectedSort === 'efficiency') return b.kmPerUnit - a.kmPerUnit;
    if (selectedSort === 'distance') return b.distanceKm - a.distanceKm;
    return b.tripIndex - a.tripIndex; // newest first by default
  });

  const toggleExpand = (id: string) => {
    setExpandedTripId(prev => prev === id ? null : id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-6 bg-slate-900 text-white flex items-center justify-between gap-3 relative overflow-hidden shrink-0">
          <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-blue-600/20 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center gap-2.5 sm:gap-3 relative z-10 min-w-0">
            {/* Top-Left Indietro Button */}
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/15 hover:bg-white/25 active:scale-95 text-white text-xs font-black border border-white/20 transition-all cursor-pointer shrink-0 shadow-2xs group"
              title="Torna indietro"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <span>Indietro</span>
            </button>

            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-blue-400 shrink-0 shadow-inner hidden xs:flex">
              <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-blue-400 truncate">
                  Computer di Bordo & Efficienza
                </span>
                <span className="bg-blue-500/20 text-blue-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-400/30 shrink-0">
                  Full-to-Full
                </span>
              </div>
              <h2 className="text-base sm:text-2xl font-black text-white tracking-tight flex items-center gap-2 truncate">
                Trip di Bordo ({trips.length})
              </h2>
              <p className="text-xs text-slate-300 truncate">
                {vehicle.brand} {vehicle.model} • {vehicle.plate || 'Nessuna targa'}
              </p>
            </div>
          </div>

          <button 
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer relative z-10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col gap-6">
          
          {/* Top KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Card 1: Totale Trip */}
            <div className="bg-slate-50 border border-slate-200/80 p-3 sm:p-4 rounded-2xl flex flex-col justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Trip Registrati
              </span>
              <div className="my-1">
                <span className="text-2xl sm:text-3xl font-black text-slate-900">
                  {trips.length}
                </span>
              </div>
              <span className="text-[11px] text-slate-500">
                Cicli Pieno-Pieno
              </span>
            </div>

            {/* Card 2: Consumo Medio */}
            <div className="bg-blue-50 border border-blue-200/80 p-3 sm:p-4 rounded-2xl flex flex-col justify-between">
              <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">
                Consumo Medio
              </span>
              <div className="my-1">
                <span className="text-2xl sm:text-3xl font-black text-blue-900">
                  {metrics.kmPerUnit} <span className="text-xs font-bold text-blue-700">km/{unitLabel}</span>
                </span>
              </div>
              <span className="text-[11px] font-bold text-blue-800">
                {metrics.unitPer100Km} {unitLabel}/100km
              </span>
            </div>

            {/* Card 3: Autonomia Media */}
            <div className="bg-emerald-50 border border-emerald-200/80 p-3 sm:p-4 rounded-2xl flex flex-col justify-between">
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                Autonomia Media
              </span>
              <div className="my-1">
                <span className="text-2xl sm:text-3xl font-black text-emerald-900">
                  {metrics.avgTripDistanceKm} <span className="text-xs font-bold text-emerald-700">km</span>
                </span>
              </div>
              <span className="text-[11px] text-emerald-800">
                Per ciascun pieno
              </span>
            </div>

            {/* Card 4: Spesa Media Trip */}
            <div className="bg-amber-50 border border-amber-200/80 p-3 sm:p-4 rounded-2xl flex flex-col justify-between">
              <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">
                Spesa Media Trip
              </span>
              <div className="my-1">
                <span className="text-2xl sm:text-3xl font-black text-amber-900">
                  {settings.currency} {metrics.avgTripCost.toFixed(2)}
                </span>
              </div>
              <span className="text-[11px] text-amber-800">
                {metrics.fuelCostPerKm} {settings.currency}/km
              </span>
            </div>
          </div>

          {/* Explanation Banner */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-slate-600">
            <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-800">Come viene calcolato un Trip di Bordo?</p>
              <p className="mt-0.5 leading-relaxed">
                Un <strong>Trip di Bordo</strong> corrisponde all&apos;intervallo esatto tra due rifornimenti con <strong>Pieno</strong> (Full Tank). Eventuali rifornimenti parziali intermedi vengono automaticamente accorpati, garantendo una precisione metrologica del 100% su km percorsi, carburante consumato e costo al km.
              </p>
            </div>
          </div>

          {/* Visual Trend Bars (Trip Chart) */}
          {trips.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col gap-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-slate-900 tracking-wider flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4 text-blue-600" />
                  Andamento Efficienza (km/{unitLabel})
                </span>
                <span className="text-[11px] font-medium text-slate-400">
                  Grafico cronologico dei trip
                </span>
              </div>

              <div className="space-y-3 pt-2">
                {[...trips].reverse().map((trip) => {
                  const maxKmPerUnit = Math.max(...trips.map(t => t.kmPerUnit), 1);
                  const barWidthPercent = Math.min(100, Math.max(15, (trip.kmPerUnit / maxKmPerUnit) * 100));
                  const isBest = trip.isBest;
                  const isWorst = trip.isWorst;

                  return (
                    <div key={trip.id} className="flex flex-col gap-1">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800">{trip.title}</span>
                          <span className="text-[10px] text-slate-400">({trip.startDate.split('-').slice(1).join('/')} → {trip.endDate.split('-').slice(1).join('/')})</span>
                          {isBest && (
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-1.5 py-0.2 rounded">
                              ★ Record
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-slate-900">{trip.formattedKmPerUnit} km/{unitLabel}</span>
                          <span className="text-[10px] text-slate-500 font-normal">({trip.distanceKm} km)</span>
                        </div>
                      </div>

                      {/* Bar track */}
                      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            isBest 
                              ? 'bg-emerald-500' 
                              : isWorst 
                                ? 'bg-amber-400' 
                                : 'bg-blue-600'
                          }`}
                          style={{ width: `${barWidthPercent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* List Toolbar (Sort) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-100">
            <span className="text-xs font-black uppercase text-slate-900 tracking-wider">
              Elenco Dettagliato Trip ({sortedTrips.length})
            </span>

            <div className="flex items-center gap-1.5 self-start sm:self-auto">
              <span className="text-[11px] font-bold text-slate-400">Ordina:</span>
              <button
                type="button"
                onClick={() => setSelectedSort('chronological')}
                className={`text-xs px-2.5 py-1 rounded-lg border font-bold cursor-pointer transition-all ${
                  selectedSort === 'chronological'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Cronologico
              </button>
              <button
                type="button"
                onClick={() => setSelectedSort('efficiency')}
                className={`text-xs px-2.5 py-1 rounded-lg border font-bold cursor-pointer transition-all ${
                  selectedSort === 'efficiency'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Efficienza
              </button>
              <button
                type="button"
                onClick={() => setSelectedSort('distance')}
                className={`text-xs px-2.5 py-1 rounded-lg border font-bold cursor-pointer transition-all ${
                  selectedSort === 'distance'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Distanza
              </button>
            </div>
          </div>

          {/* Trips List */}
          {sortedTrips.length === 0 ? (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center flex flex-col items-center justify-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
                <Fuel className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-base font-black text-slate-900">Nessun Trip Completo Disponibile</h4>
                <p className="text-xs text-slate-500 max-w-md mt-1">
                  Per calcolare automaticamente i Trip di Bordo, registra almeno <strong>due rifornimenti consecutivi con l&apos;opzione &quot;Pieno&quot; selezionata</strong>.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {sortedTrips.map((trip) => {
                const isExpanded = expandedTripId === trip.id;
                const isPositiveDiff = (trip.efficiencyVsAveragePercent || 0) >= 0;

                return (
                  <div 
                    key={trip.id}
                    className={`bg-white border rounded-2xl transition-all shadow-xs overflow-hidden ${
                      trip.isBest 
                        ? 'border-emerald-300 ring-1 ring-emerald-200' 
                        : 'border-slate-200 hover:border-blue-300'
                    }`}
                  >
                    {/* Main Row */}
                    <div 
                      onClick={() => toggleExpand(trip.id)}
                      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/70 transition-colors"
                    >
                      {/* Left info */}
                      <div className="flex items-start gap-3">
                        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                          trip.isBest 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-blue-50 text-blue-700'
                        }`}>
                          {trip.isBest ? <Award className="w-6 h-6" /> : <Car className="w-6 h-6" />}
                        </div>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-black text-base text-slate-900">{trip.title}</span>
                            {trip.isBest && (
                              <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                                Record di Efficienza
                              </span>
                            )}
                            {trip.isWorst && (
                              <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                                Consumo Elevato
                              </span>
                            )}
                            <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                              {trip.daysDuration} {trip.daysDuration === 1 ? 'giorno' : 'giorni'}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 flex-wrap">
                            <span className="flex items-center gap-1 font-medium">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              {trip.startDate} <ArrowRight className="w-3 h-3 text-slate-300" /> {trip.endDate}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1 font-bold text-slate-700">
                              <Gauge className="w-3.5 h-3.5 text-slate-400" />
                              {trip.startKm.toLocaleString('it-IT')} km → {trip.endKm.toLocaleString('it-IT')} km
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right metrics */}
                      <div className="flex items-center justify-between sm:justify-end gap-5 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0">
                        {/* Distance & Fuel */}
                        <div className="text-left sm:text-right">
                          <span className="text-sm sm:text-base font-black text-slate-900 block">
                            {trip.distanceKm.toLocaleString('it-IT')} km
                          </span>
                          <span className="text-[11px] font-semibold text-slate-500 block">
                            {trip.totalQuantity} {trip.unit} ({settings.currency}{trip.totalSpent.toFixed(2)})
                          </span>
                        </div>

                        {/* Consumption badge */}
                        <div className="text-right">
                          <span className="text-sm sm:text-base font-black text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-xl block shadow-2xs">
                            {trip.formattedKmPerUnit} km/{trip.unit}
                          </span>
                          <span className="text-[10px] font-bold text-slate-500 block mt-0.5">
                            {trip.formattedUnitPer100Km} {trip.unit}/100km
                          </span>
                        </div>

                        <button 
                          type="button"
                          className="w-8 h-8 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center shrink-0 cursor-pointer"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Expanded details */}
                    {isExpanded && (
                      <div className="bg-slate-50/80 border-t border-slate-100 p-4 flex flex-col gap-3 animate-in fade-in duration-150">
                        {/* Sub-KPI grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                          <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                            <span className="text-[10px] text-slate-400 font-bold uppercase block">Costo al km</span>
                            <span className="font-black text-slate-900 text-sm mt-0.5 block">{settings.currency} {trip.costPerKm}</span>
                          </div>
                          <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                            <span className="text-[10px] text-slate-400 font-bold uppercase block">Costo per 100 km</span>
                            <span className="font-black text-slate-900 text-sm mt-0.5 block">{settings.currency} {trip.costPer100Km}</span>
                          </div>
                          <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                            <span className="text-[10px] text-slate-400 font-bold uppercase block">Rifornimenti nel Trip</span>
                            <span className="font-black text-slate-900 text-sm mt-0.5 block">{trip.refuelsCount} {trip.refuelsCount === 1 ? 'rifornimento' : 'rifornimenti'}</span>
                          </div>
                          <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                            <span className="text-[10px] text-slate-400 font-bold uppercase block">Variazione Efficienza</span>
                            <span className={`font-black text-sm mt-0.5 flex items-center gap-1 ${isPositiveDiff ? 'text-emerald-700' : 'text-amber-700'}`}>
                              {isPositiveDiff ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                              {isPositiveDiff ? `+${trip.efficiencyVsAveragePercent}%` : `${trip.efficiencyVsAveragePercent}%`} vs media
                            </span>
                          </div>
                        </div>

                        {/* Rifornimenti components */}
                        {trip.refuels.length > 0 && (
                          <div className="mt-1">
                            <span className="text-[11px] font-bold text-slate-700 block mb-1.5">
                              Rifornimenti inclusi in questo Trip:
                            </span>
                            <div className="flex flex-col gap-1.5">
                              {trip.refuels.map((r, rIdx) => (
                                <div 
                                  key={r.id} 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (onSelectRefuel) onSelectRefuel(r);
                                  }}
                                  className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs hover:border-blue-400 cursor-pointer transition-all"
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="w-5 h-5 rounded-full bg-slate-100 font-black text-[10px] text-slate-600 flex items-center justify-center">
                                      {rIdx + 1}
                                    </span>
                                    <div>
                                      <span className="font-bold text-slate-800">{r.date}</span>
                                      <span className="text-[10px] text-slate-400 ml-1.5 font-medium">({Number(r.km).toLocaleString('it-IT')} km)</span>
                                    </div>
                                    <span className={`text-[9.5px] font-extrabold px-1.5 py-0.2 rounded border ${
                                      r.type === 'full' 
                                        ? 'bg-blue-50 text-blue-700 border-blue-200' 
                                        : 'bg-amber-50 text-amber-800 border-amber-200'
                                    }`}>
                                      {r.type === 'full' ? 'Pieno' : 'Parziale'}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-3">
                                    <span className="font-bold text-slate-700">{r.quantity} {r.unit || trip.unit}</span>
                                    <span className="font-black text-slate-900">{settings.currency} {Number(r.price).toFixed(2)}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500 font-medium">
            Aggiornato automaticamente da ogni rifornimento con Pieno
          </span>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black shadow-xs hover:shadow transition-all cursor-pointer"
          >
            Chiudi Schermata
          </button>
        </div>

      </div>
    </div>
  );
};
