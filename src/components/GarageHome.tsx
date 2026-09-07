import React, { useState, useMemo } from 'react';
import { 
  Car, 
  Edit3, 
  Trash2, 
  ChevronRight, 
  Zap,
  Plus,
  Search,
  Gauge,
  Sparkles,
  Route,
  FileText,
  Settings2
} from 'lucide-react';
import { Vehicle, AppSettings } from '../types';

interface GarageHomeProps {
  vehicles: Vehicle[];
  settings: AppSettings;
  onSelectVehicle: (vehicleId: string, tab?: 'overview' | 'specs' | 'documents' | 'ai') => void;
  onOpenAddCar: () => void;
  onOpenEditCar: (vehicle: Vehicle) => void;
  onDeleteVehicle: (vehicleId: string) => void;
  onImportVehicles?: (importedVehicles: Vehicle[]) => void;
}

export const GarageHome: React.FC<GarageHomeProps> = ({
  vehicles,
  settings,
  onSelectVehicle,
  onOpenAddCar,
  onOpenEditCar,
  onDeleteVehicle
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFuelCategory, setSelectedFuelCategory] = useState<string>('all');

  // Total Fleet Stats Calculations
  const fleetStats = useMemo(() => {
    let totalKm = 0;
    let totalFuelCost = 0;
    let totalMaintCost = 0;
    let totalRefuelsCount = 0;
    let totalMaintenancesCount = 0;

    vehicles.forEach(car => {
      const refuelsKm = (car.refuels || []).map(r => Number(r.km) || 0);
      const maintKm = (car.maintenances || []).map(m => Number(m.km) || 0);
      const carMaxKm = Math.max(Number(car.initialKm) || 0, ...refuelsKm, ...maintKm);
      totalKm += carMaxKm;

      const fCost = (car.refuels || []).reduce((sum, r) => sum + (Number(r.price) || 0), 0);
      const mCost = (car.maintenances || []).reduce((sum, m) => sum + (Number(m.cost) || 0), 0);
      totalFuelCost += fCost;
      totalMaintCost += mCost;
      totalRefuelsCount += (car.refuels?.length || 0);
      totalMaintenancesCount += (car.maintenances?.length || 0);
    });

    return {
      totalKm,
      totalSpent: totalFuelCost + totalMaintCost,
      totalFuelCost,
      totalMaintCost,
      totalRefuelsCount,
      totalMaintenancesCount
    };
  }, [vehicles]);

  // Filtered vehicles based on search and fuel filter
  const filteredVehicles = useMemo(() => {
    return vehicles.filter(car => {
      const matchesSearch = 
        car.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        car.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        car.plate.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (car.motorization && car.motorization.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      if (selectedFuelCategory === 'all') return true;
      if (selectedFuelCategory === 'electric_hybrid') {
        return car.fuelType.includes('Elettrica') || car.fuelType.includes('Hybrid') || car.fuelType.includes('BEV') || car.fuelType.includes('PHEV');
      }
      if (selectedFuelCategory === 'diesel') {
        return car.fuelType.includes('Diesel');
      }
      if (selectedFuelCategory === 'petrol') {
        return car.fuelType.includes('Benzina') && !car.fuelType.includes('Hybrid');
      }
      if (selectedFuelCategory === 'gas') {
        return car.fuelType.includes('GPL') || car.fuelType.includes('Metano');
      }
      return true;
    });
  }, [vehicles, searchQuery, selectedFuelCategory]);

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-5 pb-6 font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* 1. HEADER SECTION - Clean, Airy & Minimalist */}
      <section className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="w-2 h-2 rounded-full bg-indigo-600" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Garage Virtuale • {vehicles.length} {vehicles.length === 1 ? 'Veicolo' : 'Veicoli'}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            I Tuoi Veicoli
          </h2>
        </div>
      </section>

      {/* 2. FLEET QUICK STATS STRIP (Light & Clean) */}
      {vehicles.length > 0 && (
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 bg-white border border-slate-200/70 p-3 sm:p-4 rounded-2xl shadow-2xs">
          <div className="flex items-center gap-3 p-1.5">
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
              <Car className="w-4.5 h-4.5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate">Auto in Garage</span>
              <span className="text-base font-extrabold text-slate-900">{vehicles.length}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-1.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Gauge className="w-4.5 h-4.5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate">Km Flotta</span>
              <span className="text-base font-extrabold text-slate-900 truncate block">
                {fleetStats.totalKm.toLocaleString('it-IT')} km
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-1.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Route className="w-4.5 h-4.5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate">Rifornimenti</span>
              <span className="text-base font-extrabold text-slate-900">{fleetStats.totalRefuelsCount}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-1.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Sparkles className="w-4.5 h-4.5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate">Spesa Totale</span>
              <span className="text-base font-extrabold text-slate-900 truncate block">
                {settings.currency} {fleetStats.totalSpent.toLocaleString('it-IT', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </span>
            </div>
          </div>
        </section>
      )}

      {/* 3. SEARCH & FUEL CATEGORY FILTERS */}
      {vehicles.length > 0 && (
        <section className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Minimal Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              placeholder="Cerca per marca, modello, targa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200/80 rounded-xl pl-9 pr-3.5 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all shadow-2xs"
            />
          </div>

          {/* Clean Segmented Fuel Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
            {[
              { id: 'all', label: 'Tutti' },
              { id: 'electric_hybrid', label: 'EV / Ibride' },
              { id: 'diesel', label: 'Diesel' },
              { id: 'petrol', label: 'Benzina' },
              { id: 'gas', label: 'GPL / Metano' }
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setSelectedFuelCategory(f.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer border ${
                  selectedFuelCategory === f.id
                    ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                    : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200/80'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* 4. VEHICLES GRID */}
      {vehicles.length === 0 ? (
        /* Empty Garage Welcome Screen */
        <section className="bg-white rounded-2xl border border-slate-200/70 p-10 sm:p-14 flex flex-col items-center justify-center text-center shadow-2xs my-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
            <Car className="w-8 h-8 stroke-[1.5]" />
          </div>
          <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">Il tuo garage è vuoto</h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mt-1.5 leading-relaxed">
            Aggiungi la tua prima auto per monitorare consumi, chilometraggio, scadenze, rifornimenti e spese di manutenzione in modo intuitivo e metrologico.
          </p>
          <button
            onClick={onOpenAddCar}
            className="mt-5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Aggiungi la tua prima auto</span>
          </button>
        </section>
      ) : filteredVehicles.length === 0 ? (
        /* Empty Search Results */
        <div className="bg-white rounded-2xl border border-slate-200/70 p-10 text-center flex flex-col items-center justify-center gap-2 shadow-2xs">
          <Search className="w-7 h-7 text-slate-300" />
          <p className="text-sm font-bold text-slate-700">Nessun veicolo corrisponde alla ricerca</p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedFuelCategory('all'); }}
            className="text-xs text-indigo-600 font-bold hover:underline cursor-pointer mt-1"
          >
            Ripristina filtri
          </button>
        </div>
      ) : (
        /* Grid of Vehicle Cards (Light, Clean & Minimal) */
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredVehicles.map((car) => {
            const refuelsKm = (car.refuels || []).map(r => Number(r.km) || 0);
            const maintKm = (car.maintenances || []).map(m => Number(m.km) || 0);
            const currentKm = Math.max(Number(car.initialKm) || 0, ...refuelsKm, ...maintKm);
            
            const isElectric = car.fuelType.includes('Elettrica') || car.fuelType.includes('BEV');
            const isPHEV = car.fuelType.includes('PHEV') || car.fuelType.includes('Plug-in');
            const isGas = car.fuelType.includes('GPL') || car.fuelType.includes('Metano');
            const fuelUnit = isElectric ? 'kWh' : (car.fuelType === 'Metano' ? 'Kg' : 'L');
            
            const carFuelCost = (car.refuels || []).reduce((sum, r) => sum + (Number(r.price) || 0), 0);
            const carMaintCost = (car.maintenances || []).reduce((sum, m) => sum + (Number(m.cost) || 0), 0);
            const carTotalCost = carFuelCost + carMaintCost;
            const docCount = (car.documents || []).length;

            return (
              <div 
                key={car.id}
                id={`card-car-${car.id}`}
                onClick={() => onSelectVehicle(car.id, 'overview')}
                className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs hover:shadow-sm hover:border-theme-primary transition-all duration-200 flex flex-col justify-between cursor-pointer group active:scale-[0.99]"
              >
                <div>
                  {/* PHOTO CONTAINER (Compact & Refined) */}
                  <div className="w-full h-36 sm:h-38 bg-slate-100 relative overflow-hidden flex items-center justify-center border-b border-slate-100">
                    {car.photoUrl ? (
                      <img 
                        src={car.photoUrl} 
                        alt={`${car.brand} ${car.model}`} 
                        className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                        onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                      />
                    ) : (
                      <div className="flex flex-col items-center text-slate-400 gap-1.5">
                        <Car className="w-10 h-10 stroke-[1.2] text-slate-400" />
                        <span className="text-xs font-semibold text-slate-400">{car.brand}</span>
                      </div>
                    )}

                    {/* Fuel Type Badge (Top Left) */}
                    <div className="absolute top-2.5 left-2.5 bg-white/95 backdrop-blur-sm text-slate-800 text-[10.5px] font-extrabold px-2.5 py-1 rounded-lg border border-slate-200/70 shadow-2xs flex items-center gap-1.5">
                      {isElectric ? (
                        <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      ) : isPHEV ? (
                        <Zap className="w-3.5 h-3.5 text-teal-600" />
                      ) : isGas ? (
                        <span className="text-[10px] text-indigo-600 font-bold">G</span>
                      ) : (
                        <span className="text-[10px] text-slate-600 font-bold">⛽</span>
                      )}
                      <span>{car.fuelType.split(' ')[0]}</span>
                    </div>

                    {/* Edit & Delete Action Buttons (Top Right) */}
                    <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenEditCar(car);
                        }}
                        className="bg-white/95 backdrop-blur-sm hover:bg-slate-100 text-slate-700 p-1.5 rounded-lg border border-slate-200/70 shadow-2xs transition-all active:scale-95"
                        title="Modifica dati auto"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Rimuovere ${car.brand} ${car.model} (${car.plate}) dal garage?`)) {
                            onDeleteVehicle(car.id);
                          }
                        }}
                        className="bg-white/95 backdrop-blur-sm hover:bg-red-50 hover:text-red-600 text-slate-700 p-1.5 rounded-lg border border-slate-200/70 shadow-2xs transition-all active:scale-95"
                        title="Elimina veicolo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* CARD CONTENT */}
                  <div className="p-3.5 sm:p-4 flex flex-col gap-2.5">
                    {/* Brand Model & Plate */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="text-base font-extrabold text-slate-900 group-hover:text-theme-primary transition-colors leading-snug truncate">
                          {car.brand} {car.model}
                        </h3>
                        <p className="text-[11px] text-slate-500 font-medium mt-0.5 truncate">
                          {car.motorization ? `${car.motorization} • ` : ''}Anno {car.registrationDate ? car.registrationDate.split('-')[0] : 'N/D'}
                        </p>
                      </div>

                      {/* Euro Plate Badge */}
                      <div className="bg-white border border-slate-300 rounded-md px-2 py-0.5 shadow-2xs inline-flex items-center gap-1 shrink-0">
                        <span className="bg-blue-600 text-white text-[7px] font-black px-1 py-0.2 rounded-[2px]">IT</span>
                        <span className="text-[11px] font-mono font-bold tracking-[1px] text-slate-900 uppercase">{car.plate}</span>
                      </div>
                    </div>

                    {/* Compact Metrics Grid */}
                    <div className="grid grid-cols-3 gap-1.5 bg-slate-50 p-2 rounded-xl border border-slate-100 text-center">
                      <div className="min-w-0">
                        <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block truncate">Chilometri</span>
                        <span className="text-xs font-black text-slate-900 truncate block mt-0.5">
                          {currentKm.toLocaleString('it-IT')} km
                        </span>
                      </div>
                      <div className="min-w-0">
                        <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block truncate">Serbatoio</span>
                        <span className="text-xs font-black text-slate-900 truncate block mt-0.5">
                          {car.tankCapacity > 0 ? `${car.tankCapacity} ${fuelUnit}` : '-'}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block truncate">Spesa Tot.</span>
                        <span className="text-xs font-black text-slate-900 truncate block mt-0.5">
                          {settings.currency} {carTotalCost.toLocaleString('it-IT', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </span>
                      </div>
                    </div>

                    {/* Quick Access Direct Shortcuts (Zero scrolling needed!) */}
                    <div className="flex items-center gap-1.5 pt-0.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectVehicle(car.id, 'documents');
                        }}
                        className="flex-1 py-1.5 px-2 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 rounded-lg text-[11px] font-bold border border-slate-200/70 transition-colors flex items-center justify-center gap-1 truncate"
                        title="Apri i Documenti di circolazione del veicolo"
                      >
                        <FileText className="w-3 h-3 text-indigo-600 shrink-0" />
                        <span className="truncate">Documenti</span>
                        {docCount > 0 && (
                          <span className="bg-indigo-200 text-indigo-800 text-[9px] font-black px-1 rounded-full">
                            {docCount}
                          </span>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectVehicle(car.id, 'ai');
                        }}
                        className="flex-1 py-1.5 px-2 bg-slate-100 hover:bg-amber-50 hover:text-amber-700 text-slate-600 rounded-lg text-[11px] font-bold border border-slate-200/70 transition-colors flex items-center justify-center gap-1 truncate"
                        title="Chiedi all'Assistente AI del veicolo"
                      >
                        <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
                        <span className="truncate">Assistente AI</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectVehicle(car.id, 'specs');
                        }}
                        className="py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-[11px] font-bold border border-slate-200/70 transition-colors flex items-center justify-center gap-1"
                        title="Visualizza scheda tecnica completa"
                      >
                        <Settings2 className="w-3 h-3 text-slate-500" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* CARD FOOTER */}
                <div className="px-4 py-2 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs text-theme-primary font-bold">
                  <span className="text-slate-400 font-medium text-[11px]">
                    {(car.refuels?.length || 0)} rif. • {(car.maintenances?.length || 0)} interv.
                  </span>
                  <span className="flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform text-xs">
                    Panoramica <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>

              </div>
            );
          })}
        </section>
      )}

    </div>
  );
};
