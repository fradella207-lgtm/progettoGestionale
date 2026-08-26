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
}

export interface MaintenanceRecord {
  id: string;
  date: string;
  km: number;
  category: string;
  description: string;
  workshop: string;
  cost: number;
}

export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  plate: string;
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

export interface AppSettings {
  unitDistance: 'km' | 'mi';
  currency: '€' | '$' | '£';
  fuelPriceAlerts: boolean;
  predictiveAlerts: boolean;
  autoBackup: boolean;
  stationDisplayMode?: 'auto' | 'fuel_only' | 'ev_only' | 'all';
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
}
