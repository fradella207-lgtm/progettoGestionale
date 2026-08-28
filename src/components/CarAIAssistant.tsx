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
  Cpu
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
  const [attachedImage, setAttachedImage] = useState<{ base64: string; mimeType: string; name: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chatMessages: AIChatMessage[] = vehicle.aiChatHistory && vehicle.aiChatHistory.length > 0 
    ? vehicle.aiChatHistory 
    : [
        {
          id: 'welcome_msg',
          role: 'assistant',
          content: `Ciao! Sono il tuo **Assistente Tecnico Ufficiale** per la tua **${vehicle.brand} ${vehicle.model}** (${vehicle.motorization || vehicle.fuelType}).\n\nConosco tutte le specifiche ufficiali Quattroruote, i dati di omologazione del libretto, la storia dei tuoi tagliandi e le procedure d'officina.\n\nCome posso aiutarti oggi? Puoi chiedermi spiegazioni su spie del cruscotto, procedure di azzeramento, lubrificanti ammessi, o caricare una foto per una diagnosi visiva!`,
          timestamp: new Date().toISOString(),
        }
      ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isLoading]);

  const quickQuestions = [
    'Come si azzera la spia pressione pneumatici (TPMS)?',
    'Quale olio motore posso usare per il rabbocco?',
    'Quali misure di pneumatici posso montare da libretto?',
    'Come si resetta la spia tagliando / service?',
    'Consigli di guida per consumare meno con questo motore',
    'Cosa significano le voci P.5 e V.9 sul libretto?'
  ];

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

  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl shadow-xs flex flex-col h-[680px] overflow-hidden animate-in fade-in duration-200">
      
      {/* CHAT HEADER */}
      <div className="bg-slate-900 text-white p-4 px-5 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-white">Assistente AI Quattroruote</h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Gemini 3.7 Live
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate max-w-xs">
              Context: {vehicle.brand} {vehicle.model} ({vehicle.plate})
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleClearHistory}
          title="Svuota chat"
          className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* QUICK PROMPTS CHIPS */}
      <div className="p-2.5 bg-slate-50 border-b border-slate-100 flex items-center gap-2 overflow-x-auto no-scrollbar text-xs">
        <div className="flex items-center gap-1.5 text-slate-500 font-bold shrink-0 text-[11px] pl-1">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Domande Rapide:
        </div>
        {quickQuestions.map((q, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSendMessage(q)}
            disabled={isLoading}
            className="shrink-0 px-3 py-1.5 bg-white hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 text-slate-700 font-semibold rounded-xl border border-slate-200 text-xs transition-all shadow-2xs active:scale-95 cursor-pointer"
          >
            {q}
          </button>
        ))}
      </div>

      {/* MESSAGES LIST */}
      <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-4 bg-slate-50/50">
        {chatMessages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] md:max-w-[75%] rounded-2xl p-4 text-xs leading-relaxed shadow-xs ${
                  isUser
                    ? 'bg-blue-600 text-white rounded-tr-xs'
                    : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs'
                }`}
              >
                {/* Visual Attachment Preview if any */}
                {msg.attachmentData && (
                  <div className="mb-2 rounded-xl overflow-hidden border border-white/20 max-w-xs">
                    <img 
                      src={msg.attachmentData} 
                      alt={msg.attachmentName || 'Allegato'} 
                      className="max-h-48 w-full object-cover"
                    />
                  </div>
                )}

                <div className={isUser ? 'prose-invert font-medium' : 'prose prose-slate max-w-none'}>
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>

                <div className={`text-[10px] mt-2 font-semibold ${isUser ? 'text-blue-200 text-right' : 'text-slate-400'}`}>
                  {new Date(msg.timestamp).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
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
          <div className="flex gap-3 justify-start items-center">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs flex items-center gap-2 text-xs text-slate-500 font-medium">
              <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
              <span>L&apos;assistente sta analizzando la richiesta e consultando le specifiche...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ATTACHMENT PREVIEW BEFORE SENDING */}
      {attachedImage && (
        <div className="px-4 py-2 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 truncate">
            <img src={attachedImage.base64} alt="Anteprima" className="w-8 h-8 object-cover rounded-lg border border-slate-300" />
            <span className="font-bold text-slate-700 truncate">{attachedImage.name}</span>
          </div>
          <button
            type="button"
            onClick={() => setAttachedImage(null)}
            className="p-1 text-slate-400 hover:text-rose-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* INPUT BAR */}
      <div className="p-3 md:p-4 bg-white border-t border-slate-100 flex items-center gap-2">
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
          title="Allega foto della spia cruscotto o documento"
          className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl transition-colors cursor-pointer"
        >
          <Paperclip className="w-4 h-4" />
        </button>

        <input
          type="text"
          placeholder={`Chiedi qualsiasi cosa su ${vehicle.brand} ${vehicle.model}...`}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          disabled={isLoading}
          className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 text-xs md:text-sm font-medium focus:outline-none transition-all"
        />

        <button
          type="button"
          onClick={() => handleSendMessage()}
          disabled={isLoading || (!inputText.trim() && !attachedImage)}
          className="p-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-2xl shadow-xs transition-all cursor-pointer active:scale-95"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
