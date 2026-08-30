import React, { useState, useMemo } from 'react';
import { 
  Car, 
  Plus, 
  Fuel, 
  Wrench, 
  Edit3, 
  AlertTriangle, 
  Sparkles, 
  CheckCircle2, 
  Zap, 
  ChevronRight, 
  ChevronDown,
  Receipt, 
  Calendar, 
  Gauge, 
  Camera, 
  BatteryCharging, 
  Layers,
  ArrowRight,
  Filter,
  SlidersHorizontal,
  ChevronUp,
  Check
} from 'lucide-react';
import { Vehicle, RefuelRecord, MaintenanceRecord, AIAdvice, AppSettings, EnergySourceType } from '../types';
import { DetailViewModal, DetailModalData } from './modals/DetailViewModal';
import { BoardTripsModal } from './modals/BoardTripsModal';
import { RefuelsRegistryModal } from './modals/RefuelsRegistryModal';
import { MaintenancesRegistryModal } from './modals/MaintenancesRegistryModal';
import { calculateVehicleConsumptionMetrics, RefuelWithCalculation } from '../utils/consumptionCalculator';

interface VehicleDetailProps {
  vehicle: Vehicle;
  settings: AppSettings;
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
  onOpenEditCar,
  onOpenAddRefuel,
  onOpenEditRefuel,
  onOpenAddMaintenance,
  onOpenEditMaintenance,
  onOpenFixTank
}) => {
  const [activeTab, setActiveTab] = useState<'refuels' | 'maintenances'>('refuels');
  const [selectedDetailData, setSelectedDetailData] = useState<DetailModalData | null>(null);

  // Dedicated Modals for Registries and Board Trips
  const [isBoardTripsModalOpen, setIsBoardTripsModalOpen] = useState(false);
  const [isRefuelsRegistryOpen, setIsRefuelsRegistryOpen] = useState(false);
  const [isMaintenancesRegistryOpen, setIsMaintenancesRegistryOpen] = useState(false);

  // Accordion & View Controls for Refuels / Maintenances
  const [isSectionOpen, setIsSectionOpen] = useState(true);
  const [showAllRefuels, setShowAllRefuels] = useState(false);
  const [showAllMaintenances, setShowAllMaintenances] = useState(false);
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'compact' | 'grouped'>('compact');
  const [collapsedYears, setCollapsedYears] = useState<Record<string, boolean>>({});

  // Compute current km
  const currentKm = useMemo(() => {
    const refuelsKm = (vehicle.refuels || []).map(r => Number(r.km) || 0);
    const maintKm = (vehicle.maintenances || []).map(m => Number(m.km) || 0);
    return Math.max(Number(vehicle.initialKm) || 0, ...refuelsKm, ...maintKm);
  }, [vehicle]);

  const isPHEV = vehicle.fuelType === 'Plug-in Hybrid (PHEV)';
  const isBEV = vehicle.fuelType.includes('Elettrica') || vehicle.fuelType.includes('BEV');
  const isLPG = vehicle.fuelType.includes('GPL');
  const isCNG = vehicle.fuelType.includes('Metano');
  const fuelUnit = isBEV ? 'kWh' : (isCNG ? 'Kg' : 'L');

  // Metrological & Rigorous Consumption Metrics
  const metrics = useMemo(() => {
    return calculateVehicleConsumptionMetrics(vehicle);
  }, [vehicle]);

  // Extract available years for filtering
  const availableYears = useMemo(() => {
    const years = new Set<string>();
    (vehicle.refuels || []).forEach(r => {
      if (r.date) years.add(r.date.split('-')[0]);
    });
    (vehicle.maintenances || []).forEach(m => {
      if (m.date) years.add(m.date.split('-')[0]);
    });
    return Array.from(years).sort().reverse();
  }, [vehicle]);

  // Filtered Refuels
  const filteredRefuels = useMemo(() => {
    let list = metrics.calculatedRefuels;
    if (selectedYear !== 'all') {
      list = list.filter(r => r.date && r.date.startsWith(selectedYear));
    }
    return list;
  }, [metrics.calculatedRefuels, selectedYear]);

  // Grouped Refuels by Year
  const refuelsByYear = useMemo(() => {
    const groups: Record<string, RefuelWithCalculation[]> = {};
    filteredRefuels.forEach(r => {
      const year = r.date ? r.date.split('-')[0] : 'Altro';
      if (!groups[year]) groups[year] = [];
      groups[year].push(r);
    });
    return groups;
  }, [filteredRefuels]);

  // Filtered Maintenances
  const filteredMaintenances = useMemo(() => {
    let list = [...(vehicle.maintenances || [])].sort((a, b) => {
      const timeA = new Date(a.date).getTime();
      const timeB = new Date(b.date).getTime();
      if (timeA !== timeB) return timeB - timeA;
      return (Number(b.km) || 0) - (Number(a.km) || 0);
    });
    if (selectedYear !== 'all') {
      list = list.filter(m => m.date && m.date.startsWith(selectedYear));
    }
    return list;
  }, [vehicle.maintenances, selectedYear]);

  // Grouped Maintenances by Year
  const maintenancesByYear = useMemo(() => {
    const groups: Record<string, MaintenanceRecord[]> = {};
    filteredMaintenances.forEach(m => {
      const year = m.date ? m.date.split('-')[0] : 'Altro';
      if (!groups[year]) groups[year] = [];
      groups[year].push(m);
    });
    return groups;
  }, [filteredMaintenances]);

  const toggleYearCollapse = (year: string) => {
    setCollapsedYears(prev => ({ ...prev, [year]: !prev[year] }));
  };

  // AI Maintenance Advice Rule Engine
  const aiAdvices = useMemo((): AIAdvice[] => {
    const fuelType = (vehicle.fuelType || '').toLowerCase();
    const ageYears = (() => {
      if (!vehicle.registrationDate) return 0;
      const d = new Date(vehicle.registrationDate);
      return Math.max(0, (Date.now() - d.getTime()) / (1000 * 60 * 60 * 24 * 365.25));
    })();

    const list: AIAdvice[] = [];

    if (isPHEV) {
      list.push({
        id: 'phev_battery_care',
        title: 'Gestione Batteria di Trazione PHEV',
        urgency: 'ok',
        desc: `Batteria da ${vehicle.batteryCapacity || 13} kWh. Ricarica regolarmente per massimizzare il rendimento ibrido ed abbattere i consumi di carburante.`
      });
    }

    if (currentKm >= 80000 && currentKm <= 135000) {
      list.push({
        id: 'dist',
        title: 'Controllo Cinghia Distribuzione',
        urgency: currentKm > 100000 ? 'high' : 'medium',
        desc: `Chilometraggio critico (${currentKm.toLocaleString('it-IT')} km). Verificare kit cinghia e pompa acqua.`
      });
    }

    if (fuelType.includes('diesel') && currentKm >= 110000) {
      list.push({
        id: 'fap',
        title: 'Filtro Antiparticolato (FAP/DPF)',
        urgency: 'high',
        desc: 'Verificare contropressione scarico e stato rigenerazioni.'
      });
    }

    if (ageYears >= 4) {
      list.push({
        id: 'freni',
        title: 'Sostituzione Liquido Freni (DOT4)',
        urgency: ageYears >= 5 ? 'high' : 'medium',
        desc: `Veicolo di ${ageYears.toFixed(1)} anni. Si raccomanda spurgo e controllo umidità fluido.`
      });
    }

    if (list.length === 0) {
      list.push({
        id: 'standard',
        title: 'Manutenzione Regolare',
        urgency: 'ok',
        desc: 'Tutti i parametri rientrano nella norma. Segui i tagliandi ordinari previsti.'
      });
    }

    return list;
  }, [vehicle, currentKm, isPHEV]);

  return (
    <div className="w-full max-w-7xl mx-auto p-3.5 sm:p-6 lg:p-8 flex flex-col gap-4 sm:gap-6 pb-28 font-['Plus_Jakarta_Sans',sans-serif] overflow-x-hidden">
      
      {/* 1. VEICOLO SHOWCASE CON FOTO IN EVIDENZA E DETTAGLI */}
      <section className="bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-6 shadow-xs flex flex-col md:flex-row items-stretch md:items-center gap-4 sm:gap-6 min-w-0">
        
        {/* Large Prominent Vehicle Photo Showcase */}
        <div className="w-full md:w-64 lg:w-72 h-44 sm:h-48 md:h-40 rounded-2xl bg-slate-900 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center relative shadow-inner group">
          {vehicle.photoUrl ? (
            <>
              <img 
                src={vehicle.photoUrl} 
                alt={`${vehicle.brand} ${vehicle.model}`} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent pointer-events-none" />
              <button
                onClick={onOpenEditCar}
                className="absolute bottom-2.5 right-2.5 bg-slate-950/80 hover:bg-slate-950 active:scale-95 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 border border-white/20 transition-all shadow-xs cursor-pointer"
                title="Modifica foto veicolo"
              >
                <Camera className="w-3.5 h-3.5 text-indigo-400" />
                <span>Foto</span>
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center text-slate-400 gap-2 p-4 text-center">
              <div className="w-14 h-14 rounded-2xl bg-slate-800 shadow-2xs border border-slate-700 flex items-center justify-center text-slate-400">
                <Car className="w-8 h-8 stroke-[1.5] text-slate-400" />
              </div>
              <button
                onClick={onOpenEditCar}
                className="text-xs text-indigo-400 hover:underline font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Aggiungi Foto
              </button>
            </div>
          )}
        </div>

        {/* Vehicle Identity & Technical Specifications */}
        <div className="flex-1 flex flex-col justify-between gap-3.5 min-w-0">
          
          {/* Top Line: Brand, Model & European Plate */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0">
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="min-w-0">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-950 tracking-tight break-words">
                  {vehicle.brand} <span className="text-indigo-600">{vehicle.model}</span>
                </h2>
                <div className="flex flex-wrap items-center gap-1.5 mt-1">
                  {vehicle.motorization && (
                    <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200/60">
                      {vehicle.motorization}
                    </span>
                  )}
                  {vehicle.technicalSpecs?.engineCode && (
                    <span className="text-xs font-mono font-bold text-amber-900 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-lg">
                      Cod: {vehicle.technicalSpecs.engineCode}
                    </span>
                  )}
                  {vehicle.technicalSpecs?.euroClass && (
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-lg">
                      {vehicle.technicalSpecs.euroClass}
                    </span>
                  )}
                </div>
              </div>
              
              {/* Authentic European License Plate */}
              <div className="bg-white border-2 border-slate-300 rounded-lg px-2.5 py-0.5 shadow-2xs inline-flex items-center gap-1.5 shrink-0 select-none">
                <div className="bg-blue-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded flex items-center gap-0.5">
                  <span className="text-[7px]">★</span>
                  <span>IT</span>
                </div>
                <span className="text-sm font-mono font-black tracking-[2px] text-slate-950 uppercase whitespace-nowrap">
                  {vehicle.plate}
                </span>
                <div className="bg-blue-600 text-yellow-300 text-[8px] font-bold px-1 py-0.2 rounded hidden sm:block">
                  ●
                </div>
              </div>
            </div>

            {/* Edit Car Data Button */}
            <button 
              id="btn-edit-car-profile"
              onClick={onOpenEditCar}
              className="bg-slate-50 hover:bg-slate-100 active:scale-95 text-slate-900 border border-slate-200 text-xs font-bold px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-2xs shrink-0 cursor-pointer self-start sm:self-auto"
            >
              <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
              <span>Modifica</span>
            </button>
          </div>

          {/* Quick Technical Specs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            
            {/* Spec 1: Chilometri */}
            <div className="bg-slate-50 border border-slate-200/80 p-2.5 rounded-xl flex flex-col justify-center min-w-0">
              <span className="text-[10px] uppercase font-extrabold text-slate-400 flex items-center gap-1 truncate">
                <Gauge className="w-3 h-3 text-indigo-600 shrink-0" /> Odometro
              </span>
              <span className="text-xs sm:text-sm font-black text-slate-900 mt-0.5 truncate">
                {currentKm.toLocaleString('it-IT')} km
              </span>
            </div>

            {/* Spec 2: Alimentazione */}
            <div className="bg-slate-50 border border-slate-200/80 p-2.5 rounded-xl flex flex-col justify-center min-w-0">
              <span className="text-[10px] uppercase font-extrabold text-slate-400 flex items-center gap-1 truncate">
                {isPHEV || isBEV ? <Zap className="w-3 h-3 text-amber-500 shrink-0" /> : <Fuel className="w-3 h-3 text-indigo-600 shrink-0" />} Alimentazione
              </span>
              <span className="text-xs sm:text-sm font-black text-slate-900 mt-0.5 truncate" title={vehicle.fuelType}>
                {vehicle.fuelType}
              </span>
            </div>

            {/* Spec 3: Serbatoio / Batteria */}
            <div className="bg-slate-50 border border-slate-200/80 p-2.5 rounded-xl flex flex-col justify-center min-w-0">
              <span className="text-[10px] uppercase font-extrabold text-slate-400 truncate">
                {isPHEV ? 'Serbatoio + Batt.' : (isBEV ? 'Capacità Batteria' : 'Capienza Serb.')}
              </span>
              <span className="text-xs sm:text-sm font-black text-slate-900 mt-0.5 truncate" title={
                isPHEV
                  ? `${vehicle.tankCapacity}L + ${vehicle.batteryCapacity || 13} kWh` 
                  : (isBEV 
                    ? `${vehicle.batteryCapacity || vehicle.tankCapacity || '--'} kWh` 
                    : `${vehicle.tankCapacity || '--'} L`)
              }>
                {isPHEV
                  ? `${vehicle.tankCapacity}L + ${vehicle.batteryCapacity || 13} kWh` 
                  : (isBEV 
                    ? `${vehicle.batteryCapacity || vehicle.tankCapacity || '--'} kWh` 
                    : `${vehicle.tankCapacity || '--'} L`)}
              </span>
            </div>

            {/* Spec 4: Potenza / Anno */}
            <div className="bg-slate-50 border border-slate-200/80 p-2.5 rounded-xl flex flex-col justify-center min-w-0">
              <span className="text-[10px] uppercase font-extrabold text-slate-400 flex items-center gap-1 truncate">
                <Calendar className="w-3 h-3 text-slate-400 shrink-0" /> {vehicle.powerCv ? 'Potenza' : 'Anno'}
              </span>
              <span className="text-xs sm:text-sm font-black text-slate-900 mt-0.5 truncate">
                {vehicle.powerCv ? `${vehicle.powerCv} CV (${vehicle.powerKw || Math.round(vehicle.powerCv/1.36)} kW)` : (vehicle.registrationDate ? vehicle.registrationDate.split('-')[0] : 'N/D')}
              </span>
            </div>

          </div>

        </div>
      </section>

      {/* 2. SPESE TOTALI & CONSUMI ENERGETICI (INCLUSO CONSUMO PARTE ELETTRICA PER PLUG-IN & TRIP DI BORDO) */}
      <section className="bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-5 shadow-xs flex flex-col gap-4 min-w-0">
        
        {/* Header Sezione Statistiche */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-slate-100 pb-3 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <Receipt className="w-4 h-4 text-indigo-600 shrink-0" />
            <span className="text-xs font-black uppercase text-slate-900 tracking-wider truncate">
              Riepilogo Costi & Efficienza Energetica
            </span>
          </div>
          <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-lg self-start sm:self-auto shrink-0 border border-slate-200/70">
            Percorrenza: {metrics.totalDistance.toLocaleString('it-IT')} km
          </span>
        </div>

        {/* Griglia Metriche */}
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100 gap-4 md:gap-0 min-w-0">
          
          {/* Card 1: Spesa Totale di Gestione */}
          <div className="md:px-4 first:pl-0 flex flex-col justify-between min-w-0">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider truncate">
                Spesa Totale
              </span>
              <span className="font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md text-[11px] border border-slate-200/80 shrink-0">
                {metrics.costPerKm} {settings.currency}/km
              </span>
            </div>
            <div className="my-1.5">
              <span className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950 truncate block">
                {settings.currency} {metrics.totalOverallSpent.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Costo complessivo (Carburante + Manutenzioni)
            </p>
          </div>

          {/* Card 2: Carburante & Ricarica Elettrica (CON SUPPORTO PHEV / BEV / TERMICHE) */}
          <div 
            onClick={() => {
              if (metrics.boardTrips.length > 0) {
                setIsBoardTripsModalOpen(true);
              } else {
                setIsRefuelsRegistryOpen(true);
              }
            }}
            className="pt-3 md:pt-0 md:px-4 flex flex-col justify-between min-w-0 hover:bg-blue-50/50 p-2.5 rounded-2xl transition-colors cursor-pointer group"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 min-w-0">
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1.5 shrink-0">
                {isPHEV ? <Zap className="w-3.5 h-3.5 text-amber-500" /> : <Fuel className="w-3.5 h-3.5 text-blue-600" />}
                {isPHEV ? 'Carburante & Ricarica' : (isBEV ? 'Ricariche Elettriche' : 'Carburante')}
              </span>
              
              {/* Badge Consumi */}
              {isPHEV ? (
                <div className="flex flex-wrap items-center gap-1 text-[10px] font-extrabold">
                  <span className="bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded whitespace-nowrap">
                    ⚡ {metrics.electricKwhPer100Km} kWh/100km
                  </span>
                  <span className="bg-blue-100 text-blue-900 px-1.5 py-0.5 rounded whitespace-nowrap">
                    ⛽ {metrics.thermalLPer100Km} L/100km
                  </span>
                </div>
              ) : isBEV ? (
                <span className="font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded text-[11px] shrink-0 whitespace-nowrap">
                  ⚡ {metrics.unitPer100Km !== '--' ? `${metrics.unitPer100Km} kWh/100km` : `${(vehicle.refuels || []).length} ricariche`}
                </span>
              ) : (
                <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded text-[11px] shrink-0 whitespace-nowrap">
                  ⛽ {metrics.unitPer100Km !== '--' ? `${metrics.unitPer100Km} ${fuelUnit}/100km` : `${(vehicle.refuels || []).length} rifornimenti`}
                </span>
              )}
            </div>

            <div className="my-1.5 flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-black tracking-tight text-blue-600 truncate block">
                {settings.currency} {metrics.totalFuelSpent.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-[11px] font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:inline">
                {metrics.boardTrips.length > 0 ? 'Vedi Trip →' : 'Registro →'}
              </span>
            </div>

            {/* Dettaglio Consumo Parte Elettrica + Termica per Plug-in Hybrid */}
            {isPHEV ? (
              <div className="flex flex-col gap-1 text-[11px] text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-200/80 w-full min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <span className="font-bold text-amber-900 flex items-center gap-1 shrink-0">
                    ⚡ Elettrico ({metrics.electricRefuelsCount} ric.):
                  </span>
                  <span className="font-mono font-bold text-slate-800 text-right">
                    {metrics.totalElectricKwh.toFixed(1)} kWh <span className="text-slate-500 font-normal">({settings.currency}{metrics.totalElectricSpent.toFixed(2)})</span>
                  </span>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <span className="font-bold text-blue-900 flex items-center gap-1 shrink-0">
                    ⛽ Benzina ({metrics.thermalRefuelsCount} rif.):
                  </span>
                  <span className="font-mono font-bold text-slate-800 text-right">
                    {metrics.totalThermalLiters.toFixed(1)} L <span className="text-slate-500 font-normal">({settings.currency}{metrics.totalThermalSpent.toFixed(2)})</span>
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-[11px] text-[#64748b]">
                {(vehicle.refuels || []).length} rifornimenti registrati • Costo: {metrics.costPer100Km} {settings.currency}/100km
              </p>
            )}
          </div>

          {/* Card 3: Manutenzioni */}
          <div 
            onClick={() => setIsMaintenancesRegistryOpen(true)}
            className="pt-3 md:pt-0 md:px-4 last:pr-0 flex flex-col justify-between min-w-0 hover:bg-emerald-50/40 p-2 rounded-2xl transition-colors cursor-pointer group"
          >
            <div className="flex items-center justify-between gap-1">
              <span className="text-[10px] font-bold text-[#059669] uppercase tracking-wider flex items-center gap-1.5 truncate">
                <Wrench className="w-3.5 h-3.5 text-[#059669] shrink-0" /> Manutenzioni
              </span>
              <span className="font-bold text-[#059669] bg-emerald-50 px-2 py-0.5 rounded text-[11px] shrink-0">
                {(vehicle.maintenances || []).length} interventi
              </span>
            </div>
            <div className="my-1.5 flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-black tracking-tight text-[#059669] truncate block">
                {settings.currency} {metrics.totalMaintSpent.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-[11px] font-bold text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:inline">
                Libretto →
              </span>
            </div>
            <p className="text-[11px] text-[#64748b]">
              {(vehicle.maintenances || []).length === 0 ? 'Nessun intervento registrato' : 'Tagliandi e riparazioni officina'}
            </p>
          </div>

        </div>

        {/* INTERACTIVE BANNER: TRIP DI BORDO (SE PRESENTI PIENO-PIENO) */}
        {metrics.boardTrips.length > 0 ? (
          <div 
            onClick={() => setIsBoardTripsModalOpen(true)}
            className="mt-1 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer group select-none relative overflow-hidden"
          >
            <div className="flex items-center gap-3.5 min-w-0 relative z-10">
              <div className="w-11 h-11 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Gauge className="w-5 h-5 text-blue-200" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs sm:text-sm font-black text-white tracking-tight">
                    Andamento Trip di Bordo (Cicli Pieno-Pieno)
                  </span>
                  <span className="bg-blue-500 text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-2xs animate-pulse">
                    {metrics.boardTrips.length} {metrics.boardTrips.length === 1 ? 'Trip Disponibile' : 'Trip Disponibili'}
                  </span>
                </div>
                <p className="text-xs text-blue-200 mt-0.5">
                  Consumo medio certificato: <strong className="text-white">{metrics.kmPerUnit} km/{fuelUnit}</strong> ({metrics.unitPer100Km} {fuelUnit}/100km) • Distanza monitorata: <strong className="text-white">{metrics.boardTrips.reduce((acc, t) => acc + t.distanceKm, 0).toLocaleString('it-IT')} km</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 px-3 py-2 bg-white/15 group-hover:bg-white/25 rounded-xl text-xs font-black text-white shrink-0 self-end sm:self-center transition-colors">
              <span>Apri Analisi Trip</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 flex items-center justify-between gap-3 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <Gauge className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Registra almeno 2 rifornimenti completi ("Pieno") per attivare l'analisi automatica dei Trip di Bordo e l'andamento dei consumi.</span>
            </div>
          </div>
        )}
      </section>

      {/* 3. TASTI AZIONE: RIFORNIMENTO/RICARICA UNO SOPRA L'ALTRO, E DI FIANCO MANUTENZIONE */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-3.5 items-stretch min-w-0">
        
        {/* COLONNA SINISTRA: RIFORNIMENTO E/O RICARICA (UNO SOPRA L'ALTRO) */}
        {isPHEV ? (
          <div className="flex flex-col gap-2.5 justify-between">
            {/* 1. Tasto Rifornimento Benzina */}
            <button
              id="btn-main-add-refuel-fuel"
              onClick={() => onOpenAddRefuel('fuel')}
              className="bg-blue-600 hover:bg-blue-700 active:scale-98 text-white p-3.5 sm:p-4 rounded-2xl shadow-xs hover:shadow-md transition-all flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Fuel className="w-5 h-5 text-white" />
                </div>
                <div className="text-left min-w-0">
                  <span className="block text-sm sm:text-base font-extrabold tracking-tight truncate">
                    + Aggiungi Rifornimento Benzina
                  </span>
                  <span className="block text-[11px] text-blue-100 font-medium truncate">
                    Registra litri erogati, pieno e spesa carburante
                  </span>
                </div>
              </div>
              <div className="w-7 h-7 rounded-xl bg-white/15 flex items-center justify-center shrink-0 group-hover:translate-x-1 transition-transform ml-2">
                <Plus className="w-4 h-4" />
              </div>
            </button>

            {/* 2. Tasto Ricarica Elettrica (sotto al rifornimento) */}
            <button
              id="btn-main-add-refuel-electric"
              onClick={() => onOpenAddRefuel('electricity')}
              className="bg-amber-600 hover:bg-amber-700 active:scale-98 text-white p-3.5 sm:p-4 rounded-2xl shadow-xs hover:shadow-md transition-all flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div className="text-left min-w-0">
                  <span className="block text-sm sm:text-base font-extrabold tracking-tight truncate">
                    + Aggiungi Ricarica Elettrica
                  </span>
                  <span className="block text-[11px] text-amber-100 font-medium truncate">
                    Registra kWh batteria, colonnina o wallbox
                  </span>
                </div>
              </div>
              <div className="w-7 h-7 rounded-xl bg-white/15 flex items-center justify-center shrink-0 group-hover:translate-x-1 transition-transform ml-2">
                <Plus className="w-4 h-4" />
              </div>
            </button>
          </div>
        ) : isLPG || isCNG ? (
          <div className="flex flex-col gap-2.5 justify-between">
            {/* 1. Tasto Rifornimento Benzina */}
            <button
              id="btn-main-add-refuel-fuel"
              onClick={() => onOpenAddRefuel('fuel')}
              className="bg-blue-600 hover:bg-blue-700 active:scale-98 text-white p-3.5 sm:p-4 rounded-2xl shadow-xs hover:shadow-md transition-all flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Fuel className="w-5 h-5 text-white" />
                </div>
                <div className="text-left min-w-0">
                  <span className="block text-sm sm:text-base font-extrabold tracking-tight truncate">
                    + Aggiungi Rifornimento Benzina
                  </span>
                  <span className="block text-[11px] text-blue-100 font-medium truncate">
                    Registra litri erogati serbatoio benzina
                  </span>
                </div>
              </div>
              <div className="w-7 h-7 rounded-xl bg-white/15 flex items-center justify-center shrink-0 group-hover:translate-x-1 transition-transform ml-2">
                <Plus className="w-4 h-4" />
              </div>
            </button>

            {/* 2. Tasto Rifornimento Gas (GPL o Metano) */}
            <button
              id="btn-main-add-refuel-gas"
              onClick={() => onOpenAddRefuel(isLPG ? 'lpg' : 'cng')}
              className="bg-sky-600 hover:bg-sky-700 active:scale-98 text-white p-3.5 sm:p-4 rounded-2xl shadow-xs hover:shadow-md transition-all flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Fuel className="w-5 h-5 text-white" />
                </div>
                <div className="text-left min-w-0">
                  <span className="block text-sm sm:text-base font-extrabold tracking-tight truncate">
                    + Aggiungi Rifornimento {isLPG ? 'GPL' : 'Metano'}
                  </span>
                  <span className="block text-[11px] text-sky-100 font-medium truncate">
                    Registra erogazione {isLPG ? 'litri GPL' : 'Kg Metano'}
                  </span>
                </div>
              </div>
              <div className="w-7 h-7 rounded-xl bg-white/15 flex items-center justify-center shrink-0 group-hover:translate-x-1 transition-transform ml-2">
                <Plus className="w-4 h-4" />
              </div>
            </button>
          </div>
        ) : (
          <button
            id="btn-main-add-refuel"
            onClick={() => onOpenAddRefuel()}
            className="bg-blue-600 hover:bg-blue-700 active:scale-98 text-white p-4 sm:p-5 rounded-3xl shadow-xs hover:shadow-md transition-all flex items-center justify-between group cursor-pointer h-full min-h-[96px]"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                {isBEV ? <Zap className="w-6 h-6 text-white" /> : <Fuel className="w-6 h-6 text-white" />}
              </div>
              <div className="text-left min-w-0">
                <span className="block text-base font-extrabold tracking-tight truncate">
                  + Aggiungi {isBEV ? 'Ricarica' : 'Rifornimento'}
                </span>
                <span className="block text-xs text-blue-100 font-medium mt-0.5 truncate">
                  {isBEV ? 'Registra kWh erogati e spesa' : 'Registra litri erogati, pieno e spesa'}
                </span>
              </div>
            </div>
            <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center shrink-0 group-hover:translate-x-1 transition-transform ml-2">
              <Plus className="w-5 h-5" />
            </div>
          </button>
        )}

        {/* COLONNA DESTRA: MANUTENZIONE (A FIANCO) */}
        <button
          id="btn-main-add-maint"
          onClick={onOpenAddMaintenance}
          className={`bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white p-4 sm:p-5 rounded-3xl shadow-xs hover:shadow-md transition-all flex items-center justify-between group cursor-pointer ${
            isPHEV || isLPG || isCNG ? 'h-full min-h-[110px]' : 'h-full min-h-[96px]'
          }`}
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Wrench className="w-6 h-6 text-white" />
            </div>
            <div className="text-left min-w-0">
              <span className="block text-base font-extrabold tracking-tight truncate">
                + Aggiungi Manutenzione
              </span>
              <span className="block text-xs text-emerald-100 font-medium mt-0.5 truncate">
                Registra tagliando, ricambi o officina
              </span>
            </div>
          </div>
          <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center shrink-0 group-hover:translate-x-1 transition-transform ml-2">
            <Plus className="w-5 h-5" />
          </div>
        </button>
      </section>

      {/* AVVISO SERBATOIO SE MANCANTE */}
      {(!vehicle.tankCapacity || Number(vehicle.tankCapacity) <= 0) && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 px-4 py-3 rounded-2xl flex items-center justify-between gap-3 text-xs min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="truncate">Capienza serbatoio non impostata. Configurala per il calcolo dei consumi medi.</span>
          </div>
          <button 
            id="btn-fix-tank"
            onClick={onOpenFixTank}
            className="bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl shrink-0 transition-colors cursor-pointer"
          >
            Configura Serbatoio
          </button>
        </div>
      )}

      {/* 4. SEPARAZIONE REGISTRI: 2 SEZIONI PULITE, DISTINTE E MODALI DEDICATI */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4.5 min-w-0">
        
        {/* CARD A: REGISTRO RIFORNIMENTI & RICARICHE */}
        <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-2xs flex flex-col justify-between">
          
          <div>
            {/* Header Registro Rifornimenti */}
            <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-blue-50 border border-blue-200/80 text-blue-600 flex items-center justify-center shrink-0">
                  <Fuel className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    {isPHEV ? 'Registro Rifornimenti & Ricariche' : (isBEV ? 'Registro Ricariche Elettriche' : 'Registro Rifornimenti')}
                  </h3>
                  <span className="text-[11px] font-bold text-slate-400">
                    {(vehicle.refuels || []).length} registrazioni • {settings.currency} {metrics.totalFuelSpent.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsRefuelsRegistryOpen(true)}
                className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 active:scale-95 text-blue-700 border border-blue-200/80 rounded-xl text-xs font-black flex items-center gap-1 transition-all cursor-pointer"
              >
                <span>Apri Registro</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* List preview (recent 3 items) */}
            <div className="p-3 sm:p-4 flex flex-col gap-2">
              {(vehicle.refuels || []).length === 0 ? (
                <div className="py-8 text-center flex flex-col items-center justify-center gap-2 text-slate-400">
                  <Fuel className="w-8 h-8 text-slate-300" />
                  <p className="text-xs font-bold text-slate-600">Nessun rifornimento registrato</p>
                  <p className="text-[11px] text-slate-400">Registra il primo rifornimento per tracciare i consumi.</p>
                </div>
              ) : (
                metrics.calculatedRefuels.slice(0, 3).map((refuel) => {
                  const isElectric = refuel.energyType === 'electricity' || refuel.unit === 'kWh';
                  const unit = refuel.unit || fuelUnit;

                  return (
                    <div
                      key={refuel.id}
                      onClick={() => setSelectedDetailData({ type: 'refuel', item: refuel, deltaKm: refuel.deltaKm, unitPrice: refuel.unitPrice })}
                      className="p-3 bg-slate-50/70 hover:bg-blue-50/60 border border-slate-200/70 hover:border-blue-200 rounded-2xl flex items-center justify-between gap-3 transition-all cursor-pointer group active:scale-[0.99]"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                          isElectric ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {isElectric ? <Zap className="w-4 h-4" /> : <Fuel className="w-4 h-4" />}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-black text-slate-900">{refuel.date}</span>
                            <span className={`text-[9.5px] font-extrabold px-1.5 py-0.2 rounded-md ${
                              refuel.type === 'full' ? 'bg-blue-100 text-blue-800' : 'bg-slate-200 text-slate-700'
                            }`}>
                              {refuel.type === 'full' ? 'Pieno' : 'Parziale'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                            <span>{Number(refuel.km).toLocaleString('it-IT')} km</span>
                            {refuel.intervalConsumption && (
                              <span className="font-bold text-emerald-700">
                                • {refuel.intervalConsumption.formattedKmPerUnit} km/{unit}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0 flex items-center gap-2">
                        <div>
                          <span className="text-xs sm:text-sm font-black text-blue-700 block">
                            {settings.currency} {Number(refuel.price).toFixed(2)}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-400">
                            {refuel.quantity} {unit}
                          </span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Footer Card A */}
          <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400">
              Visualizzati gli ultimi {Math.min(3, (vehicle.refuels || []).length)} di {(vehicle.refuels || []).length}
            </span>
            <button
              type="button"
              onClick={() => setIsRefuelsRegistryOpen(true)}
              className="text-xs font-black text-blue-700 hover:text-blue-800 flex items-center gap-1 hover:underline cursor-pointer"
            >
              Vedi tutto lo storico ({metrics.calculatedRefuels.length}) →
            </button>
          </div>

        </div>

        {/* CARD B: LIBRETTO MANUTENZIONI & OFFICINA */}
        <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-2xs flex flex-col justify-between">
          
          <div>
            {/* Header Manutenzioni */}
            <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-emerald-700 flex items-center justify-center shrink-0">
                  <Wrench className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    Libretto Manutenzioni & Officina
                  </h3>
                  <span className="text-[11px] font-bold text-slate-400">
                    {(vehicle.maintenances || []).length} interventi • {settings.currency} {metrics.totalMaintSpent.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsMaintenancesRegistryOpen(true)}
                className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 active:scale-95 text-emerald-800 border border-emerald-200/80 rounded-xl text-xs font-black flex items-center gap-1 transition-all cursor-pointer"
              >
                <span>Apri Libretto</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* List preview (recent 3 items) */}
            <div className="p-3 sm:p-4 flex flex-col gap-2">
              {(vehicle.maintenances || []).length === 0 ? (
                <div className="py-8 text-center flex flex-col items-center justify-center gap-2 text-slate-400">
                  <Wrench className="w-8 h-8 text-slate-300" />
                  <p className="text-xs font-bold text-slate-600">Nessun intervento registrato</p>
                  <p className="text-[11px] text-slate-400">Registra tagliandi, pastiglie freni o interventi d'officina.</p>
                </div>
              ) : (
                (vehicle.maintenances || []).slice(0, 3).map((maint) => {
                  return (
                    <div
                      key={maint.id}
                      onClick={() => setSelectedDetailData({ type: 'maintenance', item: maint })}
                      className="p-3 bg-slate-50/70 hover:bg-emerald-50/60 border border-slate-200/70 hover:border-emerald-200 rounded-2xl flex items-center justify-between gap-3 transition-all cursor-pointer group active:scale-[0.99]"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                          <Wrench className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-black text-slate-900">{maint.date}</span>
                            <span className="text-[9.5px] font-extrabold px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-900 truncate max-w-[120px]">
                              {maint.category || 'Manutenzione'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5 truncate">
                            <span>{Number(maint.km).toLocaleString('it-IT')} km</span>
                            {maint.workshop && <span>• {maint.workshop}</span>}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0 flex items-center gap-2">
                        <div>
                          <span className="text-xs sm:text-sm font-black text-emerald-700 block">
                            {settings.currency} {Number(maint.cost).toFixed(2)}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-400">
                            Costo spesa
                          </span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Footer Card B */}
          <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400">
              Visualizzati gli ultimi {Math.min(3, (vehicle.maintenances || []).length)} di {(vehicle.maintenances || []).length}
            </span>
            <button
              type="button"
              onClick={() => setIsMaintenancesRegistryOpen(true)}
              className="text-xs font-black text-emerald-700 hover:text-emerald-800 flex items-center gap-1 hover:underline cursor-pointer"
            >
              Vedi tutto il libretto ({(vehicle.maintenances || []).length}) →
            </button>
          </div>

        </div>

      </section>

      {/* 5. SEZIONE DEDICATA: ASSISTENTE & CONSIGLI AI GARAGE */}
      <section className="bg-white rounded-3xl border border-slate-200/80 p-4 sm:p-5 shadow-2xs flex flex-col gap-3.5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                Consigli Intelligenti & Diagnostica Preventiva AI
              </h3>
              <p className="text-[11px] text-slate-500">
                Analisi predittiva in tempo reale basata su chilometraggio, anzianità e alimentazione ({vehicle.fuelType})
              </p>
            </div>
          </div>

          <span className="text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200/80 px-2.5 py-0.5 rounded-lg shrink-0">
            {aiAdvices.length} {aiAdvices.length === 1 ? 'consiglio' : 'consigli attivi'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {aiAdvices.map((advice) => (
            <div 
              key={advice.id}
              onClick={() => setSelectedDetailData({ type: 'advice', item: advice })}
              className={`p-3.5 sm:p-4 rounded-2xl border transition-all duration-150 flex items-start justify-between gap-3 shadow-2xs hover:shadow-xs cursor-pointer select-none active:scale-[0.99] ${
                advice.urgency === 'high' 
                  ? 'bg-red-50/70 border-red-200 hover:border-red-300' 
                  : advice.urgency === 'medium' 
                    ? 'bg-amber-50/70 border-amber-200 hover:border-amber-300' 
                    : 'bg-slate-50/70 border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                  advice.urgency === 'high' 
                    ? 'bg-red-100 text-red-700' 
                    : advice.urgency === 'medium' 
                      ? 'bg-amber-100 text-amber-800' 
                      : 'bg-blue-50 text-blue-600'
                }`}>
                  {advice.urgency === 'high' ? <AlertTriangle className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h4 className="text-xs sm:text-sm font-black text-slate-900">
                      {advice.title}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">
                    {advice.desc}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 self-center sm:self-start mt-0.5">
                <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-lg border whitespace-nowrap ${
                  advice.urgency === 'high' 
                    ? 'bg-red-100 text-red-800 border-red-200' 
                    : advice.urgency === 'medium' 
                      ? 'bg-amber-100 text-amber-800 border-amber-200' 
                      : 'bg-slate-100 text-slate-700 border-slate-200'
                }`}>
                  {advice.urgency === 'high' ? 'Urgente' : advice.urgency === 'medium' ? 'Consigliato' : 'Info'}
                </span>
                <div className="p-1 rounded-lg bg-white/80 text-slate-400">
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. MODALE DEDICATO: TRIP DI BORDO & EFFICIENZA ENERGETICA */}
      <BoardTripsModal
        isOpen={isBoardTripsModalOpen}
        onClose={() => setIsBoardTripsModalOpen(false)}
        vehicle={vehicle}
        metrics={metrics}
        settings={settings}
      />

      {/* 7. MODALE DEDICATO: REGISTRO RIFORNIMENTI & RICARICHE */}
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

      {/* 8. MODALE DEDICATO: LIBRETTO MANUTENZIONI & OFFICINA */}
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

      {/* 9. MODALE SCHERMATA COMPLETA PER DETTAGLI SINGOLO RECORD (OVERLAY IN PRIMO PIANO) */}
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
