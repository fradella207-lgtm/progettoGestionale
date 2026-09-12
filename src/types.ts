export type FuelType = 
  | 'Diesel'
  | 'Benzina'
  | 'Full / Mild Hybrid'
  | 'Plug-in Hybrid (PHEV)'
  | 'Elettrica (BEV)'
  | 'GPL (Benzina + GPL)'
  | 'Metano (Benzina + Metano)'
  | 'GPL'
  | 'Metano';

export type EnergySourceType = 'fuel' | 'electricity' | 'lpg' | 'cng';

export interface RefuelRecord {
  id: string;
  date: string;
  km: number;
  quantity: number; // In liters, kWh or kg
  price: number;
  type: 'full' | 'partial';
  energyType?: EnergySourceType; // Specific to dual fuel: 'fuel' (Benzina/Diesel), 'electricity' (kWh), 'lpg' (GPL), 'cng' (Metano)
  unit?: 'L' | 'kWh' | 'Kg';
  chargingPowerKw?: number; // Optional charging speed for EV/PHEV
  notes?: string;
  usageType?: string; // Optional trip classification e.g. "Lavoro", "Viaggio", "Urbano"
  receiptPhoto?: string; // Optional: Base64 data URI of the fuel/charging receipt
  receiptFileName?: string;
}

export interface MaintenanceRecord {
  id: string;
  date: string;
  km: number;
  category: string;
  description: string;
  workshop: string;
  cost: number;
  documentPhoto?: string; // Optional: Base64 data URI of the maintenance invoice/receipt
  documentFileName?: string;
  notes?: string;
}

export interface VehicleDocument {
  id: string;
  title: string;
  type: 'libretto' | 'assicurazione' | 'bollo' | 'tagliando' | 'altro' | 'other';
  category?: string;
  fileName: string;
  fileType: string;
  fileData: string; // Base64 data URI
  fileSize?: number;
  uploadDate: string;
  expiryDate?: string;
  notes?: string;
  extractedInfo?: {
    plate?: string;
    vin?: string;
    insuranceCompany?: string;
    policyNumber?: string;
    euroClass?: string;
    approvedTires?: string[];
    engineCode?: string;
    taxAmount?: number;
  };
}

export interface VehicleManualInfo {
  url?: string; // URL diretto al manuale PDF o portale ufficiale costruttore
  title: string; // es. "Manuale di Uso e Manutenzione BMW Serie 3 (2007)"
  source: string; // es. "manuals.startmycar.com", "BMW Driver's Guide", "eLum Fiat"
  pdfAvailable?: boolean;
  pages?: number;
  downloadDate?: string;
  language?: string;
  indexedChapters?: string[];
  chapters?: string[];
  rawText?: string;
  uploadedFileName?: string;
  uploadedFileType?: string;
  uploadedFileData?: string;
  fileData?: string;
  isUserUploaded?: boolean;
  lastUpdated?: string;
  keyProcedures?: {
    espAndControls?: string;
    tpmsReset?: string;
    oilAndFluids?: string;
    screenReset?: string;
    batteryAndJumpStart?: string;
    fusesAndObd?: string;
    serviceReset?: string;
  };
  fullManualSummary?: string;
}

