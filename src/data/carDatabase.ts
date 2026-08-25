import { FuelType } from '../types';

export interface CarMotorization {
  name: string;
  fuelType: FuelType;
  tankCapacity: number; // Liters (0 for BEV)
  batteryCapacity?: number; // kWh (for PHEV or BEV)
  secondaryTankCapacity?: number; // Liters GPL or Kg Metano
  cv: number;
  kw: number;
  displacementCc?: number;
  years?: string; // e.g. "2024+", "2020-2024", "2016-2020"
  startYear?: number;
  endYear?: number;
  generation?: string; // e.g. "VIII Restyling 2024", "VIII 2020-2024", "II Serie"
  transmission?: string; // e.g. "Automatico DSG 7m", "Manuale 6m", "E-CVT"
  euroStandard?: string; // e.g. "Euro 6e", "Euro 6d-ISC-FCM", "Euro 6d-Temp", "Euro 6"
  wltpElectricRangeKm?: number; // e.g. 120, 55, 450
  driveType?: 'FWD' | 'RWD' | 'AWD / 4x4' | string;
  differential?: string; // e.g. "Anteriore elettronico", "Integrale Haldex / 4Motion", "Torsen", "Differenziale Q2"
  avgConsumption?: string; // e.g. "0.4 L/100km + 15.5 kWh/100km", "4.8 L/100km"
}

export interface CarModelData {
  name: string;
  category: 'Berlina' | 'SUV' | 'Station Wagon' | 'Compatta' | 'Coupé' | 'Monovolume' | 'Citycar';
  generations?: {
    name: string;
    years: string;
    startYear: number;
    endYear?: number;
  }[];
  motorizations: CarMotorization[];
}

export interface CarBrandData {
  brand: string;
  country: string;
  models: CarModelData[];
}

