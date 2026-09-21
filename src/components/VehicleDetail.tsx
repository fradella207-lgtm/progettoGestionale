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
  AlertTriangle, 
  Shield, 
  FileSpreadsheet, 
  Printer, 
  Download, 
  Crown, 
  Users, 
  Lock 
} from 'lucide-react';
import { Vehicle, RefuelRecord, MaintenanceRecord, AIAdvice, AppSettings, EnergySourceType, UserTier, ProFeatureName } from '../types';
import { DetailViewModal, DetailModalData } from './modals/DetailViewModal';
import { BoardTripsModal } from './modals/BoardTripsModal';
import { RefuelsRegistryModal } from './modals/RefuelsRegistryModal';
import { MaintenancesRegistryModal } from './modals/MaintenancesRegistryModal';
import { calculateVehicleConsumptionMetrics } from '../utils/consumptionCalculator';
import { CarDocumentsVault } from './CarDocumentsVault';
import { CarAIAssistant } from './CarAIAssistant';
import { formatVinForDisplay } from '../utils/vinValidator';
import { exportVehiclePassportCSV, openPrintableDigitalPassport } from '../utils/digitalPassportExport';
import { ProBadge } from './common/ProBadge';
import { useSwipeBack } from '../hooks/useSwipeBack';
import { VehicleSubModal } from '../utils/navigation';

interface VehicleDetailProps {
  vehicle: Vehicle;
  vehicles?: Vehicle[];
  settings: AppSettings;
  userTier?: UserTier;
  initialTab?: 'overview' | 'documents' | 'ai';
  activeSubModal?: VehicleSubModal | null;
  onOpenSubModal?: (modal: VehicleSubModal | null) => void;
  onSelectVehicle?: (vehicleId: string) => void;
  onBackToGarage?: () => void;
  onUpdateVehicle?: (updated: Vehicle) => void;
  onOpenEditCar: () => void;
  onOpenAddRefuel: (energyType?: EnergySourceType) => void;
  onOpenEditRefuel: (refuel: RefuelRecord) => void;
  onOpenAddMaintenance: () => void;
  onOpenEditMaintenance: (maint: MaintenanceRecord) => void;
  onOpenFixTank: () => void;
  onOpenRecap?: (vehicleId?: string) => void;
  onOpenUpgradeModal?: (feature?: ProFeatureName) => void;
  onOpenSharedGarage?: (vehicleId: string) => void;
  onOpenDigitalPassport?: (vehicleId?: string) => void;
  showToast?: (text: string, type?: 'success' | 'error' | 'info') => void;
}

