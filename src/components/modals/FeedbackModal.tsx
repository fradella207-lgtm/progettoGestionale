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
  MessageSquare, 
  ExternalLink,
  Info
} from 'lucide-react';
import { UserAccount } from '../../types';
import { submitAppFeedback, buildOwnerMailtoLink, OWNER_EMAIL, AppFeedbackData } from '../../utils/feedbackService';
import { useSwipeBack } from '../../hooks/useSwipeBack';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  account?: UserAccount;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  account
}) => {
  const [feedbackType, setFeedbackType] = useState<'improvement' | 'bug' | 'feature' | 'other'>('improvement');
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
      if (account) {
        if (!feedbackSenderName && account.name) setFeedbackSenderName(account.name);
        if (!feedbackSenderEmail && account.email) setFeedbackSenderEmail(account.email);
      }
    }
  }, [isOpen, account]);

  useSwipeBack({
    onBack: onClose,
    enabled: isOpen
  });

  if (!isOpen) return null;

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!feedbackMessage.trim()) {
      setErrorMessage('Inserisci una descrizione o il dettaglio del tuo suggerimento.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const payload: AppFeedbackData = {
        type: feedbackType,
        subject: feedbackSubject.trim() || 'Suggerimento per My360Garage',
        message: feedbackMessage.trim(),
        senderName: feedbackSenderName.trim(),
        senderEmail: feedbackSenderEmail.trim(),
        deviceInfo: includeDiagnostics 
          ? `${navigator.userAgent} | Screen: ${window.innerWidth}x${window.innerHeight}` 
          : 'Non incluso'
      };

      await submitAppFeedback(payload);
      setIsSuccess(true);
      setFeedbackMessage('');
      setFeedbackSubject('');
    } catch (err) {
      console.error('Error submitting feedback:', err);
      setErrorMessage('Si è verificato un errore durante l\'invio. Puoi comunque inviare l\'email diretta.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentPayload: AppFeedbackData = {
    type: feedbackType,
    subject: feedbackSubject.trim() || 'Segnalazione o miglioramento My360Garage',
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

            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-100 dark:border-indigo-900 shrink-0">
              <Mail className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white truncate">
                Segnalazioni & Miglioramenti
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                Filo diretto con il proprietario dell&apos;app
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
        <div className="p-5 sm:p-6 overflow-y-auto flex flex-col gap-5">
          {isSuccess ? (
            <div className="py-6 px-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 text-center flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-extrabold text-emerald-950 dark:text-emerald-200">
                  Segnalazione Inviata con Successo!
                </h4>
                <p className="text-xs text-emerald-800 dark:text-emerald-300/90 mt-1 max-w-sm leading-relaxed">
                  Grazie di cuore per il tuo contributo! Il tuo feedback è stato recapitato direttamente al proprietario per rendere My360Garage ancora migliore.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setIsSuccess(false)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  Invia un&apos;altra segnalazione
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
              {/* INTRO INFO CARD */}
              <div className="p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Info className="w-4 h-4" />
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-300 leading-snug">
                  Hai notato un bug, desideri una funzione specifica o vuoi suggerire un miglioramento grafico? Le tue segnalazioni arrivano direttamente al proprietario (<a href={`mailto:${OWNER_EMAIL}`} className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">{OWNER_EMAIL}</a>).
                </div>
              </div>

              {/* SELETTORE TIPOLOGIA */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Tipologia di Messaggio
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFeedbackType('improvement')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                      feedbackType === 'improvement'
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 shadow-2xs'
                        : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/60'
                    }`}
                  >
                    <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Miglioramento</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFeedbackType('bug')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                      feedbackType === 'bug'
                        ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-700 text-rose-700 dark:text-rose-300 shadow-2xs'
                        : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/60'
                    }`}
                  >
                    <Bug className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>Errore / Bug</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFeedbackType('feature')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                      feedbackType === 'feature'
                        ? 'bg-purple-50 dark:bg-purple-950/60 border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300 shadow-2xs'
                        : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/60'
                    }`}
                  >
                    <Sparkles className="w-4 h-4 text-purple-500 shrink-0" />
                    <span>Nuova Funzione</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFeedbackType('other')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                      feedbackType === 'other'
                        ? 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white shadow-2xs'
                        : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/60'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4 text-slate-500 shrink-0" />
                    <span>Altro Feedback</span>
                  </button>
                </div>
              </div>

              {/* DATI MITTENTE */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Il tuo Nome <span className="text-slate-400 font-normal">(facoltativo)</span>
                  </label>
                  <input
                    type="text"
                    value={feedbackSenderName}
                    onChange={(e) => setFeedbackSenderName(e.target.value)}
                    placeholder="es. Mario Rossi"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    La tua Email <span className="text-slate-400 font-normal">(per risposta)</span>
                  </label>
                  <input
                    type="email"
                    value={feedbackSenderEmail}
                    onChange={(e) => setFeedbackSenderEmail(e.target.value)}
                    placeholder="es. mario@email.it"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* OGGETTO */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Oggetto Sintetico
                </label>
                <input
                  type="text"
                  value={feedbackSubject}
                  onChange={(e) => setFeedbackSubject(e.target.value)}
                  placeholder="es. Suggerimento grafica dark mode / Nuova funzione esportazione"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* MESSAGGIO DETTAGLIATO */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Descrizione & Dettagli <span className="text-rose-500">*</span></span>
                  <span className="text-[11px] font-normal text-slate-400">più dettagli fornisci, più rapida sarà l&apos;implementazione</span>
                </label>
                <textarea
                  rows={4}
                  value={feedbackMessage}
                  onChange={(e) => setFeedbackMessage(e.target.value)}
                  placeholder="Descrivi qui cosa vorresti migliorare, quale comportamento anomalo hai notato, o quale nuova funzionalità desidereresti..."
                  className="w-full p-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none leading-relaxed"
                  required
                />
              </div>

              {/* CHECKBOX DIAGNOSTICA */}
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 dark:text-slate-400 select-none">
                <input
                  type="checkbox"
                  checked={includeDiagnostics}
                  onChange={(e) => setIncludeDiagnostics(e.target.checked)}
                  className="rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500"
                />
                <span>Includi informazioni diagnostiche di base (tipo dispositivo, risoluzione schermo)</span>
              </label>

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
                  className="w-full sm:flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:scale-95 disabled:opacity-50 text-white rounded-xl text-xs font-black transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <span>Invio in corso...</span>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Invia Segnalazione Diretta</span>
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
                  <span>Apri Email</span>
                </a>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
