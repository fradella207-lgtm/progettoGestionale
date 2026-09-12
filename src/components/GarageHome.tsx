import React, { useState, useMemo } from 'react';
import { 
  Car, 
  Bike,
  Edit3, 
  Trash2, 
  ChevronRight, 
  Plus, 
  Search, 
  Gauge, 
  FileText, 
  Zap, 
  Sparkles,
  ArrowUpRight,
  Crown,
  Lock,
  Users
} from 'lucide-react';
import { Vehicle, AppSettings, UserTier, ProFeatureName } from '../types';
import { ProBadge } from './common/ProBadge';

interface GarageHomeProps {
  vehicles: Vehicle[];
  settings: AppSettings;
  userTier?: UserTier;
  onSelectVehicle: (vehicleId: string, tab?: 'overview' | 'specs' | 'documents' | 'ai') => void;
  onOpenAddCar: () => void;
  onOpenEditCar: (vehicle: Vehicle) => void;
  onDeleteVehicle: (vehicleId: string) => void;
  onImportVehicles?: (importedVehicles: Vehicle[]) => void;
  onOpenRecap?: (vehicleId?: string) => void;
  onOpenUpgradeModal?: (feature?: ProFeatureName) => void;
  onOpenSharedGarage?: (vehicleId?: string) => void;
}

