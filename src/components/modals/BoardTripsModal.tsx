import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
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
  returnTo?: 'detail' | 'refuels';
  onUpdateVehicle?: (updated: Vehicle) => void;
}

const getThemeColors = (theme?: string) => {
  switch (theme) {
    case 'emerald':
      return {
        badgeBg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
        textAccent: 'text-emerald-600 dark:text-emerald-400',
        textSubAccent: 'text-emerald-500 dark:text-emerald-400',
        borderAccent: 'border-emerald-400 dark:border-emerald-500',
        borderHover: 'hover:border-emerald-400 dark:hover:border-emerald-500',
        bgAccent: 'bg-emerald-600 dark:bg-emerald-500',
        bgHover: 'bg-emerald-600 dark:bg-emerald-500',
        ringAccent: 'ring-emerald-300 dark:ring-emerald-600',
        btnActive: 'bg-emerald-600 text-white border-emerald-600 shadow-2xs',
        btnTextActive: 'text-emerald-600 dark:text-emerald-400 font-extrabold',
        iconBg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/50',
      };
    case 'violet':
      return {
        badgeBg: 'bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800',
        textAccent: 'text-violet-600 dark:text-violet-400',
        textSubAccent: 'text-violet-500 dark:text-violet-400',
        borderAccent: 'border-violet-400 dark:border-violet-500',
        borderHover: 'hover:border-violet-400 dark:hover:border-violet-600',
        bgAccent: 'bg-violet-600 dark:bg-violet-500',
        bgHover: 'bg-violet-600 dark:bg-violet-500',
        ringAccent: 'ring-violet-300 dark:ring-violet-600',
        btnActive: 'bg-violet-600 text-white border-violet-600 shadow-2xs',
        btnTextActive: 'text-violet-600 dark:text-violet-400 font-extrabold',
        iconBg: 'bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 border-violet-100 dark:border-violet-900/50',
      };
    case 'amber':
      return {
        badgeBg: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
        textAccent: 'text-amber-600 dark:text-amber-400',
        textSubAccent: 'text-amber-500 dark:text-amber-400',
        borderAccent: 'border-amber-400 dark:border-amber-500',
        borderHover: 'hover:border-amber-400 dark:hover:border-amber-600',
        bgAccent: 'bg-amber-600 dark:bg-amber-500',
        bgHover: 'bg-amber-600 dark:bg-amber-500',
        ringAccent: 'ring-amber-300 dark:ring-amber-600',
        btnActive: 'bg-amber-600 text-white border-amber-600 shadow-2xs',
        btnTextActive: 'text-amber-600 dark:text-amber-400 font-extrabold',
        iconBg: 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/50',
      };
    case 'rose':
      return {
        badgeBg: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
        textAccent: 'text-rose-600 dark:text-rose-400',
        textSubAccent: 'text-rose-500 dark:text-rose-400',
        borderAccent: 'border-rose-400 dark:border-rose-500',
        borderHover: 'hover:border-rose-400 dark:hover:border-rose-600',
        bgAccent: 'bg-rose-600 dark:bg-rose-500',
        bgHover: 'bg-rose-600 dark:bg-rose-500',
        ringAccent: 'ring-rose-300 dark:ring-rose-600',
        btnActive: 'bg-rose-600 text-white border-rose-600 shadow-2xs',
        btnTextActive: 'text-rose-600 dark:text-rose-400 font-extrabold',
        iconBg: 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900/50',
      };
    case 'blue':
      return {
        badgeBg: 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
        textAccent: 'text-blue-600 dark:text-blue-400',
        textSubAccent: 'text-blue-500 dark:text-blue-400',
        borderAccent: 'border-blue-400 dark:border-blue-500',
        borderHover: 'hover:border-blue-400 dark:hover:border-blue-600',
        bgAccent: 'bg-blue-600 dark:bg-blue-500',
        bgHover: 'bg-blue-600 dark:bg-blue-500',
        ringAccent: 'ring-blue-300 dark:ring-blue-600',
        btnActive: 'bg-blue-600 text-white border-blue-600 shadow-2xs',
        btnTextActive: 'text-blue-600 dark:text-blue-400 font-extrabold',
        iconBg: 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/50',
      };
    case 'slate':
      return {
        badgeBg: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700',
        textAccent: 'text-slate-800 dark:text-slate-200',
        textSubAccent: 'text-slate-600 dark:text-slate-400',
        borderAccent: 'border-slate-500 dark:border-slate-400',
        borderHover: 'hover:border-slate-500 dark:hover:border-slate-400',
        bgAccent: 'bg-slate-800 dark:bg-slate-700',
        bgHover: 'bg-slate-800 dark:bg-slate-700',
        ringAccent: 'ring-slate-400 dark:ring-slate-500',
        btnActive: 'bg-slate-800 dark:bg-slate-700 text-white border-slate-800 dark:border-slate-700 shadow-2xs',
        btnTextActive: 'text-slate-900 dark:text-white font-extrabold',
        iconBg: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
      };
    case 'indigo':
    default:
      return {
        badgeBg: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
        textAccent: 'text-indigo-600 dark:text-indigo-400',
        textSubAccent: 'text-indigo-500 dark:text-indigo-400',
        borderAccent: 'border-indigo-400 dark:border-indigo-500',
        borderHover: 'hover:border-indigo-400 dark:hover:border-indigo-600',
        bgAccent: 'bg-indigo-600 dark:bg-indigo-500',
        bgHover: 'bg-indigo-600 dark:bg-indigo-500',
        ringAccent: 'ring-indigo-300 dark:ring-indigo-600',
        btnActive: 'bg-indigo-600 text-white border-indigo-600 shadow-2xs',
        btnTextActive: 'text-indigo-600 dark:text-indigo-400 font-extrabold',
        iconBg: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/50',
      };
  }
};

