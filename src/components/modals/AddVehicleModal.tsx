import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  X, 
  ArrowLeft,
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
  ArrowRight,
  Image as ImageIcon,
  ExternalLink,
  Plus
} from 'lucide-react';
import { Vehicle, FuelType } from '../../types';
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
  searchMotorizationsFuzzy
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
  const motorizationContainerRef = useRef<HTMLDivElement | null>(null);

  // Manual Core Fields
  const [brand, setBrand] = useState(vehicleToEdit?.brand || '');
  const [model, setModel] = useState(vehicleToEdit?.model || '');
  const [plate, setPlate] = useState(vehicleToEdit?.plate || '');
  const [regDate, setRegDate] = useState(vehicleToEdit?.registrationDate || new Date().toISOString().split('T')[0]);

  // Technical & Specification Fields (Autofilled via Catalog/AI & editable)
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

  // Real Photos State (Wikipedia & Wikimedia Commons)
  const [realPhotos, setRealPhotos] = useState<RealVehiclePhoto[]>([]);
  const [isSearchingPhotos, setIsSearchingPhotos] = useState(false);
  const [photoSearchQuery, setPhotoSearchQuery] = useState('');
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);

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
  const [showMotorizationDropdown, setShowMotorizationDropdown] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);

  // Sync state when vehicleToEdit or isOpen changes
  useEffect(() => {
    if (isOpen) {
      const initialBrand = vehicleToEdit?.brand || '';
      const initialModel = vehicleToEdit?.model || '';
      const initialPlate = vehicleToEdit?.plate || '';
      const initialRegDate = vehicleToEdit?.registrationDate || new Date().toISOString().split('T')[0];

      setBrand(initialBrand);
      setModel(initialModel);
      setPlate(initialPlate);
      setRegDate(initialRegDate);
      setFuelType(vehicleToEdit?.fuelType || 'Diesel');
      setMotorization(vehicleToEdit?.motorization || '');
      setTankCapacity(vehicleToEdit?.tankCapacity ?? 50);
      setBatteryCapacity(vehicleToEdit?.batteryCapacity ?? '');
      setSecondaryTankCapacity(vehicleToEdit?.secondaryTankCapacity ?? '');
      setPowerCv(vehicleToEdit?.powerCv ?? '');
      setPowerKw(vehicleToEdit?.powerKw ?? '');
      setInitialKm(vehicleToEdit?.initialKm ?? 0);
      
      const defaultInitialPhoto = vehicleToEdit?.photoUrl || 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=1000&auto=format&fit=crop&q=80';
      setPhotoUrl(defaultInitialPhoto);
      setCustomUrlInput('');
      setShowUrlInput(false);
      setAiStatusMessage(null);
      setAiMotorizations([]);
      setAiGenerationInfo('');
      setSelectedFuelFilter('all');
      setShowBrandDropdown(false);
      setShowModelDropdown(false);
      setShowMotorizationDropdown(false);
      setPhotoSearchQuery('');

      if (initialBrand.trim() && initialModel.trim()) {
        const yr = initialRegDate ? initialRegDate.split('-')[0] : '';
        fetchPhotosForVehicle(initialBrand, initialModel, yr);
        // Trigger motorizations lookup automatically
        triggerLookup(initialBrand, initialModel, yr, initialPlate, false);
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
      if (motorizationContainerRef.current && !motorizationContainerRef.current.contains(e.target as Node)) {
        setShowMotorizationDropdown(false);
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
    if (!brand.trim() && !model.trim()) return { matchedForYear: [], otherYears: [], all: [] };
    if (brand.trim() && model.trim()) {
      return getMotorizationsForModelAndYear(brand, model, yearInfo.year || undefined);
    }
    // If only brand is selected, aggregate all motorizations from all models of that brand
    if (brand.trim() && !model.trim()) {
      const models = getModelsForBrand(brand);
      const allBrandMots: (CarMotorization & { modelName?: string })[] = [];
      models.forEach(m => {
        m.motorizations.forEach(mot => {
          allBrandMots.push({ ...mot, modelName: m.name });
        });
      });
      return {
        matchedForYear: allBrandMots,
        otherYears: [],
        all: allBrandMots
      };
    }
    return { matchedForYear: [], otherYears: [], all: [] };
  }, [brand, model, yearInfo.year]);

  // Unified available motorizations list (combining AI results + local catalog matching)
  const allAvailableMotorizations = useMemo(() => {
    const list: (CarMotorization & { brandName?: string; modelName?: string })[] = [];
    const seenNames = new Set<string>();

    const addMotorization = (m: CarMotorization & { brandName?: string; modelName?: string }) => {
      const norm = `${m.brandName || ''} ${m.modelName || ''} ${m.name}`.toLowerCase().trim();
      if (!seenNames.has(norm)) {
        seenNames.add(norm);
        list.push(m);
      }
    };

    // 1. AI Motorizations if fetched
    aiMotorizations.forEach(addMotorization);

    // 2. Year-matched motorizations from local database
    motorizationGroups.matchedForYear.forEach(addMotorization);

    // 3. Other years motorizations from local database
    motorizationGroups.otherYears.forEach(addMotorization);

    // 4. If still empty, generate standard generic motorizations for brand and/or model
    if (list.length === 0 && (brand.trim() || model.trim())) {
      const generic = generateGenericMotorizationsForBrandModel(brand, model, yearInfo.year || undefined);
      generic.forEach(addMotorization);
    }

    return list;
  }, [aiMotorizations, motorizationGroups, brand, model, yearInfo.year]);

  // Filtered list based on fuel filter and/or search text in dropdown
  const filteredMotorizations = useMemo(() => {
    let result = allAvailableMotorizations;

    // Fuel filter inside dropdown
    if (selectedFuelFilter === 'Diesel') {
      result = result.filter(m => m.fuelType.includes('Diesel'));
    } else if (selectedFuelFilter === 'Benzina') {
      result = result.filter(m => m.fuelType.includes('Benzina') && !m.fuelType.includes('GPL') && !m.fuelType.includes('Metano') && !m.fuelType.includes('PHEV') && !m.fuelType.includes('Hybrid'));
    } else if (selectedFuelFilter === 'Hybrid') {
      result = result.filter(m => m.fuelType.includes('Hybrid') || m.fuelType.includes('PHEV'));
    } else if (selectedFuelFilter === 'Elettrica (BEV)') {
      result = result.filter(m => m.fuelType.includes('Elettrica') || m.fuelType.includes('BEV'));
    } else if (selectedFuelFilter === 'GPL/Metano') {
      result = result.filter(m => m.fuelType.includes('GPL') || m.fuelType.includes('Metano'));
    }

    // Text search if user is typing
    if (motorization.trim()) {
      const q = motorization.toLowerCase().trim();
      const exactMatch = result.some(m => m.name.toLowerCase().trim() === q);
      if (!exactMatch) {
        const matches = result.filter(m => {
          const combined = `${m.brandName || ''} ${m.modelName || ''} ${m.name} ${m.fuelType} ${m.cv}cv ${m.displacementCc || ''} ${m.generation || ''} ${m.years || ''}`.toLowerCase();
          return combined.includes(q);
        });
        if (matches.length > 0) {
          result = matches;
        } else {
          // If no matches in current brand/model, perform global fuzzy search
          const fuzzy = searchMotorizationsFuzzy(q, yearInfo.year || undefined);
          if (fuzzy.length > 0) {
            result = fuzzy.map(f => ({
              ...f.motorization,
              brandName: f.brand,
              modelName: f.model
            }));
          }
        }
      }
    } else if (result.length === 0) {
      // If nothing selected and dropdown opened, show global popular motorizations
      const fuzzy = searchMotorizationsFuzzy('TDI JTDm TSI Hybrid MultiJet', yearInfo.year || undefined);
      if (fuzzy.length > 0) {
        result = fuzzy.map(f => ({
          ...f.motorization,
          brandName: f.brand,
          modelName: f.model
        }));
      }
    }

    return result;
  }, [allAvailableMotorizations, selectedFuelFilter, motorization, yearInfo.year]);

  /**
   * Searches and loads real vehicle photos dynamically from Wikipedia/Wikimedia Commons
   */
  const fetchPhotosForVehicle = async (
    targetBrand: string,
    targetModel: string,
    targetYear?: string | number,
    targetGen?: string,
    customQuery?: string
  ) => {
    if (!targetBrand.trim() && !targetModel.trim() && !customQuery?.trim()) return;

    try {
      setIsSearchingPhotos(true);
      const photos = await searchRealVehiclePhotos(
        targetBrand,
        targetModel,
        targetYear,
        targetGen,
        customQuery
      );

      if (photos.length > 0) {
        setRealPhotos(photos);
        // If user hasn't uploaded a custom photo or we're on default, switch to top real photo
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
   * Trigger 360° AI Vehicle Lookup for ANY vehicle to get all motorizations
   */
  const triggerLookup = async (
    targetBrand: string,
    targetModel: string,
    targetYearOrDate?: string | number,
    targetPlate?: string,
    autoApplyFirst: boolean = false
  ) => {
    if (!targetBrand.trim() || !targetModel.trim()) return;

    const yrStr = targetYearOrDate ? String(targetYearOrDate).split('-')[0] : '';
    const query = `${targetBrand} ${targetModel} ${yrStr ? 'anno ' + yrStr : ''}`.trim();

    try {
      setIsAiLoading(true);
      setAiLoadingPhase(`Ricerca di tutte le motorizzazioni per ${targetBrand} ${targetModel}...`);

      const res = await lookupVehicleWithAI(query, targetBrand, targetModel, yrStr, targetPlate || plate);

      if (res.generation) setAiGenerationInfo(res.generation);

      if (res.availableMotorizations && res.availableMotorizations.length > 0) {
        setAiMotorizations(res.availableMotorizations);
      }

      // Populate real authentic photos
      if (res.realPhotos && res.realPhotos.length > 0) {
        setRealPhotos(res.realPhotos);
        if (res.suggestedPhotoUrl && (!photoUrl || photoUrl.includes('unsplash.com/photo-1617814076367') || !isEditing)) {
          setPhotoUrl(res.suggestedPhotoUrl);
        }
      } else {
        fetchPhotosForVehicle(res.brand || targetBrand, res.model || targetModel, yrStr, res.generation);
      }

      if (autoApplyFirst && res.availableMotorizations && res.availableMotorizations.length > 0) {
        applyMotorization(res.availableMotorizations[0]);
      } else if (autoApplyFirst) {
        if (res.motorization) setMotorization(res.motorization);
        if (res.fuelType) setFuelType(res.fuelType);
        setTankCapacity(res.tankCapacity ?? 50);
        setBatteryCapacity(res.batteryCapacity ?? '');
        setSecondaryTankCapacity(res.secondaryTankCapacity ?? '');
        if (res.powerCv) {
          setPowerCv(res.powerCv);
          setPowerKw(res.powerKw || Math.round(res.powerCv / 1.35962));
        }
      }

      const count = res.availableMotorizations?.length || 0;
      setAiStatusMessage({
        text: `Identificate ${count > 0 ? count + ' motorizzazioni' : 'specifiche'} per ${res.brand || targetBrand} ${res.model || targetModel}${res.generation ? ` (${res.generation})` : ''}.`,
        type: 'success'
      });
      setTimeout(() => setAiStatusMessage(null), 5000);

    } catch (err) {
      console.warn('Errore auto-lookup motorizzazioni:', err);
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

  // Debounced auto-search for motorizations when Brand and Model are specified
  useEffect(() => {
    if (!isOpen) return;
    if (brand.trim().length >= 2 && model.trim().length >= 1) {
      const timer = setTimeout(() => {
        const yr = regDate ? regDate.split('-')[0] : (plateEstimation?.year ? String(plateEstimation.year) : undefined);
        triggerLookup(brand, model, yr, plate, false);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [brand, model, regDate, isOpen]);

  const handleBrandChange = (newBrand: string) => {
    setBrand(newBrand);
    setAiMotorizations([]);
    setAiGenerationInfo('');
    if (newBrand.trim() && model.trim()) {
      fetchPhotosForVehicle(newBrand, model, yearInfo.year || plateEstimation?.year);
    }
  };

  const handleModelChange = (newModel: string) => {
    setModel(newModel);
    setAiMotorizations([]);
    setAiGenerationInfo('');
    if (brand.trim() && newModel.trim()) {
      fetchPhotosForVehicle(brand, newModel, yearInfo.year || plateEstimation?.year);
    }
  };

  const handleRegDateChange = (newDate: string) => {
    setRegDate(newDate);
    setAiMotorizations([]);
    const yr = newDate ? parseInt(newDate.split('-')[0], 10) : undefined;
    if (brand.trim() && model.trim()) {
      fetchPhotosForVehicle(brand, model, yr);
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
        fetchPhotosForVehicle(brand, model, est.year);
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
    if (m.brandName && (!brand.trim() || brand.trim().toLowerCase() !== m.brandName.toLowerCase())) {
      setBrand(m.brandName);
    }
    if (m.modelName && (!model.trim() || model.trim().toLowerCase() !== m.modelName.toLowerCase())) {
      setModel(m.modelName);
    }
    setMotorization(m.name);
    setFuelType(m.fuelType);
    setTankCapacity(m.tankCapacity);
    setBatteryCapacity(m.batteryCapacity ?? '');
    setSecondaryTankCapacity(m.secondaryTankCapacity ?? '');
    setPowerCv(m.cv);
    setPowerKw(m.kw);
    setShowMotorizationDropdown(false);

    const activeBrand = m.brandName || brand;
    const activeModel = m.modelName || model;
    const targetYear = m.years || yearInfo.year || plateEstimation?.year;
    fetchPhotosForVehicle(activeBrand, activeModel, targetYear, m.generation);

    setAiStatusMessage({
      text: `Motorizzazione applicata: ${m.name} (${m.cv} CV / ${m.kw} kW, ${m.fuelType}).`,
      type: 'success'
    });
    setTimeout(() => setAiStatusMessage(null), 4000);
  };

  // Trigger 360° AI Vehicle Lookup manually
  const handleAiSearch = async () => {
    const targetYear = yearInfo.year || plateEstimation?.year;
    const regYear = targetYear ? String(targetYear) : (regDate ? regDate.split('-')[0] : undefined);
    await triggerLookup(brand, model, regYear, plate, true);
  };

  // Custom photo query search (e.g. "Fiat Punto 2007 grigia", "Golf 5 nera", "Alfa 147 rossa")
  const handleCustomPhotoSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = photoSearchQuery.trim() || `${brand} ${model} ${yearInfo.year || ''}`.trim();
    if (!query) return;
    fetchPhotosForVehicle(brand, model, yearInfo.year || undefined, aiGenerationInfo, query);
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

  // Apply custom URL
  const handleApplyCustomUrl = () => {
    if (!customUrlInput.trim()) return;
    setPhotoUrl(customUrlInput.trim());
    setShowUrlInput(false);
    setAiStatusMessage({
      text: 'Foto da URL applicata con successo!',
      type: 'success'
    });
    setTimeout(() => setAiStatusMessage(null), 3000);
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

  if (!isOpen) return null;

  const isPHEV = fuelType === 'Plug-in Hybrid (PHEV)';
  const isBEV = fuelType === 'Elettrica (BEV)';
  const isLPG = fuelType === 'GPL (Benzina + GPL)' || fuelType === 'GPL';
  const isCNG = fuelType === 'Metano (Benzina + Metano)' || fuelType === 'Metano';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden font-['Plus_Jakarta_Sans',sans-serif] border border-[#e2e8f0]">
        
        {/* HEADER */}
        <div className="px-4 sm:px-5 py-4 border-b border-[#e2e8f0] flex items-center justify-between gap-2 bg-[#fafbfc]">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-blue-50 text-[#2563eb] border border-blue-100 flex items-center justify-center shadow-2xs shrink-0">
              <Car className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base md:text-lg font-black text-[#0f172a] leading-tight truncate">
                  {isEditing ? 'Modifica Veicolo' : 'Aggiungi Nuovo Veicolo'}
                </h3>
                <span className="text-[10px] font-extrabold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full border border-blue-200 shrink-0 hidden sm:inline">
                  Supporto 360°
                </span>
              </div>
              <p className="text-xs text-[#64748b] mt-0.5 truncate">
                {isEditing ? 'Aggiorna i dati della scheda tecnica' : 'Compatibile con qualsiasi marca, modello, anno e foto reali'}
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

        {/* BODY */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto flex flex-col gap-5">

          {/* 1. SEZIONE DATI PRINCIPALI: MARCA, MODELLO, TARGA, IMMATRICOLAZIONE */}
          <div className="bg-white border border-[#e2e8f0] p-4 rounded-2xl flex flex-col gap-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase text-[#0f172a] tracking-wider flex items-center gap-1.5">
                <Car className="w-3.5 h-3.5 text-[#2563eb]" />
                Dati Principali del Veicolo (Qualsiasi Marca / Modello)
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
                    placeholder="Scrivi o scegli una marca (es. Fiat, Audi, Toyota, Iveco...)"
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
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-semibold hover:bg-blue-50 text-[#0f172a] rounded-lg transition-colors flex items-center justify-between cursor-pointer"
                      >
                        <span>{b}</span>
                        {POPULAR_BRANDS.includes(b) && (
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-medium">Popolare</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {/* Quick Brand Chips */}
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
                    placeholder="Scrivi qualsiasi modello (es. Punto, Golf, Yaris, Daily...)"
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
                    <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                      Immatricolazione ~{plateEstimation.year}
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
                    <span className="text-[10px] font-extrabold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                      Anno {yearInfo.year}
                    </span>
                  )}
                </div>
                <input 
                  type="date"
                  value={regDate}
                  onChange={(e) => handleRegDateChange(e.target.value)}
                  className="w-full bg-[#f8fafc] border border-[#cbd5e1] focus:bg-white text-xs font-bold px-3 py-2.5 rounded-xl focus:border-[#2563eb] focus:ring-2 focus:ring-blue-100 outline-hidden"
                />
              </div>

            </div>

            {/* QUICK YEAR SELECTION HELPER */}
            <div className="bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs text-slate-700">
              <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                <CalendarCheck className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Anno di riferimento: <strong className="text-blue-900">{yearInfo.year || 'Non impostato'}</strong></span>
              </div>
              <div className="flex items-center gap-1 flex-wrap text-[10px] font-bold">
                {[2004, 2007, 2010, 2013, 2016, 2019, 2021, 2023, 2024, 2025, 2026].map((yr) => (
                  <button
                    key={yr}
                    type="button"
                    onClick={() => handleRegDateChange(`${yr}-06-15`)}
                    className={`px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                      yearInfo.year === yr
                        ? 'bg-blue-600 text-white border-blue-600 font-black'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-blue-50 hover:text-blue-700'
                    }`}
                  >
                    {yr}
                  </button>
                ))}
              </div>
            </div>

            {/* PULSANTE CERCA SCHEDA & FOTO CON AI (360°) */}
            <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="text-xs text-slate-500 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                <span>
                  {aiLoadingPhase || `Incrocia ${brand || 'Marca'} + ${model || 'Modello'} + Anno ${yearInfo.year || ''} per schede tecniche e foto reali.`}
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
                    <span>{aiLoadingPhase || 'Analisi 360° in corso...'}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Cerca Scheda Tecnica e Foto Reali (AI 360°)</span>
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

          {/* SEZIONE DETTAGLI TECNICI & MOTORIZZAZIONE */}
          <div className="bg-white border border-[#e2e8f0] p-4 rounded-2xl flex flex-col gap-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase text-[#0f172a] tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-[#2563eb]" />
                Specifiche Tecniche & Motorizzazione
              </span>
              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
                Selezione a tendina o personalizzabile
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* MOTORIZZAZIONE / ALLESTIMENTO (DROPDOWN A TENDINA AD ALTA DEFINIZIONE) */}
              <div ref={motorizationContainerRef} className="relative flex flex-col gap-1.5 sm:col-span-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#0f172a] flex items-center gap-1.5">
                    Motorizzazione & Allestimento *
                  </label>
                  {allAvailableMotorizations.length > 0 && (
                    <span className="text-[10px] font-black text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md shadow-2xs">
                      {allAvailableMotorizations.length} versioni trovate
                    </span>
                  )}
                </div>

                <div className="relative">
                  <input 
                    type="text"
                    placeholder="Scegli dalla tendina o digita (es. 1.6 TDI 120 CV, 2.0 Hybrid 184 CV, Dual Motor...)"
                    value={motorization}
                    onFocus={() => setShowMotorizationDropdown(true)}
                    onChange={(e) => {
                      setMotorization(e.target.value);
                      setShowMotorizationDropdown(true);
                    }}
                    className="w-full bg-[#f8fafc] border border-[#cbd5e1] focus:bg-white text-xs font-bold px-3 py-2.5 rounded-xl focus:border-[#2563eb] focus:ring-2 focus:ring-blue-100 outline-hidden transition-all pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowMotorizationDropdown(!showMotorizationDropdown)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                    title="Mostra / nascondi elenco motorizzazioni"
                  >
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showMotorizationDropdown ? 'rotate-180 text-blue-600' : ''}`} />
                  </button>
                </div>

                {/* Motorization Dropdown Menu */}
                {showMotorizationDropdown && (
                  <div className="absolute left-0 right-0 top-[68px] z-50 bg-white border border-[#cbd5e1] rounded-2xl shadow-2xl max-h-88 overflow-y-auto p-2.5 divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-150">
                    
                    {/* Fuel Filters Toolbar */}
                    <div className="pb-2.5 flex items-center justify-between gap-1 overflow-x-auto text-[10px] font-bold">
                      <div className="flex items-center gap-1">
                        {[
                          { key: 'all', label: 'Tutte' },
                          { key: 'Diesel', label: 'Diesel' },
                          { key: 'Benzina', label: 'Benzina' },
                          { key: 'Hybrid', label: 'Ibrida / PHEV' },
                          { key: 'Elettrica (BEV)', label: 'Elettrica' },
                          { key: 'GPL/Metano', label: 'GPL / Metano' }
                        ].map((f) => (
                          <button
                            key={f.key}
                            type="button"
                            onClick={() => setSelectedFuelFilter(f.key)}
                            className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer whitespace-nowrap ${
                              selectedFuelFilter === f.key 
                                ? 'bg-blue-600 text-white border-blue-600 font-black shadow-2xs' 
                                : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                            }`}
                          >
                            {f.label}
                          </button>
                        ))}
                      </div>

                      <span className="text-[10px] font-medium text-slate-400 hidden sm:inline shrink-0">
                        {filteredMotorizations.length} riscontri
                      </span>
                    </div>

                    {/* Motorizations Options List */}
                    <div className="pt-2 flex flex-col gap-1.5">
                      {isAiLoading && (
                        <div className="p-3.5 text-center text-xs text-blue-700 font-bold bg-blue-50/70 rounded-xl flex items-center justify-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                          <span>Ricerca e analisi motorizzazioni in corso...</span>
                        </div>
                      )}

                      {filteredMotorizations.length > 0 ? (
                        filteredMotorizations.map((m, idx) => {
                          const isSelected = motorization.trim().toLowerCase() === m.name.trim().toLowerCase();
                          const isElectric = m.fuelType.includes('Elettrica') || m.fuelType.includes('BEV');
                          const isHyb = m.fuelType.includes('Hybrid') || m.fuelType.includes('Ibrida') || m.fuelType.includes('PHEV');
                          const isGas = m.fuelType.includes('GPL') || m.fuelType.includes('Metano');
                          const isDies = m.fuelType.includes('Diesel');

                          return (
                            <button
                              key={m.name + idx}
                              type="button"
                              onClick={() => applyMotorization(m)}
                              className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                                isSelected
                                  ? 'bg-blue-50/80 border-blue-400 ring-2 ring-blue-200 shadow-2xs'
                                  : 'bg-white border-slate-200 hover:border-blue-300 hover:bg-slate-50 text-[#0f172a]'
                              }`}
                            >
                              <div className="flex-1 min-w-0">
                                {/* Title & Generation line */}
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  {(m.brandName || m.modelName) && (
                                    <span className="text-[9.5px] font-black px-1.5 py-0.5 bg-blue-100 text-blue-900 border border-blue-200 rounded">
                                      {[m.brandName, m.modelName].filter(Boolean).join(' ')}
                                    </span>
                                  )}
                                  <span className="font-black text-xs text-[#0f172a]">{m.name}</span>
                                  {m.generation && (
                                    <span className="text-[9.5px] font-bold px-1.5 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded">
                                      {m.generation}
                                    </span>
                                  )}
                                  {m.years && (
                                    <span className="text-[9px] font-medium px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">
                                      {m.years}
                                    </span>
                                  )}
                                </div>

                                {/* Specs badges */}
                                <div className="flex items-center gap-1.5 mt-1.5 text-[10.5px] flex-wrap">
                                  <span className={`px-1.5 py-0.5 rounded font-bold border ${
                                    isElectric 
                                      ? 'bg-amber-50 text-amber-900 border-amber-200' 
                                      : isHyb 
                                        ? 'bg-emerald-50 text-emerald-900 border-emerald-200' 
                                        : isGas 
                                          ? 'bg-teal-50 text-teal-900 border-teal-200' 
                                          : isDies 
                                            ? 'bg-blue-50 text-blue-900 border-blue-200' 
                                            : 'bg-slate-100 text-slate-700 border-slate-200'
                                  }`}>
                                    {m.fuelType}
                                  </span>

                                  {m.displacementCc && (
                                    <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-semibold">
                                      {m.displacementCc} cc
                                    </span>
                                  )}

                                  {m.tankCapacity > 0 && (
                                    <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-semibold">
                                      Serbatoio: {m.tankCapacity}L
                                    </span>
                                  )}

                                  {m.batteryCapacity && (
                                    <span className="bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded font-bold border border-amber-200">
                                      ⚡ Batt: {m.batteryCapacity} kWh
                                    </span>
                                  )}

                                  {m.secondaryTankCapacity && (
                                    <span className="bg-teal-100 text-teal-900 px-1.5 py-0.5 rounded font-bold border border-teal-200">
                                      Gas: {m.secondaryTankCapacity} L/Kg
                                    </span>
                                  )}

                                  {m.avgConsumptionL100km && (
                                    <span className="bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded font-bold border border-emerald-200">
                                      WLTP: {m.avgConsumptionL100km} L/100km
                                    </span>
                                  )}

                                  {m.avgConsumptionKwh100km && (
                                    <span className="bg-amber-50 text-amber-800 px-1.5 py-0.5 rounded font-bold border border-amber-200">
                                      WLTP: {m.avgConsumptionKwh100km} kWh/100km
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Power & Selection check */}
                              <div className="flex items-center gap-2 shrink-0">
                                <div className="text-right">
                                  <span className="text-xs font-black bg-slate-900 text-white px-2.5 py-1 rounded-lg shadow-2xs block whitespace-nowrap">
                                    {m.cv} CV
                                  </span>
                                  <span className="text-[10px] font-bold text-slate-500 block mt-0.5">
                                    {m.kw} kW
                                  </span>
                                </div>

                                {isSelected && (
                                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-2xs">
                                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                                  </div>
                                )}
                              </div>
                            </button>
                          );
                        })
                      ) : (
                        <div className="p-4 text-center text-xs text-slate-500 bg-slate-50 rounded-xl">
                          Nessuna motorizzazione trovata per questo filtro. Digita liberamente nel campo di testo oppure premi &quot;Cerca Scheda Tecnica e Foto Reali&quot;.
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Applied Motorization Summary Badge & Quick Chips */}
                {motorization && !showMotorizationDropdown && (
                  <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-2.5 flex items-center justify-between gap-3 text-xs animate-in fade-in">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <span className="font-black text-blue-950 block truncate">{motorization}</span>
                        <div className="flex items-center gap-2 text-[10.5px] text-blue-800 font-semibold mt-0.5 flex-wrap">
                          <span>{fuelType}</span>
                          {powerCv && <span>• {powerCv} CV ({powerKw || Math.round(Number(powerCv) * 0.7355)} kW)</span>}
                          {tankCapacity && <span>• Serbatoio {tankCapacity}L</span>}
                          {batteryCapacity && <span>• Batteria {batteryCapacity} kWh</span>}
                          {secondaryTankCapacity && <span>• Gas {secondaryTankCapacity} L/Kg</span>}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowMotorizationDropdown(true)}
                      className="text-blue-700 hover:text-blue-900 font-bold text-[11px] underline shrink-0 cursor-pointer"
                    >
                      Cambia
                    </button>
                  </div>
                )}

                {/* Quick Motorization Chips under the field */}
                {allAvailableMotorizations.length > 0 && !showMotorizationDropdown && (
                  <div className="flex flex-wrap gap-1 mt-0.5">
                    {allAvailableMotorizations.slice(0, 4).map((m) => (
                      <button
                        key={m.name}
                        type="button"
                        onClick={() => applyMotorization(m)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                          motorization.toLowerCase() === m.name.toLowerCase()
                            ? 'bg-blue-100 text-blue-800 border-blue-300'
                            : 'bg-[#f1f5f9] text-[#64748b] border-transparent hover:bg-slate-200'
                        }`}
                      >
                        {m.name.length > 30 ? `${m.name.slice(0, 30)}...` : m.name}
                      </button>
                    ))}
                  </div>
                )}
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
                    {isPHEV ? 'Capienza per il motore a combustione' : 'Volume totale serbatoio'}
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

          {/* 3. SEZIONE FOTO REALI DEL VEICOLO (WIKIPEDIA & WIKIMEDIA ARCHIVE) */}
          <div className="bg-[#f8fafc] border border-[#e2e8f0] p-4 rounded-2xl flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-[#2563eb]" />
                <span className="text-xs font-bold text-[#0f172a]">
                  Foto Reale del Veicolo
                </span>
                <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded">
                  Foto Autentiche
                </span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Trova foto reali button */}
                <button
                  type="button"
                  onClick={() => fetchPhotosForVehicle(brand, model, yearInfo.year || undefined, aiGenerationInfo)}
                  disabled={isSearchingPhotos || (!brand.trim() && !model.trim())}
                  className="text-[11px] font-bold text-slate-700 hover:text-blue-700 bg-white border border-[#cbd5e1] hover:bg-blue-50 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  {isSearchingPhotos ? (
                    <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
                  ) : (
                    <RefreshCw className="w-3 h-3 text-blue-600" />
                  )}
                  <span>{isSearchingPhotos ? 'Ricerca...' : 'Trova Foto Reali'}</span>
                </button>

                {/* Upload custom file */}
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
                  <span>{isOptimizing ? 'Caricamento...' : 'Carica File'}</span>
                </button>

                {/* Direct Link toggle */}
                <button
                  type="button"
                  onClick={() => setShowUrlInput(!showUrlInput)}
                  className="text-[11px] font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                >
                  Link URL
                </button>
              </div>
            </div>

            {/* Custom URL Input Field */}
            {showUrlInput && (
              <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200">
                <input
                  type="url"
                  placeholder="Incolla l'URL diretto dell'immagine..."
                  value={customUrlInput}
                  onChange={(e) => setCustomUrlInput(e.target.value)}
                  className="flex-1 text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg outline-hidden focus:border-blue-600"
                />
                <button
                  type="button"
                  onClick={handleApplyCustomUrl}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  Applica
                </button>
              </div>
            )}

            {/* Live Active Photo Preview & Real Photos Gallery */}
            <div className="flex flex-col sm:flex-row items-start gap-4">
              
              {/* Main Selected Image */}
              <div className="w-full sm:w-44 h-28 rounded-xl overflow-hidden border border-[#cbd5e1] shrink-0 bg-slate-100 shadow-2xs relative group">
                <img 
                  src={photoUrl} 
                  alt="Foto Veicolo" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2 text-center">
                  <span className="text-[10px] text-white font-bold">Foto attualmente selezionata</span>
                </div>
              </div>

              {/* Real Photo Suggestions or Custom Photo Search */}
              <div className="flex-1 flex flex-col gap-2 w-full">
                
                {/* Search bar to find specific real photos */}
                <div className="flex items-center gap-1.5 w-full">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Cerca foto reali (es. colore, versione, angolazione...)"
                      value={photoSearchQuery}
                      onChange={(e) => setPhotoSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleCustomPhotoSearch();
                        }
                      }}
                      className="w-full bg-white text-xs pl-8 pr-2.5 py-1.5 rounded-lg border border-slate-200 outline-hidden focus:border-blue-600"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCustomPhotoSearch()}
                    disabled={isSearchingPhotos}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0 disabled:opacity-50"
                  >
                    {isSearchingPhotos ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Cerca Foto'}
                  </button>
                </div>

                {/* Real Photos Thumbnails Gallery */}
                {realPhotos.length > 0 ? (
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-slate-500">
                      Foto reali trovate ({realPhotos.length}) - Clicca per selezionare:
                    </span>
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
                      {realPhotos.map((p, idx) => {
                        const isCurrent = photoUrl === p.url;
                        return (
                          <button
                            key={p.url + idx}
                            type="button"
                            onClick={() => setPhotoUrl(p.url)}
                            title={p.title}
                            className={`w-16 h-12 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer relative ${
                              isCurrent 
                                ? 'border-blue-600 ring-2 ring-blue-200 shadow-xs' 
                                : 'border-slate-200 hover:border-blue-300 opacity-80 hover:opacity-100'
                            }`}
                          >
                            <img src={p.url} alt={p.title} className="w-full h-full object-cover" />
                            {isCurrent && (
                              <div className="absolute top-0.5 right-0.5 bg-blue-600 text-white p-0.5 rounded-full">
                                <Check className="w-2.5 h-2.5" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="bg-white border border-dashed border-slate-200 rounded-xl p-3 text-center text-xs text-slate-500">
                    <span>Inserisci Marca e Modello o scrivi nella barra per cercare foto reali autentiche.</span>
                  </div>
                )}

              </div>
            </div>
          </div>

        </form>

        {/* MODAL FOOTER */}
        <div className="px-5 py-4 border-t border-[#e2e8f0] bg-[#fafbfc] flex items-center justify-end">
          <button
            type="button"
            id="btn-save-vehicle"
            onClick={handleSubmit}
            className="w-full sm:w-auto bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>{isEditing ? 'Salva Modifiche' : 'Crea Scheda Veicolo'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