export const CAR_BRANDS_CATALOG: CarBrandData[] = [
  {
    brand: 'Alfa Romeo',
    country: 'Italia',
    models: [
      {
        name: 'Giulietta',
        category: 'Berlina',
        motorizations: [
          { name: '1.6 JTDm 120 CV (Giulietta)', fuelType: 'Diesel', tankCapacity: 60, cv: 120, kw: 88, displacementCc: 1598, years: '2015-2020', startYear: 2015, endYear: 2020, generation: 'Giulietta Restyling', euroStandard: 'Euro 6', transmission: 'Manuale 6m / TCT', driveType: 'FWD', avgConsumption: '4.3 L/100km' },
          { name: '1.6 JTDm 105 CV (Giulietta)', fuelType: 'Diesel', tankCapacity: 60, cv: 105, kw: 77, displacementCc: 1598, years: '2010-2015', startYear: 2010, endYear: 2015, generation: 'Giulietta I Serie', euroStandard: 'Euro 5', transmission: 'Manuale 6m', driveType: 'FWD', avgConsumption: '4.4 L/100km' },
          { name: '2.0 JTDm 150 CV (Giulietta)', fuelType: 'Diesel', tankCapacity: 60, cv: 150, kw: 110, displacementCc: 1956, years: '2013-2020', startYear: 2013, endYear: 2020, generation: 'Giulietta', euroStandard: 'Euro 6', transmission: 'Manuale 6m', driveType: 'FWD', avgConsumption: '4.7 L/100km' },
          { name: '2.0 JTDm 170/175 CV TCT (Giulietta)', fuelType: 'Diesel', tankCapacity: 60, cv: 175, kw: 129, displacementCc: 1956, years: '2010-2020', startYear: 2010, endYear: 2020, generation: 'Giulietta', euroStandard: 'Euro 5/6', transmission: 'TCT 6m', driveType: 'FWD', avgConsumption: '4.9 L/100km' },
          { name: '1.4 Turbo GPL 120 CV (Giulietta)', fuelType: 'GPL (Benzina + GPL)', tankCapacity: 60, secondaryTankCapacity: 38, cv: 120, kw: 88, displacementCc: 1368, years: '2011-2018', startYear: 2011, endYear: 2018, generation: 'Giulietta Turbo GPL', euroStandard: 'Euro 5/6', transmission: 'Manuale 6m', driveType: 'FWD', avgConsumption: '8.2 L/100km GPL' },
          { name: '1.4 MultiAir 150/170 CV (Giulietta)', fuelType: 'Benzina', tankCapacity: 60, cv: 170, kw: 125, displacementCc: 1368, years: '2010-2018', startYear: 2010, endYear: 2018, generation: 'Giulietta', euroStandard: 'Euro 5/6', transmission: 'Manuale 6m / TCT', driveType: 'FWD', avgConsumption: '5.8 L/100km' }
        ]
      },
      {
        name: '147',
        category: 'Compatta',
        motorizations: [
          { name: '1.9 JTDm 120 CV 8V (147)', fuelType: 'Diesel', tankCapacity: 60, cv: 120, kw: 88, displacementCc: 1910, years: '2005-2010', startYear: 2005, endYear: 2010, generation: '147 Restyling', euroStandard: 'Euro 4', transmission: 'Manuale 5m', driveType: 'FWD', avgConsumption: '5.8 L/100km' },
          { name: '1.9 JTDm 150 CV 16V (147)', fuelType: 'Diesel', tankCapacity: 60, cv: 150, kw: 110, displacementCc: 1910, years: '2004-2010', startYear: 2004, endYear: 2010, generation: '147 Restyling', euroStandard: 'Euro 4', transmission: 'Manuale 6m', driveType: 'FWD', avgConsumption: '5.9 L/100km' },
          { name: '1.6 Twin Spark 105 CV (147)', fuelType: 'Benzina', tankCapacity: 60, cv: 105, kw: 77, displacementCc: 1598, years: '2000-2010', startYear: 2000, endYear: 2010, generation: '147', euroStandard: 'Euro 3/4', transmission: 'Manuale 5m', driveType: 'FWD', avgConsumption: '8.1 L/100km' },
          { name: '1.6 Twin Spark 120 CV (147)', fuelType: 'Benzina', tankCapacity: 60, cv: 120, kw: 88, displacementCc: 1598, years: '2000-2010', startYear: 2000, endYear: 2010, generation: '147', euroStandard: 'Euro 3/4', transmission: 'Manuale 5m', driveType: 'FWD', avgConsumption: '8.2 L/100km' }
        ]
      },
      {
        name: 'Giulia',
        category: 'Berlina',
        motorizations: [
          { name: '2.2 Turbo Diesel 160 CV AT8', fuelType: 'Diesel', tankCapacity: 52, cv: 160, kw: 118, displacementCc: 2143, years: '2019-2024', startYear: 2019, endYear: 2024, euroStandard: 'Euro 6d', transmission: 'Automatico AT8', driveType: 'RWD', avgConsumption: '5.1 L/100km' },
          { name: '2.2 Turbo Diesel 190 CV AT8', fuelType: 'Diesel', tankCapacity: 52, cv: 190, kw: 140, displacementCc: 2143, years: '2018-2024', startYear: 2018, endYear: 2024, euroStandard: 'Euro 6d', transmission: 'Automatico AT8', driveType: 'RWD', avgConsumption: '5.3 L/100km' },
          { name: '2.2 Turbo Diesel 210 CV Q4 Veloce AT8', fuelType: 'Diesel', tankCapacity: 52, cv: 210, kw: 154, displacementCc: 2143, years: '2016-2024', startYear: 2016, endYear: 2024, euroStandard: 'Euro 6d', transmission: 'Automatico AT8', driveType: 'AWD / 4x4', avgConsumption: '5.7 L/100km' },
          { name: '2.0 Turbo Benzina 200 CV AT8', fuelType: 'Benzina', tankCapacity: 58, cv: 200, kw: 147, displacementCc: 1995, years: '2016-2024', startYear: 2016, endYear: 2024, euroStandard: 'Euro 6d', transmission: 'Automatico AT8', driveType: 'RWD', avgConsumption: '7.2 L/100km' },
          { name: '2.0 Turbo Benzina 280 CV Q4 Veloce AT8', fuelType: 'Benzina', tankCapacity: 58, cv: 280, kw: 206, displacementCc: 1995, years: '2016-2024', startYear: 2016, endYear: 2024, euroStandard: 'Euro 6d', transmission: 'Automatico AT8', driveType: 'AWD / 4x4', avgConsumption: '8.0 L/100km' },
          { name: '2.9 V6 Quadrifoglio 510 CV AT8', fuelType: 'Benzina', tankCapacity: 58, cv: 510, kw: 375, displacementCc: 2891, years: '2016-2024', startYear: 2016, endYear: 2024, euroStandard: 'Euro 6d', transmission: 'Automatico AT8', driveType: 'RWD', avgConsumption: '9.8 L/100km' }
        ]
      },
      {
        name: 'Stelvio',
        category: 'SUV',
        motorizations: [
          { name: '2.2 Turbo Diesel 160 CV AT8 RWD', fuelType: 'Diesel', tankCapacity: 58, cv: 160, kw: 118, displacementCc: 2143, years: '2019-2024', startYear: 2019, endYear: 2024, euroStandard: 'Euro 6d', transmission: 'Automatico AT8', driveType: 'RWD', avgConsumption: '5.9 L/100km' },
          { name: '2.2 Turbo Diesel 190 CV Q4 AT8', fuelType: 'Diesel', tankCapacity: 58, cv: 190, kw: 140, displacementCc: 2143, years: '2018-2024', startYear: 2018, endYear: 2024, euroStandard: 'Euro 6d', transmission: 'Automatico AT8', driveType: 'AWD / 4x4', avgConsumption: '6.1 L/100km' },
          { name: '2.2 Turbo Diesel 210 CV Q4 Veloce AT8', fuelType: 'Diesel', tankCapacity: 58, cv: 210, kw: 154, displacementCc: 2143, years: '2017-2024', startYear: 2017, endYear: 2024, euroStandard: 'Euro 6d', transmission: 'Automatico AT8', driveType: 'AWD / 4x4', avgConsumption: '6.4 L/100km' },
          { name: '2.0 Turbo Benzina 280 CV Q4 Veloce', fuelType: 'Benzina', tankCapacity: 64, cv: 280, kw: 206, displacementCc: 1995, years: '2017-2024', startYear: 2017, endYear: 2024, euroStandard: 'Euro 6d', transmission: 'Automatico AT8', driveType: 'AWD / 4x4', avgConsumption: '8.7 L/100km' },
          { name: '2.9 V6 Quadrifoglio 510 CV Q4', fuelType: 'Benzina', tankCapacity: 64, cv: 510, kw: 375, displacementCc: 2891, years: '2017-2024', startYear: 2017, endYear: 2024, euroStandard: 'Euro 6d', transmission: 'Automatico AT8', driveType: 'AWD / 4x4', avgConsumption: '10.5 L/100km' }
        ]
      },
      {
        name: 'Tonale',
        category: 'SUV',
        motorizations: [
          { name: '1.3 Plug-in Hybrid Q4 280 CV (PHEV)', fuelType: 'Plug-in Hybrid (PHEV)', tankCapacity: 42, batteryCapacity: 15.5, cv: 280, kw: 206, displacementCc: 1332, years: '2022+', startYear: 2022, generation: 'I Serie', euroStandard: 'Euro 6d-ISC-FCM', transmission: 'Automatico 6m', driveType: 'AWD / 4x4', wltpElectricRangeKm: 69, avgConsumption: '1.4 L/100km + 15.0 kWh/100km' },
          { name: '1.5 Hybrid 130 CV TCT', fuelType: 'Full / Mild Hybrid', tankCapacity: 55, cv: 130, kw: 96, displacementCc: 1469, years: '2022+', startYear: 2022, euroStandard: 'Euro 6d-ISC-FCM', transmission: 'Doppia Frizione TCT 7m', driveType: 'FWD', avgConsumption: '5.9 L/100km' },
          { name: '1.5 Hybrid 160 CV VGT TCT', fuelType: 'Full / Mild Hybrid', tankCapacity: 55, cv: 160, kw: 118, displacementCc: 1469, years: '2022+', startYear: 2022, euroStandard: 'Euro 6d-ISC-FCM', transmission: 'Doppia Frizione TCT 7m', driveType: 'FWD', avgConsumption: '6.0 L/100km' },
          { name: '1.6 Diesel 130 CV TCT', fuelType: 'Diesel', tankCapacity: 55, cv: 130, kw: 96, displacementCc: 1598, years: '2022+', startYear: 2022, euroStandard: 'Euro 6d-ISC-FCM', transmission: 'Doppia Frizione TCT 6m', driveType: 'FWD', avgConsumption: '5.5 L/100km' }
        ]
      },
      {
        name: 'Junior',
        category: 'SUV',
        motorizations: [
          { name: 'Ibrida 1.2 MHEV 136 CV e-DCT6', fuelType: 'Full / Mild Hybrid', tankCapacity: 44, cv: 136, kw: 100, displacementCc: 1199, years: '2024+', startYear: 2024, euroStandard: 'Euro 6e', transmission: 'Automatico e-DCT6', driveType: 'FWD', avgConsumption: '5.2 L/100km' },
          { name: 'Ibrida Q4 1.2 MHEV 136 CV 4x4', fuelType: 'Full / Mild Hybrid', tankCapacity: 44, cv: 136, kw: 100, displacementCc: 1199, years: '2024+', startYear: 2024, euroStandard: 'Euro 6e', transmission: 'Automatico e-DCT6', driveType: 'AWD / 4x4', avgConsumption: '5.5 L/100km' },
          { name: 'Elettrica 156 CV (Batteria 54 kWh)', fuelType: 'Elettrica (BEV)', tankCapacity: 0, batteryCapacity: 54, cv: 156, kw: 115, years: '2024+', startYear: 2024, transmission: 'Monomarcia', driveType: 'FWD', wltpElectricRangeKm: 410, avgConsumption: '15.1 kWh/100km' },
          { name: 'Elettrica Veloce 280 CV (Batteria 54 kWh)', fuelType: 'Elettrica (BEV)', tankCapacity: 0, batteryCapacity: 54, cv: 280, kw: 207, years: '2024+', startYear: 2024, transmission: 'Monomarcia', driveType: 'FWD', wltpElectricRangeKm: 334, avgConsumption: '16.8 kWh/100km' }
        ]
      }
    ]
  },
  {
    brand: 'Audi',
    country: 'Germania',
    models: [
      {
        name: 'A3 Sportback',
        category: 'Compatta',
        motorizations: [
          // 2024+ Restyling
          { name: '40 TFSI e Plug-in Hybrid 204 CV S tronic (PHEV 2024+)', fuelType: 'Plug-in Hybrid (PHEV)', tankCapacity: 45, batteryCapacity: 19.7, cv: 204, kw: 150, displacementCc: 1498, years: '2024+', startYear: 2024, generation: 'IV Serie Restyling', euroStandard: 'Euro 6e', transmission: 'S tronic 6m', driveType: 'FWD', wltpElectricRangeKm: 142, avgConsumption: '0.3 L/100km + 14.5 kWh/100km' },
          { name: '45 TFSI e Plug-in Hybrid 272 CV S tronic (PHEV 2024+)', fuelType: 'Plug-in Hybrid (PHEV)', tankCapacity: 45, batteryCapacity: 19.7, cv: 272, kw: 200, displacementCc: 1498, years: '2024+', startYear: 2024, generation: 'IV Serie Restyling', euroStandard: 'Euro 6e', transmission: 'S tronic 6m', driveType: 'FWD', wltpElectricRangeKm: 140, avgConsumption: '0.4 L/100km + 15.0 kWh/100km' },
          // 2020-2024 Pre-Restyling (8Y)
          { name: '40 TFSI e Plug-in Hybrid 204 CV S tronic (PHEV 2020-2024)', fuelType: 'Plug-in Hybrid (PHEV)', tankCapacity: 40, batteryCapacity: 13.0, cv: 204, kw: 150, displacementCc: 1395, years: '2020-2024', startYear: 2020, endYear: 2024, generation: 'IV Serie (8Y)', euroStandard: 'Euro 6d', transmission: 'S tronic 6m', driveType: 'FWD', wltpElectricRangeKm: 65, avgConsumption: '1.2 L/100km + 14.5 kWh/100km' },
          { name: '30 TDI 2.0 116 CV S tronic (8Y)', fuelType: 'Diesel', tankCapacity: 50, cv: 116, kw: 85, displacementCc: 1968, years: '2020-2024', startYear: 2020, endYear: 2024, generation: 'IV Serie (8Y)', euroStandard: 'Euro 6d', transmission: 'S tronic 7m', driveType: 'FWD', avgConsumption: '4.7 L/100km' },
          { name: '35 TDI 2.0 150 CV S tronic (8Y)', fuelType: 'Diesel', tankCapacity: 50, cv: 150, kw: 110, displacementCc: 1968, years: '2020-2024', startYear: 2020, endYear: 2024, generation: 'IV Serie (8Y)', euroStandard: 'Euro 6d', transmission: 'S tronic 7m', driveType: 'FWD', avgConsumption: '4.9 L/100km' },
          { name: '35 TFSI 1.5 MHEV 150 CV S tronic (8Y)', fuelType: 'Full / Mild Hybrid', tankCapacity: 45, cv: 150, kw: 110, displacementCc: 1498, years: '2020-2024', startYear: 2020, endYear: 2024, generation: 'IV Serie (8Y)', euroStandard: 'Euro 6d', transmission: 'S tronic 7m', driveType: 'FWD', avgConsumption: '5.6 L/100km' },
          // 2012-2020 (8V)
          { name: '1.6 TDI 110/116 CV (A3 8V)', fuelType: 'Diesel', tankCapacity: 50, cv: 116, kw: 85, displacementCc: 1598, years: '2012-2020', startYear: 2012, endYear: 2020, generation: 'III Serie (8V)', euroStandard: 'Euro 6', transmission: 'Manuale 6m / S tronic', driveType: 'FWD', avgConsumption: '4.2 L/100km' },
          { name: '2.0 TDI 150 CV (A3 8V)', fuelType: 'Diesel', tankCapacity: 50, cv: 150, kw: 110, displacementCc: 1968, years: '2012-2020', startYear: 2012, endYear: 2020, generation: 'III Serie (8V)', euroStandard: 'Euro 6', transmission: 'Manuale 6m / S tronic', driveType: 'FWD', avgConsumption: '4.4 L/100km' },
          { name: '1.4 TFSI 125/150 CV (A3 8V)', fuelType: 'Benzina', tankCapacity: 50, cv: 150, kw: 110, displacementCc: 1395, years: '2012-2020', startYear: 2012, endYear: 2020, generation: 'III Serie (8V)', euroStandard: 'Euro 6', transmission: 'Manuale 6m / S tronic', driveType: 'FWD', avgConsumption: '5.2 L/100km' },
          { name: '1.4 g-tron Metano 110 CV (A3 8V)', fuelType: 'Metano (Benzina + Metano)', tankCapacity: 50, secondaryTankCapacity: 14, cv: 110, kw: 81, displacementCc: 1395, years: '2013-2019', startYear: 2013, endYear: 2019, generation: 'III Serie (8V)', euroStandard: 'Euro 6', transmission: 'S tronic 7m', driveType: 'FWD', avgConsumption: '3.6 kg/100km' },
          // 2003-2012 (8P)
          { name: '1.9 TDI 105 CV (A3 8P)', fuelType: 'Diesel', tankCapacity: 55, cv: 105, kw: 77, displacementCc: 1896, years: '2003-2010', startYear: 2003, endYear: 2010, generation: 'II Serie (8P)', euroStandard: 'Euro 4', transmission: 'Manuale 5m', driveType: 'FWD', avgConsumption: '5.1 L/100km' },
          { name: '2.0 TDI 140 CV 16V (A3 8P)', fuelType: 'Diesel', tankCapacity: 55, cv: 140, kw: 103, displacementCc: 1968, years: '2003-2012', startYear: 2003, endYear: 2012, generation: 'II Serie (8P)', euroStandard: 'Euro 4/5', transmission: 'Manuale 6m / S tronic', driveType: 'FWD', avgConsumption: '5.5 L/100km' },
          { name: '1.6 102 CV Attraction (A3 8P)', fuelType: 'Benzina', tankCapacity: 55, cv: 102, kw: 75, displacementCc: 1595, years: '2003-2010', startYear: 2003, endYear: 2010, generation: 'II Serie (8P)', euroStandard: 'Euro 4', transmission: 'Manuale 5m', driveType: 'FWD', avgConsumption: '7.2 L/100km' }
        ]
      },
      {
        name: 'Q3 / Q3 Sportback',
        category: 'SUV',
        motorizations: [
          { name: '45 TFSI e Plug-in Hybrid 245 CV (PHEV)', fuelType: 'Plug-in Hybrid (PHEV)', tankCapacity: 45, batteryCapacity: 13.0, cv: 245, kw: 180, displacementCc: 1395, years: '2021+', startYear: 2021, euroStandard: 'Euro 6d', transmission: 'S tronic 6m', driveType: 'FWD', wltpElectricRangeKm: 51, avgConsumption: '1.6 L/100km + 16.0 kWh/100km' },
          { name: '35 TDI 2.0 150 CV S tronic', fuelType: 'Diesel', tankCapacity: 58, cv: 150, kw: 110, displacementCc: 1968, years: '2019+', startYear: 2019, euroStandard: 'Euro 6d', transmission: 'S tronic 7m', driveType: 'FWD', avgConsumption: '5.4 L/100km' },
          { name: '40 TDI 2.0 quattro S tronic 200 CV', fuelType: 'Diesel', tankCapacity: 60, cv: 200, kw: 147, displacementCc: 1968, years: '2020+', startYear: 2020, euroStandard: 'Euro 6d', transmission: 'S tronic 7m', driveType: 'AWD / 4x4', avgConsumption: '6.2 L/100km' },
          { name: '35 TFSI 1.5 MHEV 150 CV S tronic', fuelType: 'Full / Mild Hybrid', tankCapacity: 58, cv: 150, kw: 110, displacementCc: 1498, years: '2019+', startYear: 2019, euroStandard: 'Euro 6d', transmission: 'S tronic 7m', driveType: 'FWD', avgConsumption: '6.5 L/100km' }
        ]
      },
      {
        name: 'Q4 e-tron',
        category: 'SUV',
        motorizations: [
          { name: '45 e-tron 286 CV (Batteria 77 kWh)', fuelType: 'Elettrica (BEV)', tankCapacity: 0, batteryCapacity: 77, cv: 286, kw: 210, years: '2023+', startYear: 2023, transmission: 'Monomarcia', driveType: 'RWD', wltpElectricRangeKm: 535, avgConsumption: '16.2 kWh/100km' },
          { name: '55 e-tron quattro 340 CV (Batteria 77 kWh)', fuelType: 'Elettrica (BEV)', tankCapacity: 0, batteryCapacity: 77, cv: 340, kw: 250, years: '2023+', startYear: 2023, transmission: 'Monomarcia', driveType: 'AWD / 4x4', wltpElectricRangeKm: 512, avgConsumption: '17.5 kWh/100km' }
        ]
      }
    ]
  },
  {
    brand: 'BMW',
    country: 'Germania',
    models: [
      {
        name: 'Serie 1',
        category: 'Compatta',
        motorizations: [
          // F70 2024+
          { name: '120 MHEV 170 CV Steptronic (F70 2024+)', fuelType: 'Full / Mild Hybrid', tankCapacity: 49, cv: 170, kw: 125, displacementCc: 1499, years: '2024+', startYear: 2024, generation: 'IV Serie (F70)', euroStandard: 'Euro 6e', transmission: 'Steptronic 7m', driveType: 'FWD', avgConsumption: '5.5 L/100km' },
          { name: '120d MHEV 163 CV Steptronic (F70 2024+)', fuelType: 'Diesel', tankCapacity: 49, cv: 163, kw: 120, displacementCc: 1995, years: '2024+', startYear: 2024, generation: 'IV Serie (F70)', euroStandard: 'Euro 6e', transmission: 'Steptronic 7m', driveType: 'FWD', avgConsumption: '4.6 L/100km' },
          // F40 2019-2024
          { name: '118d 2.0 Diesel 150 CV Steptronic (F40)', fuelType: 'Diesel', tankCapacity: 42, cv: 150, kw: 110, displacementCc: 1995, years: '2019-2024', startYear: 2019, endYear: 2024, generation: 'III Serie (F40)', euroStandard: 'Euro 6d', transmission: 'Steptronic 8m', driveType: 'FWD', avgConsumption: '4.9 L/100km' },
          { name: '118i 1.5 136 CV Steptronic (F40)', fuelType: 'Benzina', tankCapacity: 42, cv: 136, kw: 100, displacementCc: 1499, years: '2019-2024', startYear: 2019, endYear: 2024, generation: 'III Serie (F40)', euroStandard: 'Euro 6d', transmission: 'Steptronic 7m', driveType: 'FWD', avgConsumption: '5.9 L/100km' },
          // F20 2011-2019
          { name: '116d 1.5/2.0 Diesel 116 CV (F20)', fuelType: 'Diesel', tankCapacity: 52, cv: 116, kw: 85, displacementCc: 1496, years: '2011-2019', startYear: 2011, endYear: 2019, generation: 'II Serie (F20)', euroStandard: 'Euro 5/6', transmission: 'Manuale 6m / Steptronic 8m', driveType: 'RWD', avgConsumption: '4.3 L/100km' },
          { name: '118d 2.0 Diesel 143/150 CV (F20)', fuelType: 'Diesel', tankCapacity: 52, cv: 150, kw: 110, displacementCc: 1995, years: '2011-2019', startYear: 2011, endYear: 2019, generation: 'II Serie (F20)', euroStandard: 'Euro 5/6', transmission: 'Manuale 6m / Steptronic 8m', driveType: 'RWD', avgConsumption: '4.5 L/100km' },
          { name: '120d 2.0 Diesel 184/190 CV (F20)', fuelType: 'Diesel', tankCapacity: 52, cv: 190, kw: 140, displacementCc: 1995, years: '2011-2019', startYear: 2011, endYear: 2019, generation: 'II Serie (F20)', euroStandard: 'Euro 5/6', transmission: 'Steptronic 8m', driveType: 'RWD', avgConsumption: '4.7 L/100km' },
          // E87 2004-2011
          { name: '118d 2.0 Diesel 122/143 CV (E87)', fuelType: 'Diesel', tankCapacity: 53, cv: 143, kw: 105, displacementCc: 1995, years: '2004-2011', startYear: 2004, endYear: 2011, generation: 'I Serie (E87)', euroStandard: 'Euro 4/5', transmission: 'Manuale 6m', driveType: 'RWD', avgConsumption: '5.2 L/100km' },
          { name: '120d 2.0 Diesel 163/177 CV (E87)', fuelType: 'Diesel', tankCapacity: 53, cv: 177, kw: 130, displacementCc: 1995, years: '2004-2011', startYear: 2004, endYear: 2011, generation: 'I Serie (E87)', euroStandard: 'Euro 4/5', transmission: 'Manuale 6m / Steptronic', driveType: 'RWD', avgConsumption: '5.4 L/100km' },
          { name: '116i 1.6 115/122 CV (E87)', fuelType: 'Benzina', tankCapacity: 53, cv: 122, kw: 90, displacementCc: 1599, years: '2004-2011', startYear: 2004, endYear: 2011, generation: 'I Serie (E87)', euroStandard: 'Euro 4/5', transmission: 'Manuale 6m', driveType: 'RWD', avgConsumption: '6.8 L/100km' }
        ]
      },
      {
        name: 'Serie 3 / Serie 3 Touring',
        category: 'Berlina',
        motorizations: [
          // G20 2019+
          { name: '330e Plug-in Hybrid 292 CV (Batteria 19.5 kWh 2024+)', fuelType: 'Plug-in Hybrid (PHEV)', tankCapacity: 40, batteryCapacity: 19.5, cv: 292, kw: 215, displacementCc: 1998, years: '2024+', startYear: 2024, generation: 'G20 Restyling 2', euroStandard: 'Euro 6e', transmission: 'Steptronic 8m', driveType: 'RWD', wltpElectricRangeKm: 101, avgConsumption: '0.8 L/100km + 15.0 kWh/100km' },
          { name: '320d 2.0 MHEV 190 CV Steptronic (G20)', fuelType: 'Diesel', tankCapacity: 40, cv: 190, kw: 140, displacementCc: 1995, years: '2019+', startYear: 2019, generation: 'VII Serie (G20)', euroStandard: 'Euro 6d/6e', transmission: 'Steptronic 8m', driveType: 'RWD', avgConsumption: '5.0 L/100km' },
          { name: '320i 2.0 184 CV Steptronic (G20)', fuelType: 'Benzina', tankCapacity: 59, cv: 184, kw: 135, displacementCc: 1998, years: '2019+', startYear: 2019, generation: 'VII Serie (G20)', euroStandard: 'Euro 6d/6e', transmission: 'Steptronic 8m', driveType: 'RWD', avgConsumption: '6.7 L/100km' },
          // F30 2012-2019
          { name: '320d 2.0 Diesel 184/190 CV (F30)', fuelType: 'Diesel', tankCapacity: 57, cv: 190, kw: 140, displacementCc: 1995, years: '2012-2019', startYear: 2012, endYear: 2019, generation: 'VI Serie (F30)', euroStandard: 'Euro 5/6', transmission: 'Manuale 6m / Steptronic 8m', driveType: 'RWD', avgConsumption: '4.8 L/100km' },
          { name: '318d 2.0 Diesel 143/150 CV (F30)', fuelType: 'Diesel', tankCapacity: 57, cv: 150, kw: 110, displacementCc: 1995, years: '2012-2019', startYear: 2012, endYear: 2019, generation: 'VI Serie (F30)', euroStandard: 'Euro 5/6', transmission: 'Manuale 6m / Steptronic 8m', driveType: 'RWD', avgConsumption: '4.6 L/100km' },
          // E90 2005-2012
          { name: '320d 2.0 Diesel 163/177 CV (E90)', fuelType: 'Diesel', tankCapacity: 61, cv: 177, kw: 130, displacementCc: 1995, years: '2005-2012', startYear: 2005, endYear: 2012, generation: 'V Serie (E90)', euroStandard: 'Euro 4/5', transmission: 'Manuale 6m / Steptronic', driveType: 'RWD', avgConsumption: '5.5 L/100km' },
          { name: '318d 2.0 Diesel 122/143 CV (E90)', fuelType: 'Diesel', tankCapacity: 61, cv: 143, kw: 105, displacementCc: 1995, years: '2005-2012', startYear: 2005, endYear: 2012, generation: 'V Serie (E90)', euroStandard: 'Euro 4/5', transmission: 'Manuale 6m', driveType: 'RWD', avgConsumption: '5.3 L/100km' }
        ]
      },
      {
        name: 'X1',
        category: 'SUV',
        motorizations: [
          { name: 'xDrive25e Plug-in Hybrid 245 CV (PHEV)', fuelType: 'Plug-in Hybrid (PHEV)', tankCapacity: 47, batteryCapacity: 14.2, cv: 245, kw: 180, displacementCc: 1499, years: '2022+', startYear: 2022, generation: 'III Serie (U11)', euroStandard: 'Euro 6d/6e', transmission: 'Steptronic 7m', driveType: 'AWD / 4x4', wltpElectricRangeKm: 88, avgConsumption: '0.8 L/100km + 14.5 kWh/100km' },
          { name: 'xDrive30e Plug-in Hybrid 326 CV (PHEV)', fuelType: 'Plug-in Hybrid (PHEV)', tankCapacity: 47, batteryCapacity: 14.2, cv: 326, kw: 240, displacementCc: 1499, years: '2022+', startYear: 2022, generation: 'III Serie (U11)', euroStandard: 'Euro 6d/6e', transmission: 'Steptronic 7m', driveType: 'AWD / 4x4', wltpElectricRangeKm: 85, avgConsumption: '0.9 L/100km + 15.0 kWh/100km' },
          { name: 'sDrive18d 150 CV Steptronic', fuelType: 'Diesel', tankCapacity: 45, cv: 150, kw: 110, displacementCc: 1995, years: '2022+', startYear: 2022, euroStandard: 'Euro 6d/6e', transmission: 'Steptronic 7m', driveType: 'FWD', avgConsumption: '5.0 L/100km' },
          { name: 'iX1 eDrive20 204 CV (Batteria 64.7 kWh)', fuelType: 'Elettrica (BEV)', tankCapacity: 0, batteryCapacity: 64.7, cv: 204, kw: 150, years: '2023+', startYear: 2023, transmission: 'Monomarcia', driveType: 'FWD', wltpElectricRangeKm: 475, avgConsumption: '15.6 kWh/100km' }
        ]
      }
    ]
  },
  {
    brand: 'Cupra',
    country: 'Spagna',
    models: [
      {
        name: 'Formentor',
        category: 'SUV',
        motorizations: [
          // 2024+ Restyling
          { name: '1.5 e-HYBRID VZ 272 CV DSG (PHEV 2024+ Restyling)', fuelType: 'Plug-in Hybrid (PHEV)', tankCapacity: 45, batteryCapacity: 19.7, cv: 272, kw: 200, displacementCc: 1498, years: '2024+', startYear: 2024, generation: 'Restyling 2024', euroStandard: 'Euro 6e', transmission: 'DSG 6 rapporti', driveType: 'FWD', wltpElectricRangeKm: 119, avgConsumption: '0.4 L/100km + 16.0 kWh/100km' },
          { name: '1.5 e-HYBRID 204 CV DSG (PHEV 2024+ Restyling)', fuelType: 'Plug-in Hybrid (PHEV)', tankCapacity: 45, batteryCapacity: 19.7, cv: 204, kw: 150, displacementCc: 1498, years: '2024+', startYear: 2024, generation: 'Restyling 2024', euroStandard: 'Euro 6e', transmission: 'DSG 6 rapporti', driveType: 'FWD', wltpElectricRangeKm: 122, avgConsumption: '0.4 L/100km + 15.5 kWh/100km' },
          { name: '1.5 eTSI 150 CV MHEV DSG (2024+ Restyling)', fuelType: 'Full / Mild Hybrid', tankCapacity: 50, cv: 150, kw: 110, displacementCc: 1498, years: '2024+', startYear: 2024, generation: 'Restyling 2024', euroStandard: 'Euro 6e', transmission: 'DSG 7 rapporti', driveType: 'FWD', avgConsumption: '5.8 L/100km' },
          // 2020-2024 Pre-Restyling
          { name: '1.4 e-HYBRID VZ 245 CV DSG (PHEV 2020-2024)', fuelType: 'Plug-in Hybrid (PHEV)', tankCapacity: 40, batteryCapacity: 13.0, cv: 245, kw: 180, displacementCc: 1395, years: '2020-2024', startYear: 2020, endYear: 2024, generation: 'I Serie (Pre-Restyling)', euroStandard: 'Euro 6d-ISC-FCM', transmission: 'DSG 6 rapporti', driveType: 'FWD', wltpElectricRangeKm: 54, avgConsumption: '1.4 L/100km + 15.2 kWh/100km' },
          { name: '1.4 e-HYBRID 204 CV DSG (PHEV 2020-2024)', fuelType: 'Plug-in Hybrid (PHEV)', tankCapacity: 40, batteryCapacity: 13.0, cv: 204, kw: 150, displacementCc: 1395, years: '2020-2024', startYear: 2020, endYear: 2024, generation: 'I Serie (Pre-Restyling)', euroStandard: 'Euro 6d-ISC-FCM', transmission: 'DSG 6 rapporti', driveType: 'FWD', wltpElectricRangeKm: 59, avgConsumption: '1.3 L/100km + 14.8 kWh/100km' },
          { name: '1.5 TSI 150 CV Manuale / DSG (2020-2024)', fuelType: 'Benzina', tankCapacity: 50, cv: 150, kw: 110, displacementCc: 1498, years: '2020-2024', startYear: 2020, endYear: 2024, generation: 'I Serie', euroStandard: 'Euro 6d', transmission: 'Manuale 6m / DSG 7m', driveType: 'FWD', avgConsumption: '6.4 L/100km' },
          { name: '2.0 TDI 150 CV DSG 4Drive', fuelType: 'Diesel', tankCapacity: 55, cv: 150, kw: 110, displacementCc: 1968, years: '2021-2024', startYear: 2021, endYear: 2024, euroStandard: 'Euro 6d', transmission: 'DSG 7 rapporti', driveType: 'AWD / 4x4', avgConsumption: '5.6 L/100km' },
          { name: '2.0 TSI VZ 310 CV 4Drive DSG', fuelType: 'Benzina', tankCapacity: 55, cv: 310, kw: 228, displacementCc: 1984, years: '2020-2024', startYear: 2020, endYear: 2024, euroStandard: 'Euro 6d', transmission: 'DSG 7 rapporti', driveType: 'AWD / 4x4', avgConsumption: '8.5 L/100km' },
          { name: 'VZ5 2.5 TSI 390 CV 4Drive DSG', fuelType: 'Benzina', tankCapacity: 55, cv: 390, kw: 287, displacementCc: 2480, years: '2021-2023', startYear: 2021, endYear: 2023, euroStandard: 'Euro 6d', transmission: 'DSG 7 rapporti', driveType: 'AWD / 4x4', avgConsumption: '10.2 L/100km' }
        ]
      },
      {
        name: 'Leon / Leon Sportstourer',
        category: 'Compatta',
        motorizations: [
          { name: '1.5 e-HYBRID VZ 272 CV DSG (PHEV 2024+)', fuelType: 'Plug-in Hybrid (PHEV)', tankCapacity: 45, batteryCapacity: 19.7, cv: 272, kw: 200, displacementCc: 1498, years: '2024+', startYear: 2024, generation: 'Restyling 2024', euroStandard: 'Euro 6e', transmission: 'DSG 6m', driveType: 'FWD', wltpElectricRangeKm: 133, avgConsumption: '0.4 L/100km + 15.0 kWh/100km' },
          { name: '1.4 e-HYBRID 204 CV DSG (PHEV 2020-2024)', fuelType: 'Plug-in Hybrid (PHEV)', tankCapacity: 40, batteryCapacity: 13.0, cv: 204, kw: 150, displacementCc: 1395, years: '2020-2024', startYear: 2020, endYear: 2024, generation: 'I Serie Cupra', euroStandard: 'Euro 6d', transmission: 'DSG 6m', driveType: 'FWD', wltpElectricRangeKm: 62, avgConsumption: '1.2 L/100km + 14.0 kWh/100km' },
          { name: '1.5 eTSI 150 CV MHEV DSG', fuelType: 'Full / Mild Hybrid', tankCapacity: 45, cv: 150, kw: 110, displacementCc: 1498, years: '2022+', startYear: 2022, euroStandard: 'Euro 6d/6e', transmission: 'DSG 7m', driveType: 'FWD', avgConsumption: '5.5 L/100km' }
        ]
      },
      {
        name: 'Born',
        category: 'Compatta',
        motorizations: [
          { name: '58 kWh e-Boost 231 CV (BEV)', fuelType: 'Elettrica (BEV)', tankCapacity: 0, batteryCapacity: 58, cv: 231, kw: 170, years: '2021+', startYear: 2021, transmission: 'Monomarcia', driveType: 'RWD', wltpElectricRangeKm: 422, avgConsumption: '15.6 kWh/100km' },
          { name: '77 kWh e-Boost 231 CV (BEV)', fuelType: 'Elettrica (BEV)', tankCapacity: 0, batteryCapacity: 77, cv: 231, kw: 170, years: '2022+', startYear: 2022, transmission: 'Monomarcia', driveType: 'RWD', wltpElectricRangeKm: 550, avgConsumption: '15.9 kWh/100km' }
        ]
      }
    ]
  },
  {
    brand: 'Dacia',
    country: 'Romania / Francia',
    models: [
      {
        name: 'Duster',
        category: 'SUV',
        motorizations: [
          // Duster III 2024+
          { name: '1.0 TCe ECO-G 100 CV (GPL 2024+)', fuelType: 'GPL (Benzina + GPL)', tankCapacity: 50, secondaryTankCapacity: 50, cv: 100, kw: 74, displacementCc: 999, years: '2024+', startYear: 2024, generation: 'III Serie', euroStandard: 'Euro 6e', transmission: 'Manuale 6m', driveType: 'FWD', avgConsumption: '7.8 L/100km GPL' },
          { name: '1.2 TCe 130 CV MHEV 4x2 / 4x4 (2024+)', fuelType: 'Full / Mild Hybrid', tankCapacity: 50, cv: 130, kw: 96, displacementCc: 1199, years: '2024+', startYear: 2024, generation: 'III Serie', euroStandard: 'Euro 6e', transmission: 'Manuale 6m', driveType: 'FWD', avgConsumption: '5.5 L/100km' },
          { name: 'HYBRID 140 CV Automatica (2024+)', fuelType: 'Full / Mild Hybrid', tankCapacity: 50, cv: 140, kw: 103, displacementCc: 1598, years: '2024+', startYear: 2024, generation: 'III Serie', euroStandard: 'Euro 6e', transmission: 'Multimode Automatica', driveType: 'FWD', avgConsumption: '5.0 L/100km' },
          // Duster II 2018-2024
          { name: '1.0 TCe ECO-G 100 CV (GPL 2019-2024)', fuelType: 'GPL (Benzina + GPL)', tankCapacity: 50, secondaryTankCapacity: 50, cv: 100, kw: 74, displacementCc: 999, years: '2019-2024', startYear: 2019, endYear: 2024, generation: 'II Serie', euroStandard: 'Euro 6d', transmission: 'Manuale 6m', driveType: 'FWD', avgConsumption: '7.7 L/100km GPL' },
          { name: '1.5 Blue dCi 115 CV 4x4 (2018-2024)', fuelType: 'Diesel', tankCapacity: 50, cv: 115, kw: 85, displacementCc: 1461, years: '2018-2024', startYear: 2018, endYear: 2024, generation: 'II Serie', euroStandard: 'Euro 6d', transmission: 'Manuale 6m', driveType: 'AWD / 4x4', avgConsumption: '5.2 L/100km' }
        ]
      },
      {
        name: 'Sandero / Sandero Stepway',
        category: 'Compatta',
        motorizations: [
          { name: '1.0 TCe ECO-G 100 CV (GPL III Serie)', fuelType: 'GPL (Benzina + GPL)', tankCapacity: 50, secondaryTankCapacity: 40, cv: 100, kw: 74, displacementCc: 999, years: '2021+', startYear: 2021, generation: 'III Serie', euroStandard: 'Euro 6d/6e', transmission: 'Manuale 6m', driveType: 'FWD', avgConsumption: '6.8 L/100km GPL' },
          { name: '1.0 TCe 90 CV Manuale / CVT', fuelType: 'Benzina', tankCapacity: 50, cv: 90, kw: 67, displacementCc: 999, years: '2021+', startYear: 2021, generation: 'III Serie', euroStandard: 'Euro 6d/6e', transmission: 'Manuale 6m / CVT', driveType: 'FWD', avgConsumption: '5.3 L/100km' }
        ]
      }
    ]
  },
  {
    brand: 'Fiat',
    country: 'Italia',
    models: [
      {
        name: 'Panda',
        category: 'Citycar',
        motorizations: [
          // 2020+ Mild Hybrid
          { name: '1.0 FireFly Mild Hybrid 70 CV', fuelType: 'Full / Mild Hybrid', tankCapacity: 38, cv: 70, kw: 51, displacementCc: 999, years: '2020+', startYear: 2020, generation: 'III Serie Hybrid (Pandina)', euroStandard: 'Euro 6d/6e', transmission: 'Manuale 6 marce', driveType: 'FWD', avgConsumption: '4.9 L/100km' },
          // Pre-2020 / Classic 1.2
          { name: '1.2 69 CV Fire', fuelType: 'Benzina', tankCapacity: 38, cv: 69, kw: 51, displacementCc: 1242, years: '2012-2020', startYear: 2012, endYear: 2020, generation: 'III Serie', euroStandard: 'Euro 6b/6d-Temp', transmission: 'Manuale 5m', driveType: 'FWD', avgConsumption: '5.4 L/100km' },
          { name: '1.2 EasyPower 69 CV (GPL)', fuelType: 'GPL (Benzina + GPL)', tankCapacity: 38, secondaryTankCapacity: 31, cv: 69, kw: 51, displacementCc: 1242, years: '2012-2021', startYear: 2012, endYear: 2021, generation: 'III Serie EasyPower', euroStandard: 'Euro 6d-Temp', transmission: 'Manuale 5m', driveType: 'FWD', avgConsumption: '6.5 L/100km GPL' },
          { name: '0.9 TwinAir Natural Power 80 CV (Metano)', fuelType: 'Metano (Benzina + Metano)', tankCapacity: 35, secondaryTankCapacity: 12, cv: 80, kw: 59, displacementCc: 875, years: '2012-2020', startYear: 2012, endYear: 2020, generation: 'III Serie Natural Power', euroStandard: 'Euro 6b/6d', transmission: 'Manuale 5m', driveType: 'FWD', avgConsumption: '4.2 kg/100km' },
          { name: '1.3 MultiJet 95 CV 4x4 / Cross', fuelType: 'Diesel', tankCapacity: 35, cv: 95, kw: 70, displacementCc: 1248, years: '2015-2019', startYear: 2015, endYear: 2019, generation: 'III Serie 4x4', euroStandard: 'Euro 6', transmission: 'Manuale 5m', driveType: 'AWD / 4x4', avgConsumption: '4.7 L/100km' }
        ]
      },
      {
        name: 'Grande Panda',
        category: 'SUV',
        motorizations: [
          { name: '1.2 Hybrid 100 CV e-DCT6', fuelType: 'Full / Mild Hybrid', tankCapacity: 44, cv: 100, kw: 74, displacementCc: 1199, years: '2024+', startYear: 2024, generation: 'IV Serie (Grande Panda)', euroStandard: 'Euro 6e', transmission: 'Automatico e-DCT6', driveType: 'FWD', avgConsumption: '5.1 L/100km' },
          { name: 'Elettrica 113 CV (Batteria 44 kWh LFP)', fuelType: 'Elettrica (BEV)', tankCapacity: 0, batteryCapacity: 44, cv: 113, kw: 83, years: '2024+', startYear: 2024, generation: 'IV Serie (Grande Panda)', transmission: 'Monomarcia', driveType: 'FWD', wltpElectricRangeKm: 320, avgConsumption: '16.4 kWh/100km' }
        ]
      },
      {
        name: '500',
        category: 'Citycar',
        motorizations: [
          { name: '1.0 Hybrid 70 CV', fuelType: 'Full / Mild Hybrid', tankCapacity: 35, cv: 70, kw: 51, displacementCc: 999, years: '2020+', startYear: 2020, euroStandard: 'Euro 6d', transmission: 'Manuale 6m', driveType: 'FWD', avgConsumption: '4.7 L/100km' },
          { name: '1.2 69 CV Lounge / Pop', fuelType: 'Benzina', tankCapacity: 35, cv: 69, kw: 51, displacementCc: 1242, years: '2007-2020', startYear: 2007, endYear: 2020, euroStandard: 'Euro 4/5/6', transmission: 'Manuale 5m / Dualogic', driveType: 'FWD', avgConsumption: '5.2 L/100km' },
          { name: '1.2 EasyPower 69 CV (GPL)', fuelType: 'GPL (Benzina + GPL)', tankCapacity: 35, secondaryTankCapacity: 31, cv: 69, kw: 51, displacementCc: 1242, years: '2009-2020', startYear: 2009, endYear: 2020, euroStandard: 'Euro 5/6', transmission: 'Manuale 5m', driveType: 'FWD', avgConsumption: '6.3 L/100km GPL' }
        ]
      },
      {
        name: '500e (Elettrica)',
        category: 'Citycar',
        motorizations: [
          { name: 'Elettrica 95 CV (Batteria 23.8 kWh)', fuelType: 'Elettrica (BEV)', tankCapacity: 0, batteryCapacity: 23.8, cv: 95, kw: 70, years: '2020+', startYear: 2020, transmission: 'Monomarcia', driveType: 'FWD', wltpElectricRangeKm: 190, avgConsumption: '13.0 kWh/100km' },
          { name: 'Elettrica 118 CV (Batteria 42 kWh)', fuelType: 'Elettrica (BEV)', tankCapacity: 0, batteryCapacity: 42, cv: 118, kw: 87, years: '2020+', startYear: 2020, transmission: 'Monomarcia', driveType: 'FWD', wltpElectricRangeKm: 320, avgConsumption: '14.0 kWh/100km' }
        ]
      },
      {
        name: '600',
        category: 'SUV',
        motorizations: [
          { name: '600 Hybrid 1.2 100 CV e-DCT6', fuelType: 'Full / Mild Hybrid', tankCapacity: 44, cv: 100, kw: 74, displacementCc: 1199, years: '2023+', startYear: 2023, euroStandard: 'Euro 6e', transmission: 'Automatico e-DCT6', driveType: 'FWD', avgConsumption: '5.1 L/100km' },
          { name: '600 Hybrid 1.2 136 CV e-DCT6', fuelType: 'Full / Mild Hybrid', tankCapacity: 44, cv: 136, kw: 100, displacementCc: 1199, years: '2024+', startYear: 2024, euroStandard: 'Euro 6e', transmission: 'Automatico e-DCT6', driveType: 'FWD', avgConsumption: '5.2 L/100km' },
          { name: '600e Elettrica 156 CV (Batteria 54 kWh)', fuelType: 'Elettrica (BEV)', tankCapacity: 0, batteryCapacity: 54, cv: 156, kw: 115, years: '2023+', startYear: 2023, transmission: 'Monomarcia', driveType: 'FWD', wltpElectricRangeKm: 409, avgConsumption: '15.1 kWh/100km' }
        ]
      },
      {
        name: '500X',
        category: 'SUV',
        motorizations: [
          { name: '1.5 T4 Hybrid 130 CV DCT7', fuelType: 'Full / Mild Hybrid', tankCapacity: 48, cv: 130, kw: 96, displacementCc: 1469, years: '2022-2024', startYear: 2022, endYear: 2024, euroStandard: 'Euro 6d-ISC-FCM', transmission: 'DCT 7m', driveType: 'FWD', avgConsumption: '5.9 L/100km' },
          { name: '1.3 MultiJet 95 CV', fuelType: 'Diesel', tankCapacity: 48, cv: 95, kw: 70, displacementCc: 1248, years: '2015-2022', startYear: 2015, endYear: 2022, euroStandard: 'Euro 6', transmission: 'Manuale 5m', driveType: 'FWD', avgConsumption: '5.0 L/100km' },
          { name: '1.6 MultiJet 120/130 CV', fuelType: 'Diesel', tankCapacity: 48, cv: 130, kw: 96, displacementCc: 1598, years: '2015-2023', startYear: 2015, endYear: 2023, euroStandard: 'Euro 6d', transmission: 'Manuale 6m / DCT', driveType: 'FWD', avgConsumption: '5.2 L/100km' },
          { name: '1.0 FireFly Turbo 120 CV', fuelType: 'Benzina', tankCapacity: 48, cv: 120, kw: 88, displacementCc: 999, years: '2018-2022', startYear: 2018, endYear: 2022, euroStandard: 'Euro 6d', transmission: 'Manuale 6m', driveType: 'FWD', avgConsumption: '6.3 L/100km' }
        ]
      },
      {
        name: 'Punto / Grande Punto / Evo',
        category: 'Compatta',
        motorizations: [
          // Grande Punto / Punto Evo / Punto 2012 (2005-2018)
          { name: '1.2 65/69 CV 8V (Punto)', fuelType: 'Benzina', tankCapacity: 45, cv: 69, kw: 51, displacementCc: 1242, years: '2005-2018', startYear: 2005, endYear: 2018, generation: 'Grande Punto / Evo / 2012', euroStandard: 'Euro 4/5/6', transmission: 'Manuale 5m', driveType: 'FWD', avgConsumption: '5.4 L/100km' },
          { name: '1.4 77 CV EasyPower (GPL Punto)', fuelType: 'GPL (Benzina + GPL)', tankCapacity: 45, secondaryTankCapacity: 38, cv: 77, kw: 57, displacementCc: 1368, years: '2008-2018', startYear: 2008, endYear: 2018, generation: 'Punto EasyPower', euroStandard: 'Euro 4/5/6', transmission: 'Manuale 5m', driveType: 'FWD', avgConsumption: '7.0 L/100km GPL' },
          { name: '1.4 77 CV Natural Power (Metano Punto)', fuelType: 'Metano (Benzina + Metano)', tankCapacity: 45, secondaryTankCapacity: 13, cv: 77, kw: 57, displacementCc: 1368, years: '2008-2018', startYear: 2008, endYear: 2018, generation: 'Punto Natural Power', euroStandard: 'Euro 4/5/6', transmission: 'Manuale 5m', driveType: 'FWD', avgConsumption: '4.2 kg/100km' },
          { name: '1.3 MultiJet 75/90/95 CV (Punto)', fuelType: 'Diesel', tankCapacity: 45, cv: 95, kw: 70, displacementCc: 1248, years: '2005-2018', startYear: 2005, endYear: 2018, generation: 'Grande Punto / Evo', euroStandard: 'Euro 4/5/6', transmission: 'Manuale 5m', driveType: 'FWD', avgConsumption: '4.5 L/100km' },
          { name: '1.6 MultiJet 120 CV (Punto)', fuelType: 'Diesel', tankCapacity: 45, cv: 120, kw: 88, displacementCc: 1598, years: '2008-2012', startYear: 2008, endYear: 2012, generation: 'Grande Punto / Evo', euroStandard: 'Euro 5', transmission: 'Manuale 6m', driveType: 'FWD', avgConsumption: '4.8 L/100km' },
          { name: '1.9 MultiJet 120/130 CV (Grande Punto)', fuelType: 'Diesel', tankCapacity: 45, cv: 130, kw: 96, displacementCc: 1910, years: '2005-2009', startYear: 2005, endYear: 2009, generation: 'Grande Punto', euroStandard: 'Euro 4', transmission: 'Manuale 6m', driveType: 'FWD', avgConsumption: '5.6 L/100km' },
          // Punto II Serie (188 1999-2010)
          { name: '1.2 60 CV 8V (Punto II 188)', fuelType: 'Benzina', tankCapacity: 47, cv: 60, kw: 44, displacementCc: 1242, years: '1999-2010', startYear: 1999, endYear: 2010, generation: 'II Serie (188 / Classic)', euroStandard: 'Euro 3/4', transmission: 'Manuale 5m', driveType: 'FWD', avgConsumption: '5.7 L/100km' },
          { name: '1.3 MultiJet 70 CV (Punto II 188)', fuelType: 'Diesel', tankCapacity: 47, cv: 70, kw: 51, displacementCc: 1248, years: '2003-2010', startYear: 2003, endYear: 2010, generation: 'II Serie (188 / Classic)', euroStandard: 'Euro 4', transmission: 'Manuale 5m', driveType: 'FWD', avgConsumption: '4.5 L/100km' }
        ]
      },
      {
        name: 'Tipo',
        category: 'Compatta',
        motorizations: [
          { name: '1.5 Hybrid 130 CV DCT7 (2022+)', fuelType: 'Full / Mild Hybrid', tankCapacity: 50, cv: 130, kw: 96, displacementCc: 1469, years: '2022+', startYear: 2022, generation: 'Tipo Restyling', euroStandard: 'Euro 6d/6e', transmission: 'DCT 7m', driveType: 'FWD', avgConsumption: '5.2 L/100km' },
          { name: '1.0 FireFly 100 CV (2020+)', fuelType: 'Benzina', tankCapacity: 50, cv: 100, kw: 74, displacementCc: 999, years: '2020+', startYear: 2020, generation: 'Tipo Restyling', euroStandard: 'Euro 6d', transmission: 'Manuale 5m', driveType: 'FWD', avgConsumption: '5.5 L/100km' },
          { name: '1.6 MultiJet 120/130 CV', fuelType: 'Diesel', tankCapacity: 50, cv: 130, kw: 96, displacementCc: 1598, years: '2015+', startYear: 2015, generation: 'Tipo', euroStandard: 'Euro 6', transmission: 'Manuale 6m', driveType: 'FWD', avgConsumption: '4.6 L/100km' },
          { name: '1.3 MultiJet 95 CV', fuelType: 'Diesel', tankCapacity: 50, cv: 95, kw: 70, displacementCc: 1248, years: '2015-2022', startYear: 2015, endYear: 2022, generation: 'Tipo', euroStandard: 'Euro 6', transmission: 'Manuale 5m', driveType: 'FWD', avgConsumption: '4.3 L/100km' }
        ]
      }
    ]
  },
  {
    brand: 'Ford',
    country: 'USA / Europa',
    models: [
      {
        name: 'Focus',
        category: 'Compatta',
        motorizations: [
          // Focus IV (2018+)
          { name: '1.0 EcoBoost Hybrid 125/155 CV mHEV (Focus IV)', fuelType: 'Full / Mild Hybrid', tankCapacity: 52, cv: 125, kw: 92, displacementCc: 999, years: '2020+', startYear: 2020, generation: 'IV Serie', euroStandard: 'Euro 6d/6e', transmission: 'Manuale 6m / Powershift 7m', driveType: 'FWD', avgConsumption: '5.3 L/100km' },
          { name: '1.5 EcoBlue Diesel 120 CV (Focus IV)', fuelType: 'Diesel', tankCapacity: 47, cv: 120, kw: 88, displacementCc: 1499, years: '2018-2024', startYear: 2018, endYear: 2024, generation: 'IV Serie', euroStandard: 'Euro 6d', transmission: 'Manuale 6m / Automatico 8m', driveType: 'FWD', avgConsumption: '4.6 L/100km' },
          // Focus III (2011-2018)
          { name: '1.5 TDCi 120 CV (Focus III)', fuelType: 'Diesel', tankCapacity: 53, cv: 120, kw: 88, displacementCc: 1499, years: '2014-2018', startYear: 2014, endYear: 2018, generation: 'III Serie Restyling', euroStandard: 'Euro 6', transmission: 'Manuale 6m', driveType: 'FWD', avgConsumption: '4.2 L/100km' },
          { name: '1.6 TDCi 95/115 CV (Focus III)', fuelType: 'Diesel', tankCapacity: 53, cv: 115, kw: 85, displacementCc: 1560, years: '2011-2015', startYear: 2011, endYear: 2015, generation: 'III Serie', euroStandard: 'Euro 5', transmission: 'Manuale 6m', driveType: 'FWD', avgConsumption: '4.5 L/100km' },
          { name: '1.0 EcoBoost 100/125 CV (Focus III)', fuelType: 'Benzina', tankCapacity: 55, cv: 125, kw: 92, displacementCc: 999, years: '2012-2018', startYear: 2012, endYear: 2018, generation: 'III Serie', euroStandard: 'Euro 5/6', transmission: 'Manuale 6m', driveType: 'FWD', avgConsumption: '5.2 L/100km' },
          // Focus II (2004-2011)
          { name: '1.6 TDCi 90/110 CV DPF (Focus II)', fuelType: 'Diesel', tankCapacity: 53, cv: 110, kw: 80, displacementCc: 1560, years: '2004-2011', startYear: 2004, endYear: 2011, generation: 'II Serie', euroStandard: 'Euro 4/5', transmission: 'Manuale 5m', driveType: 'FWD', avgConsumption: '4.9 L/100km' },
          { name: '1.6 100 CV Benzina (Focus II)', fuelType: 'Benzina', tankCapacity: 55, cv: 100, kw: 74, displacementCc: 1596, years: '2004-2011', startYear: 2004, endYear: 2011, generation: 'II Serie', euroStandard: 'Euro 4', transmission: 'Manuale 5m', driveType: 'FWD', avgConsumption: '6.7 L/100km' }
        ]
      },
      {
        name: 'Fiesta',
        category: 'Compatta',
        motorizations: [
          // Fiesta VII (2017-2023)
          { name: '1.0 EcoBoost Hybrid 125 CV mHEV (Fiesta VII)', fuelType: 'Full / Mild Hybrid', tankCapacity: 42, cv: 125, kw: 92, displacementCc: 999, years: '2020-2023', startYear: 2020, endYear: 2023, generation: 'VII Serie', euroStandard: 'Euro 6d', transmission: 'Manuale 6m', driveType: 'FWD', avgConsumption: '5.0 L/100km' },
          { name: '1.1 75 CV Benzina (Fiesta VII)', fuelType: 'Benzina', tankCapacity: 42, cv: 75, kw: 55, displacementCc: 1084, years: '2017-2023', startYear: 2017, endYear: 2023, generation: 'VII Serie', euroStandard: 'Euro 6', transmission: 'Manuale 5m', driveType: 'FWD', avgConsumption: '5.3 L/100km' },
          { name: '1.5 TDCi 85/120 CV (Fiesta VII)', fuelType: 'Diesel', tankCapacity: 42, cv: 120, kw: 88, displacementCc: 1499, years: '2017-2020', startYear: 2017, endYear: 2020, generation: 'VII Serie', euroStandard: 'Euro 6', transmission: 'Manuale 6m', driveType: 'FWD', avgConsumption: '4.0 L/100km' },
          // Fiesta VI (2008-2017)
          { name: '1.4 TDCi 68/70 CV (Fiesta VI)', fuelType: 'Diesel', tankCapacity: 40, cv: 70, kw: 51, displacementCc: 1399, years: '2008-2015', startYear: 2008, endYear: 2015, generation: 'VI Serie', euroStandard: 'Euro 4/5', transmission: 'Manuale 5m', driveType: 'FWD', avgConsumption: '4.3 L/100km' },
          { name: '1.4 GPL 96 CV (Fiesta VI)', fuelType: 'GPL (Benzina + GPL)', tankCapacity: 42, secondaryTankCapacity: 33, cv: 96, kw: 71, displacementCc: 1388, years: '2009-2017', startYear: 2009, endYear: 2017, generation: 'VI Serie GPL', euroStandard: 'Euro 5/6', transmission: 'Manuale 5m', driveType: 'FWD', avgConsumption: '7.2 L/100km GPL' },
          { name: '1.2 60/82 CV 16V (Fiesta VI)', fuelType: 'Benzina', tankCapacity: 42, cv: 82, kw: 60, displacementCc: 1242, years: '2008-2017', startYear: 2008, endYear: 2017, generation: 'VI Serie', euroStandard: 'Euro 4/5/6', transmission: 'Manuale 5m', driveType: 'FWD', avgConsumption: '5.7 L/100km' }
        ]
      },
      {
        name: 'Puma',
        category: 'SUV',
        motorizations: [
          { name: '1.0 EcoBoost Hybrid 125 CV mHEV (2024+ Restyling)', fuelType: 'Full / Mild Hybrid', tankCapacity: 42, cv: 125, kw: 92, displacementCc: 999, years: '2024+', startYear: 2024, generation: 'Restyling 2024', euroStandard: 'Euro 6e', transmission: 'Manuale 6m / Powershift 7m', driveType: 'FWD', avgConsumption: '5.4 L/100km' },
          { name: '1.0 EcoBoost Hybrid 125 CV mHEV (2019-2024)', fuelType: 'Full / Mild Hybrid', tankCapacity: 42, cv: 125, kw: 92, displacementCc: 999, years: '2019-2024', startYear: 2019, endYear: 2024, generation: 'I Serie', euroStandard: 'Euro 6d', transmission: 'Manuale 6m / Powershift 7m', driveType: 'FWD', avgConsumption: '5.5 L/100km' },
          { name: '1.0 EcoBoost Hybrid 155 CV mHEV', fuelType: 'Full / Mild Hybrid', tankCapacity: 42, cv: 155, kw: 114, displacementCc: 999, years: '2019+', startYear: 2019, euroStandard: 'Euro 6d/6e', transmission: 'Powershift 7m', driveType: 'FWD', avgConsumption: '5.6 L/100km' },
          { name: '1.5 EcoBlue Diesel 120 CV', fuelType: 'Diesel', tankCapacity: 42, cv: 120, kw: 88, displacementCc: 1499, years: '2020-2022', startYear: 2020, endYear: 2022, euroStandard: 'Euro 6d', transmission: 'Manuale 6m', driveType: 'FWD', avgConsumption: '4.6 L/100km' }
        ]
      },
      {
        name: 'Kuga',
        category: 'SUV',
        motorizations: [
          { name: '2.5 Plug-in Hybrid 243 CV (PHEV 2024+ Restyling)', fuelType: 'Plug-in Hybrid (PHEV)', tankCapacity: 43, batteryCapacity: 14.4, cv: 243, kw: 179, displacementCc: 2488, years: '2024+', startYear: 2024, generation: 'III Serie Restyling', euroStandard: 'Euro 6e', transmission: 'CVT e-Shifter', driveType: 'FWD', wltpElectricRangeKm: 69, avgConsumption: '0.9 L/100km + 15.0 kWh/100km' },
          { name: '2.5 Plug-in Hybrid 225 CV (PHEV 2020-2024)', fuelType: 'Plug-in Hybrid (PHEV)', tankCapacity: 43, batteryCapacity: 14.4, cv: 225, kw: 165, displacementCc: 2488, years: '2020-2024', startYear: 2020, endYear: 2024, generation: 'III Serie', euroStandard: 'Euro 6d', transmission: 'CVT e-Shifter', driveType: 'FWD', wltpElectricRangeKm: 64, avgConsumption: '1.2 L/100km + 15.5 kWh/100km' },
          { name: '2.5 Full Hybrid 180 CV FWD', fuelType: 'Full / Mild Hybrid', tankCapacity: 54, cv: 180, kw: 132, displacementCc: 2488, years: '2021+', startYear: 2021, euroStandard: 'Euro 6d/6e', transmission: 'CVT', driveType: 'FWD', avgConsumption: '5.4 L/100km' }
        ]
      }
    ]
  },
  {
    brand: 'Jeep',
    country: 'USA / Italia',
    models: [
      {
        name: 'Renegade',
        category: 'SUV',
        motorizations: [
          { name: '1.3 T4 4xe Plug-in Hybrid 190 CV (PHEV)', fuelType: 'Plug-in Hybrid (PHEV)', tankCapacity: 36, batteryCapacity: 11.4, cv: 190, kw: 140, displacementCc: 1332, years: '2020+', startYear: 2020, generation: '4xe Plug-in', euroStandard: 'Euro 6d', transmission: 'Automatico 6m', driveType: 'AWD / 4x4', wltpElectricRangeKm: 50, avgConsumption: '1.8 L/100km + 16.0 kWh/100km' },
          { name: '1.3 T4 4xe Plug-in Hybrid 240 CV Trailhawk (PHEV)', fuelType: 'Plug-in Hybrid (PHEV)', tankCapacity: 36, batteryCapacity: 11.4, cv: 240, kw: 177, displacementCc: 1332, years: '2020+', startYear: 2020, generation: '4xe Plug-in', euroStandard: 'Euro 6d', transmission: 'Automatico 6m', driveType: 'AWD / 4x4', wltpElectricRangeKm: 49, avgConsumption: '1.9 L/100km + 16.5 kWh/100km' },
          { name: '1.5 e-Hybrid 130 CV DCT7', fuelType: 'Full / Mild Hybrid', tankCapacity: 48, cv: 130, kw: 96, displacementCc: 1469, years: '2022+', startYear: 2022, euroStandard: 'Euro 6d/6e', transmission: 'Doppia Frizione DCT7', driveType: 'FWD', avgConsumption: '5.9 L/100km' },
          { name: '1.6 MultiJet II 120/130 CV', fuelType: 'Diesel', tankCapacity: 48, cv: 130, kw: 96, displacementCc: 1598, years: '2014-2023', startYear: 2014, endYear: 2023, euroStandard: 'Euro 6d', transmission: 'Manuale 6m / DDCT', driveType: 'FWD', avgConsumption: '5.1 L/100km' }
        ]
      },
      {
        name: 'Compass',
        category: 'SUV',
        motorizations: [
          { name: '1.3 T4 4xe Plug-in Hybrid 190 CV (PHEV)', fuelType: 'Plug-in Hybrid (PHEV)', tankCapacity: 36, batteryCapacity: 11.4, cv: 190, kw: 140, displacementCc: 1332, years: '2020+', startYear: 2020, generation: '4xe Plug-in', euroStandard: 'Euro 6d', transmission: 'Automatico 6m', driveType: 'AWD / 4x4', wltpElectricRangeKm: 50, avgConsumption: '1.9 L/100km + 16.5 kWh/100km' },
          { name: '1.3 T4 4xe Plug-in Hybrid 240 CV (PHEV)', fuelType: 'Plug-in Hybrid (PHEV)', tankCapacity: 36, batteryCapacity: 11.4, cv: 240, kw: 177, displacementCc: 1332, years: '2020+', startYear: 2020, generation: '4xe Plug-in', euroStandard: 'Euro 6d', transmission: 'Automatico 6m', driveType: 'AWD / 4x4', wltpElectricRangeKm: 48, avgConsumption: '2.0 L/100km + 17.0 kWh/100km' },
          { name: '1.5 e-Hybrid 130 CV DCT7', fuelType: 'Full / Mild Hybrid', tankCapacity: 55, cv: 130, kw: 96, displacementCc: 1469, years: '2022+', startYear: 2022, euroStandard: 'Euro 6d/6e', transmission: 'DCT 7m', driveType: 'FWD', avgConsumption: '6.0 L/100km' }
        ]
      },
      {
        name: 'Avenger',
        category: 'SUV',
        motorizations: [
          { name: '1.2 Turbo Benzina 100 CV', fuelType: 'Benzina', tankCapacity: 44, cv: 100, kw: 74, displacementCc: 1199, years: '2023+', startYear: 2023, euroStandard: 'Euro 6d/6e', transmission: 'Manuale 6m', driveType: 'FWD', avgConsumption: '5.6 L/100km' },
          { name: '1.2 e-Hybrid 100 CV e-DCT6', fuelType: 'Full / Mild Hybrid', tankCapacity: 44, cv: 100, kw: 74, displacementCc: 1199, years: '2023+', startYear: 2023, euroStandard: 'Euro 6e', transmission: 'Automatico e-DCT6', driveType: 'FWD', avgConsumption: '5.0 L/100km' },
          { name: '1.2 4xe Ibrida Integrale 136 CV', fuelType: 'Full / Mild Hybrid', tankCapacity: 44, cv: 136, kw: 100, displacementCc: 1199, years: '2024+', startYear: 2024, euroStandard: 'Euro 6e', transmission: 'Automatico e-DCT6', driveType: 'AWD / 4x4', avgConsumption: '5.4 L/100km' },
          { name: 'Elettrica 156 CV (Batteria 54 kWh)', fuelType: 'Elettrica (BEV)', tankCapacity: 0, batteryCapacity: 54, cv: 156, kw: 115, years: '2023+', startYear: 2023, transmission: 'Monomarcia', driveType: 'FWD', wltpElectricRangeKm: 400, avgConsumption: '15.4 kWh/100km' }
        ]
      }
    ]
  },
  {
    brand: 'Mercedes-Benz',
    country: 'Germania',
    models: [
      {
        name: 'Classe A',
        category: 'Compatta',
        motorizations: [
          { name: 'A 250 e Plug-in Hybrid 218 CV 8G-DCT (PHEV)', fuelType: 'Plug-in Hybrid (PHEV)', tankCapacity: 35, batteryCapacity: 15.6, cv: 218, kw: 160, displacementCc: 1332, years: '2020+', startYear: 2020, generation: 'W177 Restyling', euroStandard: 'Euro 6d/6e', transmission: '8G-DCT', driveType: 'FWD', wltpElectricRangeKm: 76, avgConsumption: '0.9 L/100km + 15.0 kWh/100km' },
          { name: 'A 180 d 2.0 116 CV 8G-DCT', fuelType: 'Diesel', tankCapacity: 43, cv: 116, kw: 85, displacementCc: 1950, years: '2018+', startYear: 2018, euroStandard: 'Euro 6d', transmission: '8G-DCT', driveType: 'FWD', avgConsumption: '4.8 L/100km' },
          { name: 'A 200 d 2.0 150 CV 8G-DCT', fuelType: 'Diesel', tankCapacity: 43, cv: 150, kw: 110, displacementCc: 1950, years: '2018+', startYear: 2018, euroStandard: 'Euro 6d', transmission: '8G-DCT', driveType: 'FWD', avgConsumption: '4.9 L/100km' },
          { name: 'A 200 MHEV 163 CV 7G-DCT', fuelType: 'Full / Mild Hybrid', tankCapacity: 43, cv: 163, kw: 120, displacementCc: 1332, years: '2022+', startYear: 2022, euroStandard: 'Euro 6d/6e', transmission: '7G-DCT', driveType: 'FWD', avgConsumption: '5.8 L/100km' }
        ]
      },
      {
        name: 'GLA',
        category: 'SUV',
        motorizations: [
          { name: 'GLA 250 e Plug-in Hybrid 218 CV (PHEV)', fuelType: 'Plug-in Hybrid (PHEV)', tankCapacity: 35, batteryCapacity: 15.6, cv: 218, kw: 160, displacementCc: 1332, years: '2020+', startYear: 2020, generation: 'H247', euroStandard: 'Euro 6d', transmission: '8G-DCT', driveType: 'FWD', wltpElectricRangeKm: 68, avgConsumption: '1.2 L/100km + 16.0 kWh/100km' },
          { name: 'GLA 200 d 150 CV 8G-DCT', fuelType: 'Diesel', tankCapacity: 43, cv: 150, kw: 110, displacementCc: 1950, years: '2020+', startYear: 2020, euroStandard: 'Euro 6d', transmission: '8G-DCT', driveType: 'FWD', avgConsumption: '5.3 L/100km' }
        ]
      },
      {
        name: 'GLC / GLC Coupé',
        category: 'SUV',
        motorizations: [
          { name: 'GLC 300 e Plug-in 4MATIC 313 CV (Batteria 31.2 kWh PHEV)', fuelType: 'Plug-in Hybrid (PHEV)', tankCapacity: 49, batteryCapacity: 31.2, cv: 313, kw: 230, displacementCc: 1999, years: '2022+', startYear: 2022, generation: 'X254', euroStandard: 'Euro 6d/6e', transmission: '9G-TRONIC', driveType: 'AWD / 4x4', wltpElectricRangeKm: 130, avgConsumption: '0.6 L/100km + 20.0 kWh/100km' },
          { name: 'GLC 300 de Plug-in Diesel 4MATIC 333 CV (Batteria 31.2 kWh PHEV)', fuelType: 'Plug-in Hybrid (PHEV)', tankCapacity: 49, batteryCapacity: 31.2, cv: 333, kw: 245, displacementCc: 1993, years: '2022+', startYear: 2022, generation: 'X254', euroStandard: 'Euro 6d/6e', transmission: '9G-TRONIC', driveType: 'AWD / 4x4', wltpElectricRangeKm: 128, avgConsumption: '0.5 L/100km + 21.0 kWh/100km' },
          { name: 'GLC 220 d 4MATIC 197 CV MHEV', fuelType: 'Diesel', tankCapacity: 62, cv: 197, kw: 145, displacementCc: 1993, years: '2022+', startYear: 2022, euroStandard: 'Euro 6d/6e', transmission: '9G-TRONIC', driveType: 'AWD / 4x4', avgConsumption: '5.5 L/100km' }
        ]
      }
    ]
  },
  {
    brand: 'MG',
    country: 'Regno Unito / Cina',
    models: [
      {
        name: 'MG4',
        category: 'Compatta',
        motorizations: [
          { name: 'Standard 51 kWh LFP 170 CV (BEV)', fuelType: 'Elettrica (BEV)', tankCapacity: 0, batteryCapacity: 51, cv: 170, kw: 125, years: '2022+', startYear: 2022, transmission: 'Monomarcia', driveType: 'RWD', wltpElectricRangeKm: 350, avgConsumption: '17.0 kWh/100km' },
          { name: 'Comfort / Luxury 64 kWh NMC 204 CV (BEV)', fuelType: 'Elettrica (BEV)', tankCapacity: 0, batteryCapacity: 64, cv: 204, kw: 150, years: '2022+', startYear: 2022, transmission: 'Monomarcia', driveType: 'RWD', wltpElectricRangeKm: 450, avgConsumption: '16.0 kWh/100km' },
          { name: 'XPOWER AWD 435 CV (Batteria 64 kWh)', fuelType: 'Elettrica (BEV)', tankCapacity: 0, batteryCapacity: 64, cv: 435, kw: 320, years: '2023+', startYear: 2023, transmission: 'Monomarcia', driveType: 'AWD / 4x4', wltpElectricRangeKm: 385, avgConsumption: '18.7 kWh/100km' }
        ]
      },
      {
        name: 'MG3',
        category: 'Compatta',
        motorizations: [
          { name: 'Hybrid+ 195 CV Automatica 3m', fuelType: 'Full / Mild Hybrid', tankCapacity: 36, cv: 195, kw: 143, displacementCc: 1498, years: '2024+', startYear: 2024, euroStandard: 'Euro 6e', transmission: 'Automatica 3 rapporti', driveType: 'FWD', avgConsumption: '4.4 L/100km' }
        ]
      },
      {
        name: 'MG HS / EHS',
        category: 'SUV',
        motorizations: [
          { name: 'EHS Plug-in Hybrid 258 CV (PHEV 2021-2024)', fuelType: 'Plug-in Hybrid (PHEV)', tankCapacity: 37, batteryCapacity: 16.6, cv: 258, kw: 190, displacementCc: 1490, years: '2021-2024', startYear: 2021, endYear: 2024, euroStandard: 'Euro 6d', transmission: '10 rapporti (4+6)', driveType: 'FWD', wltpElectricRangeKm: 52, avgConsumption: '1.8 L/100km + 17.5 kWh/100km' },
          { name: 'HS Plug-in Hybrid 307 CV (PHEV 2024+ Nuova)', fuelType: 'Plug-in Hybrid (PHEV)', tankCapacity: 55, batteryCapacity: 21.4, cv: 307, kw: 226, displacementCc: 1490, years: '2024+', startYear: 2024, generation: 'II Serie 2024+', euroStandard: 'Euro 6e', transmission: 'Automatica 2m', driveType: 'FWD', wltpElectricRangeKm: 103, avgConsumption: '0.5 L/100km + 16.5 kWh/100km' }
        ]
      }
    ]
  },
  {
    brand: 'Peugeot',
    country: 'Francia',
    models: [
      {
        name: '208',
        category: 'Compatta',
        motorizations: [
          { name: 'Hybrid 100 CV e-DCS6 (Restyling 2024+)', fuelType: 'Full / Mild Hybrid', tankCapacity: 44, cv: 100, kw: 74, displacementCc: 1199, years: '2024+', startYear: 2024, generation: 'II Serie Restyling', euroStandard: 'Euro 6e', transmission: 'e-DCS6', driveType: 'FWD', avgConsumption: '4.5 L/100km' },
          { name: 'Hybrid 136 CV e-DCS6 (Restyling 2024+)', fuelType: 'Full / Mild Hybrid', tankCapacity: 44, cv: 136, kw: 100, displacementCc: 1199, years: '2024+', startYear: 2024, generation: 'II Serie Restyling', euroStandard: 'Euro 6e', transmission: 'e-DCS6', driveType: 'FWD', avgConsumption: '4.7 L/100km' },
          { name: '1.2 PureTech 100 CV Manuale', fuelType: 'Benzina', tankCapacity: 44, cv: 100, kw: 74, displacementCc: 1199, years: '2019+', startYear: 2019, euroStandard: 'Euro 6d', transmission: 'Manuale 6m', driveType: 'FWD', avgConsumption: '5.3 L/100km' },
          { name: 'E-208 Elettrica 156 CV (Batteria 51 kWh)', fuelType: 'Elettrica (BEV)', tankCapacity: 0, batteryCapacity: 51, cv: 156, kw: 115, years: '2023+', startYear: 2023, transmission: 'Monomarcia', driveType: 'FWD', wltpElectricRangeKm: 410, avgConsumption: '14.5 kWh/100km' },
          { name: 'E-208 Elettrica 136 CV (Batteria 50 kWh)', fuelType: 'Elettrica (BEV)', tankCapacity: 0, batteryCapacity: 50, cv: 136, kw: 100, years: '2019-2023', startYear: 2019, endYear: 2023, transmission: 'Monomarcia', driveType: 'FWD', wltpElectricRangeKm: 362, avgConsumption: '15.5 kWh/100km' }
        ]
      },
      {
        name: '3008',
        category: 'SUV',
        motorizations: [
          { name: 'Plug-in Hybrid 195 CV e-DCS7 (PHEV 2024+ III Serie)', fuelType: 'Plug-in Hybrid (PHEV)', tankCapacity: 55, batteryCapacity: 21.0, cv: 195, kw: 143, displacementCc: 1598, years: '2024+', startYear: 2024, generation: 'III Serie Fastback', euroStandard: 'Euro 6e', transmission: 'e-DCS7', driveType: 'FWD', wltpElectricRangeKm: 87, avgConsumption: '0.9 L/100km + 16.0 kWh/100km' },
          { name: 'Hybrid 136 CV e-DCS6', fuelType: 'Full / Mild Hybrid', tankCapacity: 55, cv: 136, kw: 100, displacementCc: 1199, years: '2023+', startYear: 2023, euroStandard: 'Euro 6d/6e', transmission: 'e-DCS6', driveType: 'FWD', avgConsumption: '5.5 L/100km' },
          { name: 'HYBRID4 300 CV e-EAT8 (PHEV 2020-2024)', fuelType: 'Plug-in Hybrid (PHEV)', tankCapacity: 43, batteryCapacity: 13.2, cv: 300, kw: 221, displacementCc: 1598, years: '2020-2024', startYear: 2020, endYear: 2024, generation: 'II Serie', euroStandard: 'Euro 6d', transmission: 'e-EAT8', driveType: 'AWD / 4x4', wltpElectricRangeKm: 59, avgConsumption: '1.4 L/100km + 15.5 kWh/100km' }
        ]
      }
    ]
  },
  {
    brand: 'Renault',
    country: 'Francia',
    models: [
      {
        name: 'Clio',
        category: 'Compatta',
        motorizations: [
          { name: 'E-Tech Full Hybrid 145 CV (Restyling 2023+)', fuelType: 'Full / Mild Hybrid', tankCapacity: 39, cv: 145, kw: 107, displacementCc: 1598, years: '2023+', startYear: 2023, generation: 'V Serie Restyling', euroStandard: 'Euro 6e', transmission: 'Multimode automatica', driveType: 'FWD', avgConsumption: '4.2 L/100km' },
          { name: 'TCe 100 GPL ECO-G', fuelType: 'GPL (Benzina + GPL)', tankCapacity: 39, secondaryTankCapacity: 32, cv: 100, kw: 74, displacementCc: 999, years: '2019+', startYear: 2019, generation: 'V Serie', euroStandard: 'Euro 6d', transmission: 'Manuale 6m', driveType: 'FWD', avgConsumption: '6.9 L/100km GPL' },
          { name: 'TCe 90 CV Manuale', fuelType: 'Benzina', tankCapacity: 42, cv: 90, kw: 66, displacementCc: 999, years: '2019+', startYear: 2019, euroStandard: 'Euro 6d', transmission: 'Manuale 6m', driveType: 'FWD', avgConsumption: '5.2 L/100km' },
          { name: 'dCi 100 CV Diesel', fuelType: 'Diesel', tankCapacity: 39, cv: 100, kw: 74, displacementCc: 1461, years: '2020+', startYear: 2020, euroStandard: 'Euro 6d', transmission: 'Manuale 6m', driveType: 'FWD', avgConsumption: '4.1 L/100km' }
        ]
      },
      {
        name: 'Captur',
        category: 'SUV',
        motorizations: [
          { name: 'E-Tech Full Hybrid 145 CV (Restyling 2024+)', fuelType: 'Full / Mild Hybrid', tankCapacity: 48, cv: 145, kw: 107, displacementCc: 1598, years: '2024+', startYear: 2024, generation: 'II Serie Restyling', euroStandard: 'Euro 6e', transmission: 'Multimode', driveType: 'FWD', avgConsumption: '4.7 L/100km' },
          { name: 'TCe 100 GPL ECO-G', fuelType: 'GPL (Benzina + GPL)', tankCapacity: 48, secondaryTankCapacity: 40, cv: 100, kw: 74, displacementCc: 999, years: '2020+', startYear: 2020, generation: 'II Serie', euroStandard: 'Euro 6d', transmission: 'Manuale 6m', driveType: 'FWD', avgConsumption: '7.5 L/100km GPL' },
          { name: 'E-Tech Plug-in Hybrid 160 CV (PHEV 2020-2023)', fuelType: 'Plug-in Hybrid (PHEV)', tankCapacity: 39, batteryCapacity: 9.8, cv: 160, kw: 118, displacementCc: 1598, years: '2020-2023', startYear: 2020, endYear: 2023, generation: 'II Serie', euroStandard: 'Euro 6d', transmission: 'Multimode', driveType: 'FWD', wltpElectricRangeKm: 50, avgConsumption: '1.3 L/100km + 14.0 kWh/100km' }
        ]
      }
    ]
  },
  {
    brand: 'Tesla',
    country: 'USA',
    models: [
      {
        name: 'Model 3',
        category: 'Berlina',
        motorizations: [
          { name: 'RWD Standard Range 283 CV (Batteria 60 kWh LFP Highland 2023+)', fuelType: 'Elettrica (BEV)', tankCapacity: 0, batteryCapacity: 60, cv: 283, kw: 208, years: '2023+', startYear: 2023, generation: 'Highland Restyling', transmission: 'Monomarcia', driveType: 'RWD', wltpElectricRangeKm: 513, avgConsumption: '13.2 kWh/100km' },
          { name: 'Long Range AWD 498 CV (Batteria 78 kWh Highland 2023+)', fuelType: 'Elettrica (BEV)', tankCapacity: 0, batteryCapacity: 78, cv: 498, kw: 366, years: '2023+', startYear: 2023, generation: 'Highland Restyling', transmission: 'Monomarcia', driveType: 'AWD / 4x4', wltpElectricRangeKm: 629, avgConsumption: '14.0 kWh/100km' },
          { name: 'Performance AWD 627 CV (Batteria 78 kWh Highland 2024+)', fuelType: 'Elettrica (BEV)', tankCapacity: 0, batteryCapacity: 78, cv: 627, kw: 461, years: '2024+', startYear: 2024, generation: 'Highland Restyling', transmission: 'Monomarcia', driveType: 'AWD / 4x4', wltpElectricRangeKm: 528, avgConsumption: '16.7 kWh/100km' },
          { name: 'RWD Standard Plus (Batteria 55/60 kWh 2019-2023)', fuelType: 'Elettrica (BEV)', tankCapacity: 0, batteryCapacity: 60, cv: 325, kw: 239, years: '2019-2023', startYear: 2019, endYear: 2023, generation: 'I Serie', transmission: 'Monomarcia', driveType: 'RWD', wltpElectricRangeKm: 448, avgConsumption: '14.4 kWh/100km' }
        ]
      },
      {
        name: 'Model Y',
        category: 'SUV',
        motorizations: [
          { name: 'RWD Standard Range 299 CV (Batteria 60 kWh)', fuelType: 'Elettrica (BEV)', tankCapacity: 0, batteryCapacity: 60, cv: 299, kw: 220, years: '2022+', startYear: 2022, transmission: 'Monomarcia', driveType: 'RWD', wltpElectricRangeKm: 455, avgConsumption: '15.7 kWh/100km' },
          { name: 'Long Range AWD 514 CV (Batteria 78 kWh)', fuelType: 'Elettrica (BEV)', tankCapacity: 0, batteryCapacity: 78, cv: 514, kw: 378, years: '2021+', startYear: 2021, transmission: 'Monomarcia', driveType: 'AWD / 4x4', wltpElectricRangeKm: 533, avgConsumption: '16.9 kWh/100km' },
          { name: 'Performance AWD 534 CV (Batteria 78 kWh)', fuelType: 'Elettrica (BEV)', tankCapacity: 0, batteryCapacity: 78, cv: 534, kw: 393, years: '2022+', startYear: 2022, transmission: 'Monomarcia', driveType: 'AWD / 4x4', wltpElectricRangeKm: 514, avgConsumption: '17.3 kWh/100km' }
        ]
      }
    ]
  },
  {
    brand: 'Toyota',
    country: 'Giappone',
    models: [
      {
        name: 'Yaris',
        category: 'Compatta',
        motorizations: [
          { name: '1.5 Hybrid 130 CV e-CVT (2024+)', fuelType: 'Full / Mild Hybrid', tankCapacity: 36, cv: 130, kw: 96, displacementCc: 1490, years: '2024+', startYear: 2024, generation: 'IV Serie Restyling', euroStandard: 'Euro 6e', transmission: 'e-CVT', driveType: 'FWD', avgConsumption: '4.2 L/100km' },
          { name: '1.5 Hybrid 116 CV e-CVT (2020+)', fuelType: 'Full / Mild Hybrid', tankCapacity: 36, cv: 116, kw: 85, displacementCc: 1490, years: '2020+', startYear: 2020, generation: 'IV Serie', euroStandard: 'Euro 6d/6e', transmission: 'e-CVT', driveType: 'FWD', avgConsumption: '3.8 L/100km' },
          { name: '1.0 VVT-i 72 CV Manuale', fuelType: 'Benzina', tankCapacity: 40, cv: 72, kw: 53, displacementCc: 998, years: '2020+', startYear: 2020, euroStandard: 'Euro 6d', transmission: 'Manuale 5m', driveType: 'FWD', avgConsumption: '5.1 L/100km' }
        ]
      },
      {
        name: 'Yaris Cross',
        category: 'SUV',
        motorizations: [
          { name: '1.5 Hybrid 130 CV FWD / AWD-i (2024+)', fuelType: 'Full / Mild Hybrid', tankCapacity: 36, cv: 130, kw: 96, displacementCc: 1490, years: '2024+', startYear: 2024, generation: 'Restyling 2024', euroStandard: 'Euro 6e', transmission: 'e-CVT', driveType: 'FWD', avgConsumption: '4.8 L/100km' },
          { name: '1.5 Hybrid 116 CV FWD / AWD-i (2021+)', fuelType: 'Full / Mild Hybrid', tankCapacity: 36, cv: 116, kw: 85, displacementCc: 1490, years: '2021+', startYear: 2021, generation: 'I Serie', euroStandard: 'Euro 6d', transmission: 'e-CVT', driveType: 'FWD', avgConsumption: '4.4 L/100km' }
        ]
      },
      {
        name: 'C-HR',
        category: 'SUV',
        motorizations: [
          { name: '2.0 Plug-in Hybrid 223 CV (PHEV 2024+ II Serie)', fuelType: 'Plug-in Hybrid (PHEV)', tankCapacity: 43, batteryCapacity: 13.6, cv: 223, kw: 164, displacementCc: 1987, years: '2024+', startYear: 2024, generation: 'II Serie 2024+', euroStandard: 'Euro 6e', transmission: 'e-CVT', driveType: 'FWD', wltpElectricRangeKm: 66, avgConsumption: '0.9 L/100km + 14.0 kWh/100km' },
          { name: '1.8 Full Hybrid 140 CV e-CVT (2024+)', fuelType: 'Full / Mild Hybrid', tankCapacity: 43, cv: 140, kw: 103, displacementCc: 1798, years: '2024+', startYear: 2024, generation: 'II Serie 2024+', euroStandard: 'Euro 6e', transmission: 'e-CVT', driveType: 'FWD', avgConsumption: '4.8 L/100km' },
          { name: '2.0 Full Hybrid 197 CV e-CVT (2024+)', fuelType: 'Full / Mild Hybrid', tankCapacity: 43, cv: 197, kw: 145, displacementCc: 1987, years: '2024+', startYear: 2024, generation: 'II Serie 2024+', euroStandard: 'Euro 6e', transmission: 'e-CVT', driveType: 'FWD', avgConsumption: '5.0 L/100km' },
          { name: '1.8 Full Hybrid 122 CV (I Serie 2016-2023)', fuelType: 'Full / Mild Hybrid', tankCapacity: 43, cv: 122, kw: 90, displacementCc: 1798, years: '2016-2023', startYear: 2016, endYear: 2023, generation: 'I Serie', euroStandard: 'Euro 6b/6d', transmission: 'e-CVT', driveType: 'FWD', avgConsumption: '4.9 L/100km' }
        ]
      }
    ]
  },
  {
    brand: 'Volkswagen',
    country: 'Germania',
    models: [
      {
        name: 'Golf',
        category: 'Compatta',
        motorizations: [
          // 2024+ Golf 8.5 Restyling (New 1.5 eHybrid 19.7 kWh)
          { name: '1.5 eHybrid Plug-in 204 CV DSG (PHEV 2024+ Restyling)', fuelType: 'Plug-in Hybrid (PHEV)', tankCapacity: 45, batteryCapacity: 19.7, cv: 204, kw: 150, displacementCc: 1498, years: '2024+', startYear: 2024, generation: 'Golf 8.5 Restyling', euroStandard: 'Euro 6e', transmission: 'DSG 6 rapporti', driveType: 'FWD', wltpElectricRangeKm: 142, avgConsumption: '0.3 L/100km + 15.0 kWh/100km' },
          { name: 'GTE 1.5 TSI Plug-in 272 CV DSG (PHEV 2024+ Restyling)', fuelType: 'Plug-in Hybrid (PHEV)', tankCapacity: 45, batteryCapacity: 19.7, cv: 272, kw: 200, displacementCc: 1498, years: '2024+', startYear: 2024, generation: 'Golf 8.5 Restyling', euroStandard: 'Euro 6e', transmission: 'DSG 6 rapporti', driveType: 'FWD', wltpElectricRangeKm: 131, avgConsumption: '0.4 L/100km + 15.5 kWh/100km' },
          // 2020-2024 Golf 8 Pre-Restyling (1.4 TSI 13.0 kWh)
          { name: '1.4 eHybrid Plug-in 204 CV DSG (PHEV 2020-2024)', fuelType: 'Plug-in Hybrid (PHEV)', tankCapacity: 40, batteryCapacity: 13.0, cv: 204, kw: 150, displacementCc: 1395, years: '2020-2024', startYear: 2020, endYear: 2024, generation: 'Golf VIII', euroStandard: 'Euro 6d', transmission: 'DSG 6 rapporti', driveType: 'FWD', wltpElectricRangeKm: 71, avgConsumption: '1.2 L/100km + 14.0 kWh/100km' },
          { name: 'GTE 1.4 Plug-in 245 CV DSG (PHEV 2020-2024)', fuelType: 'Plug-in Hybrid (PHEV)', tankCapacity: 40, batteryCapacity: 13.0, cv: 245, kw: 180, displacementCc: 1395, years: '2020-2024', startYear: 2020, endYear: 2024, generation: 'Golf VIII', euroStandard: 'Euro 6d', transmission: 'DSG 6 rapporti', driveType: 'FWD', wltpElectricRangeKm: 64, avgConsumption: '1.3 L/100km + 14.5 kWh/100km' },
          // 2020-2024 Diesel & Mild Hybrid
          { name: '2.0 TDI 115 CV Manuale', fuelType: 'Diesel', tankCapacity: 50, cv: 115, kw: 85, displacementCc: 1968, years: '2020-2024', startYear: 2020, endYear: 2024, generation: 'Golf VIII', euroStandard: 'Euro 6d/6e', transmission: 'Manuale 6m', driveType: 'FWD', avgConsumption: '4.5 L/100km' },
          { name: '2.0 TDI 150 CV DSG', fuelType: 'Diesel', tankCapacity: 50, cv: 150, kw: 110, displacementCc: 1968, years: '2020-2024', startYear: 2020, endYear: 2024, generation: 'Golf VIII', euroStandard: 'Euro 6d/6e', transmission: 'DSG 7 rapporti', driveType: 'FWD', avgConsumption: '4.7 L/100km' },
          { name: '1.5 eTSI 150 CV MHEV DSG', fuelType: 'Full / Mild Hybrid', tankCapacity: 50, cv: 150, kw: 110, displacementCc: 1498, years: '2020-2024', startYear: 2020, endYear: 2024, generation: 'Golf VIII', euroStandard: 'Euro 6d/6e', transmission: 'DSG 7 rapporti', driveType: 'FWD', avgConsumption: '5.5 L/100km' },
          // 2012-2020 Golf VII
          { name: '1.6 TDI 115 CV (Golf 7)', fuelType: 'Diesel', tankCapacity: 50, cv: 115, kw: 85, displacementCc: 1598, years: '2012-2020', startYear: 2012, endYear: 2020, generation: 'Golf VII', euroStandard: 'Euro 6', transmission: 'Manuale 5m', driveType: 'FWD', avgConsumption: '4.3 L/100km' },
          { name: '2.0 TDI 150 CV (Golf 7)', fuelType: 'Diesel', tankCapacity: 50, cv: 150, kw: 110, displacementCc: 1968, years: '2012-2020', startYear: 2012, endYear: 2020, generation: 'Golf VII', euroStandard: 'Euro 6', transmission: 'Manuale 6m / DSG', driveType: 'FWD', avgConsumption: '4.6 L/100km' },
          { name: '1.4 TGI Metano 110 CV (Golf 7)', fuelType: 'Metano (Benzina + Metano)', tankCapacity: 50, secondaryTankCapacity: 15, cv: 110, kw: 81, displacementCc: 1395, years: '2013-2018', startYear: 2013, endYear: 2018, generation: 'Golf VII', euroStandard: 'Euro 6', transmission: 'Manuale 6m', driveType: 'FWD', avgConsumption: '3.6 kg/100km' },
          // 2008-2012 Golf VI
          { name: '1.6 TDI 105 CV DPF (Golf 6)', fuelType: 'Diesel', tankCapacity: 55, cv: 105, kw: 77, displacementCc: 1598, years: '2008-2012', startYear: 2008, endYear: 2012, generation: 'Golf VI', euroStandard: 'Euro 5', transmission: 'Manuale 5m', driveType: 'FWD', avgConsumption: '4.5 L/100km' },
          { name: '2.0 TDI 140 CV DPF (Golf 6)', fuelType: 'Diesel', tankCapacity: 55, cv: 140, kw: 103, displacementCc: 1968, years: '2008-2012', startYear: 2008, endYear: 2012, generation: 'Golf VI', euroStandard: 'Euro 5', transmission: 'Manuale 6m', driveType: 'FWD', avgConsumption: '4.9 L/100km' },
          // 2003-2008 Golf V (5ª Serie)
          { name: '1.9 TDI 105 CV (Golf 5)', fuelType: 'Diesel', tankCapacity: 55, cv: 105, kw: 77, displacementCc: 1896, years: '2003-2008', startYear: 2003, endYear: 2008, generation: 'Golf V (1K)', euroStandard: 'Euro 4', transmission: 'Manuale 5m / 6m', driveType: 'FWD', avgConsumption: '5.2 L/100km' },
          { name: '2.0 TDI 140 CV 16V (Golf 5)', fuelType: 'Diesel', tankCapacity: 55, cv: 140, kw: 103, displacementCc: 1968, years: '2003-2008', startYear: 2003, endYear: 2008, generation: 'Golf V (1K)', euroStandard: 'Euro 4', transmission: 'Manuale 6m / DSG', driveType: 'FWD', avgConsumption: '5.5 L/100km' },
          { name: '1.6 102 CV BiFuel GPL (Golf 5)', fuelType: 'GPL (Benzina + GPL)', tankCapacity: 55, secondaryTankCapacity: 45, cv: 102, kw: 75, displacementCc: 1595, years: '2004-2008', startYear: 2004, endYear: 2008, generation: 'Golf V (1K)', euroStandard: 'Euro 4', transmission: 'Manuale 5m', driveType: 'FWD', avgConsumption: '7.8 L/100km GPL' },
          { name: '1.4 TSI 122 CV (Golf 5)', fuelType: 'Benzina', tankCapacity: 55, cv: 122, kw: 90, displacementCc: 1390, years: '2007-2008', startYear: 2007, endYear: 2008, generation: 'Golf V (1K)', euroStandard: 'Euro 4', transmission: 'Manuale 6m', driveType: 'FWD', avgConsumption: '6.3 L/100km' },
          { name: 'GTI 2.0 TFSI 200 CV (Golf 5)', fuelType: 'Benzina', tankCapacity: 55, cv: 200, kw: 147, displacementCc: 1984, years: '2004-2008', startYear: 2004, endYear: 2008, generation: 'Golf V (1K)', euroStandard: 'Euro 4', transmission: 'Manuale 6m / DSG', driveType: 'FWD', avgConsumption: '8.0 L/100km' }
        ]
      },
      {
        name: 'Tiguan',
        category: 'SUV',
        motorizations: [
          // 2024+ Tiguan III
          { name: '1.5 eHybrid Plug-in 204 CV DSG (PHEV 2024+ III Serie)', fuelType: 'Plug-in Hybrid (PHEV)', tankCapacity: 45, batteryCapacity: 19.7, cv: 204, kw: 150, displacementCc: 1498, years: '2024+', startYear: 2024, generation: 'III Serie 2024+', euroStandard: 'Euro 6e', transmission: 'DSG 6 rapporti', driveType: 'FWD', wltpElectricRangeKm: 120, avgConsumption: '0.5 L/100km + 17.0 kWh/100km' },
          { name: '1.5 eHybrid Plug-in 272 CV DSG (PHEV 2024+ III Serie)', fuelType: 'Plug-in Hybrid (PHEV)', tankCapacity: 45, batteryCapacity: 19.7, cv: 272, kw: 200, displacementCc: 1498, years: '2024+', startYear: 2024, generation: 'III Serie 2024+', euroStandard: 'Euro 6e', transmission: 'DSG 6 rapporti', driveType: 'FWD', wltpElectricRangeKm: 118, avgConsumption: '0.5 L/100km + 17.5 kWh/100km' },
          { name: '2.0 TDI 150 CV DSG', fuelType: 'Diesel', tankCapacity: 58, cv: 150, kw: 110, displacementCc: 1968, years: '2024+', startYear: 2024, generation: 'III Serie', euroStandard: 'Euro 6e', transmission: 'DSG 7 rapporti', driveType: 'FWD', avgConsumption: '5.3 L/100km' },
          { name: '1.5 eTSI 150 CV MHEV DSG', fuelType: 'Full / Mild Hybrid', tankCapacity: 55, cv: 150, kw: 110, displacementCc: 1498, years: '2024+', startYear: 2024, generation: 'III Serie', euroStandard: 'Euro 6e', transmission: 'DSG 7 rapporti', driveType: 'FWD', avgConsumption: '6.4 L/100km' }
        ]
      },
      {
        name: 'T-Roc',
        category: 'SUV',
        motorizations: [
          { name: '1.0 TSI 110 CV Manuale', fuelType: 'Benzina', tankCapacity: 50, cv: 110, kw: 81, displacementCc: 999, years: '2017+', startYear: 2017, euroStandard: 'Euro 6d', transmission: 'Manuale 6m', driveType: 'FWD', avgConsumption: '6.0 L/100km' },
          { name: '1.5 TSI 150 CV DSG', fuelType: 'Benzina', tankCapacity: 50, cv: 150, kw: 110, displacementCc: 1498, years: '2017+', startYear: 2017, euroStandard: 'Euro 6d', transmission: 'DSG 7m', driveType: 'FWD', avgConsumption: '6.2 L/100km' },
          { name: '2.0 TDI 150 CV DSG', fuelType: 'Diesel', tankCapacity: 50, cv: 150, kw: 110, displacementCc: 1968, years: '2017+', startYear: 2017, euroStandard: 'Euro 6d', transmission: 'DSG 7m', driveType: 'FWD', avgConsumption: '4.9 L/100km' }
        ]
      }
    ]
  },
  {
    brand: 'Volvo',
    country: 'Svezia',
    models: [
      {
        name: 'XC40 / EX40',
        category: 'SUV',
        motorizations: [
          { name: 'T4 Recharge Plug-in Hybrid 211 CV (PHEV)', fuelType: 'Plug-in Hybrid (PHEV)', tankCapacity: 48, batteryCapacity: 10.7, cv: 211, kw: 155, displacementCc: 1477, years: '2020-2024', startYear: 2020, endYear: 2024, euroStandard: 'Euro 6d', transmission: '7 DCT', driveType: 'FWD', wltpElectricRangeKm: 45, avgConsumption: '2.1 L/100km + 15.0 kWh/100km' },
          { name: 'T5 Recharge Plug-in Hybrid 262 CV (PHEV)', fuelType: 'Plug-in Hybrid (PHEV)', tankCapacity: 48, batteryCapacity: 10.7, cv: 262, kw: 193, displacementCc: 1477, years: '2020-2024', startYear: 2020, endYear: 2024, euroStandard: 'Euro 6d', transmission: '7 DCT', driveType: 'FWD', wltpElectricRangeKm: 45, avgConsumption: '2.2 L/100km + 15.5 kWh/100km' },
          { name: 'B3 Mild Hybrid 163 CV', fuelType: 'Full / Mild Hybrid', tankCapacity: 54, cv: 163, kw: 120, displacementCc: 1969, years: '2021+', startYear: 2021, euroStandard: 'Euro 6d', transmission: 'Automatico 7m', driveType: 'FWD', avgConsumption: '6.7 L/100km' },
          { name: 'Recharge Single Motor 252 CV (Batteria 69 kWh)', fuelType: 'Elettrica (BEV)', tankCapacity: 0, batteryCapacity: 69, cv: 252, kw: 185, years: '2023+', startYear: 2023, transmission: 'Monomarcia', driveType: 'RWD', wltpElectricRangeKm: 475, avgConsumption: '16.9 kWh/100km' }
        ]
      },
      {
        name: 'EX30',
        category: 'SUV',
        motorizations: [
          { name: 'Single Motor 272 CV (Batteria 51 kWh LFP)', fuelType: 'Elettrica (BEV)', tankCapacity: 0, batteryCapacity: 51, cv: 272, kw: 200, years: '2023+', startYear: 2023, transmission: 'Monomarcia', driveType: 'RWD', wltpElectricRangeKm: 344, avgConsumption: '16.7 kWh/100km' },
          { name: 'Single Motor Extended Range 272 CV (69 kWh NMC)', fuelType: 'Elettrica (BEV)', tankCapacity: 0, batteryCapacity: 69, cv: 272, kw: 200, years: '2023+', startYear: 2023, transmission: 'Monomarcia', driveType: 'RWD', wltpElectricRangeKm: 476, avgConsumption: '17.0 kWh/100km' },
          { name: 'Twin Motor Performance 428 CV (69 kWh NMC)', fuelType: 'Elettrica (BEV)', tankCapacity: 0, batteryCapacity: 69, cv: 428, kw: 315, years: '2023+', startYear: 2023, transmission: 'Monomarcia', driveType: 'AWD / 4x4', wltpElectricRangeKm: 450, avgConsumption: '18.0 kWh/100km' }
        ]
      }
    ]
  },
  {
    brand: 'Citroën',
    country: 'Francia',
    models: [
      {
        name: 'C3',
        category: 'Compatta',
        motorizations: [
          // Nuova C3 2024+
          { name: '1.2 Hybrid 100 CV e-DCT6 (2024+ IV Serie)', fuelType: 'Full / Mild Hybrid', tankCapacity: 44, cv: 100, kw: 74, displacementCc: 1199, years: '2024+', startYear: 2024, generation: 'IV Serie 2024+', euroStandard: 'Euro 6e', transmission: 'e-DCT6', driveType: 'FWD', avgConsumption: '5.1 L/100km' },
          { name: '1.2 Turbo Benzina 100 CV (2024+)', fuelType: 'Benzina', tankCapacity: 44, cv: 100, kw: 74, displacementCc: 1199, years: '2024+', startYear: 2024, generation: 'IV Serie 2024+', euroStandard: 'Euro 6e', transmission: 'Manuale 6m', driveType: 'FWD', avgConsumption: '5.6 L/100km' },
          { name: 'ë-C3 Elettrica 113 CV (Batteria 44 kWh LFP)', fuelType: 'Elettrica (BEV)', tankCapacity: 0, batteryCapacity: 44, cv: 113, kw: 83, years: '2024+', startYear: 2024, generation: 'IV Serie ë-C3', transmission: 'Monomarcia', driveType: 'FWD', wltpElectricRangeKm: 320, avgConsumption: '16.4 kWh/100km' },
          // C3 III Serie 2016-2024
          { name: '1.2 PureTech 83 CV (C3 III Serie)', fuelType: 'Benzina', tankCapacity: 45, cv: 83, kw: 61, displacementCc: 1199, years: '2016-2024', startYear: 2016, endYear: 2024, generation: 'III Serie', euroStandard: 'Euro 6', transmission: 'Manuale 5m', driveType: 'FWD', avgConsumption: '5.2 L/100km' },
          { name: '1.2 PureTech 110 CV EAT6 / Manuale', fuelType: 'Benzina', tankCapacity: 45, cv: 110, kw: 81, displacementCc: 1199, years: '2016-2024', startYear: 2016, endYear: 2024, generation: 'III Serie', euroStandard: 'Euro 6', transmission: 'Manuale 6m / EAT6', driveType: 'FWD', avgConsumption: '5.5 L/100km' },
          { name: '1.5 BlueHDi 100 CV Diesel (C3 III Serie)', fuelType: 'Diesel', tankCapacity: 42, cv: 100, kw: 74, displacementCc: 1499, years: '2018-2023', startYear: 2018, endYear: 2023, generation: 'III Serie', euroStandard: 'Euro 6d', transmission: 'Manuale 6m', driveType: 'FWD', avgConsumption: '4.2 L/100km' },
          { name: '1.6 BlueHDi 75/100 CV (C3 III Serie)', fuelType: 'Diesel', tankCapacity: 42, cv: 100, kw: 74, displacementCc: 1560, years: '2016-2018', startYear: 2016, endYear: 2018, generation: 'III Serie', euroStandard: 'Euro 6', transmission: 'Manuale 5m', driveType: 'FWD', avgConsumption: '4.0 L/100km' },
          // C3 II Serie 2009-2016
          { name: '1.4 HDi 68/70 CV (C3 II Serie)', fuelType: 'Diesel', tankCapacity: 45, cv: 68, kw: 50, displacementCc: 1398, years: '2009-2015', startYear: 2009, endYear: 2015, generation: 'II Serie (A51)', euroStandard: 'Euro 4/5', transmission: 'Manuale 5m', driveType: 'FWD', avgConsumption: '4.3 L/100km' },
          { name: '1.4 GPL 73/95 CV (C3 II Serie)', fuelType: 'GPL (Benzina + GPL)', tankCapacity: 45, secondaryTankCapacity: 34, cv: 95, kw: 70, displacementCc: 1397, years: '2010-2016', startYear: 2010, endYear: 2016, generation: 'II Serie GPL', euroStandard: 'Euro 5', transmission: 'Manuale 5m', driveType: 'FWD', avgConsumption: '7.1 L/100km GPL' }
        ]
      },
      {
        name: 'C3 Aircross',
        category: 'SUV',
        motorizations: [
          { name: '1.2 Hybrid 136 CV e-DCT6 (2024+)', fuelType: 'Full / Mild Hybrid', tankCapacity: 44, cv: 136, kw: 100, displacementCc: 1199, years: '2024+', startYear: 2024, generation: 'II Serie', euroStandard: 'Euro 6e', transmission: 'e-DCT6', driveType: 'FWD', avgConsumption: '5.3 L/100km' },
          { name: '1.2 PureTech 110/130 CV (2017-2024)', fuelType: 'Benzina', tankCapacity: 45, cv: 110, kw: 81, displacementCc: 1199, years: '2017-2024', startYear: 2017, endYear: 2024, generation: 'I Serie', euroStandard: 'Euro 6', transmission: 'Manuale 6m / EAT6', driveType: 'FWD', avgConsumption: '5.9 L/100km' },
          { name: '1.5 BlueHDi 110/120 CV Diesel', fuelType: 'Diesel', tankCapacity: 45, cv: 110, kw: 81, displacementCc: 1499, years: '2017-2023', startYear: 2017, endYear: 2023, generation: 'I Serie', euroStandard: 'Euro 6d', transmission: 'Manuale 6m / EAT6', driveType: 'FWD', avgConsumption: '4.6 L/100km' }
        ]
      },
      {
        name: 'C4 / ë-C4',
        category: 'Berlina',
        motorizations: [
          { name: 'Hybrid 136 CV e-DSC6 (2024+)', fuelType: 'Full / Mild Hybrid', tankCapacity: 50, cv: 136, kw: 100, displacementCc: 1199, years: '2024+', startYear: 2024, euroStandard: 'Euro 6e', transmission: 'e-DSC6', driveType: 'FWD', avgConsumption: '4.7 L/100km' },
          { name: '1.5 BlueHDi 130 CV EAT8', fuelType: 'Diesel', tankCapacity: 50, cv: 130, kw: 96, displacementCc: 1499, years: '2020+', startYear: 2020, euroStandard: 'Euro 6d', transmission: 'EAT8', driveType: 'FWD', avgConsumption: '4.5 L/100km' },
          { name: 'ë-C4 Elettrica 156 CV (Batteria 54 kWh)', fuelType: 'Elettrica (BEV)', tankCapacity: 0, batteryCapacity: 54, cv: 156, kw: 115, years: '2023+', startYear: 2023, transmission: 'Monomarcia', driveType: 'FWD', wltpElectricRangeKm: 420, avgConsumption: '14.8 kWh/100km' }
        ]
      }
    ]
  },
  {
    brand: 'Hyundai',
    country: 'Corea del Sud',
    models: [
      {
        name: 'Tucson',
        category: 'SUV',
        motorizations: [
          // 2024+ Restyling
          { name: '1.6 T-GDI Plug-in Hybrid 253 CV 4WD (PHEV 2024+)', fuelType: 'Plug-in Hybrid (PHEV)', tankCapacity: 42, batteryCapacity: 13.8, cv: 253, kw: 186, displacementCc: 1598, years: '2024+', startYear: 2024, generation: 'IV Serie Restyling', euroStandard: 'Euro 6e', transmission: 'Automatico 6m', driveType: 'AWD / 4x4', wltpElectricRangeKm: 65, avgConsumption: '1.2 L/100km + 16.5 kWh/100km' },
          { name: '1.6 T-GDI Full Hybrid 215 CV (HEV 2024+)', fuelType: 'Full / Mild Hybrid', tankCapacity: 52, cv: 215, kw: 158, displacementCc: 1598, years: '2024+', startYear: 2024, generation: 'IV Serie Restyling', euroStandard: 'Euro 6e', transmission: 'Automatico 6m', driveType: 'FWD', avgConsumption: '5.6 L/100km' },
          // 2020-2024 Pre-Restyling
          { name: '1.6 T-GDI Plug-in Hybrid 265 CV 4WD (PHEV 2020-2024)', fuelType: 'Plug-in Hybrid (PHEV)', tankCapacity: 42, batteryCapacity: 13.8, cv: 265, kw: 195, displacementCc: 1598, years: '2020-2024', startYear: 2020, endYear: 2024, generation: 'IV Serie', euroStandard: 'Euro 6d', transmission: 'Automatico 6m', driveType: 'AWD / 4x4', wltpElectricRangeKm: 62, avgConsumption: '1.4 L/100km + 17.0 kWh/100km' },
          { name: '1.6 CRDi 136 CV MHEV 48V Diesel', fuelType: 'Diesel', tankCapacity: 54, cv: 136, kw: 100, displacementCc: 1598, years: '2020-2024', startYear: 2020, endYear: 2024, generation: 'IV Serie', euroStandard: 'Euro 6d', transmission: '7DCT', driveType: 'FWD', avgConsumption: '5.1 L/100km' }
        ]
      },
      {
        name: 'i10',
        category: 'Citycar',
        motorizations: [
          { name: '1.0 MPI 67 CV Manuale / AMT', fuelType: 'Benzina', tankCapacity: 36, cv: 67, kw: 49, displacementCc: 998, years: '2020+', startYear: 2020, generation: 'III Serie', euroStandard: 'Euro 6d/6e', transmission: 'Manuale 5m / AMT', driveType: 'FWD', avgConsumption: '5.0 L/100km' },
          { name: '1.0 T-GDI N Line 100 CV', fuelType: 'Benzina', tankCapacity: 36, cv: 100, kw: 74, displacementCc: 998, years: '2020+', startYear: 2020, generation: 'III Serie', euroStandard: 'Euro 6d', transmission: 'Manuale 5m', driveType: 'FWD', avgConsumption: '5.4 L/100km' }
        ]
      },
      {
        name: 'i20',
        category: 'Compatta',
        motorizations: [
          { name: '1.0 T-GDI 100 CV 48V Hybrid (i20)', fuelType: 'Full / Mild Hybrid', tankCapacity: 40, cv: 100, kw: 74, displacementCc: 998, years: '2020+', startYear: 2020, generation: 'III Serie', euroStandard: 'Euro 6d/6e', transmission: 'iMT 6m / 7DCT', driveType: 'FWD', avgConsumption: '5.1 L/100km' },
          { name: '1.2 MPI 84 CV Benzina (i20)', fuelType: 'Benzina', tankCapacity: 40, cv: 84, kw: 62, displacementCc: 1197, years: '2020+', startYear: 2020, generation: 'III Serie', euroStandard: 'Euro 6d', transmission: 'Manuale 5m', driveType: 'FWD', avgConsumption: '5.3 L/100km' }
        ]
      },
      {
        name: 'Kona',
        category: 'SUV',
        motorizations: [
          { name: '1.6 GDI Full Hybrid 141 CV (2023+ II Serie)', fuelType: 'Full / Mild Hybrid', tankCapacity: 38, cv: 141, kw: 104, displacementCc: 1580, years: '2023+', startYear: 2023, generation: 'II Serie', euroStandard: 'Euro 6e', transmission: '6DCT', driveType: 'FWD', avgConsumption: '4.7 L/100km' },
          { name: 'EV Elettrica 218 CV (Batteria 65.4 kWh)', fuelType: 'Elettrica (BEV)', tankCapacity: 0, batteryCapacity: 65.4, cv: 218, kw: 160, years: '2023+', startYear: 2023, generation: 'II Serie EV', transmission: 'Monomarcia', driveType: 'FWD', wltpElectricRangeKm: 514, avgConsumption: '14.9 kWh/100km' }
        ]
      }
    ]
  },
  {
    brand: 'Kia',
    country: 'Corea del Sud',
    models: [
      {
        name: 'Sportage',
        category: 'SUV',
        motorizations: [
          { name: '1.6 T-GDi Plug-in Hybrid 265 CV 4WD (PHEV)', fuelType: 'Plug-in Hybrid (PHEV)', tankCapacity: 42, batteryCapacity: 13.8, cv: 265, kw: 195, displacementCc: 1598, years: '2022+', startYear: 2022, generation: 'V Serie', euroStandard: 'Euro 6d/6e', transmission: 'Automatico 6m', driveType: 'AWD / 4x4', wltpElectricRangeKm: 70, avgConsumption: '1.1 L/100km + 16.9 kWh/100km' },
          { name: '1.6 T-GDi Full Hybrid 230 CV (HEV)', fuelType: 'Full / Mild Hybrid', tankCapacity: 52, cv: 230, kw: 169, displacementCc: 1598, years: '2022+', startYear: 2022, generation: 'V Serie', euroStandard: 'Euro 6d/6e', transmission: 'Automatico 6m', driveType: 'FWD', avgConsumption: '5.6 L/100km' },
          { name: '1.6 CRDi MHEV 136 CV Diesel 48V', fuelType: 'Diesel', tankCapacity: 54, cv: 136, kw: 100, displacementCc: 1598, years: '2022+', startYear: 2022, generation: 'V Serie', euroStandard: 'Euro 6d', transmission: '7DCT', driveType: 'FWD', avgConsumption: '5.2 L/100km' }
        ]
      },
      {
        name: 'Picanto',
        category: 'Citycar',
        motorizations: [
          { name: '1.0 DPI 67 CV Manuale / AMT (2024+ Restyling)', fuelType: 'Benzina', tankCapacity: 35, cv: 67, kw: 49, displacementCc: 998, years: '2024+', startYear: 2024, generation: 'III Serie Restyling 2', euroStandard: 'Euro 6e', transmission: 'Manuale 5m / AMT', driveType: 'FWD', avgConsumption: '5.0 L/100km' },
          { name: '1.0 DPI 67 CV GPL EcoPicanto', fuelType: 'GPL (Benzina + GPL)', tankCapacity: 35, secondaryTankCapacity: 30, cv: 67, kw: 49, displacementCc: 998, years: '2020+', startYear: 2020, generation: 'III Serie GPL', euroStandard: 'Euro 6d', transmission: 'Manuale 5m', driveType: 'FWD', avgConsumption: '6.5 L/100km GPL' }
        ]
      },
      {
        name: 'Stonic',
        category: 'SUV',
        motorizations: [
          { name: '1.0 T-GDI MHEV 100 CV EcoDynamics+', fuelType: 'Full / Mild Hybrid', tankCapacity: 45, cv: 100, kw: 74, displacementCc: 998, years: '2020+', startYear: 2020, euroStandard: 'Euro 6d/6e', transmission: 'iMT 6m / 7DCT', driveType: 'FWD', avgConsumption: '5.2 L/100km' },
          { name: '1.2 DPI 84 CV Benzina / GPL', fuelType: 'GPL (Benzina + GPL)', tankCapacity: 45, secondaryTankCapacity: 35, cv: 84, kw: 62, displacementCc: 1197, years: '2019+', startYear: 2019, euroStandard: 'Euro 6d', transmission: 'Manuale 5m', driveType: 'FWD', avgConsumption: '6.8 L/100km GPL' }
        ]
      }
    ]
  },
  {
    brand: 'Lancia',
    country: 'Italia',
    models: [
      {
        name: 'Ypsilon',
        category: 'Citycar',
        motorizations: [
          // 2024+ Nuova Ypsilon
          { name: '1.2 Ibrida 100 CV e-DCT6 (Nuova Ypsilon 2024+)', fuelType: 'Full / Mild Hybrid', tankCapacity: 44, cv: 100, kw: 74, displacementCc: 1199, years: '2024+', startYear: 2024, generation: 'Nuova Ypsilon 2024+', euroStandard: 'Euro 6e', transmission: 'e-DCT6', driveType: 'FWD', avgConsumption: '4.6 L/100km' },
          { name: 'Elettrica 156 CV (Nuova Ypsilon Batteria 54 kWh)', fuelType: 'Elettrica (BEV)', tankCapacity: 0, batteryCapacity: 54, cv: 156, kw: 115, years: '2024+', startYear: 2024, generation: 'Nuova Ypsilon Elettrica', transmission: 'Monomarcia', driveType: 'FWD', wltpElectricRangeKm: 403, avgConsumption: '14.6 kWh/100km' },
          // 2020-2024 Ypsilon Hybrid
          { name: '1.0 FireFly Mild Hybrid 70 CV (Ypsilon)', fuelType: 'Full / Mild Hybrid', tankCapacity: 40, cv: 70, kw: 51, displacementCc: 999, years: '2020-2024', startYear: 2020, endYear: 2024, generation: 'III Serie Hybrid', euroStandard: 'Euro 6d', transmission: 'Manuale 6m', driveType: 'FWD', avgConsumption: '4.9 L/100km' },
          // 2011-2020 Ypsilon III Serie
          { name: '1.2 69 CV Ecochic GPL (Ypsilon)', fuelType: 'GPL (Benzina + GPL)', tankCapacity: 40, secondaryTankCapacity: 30, cv: 69, kw: 51, displacementCc: 1242, years: '2011-2020', startYear: 2011, endYear: 2020, generation: 'III Serie Ecochic', euroStandard: 'Euro 5/6', transmission: 'Manuale 5m', driveType: 'FWD', avgConsumption: '6.8 L/100km GPL' },
          { name: '1.3 MultiJet 95 CV (Ypsilon)', fuelType: 'Diesel', tankCapacity: 40, cv: 95, kw: 70, displacementCc: 1248, years: '2011-2018', startYear: 2011, endYear: 2018, generation: 'III Serie', euroStandard: 'Euro 5/6', transmission: 'Manuale 5m', driveType: 'FWD', avgConsumption: '4.2 L/100km' },
          { name: '0.9 TwinAir 80 CV Metano Ecochic', fuelType: 'Metano (Benzina + Metano)', tankCapacity: 38, secondaryTankCapacity: 12, cv: 80, kw: 59, displacementCc: 875, years: '2013-2020', startYear: 2013, endYear: 2020, generation: 'III Serie Metano', euroStandard: 'Euro 6', transmission: 'Manuale 5m', driveType: 'FWD', avgConsumption: '4.1 kg/100km' },
          // 2003-2011 Ypsilon II Serie (843)
          { name: '1.2 60/69 CV 8V (Ypsilon 843)', fuelType: 'Benzina', tankCapacity: 45, cv: 60, kw: 44, displacementCc: 1242, years: '2003-2011', startYear: 2003, endYear: 2011, generation: 'II Serie (843)', euroStandard: 'Euro 4', transmission: 'Manuale 5m', driveType: 'FWD', avgConsumption: '5.8 L/100km' },
          { name: '1.3 MultiJet 75/90 CV (Ypsilon 843)', fuelType: 'Diesel', tankCapacity: 45, cv: 75, kw: 55, displacementCc: 1248, years: '2003-2011', startYear: 2003, endYear: 2011, generation: 'II Serie (843)', euroStandard: 'Euro 4', transmission: 'Manuale 5m', driveType: 'FWD', avgConsumption: '4.6 L/100km' }
        ]
      }
    ]
  },
  {
    brand: 'Nissan',
    country: 'Giappone',
    models: [
      {
        name: 'Qashqai',
        category: 'SUV',
        motorizations: [
          // Qashqai III (2021+)
          { name: '1.5 e-POWER 190 CV Elettrico con generatore (2024+ Restyling)', fuelType: 'Full / Mild Hybrid', tankCapacity: 55, cv: 190, kw: 140, displacementCc: 1497, years: '2024+', startYear: 2024, generation: 'III Serie Restyling', euroStandard: 'Euro 6e', transmission: 'Monomarcia e-POWER', driveType: 'FWD', avgConsumption: '5.1 L/100km' },
          { name: '1.3 DIG-T MHEV 140/158 CV Xtronic', fuelType: 'Full / Mild Hybrid', tankCapacity: 55, cv: 158, kw: 116, displacementCc: 1332, years: '2021+', startYear: 2021, generation: 'III Serie', euroStandard: 'Euro 6d/6e', transmission: 'Xtronic CVT', driveType: 'FWD', avgConsumption: '6.3 L/100km' },
          // Qashqai II (2014-2021)
          { name: '1.5 dCi 110/115 CV Diesel (Qashqai II)', fuelType: 'Diesel', tankCapacity: 55, cv: 115, kw: 85, displacementCc: 1461, years: '2014-2021', startYear: 2014, endYear: 2021, generation: 'II Serie (J11)', euroStandard: 'Euro 6', transmission: 'Manuale 6m / DCT', driveType: 'FWD', avgConsumption: '4.8 L/100km' },
          { name: '1.6 dCi 130 CV 4WD (Qashqai II)', fuelType: 'Diesel', tankCapacity: 65, cv: 130, kw: 96, displacementCc: 1598, years: '2014-2019', startYear: 2014, endYear: 2019, generation: 'II Serie (J11)', euroStandard: 'Euro 6', transmission: 'Manuale 6m', driveType: 'AWD / 4x4', avgConsumption: '5.2 L/100km' },
          // Qashqai I (2007-2013)
          { name: '1.5 dCi 106/110 CV (Qashqai I J10)', fuelType: 'Diesel', tankCapacity: 65, cv: 110, kw: 81, displacementCc: 1461, years: '2007-2013', startYear: 2007, endYear: 2013, generation: 'I Serie (J10)', euroStandard: 'Euro 4/5', transmission: 'Manuale 6m', driveType: 'FWD', avgConsumption: '5.2 L/100km' }
        ]
      },
      {
        name: 'Juke',
        category: 'SUV',
        motorizations: [
          { name: '1.6 Full Hybrid 143 CV Multi-mode (2024+)', fuelType: 'Full / Mild Hybrid', tankCapacity: 46, cv: 143, kw: 105, displacementCc: 1598, years: '2022+', startYear: 2022, generation: 'II Serie', euroStandard: 'Euro 6e', transmission: 'Multimode', driveType: 'FWD', avgConsumption: '4.8 L/100km' },
          { name: '1.0 DIG-T 114 CV DCT', fuelType: 'Benzina', tankCapacity: 46, cv: 114, kw: 84, displacementCc: 999, years: '2019+', startYear: 2019, generation: 'II Serie', euroStandard: 'Euro 6d', transmission: 'Manuale 6m / DCT 7m', driveType: 'FWD', avgConsumption: '5.8 L/100km' }
        ]
      }
    ]
  },
  {
    brand: 'Opel',
    country: 'Germania',
    models: [
      {
        name: 'Corsa',
        category: 'Compatta',
        motorizations: [
          // Corsa F 2019+
          { name: '1.2 Hybrid 100 CV e-DCT6 (Restyling 2024+)', fuelType: 'Full / Mild Hybrid', tankCapacity: 44, cv: 100, kw: 74, displacementCc: 1199, years: '2024+', startYear: 2024, generation: 'Corsa F Restyling', euroStandard: 'Euro 6e', transmission: 'e-DCT6', driveType: 'FWD', avgConsumption: '4.6 L/100km' },
          { name: '1.2 75 CV Benzina (Corsa F)', fuelType: 'Benzina', tankCapacity: 44, cv: 75, kw: 55, displacementCc: 1199, years: '2019+', startYear: 2019, generation: 'Corsa F', euroStandard: 'Euro 6d', transmission: 'Manuale 5m', driveType: 'FWD', avgConsumption: '5.3 L/100km' },
          { name: '1.5 CDTI 102 CV Diesel (Corsa F)', fuelType: 'Diesel', tankCapacity: 41, cv: 102, kw: 75, displacementCc: 1499, years: '2019-2023', startYear: 2019, endYear: 2023, generation: 'Corsa F', euroStandard: 'Euro 6d', transmission: 'Manuale 6m', driveType: 'FWD', avgConsumption: '4.1 L/100km' },
          { name: 'Corsa-e Elettrica 156 CV (Batteria 51 kWh)', fuelType: 'Elettrica (BEV)', tankCapacity: 0, batteryCapacity: 51, cv: 156, kw: 115, years: '2023+', startYear: 2023, generation: 'Corsa-e', transmission: 'Monomarcia', driveType: 'FWD', wltpElectricRangeKm: 405, avgConsumption: '14.6 kWh/100km' },
          // Corsa E 2014-2019 & D 2006-2014
          { name: '1.3 CDTI 75/95 CV (Corsa D/E)', fuelType: 'Diesel', tankCapacity: 45, cv: 95, kw: 70, displacementCc: 1248, years: '2006-2019', startYear: 2006, endYear: 2019, generation: 'Corsa D/E', euroStandard: 'Euro 4/5/6', transmission: 'Manuale 5m/6m', driveType: 'FWD', avgConsumption: '4.5 L/100km' },
          { name: '1.4 GPL Tech 90 CV (Corsa D/E)', fuelType: 'GPL (Benzina + GPL)', tankCapacity: 45, secondaryTankCapacity: 34, cv: 90, kw: 66, displacementCc: 1398, years: '2010-2019', startYear: 2010, endYear: 2019, generation: 'Corsa GPL Tech', euroStandard: 'Euro 5/6', transmission: 'Manuale 5m', driveType: 'FWD', avgConsumption: '6.9 L/100km GPL' }
        ]
      },
      {
        name: 'Mokka',
        category: 'SUV',
        motorizations: [
          { name: '1.2 Hybrid 136 CV e-DCT6 (2024+)', fuelType: 'Full / Mild Hybrid', tankCapacity: 44, cv: 136, kw: 100, displacementCc: 1199, years: '2024+', startYear: 2024, euroStandard: 'Euro 6e', transmission: 'e-DCT6', driveType: 'FWD', avgConsumption: '4.9 L/100km' },
          { name: 'Mokka-e Elettrica 156 CV (Batteria 54 kWh)', fuelType: 'Elettrica (BEV)', tankCapacity: 0, batteryCapacity: 54, cv: 156, kw: 115, years: '2023+', startYear: 2023, transmission: 'Monomarcia', driveType: 'FWD', wltpElectricRangeKm: 407, avgConsumption: '15.2 kWh/100km' }
        ]
      }
    ]
  },
  {
    brand: 'Seat',
    country: 'Spagna',
    models: [
      {
        name: 'Ibiza',
        category: 'Compatta',
        motorizations: [
          { name: '1.0 TSI 95/110 CV (Ibiza V)', fuelType: 'Benzina', tankCapacity: 40, cv: 110, kw: 81, displacementCc: 999, years: '2017+', startYear: 2017, generation: 'V Serie', euroStandard: 'Euro 6d', transmission: 'Manuale 6m / DSG', driveType: 'FWD', avgConsumption: '5.2 L/100km' },
          { name: '1.0 TGI Metano 90 CV (Ibiza V)', fuelType: 'Metano (Benzina + Metano)', tankCapacity: 40, secondaryTankCapacity: 13.8, cv: 90, kw: 66, displacementCc: 999, years: '2018-2022', startYear: 2018, endYear: 2022, generation: 'V Serie TGI', euroStandard: 'Euro 6d', transmission: 'Manuale 6m', driveType: 'FWD', avgConsumption: '3.6 kg/100km' },
          { name: '1.6 TDI 95 CV (Ibiza V)', fuelType: 'Diesel', tankCapacity: 40, cv: 95, kw: 70, displacementCc: 1598, years: '2017-2020', startYear: 2017, endYear: 2020, generation: 'V Serie', euroStandard: 'Euro 6', transmission: 'Manuale 5m', driveType: 'FWD', avgConsumption: '4.2 L/100km' }
        ]
      },
      {
        name: 'Arona',
        category: 'SUV',
        motorizations: [
          { name: '1.0 TSI 95/115 CV DSG', fuelType: 'Benzina', tankCapacity: 40, cv: 115, kw: 85, displacementCc: 999, years: '2017+', startYear: 2017, euroStandard: 'Euro 6d/6e', transmission: 'DSG 7m', driveType: 'FWD', avgConsumption: '5.5 L/100km' }
        ]
      }
    ]
  },
  {
    brand: 'Skoda',
    country: 'Repubblica Ceca',
    models: [
      {
        name: 'Octavia / Octavia Wagon',
        category: 'Station Wagon',
        motorizations: [
          // 2024+ Restyling
          { name: '1.5 TSI MHEV 150 CV DSG (Restyling 2024+)', fuelType: 'Full / Mild Hybrid', tankCapacity: 45, cv: 150, kw: 110, displacementCc: 1498, years: '2024+', startYear: 2024, generation: 'IV Serie Restyling', euroStandard: 'Euro 6e', transmission: 'DSG 7m', driveType: 'FWD', avgConsumption: '5.3 L/100km' },
          { name: '2.0 TDI 150 CV DSG (Restyling 2024+)', fuelType: 'Diesel', tankCapacity: 45, cv: 150, kw: 110, displacementCc: 1968, years: '2024+', startYear: 2024, generation: 'IV Serie Restyling', euroStandard: 'Euro 6e', transmission: 'DSG 7m', driveType: 'FWD', avgConsumption: '4.8 L/100km' },
          { name: '1.4 TSI iV Plug-in Hybrid 204 CV (PHEV 2020-2024)', fuelType: 'Plug-in Hybrid (PHEV)', tankCapacity: 39, batteryCapacity: 13.0, cv: 204, kw: 150, displacementCc: 1395, years: '2020-2024', startYear: 2020, endYear: 2024, generation: 'IV Serie', euroStandard: 'Euro 6d', transmission: 'DSG 6m', driveType: 'FWD', wltpElectricRangeKm: 65, avgConsumption: '1.2 L/100km + 14.5 kWh/100km' }
        ]
      },
      {
        name: 'Fabia',
        category: 'Compatta',
        motorizations: [
          { name: '1.0 MPI 80 CV Manuale', fuelType: 'Benzina', tankCapacity: 40, cv: 80, kw: 59, displacementCc: 999, years: '2021+', startYear: 2021, generation: 'IV Serie', euroStandard: 'Euro 6d/6e', transmission: 'Manuale 5m', driveType: 'FWD', avgConsumption: '5.1 L/100km' },
          { name: '1.0 TSI 95/110 CV DSG', fuelType: 'Benzina', tankCapacity: 40, cv: 110, kw: 81, displacementCc: 999, years: '2021+', startYear: 2021, generation: 'IV Serie', euroStandard: 'Euro 6d/6e', transmission: 'DSG 7m', driveType: 'FWD', avgConsumption: '5.3 L/100km' }
        ]
      },
      {
        name: 'Kamiq',
        category: 'SUV',
        motorizations: [
          { name: '1.0 TSI 95/115 CV Manuale / DSG', fuelType: 'Benzina', tankCapacity: 50, cv: 115, kw: 85, displacementCc: 999, years: '2019+', startYear: 2019, euroStandard: 'Euro 6d/6e', transmission: 'DSG 7m', driveType: 'FWD', avgConsumption: '5.6 L/100km' },
          { name: '1.0 G-TEC Metano 90 CV', fuelType: 'Metano (Benzina + Metano)', tankCapacity: 50, secondaryTankCapacity: 13.8, cv: 90, kw: 66, displacementCc: 999, years: '2019-2022', startYear: 2019, endYear: 2022, euroStandard: 'Euro 6d', transmission: 'Manuale 6m', driveType: 'FWD', avgConsumption: '3.6 kg/100km' }
        ]
      }
    ]
  },
  {
    brand: 'Smart',
    country: 'Germania',
    models: [
      {
        name: 'Fortwo',
        category: 'Citycar',
        motorizations: [
          { name: 'EQ Fortwo Elettrica 82 CV (Batteria 17.6 kWh)', fuelType: 'Elettrica (BEV)', tankCapacity: 0, batteryCapacity: 17.6, cv: 82, kw: 60, years: '2018-2024', startYear: 2018, endYear: 2024, generation: 'EQ W453', transmission: 'Monomarcia', driveType: 'RWD', wltpElectricRangeKm: 135, avgConsumption: '15.5 kWh/100km' },
          { name: '0.9 Turbo 90 CV Twinamic (453)', fuelType: 'Benzina', tankCapacity: 28, cv: 90, kw: 66, displacementCc: 898, years: '2014-2019', startYear: 2014, endYear: 2019, generation: 'III Serie (453)', euroStandard: 'Euro 6', transmission: 'Twinamic 6m', driveType: 'RWD', avgConsumption: '4.8 L/100km' },
          { name: '1.0 71 CV mhd (451)', fuelType: 'Benzina', tankCapacity: 33, cv: 71, kw: 52, displacementCc: 999, years: '2007-2014', startYear: 2007, endYear: 2014, generation: 'II Serie (451)', euroStandard: 'Euro 4/5', transmission: 'Robotizzato 5m', driveType: 'RWD', avgConsumption: '5.1 L/100km' },
          { name: '0.8 CDI Diesel 45/54 CV (451)', fuelType: 'Diesel', tankCapacity: 33, cv: 54, kw: 40, displacementCc: 799, years: '2007-2014', startYear: 2007, endYear: 2014, generation: 'II Serie (451)', euroStandard: 'Euro 4/5', transmission: 'Robotizzato 5m', driveType: 'RWD', avgConsumption: '3.6 L/100km' }
        ]
      },
      {
        name: '#1 (Hashtag One)',
        category: 'SUV',
        motorizations: [
          { name: 'Pro+ 272 CV (Batteria 66 kWh)', fuelType: 'Elettrica (BEV)', tankCapacity: 0, batteryCapacity: 66, cv: 272, kw: 200, years: '2023+', startYear: 2023, generation: 'I Serie', transmission: 'Monomarcia', driveType: 'RWD', wltpElectricRangeKm: 440, avgConsumption: '16.8 kWh/100km' },
          { name: 'BRABUS 428 CV 4WD (Batteria 66 kWh)', fuelType: 'Elettrica (BEV)', tankCapacity: 0, batteryCapacity: 66, cv: 428, kw: 315, years: '2023+', startYear: 2023, generation: 'I Serie BRABUS', transmission: 'Monomarcia', driveType: 'AWD / 4x4', wltpElectricRangeKm: 400, avgConsumption: '18.2 kWh/100km' }
        ]
      }
    ]
  },
  {
    brand: 'Suzuki',
    country: 'Giappone',
    models: [
      {
        name: 'Swift',
        category: 'Compatta',
        motorizations: [
          { name: '1.2 Hybrid 83 CV 12V 2WD/AllGrip (2024+)', fuelType: 'Full / Mild Hybrid', tankCapacity: 37, cv: 83, kw: 61, displacementCc: 1197, years: '2024+', startYear: 2024, generation: 'V Serie 2024+', euroStandard: 'Euro 6e', transmission: 'Manuale 5m / CVT', driveType: 'FWD', avgConsumption: '4.4 L/100km' },
          { name: '1.2 Dualjet Hybrid 83 CV (2020-2024)', fuelType: 'Full / Mild Hybrid', tankCapacity: 37, cv: 83, kw: 61, displacementCc: 1197, years: '2020-2024', startYear: 2020, endYear: 2024, generation: 'IV Serie', euroStandard: 'Euro 6d', transmission: 'Manuale 5m', driveType: 'FWD', avgConsumption: '4.7 L/100km' }
        ]
      },
      {
        name: 'Vitara',
        category: 'SUV',
        motorizations: [
          { name: '1.4 Boosterjet Hybrid 129 CV AllGrip 4WD', fuelType: 'Full / Mild Hybrid', tankCapacity: 47, cv: 129, kw: 95, displacementCc: 1373, years: '2020+', startYear: 2020, euroStandard: 'Euro 6d/6e', transmission: 'Manuale 6m', driveType: 'AWD / 4x4', avgConsumption: '5.8 L/100km' },
          { name: '1.5 Full Hybrid 115 CV AGS AllGrip', fuelType: 'Full / Mild Hybrid', tankCapacity: 47, cv: 115, kw: 85, displacementCc: 1462, years: '2022+', startYear: 2022, euroStandard: 'Euro 6d/6e', transmission: 'Robotizzato AGS 6m', driveType: 'AWD / 4x4', avgConsumption: '5.6 L/100km' }
        ]
      },
      {
        name: 'Ignis',
        category: 'Citycar',
        motorizations: [
          { name: '1.2 Hybrid 83 CV 4WD AllGrip', fuelType: 'Full / Mild Hybrid', tankCapacity: 30, cv: 83, kw: 61, displacementCc: 1197, years: '2020+', startYear: 2020, euroStandard: 'Euro 6d', transmission: 'Manuale 5m', driveType: 'AWD / 4x4', avgConsumption: '5.0 L/100km' }
        ]
      }
    ]
  },
  {
    brand: 'Iveco',
    country: 'Italia',
    models: [
      {
        name: 'Daily (Furgone / Cabinato)',
        category: 'SUV',
        motorizations: [
          { name: '35S14 / 35C14 2.3 HPI 136 CV', fuelType: 'Diesel', tankCapacity: 70, cv: 136, kw: 100, displacementCc: 2287, years: '2016-2024', startYear: 2016, endYear: 2024, euroStandard: 'Euro 6', transmission: 'Manuale 6m / Hi-Matic 8m', driveType: 'RWD', avgConsumption: '8.4 L/100km' },
          { name: '35S16 / 35C16 2.3 HPI 156 CV Hi-Matic', fuelType: 'Diesel', tankCapacity: 70, cv: 156, kw: 115, displacementCc: 2287, years: '2016-2024', startYear: 2016, endYear: 2024, euroStandard: 'Euro 6', transmission: 'Hi-Matic 8m', driveType: 'RWD', avgConsumption: '8.8 L/100km' },
          { name: '35S18 / 35C18 3.0 HPI 180 CV Hi-Matic', fuelType: 'Diesel', tankCapacity: 90, cv: 180, kw: 132, displacementCc: 2998, years: '2016-2024', startYear: 2016, endYear: 2024, euroStandard: 'Euro 6', transmission: 'Hi-Matic 8m', driveType: 'RWD', avgConsumption: '9.5 L/100km' },
          { name: 'Daily Natural Power 3.0 Metano (CNG) 136 CV', fuelType: 'Metano (Benzina + Metano)', tankCapacity: 14, secondaryTankCapacity: 35, cv: 136, kw: 100, displacementCc: 2998, years: '2016-2024', startYear: 2016, endYear: 2024, euroStandard: 'Euro 6', transmission: 'Hi-Matic 8m', driveType: 'RWD', avgConsumption: '8.5 kg/100km' }
        ]
      }
    ]
  },
  {
    brand: 'Mini',
    country: 'Regno Unito / Germania',
    models: [
      {
        name: 'Cooper / 3 Porte / 5 Porte',
        category: 'Compatta',
        motorizations: [
          // 2024+ Nuova Generazione
          { name: 'Cooper C 1.5 156 CV Steptronic (2024+)', fuelType: 'Benzina', tankCapacity: 44, cv: 156, kw: 115, displacementCc: 1499, years: '2024+', startYear: 2024, generation: 'IV Serie (F66)', euroStandard: 'Euro 6e', transmission: 'Steptronic 7m', driveType: 'FWD', avgConsumption: '5.9 L/100km' },
          { name: 'Cooper S 2.0 204 CV Steptronic (2024+)', fuelType: 'Benzina', tankCapacity: 44, cv: 204, kw: 150, displacementCc: 1998, years: '2024+', startYear: 2024, generation: 'IV Serie (F66)', euroStandard: 'Euro 6e', transmission: 'Steptronic 7m', driveType: 'FWD', avgConsumption: '6.4 L/100km' },
          { name: 'Cooper E Elettrica 184 CV (Batteria 40.7 kWh)', fuelType: 'Elettrica (BEV)', tankCapacity: 0, batteryCapacity: 40.7, cv: 184, kw: 135, years: '2024+', startYear: 2024, generation: 'J01 Elettrica', transmission: 'Monomarcia', driveType: 'FWD', wltpElectricRangeKm: 305, avgConsumption: '14.0 kWh/100km' },
          // 2014-2023 F56
          { name: 'Cooper D 1.5 Diesel 116 CV (F56)', fuelType: 'Diesel', tankCapacity: 40, cv: 116, kw: 85, displacementCc: 1496, years: '2014-2020', startYear: 2014, endYear: 2020, generation: 'III Serie (F56)', euroStandard: 'Euro 6', transmission: 'Manuale 6m / Steptronic', driveType: 'FWD', avgConsumption: '4.2 L/100km' },
          { name: 'One D 1.5 Diesel 95 CV (F56)', fuelType: 'Diesel', tankCapacity: 40, cv: 95, kw: 70, displacementCc: 1496, years: '2014-2020', startYear: 2014, endYear: 2020, generation: 'III Serie (F56)', euroStandard: 'Euro 6', transmission: 'Manuale 6m', driveType: 'FWD', avgConsumption: '4.0 L/100km' },
          { name: 'Cooper 1.5 Benzina 136 CV (F56)', fuelType: 'Benzina', tankCapacity: 40, cv: 136, kw: 100, displacementCc: 1499, years: '2014-2023', startYear: 2014, endYear: 2023, generation: 'III Serie (F56)', euroStandard: 'Euro 6', transmission: 'Manuale 6m / Steptronic', driveType: 'FWD', avgConsumption: '5.4 L/100km' },
          // 2006-2013 R56
          { name: 'Cooper D 1.6 Diesel 109/112 CV (R56)', fuelType: 'Diesel', tankCapacity: 40, cv: 112, kw: 82, displacementCc: 1598, years: '2006-2013', startYear: 2006, endYear: 2013, generation: 'II Serie (R56)', euroStandard: 'Euro 4/5', transmission: 'Manuale 6m', driveType: 'FWD', avgConsumption: '4.4 L/100km' }
        ]
      },
      {
        name: 'Countryman',
        category: 'SUV',
        motorizations: [
          { name: 'Countryman C 1.5 MHEV 170 CV (2024+)', fuelType: 'Full / Mild Hybrid', tankCapacity: 54, cv: 170, kw: 125, displacementCc: 1499, years: '2024+', startYear: 2024, generation: 'III Serie (U25)', euroStandard: 'Euro 6e', transmission: 'Steptronic 7m', driveType: 'FWD', avgConsumption: '6.2 L/100km' },
          { name: 'Cooper S E ALL4 Plug-in Hybrid 220 CV (PHEV 2017-2023)', fuelType: 'Plug-in Hybrid (PHEV)', tankCapacity: 36, batteryCapacity: 10.0, cv: 220, kw: 162, displacementCc: 1499, years: '2017-2023', startYear: 2017, endYear: 2023, generation: 'II Serie (F60)', euroStandard: 'Euro 6d', transmission: 'Steptronic 6m', driveType: 'AWD / 4x4', wltpElectricRangeKm: 51, avgConsumption: '1.9 L/100km + 15.0 kWh/100km' }
        ]
      }
    ]
  },
  {
    brand: 'Land Rover',
    country: 'Regno Unito',
    models: [
      {
        name: 'Range Rover Evoque',
        category: 'SUV',
        motorizations: [
          { name: 'P300e Plug-in Hybrid 309 CV AWD (PHEV)', fuelType: 'Plug-in Hybrid (PHEV)', tankCapacity: 57, batteryCapacity: 15.0, cv: 309, kw: 227, displacementCc: 1497, years: '2020+', startYear: 2020, generation: 'II Serie', euroStandard: 'Euro 6d', transmission: 'Automatico 8m', driveType: 'AWD / 4x4', wltpElectricRangeKm: 62, avgConsumption: '1.4 L/100km + 18.0 kWh/100km' },
          { name: 'D165 / D200 MHEV Diesel AWD', fuelType: 'Diesel', tankCapacity: 65, cv: 204, kw: 150, displacementCc: 1997, years: '2020+', startYear: 2020, generation: 'II Serie', euroStandard: 'Euro 6d', transmission: 'Automatico 9m', driveType: 'AWD / 4x4', avgConsumption: '6.5 L/100km' },
          { name: '2.2 TD4 / SD4 150/190 CV (Evoque I)', fuelType: 'Diesel', tankCapacity: 60, cv: 190, kw: 140, displacementCc: 2179, years: '2011-2018', startYear: 2011, endYear: 2018, generation: 'I Serie', euroStandard: 'Euro 5', transmission: 'Automatico 9m', driveType: 'AWD / 4x4', avgConsumption: '6.8 L/100km' }
        ]
      }
    ]
  },
  {
    brand: 'Porsche',
    country: 'Germania',
    models: [
      {
        name: 'Macan',
        category: 'SUV',
        motorizations: [
          { name: 'Macan 4 Elettrica 408 CV (Batteria 100 kWh)', fuelType: 'Elettrica (BEV)', tankCapacity: 0, batteryCapacity: 100, cv: 408, kw: 300, years: '2024+', startYear: 2024, generation: 'Macan Elettrica II Serie', transmission: 'Monomarcia', driveType: 'AWD / 4x4', wltpElectricRangeKm: 613, avgConsumption: '17.9 kWh/100km' },
          { name: '2.0 Turbo 265 CV PDK', fuelType: 'Benzina', tankCapacity: 65, cv: 265, kw: 195, displacementCc: 1984, years: '2014-2024', startYear: 2014, endYear: 2024, generation: 'I Serie', euroStandard: 'Euro 6d', transmission: 'PDK 7m', driveType: 'AWD / 4x4', avgConsumption: '9.8 L/100km' },
          { name: 'GTS 2.9 V6 Biturbo 440 CV PDK', fuelType: 'Benzina', tankCapacity: 75, cv: 440, kw: 324, displacementCc: 2894, years: '2019-2024', startYear: 2019, endYear: 2024, generation: 'I Serie GTS', euroStandard: 'Euro 6d', transmission: 'PDK 7m', driveType: 'AWD / 4x4', avgConsumption: '11.3 L/100km' }
        ]
      }
    ]
  }
];

