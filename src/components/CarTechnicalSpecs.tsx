import React, { useState } from 'react';
import { 
  Cpu, 
  Gauge, 
  Fuel, 
  Zap, 
  Disc, 
  Sparkles, 
  ShieldCheck, 
  Ruler, 
  RefreshCw, 
  AlertCircle,
  HelpCircle,
  FileSpreadsheet,
  BookOpen,
  ExternalLink,
  CheckCircle2,
  Upload,
  Settings
} from 'lucide-react';
import { Vehicle, VehicleTechnicalSpecs } from '../types';
import { ManualManagerModal } from './modals/ManualManagerModal';

interface CarTechnicalSpecsProps {
  vehicle: Vehicle;
  onUpdateVehicle: (updated: Vehicle) => void;
}

export const CarTechnicalSpecs: React.FC<CarTechnicalSpecsProps> = ({
  vehicle,
  onUpdateVehicle,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);

  const specs: VehicleTechnicalSpecs = vehicle.technicalSpecs || {};

  const handleGenerateWithAI = async () => {
    setIsGenerating(true);
    setGenerateError(null);
    setSuccessMessage(null);

    try {
      const res = await fetch('/api/car-assistant/specs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand: vehicle.brand,
          model: vehicle.model,
          motorization: vehicle.motorization,
          year: vehicle.registrationDate ? new Date(vehicle.registrationDate).getFullYear() : undefined,
          fuelType: vehicle.fuelType,
        }),
      });

      if (!res.ok) {
        throw new Error('Errore durante il recupero dei dati Quattroruote AI');
      }

      const data = await res.json();
      if (data.specs) {
        const updatedCar: Vehicle = {
          ...vehicle,
          technicalSpecs: data.specs,
          powerCv: data.specs.powerCv || vehicle.powerCv,
          powerKw: data.specs.powerKw || vehicle.powerKw,
        };
        onUpdateVehicle(updatedCar);
        setSuccessMessage('Scheda tecnica aggiornata con successo con i dati ufficiali Quattroruote AI!');
        setTimeout(() => setSuccessMessage(null), 4000);
      }
    } catch (err: any) {
      setGenerateError(err?.message || 'Impossibile completare la richiesta AI');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Banner AI Sync Header */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-3xl p-5 md:p-6 shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-44 h-44 bg-blue-500/20 rounded-full blur-2xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/30 text-blue-200 text-[11px] font-bold tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5" /> Dati Ufficiali Quattroruote & Costruttore
            </div>
            <h2 className="text-xl md:text-2xl font-black tracking-tight">
              {vehicle.brand} {vehicle.model}
            </h2>
            <p className="text-xs md:text-sm text-blue-100/90 leading-relaxed">
              {specs.summaryQuattroruote || 
                `${vehicle.motorization || vehicle.fuelType} con tutte le specifiche di fabbrica, pressioni pneumatici e lubrificanti omologati.`}
            </p>
          </div>

          <button
            type="button"
            onClick={handleGenerateWithAI}
            disabled={isGenerating}
            className="self-start md:self-auto inline-flex items-center gap-2 px-4 py-2.5 bg-white text-blue-900 hover:bg-blue-50 font-bold rounded-2xl shadow-sm hover:shadow transition-all text-xs active:scale-95 disabled:opacity-75 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 text-blue-600 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Ricerca dati Quattroruote...' : 'Ricalcola con AI'}</span>
          </button>
        </div>

        {successMessage && (
          <div className="mt-3 p-3 bg-emerald-500/20 border border-emerald-400/40 rounded-xl text-emerald-200 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <ShieldCheck className="w-4 h-4 text-emerald-300 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {generateError && (
          <div className="mt-3 p-3 bg-rose-500/20 border border-rose-400/40 rounded-xl text-rose-200 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-300 shrink-0" />
            <span>{generateError}</span>
          </div>
        )}
      </div>

      {/* OFFICIAL OWNER'S MANUAL CARD */}
      {(vehicle.manualInfo || specs.manualInfo) && (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-4 sm:p-6 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h3 className="text-sm md:text-base font-black text-slate-900 truncate">
                    {(vehicle.manualInfo || specs.manualInfo)?.title || `Manuale di Uso e Manutenzione Ufficiale`}
                  </h3>
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 font-extrabold px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1 shrink-0">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Indicizzato
                  </span>
                </div>
                <p className="text-xs text-slate-500 truncate mt-0.5">
                  Fonte: {(vehicle.manualInfo || specs.manualInfo)?.source || 'Manuale Costruttore'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setIsManualModalOpen(true)}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition-all cursor-pointer shrink-0 active:scale-95 border border-slate-200"
                title="Gestisci, cerca o allega manuale"
              >
                <Upload className="w-3.5 h-3.5 text-blue-600" />
                <span>Gestisci</span>
              </button>

              {(vehicle.manualInfo || specs.manualInfo)?.url && (
                <a
                  href={(vehicle.manualInfo || specs.manualInfo)?.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-xs transition-all cursor-pointer shrink-0 active:scale-95"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>PDF</span>
                </a>
              )}
            </div>
          </div>

          {(vehicle.manualInfo || specs.manualInfo)?.indexedChapters && (
            <div className="pt-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Capitoli e Sezioni di Bordo Indicizzate:</span>
              <div className="flex flex-wrap gap-1.5">
                {(vehicle.manualInfo || specs.manualInfo)?.indexedChapters?.map((chap, idx) => (
                  <span key={idx} className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200/70 font-medium">
                    {chap}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* GRID SPECIFICHE CHIAVE */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3 md:gap-4">
        
        {/* Potenza */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-3 sm:p-4 shadow-xs hover:border-blue-300 transition-colors min-w-0">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-[11px] sm:text-xs font-bold truncate">Potenza Max</span>
            <Gauge className="w-4 h-4 text-blue-600 shrink-0" />
          </div>
          <div className="text-lg sm:text-xl font-black text-slate-900 truncate">
            {specs.powerCv || vehicle.powerCv ? `${specs.powerCv || vehicle.powerCv} CV` : '—'}
          </div>
          <div className="text-[11px] font-semibold text-slate-500 mt-0.5 truncate">
            {specs.powerKw || vehicle.powerKw ? `${specs.powerKw || vehicle.powerKw} kW` : (vehicle.powerCv ? `${Math.round(vehicle.powerCv * 0.735)} kW` : '')}
          </div>
        </div>

        {/* Cilindrata & Motore */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-3 sm:p-4 shadow-xs hover:border-blue-300 transition-colors min-w-0">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-[11px] sm:text-xs font-bold truncate">Cilindrata</span>
            <Cpu className="w-4 h-4 text-indigo-600 shrink-0" />
          </div>
          <div className="text-lg sm:text-xl font-black text-slate-900 truncate">
            {specs.engineDisplacementCc ? `${specs.engineDisplacementCc} cm³` : (vehicle.fuelType === 'Elettrica (BEV)' ? 'Full Electric' : '—')}
          </div>
          <div className="text-[11px] font-semibold text-slate-500 mt-0.5 truncate">
            {specs.cylinderCount ? `${specs.cylinderCount} cilindri` : (specs.engineCode ? `Cod. ${specs.engineCode}` : vehicle.fuelType)}
          </div>
        </div>

        {/* Coppia */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-3 sm:p-4 shadow-xs hover:border-blue-300 transition-colors min-w-0">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-[11px] sm:text-xs font-bold truncate">Coppia Motrice</span>
            <Zap className="w-4 h-4 text-amber-500 shrink-0" />
          </div>
          <div className="text-lg sm:text-xl font-black text-slate-900 truncate">
            {specs.torqueNm ? `${specs.torqueNm} Nm` : '—'}
          </div>
          <div className="text-[11px] font-semibold text-slate-500 mt-0.5 truncate">
            Erogazione istantanea
          </div>
        </div>

        {/* Classe Ambientale */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-3 sm:p-4 shadow-xs hover:border-blue-300 transition-colors min-w-0">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-[11px] sm:text-xs font-bold truncate">Omologazione</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          </div>
          <div className="text-lg sm:text-xl font-black text-slate-900 truncate">
            {specs.euroClass || 'Euro 6'}
          </div>
          <div className="text-[11px] font-semibold text-slate-500 mt-0.5 truncate">
            Voce V.9 Libretto
          </div>
        </div>

        {/* Serbatoio / Batteria */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-3 sm:p-4 shadow-xs hover:border-blue-300 transition-colors min-w-0">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-[11px] sm:text-xs font-bold truncate">Serbatoio</span>
            <Fuel className="w-4 h-4 text-rose-500 shrink-0" />
          </div>
          <div className="text-lg sm:text-xl font-black text-slate-900 truncate">
            {specs.fuelCapacityLiters || vehicle.tankCapacity ? `${specs.fuelCapacityLiters || vehicle.tankCapacity} Litri` : (specs.batteryCapacityKwh ? `${specs.batteryCapacityKwh} kWh` : '—')}
          </div>
          <div className="text-[11px] font-semibold text-slate-500 mt-0.5 truncate">
            {specs.wltpRangeKm ? `Autonomia ~${specs.wltpRangeKm} km` : 'Autonomia standard'}
          </div>
        </div>

        {/* Consumo Medio WLTP */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-3 sm:p-4 shadow-xs hover:border-blue-300 transition-colors min-w-0">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-[11px] sm:text-xs font-bold truncate">Consumi WLTP</span>
            <FileSpreadsheet className="w-4 h-4 text-teal-600 shrink-0" />
          </div>
          <div className="text-sm sm:text-base font-black text-slate-900 truncate">
            {specs.wltpConsumption || '5.2 L / 100km'}
          </div>
          <div className="text-[11px] font-semibold text-slate-500 mt-0.5 truncate">
            Ciclo combinato
          </div>
        </div>

        {/* Trasmissione e Trazione */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-3 sm:p-4 shadow-xs hover:border-blue-300 transition-colors col-span-2 min-w-0">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] sm:text-xs font-bold truncate">Cambio & Trazione</span>
            <Disc className="w-4 h-4 text-purple-600 shrink-0" />
          </div>
          <div className="text-xs sm:text-sm font-black text-slate-900 truncate">
            {specs.transmission || 'Automatico / Manuale'}
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-0.5 truncate">
            {specs.drivetrain || vehicle.driveType || 'Trazione standard di serie'}
          </div>
        </div>

      </div>

      {/* SEZIONE PRESSIONE GOMME & MISURE OMOLOGATE A LIBRETTO */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-5 md:p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Disc className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm md:text-base font-bold text-slate-900">Pressione Pneumatici Raccomandata</h3>
              <p className="text-xs text-slate-500">Valori consigliati a freddo per il massimo comfort e sicurezza</p>
            </div>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg">
            Tabella Bar
          </span>
        </div>

        {/* Visualizzatore 4 Ruote */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/70 text-center">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Asse Anteriore</div>
            <div className="text-2xl font-black text-blue-600 mt-1">
              {specs.tirePressureFrontBar || 2.3} <span className="text-sm font-bold text-slate-500">bar</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">{( (specs.tirePressureFrontBar || 2.3) * 14.5038 ).toFixed(1)} PSI</div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/70 text-center">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Asse Posteriore</div>
            <div className="text-2xl font-black text-blue-600 mt-1">
              {specs.tirePressureRearBar || 2.3} <span className="text-sm font-bold text-slate-500">bar</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">{( (specs.tirePressureRearBar || 2.3) * 14.5038 ).toFixed(1)} PSI</div>
          </div>

          <div className="bg-amber-50/70 rounded-2xl p-4 border border-amber-200/70 text-center">
            <div className="text-xs font-semibold text-amber-800 uppercase tracking-wide">A Pieno Carico / Autostrada</div>
            <div className="text-2xl font-black text-amber-700 mt-1">
              {specs.tirePressureLoadedBar || 2.7} <span className="text-sm font-bold text-amber-800">bar</span>
            </div>
            <div className="text-[11px] text-amber-700/80 mt-0.5">{( (specs.tirePressureLoadedBar || 2.7) * 14.5038 ).toFixed(1)} PSI</div>
          </div>

        </div>

        {/* Misure pneumatici omologati */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <div className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Misure Pneumatici Omologati (Elenco Libretto di Circolazione):
          </div>
          <div className="flex flex-wrap gap-2">
            {specs.allowedTireSizes && specs.allowedTireSizes.length > 0 ? (
              specs.allowedTireSizes.map((size, idx) => (
                <span 
                  key={idx} 
                  className="px-3 py-1.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-800 text-xs font-bold rounded-xl border border-slate-200 transition-colors"
                >
                  {size}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-500 italic">
                Nessuna misura caricata. Clicca &quot;Ricalcola con AI&quot; per generare le misure omologate Quattroruote.
              </span>
            )}
          </div>
        </div>
      </div>

      {/* SEZIONE LUBRIFICANTI & FLUIDI UFFICIALI */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-5 md:p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Fuel className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm md:text-base font-bold text-slate-900">Specifiche Olio Motore & Fluidi</h3>
            <p className="text-xs text-slate-500">Gradazione e omologazione ufficiale per preservare la garanzia</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
            <span className="text-xs font-semibold text-slate-500">Olio Motore Raccomandato:</span>
            <div className="text-sm font-black text-slate-900 mt-1">
              {specs.recommendedOil || '0W-20 / 5W-30 (Specifica Costruttore)'}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Capacità coppa con filtro: <span className="font-bold text-slate-800">{specs.oilCapacityLiters ? `${specs.oilCapacityLiters} Litri` : '4.5 L'}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
            <span className="text-xs font-semibold text-slate-500">Identificativi Telaio & Motore:</span>
            <div className="text-xs font-mono font-bold text-slate-900 mt-1">
              VIN: {specs.vin || 'ZAR9520000******'}
            </div>
            <div className="text-xs font-mono text-slate-600 mt-1">
              Codice Motore (P.5): <span className="font-bold text-slate-800">{specs.engineCode || 'N/D'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* DIMENSIONI E PESI */}
      {specs.dimensions && (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-5 md:p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
              <Ruler className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm md:text-base font-bold text-slate-900">Dimensioni, Pesi e Capacità di Carico</h3>
              <p className="text-xs text-slate-500">Misure d&apos;ingombro esterno e volume di carico</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl text-center border border-slate-200/60">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Lunghezza</span>
              <div className="text-sm font-black text-slate-900 mt-0.5">{specs.dimensions.lengthMm || 4400} mm</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl text-center border border-slate-200/60">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Larghezza</span>
              <div className="text-sm font-black text-slate-900 mt-0.5">{specs.dimensions.widthMm || 1800} mm</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl text-center border border-slate-200/60">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Altezza</span>
              <div className="text-sm font-black text-slate-900 mt-0.5">{specs.dimensions.heightMm || 1450} mm</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl text-center border border-slate-200/60">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Bagagliaio</span>
              <div className="text-sm font-black text-slate-900 mt-0.5">{specs.dimensions.trunkLiters || 400} L</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl text-center border border-slate-200/60">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Massa a vuoto</span>
              <div className="text-sm font-black text-slate-900 mt-0.5">{specs.dimensions.curbWeightKg || 1400} kg</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl text-center border border-slate-200/60">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Rimorchiabile</span>
              <div className="text-sm font-black text-slate-900 mt-0.5">{specs.dimensions.towingCapacityKg || 1500} kg</div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL GESTIONE MANUALE */}
      <ManualManagerModal
        isOpen={isManualModalOpen}
        vehicle={vehicle}
        onClose={() => setIsManualModalOpen(false)}
        onSaveManual={(updatedVehicle) => {
          onUpdateVehicle(updatedVehicle);
          setIsManualModalOpen(false);
        }}
      />
    </div>
  );
};
