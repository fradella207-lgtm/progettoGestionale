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
  ArrowRightLeft
} from 'lucide-react';
import { Vehicle } from '../types';
import { CarTechnicalSpecs } from './CarTechnicalSpecs';
import { CarDocumentsVault } from './CarDocumentsVault';
import { CarAIAssistant } from './CarAIAssistant';

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

  const currentVehicle = vehicles.find(v => v.id === selectedVehicleId) || vehicles[0];

  if (!currentVehicle) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10 text-center space-y-4">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
          <Car className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Nessuna auto presente nel tuo Garage</h2>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Aggiungi il tuo primo veicolo per accedere alle schede tecniche Quattroruote, al libretto digitale e all&apos;assistente AI.
        </p>
        {onOpenAddVehicleModal && (
          <button
            type="button"
            onClick={onOpenAddVehicleModal}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-xs shadow-sm"
          >
            Aggiungi Auto al Garage
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

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 md:py-6 space-y-6 font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* VEHICLE SELECTOR & HERO CARD */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-5 md:p-6 shadow-xs space-y-5">
        
        {/* Top selector row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400">Veicolo Selezionato:</span>
            <div className="flex flex-wrap items-center gap-2">
              {vehicles.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => onSelectVehicle(v.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    v.id === currentVehicle.id
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Car className="w-3.5 h-3.5" />
                  <span>{v.brand} {v.model}</span>
                </button>
              ))}
            </div>
          </div>

          {vehicles.length > 1 && (
            <span className="text-xs text-slate-400 font-medium">
              {vehicles.length} veicoli nel garage
            </span>
          )}
        </div>

        {/* HERO DETAILS */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          
          {/* Car Photo */}
          <div className="md:col-span-4 relative rounded-2xl overflow-hidden aspect-16/10 bg-slate-900 border border-slate-200 shadow-inner group">
            <img
              src={currentVehicle.photoUrl || 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800&auto=format&fit=crop&q=80'}
              alt={`${currentVehicle.brand} ${currentVehicle.model}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute top-2.5 left-2.5 px-2.5 py-1 bg-black/75 backdrop-blur-xs text-white rounded-lg font-mono font-bold text-xs tracking-wider border border-white/20">
              {currentVehicle.plate || 'TARGA'}
            </div>
            <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 bg-blue-600/90 backdrop-blur-xs text-white rounded-md font-bold text-[10px]">
              {currentVehicle.fuelType}
            </div>
          </div>

          {/* Car Meta and Quick Stats */}
          <div className="md:col-span-8 space-y-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-blue-600">Scheda Tecnica & Assistenza</span>
                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                <span className="text-xs text-slate-500 font-semibold">
                  Immatricolazione: {currentVehicle.registrationDate ? new Date(currentVehicle.registrationDate).toLocaleDateString('it-IT') : 'N/D'}
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight mt-1">
                {currentVehicle.brand} {currentVehicle.model}
              </h1>
              <p className="text-xs md:text-sm text-slate-500 font-medium mt-0.5">
                {currentVehicle.motorization || currentVehicle.fuelType} 
                {currentVehicle.powerCv ? ` • ${currentVehicle.powerCv} CV (${currentVehicle.powerKw || Math.round(currentVehicle.powerCv * 0.735)} kW)` : ''}
              </p>
            </div>

            {/* Micro badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Chilometri Attuali</span>
                <span className="text-sm font-black text-slate-900 mt-0.5 block">{currentKm.toLocaleString('it-IT')} km</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Documenti Salvati</span>
                <span className="text-sm font-black text-slate-900 mt-0.5 block">{currentVehicle.documents?.length || 0} file</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Tagliandi Eseguiti</span>
                <span className="text-sm font-black text-slate-900 mt-0.5 block">{currentVehicle.maintenances?.length || 0}</span>
              </div>
              <div className="p-3 bg-blue-50/70 rounded-2xl border border-blue-200/70">
                <span className="text-[10px] font-bold text-blue-700 uppercase block">Assistente AI</span>
                <span className="text-xs font-black text-blue-900 mt-0.5 block flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Attivo & Pronto
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* SECTION TABS (Scheda Tecnica / Documenti / Assistente AI) */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-200/80 rounded-2xl max-w-md">
        
        <button
          type="button"
          onClick={() => setActiveTab('specs')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'specs'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4 text-blue-600" />
          <span>Scheda Tecnica</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('documents')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer relative ${
            activeTab === 'documents'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4 text-indigo-600" />
          <span>Documenti & DUC</span>
          {currentVehicle.documents && currentVehicle.documents.length > 0 && (
            <span className="w-4 h-4 rounded-full bg-slate-900 text-white text-[9px] font-black flex items-center justify-center">
              {currentVehicle.documents.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('assistant')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'assistant'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Bot className="w-4 h-4 text-emerald-600" />
          <span>Assistente AI</span>
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

    </div>
  );
};