export const BRAND_ALIASES: Record<string, string> = {
  'mercedes': 'Mercedes-Benz',
  'mercedes benz': 'Mercedes-Benz',
  'mercedes-benz': 'Mercedes-Benz',
  'mb': 'Mercedes-Benz',
  'vw': 'Volkswagen',
  'volks wagen': 'Volkswagen',
  'volkswagen': 'Volkswagen',
  'alfa': 'Alfa Romeo',
  'alfaromeo': 'Alfa Romeo',
  'alfa-romeo': 'Alfa Romeo',
  'citroen': 'Citroën',
  'citroën': 'Citroën',
  'land rover': 'Land Rover',
  'landrover': 'Land Rover',
  'range rover': 'Land Rover',
  'rangerover': 'Land Rover',
  'chevy': 'Chevrolet',
  'chevrolet': 'Chevrolet',
  'mini cooper': 'Mini',
  'ds': 'DS',
  'ds automobiles': 'DS'
};

export function normalizeBrandName(raw: string): string {
  if (!raw) return '';
  const clean = raw.trim().toLowerCase();
  if (BRAND_ALIASES[clean]) return BRAND_ALIASES[clean];
  const found = CAR_BRANDS_CATALOG.find(b => b.brand.toLowerCase() === clean);
  if (found) return found.brand;
  const partial = CAR_BRANDS_CATALOG.find(b => b.brand.toLowerCase().includes(clean) || clean.includes(b.brand.toLowerCase()));
  if (partial) return partial.brand;
  return raw.trim();
}

