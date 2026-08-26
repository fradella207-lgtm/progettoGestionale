import React, { useState, useMemo } from 'react';
import { 
  X, 
  ArrowLeft,
  Fuel, 
  Zap, 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  Gauge, 
  Receipt, 
  Edit3, 
  Trash2, 
  ChevronRight, 
  ArrowUpDown,
  CheckCircle2,
  FileText,
  SlidersHorizontal
} from 'lucide-react';
import { Vehicle, RefuelRecord, AppSettings, EnergySourceType } from '../../types';
import { DetailedConsumptionMetrics, RefuelWithCalculation } from '../../utils/consumptionCalculator';
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
}

export const RefuelsRegistryModal: React.FC<RefuelsRegistryModalProps> = ({
  isOpen,
  onClose,
  vehicle,
  metrics,
  settings,
  onOpenAddRefuel,
  onOpenEditRefuel,
  onSelectRefuelDetail
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all'); // all, full, partial
  const [selectedFuelType, setSelectedFuelType] = useState<string>('all'); // all, fuel, electricity, lpg, cng
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'km-desc' | 'cost-desc'>('date-desc');

  // Support swipe right gesture to go back / close
  useSwipeBack({
    onBack: onClose,
    enabled: isOpen
  });

  const isPHEV = vehicle.fuelType === 'Plug-in Hybrid (PHEV)';
  const isBEV = vehicle.fuelType.includes('Elettrica') || vehicle.fuelType.includes('BEV');
  const defaultFuelUnit = isBEV ? 'kWh' : (vehicle.fuelType.includes('Metano') ? 'Kg' : 'L');

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
        (r.station && r.station.toLowerCase().includes(q)) ||
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-blue-900 via-blue-800 to-slate-900 text-white flex items-center justify-between gap-3 relative overflow-hidden shrink-0">
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

            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center text-white shrink-0 shadow-inner hidden xs:flex">
              {isPHEV ? <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-amber-300" /> : <Fuel className="w-5 h-5 sm:w-6 sm:h-6" />}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-blue-200 truncate">
                  Registro Ufficiale
                </span>
                <span className="bg-white/20 text-white text-[10px] font-black px-2 py-0.5 rounded-full shrink-0">
                  {metrics.calculatedRefuels.length}
                </span>
              </div>
              <h2 className="text-base sm:text-2xl font-black text-white tracking-tight truncate">
                {isPHEV ? 'Rifornimenti & Ricariche' : (isBEV ? 'Ricariche Elettriche' : 'Registro Rifornimenti')}
              </h2>
              <p className="text-xs text-blue-100 truncate">
                {vehicle.brand} {vehicle.model} • {vehicle.plate || 'Nessuna targa'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 relative z-10">
            {isPHEV ? (
              <div className="hidden sm:flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onOpenAddRefuel('fuel')}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Benzina</span>
                </button>
                <button
                  type="button"
                  onClick={() => onOpenAddRefuel('electricity')}
                  className="px-3 py-2 bg-amber-500 hover:bg-amber-400 text-amber-950 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Zap className="w-4 h-4" />
                  <span>Ricarica</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => onOpenAddRefuel()}
                className="hidden sm:flex px-4 py-2 bg-white text-blue-900 hover:bg-blue-50 rounded-xl text-xs font-black items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Nuovo Rifornimento</span>
              </button>
            )}

            <button 
              type="button"
              onClick={onClose}
              className="w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick KPI Strip */}
        <div className="bg-slate-50 border-b border-slate-200 p-3 sm:p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
          <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Spesa Filtrata</span>
            <span className="text-lg sm:text-xl font-black text-blue-700 block mt-0.5">
              {settings.currency} {currentFilteredSpend.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Quantità Totale</span>
            <span className="text-lg sm:text-xl font-black text-slate-900 block mt-0.5">
              {currentFilteredQuantity.toLocaleString('it-IT', { maximumFractionDigits: 1 })} <span className="text-xs font-bold text-slate-500">{defaultFuelUnit}</span>
            </span>
          </div>

          <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Consumo Medio Certificato</span>
            <span className="text-lg sm:text-xl font-black text-emerald-700 block mt-0.5">
              {metrics.kmPerUnit} <span className="text-xs font-bold text-emerald-600">km/{defaultFuelUnit}</span>
            </span>
          </div>

          <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Costo Chilometrico</span>
            <span className="text-lg sm:text-xl font-black text-slate-900 block mt-0.5">
              {metrics.fuelCostPerKm} <span className="text-xs font-bold text-slate-500">{settings.currency}/km</span>
            </span>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="p-3 sm:p-4 bg-white border-b border-slate-200 flex flex-col gap-3 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input 
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cerca per distributore, note, data, km o prezzo..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-hidden transition-all"
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

            {/* Sorting */}
            <div className="flex items-center gap-2 shrink-0">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold px-3 py-2 text-slate-700 outline-hidden cursor-pointer"
              >
                <option value="date-desc">Data più recente</option>
                <option value="date-asc">Data meno recente</option>
                <option value="km-desc">Chilometraggio (Decrescente)</option>
                <option value="cost-desc">Importo Spesa (Maggiore)</option>
              </select>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto text-xs pb-1">
            <span className="text-[11px] font-bold text-slate-400 shrink-0 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Anno:
            </span>
            <button
              type="button"
              onClick={() => setSelectedYear('all')}
              className={`px-2.5 py-1 rounded-lg border font-bold shrink-0 cursor-pointer transition-all ${
                selectedYear === 'all' 
                  ? 'bg-blue-600 text-white border-blue-600' 
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
                className={`px-2.5 py-1 rounded-lg border font-bold shrink-0 cursor-pointer transition-all ${
                  selectedYear === yr 
                    ? 'bg-blue-600 text-white border-blue-600' 
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {yr}
              </button>
            ))}

            <div className="w-[1px] h-4 bg-slate-200 shrink-0 mx-1" />

            <span className="text-[11px] font-bold text-slate-400 shrink-0">Tipo:</span>
            <button
              type="button"
              onClick={() => setSelectedType('all')}
              className={`px-2.5 py-1 rounded-lg border font-bold shrink-0 cursor-pointer transition-all ${
                selectedType === 'all' ? 'bg-slate-800 text-white border-slate-800' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              Tutti
            </button>
            <button
              type="button"
              onClick={() => setSelectedType('full')}
              className={`px-2.5 py-1 rounded-lg border font-bold shrink-0 cursor-pointer transition-all ${
                selectedType === 'full' ? 'bg-blue-700 text-white border-blue-700' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              Solo Pieni
            </button>
            <button
              type="button"
              onClick={() => setSelectedType('partial')}
              className={`px-2.5 py-1 rounded-lg border font-bold shrink-0 cursor-pointer transition-all ${
                selectedType === 'partial' ? 'bg-amber-600 text-white border-amber-600' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              Solo Parziali
            </button>

            {isPHEV && (
              <>
                <div className="w-[1px] h-4 bg-slate-200 shrink-0 mx-1" />
                <button
                  type="button"
                  onClick={() => setSelectedFuelType('all')}
                  className={`px-2.5 py-1 rounded-lg border font-bold shrink-0 cursor-pointer ${
                    selectedFuelType === 'all' ? 'bg-slate-800 text-white' : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  Tutte Fonti
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedFuelType('fuel')}
                  className={`px-2.5 py-1 rounded-lg border font-bold shrink-0 cursor-pointer ${
                    selectedFuelType === 'fuel' ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  ⛽ Solo Benzina
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedFuelType('electricity')}
                  className={`px-2.5 py-1 rounded-lg border font-bold shrink-0 cursor-pointer ${
                    selectedFuelType === 'electricity' ? 'bg-amber-500 text-amber-950 font-black' : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  ⚡ Solo Ricariche
                </button>
              </>
            )}
          </div>
        </div>

        {/* List of Refuels */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col gap-3 bg-slate-50/50">
          {filteredRefuels.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center flex flex-col items-center justify-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Fuel className="w-7 h-7" />
              </div>
              <h4 className="text-base font-black text-slate-900">Nessun rifornimento trovato</h4>
              <p className="text-xs text-slate-500 max-w-sm">
                Nessuna registrazione corrisponde ai filtri selezionati. Prova a reimpostare i filtri o aggiungi un nuovo rifornimento.
              </p>
              <button
                type="button"
                onClick={() => onOpenAddRefuel()}
                className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Registra Rifornimento</span>
              </button>
            </div>
          ) : (
            filteredRefuels.map((refuel) => {
              const isElectric = refuel.energyType === 'electricity' || refuel.unit === 'kWh';
              const unit = refuel.unit || defaultFuelUnit;
              const hasConsumption = !!refuel.intervalConsumption;

              return (
                <div 
                  key={refuel.id}
                  onClick={() => onSelectRefuelDetail(refuel)}
                  className="bg-white border border-slate-200 hover:border-blue-300 rounded-2xl p-4 transition-all shadow-2xs hover:shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer group"
                >
                  {/* Left Column */}
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                      isElectric ? 'bg-amber-100 text-amber-800' : 'bg-blue-50 text-blue-700'
                    }`}>
                      {isElectric ? <Zap className="w-5 h-5" /> : <Fuel className="w-5 h-5" />}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-sm text-slate-900">{refuel.date}</span>
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${
                          refuel.type === 'full' 
                            ? 'bg-blue-50 text-blue-700 border-blue-200' 
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}>
                          {refuel.type === 'full' ? 'Pieno Completo' : 'Rifornimento Parziale'}
                        </span>
                        {isElectric && (
                          <span className="bg-amber-100 text-amber-900 border border-amber-200 text-[10px] font-black px-1.5 py-0.5 rounded-md">
                            ⚡ Elettrico
                          </span>
                        )}
                        {refuel.receiptUrl && (
                          <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                            <Receipt className="w-3 h-3 text-emerald-600" /> Scontrino
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500 flex-wrap">
                        <span className="font-bold text-slate-800 flex items-center gap-1">
                          <Gauge className="w-3.5 h-3.5 text-slate-400" />
                          {Number(refuel.km).toLocaleString('it-IT')} km
                        </span>
                        {refuel.deltaKm !== null && refuel.deltaKm > 0 && (
                          <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                            +{refuel.deltaKm} km percorsi
                          </span>
                        )}
                        {refuel.station && (
                          <span className="truncate max-w-[200px] text-slate-600">
                            • {refuel.station}
                          </span>
                        )}
                      </div>

                      {/* Interval consumption if certified */}
                      {hasConsumption && refuel.intervalConsumption && (
                        <div className="mt-2 flex items-center gap-2 text-xs">
                          <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 font-extrabold px-2 py-0.5 rounded-md">
                            Consumo: {refuel.intervalConsumption.formattedKmPerUnit} km/{unit}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-500">
                            ({refuel.intervalConsumption.formattedUnitPer100Km} {unit}/100km)
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column (Price & Actions) */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0">
                    <div className="text-left sm:text-right">
                      <span className="text-base sm:text-lg font-black text-blue-700 block">
                        {settings.currency} {Number(refuel.price).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      <div className="flex items-center sm:justify-end gap-1.5 text-xs text-slate-500 font-bold">
                        <span>{refuel.quantity} {unit}</span>
                        {refuel.unitPrice && (
                          <span className="text-[11px] font-medium text-slate-400">
                            ({settings.currency} {refuel.unitPrice}/{unit})
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenEditRefuel(refuel);
                        }}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all cursor-pointer"
                        title="Modifica Rifornimento"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <div className="p-2 text-slate-400 group-hover:text-blue-600 transition-colors">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">
              Visualizzati: {filteredRefuels.length} di {metrics.calculatedRefuels.length} rifornimenti
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black shadow-xs hover:shadow transition-all cursor-pointer"
            >
              Chiudi
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
