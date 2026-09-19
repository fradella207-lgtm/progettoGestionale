import React, { useState, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  ArrowLeft,
  Fuel, 
  Zap, 
  Plus, 
  Search, 
  Filter, 
  Gauge, 
  Edit3, 
  ChevronRight, 
  ArrowUpDown,
  Receipt,
  Lock
} from 'lucide-react';
import { Vehicle, RefuelRecord, AppSettings, EnergySourceType } from '../../types';
import { DetailedConsumptionMetrics } from '../../utils/consumptionCalculator';
import { useSwipeBack } from '../../hooks/useSwipeBack';

interface RefuelsRegistryModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle;
  metrics: DetailedConsumptionMetrics;
  settings: AppSettings;
  onOpenAddRefuel: (energyType?: EnergySourceType) => void;
  onOpenEditRefuel: (refuel: RefuelRecord) => void;
  onSelectRefuelDetail: (refuel: RefuelRecord) => void;
  onOpenBoardTrips?: () => void;
}

export const RefuelsRegistryModal: React.FC<RefuelsRegistryModalProps> = ({
  isOpen,
  onClose,
  vehicle,
  metrics,
  settings,
  onOpenAddRefuel,
  onOpenEditRefuel,
  onSelectRefuelDetail,
  onOpenBoardTrips
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all'); // all, full, partial
  const [selectedFuelType, setSelectedFuelType] = useState<string>('all'); // all, fuel, electricity, lpg, cng
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'km-desc' | 'cost-desc'>('date-desc');
  const containerRef = useRef<HTMLDivElement>(null);

  // Prevent background scrolling and reset scroll to top when page is active
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

  const isPHEV = vehicle.fuelType === 'Plug-in Hybrid (PHEV)';
  const isBEV = vehicle.fuelType.includes('Elettrica') || vehicle.fuelType.includes('BEV');
  const defaultFuelUnit = isBEV ? 'kWh' : (vehicle.fuelType.includes('Metano') ? 'Kg' : 'L');

  // Calcolo permessi condivisione se membro
  const isMember = Boolean(vehicle.isShared && vehicle.sharedRole === 'member');
  const isReadOnly = isMember && vehicle.sharedPermissionsLevel === 'read_only';

  // Available years
  const availableYears = useMemo(() => {
    const years = new Set<string>();
    metrics.calculatedRefuels.forEach(r => {
      if (r.date) years.add(r.date.split('-')[0]);
    });
    return Array.from(years).sort().reverse();
  }, [metrics.calculatedRefuels]);

  // Filtered & Sorted refuels
  const filteredRefuels = useMemo(() => {
    let list = [...metrics.calculatedRefuels];

    // Search filter
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(r => 
        (r.notes && r.notes.toLowerCase().includes(q)) ||
        (r.date && r.date.includes(q)) ||
        (r.km && String(r.km).includes(q)) ||
        (r.price && String(r.price).includes(q))
      );
    }

    // Year filter
    if (selectedYear !== 'all') {
      list = list.filter(r => r.date && r.date.startsWith(selectedYear));
    }

    // Full / Partial filter
    if (selectedType !== 'all') {
      list = list.filter(r => r.type === selectedType);
    }

    // Fuel Type filter
    if (selectedFuelType !== 'all') {
      if (selectedFuelType === 'electricity') {
        list = list.filter(r => r.energyType === 'electricity' || r.unit === 'kWh');
      } else if (selectedFuelType === 'fuel') {
        list = list.filter(r => r.energyType === 'fuel' || r.unit === 'L' || (!r.energyType && !r.unit));
      } else if (selectedFuelType === 'lpg') {
        list = list.filter(r => r.energyType === 'lpg');
      } else if (selectedFuelType === 'cng') {
        list = list.filter(r => r.energyType === 'cng' || r.unit === 'Kg');
      }
    }

    // Sort
    list.sort((a, b) => {
      if (sortBy === 'date-desc') {
        return new Date(b.date).getTime() - new Date(a.date).getTime() || (Number(b.km) - Number(a.km));
      }
      if (sortBy === 'date-asc') {
        return new Date(a.date).getTime() - new Date(b.date).getTime() || (Number(a.km) - Number(b.km));
      }
      if (sortBy === 'km-desc') {
        return (Number(b.km) || 0) - (Number(a.km) || 0);
      }
      if (sortBy === 'cost-desc') {
        return (Number(b.price) || 0) - (Number(a.price) || 0);
      }
      return 0;
    });

    return list;
  }, [metrics.calculatedRefuels, searchTerm, selectedYear, selectedType, selectedFuelType, sortBy]);

  // Aggregate stats for currently filtered view
  const currentFilteredSpend = useMemo(() => {
    return filteredRefuels.reduce((acc, r) => acc + (Number(r.price) || 0), 0);
  }, [filteredRefuels]);

  const currentFilteredQuantity = useMemo(() => {
    return filteredRefuels.reduce((acc, r) => acc + (Number(r.quantity) || 0), 0);
  }, [filteredRefuels]);

  if (!isOpen) return null;

  const modalContent = (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-[70] bg-[#f8fafc] flex flex-col overflow-y-auto min-h-screen font-['Plus_Jakarta_Sans',sans-serif] animate-in fade-in duration-150"
    >
      
      {/* STICKY TOP APP BAR - Clean, Solid & Responsive with safe area padding */}
      <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-2xs px-3 sm:px-8 pt-[max(0.5rem,env(safe-area-inset-top))] pb-2.5 sm:pb-3 flex items-center justify-between gap-2 shrink-0 select-none">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {/* Top-Left Indietro Button */}
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 text-xs font-black border border-slate-200 transition-all cursor-pointer shrink-0 shadow-2xs group"
            title="Torna alla scheda veicolo"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform text-slate-700" />
            <span className="hidden xs:inline">Indietro</span>
          </button>

          <div className="h-6 w-px bg-slate-200 hidden sm:block shrink-0" />

          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0 hidden sm:flex">
              {isPHEV ? <Zap className="w-4 h-4 text-amber-500" /> : <Fuel className="w-4 h-4" />}
            </div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-black text-slate-900 leading-tight truncate">
                {isPHEV ? 'Rifornimenti & Ricariche' : (isBEV ? 'Ricariche Elettriche' : 'Registro Rifornimenti')}
              </h1>
              <p className="text-[11px] text-slate-500 truncate">
                {vehicle.brand} {vehicle.model} {vehicle.plate ? `• ${vehicle.plate}` : ''}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons on the Right */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {onOpenBoardTrips && (
            <button
              type="button"
              onClick={onOpenBoardTrips}
              className="px-2.5 sm:px-3 py-2 bg-indigo-50 hover:bg-indigo-100 active:scale-95 text-indigo-700 rounded-xl text-xs font-black flex items-center gap-1.5 border border-indigo-200 shadow-2xs transition-all cursor-pointer"
              title="Visualizza cicli completi pieno-pieno e grafici di efficienza"
            >
              <Gauge className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline">Cicli &amp; Trip</span>
            </button>
          )}

          {isReadOnly ? (
            <div
              className="px-3 py-2 bg-slate-100 border border-slate-200 text-slate-400 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-not-allowed shadow-2xs select-none"
              title="Il proprietario ha impostato l'accesso in sola lettura"
            >
              <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="hidden xs:inline">Sola Lettura</span>
            </div>
          ) : isPHEV ? (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onOpenAddRefuel('fuel')}
                className="px-2.5 sm:px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black flex items-center gap-1 shadow-xs cursor-pointer active:scale-95 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Benzina</span>
              </button>
              <button
                type="button"
                onClick={() => onOpenAddRefuel('electricity')}
                className="px-2.5 sm:px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-amber-950 rounded-xl text-xs font-black flex items-center gap-1 shadow-xs cursor-pointer active:scale-95 transition-all"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Ricarica</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onOpenAddRefuel()}
              className="px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nuovo <span className="hidden xs:inline">Rifornimento</span></span>
            </button>
          )}
        </div>
      </header>

      {/* MAIN PAGE BODY */}
      <main className="max-w-5xl mx-auto w-full px-3.5 sm:px-8 pt-4 pb-28 sm:pb-16 space-y-5 flex-1 flex flex-col">
        
        {/* Banner Permessi Sola Lettura */}
        {isReadOnly && (
          <div className="bg-amber-50 border border-amber-200 text-amber-900 px-4 py-3 rounded-2xl flex items-center gap-2.5 text-xs font-medium">
            <Lock className="w-4 h-4 text-amber-600 shrink-0" />
            <span><strong>Accesso in sola lettura:</strong> il proprietario del veicolo ha limitato i permessi. Non puoi aggiungere o modificare rifornimenti.</span>
          </div>
        )}

        {/* KPI Strip */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 shadow-2xs min-w-0">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider truncate">Spesa Filtrata</span>
            <span className="text-lg sm:text-2xl font-black text-blue-600 block mt-1 truncate">
              {settings.currency} {currentFilteredSpend.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-[11px] text-slate-500 block mt-0.5 font-medium truncate">
              {filteredRefuels.length} rifornimenti
            </span>
          </div>

          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 shadow-2xs min-w-0">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider truncate">Quantità Totale</span>
            <span className="text-lg sm:text-2xl font-black text-slate-900 block mt-1 truncate">
              {currentFilteredQuantity.toLocaleString('it-IT', { maximumFractionDigits: 1 })} <span className="text-xs font-bold text-slate-500">{defaultFuelUnit}</span>
            </span>
            <span className="text-[11px] text-slate-500 block mt-0.5 font-medium truncate">
              Volume erogato
            </span>
          </div>

          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 shadow-2xs min-w-0">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider truncate">Consumo Medio</span>
            <span className="text-lg sm:text-2xl font-black text-emerald-600 block mt-1 truncate">
              {metrics.kmPerUnit} <span className="text-xs font-bold text-emerald-600">km/{defaultFuelUnit}</span>
            </span>
            <span className="text-[11px] text-slate-500 block mt-0.5 font-medium truncate">
              {metrics.unitPer100Km} {defaultFuelUnit}/100km
            </span>
          </div>

          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 shadow-2xs min-w-0">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider truncate">Costo Chilometrico</span>
            <span className="text-lg sm:text-2xl font-black text-slate-900 block mt-1 truncate">
              {metrics.fuelCostPerKm} <span className="text-xs font-bold text-slate-500">{settings.currency}/km</span>
            </span>
            <span className="text-[11px] text-slate-500 block mt-0.5 font-medium truncate">
              Media globale
            </span>
          </div>
        </section>

        {/* Filter & Search Toolbar */}
        <section className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input 
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cerca per distributore, note, data, km o prezzo..."
                className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-hidden transition-all text-slate-800 placeholder:text-slate-400"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-2 shrink-0">
              <ArrowUpDown className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold px-3 py-2.5 text-slate-700 outline-hidden cursor-pointer hover:border-slate-300 transition-all"
              >
                <option value="date-desc">Data più recente</option>
                <option value="date-asc">Data meno recente</option>
                <option value="km-desc">Chilometraggio (Decrescente)</option>
                <option value="cost-desc">Importo Spesa (Maggiore)</option>
              </select>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 text-xs pt-1 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 shrink-0 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Anno:
            </span>
            <button
              type="button"
              onClick={() => setSelectedYear('all')}
              className={`px-3 py-1.5 rounded-lg border font-bold shrink-0 cursor-pointer transition-all ${
                selectedYear === 'all' 
                  ? 'bg-blue-600 text-white border-blue-600 shadow-2xs' 
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              Tutti gli anni
            </button>
            {availableYears.map(yr => (
              <button
                key={yr}
                type="button"
                onClick={() => setSelectedYear(yr)}
                className={`px-3 py-1.5 rounded-lg border font-bold shrink-0 cursor-pointer transition-all ${
                  selectedYear === yr 
                    ? 'bg-blue-600 text-white border-blue-600 shadow-2xs' 
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {yr}
              </button>
            ))}

            {/* Dual Fuel filter if PHEV */}
            {isPHEV && (
              <div className="flex items-center gap-1.5 ml-auto">
                <button
                  type="button"
                  onClick={() => setSelectedFuelType('all')}
                  className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                    selectedFuelType === 'all' ? 'bg-slate-800 text-white border-slate-800' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Tutti
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedFuelType('fuel')}
                  className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    selectedFuelType === 'fuel' ? 'bg-blue-600 text-white border-blue-600' : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                  }`}
                >
                  <Fuel className="w-3 h-3" /> Benzina
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedFuelType('electricity')}
                  className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    selectedFuelType === 'electricity' ? 'bg-amber-500 text-amber-950 border-amber-500' : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                  }`}
                >
                  <Zap className="w-3 h-3" /> Ricarica
                </button>
              </div>
            )}
          </div>
        </section>

        {/* List of Refuel Records */}
        <section className="space-y-3 pb-8 flex-1">
          {filteredRefuels.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/90 p-12 text-center flex flex-col items-center justify-center shadow-2xs">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 border border-blue-100">
                <Fuel className="w-7 h-7" />
              </div>
              <h3 className="text-base font-black text-slate-800">Nessun rifornimento trovato</h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                {searchTerm ? 'Nessun risultato corrisponde ai filtri di ricerca applicati.' : 'Non è stato ancora registrato alcun rifornimento o ricarica per questo veicolo.'}
              </p>
              {!isReadOnly ? (
                <button
                  type="button"
                  onClick={() => onOpenAddRefuel()}
                  className="mt-5 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  Registra Primo Rifornimento
                </button>
              ) : (
                <div className="mt-4 px-4 py-2 bg-slate-100 border border-slate-200 text-slate-500 rounded-xl text-xs font-medium inline-flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Accesso in sola lettura: inserimento disabilitato dal proprietario</span>
                </div>
              )}
            </div>
          ) : (
            filteredRefuels.map((refuel, idx) => {
              const isElectric = refuel.energyType === 'electricity' || refuel.unit === 'kWh';
              const unit = refuel.unit || (isElectric ? 'kWh' : defaultFuelUnit);
              const unitPrice = (Number(refuel.price) && Number(refuel.quantity) > 0) 
                ? (Number(refuel.price) / Number(refuel.quantity)).toFixed(3) 
                : null;

              return (
                <div 
                  key={refuel.id || idx}
                  onClick={() => onSelectRefuelDetail(refuel)}
                  className="bg-white rounded-2xl border border-slate-200/90 hover:border-blue-400 p-4 sm:p-5 shadow-2xs hover:shadow-md transition-all cursor-pointer group flex flex-col gap-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${
                        isElectric 
                          ? 'bg-amber-50 text-amber-600 border-amber-200' 
                          : 'bg-blue-50 text-blue-600 border-blue-100'
                      }`}>
                        {isElectric ? <Zap className="w-5 h-5" /> : <Fuel className="w-5 h-5" />}
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-slate-500">
                            {refuel.date ? new Date(refuel.date).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Data n.d.'}
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="text-xs font-black text-slate-900">
                            {Number(refuel.km).toLocaleString('it-IT')} km
                          </span>
                          {refuel.deltaKm ? (
                            <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                              +{refuel.deltaKm.toLocaleString('it-IT')} km
                            </span>
                          ) : null}
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                            refuel.type === 'full' 
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                              : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}>
                            {refuel.type === 'full' ? 'Pieno' : 'Parziale'}
                          </span>
                          {refuel.receiptPhoto && (
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
                              <Receipt className="w-2.5 h-2.5" />
                              <span>Scontrino</span>
                            </span>
                          )}
                        </div>

                        {refuel.notes && (
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-1 italic">
                            &ldquo;{refuel.notes}&rdquo;
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Cost & Volume */}
                    <div className="text-right shrink-0">
                      <span className="text-base sm:text-lg font-black text-slate-900 block">
                        {settings.currency} {Number(refuel.price).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      <span className="text-xs font-bold text-slate-500 block">
                        {Number(refuel.quantity).toLocaleString('it-IT', { maximumFractionDigits: 2 })} {unit}
                        {unitPrice && <span className="text-[11px] text-slate-400 font-normal"> ({settings.currency} {unitPrice}/{unit})</span>}
                      </span>
                    </div>
                  </div>

                  {/* Calculated metrics strip for this refuel */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
                      {refuel.intervalConsumption ? (
                        <span className="font-bold text-emerald-600 flex items-center gap-1">
                          <Gauge className="w-3.5 h-3.5" />
                          {refuel.intervalConsumption.formattedKmPerUnit} km/{unit} ({refuel.intervalConsumption.formattedUnitPer100Km} {unit}/100km)
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">
                          {refuel.type === 'partial' ? 'Pieno successivo necessario per calcolo consumo' : 'Primo pieno o riferimento'}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      {!isReadOnly && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenEditRefuel(refuel);
                          }}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all cursor-pointer"
                          title="Modifica Rifornimento"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      )}
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition-colors" />
                    </div>
                  </div>
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