/**
 * Intelligent Smart Generator for custom, non-catalog models.
 * Guarantees that EVERY vehicle has at least 8-10 realistic, segment-tailored motorizations immediately.
 */
export function generateGenericMotorizationsForBrandModel(
  brand: string,
  model: string,
  year?: number
): CarMotorization[] {
  const normBrand = normalizeBrandName(brand);
  const isElectricBrand = /tesla|polestar|byd|smart|nio|lucid|rivian/i.test(normBrand) || /model 3|model y|ioniq|ev6|id\.|bev|e-208|500e/i.test(model);
  const currentYear = year || new Date().getFullYear();
  const yearStr = currentYear ? `${currentYear}` : 'Attuale';

  if (isElectricBrand) {
    return [
      { name: 'Standard Range RWD (Batteria ~58-60 kWh)', fuelType: 'Elettrica (BEV)', tankCapacity: 0, batteryCapacity: 58, cv: 170, kw: 125, years: yearStr, startYear: currentYear - 4, endYear: currentYear + 4, wltpElectricRangeKm: 420, avgConsumption: '15.2 kWh/100km' },
      { name: 'Long Range AWD (Batteria ~77-82 kWh)', fuelType: 'Elettrica (BEV)', tankCapacity: 0, batteryCapacity: 77, cv: 286, kw: 210, years: yearStr, startYear: currentYear - 4, endYear: currentYear + 4, wltpElectricRangeKm: 540, avgConsumption: '16.5 kWh/100km' },
      { name: 'Performance Dual Motor AWD (Batteria ~77-85 kWh)', fuelType: 'Elettrica (BEV)', tankCapacity: 0, batteryCapacity: 82, cv: 420, kw: 309, years: yearStr, startYear: currentYear - 4, endYear: currentYear + 4, wltpElectricRangeKm: 500, avgConsumption: '18.0 kWh/100km' }
    ];
  }

  // General rich motorizations covering all fuel types & powers
  return [
    { name: `1.0 / 1.2 Turbo Benzina 100/110 CV`, fuelType: 'Benzina', tankCapacity: 50, cv: 100, kw: 74, displacementCc: 1199, years: yearStr, startYear: currentYear - 5, endYear: currentYear + 5, euroStandard: 'Euro 6', transmission: 'Manuale 6m', avgConsumption: '5.4 L/100km' },
    { name: `1.2 / 1.5 Mild Hybrid (MHEV) 130 CV`, fuelType: 'Full / Mild Hybrid', tankCapacity: 50, cv: 130, kw: 96, displacementCc: 1498, years: yearStr, startYear: currentYear - 5, endYear: currentYear + 5, euroStandard: 'Euro 6d/6e', transmission: 'Automatico / DSG', avgConsumption: '5.2 L/100km' },
    { name: `1.5 / 1.6 Turbo Diesel 120/130 CV`, fuelType: 'Diesel', tankCapacity: 50, cv: 120, kw: 88, displacementCc: 1598, years: yearStr, startYear: currentYear - 8, endYear: currentYear + 5, euroStandard: 'Euro 6d', transmission: 'Manuale 6m / Automatico', avgConsumption: '4.6 L/100km' },
    { name: `2.0 Turbo Diesel 150 CV`, fuelType: 'Diesel', tankCapacity: 55, cv: 150, kw: 110, displacementCc: 1968, years: yearStr, startYear: currentYear - 10, endYear: currentYear + 5, euroStandard: 'Euro 6', transmission: 'Automatico', avgConsumption: '5.0 L/100km' },
    { name: `1.5 / 1.8 Full Hybrid (HEV) 140 CV`, fuelType: 'Full / Mild Hybrid', tankCapacity: 45, cv: 140, kw: 103, displacementCc: 1798, years: yearStr, startYear: currentYear - 5, endYear: currentYear + 5, euroStandard: 'Euro 6e', transmission: 'Automatico e-CVT', avgConsumption: '4.5 L/100km' },
    { name: `Plug-in Hybrid (PHEV) 204-225 CV`, fuelType: 'Plug-in Hybrid (PHEV)', tankCapacity: 45, batteryCapacity: (currentYear >= 2024 ? 19.7 : 13.0), cv: 204, kw: 150, displacementCc: 1498, years: yearStr, startYear: currentYear - 5, endYear: currentYear + 5, euroStandard: 'Euro 6d/6e', transmission: 'Automatico DCT', wltpElectricRangeKm: (currentYear >= 2024 ? 120 : 60), avgConsumption: '1.2 L/100km + 15 kWh/100km' },
    { name: `1.0 / 1.4 BiFuel GPL 100-120 CV`, fuelType: 'GPL (Benzina + GPL)', tankCapacity: 50, secondaryTankCapacity: 40, cv: 100, kw: 74, displacementCc: 1199, years: yearStr, startYear: currentYear - 8, endYear: currentYear + 5, euroStandard: 'Euro 6d', transmission: 'Manuale 6m', avgConsumption: '7.4 L/100km GPL' },
    { name: `1.4 / 1.5 Turbo Benzina 150 CV`, fuelType: 'Benzina', tankCapacity: 50, cv: 150, kw: 110, displacementCc: 1498, years: yearStr, startYear: currentYear - 8, endYear: currentYear + 5, euroStandard: 'Euro 6d', transmission: 'Manuale 6m / Automatico', avgConsumption: '6.2 L/100km' },
    { name: `2.0 Turbo Benzina 200+ CV`, fuelType: 'Benzina', tankCapacity: 55, cv: 200, kw: 147, displacementCc: 1984, years: yearStr, startYear: currentYear - 10, endYear: currentYear + 5, euroStandard: 'Euro 6', transmission: 'Automatico', avgConsumption: '7.5 L/100km' }
  ];
}

