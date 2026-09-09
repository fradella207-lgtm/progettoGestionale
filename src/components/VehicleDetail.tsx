import React, { useState, useMemo, useEffect } from 'react';
import { 
  Car, 
  Bike,
  Plus, 
  Fuel, 
  Wrench, 
  Edit3, 
  Sparkles, 
  Zap, 
  ChevronRight, 
  Receipt, 
  Gauge, 
  Camera, 
  FileText, 
  Check, 
  Copy,
  AlertTriangle
} from 'lucide-react';
import { Vehicle, RefuelRecord, MaintenanceRecord, AIAdvice, AppSettings, EnergySourceType } from '../types';
import { DetailViewModal, DetailModalData } from './modals/DetailViewModal';
import { BoardTripsModal } from './modals/BoardTripsModal';
import { RefuelsRegistryModal } from './modals/RefuelsRegistryModal';
import { MaintenancesRegistryModal } from './modals/MaintenancesRegistryModal';
import { calculateVehicleConsumptionMetrics } from '../utils/consumptionCalculator';
import { CarDocumentsVault } from './CarDocumentsVault';
import { CarAIAssistant } from './CarAIAssistant';
import { formatVinForDisplay } from '../utils/vinValidator';

interface VehicleDetailProps {
  vehicle: Vehicle;
  vehicles?: Vehicle[];
  settings: AppSettings;
  initialTab?: 'overview' | 'documents' | 'ai';
  onSelectVehicle?: (vehicleId: string) => void;
  onBackToGarage?: () => void;
  onUpdateVehicle?: (updated: Vehicle) => void;
  onOpenEditCar: () => void;
  onOpenAddRefuel: (energyType?: EnergySourceType) => void;
  onOpenEditRefuel: (refuel: RefuelRecord) => void;
  onOpenAddMaintenance: () => void;
  onOpenEditMaintenance: (maint: MaintenanceRecord) => void;
  onOpenFixTank: () => void;
}