export const GarageHome: React.FC<GarageHomeProps> = ({
  vehicles,
  settings,
  userTier = 'FREE',
  onSelectVehicle,
  onOpenAddCar,
  onOpenEditCar,
  onDeleteVehicle,
  onOpenRecap,
  onOpenUpgradeModal,
  onOpenSharedGarage
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFuelCategory, setSelectedFuelCategory] = useState<string>('all');

  // Metriche flotta sintetiche ed essenziali (Km percorsi con le registrazioni e spese)
  const fleetSummary = useMemo(() => {
    let recordedKm = 0;
    let totalCost = 0;
    let totalRefuels = 0;

    vehicles.forEach(car => {
      const allKm = [
        ...(car.refuels || []).map(r => Number(r.km) || 0),
        ...(car.maintenances || []).map(m => Number(m.km) || 0)
      ].filter(k => k > 0);

      const hasRecordings = (car.refuels?.length || 0) > 0 || (car.maintenances?.length || 0) > 0;
      const currentKm = Math.max(Number(car.initialKm) || 0, ...allKm);

      if (hasRecordings && allKm.length > 0) {
        const initKm = Number(car.initialKm) || 0;
        const minRecorded = Math.min(...allKm);
        const baseKm = initKm > 0 ? Math.min(initKm, minRecorded) : minRecorded;
        recordedKm += Math.max(0, currentKm - baseKm);
      }

      const fCost = (car.refuels || []).reduce((sum, r) => sum + (Number(r.price) || 0), 0);
      const mCost = (car.maintenances || []).reduce((sum, m) => sum + (Number(m.cost) || 0), 0);
      totalCost += fCost + mCost;
      totalRefuels += (car.refuels?.length || 0);
    });

    return { recordedKm, totalCost, totalRefuels };
  }, [vehicles]);

  // Filtro veicoli pulito
  const filteredVehicles = useMemo(() => {
    return vehicles.filter(car => {
      const q = searchQuery.toLowerCase();
      const matches = 
        car.brand.toLowerCase().includes(q) ||
        car.model.toLowerCase().includes(q) ||
        car.plate.toLowerCase().includes(q);

      if (!matches) return false;

      if (selectedFuelCategory === 'all') return true;
      if (selectedFuelCategory === 'cars') return car.vehicleType !== 'moto';
      if (selectedFuelCategory === 'motos') return car.vehicleType === 'moto';
      if (selectedFuelCategory === 'electric_hybrid') {
        return car.fuelType.includes('Elettrica') || car.fuelType.includes('Hybrid') || car.fuelType.includes('BEV') || car.fuelType.includes('PHEV');
      }
      if (selectedFuelCategory === 'diesel') return car.fuelType.includes('Diesel');
      if (selectedFuelCategory === 'petrol') return car.fuelType.includes('Benzina') && !car.fuelType.includes('Hybrid');
      if (selectedFuelCategory === 'gas') return car.fuelType.includes('GPL') || car.fuelType.includes('Metano');
      return true;
    });
  }, [vehicles, searchQuery, selectedFuelCategory]);

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-5 font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* 1. TESTATA CENTRATA & MINIMAL */}
      <section className="flex flex-col items-center justify-center text-center py-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Il Tuo Garage
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-lg mx-auto">
          Gestisci i tuoi veicoli, spese, rifornimenti, manutenzioni e documenti in un unico posto.
        </p>
      </section>

      {/* 2. STATISTICHE ESSENZIALI (STRIP SNELLA CENTRATA) */}
      {vehicles.length > 0 && (
        <section className="flex flex-col gap-2.5">
          <div className="grid grid-cols-3 gap-2 bg-white border border-slate-200/80 p-3 sm:p-4 rounded-2xl shadow-2xs text-center">
            <div className="flex flex-col items-center justify-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Veicoli</span>
              <span className="text-base sm:text-lg font-black text-slate-900 mt-0.5">
                {vehicles.length}
              </span>
            </div>

            <div className="flex flex-col items-center justify-center border-l border-slate-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Km Registrati</span>
              <span className="text-base sm:text-lg font-black text-slate-900 mt-0.5 truncate">
                {fleetSummary.recordedKm.toLocaleString('it-IT')} km
              </span>
            </div>

            <div className="flex flex-col items-center justify-center border-l border-slate-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Spesa Complessiva</span>
              <span className="text-base sm:text-lg font-black text-slate-900 mt-0.5 truncate">
                {settings.currency} {fleetSummary.totalCost.toLocaleString('it-IT', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </span>
            </div>
          </div>

          {/* BANNER INFORMATIVO PIANO FREE */}
          {userTier === 'FREE' && vehicles.length >= 1 && (
            <div className="bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent border border-amber-300/60 rounded-2xl px-3.5 py-2.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 shadow-2xs">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shrink-0 shadow-2xs">
                  <Crown className="w-4 h-4 fill-slate-950" />
                </div>
                <div>
                  <span className="text-xs font-black text-slate-900 block leading-tight">
                    Piano FREE: 1/1 veicolo utilizzato
                  </span>
                  <span className="text-[11px] text-slate-600">
                    Sblocca il Garage Illimitato (2+ auto/moto), l&apos;Assistente AI e il Passaporto Digitale.
                  </span>
                </div>
              </div>

              <button
                type="button"
                id="btn-upgrade-garage-banner"
                onClick={() => onOpenUpgradeModal?.('multi_vehicle')}
                className="self-end sm:self-auto px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 active:scale-95 text-slate-950 text-xs font-black rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <span>Passa a PRO</span>
                <Crown className="w-3.5 h-3.5 fill-slate-950" />
              </button>
            </div>
          )}
        </section>
      )}

      {/* 3. RICERCA E FILTRI VELOCI */}
      {vehicles.length > 0 && (
        <section className="flex flex-col md:flex-row items-center justify-center gap-2.5">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              placeholder="Cerca veicolo per marca, modello, targa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-900 transition-all shadow-2xs"
            />
          </div>

          <div className="flex items-center justify-center gap-1 overflow-x-auto pb-1 sm:pb-0 no-scrollbar w-full md:w-auto">
            {/* PULSANTE AGGIUNGI VEICOLO DIRETTO */}
            <button
              type="button"
              id="btn-add-vehicle-home-strip"
              onClick={onOpenAddCar}
              className="px-3 py-1.5 rounded-xl text-xs font-black transition-all shrink-0 cursor-pointer bg-slate-900 hover:bg-slate-800 text-white flex items-center gap-1.5 shadow-2xs active:scale-95"
              title={userTier === 'FREE' && vehicles.length >= 1 ? 'Sblocca veicoli illimitati con MyGarage360 PRO' : 'Aggiungi un nuovo veicolo'}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Aggiungi</span>
              {userTier === 'FREE' && vehicles.length >= 1 && (
                <ProBadge variant="mini" />
              )}
            </button>

            {/* PULSANTE AUTO CONDIVISA / GARAGE CONDIVISO PRO */}
            <button
              type="button"
              id="btn-open-shared-garage-home"
              onClick={() => {
                if (userTier === 'FREE') {
                  onOpenUpgradeModal?.('shared_garage');
                } else {
                  onOpenSharedGarage?.();
                }
              }}
              className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer bg-indigo-50 hover:bg-indigo-100 text-indigo-950 border border-indigo-200 flex items-center gap-1.5 shadow-2xs"
              title="Condividi e sincronizza auto tra più account (marito, moglie, famiglia)"
            >
              <Users className="w-3.5 h-3.5 text-indigo-600" />
              <span>Auto Condivisa</span>
              {userTier === 'FREE' ? (
                <ProBadge variant="mini" />
              ) : (
                <span className="text-[9px] bg-indigo-600 text-white font-black px-1.5 py-0.2 rounded-md uppercase">PRO</span>
              )}
            </button>

            {[
              { id: 'all', label: 'Tutti' },
              { id: 'cars', label: 'Auto' },
              { id: 'motos', label: 'Moto' },
              { id: 'petrol', label: 'Benzina' },
              { id: 'diesel', label: 'Diesel' },
              { id: 'electric_hybrid', label: 'Ibride/EV' },
              { id: 'gas', label: 'GPL/Metano' }
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setSelectedFuelCategory(f.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer border ${
                  selectedFuelCategory === f.id
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}

            {/* RECAP MENSILE & ANNUALE BUTTON */}
            {onOpenRecap && (
              <button
                id="btn-open-recap-home"
                type="button"
                onClick={() => onOpenRecap()}
                className="px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all shrink-0 cursor-pointer bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 text-indigo-900 border border-indigo-200 flex items-center gap-1.5 shadow-2xs"
                title="Visualizza e condividi il Recap Mensile e Annuale del Garage"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Recap Story</span>
              </button>
            )}
          </div>
        </section>
      )}

      {/* 4. LISTA O GRIGLIA VEICOLI */}
      {vehicles.length === 0 ? (
        <section className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 flex flex-col items-center justify-center text-center shadow-2xs my-2">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center mb-3">
            <Car className="w-7 h-7 stroke-[1.5]" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Nessun veicolo nel garage</h3>
          <p className="text-xs text-slate-500 max-w-sm mt-1">
            Aggiungi il tuo primo veicolo (auto o moto) per iniziare a registrare chilometri, rifornimenti e scadenze.
          </p>
          <button
            onClick={onOpenAddCar}
            className="mt-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Aggiungi ora il tuo veicolo</span>
          </button>
        </section>
      ) : filteredVehicles.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center flex flex-col items-center justify-center gap-1.5 shadow-2xs">
          <p className="text-xs font-bold text-slate-700">Nessun veicolo corrisponde alla ricerca</p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedFuelCategory('all'); }}
            className="text-xs text-slate-900 font-bold hover:underline cursor-pointer"
          >
            Azzera filtri
          </button>
        </div>
      ) : (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVehicles.map((car) => {
            const refuelsKm = (car.refuels || []).map(r => Number(r.km) || 0);
            const maintKm = (car.maintenances || []).map(m => Number(m.km) || 0);
            const currentKm = Math.max(Number(car.initialKm) || 0, ...refuelsKm, ...maintKm);
            
            const carFuelCost = (car.refuels || []).reduce((sum, r) => sum + (Number(r.price) || 0), 0);
            const carMaintCost = (car.maintenances || []).reduce((sum, m) => sum + (Number(m.cost) || 0), 0);
            const carTotalCost = carFuelCost + carMaintCost;
            const isElectric = car.fuelType.includes('Elettrica') || car.fuelType.includes('BEV');

            return (
              <div 
                key={car.id}
                onClick={() => onSelectVehicle(car.id, 'overview')}
                className="bg-white rounded-2xl border border-slate-200 hover:border-slate-400 transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-2xs hover:shadow-xs cursor-pointer group"
              >
                <div>
                  {/* Foto Auto/Moto compatta con badges essenziali */}
                  <div className="w-full h-36 bg-slate-100 relative overflow-hidden flex items-center justify-center border-b border-slate-100">
                    {car.photoUrl ? (
                      <img 
                        src={car.photoUrl} 
                        alt={`${car.brand} ${car.model}`} 
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                        onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                      />
                    ) : (
                      <div className="flex flex-col items-center text-slate-400 gap-1">
                        {car.vehicleType === 'moto' ? (
                          <Bike className="w-8 h-8 stroke-[1.2]" />
                        ) : (
                          <Car className="w-8 h-8 stroke-[1.2]" />
                        )}
                        <span className="text-[11px] font-semibold">{car.brand}</span>
                      </div>
                    )}

                    {/* Badge Carburante & Tipo */}
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1">
                      {car.vehicleType === 'moto' && (
                        <div className="bg-slate-900/90 backdrop-blur-xs text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                          <Bike className="w-3 h-3" />
                          <span>Moto</span>
                        </div>
                      )}
                      <div className="bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                        {isElectric ? <Zap className="w-3 h-3 text-amber-400" /> : null}
                        <span>{car.fuelType.split(' ')[0]}</span>
                      </div>
                    </div>

                    {/* Bottoni Modifica / Elimina / Recap */}
                    <div className="absolute top-2.5 right-2.5 flex items-center gap-1">
                      {onOpenRecap && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenRecap(car.id);
                          }}
                          className="bg-white/90 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 p-1.5 rounded-md shadow-2xs transition-all cursor-pointer"
                          title="Vedi Recap Mensile & Annuale"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenEditCar(car);
                        }}
                        className="bg-white/90 hover:bg-white text-slate-700 p-1.5 rounded-md shadow-2xs transition-all cursor-pointer"
                        title="Modifica"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Eliminare ${car.brand} ${car.model} (${car.plate})?`)) {
                            onDeleteVehicle(car.id);
                          }
                        }}
                        className="bg-white/90 hover:bg-red-50 hover:text-red-600 text-slate-700 p-1.5 rounded-md shadow-2xs transition-all cursor-pointer"
                        title="Elimina"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Informazioni Veicolo */}
                  <div className="p-3.5 flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-1">
                      <div className="min-w-0">
                        <h2 className="text-sm font-extrabold text-slate-900 truncate">
                          {car.brand} {car.model}
                        </h2>
                        <p className="text-[11px] text-slate-500 font-medium">
                          {car.motorization || 'Di serie'} • {car.registrationDate?.split('-')[0] || 'N/D'}
                        </p>
                      </div>

                      <div className="bg-slate-50 border border-slate-300 rounded px-1.5 py-0.5 inline-flex items-center gap-1 shrink-0 font-mono text-[10px] font-bold">
                        <span className="bg-blue-600 text-white text-[7px] px-0.5 rounded-[1px]">IT</span>
                        <span className="tracking-wider">{car.plate}</span>
                      </div>
                    </div>

                    {/* Parametri essenziali (Km e Spesa) */}
                    <div className="grid grid-cols-2 gap-1.5 bg-slate-50/70 p-2 rounded-xl text-center border border-slate-100">
                      <div>
                        <span className="text-[9px] uppercase font-bold text-slate-400 block">Km</span>
                        <span className="text-xs font-black text-slate-900 mt-0.5 block">
                          {currentKm.toLocaleString('it-IT')}
                        </span>
                      </div>
                      <div className="border-l border-slate-200">
                        <span className="text-[9px] uppercase font-bold text-slate-400 block">Spesa Totale</span>
                        <span className="text-xs font-black text-slate-900 mt-0.5 block">
                          {settings.currency} {carTotalCost.toLocaleString('it-IT', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer card sintetico */}
                <div className="px-3.5 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700">
                  <span className="text-[11px] text-slate-400 font-medium">
                    {(car.refuels?.length || 0)} rif. • {(car.maintenances?.length || 0)} tagliandi
                  </span>
                  <span className="flex items-center gap-0.5 text-slate-900 group-hover:translate-x-0.5 transition-transform text-xs">
                    Gestisci <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>

              </div>
            );
          })}

          {/* Card Aggiungi Veicolo (opzionale alla fine della griglia) */}
          <div
            onClick={onOpenAddCar}
            className="rounded-2xl border-2 border-dashed border-slate-200 hover:border-slate-400 bg-slate-50/40 hover:bg-slate-50/90 transition-all flex flex-col items-center justify-center p-8 text-center cursor-pointer group min-h-[260px] relative"
          >
            {userTier === 'FREE' && vehicles.length >= 1 && (
              <div className="absolute top-3.5 right-3.5">
                <ProBadge variant="lock" />
              </div>
            )}
            <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 text-slate-700 flex items-center justify-center shadow-2xs group-hover:scale-105 group-hover:border-slate-400 transition-all mb-2.5">
              <Plus className="w-5 h-5 text-slate-800" />
            </div>
            <div className="flex items-center gap-1.5 justify-center">
              <span className="text-xs sm:text-sm font-bold text-slate-800">Aggiungi un veicolo</span>
              {userTier === 'FREE' && vehicles.length >= 1 && (
                <ProBadge variant="mini" />
              )}
            </div>
            <span className="text-[11px] text-slate-400 mt-0.5">
              {userTier === 'FREE' && vehicles.length >= 1 
                ? 'Passa a PRO per aggiungere 2 o più veicoli' 
                : 'Auto o moto'}
            </span>
          </div>
        </section>
      )}

    </div>
  );
};