export const POPULAR_BRANDS = [
  'Abarth', 'Alfa Romeo', 'Audi', 'BMW', 'Citroën', 'Cupra', 'Dacia', 'DS', 'Ducati', 'Ferrari', 
  'Fiat', 'Ford', 'Honda', 'Hyundai', 'Iveco', 'Jaguar', 'Jeep', 'Kia', 'Lamborghini', 'Lancia', 
  'Land Rover', 'Lexus', 'Maserati', 'Mazda', 'Mercedes-Benz', 'MG', 'Mini', 'Mitsubishi', 
  'Nissan', 'Opel', 'Peugeot', 'Piaggio', 'Porsche', 'Renault', 'Seat', 'Skoda', 'Smart', 
  'Subaru', 'Suzuki', 'Tesla', 'Toyota', 'Vespa', 'Volkswagen', 'Volvo', 'Yamaha'
];

export const ALL_BRAND_NAMES = Array.from(
  new Set([...CAR_BRANDS_CATALOG.map(b => b.brand), ...POPULAR_BRANDS])
).sort((a, b) => a.localeCompare(b));

/**
 * Italian License Plate (LL NNN LL) to Estimated Registration Year Algorithm
 * Calibrated for Italian license plates issued from 1994 to present.
 */
export function estimateYearFromItalianPlate(plateString: string): { 
  year: number; 
  range: string; 
  confidence: 'high' | 'medium' | 'low';
  estimatedDateString: string;
} | null {
  if (!plateString) return null;
  const clean = plateString.toUpperCase().replace(/[^A-Z0-9]/g, '').trim();
  
  // Format check: 2 letters + 3 digits + 2 letters
  const itPlateRegex = /^([A-Z]{2})([0-9]{3})([A-Z]{2})$/;
  const match = clean.match(itPlateRegex);
  if (!match) return null;

  const prefix = match[1]; // e.g. "GF", "GA", "GT", "HA", "FA", "EB", "AA"
  const p1 = prefix.charAt(0);
  const p2 = prefix.charAt(1);

  // Calibration dictionary for Italian license plate prefixes
  let estYear = 2020;
  let range = '2020';

  if (p1 === 'A') {
    if (p2 <= 'B') { estYear = 1994; range = '1994 - 1995'; }
    else if (p2 <= 'F') { estYear = 1995; range = '1995'; }
    else if (p2 <= 'K') { estYear = 1996; range = '1996'; }
    else if (p2 <= 'S') { estYear = 1997; range = '1997'; }
    else { estYear = 1998; range = '1998'; }
  } else if (p1 === 'B') {
    if (p2 <= 'D') { estYear = 1999; range = '1999'; }
    else if (p2 <= 'K') { estYear = 2000; range = '2000'; }
    else if (p2 <= 'R') { estYear = 2001; range = '2001'; }
    else if (p2 <= 'Y') { estYear = 2002; range = '2002'; }
    else { estYear = 2003; range = '2003'; }
  } else if (p1 === 'C') {
    if (p2 <= 'B') { estYear = 2003; range = '2003'; }
    else if (p2 <= 'H') { estYear = 2004; range = '2004'; }
    else if (p2 <= 'P') { estYear = 2005; range = '2005'; }
    else { estYear = 2006; range = '2006'; }
  } else if (p1 === 'D') {
    if (p2 <= 'C') { estYear = 2006; range = '2006'; }
    else if (p2 <= 'J') { estYear = 2007; range = '2007'; }
    else if (p2 <= 'R') { estYear = 2008; range = '2008'; }
    else { estYear = 2009; range = '2009'; }
  } else if (p1 === 'E') {
    if (p2 <= 'C') { estYear = 2010; range = '2010'; }
    else if (p2 <= 'G') { estYear = 2011; range = '2011'; }
    else if (p2 <= 'L') { estYear = 2012; range = '2012'; }
    else if (p2 <= 'R') { estYear = 2013; range = '2013'; }
    else { estYear = 2014; range = '2014'; }
  } else if (p1 === 'F') {
    if (p2 <= 'D') { estYear = 2015; range = '2015'; }
    else if (p2 <= 'H') { estYear = 2016; range = '2016'; }
    else if (p2 <= 'N') { estYear = 2017; range = '2017'; }
    else if (p2 <= 'V') { estYear = 2018; range = '2018'; }
    else { estYear = 2019; range = '2019'; }
  } else if (p1 === 'G') {
    if (p2 <= 'B') { estYear = 2019; range = '2019 - 2020'; }
    else if (p2 <= 'E') { estYear = 2020; range = '2020'; }
    else if (p2 <= 'K') { estYear = 2021; range = '2021'; }
    else if (p2 <= 'P') { estYear = 2022; range = '2022'; }
    else if (p2 <= 'V') { estYear = 2023; range = '2023'; }
    else { estYear = 2024; range = '2024'; }
  } else if (p1 === 'H') {
    if (p2 <= 'C') { estYear = 2024; range = '2024'; }
    else if (p2 <= 'G') { estYear = 2025; range = '2025'; }
    else { estYear = 2026; range = '2026'; }
  }

  return {
    year: estYear,
    range,
    confidence: 'high',
    estimatedDateString: `${estYear}-06-15`
  };
}

