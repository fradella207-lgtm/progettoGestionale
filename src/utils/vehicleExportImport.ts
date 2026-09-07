import { Vehicle } from '../types';

export interface VehicleExportPackage {
  format: 'MyGarage360_Vehicle_Export';
  version: '2.0';
  exportedAt: string;
  vehicle: Vehicle;
}

export interface GarageExportPackage {
  format: 'MyGarage360_Garage_Export';
  version: '2.0';
  exportedAt: string;
  vehicles: Vehicle[];
}

/**
 * Export a single vehicle as a formatted JSON file download
 */
export function exportVehicleToJSON(vehicle: Vehicle): void {
  const exportData: VehicleExportPackage = {
    format: 'MyGarage360_Vehicle_Export',
    version: '2.0',
    exportedAt: new Date().toISOString(),
    vehicle
  };

  const safeBrand = (vehicle.brand || 'Auto').replace(/[^a-zA-Z0-9_-]/g, '_');
  const safeModel = (vehicle.model || 'Modello').replace(/[^a-zA-Z0-9_-]/g, '_');
  const safePlate = (vehicle.plate || 'TARGA').replace(/[^a-zA-Z0-9_-]/g, '_');
  const fileName = `MyGarage360_${safeBrand}_${safeModel}_${safePlate}.json`;

  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

/**
 * Export the full garage list as a formatted JSON file download
 */
export function exportAllVehiclesToJSON(vehicles: Vehicle[]): void {
  const exportData: GarageExportPackage = {
    format: 'MyGarage360_Garage_Export',
    version: '2.0',
    exportedAt: new Date().toISOString(),
    vehicles
  };

  const dateStr = new Date().toISOString().split('T')[0];
  const fileName = `MyGarage360_Garage_Backup_${dateStr}.json`;

  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export type ParseImportResult = 
  | { success: true; type: 'single'; vehicle: Vehicle }
  | { success: true; type: 'multiple'; vehicles: Vehicle[] }
  | { success: false; error: string };

/**
 * Parse and validate an imported JSON file string
 */
export function parseImportedVehicleFile(rawJson: string): ParseImportResult {
  try {
    const parsed = JSON.parse(rawJson);

    // Case 1: Package with format 'MyGarage360_Vehicle_Export'
    if (parsed && typeof parsed === 'object' && parsed.vehicle && parsed.vehicle.brand) {
      return {
        success: true,
        type: 'single',
        vehicle: sanitizeImportedVehicle(parsed.vehicle)
      };
    }

    // Case 2: Package with format 'MyGarage360_Garage_Export' or array of vehicles
    if (parsed && typeof parsed === 'object' && Array.isArray(parsed.vehicles)) {
      const sanitized = parsed.vehicles
        .filter((v: any) => v && v.brand && (v.model || v.plate))
        .map(sanitizeImportedVehicle);
      if (sanitized.length > 0) {
        return { success: true, type: 'multiple', vehicles: sanitized };
      }
    }

    // Case 3: Raw array of vehicles
    if (Array.isArray(parsed)) {
      const sanitized = parsed
        .filter((v: any) => v && v.brand && (v.model || v.plate))
        .map(sanitizeImportedVehicle);
      if (sanitized.length > 0) {
        return { success: true, type: 'multiple', vehicles: sanitized };
      }
    }

    // Case 4: Raw single vehicle object directly
    if (parsed && typeof parsed === 'object' && parsed.brand && (parsed.model || parsed.plate)) {
      return {
        success: true,
        type: 'single',
        vehicle: sanitizeImportedVehicle(parsed)
      };
    }

    return {
      success: false,
      error: 'Il file selezionato non contiene una struttura veicolo valida per MyGarage360.'
    };
  } catch (e) {
    return {
      success: false,
      error: 'Impossibile leggere il file JSON. Assicurati che sia un file di backup valido.'
    };
  }
}

/**
 * Helper to read a File as parsed JSON
 */
export async function readJsonFile(file: File): Promise<any> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);
        resolve(parsed);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsText(file, 'UTF-8');
  });
}

export function sanitizeImportedVehicle(raw: any): Vehicle {
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 7);

  return {
    id: raw.id ? `car_${timestamp}_${randomSuffix}` : `car_${timestamp}_${randomSuffix}`,
    brand: String(raw.brand || 'Auto').trim(),
    model: String(raw.model || 'Modello').trim(),
    plate: String(raw.plate || 'AA000AA').toUpperCase().trim(),
    registrationDate: String(raw.registrationDate || new Date().toISOString().split('T')[0]),
    fuelType: raw.fuelType || 'Benzina',
    initialKm: Number(raw.initialKm) || 0,
    tankCapacity: Number(raw.tankCapacity) || 45,
    secondaryTankCapacity: raw.secondaryTankCapacity ? Number(raw.secondaryTankCapacity) : undefined,
    batteryCapacity: raw.batteryCapacity ? Number(raw.batteryCapacity) : undefined,
    motorization: raw.motorization ? String(raw.motorization) : undefined,
    powerCv: raw.powerCv ? Number(raw.powerCv) : undefined,
    powerKw: raw.powerKw ? Number(raw.powerKw) : undefined,
    photoUrl: raw.photoUrl ? String(raw.photoUrl) : undefined,
    refuels: Array.isArray(raw.refuels) ? raw.refuels : [],
    maintenances: Array.isArray(raw.maintenances) ? raw.maintenances : [],
    documents: Array.isArray(raw.documents) ? raw.documents : [],
    technicalSpecs: raw.technicalSpecs && typeof raw.technicalSpecs === 'object' ? raw.technicalSpecs : undefined,
    manualInfo: raw.manualInfo && typeof raw.manualInfo === 'object' ? raw.manualInfo : undefined,
    aiChatHistory: Array.isArray(raw.aiChatHistory) ? raw.aiChatHistory : []
  };
}

export function sanitizeImportedGarage(rawList: any[]): Vehicle[] {
  if (!Array.isArray(rawList)) return [];
  return rawList
    .filter((v: any) => v && v.brand && (v.model || v.plate))
    .map(sanitizeImportedVehicle);
}
