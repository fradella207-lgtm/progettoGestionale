import React, { useState } from 'react';
import { 
  Car, 
  FileText, 
  Bot, 
  Sparkles, 
  ChevronRight, 
  Layers, 
  Calendar, 
  Gauge, 
  Fuel, 
  ShieldCheck, 
  Plus,
  ArrowRightLeft,
  BookOpen,
  Upload
} from 'lucide-react';
import { Vehicle } from '../types';
import { CarTechnicalSpecs } from './CarTechnicalSpecs';
import { CarDocumentsVault } from './CarDocumentsVault';
import { CarAIAssistant } from './CarAIAssistant';
import { ManualManagerModal } from './modals/ManualManagerModal';

interface MyCarDashboardProps {
  vehicles: Vehicle[];
  selectedVehicleId: string;
  onSelectVehicle: (id: string) => void;
  onUpdateVehicle: (updated: Vehicle) => void;
  onOpenAddVehicleModal?: () => void;
}

export const MyCarDashboard: React.FC<MyCarDashboardProps> = ({
  vehicles,
  selectedVehicleId,
  onSelectVehicle,
  onUpdateVehicle,
  onOpenAddVehicleModal,
}) => {
  const [activeTab, setActiveTab] = useState<'specs' | 'documents' | 'assistant'>('specs');
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);

  const currentVehicle = vehicles.find(v => v.id === selectedVehicleId) || vehicles[0];

  if (!currentVehicle) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 text-center space-y-4 font-['Plus_Jakarta_Sans',sans-serif]">
        <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto shadow-xs border border-indigo-100">
          <Car className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-slate-950">Nessuna auto presente nel tuo Garage</h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
          Aggiungi il tuo primo veicolo per accedere alle schede tecniche Quattroruote, al libretto digitale e all&apos;assistente AI.
        </p>
        {onOpenAddVehicleModal && (
          <button
            type="button"
            onClick={onOpenAddVehicleModal}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold rounded-2xl text-xs sm:text-sm shadow-xs transition-all cursor-pointer inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Aggiungi Auto al Garage</span>
          </button>
        )}
      </div>
    );
  }

  // Calculate current kilometers
  const maxRefuelKm = currentVehicle.refuels?.length 
    ? Math.max(...currentVehicle.refuels.map(r => r.km)) 
    : 0;
  const maxMaintKm = currentVehicle.maintenances?.length 
    ? Math.max(...currentVehicle.maintenances.map(m => m.km)) 
    : 0;
  const currentKm = Math.max(currentVehicle.initialKm || 0, maxRefuelKm, maxMaintKm);
  const hasManual = !!(currentVehicle.manualInfo || currentVehicle.technicalSpecs?.manualInfo);

  return (
    <div className="w-full max-w-6xl mx-auto px-2.5 sm:px-6 py-2.5 sm:py-6 space-y-3.5 sm:space-y-6 pb-4 font-['Plus_Jakarta_Sans',sans-serif] min-w-0 overflow-x-hidden">
      
      {/* VEHICLE SELECTOR & HERO CARD */}
      <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-3 sm:p-6 shadow-xs space-y-3 sm:space-y-5 w-full min-w-0 overflow-hidden">
        
        {/* Top selector row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5 w-full min-w-0">
          <div className="w-full min-w-0 flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 shrink-0">Auto:</span>
            <div className="flex items-center gap-1.5 min-w-0">
              {vehicles.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => onSelectVehicle(v.id)}
                  className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap active:scale-95 shrink-0 ${
                    v.id === currentVehicle.id
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/70'
                  }`}
                >
                  <Car className={`w-3.5 h-3.5 ${v.id === currentVehicle.id ? 'text-indigo-400' : 'text-slate-400'}`} />
                  <span className="truncate max-w-[160px] xs:max-w-[220px]">{v.brand} {v.model}</span>
                </button>
              ))}
            </div>
          </div>

          {vehicles.length > 1 && (
            <span className="text-[11px] text-slate-400 font-bold shrink-0 hidden sm:inline">
              {vehicles.length} auto nel garage
            </span>
          )}
        </div>

        {/* HERO DETAILS */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-6 items-center w-full min-w-0">
          
          {/* Car Photo */}
          <div className="md:col-span-4 relative rounded-2xl sm:rounded-3xl overflow-hidden aspect-[16/10] sm:aspect-video md:aspect-[16/10] bg-slate-900 border border-slate-200 shadow-inner group w-full">
            <img
              src={currentVehicle.photoUrl || 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800&auto=format&fit=crop&q=80'}
              alt={`${currentVehicle.brand} ${currentVehicle.model}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-slate-950/30 pointer-events-none" />
            <div className="absolute top-2 left-2 px-2 py-0.8 bg-slate-950/85 backdrop-blur-md text-white rounded-lg font-mono font-black text-[11px] tracking-wider border border-white/20">
              {currentVehicle.plate || 'TARGA'}
            </div>
            <div className="absolute bottom-2 right-2 px-2 py-0.8 bg-indigo-600/90 backdrop-blur-md text-white rounded-lg font-black text-[11px] shadow-xs">
              {currentVehicle.fuelType}
            </div>
          </div>

          {/* Car Meta and Quick Stats */}
          <div className="md:col-span-8 space-y-2.5 sm:space-y-3 min-w-0 w-full">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10.5px] font-black uppercase tracking-wider text-indigo-600">Scheda Tecnica & AI</span>
                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                <span className="text-[11px] text-slate-500 font-semibold truncate">
                  Immatr.: {currentVehicle.registrationDate ? new Date(currentVehicle.registrationDate).toLocaleDateString('it-IT') : 'N/D'}
                </span>
              </div>
              <h1 className="text-lg sm:text-2xl md:text-3xl font-black text-slate-950 tracking-tight mt-0.5 break-words">
                {currentVehicle.brand} <span className="text-indigo-600">{currentVehicle.model}</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5 break-words">
                {currentVehicle.motorization || currentVehicle.fuelType} 
                {currentVehicle.powerCv ? ` • ${currentVehicle.powerCv} CV (${currentVehicle.powerKw || Math.round(currentVehicle.powerCv * 0.735)} kW)` : ''}
              </p>
            </div>

            {/* Micro badges - 2 columns on mobile, 4 on desktop */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 text-xs w-full min-w-0">
              <div className="p-2 sm:p-3 bg-slate-50 rounded-xl sm:rounded-2xl border border-slate-200/80 min-w-0">
                <span className="text-[10px] sm:text-[11px] font-extrabold text-slate-400 uppercase block truncate">Chilometri</span>
                <span className="text-xs sm:text-sm font-black text-slate-900 mt-0.5 block truncate">{currentKm.toLocaleString('it-IT')} km</span>
              </div>
              <div className="p-2 sm:p-3 bg-slate-50 rounded-xl sm:rounded-2xl border border-slate-200/80 min-w-0">
                <span className="text-[10px] sm:text-[11px] font-extrabold text-slate-400 uppercase block truncate">Documenti</span>
                <span className="text-xs sm:text-sm font-black text-slate-900 mt-0.5 block truncate">{currentVehicle.documents?.length || 0} file</span>
              </div>
              <div className="p-2 sm:p-3 bg-slate-50 rounded-xl sm:rounded-2xl border border-slate-200/80 min-w-0">
                <span className="text-[10px] sm:text-[11px] font-extrabold text-slate-400 uppercase block truncate">Tagliandi</span>
                <span className="text-xs sm:text-sm font-black text-slate-900 mt-0.5 block truncate">{currentVehicle.maintenances?.length || 0}</span>
              </div>
              <button
                type="button"
                onClick={() => setIsManualModalOpen(true)}
                className={`p-2 sm:p-3 rounded-xl sm:rounded-2xl border text-left cursor-pointer transition-all hover:scale-[1.01] active:scale-95 min-w-0 min-h-[44px] ${
                  hasManual 
                    ? 'bg-emerald-50 hover:bg-emerald-100/80 border-emerald-200 shadow-2xs' 
                    : 'bg-indigo-50 hover:bg-indigo-100/80 border-indigo-200 shadow-2xs'
                }`}
                title="Visualizza, allega o cerca il manuale ufficiale di bordo"
              >
                <span className={`text-[10px] sm:text-[11px] font-extrabold uppercase block truncate ${hasManual ? 'text-emerald-700' : 'text-indigo-700'}`}>Manuale</span>
                <span className={`text-[11px] sm:text-xs font-black mt-0.5 flex items-center gap-1 truncate ${hasManual ? 'text-emerald-900' : 'text-indigo-900'}`}>
                  {hasManual ? <BookOpen className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> : <Upload className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                  <span className="truncate">{hasManual ? 'Indicizzato' : 'Allega PDF'}</span>
                </span>
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* SECTION TABS (Scheda Tecnica / Documenti / Assistente AI) - 3 Equal columns on mobile that NEVER overflow */}
      <div className="grid grid-cols-3 gap-1 p-1 bg-slate-200/80 rounded-2xl w-full sm:max-w-xl shadow-inner min-w-0">
        
        <button
          type="button"
          onClick={() => setActiveTab('specs')}
          className={`min-h-[44px] py-2 px-1.5 sm:px-2.5 rounded-xl text-[11px] sm:text-sm font-black transition-all flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer active:scale-95 min-w-0 ${
            activeTab === 'specs'
              ? 'bg-white text-slate-950 shadow-xs'
              : 'text-slate-600 hover:text-slate-950 hover:bg-white/40'
          }`}
        >
          <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-600 shrink-0" />
          <span className="truncate">Scheda</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('documents')}
          className={`min-h-[44px] py-2 px-1.5 sm:px-2.5 rounded-xl text-[11px] sm:text-sm font-black transition-all flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer relative active:scale-95 min-w-0 ${
            activeTab === 'documents'
              ? 'bg-white text-slate-950 shadow-xs'
              : 'text-slate-600 hover:text-slate-950 hover:bg-white/40'
          }`}
        >
          <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-700 shrink-0" />
          <span className="truncate">Libretto</span>
          {currentVehicle.documents && currentVehicle.documents.length > 0 && (
            <span className="w-4 h-4 rounded-full bg-slate-900 text-white text-[9px] font-black flex items-center justify-center shrink-0">
              {currentVehicle.documents.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('assistant')}
          className={`min-h-[44px] py-2 px-1.5 sm:px-2.5 rounded-xl text-[11px] sm:text-sm font-black transition-all flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer active:scale-95 min-w-0 ${
            activeTab === 'assistant'
              ? 'bg-white text-slate-950 shadow-xs'
              : 'text-slate-600 hover:text-slate-950 hover:bg-white/40'
          }`}
        >
          <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 shrink-0" />
          <span className="truncate">Assistente AI</span>
        </button>

      </div>

      {/* ACTIVE TAB CONTENT */}
      {activeTab === 'specs' && (
        <CarTechnicalSpecs 
          vehicle={currentVehicle}
          onUpdateVehicle={onUpdateVehicle}
        />
      )}

      {activeTab === 'documents' && (
        <CarDocumentsVault 
          vehicle={currentVehicle}
          onUpdateVehicle={onUpdateVehicle}
        />
      )}

      {activeTab === 'assistant' && (
        <CarAIAssistant 
          vehicle={currentVehicle}
          onUpdateVehicle={onUpdateVehicle}
        />
      )}

      {/* MODAL GESTIONE & ALLEGATO MANUALE */}
      <ManualManagerModal
        isOpen={isManualModalOpen}
        vehicle={currentVehicle}
        onClose={() => setIsManualModalOpen(false)}
        onSaveManual={(updatedVehicle) => {
          onUpdateVehicle(updatedVehicle);
          setIsManualModalOpen(false);
        }}
      />

    </div>
  );
};


