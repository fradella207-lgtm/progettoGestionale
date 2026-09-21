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
import { AppSettings } from '../../types';

interface AppTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings?: AppSettings;
}

interface TutorialSlide {
  id: string;
  stepNumber: number;
  badge: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  iconColor: string;
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
      stepNumber: 1,
      badge: 'Panoramica Garage',
      title: 'Tutti i Tuoi Veicoli a Portata di Mano',
      subtitle: 'Auto, moto, scooter ed elettriche gestite in un unico cockpit intuitivo.',
      icon: <Car className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />,
      iconColor: 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-100 dark:border-indigo-900/60',
      features: [
        {
          title: 'Odometro Dinamico',
          description: 'I chilometri si aggiornano a ogni rifornimento e calcolano il ritmo medio mensile.',
          icon: <Layers className="w-4 h-4 text-indigo-500" />
        },
        {
          title: 'Promemoria Scadenze',
          description: 'Bollo, polizza assicurativa e revisione biennale con avvisi chiari.',
          icon: <ShieldCheck className="w-4 h-4 text-emerald-500" />
        },
        {
          title: 'Passaporto Digitale',
          description: 'Scarica in ogni momento la scheda PDF o CSV per certificare i tagliandi svolti.',
          icon: <FileText className="w-4 h-4 text-purple-500" />
        }
      ],
      proTip: 'Tocca una vettura nella home per visualizzare la scheda tecnica dettagliata.'
    },
    {
      id: 'refuel',
      stepNumber: 2,
      badge: 'Consumi & Rifornimenti',
      title: 'Traccia Spese e Consumi Reali',
      subtitle: 'Benzina, Diesel, GPL, Metano e ricariche elettriche kWh al millesimo.',
      icon: <Fuel className="w-6 h-6 text-emerald-500 dark:text-emerald-400" />,
      iconColor: 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-100 dark:border-emerald-900/60',
      features: [
        {
          title: 'Calcolo Automatico km/L o kWh/100km',
          description: 'Inserendo i rifornimenti a pieno completo, la media si calcola in automatico.',
          icon: <TrendingUp className="w-4 h-4 text-emerald-500" />
        },
        {
          title: 'Costo al Chilometro Reale (€/km)',
          description: 'Scopri all\'istante quanto costa percorrere 1 km in base al prezzo del carburante.',
          icon: <Sparkles className="w-4 h-4 text-amber-500" />
        },
        {
          title: 'Bifuel & Plug-in Hybrid',
          description: 'Statistiche indipendenti per i due serbatoi (Benzina/GPL o Elettrico/Benzina).',
          icon: <Zap className="w-4 h-4 text-blue-500" />
        }
      ],
      proTip: 'Attiva la spunta "Pieno Completo" per permettere il calcolo statistico del consumo effettivo.'
    },
    {
      id: 'maintenance',
      stepNumber: 3,
      badge: 'Manutenzioni & Officina',
      title: 'Manutenzione e Storico Officina',
      subtitle: 'Previeni usure e guasti tenendo sotto controllo tagliandi, freni e cinghie.',
      icon: <Wrench className="w-6 h-6 text-amber-500 dark:text-amber-400" />,
      iconColor: 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-100 dark:border-amber-900/60',
      features: [
        {
          title: 'Registro Interventi Officina',
          description: 'Data, chilometri, costi ricambi, manodopera e note su officina o ricambi usati.',
          icon: <Wrench className="w-4 h-4 text-amber-500" />
        },
        {
          title: 'Avvisi Predittivi basati sui tuoi km',
          description: 'Stima del momento ottimale per il prossimo tagliando in base alle tue percorrenze.',
          icon: <ShieldCheck className="w-4 h-4 text-emerald-500" />
        },
        {
          title: 'Spesa Totale di Gestione (TCO)',
          description: 'Grafico chiaro ripartito tra spese fisse, carburante e officina.',
          icon: <TrendingUp className="w-4 h-4 text-indigo-500" />
        }
      ],
      proTip: 'Annota la gradazione olio motore o il codice ricambio per trovarli rapidamente in futuro.'
    },
    {
      id: 'map',
      stepNumber: 4,
      badge: 'Mappa Prezzi & Colonnine',
      title: 'Prezzi Carburante & Ricariche EV',
      subtitle: 'Confronta i distributori più convenienti con i dati ufficiali del Ministero.',
      icon: <MapPin className="w-6 h-6 text-blue-500 dark:text-blue-400" />,
      iconColor: 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-100 dark:border-blue-900/60',
      features: [
        {
          title: 'Prezzi Ufficiali MIMIT in Tempo Reale',
          description: 'Prezzi self e servito sempre allineati all\'Osservatorio Carburanti.',
          icon: <MapPin className="w-4 h-4 text-blue-500" />
        },
        {
          title: 'Grafico Andamento Prezzi',
          description: 'Consulta lo storico a 30 giorni per capire il momento ideale per fare rifornimento.',
          icon: <TrendingUp className="w-4 h-4 text-emerald-500" />
        },
        {
          title: 'Filtri Connettori Elettrici',
          description: 'Filtra le colonnine per potenza (AC, Fast, HPC) e standard di ricarica.',
          icon: <Zap className="w-4 h-4 text-amber-500" />
        }
      ],
      proTip: 'Tocca "Indicazioni" su una stazione per aprire subito il percorso su Google Maps o Apple Maps.'
    },
    {
      id: 'trips_shared',
      stepNumber: 5,
      badge: 'Viaggi & Condivisione',
      title: 'Diario Viaggi, Condivisione & Temi',
      subtitle: 'Organizza trasferte, condividi veicoli in famiglia e adatta l\'aspetto grafico.',
      icon: <Compass className="w-6 h-6 text-purple-500 dark:text-purple-400" />,
      iconColor: 'bg-purple-50/80 dark:bg-purple-950/40 border-purple-100 dark:border-purple-900/60',
      features: [
        {
          title: 'Diario Viaggi & Trasferte',
          description: 'Traccia chilometri percorsi, pedaggi autostradali e rimborsi chilometrici.',
          icon: <Compass className="w-4 h-4 text-purple-500" />
        },
        {
          title: 'Garage Condiviso in Tempo Reale',
          description: 'Condividi un veicolo con un codice univoco: sincronizzazione istantanea!',
          icon: <Users className="w-4 h-4 text-blue-500" />
        },
        {
          title: 'Temi & Contrasto Elevato',
          description: 'Scegli la combinazione grafica ideale, con tema chiaro o tema scuro riposante.',
          icon: <Sparkles className="w-4 h-4 text-amber-500" />
        }
      ],
      proTip: 'Puoi riaprire questa guida in ogni momento da Impostazioni > Guida & Tutorial.'
    }
  ];

  if (!isOpen) return null;

  const currentSlide = slides[currentStep];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-xl overflow-hidden flex flex-col my-auto max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* HEADER MODALE (Light, clean & airy) */}
        <div className="px-5 py-4 bg-white/90 dark:bg-slate-900/90 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3 sticky top-0 z-20 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold tracking-wide uppercase px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
              Passo {currentSlide.stepNumber} di {slides.length} • {currentSlide.badge}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleClose}
              className="text-xs font-semibold text-slate-400 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 px-2 py-1 rounded-lg transition-colors cursor-pointer"
            >
              Salta
            </button>
            <button
              onClick={handleClose}
              className="w-7 h-7 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
              aria-label="Chiudi guida"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* SLIDE BODY */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="flex flex-col gap-4"
            >
              {/* SLIDE HERO (Airy & Lightweight) */}
              <div className="flex items-start gap-3.5">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border shrink-0 ${currentSlide.iconColor}`}>
                  {currentSlide.icon}
                </div>
                <div className="min-w-0 pt-0.5">
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight leading-snug">
                    {currentSlide.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed font-normal">
                    {currentSlide.subtitle}
                  </p>
                </div>
              </div>

              {/* FEATURES LIST (Soft cards with lightweight borders) */}
              <div className="flex flex-col gap-2 pt-1">
                {currentSlide.features.map((feat, idx) => (
                  <div 
                    key={idx}
                    className="p-3 rounded-2xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 flex items-start gap-3"
                  >
                    <div className="w-6 h-6 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                      {feat.icon}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {feat.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed font-normal">
                        {feat.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* PRO TIP BOX (Soft & Light) */}
              <div className="p-3 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300">
                <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed font-medium">
                  {currentSlide.proTip}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* FOOTER & NAVIGATION */}
        <div className="p-4 sm:p-5 bg-white/95 dark:bg-slate-900/95 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-3">
          
          {/* STEP DOTS INDICATOR & DONT SHOW AGAIN */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {slides.map((slide, index) => (
                <button
                  key={slide.id}
                  onClick={() => setCurrentStep(index)}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    currentStep === index 
                      ? 'w-5 bg-slate-900 dark:bg-slate-100' 
                      : 'w-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600'
                  }`}
                  aria-label={`Vai al passo ${index + 1}`}
                />
              ))}
            </div>

            <label className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500"
              />
              <span>Non mostrare più all&apos;avvio</span>
            </label>
          </div>

          {/* PREVIOUS / NEXT BUTTONS */}
          <div className="flex items-center gap-2 pt-0.5">
            {currentStep > 0 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(prev => prev - 1)}
                className="py-2 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Indietro</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex-1" />

            {currentStep < slides.length - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(prev => prev + 1)}
                className="py-2 px-4 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-white active:scale-95 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer ml-auto"
              >
                <span>Continua</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleClose}
                className="py-2 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer ml-auto"
              >
                <span>Esplora il Garage</span>
                <Check className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
