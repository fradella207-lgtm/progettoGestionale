import React, { useState, useMemo, useEffect } from 'react';
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
  Check,
  FileText,
  Warehouse,
  ShieldCheck,
  BookOpen
} from 'lucide-react';
import { Vehicle, RefuelRecord, MaintenanceRecord, AIAdvice, AppSettings, EnergySourceType } from '../types';
import { DetailViewModal, DetailModalData } from './modals/DetailViewModal';
import { BoardTripsModal } from './modals/BoardTripsModal';
import { RefuelsRegistryModal } from './modals/RefuelsRegistryModal';
import { MaintenancesRegistryModal } from './modals/MaintenancesRegistryModal';
import { calculateVehicleConsumptionMetrics, RefuelWithCalculation } from '../utils/consumptionCalculator';
import { CarTechnicalSpecs } from './CarTechnicalSpecs';
import { CarDocumentsVault } from './CarDocumentsVault';
import { CarAIAssistant } from './CarAIAssistant';

interface VehicleDetailProps {
  vehicle: Vehicle;
  vehicles?: Vehicle[];
  settings: AppSettings;
  initialTab?: 'overview' | 'specs' | 'documents' | 'ai';
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
  vehicles,
  settings,
  initialTab = 'overview',
  onSelectVehicle,
  onBackToGarage,
  onUpdateVehicle,
  onOpenEditCar,
  onOpenAddRefuel,
  onOpenEditRefuel,
  onOpenAddMaintenance,
  onOpenEditMaintenance,
  onOpenFixTank
}) => {
  const [mainTab, setMainTab] = useState<'overview' | 'specs' | 'documents' | 'ai'>(initialTab || 'overview');

  useEffect(() => {
    if (initialTab) {
      setMainTab(initialTab);
    }
  }, [initialTab]);
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
      
      {/* 0. VEHICLE FLEET QUICK SWITCHER BAR */}
      {vehicles && vehicles.length > 0 && (
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-0.5 scrollbar-none">
          <div className="flex items-center gap-1.5 min-w-0">
            {onBackToGarage && (
              <button
                type="button"
                onClick={onBackToGarage}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 text-xs font-bold border border-slate-200 transition-all cursor-pointer shrink-0 shadow-2xs group"
                title="Torna alla vista Flotta Garage"
              >
                <Warehouse className="w-3.5 h-3.5 text-indigo-600 group-hover:-translate-x-0.5 transition-transform" />
                <span>Garage ({vehicles.length})</span>
              </button>
            )}
            {vehicles.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => onSelectVehicle && onSelectVehicle(v.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer border ${
                  v.id === vehicle.id
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs font-black'
                    : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
                }`}
              >
                <Car className="w-3 h-3" />
                <span>{v.brand} {v.model}</span>
                <span className={`text-[9.5px] font-mono px-1 py-0.2 rounded font-black ${
                  v.id === vehicle.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  {v.plate}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 1. VEICOLO COMPACT HEADER - Minimal, Lightweight & Ergonomic */}
      <section className="bg-white rounded-2xl border border-slate-200/90 p-3.5 sm:p-4 shadow-2xs flex flex-col gap-3 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0">
          
          {/* Left: Thumbnail & Identity */}
          <div className="flex items-center gap-3 min-w-0">
            {/* Compact Photo Thumbnail or Avatar */}
            <div 
              onClick={onOpenEditCar}
              className="w-16 h-12 sm:w-20 sm:h-14 rounded-xl bg-slate-900 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center relative cursor-pointer group shadow-2xs"
              title="Clicca per modificare foto o dati"
            >
              {vehicle.photoUrl ? (
                <>
                  <img 
                    src={vehicle.photoUrl} 
                    alt={`${vehicle.brand} ${vehicle.model}`} 
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Camera className="w-3.5 h-3.5 text-white" />
                  </div>
                </>
              ) : (
                <Car className="w-6 h-6 text-slate-400 group-hover:text-white transition-colors" />
              )}
            </div>

            {/* Vehicle Title & License Plate */}
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-950 tracking-tight truncate">
                  {vehicle.brand} <span className="text-theme-primary">{vehicle.model}</span>
                </h2>
                
                {/* European License Plate - Compact */}
                <div className="bg-white border border-slate-300 rounded-md px-2 py-0.5 shadow-2xs inline-flex items-center gap-1 shrink-0 select-none">
                  <span className="bg-blue-600 text-white text-[7px] font-black px-1 py-0.2 rounded-[2px]">IT</span>
                  <span className="text-xs font-mono font-bold tracking-[1.5px] text-slate-950 uppercase">{vehicle.plate}</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 mt-0.5 text-xs text-slate-500 font-medium truncate">
                {vehicle.motorization && <span>{vehicle.motorization}</span>}
                {vehicle.technicalSpecs?.euroClass && (
                  <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-1.5 py-0.2 rounded border border-emerald-200/60">
                    {vehicle.technicalSpecs.euroClass}
                  </span>
                )}
                <span>• Anno {vehicle.registrationDate ? vehicle.registrationDate.split('-')[0] : 'N/D'}</span>
              </div>
            </div>
          </div>

          {/* Right: Clean Unified Actions (No duplicate commands) */}
          <div className="flex items-center gap-1.5 self-start sm:self-center shrink-0">
            <button 
              id="btn-header-add-refuel"
              type="button"
              onClick={() => onOpenAddRefuel(isPHEV ? 'fuel' : undefined)}
              className="bg-theme-primary hover:bg-theme-primary-hover active:scale-95 text-white text-xs font-bold px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isBEV ? 'Ricarica' : 'Rifornimento'}</span>
            </button>

            <button 
              id="btn-header-add-maint"
              type="button"
              onClick={onOpenAddMaintenance}
              className="bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 text-xs font-bold px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 border border-slate-200 cursor-pointer"
            >
              <Wrench className="w-3.5 h-3.5 text-slate-600" />
              <span>Tagliando</span>
            </button>

            <button 
              id="btn-edit-car-profile"
              type="button"
              onClick={onOpenEditCar}
              className="bg-white hover:bg-slate-50 active:scale-95 text-slate-700 border border-slate-200 text-xs font-bold px-2.5 py-2 rounded-xl transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
              title="Modifica dati del veicolo"
            >
              <Edit3 className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden xs:inline">Modifica</span>
            </button>
          </div>
        </div>

        {/* Compact Technical Specs Strip - Renamed "Odometro" to "Chilometraggio" */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-left">
          {/* Chilometraggio (Changed from Odometro) */}
          <div className="bg-slate-50/80 px-2.5 py-1.5 rounded-xl border border-slate-200/60 min-w-0">
            <span className="text-[9px] uppercase font-bold text-slate-400 flex items-center gap-1 truncate">
              <Gauge className="w-2.5 h-2.5 text-theme-primary shrink-0" /> Chilometraggio
            </span>
            <span className="text-xs font-extrabold text-slate-900 truncate block mt-0.5">
              {currentKm.toLocaleString('it-IT')} km
            </span>
          </div>

          {/* Alimentazione */}
          <div className="bg-slate-50/80 px-2.5 py-1.5 rounded-xl border border-slate-200/60 min-w-0">
            <span className="text-[9px] uppercase font-bold text-slate-400 flex items-center gap-1 truncate">
              {isPHEV || isBEV ? <Zap className="w-2.5 h-2.5 text-amber-500 shrink-0" /> : <Fuel className="w-2.5 h-2.5 text-theme-primary shrink-0" />} Alimentazione
            </span>
            <span className="text-xs font-extrabold text-slate-900 truncate block mt-0.5" title={vehicle.fuelType}>
              {vehicle.fuelType}
            </span>
          </div>

          {/* Capacità Serbatoio / Batteria */}
          <div className="bg-slate-50/80 px-2.5 py-1.5 rounded-xl border border-slate-200/60 min-w-0">
            <span className="text-[9px] uppercase font-bold text-slate-400 truncate block">
              {isPHEV ? 'Serbatoio + Batt.' : (isBEV ? 'Batteria' : 'Serbatoio')}
            </span>
            <span className="text-xs font-extrabold text-slate-900 truncate block mt-0.5">
              {isPHEV
                ? `${vehicle.tankCapacity}L + ${vehicle.batteryCapacity || 13}kWh` 
                : (isBEV 
                  ? `${vehicle.batteryCapacity || vehicle.tankCapacity || '--'} kWh` 
                  : `${vehicle.tankCapacity || '--'} L`)}
            </span>
          </div>

          {/* Potenza / Anno */}
          <div className="bg-slate-50/80 px-2.5 py-1.5 rounded-xl border border-slate-200/60 min-w-0">
            <span className="text-[9px] uppercase font-bold text-slate-400 flex items-center gap-1 truncate">
              <Calendar className="w-2.5 h-2.5 text-slate-400 shrink-0" /> {vehicle.powerCv ? 'Potenza' : 'Immatricolazione'}
            </span>
            <span className="text-xs font-extrabold text-slate-900 truncate block mt-0.5">
              {vehicle.powerCv ? `${vehicle.powerCv} CV (${vehicle.powerKw || Math.round(vehicle.powerCv/1.36)} kW)` : (vehicle.registrationDate ? vehicle.registrationDate.split('-')[0] : 'N/D')}
            </span>
          </div>
        </div>
      </section>

      {/* 2. UNIFIED TABS BAR: PANORAMICA & REGISTRI | SCHEDA TECNICA | DOCUMENTI DUC | ASSISTENTE AI & MANUALE */}
      <section className="bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/90 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => setMainTab('overview')}
          className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            mainTab === 'overview'
              ? 'bg-white text-slate-900 shadow-xs border border-slate-200 font-black'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <Receipt className="w-3.5 h-3.5 text-indigo-600" />
          <span>Panoramica & Registri</span>
        </button>

        <button
          type="button"
          onClick={() => setMainTab('specs')}
          className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            mainTab === 'specs'
              ? 'bg-white text-slate-900 shadow-xs border border-slate-200 font-black'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <Gauge className="w-3.5 h-3.5 text-indigo-600" />
          <span>Scheda Tecnica</span>
          {vehicle.technicalSpecs && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setMainTab('documents')}
          className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            mainTab === 'documents'
              ? 'bg-white text-slate-900 shadow-xs border border-slate-200 font-black'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <FileText className="w-3.5 h-3.5 text-indigo-600" />
          <span>Documenti DUC</span>
          {(vehicle.documents?.length || 0) > 0 && (
            <span className="text-[10px] bg-indigo-100 text-indigo-800 font-black px-1.5 py-0.2 rounded-full">
              {vehicle.documents?.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setMainTab('ai')}
          className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            mainTab === 'ai'
              ? 'bg-white text-slate-900 shadow-xs border border-slate-200 font-black'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Assistente AI & Manuale</span>
        </button>
      </section>

      {/* CONDITIONAL TAB CONTENT */}
      {mainTab === 'overview' && (
        <>
          {/* 3. SPESE TOTALI & CONSUMI ENERGETICI (INCLUSO CONSUMO PARTE ELETTRICA PER PLUG-IN & TRIP DI BORDO) */}
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
                Documenti →
              </span>
            </div>
            <p className="text-[11px] text-[#64748b]">
              {(vehicle.maintenances || []).length === 0 ? 'Nessun intervento registrato' : 'Tagliandi e riparazioni officina'}
            </p>
          </div>

        </div>

        {/* INTERACTIVE BANNER: TRIP DI BORDO (SE PRESENTI PIENO-PIENO) - LIGHT & MINIMAL */}
        {metrics.boardTrips.length > 0 ? (
          <div 
            onClick={() => setIsBoardTripsModalOpen(true)}
            className="mt-1 bg-white border border-slate-200/80 hover:border-indigo-300 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs hover:shadow-xs transition-all duration-200 cursor-pointer group select-none"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform text-indigo-600">
                <Gauge className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs sm:text-sm font-extrabold text-slate-900 tracking-tight">
                    Computer di Bordo & Trip (Pieno-Pieno)
                  </span>
                  <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-bold px-2 py-0.2 rounded-md">
                    {metrics.boardTrips.length} {metrics.boardTrips.length === 1 ? 'Ciclo' : 'Cicli registrati'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Consumo medio certificato: <strong className="text-slate-800">{metrics.kmPerUnit} km/{fuelUnit}</strong> ({metrics.unitPer100Km} {fuelUnit}/100km) • Distanza monitorata: <strong className="text-slate-800">{metrics.boardTrips.reduce((acc, t) => acc + t.distanceKm, 0).toLocaleString('it-IT')} km</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 group-hover:bg-indigo-50 group-hover:text-indigo-700 rounded-xl text-xs font-bold text-slate-700 border border-slate-200/80 shrink-0 self-end sm:self-center transition-colors">
              <span>Grafico & Classificazione</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
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
                            {refuel.receiptPhoto && (
                              <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200/80 flex items-center gap-0.5" title="Scontrino allegato">
                                <Receipt className="w-2.5 h-2.5" />
                                <span>Foto</span>
                              </span>
                            )}
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

        {/* CARD B: REGISTRO MANUTENZIONI & OFFICINA */}
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
                    Registro Manutenzioni & Officina
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
                <span>Apri Registro</span>
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
                            {maint.documentPhoto && (
                              <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200/80 flex items-center gap-0.5" title="Documento / Fattura allegata">
                                <FileText className="w-2.5 h-2.5" />
                                <span>Fattura</span>
                              </span>
                            )}
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
              Vedi tutto lo storico ({(vehicle.maintenances || []).length}) →
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
        </>
      )}

      {/* TAB 2: SCHEDA TECNICA */}
      {mainTab === 'specs' && (
        <div className="animate-in fade-in duration-200">
          <CarTechnicalSpecs 
            vehicle={vehicle} 
            onUpdateVehicle={onUpdateVehicle || (() => {})} 
          />
        </div>
      )}

      {/* TAB 3: DOCUMENTI DUC & FATTURE */}
      {mainTab === 'documents' && (
        <div className="animate-in fade-in duration-200">
          <CarDocumentsVault 
            vehicle={vehicle} 
            onUpdateVehicle={onUpdateVehicle || (() => {})} 
          />
        </div>
      )}

      {/* TAB 4: ASSISTENTE AI & MANUALE */}
      {mainTab === 'ai' && (
        <div className="animate-in fade-in duration-200">
          <CarAIAssistant 
            vehicle={vehicle} 
            onUpdateVehicle={onUpdateVehicle || (() => {})} 
          />
        </div>
      )}

      {/* 6. MODALE DEDICATO: TRIP DI BORDO & EFFICIENZA ENERGETICA */}
      <BoardTripsModal
        isOpen={isBoardTripsModalOpen}
        onClose={() => setIsBoardTripsModalOpen(false)}
        vehicle={vehicle}
        metrics={metrics}
        settings={settings}
        onUpdateVehicle={onUpdateVehicle}
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

      {/* 8. MODALE DEDICATO: REGISTRO MANUTENZIONI & OFFICINA */}
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
