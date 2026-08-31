import React, { useState, useRef } from 'react';
import { 
  FileText, 
  Upload, 
  Trash2, 
  Eye, 
  Calendar, 
  Shield, 
  CheckCircle, 
  AlertCircle, 
  Sparkles, 
  Plus, 
  Download, 
  X,
  FileCheck,
  Receipt,
  Car
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
  const [isUploading, setIsUploading] = useState(false);
  const [selectedDocForPreview, setSelectedDocForPreview] = useState<VehicleDocument | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAnalyzingAi, setIsAnalyzingAi] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<any | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (max 15MB)
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
        // Pre-fill expiry date or notes if found
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

    // Reset Form
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

  // Helper type badge
  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'libretto':
        return { label: 'Libretto DUC', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: Car };
      case 'assicurazione':
        return { label: 'Polizza RCA', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: Shield };
      case 'bollo':
        return { label: 'Bollo Auto', bg: 'bg-amber-50 text-amber-700 border-amber-200', icon: Receipt };
      case 'tagliando':
        return { label: 'Fattura Tagliando', bg: 'bg-blue-50 text-blue-700 border-blue-200', icon: FileCheck };
      default:
        return { label: 'Documento', bg: 'bg-slate-100 text-slate-700 border-slate-200', icon: FileText };
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <h2 className="text-base sm:text-lg font-black text-slate-900">Libretto & Documenti di Bordo</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Archivia e visualizza in mobilità il Libretto DUC, Certificato di Assicurazione, Bollo e Manutenzioni.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl sm:rounded-2xl shadow-sm hover:shadow transition-all text-xs sm:text-sm active:scale-95 cursor-pointer self-start sm:self-auto shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Aggiungi Documento</span>
        </button>
      </div>

      {/* DOCUMENT LIST */}
      {docs.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-2xl sm:rounded-3xl p-6 sm:p-10 text-center space-y-4">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <FileText className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-sm sm:text-base font-bold text-slate-900">Nessun documento memorizzato per questa auto</h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Carica una foto o PDF della tua polizza assicurativa o del libretto di circolazione per averli sempre a portata di mano anche offline.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold rounded-xl text-xs sm:text-sm transition-colors cursor-pointer"
          >
            <Upload className="w-4 h-4" /> Carica ora il primo documento
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
          {docs.map((doc) => {
            const badge = getTypeBadge(doc.type);
            const Icon = badge.icon;

            const isExpired = doc.expiryDate && new Date(doc.expiryDate) < new Date();
            const isExpiringSoon = doc.expiryDate && !isExpired && (
              new Date(doc.expiryDate).getTime() - new Date().getTime() < 30 * 24 * 60 * 60 * 1000
            );

            return (
              <div
                key={doc.id}
                onClick={() => setSelectedDocForPreview(doc)}
                className="bg-white border border-slate-200/80 hover:border-blue-400 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group min-w-0"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border ${badge.bg}`}>
                      <Icon className="w-3.5 h-3.5" />
                      {badge.label}
                    </span>

                    <button
                      type="button"
                      title="Elimina documento"
                      onClick={(e) => handleDeleteDocument(doc.id, e)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                      {doc.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 mt-0.5 line-clamp-2">
                      {doc.notes || doc.fileName}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs sm:text-sm">
                  {doc.expiryDate ? (
                    <div className="flex items-center gap-1 font-semibold">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span className={isExpired ? 'text-rose-600 font-bold' : (isExpiringSoon ? 'text-amber-600 font-bold' : 'text-slate-600')}>
                        Scadenza: {new Date(doc.expiryDate).toLocaleDateString('it-IT')}
                      </span>
                    </div>
                  ) : (
                    <div className="text-slate-400 text-xs">
                      Caricato il {new Date(doc.uploadDate).toLocaleDateString('it-IT')}
                    </div>
                  )}

                  <span className="text-blue-600 font-bold flex items-center gap-1 text-xs sm:text-sm group-hover:translate-x-0.5 transition-transform">
                    <Eye className="w-4 h-4" /> Apri
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL AGGIUNGI DOCUMENTO */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <FileText className="w-4 h-4" />
                </div>
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
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tipo di Documento</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as any)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 font-semibold"
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
                  placeholder="Es. Polizza RCA Allianz 2026 / Libretto DUC"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Scadenza (Opzionale)</label>
                <input
                  type="date"
                  value={newExpiryDate}
                  onChange={(e) => setNewExpiryDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 font-medium"
                />
              </div>

              {/* File upload box */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Foto o Scansione PDF *</label>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*,application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                
                {uploadedFileData ? (
                  <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-2 truncate">
                      <FileCheck className="w-5 h-5 text-blue-600 shrink-0" />
                      <div className="truncate">
                        <span className="font-bold text-slate-800 text-xs block truncate">{uploadedFileName}</span>
                        <span className="text-[10px] text-slate-500">{uploadedFileType}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleAnalyzeWithAI}
                        disabled={isAnalyzingAi}
                        className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-[11px] flex items-center gap-1 shadow-xs"
                      >
                        <Sparkles className={`w-3 h-3 ${isAnalyzingAi ? 'animate-spin' : ''}`} />
                        {isAnalyzingAi ? 'Scansione...' : 'Scansiona OCR AI'}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setUploadedFileData('');
                          setUploadedFileName('');
                          setUploadedFileType('');
                          setAiAnalysisResult(null);
                        }}
                        className="p-1 text-slate-400 hover:text-rose-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 hover:border-blue-400 rounded-2xl p-6 text-center cursor-pointer bg-slate-50/50 hover:bg-blue-50/20 transition-colors"
                  >
                    <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
                    <span className="text-xs font-bold text-slate-700 block">Carica file o scatta foto</span>
                    <span className="text-[10px] text-slate-400">PDF, JPG, PNG fino a 15MB</span>
                  </div>
                )}
              </div>

              {/* AI Extracted Info Badge */}
              {aiAnalysisResult && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-1.5">
                  <div className="flex items-center gap-1 text-emerald-800 font-bold text-xs">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Dati estratti con AI Vision:
                  </div>
                  <p className="text-[11px] text-emerald-700">
                    {aiAnalysisResult.summary || 'Dati del documento identificati correttamente.'}
                  </p>
                  {aiAnalysisResult.expiryDate && (
                    <div className="text-[11px] font-bold text-emerald-900">
                      Data Scadenza rilevata: {aiAnalysisResult.expiryDate}
                    </div>
                  )}
                  {aiAnalysisResult.vin && (
                    <div className="text-[11px] text-emerald-900 font-mono">
                      Telaio/VIN: {aiAnalysisResult.vin}
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Note Aggiuntive</label>
                <textarea
                  rows={2}
                  placeholder="Es. Numero di polizza, clausole, soccorso stradale incluso..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-blue-500 font-medium"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2.5 text-slate-600 font-bold text-xs hover:bg-slate-100 rounded-xl"
              >
                Annulla
              </button>
              <button
                type="button"
                onClick={handleSaveDocument}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                Salva Documento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ANTEPRIMA DOCUMENTO */}
      {selectedDocForPreview && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">{selectedDocForPreview.title}</h3>
                <span className="text-xs text-slate-500">{selectedDocForPreview.fileName}</span>
              </div>
              <button 
                type="button" 
                onClick={() => setSelectedDocForPreview(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto min-h-[260px] bg-slate-100 rounded-2xl flex items-center justify-center p-4">
              {selectedDocForPreview.fileData && selectedDocForPreview.fileData.startsWith('data:image') ? (
                <img
                  src={selectedDocForPreview.fileData}
                  alt={selectedDocForPreview.title}
                  className="max-h-[60vh] max-w-full object-contain rounded-xl shadow-md"
                />
              ) : selectedDocForPreview.fileData && selectedDocForPreview.fileData.startsWith('data:application/pdf') ? (
                <iframe
                  src={selectedDocForPreview.fileData}
                  title={selectedDocForPreview.title}
                  className="w-full h-[55vh] rounded-xl border border-slate-200"
                />
              ) : (
                <div className="text-center p-6 space-y-2">
                  <FileText className="w-12 h-12 text-slate-400 mx-auto" />
                  <span className="text-xs font-bold text-slate-700 block">{selectedDocForPreview.fileName}</span>
                  <p className="text-[11px] text-slate-500">Documento registrato e protetto nel tuo archivio locale.</p>
                </div>
              )}
            </div>

            {selectedDocForPreview.notes && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700">
                <span className="font-bold text-slate-900 block mb-0.5">Dettagli / Note:</span>
                {selectedDocForPreview.notes}
              </div>
            )}

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
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                  >
                    <Download className="w-3.5 h-3.5" /> Scarica
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedDocForPreview(null)}
                  className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl shadow-xs"
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
