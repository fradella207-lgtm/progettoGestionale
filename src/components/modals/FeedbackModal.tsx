import React, { useState, useEffect } from 'react';
import { 
  X, 
  ArrowLeft, 
  Mail, 
  Send, 
  CheckCircle2, 
  Lightbulb, 
  Bug, 
  Sparkles, 
  ExternalLink,
  Info,
  AlertTriangle,
  FileQuestion
} from 'lucide-react';
import { UserAccount } from '../../types';
import { submitAppFeedback, buildOwnerMailtoLink, OWNER_EMAIL, AppFeedbackData } from '../../utils/feedbackService';
import { useSwipeBack } from '../../hooks/useSwipeBack';

export type FeedbackMode = 'report' | 'improvement';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  account?: UserAccount;
  initialMode?: FeedbackMode;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  account,
  initialMode = 'improvement'
}) => {
  // Modal mode: separated cleanly between 'report' (Bug / Problemi tecnici) and 'improvement' (Idee / Suggerimenti)
  const [activeMode, setActiveMode] = useState<FeedbackMode>(initialMode);
  
  // Specific category under active mode
  const [reportSubCategory, setReportSubCategory] = useState<'bug' | 'crash' | 'sync_issue' | 'other_bug'>('bug');
  const [improvementSubCategory, setImprovementSubCategory] = useState<'feature' | 'ui_ux' | 'data_calculation' | 'other_idea'>('feature');

  const [feedbackSubject, setFeedbackSubject] = useState<string>('');
  const [feedbackMessage, setFeedbackMessage] = useState<string>('');
  const [feedbackSenderEmail, setFeedbackSenderEmail] = useState<string>('');
  const [feedbackSenderName, setFeedbackSenderName] = useState<string>('');
  const [includeDiagnostics, setIncludeDiagnostics] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setIsSuccess(false);
      setErrorMessage(null);
      setActiveMode(initialMode);
      if (account) {
        if (!feedbackSenderName && account.name) setFeedbackSenderName(account.name);
        if (!feedbackSenderEmail && account.email) setFeedbackSenderEmail(account.email);
      }
    }
  }, [isOpen, initialMode, account]);

  useSwipeBack({
    onBack: onClose,
    enabled: isOpen
  });

  if (!isOpen) return null;

  const currentFeedbackType = activeMode === 'report' ? 'bug' : (improvementSubCategory === 'feature' ? 'feature' : 'improvement');

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!feedbackMessage.trim()) {
      setErrorMessage(
        activeMode === 'report'
          ? 'Inserisci una descrizione dell\'anomalia o del bug riscontrato.'
          : 'Inserisci la tua idea o proposta di miglioramento per My360Garage.'
      );
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const fullSubject = feedbackSubject.trim() || (
      activeMode === 'report' 
        ? `[Segnalazione Bug] Problema su My360Garage (${reportSubCategory})` 
        : `[Miglioramento] Proposta nuova funzione o UI (${improvementSubCategory})`
    );

    try {
      const payload: AppFeedbackData = {
        type: currentFeedbackType,
        subject: fullSubject,
        message: feedbackMessage.trim(),
        senderName: feedbackSenderName.trim(),
        senderEmail: feedbackSenderEmail.trim(),
        deviceInfo: includeDiagnostics 
          ? `${navigator.userAgent} | Schermo: ${window.innerWidth}x${window.innerHeight} | Modalità: ${activeMode}` 
          : 'Diagnostica non inclusa'
      };

      await submitAppFeedback(payload);
      setIsSuccess(true);
      setFeedbackMessage('');
      setFeedbackSubject('');
    } catch (err) {
      console.error('Error submitting feedback:', err);
      setErrorMessage('Si è verificato un errore durante l\'invio. Puoi comunque inviare l\'email diretta al proprietario.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentPayload: AppFeedbackData = {
    type: currentFeedbackType,
    subject: feedbackSubject.trim() || (activeMode === 'report' ? 'Segnalazione Problema Tecnico' : 'Proposta di Miglioramento'),
    message: feedbackMessage.trim() || 'Nessun messaggio specificato',
    senderName: feedbackSenderName.trim(),
    senderEmail: feedbackSenderEmail.trim()
  };

  const mailtoUrl = buildOwnerMailtoLink(currentPayload);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* HEADER MODALE */}
        <div className="p-4 sm:p-5 bg-white/95 dark:bg-slate-900/95 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 sticky top-0 z-20 backdrop-blur-md">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 active:scale-95 text-slate-800 dark:text-slate-200 text-xs font-black border border-slate-200 dark:border-slate-700 transition-all cursor-pointer shrink-0 shadow-2xs group"
              title="Torna indietro"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              <span>Indietro</span>
            </button>

            <div className={`w-9 h-9 rounded-xl flex items-center justify-center border shrink-0 ${
              activeMode === 'report'
                ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900'
                : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900'
            }`}>
              {activeMode === 'report' ? <Bug className="w-4 h-4" /> : <Lightbulb className="w-4 h-4" />}
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white truncate">
                {activeMode === 'report' ? 'Segnala un Problema' : 'Proponi Miglioramento'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {activeMode === 'report' ? 'Assistenza tecnica & risoluzione bug' : 'Idee e suggerimenti per l\'app'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
            aria-label="Chiudi"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* CONTENUTO MODALE */}
        <div className="p-5 sm:p-6 overflow-y-auto flex flex-col gap-4">

          {/* SEPARATORE TABS ESPLICITO */}
          <div className="p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 grid grid-cols-2 gap-1">
            <button
              type="button"
              onClick={() => {
                setActiveMode('report');
                setIsSuccess(false);
                setErrorMessage(null);
              }}
              className={`py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeMode === 'report'
                  ? 'bg-white dark:bg-slate-700 text-rose-700 dark:text-rose-300 shadow-2xs border border-rose-200 dark:border-rose-800/80'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Bug className="w-3.5 h-3.5 text-rose-500" />
              <span>Segnala un Bug</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveMode('improvement');
                setIsSuccess(false);
                setErrorMessage(null);
              }}
              className={`py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeMode === 'improvement'
                  ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-2xs border border-indigo-200 dark:border-indigo-800/80'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              <span>Proponi Miglioramento</span>
            </button>
          </div>

          {isSuccess ? (
            <div className="py-6 px-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 text-center flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-extrabold text-emerald-950 dark:text-emerald-200">
                  {activeMode === 'report' ? 'Segnalazione Ricevuta con Successo!' : 'Proposta Registrata con Successo!'}
                </h4>
                <p className="text-xs text-emerald-800 dark:text-emerald-300/90 mt-1 max-w-sm leading-relaxed">
                  {activeMode === 'report'
                    ? 'Grazie per la segnalazione. Lo sviluppatore esaminerà il problema tecnico al più presto per rilasciare un fix.'
                    : 'Grazie mille per il tuo suggerimento! Le migliori idee degli utenti vengono introdotte nei successivi aggiornamenti.'}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setIsSuccess(false)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  {activeMode === 'report' ? 'Invia un\'altra segnalazione' : 'Proponi un\'altra idea'}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Chiudi
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              
              {/* BANNER INFORMATIVO CONTESTUALE */}
              {activeMode === 'report' ? (
                <div className="p-3.5 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 flex items-start gap-3 text-xs">
                  <div className="w-7 h-7 rounded-lg bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div className="text-slate-700 dark:text-slate-300 leading-snug">
                    <strong className="text-rose-950 dark:text-rose-200 block mb-0.5">Segnala un problema tecnico</strong>
                    Hai riscontrato un errore di visualizzazione, un blocco o una discrepanza nei calcoli del carburante? Descrivilo qui sotto; la segnalazione arriverà direttamente allo sviluppatore (<a href={`mailto:${OWNER_EMAIL}`} className="text-rose-600 dark:text-rose-400 font-bold hover:underline">{OWNER_EMAIL}</a>).
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/60 flex items-start gap-3 text-xs">
                  <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="text-slate-700 dark:text-slate-300 leading-snug">
                    <strong className="text-indigo-950 dark:text-indigo-200 block mb-0.5">Suggerisci un miglioramento o funzione</strong>
                    Hai un&apos;idea per arricchire My360Garage o vuoi proporre una modifica grafica? Scrivici: leggiamo personalmente ogni proposta.
                  </div>
                </div>
              )}

              {/* SOTTO-CATEGORIE SPECIFICHE */}
              {activeMode === 'report' ? (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Tipo di Anomalia
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { id: 'bug', label: 'Errore generico / Bug' },
                      { id: 'crash', label: 'Blocco / Crash app' },
                      { id: 'sync_issue', label: 'Problema Sincronizzazione' },
                      { id: 'other_bug', label: 'Altra Anomalia' }
                    ].map(item => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setReportSubCategory(item.id as any)}
                        className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer text-left truncate ${
                          reportSubCategory === item.id
                            ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-400 dark:border-rose-700 text-rose-800 dark:text-rose-200 shadow-2xs'
                            : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Area di Miglioramento
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { id: 'feature', label: 'Nuova Funzionalità' },
                      { id: 'ui_ux', label: 'Grafica & Navigazione' },
                      { id: 'data_calculation', label: 'Statistiche & Dati' },
                      { id: 'other_idea', label: 'Altra Proposta' }
                    ].map(item => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setImprovementSubCategory(item.id as any)}
                        className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer text-left truncate ${
                          improvementSubCategory === item.id
                            ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-400 dark:border-indigo-700 text-indigo-800 dark:text-indigo-200 shadow-2xs'
                            : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* DATI MITTENTE */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Il tuo Nome <span className="text-slate-400 font-normal">(facoltativo)</span>
                  </label>
                  <input
                    type="text"
                    value={feedbackSenderName}
                    onChange={(e) => setFeedbackSenderName(e.target.value)}
                    placeholder="es. Mario"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 font-medium"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    La tua Email <span className="text-slate-400 font-normal">(per eventuale risposta)</span>
                  </label>
                  <input
                    type="email"
                    value={feedbackSenderEmail}
                    onChange={(e) => setFeedbackSenderEmail(e.target.value)}
                    placeholder="nome@email.com"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 font-medium"
                  />
                </div>
              </div>

              {/* OGGETTO */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {activeMode === 'report' ? 'Oggetto del Problema' : 'Titolo dell\'Idea / Suggerimento'}
                </label>
                <input
                  type="text"
                  value={feedbackSubject}
                  onChange={(e) => setFeedbackSubject(e.target.value)}
                  placeholder={
                    activeMode === 'report'
                      ? 'es. Errore durante l\'inserimento rifornimento metano'
                      : 'es. Possibilità di registrare i cambi pneumatici stagionali'
                  }
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 font-medium"
                />
              </div>

              {/* MESSAGGIO DETTAGLIATO */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>{activeMode === 'report' ? 'Descrizione del Bug' : 'Descrizione del Miglioramento'} <span className="text-rose-500">*</span></span>
                  <span className="text-[11px] font-normal text-slate-400">obbligatorio</span>
                </label>
                <textarea
                  rows={4}
                  value={feedbackMessage}
                  onChange={(e) => {
                    setFeedbackMessage(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder={
                    activeMode === 'report'
                      ? 'Spiega cosa stavi facendo, cosa è successo e se il problema si ripete...'
                      : 'Descrivi la funzione che vorresti, come dovrebbe funzionare e perché sarebbe utile...'
                  }
                  className="w-full p-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 resize-none leading-relaxed font-medium"
                  required
                />
              </div>

              {/* CHECKBOX DIAGNOSTICA (per i report) */}
              {activeMode === 'report' && (
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 dark:text-slate-400 select-none">
                  <input
                    type="checkbox"
                    checked={includeDiagnostics}
                    onChange={(e) => setIncludeDiagnostics(e.target.checked)}
                    className="rounded border-slate-300 dark:border-slate-700 text-rose-600 focus:ring-rose-500"
                  />
                  <span>Allega dati tecnici dispositivo (browser, sistema operativo, risoluzione)</span>
                </label>
              )}

              {errorMessage && (
                <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs font-semibold">
                  {errorMessage}
                </div>
              )}

              {/* AZIONI SUBMIT & MAILTO */}
              <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="submit"
                  disabled={isSubmitting || !feedbackMessage.trim()}
                  className={`w-full sm:flex-1 py-2.5 px-4 active:scale-95 disabled:opacity-50 text-white rounded-xl text-xs font-black transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer ${
                    activeMode === 'report'
                      ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
                      : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20'
                  }`}
                >
                  {isSubmitting ? (
                    <span>Invio in corso...</span>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>{activeMode === 'report' ? 'Invia Segnalazione Bug' : 'Invia Proposta di Miglioramento'}</span>
                    </>
                  )}
                </button>

                <a
                  href={mailtoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto py-2.5 px-3.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-1.5 cursor-pointer text-center"
                  title="Invia tramite la tua app email predefinita"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Apri Email Diretta</span>
                </a>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
