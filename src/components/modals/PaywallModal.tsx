import React, { useState } from 'react';
import { 
  X, 
  Crown, 
  Sparkles, 
  Check, 
  Zap, 
  ShieldCheck, 
  Car, 
  Bot, 
  FileText, 
  Cloud, 
  Fuel, 
  ArrowRight,
  HelpCircle,
  Clock
} from 'lucide-react';
import { ProFeatureName } from '../../types';
import { 
  PRO_PRICING_OPTIONS, 
  FREE_VS_PRO_COMPARISON, 
  PRO_FEATURES_CATALOG 
} from '../../utils/tierManager';
import { useSwipeBack } from '../../hooks/useSwipeBack';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  triggerFeature?: ProFeatureName;
  targetFeature?: ProFeatureName;
  onUpgradeSuccess: (selectedPlan: 'annual' | 'lifetime') => void;
}

export const PaywallModal: React.FC<PaywallModalProps> = ({
  isOpen,
  onClose,
  triggerFeature,
  targetFeature,
  onUpgradeSuccess
}) => {
  const activeFeature = triggerFeature || targetFeature;
  const [selectedPlanId, setSelectedPlanId] = useState<'annual' | 'lifetime'>('lifetime');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showComparison, setShowComparison] = useState(false);

  // Support swipe right gesture to go back / close
  useSwipeBack({
    onBack: onClose,
    enabled: isOpen
  });

  if (!isOpen) return null;

  const handleActivatePro = () => {
    setIsProcessing(true);
    // Simulate instantaneous, frictionless upgrade
    setTimeout(() => {
      setIsProcessing(false);
      onUpgradeSuccess(selectedPlanId);
      onClose();
    }, 700);
  };

  const featureDetail = activeFeature ? PRO_FEATURES_CATALOG[activeFeature] : null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl w-full max-w-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto font-['Plus_Jakarta_Sans',sans-serif] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* TOP HERO BANNER */}
        <div className="relative bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-7 overflow-hidden">
          
          {/* Ambient glow effects */}
          <div className="absolute -top-16 -right-16 w-56 h-56 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Close Button */}
          <button 
            type="button"
            onClick={onClose}
            aria-label="Chiudi finestra"
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all cursor-pointer backdrop-blur-sm"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header content */}
          <div className="flex items-center gap-2 mb-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 text-[11px] font-black tracking-wide uppercase shadow-md shadow-amber-500/20">
              <Crown className="w-3.5 h-3.5 fill-slate-950" />
              <span>MyGarage360 PRO</span>
            </span>
            <span className="text-xs text-indigo-200 font-medium hidden xs:inline">
              Sblocca il pieno potenziale
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white leading-snug">
            {featureDetail ? (
              <>Sblocca <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-200">{featureDetail.shortTitle}</span> e tutte le funzioni PRO</>
            ) : (
              <>Prenditi cura del tuo garage con <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-200">MyGarage360 PRO</span></>
            )}
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-md leading-relaxed">
            {featureDetail ? (
              featureDetail.description
            ) : (
              'Garage illimitato, Assistente AI diagnostico 24/7, Passaporto Digitale ufficiale e sincronizzazione cloud in tempo reale.'
            )}
          </p>

          {/* Trigger Context Warning if feature was blocked */}
          {featureDetail && (
            <div className="mt-3.5 px-3 py-2 rounded-xl bg-amber-500/15 border border-amber-400/30 flex items-center gap-2 text-xs text-amber-200">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>Limite Piano Free:</strong> {featureDetail.freeLimit}. Passa a PRO per sbloccare l&apos;accesso illimitato.
              </span>
            </div>
          )}
        </div>

        {/* MODAL BODY */}
        <div className="p-5 sm:p-6 flex flex-col gap-5 max-h-[60vh] overflow-y-auto">
          
          {/* 1. SELEZIONE PIANI TARIFFARI */}
          <div className="flex flex-col gap-2.5">
            <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
              Seleziona la tua opzione
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PRO_PRICING_OPTIONS.map((plan) => {
                const isSelected = selectedPlanId === plan.id;
                return (
                  <div 
                    key={plan.id}
                    onClick={() => setSelectedPlanId(plan.id)}
                    className={`relative rounded-2xl p-4 border-2 transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/40 shadow-md ring-2 ring-indigo-600/10'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    {/* Badge più popolare */}
                    {plan.badge && (
                      <span className="absolute -top-2.5 right-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-xs uppercase tracking-wider">
                        {plan.badge}
                      </span>
                    )}

                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-extrabold text-sm text-slate-900">{plan.name}</span>
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                          isSelected ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300 bg-white'
                        }`}>
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>

                      <div className="flex items-baseline gap-1 mt-2">
                        <span className="text-2xl font-black text-slate-950 tracking-tight">{plan.price}</span>
                        <span className="text-xs font-bold text-slate-500">{plan.period}</span>
                      </div>

                      <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                        {plan.description}
                      </p>
                    </div>

                    {plan.savings && (
                      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center gap-1 text-[10px] font-black text-indigo-700">
                        <Zap className="w-3 h-3 fill-indigo-600" />
                        <span>{plan.savings}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. BENEFICI CHIAVE INCLUSI */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80">
            <span className="text-[11px] font-black text-slate-700 uppercase tracking-wider block mb-2.5">
              Cosa include MyGarage360 PRO:
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2 text-slate-800">
                <div className="w-5 h-5 rounded-md bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                  <Car className="w-3.5 h-3.5" />
                </div>
                <span><strong>Garage Illimitato</strong> (2+ veicoli)</span>
              </div>

              <div className="flex items-center gap-2 text-slate-800">
                <div className="w-5 h-5 rounded-md bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <span><strong>Assistente Meccanico AI</strong> 24/7</span>
              </div>

              <div className="flex items-center gap-2 text-slate-800">
                <div className="w-5 h-5 rounded-md bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                  <FileText className="w-3.5 h-3.5" />
                </div>
                <span><strong>Passaporto Digitale</strong> (PDF/CSV)</span>
              </div>

              <div className="flex items-center gap-2 text-slate-800">
                <div className="w-5 h-5 rounded-md bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                  <Cloud className="w-3.5 h-3.5" />
                </div>
                <span><strong>Cloud Sync Automatico</strong></span>
              </div>

              <div className="flex items-center gap-2 text-slate-800 sm:col-span-2">
                <div className="w-5 h-5 rounded-md bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                  <Fuel className="w-3.5 h-3.5" />
                </div>
                <span><strong>Allerte & Radar Prezzi Carburante</strong> di zona</span>
              </div>
            </div>
          </div>

          {/* 3. CONFRONTO DETTAGLIATO FREE VS PRO (TOGGLE) */}
          <div>
            <button
              type="button"
              onClick={() => setShowComparison(!showComparison)}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{showComparison ? 'Nascondi tabella di confronto' : 'Confronta nel dettaglio: Piano Free vs Piano PRO'}</span>
            </button>

            {showComparison && (
              <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 text-xs animate-in fade-in duration-150">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-extrabold border-b border-slate-200">
                      <th className="p-2.5">Funzionalità</th>
                      <th className="p-2.5 text-slate-500">FREE</th>
                      <th className="p-2.5 text-indigo-700 bg-indigo-50/50">PRO</th>
                    </tr>
                  </thead>
                  <tbody>
                    {FREE_VS_PRO_COMPARISON.map((row, idx) => (
                      <tr key={idx} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50">
                        <td className="p-2.5 font-bold text-slate-900">{row.feature}</td>
                        <td className="p-2.5 text-slate-500">{row.free}</td>
                        <td className="p-2.5 font-bold text-indigo-900 bg-indigo-50/30">{row.pro}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* SICUREZZA E GARANZIA */}
          <div className="flex items-center gap-2 text-[11px] text-slate-500 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Attivazione istantanea sul tuo account. Nessuna pubblicità, nessun vincolo nascosto.</span>
          </div>

        </div>

        {/* FOOTER ACTIONS */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-center sm:text-left">
            <span className="text-xs font-bold text-slate-900 block">
              Piano selezionato: {selectedPlanId === 'lifetime' ? 'Pass a Vita (11,99 €)' : 'Annuale (3,99 € / anno)'}
            </span>
            <span className="text-[10px] text-slate-500">
              {selectedPlanId === 'lifetime' ? 'Un solo pagamento una tantum • Per sempre' : 'Rinnovo annuale • Disdici quando vuoi'}
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 rounded-xl transition-colors cursor-pointer"
            >
              Più Tardi
            </button>

            <button
              type="button"
              id="btn-confirm-upgrade-pro"
              onClick={handleActivatePro}
              disabled={isProcessing}
              className="flex-1 sm:flex-none px-6 py-2.5 bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 hover:from-indigo-700 hover:to-indigo-900 active:scale-95 text-white text-xs sm:text-sm font-black rounded-xl shadow-md shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isProcessing ? (
                <span>Attivazione in corso...</span>
              ) : (
                <>
                  <Crown className="w-4 h-4 text-amber-300 fill-amber-300" />
                  <span>Attiva MyGarage360 PRO</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
