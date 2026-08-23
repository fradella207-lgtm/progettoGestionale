import React from 'react';
import { 
  Car, 
  Fuel, 
  Wrench, 
  Edit3, 
  Trash2, 
  ChevronRight, 
  Zap,
  Plus
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
  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6 font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* 1. CLEAN GARAGE TITLE HEADER */}
      <section className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="w-2 h-2 rounded-full bg-[#2563eb]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#64748b]">
              Garage • {vehicles.length} {vehicles.length === 1 ? 'Veicolo registrato' : 'Veicoli registrati'}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#0f172a]">
            I Tuoi Veicoli
          </h2>
        </div>
      </section>

      {/* 2. VEHICLES GRID */}
      {vehicles.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#e2e8f0] p-12 text-center flex flex-col items-center justify-center gap-4 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#2563eb] border border-blue-100 flex items-center justify-center shadow-xs">
            <Car className="w-8 h-8 stroke-[1.5]" />
          </div>
          <div className="max-w-md">
            <h3 className="text-lg font-bold text-[#0f172a]">Il tuo garage è vuoto</h3>
            <p className="text-xs sm:text-sm text-[#64748b] mt-1">
              Registra la tua prima auto per monitorare consumi, chilometri, rifornimenti e scadenze di manutenzione.
            </p>
          </div>
          <button
            onClick={onOpenAddCar}
            className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-bold px-5 py-2.5 rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Aggiungi il tuo primo veicolo</span>
          </button>
        </div>
      ) : (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {vehicles.map((car) => {
            const refuelsKm = (car.refuels || []).map(r => Number(r.km) || 0);
            const maintKm = (car.maintenances || []).map(m => Number(m.km) || 0);
            const currentKm = Math.max(Number(car.initialKm) || 0, ...refuelsKm, ...maintKm);
            
            const isElectric = car.fuelType.includes('Elettrica') || car.fuelType.includes('BEV');
            const fuelUnit = isElectric ? 'kWh' : (car.fuelType === 'Metano' ? 'Kg' : 'L');
            
            const carFuelCost = (car.refuels || []).reduce((sum, r) => sum + (Number(r.price) || 0), 0);
            const carMaintCost = (car.maintenances || []).reduce((sum, m) => sum + (Number(m.cost) || 0), 0);
            const carTotalCost = carFuelCost + carMaintCost;

            return (
              <div 
                key={car.id}
                id={`card-car-${car.id}`}
                onClick={() => onSelectVehicle(car.id)}
                className="bg-white rounded-2xl border border-[#e2e8f0] overflow-hidden shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between cursor-pointer group"
              >
                <div>
                  {/* PHOTO CONTAINER */}
                  <div className="w-full h-44 bg-[#f1f5f9] relative overflow-hidden flex items-center justify-center border-b border-[#e2e8f0]">
                    {car.photoUrl ? (
                      <img 
                        src={car.photoUrl} 
                        alt={`${car.brand} ${car.model}`} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                      />
                    ) : (
                      <div className="flex flex-col items-center text-[#94a3b8] gap-1.5">
                        <Car className="w-12 h-12 stroke-[1.2]" />
                        <span className="text-xs font-semibold text-[#64748b]">{car.brand}</span>
                      </div>
                    )}

                    {/* Fuel Badge */}
                    <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs text-[#0f172a] text-[10px] font-bold px-2 py-0.5 rounded-lg border border-[#e2e8f0] shadow-xs flex items-center gap-1">
                      {isElectric ? <Zap className="w-3 h-3 text-[#8b5cf6]" /> : <Fuel className="w-3 h-3 text-[#2563eb]" />}
                      <span>{car.fuelType}</span>
                    </div>

                    {/* Action buttons (Edit & Delete) */}
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenEditCar(car);
                        }}
                        className="bg-white/95 backdrop-blur-xs hover:bg-white text-[#64748b] hover:text-[#2563eb] p-1.5 rounded-lg border border-[#e2e8f0] shadow-xs transition-colors"
                        title="Modifica veicolo"
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
                        className="bg-white/95 backdrop-blur-xs hover:bg-white text-[#64748b] hover:text-[#dc2626] p-1.5 rounded-lg border border-[#e2e8f0] shadow-xs transition-colors"
                        title="Elimina veicolo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* CARD BODY */}
                  <div className="p-4 sm:p-5 flex flex-col gap-3.5">
                    {/* Title & Plate */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-lg font-bold text-[#0f172a] group-hover:text-[#2563eb] transition-colors leading-snug">
                          {car.brand} {car.model}
                        </h3>
                        <p className="text-[11px] text-[#64748b] font-medium mt-0.5">
                          Immatricolazione {car.registrationDate ? car.registrationDate.split('-')[0] : 'N/D'}
                        </p>
                      </div>

                      {/* License plate physical style */}
                      <div className="bg-white border-[1.5px] border-[#cbd5e1] rounded-lg px-2.5 py-0.5 shadow-2xs inline-flex items-center gap-1.5 shrink-0">
                        <span className="bg-[#2563eb] text-white text-[8px] font-black px-1 py-0.2 rounded-[2px]">IT</span>
                        <span className="text-xs font-bold tracking-[1.5px] text-[#0f172a] uppercase">{car.plate}</span>
                      </div>
                    </div>

                    {/* Key Minimal Metrics */}
                    <div className="grid grid-cols-3 gap-2 bg-[#f8fafc] p-2.5 rounded-xl border border-[#e2e8f0]/60 text-center">
                      <div>
                        <span className="text-[9px] uppercase tracking-wider text-[#64748b] font-bold block">Chilometri</span>
                        <span className="text-xs font-bold text-[#0f172a]">
                          {currentKm.toLocaleString('it-IT')} km
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase tracking-wider text-[#64748b] font-bold block">Serbatoio</span>
                        <span className="text-xs font-bold text-[#0f172a]">
                          {car.tankCapacity > 0 ? `${car.tankCapacity} ${fuelUnit}` : '-'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase tracking-wider text-[#64748b] font-bold block">Spesa Totale</span>
                        <span className="text-xs font-bold text-[#059669]">
                          {settings.currency} {carTotalCost.toLocaleString('it-IT', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CARD FOOTER */}
                <div className="px-4 py-3 bg-[#f8fafc] border-t border-[#e2e8f0] flex items-center justify-between text-xs text-[#2563eb] font-bold">
                  <span className="text-[#64748b] font-normal text-[11px]">
                    {(car.refuels?.length || 0)} rifornimenti • {(car.maintenances?.length || 0)} interventi
                  </span>
                  <span className="flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                    Visualizza Scheda <ChevronRight className="w-3.5 h-3.5" />
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

