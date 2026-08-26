import React, { useState, useEffect } from 'react';
import { X, ArrowLeft, Fuel, Zap, Trash2, BatteryCharging, Flame } from 'lucide-react';
import { RefuelRecord, Vehicle, EnergySourceType } from '../../types';
import { useSwipeBack } from '../../hooks/useSwipeBack';

interface RefuelModalProps {
  vehicle: Vehicle;
  editingRefuel?: RefuelRecord | null;
  defaultEnergyType?: EnergySourceType;
  isOpen: boolean;
  onClose: () => void;
  onSave: (refuelData: RefuelRecord) => void;
  onDelete?: (refuelId: string) => void;
}

export const RefuelModal: React.FC<RefuelModalProps> = ({
  vehicle,
  editingRefuel,
  defaultEnergyType,
  isOpen,
  onClose,
  onSave,
  onDelete
}) => {
  const isEditing = !!editingRefuel;
  const isPHEV = vehicle.fuelType === 'Plug-in Hybrid (PHEV)';
  const isBEV = vehicle.fuelType === 'Elettrica (BEV)';
  const isGPL = vehicle.fuelType === 'GPL (Benzina + GPL)' || vehicle.fuelType === 'GPL';
  const isMetano = vehicle.fuelType === 'Metano (Benzina + Metano)' || vehicle.fuelType === 'Metano';
  const isDualFuel = isPHEV || isGPL || isMetano;

  // Determine initial energy type
  const getInitialEnergyType = (): EnergySourceType => {
    if (editingRefuel?.energyType) return editingRefuel.energyType;
    if (defaultEnergyType) return defaultEnergyType;
    if (isBEV) return 'electricity';
    if (isPHEV) return 'electricity'; // Default to electric charging or fuel
    if (isGPL) return 'lpg';
    if (isMetano) return 'cng';
    return 'fuel';
  };

  const [energyType, setEnergyType] = useState<EnergySourceType>(getInitialEnergyType());
  const [date, setDate] = useState(editingRefuel?.date || new Date().toISOString().split('T')[0]);
  const [km, setKm] = useState<number | ''>(editingRefuel?.km ?? '');
  const [quantity, setQuantity] = useState<number | ''>(editingRefuel?.quantity ?? '');
  const [price, setPrice] = useState<number | ''>(editingRefuel?.price ?? '');
  const [type, setType] = useState<'full' | 'partial'>(editingRefuel?.type || 'full');
  const [notes, setNotes] = useState(editingRefuel?.notes || '');
  const [chargingPowerKw, setChargingPowerKw] = useState<number | ''>(editingRefuel?.chargingPowerKw ?? '');

  // Support swipe right gesture to go back / close
  useSwipeBack({
    onBack: onClose,
    enabled: isOpen
  });

  useEffect(() => {
    if (isOpen) {
      setEnergyType(getInitialEnergyType());
      setDate(editingRefuel?.date || new Date().toISOString().split('T')[0]);
      setKm(editingRefuel?.km ?? '');
      setQuantity(editingRefuel?.quantity ?? '');
      setPrice(editingRefuel?.price ?? '');
      setType(editingRefuel?.type || 'full');
      setNotes(editingRefuel?.notes || '');
      setChargingPowerKw(editingRefuel?.chargingPowerKw ?? '');
    }
  }, [isOpen, editingRefuel, vehicle, defaultEnergyType]);

  if (!isOpen) return null;

  // Determine unit and labels dynamically
  let fuelUnit: 'L' | 'kWh' | 'Kg' = 'L';
  let energyLabel = 'Carburante (Litri)';
  let placeholderQty = 'Es. 45.00';
  let referenceCapacity = vehicle.tankCapacity;

  if (energyType === 'electricity' || isBEV) {
    fuelUnit = 'kWh';
    energyLabel = 'Energia Elettrica (kWh)';
    placeholderQty = 'Es. 11.50';
    referenceCapacity = vehicle.batteryCapacity || vehicle.tankCapacity || 13;
  } else if (energyType === 'lpg') {
    fuelUnit = 'L';
    energyLabel = 'GPL (Litri)';
    placeholderQty = 'Es. 38.00';
    referenceCapacity = vehicle.secondaryTankCapacity || 40;
  } else if (energyType === 'cng') {
    fuelUnit = 'Kg';
    energyLabel = 'Metano (Kg)';
    placeholderQty = 'Es. 14.00';
    referenceCapacity = vehicle.secondaryTankCapacity || 15;
  } else {
    fuelUnit = 'L';
    energyLabel = 'Benzina / Carburante (Litri)';
    placeholderQty = 'Es. 40.00';
    referenceCapacity = vehicle.tankCapacity || 45;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!km || !quantity || !price) {
      alert('Compila tutti i campi obbligatori (Chilometri, Quantità, Spesa).');
      return;
    }

    onSave({
      id: editingRefuel ? editingRefuel.id : `refuel_${Date.now()}`,
      date,
      km: Number(km),
      quantity: Number(quantity),
      price: Number(price),
      type,
      energyType,
      unit: fuelUnit,
      chargingPowerKw: chargingPowerKw ? Number(chargingPowerKw) : undefined,
      notes: notes.trim()
    });

    onClose();
  };

  const calculatedUnitPrice = (price && quantity && Number(quantity) > 0)
    ? (Number(price) / Number(quantity)).toFixed(3)
    : '--';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-[24px] w-full max-w-lg p-6 sm:p-7 shadow-2xl flex flex-col gap-5 max-h-[92vh] overflow-y-auto font-['Plus_Jakarta_Sans',sans-serif]">
        
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

            <div className={`w-9 h-9 rounded-xl flex items-center justify-center border shrink-0 hidden xs:flex ${
              energyType === 'electricity' 
                ? 'bg-amber-50 text-amber-600 border-amber-200' 
                : 'bg-blue-50 text-[#2563eb] border-blue-100'
            }`}>
              {energyType === 'electricity' ? <Zap className="w-5 h-5" /> : <Fuel className="w-5 h-5" />}
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-extrabold text-[#0f172a] truncate">
                {isEditing ? 'Modifica Registrazione' : (energyType === 'electricity' ? 'Nuova Ricarica' : 'Nuovo Rifornimento')}
              </h3>
              <p className="text-xs text-[#64748b] truncate">
                {vehicle.brand} {vehicle.model} • <span className="font-semibold text-slate-700">{vehicle.fuelType}</span> ({vehicle.plate})
              </p>
            </div>
          </div>
          <button 
            id="btn-close-refuel-modal"
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* DUAL FUEL / PHEV ENERGY SELECTOR */}
        {isDualFuel && (
          <div className="p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200 flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2 pt-1">
              {isPHEV ? 'Seleziona Tipologia di Ricarica / Rifornimento' : 'Seleziona Alimentazione Erogata'}
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {isPHEV && (
                <>
                  <button
                    type="button"
                    onClick={() => setEnergyType('electricity')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                      energyType === 'electricity'
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <BatteryCharging className="w-4 h-4" />
                    <span>⚡ Ricarica Elettrica (kWh)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEnergyType('fuel')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                      energyType === 'fuel'
                        ? 'bg-[#2563eb] text-white shadow-xs'
                        : 'bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Fuel className="w-4 h-4" />
                    <span>⛽ Benzina Termica (L)</span>
                  </button>
                </>
              )}

              {isGPL && (
                <>
                  <button
                    type="button"
                    onClick={() => setEnergyType('lpg')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                      energyType === 'lpg'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Flame className="w-4 h-4" />
                    <span>🔵 Pieno GPL (L)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEnergyType('fuel')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                      energyType === 'fuel'
                        ? 'bg-[#2563eb] text-white shadow-xs'
                        : 'bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Fuel className="w-4 h-4" />
                    <span>⛽ Benzina Avvio (L)</span>
                  </button>
                </>
              )}

              {isMetano && (
                <>
                  <button
                    type="button"
                    onClick={() => setEnergyType('cng')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                      energyType === 'cng'
                        ? 'bg-teal-600 text-white shadow-xs'
                        : 'bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Flame className="w-4 h-4" />
                    <span>🟢 Metano CNG (Kg)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEnergyType('fuel')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                      energyType === 'fuel'
                        ? 'bg-[#2563eb] text-white shadow-xs'
                        : 'bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Fuel className="w-4 h-4" />
                    <span>⛽ Benzina Riserva (L)</span>
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#0f172a] uppercase tracking-wider">
                {energyType === 'electricity' ? 'Data Ricarica' : 'Data Rifornimento'}
              </label>
              <input 
                id="input-refuel-date"
                type="date" 
                required 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="border border-[#e2e8f0] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#2563eb]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#0f172a] uppercase tracking-wider">Chilometraggio Odometro (km)</label>
              <input 
                id="input-refuel-km"
                type="number" 
                required 
                min="1" 
                placeholder="Es. 84500"
                value={km}
                onChange={(e) => setKm(e.target.value === '' ? '' : Number(e.target.value))}
                className="border border-[#e2e8f0] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#2563eb]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#0f172a] uppercase tracking-wider">
                  Quantità ({fuelUnit})
                </label>
                {referenceCapacity > 0 && (
                  <span className="text-[11px] text-slate-400 font-medium">
                    Capacità: {referenceCapacity} {fuelUnit}
                  </span>
                )}
              </div>
              <input 
                id="input-refuel-quantity"
                type="number" 
                step="0.01" 
                required 
                min="0.1" 
                placeholder={placeholderQty}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                className="border border-[#e2e8f0] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#2563eb]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#0f172a] uppercase tracking-wider">Spesa Totale (€)</label>
              <input 
                id="input-refuel-price"
                type="number" 
                step="0.01" 
                required 
                min="0.1" 
                placeholder="Es. 18.50"
                value={price}
                onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                className="border border-[#e2e8f0] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#2563eb]"
              />
            </div>
          </div>

          {/* UNIT PRICE INDICATOR */}
          <div className="bg-[#f8fafc] border border-[#e2e8f0] p-3 rounded-xl flex items-center justify-between text-xs">
            <span className="text-[#64748b] font-medium">Prezzo Unitario Calcolato:</span>
            <span className="font-extrabold text-[#0f172a] flex items-center gap-1">
              <span>{calculatedUnitPrice} € / {fuelUnit}</span>
              {energyType === 'electricity' && (
                <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded ml-1">Tariffa EV</span>
              )}
            </span>
          </div>

          {/* TYPE (FULL VS PARTIAL) */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#0f172a] uppercase tracking-wider">
              {energyType === 'electricity' ? 'Livello di Ricarica' : 'Tipo di Pieno'}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setType('full')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                  type === 'full'
                    ? (energyType === 'electricity' ? 'bg-amber-50 border-amber-400 text-amber-700' : 'bg-blue-50 border-[#2563eb] text-[#2563eb]')
                    : 'bg-white border-[#e2e8f0] text-[#64748b] hover:bg-slate-50'
                }`}
              >
                {energyType === 'electricity' ? '✓ Ricarica Completa 100%' : '✓ Pieno Completo'}
              </button>
              <button
                type="button"
                onClick={() => setType('partial')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                  type === 'partial'
                    ? (energyType === 'electricity' ? 'bg-amber-50 border-amber-400 text-amber-700' : 'bg-blue-50 border-[#2563eb] text-[#2563eb]')
                    : 'bg-white border-[#e2e8f0] text-[#64748b] hover:bg-slate-50'
                }`}
              >
                {energyType === 'electricity' ? 'Biberonaggio / Parziale' : 'Rifornimento Parziale'}
              </button>
            </div>
          </div>

          {/* EV CHARGE POWER PRESET FOR ELECTRIC / PHEV */}
          {energyType === 'electricity' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#0f172a] uppercase tracking-wider">Potenza Colonnina / Caricatore (kW)</label>
              <div className="grid grid-cols-4 gap-2 mb-1">
                {[
                  { label: 'Casa (2.3 kW)', val: 2.3 },
                  { label: 'Wallbox (7.4 kW)', val: 7.4 },
                  { label: 'AC (11 kW)', val: 11 },
                  { label: 'Fast (22+ kW)', val: 22 }
                ].map(p => (
                  <button
                    key={p.val}
                    type="button"
                    onClick={() => setChargingPowerKw(p.val)}
                    className={`text-[10px] py-1.5 px-1 rounded-lg border font-semibold transition-colors ${
                      chargingPowerKw === p.val
                        ? 'bg-amber-100 border-amber-400 text-amber-900 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* NOTES */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#0f172a] uppercase tracking-wider">
              {energyType === 'electricity' ? 'Punto di Ricarica / Note' : 'Distributore / Note'}
            </label>
            <input 
              id="input-refuel-notes"
              type="text" 
              placeholder={energyType === 'electricity' ? 'Es. Wallbox Domestica Notturna, Enel X Way, Be Charge' : 'Es. Q8 Easy Autostrada A1, Eni Station'}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="border border-[#e2e8f0] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#2563eb]"
            />
          </div>

          {/* ACTIONS */}
          <div className="flex items-center justify-between pt-3 border-t border-[#e2e8f0]">
            {isEditing && onDelete ? (
              <button 
                type="button" 
                onClick={() => {
                  if (confirm('Sei sicuro di voler eliminare questa registrazione?')) {
                    onDelete(editingRefuel!.id);
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
                id="btn-submit-refuel-form"
                className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-colors shadow-xs"
              >
                {isEditing ? 'Salva Registrazione' : (energyType === 'electricity' ? 'Registra Ricarica' : 'Registra Rifornimento')}
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
