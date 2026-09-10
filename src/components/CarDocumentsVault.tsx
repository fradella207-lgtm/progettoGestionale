import React, { useState, useRef, useMemo } from 'react';
import { 
  FileText, 
  Upload, 
  Trash2, 
  Eye, 
  Calendar, 
  Shield, 
  Sparkles, 
  Plus, 
  Download, 
  X, 
  FileCheck, 
  Receipt, 
  Car, 
  AlertTriangle, 
  CheckCircle2, 
  Bell, 
  Clock,
  AlertCircle
} from 'lucide-react';
import { Vehicle, VehicleDocument } from '../types';

interface CarDocumentsVaultProps {
  vehicle: Vehicle;
  onUpdateVehicle: (updated: Vehicle) => void;
}

export const CarDocumentsVault: React.FC<CarDocumentsVaultProps> = ({
  vehicle,
  onUpdateVehicle,
}) => {
  const [selectedDocForPreview, setSelectedDocForPreview] = useState<VehicleDocument | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAnalyzingAi, setIsAnalyzingAi] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<any | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'expiring' | 'expired'>('all');
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(() => {
    return 'Notification' in window && Notification.permission === 'granted';
  });

  // New Document Form State
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<'libretto' | 'assicurazione' | 'bollo' | 'tagliando' | 'altro'>('assicurazione');
  const [newExpiryDate, setNewExpiryDate] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [uploadedFileData, setUploadedFileData] = useState<string>('');
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [uploadedFileType, setUploadedFileType] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const docs = vehicle.documents || [];

  // Categorizzazione scadenze
  const { activeDocs, expiringSoonDocs, expiredDocs } = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const active: VehicleDocument[] = [];
    const expiring: VehicleDocument[] = [];
    const expired: VehicleDocument[] = [];

    docs.forEach(doc => {
      if (!doc.expiryDate) {
        active.push(doc);
        return;
      }
      const expDate = new Date(doc.expiryDate);
      expDate.setHours(0, 0, 0, 0);

      const diffDays = Math.round((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays < 0) {
        expired.push(doc);
      } else if (diffDays <= 30) {
        expiring.push(doc);
        active.push(doc);
      } else {
        active.push(doc);
      }
    });

    return { activeDocs: active, expiringSoonDocs: expiring, expiredDocs: expired };
  }, [docs]);

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      alert('Il tuo browser non supporta le notifiche native.');
      return;
    }
    try {
      const perm = await Notification.requestPermission();
      if (perm === 'granted') {
        setNotificationsEnabled(true);
        new Notification('MyGarage: Notifiche Attive', {
          body: 'Riceverai promemoria automatici per le scadenze di Bollo e Assicurazione.',
          icon: '/favicon.ico'
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      setFormError('Il file supera la dimensione massima consentita di 15MB');
      return;
    }

    setUploadedFileName(file.name);
    setUploadedFileType(file.type || 'application/pdf');
    if (!newTitle) {
      setNewTitle(file.name.replace(/\.[^/.]+$/, ''));
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setUploadedFileData(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyzeWithAI = async () => {
    if (!uploadedFileData) {
      setFormError('Carica prima una foto o PDF del documento per analizzarlo con AI.');
      return;
    }

    setIsAnalyzingAi(true);
    setFormError(null);

    try {
      const res = await fetch('/api/car-assistant/analyze-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentBase64: uploadedFileData,
          mimeType: uploadedFileType || 'image/jpeg',
          documentType: newType,
        }),
      });

      if (!res.ok) throw new Error('Errore durante la scansione OCR AI');
      const data = await res.json();
      if (data.extractedInfo) {
        setAiAnalysisResult(data.extractedInfo);
        if (data.extractedInfo.expiryDate && !newExpiryDate) {
          setNewExpiryDate(data.extractedInfo.expiryDate);
        }
        if (data.extractedInfo.summary && !newNotes) {
          setNewNotes(data.extractedInfo.summary);
        }
      }
    } catch (err: any) {
      setFormError(err?.message || 'Impossibile analizzare il documento con AI');
    } finally {
      setIsAnalyzingAi(false);
    }
  };

  const handleSaveDocument = () => {
    if (!newTitle.trim()) {
      setFormError('Inserisci un titolo per il documento.');
      return;
    }

    const newDoc: VehicleDocument = {
      id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      title: newTitle.trim(),
      type: newType,
      fileName: uploadedFileName || `${newTitle}.pdf`,
      fileType: uploadedFileType || 'application/pdf',
      fileData: uploadedFileData,
      uploadDate: new Date().toISOString().split('T')[0],
      expiryDate: newExpiryDate || undefined,
      notes: newNotes.trim() || undefined,
      extractedInfo: aiAnalysisResult || undefined,
    };

    const updatedDocs = [...docs, newDoc];
    onUpdateVehicle({
      ...vehicle,
      documents: updatedDocs,
    });

    setIsAddModalOpen(false);
    setNewTitle('');
    setNewType('assicurazione');
    setNewExpiryDate('');
    setNewNotes('');
    setUploadedFileData('');
    setUploadedFileName('');
    setUploadedFileType('');
    setAiAnalysisResult(null);
    setFormError(null);
  };

  const handleDeleteDocument = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Sei sicuro di voler eliminare questo documento dal tuo archivio?')) return;
    const updatedDocs = docs.filter(d => d.id !== id);
    onUpdateVehicle({
      ...vehicle,
      documents: updatedDocs,
    });
    if (selectedDocForPreview?.id === id) {
      setSelectedDocForPreview(null);
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'libretto':
        return { label: 'Libretto DUC', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: Car };
      case 'assicurazione':
        return { label: 'Polizza RCA', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: Shield };
      case 'bollo':
        return { label: 'Bollo Auto', bg: 'bg-amber-50 text-amber-700 border-amber-200', icon: Receipt };
      case 'tagliando':
        return { label: 'Tagliando', bg: 'bg-blue-50 text-blue-700 border-blue-200', icon: FileCheck };
      default:
        return { label: 'Documento', bg: 'bg-slate-100 text-slate-700 border-slate-200', icon: FileText };
    }
  };

  // Helper per calcolare i giorni rimanenti o scaduti
  const getExpiryLabel = (expiryDateStr?: string) => {
    if (!expiryDateStr) return null;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const exp = new Date(expiryDateStr);
    exp.setHours(0, 0, 0, 0);
    const diff = Math.round((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diff < 0) {
      return { 
        text: `Scaduto da ${Math.abs(diff)} ${Math.abs(diff) === 1 ? 'giorno' : 'giorni'}`, 
        color: 'text-red-700 bg-red-100 border-red-200', 
        status: 'expired' 
      };
    }
    if (diff === 0) {
      return { 
        text: 'Scade oggi!', 
        color: 'text-amber-800 bg-amber-100 border-amber-300 font-black animate-pulse', 
        status: 'today' 
      };
    }
    if (diff <= 30) {
      return { 
        text: `Scade tra ${diff} ${diff === 1 ? 'giorno' : 'giorni'}`, 
        color: 'text-amber-800 bg-amber-100 border-amber-200', 
        status: 'warning' 
      };
    }
    return { 
      text: `Valido fino al ${exp.toLocaleDateString('it-IT')}`, 
      color: 'text-slate-600 bg-slate-100 border-slate-200', 
      status: 'ok' 
    };
  };

  return (
    <div className="flex flex-col gap-4 font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* 1. HEADER COMPATTO CON PULSANTE NUOVO DOCUMENTO & NOTIFICHE */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-4 sm:p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base sm:text-lg font-black text-slate-900">Archivio Documenti & Scadenze</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Libretto DUC, Assicurazione, Bollo e Manutenzioni con notifiche di pagamento automatiche.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {!notificationsEnabled && (
            <button
              type="button"
              onClick={requestNotificationPermission}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
              title="Attiva notifiche di scadenza nel browser"
            >
              <Bell className="w-3.5 h-3.5 text-slate-600" />
              <span>Attiva Notifiche</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Aggiungi Documento</span>
          </button>
        </div>
      </div>

      {/* 2. NOTIFICHE BANNER DI ALLERTA SE PRESENTI SCADENZE */}
      {expiredDocs.length > 0 && (
        <div className="bg-red-50 border border-red-200 text-red-900 p-3.5 rounded-2xl flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span>
              <strong>Attenzione:</strong> {expiredDocs.length} {expiredDocs.length === 1 ? 'documento è scaduto' : 'documenti sono scaduti'} (es. {expiredDocs[0].title}). È necessario effettuare il rinnovo o il pagamento.
            </span>
          </div>
          <button
            onClick={() => setActiveFilter('expired')}
            className="bg-red-600 hover:bg-red-700 text-white font-bold text-[11px] px-3 py-1 rounded-xl shrink-0 transition-colors"
          >
            Vedi Scaduti
          </button>
        </div>
      )}

      {expiringSoonDocs.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 p-3.5 rounded-2xl flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Promemoria Pagamento:</strong> {expiringSoonDocs.length} {expiringSoonDocs.length === 1 ? 'documento scade' : 'documenti scadono'} entro i prossimi 30 giorni. Ricordati di rinnovarlo.
            </span>
          </div>
          <button
            onClick={() => setActiveFilter('expiring')}
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] px-3 py-1 rounded-xl shrink-0 transition-colors"
          >
            Vedi in Scadenza
          </button>
        </div>
      )}

      {/* 3. FILTRI CHIP VELOCI */}
      {docs.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-bold">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
              activeFilter === 'all' 
                ? 'bg-slate-900 text-white border-slate-900' 
                : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'
            }`}
          >
            Tutti ({docs.length})
          </button>
          
          <button
            onClick={() => setActiveFilter('active')}
            className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
              activeFilter === 'active' 
                ? 'bg-slate-900 text-white border-slate-900' 
                : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'
            }`}
          >
            Attivi & In Regola ({activeDocs.length})
          </button>

          {expiringSoonDocs.length > 0 && (
            <button
              onClick={() => setActiveFilter('expiring')}
              className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                activeFilter === 'expiring' 
                  ? 'bg-amber-600 text-white border-amber-600' 
                  : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
              }`}
            >
              In Scadenza ({expiringSoonDocs.length})
            </button>
          )}

          {expiredDocs.length > 0 && (
            <button
              onClick={() => setActiveFilter('expired')}
              className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                activeFilter === 'expired' 
                  ? 'bg-red-600 text-white border-red-600' 
                  : 'bg-red-50 text-red-800 border-red-200 hover:bg-red-100'
              }`}
            >
              Scaduti ({expiredDocs.length})
            </button>
          )}
        </div>
      )}

      {/* 4. SEZIONE DOCUMENTI SCADUTI (SEPARATA ESPLICITAMENTE COME RICHIESTO) */}
      {(activeFilter === 'all' || activeFilter === 'expired') && expiredDocs.length > 0 && (
        <div className="bg-red-50/40 border border-red-200/90 rounded-3xl p-4 sm:p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-red-200/60 pb-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <h3 className="text-xs sm:text-sm font-black text-red-950 uppercase tracking-wider">
                Documenti & Pagamenti Scaduti ({expiredDocs.length})
              </h3>
            </div>
            <span className="text-[11px] text-red-700 font-bold bg-red-100 px-2 py-0.5 rounded-lg border border-red-200">
              Richiede Pagamento / Rinnovo
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {expiredDocs.map((doc) => {
              const badge = getTypeBadge(doc.type);
              const Icon = badge.icon;
              const expLabel = getExpiryLabel(doc.expiryDate);

              return (
                <div
                  key={doc.id}
                  onClick={() => setSelectedDocForPreview(doc)}
                  className="bg-white border border-red-200 hover:border-red-400 rounded-2xl p-4 shadow-2xs transition-all cursor-pointer flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold border ${badge.bg}`}>
                        <Icon className="w-3 h-3" />
                        {badge.label}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteDocument(doc.id, e)}
                        className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                        title="Elimina"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-red-700 transition-colors truncate">
                      {doc.title}
                    </h4>
                    {doc.notes && (
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{doc.notes}</p>
                    )}
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                    {expLabel && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${expLabel.color}`}>
                        {expLabel.text}
                      </span>
                    )}
                    <span className="text-red-700 font-bold text-xs flex items-center gap-0.5">
                      <Eye className="w-3.5 h-3.5" /> Apri
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. SEZIONE DOCUMENTI ATTIVI E IN REGOLA */}
      {(activeFilter === 'all' || activeFilter === 'active' || activeFilter === 'expiring') && (
        <div className="flex flex-col gap-3">
          {expiredDocs.length > 0 && activeFilter === 'all' && (
            <div className="flex items-center gap-2 pt-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider">
                Documenti Attivi ({activeDocs.length})
              </h3>
            </div>
          )}

          {(activeFilter === 'expiring' ? expiringSoonDocs : activeDocs).length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center text-slate-400 text-xs">
              Nessun documento attivo in questa sezione.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {(activeFilter === 'expiring' ? expiringSoonDocs : activeDocs).map((doc) => {
                const badge = getTypeBadge(doc.type);
                const Icon = badge.icon;
                const expLabel = getExpiryLabel(doc.expiryDate);

                return (
                  <div
                    key={doc.id}
                    onClick={() => setSelectedDocForPreview(doc)}
                    className="bg-white border border-slate-200 hover:border-slate-400 rounded-2xl p-4 shadow-2xs transition-all cursor-pointer flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold border ${badge.bg}`}>
                          <Icon className="w-3 h-3" />
                          {badge.label}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteDocument(doc.id, e)}
                          className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                          title="Elimina"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                        {doc.title}
                      </h4>
                      {doc.notes && (
                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{doc.notes}</p>
                      )}
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                      {expLabel ? (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${expLabel.color}`}>
                          {expLabel.text}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">
                          {new Date(doc.uploadDate).toLocaleDateString('it-IT')}
                        </span>
                      )}

                      <span className="text-indigo-600 font-bold text-xs flex items-center gap-0.5">
                        <Eye className="w-3.5 h-3.5" /> Apri
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MODAL AGGIUNGI DOCUMENTO */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-lg w-full p-4 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">Nuovo Documento Veicolo</h3>
              </div>
              <button 
                type="button" 
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tipo di Documento</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white font-semibold"
                >
                  <option value="assicurazione">Certificato di Assicurazione (Polizza RCA)</option>
                  <option value="libretto">Libretto di Circolazione / DUC</option>
                  <option value="bollo">Ricevuta Pagamento Bollo Auto</option>
                  <option value="tagliando">Fattura / Ricevuta Tagliando</option>
                  <option value="altro">Altro Documento / Certificato</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Titolo Documento *</label>
                <input
                  type="text"
                  placeholder="Es. Polizza RCA Allianz 2026 / Bollo Regione"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Data di Scadenza (Opzionale per promemoria)</label>
                <input
                  type="date"
                  value={newExpiryDate}
                  onChange={(e) => setNewExpiryDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">File o Scansione PDF / Immagine *</label>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*,application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                
                {uploadedFileData ? (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-2 truncate">
                      <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-bold text-slate-800 text-xs truncate">{uploadedFileName}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={handleAnalyzeWithAI}
                        disabled={isAnalyzingAi}
                        className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-[10px] flex items-center gap-1"
                      >
                        <Sparkles className={`w-3 h-3 ${isAnalyzingAi ? 'animate-spin' : ''}`} />
                        {isAnalyzingAi ? 'Scansione...' : 'OCR AI'}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setUploadedFileData('');
                          setUploadedFileName('');
                          setUploadedFileType('');
                          setAiAnalysisResult(null);
                        }}
                        className="p-1 text-slate-400 hover:text-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border border-dashed border-slate-300 hover:border-slate-500 rounded-2xl p-5 text-center cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors"
                  >
                    <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                    <span className="text-xs font-bold text-slate-700 block">Carica file o scatta foto</span>
                    <span className="text-[10px] text-slate-400">PDF, JPG, PNG fino a 15MB</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Note Aggiuntive</label>
                <textarea
                  rows={2}
                  placeholder="Es. Compagnia assicurativa, numero polizza o dettagli pagamento..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 font-medium"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 text-slate-600 font-bold text-xs hover:bg-slate-100 rounded-xl"
              >
                Annulla
              </button>
              <button
                type="button"
                onClick={handleSaveDocument}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                Salva Documento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ANTEPRIMA DOCUMENTO */}
      {selectedDocForPreview && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-2xl w-full p-4 sm:p-6 shadow-2xl space-y-3 max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="min-w-0 pr-2">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">{selectedDocForPreview.title}</h3>
                <span className="text-xs text-slate-500 truncate block">{selectedDocForPreview.fileName}</span>
              </div>
              <button 
                type="button" 
                onClick={() => setSelectedDocForPreview(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto min-h-[260px] bg-slate-100 rounded-2xl flex items-center justify-center p-3">
              {selectedDocForPreview.fileData && selectedDocForPreview.fileData.startsWith('data:image') ? (
                <img
                  src={selectedDocForPreview.fileData}
                  alt={selectedDocForPreview.title}
                  className="max-h-[55vh] max-w-full object-contain rounded-xl shadow-md"
                />
              ) : selectedDocForPreview.fileData && selectedDocForPreview.fileData.startsWith('data:application/pdf') ? (
                <iframe
                  src={selectedDocForPreview.fileData}
                  title={selectedDocForPreview.title}
                  className="w-full h-[50vh] rounded-xl border border-slate-200"
                />
              ) : (
                <div className="text-center p-6 space-y-2">
                  <FileText className="w-10 h-10 text-slate-400 mx-auto" />
                  <span className="text-xs font-bold text-slate-700 block">{selectedDocForPreview.fileName}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
              <div className="text-slate-500">
                {selectedDocForPreview.expiryDate && (
                  <span className="font-bold text-slate-700">
                    Scadenza: {new Date(selectedDocForPreview.expiryDate).toLocaleDateString('it-IT')}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {selectedDocForPreview.fileData && (
                  <a
                    href={selectedDocForPreview.fileData}
                    download={selectedDocForPreview.fileName}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                  >
                    <Download className="w-3.5 h-3.5" /> Scarica
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedDocForPreview(null)}
                  className="px-4 py-1.5 bg-slate-900 text-white font-bold rounded-xl"
                >
                  Chiudi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
