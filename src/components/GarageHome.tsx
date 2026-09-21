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
import { ConfirmationModal } from './modals/ConfirmationModal';
import { calculateVehicleConsumptionMetrics } from '../utils/consumptionCalculator';
import { motion, AnimatePresence } from 'motion/react';

interface GarageHomeProps {
  vehicles: Vehicle[];
  settings: AppSettings;
  userTier?: UserTier;
  onSelectVehicle: (vehicleId: string, tab?: 'overview' | 'specs' | 'documents' | 'ai') => void;
  onOpenAddCar: (initialType?: 'car' | 'moto') => void;
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
  const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null);

  // Metriche flotta sintetiche ed essenziali (Km percorsi con le registrazioni e spese)
  const fleetSummary = useMemo(() => {
    let recordedKm = 0;
    let totalCost = 0;

    vehicles.forEach(car => {
      // Calcola i km effettivi registrati con i dati inseriti nell'app (rifornimenti, tagliandi, trip)
      const metrics = calculateVehicleConsumptionMetrics(car);
      recordedKm += (metrics.totalDistance || 0);

      const refuelsCost = (car.refuels || []).reduce((sum, r) => sum + (Number(r.price) || 0), 0);
      const maintCost = (car.maintenances || []).reduce((sum, m) => sum + (Number(m.cost) || 0), 0);
      totalCost += (refuelsCost + maintCost);
    });

    return { recordedKm, totalCost };
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
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Il Tuo Garage
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-lg mx-auto">
          Gestisci i tuoi veicoli, spese, rifornimenti, manutenzioni e documenti in un unico posto.
        </p>
      </section>

      {/* 2. STATISTICHE ESSENZIALI (STRIP SNELLA CENTRATA A 3 COLONNE) */}
      {vehicles.length > 0 && (
        <section className="flex flex-col gap-2.5 max-w-4xl mx-auto w-full">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 sm:p-4 shadow-2xs grid grid-cols-3 gap-2 sm:gap-3 text-center">
            <div>
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">Veicoli Attivi</span>
              <span className="text-base sm:text-xl font-extrabold text-slate-900 dark:text-white mt-0.5 block truncate">
                {vehicles.length}
              </span>
            </div>

            <div className="border-l border-slate-100 dark:border-slate-800">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">Km Registrati</span>
              <span className="text-base sm:text-xl font-extrabold text-slate-900 dark:text-white mt-0.5 block truncate">
                {fleetSummary.recordedKm.toLocaleString('it-IT')} km
              </span>
            </div>

            <div className="border-l border-slate-100 dark:border-slate-800">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">Spesa Totale</span>
              <span className="text-base sm:text-xl font-extrabold text-slate-900 dark:text-white mt-0.5 block truncate">
                {settings.currency} {fleetSummary.totalCost.toLocaleString('it-IT', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </span>
            </div>
          </div>

          {/* BANNER INFORMATIVO PIANO FREE */}
          {userTier === 'FREE' && vehicles.length >= 1 && (
            <div className="bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent dark:from-amber-950/30 dark:via-amber-900/10 border border-amber-300/60 dark:border-amber-800/60 rounded-2xl px-3.5 py-2.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 shadow-2xs">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shrink-0 shadow-2xs">
                  <Crown className="w-4 h-4 fill-slate-950" />
                </div>
                <div>
                  <span className="text-xs font-black text-slate-900 dark:text-white block leading-tight">
                    Piano FREE: 1/1 veicolo utilizzato
                  </span>
                  <span className="text-[11px] text-slate-600 dark:text-slate-300">
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

      {/* 3. RICERCA E FILTRI VELOCI CON TASTO CONDIVIDI UN VEICOLO */}
      {vehicles.length > 0 && (
        <section className="flex flex-col sm:flex-row items-center justify-between gap-2.5 max-w-6xl w-full mx-auto">
          <div className="relative w-full sm:w-72 md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              placeholder="Cerca veicolo per marca, modello, targa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-all shadow-2xs"
            />
          </div>

          <div className="flex items-center justify-start sm:justify-end gap-2 overflow-x-auto pb-1 sm:pb-0 no-scrollbar w-full sm:w-auto">
            {/* Filtri Tutti / Auto / Moto */}
            <div className="inline-flex items-center p-0.5 rounded-xl bg-slate-100/90 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shrink-0 relative">
              {[
                { id: 'all', label: 'Tutti' },
                { id: 'cars', label: 'Auto' },
                { id: 'motos', label: 'Moto' }
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  id={`filter-vehicle-${f.id}`}
                  onClick={() => setSelectedFuelCategory(f.id)}
                  className={`relative px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shrink-0 cursor-pointer z-10 ${
                    selectedFuelCategory === f.id
                      ? 'text-slate-950 dark:text-white font-black'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
                  }`}
                >
                  {selectedFuelCategory === f.id && (
                    <motion.div
                      layoutId="activeCategoryBg"
                      className="absolute inset-0 bg-white dark:bg-slate-700 rounded-lg shadow-2xs"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{f.label}</span>
                </button>
              ))}
            </div>

            {/* Separatore */}
            <div className="h-5 w-[1px] bg-slate-200 dark:bg-slate-700 hidden sm:block shrink-0" />

            {/* TASTO "Condividi un veicolo" INSERITO ACCANTO AI FILTRI */}
            <button
              type="button"
              id="btn-share-vehicle-filter-bar"
              onClick={() => {
                if (userTier === 'FREE') {
                  onOpenUpgradeModal?.('shared_garage');
                } else {
                  onOpenSharedGarage?.();
                }
              }}
              className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 border bg-indigo-50/90 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border-indigo-200/80 dark:border-indigo-800/60 active:scale-95 shadow-2xs"
              title="Apri pannello di controllo condivisione veicolo"
            >
              <Users className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Condividi un veicolo</span>
              {vehicles.some(v => v.isShared) && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              )}
            </button>

            {/* Pulsante Nuovo Veicolo Header Rapido */}
            <button
              type="button"
              id="btn-add-vehicle-top"
              onClick={() => onOpenAddCar('car')}
              className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
              title="Aggiungi una nuova auto o moto al tuo garage"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Aggiungi Veicolo</span>
              <span className="xs:hidden">Nuovo</span>
              {userTier === 'FREE' && vehicles.length >= 1 && (
                <ProBadge variant="mini" />
              )}
            </button>
          </div>
        </section>
      )}

      {/* 4. LISTA O GRIGLIA VEICOLI */}
      {vehicles.length === 0 ? (
        <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 sm:p-12 flex flex-col items-center justify-center text-center shadow-2xs my-2">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center mb-3">
            <Car className="w-7 h-7 stroke-[1.5]" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Nessun veicolo nel garage</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1">
            Aggiungi il tuo primo veicolo (auto o moto) per iniziare a registrare chilometri, rifornimenti e scadenze.
          </p>
          <button
            onClick={() => onOpenAddCar('car')}
            className="mt-4 bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Aggiungi ora il tuo veicolo</span>
          </button>
        </section>
      ) : filteredVehicles.length === 0 ? (
        selectedFuelCategory === 'motos' ? (
          /* SE SI SELEZIONA MOTO E NON C'E' NESSUNA MOTO -> BOTTONE AGGIUNGI MOTO */
          <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 sm:p-10 flex flex-col items-center justify-center text-center shadow-2xs my-2">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3 border border-amber-200/60 dark:border-amber-800/60 shadow-2xs">
              <Bike className="w-7 h-7 stroke-[1.75]" />
            </div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">Nessuna moto nel garage</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1 leading-relaxed">
              Non hai ancora registrato una moto o scooter nel tuo garage. Aggiungine una per tracciare tagliandi, rifornimenti dedicati e consumi delle due ruote.
            </p>
            <div className="flex items-center gap-2.5 mt-4">
              <button
                type="button"
                id="btn-add-moto-when-empty"
                onClick={() => onOpenAddCar('moto')}
                className="bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold px-4.5 py-2.5 rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <Bike className="w-4 h-4" />
                <span>Aggiungi moto</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedFuelCategory('all')}
                className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold px-3.5 py-2.5 rounded-xl transition-all cursor-pointer"
              >
                Mostra tutti i veicoli
              </button>
            </div>
          </section>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center flex flex-col items-center justify-center gap-1.5 shadow-2xs">
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Nessun veicolo corrisponde alla ricerca</p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedFuelCategory('all'); }}
              className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer"
            >
              Azzera filtri
            </button>
          </div>
        )
      ) : (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredVehicles.map((car) => {
              const refuelsKm = (car.refuels || []).map(r => Number(r.km) || 0);
              const maintKm = (car.maintenances || []).map(m => Number(m.km) || 0);
              const currentKm = Math.max(Number(car.initialKm) || 0, ...refuelsKm, ...maintKm);
              
              const carFuelCost = (car.refuels || []).reduce((sum, r) => sum + (Number(r.price) || 0), 0);
              const carMaintCost = (car.maintenances || []).reduce((sum, m) => sum + (Number(m.cost) || 0), 0);
              const carTotalCost = carFuelCost + carMaintCost;
              const isElectric = car.fuelType.includes('Elettrica') || car.fuelType.includes('BEV');

              return (
                <motion.div 
                  layout
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.18 }}
                  key={car.id}
                  onClick={() => onSelectVehicle(car.id, 'overview')}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-2xs hover:shadow-xs cursor-pointer group"
                >
                <div>
                  {/* Foto Auto/Moto compatta con badges essenziali */}
                  <div className="w-full h-36 bg-slate-100 dark:bg-slate-800/80 relative overflow-hidden flex items-center justify-center border-b border-slate-100 dark:border-slate-800">
                    {car.photoUrl ? (
                      <img 
                        src={car.photoUrl} 
                        alt={`${car.brand} ${car.model}`} 
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                        onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                      />
                    ) : (
                      <div className="flex flex-col items-center text-slate-400 dark:text-slate-500 gap-1">
                        {car.vehicleType === 'moto' ? (
                          <Bike className="w-8 h-8 stroke-[1.2]" />
                        ) : (
                          <Car className="w-8 h-8 stroke-[1.2]" />
                        )}
                        <span className="text-[11px] font-semibold">{car.brand}</span>
                      </div>
                    )}

                    {/* Badge Carburante & Tipo & Condivisione */}
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
                      {car.isShared && (
                        <div className="bg-indigo-600/90 backdrop-blur-xs text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          <span>Condivisa</span>
                        </div>
                      )}
                    </div>

                    {/* Bottoni Modifica / Elimina / Recap */}
                    <div className="absolute top-2.5 right-2.5 flex items-center gap-1">
                      {onOpenRecap && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenRecap(car.id);
                          }}
                          className="bg-white/90 dark:bg-slate-800/90 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 text-slate-700 dark:text-slate-300 p-1.5 rounded-md shadow-2xs transition-all cursor-pointer"
                          title="Vedi Recap Mensile & Annuale"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                        </button>
                      )}
                      {/* Modifica visibile solo se non è un membro ospite */}
                      {car.sharedRole !== 'member' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenEditCar(car);
                          }}
                          className="bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 p-1.5 rounded-md shadow-2xs transition-all cursor-pointer"
                          title="Modifica veicolo"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setVehicleToDelete(car);
                        }}
                        className="bg-white/90 dark:bg-slate-800/90 hover:bg-red-50 dark:hover:bg-red-950/60 hover:text-red-600 text-slate-700 dark:text-slate-300 p-1.5 rounded-md shadow-2xs transition-all cursor-pointer"
                        title={car.sharedRole === 'member' ? 'Scollega dal garage' : 'Elimina'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Informazioni Veicolo */}
                  <div className="p-3.5 flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-1">
                      <div className="min-w-0">
                        <h2 className="text-sm font-extrabold text-slate-900 dark:text-white truncate">
                          {car.brand} {car.model}
                        </h2>
                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                          <span className="font-mono text-[11px] font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                            {car.plate}
                          </span>
                          {car.registrationDate && (
                            <span className="text-[11px] text-slate-500 dark:text-slate-400">
                              Anno {car.registrationDate.split('-')[0]}
                            </span>
                          )}
                          {car.isShared && (
                            <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800/80 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                              <Users className="w-2.5 h-2.5 text-indigo-600 dark:text-indigo-400" />
                              <span>Veicolo Condiviso</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Statistiche compatte */}
                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800 text-center">
                      <div>
                        <span className="text-[9px] uppercase font-bold text-slate-500 dark:text-slate-400 block">Km Attuali</span>
                        <span className="text-xs font-black text-slate-900 dark:text-white mt-0.5 block">
                          {currentKm.toLocaleString('it-IT')} km
                        </span>
                      </div>
                      <div className="border-l border-slate-200 dark:border-slate-800">
                        <span className="text-[9px] uppercase font-bold text-slate-500 dark:text-slate-400 block">Spesa Totale</span>
                        <span className="text-xs font-black text-slate-900 dark:text-white mt-0.5 block">
                          {settings.currency} {carTotalCost.toLocaleString('it-IT', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer card sintetico */}
                <div className="px-3.5 py-2 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    {(car.refuels?.length || 0)} rif. • {(car.maintenances?.length || 0)} tagliandi
                  </span>
                  <span className="flex items-center gap-0.5 text-slate-900 dark:text-white group-hover:translate-x-0.5 transition-transform text-xs">
                    Gestisci <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>

              </motion.div>
            );
          })}
          </AnimatePresence>

          {/* Card Aggiungi Veicolo (in griglia) */}
          <div
            onClick={() => onOpenAddCar('car')}
            className="rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600 bg-slate-50/40 dark:bg-slate-850/40 hover:bg-slate-50/90 dark:hover:bg-slate-800/60 transition-all flex flex-col items-center justify-center p-8 text-center cursor-pointer group min-h-[260px] relative"
          >
            {userTier === 'FREE' && vehicles.length >= 1 && (
              <div className="absolute top-3.5 right-3.5">
                <ProBadge variant="lock" />
              </div>
            )}
            <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center shadow-2xs group-hover:scale-105 group-hover:border-slate-400 dark:group-hover:border-slate-500 transition-all mb-2.5">
              <Plus className="w-5 h-5 text-slate-800 dark:text-slate-200" />
            </div>
            <div className="flex items-center gap-1.5 justify-center">
              <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">Aggiungi un veicolo</span>
              {userTier === 'FREE' && vehicles.length >= 1 && (
                <ProBadge variant="mini" />
              )}
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              {userTier === 'FREE' && vehicles.length >= 1 
                ? 'Passa a PRO per aggiungere 2 o più veicoli' 
                : 'Auto o moto'}
            </span>
          </div>
        </section>
      )}

      {/* Modal di conferma eliminazione / scollegamento in-app */}
      <ConfirmationModal
        isOpen={Boolean(vehicleToDelete)}
        title={
          vehicleToDelete?.isShared && vehicleToDelete.sharedRole === 'member'
            ? 'Scollegare veicolo dal garage?'
            : 'Eliminare questo veicolo?'
        }
        message={
          vehicleToDelete?.isShared && vehicleToDelete.sharedRole === 'member'
            ? `Vuoi rimuovere ${vehicleToDelete.brand} ${vehicleToDelete.model} (${vehicleToDelete.plate}) dal tuo account? Potrai ricollegarti nuovamente in qualsiasi momento tramite il codice invito.`
            : `Sei sicuro di voler eliminare definitivamente ${vehicleToDelete?.brand} ${vehicleToDelete?.model} (${vehicleToDelete?.plate}) e tutti i registri associati? L'azione non è reversibile.`
        }
        confirmLabel={
          vehicleToDelete?.isShared && vehicleToDelete.sharedRole === 'member'
            ? 'Scollega'
            : 'Elimina veicolo'
        }
        cancelLabel="Annulla"
        isDestructive={true}
        onConfirm={() => {
          if (vehicleToDelete) {
            onDeleteVehicle(vehicleToDelete.id);
            setVehicleToDelete(null);
          }
        }}
        onCancel={() => setVehicleToDelete(null)}
      />

    </div>
  );
};
