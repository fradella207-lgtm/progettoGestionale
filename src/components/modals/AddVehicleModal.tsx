import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  X, 
  Car, 
  Bike,
  Fuel, 
  Zap, 
  Upload, 
  Check, 
  Calendar, 
  Gauge, 
  ChevronRight, 
  ChevronLeft,
  ChevronDown, 
  Loader2, 
  Info, 
  Image as ImageIcon, 
  FileText,
  AlertCircle,
  CheckCircle2,
  Sliders,
  Sparkles
} from 'lucide-react';
import { Vehicle, FuelType, VehicleTechnicalSpecs } from '../../types';
import { 
  POPULAR_BRANDS,
  ALL_BRAND_NAMES,
  getModelsForBrand, 
  getMotorizationsForModelAndYear,
  estimateYearFromItalianPlate,
  lookupVehicleWithAI,
  CarMotorization,
  generateGenericMotorizationsForBrandModel,
  buildQuattroruoteSpecsFromMotorization
} from '../../data/carDatabase';
import {
  ALL_MOTO_BRAND_NAMES,
  POPULAR_MOTO_BRANDS,
  getModelsForMotoBrand,
  getMotorizationsForMotoModelAndYear,
  generateGenericMotorizationsForMoto,
  buildMotorcycleSpecsFromMotorization,
  MotoMotorization
} from '../../data/motoDatabase';
import { searchRealVehiclePhotos, RealVehiclePhoto, optimizeImageFile } from '../../utils/imageOptimizer';
import { searchAndRetrieveCarManual } from '../../utils/carManualService';
import { validateVin, formatVinForDisplay } from '../../utils/vinValidator';
import { validatePlate } from '../../utils/plateValidator';

