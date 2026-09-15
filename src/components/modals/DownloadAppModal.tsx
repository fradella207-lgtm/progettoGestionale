import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Smartphone, 
  Globe, 
  CheckCircle2, 
  Share2, 
  PlusSquare, 
  Laptop, 
  ExternalLink, 
  Terminal, 
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Copy,
  Check
} from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface DownloadAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DownloadAppModal: React.FC<DownloadAppModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'android' | 'web' | 'ios'>(isAndroid ? 'android' : isIOS ? 'ios' : 'android');
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl flex flex-col overflow-hidden font-['Plus_Jakarta_Sans',sans-serif] max-h-[92vh] border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* MODAL HERO COVER */}
        <div className="relative bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-6 sm:p-7 text-white overflow-hidden border-b border-slate-800">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative flex items-start justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl p-1 bg-gradient-to-tr from-blue-600 to-indigo-400 shadow-lg shadow-blue-500/20 shrink-0">
                <img 
                  src="/logo.png" 
                  alt="My360Garage" 
                  className="w-full h-full rounded-[12px] object-cover bg-slate-900"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                    My360Garage
                  </h2>
                  <span className="text-[10px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2 py-0.5 rounded-md">
                    Multi-Platform
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 font-medium">
                  Disponibile sia come App Android nativa (APK) che Web App PWA
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer shrink-0"
              aria-label="Chiudi"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* TAB SELECTOR */}
          <div className="flex items-center gap-1.5 mt-5 p-1 bg-white/10 rounded-xl backdrop-blur-xs border border-white/10">
            <button
              onClick={() => setActiveTab('android')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'android'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Android & APK</span>
            </button>
            <button
              onClick={() => setActiveTab('web')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'web'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Versione Web (PWA)</span>
            </button>
            <button
              onClick={() => setActiveTab('ios')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'ios'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Laptop className="w-3.5 h-3.5" />
              <span>iOS (iPhone/iPad)</span>
            </button>
          </div>
        </div>

        {/* MODAL BODY */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-800 text-sm">
          
          {/* TAB 1: ANDROID & APK */}
          {activeTab === 'android' && (
            <div className="space-y-4">
              <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div className="text-xs">
                  <h4 className="font-extrabold text-blue-950 text-sm">
                    Progetto Android Nativo (Capacitor) Pronto per APK
                  </h4>
                  <p className="text-blue-800 mt-1 leading-relaxed">
                    Il codice sorgente dell'app Android è già configurato nel repository con package ID <code className="bg-blue-100 px-1.5 py-0.5 rounded font-mono text-[11px] font-bold text-blue-900">it.my360garage.app</code> e tutte le icone del nuovo logo sincronizzate.
                  </p>
                </div>
              </div>

              {/* OPZIONE 1: INSTALLA ISTANTANEAMENTE (PWA SU ANDROID) */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-white hover:border-slate-300 transition-all">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <Download className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="font-extrabold text-slate-900 text-xs sm:text-sm">
                        1. Installa subito su Android (Senza APK)
                      </h5>
                      <p className="text-[11px] text-slate-500">
                        Funziona direttamente da Chrome Mobile come app a schermo intero
                      </p>
                    </div>
                  </div>

                  {isInstallable ? (
                    <button
                      onClick={install}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all cursor-pointer inline-flex items-center gap-1.5 shrink-0"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Installa Ora</span>
                    </button>
                  ) : isInstalled ? (
                    <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Installata
                    </span>
                  ) : (
                    <div className="text-[11px] font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl">
                      Menu Chrome &gt; Installa App
                    </div>
                  )}
                </div>
              </div>

              {/* OPZIONE 2: GUIDA CREAZIONE APK (RELEASE & DEBUG) */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-blue-600" />
                    <h5 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                      2. Generare il file APK con Android Studio
                    </h5>
                  </div>
                  <span className="text-[10px] font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md">
                    Developer Release
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Per esportare il file <strong className="text-slate-900">.apk</strong> o pubblicare su Google Play Console:
                </p>

                <div className="space-y-2">
                  <div className="bg-slate-900 text-slate-200 p-3 rounded-xl font-mono text-[11px] flex items-center justify-between gap-2 overflow-x-auto">
                    <code>npm run cap:sync && npx cap open android</code>
                    <button
                      onClick={() => handleCopy('npm run cap:sync && npx cap open android', 'cap-open')}
                      className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors shrink-0"
                      title="Copia comando"
                    >
                      {copiedCmd === 'cap-open' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="bg-slate-900 text-slate-200 p-3 rounded-xl font-mono text-[11px] flex items-center justify-between gap-2 overflow-x-auto">
                    <code>cd android && ./gradlew assembleDebug</code>
                    <button
                      onClick={() => handleCopy('cd android && ./gradlew assembleDebug', 'apk-cmd')}
                      className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors shrink-0"
                      title="Copia comando"
                    >
                      {copiedCmd === 'apk-cmd' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-600 space-y-1">
                  <p className="font-bold text-slate-800">
                    📂 Posizione del file APK generato:
                  </p>
                  <p className="font-mono text-[11px] text-blue-700 break-all">
                    android/app/build/outputs/apk/debug/app-debug.apk
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: VERSIONE WEB (PWA) */}
          {activeTab === 'web' && (
            <div className="space-y-4">
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <Globe className="w-5 h-5" />
                </div>
                <div className="text-xs">
                  <h4 className="font-extrabold text-emerald-950 text-sm">
                    Versione Web PWA (Progressive Web App)
                  </h4>
                  <p className="text-emerald-800 mt-1 leading-relaxed">
                    Questa versione funziona istantaneamente su qualsiasi browser desktop (Chrome, Edge, Safari, Firefox), tablet o smartphone, senza passare dagli store.
                  </p>
                </div>
              </div>

              <div className="border border-slate-200 rounded-2xl p-4 bg-white space-y-3">
                <h5 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                  Vantaggi della Versione Web Pubblicata
                </h5>
                <ul className="space-y-2 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span><strong>Nessun download richiesto:</strong> Raggiungibile da qualsiasi URL</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span><strong>Supporto Offline:</strong> Service Worker attivo con micro-cache dati</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span><strong>Sincronizzazione Cloud:</strong> I dati del veicolo sono sempre aggiornati via Firebase</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span><strong>Aggiornamenti automatici:</strong> Ogni correzione o rilascio è attivo al caricamento</span>
                  </li>
                </ul>

                {isInstallable && (
                  <button
                    onClick={install}
                    className="w-full mt-2 py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                  >
                    <Download className="w-4 h-4" />
                    <span>Installa come App Desktop / Web</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: iOS (SAFARI) */}
          {activeTab === 'ios' && (
            <div className="space-y-4">
              <div className="bg-slate-100 border border-slate-200 rounded-2xl p-4 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
                  <Laptop className="w-5 h-5" />
                </div>
                <div className="text-xs">
                  <h4 className="font-extrabold text-slate-950 text-sm">
                    Installazione su iPhone & iPad
                  </h4>
                  <p className="text-slate-600 mt-1 leading-relaxed">
                    Su iOS l'app si installa tramite Safari e si integra con la schermata Home senza barra dell'URL.
                  </p>
                </div>
              </div>

              <div className="border border-slate-200 rounded-2xl p-4 bg-white space-y-3">
                <h5 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                  Istruzioni in 2 semplici passi
                </h5>

                <div className="space-y-2.5">
                  <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[11px] shrink-0">
                      1
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">Tocca il pulsante "Condividi"</p>
                      <p className="text-slate-500 text-[11px]">
                        Si trova nella barra inferiore di Safari su iPhone, oppure in alto a destra su iPad.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[11px] shrink-0">
                      2
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">Scorri e tocca "Aggiungi a schermata Home"</p>
                      <p className="text-slate-500 text-[11px]">
                        L'icona ufficiale di My360Garage comparirà subito sul tuo dispositivo iOS come una vera app.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>ID Pacchetto: <strong className="font-mono text-slate-800">it.my360garage.app</strong></span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl transition-all cursor-pointer shadow-xs"
          >
            Chiudi
          </button>
        </div>

      </div>
    </div>
  );
};
