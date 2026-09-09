import React, { useState, useEffect } from 'react';
import { X, ArrowLeft, Wrench, Trash2, FileText, Camera, Upload, Receipt } from 'lucide-react';
import { MaintenanceRecord, Vehicle } from '../../types';
import { useSwipeBack } from '../../hooks/useSwipeBack';

interface MaintenanceModalProps {
  vehicle: Vehicle;
  editingMaintenance?: MaintenanceRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (maintData: MaintenanceRecord) => void;
  onDelete?: (maintId: string) => void;
}

export const MaintenanceModal: React.FC<MaintenanceModalProps> = ({
  vehicle,
  editingMaintenance,
  isOpen,
  onClose,
  onSave,
  onDelete
}) => {
  const isEditing = !!editingMaintenance;

  const isMoto = vehicle.vehicleType === 'moto';
  const defaultCat = isMoto ? 'Tagliando Moto (Olio + Filtro)' : 'Tagliando Ordinario';

  const [date, setDate] = useState(editingMaintenance?.date || new Date().toISOString().split('T')[0]);
  const [km, setKm] = useState<number | ''>(editingMaintenance?.km ?? '');
  const [category, setCategory] = useState(editingMaintenance?.category || defaultCat);
  const [cost, setCost] = useState<number | ''>(editingMaintenance?.cost ?? '');
  const [workshop, setWorkshop] = useState(editingMaintenance?.workshop || '');
  const [description, setDescription] = useState(editingMaintenance?.description || '');
  const [documentPhoto, setDocumentPhoto] = useState<string | undefined>(editingMaintenance?.documentPhoto);
  const [documentFileName, setDocumentFileName] = useState<string | undefined>(editingMaintenance?.documentFileName);

  // Support swipe right gesture to go back / close
  useSwipeBack({
    onBack: onClose,
    enabled: isOpen
  });

  useEffect(() => {
    if (isOpen) {
      setDate(editingMaintenance?.date || new Date().toISOString().split('T')[0]);
      setKm(editingMaintenance?.km ?? '');
      setCategory(editingMaintenance?.category || 'Tagliando Ordinario');
      setCost(editingMaintenance?.cost ?? '');
      setWorkshop(editingMaintenance?.workshop || '');
      setDescription(editingMaintenance?.description || '');
      setDocumentPhoto(editingMaintenance?.documentPhoto);
      setDocumentFileName(editingMaintenance?.documentFileName);
    }
  }, [isOpen, editingMaintenance]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!km || !cost) {
      alert('Compila tutti i campi obbligatori (Chilometri, Costo).');
      return;
    }

    onSave({
      id: editingMaintenance ? editingMaintenance.id : `maint_${Date.now()}`,
      date,
      km: Number(km),
      category,
      cost: Number(cost),
      workshop: workshop.trim(),
      description: description.trim(),
      documentPhoto: documentPhoto || undefined,
      documentFileName: documentFileName || undefined
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-[24px] w-full max-w-lg p-6 sm:p-7 shadow-2xl flex flex-col gap-5 max-h-[90vh] overflow-y-auto font-['Plus_Jakarta_Sans',sans-serif]">
        
        {/* HEADER */}
        <div className="flex items-center justify-between gap-2 border-b border-[#e2e8f0] pb-4">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#059669] flex items-center justify-center border border-emerald-100 shrink-0">
              <Wrench className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-extrabold text-[#0f172a] truncate">
                {isEditing ? 'Modifica Intervento' : 'Nuova Manutenzione'}
              </h3>
              <p className="text-xs text-[#64748b] truncate">{vehicle.brand} {vehicle.model} ({vehicle.plate})</p>
            </div>
          </div>
          <button 
            id="btn-close-maint-modal"
            type="button"
            onClick={onClose} 
            title="Chiudi"
            className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#0f172a] uppercase tracking-wider">Data Intervento</label>
              <input 
                id="input-maint-date"
                type="date" 
                required 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="border border-[#e2e8f0] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#059669]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#0f172a] uppercase tracking-wider">Chilometraggio (km)</label>
              <input 
                id="input-maint-km"
                type="number" 
                required 
                min="1" 
                placeholder="Es. 80000"
                value={km}
                onChange={(e) => setKm(e.target.value === '' ? '' : Number(e.target.value))}
                className="border border-[#e2e8f0] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#059669]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#0f172a] uppercase tracking-wider">Categoria</label>
              <select 
                id="input-maint-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="border border-[#e2e8f0] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#059669] bg-white"
              >
                {isMoto ? (
                  <>
                    <option value="Tagliando Moto (Olio + Filtro)">Tagliando Moto (Olio JASO MA2 + Filtro)</option>
                    <option value="Trasmissione (Catena, Corona, Pignone)">Trasmissione (Kit Catena / Ingrassaggio / Cardano)</option>
                    <option value="Freni Moto (Pastiglie/Dischi/Liquido)">Freni Moto (Pastiglie / Dischi / Spurgo DOT 4)</option>
                    <option value="Pneumatici Moto (Anteriore/Posteriore)">Pneumatici Moto (Anteriore / Posteriore)</option>
                    <option value="Forcelle e Sospensioni">Forcelle e Sospensioni (Paraoli / Olio / Mono)</option>
                    <option value="Controllo Gioco Valvole">Controllo Gioco Valvole (Desmo / Distribuzione)</option>
                    <option value="Candele d'accensione">Candele d'accensione</option>
                    <option value="Batteria Moto (12V AGM / Litio)">Batteria Moto (12V AGM / Litio)</option>
                    <option value="Cinghia & Variatore (Scooter)">Cinghia & Variatore (Scooter / CVT)</option>
                    <option value="Revisione Ministeriale">Revisione Ministeriale</option>
                    <option value="Altro Intervento">Altro Intervento</option>
                  </>
                ) : (
                  <>
                    <option value="Tagliando Ordinario">Tagliando Ordinario</option>
                    <option value="Freni (Pastiglie/Dischi)">Freni (Pastiglie/Dischi)</option>
                    <option value="Pneumatici (Cambio/Inversione)">Pneumatici (Cambio/Inversione)</option>
                    <option value="Cinghia Distribuzione">Cinghia Distribuzione</option>
                    <option value="Batteria 12V / Trazione">Batteria 12V / Trazione</option>
                    <option value="FAP / DPF / Scarico">FAP / DPF / Scarico</option>
                    <option value="Revisione Ministeriale">Revisione Ministeriale</option>
                    <option value="Sospensioni e Assetto">Sospensioni e Assetto</option>
                    <option value="Altro Intervento">Altro Intervento</option>
                  </>
                )}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#0f172a] uppercase tracking-wider">Costo (€)</label>
              <input 
                id="input-maint-cost"
                type="number" 
                step="0.01" 
                required 
                min="0" 
                placeholder="Es. 380.00"
                value={cost}
                onChange={(e) => setCost(e.target.value === '' ? '' : Number(e.target.value))}
                className="border border-[#e2e8f0] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#059669]"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#0f172a] uppercase tracking-wider">Officina / Meccanico</label>
            <input 
              id="input-maint-workshop"
              type="text" 
              placeholder="Es. Alfa Romeo Motor Village, Bosch Car Service"
              value={workshop}
              onChange={(e) => setWorkshop(e.target.value)}
              className="border border-[#e2e8f0] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#059669]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#0f172a] uppercase tracking-wider">Dettaglio Lavori e Ricambi</label>
            <textarea 
              id="input-maint-desc"
              rows={3} 
              placeholder="Olio motore 0W20, filtro olio, filtro aria, pastiglie Brembo..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border border-[#e2e8f0] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#059669] resize-none"
            />
          </div>

          {/* FATTURA / DOCUMENTO INTERVENTO (OPZIONALE) */}
          <div className="flex flex-col gap-2 pt-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#0f172a] uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-emerald-600" />
                <span>Fattura / Ricevuta Intervento (Opzionale)</span>
              </label>
              {documentPhoto && (
                <button
                  type="button"
                  onClick={() => { setDocumentPhoto(undefined); setDocumentFileName(undefined); }}
                  className="text-[11px] font-bold text-red-600 hover:underline cursor-pointer"
                >
                  Rimuovi allegato
                </button>
              )}
            </div>

            {documentPhoto ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-2.5 flex items-center gap-3">
                <img 
                  src={documentPhoto} 
                  alt="Fattura manutenzione" 
                  className="w-14 h-14 object-cover rounded-xl border border-slate-200 shrink-0 bg-white" 
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-800 truncate">
                    {documentFileName || 'Fattura_intervento.jpg'}
                  </p>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded font-bold inline-block mt-0.5">
                    ✓ Documento allegato
                  </span>
                </div>
              </div>
            ) : (
              <label className="border-2 border-dashed border-slate-200 hover:border-emerald-400 rounded-2xl p-3.5 flex items-center justify-center gap-2 text-xs font-bold text-slate-600 hover:text-emerald-700 bg-slate-50/60 hover:bg-emerald-50/30 transition-all cursor-pointer">
                <Camera className="w-4 h-4 text-emerald-600" />
                <span>Carica o scatta foto della ricevuta / fattura (opzionale)</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        const res = ev.target?.result as string;
                        setDocumentPhoto(res);
                        setDocumentFileName(file.name);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </label>
            )}
          </div>

          {/* ACTIONS */}
          <div className="flex items-center justify-between pt-3 border-t border-[#e2e8f0]">
            {isEditing && onDelete ? (
              <button 
                type="button" 
                onClick={() => {
                  if (confirm('Sei sicuro di voler eliminare questo intervento?')) {
                    onDelete(editingMaintenance!.id);
                    onClose();
                  }
                }}
                className="bg-red-50 hover:bg-red-100 text-[#dc2626] text-xs font-bold px-3.5 py-2.5 rounded-xl border border-red-200 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Elimina</span>
              </button>
            ) : <div />}

            <button 
              type="submit" 
              id="btn-submit-maint-form"
              className="bg-[#059669] hover:bg-emerald-700 text-white text-sm font-bold px-6 py-2.5 rounded-xl transition-all shadow-xs cursor-pointer text-center"
            >
              {isEditing ? 'Salva Modifiche' : 'Registra Intervento'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
