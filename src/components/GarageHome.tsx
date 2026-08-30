import React, { useState, useMemo } from 'react';
import { 
  Car, 
  Fuel, 
  Wrench, 
  Edit3, 
  Trash2, 
  ChevronRight, 
  Zap,
  Plus,
  Search,
  Gauge,
  Receipt,
  Sparkles,
  BookOpen,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  FileText
} from 'lucide-react';
import { Vehicle, AppSettings } from '../types';

interface GarageHomeProps {
  vehicles: Vehicle[];
  settings: AppSettings;
  onSelectVehicle: (vehicleId: string) => void;
  onOpenAddCar: () => void;
  onOpenEditCar: (vehicle: Vehicle) => void;
  onDeleteVehicle: (vehicleId: string) => void;
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
    <div className="w-full max-w-7xl mx-auto p-3.5 sm:p-6 lg:p-8 flex flex-col gap-5 pb-28 font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* 1. DYNAMIC GARAGE HERO & SUMMARY CARDS */}
      <section className="flex flex-col gap-3.5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                Garage Virtuale • {vehicles.length} {vehicles.length === 1 ? 'Veicolo' : 'Veicoli'}
              </span>
            </div>
            <h2 className="text-xl sm:text-3xl font-black tracking-tight text-slate-950">
              I Tuoi Veicoli & Flotta
            </h2>
          </div>

          <button
            onClick={onOpenAddCar}
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-2xl shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Aggiungi Nuovo Veicolo</span>
          </button>
        </div>

