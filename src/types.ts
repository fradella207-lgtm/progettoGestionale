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