interface AddVehicleModalProps {
  vehicleToEdit?: Vehicle | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (vehicleData: Partial<Vehicle>) => void;
}

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

  // Tipo Veicolo: Auto o Moto
  const [vehicleType, setVehicleType] = useState<'car' | 'moto'>(vehicleToEdit?.vehicleType || 'car');

  // Active step: 1 = Veicolo & Targa, 2 = Motore & Serbatoio, 3 = Km & Foto
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);

  // 1. Dati Principali
  const [brand, setBrand] = useState(vehicleToEdit?.brand || '');
  const [model, setModel] = useState(vehicleToEdit?.model || '');
  const [trimLevel, setTrimLevel] = useState(vehicleToEdit?.trimLevel || vehicleToEdit?.technicalSpecs?.trimLevel || '');
  const [inputYear, setInputYear] = useState<string>(
    vehicleToEdit?.registrationDate 
      ? vehicleToEdit.registrationDate.split('-')[0] 
      : '2019'
  );
  const [regDate, setRegDate] = useState(vehicleToEdit?.registrationDate || `${new Date().getFullYear()}-06-15`);
  const [plate, setPlate] = useState(vehicleToEdit?.plate || '');
  const [vin, setVin] = useState(vehicleToEdit?.vin || '');

  // 2. Dati Motore & Alimentazione
  const [fuelType, setFuelType] = useState<FuelType>(vehicleToEdit?.fuelType || 'Diesel');
  const [motorization, setMotorization] = useState(vehicleToEdit?.motorization || '');
  const [tankCapacity, setTankCapacity] = useState<number | ''>(vehicleToEdit?.tankCapacity ?? (vehicleToEdit?.vehicleType === 'moto' ? 15 : 50));
  const [batteryCapacity, setBatteryCapacity] = useState<number | ''>(vehicleToEdit?.batteryCapacity ?? '');
  const [powerCv, setPowerCv] = useState<number | ''>(vehicleToEdit?.powerCv ?? '');
  const [powerKw, setPowerKw] = useState<number | ''>(vehicleToEdit?.powerKw ?? '');
  const [initialKm, setInitialKm] = useState<number | ''>(vehicleToEdit?.initialKm ?? 0);
  const [photoUrl, setPhotoUrl] = useState<string>(
    vehicleToEdit?.photoUrl || 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800&auto=format&fit=crop&q=80'
  );

  // Technical Specs & Photos
  const [technicalSpecs, setTechnicalSpecs] = useState<VehicleTechnicalSpecs>(
    vehicleToEdit?.technicalSpecs || {
      tirePressureFrontBar: 2.3,
      tirePressureRearBar: 2.2,
      tirePressureLoadedBar: 2.6,
      recommendedOil: '5W-30 ACEA C3',
      oilCapacityLiters: 4.5,
      allowedTireSizes: ['205/55 R16 91V', '225/45 R17 91W']
    }
  );

  const [realPhotos, setRealPhotos] = useState<RealVehiclePhoto[]>([]);
  const [isSearchingPhotos, setIsSearchingPhotos] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);

  // Dropdown states
  const [showBrandDropdown, setShowBrandDropdown] = useState(false);
  const [showModelDropdown, setShowModelDropdown] = useState(false);

  // Target Year
  const targetYearNum = useMemo(() => {
    const parsed = parseInt(inputYear.trim(), 10);
    if (!isNaN(parsed) && parsed >= 1970 && parsed <= 2035) return parsed;
    if (regDate) {
      const yr = parseInt(regDate.split('-')[0], 10);
      if (!isNaN(yr)) return yr;
    }
    return 2019;
  }, [inputYear, regDate]);

  // CONTROLLO RIGOROSO SULLA TARGA (SEMPRE ATTIVO, CONTEXT-AWARE PER AUTO / MOTO)
  const plateValidation = useMemo(() => {
    return validatePlate(plate, vehicleType);
  }, [plate, vehicleType]);

  // Validatore VIN (ISO 3779)
  const vinValidation = useMemo(() => {
    return validateVin(vin, true);
  }, [vin]);

  // Sync state on open/edit
  useEffect(() => {
    if (isOpen) {
      setActiveStep(1);
      const initialType = vehicleToEdit?.vehicleType || 'car';
      const initialBrand = vehicleToEdit?.brand || '';
      const initialModel = vehicleToEdit?.model || '';
      const initialPlate = vehicleToEdit?.plate || '';
      const initialRegDate = vehicleToEdit?.registrationDate || `${new Date().getFullYear()}-06-15`;
      const initialYr = initialRegDate.split('-')[0] || '2019';

      setVehicleType(initialType);
      setBrand(initialBrand);
      setModel(initialModel);
      setTrimLevel(vehicleToEdit?.trimLevel || vehicleToEdit?.technicalSpecs?.trimLevel || '');
      setPlate(initialPlate);
      setVin(vehicleToEdit?.vin || '');
      setInputYear(initialYr);
      setRegDate(initialRegDate);
      setFuelType(vehicleToEdit?.fuelType || (initialType === 'moto' ? 'Benzina' : 'Diesel'));
      setMotorization(vehicleToEdit?.motorization || '');
      setTankCapacity(vehicleToEdit?.tankCapacity ?? (initialType === 'moto' ? 15 : 50));
      setBatteryCapacity(vehicleToEdit?.batteryCapacity ?? '');
      setPowerCv(vehicleToEdit?.powerCv ?? '');
      setPowerKw(vehicleToEdit?.powerKw ?? '');
      setInitialKm(vehicleToEdit?.initialKm ?? 0);

      if (vehicleToEdit?.technicalSpecs) {
        setTechnicalSpecs(vehicleToEdit.technicalSpecs);
      }
      
      const defaultPhoto = vehicleToEdit?.photoUrl || (
        initialType === 'moto'
          ? 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800&auto=format&fit=crop&q=80'
      );
      setPhotoUrl(defaultPhoto);

      if (initialBrand.trim() && initialModel.trim()) {
        fetchPhotos(initialBrand, initialModel, initialYr, initialType);
      }
    }
  }, [isOpen, vehicleToEdit]);

  // Close dropdowns on click outside
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

  // Filtered Brands & Models
  const brandList = useMemo(() => {
    const list = vehicleType === 'moto' ? ALL_MOTO_BRAND_NAMES : ALL_BRAND_NAMES;
    if (!brand.trim()) return list;
    return list.filter(b => b.toLowerCase().includes(brand.trim().toLowerCase()));
  }, [brand, vehicleType]);

  const popularBrandsList = useMemo(() => {
    return vehicleType === 'moto' ? POPULAR_MOTO_BRANDS : POPULAR_BRANDS;
  }, [vehicleType]);

  const modelList = useMemo(() => {
    if (!brand.trim()) return [];
    if (vehicleType === 'moto') {
      const models = getModelsForMotoBrand(brand);
      if (!model.trim()) return models;
      return models.filter(m => m.name.toLowerCase().includes(model.trim().toLowerCase()));
    }
    const models = getModelsForBrand(brand);
    if (!model.trim()) return models;
    return models.filter(m => m.name.toLowerCase().includes(model.trim().toLowerCase()));
  }, [brand, model, vehicleType]);

  // Motorizzazioni coerenti per l'anno selezionato
  const coherentMotorizations = useMemo(() => {
    if (!brand.trim() || !model.trim()) return [];
    if (vehicleType === 'moto') {
      const res = getMotorizationsForMotoModelAndYear(brand, model, targetYearNum);
      if (res.matchedForYear && res.matchedForYear.length > 0) return res.matchedForYear;
      return generateGenericMotorizationsForMoto(brand, model, targetYearNum);
    }
    const res = getMotorizationsForModelAndYear(brand, model, targetYearNum);
    if (res.matchedForYear && res.matchedForYear.length > 0) {
      return res.matchedForYear;
    }
    return generateGenericMotorizationsForBrandModel(brand, model, targetYearNum);
  }, [brand, model, targetYearNum, vehicleType]);

  // Fetch photos
  const fetchPhotos = async (targetBrand: string, targetModel: string, targetYear?: string | number, currentVehicleType: 'car' | 'moto' = vehicleType) => {
    if (!targetBrand.trim() || !targetModel.trim()) return;
    try {
      setIsSearchingPhotos(true);
      const query = currentVehicleType === 'moto' ? `${targetBrand} ${targetModel} motorcycle` : `${targetBrand} ${targetModel} car`;
      const photos = await searchRealVehiclePhotos(query, targetYear ? String(targetYear) : undefined);
      if (photos.length > 0) {
        setRealPhotos(photos);
        if (!photoUrl || photoUrl.includes('unsplash.com/photo-1617814076367') || photoUrl.includes('unsplash.com/photo-1558981806') || !isEditing) {
          setPhotoUrl(photos[0].url);
        }
      }
    } catch (err) {
      console.warn("Errore ricerca foto:", err);
    } finally {
      setIsSearchingPhotos(false);
    }
  };

  const handleBrandChange = (newBrand: string) => {
    setBrand(newBrand);
    setModel('');
    setMotorization('');
  };

  const handleModelChange = (newModel: string) => {
    setModel(newModel);
    setMotorization('');
    if (brand.trim() && newModel.trim()) {
      fetchPhotos(brand, newModel, targetYearNum, vehicleType);
    }
  };

  const handleSelectVehicleType = (type: 'car' | 'moto') => {
    if (type === vehicleType) return;
    setVehicleType(type);
    setBrand('');
    setModel('');
    setMotorization('');
    if (type === 'moto') {
      setFuelType('Benzina');
      setTankCapacity(15);
      setPhotoUrl('https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&auto=format&fit=crop&q=80');
      setTechnicalSpecs({
        tirePressureFrontBar: 2.3,
        tirePressureRearBar: 2.5,
        tirePressureLoadedBar: 2.9,
        recommendedOil: '10W-40 4T (JASO MA2)',
        oilCapacityLiters: 3.4,
        allowedTireSizes: ['120/70 ZR17 (Ant.)', '180/55 ZR17 (Post.)'],
        finalDrive: 'Catena 525 con O-Ring',
        coolingType: 'Liquido'
      });
    } else {
      setFuelType('Diesel');
      setTankCapacity(50);
      setPhotoUrl('https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800&auto=format&fit=crop&q=80');
      setTechnicalSpecs({
        tirePressureFrontBar: 2.3,
        tirePressureRearBar: 2.2,
        tirePressureLoadedBar: 2.6,
        recommendedOil: '5W-30 ACEA C3',
        oilCapacityLiters: 4.5,
        allowedTireSizes: ['205/55 R16 91V', '225/45 R17 91W']
      });
    }
  };

  const handlePlateChange = (val: string) => {
    const upper = val.toUpperCase();
    setPlate(upper);
    const est = estimateYearFromItalianPlate(upper);
    if (est && (!inputYear || inputYear === '2019')) {
      setInputYear(String(est.year));
      setRegDate(est.estimatedDateString);
    }
  };

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

  const handleSelectMotorization = (m: CarMotorization | MotoMotorization) => {
    setMotorization(m.name);
    setFuelType(m.fuelType as FuelType);
    if (m.cv) setPowerCv(m.cv);
    if (m.kw) setPowerKw(m.kw);
    if (m.tankCapacity) setTankCapacity(m.tankCapacity);
    if (m.batteryCapacity) setBatteryCapacity(m.batteryCapacity);

    if (vehicleType === 'moto') {
      const built = buildMotorcycleSpecsFromMotorization(brand, model, m as MotoMotorization, targetYearNum);
      setTechnicalSpecs(prev => ({
        ...prev,
        ...built
      }));
    } else {
      const built = buildQuattroruoteSpecsFromMotorization(brand, model, m as CarMotorization, targetYearNum);
      setTechnicalSpecs(prev => ({
        ...prev,
        ...built,
        oilCapacityLiters: (m as CarMotorization).oilCapacityLiters || prev.oilCapacityLiters,
        recommendedOil: (m as CarMotorization).recommendedOil || prev.recommendedOil
      }));
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsOptimizing(true);
      const res = await optimizeImageFile(file, 1200, 900, 0.85);
      setPhotoUrl(res.dataUrl);
    } catch (err) {
      console.error(err);
    } finally {
      setIsOptimizing(false);
    }
  };

  // SUBMIT CON CONTROLLO SEMPRE BLOCCANTE SULLA TARGA
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!brand.trim() || !model.trim()) {
      setActiveStep(1);
      alert('Inserisci la Marca e il Modello del veicolo.');
      return;
    }

    // CONTROLLO RIGOROSO DELLA TARGA:
    if (!plateValidation.isValid) {
      setActiveStep(1);
      alert(plateValidation.errorMessage || (vehicleType === 'moto' ? 'Targa moto non valida (es. AB 12345 o ciclomotore).' : 'Targa auto non valida (es. AB 123 CD).'));
      return;
    }

    // Controllo opzionale VIN
    if (vin.trim() && !vinValidation.isValid) {
      setActiveStep(1);
      alert(vinValidation.error || 'Codice telaio (VIN) non valido.');
      return;
    }

    const isBEV = fuelType === 'Elettrica (BEV)';
    const isPHEV = fuelType === 'Plug-in Hybrid (PHEV)';

    // Retrieve manual in background if missing
    let carManual = vehicleToEdit?.manualInfo || technicalSpecs.manualInfo;
    if (!carManual) {
      try {
        carManual = await searchAndRetrieveCarManual({
          brand: brand.trim(),
          model: model.trim(),
          year: targetYearNum,
          fuelType,
          motorization: motorization.trim() || undefined,
          trimLevel: trimLevel.trim() || undefined
        });
      } catch (err) {
        console.warn('Recupero manuale:', err);
      }
    }

    const defaultFuelCapacity = vehicleType === 'moto' ? 15 : 50;
    const finalSpecs: VehicleTechnicalSpecs = {
      ...technicalSpecs,
      trimLevel: trimLevel.trim() || technicalSpecs.trimLevel,
      powerCv: Number(powerCv) || technicalSpecs.powerCv,
      powerKw: Number(powerKw) || technicalSpecs.powerKw,
      fuelCapacityLiters: isBEV ? 0 : (Number(tankCapacity) || technicalSpecs.fuelCapacityLiters || defaultFuelCapacity),
      batteryCapacityKwh: (isPHEV || isBEV) ? (Number(batteryCapacity) || technicalSpecs.batteryCapacityKwh) : undefined,
      euroClass: technicalSpecs.euroClass || (targetYearNum < 2001 ? 'Euro 2' : targetYearNum < 2006 ? 'Euro 3' : targetYearNum < 2011 ? 'Euro 4' : targetYearNum < 2016 ? 'Euro 5' : targetYearNum < 2021 ? 'Euro 5' : 'Euro 5+'),
      summaryQuattroruote: technicalSpecs.summaryQuattroruote || `${brand} ${model} ${motorization || ''} (${targetYearNum})`,
      manualInfo: carManual || technicalSpecs.manualInfo
    };

    onSave({
      vehicleType,
      brand: brand.trim(),
      model: model.trim(),
      trimLevel: trimLevel.trim() || undefined,
      plate: plateValidation.cleanPlate,
      vin: vinValidation.normalized || undefined,
      fuelType,
      motorization: motorization.trim() || undefined,
      tankCapacity: isBEV ? (Number(batteryCapacity) || (vehicleType === 'moto' ? 15 : 60)) : (Number(tankCapacity) || defaultFuelCapacity),
      batteryCapacity: (isPHEV || isBEV) ? (Number(batteryCapacity) || undefined) : undefined,
      powerCv: Number(powerCv) || undefined,
      powerKw: Number(powerKw) || undefined,
      initialKm: Number(initialKm) || 0,
      registrationDate: regDate || `${targetYearNum}-06-15`,
      photoUrl,
      manualInfo: carManual,
      technicalSpecs: finalSpecs
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden font-['Plus_Jakarta_Sans',sans-serif] border border-slate-200">
        
        {/* 1. COMPACT ELEGANT HEADER */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-xs shrink-0">
              {vehicleType === 'moto' ? (
                <Bike className="w-4.5 h-4.5" />
              ) : (
                <Car className="w-4.5 h-4.5" />
              )}
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-extrabold text-slate-900 leading-tight truncate">
                {isEditing 
                  ? (vehicleType === 'moto' ? 'Modifica Moto' : 'Modifica Veicolo') 
                  : (vehicleType === 'moto' ? 'Aggiungi Moto' : 'Aggiungi Veicolo')}
              </h3>
              <p className="text-xs text-slate-500 truncate">
                {brand && model 
                  ? `${brand} ${model}` 
                  : (vehicleType === 'moto' ? 'Inserisci i dati della tua moto' : 'Inserisci i dati della tua auto')}
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            title="Chiudi"
            className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. MINIMAL STEPPER NAVIGATION (CLEAN, MODERN & AIRY) */}
        <div className="grid grid-cols-3 border-b border-slate-100 bg-white text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveStep(1)}
            className={`py-2.5 px-3 flex items-center justify-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              activeStep === 1 
                ? 'border-slate-900 text-slate-900 bg-slate-50/50' 
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
              activeStep === 1 ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-600'
            }`}>1</span>
            <span>Dati & Targa</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveStep(2)}
            className={`py-2.5 px-3 flex items-center justify-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              activeStep === 2 
                ? 'border-slate-900 text-slate-900 bg-slate-50/50' 
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
              activeStep === 2 ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-600'
            }`}>2</span>
            <span>Motore</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveStep(3)}
            className={`py-2.5 px-3 flex items-center justify-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              activeStep === 3 
                ? 'border-slate-900 text-slate-900 bg-slate-50/50' 
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
              activeStep === 3 ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-600'
            }`}>3</span>
            <span>Foto & Km</span>
          </button>
        </div>

        {/* 3. STEP CONTENT */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto flex flex-col gap-5 flex-1">
          
          {/* STEP 1: DATI PRINCIPALI & CONTROLLO TARGA */}
          {activeStep === 1 && (
            <div className="flex flex-col gap-4 animate-in fade-in duration-150">
              
              {/* SELETTORE TIPO VEICOLO (AUTO / MOTO) */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-800">
                  Tipo di Veicolo *
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleSelectVehicleType('car')}
                    className={`p-3 rounded-2xl border flex items-center justify-center gap-2.5 font-bold text-xs transition-all cursor-pointer ${
                      vehicleType === 'car'
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <Car className="w-4 h-4" />
                    <span>Autovettura</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectVehicleType('moto')}
                    className={`p-3 rounded-2xl border flex items-center justify-center gap-2.5 font-bold text-xs transition-all cursor-pointer ${
                      vehicleType === 'moto'
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <Bike className="w-4 h-4" />
                    <span>Moto / Scooter</span>
                  </button>
                </div>
              </div>

              {/* Marca & Modello in griglia pulita a 2 colonne */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                
                {/* MARCA */}
                <div ref={brandContainerRef} className="relative flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-800">
                    Marca {vehicleType === 'moto' ? 'Moto' : 'Veicolo'} *
                  </label>
                  <div className="relative">
                    <input 
                      type="text"
                      required
                      placeholder={vehicleType === 'moto' ? 'Es. Honda, Yamaha, Ducati, BMW...' : 'Es. Fiat, Audi, Volkswagen...'}
                      value={brand}
                      onFocus={() => setShowBrandDropdown(true)}
                      onChange={(e) => {
                        handleBrandChange(e.target.value);
                        setShowBrandDropdown(true);
                      }}
                      className="w-full bg-slate-50/70 border border-slate-200 text-xs font-bold px-3.5 py-2.5 rounded-xl focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowBrandDropdown(!showBrandDropdown)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>

                  {showBrandDropdown && (
                    <div className="absolute left-0 right-0 top-[60px] z-30 bg-white border border-slate-200 rounded-xl shadow-xl max-h-48 overflow-y-auto p-1 divide-y divide-slate-100">
                      {brandList.map((b) => (
                        <button
                          key={b}
                          type="button"
                          onClick={() => {
                            handleBrandChange(b);
                            setShowBrandDropdown(false);
                          }}
                          className="w-full text-left px-3 py-1.5 text-xs font-semibold hover:bg-slate-100 text-slate-900 rounded-lg transition-colors flex items-center justify-between cursor-pointer"
                        >
                          <span>{b}</span>
                          {popularBrandsList.includes(b) && (
                            <span className="text-[9px] bg-slate-100 text-slate-600 px-1 py-0.5 rounded font-bold">Popolare</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* MODELLO */}
                <div ref={modelContainerRef} className="relative flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-800">
                    Modello {vehicleType === 'moto' ? 'Moto' : 'Veicolo'} *
                  </label>
                  <div className="relative">
                    <input 
                      type="text"
                      required
                      placeholder={vehicleType === 'moto' ? 'Es. MT-07, GS 1250, Monster, Beverly...' : 'Es. Panda, Golf, 500, Ypsilon...'}
                      value={model}
                      onFocus={() => setShowModelDropdown(true)}
                      onChange={(e) => {
                        handleModelChange(e.target.value);
                        setShowModelDropdown(true);
                      }}
                      className="w-full bg-slate-50/70 border border-slate-200 text-xs font-bold px-3.5 py-2.5 rounded-xl focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowModelDropdown(!showModelDropdown)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>

                  {showModelDropdown && modelList.length > 0 && (
                    <div className="absolute left-0 right-0 top-[60px] z-30 bg-white border border-slate-200 rounded-xl shadow-xl max-h-48 overflow-y-auto p-1 divide-y divide-slate-100">
                      {modelList.map((m) => (
                        <button
                          key={m.name}
                          type="button"
                          onClick={() => {
                            handleModelChange(m.name);
                            setShowModelDropdown(false);
                          }}
                          className="w-full text-left px-3 py-1.5 text-xs font-semibold hover:bg-slate-100 text-slate-900 rounded-lg transition-colors flex items-center justify-between cursor-pointer"
                        >
                          <span>{m.name}</span>
                          <span className="text-[10px] text-slate-400">{m.category || (vehicleType === 'moto' ? 'Moto' : 'Auto')}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              {/* Anno & Allestimento */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-800">
                    Anno di Immatricolazione
                  </label>
                  <input 
                    type="number"
                    min={1970}
                    max={2030}
                    placeholder="Es. 2019"
                    value={inputYear}
                    onChange={(e) => {
                      setInputYear(e.target.value);
                      if (e.target.value.length === 4) {
                        setRegDate(`${e.target.value}-06-15`);
                      }
                    }}
                    className="w-full bg-slate-50/70 border border-slate-200 text-xs font-bold px-3.5 py-2.5 rounded-xl focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-800">
                    Allestimento <span className="text-slate-400 font-normal">(Opzionale)</span>
                  </label>
                  <input 
                    type="text"
                    placeholder="Es. Lounge, Business, Sport, R-Line..."
                    value={trimLevel}
                    onChange={(e) => setTrimLevel(e.target.value)}
                    className="w-full bg-slate-50/70 border border-slate-200 text-xs font-semibold px-3.5 py-2.5 rounded-xl focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition-all"
                  />
                </div>
              </div>

              {/* SEZIONE TARGA - CONTROLLO SEMPRE ATTIVO & VISUALE */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <span>Targa Veicolo *</span>
                    <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-bold">
                      Controllo Obbligatorio
                    </span>
                  </label>

                  {/* Status badge immediato */}
                  {plate.trim() && (
                    <span className={`text-[10.5px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 ${
                      plateValidation.isValid
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-rose-100 text-rose-800 border border-rose-300'
                    }`}>
                      {plateValidation.isValid ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-700 stroke-[3]" />
                          <span>Targa Valida</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-3 h-3 text-rose-600" />
                          <span>Formato Non Valido</span>
                        </>
                      )}
                    </span>
                  )}
                </div>

                <div className="relative flex items-center">
                  <div className="absolute left-2.5 flex items-center justify-center bg-blue-700 text-white font-bold text-[9px] px-1.5 py-0.5 rounded pointer-events-none tracking-wider">
                    IT
                  </div>
                  <input 
                    type="text"
                    required
                    maxLength={10}
                    placeholder={vehicleType === 'moto' ? 'AB 12345 o ciclomotore' : 'BK 123 CD'}
                    value={plate}
                    onChange={(e) => handlePlateChange(e.target.value)}
                    className={`w-full bg-white border text-sm font-mono font-black uppercase pl-11 pr-3 py-2.5 rounded-xl outline-none tracking-widest transition-all ${
                      !plate.trim() 
                        ? 'border-slate-200 focus:border-slate-900' 
                        : plateValidation.isValid 
                          ? 'border-emerald-500 bg-emerald-50/20 text-slate-950 ring-1 ring-emerald-400' 
                          : 'border-rose-400 bg-rose-50/20 text-rose-950 ring-1 ring-rose-300'
                    }`}
                  />
                </div>

                {/* Feedback targa chiaro e utile */}
                {plate.trim() ? (
                  plateValidation.isValid ? (
                    <div className="text-[11px] text-emerald-700 flex items-center gap-1.5 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{plateValidation.description}: <strong>{plateValidation.formattedPlate}</strong></span>
                    </div>
                  ) : (
                    <div className="text-[11px] text-rose-700 flex items-start gap-1.5 font-medium">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                      <span>{plateValidation.errorMessage || (vehicleType === 'moto' ? 'Verifica il formato della targa moto (2 lettere + 5 cifre o ciclomotore)' : 'Verifica il formato della targa (2 lettere, 3 cifre, 2 lettere)')}</span>
                    </div>
                  )
                ) : (
                  <p className="text-[11px] text-slate-500">
                    {vehicleType === 'moto' 
                      ? 'Inserisci la targa moto (es. AB 12345) o contrassegno ciclomotore a 6 caratteri.'
                      : 'Inserisci la targa per il controllo automatico di conformità e anno stimato.'}
                  </p>
                )}
              </div>

              {/* CODICE TELAIO (VIN) - OPZIONALE E PULITO */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-slate-500" />
                    <span>Codice Telaio (VIN)</span>
                    <span className="text-[10px] text-slate-400 font-semibold">(Opzionale)</span>
                  </label>
                  {vin.trim() && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                      vinValidation.isValid ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {vinValidation.isValid ? '17/17 ISO 3779' : `${vinValidation.charCount}/17 car.`}
                    </span>
                  )}
                </div>
                <input 
                  type="text"
                  maxLength={17}
                  placeholder="Es. ZAR95200007123456 (riga E del libretto)"
                  value={vin}
                  onChange={(e) => setVin(e.target.value.toUpperCase())}
                  className="w-full bg-white border border-slate-200 text-xs font-mono font-bold px-3 py-2 rounded-xl uppercase outline-none focus:border-slate-900 transition-all"
                />
              </div>

            </div>
          )}

          {/* STEP 2: MOTORE & ALIMENTAZIONE */}
          {activeStep === 2 && (
            <div className="flex flex-col gap-4 animate-in fade-in duration-150">
              
              {/* Selezione Alimentazione a Chip Semplici */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-800">
                  Tipo di Alimentazione *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(vehicleType === 'moto' ? [
                    'Benzina',
                    'Elettrica (BEV)',
                    'Full Hybrid (HEV)'
                  ] : [
                    'Diesel',
                    'Benzina',
                    'Mild Hybrid (MHEV)',
                    'Full Hybrid (HEV)',
                    'Plug-in Hybrid (PHEV)',
                    'Elettrica (BEV)',
                    'GPL (Benzina + GPL)',
                    'Metano (Benzina + Metano)'
                  ]).map((fuel) => (
                    <button
                      key={fuel}
                      type="button"
                      onClick={() => setFuelType(fuel as FuelType)}
                      className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition-all text-left truncate cursor-pointer ${
                        fuelType === fuel
                          ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {fuel}
                    </button>
                  ))}
                </div>
              </div>

              {/* Suggerimenti Motorizzazioni Rapide (se trovate nel catalogo) */}
              {coherentMotorizations.length > 0 && (
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col gap-2">
                  <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    Seleziona Motorizzazione Consigliata:
                  </span>
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                    {coherentMotorizations.slice(0, 5).map((m) => (
                      <button
                        key={m.name}
                        type="button"
                        onClick={() => handleSelectMotorization(m)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 border transition-all cursor-pointer ${
                          motorization === m.name
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {m.name} {m.cv ? `(${m.cv} CV)` : ''}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Motorizzazione Personalizzata */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-800">
                  Nome Motorizzazione / Versione
                </label>
                <input 
                  type="text"
                  placeholder={vehicleType === 'moto' ? 'Es. 689cc 2 cilindri 73 CV, 1254cc Boxer 136 CV, 300 HPE...' : 'Es. 1.6 Multijet 120 CV, 2.0 TDI 150 CV, TCe 90...'}
                  value={motorization}
                  onChange={(e) => setMotorization(e.target.value)}
                  className="w-full bg-slate-50/70 border border-slate-200 text-xs font-bold px-3.5 py-2.5 rounded-xl focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition-all"
                />
              </div>

              {/* Potenza CV / kW e Serbatoio */}
              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-800">Potenza CV</label>
                  <input 
                    type="number"
                    placeholder="Es. 120"
                    value={powerCv}
                    onChange={(e) => handleCvChange(e.target.value)}
                    className="w-full bg-slate-50/70 border border-slate-200 text-xs font-bold px-3 py-2.5 rounded-xl focus:bg-white focus:border-slate-900 outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-800">Potenza kW</label>
                  <input 
                    type="number"
                    placeholder="Es. 88"
                    value={powerKw}
                    onChange={(e) => handleKwChange(e.target.value)}
                    className="w-full bg-slate-50/70 border border-slate-200 text-xs font-bold px-3 py-2.5 rounded-xl focus:bg-white focus:border-slate-900 outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-800">
                    {fuelType.includes('Elettrica') ? 'Batteria (kWh)' : 'Serbatoio (L)'}
                  </label>
                  <input 
                    type="number"
                    placeholder={fuelType.includes('Elettrica') ? 'Es. 60' : 'Es. 50'}
                    value={fuelType.includes('Elettrica') ? batteryCapacity : tankCapacity}
                    onChange={(e) => {
                      const v = e.target.value === '' ? '' : Number(e.target.value);
                      if (fuelType.includes('Elettrica')) setBatteryCapacity(v);
                      else setTankCapacity(v);
                    }}
                    className="w-full bg-slate-50/70 border border-slate-200 text-xs font-bold px-3 py-2.5 rounded-xl focus:bg-white focus:border-slate-900 outline-none"
                  />
                </div>
              </div>

            </div>
          )}

          {/* STEP 3: KM, DATA IMMATRICOLAZIONE E FOTO */}
          {activeStep === 3 && (
            <div className="flex flex-col gap-4 animate-in fade-in duration-150">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-800">
                    Chilometri Attuali / Iniziali
                  </label>
                  <input 
                    type="number"
                    min={0}
                    placeholder="Es. 75000"
                    value={initialKm}
                    onChange={(e) => setInitialKm(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-slate-50/70 border border-slate-200 text-xs font-bold px-3.5 py-2.5 rounded-xl focus:bg-white focus:border-slate-900 outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-800">
                    Data Esatta Immatricolazione
                  </label>
                  <input 
                    type="date"
                    value={regDate}
                    onChange={(e) => {
                      setRegDate(e.target.value);
                      if (e.target.value) setInputYear(e.target.value.split('-')[0]);
                    }}
                    className="w-full bg-slate-50/70 border border-slate-200 text-xs font-semibold px-3 py-2 rounded-xl focus:bg-white focus:border-slate-900 outline-none"
                  />
                </div>
              </div>

              {/* FOTO ANTEPRIMA & SELEZIONE RAPIDA */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-slate-600" />
                    Foto Veicolo
                  </span>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isOptimizing}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Carica foto</span>
                  </button>
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleFileUpload} 
                  />
                </div>

                {/* Anteprima grande pulita */}
                <div className="w-full h-40 rounded-xl overflow-hidden bg-slate-900 relative border border-slate-200 shadow-inner group">
                  <img 
                    src={photoUrl} 
                    alt="Anteprima veicolo" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-slate-950/30 pointer-events-none" />
                  <div className="absolute bottom-2 left-2 text-white font-mono text-[11px] font-bold bg-slate-900/80 px-2 py-0.5 rounded backdrop-blur-xs">
                    {plateValidation.isValid ? plateValidation.formattedPlate : (plate || 'TARGA')}
                  </div>
                </div>

                {/* Galleria miniature foto reali trovate online */}
                {realPhotos.length > 1 && (
                  <div className="flex items-center gap-2 overflow-x-auto pt-1 no-scrollbar">
                    {realPhotos.slice(0, 5).map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setPhotoUrl(p.url)}
                        className={`w-14 h-11 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                          photoUrl === p.url ? 'border-indigo-600 scale-105 shadow-xs' : 'border-transparent opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={p.url} alt="Miniatura" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

        </form>

        {/* 4. CLEAN ACTIONS FOOTER */}
        <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between gap-2">
          {activeStep > 1 ? (
            <button
              type="button"
              onClick={() => setActiveStep((prev) => (prev - 1) as 1 | 2)}
              className="py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Indietro</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl text-slate-500 hover:text-slate-800 text-xs font-bold transition-all cursor-pointer"
            >
              Annulla
            </button>
          )}

          <div className="flex items-center gap-2">
            {activeStep < 3 ? (
              <button
                type="button"
                onClick={() => {
                  if (activeStep === 1) {
                    if (!brand.trim() || !model.trim()) {
                      alert('Inserisci prima Marca e Modello.');
                      return;
                    }
                    if (!plateValidation.isValid) {
                      alert(plateValidation.errorMessage || 'Inserisci una targa valida per procedere.');
                      return;
                    }
                  }
                  setActiveStep((prev) => (prev + 1) as 2 | 3);
                }}
                className="py-2.5 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-xs"
              >
                <span>Avanti</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                className="py-2.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer active:scale-95 shadow-xs"
              >
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>{isEditing ? 'Salva Modifiche' : 'Aggiungi al Garage'}</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
