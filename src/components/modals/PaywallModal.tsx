import React, { useState } from 'react';
import { 
  X, 
  Crown, 
  Check, 
  Car, 
  Bot, 
  FileText, 
  Cloud, 
  Users,
  TrendingUp,
  ShieldCheck,
  ArrowRight,
  HelpCircle,
  Sparkles
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
    setTimeout(() => {
      setIsProcessing(false);
      onUpgradeSuccess(selectedPlanId);
      onClose();
    }, 600);
  };

  const featureDetail = activeFeature ? PRO_FEATURES_CATALOG[activeFeature] : null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl w-full max-w-lg shadow-xl border border-slate-200 overflow-hidden flex flex-col my-auto font-['Plus_Jakarta_Sans',sans-serif] animate-in zoom-in-98 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* HEADER CHIARO, LEGGERO ED ELEGANTE */}
        <div className="p-6 sm:p-7 border-b border-slate-100 relative bg-white">
          <button 
            type="button"
            id="btn-close-paywall-modal"
            onClick={onClose}
            aria-label="Chiudi finestra abbonamento"
            className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-900 text-white text-[11px] font-bold tracking-wide uppercase">
              <Crown className="w-3 h-3 text-amber-300 fill-amber-300" />
              <span>MyGarage360 PRO</span>
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
            {featureDetail ? (
              <>Sblocca <span className="text-indigo-600">{featureDetail.shortTitle}</span></>
            ) : (
              'Passa a MyGarage360 PRO'
            )}
          </h2>

          <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
            {featureDetail ? (
              featureDetail.description
            ) : (
              'Gestione completa e senza limiti per la tua flotta, la tua famiglia e le tue spese.'
            )}
          </p>

          {featureDetail && (
            <div className="mt-3 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span><strong>Piano Free:</strong> {featureDetail.freeLimit}</span>
            </div>
          )}
        </div>

        {/* BODY LEGGERO E SPAZIOSO */}
        <div className="p-5 sm:p-6 flex flex-col gap-4 overflow-y-auto max-h-[62vh]">
          
          {/* SELEZIONE PIANI TARIFFARI */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PRO_PRICING_OPTIONS.map((plan) => {
              const isSelected = selectedPlanId === plan.id;
              return (
                <div 
                  key={plan.id}
                  onClick={() => setSelectedPlanId(plan.id)}
                  className={`relative rounded-2xl p-4 border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/20 shadow-xs ring-1 ring-indigo-600'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  {plan.badge && (
                    <span className="absolute -top-2.5 right-3 bg-indigo-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      {plan.badge}
                    </span>
                  )}

                  <div>
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold text-xs text-slate-800">{plan.name}</span>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                        isSelected ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300 bg-white'
                      }`}>
                        {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </div>
                    </div>

                    <div className="flex items-baseline gap-1 mt-2">
                      <span className="text-2xl font-black text-slate-900">{plan.price}</span>
                      <span className="text-[11px] font-medium text-slate-500">{plan.period}</span>
                    </div>

                    <p className="text-[11px] text-slate-500 mt-1">
                      {plan.savings || plan.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* BENEFICI INCLUSI (LAYOUT PULITO CON ICONE CHIARE) */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2.5">
              Funzionalità PRO incluse
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2 text-slate-700">
                <div className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 shrink-0">
                  <Car className="w-3.5 h-3.5" />
                </div>
                <span><strong>Garage illimitato</strong> (2+ veicoli)</span>
              </div>

              <div className="flex items-center gap-2 text-slate-700">
                <div className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 shrink-0">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <span><strong>Assistente AI</strong> diagnostico 24/7</span>
              </div>

              <div className="flex items-center gap-2 text-slate-700">
                <div className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 shrink-0">
                  <FileText className="w-3.5 h-3.5" />
                </div>
                <span><strong>Passaporto Digitale</strong> PDF e CSV</span>
              </div>

              <div className="flex items-center gap-2 text-slate-700">
                <div className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 shrink-0">
                  <Users className="w-3.5 h-3.5" />
                </div>
                <span><strong>Auto Condivisa</strong> (Coppia / Famiglia)</span>
              </div>

              <div className="flex items-center gap-2 text-slate-700">
                <div className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 shrink-0">
                  <TrendingUp className="w-3.5 h-3.5" />
                </div>
                <span><strong>Andamento Prezzi</strong> nel tempo</span>
              </div>

              <div className="flex items-center gap-2 text-slate-700">
                <div className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 shrink-0">
                  <Cloud className="w-3.5 h-3.5" />
                </div>
                <span><strong>Cloud Sync</strong> automatico</span>
              </div>
            </div>
          </div>

          {/* CONFRONTO DETTAGLIATO (TOGGLE COMPATTO) */}
          <div>
            <button
              type="button"
              onClick={() => setShowComparison(!showComparison)}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
              <span>{showComparison ? 'Nascondi confronto con Free' : 'Confronta Piano Free vs Piano PRO'}</span>
            </button>

            {showComparison && (
              <div className="mt-2.5 overflow-hidden rounded-xl border border-slate-200 text-xs animate-in fade-in duration-150">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                      <th className="p-2">Funzione</th>
                      <th className="p-2 text-slate-400">FREE</th>
                      <th className="p-2 text-indigo-700">PRO</th>
                    </tr>
                  </thead>
                  <tbody>
                    {FREE_VS_PRO_COMPARISON.map((row, idx) => (
                      <tr key={idx} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/50">
                        <td className="p-2 font-medium text-slate-800">{row.feature}</td>
                        <td className="p-2 text-slate-400">{row.free}</td>
                        <td className="p-2 font-bold text-slate-900">{row.pro}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* GARANZIA DIRETTA E SEMPLICE */}
          <div className="flex items-center gap-2 text-[11px] text-slate-500 py-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Nessun vincolo né pubblicità. I tuoi dati restano sempre privati.</span>
          </div>

        </div>

        {/* FOOTER ACTIONS MINIMALISTA */}
        <div className="p-4 sm:p-5 bg-white border-t border-slate-100 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <span className="text-xs font-bold text-slate-900 block truncate">
              {selectedPlanId === 'lifetime' ? 'Pass a Vita • 12,99 €' : 'Annuale • 4,99 € / anno'}
            </span>
            <span className="text-[10px] text-slate-400 block truncate">
              {selectedPlanId === 'lifetime' ? 'Pagamento unico • Per sempre' : 'Rinnovo annuale • Disdici quando vuoi'}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              Chiudi
            </button>

            <button
              type="button"
              id="btn-confirm-upgrade-pro"
              onClick={handleActivatePro}
              disabled={isProcessing}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 active:scale-97 text-white text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-xs"
            >
              {isProcessing ? (
                <span>Attivazione...</span>
              ) : (
                <>
                  <span>Attiva PRO</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
