import React, { useState, useEffect } from 'react';
import { X, ArrowLeft, Wrench, Trash2 } from 'lucide-react';
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

  const [date, setDate] = useState(editingMaintenance?.date || new Date().toISOString().split('T')[0]);
  const [km, setKm] = useState<number | ''>(editingMaintenance?.km ?? '');
  const [category, setCategory] = useState(editingMaintenance?.category || 'Tagliando Ordinario');
  const [cost, setCost] = useState<number | ''>(editingMaintenance?.cost ?? '');
  const [workshop, setWorkshop] = useState(editingMaintenance?.workshop || '');
  const [description, setDescription] = useState(editingMaintenance?.description || '');

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
      description: description.trim()
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-[24px] w-full max-w-lg p-6 sm:p-7 shadow-2xl flex flex-col gap-5 max-h-[90vh] overflow-y-auto font-['Plus_Jakarta_Sans',sans-serif]">
        
        {/* HEADER */}
        <div className="flex items-center justify-between gap-2 border-b border-[#e2e8f0] pb-4">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            {/* Top-Left Indietro Button */}
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 text-xs font-black border border-slate-200 transition-all cursor-pointer shrink-0 shadow-2xs group"
              title="Torna indietro"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              <span>Indietro</span>
            </button>

            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#059669] flex items-center justify-center border border-emerald-100 shrink-0 hidden xs:flex">
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
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
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
                <option value="Tagliando Ordinario">Tagliando Ordinario</option>
                <option value="Freni (Pastiglie/Dischi)">Freni (Pastiglie/Dischi)</option>
                <option value="Pneumatici (Cambio/Inversione)">Pneumatici (Cambio/Inversione)</option>
                <option value="Cinghia Distribuzione">Cinghia Distribuzione</option>
                <option value="Batteria 12V / Trazione">Batteria 12V / Trazione</option>
                <option value="FAP / DPF / Scarico">FAP / DPF / Scarico</option>
                <option value="Revisione Ministeriale">Revisione Ministeriale</option>
                <option value="Sospensioni e Assetto">Sospensioni e Assetto</option>
                <option value="Altro Intervento">Altro Intervento</option>
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
                className="bg-red-50 hover:bg-red-100 text-[#dc2626] text-xs font-bold px-3.5 py-2.5 rounded-xl border border-red-200 transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Elimina</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button 
                type="button" 
                onClick={onClose}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl transition-colors"
              >
                Annulla
              </button>
              <button 
                type="submit" 
                id="btn-submit-maint-form"
                className="bg-[#059669] hover:bg-emerald-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-colors shadow-xs"
              >
                {isEditing ? 'Salva Intervento' : 'Registra Intervento'}
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