/**
 * Universal Year Extractor:
 * Extracts a 4-digit year from registration date, plate, or natural language query.
 * Correctly prioritizes Italian license plate estimation when the registration date is defaulted to today/current year.
 */
export function extractRegistrationYear(
  regDate?: string, 
  plate?: string, 
  query?: string
): { 
  year: number | null; 
  source: 'date' | 'plate' | 'query' | 'none'; 
  label: string 
} {
  const currentYear = new Date().getFullYear();
  const plateEst = plate && plate.trim() ? estimateYearFromItalianPlate(plate) : null;
  const dateYear = regDate && regDate.trim() ? parseInt(regDate.split('-')[0], 10) : null;
  const validDateYear = dateYear && !isNaN(dateYear) && dateYear >= 1970 && dateYear <= 2035 ? dateYear : null;

  // 1. If plate gives a historical year (e.g. 2007) and date is current year (default) or has large discrepancy, prioritize plate!
  if (plateEst) {
    if (!validDateYear || validDateYear >= currentYear - 1 || Math.abs(validDateYear - plateEst.year) > 3) {
      return { 
        year: plateEst.year, 
        source: 'plate', 
        label: `Anno ~${plateEst.year} (stimato con precisione da targa ${plate!.toUpperCase()})` 
      };
    }
  }

  // 2. Direct date string if explicit and coherent
  if (validDateYear) {
    return { 
      year: validDateYear, 
      source: 'date', 
      label: `Anno ${validDateYear} (da data immatricolazione)` 
    };
  }

  // 3. Fallback plate estimation if any
  if (plateEst) {
    return { 
      year: plateEst.year, 
      source: 'plate', 
      label: `Anno ~${plateEst.year} (da targa ${plate!.toUpperCase()})` 
    };
  }

  // 4. Search query token extraction (e.g. "Golf 2007" or "Panda 2008")
  if (query && query.trim()) {
    const match = query.match(/\b(19\d{2}|20\d{2})\b/);
    if (match) {
      const parsedYear = parseInt(match[1], 10);
      if (parsedYear >= 1970 && parsedYear <= 2035) {
        return { year: parsedYear, source: 'query', label: `Anno ${parsedYear} (dal testo di ricerca)` };
      }
    }
  }

  return { year: null, source: 'none', label: '' };
}

