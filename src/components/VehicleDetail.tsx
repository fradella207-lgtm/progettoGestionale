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
    <div className="w-full max-w-7xl mx-auto p-3 sm:p-6 lg:p-8 flex flex-col gap-4 sm:gap-5 font-['Plus_Jakarta_Sans',sans-serif] overflow-x-hidden">
      
      {/* 1. VEICOLO SHOWCASE CON FOTO IN EVIDENZA E DETTAGLI */}
      <section className="bg-white rounded-3xl border border-[#e2e8f0] p-4 sm:p-6 shadow-xs flex flex-col md:flex-row items-stretch md:items-center gap-4 sm:gap-6 min-w-0">
        
        {/* Large Prominent Vehicle Photo Showcase */}
        <div className="w-full md:w-64 lg:w-72 h-44 sm:h-48 md:h-40 rounded-2xl bg-gradient-to-br from-slate-100 via-slate-50 to-slate-200 border border-[#e2e8f0] overflow-hidden shrink-0 flex items-center justify-center relative shadow-inner group">
          {vehicle.photoUrl ? (
            <>
              <img 
                src={vehicle.photoUrl} 
                alt={`${vehicle.brand} ${vehicle.model}`} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
              />
              <button
                onClick={onOpenEditCar}
                className="absolute bottom-2.5 right-2.5 bg-black/60 hover:bg-black/80 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 opacity-90 transition-all shadow-xs cursor-pointer"
                title="Modifica foto veicolo"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Foto</span>
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center text-slate-400 gap-2 p-4 text-center">
              <div className="w-14 h-14 rounded-2xl bg-white shadow-2xs border border-[#e2e8f0] flex items-center justify-center text-slate-400">
                <Car className="w-8 h-8 stroke-[1.5] text-slate-500" />
              </div>
              <button
                onClick={onOpenEditCar}
                className="text-xs text-[#2563eb] hover:underline font-bold flex items-center gap-1"
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
                <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-[#0f172a] tracking-tight break-words">
                  {vehicle.brand} <span className="text-[#2563eb]">{vehicle.model}</span>
                </h2>
                <div className="flex flex-wrap items-center gap-1.5 mt-1">
                  {vehicle.motorization && (
                    <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                      {vehicle.motorization}
                    </span>
                  )}
                </div>
              </div>
              
              {/* Authentic European License Plate */}
              <div className="bg-white border-[2px] border-[#94a3b8] rounded-[6px] px-2.5 py-0.5 shadow-2xs inline-flex items-center gap-1.5 shrink-0 select-none">
                <div className="bg-[#1d4ed8] text-white text-[9px] font-black px-1 py-0.2 rounded-[2px] flex items-center gap-0.5">
                  <span className="text-[7px]">★</span>
                  <span>IT</span>
                </div>
                <span className="text-sm font-mono font-black tracking-[2px] text-[#0f172a] uppercase whitespace-nowrap">
                  {vehicle.plate}
                </span>
                <div className="bg-[#1d4ed8] text-yellow-300 text-[8px] font-bold px-0.8 py-0.2 rounded-[2px] hidden sm:block">
                  ●
                </div>
              </div>
            </div>

            {/* Edit Car Data Button */}
            <button 
              id="btn-edit-car-profile"
              onClick={onOpenEditCar}
              className="bg-[#f8fafc] hover:bg-slate-100 text-[#0f172a] border border-[#e2e8f0] text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shadow-2xs shrink-0 cursor-pointer self-start sm:self-auto"
            >
              <Edit3 className="w-3.5 h-3.5 text-[#2563eb]" />
              <span>Modifica</span>
            </button>
          </div>

          {/* Quick Technical Specs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            
            {/* Spec 1: Chilometri */}
            <div className="bg-[#f8fafc] border border-[#e2e8f0] p-2.5 rounded-xl flex flex-col justify-center min-w-0">
              <span className="text-[10px] uppercase font-bold text-[#64748b] flex items-center gap-1 truncate">
                <Gauge className="w-3 h-3 text-[#2563eb] shrink-0" /> Odometro
              </span>
              <span className="text-xs sm:text-sm font-black text-[#0f172a] mt-0.5 truncate">
                {currentKm.toLocaleString('it-IT')} km
              </span>
            </div>

            {/* Spec 2: Alimentazione */}
            <div className="bg-[#f8fafc] border border-[#e2e8f0] p-2.5 rounded-xl flex flex-col justify-center min-w-0">
              <span className="text-[10px] uppercase font-bold text-[#64748b] flex items-center gap-1 truncate">
                {isPHEV || isBEV ? <Zap className="w-3 h-3 text-amber-500 shrink-0" /> : <Fuel className="w-3 h-3 text-blue-600 shrink-0" />} Alimentazione
              </span>
              <span className="text-xs sm:text-sm font-black text-[#0f172a] mt-0.5 truncate" title={vehicle.fuelType}>
                {vehicle.fuelType}
              </span>
            </div>

            {/* Spec 3: Serbatoio / Batteria */}
            <div className="bg-[#f8fafc] border border-[#e2e8f0] p-2.5 rounded-xl flex flex-col justify-center min-w-0">
              <span className="text-[10px] uppercase font-bold text-[#64748b] truncate">
                {isPHEV ? 'Serbatoio + Batt.' : (isBEV ? 'Capacità Batteria' : 'Capienza Serb.')}
              </span>
              <span className="text-xs sm:text-sm font-black text-[#0f172a] mt-0.5 truncate" title={
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
            <div className="bg-[#f8fafc] border border-[#e2e8f0] p-2.5 rounded-xl flex flex-col justify-center min-w-0">
              <span className="text-[10px] uppercase font-bold text-[#64748b] flex items-center gap-1 truncate">
                <Calendar className="w-3 h-3 text-slate-400 shrink-0" /> {vehicle.powerCv ? 'Potenza' : 'Anno'}
              </span>
              <span className="text-xs sm:text-sm font-black text-[#0f172a] mt-0.5 truncate">
                {vehicle.powerCv ? `${vehicle.powerCv} CV (${vehicle.powerKw || Math.round(vehicle.powerCv/1.36)} kW)` : (vehicle.registrationDate ? vehicle.registrationDate.split('-')[0] : 'N/D')}
              </span>
            </div>

          </div>

        </div>
      </section>

      {/* 2. SPESE TOTALI & CONSUMI ENERGETICI (INCLUSO CONSUMO PARTE ELETTRICA PER PLUG-IN) */}
      <section className="bg-white rounded-3xl border border-[#e2e8f0] p-4 sm:p-5 shadow-xs flex flex-col gap-4 min-w-0">
        
        {/* Header Sezione Statistiche */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-[#f1f5f9] pb-3 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <Receipt className="w-4 h-4 text-[#2563eb] shrink-0" />
            <span className="text-xs font-black uppercase text-[#0f172a] tracking-wider truncate">
              Riepilogo Costi & Efficienza Energetica
            </span>
          </div>
          <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md self-start sm:self-auto shrink-0">
            Percorrenza: {metrics.totalDistance.toLocaleString('it-IT')} km
          </span>
        </div>

        {/* Griglia Metriche */}
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#f1f5f9] gap-4 md:gap-0 min-w-0">
          
          {/* Card 1: Spesa Totale di Gestione */}
          <div className="md:px-4 first:pl-0 flex flex-col justify-between min-w-0">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider truncate">
                Spesa Totale
              </span>
              <span className="font-bold text-[#0f172a] bg-[#f8fafc] px-2 py-0.5 rounded text-[11px] border border-[#e2e8f0] shrink-0">
                {metrics.costPerKm} {settings.currency}/km
              </span>
            </div>
            <div className="my-1.5">
              <span className="text-2xl sm:text-3xl font-black tracking-tight text-[#0f172a] truncate block">
                {settings.currency} {metrics.totalOverallSpent.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <p className="text-[11px] text-[#64748b]">
              Costo complessivo (Carburante + Manutenzioni)
            </p>
          </div>

          {/* Card 2: Carburante & Ricarica Elettrica (CON SUPPORTO PHEV / BEV / TERMICHE) */}
          <div className="pt-3 md:pt-0 md:px-4 flex flex-col justify-between min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 min-w-0">
              <span className="text-[10px] font-bold text-[#2563eb] uppercase tracking-wider flex items-center gap-1.5 shrink-0">
                {isPHEV ? <Zap className="w-3.5 h-3.5 text-amber-500" /> : <Fuel className="w-3.5 h-3.5 text-[#2563eb]" />}
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
                <span className="font-bold text-[#2563eb] bg-blue-50 px-2 py-0.5 rounded text-[11px] shrink-0 whitespace-nowrap">
                  ⛽ {metrics.unitPer100Km !== '--' ? `${metrics.unitPer100Km} ${fuelUnit}/100km` : `${(vehicle.refuels || []).length} rifornimenti`}
                </span>
              )}
            </div>

            <div className="my-1.5">
              <span className="text-2xl sm:text-3xl font-black tracking-tight text-[#2563eb] truncate block">
                {settings.currency} {metrics.totalFuelSpent.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
          <div className="pt-3 md:pt-0 md:px-4 last:pr-0 flex flex-col justify-between min-w-0">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[10px] font-bold text-[#059669] uppercase tracking-wider flex items-center gap-1.5 truncate">
                <Wrench className="w-3.5 h-3.5 text-[#059669] shrink-0" /> Manutenzioni
              </span>
              <span className="font-bold text-[#059669] bg-emerald-50 px-2 py-0.5 rounded text-[11px] shrink-0">
                {(vehicle.maintenances || []).length} interventi
              </span>
            </div>
            <div className="my-1.5">
              <span className="text-2xl sm:text-3xl font-black tracking-tight text-[#059669] truncate block">
                {settings.currency} {metrics.totalMaintSpent.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <p className="text-[11px] text-[#64748b]">
              {(vehicle.maintenances || []).length === 0 ? 'Nessun intervento registrato' : 'Tagliandi e riparazioni officina'}
            </p>
          </div>

        </div>
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
              className="bg-[#2563eb] hover:bg-[#1d4ed8] active:scale-[0.99] text-white p-3.5 sm:p-4 rounded-2xl shadow-xs hover:shadow-md transition-all flex items-center justify-between group cursor-pointer"
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
              <div className="w-7 h-7 rounded-xl bg-white/10 flex items-center justify-center shrink-0 group-hover:translate-x-1 transition-transform ml-2">
                <Plus className="w-4 h-4" />
              </div>
            </button>

            {/* 2. Tasto Ricarica Elettrica (sotto al rifornimento) */}
            <button
              id="btn-main-add-refuel-electric"
              onClick={() => onOpenAddRefuel('electricity')}
              className="bg-[#d97706] hover:bg-[#b45309] active:scale-[0.99] text-white p-3.5 sm:p-4 rounded-2xl shadow-xs hover:shadow-md transition-all flex items-center justify-between group cursor-pointer"
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
              <div className="w-7 h-7 rounded-xl bg-white/10 flex items-center justify-center shrink-0 group-hover:translate-x-1 transition-transform ml-2">
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
              className="bg-[#2563eb] hover:bg-[#1d4ed8] active:scale-[0.99] text-white p-3.5 sm:p-4 rounded-2xl shadow-xs hover:shadow-md transition-all flex items-center justify-between group cursor-pointer"
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
              <div className="w-7 h-7 rounded-xl bg-white/10 flex items-center justify-center shrink-0 group-hover:translate-x-1 transition-transform ml-2">
                <Plus className="w-4 h-4" />
              </div>
            </button>

            {/* 2. Tasto Rifornimento Gas (GPL o Metano) */}
            <button
              id="btn-main-add-refuel-gas"
              onClick={() => onOpenAddRefuel(isLPG ? 'lpg' : 'cng')}
              className="bg-[#0284c7] hover:bg-[#0369a1] active:scale-[0.99] text-white p-3.5 sm:p-4 rounded-2xl shadow-xs hover:shadow-md transition-all flex items-center justify-between group cursor-pointer"
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
              <div className="w-7 h-7 rounded-xl bg-white/10 flex items-center justify-center shrink-0 group-hover:translate-x-1 transition-transform ml-2">
                <Plus className="w-4 h-4" />
              </div>
            </button>
          </div>
        ) : (
          <button
            id="btn-main-add-refuel"
            onClick={() => onOpenAddRefuel()}
            className="bg-[#2563eb] hover:bg-[#1d4ed8] active:scale-[0.99] text-white p-4 sm:p-5 rounded-2xl shadow-xs hover:shadow-md transition-all flex items-center justify-between group cursor-pointer h-full min-h-[96px]"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
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
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0 group-hover:translate-x-1 transition-transform ml-2">
              <Plus className="w-5 h-5" />
            </div>
          </button>
        )}

        {/* COLONNA DESTRA: MANUTENZIONE (A FIANCO) */}
        <button
          id="btn-main-add-maint"
          onClick={onOpenAddMaintenance}
          className={`bg-[#059669] hover:bg-emerald-700 active:scale-[0.99] text-white p-4 sm:p-5 rounded-2xl shadow-xs hover:shadow-md transition-all flex items-center justify-between group cursor-pointer ${
            isPHEV || isLPG || isCNG ? 'h-full min-h-[110px]' : 'h-full min-h-[96px]'
          }`}
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
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
          <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0 group-hover:translate-x-1 transition-transform ml-2">
            <Plus className="w-5 h-5" />
          </div>
        </button>
      </section>

      {/* AVVISO SERBATOIO SE MANCANTE */}
      {(!vehicle.tankCapacity || Number(vehicle.tankCapacity) <= 0) && (
        <div className="bg-[#fff7ed] border border-[#fed7aa] text-[#c2410c] px-4 py-3 rounded-2xl flex items-center justify-between gap-3 text-xs min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0" />
            <span className="truncate">Capienza serbatoio non impostata. Configurala per il calcolo dei consumi medi.</span>
          </div>
          <button 
            id="btn-fix-tank"
            onClick={onOpenFixTank}
            className="bg-orange-600 hover:bg-orange-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg shrink-0 transition-colors cursor-pointer"
          >
            Configura Serbatoio
          </button>
        </div>
      )}

      {/* 4. REGISTRO ATTIVITÀ & STORICO A TENDINA: RIFORNIMENTI E MANUTENZIONI */}
      <section className="bg-white rounded-3xl border border-[#e2e8f0] flex flex-col overflow-hidden shadow-xs min-w-0">
        
        {/* Section Header with Collapsible Toggle */}
        <div className="px-4 sm:px-5 py-3.5 border-b border-[#e2e8f0] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-[#fafbfc] min-w-0">
          <div className="flex items-center justify-between w-full sm:w-auto gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsSectionOpen(!isSectionOpen)}
                className="flex items-center gap-2 text-left font-black text-sm text-[#0f172a] hover:text-blue-600 transition-colors cursor-pointer select-none"
              >
                <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
                  <Receipt className="w-4 h-4" />
                </div>
                <span>Registro Storico Attività</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isSectionOpen ? 'rotate-180 text-blue-600' : ''}`} />
              </button>
            </div>

            {/* Quick Record Counter Badges */}
            <div className="flex items-center gap-1.5 sm:hidden">
              <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                {(vehicle.refuels || []).length} Riforn.
              </span>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                {(vehicle.maintenances || []).length} Manut.
              </span>
            </div>
          </div>

          {isSectionOpen && (
            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end overflow-x-auto pb-1 sm:pb-0">
              {/* Tab Selector Buttons */}
              <div className="flex items-center gap-1 bg-[#f1f5f9] p-1 rounded-xl shrink-0">
                <button 
                  id="tab-refuels-btn"
                  onClick={() => setActiveTab('refuels')}
                  className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer select-none whitespace-nowrap ${
                    activeTab === 'refuels' 
                      ? 'bg-white text-[#2563eb] shadow-xs' 
                      : 'text-[#64748b] hover:text-[#0f172a]'
                  }`}
                >
                  <Fuel className="w-3.5 h-3.5 shrink-0" />
                  <span>Rifornimenti ({(vehicle.refuels || []).length})</span>
                </button>

                <button 
                  id="tab-maintenances-btn"
                  onClick={() => setActiveTab('maintenances')}
                  className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer select-none whitespace-nowrap ${
                    activeTab === 'maintenances' 
                      ? 'bg-white text-[#059669] shadow-xs' 
                      : 'text-[#64748b] hover:text-[#0f172a]'
                  }`}
                >
                  <Wrench className="w-3.5 h-3.5 shrink-0" />
                  <span>Manutenzioni ({(vehicle.maintenances || []).length})</span>
                </button>
              </div>

              {/* View Mode Toggle Button */}
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl text-[11px] font-bold text-slate-600 shrink-0">
                <button
                  type="button"
                  onClick={() => setViewMode('compact')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    viewMode === 'compact' ? 'bg-white text-slate-900 shadow-2xs font-extrabold' : 'hover:text-slate-900'
                  }`}
                  title="Vista Compatta con pulsante Espandi"
                >
                  Compatta
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('grouped')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    viewMode === 'grouped' ? 'bg-white text-slate-900 shadow-2xs font-extrabold' : 'hover:text-slate-900'
                  }`}
                  title="Raggruppa per Anno a tendina"
                >
                  Per Anno
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Collapsed Preview Summary Bar */}
        {!isSectionOpen && (
          <div 
            onClick={() => setIsSectionOpen(true)}
            className="p-3.5 bg-slate-50 hover:bg-blue-50/50 transition-colors flex items-center justify-between cursor-pointer text-xs font-semibold text-slate-600"
          >
            <div className="flex items-center gap-3">
              <span className="text-slate-900 font-bold">
                {(vehicle.refuels || []).length} Rifornimenti • {(vehicle.maintenances || []).length} Manutenzioni
              </span>
              <span className="hidden sm:inline text-slate-400">|</span>
              <span className="hidden sm:inline text-slate-500">
                Totale Speso: <strong className="text-slate-800">{settings.currency} {metrics.totalOverallSpent.toLocaleString('it-IT', { minimumFractionDigits: 2 })}</strong>
              </span>
            </div>
            <span className="text-blue-600 font-bold flex items-center gap-1 hover:underline">
              Espandi registro <ChevronDown className="w-3.5 h-3.5" />
            </span>
          </div>
        )}

        {isSectionOpen && (
          <div className="p-3.5 sm:p-4 flex flex-col gap-3">
            
            {/* Quick Filter Year Toolbar if multiple years exist */}
            {availableYears.length > 1 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 mr-1 shrink-0">
                  <Filter className="w-3 h-3" /> Anno:
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedYear('all')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
                    selectedYear === 'all' 
                      ? 'bg-slate-900 text-white shadow-2xs' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Tutti ({activeTab === 'refuels' ? (vehicle.refuels || []).length : (vehicle.maintenances || []).length})
                </button>
                {availableYears.map(yr => (
                  <button
                    key={yr}
                    type="button"
                    onClick={() => setSelectedYear(yr)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
                      selectedYear === yr 
                        ? 'bg-blue-600 text-white shadow-2xs' 
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {yr}
                  </button>
                ))}
              </div>
            )}

            {/* TAB 1: RIFORNIMENTI */}
            {activeTab === 'refuels' && (
              <div className="flex flex-col gap-2.5">
                {filteredRefuels.length === 0 ? (
                  <div className="text-center py-10 flex flex-col items-center justify-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#2563eb] border border-blue-100 flex items-center justify-center">
                      <Fuel className="w-6 h-6" />
                    </div>
                    <div className="max-w-sm px-2">
                      <p className="text-sm font-bold text-[#0f172a]">Nessun rifornimento registrato</p>
                      <p className="text-xs text-[#64748b] mt-0.5">
                        Registra i rifornimenti per calcolare i consumi medi e la spesa chilometrica.
                      </p>
                    </div>
                    <button 
                      onClick={() => onOpenAddRefuel()}
                      className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> + Aggiungi Rifornimento
                    </button>
                  </div>
                ) : (
                  <>
                    {/* View Mode 1: Compact List (with expand/collapse if > 4 items) */}
                    {viewMode === 'compact' && (
                      <div className="flex flex-col gap-2">
                        {(showAllRefuels ? filteredRefuels : filteredRefuels.slice(0, 4)).map((refuel) => {
                          const qty = Number(refuel.quantity) || 0;
                          const price = Number(refuel.price) || 0;
                          const isFull = refuel.type === 'full';
                          const isEV = refuel.energyType === 'electricity' || refuel.unit === 'kWh' || (isBEV && !refuel.energyType);
                          const isLPG = refuel.energyType === 'lpg';
                          const isCNG = refuel.energyType === 'cng';
                          const unit = refuel.unit || (isEV ? 'kWh' : (isCNG ? 'Kg' : 'L'));

                          return (
                            <div 
                              key={refuel.id}
                              onClick={() => setSelectedDetailData({ type: 'refuel', item: refuel, deltaKm: refuel.deltaKm, unitPrice: refuel.unitPrice })}
                              className="group bg-[#fafbfc] hover:bg-white border border-[#e2e8f0] hover:border-[#93c5fd] rounded-2xl p-3 sm:p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-all duration-150 shadow-2xs hover:shadow-xs cursor-pointer select-none"
                            >
                              {/* Left: Icon, Date, Type Badge & Km */}
                              <div className="flex items-center gap-3 min-w-0">
                                <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl border flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform ${
                                  isEV 
                                    ? 'bg-amber-50 text-amber-600 border-amber-200' 
                                    : (isLPG 
                                      ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
                                      : (isCNG 
                                        ? 'bg-teal-50 text-teal-600 border-teal-200' 
                                        : 'bg-blue-50 text-[#2563eb] border-blue-100'))
                                }`}>
                                  {isEV ? <Zap className="w-4 h-4 sm:w-5 sm:h-5" /> : <Fuel className="w-4 h-4 sm:w-5 sm:h-5" />}
                                </div>
                                
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="text-xs sm:text-sm font-black text-[#0f172a]">
                                      {refuel.date.split('-').reverse().join('/')}
                                    </span>
                                    {isEV ? (
                                      <span className="px-2 py-0.5 rounded-md text-[9.5px] font-extrabold uppercase bg-amber-100 text-amber-900 border border-amber-200 whitespace-nowrap">
                                        ⚡ Elettrica {isFull ? '100%' : 'Parz.'}
                                      </span>
                                    ) : isLPG ? (
                                      <span className="px-2 py-0.5 rounded-md text-[9.5px] font-extrabold uppercase bg-emerald-100 text-emerald-900 border border-emerald-200 whitespace-nowrap">
                                        🔵 GPL {isFull ? 'Pieno' : 'Parz.'}
                                      </span>
                                    ) : isCNG ? (
                                      <span className="px-2 py-0.5 rounded-md text-[9.5px] font-extrabold uppercase bg-teal-100 text-teal-900 border border-teal-200 whitespace-nowrap">
                                        🟢 Metano {isFull ? 'Pieno' : 'Parz.'}
                                      </span>
                                    ) : (
                                      <span className={`px-2 py-0.5 rounded-md text-[9.5px] font-extrabold uppercase whitespace-nowrap ${
                                        isFull ? 'bg-emerald-50 text-[#059669] border border-emerald-100' : 'bg-slate-100 text-[#64748b] border border-slate-200'
                                      }`}>
                                        {isFull ? 'Pieno' : 'Parziale'}
                                      </span>
                                    )}

                                    {/* Interval Consumption badge if computed */}
                                    {refuel.intervalConsumption && (
                                      <span className="px-2 py-0.5 rounded-md text-[9.5px] font-black bg-blue-50 text-blue-700 border border-blue-200 whitespace-nowrap">
                                        {refuel.intervalConsumption.formattedKmPerUnit} km/{unit} ({refuel.intervalConsumption.formattedUnitPer100Km} {unit}/100km)
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-2 text-xs text-[#64748b] mt-0.5 flex-wrap">
                                    <span className="font-semibold text-[#334155]">{refuel.km.toLocaleString('it-IT')} km</span>
                                    {refuel.deltaKm !== null && refuel.deltaKm > 0 && (
                                      <span className="text-[11px] text-blue-600 font-bold hidden sm:inline">
                                        (+{refuel.deltaKm.toLocaleString('it-IT')} km)
                                      </span>
                                    )}
                                    {refuel.notes && (
                                      <span className="text-slate-400 truncate max-w-[120px] sm:max-w-[200px]">
                                        • {refuel.notes}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Right: Quantity, Price & Actions */}
                              <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-[#f1f5f9] shrink-0">
                                <div className="text-left sm:text-right">
                                  <div className="text-sm sm:text-base font-black text-[#0f172a] whitespace-nowrap">
                                    {settings.currency} {price.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </div>
                                  <div className="text-xs text-[#64748b] font-medium whitespace-nowrap">
                                    {qty.toLocaleString('it-IT', { minimumFractionDigits: 2 })} {unit}
                                    {refuel.unitPrice && <span className="text-[10.5px] ml-1 text-slate-400">({refuel.unitPrice} €/{unit})</span>}
                                  </div>
                                </div>

                                <div className="flex items-center gap-1 ml-1">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onOpenEditRefuel(refuel);
                                    }}
                                    className="p-1.5 sm:p-2 rounded-xl text-[#64748b] hover:text-[#2563eb] hover:bg-blue-50 transition-colors"
                                    title="Modifica rapida"
                                  >
                                    <Edit3 className="w-4 h-4" />
                                  </button>
                                  
                                  <div className="p-1.5 sm:p-2 rounded-xl bg-slate-100 group-hover:bg-blue-50 text-slate-400 group-hover:text-[#2563eb] transition-colors">
                                    <ChevronRight className="w-4 h-4" />
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}

                        {/* Accordion expand/collapse pill for refuels */}
                        {filteredRefuels.length > 4 && (
                          <button
                            type="button"
                            onClick={() => setShowAllRefuels(!showAllRefuels)}
                            className="mt-1 w-full py-2.5 px-4 bg-slate-50 hover:bg-blue-50/70 border border-slate-200 hover:border-blue-300 rounded-xl text-xs font-black text-blue-700 flex items-center justify-center gap-2 transition-all cursor-pointer"
                          >
                            {showAllRefuels ? (
                              <>
                                <ChevronUp className="w-4 h-4" />
                                <span>Mostra meno (visualizza solo gli ultimi 4)</span>
                              </>
                            ) : (
                              <>
                                <ChevronDown className="w-4 h-4" />
                                <span>Mostra tutti i {filteredRefuels.length} rifornimenti registrati</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    )}

                    {/* View Mode 2: Grouped by Year Accordion */}
                    {viewMode === 'grouped' && (
                      <div className="flex flex-col gap-3">
                        {(Object.entries(refuelsByYear) as [string, RefuelWithCalculation[]][]).map(([year, records]) => {
                          const isYearCollapsed = !!collapsedYears[`refuel-${year}`];
                          const totalYearSpend = records.reduce((acc, r) => acc + (Number(r.price) || 0), 0);
                          const totalYearQty = records.reduce((acc, r) => acc + (Number(r.quantity) || 0), 0);

                          return (
                            <div key={year} className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
                              {/* Year Group Accordion Header */}
                              <button
                                type="button"
                                onClick={() => toggleYearCollapse(`refuel-${year}`)}
                                className="w-full px-4 py-2.5 bg-slate-50 hover:bg-slate-100 flex items-center justify-between gap-3 text-left transition-colors cursor-pointer border-b border-slate-100"
                              >
                                <div className="flex items-center gap-2.5">
                                  <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${isYearCollapsed ? '-rotate-90' : ''}`} />
                                  <span className="text-sm font-black text-slate-900">Anno {year}</span>
                                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800">
                                    {records.length} {records.length === 1 ? 'rifornimento' : 'rifornimenti'}
                                  </span>
                                </div>

                                <div className="text-xs font-bold text-slate-600">
                                  <span>{settings.currency} {totalYearSpend.toLocaleString('it-IT', { minimumFractionDigits: 2 })}</span>
                                  <span className="hidden sm:inline text-slate-400 font-normal ml-1.5">({totalYearQty.toFixed(1)} {fuelUnit})</span>
                                </div>
                              </button>

                              {!isYearCollapsed && (
                                <div className="p-2.5 flex flex-col gap-2 divide-y divide-slate-100">
                                  {records.map(refuel => {
                                    const qty = Number(refuel.quantity) || 0;
                                    const price = Number(refuel.price) || 0;
                                    const isFull = refuel.type === 'full';
                                    const isEV = refuel.energyType === 'electricity' || refuel.unit === 'kWh';
                                    const unit = refuel.unit || (isEV ? 'kWh' : 'L');

                                    return (
                                      <div
                                        key={refuel.id}
                                        onClick={() => setSelectedDetailData({ type: 'refuel', item: refuel, deltaKm: refuel.deltaKm, unitPrice: refuel.unitPrice })}
                                        className="pt-2 first:pt-0 flex items-center justify-between gap-2 text-xs hover:bg-slate-50 p-1.5 rounded-lg transition-colors cursor-pointer"
                                      >
                                        <div className="flex items-center gap-2 min-w-0">
                                          <span className="font-bold text-slate-900 whitespace-nowrap">{refuel.date.split('-').reverse().join('/')}</span>
                                          <span className="text-slate-600 font-medium whitespace-nowrap">{refuel.km.toLocaleString('it-IT')} km</span>
                                          {refuel.intervalConsumption && (
                                            <span className="hidden md:inline px-1.5 py-0.2 bg-blue-50 text-blue-700 text-[10px] font-bold rounded">
                                              {refuel.intervalConsumption.formattedKmPerUnit} km/{unit}
                                            </span>
                                          )}
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0">
                                          <span className="font-black text-slate-900">{settings.currency} {price.toFixed(2)}</span>
                                          <span className="text-slate-500 font-medium">({qty.toFixed(1)} {unit})</span>
                                          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* TAB 2: MANUTENZIONI */}
            {activeTab === 'maintenances' && (
              <div className="flex flex-col gap-2.5">
                {filteredMaintenances.length === 0 ? (
                  <div className="text-center py-10 flex flex-col items-center justify-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#059669] border border-emerald-100 flex items-center justify-center">
                      <Wrench className="w-6 h-6" />
                    </div>
                    <div className="max-w-sm px-2">
                      <p className="text-sm font-bold text-[#0f172a]">Nessuna manutenzione registrata</p>
                      <p className="text-xs text-[#64748b] mt-0.5">
                        Tieni traccia di tagliandi, pastiglie freni, gomme e revisioni per mantenere alto il valore della tua auto.
                      </p>
                    </div>
                    <button 
                      onClick={onOpenAddMaintenance}
                      className="bg-[#059669] hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> + Aggiungi Manutenzione
                    </button>
                  </div>
                ) : (
                  <>
                    {/* View Mode 1: Compact List (with expand/collapse if > 4 items) */}
                    {viewMode === 'compact' && (
                      <div className="flex flex-col gap-2">
                        {(showAllMaintenances ? filteredMaintenances : filteredMaintenances.slice(0, 4)).map((maint) => {
                          const cost = Number(maint.cost) || 0;

                          return (
                            <div 
                              key={maint.id}
                              onClick={() => setSelectedDetailData({ type: 'maintenance', item: maint })}
                              className="group bg-[#fafbfc] hover:bg-white border border-[#e2e8f0] hover:border-[#a7f3d0] rounded-2xl p-3 sm:p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-all duration-150 shadow-2xs hover:shadow-xs cursor-pointer select-none"
                            >
                              {/* Left: Date, Category & Workshop */}
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-emerald-50 text-[#059669] border border-emerald-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                  <Wrench className="w-4 h-4 sm:w-5 sm:h-5" />
                                </div>
                                
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="text-xs sm:text-sm font-black text-[#0f172a]">
                                      {maint.date.split('-').reverse().join('/')}
                                    </span>
                                    <span className="px-2 py-0.5 rounded-md text-[9.5px] font-extrabold uppercase bg-emerald-50 text-[#059669] border border-emerald-100 whitespace-nowrap">
                                      {maint.category}
                                    </span>
                                  </div>

                                  <div className="text-xs text-[#64748b] mt-0.5 flex items-center gap-2 flex-wrap">
                                    <span className="font-semibold text-[#334155]">{maint.km.toLocaleString('it-IT')} km</span>
                                    {maint.workshop && (
                                      <span className="truncate max-w-[120px] sm:max-w-[180px]">• {maint.workshop}</span>
                                    )}
                                    {maint.description && (
                                      <span className="text-slate-400 truncate max-w-[120px] sm:max-w-[200px]">
                                        • {maint.description}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Right: Cost & Actions */}
                              <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-[#f1f5f9] shrink-0">
                                <div className="text-left sm:text-right">
                                  <div className="text-sm sm:text-base font-black text-[#059669] whitespace-nowrap">
                                    {settings.currency} {cost.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </div>
                                  <div className="text-[11px] text-[#64748b] whitespace-nowrap font-medium">
                                    Spesa registrata
                                  </div>
                                </div>

                                <div className="flex items-center gap-1 ml-1">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onOpenEditMaintenance(maint);
                                    }}
                                    className="p-1.5 sm:p-2 rounded-xl text-[#64748b] hover:text-[#059669] hover:bg-emerald-50 transition-colors"
                                    title="Modifica rapida"
                                  >
                                    <Edit3 className="w-4 h-4" />
                                  </button>
                                  
                                  <div className="p-1.5 sm:p-2 rounded-xl bg-slate-100 group-hover:bg-emerald-50 text-slate-400 group-hover:text-[#059669] transition-colors">
                                    <ChevronRight className="w-4 h-4" />
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}

                        {/* Accordion expand/collapse pill for maintenances */}
                        {filteredMaintenances.length > 4 && (
                          <button
                            type="button"
                            onClick={() => setShowAllMaintenances(!showAllMaintenances)}
                            className="mt-1 w-full py-2.5 px-4 bg-slate-50 hover:bg-emerald-50/70 border border-slate-200 hover:border-emerald-300 rounded-xl text-xs font-black text-emerald-700 flex items-center justify-center gap-2 transition-all cursor-pointer"
                          >
                            {showAllMaintenances ? (
                              <>
                                <ChevronUp className="w-4 h-4" />
                                <span>Mostra meno (visualizza solo gli ultimi 4)</span>
                              </>
                            ) : (
                              <>
                                <ChevronDown className="w-4 h-4" />
                                <span>Mostra tutte le {filteredMaintenances.length} manutenzioni registrate</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    )}

                    {/* View Mode 2: Grouped by Year Accordion */}
                    {viewMode === 'grouped' && (
                      <div className="flex flex-col gap-3">
                        {(Object.entries(maintenancesByYear) as [string, MaintenanceRecord[]][]).map(([year, records]) => {
                          const isYearCollapsed = !!collapsedYears[`maint-${year}`];
                          const totalYearSpend = records.reduce((acc, m) => acc + (Number(m.cost) || 0), 0);

                          return (
                            <div key={year} className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
                              {/* Year Group Accordion Header */}
                              <button
                                type="button"
                                onClick={() => toggleYearCollapse(`maint-${year}`)}
                                className="w-full px-4 py-2.5 bg-slate-50 hover:bg-slate-100 flex items-center justify-between gap-3 text-left transition-colors cursor-pointer border-b border-slate-100"
                              >
                                <div className="flex items-center gap-2.5">
                                  <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${isYearCollapsed ? '-rotate-90' : ''}`} />
                                  <span className="text-sm font-black text-slate-900">Anno {year}</span>
                                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                                    {records.length} {records.length === 1 ? 'intervento' : 'interventi'}
                                  </span>
                                </div>

                                <div className="text-xs font-bold text-emerald-700">
                                  <span>{settings.currency} {totalYearSpend.toLocaleString('it-IT', { minimumFractionDigits: 2 })}</span>
                                </div>
                              </button>

                              {!isYearCollapsed && (
                                <div className="p-2.5 flex flex-col gap-2 divide-y divide-slate-100">
                                  {records.map(maint => {
                                    const cost = Number(maint.cost) || 0;

                                    return (
                                      <div
                                        key={maint.id}
                                        onClick={() => setSelectedDetailData({ type: 'maintenance', item: maint })}
                                        className="pt-2 first:pt-0 flex items-center justify-between gap-2 text-xs hover:bg-slate-50 p-1.5 rounded-lg transition-colors cursor-pointer"
                                      >
                                        <div className="flex items-center gap-2 min-w-0">
                                          <span className="font-bold text-slate-900 whitespace-nowrap">{maint.date.split('-').reverse().join('/')}</span>
                                          <span className="text-emerald-700 font-bold px-1.5 py-0.2 bg-emerald-50 rounded whitespace-nowrap">{maint.category}</span>
                                          <span className="text-slate-600 font-medium whitespace-nowrap">{maint.km.toLocaleString('it-IT')} km</span>
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0">
                                          <span className="font-black text-[#059669]">{settings.currency} {cost.toFixed(2)}</span>
                                          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

          </div>
        )}

      </section>

      {/* 5. SEZIONE DEDICATA: ASSISTENTE & CONSIGLI AI GARAGE */}
      <section className="bg-white rounded-3xl border border-[#e2e8f0] p-4 sm:p-5 shadow-xs flex flex-col gap-3.5">
        <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-[#0f172a] uppercase tracking-wide">
                Consigli Intelligenti & Diagnostica Preventiva AI
              </h3>
              <p className="text-[11px] text-[#64748b]">
                Analisi predittiva in tempo reale basata su chilometraggio, anzianità e alimentazione ({vehicle.fuelType})
              </p>
            </div>
          </div>

          <span className="text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg shrink-0">
            {aiAdvices.length} {aiAdvices.length === 1 ? 'consiglio' : 'consigli attivi'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {aiAdvices.map((advice) => (
            <div 
              key={advice.id}
              onClick={() => setSelectedDetailData({ type: 'advice', item: advice })}
              className={`p-3.5 sm:p-4 rounded-2xl border transition-all duration-150 flex items-start justify-between gap-3 shadow-2xs hover:shadow-xs cursor-pointer select-none ${
                advice.urgency === 'high' 
                  ? 'bg-[#fef2f2] border-[#fecaca] hover:border-red-300' 
                  : advice.urgency === 'medium' 
                    ? 'bg-[#fffbeb] border-[#fde68a] hover:border-amber-300' 
                    : 'bg-[#f8fafc] border-[#e2e8f0] hover:border-slate-300'
              }`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                  advice.urgency === 'high' 
                    ? 'bg-red-100 text-red-700' 
                    : advice.urgency === 'medium' 
                      ? 'bg-amber-100 text-amber-800' 
                      : 'bg-blue-50 text-[#2563eb]'
                }`}>
                  {advice.urgency === 'high' ? <AlertTriangle className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h4 className="text-xs sm:text-sm font-black text-[#0f172a]">
                      {advice.title}
                    </h4>
                  </div>
                  <p className="text-xs text-[#64748b] mt-1 leading-relaxed line-clamp-2">
                    {advice.desc}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 self-center sm:self-start mt-0.5">
                <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border whitespace-nowrap ${
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

      {/* 5. MODALE SCHERMATA COMPLETA PER DETTAGLI (OVERLAY IN PRIMO PIANO) */}
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