        {/* FLEET QUICK STATS STRIP (if at least 1 car) */}
        {vehicles.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 bg-white border border-slate-200/90 p-3 sm:p-4 rounded-3xl shadow-xs">
            <div className="flex items-center gap-2.5 p-1.5 sm:p-2">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center justify-center shrink-0">
                <Car className="w-4.5 h-4.5" />
              </div>
              <div className="min-w-0">
                <span className="text-[9.5px] sm:text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block truncate">Auto Attive</span>
                <span className="text-sm sm:text-base font-black text-slate-900">{vehicles.length}</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-1.5 sm:p-2">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-slate-100 text-slate-800 border border-slate-200 flex items-center justify-center shrink-0">
                <Gauge className="w-4.5 h-4.5" />
              </div>
              <div className="min-w-0">
                <span className="text-[9.5px] sm:text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block truncate">Km Totali</span>
                <span className="text-sm sm:text-base font-black text-slate-900 truncate">
                  {fleetStats.totalKm.toLocaleString('it-IT')} km
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-1.5 sm:p-2">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center shrink-0">
                <Receipt className="w-4.5 h-4.5" />
              </div>
              <div className="min-w-0">
                <span className="text-[9.5px] sm:text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block truncate">Spese Totali</span>
                <span className="text-sm sm:text-base font-black text-emerald-700 truncate">
                  {settings.currency} {fleetStats.totalSpent.toLocaleString('it-IT', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-1.5 sm:p-2">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-amber-50 text-amber-700 border border-amber-100 flex items-center justify-center shrink-0">
                <TrendingUp className="w-4.5 h-4.5" />
              </div>
              <div className="min-w-0">
                <span className="text-[9.5px] sm:text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block truncate">Registrazioni</span>
                <span className="text-xs sm:text-base font-black text-slate-900 truncate">
                  {fleetStats.totalRefuelsCount} rif. · {fleetStats.totalMaintenancesCount} tagl.
                </span>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 2. SEARCH & DYNAMIC FILTER BAR */}
      {vehicles.length > 0 && (
        <section className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          {/* Quick Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cerca per marca, modello o targa..."
              className="w-full pl-9 pr-3.5 py-2.5 rounded-2xl bg-white border border-slate-200/90 text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all shadow-xs"
            />
          </div>

          {/* Quick Filter Categories */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {[
              { id: 'all', label: 'Tutti' },
              { id: 'diesel', label: 'Diesel' },
              { id: 'petrol', label: 'Benzina' },
              { id: 'electric_hybrid', label: 'Ibrida / EV' },
              { id: 'gas', label: 'GPL / Metano' }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedFuelCategory(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all cursor-pointer active:scale-95 ${
                  selectedFuelCategory === tab.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/90'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* 3. VEHICLES GRID */}
      {vehicles.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-12 text-center flex flex-col items-center justify-center gap-4 shadow-xs">
          <div className="w-16 h-16 rounded-3xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shadow-xs">
            <Car className="w-8 h-8 stroke-[1.5]" />
          </div>
          <div className="max-w-md">
            <h3 className="text-lg font-black text-slate-900">Il tuo garage è vuoto</h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Registra la tua prima auto per monitorare consumi, chilometri, rifornimenti e scadenze di manutenzione.
            </p>
          </div>
          <button
            onClick={onOpenAddCar}
            className="bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-2xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Aggiungi il tuo primo veicolo</span>
          </button>
        </div>
      ) : filteredVehicles.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-8 text-center flex flex-col items-center justify-center gap-3">
          <Search className="w-8 h-8 text-slate-400" />
          <p className="text-sm font-bold text-slate-700">Nessun veicolo corrisponde alla ricerca</p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedFuelCategory('all'); }}
            className="text-xs text-indigo-600 font-bold hover:underline cursor-pointer"
          >
            Ripristina filtri
          </button>
        </div>
      ) : (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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

            const hasManual = !!(car.manualInfo || car.technicalSpecs?.manualInfo);

            return (
              <div 
                key={car.id}
                id={`card-car-${car.id}`}
                onClick={() => onSelectVehicle(car.id)}
                className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-md hover:border-indigo-300 transition-all duration-200 flex flex-col justify-between cursor-pointer group active:scale-[0.99]"
              >
                <div>
                  {/* PHOTO CONTAINER */}
                  <div className="w-full h-44 sm:h-48 bg-slate-900 relative overflow-hidden flex items-center justify-center border-b border-slate-100">
                    {car.photoUrl ? (
                      <img 
                        src={car.photoUrl} 
                        alt={`${car.brand} ${car.model}`} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                      />
                    ) : (
                      <div className="flex flex-col items-center text-slate-400 gap-1.5">
                        <Car className="w-12 h-12 stroke-[1.2] text-slate-600" />
                        <span className="text-xs font-bold text-slate-400">{car.brand}</span>
                      </div>
                    )}

                    {/* Gradient shadow for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-slate-950/40 pointer-events-none" />

                    {/* Fuel Badge */}
                    <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-md text-white text-[10.5px] font-black px-2.5 py-1 rounded-xl border border-white/20 shadow-xs flex items-center gap-1.5">
                      {isElectric ? (
                        <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      ) : isPHEV ? (
                        <Zap className="w-3.5 h-3.5 text-teal-400" />
                      ) : isGas ? (
                        <Fuel className="w-3.5 h-3.5 text-sky-400" />
                      ) : (
                        <Fuel className="w-3.5 h-3.5 text-indigo-400" />
                      )}
                      <span>{car.fuelType}</span>
                    </div>

                    {/* Manual / Specs Badge */}
                    {hasManual && (
                      <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur-md text-white text-[9.5px] font-bold px-2 py-0.5 rounded-lg border border-white/20 flex items-center gap-1">
                        <BookOpen className="w-3 h-3 text-indigo-400" />
                        <span>Manuale AI</span>
                      </div>
                    )}

                    {/* Action buttons (Edit & Delete) */}
                    <div className="absolute top-3 right-3 flex items-center gap-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenEditCar(car);
                        }}
                        className="bg-slate-900/80 backdrop-blur-md hover:bg-slate-900 text-white p-2 rounded-xl border border-white/20 shadow-xs transition-all active:scale-90"
                        title="Modifica veicolo"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-slate-200 hover:text-white" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Rimuovere ${car.brand} ${car.model} (${car.plate}) dal garage?`)) {
                            onDeleteVehicle(car.id);
                          }
                        }}
                        className="bg-slate-900/80 backdrop-blur-md hover:bg-red-600 text-white p-2 rounded-xl border border-white/20 shadow-xs transition-all active:scale-90"
                        title="Elimina veicolo"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-slate-200 hover:text-white" />
                      </button>
                    </div>
                  </div>

                  {/* CARD BODY */}
                  <div className="p-4 sm:p-5 flex flex-col gap-3">
                    {/* Title & Plate */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="text-base sm:text-lg font-black text-slate-950 group-hover:text-indigo-600 transition-colors leading-snug truncate">
                          {car.brand} {car.model}
                        </h3>
                        <p className="text-[11px] text-slate-500 font-semibold mt-0.5 truncate">
                          {car.motorization ? `${car.motorization} • ` : ''}Anno {car.registrationDate ? car.registrationDate.split('-')[0] : 'N/D'}
                        </p>
                      </div>

                      {/* License plate physical EU style */}
                      <div className="bg-white border-2 border-slate-300 rounded-lg px-2 py-0.5 shadow-2xs inline-flex items-center gap-1 shrink-0">
                        <span className="bg-blue-600 text-white text-[7.5px] font-black px-1 py-0.2 rounded-[2px]">IT</span>
                        <span className="text-[11.5px] font-black font-mono tracking-[1px] text-slate-950 uppercase">{car.plate}</span>
                      </div>
                    </div>

                    {/* Key Minimal Metrics Grid */}
                    <div className="grid grid-cols-3 gap-1.5 sm:gap-2 bg-slate-50 p-2.5 sm:p-3 rounded-2xl border border-slate-100 text-center">
                      <div>
                        <span className="text-[8.5px] sm:text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Chilometri</span>
                        <span className="text-xs sm:text-sm font-black text-slate-900">
                          {currentKm.toLocaleString('it-IT')} km
                        </span>
                      </div>
                      <div>
                        <span className="text-[8.5px] sm:text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Serbatoio</span>
                        <span className="text-xs sm:text-sm font-black text-slate-900">
                          {car.tankCapacity > 0 ? `${car.tankCapacity} ${fuelUnit}` : '-'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[8.5px] sm:text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Spesa Totale</span>
                        <span className="text-xs sm:text-sm font-black text-emerald-700">
                          {settings.currency} {carTotalCost.toLocaleString('it-IT', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CARD FOOTER */}
                <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-indigo-700 font-black">
                  <span className="text-slate-500 font-medium text-[11px]">
                    {(car.refuels?.length || 0)} rif. • {(car.maintenances?.length || 0)} interv.
                  </span>
                  <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Gestisci Scheda <ChevronRight className="w-4 h-4" />
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



