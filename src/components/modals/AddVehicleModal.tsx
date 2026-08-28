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
  ShieldCheck, 
  Image as ImageIcon, 
  Disc, 
  Droplet, 
  Activity,
  FileText,
  AlertCircle
} from 'lucide-react';
import { Vehicle, FuelType, VehicleTechnicalSpecs } from '../../types';
import { 
  searchRealVehiclePhotos, 
  RealVehiclePhoto, 
  optimizeImageFile, 
  OptimizationResult 
} from '../../utils/imageOptimizer';
import { useSwipeBack } from '../../hooks/useSwipeBack';
import { 
  POPULAR_BRANDS,
  ALL_BRAND_NAMES,
  getModelsForBrand, 
  getMotorizationsForModelAndYear,
  extractRegistrationYear,
  estimateYearFromItalianPlate,
  lookupVehicleWithAI,
  CarMotorization,
  generateGenericMotorizationsForBrandModel,
  searchMotorizationsFuzzy,
  buildQuattroruoteSpecsFromMotorization
} from '../../data/carDatabase';

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

  // 1. Marca, 2. Modello, 3. Allestimento (Opzionale), 4. Anno, 5. Targa (in the exact order requested by the user)
  const [brand, setBrand] = useState(vehicleToEdit?.brand || '');
  const [model, setModel] = useState(vehicleToEdit?.model || '');
  const [trimLevel, setTrimLevel] = useState(vehicleToEdit?.trimLevel || vehicleToEdit?.technicalSpecs?.trimLevel || '');
  const [inputYear, setInputYear] = useState<string>(
    vehicleToEdit?.registrationDate 
      ? vehicleToEdit.registrationDate.split('-')[0] 
      : '2018'
  );
  const [regDate, setRegDate] = useState(vehicleToEdit?.registrationDate || `${new Date().getFullYear()}-06-15`);
  const [plate, setPlate] = useState(vehicleToEdit?.plate || '');

  // Technical & Motorization Fields
  const [fuelType, setFuelType] = useState<FuelType>(vehicleToEdit?.fuelType || 'Diesel');
  const [motorization, setMotorization] = useState(vehicleToEdit?.motorization || '');
  const [tankCapacity, setTankCapacity] = useState<number | ''>(vehicleToEdit?.tankCapacity ?? 50);
  const [batteryCapacity, setBatteryCapacity] = useState<number | ''>(vehicleToEdit?.batteryCapacity ?? '');
  const [secondaryTankCapacity, setSecondaryTankCapacity] = useState<number | ''>(vehicleToEdit?.secondaryTankCapacity ?? '');
  const [powerCv, setPowerCv] = useState<number | ''>(vehicleToEdit?.powerCv ?? '');
  const [powerKw, setPowerKw] = useState<number | ''>(vehicleToEdit?.powerKw ?? '');
  const [initialKm, setInitialKm] = useState<number | ''>(vehicleToEdit?.initialKm ?? 0);
  const [photoUrl, setPhotoUrl] = useState<string>(
    vehicleToEdit?.photoUrl || 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=1000&auto=format&fit=crop&q=80'
  );

  // Specifiche Tecniche Quattroruote
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

  // Photos State
  const [realPhotos, setRealPhotos] = useState<RealVehiclePhoto[]>([]);
  const [isSearchingPhotos, setIsSearchingPhotos] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [showAdvancedSpecs, setShowAdvancedSpecs] = useState(false);

  // AI & Feedback States
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiLoadingPhase, setAiLoadingPhase] = useState<string>('');
  const [aiStatusMessage, setAiStatusMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [aiMotorizations, setAiMotorizations] = useState<CarMotorization[]>([]);
  const [selectedFuelFilter, setSelectedFuelFilter] = useState<string>('all');

  // Autocomplete UI dropdowns
  const [showBrandDropdown, setShowBrandDropdown] = useState(false);
  const [showModelDropdown, setShowModelDropdown] = useState(false);

  // Target Year parsed cleanly
  const targetYearNum = useMemo(() => {
    const parsed = parseInt(inputYear.trim(), 10);
    if (!isNaN(parsed) && parsed >= 1970 && parsed <= 2035) {
      return parsed;
    }
    if (regDate) {
      const yr = parseInt(regDate.split('-')[0], 10);
      if (!isNaN(yr)) return yr;
    }
    return 2018;
  }, [inputYear, regDate]);

  // Sync state when vehicleToEdit or isOpen changes
  useEffect(() => {
    if (isOpen) {
      const initialBrand = vehicleToEdit?.brand || '';
      const initialModel = vehicleToEdit?.model || '';
      const initialPlate = vehicleToEdit?.plate || '';
      const initialRegDate = vehicleToEdit?.registrationDate || `${new Date().getFullYear()}-06-15`;
      const initialYr = initialRegDate.split('-')[0] || '2018';

      setBrand(initialBrand);
      setModel(initialModel);
      setTrimLevel(vehicleToEdit?.trimLevel || vehicleToEdit?.technicalSpecs?.trimLevel || '');
      setPlate(initialPlate);
      setInputYear(initialYr);
      setRegDate(initialRegDate);
      setFuelType(vehicleToEdit?.fuelType || 'Diesel');
      setMotorization(vehicleToEdit?.motorization || '');
      setTankCapacity(vehicleToEdit?.tankCapacity ?? 50);
      setBatteryCapacity(vehicleToEdit?.batteryCapacity ?? '');
      setSecondaryTankCapacity(vehicleToEdit?.secondaryTankCapacity ?? '');
      setPowerCv(vehicleToEdit?.powerCv ?? '');
      setPowerKw(vehicleToEdit?.powerKw ?? '');
      setInitialKm(vehicleToEdit?.initialKm ?? 0);

      if (vehicleToEdit?.technicalSpecs) {
        setTechnicalSpecs(vehicleToEdit.technicalSpecs);
      } else {
        setTechnicalSpecs({
          tirePressureFrontBar: 2.3,
          tirePressureRearBar: 2.2,
          tirePressureLoadedBar: 2.6,
          recommendedOil: '5W-30 ACEA C3',
          oilCapacityLiters: 4.5,
          allowedTireSizes: ['205/55 R16 91V', '225/45 R17 91W']
        });
      }
      
      const defaultInitialPhoto = vehicleToEdit?.photoUrl || 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=1000&auto=format&fit=crop&q=80';
      setPhotoUrl(defaultInitialPhoto);
      setAiStatusMessage(null);
      setAiMotorizations([]);
      setSelectedFuelFilter('all');
      setShowBrandDropdown(false);
      setShowModelDropdown(false);

      if (initialBrand.trim() && initialModel.trim()) {
        fetchPhotosForVehicle(initialBrand, initialModel, initialYr);
      } else {
        setRealPhotos([]);
      }
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

  // Plate year estimation check
  const plateEstimation = useMemo(() => {
    return estimateYearFromItalianPlate(plate);
  }, [plate]);

  /**
   * Available motorizations filtered STRICTLY by targetYearNum!
   * E.g. If Year = 2000, Punto motorizations will be 1.2 8V, 1.2 16V, 1.9 JTD (NOT 1.4 MultiAir 2012 or MHEV 2020!)
   */
  const coherentMotorizations = useMemo(() => {
    if (!brand.trim()) return [];
    
    // 1. If AI has loaded motorizations specifically for this query
    if (aiMotorizations.length > 0) {
      return aiMotorizations;
    }

    // 2. Query local database with strict year matching
    const res = getMotorizationsForModelAndYear(brand, model, targetYearNum);
    if (res.matchedForYear && res.matchedForYear.length > 0) {
      return res.matchedForYear;
    }

    // 3. Fallback generic motorizations tailored strictly to the era (<=2004, 2005-2014, 2015-2019, 2020+)
    return generateGenericMotorizationsForBrandModel(brand, model, targetYearNum);
  }, [brand, model, targetYearNum, aiMotorizations]);

  // Filtered list based on fuel filter
  const filteredMotorizations = useMemo(() => {
    let result = coherentMotorizations;

    if (selectedFuelFilter === 'Diesel') {
      result = result.filter(m => m.fuelType.toLowerCase().includes('diesel'));
    } else if (selectedFuelFilter === 'Benzina') {
      result = result.filter(m => m.fuelType.toLowerCase().includes('benzina') && !m.fuelType.toLowerCase().includes('gpl') && !m.fuelType.toLowerCase().includes('metano') && !m.fuelType.toLowerCase().includes('phev') && !m.fuelType.toLowerCase().includes('hybrid'));
    } else if (selectedFuelFilter === 'Hybrid') {
      result = result.filter(m => m.fuelType.toLowerCase().includes('hybrid') || m.fuelType.toLowerCase().includes('phev') || m.fuelType.toLowerCase().includes('ibrid'));
    } else if (selectedFuelFilter === 'Elettrica (BEV)') {
      result = result.filter(m => m.fuelType.toLowerCase().includes('elettrica') || m.fuelType.toLowerCase().includes('bev'));
    } else if (selectedFuelFilter === 'GPL/Metano') {
      result = result.filter(m => m.fuelType.toLowerCase().includes('gpl') || m.fuelType.toLowerCase().includes('metano'));
    }

    return result;
  }, [coherentMotorizations, selectedFuelFilter]);

  /**
   * Searches and loads real vehicle photos dynamically from Wikipedia/Wikimedia Commons
   */
  const fetchPhotosForVehicle = async (
    targetBrand: string,
    targetModel: string,
    targetYear?: string | number,
    targetGen?: string
  ) => {
    if (!targetBrand.trim() && !targetModel.trim()) return;

    try {
      setIsSearchingPhotos(true);
      const photos = await searchRealVehiclePhotos(
        targetBrand,
        targetModel,
        targetYear,
        targetGen
      );

      if (photos.length > 0) {
        setRealPhotos(photos);
        if (!photoUrl || photoUrl.includes('unsplash.com/photo-1617814076367') || !isEditing) {
          setPhotoUrl(photos[0].url);
        }
      }
    } catch (err) {
      console.warn("Errore ricerca foto reali:", err);
    } finally {
      setIsSearchingPhotos(false);
    }
  };

  /**
   * Interroga Quattroruote via Gemini per ottenere motorizzazioni coerenti per MARCA, MODELLO e ANNO
   */
  const triggerQuattroruoteLookup = async () => {
    if (!brand.trim() || !model.trim()) {
      setAiStatusMessage({
        text: 'Inserisci prima Marca e Modello.',
        type: 'info'
      });
      return;
    }

    const yrStr = String(targetYearNum);
    const query = `${brand} ${model} ${trimLevel ? trimLevel + ' ' : ''}anno ${yrStr}`.trim();

    try {
      setIsAiLoading(true);
      setAiLoadingPhase(`Consultazione Quattroruote per ${brand} ${model} ${trimLevel || ''} (${yrStr})...`);

      const res = await lookupVehicleWithAI(query, brand, model, yrStr, plate, trimLevel);

      if (res.availableMotorizations && res.availableMotorizations.length > 0) {
        setAiMotorizations(res.availableMotorizations);
        // Automatically select the first coherent engine if none selected yet
        if (!motorization.trim()) {
          applyMotorization(res.availableMotorizations[0]);
        }
        setAiStatusMessage({
          text: `Trovate ${res.availableMotorizations.length} motorizzazioni Quattroruote per l'anno ${yrStr}.`,
          type: 'success'
        });
      } else {
        setAiStatusMessage({
          text: `Caricate motorizzazioni storiche coerenti con l'anno ${yrStr}.`,
          type: 'info'
        });
      }

      if (res.realPhotos && res.realPhotos.length > 0) {
        setRealPhotos(res.realPhotos);
        if (!photoUrl || photoUrl.includes('unsplash.com/photo-1617814076367') || !isEditing) {
          setPhotoUrl(res.realPhotos[0].url);
        }
      } else {
        fetchPhotosForVehicle(res.brand || brand, res.model || model, yrStr, res.generation);
      }

      setTimeout(() => setAiStatusMessage(null), 5000);

    } catch (err) {
      console.warn('Errore lookup Quattroruote:', err);
      setAiStatusMessage({
        text: `Utilizzo catalogo locale Quattroruote per ${brand} ${model} (${yrStr}).`,
        type: 'info'
      });
      setTimeout(() => setAiStatusMessage(null), 4000);
    } finally {
      setIsAiLoading(false);
      setAiLoadingPhase('');
    }
  };

  // Support swipe right gesture to go back / close
  useSwipeBack({
    onBack: onClose,
    enabled: isOpen
  });

  const handleBrandChange = (newBrand: string) => {
    setBrand(newBrand);
    setAiMotorizations([]);
    if (newBrand.trim() && model.trim()) {
      fetchPhotosForVehicle(newBrand, model, targetYearNum);
    }
  };

  const handleModelChange = (newModel: string) => {
    setModel(newModel);
    setAiMotorizations([]);
    if (brand.trim() && newModel.trim()) {
      fetchPhotosForVehicle(brand, newModel, targetYearNum);
    }
  };

  const handleYearChange = (newYear: string) => {
    setInputYear(newYear);
    setAiMotorizations([]);
    const parsed = parseInt(newYear, 10);
    if (!isNaN(parsed) && parsed >= 1970 && parsed <= 2035) {
      // Preserve the exact month and day of regDate if already set! NEVER reset to 06-15!
      if (regDate && regDate.includes('-')) {
        const parts = regDate.split('-');
        if (parts.length === 3) {
          setRegDate(`${parsed}-${parts[1]}-${parts[2]}`);
        } else {
          setRegDate(`${parsed}-01-01`);
        }
      } else {
        setRegDate(`${parsed}-01-01`);
      }
      if (brand.trim() && model.trim()) {
        fetchPhotosForVehicle(brand, model, parsed);
      }
    }
  };

  const handleRegDateChange = (newDate: string) => {
    setRegDate(newDate);
    if (newDate && newDate.includes('-')) {
      const yr = newDate.split('-')[0];
      const parsedYr = parseInt(yr, 10);
      if (!isNaN(parsedYr) && parsedYr >= 1970 && parsedYr <= 2035) {
        setInputYear(yr);
        setAiMotorizations([]);
        if (brand.trim() && model.trim()) {
          fetchPhotosForVehicle(brand, model, parsedYr);
        }
      }
    }
  };

  const handlePlateChange = (newPlate: string) => {
    const upper = newPlate.toUpperCase();
    setPlate(upper);
    const est = estimateYearFromItalianPlate(upper);
    if (est) {
      // If user hasn't explicitly customized the year, offer the estimated plate year
      if (!inputYear || inputYear === '2018') {
        setInputYear(String(est.year));
        if (!regDate || regDate.startsWith('2018')) {
          setRegDate(est.estimatedDateString);
        }
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

  // Select a motorization from catalog or AI
  const applyMotorization = (m: CarMotorization & { brandName?: string; modelName?: string }) => {
    setMotorization(m.name);
    setFuelType(m.fuelType as FuelType);
    setTankCapacity(m.tankCapacity);
    setBatteryCapacity(m.batteryCapacity ?? '');
    setSecondaryTankCapacity(m.secondaryTankCapacity ?? '');
    setPowerCv(m.cv);
    setPowerKw(m.kw);

    // Build complete Quattroruote Technical Specs automatically
    const generatedSpecs = buildQuattroruoteSpecsFromMotorization(brand, model, m, targetYearNum);
    
    setTechnicalSpecs(prev => ({
      ...prev,
      ...generatedSpecs,
      engineDisplacementCc: m.displacementCc || generatedSpecs.engineDisplacementCc,
      powerCv: m.cv || generatedSpecs.powerCv,
      powerKw: m.kw || generatedSpecs.powerKw,
      fuelCapacityLiters: m.tankCapacity || generatedSpecs.fuelCapacityLiters,
      batteryCapacityKwh: m.batteryCapacity || generatedSpecs.batteryCapacityKwh,
      euroClass: m.euroStandard || generatedSpecs.euroClass,
      transmission: m.transmission || generatedSpecs.transmission,
      drivetrain: m.driveType || generatedSpecs.drivetrain,
      wltpConsumption: m.avgConsumption || generatedSpecs.wltpConsumption,
      engineCode: m.engineCode || prev.engineCode || generatedSpecs.engineCode
    }));

    const targetYear = m.years || targetYearNum;
    fetchPhotosForVehicle(brand, model, targetYear, m.generation);

    setAiStatusMessage({
      text: `Selezionato: ${m.name} (${m.cv} CV / ${m.kw} kW, ${m.fuelType})`,
      type: 'success'
    });
    setTimeout(() => setAiStatusMessage(null), 3500);
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
    const isBEV = fuelType === 'Elettrica (BEV)';
    const isPHEV = fuelType === 'Plug-in Hybrid (PHEV)';

    // Final consolidated technical specs
    const finalSpecs: VehicleTechnicalSpecs = {
      ...technicalSpecs,
      trimLevel: trimLevel.trim() || technicalSpecs.trimLevel,
      powerCv: Number(powerCv) || technicalSpecs.powerCv,
      powerKw: Number(powerKw) || technicalSpecs.powerKw,
      fuelCapacityLiters: isBEV ? 0 : (Number(tankCapacity) || technicalSpecs.fuelCapacityLiters || 50),
      batteryCapacityKwh: (isPHEV || isBEV) ? (Number(batteryCapacity) || technicalSpecs.batteryCapacityKwh) : undefined,
      euroClass: technicalSpecs.euroClass || (targetYearNum < 2001 ? 'Euro 2' : targetYearNum < 2006 ? 'Euro 3' : targetYearNum < 2011 ? 'Euro 4' : targetYearNum < 2016 ? 'Euro 5' : 'Euro 6'),
      summaryQuattroruote: technicalSpecs.summaryQuattroruote || `Specifiche tecniche Quattroruote per ${brand} ${model} ${trimLevel ? trimLevel + ' ' : ''}${motorization || ''} (${targetYearNum})`
    };

    onSave({
      brand: brand.trim(),
      model: model.trim(),
      trimLevel: trimLevel.trim() || undefined,
      plate: cleanPlate,
      fuelType,
      motorization: motorization.trim() || undefined,
      tankCapacity: isBEV ? (Number(batteryCapacity) || 60) : (Number(tankCapacity) || 50),
      batteryCapacity: (isPHEV || isBEV) ? (Number(batteryCapacity) || undefined) : undefined,
      secondaryTankCapacity: Number(secondaryTankCapacity) || undefined,
      powerCv: Number(powerCv) || undefined,
      powerKw: Number(powerKw) || undefined,
      initialKm: Number(initialKm) || 0,
      registrationDate: regDate || `${targetYearNum}-06-15`,
      photoUrl,
      technicalSpecs: finalSpecs
    });

    onClose();
  };

  if (!isOpen) return null;

  const isPHEV = fuelType === 'Plug-in Hybrid (PHEV)';
  const isBEV = fuelType === 'Elettrica (BEV)';
  const isLPG = fuelType === 'GPL (Benzina + GPL)' || fuelType === 'GPL';
  const isCNG = fuelType === 'Metano (Benzina + Metano)' || fuelType === 'Metano';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden font-['Plus_Jakarta_Sans',sans-serif] border border-[#e2e8f0]">
        
        {/* HEADER */}
        <div className="px-5 py-3.5 border-b border-[#e2e8f0] flex items-center justify-between gap-3 bg-[#fafbfc]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <Car className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-[#0f172a] leading-tight truncate">
                  {isEditing ? 'Modifica Scheda Veicolo' : 'Inserisci Veicolo & Motorizzazioni Quattroruote'}
                </h3>
                <span className="text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-blue-600" />
                  Dati Certificati
                </span>
              </div>
              <p className="text-xs text-[#64748b] truncate">
                Compila in sequenza: Marca → Modello → Anno → Targa per caricare le motorizzazioni dell&apos;epoca
              </p>
            </div>
          </div>
          <button 
            id="btn-close-add-car-modal"
            type="button"
            onClick={onClose}
            title="Chiudi"
            className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* NOTIFICA STATUS */}
        {aiStatusMessage && (
          <div className={`px-4 py-2 text-xs font-bold border-b flex items-center gap-2 ${
            aiStatusMessage.type === 'success' ? 'bg-emerald-50 text-emerald-900 border-emerald-200' :
            aiStatusMessage.type === 'error' ? 'bg-rose-50 text-rose-900 border-rose-200' :
            'bg-blue-50 text-blue-900 border-blue-200'
          }`}>
            <Info className="w-4 h-4 shrink-0" />
            <span className="flex-1">{aiStatusMessage.text}</span>
          </div>
        )}

        {/* MAIN FORM - ALL IN ONE SINGLE VIEW */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto flex flex-col gap-5">

          {/* 1. SEZIONE SEQUENZIALE: MARCA, MODELLO, ANNO, TARGA */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex flex-col gap-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-slate-800 tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-blue-600" />
                1. Dati Principali del Veicolo
              </span>
              <span className="text-[10px] text-slate-500 font-semibold">
                Campi essenziali per la ricerca motorizzazioni
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
              
              {/* 1. MARCA */}
              <div ref={brandContainerRef} className="relative flex flex-col gap-1">
                <label className="text-xs font-bold text-[#0f172a] flex items-center justify-between">
                  <span>1. Marca *</span>
                </label>
                <div className="relative">
                  <input 
                    type="text"
                    required
                    placeholder="Es. Fiat, Audi, BMW..."
                    value={brand}
                    onFocus={() => setShowBrandDropdown(true)}
                    onChange={(e) => {
                      handleBrandChange(e.target.value);
                      setShowBrandDropdown(true);
                    }}
                    className="w-full bg-white border border-[#cbd5e1] text-xs font-bold px-3 py-2.5 rounded-xl focus:border-[#2563eb] focus:ring-2 focus:ring-blue-100 outline-hidden transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowBrandDropdown(!showBrandDropdown)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 p-1 cursor-pointer"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                {showBrandDropdown && (
                  <div className="absolute left-0 right-0 top-[58px] z-30 bg-white border border-[#cbd5e1] rounded-xl shadow-xl max-h-48 overflow-y-auto p-1 divide-y divide-slate-100">
                    {brandList.map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => {
                          handleBrandChange(b);
                          setShowBrandDropdown(false);
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs font-semibold hover:bg-blue-50 text-[#0f172a] rounded-lg transition-colors flex items-center justify-between cursor-pointer"
                      >
                        <span>{b}</span>
                        {POPULAR_BRANDS.includes(b) && (
                          <span className="text-[9px] bg-slate-100 text-slate-600 px-1 py-0.2 rounded font-medium">Top</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 2. MODELLO */}
              <div ref={modelContainerRef} className="relative flex flex-col gap-1">
                <label className="text-xs font-bold text-[#0f172a]">
                  2. Modello *
                </label>
                <div className="relative">
                  <input 
                    type="text"
                    required
                    placeholder="Es. Punto, Golf, Panda..."
                    value={model}
                    onFocus={() => setShowModelDropdown(true)}
                    onChange={(e) => {
                      handleModelChange(e.target.value);
                      setShowModelDropdown(true);
                    }}
                    className="w-full bg-white border border-[#cbd5e1] text-xs font-bold px-3 py-2.5 rounded-xl focus:border-[#2563eb] focus:ring-2 focus:ring-blue-100 outline-hidden transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowModelDropdown(!showModelDropdown)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 p-1 cursor-pointer"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                {showModelDropdown && modelList.length > 0 && (
                  <div className="absolute left-0 right-0 top-[58px] z-30 bg-white border border-[#cbd5e1] rounded-xl shadow-xl max-h-48 overflow-y-auto p-1 divide-y divide-slate-100">
                    {modelList.map((m) => (
                      <button
                        key={m.name}
                        type="button"
                        onClick={() => {
                          handleModelChange(m.name);
                          setShowModelDropdown(false);
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs font-semibold hover:bg-blue-50 text-[#0f172a] rounded-lg transition-colors flex items-center justify-between cursor-pointer"
                      >
                        <span>{m.name}</span>
                        <span className="text-[9px] text-slate-400">{m.category}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 3. ALLESTIMENTO / VERSIONE (OPZIONALE, PER MASSIMA PRECISIONE GENERAZIONE) */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#0f172a]">
                    Allestimento
                  </label>
                  <span className="text-[9px] text-slate-400 font-semibold">Opzionale</span>
                </div>
                <input 
                  type="text"
                  placeholder="Es. Lounge, S line, GT..."
                  value={trimLevel}
                  onChange={(e) => setTrimLevel(e.target.value)}
                  className="w-full bg-white border border-[#cbd5e1] text-xs font-semibold px-3 py-2.5 rounded-xl focus:border-[#2563eb] focus:ring-2 focus:ring-blue-100 outline-hidden transition-all"
                />
              </div>

              {/* 4. ANNO (CHIAVE FONDAMENTALE PER LE MOTORIZZAZIONI COERENTI) */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#0f172a] flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    3. Anno *
                  </label>
                  <span className="text-[10px] font-black text-blue-700 bg-blue-100/70 px-1.5 py-0.2 rounded">
                    {targetYearNum}
                  </span>
                </div>
                <input 
                  type="number"
                  required
                  min={1970}
                  max={2030}
                  placeholder="Es. 2000, 2008..."
                  value={inputYear}
                  onChange={(e) => handleYearChange(e.target.value)}
                  className="w-full bg-white border border-blue-300 ring-1 ring-blue-100 text-xs font-black px-3 py-2.5 rounded-xl focus:border-[#2563eb] focus:ring-2 focus:ring-blue-200 outline-hidden transition-all"
                />
              </div>

              {/* 5. DATA DI IMMATRICOLAZIONE ESATTA (NON SOSTITUISCE L'ANNO CON DATE ARBITRARIE) */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#0f172a]">
                    Immatricolazione
                  </label>
                </div>
                <input 
                  type="date"
                  value={regDate}
                  onChange={(e) => handleRegDateChange(e.target.value)}
                  className="w-full bg-white border border-[#cbd5e1] text-xs font-semibold px-2.5 py-2.5 rounded-xl focus:border-[#2563eb] focus:ring-2 focus:ring-blue-100 outline-hidden transition-all"
                />
              </div>

              {/* 6. TARGA */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#0f172a]">
                    5. Targa *
                  </label>
                  {plateEstimation && (
                    <span className="text-[9.5px] font-bold text-slate-500">
                      ~{plateEstimation.year}
                    </span>
                  )}
                </div>
                <div className="relative flex items-center">
                  <div className="absolute left-2.5 flex items-center justify-center bg-blue-700 text-white font-bold text-[8.5px] px-1 py-0.5 rounded pointer-events-none">
                    IT
                  </div>
                  <input 
                    type="text"
                    required
                    placeholder="BK 123 CD"
                    value={plate}
                    onChange={(e) => handlePlateChange(e.target.value)}
                    className="w-full bg-white border border-[#cbd5e1] text-xs font-mono font-black uppercase pl-10 pr-2 py-2.5 rounded-xl focus:border-[#2563eb] focus:ring-2 focus:ring-blue-100 outline-hidden tracking-widest"
                  />
                </div>
              </div>

            </div>

            {/* Quick Year Selection Chips */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1 text-[11px]">
              <span className="text-slate-500 font-semibold text-[10.5px]">Anni frequenti:</span>
              {[1998, 2000, 2003, 2006, 2009, 2012, 2015, 2018, 2020, 2022, 2024].map((yr) => (
                <button
                  key={yr}
                  type="button"
                  onClick={() => handleYearChange(String(yr))}
                  className={`px-2 py-0.5 rounded-md border text-[10.5px] font-bold transition-all cursor-pointer ${
                    targetYearNum === yr
                      ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-blue-50 hover:text-blue-700'
                  }`}
                >
                  {yr}
                </button>
              ))}
            </div>
          </div>

          {/* 2. MOTORIZZAZIONI COERENTI QUATTRORUOTE (IN THE SAME SCREEN) */}
          <div className="bg-white border border-[#e2e8f0] p-4 rounded-2xl flex flex-col gap-3 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-black uppercase text-[#0f172a] tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-blue-600" />
                  2. Motorizzazioni Quattroruote Coerenti con l&apos;Anno {targetYearNum}
                </span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {brand || 'Marca'} {model || 'Modello'} ({targetYearNum}) — Seleziona il motore per compilare automaticamente potenza, cilindrata e consumi.
                </p>
              </div>

              {/* Pulsante Cerca Quattroruote */}
              <button
                type="button"
                onClick={triggerQuattroruoteLookup}
                disabled={isAiLoading || !brand.trim() || !model.trim()}
                className="text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 self-start sm:self-auto shadow-2xs"
              >
                {isAiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-amber-500" />}
                <span>{isAiLoading ? 'Ricerca in corso...' : '🔍 Cerca su Quattroruote'}</span>
              </button>
            </div>

            {/* Quick Fuel Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto text-[10.5px] font-bold pt-1 pb-1">
              {[
                { key: 'all', label: 'Tutte le Alimentazioni' },
                { key: 'Benzina', label: 'Benzina' },
                { key: 'Diesel', label: 'Diesel' },
                { key: 'GPL/Metano', label: 'GPL / Metano' },
                { key: 'Hybrid', label: 'Ibrida / PHEV' },
                { key: 'Elettrica (BEV)', label: '100% Elettrica' }
              ].map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setSelectedFuelFilter(f.key)}
                  className={`px-3 py-1 rounded-lg border transition-all cursor-pointer whitespace-nowrap ${
                    selectedFuelFilter === f.key 
                      ? 'bg-blue-600 text-white border-blue-600 font-black shadow-2xs' 
                      : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Elenco Card Motorizzazioni Coerenti */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-64 overflow-y-auto pr-1">
              {filteredMotorizations.length > 0 ? (
                filteredMotorizations.map((m, idx) => {
                  const isSelected = motorization.trim().toLowerCase() === m.name.trim().toLowerCase();
                  const isElectric = m.fuelType.toLowerCase().includes('elettrica') || m.fuelType.toLowerCase().includes('bev');
                  const isHyb = m.fuelType.toLowerCase().includes('hybrid') || m.fuelType.toLowerCase().includes('phev');
                  const isGas = m.fuelType.toLowerCase().includes('gpl') || m.fuelType.toLowerCase().includes('metano');
                  const isDies = m.fuelType.toLowerCase().includes('diesel');

                  return (
                    <button
                      key={m.name + idx}
                      type="button"
                      onClick={() => applyMotorization(m)}
                      className={`text-left p-3 rounded-xl border transition-all flex items-start justify-between gap-2.5 cursor-pointer ${
                        isSelected
                          ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-300 shadow-xs'
                          : 'bg-[#fcfdfd] border-slate-200 hover:border-blue-300 hover:bg-slate-50 text-[#0f172a]'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-black text-xs text-[#0f172a]">{m.name}</span>
                          {m.generation && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded">
                              {m.generation}
                            </span>
                          )}
                          {m.years && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded">
                              {m.years}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1 mt-1.5 text-[10px] flex-wrap">
                          <span className={`px-1.5 py-0.2 rounded font-bold border ${
                            isElectric ? 'bg-amber-50 text-amber-900 border-amber-200' :
                            isHyb ? 'bg-emerald-50 text-emerald-900 border-emerald-200' :
                            isGas ? 'bg-teal-50 text-teal-900 border-teal-200' :
                            isDies ? 'bg-blue-50 text-blue-900 border-blue-200' :
                            'bg-slate-100 text-slate-700 border-slate-200'
                          }`}>
                            {m.fuelType}
                          </span>

                          {m.displacementCc && (
                            <span className="bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-semibold">
                              {m.displacementCc} cc
                            </span>
                          )}

                          {m.engineCode && (
                            <span className="bg-amber-50 text-amber-900 border border-amber-200 px-1.5 py-0.2 rounded font-mono font-bold">
                              Cod: {m.engineCode}
                            </span>
                          )}

                          {m.euroStandard && (
                            <span className="bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-semibold">
                              {m.euroStandard}
                            </span>
                          )}

                          {m.avgConsumption && (
                            <span className="bg-emerald-50 text-emerald-800 px-1.5 py-0.2 rounded font-bold">
                              {m.avgConsumption}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className="text-xs font-black bg-slate-900 text-white px-2 py-0.5 rounded-lg whitespace-nowrap">
                          {m.cv} CV
                        </span>
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                          isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-300'
                        }`}>
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="col-span-full p-4 text-center text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  <span>Nessuna motorizzazione trovata per questo filtro. Clicca &quot;🔍 Cerca su Quattroruote&quot; per interrogarlo.</span>
                </div>
              )}
            </div>

            {/* Input manuale motorizzazione se personalizzata */}
            <div className="pt-2 border-t border-slate-100 flex items-center gap-3">
              <label className="text-xs font-bold text-slate-700 whitespace-nowrap">
                Versione selezionata:
              </label>
              <input 
                type="text"
                placeholder="Seleziona dall'elenco sopra o scrivi la versione..."
                value={motorization}
                onChange={(e) => setMotorization(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-200 text-xs font-bold px-3 py-1.5 rounded-xl focus:bg-white focus:border-blue-600 outline-hidden"
              />
            </div>
          </div>

          {/* 3. DATI TECNICI & MANUTENZIONE (IN THE SAME SCREEN) */}
          <div className="bg-white border border-[#e2e8f0] p-4 rounded-2xl flex flex-col gap-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-[#0f172a] tracking-wider flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-blue-600" />
                3. Specifiche Tecniche & Parametri di Bordo
              </span>
              <button
                type="button"
                onClick={() => setShowAdvancedSpecs(!showAdvancedSpecs)}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
              >
                {showAdvancedSpecs ? 'Riduci Dettagli ▲' : 'Modifica Dettagli Gomme & Olio ▼'}
              </button>
            </div>

            {/* Griglia Principale Potenza, Carburante, Serbatoio, Chilometri */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-[#0f172a]">Alimentazione</label>
                <select
                  value={fuelType}
                  onChange={(e) => setFuelType(e.target.value as FuelType)}
                  className="w-full bg-[#f8fafc] border border-slate-200 text-xs font-bold px-3 py-2 rounded-xl focus:border-blue-600 outline-hidden"
                >
                  <option value="Benzina">Benzina</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Full / Mild Hybrid">Ibrida (MHEV / HEV)</option>
                  <option value="Plug-in Hybrid (PHEV)">Plug-in Hybrid (PHEV)</option>
                  <option value="Elettrica (BEV)">Elettrica (BEV)</option>
                  <option value="GPL (Benzina + GPL)">GPL (Bi-Fuel)</option>
                  <option value="Metano (Benzina + Metano)">Metano (Bi-Fuel)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-[#0f172a]">Potenza (CV / kW)</label>
                <div className="grid grid-cols-2 gap-1">
                  <input 
                    type="number"
                    placeholder="CV"
                    value={powerCv}
                    onChange={(e) => handleCvChange(e.target.value)}
                    className="w-full bg-[#f8fafc] border border-slate-200 text-xs font-black px-2 py-2 rounded-xl focus:border-blue-600 outline-hidden text-center"
                  />
                  <input 
                    type="number"
                    placeholder="kW"
                    value={powerKw}
                    onChange={(e) => handleKwChange(e.target.value)}
                    className="w-full bg-[#f8fafc] border border-slate-200 text-xs font-bold px-2 py-2 rounded-xl focus:border-blue-600 outline-hidden text-center text-slate-500"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-[#0f172a]">
                  {isBEV ? 'Batteria (kWh)' : 'Serbatoio (Litri)'}
                </label>
                <input 
                  type="number"
                  value={isBEV ? (batteryCapacity || 58) : (tankCapacity || 50)}
                  onChange={(e) => {
                    const val = e.target.value ? Number(e.target.value) : '';
                    if (isBEV) setBatteryCapacity(val);
                    else setTankCapacity(val);
                  }}
                  className="w-full bg-[#f8fafc] border border-slate-200 text-xs font-bold px-3 py-2 rounded-xl focus:border-blue-600 outline-hidden"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-[#0f172a] flex items-center gap-1">
                  <Gauge className="w-3.5 h-3.5 text-blue-600" />
                  Km Attuali *
                </label>
                <input 
                  type="number"
                  required
                  placeholder="Es. 85000"
                  value={initialKm}
                  onChange={(e) => setInitialKm(e.target.value ? Number(e.target.value) : '')}
                  className="w-full bg-[#f8fafc] border border-slate-200 text-xs font-black px-3 py-2 rounded-xl focus:border-blue-600 outline-hidden"
                />
              </div>
            </div>

            {/* Dettagli avanzati gomme e olio (se aperti) */}
            {showAdvancedSpecs && (
              <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in fade-in duration-150">
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex flex-col gap-2">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Disc className="w-3.5 h-3.5 text-blue-600" />
                    Pressione Pneumatici (bar)
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <span className="text-[10px] text-slate-500 font-semibold">Ant:</span>
                      <input 
                        type="number" 
                        step="0.1" 
                        value={technicalSpecs.tirePressureFrontBar || 2.3} 
                        onChange={(e) => setTechnicalSpecs({...technicalSpecs, tirePressureFrontBar: parseFloat(e.target.value) || 2.3})}
                        className="w-full bg-white text-xs font-bold p-1 rounded border border-slate-200"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-semibold">Post:</span>
                      <input 
                        type="number" 
                        step="0.1" 
                        value={technicalSpecs.tirePressureRearBar || 2.2} 
                        onChange={(e) => setTechnicalSpecs({...technicalSpecs, tirePressureRearBar: parseFloat(e.target.value) || 2.2})}
                        className="w-full bg-white text-xs font-bold p-1 rounded border border-slate-200"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-semibold">Carico:</span>
                      <input 
                        type="number" 
                        step="0.1" 
                        value={technicalSpecs.tirePressureLoadedBar || 2.6} 
                        onChange={(e) => setTechnicalSpecs({...technicalSpecs, tirePressureLoadedBar: parseFloat(e.target.value) || 2.6})}
                        className="w-full bg-white text-xs font-bold p-1 rounded border border-slate-200"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex flex-col gap-2">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Droplet className="w-3.5 h-3.5 text-amber-600" />
                    Olio Motore Consigliato
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-slate-500 font-semibold">Gradazione:</span>
                      <input 
                        type="text" 
                        value={technicalSpecs.recommendedOil || (targetYearNum < 2005 ? '10W-40 ACEA A3/B4' : '5W-30 ACEA C3')} 
                        onChange={(e) => setTechnicalSpecs({...technicalSpecs, recommendedOil: e.target.value})}
                        className="w-full bg-white text-xs font-bold p-1 rounded border border-slate-200"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-semibold">Capacità (L):</span>
                      <input 
                        type="number" 
                        step="0.1" 
                        value={technicalSpecs.oilCapacityLiters || 4.2} 
                        onChange={(e) => setTechnicalSpecs({...technicalSpecs, oilCapacityLiters: parseFloat(e.target.value) || 4.2})}
                        className="w-full bg-white text-xs font-bold p-1 rounded border border-slate-200"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 4. FOTO DEL VEICOLO (COMPATTO, NELLA STESSA SCHERMATA) */}
          <div className="bg-[#f8fafc] border border-[#e2e8f0] p-4 rounded-2xl flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-[#0f172a] tracking-wider flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-blue-600" />
                4. Foto Reale del Veicolo ({brand || 'Auto'} {model || ''})
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fetchPhotosForVehicle(brand, model, targetYearNum)}
                  disabled={isSearchingPhotos || !brand.trim()}
                  className="text-[11px] font-bold text-slate-700 hover:text-blue-700 bg-white border border-[#cbd5e1] px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                >
                  {isSearchingPhotos ? <Loader2 className="w-3 h-3 animate-spin text-blue-600" /> : <RefreshCw className="w-3 h-3 text-blue-600" />}
                  <span>Aggiorna Foto</span>
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
                  className="text-[11px] font-bold text-blue-600 bg-white border border-[#cbd5e1] hover:bg-blue-50 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Upload className="w-3 h-3" />
                  <span>{isOptimizing ? 'Caricamento...' : 'Carica Foto'}</span>
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="w-32 h-20 rounded-xl overflow-hidden border border-slate-200 shrink-0 bg-slate-100 shadow-2xs relative">
                <img 
                  src={photoUrl} 
                  alt="Anteprima Auto" 
                  className="w-full h-full object-cover"
                />
              </div>

              {realPhotos.length > 0 ? (
                <div className="flex-1 flex gap-2 overflow-x-auto p-1 max-w-full">
                  {realPhotos.slice(0, 6).map((photo, idx) => (
                    <button
                      key={photo.url || idx}
                      type="button"
                      onClick={() => setPhotoUrl(photo.url)}
                      className={`w-20 h-16 rounded-lg overflow-hidden border shrink-0 relative cursor-pointer transition-all ${
                        photoUrl === photo.url ? 'ring-2 ring-blue-600 border-transparent shadow-xs' : 'border-slate-200 hover:opacity-80'
                      }`}
                    >
                      <img src={photo.url} alt="Foto" className="w-full h-full object-cover" />
                      {photoUrl === photo.url && (
                        <div className="absolute top-1 right-1 bg-blue-600 text-white rounded-full p-0.5">
                          <Check className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400">
                  Foto reale estratta automaticamente dagli archivi storici. Puoi cambiarla o caricarne una personalizzata.
                </p>
              )}
            </div>
          </div>

          {/* FOOTER ACTIONS */}
          <div className="pt-2 border-t border-[#e2e8f0] flex items-center justify-between gap-3 sticky bottom-0 bg-white/95 backdrop-blur-xs py-2">
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 px-4 py-2.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Annulla
            </button>

            <button
              type="submit"
              id="btn-save-vehicle"
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{isEditing ? 'Salva Modifiche' : 'Conferma & Salva Veicolo'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