export interface VehicleTechnicalSpecs {
  engineDisplacementCc?: number; // Cilindrata (cm³)
  powerCv?: number; // Cavalli vapore
  powerKw?: number; // Kilowatt
  torqueNm?: number; // Coppia max (Nm)
  cylinderCount?: number; // Numero cilindri / architettura
  transmission?: string; // Cambio e marce
  drivetrain?: string; // Trazione (FWD, RWD, AWD)
  euroClass?: string; // Norma antinquinamento (es. Euro 6D-Final)
  fuelCapacityLiters?: number; // Capacità serbatoio carburante
  batteryCapacityKwh?: number; // Capacità nominale/netta batteria
  wltpConsumption?: string; // Consumo medio omologato
  wltpRangeKm?: number; // Autonomia stimata
  recommendedOil?: string; // Specifica e gradazione olio motore
  oilCapacityLiters?: number; // Capacità coppa olio
  tirePressureFrontBar?: number; // Pressione anteriore (bar)
  tirePressureRearBar?: number; // Pressione posteriore (bar)
  tirePressureLoadedBar?: number; // Pressione a pieno carico (bar)
  allowedTireSizes?: string[]; // Misure pneumatici da libretto
  dimensions?: {
    lengthMm?: number;
    widthMm?: number;
    heightMm?: number;
    trunkLiters?: number;
    curbWeightKg?: number;
    towingCapacityKg?: number;
  };
  vin?: string;
  engineCode?: string;
  generation?: string;
  trimLevel?: string; // Allestimento / Variante di serie
  wheelTorqueNm?: number; // Coppia serraggio bulloni ruote (Nm)
  coolantType?: string; // Liquido refrigerante (es. G12, G13, Paraflu UP)
  brakeFluidType?: string; // Liquido freni (es. DOT 4, DOT 4 Plus, DOT 5.1)
  fuseBoxLocation?: string; // Posizione scatola fusibili abitacolo e vano motore
  timingBeltIntervalKm?: string; // Intervallo sostituzione cinghia/catena distribuzione
  infotainmentSystem?: string; // Sistema infotainment (es. MBUX, iDrive, Uconnect, MMI, Sync)
  obdPortLocation?: string; // Posizione presa diagnosi OBD2
  batteryType?: string; // Batteria avviamento (es. 12V 70Ah 760A AGM / EFB)
  ownersManualUrl?: string;
  ownersManualSource?: string;
  manualInfo?: VehicleManualInfo;
  summaryQuattroruote?: string;
  finalDrive?: 'Catena' | 'Cardano' | 'Cinghia' | 'Variatore CVT' | string; // Catena con O-Ring/X-Ring, Cardano, Cinghia dentata
  coolingType?: 'Liquido' | 'Aria' | 'Aria/Olio' | string;
  engineArchitecture?: string; // Architettura motore es. Bicilindrico a V, Boxer, CP2/CP3, 4 in linea
}

export interface AIChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  attachmentName?: string;
  attachmentType?: string;
  attachmentData?: string;
}

export interface Vehicle {
  id: string;
  vehicleType?: 'car' | 'moto'; // Distinzione tra Auto e Moto / Scooter
  brand: string;
  model: string;
  trimLevel?: string; // Allestimento es. S-line, Lounge, Pop, GT Line, Titanium, M Sport
  generation?: string; // Generazione es. "Golf VII (2012-2020)"
  plate: string;
  vin?: string; // Codice Telaio (Vehicle Identification Number - ISO 3779 standard a 17 caratteri)
  fuelType: FuelType;
  tankCapacity: number; // Liters for combustion/PHEV, or battery kWh for BEV
  batteryCapacity?: number; // kWh (for PHEV or BEV)
  secondaryTankCapacity?: number; // Liters GPL or Kg Metano for bifuel
  motorization?: string; // e.g. "1.4 eHybrid 204 CV DSG"
  driveType?: string; // e.g. "Trazione Integrale (4x4 / AWD)", "FWD", "RWD"
  differential?: string; // e.g. "Differenziale Q2", "Haldex 4Motion", "Torsen"
  powerCv?: number;
  powerKw?: number;
  registrationDate: string; // YYYY-MM-DD
  initialKm: number;
  photoUrl?: string;
  refuels: RefuelRecord[];
  maintenances: MaintenanceRecord[];
  documents?: VehicleDocument[];
  technicalSpecs?: VehicleTechnicalSpecs;
  manualInfo?: VehicleManualInfo;
  aiChatHistory?: AIChatMessage[];
  tripUsages?: Record<string, string>; // Maps tripId to classification tag (e.g. "Lavoro", "Viaggio", "Città")
  // Impianto a Gas Aftermarket (GPL / Metano installato successivamente)
  hasAftermarketGasSystem?: boolean;
  aftermarketGasType?: 'GPL' | 'Metano';
  aftermarketSystemBrand?: string;
  aftermarketTankLiters?: number;
  aftermarketInstallDate?: string;
  // Multi-Account / Shared Garage Sync (PRO Feature)
  isShared?: boolean;
  sharedGarageCode?: string;
  sharedOwnerName?: string;
  sharedOwnerEmail?: string;
  sharedRole?: 'owner' | 'member';
  sharedMembersCount?: number;
  lastSyncTimestamp?: string;
}

export interface SharedGarageMember {
  uid: string;
  name: string;
  email: string;
  role: 'owner' | 'member';
  joinedAt: string;
}

