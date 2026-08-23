import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  X, 
  Car, 
  Fuel, 
  Zap, 
  Sparkles, 
  Upload, 
  Search, 
  Check, 
  Calendar,
  Gauge,
  Sliders,
  ChevronDown,
  Loader2,
  RefreshCw,
  Info,
  CalendarCheck,
  ZapOff,
  Flame,
  ShieldCheck,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Vehicle, FuelType } from '../../types';
import { getAutomaticVehiclePhoto, optimizeImageFile, OptimizationResult } from '../../utils/imageOptimizer';
import { 
  POPULAR_BRANDS,
  ALL_BRAND_NAMES,
  getModelsForBrand, 
  getMotorizationsForModelAndYear,
  extractRegistrationYear,
  estimateYearFromItalianPlate,
  lookupVehicleWithAI,
  CarMotorization 
} from '../../data/carDatabase';

interface AddVehicleModalProps {
  vehicleToEdit?: Vehicle | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (vehicleData: Partial<Vehicle>) => void;
}

const PRESET_PHOTOS = [
  { label: 'Berlina', url: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=1000&auto=format&fit=crop&q=80' },
  { label: 'SUV', url: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=1000&auto=format&fit=crop&q=80' },
  { label: 'Compatta', url: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=1000&auto=format&fit=crop&q=80' },
  { label: 'Elettrica / EV', url: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=1000&auto=format&fit=crop&q=80' },
  { label: 'Coupé / Sport', url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1000&auto=format&fit=crop&q=80' }
];

export const AddVehicleModal: React.FC<AddVehicleModalProps> = ({
  vehicleToEdit,
  isOpen,
  onClose,
  onSave
}) => {
  const isEditing = !!vehicleToEdit;
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const brandContainerRef = useRef<HTMLDivElement | null>(null);
  const modelContainerRef = useRef<HTMLDivElement | null>(null);

  // Manual Core Fields
  const [brand, setBrand] = useState(vehicleToEdit?.brand || '');
  const [model, setModel] = useState(vehicleToEdit?.model || '');
  const [plate, setPlate] = useState(vehicleToEdit?.plate || '');
  const [regDate, setRegDate] = useState(vehicleToEdit?.registrationDate || new Date().toISOString().split('T')[0]);

  // Technical & Specification Fields (Autofilled via AI & editable)
  const [fuelType, setFuelType] = useState<FuelType>(vehicleToEdit?.fuelType || 'Diesel');
  const [motorization, setMotorization] = useState(vehicleToEdit?.motorization || '');
  const [tankCapacity, setTankCapacity] = useState<number | ''>(vehicleToEdit?.tankCapacity ?? 50);
  const [batteryCapacity, setBatteryCapacity] = useState<number | ''>(vehicleToEdit?.batteryCapacity ?? '');
  const [secondaryTankCapacity, setSecondaryTankCapacity] = useState<number | ''>(vehicleToEdit?.secondaryTankCapacity ?? '');
  const [powerCv, setPowerCv] = useState<number | ''>(vehicleToEdit?.powerCv ?? '');
  const [powerKw, setPowerKw] = useState<number | ''>(vehicleToEdit?.powerKw ?? '');
  const [initialKm, setInitialKm] = useState<number | ''>(vehicleToEdit?.initialKm ?? 0);
  const [photoUrl, setPhotoUrl] = useState(
    vehicleToEdit?.photoUrl || getAutomaticVehiclePhoto(vehicleToEdit?.brand || '', vehicleToEdit?.model || '', vehicleToEdit?.fuelType)
  );

  // Filter & Toggle for other years
  const [showAllYears, setShowAllYears] = useState(false);

  // AI & Feedback States
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiLoadingPhase, setAiLoadingPhase] = useState<string>('');
  const [aiStatusMessage, setAiStatusMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [aiMotorizations, setAiMotorizations] = useState<CarMotorization[]>([]);
  const [aiGenerationInfo, setAiGenerationInfo] = useState<string>('');
  const [selectedFuelFilter, setSelectedFuelFilter] = useState<string>('all');

  // Autocomplete UI dropdowns
  const [showBrandDropdown, setShowBrandDropdown] = useState(false);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);

  // Sync state when vehicleToEdit or isOpen changes
  useEffect(() => {
    if (isOpen) {
      setBrand(vehicleToEdit?.brand || '');
      setModel(vehicleToEdit?.model || '');
      setPlate(vehicleToEdit?.plate || '');
      setRegDate(vehicleToEdit?.registrationDate || new Date().toISOString().split('T')[0]);
      setFuelType(vehicleToEdit?.fuelType || 'Diesel');
      setMotorization(vehicleToEdit?.motorization || '');
      setTankCapacity(vehicleToEdit?.tankCapacity ?? 50);
      setBatteryCapacity(vehicleToEdit?.batteryCapacity ?? '');
      setSecondaryTankCapacity(vehicleToEdit?.secondaryTankCapacity ?? '');
      setPowerCv(vehicleToEdit?.powerCv ?? '');
      setPowerKw(vehicleToEdit?.powerKw ?? '');
      setInitialKm(vehicleToEdit?.initialKm ?? 0);
      setPhotoUrl(
        vehicleToEdit?.photoUrl || getAutomaticVehiclePhoto(vehicleToEdit?.brand || '', vehicleToEdit?.model || '', vehicleToEdit?.fuelType)
      );
      setAiStatusMessage(null);
      setAiMotorizations([]);
      setAiGenerationInfo('');
      setSelectedFuelFilter('all');
      setShowAllYears(false);
    }
  }, [isOpen, vehicleToEdit]);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (brandContainerRef.current && !brandContainerRef.current.contains(e.target as Node)) {
        setShowBrandDropdown(false);
      }
      if (modelContainerRef.current && !modelContainerRef.current.contains(e.target as Node)) {
        setShowModelDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtered brands
  const brandList = useMemo(() => {
    if (!brand.trim()) return ALL_BRAND_NAMES;
    return ALL_BRAND_NAMES.filter(b => b.toLowerCase().includes(brand.trim().toLowerCase()));
  }, [brand]);

  // Models for selected brand
  const modelList = useMemo(() => {
    if (!brand.trim()) return [];
    const models = getModelsForBrand(brand);
    if (!model.trim()) return models;
    return models.filter(m => m.name.toLowerCase().includes(model.trim().toLowerCase()));
  }, [brand, model]);

  // Extract Year information accurately from Registration Date, Plate, or Query
  const yearInfo = useMemo(() => {
    return extractRegistrationYear(regDate, plate, `${brand} ${model} ${motorization}`);
  }, [regDate, plate, brand, model, motorization]);

  // Plate year estimation check
  const plateEstimation = useMemo(() => {
    return estimateYearFromItalianPlate(plate);
  }, [plate]);

  // Available motorizations from catalog, separated by target year and other generations
  const motorizationGroups = useMemo(() => {
    if (!brand.trim() || !model.trim()) return { matchedForYear: [], otherYears: [], all: [] };
    return getMotorizationsForModelAndYear(brand, model, yearInfo.year || undefined);
  }, [brand, model, yearInfo.year]);

  if (!isOpen) return null;

  // Update photo automatically when brand/model changes if not customized
  const handleBrandChange = (newBrand: string) => {
    setBrand(newBrand);
    if (newBrand.trim() && model.trim()) {
      const autoPhoto = getAutomaticVehiclePhoto(newBrand, model, fuelType, undefined, yearInfo.year || plateEstimation?.year);
      setPhotoUrl(autoPhoto);
    }
  };

  const handleModelChange = (newModel: string) => {
    setModel(newModel);
    if (brand.trim() && newModel.trim()) {
      const autoPhoto = getAutomaticVehiclePhoto(brand, newModel, fuelType, undefined, yearInfo.year || plateEstimation?.year);
      setPhotoUrl(autoPhoto);
    }
  };

  const handlePlateChange = (newPlate: string) => {
    const upper = newPlate.toUpperCase();
    setPlate(upper);
    const est = estimateYearFromItalianPlate(upper);
    if (est) {
      const currentYrStr = new Date().getFullYear().toString();
      if (!regDate || regDate.startsWith(currentYrStr)) {
        setRegDate(est.estimatedDateString);
      }
      if (brand.trim() && model.trim()) {
        const autoPhoto = getAutomaticVehiclePhoto(brand, model, fuelType, undefined, est.year);
        setPhotoUrl(autoPhoto);
      }
    }
  };

  // Bidirectional CV <-> kW conversions
  const handleCvChange = (val: string) => {
    if (val === '') {
      setPowerCv('');
      setPowerKw('');
      return;
    }
    const cvNum = Number(val);
    setPowerCv(cvNum);
    if (!isNaN(cvNum) && cvNum > 0) {
      setPowerKw(Math.round(cvNum / 1.35962));
    }
  };

  const handleKwChange = (val: string) => {
    if (val === '') {
      setPowerKw('');
      setPowerCv('');
      return;
    }
    const kwNum = Number(val);
    setPowerKw(kwNum);
    if (!isNaN(kwNum) && kwNum > 0) {
      setPowerCv(Math.round(kwNum * 1.35962));
    }
  };

  // Select a motorization from catalog
  const applyMotorization = (m: CarMotorization) => {
    setMotorization(m.name);
    setFuelType(m.fuelType);
    setTankCapacity(m.tankCapacity);
    setBatteryCapacity(m.batteryCapacity ?? '');
    setSecondaryTankCapacity(m.secondaryTankCapacity ?? '');
    setPowerCv(m.cv);
    setPowerKw(m.kw);

    const targetYear = m.years || yearInfo.year || plateEstimation?.year;
    const photo = getAutomaticVehiclePhoto(brand, model, m.fuelType, undefined, targetYear);
    setPhotoUrl(photo);

    setAiStatusMessage({
      text: `Scheda applicata: ${m.name}${m.wltpElectricRangeKm ? ` • ${m.wltpElectricRangeKm} km WLTP` : ''}`,
      type: 'success'
    });
    setTimeout(() => setAiStatusMessage(null), 3500);
  };

  // Trigger "Cerca con AI" using Brand, Model, Plate, Registration Year
  const handleAiSearch = async () => {
    const targetYear = yearInfo.year || plateEstimation?.year;
    const regYear = targetYear ? String(targetYear) : (regDate ? regDate.split('-')[0] : undefined);
    const query = `${brand} ${model} ${motorization} ${regYear ? 'anno ' + regYear : ''} ${plate || ''}`.trim();

    if (!brand.trim() && !model.trim()) {
      setAiStatusMessage({
        text: 'Inserisci almeno la Marca o il Modello per avviare la ricerca con AI.',
        type: 'info'
      });
      setTimeout(() => setAiStatusMessage(null), 4000);
      return;
    }

    try {
      setIsAiLoading(true);
      setAiLoadingPhase('Analisi anno, targa e modello...');
      setAiStatusMessage(null);

      const phaseTimer = setTimeout(() => {
        setAiLoadingPhase('Estrazione esatta della generazione e delle motorizzazioni...');
      }, 1200);

      const res = await lookupVehicleWithAI(query, brand, model, regYear, plate);
      clearTimeout(phaseTimer);

      if (res.brand) setBrand(res.brand);
      if (res.model) setModel(res.model);
      if (res.motorization) setMotorization(res.motorization);
      if (res.fuelType) setFuelType(res.fuelType);
      if (res.generation) setAiGenerationInfo(res.generation);
      
      setTankCapacity(res.tankCapacity ?? 50);
      setBatteryCapacity(res.batteryCapacity ?? '');
      setSecondaryTankCapacity(res.secondaryTankCapacity ?? '');
      
      if (res.powerCv) {
        setPowerCv(res.powerCv);
        setPowerKw(res.powerKw || Math.round(res.powerCv / 1.35962));
      }

      if (res.availableMotorizations && res.availableMotorizations.length > 0) {
        setAiMotorizations(res.availableMotorizations);
      }

      // Find precise photo for this model & year
      const photo = getAutomaticVehiclePhoto(
        res.brand || brand, 
        res.model || model, 
        res.fuelType, 
        res.category, 
        regYear || targetYear
      );
      setPhotoUrl(photo);

      const motsFound = res.availableMotorizations?.length || 0;
      setAiStatusMessage({
        text: res.source === 'ai' 
          ? `✨ Trovata scheda AI: ${res.motorization || res.model}${res.generation ? ` (${res.generation})` : (regYear ? ` (Anno ${regYear})` : '')}${motsFound > 1 ? ` • ${motsFound} motorizzazioni identificate` : ''}` 
          : `✓ Scheda caricata dal catalogo ufficiale (${res.motorization || res.model})`,
        type: 'success'
      });
      setTimeout(() => setAiStatusMessage(null), 6000);

    } catch (err) {
      console.error('Errore ricerca AI:', err);
      setAiStatusMessage({
        text: 'Non è stato possibile completare la ricerca automatica. Puoi compilare i dati manualmente.',
        type: 'error'
      });
      setTimeout(() => setAiStatusMessage(null), 4000);
    } finally {
      setIsAiLoading(false);
      setAiLoadingPhase('');
    }
  };

  // Image Upload with compression
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Seleziona un file immagine valido (JPEG, PNG, WebP).');
      return;
    }

    try {
      setIsOptimizing(true);
      const res: OptimizationResult = await optimizeImageFile(file, 1000, 650, 0.78);
      setPhotoUrl(res.dataUrl);
      setAiStatusMessage({
        text: 'Foto personalizzata caricata ed ottimizzata!',
        type: 'success'
      });
      setTimeout(() => setAiStatusMessage(null), 3000);
    } catch (err) {
      console.error('Errore ottimizzazione immagine:', err);
      alert('Impossibile caricare l\'immagine.');
    } finally {
      setIsOptimizing(false);
    }
  };

  // Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brand.trim() || !model.trim() || !plate.trim()) {
      alert('Compila i campi obbligatori: Marca, Modello e Targa.');
      return;
    }

    const cleanPlate = plate.toUpperCase().replace(/[^A-Z0-9]/g, '');
    const isPHEV = fuelType === 'Plug-in Hybrid (PHEV)';
    const isBEV = fuelType === 'Elettrica (BEV)';

    onSave({
      brand: brand.trim(),
      model: model.trim(),
      plate: cleanPlate,
      fuelType,
      motorization: motorization.trim() || undefined,
      tankCapacity: isBEV ? (Number(batteryCapacity) || 60) : (Number(tankCapacity) || 50),
      batteryCapacity: (isPHEV || isBEV) ? (Number(batteryCapacity) || undefined) : undefined,
      secondaryTankCapacity: Number(secondaryTankCapacity) || undefined,
      powerCv: Number(powerCv) || undefined,
      powerKw: Number(powerKw) || undefined,
      initialKm: Number(initialKm) || 0,
      registrationDate: regDate,
      photoUrl
    });

    onClose();
  };

  const isPHEV = fuelType === 'Plug-in Hybrid (PHEV)';
  const isBEV = fuelType === 'Elettrica (BEV)';
  const isLPG = fuelType === 'GPL (Benzina + GPL)' || fuelType === 'GPL';
  const isCNG = fuelType === 'Metano (Benzina + Metano)' || fuelType === 'Metano';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden font-['Plus_Jakarta_Sans',sans-serif] border border-[#e2e8f0]">
        
        {/* HEADER */}
        <div className="px-5 py-4 border-b border-[#e2e8f0] flex items-center justify-between bg-[#fafbfc]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#2563eb] border border-blue-100 flex items-center justify-center shadow-2xs">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-[#0f172a] leading-tight">
                {isEditing ? 'Modifica Veicolo' : 'Aggiungi Nuovo Veicolo'}
              </h3>
              <p className="text-xs text-[#64748b] mt-0.5">
                {isEditing ? 'Aggiorna i dati della scheda tecnica' : 'Inserisci i dati manualmente o usa la ricerca AI ad alta precisione'}
              </p>
            </div>
          </div>
          <button 
            id="btn-close-add-car-modal"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto flex flex-col gap-5">

          {/* 1. SEZIONE DATI PRINCIPALI: MARCA, MODELLO, TARGA, IMMATRICOLAZIONE (INSERIMENTO MANUALE) */}
          <div className="bg-white border border-[#e2e8f0] p-4 rounded-2xl flex flex-col gap-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase text-[#0f172a] tracking-wider flex items-center gap-1.5">
                <Car className="w-3.5 h-3.5 text-[#2563eb]" />
                Dati Principali del Veicolo
              </span>
              <span className="text-[10px] text-slate-400 font-medium">* Campi obbligatori</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* MARCA */}
              <div ref={brandContainerRef} className="relative flex flex-col gap-1">
                <label className="text-xs font-bold text-[#0f172a]">
                  Marca *
                </label>
                <div className="relative">
                  <input 
                    type="text"
                    required
                    placeholder="Es. Volkswagen, Cupra, Audi, Fiat, BMW..."
                    value={brand}
                    onFocus={() => setShowBrandDropdown(true)}
                    onChange={(e) => {
                      handleBrandChange(e.target.value);
                      setShowBrandDropdown(true);
                    }}
                    className="w-full bg-[#f8fafc] border border-[#cbd5e1] focus:bg-white text-xs font-bold px-3 py-2.5 rounded-xl focus:border-[#2563eb] focus:ring-2 focus:ring-blue-100 outline-hidden transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowBrandDropdown(!showBrandDropdown)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 p-1 cursor-pointer"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>

                {/* Brand Autocomplete List */}
                {showBrandDropdown && (
                  <div className="absolute left-0 right-0 top-[66px] z-30 bg-white border border-[#cbd5e1] rounded-xl shadow-xl max-h-48 overflow-y-auto p-1 divide-y divide-slate-100">
                    {brandList.map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => {
                          handleBrandChange(b);
                          setShowBrandDropdown(false);
                          setShowModelDropdown(true);
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-semibold hover:bg-blue-50 text-[#0f172a] rounded-lg transition-colors flex items-center justify-between cursor-pointer"
                      >
                        <span>{b}</span>
                        {brand.toLowerCase() === b.toLowerCase() && <Check className="w-3.5 h-3.5 text-blue-600" />}
                      </button>
                    ))}
                  </div>
                )}

                {/* Popular Brands Quick Chips */}
                <div className="flex flex-wrap gap-1 mt-1">
                  {POPULAR_BRANDS.slice(0, 7).map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => {
                        handleBrandChange(b);
                        setShowBrandDropdown(false);
                      }}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                        brand.toLowerCase() === b.toLowerCase()
                          ? 'bg-blue-100 text-blue-800 border-blue-300'
                          : 'bg-[#f1f5f9] text-[#64748b] border-transparent hover:bg-slate-200'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              {/* MODELLO */}
              <div ref={modelContainerRef} className="relative flex flex-col gap-1">
                <label className="text-xs font-bold text-[#0f172a]">
                  Modello *
                </label>
                <div className="relative">
                  <input 
                    type="text"
                    required
                    placeholder="Es. Formentor, Golf, Tonale, Panda, Serie 3..."
                    value={model}
                    onFocus={() => setShowModelDropdown(true)}
                    onChange={(e) => {
                      handleModelChange(e.target.value);
                      setShowModelDropdown(true);
                    }}
                    className="w-full bg-[#f8fafc] border border-[#cbd5e1] focus:bg-white text-xs font-bold px-3 py-2.5 rounded-xl focus:border-[#2563eb] focus:ring-2 focus:ring-blue-100 outline-hidden transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowModelDropdown(!showModelDropdown)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 p-1 cursor-pointer"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>

                {/* Model Autocomplete List */}
                {showModelDropdown && modelList.length > 0 && (
                  <div className="absolute left-0 right-0 top-[66px] z-30 bg-white border border-[#cbd5e1] rounded-xl shadow-xl max-h-48 overflow-y-auto p-1 divide-y divide-slate-100">
                    {modelList.map((m) => (
                      <button
                        key={m.name}
                        type="button"
                        onClick={() => {
                          handleModelChange(m.name);
                          setShowModelDropdown(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-semibold hover:bg-blue-50 text-[#0f172a] rounded-lg transition-colors flex items-center justify-between cursor-pointer"
                      >
                        <span>{m.name}</span>
                        <span className="text-[10px] text-slate-400">{m.category}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Quick Model Chips for selected brand */}
                {modelList.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {modelList.slice(0, 4).map((m) => (
                      <button
                        key={m.name}
                        type="button"
                        onClick={() => {
                          handleModelChange(m.name);
                          setShowModelDropdown(false);
                        }}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                          model.toLowerCase() === m.name.toLowerCase()
                            ? 'bg-blue-100 text-blue-800 border-blue-300'
                            : 'bg-[#f1f5f9] text-[#64748b] border-transparent hover:bg-slate-200'
                        }`}
                      >
                        {m.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* TARGA */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#0f172a]">
                    Targa *
                  </label>
                  {plateEstimation && (
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                      Targa ~{plateEstimation.year}
                    </span>
                  )}
                </div>
                <div className="relative flex items-center">
                  <div className="absolute left-2.5 flex items-center justify-center bg-blue-700 text-white font-bold text-[9px] px-1.5 py-0.5 rounded pointer-events-none">
                    IT
                  </div>
                  <input 
                    type="text"
                    required
                    placeholder="AB 123 CD"
                    value={plate}
                    onChange={(e) => handlePlateChange(e.target.value)}
                    className="w-full bg-[#f8fafc] border border-[#cbd5e1] focus:bg-white text-xs font-mono font-black uppercase pl-11 pr-3 py-2.5 rounded-xl focus:border-[#2563eb] focus:ring-2 focus:ring-blue-100 outline-hidden tracking-widest"
                  />
                </div>
              </div>

              {/* IMMATRICOLAZIONE */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#0f172a] flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#2563eb]" />
                    Data Immatricolazione
                  </label>
                  {yearInfo.year && (
                    <span className="text-[10px] font-extrabold text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-200">
                      Anno {yearInfo.year}
                    </span>
                  )}
                </div>
                <input 
                  type="date"
                  value={regDate}
                  onChange={(e) => setRegDate(e.target.value)}
                  className="w-full bg-[#f8fafc] border border-[#cbd5e1] focus:bg-white text-xs font-bold px-3 py-2.5 rounded-xl focus:border-[#2563eb] focus:ring-2 focus:ring-blue-100 outline-hidden"
                />
              </div>

            </div>

            {/* YEAR BADGE AND SYNC ASSIST */}
            {yearInfo.label && (
              <div className="bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl flex items-center justify-between text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <CalendarCheck className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="font-semibold">{yearInfo.label}</span>
                </div>
                {yearInfo.source === 'plate' && plateEstimation && (!regDate || regDate.startsWith('2026') || regDate.startsWith(new Date().getFullYear().toString())) && (
                  <button
                    type="button"
                    onClick={() => setRegDate(plateEstimation.estimatedDateString)}
                    className="text-[10px] font-bold text-blue-700 hover:text-blue-900 bg-white border border-blue-200 px-2 py-0.5 rounded-md hover:bg-blue-50 transition-colors cursor-pointer"
                  >
                    Imposta data {plateEstimation.year}
                  </button>
                )}
              </div>
            )}

            {/* PULSANTE CERCA CON AI */}
            <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="text-xs text-slate-500 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-blue-500 shrink-0" />
                <span>
                  {aiLoadingPhase || "L'algoritmo AI estrapola l'anno esatto per allestimenti precisi, generazioni e foto HD."}
                </span>
              </div>

              <button
                type="button"
                id="btn-search-with-ai"
                onClick={handleAiSearch}
                disabled={isAiLoading || (!brand.trim() && !model.trim())}
                className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
              >
                {isAiLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{aiLoadingPhase || 'Analisi scheda e anno...'}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Cerca Scheda con AI</span>
                  </>
                )}
              </button>
            </div>

            {/* AI Status Feedback */}
            {aiStatusMessage && (
              <div className={`text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-2 animate-in fade-in ${
                aiStatusMessage.type === 'success' 
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                  : aiStatusMessage.type === 'error'
                  ? 'bg-rose-50 text-rose-800 border border-rose-200'
                  : 'bg-blue-50 text-blue-800 border border-blue-200'
              }`}>
                {aiStatusMessage.type === 'success' && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                {aiStatusMessage.type === 'error' && <Info className="w-4 h-4 text-rose-600 shrink-0" />}
                {aiStatusMessage.type === 'info' && <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />}
                <span>{aiStatusMessage.text}</span>
              </div>
            )}

          </div>

          {/* MOTORIZZAZIONI DISPONIBILI (AI + CATALOGO) CON FILTRO ALIMENTAZIONE E ANNO */}
          {(aiMotorizations.length > 0 || motorizationGroups.matchedForYear.length > 0 || motorizationGroups.otherYears.length > 0) && (
            <div className="bg-[#f8fafc] border border-[#e2e8f0] p-4 rounded-2xl flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-black uppercase text-[#0f172a] tracking-wider flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-[#2563eb]" />
                    {aiMotorizations.length > 0 ? 'Motorizzazioni Identificate con AI' : `Motorizzazioni Ufficiali (${brand} ${model})`}
                  </span>
                  
                  {(aiGenerationInfo || yearInfo.year) && (
                    <span className="bg-blue-100 text-blue-800 text-[10px] font-extrabold px-2 py-0.5 rounded-md">
                      {aiGenerationInfo || `Anno ${yearInfo.year}`}
                    </span>
                  )}

                  {aiMotorizations.length > 0 && (
                    <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-600" />
                      {aiMotorizations.length} versioni
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {aiMotorizations.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setAiMotorizations([])}
                      className="text-[10px] font-bold text-slate-500 hover:text-slate-800 underline cursor-pointer"
                    >
                      Mostra catalogo standard
                    </button>
                  )}
                  {aiMotorizations.length === 0 && motorizationGroups.otherYears.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowAllYears(!showAllYears)}
                      className="text-[10px] font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
                    >
                      {showAllYears ? 'Nascondi altre annate' : `Tutte le generazioni (+${motorizationGroups.otherYears.length})`}
                    </button>
                  )}
                </div>
              </div>

              {/* Filtro per tipo di alimentazione */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[10px] font-bold">
                {[
                  { id: 'all', label: 'Tutte' },
                  { id: 'Benzina', label: 'Benzina' },
                  { id: 'Diesel', label: 'Diesel' },
                  { id: 'Full / Mild Hybrid', label: 'Ibrida' },
                  { id: 'Plug-in Hybrid (PHEV)', label: 'Plug-in ⚡' },
                  { id: 'Elettrica (BEV)', label: 'Elettrica ⚡' },
                  { id: 'GPL', label: 'GPL / Metano' }
                ].map((chip) => {
                  const isActive = selectedFuelFilter === chip.id;
                  return (
                    <button
                      key={chip.id}
                      type="button"
                      onClick={() => setSelectedFuelFilter(chip.id)}
                      className={`px-2.5 py-1 rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                        isActive 
                          ? 'bg-blue-600 text-white shadow-2xs font-black' 
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {chip.label}
                    </button>
                  );
                })}
              </div>

              {/* Lista versioni AI o Compatibili con l'anno */}
              <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto pr-1">
                {(aiMotorizations.length > 0 
                  ? aiMotorizations 
                  : (showAllYears ? motorizationGroups.all : motorizationGroups.matchedForYear)
                )
                .filter((m) => {
                  if (selectedFuelFilter === 'all') return true;
                  if (selectedFuelFilter === 'GPL') return m.fuelType.includes('GPL') || m.fuelType.includes('Metano');
                  return m.fuelType === selectedFuelFilter;
                })
                .map((m) => {
                  const isSelected = motorization === m.name;
                  return (
                    <button
                      key={m.name}
                      type="button"
                      onClick={() => applyMotorization(m)}
                      className={`text-left p-2.5 rounded-xl border transition-all flex flex-col gap-1.5 cursor-pointer ${
                        isSelected 
                          ? 'bg-blue-50/90 border-blue-400 ring-2 ring-blue-100 shadow-2xs' 
                          : 'bg-white border-[#e2e8f0] hover:border-blue-200 hover:bg-slate-50/50 text-[#0f172a]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-xs text-[#0f172a]">{m.name}</span>
                            {m.generation && (
                              <span className="text-[9px] font-extrabold px-1.5 py-0.2 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded">
                                {m.generation}
                              </span>
                            )}
                            {m.years && (
                              <span className="text-[9px] font-semibold px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded">
                                {m.years}
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-2 mt-0.5 text-[10px] text-slate-500 font-medium">
                            <span>{m.fuelType}</span>
                            {m.displacementCc && <span>• {m.displacementCc} cc</span>}
                            {m.transmission && <span>• {m.transmission}</span>}
                            {m.euroStandard && <span>• {m.euroStandard}</span>}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <span className="text-[11px] font-black bg-slate-100 text-slate-800 px-2 py-0.5 rounded-lg">
                            {m.cv} CV ({m.kw} kW)
                          </span>
                        </div>
                      </div>

                      {/* Technical highlights badges */}
                      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100/80 text-[10px]">
                        {m.fuelType !== 'Elettrica (BEV)' && (
                          <span className="text-slate-600 flex items-center gap-1">
                            <Fuel className="w-3 h-3 text-blue-500" />
                            Serbatoio: <strong>{m.tankCapacity}L</strong>
                          </span>
                        )}
                        {m.batteryCapacity && (
                          <span className="text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded font-bold flex items-center gap-1">
                            <Zap className="w-3 h-3 text-amber-500" />
                            Batteria: {m.batteryCapacity} kWh
                          </span>
                        )}
                        {m.secondaryTankCapacity && (
                          <span className="text-teal-700 bg-teal-50 px-1.5 py-0.2 rounded font-bold">
                            Gas: {m.secondaryTankCapacity} {m.fuelType.includes('Metano') ? 'Kg' : 'L'}
                          </span>
                        )}
                        {m.wltpElectricRangeKm && (
                          <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-bold">
                            ⚡ Autonomia WLTP: ~{m.wltpElectricRangeKm} km
                          </span>
                        )}
                        {m.avgConsumption && (
                          <span className="text-slate-500 ml-auto">
                            Consumo: {m.avgConsumption}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. SEZIONE DETTAGLI TECNICI & MOTORIZZAZIONE (SEMPRE MODIFICABILE DALL'UTENTE) */}
          <div className="bg-white border border-[#e2e8f0] p-4 rounded-2xl flex flex-col gap-4 shadow-2xs">
            <span className="text-[11px] font-black uppercase text-[#0f172a] tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-[#2563eb]" />
                Specifiche Tecniche & Motorizzazione
              </span>
              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                Completamente Modificabile
              </span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* MOTORIZZAZIONE / ALLESTIMENTO */}
              <div className="flex flex-col gap-1 sm:col-span-2">
                <label className="text-xs font-bold text-[#0f172a]">
                  Allestimento / Nome Motorizzazione
                </label>
                <input 
                  type="text"
                  placeholder="Es. 1.5 e-HYBRID VZ 272 CV DSG (PHEV 2024+) oppure 2.0 TDI 150 CV"
                  value={motorization}
                  onChange={(e) => setMotorization(e.target.value)}
                  className="w-full bg-[#f8fafc] border border-[#cbd5e1] focus:bg-white text-xs font-bold px-3 py-2.5 rounded-xl focus:border-[#2563eb] focus:ring-2 focus:ring-blue-100 outline-hidden"
                />
              </div>

              {/* TIPO ALIMENTAZIONE */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-[#0f172a] flex items-center gap-1.5">
                  <Fuel className="w-3.5 h-3.5 text-[#2563eb]" /> Tipo Alimentazione *
                </label>
                <select
                  value={fuelType}
                  onChange={(e) => {
                    const newFuel = e.target.value as FuelType;
                    setFuelType(newFuel);
                    // refresh photo automatically
                    if (brand && model) {
                      setPhotoUrl(getAutomaticVehiclePhoto(brand, model, newFuel));
                    }
                  }}
                  className="w-full bg-[#f8fafc] border border-[#cbd5e1] focus:bg-white text-xs font-bold px-3 py-2.5 rounded-xl focus:border-[#2563eb] focus:ring-2 focus:ring-blue-100 outline-hidden cursor-pointer"
                >
                  <option value="Diesel">Diesel</option>
                  <option value="Benzina">Benzina</option>
                  <option value="Full / Mild Hybrid">Full / Mild Hybrid (MHEV / HEV)</option>
                  <option value="Plug-in Hybrid (PHEV)">⚡ Plug-in Hybrid (PHEV - Doppia Alimentazione)</option>
                  <option value="Elettrica (BEV)">⚡ 100% Elettrica (BEV)</option>
                  <option value="GPL (Benzina + GPL)">GPL (Benzina + GPL)</option>
                  <option value="Metano (Benzina + Metano)">Metano (Benzina + Metano)</option>
                </select>
              </div>

              {/* KM INIZIALI */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-[#0f172a] flex items-center gap-1.5">
                  <Gauge className="w-3.5 h-3.5 text-[#2563eb]" /> Chilometraggio Attuale
                </label>
                <input 
                  type="number"
                  placeholder="Es. 45000"
                  value={initialKm}
                  onChange={(e) => setInitialKm(e.target.value ? Number(e.target.value) : '')}
                  className="w-full bg-[#f8fafc] border border-[#cbd5e1] focus:bg-white text-xs font-bold px-3 py-2.5 rounded-xl focus:border-[#2563eb] focus:ring-2 focus:ring-blue-100 outline-hidden"
                />
              </div>

            </div>

            {/* POTENZA (CV & KW) */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-[#0f172a]">Potenza (CV)</label>
                <input 
                  type="number"
                  placeholder="Es. 150"
                  value={powerCv}
                  onChange={(e) => handleCvChange(e.target.value)}
                  className="w-full bg-[#f8fafc] border border-[#cbd5e1] focus:bg-white text-xs font-black px-3 py-2 rounded-xl focus:border-[#2563eb] outline-hidden"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-[#0f172a]">Potenza (kW)</label>
                <input 
                  type="number"
                  placeholder="Es. 110"
                  value={powerKw}
                  onChange={(e) => handleKwChange(e.target.value)}
                  className="w-full bg-[#f8fafc] border border-[#cbd5e1] focus:bg-white text-xs font-black px-3 py-2 rounded-xl focus:border-[#2563eb] outline-hidden"
                />
              </div>
            </div>

            {/* SEZIONE CAPIENZA SERBATOI & BATTERIA */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
              
              {/* Serbatoio Carburante (Termico/PHEV) */}
              {!isBEV && (
                <div className="bg-[#f8fafc] border border-[#cbd5e1] p-3 rounded-xl flex flex-col gap-1 shadow-2xs">
                  <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                    <Fuel className="w-3.5 h-3.5 text-blue-600" />
                    {isPHEV ? 'Serbatoio Benzina (Litri)' : 'Capacità Serbatoio (Litri)'} *
                  </label>
                  <input 
                    type="number"
                    min="1"
                    max="150"
                    placeholder="Es. 40 o 50"
                    value={tankCapacity}
                    onChange={(e) => setTankCapacity(e.target.value ? Number(e.target.value) : '')}
                    className="w-full bg-white text-xs font-black px-2.5 py-1.5 rounded-lg border border-slate-200 outline-hidden focus:border-blue-600"
                  />
                  <span className="text-[10px] text-slate-400">
                    {isPHEV ? 'Capienza per il motore a combustione' : 'Volume totale carburante'}
                  </span>
                </div>
              )}

              {/* Batteria PHEV o BEV */}
              {(isPHEV || isBEV) && (
                <div className="bg-gradient-to-br from-amber-50/50 to-white border border-amber-300 p-3 rounded-xl flex flex-col gap-1 shadow-2xs">
                  <label className="text-[11px] font-black text-amber-900 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-600" />
                    Capacità Batteria (kWh) {isPHEV ? '(PHEV)' : '(BEV)'} *
                  </label>
                  <input 
                    type="number"
                    step="0.1"
                    min="1"
                    max="200"
                    placeholder={isPHEV ? 'Es. 13.0, 15.5 o 19.7 kWh' : 'Es. 60 o 77 kWh'}
                    value={batteryCapacity}
                    onChange={(e) => setBatteryCapacity(e.target.value ? Number(e.target.value) : '')}
                    className="w-full bg-white text-xs font-black text-[#0f172a] px-2.5 py-1.5 rounded-lg border border-amber-300 outline-hidden focus:border-amber-600 focus:ring-2 focus:ring-amber-100"
                  />
                  <span className="text-[10px] text-amber-800 font-semibold">
                    {isPHEV ? 'Necessaria per il calcolo consumi elettrici (kWh)' : 'Capacità totale batteria'}
                  </span>
                </div>
              )}

              {/* Serbatoio GPL o Metano */}
              {(isLPG || isCNG) && (
                <div className="bg-[#f8fafc] border border-[#cbd5e1] p-3 rounded-xl flex flex-col gap-1 shadow-2xs">
                  <label className="text-[11px] font-bold text-slate-700">
                    {isLPG ? 'Serbatoio GPL (Litri)' : 'Bombole Metano (Kg)'}
                  </label>
                  <input 
                    type="number"
                    step="0.1"
                    placeholder={isLPG ? 'Es. 38 Litri' : 'Es. 14 Kg'}
                    value={secondaryTankCapacity}
                    onChange={(e) => setSecondaryTankCapacity(e.target.value ? Number(e.target.value) : '')}
                    className="w-full bg-white text-xs font-black px-2.5 py-1.5 rounded-lg border border-slate-200 outline-hidden focus:border-blue-600"
                  />
                </div>
              )}

            </div>
          </div>

          {/* 3. SEZIONE FOTO VEICOLO (RICERCA AUTOMATICA + CARICAMENTO RAPIDO) */}
          <div className="bg-[#f8fafc] border border-[#e2e8f0] p-4 rounded-2xl flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#0f172a] flex items-center gap-1.5">
                <Car className="w-3.5 h-3.5 text-[#2563eb]" />
                Foto del Veicolo
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const autoPhoto = getAutomaticVehiclePhoto(brand, model, fuelType);
                    setPhotoUrl(autoPhoto);
                  }}
                  className="text-[11px] font-bold text-slate-600 hover:text-blue-600 bg-white border border-[#cbd5e1] hover:bg-blue-50 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Foto Automatica</span>
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isOptimizing}
                  className="text-[11px] font-bold text-[#2563eb] bg-white border border-[#cbd5e1] hover:bg-blue-50 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                >
                  <Upload className="w-3 h-3" />
                  <span>{isOptimizing ? 'Caricamento...' : 'Carica Foto'}</span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-28 h-18 rounded-xl overflow-hidden border border-[#cbd5e1] shrink-0 bg-slate-200 shadow-2xs">
                <img 
                  src={photoUrl} 
                  alt="Anteprima Veicolo" 
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Preset buttons */}
              <div className="flex flex-wrap gap-1.5 flex-1">
                {PRESET_PHOTOS.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => setPhotoUrl(p.url)}
                    className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition-all cursor-pointer ${
                      photoUrl === p.url 
                        ? 'bg-blue-600 text-white border-blue-600' 
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

        </form>

        {/* MODAL FOOTER */}
        <div className="px-5 py-4 border-t border-[#e2e8f0] bg-[#fafbfc] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="bg-white hover:bg-slate-100 text-[#0f172a] border border-[#cbd5e1] text-xs font-bold px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
          >
            Annulla
          </button>

          <button
            type="button"
            id="btn-save-vehicle"
            onClick={handleSubmit}
            className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>{isEditing ? 'Salva Modifiche' : 'Crea Scheda Veicolo'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
