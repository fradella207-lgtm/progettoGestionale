import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Paperclip, 
  X, 
  RefreshCw, 
  Car, 
  User, 
  AlertTriangle, 
  HelpCircle, 
  Trash2,
  CheckCircle2,
  Cpu,
  Copy,
  Check,
  Sliders,
  VolumeX,
  ShieldAlert,
  Tv,
  Wrench,
  KeyRound,
  Gauge
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Vehicle, AIChatMessage } from '../types';

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
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [attachedImage, setAttachedImage] = useState<{ base64: string; mimeType: string; name: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const categories = [
    { id: 'all', label: 'Tutti i Temi', icon: Sparkles },
    { id: 'controls', label: 'Controlli ESP & Launch', icon: Sliders },
    { id: 'isa', label: 'Suono Limite (ISA)', icon: VolumeX },
    { id: 'adas', label: 'Taratura ADAS', icon: ShieldAlert },
    { id: 'screen', label: 'Schermo & Infotainment', icon: Tv },
    { id: 'lights', label: 'Spie & Guasti', icon: AlertTriangle },
    { id: 'manual', label: 'Specifiche & Fluidi', icon: Wrench },
    { id: 'comfort', label: 'Trucchi & Comfort', icon: KeyRound },
  ];

  const categoryPrompts: Record<string, string[]> = {
    all: [
      'Come si disattiva il controllo di trazione ed ESP (anche totale)?',
      'Come si toglie o silenzia il suono superato limite di velocità (ISA GSR II)?',
      'Come si impostano e tarano gli ADAS (Lane Assist, ACC e distanza)?',
      'Come fare il reset forzato dello schermo infotainment se si blocca?',
      'Come si azzera la spia pressione pneumatici (TPMS)?',
      'Quali sono i liquidi, fusibili e coppie serraggio ufficiali?'
    ],
    controls: [
      'Come si disattivano i controlli di trazione (ASR/TCS) per partire su neve?',
      'Come si disattiva completamente l\'ESP / ESC su questa vettura?',
      'Qual è la procedura per fare il Launch Control con questo cambio?',
      'Differenza tra modalità ESC Sport ed ESC Disattivato'
    ],
    isa: [
      'Come si toglie o silenzia il cicalino di superamento limite di velocità (ISA)?',
      'Esiste un tasto rapido o scorciatoia sul volante per disattivare l\'avviso sonoro limiti?',
      'Perché l\'avviso sonoro del limite si riattiva ogni volta che accendo l\'auto?',
      'Come impostare l\'avviso del limite di velocità solo visivo e non sonoro'
    ],
    adas: [
      'Come regolare la sensibilità e vibrazione del Lane Assist (Mantenimento Corsia)?',
      'Come tarare la distanza di sicurezza del Cruise Control Adattivo (ACC)?',
      'Come impostare l\'adeguamento automatico predittivo della velocità su curve e rotatorie?',
      'Come calibrare o disattivare la frenata automatica d\'emergenza (Front Assist)?',
      'Come impostare i sensori dell\'angolo cieco (Blind Spot Monitor)?'
    ],
    screen: [
      'Come fare il riavvio forzato (hard reset) dello schermo se non risponde?',
      'Come collegare Apple CarPlay o Android Auto in wireless e con cavo?',
      'Come personalizzare le schermate del quadro strumenti digitale (Digital Cockpit)?',
      'Come reimpostare ai valori di fabbrica l\'infotainment o eliminare i telefoni abbinati?'
    ],
    lights: [
      'Cosa fare se si accende la spia gialla avaria motore (MIL)?',
      'Quali sono le spie rosse di pericolo che impongono l\'arresto immediato?',
      'Come leggere e interpretare i codici errore OBD2 (P0xxx)?',
      'Spiegami il significato della spia chiave inglese / tagliando'
    ],
    manual: [
      'Quale olio motore con specifica esatta e quanti litri occorrono per il tagliando?',
      'Qual è la coppia di serraggio in Nm dei bulloni delle ruote?',
      'Dove si trova la scatola fusibili e la presa diagnosi OBD2?',
      'Quali pressioni pneumatici sono previste a vuoto e a pieno carico?'
    ],
    comfort: [
      'Come aprire e chiudere tutti i finestrini e il tetto dal telecomando?',
      'Come attivare l\'abbassamento automatico dello specchietto in retromarcia?',
      'Come attivare i fari di cortesia "Follow Me Home" a motore spento?',
      'Come sbloccare il freno a mano o il cambio in caso di batteria scarica?'
    ]
  };

  const chatMessages: AIChatMessage[] = vehicle.aiChatHistory && vehicle.aiChatHistory.length > 0 
    ? vehicle.aiChatHistory 
    : [
        {
          id: 'welcome_msg',
          role: 'assistant',
          content: `Ciao! Sono il tuo **Assistente Tecnico Ufficiale a 360°** per la tua **${vehicle.brand} ${vehicle.model}** ${vehicle.trimLevel ? `(${vehicle.trimLevel})` : ''} — ${vehicle.motorization || vehicle.fuelType}.\n\nConosco l'intero manuale di uso, manutenzione ed officina della tua vettura. Posso aiutarti su qualsiasi argomento:\n\n- 🎛️ **Disattivazione controlli di trazione (ASR) ed ESP totale**, modalità Sport e Launch Control\n- 🔊 **Disattivazione o silenziamento del suono superamento limite velocità (ISA / GSR II)** e scorciatoie rapide\n- 🛡️ **Taratura e configurazione di tutti gli ADAS** (Lane Assist, Cruise Control Adattivo ACC, Front Assist, Blind Spot)\n- 📱 **Funzionamento e Hard Reset dello schermo**, Apple CarPlay, Android Auto e Digital Cockpit\n- ⚠️ **Diagnosi spie del cruscotto**, codici OBD2 o analisi visiva da foto\n- 🔧 **Specifiche costruttore Quattroruote**, oli omologati, coppie serraggio, fusibili e posizioni OBD\n\n*Scrivimi una domanda o seleziona una delle categorie rapide qui sotto!*`,
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

      if (!res.ok) {
        throw new Error('Errore di comunicazione con l\'assistente AI');
      }

      const data = await res.json();
      const assistantMsg: AIChatMessage = {
        id: `msg_${Date.now()}_ai`,
        role: 'assistant',
        content: data.reply || 'Non è stato possibile elaborare una risposta completa.',
        timestamp: new Date().toISOString(),
      };

      onUpdateVehicle({
        ...vehicle,
        aiChatHistory: [...newHistory, assistantMsg],
      });
    } catch (err: any) {
      const errorMsg: AIChatMessage = {
        id: `msg_${Date.now()}_err`,
        role: 'assistant',
        content: `Si è verificato un errore durante la richiesta AI: ${err?.message || 'Server non raggiungibile'}. Verifica la connessione e riprova.`,
        timestamp: new Date().toISOString(),
      };
      onUpdateVehicle({
        ...vehicle,
        aiChatHistory: [...newHistory, errorMsg],
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

  const activePrompts = categoryPrompts[selectedCategory] || categoryPrompts.all;

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl shadow-sm flex flex-col h-[740px] overflow-hidden animate-in fade-in duration-200">
      
      {/* CHAT HEADER */}
      <div className="bg-slate-900 text-white p-4 px-5 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-md">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-white">Assistente Tecnico & Manuale 360°</h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-bold border border-blue-400/20">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
                Gemini 3.7 Live
              </span>
            </div>
            <p className="text-[11px] text-slate-300 truncate max-w-sm font-medium">
              {vehicle.brand} {vehicle.model} {vehicle.trimLevel ? `· ${vehicle.trimLevel}` : ''} {vehicle.plate ? `(${vehicle.plate})` : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleClearHistory}
            title="Svuota chat"
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* TOPIC CATEGORIES SELECTOR */}
      <div className="px-3 py-2 bg-slate-900/95 border-b border-slate-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-[11px] transition-all cursor-pointer ${
                isSelected 
                  ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-400' 
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* QUICK PROMPTS CHIPS */}
      <div className="p-2.5 bg-slate-50 border-b border-slate-200/80 flex items-center gap-2 overflow-x-auto no-scrollbar text-xs">
        <div className="flex items-center gap-1.5 text-slate-600 font-bold shrink-0 text-[11px] pl-1">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Domande Rapide:
        </div>
        {activePrompts.map((q, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSendMessage(q)}
            disabled={isLoading}
            className="shrink-0 px-3 py-1.5 bg-white hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 text-slate-700 font-semibold rounded-xl border border-slate-200 text-xs transition-all shadow-2xs active:scale-95 cursor-pointer disabled:opacity-50"
          >
            {q}
          </button>
        ))}
      </div>

      {/* MESSAGES LIST */}
      <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-4 bg-slate-50/60">
        {chatMessages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`group relative max-w-[88%] md:max-w-[78%] rounded-2xl p-4 text-xs leading-relaxed shadow-xs ${
                  isUser
                    ? 'bg-blue-600 text-white rounded-tr-xs'
                    : 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-xs'
                }`}
              >
                {/* Visual Attachment Preview if any */}
                {msg.attachmentData && (
                  <div className="mb-2.5 rounded-xl overflow-hidden border border-slate-200 max-w-xs shadow-xs">
                    <img 
                      src={msg.attachmentData} 
                      alt={msg.attachmentName || 'Allegato'} 
                      className="max-h-48 w-full object-cover"
                    />
                  </div>
                )}

                <div className={isUser ? 'prose-invert font-medium' : 'prose prose-slate max-w-none prose-p:my-1.5 prose-headings:my-2 prose-ul:my-1.5 prose-li:my-0.5'}>
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>

                <div className={`flex items-center justify-between mt-2.5 pt-1 border-t ${isUser ? 'border-blue-500/40 text-blue-200' : 'border-slate-100 text-slate-400'}`}>
                  <span className="text-[10px] font-semibold">
                    {new Date(msg.timestamp).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                  </span>

                  {!isUser && (
                    <button
                      type="button"
                      onClick={() => handleCopyText(msg.content, msg.id)}
                      className="flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
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
                <div className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-xs mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-3 justify-start items-center animate-in fade-in duration-150">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs flex items-center gap-2.5 text-xs text-slate-600 font-medium">
              <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
              <span>Consultazione manuale tecnico di bordo e specifiche ufficiali in corso...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ATTACHMENT PREVIEW BEFORE SENDING */}
      {attachedImage && (
        <div className="px-4 py-2 bg-blue-50 border-t border-blue-200/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 truncate">
            <img src={attachedImage.base64} alt="Anteprima" className="w-8 h-8 object-cover rounded-lg border border-blue-300" />
            <span className="font-bold text-slate-800 truncate">{attachedImage.name}</span>
          </div>
          <button
            type="button"
            onClick={() => setAttachedImage(null)}
            className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* INPUT BAR */}
      <div className="p-3 md:p-4 bg-white border-t border-slate-200/80 flex items-center gap-2">
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleFileAttach}
          className="hidden"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          title="Allega foto della spia cruscotto, documento o libretto"
          className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl transition-colors cursor-pointer shrink-0"
        >
          <Paperclip className="w-4 h-4" />
        </button>

        <input
          type="text"
          placeholder={`Chiedi qualsiasi cosa (controlli ESP, suono limiti ISA, ADAS, schermo, fusibili)...`}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          disabled={isLoading}
          className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 text-xs md:text-sm font-medium focus:outline-hidden transition-all placeholder:text-slate-400"
        />

        <button
          type="button"
          onClick={() => handleSendMessage()}
          disabled={isLoading || (!inputText.trim() && !attachedImage)}
          className="p-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-2xl shadow-xs transition-all cursor-pointer active:scale-95 shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};