export interface SharedGarage {
  id: string; // matches share code, e.g. "GARAGE-7K9M2"
  code: string;
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  vehicleId: string;
  vehicleName: string;
  vehicle: Vehicle;
  members: SharedGarageMember[];
  allowedUids: string[];
  createdAt: string;
  updatedAt: string;
  active: boolean;
}

export interface AIAdvice {
  id: string;
  title: string;
  urgency: 'high' | 'medium' | 'ok';
  desc: string;
}

export interface AppNotification {
  id: string;
  carId?: string;
  carPlate?: string;
  title: string;
  message: string;
  type: 'alert' | 'maintenance' | 'service' | 'info';
  date: string;
  read: boolean;
}

export type AppThemeColor = 'indigo' | 'blue' | 'emerald' | 'violet' | 'amber' | 'rose' | 'slate';
export type AppThemeMode = 'light' | 'dark';
export type AppLanguage = 'it' | 'en';

export interface AppSettings {
  unitDistance: 'km' | 'mi';
  currency: '€' | '$' | '£';
  fuelPriceAlerts: boolean;
  predictiveAlerts: boolean;
  autoBackup: boolean;
  stationDisplayMode?: 'auto' | 'fuel_only' | 'ev_only' | 'all';
  themeColor?: AppThemeColor;
  themeMode?: AppThemeMode;
  language?: AppLanguage;
}

export type StationType = 'fuel' | 'ev' | 'both';

export interface FuelPriceItem {
  fuel: 'Benzina' | 'Diesel' | 'GPL' | 'Metano' | 'Benzina Special' | 'Diesel Special';
  price: number; // e.g. 1.749
  isSelf: boolean; // true for Self-Service, false for Servito
  updatedAt: string;
}

export interface EVPlugItem {
  type: 'Type 2 (AC)' | 'CCS Combo 2 (DC)' | 'CHAdeMO' | 'Tesla Supercharger';
  powerKw: number; // e.g. 22, 50, 150, 300
  pricePerKwh: number; // e.g. 0.49
  availableCount: number;
  totalCount: number;
  status: 'available' | 'busy' | 'offline';
}

export interface Station {
  id: string;
  name: string;
  brand: string;
  type: StationType; // 'fuel' | 'ev' | 'both'
  address: string;
  city: string;
  province: string;
  lat: number;
  lng: number;
  distanceKm?: number;
  isOpen24h?: boolean;
  hasCarWash?: boolean;
  hasBar?: boolean;
  hasShop?: boolean;
  fuelPrices?: FuelPriceItem[];
  evPlugs?: EVPlugItem[];
  operatorName?: string;
  rating?: number;
  highway?: string; // e.g. "A1 Milano-Napoli km 45"
  isHighway?: boolean;
  highwayName?: string; // e.g. "A1 Milano-Napoli", "A4 Torino-Trieste"
  highwayDirection?: string; // e.g. "Dir. Sud (Bologna/Firenze/Roma)", "Dir. Nord (Milano/Brennero)", "Dir. Est (Verona/Venezia)", "Dir. Ovest (Torino)"
  highwayKm?: string; // e.g. "km 156.5"
  isFavorite?: boolean;
  priceHistory?: StationPriceHistoryPoint[];
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  plan: string;
  syncStatus: 'synced' | 'local_only' | 'syncing';
  memberSince: string;
  provider: 'google' | 'email' | 'guest';
  avatarUrl?: string;
  isLoggedIn: boolean;
  tier?: UserTier;
}

export type UserTier = 'FREE' | 'PRO';

export interface StationPriceHistoryPoint {
  date: string; // YYYY-MM-DD
  price: number;
  fuel: string;
  isSelf: boolean;
}

export type ProFeatureName = 
  | 'multi_vehicle' 
  | 'unlimited_garage'
  | 'ai_assistant' 
  | 'export_pdf' 
  | 'export_csv'
  | 'cloud_sync' 
  | 'cloud_backup'
  | 'shared_garage'
  | 'multi_account_sync'
  | 'fuel_alerts'
  | 'price_history'
  | 'favorite_stations';

export interface ProPricingOption {
  id: 'annual' | 'lifetime';
  name: string;
  price: string;
  numericPrice: number;
  period: string;
  highlight?: boolean;
  badge?: string;
  description: string;
  savings?: string;
}
