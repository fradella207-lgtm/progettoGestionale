import React, { useState, useRef } from 'react';
import { 
  X, 
  BookOpen, 
  Upload, 
  Search, 
  ExternalLink, 
  CheckCircle2, 
  FileText, 
  Sparkles, 
  Trash2, 
  AlertCircle,
  FileCheck,
  Link,
  Plus,
  RefreshCw,
  Eye
} from 'lucide-react';
import { Vehicle, VehicleManualInfo, VehicleDocument } from '../../types';
import { searchAndRetrieveCarManual } from '../../utils/carManualService';

interface ManualManagerModalProps {
  isOpen: boolean;
  vehicle: Vehicle;
  onClose: () => void;
  onSaveManual: (updatedVehicle: Vehicle) => void;
}

export const ManualManagerModal: React.FC<ManualManagerModalProps> = ({
  isOpen,
  vehicle,
  onClose,
  onSaveManual
}) => {
  const currentManual = vehicle.manualInfo || vehicle.technicalSpecs?.manualInfo;
  
  const [tab, setTab] = useState<'online_search' | 'upload_file' | 'manual_link'>('online_search');
  const [isSearching, setIsSearching] = useState(false);
  const [searchSuccess, setSearchSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Manual Info Form state
  const [title, setTitle] = useState(currentManual?.title || `Manuale di Uso e Manutenzione — ${vehicle.brand} ${vehicle.model}`);
  const [source, setSource] = useState(currentManual?.source || 'Archivio Ufficiale Costruttore');
  const [url, setUrl] = useState(currentManual?.url || '');
  const [notes, setNotes] = useState(currentManual?.fullManualSummary || '');

  // File Upload State
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [uploadedFileType, setUploadedFileType] = useState<string>('');
  const [uploadedFileData, setUploadedFileData] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleOnlineSearch = async () => {
    setIsSearching(true);
    setErrorMessage(null);
    setSearchSuccess(false);

    try {
      const yr = vehicle.registrationDate ? new Date(vehicle.registrationDate).getFullYear() : undefined;
      const res = await searchAndRetrieveCarManual({
        brand: vehicle.brand,
        model: vehicle.model,
        year: yr,
        fuelType: vehicle.fuelType,
        motorization: vehicle.motorization,
        trimLevel: vehicle.trimLevel,
      });

      if (res && res.url) {
        setTitle(res.title || `Manuale di Uso e Manutenzione ${vehicle.brand} ${vehicle.model}`);
        setUrl(res.url);
        setSource(res.source || 'manuals.startmycar.com');
        setNotes(res.fullManualSummary || '');
        setSearchSuccess(true);
      } else {
        throw new Error('Nessun manuale trovato automaticamente. Puoi inserire il link o caricare il tuo file PDF.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Errore durante la ricerca del manuale online.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      setErrorMessage('Il file supera la dimensione massima di 20MB');
      return;
    }

    setUploadedFileName(file.name);
    setUploadedFileType(file.type || 'application/pdf');
    setTitle(`Manuale — ${file.name.replace(/\.[^/.]+$/, '')}`);
    setSource('File caricato dall\'utente');

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setUploadedFileData(base64);
      setUrl(base64); // If user uploaded a file, URL can hold base64 or reference
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!title.trim()) {
      setErrorMessage('Inserisci un titolo per il manuale.');
      return;
    }

    const newManualInfo: VehicleManualInfo = {
      title: title.trim(),
      url: url.trim() || currentManual?.url || 'https://manuals.startmycar.com',
      source: source.trim() || 'Manuale Veicolo',
      pdfAvailable: true,
      pages: currentManual?.pages || 250,
      downloadDate: new Date().toISOString(),
      language: 'Italiano / Originale',
      indexedChapters: currentManual?.indexedChapters || [
        "1. Comandi di Bordo & Quadro Strumenti",
        "2. Controlli Dinamici & Disattivazione ESP/ASR",
        "3. Pressione Pneumatici & Reset TPMS",
        "4. Manutenzione Motore, Specifiche Olio & Livelli",
        "5. Batteria 12V, Avviamento con Cavi & Fusibili",
        "6. Infotainment, Display & Connettività",
        "7. Spie di Bordo & Azzeramento Spia Tagliando"
      ],
      keyProcedures: currentManual?.keyProcedures || {
        espAndControls: `Disattivazione controlli per ${vehicle.brand} ${vehicle.model}`,
        tpmsReset: `Reset pressione gomme da menu di bordo`,
        oilAndFluids: `Olio omologato specifica costruttore`,
        screenReset: `Riavvio forzato display con pressione tasto accensione per 10-15s`,
        batteryAndJumpStart: `Avviamento con cavi sui morsetti dedicati`,
        fusesAndObd: `Scatola fusibili e presa OBD sotto il volante lato guida`,
        serviceReset: `Azzeramento spia tagliando da quadro strumenti`
      },
      fullManualSummary: notes.trim() || `Manuale di bordo ufficiale allegato per ${vehicle.brand} ${vehicle.model}.`
    };

    // Also add to vehicle.documents as type 'altro' / 'manuale' if uploaded
    let updatedDocs = vehicle.documents || [];
    if (uploadedFileData) {
      const manualDoc: VehicleDocument = {
        id: `doc_manual_${Date.now()}`,
        title: title.trim(),
        type: 'altro',
        fileName: uploadedFileName || `${title}.pdf`,
        fileType: uploadedFileType || 'application/pdf',
        fileData: uploadedFileData,
        uploadDate: new Date().toISOString().split('T')[0],
        notes: 'Manuale di Uso e Manutenzione Ufficiale'
      };
      updatedDocs = [manualDoc, ...updatedDocs.filter(d => !d.id.startsWith('doc_manual_'))];
    }

    const updatedVehicle: Vehicle = {
      ...vehicle,
      manualInfo: newManualInfo,
      documents: updatedDocs,
      technicalSpecs: {
        ...(vehicle.technicalSpecs || {}),
        manualInfo: newManualInfo,
        ownersManualUrl: newManualInfo.url,
        ownersManualSource: newManualInfo.source
      }
    };

    onSaveManual(updatedVehicle);
    onClose();
  };

  const handleRemoveManual = () => {
    if (!window.confirm('Vuoi rimuovere il manuale allegato a questo veicolo?')) return;
    const updatedVehicle: Vehicle = {
      ...vehicle,
      manualInfo: undefined,
      technicalSpecs: {
        ...(vehicle.technicalSpecs || {}),
        manualInfo: undefined,
        ownersManualUrl: undefined,
        ownersManualSource: undefined
      }
    };
    onSaveManual(updatedVehicle);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        
        {/* HEADER */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-xs shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-black text-sm sm:text-base text-white truncate">
                Gestione Manuale di Bordo
              </h3>
              <p className="text-[11px] text-slate-300 truncate">
                {vehicle.brand} {vehicle.model} ({vehicle.plate || 'Garage'})
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* TABS SELECTOR */}
        <div className="p-3 sm:px-5 bg-slate-50 border-b border-slate-200/80 flex items-center gap-1.5 shrink-0 overflow-x-auto">
          <button
            type="button"
            onClick={() => setTab('online_search')}
            className={`flex-1 min-w-[120px] py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 ${
              tab === 'online_search'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:text-slate-950 border border-slate-200'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Cerca Online</span>
          </button>

          <button
            type="button"
            onClick={() => setTab('upload_file')}
            className={`flex-1 min-w-[120px] py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 ${
              tab === 'upload_file'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:text-slate-950 border border-slate-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Carica File (PDF)</span>
          </button>

          <button
            type="button"
            onClick={() => setTab('manual_link')}
            className={`flex-1 min-w-[120px] py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 ${
              tab === 'manual_link'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:text-slate-950 border border-slate-200'
            }`}
          >
            <Link className="w-3.5 h-3.5" />
            <span>Link o Note</span>
          </button>
        </div>

        {/* BODY */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
          
          {/* CURRENT MANUAL STATUS BADGE */}
          {currentManual && (
            <div className="p-3 bg-indigo-50/70 border border-indigo-200/80 rounded-2xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                <div className="min-w-0">
                  <span className="font-extrabold text-indigo-950 block truncate">{currentManual.title}</span>
                  <span className="text-[11px] text-indigo-700 block truncate">Fonte: {currentManual.source}</span>
                </div>
              </div>
              {currentManual.url && (
                <a
                  href={currentManual.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-[11px] shrink-0 flex items-center gap-1 cursor-pointer"
                >
                  <Eye className="w-3 h-3" />
                  <span>Apri PDF</span>
                </a>
              )}
            </div>
          )}

          {/* TAB 1: ONLINE SEARCH */}
          {tab === 'online_search' && (
            <div className="space-y-3">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span className="font-black text-slate-900 text-sm">Ricerca Ufficiale Costruttore</span>
                </div>
                <p className="text-slate-600 text-xs leading-relaxed">
                  L'algoritmo cercherà automaticamente il manuale ufficiale di uso e manutenzione PDF per la tua <strong>{vehicle.brand} {vehicle.model}</strong> negli archivi tecnici del costruttore e su portali automotive verificati (manuals.startmycar, Stellantis eLum, BMW Driver's Guide, VW Group).
                </p>

                <button
                  type="button"
                  onClick={handleOnlineSearch}
                  disabled={isSearching}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-extrabold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  <RefreshCw className={`w-4 h-4 ${isSearching ? 'animate-spin' : ''}`} />
                  <span>{isSearching ? 'Ricerca manuale in corso...' : 'Trova e Collega Manuale Ufficiale Online'}</span>
                </button>
              </div>

              {searchSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Manuale trovato con successo! Clicca su &quot;Salva e Collega al Veicolo&quot; in basso per confermare.</span>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: UPLOAD FILE */}
          {tab === 'upload_file' && (
            <div className="space-y-3">
              <input 
                ref={fileInputRef}
                type="file" 
                accept=".pdf,image/*" 
                className="hidden" 
                onChange={handleFileChange}
              />

              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-indigo-500 bg-slate-50 hover:bg-indigo-50/40 p-6 rounded-2xl text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-white shadow-xs border border-slate-200 flex items-center justify-center text-slate-500 group-hover:text-indigo-600 transition-colors">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <span className="font-extrabold text-slate-800 block">
                    {uploadedFileName ? uploadedFileName : 'Tocca per caricare il tuo Manuale (PDF o Foto)'}
                  </span>
                  <span className="text-[11px] text-slate-400 mt-0.5 block">
                    Supporta file PDF, foto di capitoli cartacei o scansioni (max 20MB)
                  </span>
                </div>
              </div>

              {uploadedFileName && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-bold truncate">{uploadedFileName} pronto per essere collegato</span>
                  </div>
                  <button 
                    onClick={() => { setUploadedFileName(''); setUploadedFileData(''); }}
                    className="text-rose-600 hover:underline text-[11px] font-bold shrink-0"
                  >
                    Rimuovi
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: MANUAL LINK & NOTES */}
          {tab === 'manual_link' && (
            <div className="space-y-3">
              <div>
                <label className="font-extrabold text-slate-700 block mb-1">Titolo Manuale</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Es. Manuale d'Uso e Manutenzione BMW Serie 3"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:border-indigo-600 outline-none"
                />
              </div>

              <div>
                <label className="font-extrabold text-slate-700 block mb-1">URL / Link al Manuale Online (PDF o Web)</label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs focus:bg-white focus:border-indigo-600 outline-none"
                />
              </div>

              <div>
                <label className="font-extrabold text-slate-700 block mb-1">Fonte / Portale</label>
                <input
                  type="text"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  placeholder="Es. startmycar.com, portale ufficiale Stellantis"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:border-indigo-600 outline-none"
                />
              </div>

              <div>
                <label className="font-extrabold text-slate-700 block mb-1">Note o Estratti di Procedura (Opzionale)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Es. Reset tagliando tenendo premuto BC per 10s. Olio 5.2 litri 5W-30 LL-04..."
                  rows={3}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:border-indigo-600 outline-none resize-none"
                />
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

        </div>

        {/* FOOTER */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between gap-3 shrink-0">
          {currentManual ? (
            <button
              type="button"
              onClick={handleRemoveManual}
              className="px-3.5 py-2 text-rose-600 hover:bg-rose-50 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Scollega Manuale</span>
            </button>
          ) : <div></div>}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl font-bold text-xs cursor-pointer"
            >
              Annulla
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-xl font-black text-xs shadow-xs hover:shadow transition-all cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Salva e Collega al Veicolo</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
