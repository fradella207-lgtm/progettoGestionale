import React, { useState, useEffect } from 'react';
import { X, ArrowLeft, Fuel, Zap, Trash2, BatteryCharging, Flame, Receipt, Camera, Upload, Lock } from 'lucide-react';
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
  const isReadOnly = vehicle.isShared && vehicle.sharedRole === 'member' && vehicle.sharedPermissionsLevel === 'read_only';
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
  const [receiptPhoto, setReceiptPhoto] = useState<string | undefined>(editingRefuel?.receiptPhoto);
  const [receiptFileName, setReceiptFileName] = useState<string | undefined>(editingRefuel?.receiptFileName);

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
      setReceiptPhoto(editingRefuel?.receiptPhoto);
      setReceiptFileName(editingRefuel?.receiptFileName);
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
    if (isReadOnly) {
      alert('Accesso in sola lettura: non disponi dei permessi per salvare modifiche.');
      return;
    }
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
      notes: notes.trim(),
      receiptPhoto: receiptPhoto || undefined,
      receiptFileName: receiptFileName || undefined
    });

    onClose();
  };

  const calculatedUnitPrice = (price && quantity && Number(quantity) > 0)
    ? (Number(price) / Number(quantity)).toFixed(3)
    : '--';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-[24px] w-full max-w-lg p-6 sm:p-7 shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col gap-5 max-h-[92vh] overflow-y-auto font-['Plus_Jakarta_Sans',sans-serif]">
        
        {/* HEADER */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${
              energyType === 'electricity' 
                ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/60' 
                : 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/60'
            }`}>
              {energyType === 'electricity' ? <Zap className="w-5 h-5" /> : <Fuel className="w-5 h-5" />}
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white truncate">
                {isEditing ? 'Modifica Registrazione' : (energyType === 'electricity' ? 'Nuova Ricarica' : 'Nuovo Rifornimento')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {vehicle.brand} {vehicle.model} • <span className="font-semibold text-slate-700 dark:text-slate-300">{vehicle.fuelType}</span> ({vehicle.plate})
              </p>
            </div>
          </div>
          <button 
            id="btn-close-refuel-modal"
            type="button"
            onClick={onClose} 
            title="Chiudi"
            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BANNER PERMESSI SOLA LETTURA */}
        {isReadOnly && (
          <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-300 px-4 py-3 rounded-2xl flex items-center gap-2.5 text-xs font-medium">
            <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>
              <strong>Accesso in sola lettura:</strong> Il veicolo è condiviso con permessi di sola consultazione. Non è consentito inserire modifiche o eliminare registrazioni.
            </span>
          </div>
        )}

        {/* DUAL FUEL / PHEV ENERGY SELECTOR */}
        {isDualFuel && (
          <div className="p-1.5 bg-slate-100/80 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-2 pt-1">
              {isPHEV ? 'Seleziona Tipologia di Ricarica / Rifornimento' : 'Seleziona Alimentazione Erogata'}
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {isPHEV && (
                <>
                  <button
                    type="button"
                    onClick={() => setEnergyType('electricity')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      energyType === 'electricity'
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <BatteryCharging className="w-4 h-4" />
                    <span>⚡ Ricarica Elettrica (kWh)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEnergyType('fuel')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      energyType === 'fuel'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
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
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      energyType === 'lpg'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <Flame className="w-4 h-4" />
                    <span>🔵 Pieno GPL (L)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEnergyType('fuel')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      energyType === 'fuel'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
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
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      energyType === 'cng'
                        ? 'bg-teal-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <Flame className="w-4 h-4" />
                    <span>🟢 Metano CNG (Kg)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEnergyType('fuel')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      energyType === 'fuel'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
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
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                {energyType === 'electricity' ? 'Data Ricarica' : 'Data Rifornimento'}
              </label>
              <input 
                id="input-refuel-date"
                type="date" 
                required 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Chilometraggio Odometro (km)</label>
              <input 
                id="input-refuel-km"
                type="number" 
                required 
                min="1" 
                placeholder="Es. 84500"
                value={km}
                onChange={(e) => setKm(e.target.value === '' ? '' : Number(e.target.value))}
                className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Quantità ({fuelUnit})
                </label>
                {referenceCapacity > 0 && (
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
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
                className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Spesa Totale (€)</label>
              <input 
                id="input-refuel-price"
                type="number" 
                step="0.01" 
                required 
                min="0.1" 
                placeholder="Es. 18.50"
                value={price}
                onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* UNIT PRICE INDICATOR */}
          <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 p-3 rounded-xl flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Prezzo Unitario Calcolato:</span>
            <span className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1">
              <span>{calculatedUnitPrice} € / {fuelUnit}</span>
              {energyType === 'electricity' && (
                <span className="text-[10px] bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-bold px-1.5 py-0.5 rounded ml-1">Tariffa EV</span>
              )}
            </span>
          </div>

          {/* TYPE (FULL VS PARTIAL) */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              {energyType === 'electricity' ? 'Livello di Ricarica' : 'Tipo di Pieno'}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setType('full')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  type === 'full'
                    ? (energyType === 'electricity' ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-400 dark:border-amber-600 text-amber-800 dark:text-amber-300 shadow-2xs' : 'bg-blue-50 dark:bg-blue-950/50 border-blue-600 dark:border-blue-500 text-blue-700 dark:text-blue-300 shadow-2xs')
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-750'
                }`}
              >
                {energyType === 'electricity' ? '✓ Ricarica Completa 100%' : '✓ Pieno Completo'}
              </button>
              <button
                type="button"
                onClick={() => setType('partial')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  type === 'partial'
                    ? (energyType === 'electricity' ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-400 dark:border-amber-600 text-amber-800 dark:text-amber-300 shadow-2xs' : 'bg-blue-50 dark:bg-blue-950/50 border-blue-600 dark:border-blue-500 text-blue-700 dark:text-blue-300 shadow-2xs')
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-750'
                }`}
              >
                {energyType === 'electricity' ? 'Biberonaggio / Parziale' : 'Rifornimento Parziale'}
              </button>
            </div>
          </div>

          {/* EV CHARGE POWER PRESET FOR ELECTRIC / PHEV */}
          {energyType === 'electricity' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Potenza Colonnina / Caricatore (kW)</label>
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
                    className={`text-[10px] py-1.5 px-1 rounded-lg border font-semibold transition-colors cursor-pointer ${
                      chargingPowerKw === p.val
                        ? 'bg-amber-100 dark:bg-amber-950/60 border-amber-400 dark:border-amber-700 text-amber-900 dark:text-amber-300 font-bold'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
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
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              {energyType === 'electricity' ? 'Punto di Ricarica / Note' : 'Distributore / Note'}
            </label>
            <input 
              id="input-refuel-notes"
              type="text" 
              placeholder={energyType === 'electricity' ? 'Es. Wallbox Domestica Notturna, Enel X Way, Be Charge' : 'Es. Q8 Easy Autostrada A1, Eni Station'}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* RICEVUTA / SCONTRINO (OPZIONALE) */}
          <div className="flex flex-col gap-2 pt-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Scontrino / Ricevuta (Opzionale)</span>
              </label>
              {receiptPhoto && (
                <button
                  type="button"
                  onClick={() => { setReceiptPhoto(undefined); setReceiptFileName(undefined); }}
                  className="text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
                >
                  Rimuovi foto
                </button>
              )}
            </div>

            {receiptPhoto ? (
              <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 p-2.5 flex items-center gap-3">
                <img 
                  src={receiptPhoto} 
                  alt="Scontrino rifornimento" 
                  className="w-14 h-14 object-cover rounded-xl border border-slate-200 dark:border-slate-700 shrink-0 bg-white" 
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                    {receiptFileName || 'Scontrino_allegato.jpg'}
                  </p>
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-1.5 py-0.5 rounded font-bold inline-block mt-0.5">
                    ✓ Foto allegata
                  </span>
                </div>
              </div>
            ) : (
              <label className="border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 rounded-2xl p-3.5 flex items-center justify-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/30 transition-all cursor-pointer">
                <Camera className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                <span>Carica o scatta foto dello scontrino (opzionale)</span>
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
                        setReceiptPhoto(res);
                        setReceiptFileName(file.name);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </label>
            )}
          </div>

          {/* ACTIONS */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
            {isEditing && onDelete && !isReadOnly ? (
              <button 
                type="button" 
                onClick={() => {
                  if (confirm('Sei sicuro di voler eliminare questa registrazione?')) {
                    onDelete(editingRefuel!.id);
                    onClose();
                  }
                }}
                className="bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 text-xs font-bold px-3.5 py-2.5 rounded-xl border border-rose-200 dark:border-rose-900/60 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Elimina</span>
              </button>
            ) : <div />}

            <button 
              type="submit" 
              id="btn-submit-refuel-form"
              disabled={isReadOnly}
              className={`text-sm font-bold px-6 py-2.5 rounded-xl transition-all shadow-xs text-center ${
                isReadOnly 
                  ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-300 dark:border-slate-700 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer active:scale-98'
              }`}
            >
              {isReadOnly ? 'Sola Lettura (Bloccato)' : isEditing ? 'Salva Modifiche' : (energyType === 'electricity' ? 'Registra Ricarica' : 'Registra Rifornimento')}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
