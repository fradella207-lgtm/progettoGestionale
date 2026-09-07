import React, { useState, useEffect, useMemo } from 'react';
import { 
  ArrowLeft,
  TrendingUp, 
  Gauge, 
  Calendar, 
  Receipt, 
  Info, 
  ChevronDown, 
  ChevronUp, 
  Zap, 
  Fuel, 
  Route,
  Tag,
  Briefcase,
  Plane,
  Building2,
  Sparkles,
  Car,
  Filter
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
  onUpdateVehicle?: (updated: Vehicle) => void;
}

const USAGE_PRESETS = [
  { id: 'Lavoro', label: 'Lavoro / Pendolare', icon: Briefcase, color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { id: 'Viaggio', label: 'Viaggio / Autostrada', icon: Plane, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { id: 'Città', label: 'Città / Commissioni', icon: Building2, color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { id: 'Tempo Libero', label: 'Tempo Libero / Weekend', icon: Sparkles, color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { id: 'Misto', label: 'Percorso Misto', icon: Route, color: 'bg-slate-100 text-slate-700 border-slate-200' }
];

export const BoardTripsModal: React.FC<BoardTripsModalProps> = ({
  isOpen,
  onClose,
  vehicle,
  metrics,
  settings,
  onUpdateVehicle
}) => {
  const [expandedTripId, setExpandedTripId] = useState<string | null>(null);
  const [chartMetric, setChartMetric] = useState<'efficiency' | 'distance' | 'spent'>('efficiency');
  const [selectedUsageFilter, setSelectedUsageFilter] = useState<string>('all');
  const [editingUsageTripId, setEditingUsageTripId] = useState<string | null>(null);
  const [hoveredTripId, setHoveredTripId] = useState<string | null>(null);

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

  // Sorted trips (newest first for list, chronological for chart)
  const allTrips = metrics.boardTrips;
  const chronologicalTrips = [...allTrips].reverse();

  // Filtered trips by usage category
  const filteredTrips = selectedUsageFilter === 'all'
    ? allTrips
    : allTrips.filter(t => (t.usageCategory || 'Non Assegnato') === selectedUsageFilter);

  const toggleExpand = (id: string) => {
    setExpandedTripId(prev => prev === id ? null : id);
  };

  const handleSelectUsage = (tripId: string, usage: string) => {
    if (!onUpdateVehicle) return;
    const currentUsages = { ...(vehicle.tripUsages || {}) };
    if (usage === '') {
      delete currentUsages[tripId];
    } else {
      currentUsages[tripId] = usage;
    }
    const updatedVehicle: Vehicle = {
      ...vehicle,
      tripUsages: currentUsages
    };
    onUpdateVehicle(updatedVehicle);
    setEditingUsageTripId(null);
  };

  // Safe rounding helpers for metrics to avoid any NaN or float errors
  const safeAverageKmPerUnit = metrics.kmPerUnit !== '--' ? Number(metrics.kmPerUnit) : 0;
  const safeAverageUnitPer100Km = metrics.unitPer100Km !== '--' ? Number(metrics.unitPer100Km) : 0;

  // Chart data calculations
  const maxEfficiency = Math.max(...chronologicalTrips.map(t => t.kmPerUnit || 0), 1);
  const maxDistance = Math.max(...chronologicalTrips.map(t => t.distanceKm || 0), 100);
  const maxSpent = Math.max(...chronologicalTrips.map(t => t.totalSpent || 0), 50);

  return (
    <div className="fixed inset-0 z-50 bg-slate-50 flex flex-col overflow-y-auto min-h-screen font-['Plus_Jakarta_Sans',sans-serif] animate-in fade-in duration-150">
      
      {/* STICKY TOP APP BAR - Clean & Minimal */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-3 shrink-0 shadow-2xs">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 text-xs font-bold border border-slate-200 transition-all cursor-pointer shrink-0 group"
            title="Torna alla scheda veicolo"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform text-slate-700" />
            <span>Indietro</span>
          </button>

          <div className="h-5 w-px bg-slate-200 hidden xs:block shrink-0" />

          <div className="min-w-0">
            <h1 className="text-sm sm:text-base font-extrabold text-slate-900 leading-tight truncate flex items-center gap-2">
              <span>Computer di Bordo & Trip</span>
              <span className="bg-slate-100 text-slate-700 text-[10.5px] font-bold px-2 py-0.5 rounded-md border border-slate-200">
                {allTrips.length} {allTrips.length === 1 ? 'Trip' : 'Trip'}
              </span>
            </h1>
            <p className="text-xs text-slate-500 truncate">
              {vehicle.brand} {vehicle.model} • <span className="font-semibold text-slate-700">{vehicle.plate}</span>
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 bg-slate-100/80 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-600 border border-slate-200/60">
          <Route className="w-3.5 h-3.5 text-indigo-600" />
          <span>Intervallo Pieno-Pieno</span>
        </div>
      </header>

      {/* MAIN PAGE BODY */}
      <main className="max-w-5xl mx-auto w-full px-3.5 sm:px-8 py-6 space-y-5 flex-1 flex flex-col">
        
        {/* KPI CARDS (LIGHT & MINIMAL WITH CLEAN ROUNDING) */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/70 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Cicli Pieno</span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 block mt-1">
              {allTrips.length}
            </span>
            <span className="text-[11px] text-slate-500 block mt-0.5 font-medium">
              Intervalli certificati
            </span>
          </div>

          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/70 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-indigo-600 block tracking-wider">Consumo Medio</span>
            <span className="text-xl sm:text-2xl font-black text-indigo-600 block mt-1">
              {safeAverageKmPerUnit > 0 ? safeAverageKmPerUnit.toFixed(1) : '--'}{' '}
              <span className="text-xs font-bold text-indigo-500">km/{unitLabel}</span>
            </span>
            <span className="text-[11px] text-slate-500 block mt-0.5 font-medium">
              {safeAverageUnitPer100Km > 0 ? safeAverageUnitPer100Km.toFixed(2) : '--'} {unitLabel}/100km
            </span>
          </div>

          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/70 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-emerald-600 block tracking-wider">Autonomia Media</span>
            <span className="text-xl sm:text-2xl font-black text-emerald-600 block mt-1">
              {Math.round(metrics.avgTripDistanceKm).toLocaleString('it-IT')}{' '}
              <span className="text-xs font-bold text-emerald-500">km</span>
            </span>
            <span className="text-[11px] text-slate-500 block mt-0.5 font-medium">
              Distanza per pieno
            </span>
          </div>

          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/70 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-amber-600 block tracking-wider">Spesa Media Trip</span>
            <span className="text-xl sm:text-2xl font-black text-amber-600 block mt-1">
              {settings.currency} {metrics.avgTripCost.toFixed(2)}
            </span>
            <span className="text-[11px] text-slate-500 block mt-0.5 font-medium">
              {metrics.fuelCostPerKm} {settings.currency}/km
            </span>
          </div>
        </section>

        {/* INTERACTIVE DAILY / CHRONOLOGICAL TREND CHART */}
        {chronologicalTrips.length > 0 && (
          <section className="bg-white border border-slate-200/70 rounded-2xl p-4 sm:p-6 shadow-2xs flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-indigo-600" />
                  Andamento Cronologico dei Viaggi
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Evoluzione giorno per giorno tra i vari rifornimenti a pieno
                </p>
              </div>

              {/* Metric Selector Toggle */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start sm:self-auto border border-slate-200/60 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setChartMetric('efficiency')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    chartMetric === 'efficiency'
                      ? 'bg-white text-indigo-700 shadow-2xs font-extrabold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Efficienza (km/{unitLabel})
                </button>
                <button
                  type="button"
                  onClick={() => setChartMetric('distance')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    chartMetric === 'distance'
                      ? 'bg-white text-indigo-700 shadow-2xs font-extrabold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Distanza (km)
                </button>
                <button
                  type="button"
                  onClick={() => setChartMetric('spent')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    chartMetric === 'spent'
                      ? 'bg-white text-indigo-700 shadow-2xs font-extrabold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Spesa ({settings.currency})
                </button>
              </div>
            </div>

            {/* Visual SVG Timeline Bar/Chart */}
            <div className="w-full pt-4 pb-2">
              <div className="h-44 sm:h-52 w-full flex items-end gap-2 sm:gap-4 px-2 border-b border-slate-200 relative">
                {/* Horizontal reference dashed line for average */}
                {chartMetric === 'efficiency' && safeAverageKmPerUnit > 0 && (
                  <div 
                    className="absolute left-0 right-0 border-b-2 border-dashed border-indigo-200 pointer-events-none z-0 flex items-center justify-end pr-2"
                    style={{ bottom: `${Math.min(92, Math.max(8, (safeAverageKmPerUnit / maxEfficiency) * 100))}%` }}
                  >
                    <span className="text-[10px] font-bold text-indigo-500 bg-white/90 px-1 rounded shadow-2xs">
                      Media {safeAverageKmPerUnit.toFixed(1)} km/{unitLabel}
                    </span>
                  </div>
                )}

                {chronologicalTrips.map((trip) => {
                  let value = trip.kmPerUnit;
                  let maxVal = maxEfficiency;
                  let valueLabel = `${trip.kmPerUnit.toFixed(1)} km/${unitLabel}`;
                  
                  if (chartMetric === 'distance') {
                    value = trip.distanceKm;
                    maxVal = maxDistance;
                    valueLabel = `+${trip.distanceKm.toLocaleString('it-IT')} km`;
                  } else if (chartMetric === 'spent') {
                    value = trip.totalSpent;
                    maxVal = maxSpent;
                    valueLabel = `${settings.currency} ${trip.totalSpent.toFixed(2)}`;
                  }

                  const heightPercent = Math.min(96, Math.max(12, (value / maxVal) * 100));
                  const isHovered = hoveredTripId === trip.id;
                  const dateFormatted = trip.endDate 
                    ? new Date(trip.endDate).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })
                    : `Trip #${trip.tripIndex}`;

                  const usageObj = USAGE_PRESETS.find(u => u.id === trip.usageCategory);

                  return (
                    <div 
                      key={`chart-${trip.id}`}
                      onMouseEnter={() => setHoveredTripId(trip.id)}
                      onMouseLeave={() => setHoveredTripId(null)}
                      onClick={() => toggleExpand(trip.id)}
                      className="flex-1 flex flex-col items-center justify-end h-full group relative cursor-pointer"
                    >
                      {/* Interactive Tooltip Card */}
                      {isHovered && (
                        <div className="absolute -top-16 z-30 bg-slate-900 text-white text-[11px] p-2 rounded-xl shadow-lg whitespace-nowrap pointer-events-none flex flex-col gap-0.5 animate-in fade-in duration-100">
                          <span className="font-bold text-indigo-300">Trip #{trip.tripIndex} ({dateFormatted})</span>
                          <span>{valueLabel}</span>
                          {trip.usageCategory && (
                            <span className="text-[10px] text-slate-300">Utilizzo: {trip.usageCategory}</span>
                          )}
                        </div>
                      )}

                      {/* Bar Pillar */}
                      <div 
                        className={`w-full max-w-[42px] rounded-t-xl transition-all duration-200 relative ${
                          isHovered 
                            ? 'bg-indigo-600 shadow-md scale-y-105' 
                            : (trip.isBest && chartMetric === 'efficiency' 
                                ? 'bg-emerald-500' 
                                : (trip.usageCategory ? 'bg-indigo-500' : 'bg-slate-300 hover:bg-indigo-400'))
                        }`}
                        style={{ height: `${heightPercent}%` }}
                      >
                        {/* Optional small indicator dot on top */}
                        {trip.usageCategory && (
                          <div className="w-1.5 h-1.5 rounded-full bg-white absolute top-1 left-1/2 -translate-x-1/2 shadow-xs" />
                        )}
                      </div>

                      {/* X-Axis Date Label */}
                      <span className="text-[10px] font-medium text-slate-400 group-hover:text-slate-800 transition-colors mt-2 text-center truncate max-w-[48px]">
                        {dateFormatted}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Chart Legend / Notes */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-slate-500">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-indigo-500" />
                  <span>Con Utilizzo Assegnato</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-slate-300" />
                  <span>Standard</span>
                </span>
                {metrics.bestTrip && (
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                    <span>Migliore Efficienza</span>
                  </span>
                )}
              </div>
              <span className="text-[10.5px] italic text-slate-400">
                Tocca una barra per aprire i dettagli del ciclo
              </span>
            </div>
          </section>
        )}

        {/* USAGE CLASSIFICATION FILTER BAR */}
        <section className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              Filtra per Classificazione Utilizzo:
            </span>
            <span className="text-xs text-slate-400">
              {filteredTrips.length} di {allTrips.length} trip
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            <button
              type="button"
              onClick={() => setSelectedUsageFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer border ${
                selectedUsageFilter === 'all'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'
              }`}
            >
              Tutti ({allTrips.length})
            </button>

            {USAGE_PRESETS.map(preset => {
              const count = allTrips.filter(t => t.usageCategory === preset.id).length;
              if (count === 0 && selectedUsageFilter !== preset.id) return null;
              const Icon = preset.icon;

              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setSelectedUsageFilter(preset.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer border ${
                    selectedUsageFilter === preset.id
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                      : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{preset.label.split(' / ')[0]}</span>
                  <span className={`text-[10px] px-1 rounded-md font-bold ${
                    selectedUsageFilter === preset.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* DETAILED TRIPS LIST WITH INLINE USAGE CLASSIFIER */}
        <section className="space-y-3 pb-8 flex-1">
          {filteredTrips.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/70 p-10 text-center flex flex-col items-center justify-center shadow-2xs">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                <Route className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Nessun trip trovato</h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                {selectedUsageFilter !== 'all' 
                  ? 'Nessun trip associato a questa categoria di utilizzo. Seleziona "Tutti" o assegna la categoria a uno dei tuoi cicli di rifornimento.'
                  : 'Registra almeno due rifornimenti con "Pieno" per calcolare i tuoi trip di bordo.'}
              </p>
            </div>
          ) : (
            filteredTrips.map((trip) => {
              const isExpanded = expandedTripId === trip.id;
              const isEditingUsage = editingUsageTripId === trip.id;
              const currentUsagePreset = USAGE_PRESETS.find(u => u.id === trip.usageCategory);
              const UsageIcon = currentUsagePreset ? currentUsagePreset.icon : Tag;

              return (
                <div 
                  key={trip.id}
                  className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden shadow-2xs ${
                    trip.isBest 
                      ? 'border-emerald-300/80 hover:border-emerald-400' 
                      : 'border-slate-200/70 hover:border-indigo-300'
                  }`}
                >
                  {/* Trip Summary Row */}
                  <div 
                    onClick={() => toggleExpand(trip.id)}
                    className="p-4 sm:p-4.5 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-50/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 font-extrabold text-xs ${
                        trip.isBest 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        #{trip.tripIndex}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-extrabold text-slate-900">
                            +{trip.distanceKm.toLocaleString('it-IT')} km
                          </span>
                          
                          {/* Classification Tag / Badge */}
                          {currentUsagePreset ? (
                            <span className={`inline-flex items-center gap-1 text-[10.5px] font-bold px-2 py-0.5 rounded-lg border ${currentUsagePreset.color}`}>
                              <UsageIcon className="w-3 h-3" />
                              <span>{currentUsagePreset.label.split(' / ')[0]}</span>
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-medium italic">
                              Utilizzo non specificato
                            </span>
                          )}

                          {trip.isBest && (
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-1.5 py-0.2 rounded-md border border-emerald-200">
                              Miglior Efficienza
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 flex-wrap">
                          <span className="font-semibold text-slate-600">
                            {trip.startDate ? new Date(trip.startDate).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' }) : ''} 
                            {' → '}
                            {new Date(trip.endDate).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="font-bold text-indigo-600">
                            {trip.kmPerUnit.toFixed(1)} km/{unitLabel}
                          </span>
                          <span className="text-slate-400">
                            ({trip.unitPer100Km.toFixed(2)} {unitLabel}/100km)
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right hidden sm:block">
                        <span className="text-sm font-black text-slate-900 block">
                          {settings.currency} {trip.totalSpent.toFixed(2)}
                        </span>
                        <span className="text-[10.5px] font-semibold text-slate-400 block">
                          {trip.costPerKm} {settings.currency}/km
                        </span>
                      </div>

                      <div className="p-1 rounded-lg text-slate-400 hover:text-slate-600 bg-slate-100">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Breakdown & Utilizzo Picker */}
                  {isExpanded && (
                    <div className="px-4 sm:px-5 pb-4 pt-2 border-t border-slate-100 bg-slate-50/40 space-y-3.5">
                      
                      {/* USAGE ASSIGNMENT / CLASSIFICATION BAR */}
                      <div className="p-3 bg-white rounded-xl border border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                        <div className="flex items-center gap-2">
                          <Tag className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          <span className="text-xs font-bold text-slate-700">Classifica l&apos;utilizzo di questo viaggio:</span>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5">
                          {USAGE_PRESETS.map((preset) => {
                            const isSelected = trip.usageCategory === preset.id;
                            const Icon = preset.icon;
                            return (
                              <button
                                key={preset.id}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSelectUsage(trip.id, isSelected ? '' : preset.id);
                                }}
                                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all border cursor-pointer active:scale-95 ${
                                  isSelected
                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs font-extrabold'
                                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                                }`}
                              >
                                <Icon className="w-3 h-3" />
                                <span>{preset.label.split(' / ')[0]}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Associated Refuels for this Trip */}
                      <div>
                        <h4 className="text-[10.5px] font-extrabold uppercase text-slate-400 tracking-wider mb-2">
                          Rifornimenti del Ciclo ({trip.refuels.length}):
                        </h4>

                        <div className="space-y-1.5">
                          {trip.refuels.map((r, rIdx) => (
                            <div 
                              key={r.id || rIdx}
                              className="bg-white p-2.5 rounded-xl border border-slate-200/60 flex items-center justify-between text-xs"
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-800">
                                  {r.date ? new Date(r.date).toLocaleDateString('it-IT') : 'Data n.d.'}
                                </span>
                                <span className="text-slate-300">•</span>
                                <span className="font-medium text-slate-600">
                                  {Number(r.km).toLocaleString('it-IT')} km
                                </span>
                                <span className={`text-[9.5px] font-bold px-1.5 py-0.2 rounded ${
                                  r.type === 'full' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
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
