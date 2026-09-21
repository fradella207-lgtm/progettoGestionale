import React, { useState, useEffect } from 'react';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Car, 
  Fuel, 
  Zap, 
  Wrench, 
  ShieldCheck, 
  MapPin, 
  TrendingUp, 
  Compass, 
  Users, 
  FileText, 
  Sparkles, 
  Check, 
  Layers, 
  HelpCircle,
  Lightbulb,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AppSettings, AppThemeColor } from '../../types';

interface AppTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings?: AppSettings;
}

interface TutorialSlide {
  id: string;
  badge: string;
  badgeColor: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  iconBg: string;
  features: {
    title: string;
    description: string;
    icon: React.ReactNode;
  }[];
  proTip: string;
}

export const AppTutorialModal: React.FC<AppTutorialModalProps> = ({
  isOpen,
  onClose,
  settings
}) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [dontShowAgain, setDontShowAgain] = useState<boolean>(true);

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      const isAlreadyDisabled = localStorage.getItem('my360garage_tutorial_dont_show') === 'true';
      setDontShowAgain(isAlreadyDisabled);
    }
  }, [isOpen]);

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem('my360garage_tutorial_dont_show', 'true');
    } else {
      localStorage.removeItem('my360garage_tutorial_dont_show');
    }
    localStorage.setItem('my360garage_tutorial_seen', 'true');
    onClose();
  };

  const slides: TutorialSlide[] = [
    {
      id: 'garage',
      badge: 'Passo 1 di 5 • Benvenuto',
      badgeColor: 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
      title: 'Il Tuo Garage Digitale a 360°',
      subtitle: 'Tutti i tuoi veicoli (auto, moto, scooter ed EV) organizzati in un unico posto.',
      icon: <Car className="w-7 h-7 text-blue-600 dark:text-blue-400" />,
      iconBg: 'bg-blue-100/70 dark:bg-blue-900/50 border-blue-200 dark:border-blue-800',
      features: [
        {
          title: 'Chilometraggio Reale Dinamico',
          description: 'L\'odometro si aggiorna in tempo reale con ogni rifornimento o tagliando, stimando i km attuali della vettura.',
          icon: <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        },
        {
          title: 'Scadenze & Documenti',
          description: 'Bollo, polizza assicurativa, revisione ministeriale biennale e tagliandi con promemoria e avvisi preventivi.',
          icon: <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
        },
        {
          title: 'Passaporto Digitale del Veicolo',
          description: 'Genera in qualsiasi momento la scheda completa in PDF o CSV per certificare i chilometri e lo storico tagliandi.',
          icon: <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400" />
        }
      ],
      proTip: '💡 Consiglio: Clicca su qualsiasi veicolo nella schermata principale per accedere alla scheda dettagliata e a tutte le sue operazioni.'
    },
    {
      id: 'refuel',
      badge: 'Passo 2 di 5 • Carburante & Ricariche',
      badgeColor: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      title: 'Rifornimenti, Ricariche & Consumi',
      subtitle: 'Traccia benzina, diesel, GPL, metano o kWh elettrici per comprendere le spese reali.',
      icon: <Fuel className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />,
      iconBg: 'bg-emerald-100/70 dark:bg-emerald-900/50 border-emerald-200 dark:border-emerald-800',
      features: [
        {
          title: 'Calcolo Automatico km/L o kWh/100km',
          description: 'Inserendo due pieni consecutivi, l\'algoritmo calcola con precisione scientifica il consumo reale del tuo stile di guida.',
          icon: <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
        },
        {
          title: 'Costo Effettivo al Chilometro (€/km)',
          description: 'Scopri all\'istante quanto ti costa percorrere 1 km in base ai litri immessi e al prezzo del distributore.',
          icon: <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
        },
        {
          title: 'Supporto Dual Fuel & Plug-in Hybrid',
          description: 'Gestisci vetture bifuel (Benzina+GPL / Benzina+Metano) o Plug-in Hybrid con doppi serbatoi e statistiche separate.',
          icon: <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        }
      ],
      proTip: '💡 Come leggere i dati: Per ottenere una media consumi perfetta, attiva l\'opzione "Pieno Completo" ad ogni rifornimento.'
    },
    {
      id: 'maintenance',
      badge: 'Passo 3 di 5 • Officina & Notifiche',
      badgeColor: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      title: 'Manutenzioni & Scadenze Intelligenti',
      subtitle: 'Previeni guasti costosi tenendo traccia di tagliandi, freni, cinghie e gomme.',
      icon: <Wrench className="w-7 h-7 text-amber-600 dark:text-amber-400" />,
      iconBg: 'bg-amber-100/70 dark:bg-amber-900/50 border-amber-200 dark:border-amber-800',
      features: [
        {
          title: 'Storico Completo Interventi Officina',
          description: 'Registra data, chilometraggio, costo ricambi e manodopera, con possibilità di allegare note o fatture di officina.',
          icon: <Wrench className="w-4 h-4 text-amber-600 dark:text-amber-400" />
        },
        {
          title: 'Avvisi Predittivi basati sul Tuo Uso',
          description: 'L\'app calcola la tua media chilometrica e ti ricorda quando è ora di effettuare il tagliando o la cinghia di distribuzione.',
          icon: <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
        },
        {
          title: 'Controllo Spesa Totale di Gestione',
          description: 'Ripartizione chiara tra costi fissi (assicurazione/bollo), carburante ed interventi di officina.',
          icon: <TrendingUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
        }
      ],
      proTip: '💡 Consiglio: Salva il nome dell\'officina e la marca dei ricambi (es. olio 5W30) per ritrovarli subito al prossimo tagliando.'
    },
    {
      id: 'map',
      badge: 'Passo 4 di 5 • Mappa MIMIT & Colonnine',
      badgeColor: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
      title: 'Prezzi Carburante & Colonnine EV',
      subtitle: 'Trova il distributore più economico con dati ufficiali del Ministero e mappa ricariche.',
      icon: <MapPin className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />,
      iconBg: 'bg-indigo-100/70 dark:bg-indigo-900/50 border-indigo-200 dark:border-indigo-800',
      features: [
        {
          title: 'Prezzi Ufficiali MIMIT in Tempo Reale',
          description: 'I prezzi di self-service e servito provengono direttamente dall\'Osservatorio Carburanti del Ministero.',
          icon: <MapPin className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
        },
        {
          title: 'Storico Prezzi 30 Giorni',
          description: 'Apri la scheda di un distributore per vedere l\'andamento grafico dei prezzi e capire se conviene fare il pieno oggi.',
          icon: <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
        },
        {
          title: 'Stazioni di Ricarica Elettrica',
          description: 'Mappa completa delle colonnine con filtri per connettore (Type 2, CCS, CHAdeMO) e potenza (AC, Fast, HPC).',
          icon: <Zap className="w-4 h-4 text-amber-600 dark:text-amber-400" />
        }
      ],
      proTip: '💡 Navigatore rapido: Clicca sull\'icona "Indicazioni" su qualsiasi pompa per avviare subito la navigazione su Google Maps o Apple Maps.'
    },
    {
      id: 'trips_shared',
      badge: 'Passo 5 di 5 • Viaggi & Condivisione',
      badgeColor: 'bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800',
      title: 'Diario Viaggi, Condivisione & Temi',
      subtitle: 'Traccia i percorsi, condividi l\'auto con familiari e personalizza i colori dell\'app.',
      icon: <Compass className="w-7 h-7 text-violet-600 dark:text-violet-400" />,
      iconBg: 'bg-violet-100/70 dark:bg-violet-900/50 border-violet-200 dark:border-violet-800',
      features: [
        {
          title: 'Menù Viaggi & Trasferte (Trips)',
          description: 'Registra viaggi di lavoro o vacanze: calcola rimborso chilometrico, pedaggi autostradali e costi effettivi.',
          icon: <Compass className="w-4 h-4 text-violet-600 dark:text-violet-400" />
        },
        {
          title: 'Garage Condiviso Multi-Account',
          description: 'Condividi un veicolo con il tuo partner o famiglia via codice di condivisione: sincronizzazione automatica in tempo reale!',
          icon: <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        },
        {
          title: 'Temi a Colori & Modalità Scura',
          description: 'Scegli nelle impostazioni il colore preferito (Blu Cobalto, Verde Smeraldo, Rosso Corsa, Indaco) con supporto dark mode perfetto.',
          icon: <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
        }
      ],
      proTip: '💡 Sei pronto! Puoi riaprire questa guida in qualunque momento cliccando su "Impostazioni" > "Guida & Tutorial".'
    }
  ];

  if (!isOpen) return null;

  const currentSlide = slides[currentStep];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[94vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* HEADER MODALE */}
        <div className="p-4 sm:p-5 bg-white/95 dark:bg-slate-900/95 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 sticky top-0 z-20 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className={`text-[11px] font-black px-2.5 py-1 rounded-full border ${currentSlide.badgeColor}`}>
              {currentSlide.badge}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleClose}
              className="text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white px-2.5 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Salta guida
            </button>
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
              aria-label="Chiudi guida"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* SLIDE BODY */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide.id}
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-4"
            >
              {/* SLIDE HERO */}
              <div className="flex items-start gap-3.5">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shrink-0 shadow-xs ${currentSlide.iconBg}`}>
                  {currentSlide.icon}
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                    {currentSlide.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 leading-snug font-medium">
                    {currentSlide.subtitle}
                  </p>
                </div>
              </div>

              {/* FEATURES LIST */}
              <div className="flex flex-col gap-2.5 mt-1">
                {currentSlide.features.map((feat, idx) => (
                  <div 
                    key={idx}
                    className="p-3 sm:p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex items-start gap-3 hover:bg-slate-100/70 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                      {feat.icon}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-black text-slate-900 dark:text-white">
                        {feat.title}
                      </h4>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed font-medium">
                        {feat.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* PRO TIP BOX */}
              <div className="p-3 sm:p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/60 text-xs font-semibold text-indigo-950 dark:text-indigo-200 leading-relaxed flex items-center gap-2">
                <p>{currentSlide.proTip}</p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* FOOTER & NAVIGATION */}
        <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-3">
          
          {/* STEP DOTS INDICATOR */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {slides.map((slide, index) => (
                <button
                  key={slide.id}
                  onClick={() => setCurrentStep(index)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    currentStep === index 
                      ? 'w-6 bg-indigo-600 dark:bg-indigo-500' 
                      : 'w-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600'
                  }`}
                  aria-label={`Vai al passo ${index + 1}`}
                />
              ))}
            </div>

            {/* NON MOSTRARE PIÙ CHECKBOX */}
            <label className="flex items-center gap-2 text-[11px] font-medium text-slate-500 dark:text-slate-400 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
                className="rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500"
              />
              <span>Non mostrare più all&apos;avvio</span>
            </label>
          </div>

          {/* PULSANTI AVANTI / INDIETRO */}
          <div className="flex items-center gap-2.5 pt-1">
            {currentStep > 0 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(prev => prev - 1)}
                className="py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Precedente</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex-1" />

            {currentStep < slides.length - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(prev => prev + 1)}
                className="py-2.5 px-5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-xl text-xs font-black transition-all shadow-xs shadow-indigo-600/20 flex items-center gap-1.5 cursor-pointer ml-auto"
              >
                <span>Avanti</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleClose}
                className="py-2.5 px-5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-black transition-all shadow-xs shadow-emerald-600/20 flex items-center gap-1.5 cursor-pointer ml-auto"
              >
                <span>Inizia a Usare l&apos;App</span>
                <Check className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