export const VehicleDetail: React.FC<VehicleDetailProps> = ({
  vehicle,
  settings,
  userTier = 'FREE',
  initialTab = 'overview',
  activeSubModal,
  onOpenSubModal,
  onBackToGarage,
  onUpdateVehicle,
  onOpenEditCar,
  onOpenAddRefuel,
  onOpenEditRefuel,
  onOpenAddMaintenance,
  onOpenEditMaintenance,
  onOpenFixTank,
  onOpenRecap,
  onOpenUpgradeModal,
  onOpenSharedGarage,
  onOpenDigitalPassport,
  showToast
}) => {
  const [mainTab, setMainTab] = useState<'overview' | 'documents' | 'ai'>(
    (initialTab === 'overview' || initialTab === 'documents' || initialTab === 'ai') ? initialTab : 'overview'
  );

  // Calcolo permessi se veicolo condiviso (membro invitato)
  const isSharedMember = Boolean(vehicle.isShared && vehicle.sharedRole === 'member');
  const isReadOnly = isSharedMember && vehicle.sharedPermissionsLevel === 'read_only';
  const isRefuelOnly = isSharedMember && vehicle.sharedPermissionsLevel === 'refuel_only';
  const isDocHidden = isSharedMember && vehicle.sharedAllowDocumentView === false;

  const handleRefuelClick = () => {
    if (isReadOnly) {
      if (showToast) {
        showToast('Accesso in sola lettura: il proprietario ha impostato permessi di sola consultazione. Non è consentito registrare nuovi rifornimenti o ricariche.', 'error');
      }
      return;
    }
    onOpenAddRefuel(isPHEV ? 'fuel' : undefined);
  };

  const handleMaintenanceClick = () => {
    if (isReadOnly) {
      if (showToast) {
        showToast('Accesso in sola lettura: il proprietario ha impostato permessi di sola consultazione. Non è consentito inserire interventi di manutenzione.', 'error');
      }
      return;
    }
    if (isRefuelOnly) {
      if (showToast) {
        showToast('Permessi limitati: il proprietario consente esclusivamente la registrazione dei rifornimenti. Non è possibile aggiungere manutenzioni.', 'error');
      }
      return;
    }
    onOpenAddMaintenance();
  };

  const handleEditCarClick = () => {
    if (isSharedMember) {
      if (showToast) {
        showToast('Accesso limitato: solo il proprietario del veicolo può modificare i dati dell\'auto o la targa.', 'error');
      }
      return;
    }
    onOpenEditCar();
  };

  useEffect(() => {
    if (initialTab) setMainTab(initialTab);
  }, [initialTab]);

  const [activeRegistryTab, setActiveRegistryTab] = useState<'refuels' | 'maintenances'>('refuels');
  const [selectedDetailData, setSelectedDetailData] = useState<DetailModalData | null>(null);

  // Modals for Registries and Board Trips synchronized with browser history and gesture back
  const [internalSubModal, setInternalSubModal] = useState<'trips' | 'refuels' | 'maintenances' | null>(null);

  const effectiveSubModal = activeSubModal !== undefined ? activeSubModal : internalSubModal;
  const setEffectiveSubModal = (modal: 'trips' | 'refuels' | 'maintenances' | null) => {
    setInternalSubModal(modal);
    onOpenSubModal?.(modal);
  };

  const isBoardTripsModalOpen = effectiveSubModal === 'trips';
  const isRefuelsRegistryOpen = effectiveSubModal === 'refuels';
  const isMaintenancesRegistryOpen = effectiveSubModal === 'maintenances';

  const [tripsReturnSource, setTripsReturnSource] = useState<'detail' | 'refuels'>('detail');
  const [copiedVin, setCopiedVin] = useState(false);
  const [showPassportMenu, setShowPassportMenu] = useState(false);

  // Swipe back to garage when in vehicle detail and no modal is active
  useSwipeBack({
    onBack: () => {
      if (selectedDetailData) {
        setSelectedDetailData(null);
      } else if (effectiveSubModal) {
        setEffectiveSubModal(null);
      } else if (onBackToGarage) {
        onBackToGarage();
      }
    },
    enabled: Boolean(onBackToGarage || effectiveSubModal || selectedDetailData)
  });

  const handleCloseBoardTrips = () => {
    if (tripsReturnSource === 'refuels') {
      setEffectiveSubModal('refuels');
      setTripsReturnSource('detail');
    } else {
      setEffectiveSubModal(null);
    }
  };

  const handleOpenBoardTripsFromRefuels = () => {
    setTripsReturnSource('refuels');
    setEffectiveSubModal('trips');
  };

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
      <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-4 sm:p-5 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5">
        
        {/* Foto Veicolo con cambio rapido */}
        <div 
          onClick={handleEditCarClick}
          className="w-full sm:w-48 h-36 sm:h-32 rounded-2xl bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 flex items-center justify-center relative cursor-pointer group border border-slate-200 dark:border-slate-700"
          title={isSharedMember ? 'Modifica non consentita per membri invitati' : 'Modifica dati veicolo'}
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
              <Bike className="w-10 h-10 text-slate-300 dark:text-slate-600" />
            ) : (
              <Car className="w-10 h-10 text-slate-300 dark:text-slate-600" />
            )
          )}
        </div>

        {/* Info Principali */}
        <div className="flex-1 min-w-0 flex flex-col gap-1.5 w-full">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight truncate">
                  {vehicle.brand} {vehicle.model}
                </h1>
                {vehicle.vehicleType === 'moto' && (
                  <span className="text-[10px] bg-slate-900 dark:bg-slate-800 text-white font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1 border border-slate-700">
                    <Bike className="w-3 h-3" />
                    <span>Moto</span>
                  </span>
                )}
                {vehicle.isShared && (
                  <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 font-bold px-2 py-0.5 rounded-md flex items-center gap-1 border border-indigo-200 dark:border-indigo-800 shadow-2xs">
                    <Users className="w-3 h-3" />
                    <span>Veicolo Condiviso</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                {vehicle.motorization || 'Di serie'} • Anno {vehicle.registrationDate?.split('-')[0] || 'N/D'}
              </p>
            </div>

            {/* Targa & VIN */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg px-2.5 py-1 inline-flex items-center gap-1.5 font-mono text-xs font-bold shadow-2xs">
                <span className="bg-blue-600 text-white text-[8px] px-1 py-0.2 rounded-[2px]">IT</span>
                <span className="tracking-wider">{vehicle.plate}</span>
              </div>

              {vehicle.vin && (
                <button
                  type="button"
                  onClick={() => handleCopyVin(vehicle.vin!)}
                  className="bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs font-mono font-semibold inline-flex items-center gap-1 transition-all cursor-pointer"
                  title="Copia codice telaio"
                >
                  <span className="text-[9px] font-sans text-slate-400 font-bold uppercase">VIN</span>
                  <span>{formatVinForDisplay(vehicle.vin)}</span>
                  {copiedVin ? <Check className="w-3 h-3 text-emerald-600 stroke-[3]" /> : <Copy className="w-3 h-3 text-slate-400" />}
                </button>
              )}

              {/* Passaporto Digitale Button */}
              <div className="relative">
                <button
                  type="button"
                  id="btn-digital-passport-trigger"
                  onClick={() => {
                    if (onOpenDigitalPassport) {
                      onOpenDigitalPassport(vehicle.id);
                    } else if (userTier === 'FREE') {
                      onOpenUpgradeModal?.('export_pdf');
                    } else {
                      setShowPassportMenu(prev => !prev);
                    }
                  }}
                  className="bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-950 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-800 rounded-lg px-2.5 py-1 text-xs font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                  title="Apri il Passaporto Digitale del veicolo (PDF / CSV)"
                >
                  <Shield className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>Passaporto Digitale</span>
                  {userTier === 'FREE' ? (
                    <ProBadge variant="lock" />
                  ) : (
                    <span className="text-[9px] bg-indigo-600 text-white font-black px-1.5 py-0.2 rounded-md uppercase">
                      PRO
                    </span>
                  )}
                </button>

                {/* Dropdown fallback menu */}
                {showPassportMenu && !onOpenDigitalPassport && userTier === 'PRO' && (
                  <div 
                    className="absolute right-0 mt-1.5 w-64 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-1.5 z-30 flex flex-col gap-1 font-sans text-xs"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      id="btn-print-passport-pdf"
                      onClick={() => {
                        setShowPassportMenu(false);
                        openPrintableDigitalPassport(vehicle);
                      }}
                      className="w-full text-left p-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-slate-800 dark:text-slate-100 transition-colors flex items-center gap-2 font-bold cursor-pointer"
                    >
                      <Printer className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                      <div>
                        <span className="block font-bold">Stampa / Salva in PDF</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">Report certificato con grafici e scadenze</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      id="btn-export-passport-csv"
                      onClick={() => {
                        setShowPassportMenu(false);
                        exportVehiclePassportCSV(vehicle);
                      }}
                      className="w-full text-left p-2 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-slate-800 dark:text-slate-100 transition-colors flex items-center gap-2 font-bold cursor-pointer"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <div>
                        <span className="block font-bold">Scarica Tabella Dati (CSV)</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">Foglio di calcolo compatibile Excel</span>
                      </div>
                    </button>
                  </div>
                )}
              </div>

              {/* Condividi Auto (Shared Garage PRO) */}
              <button
                type="button"
                id="btn-share-vehicle-detail"
                onClick={() => {
                  if (userTier === 'FREE') {
                    onOpenUpgradeModal?.('shared_garage');
                  } else {
                    onOpenSharedGarage?.(vehicle.id);
                  }
                }}
                className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                title="Condividi questo veicolo con un altro account per sincronizzazione istantanea"
              >
                <Users className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Condividi</span>
                {userTier === 'FREE' ? (
                  <ProBadge variant="lock" />
                ) : (
                  <span className="text-[9px] bg-indigo-600 text-white font-black px-1.5 py-0.2 rounded-md uppercase">
                    PRO
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Indicatori Rapidi */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            <div className="bg-slate-50 dark:bg-slate-800/80 px-2.5 py-1.5 rounded-xl border border-slate-100 dark:border-slate-750">
              <span className="text-[9px] font-bold uppercase text-slate-500 dark:text-slate-400 block">Chilometri</span>
              <span className="font-extrabold text-slate-900 dark:text-white text-xs mt-0.5 block">{currentKm.toLocaleString('it-IT')} km</span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/80 px-2.5 py-1.5 rounded-xl border border-slate-100 dark:border-slate-750">
              <span className="text-[9px] font-bold uppercase text-slate-500 dark:text-slate-400 block">Alimentazione</span>
              <span className="font-extrabold text-slate-900 dark:text-white text-xs mt-0.5 block truncate">{vehicle.fuelType}</span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/80 px-2.5 py-1.5 rounded-xl border border-slate-100 dark:border-slate-750">
              <span className="text-[9px] font-bold uppercase text-slate-500 dark:text-slate-400 block">Capacità</span>
              <span className="font-extrabold text-slate-900 dark:text-white text-xs mt-0.5 block">
                {isBEV ? `${vehicle.batteryCapacity || '--'} kWh` : `${vehicle.tankCapacity || '--'} L`}
              </span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/80 px-2.5 py-1.5 rounded-xl border border-slate-100 dark:border-slate-750">
              <span className="text-[9px] font-bold uppercase text-slate-500 dark:text-slate-400 block">Potenza</span>
              <span className="font-extrabold text-slate-900 dark:text-white text-xs mt-0.5 block">
                {vehicle.powerCv ? `${vehicle.powerCv} CV` : (vehicle.registrationDate?.split('-')[0] || 'N/D')}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. BARRA NAVIGAZIONE SCHEDE */}
      <section className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-700 text-xs font-bold">
        <button
          type="button"
          onClick={() => setMainTab('overview')}
          className={`flex-1 py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            mainTab === 'overview'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Receipt className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          <span>Panoramica & Spese</span>
        </button>

        <button
          type="button"
          onClick={() => setMainTab('documents')}
          className={`flex-1 py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            mainTab === 'documents'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <FileText className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          <span>Documenti & Scadenze</span>
          {(vehicle.documents?.length || 0) > 0 && (
            <span className="text-[10px] bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300 font-bold px-1.5 py-0.2 rounded-full">
              {vehicle.documents?.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => {
            if (userTier === 'FREE') {
              onOpenUpgradeModal?.('ai_assistant');
            } else {
              setMainTab('ai');
            }
          }}
          className={`flex-1 py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            mainTab === 'ai'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Assistente & Manuale</span>
          {userTier === 'FREE' ? (
            <ProBadge variant="mini" />
          ) : (
            <span className="text-[9px] bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 font-black px-1.5 py-0.2 rounded-md">
              PRO
            </span>
          )}
        </button>
      </section>

      {/* TAB 1: PANORAMICA & REGISTRI (SNELLA, MODERNA E DIRETTA) */}
      {mainTab === 'overview' && (
        <div className="flex flex-col gap-4 animate-in fade-in duration-150">
          
          {/* BANNER RECAP MENSILE & ANNUALE (STORY CONDIVISIBILE) */}
          {onOpenRecap && (
            <button
              id="btn-open-recap-detail-banner"
              onClick={() => onOpenRecap(vehicle.id)}
              className="w-full bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 hover:from-slate-800 hover:via-indigo-900 hover:to-slate-800 text-white p-3.5 sm:p-4 rounded-3xl border border-indigo-500/30 flex items-center justify-between shadow-2xs transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-400/30 group-hover:scale-105 transition-transform">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-sm sm:text-base font-black tracking-tight text-white">Recap Mensile & Annuale</span>
                    <span className="text-[10px] bg-indigo-500/40 text-indigo-200 px-2 py-0.5 rounded-full font-extrabold uppercase tracking-wider border border-indigo-400/30">
                      Story Wrapped
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Chilometri, andamento spese, consumi e rinnovi in arrivo in stile Instagrammabile
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs font-extrabold text-indigo-300 group-hover:text-white group-hover:translate-x-1 transition-all shrink-0">
                <span className="hidden sm:inline">Apri Story</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </button>
          )}

          {/* Banner Permessi Condivisione se membro invitato */}
          {isSharedMember && (
            <div className={`p-3.5 rounded-2xl border flex items-start gap-3 text-xs ${
              isReadOnly 
                ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700/80 text-amber-950 dark:text-amber-100' 
                : isRefuelOnly 
                  ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-300 dark:border-blue-700/80 text-blue-950 dark:text-blue-100' 
                  : 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700/80 text-emerald-950 dark:text-emerald-100'
            }`}>
              <Shield className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
              <div className="flex-1">
                <span className="font-black block text-amber-950 dark:text-amber-100 text-xs sm:text-sm">
                  {isReadOnly 
                    ? 'Veicolo Condiviso: Accesso in Sola Lettura' 
                    : isRefuelOnly 
                      ? 'Veicolo Condiviso: Solo Rifornimenti' 
                      : 'Veicolo Condiviso: Accesso Completo'}
                </span>
                <span className="text-[11px] block mt-0.5 leading-relaxed text-amber-900/90 dark:text-amber-200 font-medium">
                  {isReadOnly 
                    ? 'Il proprietario ha impostato il tuo accesso in sola lettura. I pulsanti per aggiungere o modificare rifornimenti e manutenzioni sono disattivati.' 
                    : isRefuelOnly 
                      ? 'Puoi registrare rifornimenti e ricariche. L\'inserimento di manutenzioni e tagliandi è riservato al proprietario.' 
                      : 'Hai i permessi per inserire sia rifornimenti che interventi su questo veicolo.'}
                </span>
              </div>
            </div>
          )}

          {/* Pulsanti Azione Rapida */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              id="btn-quick-refuel"
              onClick={handleRefuelClick}
              className={`font-bold text-xs sm:text-sm py-3 px-4 rounded-2xl shadow-xs transition-all flex items-center justify-center gap-2 ${
                isReadOnly
                  ? 'bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 active:scale-95 text-white cursor-pointer'
              }`}
            >
              {isReadOnly ? (
                <>
                  <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                  <span>Rifornimento (Sola Lettura)</span>
                </>
              ) : (
                <>
                  {isBEV ? <Zap className="w-4 h-4 text-amber-300" /> : <Fuel className="w-4 h-4 text-blue-100" />}
                  <span>{isBEV ? 'Registra Ricarica' : 'Registra Rifornimento'}</span>
                </>
              )}
            </button>

            <button
              type="button"
              id="btn-quick-maintenance"
              onClick={handleMaintenanceClick}
              className={`font-bold text-xs sm:text-sm py-3 px-4 rounded-2xl shadow-xs transition-all flex items-center justify-center gap-2 ${
                isReadOnly || isRefuelOnly
                  ? 'bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white cursor-pointer'
              }`}
            >
              {isReadOnly ? (
                <>
                  <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                  <span>Manutenzione (Sola Lettura)</span>
                </>
              ) : isRefuelOnly ? (
                <>
                  <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                  <span>Manutenzione (Riservata Proprietario)</span>
                </>
              ) : (
                <>
                  <Wrench className="w-4 h-4 text-emerald-100" />
                  <span>Registra Tagliando / Manutenzione</span>
                </>
              )}
            </button>
          </div>

          {/* Riepilogo Spese e Consumi Diretto */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-4 sm:p-5 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-3">
              <span className="text-xs font-black uppercase text-slate-900 dark:text-white tracking-wider">
                Riepilogo Spese & Consumi
              </span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Percorsi: {metrics.totalDistance.toLocaleString('it-IT')} km
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700 p-3 rounded-2xl">
                <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 block">Spesa Totale</span>
                <span className="text-xl font-black text-slate-900 dark:text-white mt-1 block">
                  {settings.currency} {metrics.totalOverallSpent.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 block font-medium">
                  {metrics.costPerKm} {settings.currency}/km
                </span>
              </div>

              <div 
                onClick={() => setEffectiveSubModal('refuels')}
                className="bg-blue-50/80 dark:bg-blue-950/50 hover:bg-blue-100/80 dark:hover:bg-blue-900/50 border border-blue-200/80 dark:border-blue-800/70 p-3 rounded-2xl transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-blue-800 dark:text-blue-300 block">Carburante</span>
                  <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">Registro →</span>
                </div>
                <span className="text-xl font-black text-slate-900 dark:text-white mt-1 block">
                  {settings.currency} {metrics.totalFuelSpent.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="text-[11px] text-blue-700 dark:text-blue-300 mt-0.5 block font-medium">
                  {metrics.unitPer100Km !== '--' ? `${metrics.unitPer100Km} ${fuelUnit}/100km` : `${(vehicle.refuels || []).length} rifornimenti`}
                </span>
              </div>

              <div 
                onClick={() => setEffectiveSubModal('maintenances')}
                className="bg-emerald-50/80 dark:bg-emerald-950/50 hover:bg-emerald-100/80 dark:hover:bg-emerald-900/50 border border-emerald-200/80 dark:border-emerald-800/70 p-3 rounded-2xl transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-emerald-800 dark:text-emerald-300 block">Manutenzioni</span>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">Registro →</span>
                </div>
                <span className="text-xl font-black text-slate-900 dark:text-white mt-1 block">
                  {settings.currency} {metrics.totalMaintSpent.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="text-[11px] text-emerald-700 dark:text-emerald-300 mt-0.5 block font-medium">
                  {(vehicle.maintenances || []).length} interventi registrati
                </span>
              </div>
            </div>

            {/* Cicli Pieno-Pieno (se disponibili) */}
            {metrics.boardTrips.length > 0 && (
              <div 
                onClick={() => setEffectiveSubModal('trips')}
                className="mt-3.5 p-3.5 sm:p-4 bg-gradient-to-r from-blue-50/80 to-indigo-50/50 dark:from-slate-850 dark:to-blue-950/40 border border-blue-200/80 dark:border-slate-700/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-sm transition-all shadow-2xs group select-none"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                    <Gauge className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                        Cicli del Pieno (Pieno-Pieno)
                      </span>
                      <span className="text-[10px] font-black text-blue-700 dark:text-blue-300 bg-blue-100/80 dark:bg-blue-900/60 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                        {metrics.boardTrips.length} {metrics.boardTrips.length === 1 ? 'Ciclo' : 'Cicli'}
                      </span>
                    </div>
                    <p className="text-[11.5px] text-slate-600 dark:text-slate-300 mt-0.5 truncate">
                      Media reale certificata: <strong className="text-slate-900 dark:text-white font-extrabold">{metrics.kmPerUnit} km/{fuelUnit}</strong> <span className="text-slate-500 dark:text-slate-400">({metrics.unitPer100Km} {fuelUnit}/100km)</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 shrink-0 self-end sm:self-auto pt-1 sm:pt-0">
                  <span className="text-xs font-bold text-blue-700 dark:text-blue-400 group-hover:text-blue-800 dark:group-hover:text-blue-300 flex items-center gap-1 transition-colors">
                    <span>Analisi & Grafici</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* SEZIONE STORICO MOVIMENTI (CON TOGGLE TRA RIFORNIMENTI E MANUTENZIONI) */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-2xs">
            <div className="p-3 sm:p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-850/60 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setActiveRegistryTab('refuels')}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeRegistryTab === 'refuels'
                      ? 'bg-slate-900 dark:bg-indigo-600 text-white'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <span>Rifornimenti <span className="text-[10.5px] opacity-75">({vehicle.refuels?.length || 0})</span></span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveRegistryTab('maintenances')}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeRegistryTab === 'maintenances'
                      ? 'bg-slate-900 dark:bg-indigo-600 text-white'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <span>Manutenzioni <span className="text-[10.5px] opacity-75">({vehicle.maintenances?.length || 0})</span></span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (activeRegistryTab === 'refuels') setEffectiveSubModal('refuels');
                  else setEffectiveSubModal('maintenances');
                }}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center gap-0.5 cursor-pointer shrink-0"
              >
                <span>Registro <span className="hidden xs:inline">completo</span></span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-3 sm:p-4 flex flex-col gap-2">
              {activeRegistryTab === 'refuels' ? (
                (vehicle.refuels || []).length === 0 ? (
                  <div className="py-6 text-center text-slate-400 dark:text-slate-500 text-xs">
                    Nessun rifornimento registrato finora.
                  </div>
                ) : (
                  metrics.calculatedRefuels.slice(0, 4).map((refuel) => (
                    <div
                      key={refuel.id}
                      onClick={() => setSelectedDetailData({ type: 'refuel', item: refuel, deltaKm: refuel.deltaKm, unitPrice: refuel.unitPrice })}
                      className="p-3 bg-slate-50/70 dark:bg-slate-800/60 hover:bg-blue-50/50 dark:hover:bg-slate-800 border border-slate-200/70 dark:border-slate-700/70 rounded-2xl flex items-center justify-between gap-3 transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 flex items-center justify-center shrink-0">
                          <Fuel className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-900 dark:text-white">{refuel.date}</span>
                            <span className="text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-1.5 py-0.2 rounded font-semibold">
                              {refuel.type === 'full' ? 'Pieno' : 'Parziale'}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">{Number(refuel.km).toLocaleString('it-IT')} km</span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-black text-slate-900 dark:text-white block">
                          {settings.currency} {Number(refuel.price).toFixed(2)}
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                          {refuel.quantity} {refuel.unit || fuelUnit}
                        </span>
                      </div>
                    </div>
                  ))
                )
              ) : (
                (vehicle.maintenances || []).length === 0 ? (
                  <div className="py-6 text-center text-slate-400 dark:text-slate-500 text-xs">
                    Nessun intervento registrato finora.
                  </div>
                ) : (
                  (vehicle.maintenances || []).slice(0, 4).map((maint) => (
                    <div
                      key={maint.id}
                      onClick={() => setSelectedDetailData({ type: 'maintenance', item: maint })}
                      className="p-3 bg-slate-50/70 dark:bg-slate-800/60 hover:bg-emerald-50/50 dark:hover:bg-slate-800 border border-slate-200/70 dark:border-slate-700/70 rounded-2xl flex items-center justify-between gap-3 transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 flex items-center justify-center shrink-0">
                          <Wrench className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-900 dark:text-white">{maint.date}</span>
                            <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-300 px-1.5 py-0.2 rounded font-semibold">
                              {maint.category || 'Tagliando'}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">{Number(maint.km).toLocaleString('it-IT')} km</span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-black text-emerald-700 dark:text-emerald-400 block">
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
          {isDocHidden ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-8 sm:p-12 text-center flex flex-col items-center justify-center max-w-md mx-auto my-6 shadow-2xs">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60 flex items-center justify-center mb-3">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">Documenti e Libretto Riservati</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                Il proprietario ha riservato l'accesso ai documenti di circolazione e alle polizze per questo veicolo condiviso.
              </p>
            </div>
          ) : (
            <CarDocumentsVault 
              vehicle={vehicle} 
              onUpdateVehicle={onUpdateVehicle || (() => {})} 
            />
          )}
        </div>
      )}

      {/* TAB 3: ASSISTENTE & MANUALE */}
      {mainTab === 'ai' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {aiAdvices.length > 0 && (
            <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 p-3.5 rounded-2xl flex flex-col gap-2">
              <span className="text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                Avvisi di Manutenzione Consigliata
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {aiAdvices.map((adv) => (
                  <div key={adv.id} className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-amber-200 dark:border-amber-800/60 text-xs">
                    <span className="font-bold text-slate-900 dark:text-white block">{adv.title}</span>
                    <span className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5 block">{adv.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <CarAIAssistant 
            vehicle={vehicle} 
            userTier={userTier}
            onOpenUpgradeModal={onOpenUpgradeModal}
            onUpdateVehicle={onUpdateVehicle || (() => {})} 
          />
        </div>
      )}

      {/* MODALI ESISTENTI */}
      <BoardTripsModal
        isOpen={isBoardTripsModalOpen}
        onClose={handleCloseBoardTrips}
        vehicle={vehicle}
        metrics={metrics}
        settings={settings}
        returnTo={tripsReturnSource}
        onUpdateVehicle={onUpdateVehicle}
      />

      <RefuelsRegistryModal
        isOpen={isRefuelsRegistryOpen}
        onClose={() => setEffectiveSubModal(null)}
        vehicle={vehicle}
        metrics={metrics}
        settings={settings}
        onOpenAddRefuel={onOpenAddRefuel}
        onOpenEditRefuel={onOpenEditRefuel}
        onOpenBoardTrips={handleOpenBoardTripsFromRefuels}
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
        onClose={() => setEffectiveSubModal(null)}
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
