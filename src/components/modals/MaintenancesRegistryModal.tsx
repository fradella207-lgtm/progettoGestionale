import React, { useState, useMemo } from 'react';
import { 
  X, 
  Wrench, 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  Gauge, 
  FileText, 
  Edit3, 
  ChevronRight, 
  ArrowUpDown,
  Building2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Vehicle, MaintenanceRecord, AppSettings } from '../../types';

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

  if (!isOpen) return null;

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
      if (m.type) cats.add(m.type);
    });
    return Array.from(cats);
  }, [rawMaints]);

  // Filtered & Sorted list
  const filteredMaints = useMemo(() => {
    let list = [...rawMaints];

    // Search
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(m => 
        (m.description && m.description.toLowerCase().includes(q)) ||
        (m.type && m.type.toLowerCase().includes(q)) ||
        (m.workshop && m.workshop.toLowerCase().includes(q)) ||
        (m.notes && m.notes.toLowerCase().includes(q)) ||
        (m.date && m.date.includes(q)) ||
        (m.km && String(m.km).includes(q))
      );
    }

    // Year
    if (selectedYear !== 'all') {
      list = list.filter(m => m.date && m.date.startsWith(selectedYear));
    }

    // Category
    if (selectedCategory !== 'all') {
      list = list.filter(m => m.type === selectedCategory);
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

  const totalFilteredCost = useMemo(() => {
    return filteredMaints.reduce((acc, m) => acc + (Number(m.cost) || 0), 0);
  }, [filteredMaints]);

  const totalAllCost = useMemo(() => {
    return rawMaints.reduce((acc, m) => acc + (Number(m.cost) || 0), 0);
  }, [rawMaints]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-900 text-white flex items-center justify-between relative overflow-hidden shrink-0">
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center text-white shrink-0 shadow-inner">
              <Wrench className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-widest text-emerald-300">
                  Libretto Service Ufficiale
                </span>
                <span className="bg-white/20 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                  {rawMaints.length} Interventi
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Storico Manutenzioni & Officina
              </h2>
              <p className="text-xs text-emerald-100">
                {vehicle.brand} {vehicle.model} • {vehicle.plate || 'Nessuna targa'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 relative z-10">
            <button
              type="button"
              onClick={onOpenAddMaintenance}
              className="hidden sm:flex px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 rounded-xl text-xs font-black items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nuovo Intervento</span>
            </button>

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
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Spesa Manutenzioni</span>
            <span className="text-lg sm:text-xl font-black text-emerald-700 block mt-0.5">
              {settings.currency} {totalAllCost.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Interventi Totali</span>
            <span className="text-lg sm:text-xl font-black text-slate-900 block mt-0.5">
              {rawMaints.length} <span className="text-xs font-bold text-slate-500">tagliandi & riparazioni</span>
            </span>
          </div>

          <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Filtro Corrente</span>
            <span className="text-lg sm:text-xl font-black text-slate-900 block mt-0.5">
              {settings.currency} {totalFilteredCost.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Stato Libretto</span>
            <span className="text-sm font-black text-emerald-700 flex items-center gap-1 mt-1.5">
              <CheckCircle2 className="w-4 h-4" /> Aggiornato
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
                placeholder="Cerca per tipo intervento, descrizione, officina o data..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 outline-hidden transition-all"
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
                <option value="cost-desc">Costo (Maggiore)</option>
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
                  ? 'bg-emerald-700 text-white border-emerald-700' 
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              Tutti
            </button>
            {availableYears.map(yr => (
              <button
                key={yr}
                type="button"
                onClick={() => setSelectedYear(yr)}
                className={`px-2.5 py-1 rounded-lg border font-bold shrink-0 cursor-pointer transition-all ${
                  selectedYear === yr 
                    ? 'bg-emerald-700 text-white border-emerald-700' 
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {yr}
              </button>
            ))}

            {availableCategories.length > 0 && (
              <>
                <div className="w-[1px] h-4 bg-slate-200 shrink-0 mx-1" />
                <span className="text-[11px] font-bold text-slate-400 shrink-0">Categoria:</span>
                <button
                  type="button"
                  onClick={() => setSelectedCategory('all')}
                  className={`px-2.5 py-1 rounded-lg border font-bold shrink-0 cursor-pointer ${
                    selectedCategory === 'all' ? 'bg-slate-800 text-white' : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  Tutte
                </button>
                {availableCategories.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1 rounded-lg border font-bold shrink-0 cursor-pointer ${
                      selectedCategory === cat ? 'bg-emerald-700 text-white' : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </>
            )}
          </div>
        </div>

        {/* List of Maintenances */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col gap-3 bg-slate-50/50">
          {filteredMaints.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center flex flex-col items-center justify-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Wrench className="w-7 h-7" />
              </div>
              <h4 className="text-base font-black text-slate-900">Nessun intervento registrato</h4>
              <p className="text-xs text-slate-500 max-w-sm">
                Nessuna registrazione corrisponde ai filtri selezionati. Registra tagliandi, pastiglie freni, cambio gomme o riparazioni.
              </p>
              <button
                type="button"
                onClick={onOpenAddMaintenance}
                className="mt-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Registra Intervento</span>
              </button>
            </div>
          ) : (
            filteredMaints.map((maint) => {
              return (
                <div 
                  key={maint.id}
                  onClick={() => onSelectMaintenanceDetail(maint)}
                  className="bg-white border border-slate-200 hover:border-emerald-300 rounded-2xl p-4 transition-all shadow-2xs hover:shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer group"
                >
                  {/* Left Column */}
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                      <Wrench className="w-5 h-5" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-sm text-slate-900">{maint.type || 'Intervento di Manutenzione'}</span>
                        <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-extrabold px-2 py-0.5 rounded-md">
                          {maint.date}
                        </span>
                        {maint.invoiceUrl && (
                          <span className="bg-blue-50 text-blue-800 text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                            <FileText className="w-3 h-3 text-blue-600" /> Fattura Allegata
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500 flex-wrap">
                        <span className="font-bold text-slate-800 flex items-center gap-1">
                          <Gauge className="w-3.5 h-3.5 text-slate-400" />
                          {Number(maint.km).toLocaleString('it-IT')} km
                        </span>
                        {maint.workshop && (
                          <span className="flex items-center gap-1 text-slate-600">
                            <Building2 className="w-3 h-3 text-slate-400" />
                            {maint.workshop}
                          </span>
                        )}
                      </div>

                      {maint.description && (
                        <p className="text-xs text-slate-600 mt-1 font-medium line-clamp-2">
                          {maint.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right Column (Cost & Actions) */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0">
                    <div className="text-left sm:text-right">
                      <span className="text-base sm:text-lg font-black text-emerald-700 block">
                        {settings.currency} {Number(maint.cost).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-400 block">
                        Costo totale intervento
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenEditMaintenance(maint);
                        }}
                        className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all cursor-pointer"
                        title="Modifica Intervento"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <div className="p-2 text-slate-400 group-hover:text-emerald-600 transition-colors">
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
              Visualizzati: {filteredMaints.length} di {rawMaints.length} interventi
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
