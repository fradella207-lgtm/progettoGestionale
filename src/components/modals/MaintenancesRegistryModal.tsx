import React, { useState, useMemo, useEffect } from 'react';
import { 
  ArrowLeft,
  Wrench, 
  Plus, 
  Search, 
  Filter, 
  Receipt, 
  Edit3, 
  ChevronRight, 
  ArrowUpDown,
  Building2,
  Calendar,
  Sparkles
} from 'lucide-react';
import { Vehicle, MaintenanceRecord, AppSettings } from '../../types';
import { useSwipeBack } from '../../hooks/useSwipeBack';

interface MaintenancesRegistryModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle;
  settings: AppSettings;
  onOpenAddMaintenance: () => void;
  onOpenEditMaintenance: (maint: MaintenanceRecord) => void;
  onSelectMaintenanceDetail: (maint: MaintenanceRecord) => void;
}

export const MaintenancesRegistryModal: React.FC<MaintenancesRegistryModalProps> = ({
  isOpen,
  onClose,
  vehicle,
  settings,
  onOpenAddMaintenance,
  onOpenEditMaintenance,
  onSelectMaintenanceDetail
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'km-desc' | 'cost-desc'>('date-desc');

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

  const rawMaints = vehicle.maintenances || [];

  // Available years
  const availableYears = useMemo(() => {
    const years = new Set<string>();
    rawMaints.forEach(m => {
      if (m.date) years.add(m.date.split('-')[0]);
    });
    return Array.from(years).sort().reverse();
  }, [rawMaints]);

  // Available categories
  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    rawMaints.forEach(m => {
      if (m.category) cats.add(m.category);
    });
    return Array.from(cats);
  }, [rawMaints]);

  // Filtered & Sorted maintenances
  const filteredMaints = useMemo(() => {
    let list = [...rawMaints];

    // Search filter
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(m => 
        (m.description && m.description.toLowerCase().includes(q)) ||
        (m.workshop && m.workshop.toLowerCase().includes(q)) ||
        (m.category && m.category.toLowerCase().includes(q)) ||
        (m.date && m.date.includes(q)) ||
        (m.km && String(m.km).includes(q)) ||
        (m.cost && String(m.cost).includes(q))
      );
    }

    // Year filter
    if (selectedYear !== 'all') {
      list = list.filter(m => m.date && m.date.startsWith(selectedYear));
    }

    // Category filter
    if (selectedCategory !== 'all') {
      list = list.filter(m => m.category === selectedCategory);
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
        return (Number(b.cost) || 0) - (Number(a.cost) || 0);
      }
      return 0;
    });

    return list;
  }, [rawMaints, searchTerm, selectedYear, selectedCategory, sortBy]);

  // Aggregate stats for currently filtered view
  const currentFilteredCost = useMemo(() => {
    return filteredMaints.reduce((acc, m) => acc + (Number(m.cost) || 0), 0);
  }, [filteredMaints]);

  const totalAllCost = useMemo(() => {
    return rawMaints.reduce((acc, m) => acc + (Number(m.cost) || 0), 0);
  }, [rawMaints]);

  if (!isOpen) return null;

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
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0 hidden sm:flex">
              <Wrench className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-black text-slate-900 leading-tight truncate">
                Libretto Service & Manutenzioni
              </h1>
              <p className="text-xs text-slate-500 truncate">
                {vehicle.brand} {vehicle.model} • <span className="font-bold text-slate-700">{vehicle.plate || 'Garage'}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Action Button on the Right */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenAddMaintenance}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nuovo Intervento</span>
          </button>
        </div>
      </header>

      {/* MAIN PAGE BODY */}
      <main className="max-w-5xl mx-auto w-full px-4 sm:px-8 py-6 space-y-6 flex-1 flex flex-col">
        
        {/* KPI Strip */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Spesa Manutenzioni</span>
            <span className="text-xl sm:text-2xl font-black text-emerald-600 block mt-1">
              {settings.currency} {totalAllCost.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-[11px] text-slate-500 block mt-0.5 font-medium">
              Totale storico officina
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Interventi Totali</span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 block mt-1">
              {rawMaints.length} <span className="text-xs font-bold text-slate-500">voci</span>
            </span>
            <span className="text-[11px] text-slate-500 block mt-0.5 font-medium">
              Tagliandi & riparazioni
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Spesa Filtrata</span>
            <span className="text-xl sm:text-2xl font-black text-blue-600 block mt-1">
              {settings.currency} {currentFilteredCost.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-[11px] text-slate-500 block mt-0.5 font-medium">
              {filteredMaints.length} interventi mostrati
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Costo Medio Intervento</span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 block mt-1">
              {settings.currency} {rawMaints.length > 0 ? (totalAllCost / rawMaints.length).toFixed(2) : '0.00'}
            </span>
            <span className="text-[11px] text-slate-500 block mt-0.5 font-medium">
              Per ciascuna manutenzione
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
                placeholder="Cerca per descrizione, officina, categoria, data, km o costo..."
                className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 outline-hidden transition-all text-slate-800 placeholder:text-slate-400"
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
                <option value="cost-desc">Costo Intervento (Maggiore)</option>
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
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs' 
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
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs' 
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {yr}
              </button>
            ))}

            {/* Category Filter Pills */}
            {availableCategories.length > 0 && (
              <div className="flex items-center gap-1.5 ml-auto overflow-x-auto">
                <span className="text-[11px] font-bold text-slate-400 shrink-0">Categoria:</span>
                <button
                  type="button"
                  onClick={() => setSelectedCategory('all')}
                  className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                    selectedCategory === 'all' ? 'bg-slate-800 text-white border-slate-800' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Tutte
                </button>
                {availableCategories.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                      selectedCategory === cat ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* List of Maintenance Records */}
        <section className="space-y-3 pb-8 flex-1">
          {filteredMaints.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/90 p-12 text-center flex flex-col items-center justify-center shadow-2xs">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 border border-emerald-100">
                <Wrench className="w-7 h-7" />
              </div>
              <h3 className="text-base font-black text-slate-800">Nessun intervento registrato</h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                {searchTerm ? 'Nessun intervento corrisponde ai criteri di ricerca impostati.' : 'Non è stato ancora salvato alcun tagliando o manutenzione per questo veicolo.'}
              </p>
              <button
                type="button"
                onClick={onOpenAddMaintenance}
                className="mt-5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl shadow-xs transition-all cursor-pointer"
              >
                Aggiungi Primo Intervento
              </button>
            </div>
          ) : (
            filteredMaints.map((maint, idx) => {
              return (
                <div 
                  key={maint.id || idx}
                  onClick={() => onSelectMaintenanceDetail(maint)}
                  className="bg-white rounded-2xl border border-slate-200/90 hover:border-emerald-400 p-4 sm:p-5 shadow-2xs hover:shadow-md transition-all cursor-pointer group flex flex-col gap-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
                        <Wrench className="w-5 h-5" />
                      </div>
                      
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-slate-500">
                            {maint.date ? new Date(maint.date).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Data n.d.'}
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="text-xs font-black text-slate-900">
                            {Number(maint.km).toLocaleString('it-IT')} km
                          </span>
                          {maint.category && (
                            <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                              {maint.category}
                            </span>
                          )}
                        </div>

                        <h4 className="text-sm font-black text-slate-900 mt-1 line-clamp-1 group-hover:text-emerald-700 transition-colors">
                          {maint.description || 'Intervento di manutenzione'}
                        </h4>

                        {maint.workshop && (
                          <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                            <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                            {maint.workshop}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Cost */}
                    <div className="text-right shrink-0">
                      <span className="text-base sm:text-lg font-black text-slate-900 block">
                        {settings.currency} {Number(maint.cost).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      <span className="text-[11px] font-bold text-slate-400 block">
                        Fattura / Scontrino
                      </span>
                    </div>
                  </div>

                  {/* Actions & Detail hint */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span className="text-[11px] font-medium text-slate-400">
                      Clicca per visualizzare i dettagli completi
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenEditMaintenance(maint);
                        }}
                        className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all cursor-pointer"
                        title="Modifica Intervento"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 transition-colors" />
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
};