export const VehicleDetail: React.FC<VehicleDetailProps> = ({
  vehicle,
  settings,
  initialTab = 'overview',
  onUpdateVehicle,
  onOpenEditCar,
  onOpenAddRefuel,
  onOpenEditRefuel,
  onOpenAddMaintenance,
  onOpenEditMaintenance,
  onOpenFixTank
}) => {
  const [mainTab, setMainTab] = useState<'overview' | 'documents' | 'ai'>(
    (initialTab === 'overview' || initialTab === 'documents' || initialTab === 'ai') ? initialTab : 'overview'
  );

  useEffect(() => {
    if (initialTab) setMainTab(initialTab);
  }, [initialTab]);

  const [activeRegistryTab, setActiveRegistryTab] = useState<'refuels' | 'maintenances'>('refuels');
  const [selectedDetailData, setSelectedDetailData] = useState<DetailModalData | null>(null);

  // Modals for Registries and Board Trips
  const [isBoardTripsModalOpen, setIsBoardTripsModalOpen] = useState(false);
  const [isRefuelsRegistryOpen, setIsRefuelsRegistryOpen] = useState(false);
  const [isMaintenancesRegistryOpen, setIsMaintenancesRegistryOpen] = useState(false);
  const [copiedVin, setCopiedVin] = useState(false);

  const handleCopyVin = (vinStr: string) => {
    try {
      navigator.clipboard?.writeText(vinStr);
      setCopiedVin(true);
      setTimeout(() => setCopiedVin(false), 2000);
    } catch (e) {}
  };

  // Compute current km
  const currentKm = useMemo(() => {
    const refuelsKm = (vehicle.refuels || []).map(r => Number(r.km) || 0);
    const maintKm = (vehicle.maintenances || []).map(m => Number(m.km) || 0);
    return Math.max(Number(vehicle.initialKm) || 0, ...refuelsKm, ...maintKm);
  }, [vehicle]);

  const isPHEV = vehicle.fuelType === 'Plug-in Hybrid (PHEV)';
  const isBEV = vehicle.fuelType.includes('Elettrica') || vehicle.fuelType.includes('BEV');
  const fuelUnit = isBEV ? 'kWh' : (vehicle.fuelType === 'Metano' ? 'Kg' : 'L');

  // Consumption & Cost Metrics
  const metrics = useMemo(() => {
    return calculateVehicleConsumptionMetrics(vehicle);
  }, [vehicle]);

  // Consigli AI sintetici
  const aiAdvices = useMemo((): AIAdvice[] => {
    const list: AIAdvice[] = [];
    if (currentKm >= 80000 && currentKm <= 135000) {
      list.push({
        id: 'dist',
        title: 'Controllo Cinghia Distribuzione',
        urgency: currentKm > 100000 ? 'high' : 'medium',
        desc: `Chilometraggio elevato (${currentKm.toLocaleString('it-IT')} km). Verifica cinghia e pompa acqua.`
      });
    }
    if ((vehicle.fuelType || '').toLowerCase().includes('diesel') && currentKm >= 110000) {
      list.push({
        id: 'fap',
        title: 'Filtro DPF / Antiparticolato',
        urgency: 'high',
        desc: 'Verifica stato rigenerazioni periodiche del filtro antiparticolato.'
      });
    }
    return list;
  }, [vehicle, currentKm]);

  return (
    <div className="w-full max-w-6xl mx-auto p-3.5 sm:p-6 flex flex-col gap-4 pb-20 font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* 1. TESTATA VEICOLO COMPATTA ED ELEGANTE */}
      <section className="bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5">
        
        {/* Foto Veicolo con cambio rapido */}
        <div 
          onClick={onOpenEditCar}
          className="w-full sm:w-48 h-36 sm:h-32 rounded-2xl bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center relative cursor-pointer group border border-slate-200"
          title="Modifica dati veicolo"
        >
          {vehicle.photoUrl ? (
            <>
              <img 
                src={vehicle.photoUrl} 
                alt={`${vehicle.brand} ${vehicle.model}`} 
                className="w-full h-full object-cover group-hover:scale-103 transition-transform"
                onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
              />
              <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
                <Camera className="w-3.5 h-3.5" />
                <span>Modifica</span>
              </div>
            </>
          ) : (
            vehicle.vehicleType === 'moto' ? (
              <Bike className="w-10 h-10 text-slate-300" />
            ) : (
              <Car className="w-10 h-10 text-slate-300" />
            )
          )}
        </div>

        {/* Info Principali */}
        <div className="flex-1 min-w-0 flex flex-col gap-1.5 w-full">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight truncate">
                  {vehicle.brand} {vehicle.model}
                </h1>
                {vehicle.vehicleType === 'moto' && (
                  <span className="text-[10px] bg-slate-900 text-white font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1">
                    <Bike className="w-3 h-3" />
                    <span>Moto</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {vehicle.motorization || 'Di serie'} • Anno {vehicle.registrationDate?.split('-')[0] || 'N/D'}
              </p>
            </div>

            {/* Targa & VIN */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 inline-flex items-center gap-1.5 font-mono text-xs font-bold shadow-2xs">
                <span className="bg-blue-600 text-white text-[8px] px-1 py-0.2 rounded-[2px]">IT</span>
                <span className="tracking-wider">{vehicle.plate}</span>
              </div>

              {vehicle.vin && (
                <button
                  type="button"
                  onClick={() => handleCopyVin(vehicle.vin!)}
                  className="bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg px-2 py-1 text-xs font-mono font-semibold inline-flex items-center gap-1 transition-all cursor-pointer"
                  title="Copia codice telaio"
                >
                  <span className="text-[9px] font-sans text-slate-400 font-bold uppercase">VIN</span>
                  <span>{formatVinForDisplay(vehicle.vin)}</span>
                  {copiedVin ? <Check className="w-3 h-3 text-emerald-600 stroke-[3]" /> : <Copy className="w-3 h-3 text-slate-400" />}
                </button>
              )}
            </div>
          </div>

          {/* Indicatori Rapidi */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-xs">
            <div className="bg-slate-50 px-2.5 py-1.5 rounded-xl">
              <span className="text-[9px] font-bold uppercase text-slate-400 block">Chilometri</span>
              <span className="font-extrabold text-slate-900 text-xs mt-0.5 block">{currentKm.toLocaleString('it-IT')} km</span>
            </div>
            <div className="bg-slate-50 px-2.5 py-1.5 rounded-xl">
              <span className="text-[9px] font-bold uppercase text-slate-400 block">Alimentazione</span>
              <span className="font-extrabold text-slate-900 text-xs mt-0.5 block truncate">{vehicle.fuelType}</span>
            </div>
            <div className="bg-slate-50 px-2.5 py-1.5 rounded-xl">
              <span className="text-[9px] font-bold uppercase text-slate-400 block">Capacità</span>
              <span className="font-extrabold text-slate-900 text-xs mt-0.5 block">
                {isBEV ? `${vehicle.batteryCapacity || '--'} kWh` : `${vehicle.tankCapacity || '--'} L`}
              </span>
            </div>
            <div className="bg-slate-50 px-2.5 py-1.5 rounded-xl">
              <span className="text-[9px] font-bold uppercase text-slate-400 block">Potenza</span>
              <span className="font-extrabold text-slate-900 text-xs mt-0.5 block">
                {vehicle.powerCv ? `${vehicle.powerCv} CV` : (vehicle.registrationDate?.split('-')[0] || 'N/D')}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. BARRA NAVIGAZIONE SCHEDE */}
      <section className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200/80 text-xs font-bold">
        <button
          type="button"
          onClick={() => setMainTab('overview')}
          className={`flex-1 py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            mainTab === 'overview'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Receipt className="w-3.5 h-3.5 text-indigo-600" />
          <span>Panoramica & Spese</span>
        </button>

        <button
          type="button"
          onClick={() => setMainTab('documents')}
          className={`flex-1 py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            mainTab === 'documents'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className="w-3.5 h-3.5 text-indigo-600" />
          <span>Documenti & Scadenze</span>
          {(vehicle.documents?.length || 0) > 0 && (
            <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-1.5 py-0.2 rounded-full">
              {vehicle.documents?.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setMainTab('ai')}
          className={`flex-1 py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            mainTab === 'ai'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Assistente & Manuale</span>
        </button>
      </section>

      {/* TAB 1: PANORAMICA & REGISTRI (SNELLA, MODERNA E DIRETTA) */}
      {mainTab === 'overview' && (
        <div className="flex flex-col gap-4 animate-in fade-in duration-150">
          
          {/* Pulsanti Azione Rapida */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => onOpenAddRefuel(isPHEV ? 'fuel' : undefined)}
              className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs sm:text-sm py-3 px-4 rounded-2xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isBEV ? <Zap className="w-4 h-4 text-amber-300" /> : <Fuel className="w-4 h-4 text-blue-100" />}
              <span>{isBEV ? 'Registra Ricarica' : 'Registra Rifornimento'}</span>
            </button>

            <button
              onClick={onOpenAddMaintenance}
              className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs sm:text-sm py-3 px-4 rounded-2xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Wrench className="w-4 h-4 text-emerald-100" />
              <span>Registra Tagliando / Manutenzione</span>
            </button>
          </div>

          {/* Riepilogo Spese e Consumi Diretto */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <span className="text-xs font-black uppercase text-slate-900 tracking-wider">
                Riepilogo Spese & Consumi
              </span>
              <span className="text-xs font-semibold text-slate-500">
                Percorsi: {metrics.totalDistance.toLocaleString('it-IT')} km
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-slate-50 p-3 rounded-2xl">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Spesa Totale</span>
                <span className="text-xl font-black text-slate-900 mt-1 block">
                  {settings.currency} {metrics.totalOverallSpent.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="text-[11px] text-slate-500 mt-0.5 block">
                  {metrics.costPerKm} {settings.currency}/km
                </span>
              </div>

              <div 
                onClick={() => setIsRefuelsRegistryOpen(true)}
                className="bg-blue-50/60 hover:bg-blue-50 p-3 rounded-2xl transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-blue-700 block">Carburante</span>
                  <span className="text-[10px] font-bold text-blue-600">Registro →</span>
                </div>
                <span className="text-xl font-black text-blue-700 mt-1 block">
                  {settings.currency} {metrics.totalFuelSpent.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="text-[11px] text-blue-600 mt-0.5 block">
                  {metrics.unitPer100Km !== '--' ? `${metrics.unitPer100Km} ${fuelUnit}/100km` : `${(vehicle.refuels || []).length} rifornimenti`}
                </span>
              </div>

              <div 
                onClick={() => setIsMaintenancesRegistryOpen(true)}
                className="bg-emerald-50/60 hover:bg-emerald-50 p-3 rounded-2xl transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-emerald-800 block">Manutenzioni</span>
                  <span className="text-[10px] font-bold text-emerald-700">Registro →</span>
                </div>
                <span className="text-xl font-black text-emerald-800 mt-1 block">
                  {settings.currency} {metrics.totalMaintSpent.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="text-[11px] text-emerald-700 mt-0.5 block">
                  {(vehicle.maintenances || []).length} interventi registrati
                </span>
              </div>
            </div>

            {/* Cicli Pieno-Pieno (se disponibili) */}
            {metrics.boardTrips.length > 0 && (
              <div 
                onClick={() => setIsBoardTripsModalOpen(true)}
                className="mt-3 p-3 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between gap-3 text-xs cursor-pointer hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span className="font-semibold text-slate-700">
                    {metrics.boardTrips.length} Cicli Pieno-Pieno calcolati: media <strong>{metrics.kmPerUnit} km/{fuelUnit}</strong>
                  </span>
                </div>
                <span className="text-indigo-600 font-bold flex items-center gap-0.5">
                  Vedi dettagli <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            )}
          </div>

          {/* SEZIONE STORICO MOVIMENTI (CON TOGGLE TRA RIFORNIMENTI E MANUTENZIONI) */}
          <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-2xs">
            <div className="p-3.5 sm:p-4 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setActiveRegistryTab('refuels')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeRegistryTab === 'refuels'
                      ? 'bg-slate-900 text-white'
                      : 'bg-white text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Ultimi Rifornimenti ({vehicle.refuels?.length || 0})
                </button>

                <button
                  type="button"
                  onClick={() => setActiveRegistryTab('maintenances')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeRegistryTab === 'maintenances'
                      ? 'bg-slate-900 text-white'
                      : 'bg-white text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Ultime Manutenzioni ({vehicle.maintenances?.length || 0})
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (activeRegistryTab === 'refuels') setIsRefuelsRegistryOpen(true);
                  else setIsMaintenancesRegistryOpen(true);
                }}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5 cursor-pointer"
              >
                <span>Registro completo</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-3 sm:p-4 flex flex-col gap-2">
              {activeRegistryTab === 'refuels' ? (
                (vehicle.refuels || []).length === 0 ? (
                  <div className="py-6 text-center text-slate-400 text-xs">
                    Nessun rifornimento registrato finora.
                  </div>
                ) : (
                  metrics.calculatedRefuels.slice(0, 4).map((refuel) => (
                    <div
                      key={refuel.id}
                      onClick={() => setSelectedDetailData({ type: 'refuel', item: refuel, deltaKm: refuel.deltaKm, unitPrice: refuel.unitPrice })}
                      className="p-3 bg-slate-50/70 hover:bg-blue-50/50 border border-slate-200/70 rounded-2xl flex items-center justify-between gap-3 transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                          <Fuel className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-900">{refuel.date}</span>
                            <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-semibold">
                              {refuel.type === 'full' ? 'Pieno' : 'Parziale'}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-500">{Number(refuel.km).toLocaleString('it-IT')} km</span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-black text-slate-900 block">
                          {settings.currency} {Number(refuel.price).toFixed(2)}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {refuel.quantity} {refuel.unit || fuelUnit}
                        </span>
                      </div>
                    </div>
                  ))
                )
              ) : (
                (vehicle.maintenances || []).length === 0 ? (
                  <div className="py-6 text-center text-slate-400 text-xs">
                    Nessun intervento registrato finora.
                  </div>
                ) : (
                  (vehicle.maintenances || []).slice(0, 4).map((maint) => (
                    <div
                      key={maint.id}
                      onClick={() => setSelectedDetailData({ type: 'maintenance', item: maint })}
                      className="p-3 bg-slate-50/70 hover:bg-emerald-50/50 border border-slate-200/70 rounded-2xl flex items-center justify-between gap-3 transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                          <Wrench className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-900">{maint.date}</span>
                            <span className="text-[10px] bg-emerald-100 text-emerald-900 px-1.5 py-0.2 rounded font-semibold">
                              {maint.category || 'Tagliando'}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-500">{Number(maint.km).toLocaleString('it-IT')} km</span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-black text-emerald-700 block">
                          {settings.currency} {Number(maint.cost).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))
                )
              )}
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: DOCUMENTI */}
      {mainTab === 'documents' && (
        <div className="animate-in fade-in duration-150">
          <CarDocumentsVault 
            vehicle={vehicle} 
            onUpdateVehicle={onUpdateVehicle || (() => {})} 
          />
        </div>
      )}

      {/* TAB 3: ASSISTENTE & MANUALE */}
      {mainTab === 'ai' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {aiAdvices.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl flex flex-col gap-2">
              <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-600" />
                Avvisi di Manutenzione Consigliata
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {aiAdvices.map((adv) => (
                  <div key={adv.id} className="bg-white p-2.5 rounded-xl border border-amber-200 text-xs">
                    <span className="font-bold text-slate-900 block">{adv.title}</span>
                    <span className="text-slate-600 text-[11px] mt-0.5 block">{adv.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <CarAIAssistant 
            vehicle={vehicle} 
            onUpdateVehicle={onUpdateVehicle || (() => {})} 
          />
        </div>
      )}

      {/* MODALI ESISTENTI */}
      <BoardTripsModal
        isOpen={isBoardTripsModalOpen}
        onClose={() => setIsBoardTripsModalOpen(false)}
        vehicle={vehicle}
        metrics={metrics}
        settings={settings}
        onUpdateVehicle={onUpdateVehicle}
      />

      <RefuelsRegistryModal
        isOpen={isRefuelsRegistryOpen}
        onClose={() => setIsRefuelsRegistryOpen(false)}
        vehicle={vehicle}
        metrics={metrics}
        settings={settings}
        onOpenAddRefuel={onOpenAddRefuel}
        onOpenEditRefuel={onOpenEditRefuel}
        onSelectRefuelDetail={(r) => {
          setSelectedDetailData({ 
            type: 'refuel', 
            item: r, 
            deltaKm: (r as any).deltaKm, 
            unitPrice: (r as any).unitPrice 
          });
        }}
      />

      <MaintenancesRegistryModal
        isOpen={isMaintenancesRegistryOpen}
        onClose={() => setIsMaintenancesRegistryOpen(false)}
        vehicle={vehicle}
        settings={settings}
        onOpenAddMaintenance={onOpenAddMaintenance}
        onOpenEditMaintenance={onOpenEditMaintenance}
        onSelectMaintenanceDetail={(m) => {
          setSelectedDetailData({ 
            type: 'maintenance', 
            item: m 
          });
        }}
      />

      <DetailViewModal
        isOpen={!!selectedDetailData}
        data={selectedDetailData}
        vehicle={vehicle}
        settings={settings}
        onClose={() => setSelectedDetailData(null)}
        onEditRefuel={(r) => {
          setSelectedDetailData(null);
          onOpenEditRefuel(r);
        }}
        onEditMaintenance={(m) => {
          setSelectedDetailData(null);
          onOpenEditMaintenance(m);
        }}
      />

    </div>
  );
};