export function searchCarBrands(query: string): string[] {
  if (!query || query.trim() === '') return ALL_BRAND_NAMES;
  const clean = query.toLowerCase().trim();
  return ALL_BRAND_NAMES.filter(b => b.toLowerCase().includes(clean));
}

export function getModelsForBrand(brandName: string): CarModelData[] {
  if (!brandName) return [];
  const norm = normalizeBrandName(brandName).toLowerCase().trim();
  const found = CAR_BRANDS_CATALOG.find(
    b => b.brand.toLowerCase() === norm ||
         b.brand.toLowerCase().includes(norm) ||
         norm.includes(b.brand.toLowerCase())
  );
  return found ? found.models : [];
}

export function getMotorizationsForModel(brandName: string, modelName: string): CarMotorization[] {
  const models = getModelsForBrand(brandName);
  if (!modelName) return [];
  const cleanModel = modelName.toLowerCase().trim();
  
  if (models.length > 0) {
    // 1. Direct or partial match on model name
    const foundModel = models.find(
      m => m.name.toLowerCase() === cleanModel ||
           m.name.toLowerCase().includes(cleanModel) ||
           cleanModel.includes(m.name.toLowerCase()) ||
           cleanModel.split(/\s+/).some(word => word.length >= 3 && m.name.toLowerCase().includes(word))
    );
    if (foundModel && foundModel.motorizations.length > 0) {
      return foundModel.motorizations;
    }
  }

  // 2. If not found in catalog, generate smart standard motorizations for this brand & model
  return generateGenericMotorizationsForBrandModel(brandName, modelName);
}

