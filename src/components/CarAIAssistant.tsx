import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Paperclip, 
  X, 
  RefreshCw, 
  Trash2,
  Copy,
  Check,
  Sliders,
  ShieldAlert,
  Tv,
  Wrench,
  KeyRound,
  AlertTriangle,
  Mic,
  MicOff,
  Camera,
  User,
  ChevronRight,
  BookOpen,
  ExternalLink,
  CheckCircle2,
  Upload,
  Lock,
  Search,
  FileText,
  AlertCircle
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Vehicle, AIChatMessage } from '../types';
import { ManualManagerModal } from './modals/ManualManagerModal';
import { searchAndRetrieveCarManual } from '../utils/carManualService';

interface CarAIAssistantProps {
  vehicle: Vehicle;
  onUpdateVehicle: (updated: Vehicle) => void;
}

export const CarAIAssistant: React.FC<CarAIAssistantProps> = ({
  vehicle,
  onUpdateVehicle,
}) => {
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showPromptsModal, setShowPromptsModal] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState('maintenance');
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [attachedImage, setAttachedImage] = useState<{ base64: string; mimeType: string; name: string } | null>(null);
  
  // Gate screen fast-search state
  const [isGateSearching, setIsGateSearching] = useState(false);
  const [gateError, setGateError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const gateFileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const speechRecognitionRef = useRef<any>(null);

  // Check if manual is attached / available
  const hasManual = useMemo(() => {
    const info = vehicle.manualInfo || vehicle.technicalSpecs?.manualInfo;
    const directUrl = vehicle.technicalSpecs?.ownersManualUrl;
    if (info && (info.url || info.rawText || info.uploadedFileName || info.chapters?.length)) {
      return true;
    }
    if (directUrl && directUrl.trim().length > 0) {
      return true;
    }
    return false;
  }, [vehicle]);

  const manualData = vehicle.manualInfo || vehicle.technicalSpecs?.manualInfo;

  // Check speech recognition capability
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setSpeechSupported(true);
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'it-IT';

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInputText(prev => prev ? `${prev} ${transcript}` : transcript);
          setIsListening(false);
        };

        recognition.onerror = () => {
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        speechRecognitionRef.current = recognition;
      }
    }
  }, []);

  const toggleVoiceInput = () => {
    if (!speechRecognitionRef.current) return;
    if (isListening) {
      speechRecognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        speechRecognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        setIsListening(false);
      }
    }
  };

  const promptCategories = [
    {
      id: 'maintenance',
      title: 'Manutenzione & Fluidi',
      icon: Wrench,
      description: 'Olio motore, filtri, candele, cinghie e livelli',
      prompts: [
        'Quale olio motore con specifica esatta e quanti litri occorrono?',
        'Come azzerare la spia tagliando / chiave inglese / cambio olio?',
        'A quanti km o anni va sostituita la cinghia o catena di distribuzione?',
        'Qual è la coppia di serraggio in Nm dei bulloni delle ruote?'
      ]
    },
    {
      id: 'tires',
      title: 'Gomme & Freni',
      icon: AlertTriangle,
      description: 'Pressioni pneumatici, reset TPMS e pastiglie freni',
      prompts: [
        'Quali pressioni pneumatici sono raccomandate a vuoto e a pieno carico?',
        'Come si esegue il reset della spia pressione pneumatici (TPMS)?',
        'Quale liquido freni è prescritto e quando va sostituito?',
        'Come capire se le pastiglie dei freni sono da sostituire?'
      ]
    },
    {
      id: 'screen',
      title: 'Infotainment & Elettronica',
      icon: Tv,
      description: 'Riavvio schermo, Apple CarPlay, Android Auto e Bluetooth',
      prompts: [
        'Come fare il riavvio forzato (hard reset) dello schermo se è bloccato?',
        'Come collegare Apple CarPlay o Android Auto in modalità wireless o cavo?',
        'Dove si trova la presa diagnosi OBD2 e la scatola fusibili?',
        'Come ripristinare ai valori di fabbrica l\'infotainment di bordo?'
      ]
    },
    {
      id: 'battery',
      title: 'Batteria & Emergenza',
      icon: KeyRound,
      description: 'Avviamento con cavi, Start & Stop e telecomandi',
      prompts: [
        'Cosa fare se la batteria è a terra e come collegare i cavi di emergenza?',
        'Perché lo Start & Stop non si attiva e da cosa dipende?',
        'Come aprire e chiudere finestrini e tettuccio tenendo premuto il telecomando?',
        'Come sbloccare il freno a mano o il cambio se la batteria è scarica?'
      ]
    },
    {
      id: 'controls',
      title: 'Guida & Controlli',
      icon: Sliders,
      description: 'ESP, ASR, Launch Control e modalità di guida',
      prompts: [
        'Come si disattivano i controlli trazione (ASR/TCS) per partire su neve o fango?',
        'Come si disattiva completamente l\'ESP / ESC su questa vettura?',
        'Qual è la procedura per fare il Launch Control se supportato?',
        'Come togliere o silenziare l\'avviso acustico del limite di velocità (ISA)?'
      ]
    },
    {
      id: 'lights',
      title: 'Spie & Diagnosi OBD',
      icon: ShieldAlert,
      description: 'Significato spie cruscotto, allarmi e codici errore',
      prompts: [
        'Cosa fare se si accende la spia gialla avaria motore (MIL)?',
        'Quali sono le spie rosse di pericolo che impongono l\'arresto immediato?',
        'Come leggere e interpretare i codici errore OBD2 (P0xxx)?',
        'Cosa fare se si accende la spia del filtro antiparticolato DPF/FAP?'
      ]
    }
  ];

  const quickSuggestionChips = [
    'Quale olio motore e quanti litri?',
    'Come azzerare la spia tagliando?',
    'Pressione pneumatici e reset TPMS',
    'Hard reset dello schermo bloccato',
    'Batteria scarica: cavi emergenza',
    'Disattivare antislittamento ESP su neve',
    'Collegamento Apple CarPlay / Android Auto'
  ];

  const chatMessages: AIChatMessage[] = vehicle.aiChatHistory && vehicle.aiChatHistory.length > 0 
    ? vehicle.aiChatHistory 
    : [
        {
          id: 'welcome_msg',
          role: 'assistant',
          content: `Ciao! Sono il tuo **Assistente Tecnico & Manuale di Bordo** dedicato alla tua **${vehicle.brand} ${vehicle.model}** ${vehicle.trimLevel ? `(${vehicle.trimLevel})` : ''} — ${vehicle.motorization || vehicle.fuelType}.\n\nIl manuale di bordo è collegato ed attivo. Puoi pormi qualsiasi domanda tecnica con risposte dirette e operative:
- 🔧 **Specifiche fluidi**: tipologia esatta olio motore, litri, viscosità e specifiche costruttore
- 🔄 **Procedure reset**: azzeramento spia tagliando, inizializzazione pressione TPMS, riavvio schermo infotainment
- 🎛️ **Comandi & controlli**: disattivazione ESP/ASR per neve o fango, Launch Control, avvisi sonori
- ⚡ **Batteria ed emergenza**: posizioni morsetti per cavi di avviamento, sblocco cambio e freno a mano
- ⚠️ **Diagnosi spie**: descrivi l'anomalia o allega una **foto del quadro strumenti** con il pulsante della fotocamera`,
          timestamp: new Date().toISOString(),
        }
      ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isLoading]);

  const handleCopyText = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleFileAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('L\'immagine non deve superare i 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setAttachedImage({
        base64,
        mimeType: file.type || 'image/jpeg',
        name: file.name
      });
    };
    reader.readAsDataURL(file);
  };

  // Quick 1-click search & attach from Mandatory Gate screen
  const handleGateAutoSearch = async () => {
    setIsGateSearching(true);
    setGateError(null);
    try {
      const manualInfo = await searchAndRetrieveCarManual(vehicle);
      if (manualInfo) {
        const updated: Vehicle = {
          ...vehicle,
          manualInfo: manualInfo,
          technicalSpecs: {
            ...vehicle.technicalSpecs,
            manualInfo: manualInfo,
            ownersManualUrl: manualInfo.url
          }
        };
        onUpdateVehicle(updated);
      } else {
        setGateError(`Nessun manuale pre-indicizzato trovato per ${vehicle.brand} ${vehicle.model}. Puoi caricare il tuo file PDF o aprirlo nel gestore.`);
      }
    } catch (e: any) {
      setGateError('Impossibile completare la ricerca automatica. Usa il caricamento file o il gestore manuale.');
    } finally {
      setIsGateSearching(false);
    }
  };

  // Direct manual file upload from Gate screen
  const handleGateFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      const updated: Vehicle = {
        ...vehicle,
        manualInfo: {
          title: `Manuale — ${file.name.replace(/\.[^/.]+$/, '')}`,
          source: `File caricato: ${file.name}`,
          uploadedFileName: file.name,
          uploadedFileType: file.type || 'application/pdf',
          uploadedFileData: base64,
          lastUpdated: new Date().toISOString()
        }
      };
      onUpdateVehicle(updated);
    };
    reader.readAsDataURL(file);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const message = (textToSend || inputText).trim();
    if (!message && !attachedImage) return;

    const userMsg: AIChatMessage = {
      id: `msg_${Date.now()}_user`,
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
      attachmentName: attachedImage?.name,
      attachmentType: attachedImage?.mimeType,
      attachmentData: attachedImage?.base64,
    };

    const newHistory = [...chatMessages, userMsg];
    onUpdateVehicle({
      ...vehicle,
      aiChatHistory: newHistory,
    });

    setInputText('');
    const currentAttachment = attachedImage;
    setAttachedImage(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/car-assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          car: vehicle,
          message: message,
          history: newHistory.map(m => ({ role: m.role, content: m.content })),
          imageAttachment: currentAttachment ? {
            mimeType: currentAttachment.mimeType,
            base64: currentAttachment.base64
          } : undefined
        }),
      });

      let replyContent = '';
      if (res.ok) {
        const data = await res.json();
        replyContent = data.reply || '';
      }

      if (!replyContent) {
        replyContent = `Ho elaborato la tua richiesta per **${vehicle.brand} ${vehicle.model}**.\n\nPer maggiori dettagli su questa operazione, puoi consultare la sezione della Scheda Tecnica o specificare il dettaglio che desideri approfondire.`;
      }

      const assistantMsg: AIChatMessage = {
        id: `msg_${Date.now()}_ai`,
        role: 'assistant',
        content: replyContent,
        timestamp: new Date().toISOString(),
      };

      onUpdateVehicle({
        ...vehicle,
        aiChatHistory: [...newHistory, assistantMsg],
      });
    } catch (err: any) {
      const fallbackMsg: AIChatMessage = {
        id: `msg_${Date.now()}_err`,
        role: 'assistant',
        content: `Non è stato possibile contattare il server per la tua domanda. Riprova tra poco oppure verifica la connessione.`,
        timestamp: new Date().toISOString(),
      };
      onUpdateVehicle({
        ...vehicle,
        aiChatHistory: [...newHistory, fallbackMsg],
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    if (!window.confirm('Vuoi cancellare la cronologia della chat per questa auto?')) return;
    onUpdateVehicle({
      ...vehicle,
      aiChatHistory: [],
    });
  };

  const handleSelectPrompt = (prompt: string) => {
    setShowPromptsModal(false);
    handleSendMessage(prompt);
  };

  const activeCategory = promptCategories.find(c => c.id === activeModalTab) || promptCategories[0];

  // =========================================================================
  // IF MANUAL IS NOT ATTACHED: DISPLAY MANDATORY MANUAL ONBOARDING GATE
  // =========================================================================
  if (!hasManual) {
    return (
      <div className="w-full max-w-full min-w-0 bg-white border border-slate-200/90 rounded-3xl shadow-xs overflow-hidden flex flex-col">
        
        {/* Gate Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-sm sm:text-base text-white truncate">
                Assistente AI & Manuale di Bordo
              </h3>
              <p className="text-xs text-slate-300 truncate">
                {vehicle.brand} {vehicle.model} {vehicle.trimLevel ? `· ${vehicle.trimLevel}` : ''}
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-400/30 shrink-0 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" /> Manuale Richiesto
          </span>
        </div>

        {/* Gate Body Content */}
        <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-3xl mx-auto w-full">
          
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 bg-blue-50 text-blue-600 rounded-2xl mb-1">
              <BookOpen className="w-8 h-8" />
            </div>
            <h4 className="text-lg sm:text-xl font-bold text-slate-900">
              Collega il Manuale d&apos;Uso per Sbloccare l&apos;AI
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
              Per garantirti <strong>procedure operative certificate</strong>, specifiche esatte di viscosità dei fluidi, schemi di reset del quadro e posizioni dei comandi della tua <strong>{vehicle.brand} {vehicle.model}</strong>, è obbligatorio collegare il manuale d&apos;uso.
            </p>
          </div>

          {gateError && (
            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>{gateError}</span>
            </div>
          )}

          {/* 3 Interactive Methods to attach Manual */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            
            {/* Option 1: Automatic 1-Click Search */}
            <div className="p-4 sm:p-5 bg-gradient-to-b from-blue-50/80 to-white border border-blue-200 rounded-2xl flex flex-col justify-between space-y-3">
              <div className="space-y-1.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h5 className="font-bold text-slate-900 text-sm sm:text-base">Ricerca 1-Click Online</h5>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Cerca automaticamente nell&apos;archivio costruttori e collega il PDF ufficiale.
                </p>
              </div>
              <button
                type="button"
                onClick={handleGateAutoSearch}
                disabled={isGateSearching}
                className="w-full min-h-[44px] py-2.5 px-3.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs sm:text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                {isGateSearching ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Ricerca in corso...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Cerca & Sblocca</span>
                  </>
                )}
              </button>
            </div>

            {/* Option 2: Upload File */}
            <div className="p-4 sm:p-5 bg-white border border-slate-200 rounded-2xl flex flex-col justify-between space-y-3 shadow-2xs">
              <div className="space-y-1.5">
                <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
                  <Upload className="w-4 h-4" />
                </div>
                <h5 className="font-bold text-slate-900 text-sm sm:text-base">Carica File PDF / Foto</h5>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Carica il libretto d&apos;uso in PDF o le foto delle pagine che ti interessano.
                </p>
              </div>
              <input
                type="file"
                ref={gateFileInputRef}
                accept="application/pdf,image/*"
                onChange={handleGateFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => gateFileInputRef.current?.click()}
                className="w-full min-h-[44px] py-2.5 px-3.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-xs sm:text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <FileText className="w-4 h-4" />
                <span>Carica Documento</span>
              </button>
            </div>

            {/* Option 3: Advanced Manual Manager Modal */}
            <div className="p-4 sm:p-5 bg-white border border-slate-200 rounded-2xl flex flex-col justify-between space-y-3 shadow-2xs">
              <div className="space-y-1.5">
                <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                </div>
                <h5 className="font-bold text-slate-900 text-sm sm:text-base">Gestore Avanzato</h5>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Inserisci link web personalizzato, note d&apos;officina o configura i dettagli.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowManualModal(true)}
                className="w-full min-h-[44px] py-2.5 px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <span>Apri Gestore Completo</span>
              </button>
            </div>

          </div>

          {/* Quick FAQ info box */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] text-slate-600 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              Una volta collegato il manuale, l&apos;Assistente AI memorizzerà per sempre le specifiche per <strong>{vehicle.brand} {vehicle.model}</strong> e risponderà istantaneamente ad ogni quesito.
            </span>
          </div>

        </div>

        {/* Modal for manual manager */}
        <ManualManagerModal
          isOpen={showManualModal}
          vehicle={vehicle}
          onClose={() => setShowManualModal(false)}
          onSaveManual={(updatedVehicle) => {
            onUpdateVehicle(updatedVehicle);
            setShowManualModal(false);
          }}
        />

      </div>
    );
  }

  // =========================================================================
  // UNLOCKED AI ASSISTANT CHAT INTERFACE
  // =========================================================================
  return (
    <div className="w-full max-w-full min-w-0 bg-white border border-slate-200/90 rounded-3xl shadow-xs flex flex-col h-[580px] sm:h-[650px] md:h-[700px] overflow-hidden relative">
      
      {/* 1. HEADER (MOBILE-ADAPTED & CLEAN) */}
      <div className="bg-slate-900 text-white p-3 sm:p-3.5 px-3.5 sm:px-5 flex items-center justify-between border-b border-slate-800 shrink-0 gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xs shrink-0">
            <Bot className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h3 className="font-bold text-xs sm:text-sm text-white truncate">Assistente & Manuale AI</h3>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-400/20 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Manuale Attivo
              </span>
            </div>
            <p className="text-[11px] text-slate-300 truncate font-medium">
              {vehicle.brand} {vehicle.model} {vehicle.trimLevel ? `· ${vehicle.trimLevel}` : ''} {vehicle.plate ? `(${vehicle.plate})` : ''}
            </p>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setShowPromptsModal(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-xs transition-all cursor-pointer active:scale-95 border border-blue-400/30"
            title="Apri domande rapide e procedure"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Domande Rapide</span>
          </button>

          <button
            type="button"
            onClick={handleClearHistory}
            title="Svuota cronologia chat"
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 1.1 DEDICATED OFFICIAL OWNER MANUAL STATUS BAR */}
      <div className="bg-slate-800 border-b border-slate-700/80 px-3 sm:px-4 py-2 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
            <BookOpen className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-white text-xs truncate">
                {manualData?.title || `Manuale di Uso e Manutenzione — ${vehicle.brand} ${vehicle.model}`}
              </span>
              <span className="hidden sm:inline-flex items-center gap-0.5 text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-1.5 py-0.2 rounded border border-emerald-500/30 shrink-0">
                <CheckCircle2 className="w-2.5 h-2.5" /> Indicizzato
              </span>
            </div>
            <p className="text-[10px] text-slate-300 truncate">
              Fonte: {manualData?.source || 'Manuale Originale Costruttore'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setShowManualModal(true)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 hover:text-white font-bold text-xs shadow-xs transition-all cursor-pointer shrink-0 active:scale-95 border border-slate-600"
            title="Gestisci o cambia il manuale associato"
          >
            <Upload className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden xs:inline">Gestisci</span>
          </button>

          {manualData?.url && (
            <a
              href={manualData.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-xs transition-all cursor-pointer shrink-0 active:scale-95"
              title="Apri PDF del manuale in nuova scheda"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">PDF</span>
            </a>
          )}
        </div>
      </div>

      {/* 2. MESSAGES FEED */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 space-y-3 bg-slate-50/70 min-w-0">
        {chatMessages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-2 sm:gap-2.5 ${isUser ? 'justify-end' : 'justify-start'} min-w-0`}
            >
              {!isUser && (
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-2xs mt-1">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}

              <div
                className={`group relative max-w-[88%] sm:max-w-[82%] md:max-w-[78%] min-w-0 rounded-2xl p-3 sm:p-3.5 text-xs sm:text-[13px] leading-relaxed shadow-2xs overflow-hidden ${
                  isUser
                    ? 'bg-blue-600 text-white rounded-tr-xs'
                    : 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-xs'
                }`}
              >
                {/* Visual Attachment Preview */}
                {msg.attachmentData && (
                  <div className="mb-2 rounded-xl overflow-hidden border border-slate-200 max-w-xs shadow-2xs">
                    <img 
                      src={msg.attachmentData} 
                      alt={msg.attachmentName || 'Allegato'} 
                      className="max-h-48 w-full object-cover"
                    />
                  </div>
                )}

                {/* Markdown Content formatted strictly with responsive styling */}
                <div className={isUser ? 'prose-invert font-medium break-words overflow-hidden text-xs sm:text-[13px]' : 'prose prose-slate max-w-none text-slate-850 break-words overflow-hidden text-xs sm:text-[13px]'}>
                  <ReactMarkdown
                    components={{
                      p: ({ node, ...props }) => <p className="my-1 leading-relaxed" {...props} />,
                      ul: ({ node, ...props }) => <ul className="my-1.5 pl-4 list-disc space-y-0.5" {...props} />,
                      ol: ({ node, ...props }) => <ol className="my-1.5 pl-4 list-decimal space-y-1" {...props} />,
                      li: ({ node, ...props }) => <li className="leading-relaxed" {...props} />,
                      strong: ({ node, ...props }) => <strong className={isUser ? "font-extrabold text-white" : "font-extrabold text-slate-900"} {...props} />,
                      code: ({ node, inline, ...props }: any) => inline ? (
                        <code className={isUser ? "bg-blue-700/80 text-blue-100 px-1 py-0.5 rounded text-[11px] font-mono" : "bg-slate-100 text-blue-700 px-1 py-0.5 rounded text-[11px] font-mono border border-slate-200"} {...props} />
                      ) : (
                        <pre className="bg-slate-900 text-slate-100 p-2.5 rounded-xl text-[11px] font-mono overflow-x-auto my-2 border border-slate-800">
                          <code {...props} />
                        </pre>
                      ),
                      table: ({ node, ...props }) => (
                        <div className="overflow-x-auto my-2 rounded-xl border border-slate-200">
                          <table className="min-w-full text-xs text-left divide-y divide-slate-200" {...props} />
                        </div>
                      )
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>

                {/* Footer with time and copy action */}
                <div className={`flex items-center justify-between mt-2 pt-1 border-t ${isUser ? 'border-blue-500/40 text-blue-200' : 'border-slate-100 text-slate-400'}`}>
                  <span className="text-[10px] font-semibold">
                    {new Date(msg.timestamp).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                  </span>

                  {!isUser && (
                    <button
                      type="button"
                      onClick={() => handleCopyText(msg.content, msg.id)}
                      className="flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-blue-600 transition-colors cursor-pointer py-0.5 px-1 rounded hover:bg-slate-100"
                      title="Copia risposta"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-500" />
                          <span className="text-emerald-600">Copiato</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copia</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {isUser && (
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-2xs mt-1">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-2 sm:gap-2.5 justify-start items-center animate-in fade-in duration-150">
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-2.5 sm:p-3 shadow-2xs flex items-center gap-2 text-xs text-slate-600 font-medium">
              <RefreshCw className="w-3.5 h-3.5 text-blue-600 animate-spin" />
              <span>Consultazione manuale tecnico di bordo in corso...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 3. ATTACHMENT PREVIEW */}
      {attachedImage && (
        <div className="px-3 sm:px-4 py-1.5 bg-blue-50 border-t border-blue-200/80 flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-2 truncate">
            <img src={attachedImage.base64} alt="Anteprima" className="w-6 h-6 object-cover rounded-md border border-blue-300 shrink-0" />
            <span className="font-bold text-slate-800 truncate text-[11px]">{attachedImage.name}</span>
          </div>
          <button
            type="button"
            onClick={() => setAttachedImage(null)}
            className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 4. VOICE LISTENING BANNER */}
      {isListening && (
        <div className="px-3 py-1.5 bg-rose-50 border-t border-rose-200 flex items-center justify-between text-xs text-rose-700 font-bold shrink-0 animate-pulse">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping"></span>
            <span>Ascolto vocale attivo... Parla adesso</span>
          </div>
          <button
            type="button"
            onClick={toggleVoiceInput}
            className="text-[10px] px-2 py-0.5 bg-rose-600 text-white rounded-md hover:bg-rose-700 cursor-pointer"
          >
            Stop
          </button>
        </div>
      )}

      {/* 4.5. QUICK SUGGESTION CHIPS BAR */}
      <div className="px-3 py-2 bg-slate-100/90 border-t border-slate-200/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider shrink-0 flex items-center gap-1 mr-0.5">
          <Sparkles className="w-3 h-3 text-blue-600" /> Suggeriti:
        </span>
        {quickSuggestionChips.map((chip, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSendMessage(chip)}
            disabled={isLoading}
            className="shrink-0 text-[11px] font-semibold bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200/90 hover:border-blue-300 rounded-full px-2.5 py-1 transition-all cursor-pointer shadow-2xs active:scale-95 disabled:opacity-50"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* 5. COMPACT INPUT BAR (NO HORIZONTAL OVERFLOW) */}
      <div className="p-2.5 sm:p-3 bg-white border-t border-slate-200/80 flex items-center gap-1.5 sm:gap-2 shrink-0">
        
        {/* Hidden File / Camera Inputs */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleFileAttach}
          className="hidden"
        />
        <input
          type="file"
          ref={cameraInputRef}
          accept="image/*"
          capture="environment"
          onChange={handleFileAttach}
          className="hidden"
        />

        {/* Gallery / Document button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          title="Allega foto o documento"
          className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer shrink-0 active:scale-95"
        >
          <Paperclip className="w-4 h-4" />
        </button>

        {/* Camera button for smartphones */}
        <button
          type="button"
          onClick={() => cameraInputRef.current?.click()}
          title="Scatta foto della spia o vano motore"
          className="min-h-[44px] min-w-[44px] items-center justify-center p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer shrink-0 active:scale-95 hidden xs:flex"
        >
          <Camera className="w-4 h-4" />
        </button>

        {/* Voice Dictation button */}
        {speechSupported && (
          <button
            type="button"
            onClick={toggleVoiceInput}
            title={isListening ? 'Interrompi dettatura vocale' : 'Dettatura vocale'}
            className={`min-h-[44px] min-w-[44px] flex items-center justify-center p-2.5 rounded-xl transition-all cursor-pointer shrink-0 active:scale-95 ${
              isListening
                ? 'bg-rose-600 text-white shadow-xs animate-pulse'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
        )}

        {/* Text Input */}
        <input
          type="text"
          placeholder="Chiedi qualsiasi cosa (olio, spie, gomme, reset...)"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          disabled={isLoading}
          className="flex-1 min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 text-sm font-medium focus:outline-hidden transition-all placeholder:text-slate-400 min-w-0"
        />

        {/* Send button */}
        <button
          type="button"
          onClick={() => handleSendMessage()}
          disabled={isLoading || (!inputText.trim() && !attachedImage)}
          title="Invia"
          className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl shadow-xs transition-all cursor-pointer active:scale-95 shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>

      </div>

      {/* 6. MODAL / DIALOG PER DOMANDE RAPIDE & PROCEDURE */}
      {showPromptsModal && (
        <div className="absolute inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white w-full sm:max-w-xl rounded-t-3xl sm:rounded-3xl shadow-xl flex flex-col max-h-[85%] sm:max-h-[560px] overflow-hidden border border-slate-200 animate-in slide-in-from-bottom-4 duration-200">
            
            {/* Modal Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">Domande Rapide & Procedure</h4>
                  <p className="text-[11px] text-slate-300">Seleziona un argomento per interrogare l&apos;AI</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowPromptsModal(false)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="px-3 py-2 bg-slate-100 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
              {promptCategories.map((cat) => {
                const Icon = cat.icon;
                const isSelected = activeModalTab === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveModalTab(cat.id)}
                    className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-blue-600 text-white shadow-xs' 
                        : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200/80'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{cat.title.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>

            {/* Modal Content / Prompts List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2.5 bg-slate-50/50">
              <div className="mb-2">
                <h5 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <activeCategory.icon className="w-4 h-4 text-blue-600" />
                  {activeCategory.title}
                </h5>
                <p className="text-[11px] text-slate-500">{activeCategory.description}</p>
              </div>

              <div className="space-y-2">
                {activeCategory.prompts.map((promptText, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectPrompt(promptText)}
                    className="w-full text-left p-3 bg-white hover:bg-blue-50/80 hover:border-blue-300 border border-slate-200 rounded-2xl transition-all flex items-center justify-between group shadow-2xs cursor-pointer active:scale-[0.99]"
                  >
                    <span className="text-xs text-slate-700 group-hover:text-blue-900 font-medium pr-2">
                      {promptText}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 shrink-0 transition-transform group-hover:translate-x-0.5" />
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-white border-t border-slate-200 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setShowPromptsModal(false)}
                className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Chiudi
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 7. MODAL GESTIONE & ALLEGATO MANUALE DI BORDO */}
      <ManualManagerModal
        isOpen={showManualModal}
        vehicle={vehicle}
        onClose={() => setShowManualModal(false)}
        onSaveManual={(updatedVehicle) => {
          onUpdateVehicle(updatedVehicle);
          setShowManualModal(false);
        }}
      />

    </div>
  );
};
