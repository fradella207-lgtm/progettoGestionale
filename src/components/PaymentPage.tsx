import React, { useEffect } from 'react';
import { ShieldCheck, Lock, ExternalLink, ArrowRight } from 'lucide-react';
import { STRIPE_PAYMENT_URLS } from '../utils/tierManager';

export const PaymentPage: React.FC = () => {
  const params = new URLSearchParams(window.location.search);
  const plan = (params.get('plan') as 'annual' | 'lifetime') || 'lifetime';
  const stripeUrl = STRIPE_PAYMENT_URLS[plan] || STRIPE_PAYMENT_URLS.lifetime;

  useEffect(() => {
    // Ensure tab title is strictly "My360Garage - Pagamento"
    document.title = "My360Garage - Pagamento";

    // Auto-forward to Stripe checkout
    const timer = setTimeout(() => {
      window.location.replace(stripeUrl);
    }, 800);

    return () => clearTimeout(timer);
  }, [stripeUrl]);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-8 text-center shadow-2xl shadow-blue-500/10">
        {/* Logo Container */}
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-900/70 to-slate-900 border border-blue-500/40 flex items-center justify-center shadow-xl shadow-blue-500/20">
          <img 
            src="/logo.png" 
            alt="My360Garage" 
            className="w-14 h-14 object-contain drop-shadow-md"
          />
        </div>

        {/* SSL Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold mb-4">
          <Lock className="w-3.5 h-3.5" />
          <span>Pagamento Sicuro SSL 256-bit</span>
        </div>

        <h1 className="text-xl font-extrabold text-white mb-1 tracking-tight">
          My360Garage - Pagamento
        </h1>
        <p className="text-xs text-slate-400 mb-6">
          Transazione protetta certificata Stripe Checkout
        </p>

        {/* Selected Plan Box */}
        <div className="bg-slate-950/70 border border-blue-500/30 rounded-2xl p-4 text-left mb-6">
          <div className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-1">
            Piano Selezionato
          </div>
          <div className="text-base font-bold text-white">
            {plan === 'annual' ? 'Abbonamento Annuale PRO' : 'Pass a Vita PRO (Lifetime)'}
          </div>
          <div className="text-sm font-semibold text-emerald-400 mt-1">
            {plan === 'annual' ? '3,99 € / anno' : '14,99 € una tantum'}
          </div>
        </div>

        {/* Spinner & Progress */}
        <div className="flex flex-col items-center justify-center gap-3 mb-6">
          <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-xs text-slate-400">
            Reindirizzamento crittografato al checkout Stripe in corso...
          </p>
        </div>

        {/* Direct Action Button */}
        <a 
          href={stripeUrl}
          className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all duration-200"
        >
          <span>Procedi al Pagamento su Stripe</span>
          <ArrowRight className="w-4 h-4" />
        </a>

        <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-500 flex flex-col gap-1">
          <span>Carte di Credito/Debito • Apple Pay • Google Pay • Klarna</span>
          <span>Elaborato con crittografia end-to-end su circuiti Stripe</span>
        </div>
      </div>
    </div>
  );
};