/**
 * Filter and sort motorizations accurately by registration year / generation.
 * NEVER returns an empty array if brand or model is provided!
 */
export function getMotorizationsForModelAndYear(
  brandName: string, 
  modelName: string, 
  yearOrDate?: number | string
): { 
  matchedForYear: CarMotorization[]; 
  otherYears: CarMotorization[];
  all: CarMotorization[];
} {
  let allMots = getMotorizationsForModel(brandName, modelName);
  if (!allMots.length && (brandName || modelName)) {
    allMots = generateGenericMotorizationsForBrandModel(brandName, modelName);
  }
  if (!allMots.length) return { matchedForYear: [], otherYears: [], all: [] };

  let targetYear: number | null = null;
  if (typeof yearOrDate === 'number') {
    targetYear = yearOrDate;
  } else if (typeof yearOrDate === 'string' && yearOrDate.trim()) {
    targetYear = parseInt(yearOrDate.split('-')[0], 10);
  }

  if (!targetYear || isNaN(targetYear)) {
    return { matchedForYear: allMots, otherYears: [], all: allMots };
  }

  const matchedForYear: CarMotorization[] = [];
  const otherYears: CarMotorization[] = [];

  for (const m of allMots) {
    const start = m.startYear ?? 1990;
    const end = m.endYear ?? 2035;
    if (targetYear >= start && targetYear <= end) {
      matchedForYear.push(m);
    } else {
      otherYears.push(m);
    }
  }

  // If none matched the exact year window, return all items so dropdown is never empty
  if (matchedForYear.length === 0) {
    return {
      matchedForYear: allMots,
      otherYears: [],
      all: allMots
    };
  }

  return {
    matchedForYear,
    otherYears,
    all: [...matchedForYear, ...otherYears]
  };
}

export interface FuzzySearchResult {
  brand: string;
  model: string;
  category: string;
  motorization: CarMotorization;
  isYearMatch?: boolean;
}

export function searchMotorizationsFuzzy(query: string, targetYear?: number): FuzzySearchResult[] {
  if (!query || query.trim().length < 2) return [];
  const tokens = query.toLowerCase().trim().split(/\s+/).filter(t => t.length > 1);
  const results: FuzzySearchResult[] = [];

  for (const brandObj of CAR_BRANDS_CATALOG) {
    for (const modelObj of brandObj.models) {
      for (const mot of modelObj.motorizations) {
        const fullString = `${brandObj.brand} ${modelObj.name} ${mot.name} ${mot.fuelType} ${mot.cv}CV ${mot.kw}kW ${mot.years || ''} ${mot.generation || ''}`.toLowerCase();
        // Check if all tokens match or if at least most tokens match
        const matchesCount = tokens.filter(t => fullString.includes(t)).length;
        if (matchesCount >= Math.min(tokens.length, 2)) {
          const isYearMatch = targetYear 
            ? (targetYear >= (mot.startYear ?? 1990) && targetYear <= (mot.endYear ?? 2035))
            : false;

          results.push({
            brand: brandObj.brand,
            model: modelObj.name,
            category: modelObj.category,
            motorization: mot,
            isYearMatch
          });
        }
      }
    }
  }

  // Prioritize year matches first, then exact name matches
  results.sort((a, b) => {
    if (a.isYearMatch && !b.isYearMatch) return -1;
    if (!a.isYearMatch && b.isYearMatch) return 1;
    return 0;
  });

  return results.slice(0, 20);
}

export interface VehicleLookupResult {
  brand: string;
  model: string;
  motorization?: string;
  generation?: string;
  fuelType: FuelType;
  powerCv?: number;
  powerKw?: number;
  tankCapacity: number;
  batteryCapacity?: number;
  secondaryTankCapacity?: number;
  displacementCc?: number;
  driveType?: string;
  differential?: string;
  transmission?: string;
  euroStandard?: string;
  wltpElectricRangeKm?: number;
  avgConsumption?: string;
  category?: string;
  photoQuery?: string;
  realPhotos?: { url: string; title: string; source: string }[];
  suggestedPhotoUrl?: string;
  estimatedRegistrationYear?: number;
  registrationDate?: string;
  availableMotorizations?: CarMotorization[];
  source: 'ai' | 'catalog';
}

// Client-side AI / Hybrid lookup function with server-side endpoint + local fallback
export async function lookupVehicleWithAI(
  query: string, 
  brand?: string, 
  model?: string, 
  yearOrDate?: string,
  plate?: string
): Promise<VehicleLookupResult> {
  const cleanQuery = query.trim();
  const yearInfo = extractRegistrationYear(yearOrDate, plate, cleanQuery);

  // 1. Try server-side Gemini API route first if available
  try {
    const res = await fetch('/api/vehicle-lookup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        query: cleanQuery, 
        brand, 
        model, 
        year: yearInfo.year ? String(yearInfo.year) : yearOrDate,
        plate 
      })
    });

    if (res.ok) {
      const data = await res.json();
      if (data?.data && (data.data.brand || data.data.model || data.data.motorization)) {
        const d = data.data;
        let availableMots: CarMotorization[] = Array.isArray(d.availableMotorizations) && d.availableMotorizations.length > 0
          ? d.availableMotorizations.map((m: any) => ({
              name: m.name || '',
              fuelType: m.fuelType as FuelType,
              cv: Number(m.cv) || 100,
              kw: Number(m.kw) || Math.round(Number(m.cv || 100) / 1.35962),
              displacementCc: m.displacementCc ? Number(m.displacementCc) : undefined,
              tankCapacity: Number(m.tankCapacity ?? 50),
              batteryCapacity: m.batteryCapacity ? Number(m.batteryCapacity) : undefined,
              secondaryTankCapacity: m.secondaryTankCapacity ? Number(m.secondaryTankCapacity) : undefined,
              wltpElectricRangeKm: m.wltpElectricRangeKm ? Number(m.wltpElectricRangeKm) : undefined,
              driveType: m.driveType,
              differential: m.differential,
              transmission: m.transmission,
              euroStandard: m.euroStandard,
              years: m.years,
              generation: m.generation || d.generation,
              avgConsumption: m.avgConsumption
            }))
          : [];

        // If AI didn't return motorizations list, merge with local catalog / generator
        if (availableMots.length === 0 && (d.brand || brand) && (d.model || model)) {
          const localMots = getMotorizationsForModelAndYear(d.brand || brand, d.model || model, yearInfo.year || undefined);
          availableMots = localMots.matchedForYear.length > 0 ? localMots.matchedForYear : localMots.all;
        }

        return {
          brand: d.brand || brand || '',
          model: d.model || model || '',
          motorization: d.motorization || (availableMots[0]?.name ?? ''),
          generation: d.generation || '',
          fuelType: (d.fuelType as FuelType) || availableMots[0]?.fuelType || 'Diesel',
          powerCv: Number(d.powerCv) || availableMots[0]?.cv || undefined,
          powerKw: Number(d.powerKw) || availableMots[0]?.kw || (d.powerCv ? Math.round(Number(d.powerCv) / 1.35962) : undefined),
          tankCapacity: Number(d.tankCapacity) || availableMots[0]?.tankCapacity || 50,
          batteryCapacity: d.batteryCapacity ? Number(d.batteryCapacity) : availableMots[0]?.batteryCapacity,
          secondaryTankCapacity: d.secondaryTankCapacity ? Number(d.secondaryTankCapacity) : availableMots[0]?.secondaryTankCapacity,
          displacementCc: d.displacementCc ? Number(d.displacementCc) : availableMots[0]?.displacementCc,
          driveType: d.driveType || availableMots[0]?.driveType,
          differential: d.differential || availableMots[0]?.differential,
          transmission: d.transmission || availableMots[0]?.transmission,
          euroStandard: d.euroStandard || availableMots[0]?.euroStandard,
          wltpElectricRangeKm: d.wltpElectricRangeKm ? Number(d.wltpElectricRangeKm) : availableMots[0]?.wltpElectricRangeKm,
          avgConsumption: d.avgConsumption || availableMots[0]?.avgConsumption,
          category: d.category,
          photoQuery: d.photoQuery,
          realPhotos: Array.isArray(d.realPhotos) ? d.realPhotos : [],
          suggestedPhotoUrl: d.suggestedPhotoUrl || (Array.isArray(d.realPhotos) && d.realPhotos.length > 0 ? d.realPhotos[0].url : undefined),
          estimatedRegistrationYear: d.estimatedRegistrationYear || yearInfo.year || undefined,
          registrationDate: d.registrationDate,
          availableMotorizations: availableMots,
          source: 'ai'
        };
      }
    }
  } catch (err) {
    console.warn("Chiamata server /api/vehicle-lookup non riuscita, procedo con catalogo locale:", err);
  }

  // 2. Intelligent local catalog fallback with Year & Generation matching
  if (brand || model) {
    const effBrand = brand || cleanQuery.split(' ')[0] || '';
    const effModel = model || cleanQuery.split(' ').slice(1).join(' ') || '';
    const { matchedForYear, all } = getMotorizationsForModelAndYear(effBrand, effModel, yearInfo.year || undefined);
    const chosenMot = (matchedForYear.length > 0) ? matchedForYear[0] : (all.length > 0 ? all[0] : null);
    if (chosenMot) {
      return {
        brand: effBrand,
        model: effModel,
        motorization: chosenMot.name,
        generation: chosenMot.generation,
        fuelType: chosenMot.fuelType,
        powerCv: chosenMot.cv,
        powerKw: chosenMot.kw,
        tankCapacity: chosenMot.tankCapacity,
        batteryCapacity: chosenMot.batteryCapacity,
        secondaryTankCapacity: chosenMot.secondaryTankCapacity,
        displacementCc: chosenMot.displacementCc,
        driveType: chosenMot.driveType,
        differential: chosenMot.differential,
        transmission: chosenMot.transmission,
        euroStandard: chosenMot.euroStandard,
        wltpElectricRangeKm: chosenMot.wltpElectricRangeKm,
        avgConsumption: chosenMot.avgConsumption,
        availableMotorizations: matchedForYear.length > 0 ? matchedForYear : all,
        source: 'catalog'
      };
    }
  }

  const localMatches = searchMotorizationsFuzzy(`${cleanQuery} ${brand || ''} ${model || ''}`, yearInfo.year || undefined);
  if (localMatches.length > 0) {
    const m = localMatches[0];
    return {
      brand: m.brand,
      model: m.model,
      motorization: m.motorization.name,
      generation: m.motorization.generation,
      fuelType: m.motorization.fuelType,
      powerCv: m.motorization.cv,
      powerKw: m.motorization.kw,
      tankCapacity: m.motorization.tankCapacity,
      batteryCapacity: m.motorization.batteryCapacity,
      secondaryTankCapacity: m.motorization.secondaryTankCapacity,
      displacementCc: m.motorization.displacementCc,
      transmission: m.motorization.transmission,
      euroStandard: m.motorization.euroStandard,
      wltpElectricRangeKm: m.motorization.wltpElectricRangeKm,
      avgConsumption: m.motorization.avgConsumption,
      category: m.category,
      availableMotorizations: localMatches.map(lm => lm.motorization),
      source: 'catalog'
    };
  }

  // 3. Fallback heuristic detection & generic motorizations
  const isPHEV = /plug|phev|hybrid plug|e-hybrid|ehybrid|4xe|tfsi e|recharge/i.test(cleanQuery);
  const isBEV = /elettric|electric|ev|bev|kwh|tesla/i.test(cleanQuery);
  const isDiesel = /tdi|diesel|dci|crdi|jtd|multijet|cdti/i.test(cleanQuery);
  const isGPL = /gpl|lpg|easypower|eco-g/i.test(cleanQuery);
  const isMetano = /metano|cng|tgi|natural power/i.test(cleanQuery);

  let fuelType: FuelType = 'Benzina';
  if (isPHEV) fuelType = 'Plug-in Hybrid (PHEV)';
  else if (isBEV) fuelType = 'Elettrica (BEV)';
  else if (isDiesel) fuelType = 'Diesel';
  else if (isGPL) fuelType = 'GPL (Benzina + GPL)';
  else if (isMetano) fuelType = 'Metano (Benzina + Metano)';

  const effBrand = brand || cleanQuery.split(' ')[0] || '';
  const effModel = model || cleanQuery.split(' ').slice(1).join(' ') || '';
  const genericMots = generateGenericMotorizationsForBrandModel(effBrand, effModel, yearInfo.year || undefined);
  const phevBattery = (yearInfo.year && yearInfo.year >= 2024) ? 19.7 : 13.0;

  return {
    brand: effBrand,
    model: effModel,
    fuelType,
    tankCapacity: isBEV ? 0 : (isPHEV ? (phevBattery > 15 ? 45 : 40) : 50),
    batteryCapacity: isPHEV ? phevBattery : (isBEV ? 60.0 : undefined),
    availableMotorizations: genericMots,
    source: 'catalog'
  };
}