const USAGE_PRESETS = [
  { id: 'Lavoro', label: 'Lavoro / Pendolare', icon: Briefcase, color: 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800' },
  { id: 'Viaggio', label: 'Viaggio / Autostrada', icon: Plane, color: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' },
  { id: 'Città', label: 'Città / Commissioni', icon: Building2, color: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800' },
  { id: 'Tempo Libero', label: 'Tempo Libero / Weekend', icon: Sparkles, color: 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800' },
  { id: 'Misto', label: 'Percorso Misto', icon: Route, color: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700' }
];

export const BoardTripsModal: React.FC<BoardTripsModalProps> = ({
  isOpen,
  onClose,
  vehicle,
  metrics,
  settings,
  returnTo = 'detail',
  onUpdateVehicle
}) => {
  const theme = useMemo(() => getThemeColors(settings.themeColor), [settings.themeColor]);
  const [expandedTripId, setExpandedTripId] = useState<string | null>(null);
  const [chartMetric, setChartMetric] = useState<'efficiency' | 'distance' | 'spent'>('efficiency');
  const [selectedUsageFilter, setSelectedUsageFilter] = useState<string>('all');
  const [editingUsageTripId, setEditingUsageTripId] = useState<string | null>(null);
  const [hoveredTripId, setHoveredTripId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Prevent background scrolling and reset scroll to top when page is opened
  useEffect(() => {
    if (isOpen) {
      containerRef.current?.scrollTo({ top: 0, behavior: 'instant' });
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

  // Chart data calculations with generous headroom to prevent collision
  const maxEfficiency = Math.max(...chronologicalTrips.map(t => t.kmPerUnit || 0), safeAverageKmPerUnit, 1);
  const chartHeadroomEfficiency = maxEfficiency * 1.25;
  const maxDistance = Math.max(...chronologicalTrips.map(t => t.distanceKm || 0), 100);
  const chartHeadroomDistance = maxDistance * 1.2;
  const maxSpent = Math.max(...chronologicalTrips.map(t => t.totalSpent || 0), 50);
  const chartHeadroomSpent = maxSpent * 1.2;

  const modalContent = (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-[70] bg-slate-50 dark:bg-[#090d16] flex flex-col overflow-y-auto min-h-screen font-['Plus_Jakarta_Sans',sans-serif] animate-in fade-in duration-150"
    >
      
      {/* STICKY TOP APP BAR - Clean & Solid with safe area padding, no blur */}
      <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-3.5 sm:px-8 pt-[max(0.6rem,env(safe-area-inset-top))] pb-3 sm:pb-3.5 flex items-center justify-between gap-2 shrink-0 shadow-2xs select-none">
        <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 active:scale-95 text-slate-800 dark:text-slate-200 text-xs font-black border border-slate-200 dark:border-slate-700 transition-all cursor-pointer shrink-0 group shadow-2xs"
            title={returnTo === 'refuels' ? 'Torna al registro carburante' : 'Torna alla scheda veicolo'}
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform text-slate-700 dark:text-slate-300" />
            <span>{returnTo === 'refuels' ? 'Carburante' : 'Indietro'}</span>
          </button>

          <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 hidden xs:block shrink-0" />

          <div className="min-w-0">
            <h1 className="text-sm sm:text-base font-black text-slate-900 dark:text-white leading-tight truncate flex items-center gap-2">
              <span>Cicli del Pieno (Pieno-Pieno)</span>
              <span className={`${theme.badgeBg} text-[10.5px] font-black px-2 py-0.5 rounded-full border`}>
                {allTrips.length} {allTrips.length === 1 ? 'Ciclo' : 'Cicli'}
              </span>
            </h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              {vehicle.brand} {vehicle.model} {vehicle.plate ? `• ${vehicle.plate}` : ''} • Calcolo consumi reali da contachilometri
            </p>
          </div>
        </div>
      </header>

      {/* MAIN PAGE BODY */}
      <main className="max-w-5xl mx-auto w-full px-3.5 sm:px-8 pt-4 pb-28 sm:pb-16 space-y-5 flex-1 flex flex-col">
        
        {/* KPI CARDS (CLEAN, ELEGANT, BALANCED NEUTRALS) */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
          <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block tracking-wider">Cicli Certificati</span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white block mt-1">
              {allTrips.length}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5 font-medium">
              Intervalli pieno-pieno
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
            <span className={`text-[10px] uppercase font-bold ${theme.textAccent} block tracking-wider`}>Consumo Medio</span>
            <span className={`text-xl sm:text-2xl font-black ${theme.textAccent} block mt-1`}>
              {safeAverageKmPerUnit > 0 ? safeAverageKmPerUnit.toFixed(1) : '--'}{' '}
              <span className={`text-xs font-bold ${theme.textSubAccent}`}>km/{unitLabel}</span>
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5 font-medium">
              {safeAverageUnitPer100Km > 0 ? safeAverageUnitPer100Km.toFixed(2) : '--'} {unitLabel}/100km
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-slate-700 dark:text-slate-300 block tracking-wider">Autonomia Media</span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white block mt-1">
              {Math.round(metrics.avgTripDistanceKm).toLocaleString('it-IT')}{' '}
              <span className="text-xs font-bold text-slate-500">km</span>
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5 font-medium">
              Distanza media per ciclo
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-slate-700 dark:text-slate-300 block tracking-wider">Costo Medio Ciclo</span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white block mt-1">
              {settings.currency} {metrics.avgTripCost.toFixed(2)}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5 font-medium">
              {metrics.fuelCostPerKm} {settings.currency}/km
            </span>
          </div>
        </section>

        {/* INTERACTIVE DAILY / CHRONOLOGICAL TREND CHART */}
        {chronologicalTrips.length > 0 && (
          <section className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xs flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                    <TrendingUp className={`w-4 h-4 ${theme.textAccent}`} />
                    Andamento Cronologico dei Cicli
                  </h3>
                  {chartMetric === 'efficiency' && safeAverageKmPerUnit > 0 && (
                    <span className={`inline-flex items-center gap-1.5 text-[11px] font-black ${theme.badgeBg} border px-2 py-0.5 rounded-lg shadow-2xs`}>
                      <span className={`w-3 border-b-2 border-dashed ${theme.borderAccent} inline-block`} />
                      Media: {safeAverageKmPerUnit.toFixed(1)} km/{unitLabel}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Evoluzione dei consumi e delle percorrenze tra i vari pieni consecutivi
                </p>
              </div>

              {/* Metric Selector Toggle */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl self-start sm:self-auto border border-slate-200/60 dark:border-slate-700 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setChartMetric('efficiency')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    chartMetric === 'efficiency'
                      ? `bg-white dark:bg-slate-700 ${theme.btnTextActive} shadow-2xs`
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Consumo (km/{unitLabel})
                </button>
                <button
                  type="button"
                  onClick={() => setChartMetric('distance')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    chartMetric === 'distance'
                      ? `bg-white dark:bg-slate-700 ${theme.btnTextActive} shadow-2xs`
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Distanza (km)
                </button>
                <button
                  type="button"
                  onClick={() => setChartMetric('spent')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    chartMetric === 'spent'
                      ? `bg-white dark:bg-slate-700 ${theme.btnTextActive} shadow-2xs`
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Spesa ({settings.currency})
                </button>
              </div>
            </div>

            {/* Visual Enhanced Timeline Bar/Chart */}
            <div className="w-full pt-6 pb-2 overflow-x-auto">
              <div className="h-48 sm:h-56 min-w-[340px] w-full flex items-end gap-2.5 sm:gap-4 px-3 sm:px-6 border-b border-slate-200 dark:border-slate-800 relative bg-slate-50/50 dark:bg-slate-950/30 rounded-t-2xl">
                
                {/* Horizontal grid lines for scale */}
                <div className="absolute inset-0 pointer-events-none flex flex-col justify-between py-4 px-1 opacity-50 z-0">
                  <div className="w-full border-b border-dashed border-slate-200 dark:border-slate-800 flex justify-end">
                    <span className="text-[9px] font-mono text-slate-400 -mt-2">
                      {chartMetric === 'efficiency' ? `${chartHeadroomEfficiency.toFixed(0)} km/${unitLabel}` : (chartMetric === 'distance' ? `${Math.round(chartHeadroomDistance)} km` : `${settings.currency} ${Math.round(chartHeadroomSpent)}`)}
                    </span>
                  </div>
                  <div className="w-full border-b border-dashed border-slate-200 dark:border-slate-800 flex justify-end">
                    <span className="text-[9px] font-mono text-slate-400 -mt-2">
                      {chartMetric === 'efficiency' ? `${(chartHeadroomEfficiency * 0.5).toFixed(0)} km/${unitLabel}` : (chartMetric === 'distance' ? `${Math.round(chartHeadroomDistance * 0.5)} km` : `${settings.currency} ${Math.round(chartHeadroomSpent * 0.5)}`)}
                    </span>
                  </div>
                  <div className="w-full border-b border-slate-200 dark:border-slate-800" />
                </div>

                {/* Horizontal reference dashed line for average (clean line without overlapping badge on bars) */}
                {chartMetric === 'efficiency' && safeAverageKmPerUnit > 0 && (
                  <div 
                    className={`absolute left-0 right-0 border-b-2 border-dashed ${theme.borderAccent} pointer-events-none z-10 transition-all duration-300 opacity-85`}
                    style={{ bottom: `${Math.min(80, Math.max(10, (safeAverageKmPerUnit / chartHeadroomEfficiency) * 100))}%` }}
                  >
                    <span className={`absolute -top-4 left-2 text-[9px] font-bold ${theme.textAccent} bg-white dark:bg-slate-900 px-1.5 py-0.2 rounded border border-slate-200 dark:border-slate-800 shadow-2xs`}>
                      Media {safeAverageKmPerUnit.toFixed(1)}
                    </span>
                  </div>
                )}

                {chronologicalTrips.map((trip) => {
                  let value = trip.kmPerUnit;
                  let maxVal = chartHeadroomEfficiency;
                  let valueDisplay = `${trip.kmPerUnit.toFixed(1)}`;
                  let unitDisplay = `km/${unitLabel}`;
                  
                  if (chartMetric === 'distance') {
                    value = trip.distanceKm;
                    maxVal = chartHeadroomDistance;
                    valueDisplay = `${Math.round(trip.distanceKm)}`;
                    unitDisplay = 'km';
                  } else if (chartMetric === 'spent') {
                    value = trip.totalSpent;
                    maxVal = chartHeadroomSpent;
                    valueDisplay = `${trip.totalSpent.toFixed(1)}`;
                    unitDisplay = settings.currency;
                  }

                  const heightPercent = Math.min(80, Math.max(12, (value / maxVal) * 100));
                  const isHovered = hoveredTripId === trip.id;
                  const isExpanded = expandedTripId === trip.id;
                  const dateFormatted = trip.endDate 
                    ? new Date(trip.endDate).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })
                    : `Ciclo #${trip.tripIndex}`;

                  const usageObj = USAGE_PRESETS.find(u => u.id === trip.usageCategory);
                  const isBest = trip.isBest && chartMetric === 'efficiency';

                  return (
                    <div 
                      key={`chart-${trip.id}`}
                      onMouseEnter={() => setHoveredTripId(trip.id)}
                      onMouseLeave={() => setHoveredTripId(null)}
                      onClick={() => toggleExpand(trip.id)}
                      className="flex-1 flex flex-col items-center justify-end h-full group relative cursor-pointer z-10"
                    >
                      {/* Floating Tooltip Card */}
                      {isHovered && (
                        <div className="absolute -top-24 z-30 bg-slate-900 text-white text-xs p-2.5 rounded-2xl shadow-xl whitespace-nowrap pointer-events-none flex flex-col gap-1 border border-slate-700 animate-in fade-in zoom-in-95 duration-150">
                          <div className="flex items-center justify-between gap-3">
                            <span className="font-extrabold text-white text-[11px]">Ciclo #{trip.tripIndex} • {dateFormatted}</span>
                            {usageObj && (
                              <span className="text-[9.5px] font-bold px-1.5 py-0.2 rounded bg-slate-800 text-slate-200 border border-slate-700">
                                {usageObj.id}
                              </span>
                            )}
                          </div>
                          <div className="text-sm font-black text-white flex items-center gap-1">
                            <span>{valueDisplay}</span>
                            <span className="text-[11px] font-semibold text-slate-400">{unitDisplay}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-slate-300 pt-0.5 border-t border-slate-800">
                            <span>{Math.round(trip.distanceKm)} km percorsi</span>
                            <span>•</span>
                            <span>{settings.currency} {trip.totalSpent.toFixed(2)}</span>
                          </div>
                        </div>
                      )}

                      {/* Top Value Tag */}
                      <span className={`text-[10px] font-black transition-all duration-150 mb-1.5 ${
                        isHovered || isExpanded 
                          ? `${theme.textAccent} scale-105` 
                          : (isBest ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400')
                      }`}>
                        {valueDisplay}
                      </span>

                      {/* Bar Pillar */}
                      <div 
                        className={`w-full max-w-[42px] rounded-t-xl transition-all duration-200 relative overflow-hidden ${
                          isHovered 
                            ? `${theme.bgHover} shadow-md ring-2 ${theme.ringAccent} scale-y-[1.02]` 
                            : (isBest 
                                ? 'bg-emerald-600 dark:bg-emerald-500 shadow-xs' 
                                : (trip.usageCategory 
                                    ? `${theme.bgAccent}/90` 
                                    : 'bg-slate-300 dark:bg-slate-700 hover:opacity-90 transition-colors'))
                        }`}
                        style={{ height: `${heightPercent}%` }}
                      >
                        {/* Optional small category icon on bar */}
                        {usageObj && (
                          <div className="absolute top-1.5 left-1/2 -translate-x-1/2 text-white/90">
                            <usageObj.icon className="w-2.5 h-2.5" />
                          </div>
                        )}
                      </div>

                      {/* X-Axis Date Label */}
                      <span className={`text-[10px] font-bold transition-colors mt-2 text-center truncate max-w-[54px] ${
                        isHovered ? `${theme.textAccent} font-black` : 'text-slate-500 dark:text-slate-400'
                      }`}>
                        {dateFormatted}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Chart Legend / Notes */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-[11px] text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-3 flex-wrap font-medium">
                {chartMetric === 'efficiency' && safeAverageKmPerUnit > 0 && (
                  <span className={`flex items-center gap-1.5 font-bold ${theme.textAccent}`}>
                    <span className={`w-4 border-b-2 border-dashed ${theme.borderAccent} inline-block`} />
                    <span>Media ({safeAverageKmPerUnit.toFixed(1)} km/{unitLabel})</span>
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${theme.bgAccent}`} />
                  <span>Con Categoria</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                  <span>Standard</span>
                </span>
                {metrics.bestTrip && (
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 dark:bg-emerald-500" />
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">Migliore Efficienza</span>
                  </span>
                )}
              </div>
              <span className="text-[10.5px] text-slate-400 dark:text-slate-500">
                Tocca una colonna per espandere il dettaglio del ciclo
              </span>
            </div>
          </section>
        )}

        {/* USAGE CLASSIFICATION FILTER BAR */}
        <section className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              Filtra per Classificazione Utilizzo:
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500">
              {filteredTrips.length} di {allTrips.length} cicli
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            <button
              type="button"
              onClick={() => setSelectedUsageFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer border ${
                selectedUsageFilter === 'all'
                  ? `${theme.btnActive}`
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-800'
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
                      ? `${theme.btnActive}`
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{preset.label.split(' / ')[0]}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-bold ${
                    selectedUsageFilter === preset.id ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
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
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-10 text-center flex flex-col items-center justify-center shadow-2xs">
              <div className={`w-12 h-12 rounded-2xl ${theme.iconBg} flex items-center justify-center mb-3 border`}>
                <Route className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Nessun ciclo trovato</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1">
                {selectedUsageFilter !== 'all' 
                  ? 'Nessun ciclo associato a questa categoria di utilizzo. Seleziona "Tutti" o assegna la categoria a uno dei tuoi cicli.'
                  : 'Registra almeno due rifornimenti con tipo "Pieno" per calcolare i tuoi cicli di consumo reale.'}
              </p>
            </div>
          ) : (
            filteredTrips.map((trip) => {
              const isExpanded = expandedTripId === trip.id;
              const currentUsagePreset = USAGE_PRESETS.find(u => u.id === trip.usageCategory);
              const UsageIcon = currentUsagePreset ? currentUsagePreset.icon : Tag;

              return (
                <div 
                  key={trip.id}
                  className={`bg-white dark:bg-slate-900 rounded-2xl border transition-all duration-200 overflow-hidden shadow-2xs ${
                    trip.isBest 
                      ? 'border-emerald-300 dark:border-emerald-700/80 hover:border-emerald-500' 
                      : `border-slate-200/80 dark:border-slate-800 ${theme.borderHover}`
                  }`}
                >
                  {/* Trip Summary Row */}
                  <div 
                    onClick={() => toggleExpand(trip.id)}
                    className="p-4 sm:p-4.5 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors select-none"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-xl border flex flex-col items-center justify-center shrink-0 font-black text-xs ${
                        trip.isBest 
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' 
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                      }`}>
                        <span className="text-[9px] uppercase font-bold opacity-60">Ciclo</span>
                        <span className="leading-tight font-black">#{trip.tripIndex}</span>
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                            +{trip.distanceKm.toLocaleString('it-IT')} km
                          </span>
                          
                          {/* Classification Tag / Badge */}
                          {currentUsagePreset ? (
                            <span className={`inline-flex items-center gap-1 text-[10.5px] font-bold px-2 py-0.5 rounded-lg border ${currentUsagePreset.color}`}>
                              <UsageIcon className="w-3 h-3" />
                              <span>{currentUsagePreset.label.split(' / ')[0]}</span>
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium italic">
                              Utilizzo non specificato
                            </span>
                          )}

                          {trip.isBest && (
                            <span className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-black px-1.5 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                              Miglior Efficienza
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                          <span className="font-semibold text-slate-600 dark:text-slate-300">
                            {trip.startDate ? new Date(trip.startDate).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' }) : ''} 
                            {' → '}
                            {new Date(trip.endDate).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                          <span className="text-slate-300 dark:text-slate-600">•</span>
                          <span className={`font-bold ${theme.textAccent}`}>
                            {trip.kmPerUnit.toFixed(1)} km/{unitLabel}
                          </span>
                          <span className="text-slate-400 dark:text-slate-500">
                            ({trip.unitPer100Km.toFixed(2)} {unitLabel}/100km)
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
                      <div className="text-right block">
                        <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white block">
                          {settings.currency} {trip.totalSpent.toFixed(2)}
                        </span>
                        <span className="text-[10px] sm:text-[10.5px] font-semibold text-slate-400 dark:text-slate-500 block">
                          {trip.costPerKm} {settings.currency}/km
                        </span>
                      </div>

                      <div className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 bg-slate-100 dark:bg-slate-800">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Breakdown & Utilizzo Picker */}
                  {isExpanded && (
                    <div className="px-4 sm:px-5 pb-4 pt-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 space-y-3.5">
                      
                      {/* USAGE ASSIGNMENT / CLASSIFICATION BAR */}
                      <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/70 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                        <div className="flex items-center gap-2">
                          <Tag className={`w-3.5 h-3.5 ${theme.textAccent} shrink-0`} />
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Classifica l&apos;utilizzo di questo ciclo:</span>
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
                                    ? `${theme.btnActive} font-extrabold`
                                    : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
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
                        <h4 className="text-[10.5px] font-extrabold uppercase text-slate-400 dark:text-slate-500 tracking-wider mb-2">
                          Rifornimenti del Ciclo ({trip.refuels.length}):
                        </h4>

                        <div className="space-y-1.5">
                          {trip.refuels.map((r, rIdx) => (
                            <div 
                              key={r.id || rIdx}
                              className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs"
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-800 dark:text-slate-200">
                                  {r.date ? new Date(r.date).toLocaleDateString('it-IT') : 'Data n.d.'}
                                </span>
                                <span className="text-slate-300 dark:text-slate-600">•</span>
                                <span className="font-medium text-slate-600 dark:text-slate-400">
                                  {Number(r.km).toLocaleString('it-IT')} km
                                </span>
                                <span className={`text-[9.5px] font-bold px-1.5 py-0.2 rounded ${
                                  r.type === 'full' ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                                }`}>
                                  {r.type === 'full' ? 'Pieno' : 'Parziale'}
                                </span>
                              </div>

                              <div className="text-right font-bold text-slate-800 dark:text-slate-200">
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

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
};
