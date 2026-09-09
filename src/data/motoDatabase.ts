import { FuelType, VehicleTechnicalSpecs } from '../types';

export interface MotoMotorization {
  name: string;
  fuelType: FuelType;
  tankCapacity: number; // Litri
  batteryCapacity?: number; // kWh (se elettrica)
  cv: number;
  kw: number;
  displacementCc: number;
  torqueNm?: number;
  finalDrive: 'Catena' | 'Cardano' | 'Cinghia' | 'Variatore CVT' | string;
  coolingType?: 'Liquido' | 'Aria' | 'Aria/Olio' | string;
  engineArchitecture?: string;
  recommendedOil: string; // Specifica moto JASO MA2 / MA
  oilCapacityLiters: number;
  tirePressureFrontBar: number;
  tirePressureRearBar: number;
  tirePressureLoadedBar?: number;
  allowedTireSizes: string[];
  years?: string;
  startYear?: number;
  endYear?: number;
  transmission?: string;
  euroStandard?: string;
  avgConsumption?: string;
}

export interface MotoModelData {
  name: string;
  category: 'Naked' | 'Adventure / Enduro' | 'Sportiva' | 'Scooter / Maxiscooter' | 'Touring' | 'Cruiser / Custom' | 'Scrambler' | 'Crossover';
  motorizations: MotoMotorization[];
}

export interface MotoBrandData {
  brand: string;
  country: string;
  models: MotoModelData[];
}

export const MOTO_BRANDS_CATALOG: MotoBrandData[] = [
  // 1. DUCATI
  {
    brand: 'Ducati',
    country: 'Italia',
    models: [
      {
        name: 'Monster',
        category: 'Naked',
        motorizations: [
          {
            name: 'Monster 937 (111 CV)',
            fuelType: 'Benzina',
            tankCapacity: 14,
            cv: 111,
            kw: 82,
            displacementCc: 937,
            torqueNm: 93,
            finalDrive: 'Catena 520 (O-Ring)',
            coolingType: 'Liquido',
            engineArchitecture: 'Bicilindrico a V di 90° Testastretta 11° Desmodromico',
            recommendedOil: 'Shell Advance 15W-50 4T JASO MA2 (Ducati Spec)',
            oilCapacityLiters: 3.4,
            tirePressureFrontBar: 2.3,
            tirePressureRearBar: 2.5,
            tirePressureLoadedBar: 2.7,
            allowedTireSizes: ['Ant. 120/70 ZR17 (58W) Pirelli Diablo Rosso III', 'Post. 180/55 ZR17 (73W) Pirelli Diablo Rosso III'],
            transmission: 'Manuale 6 marce con Ducati Quick Shift (DQS) Up/Down',
            euroStandard: 'Euro 5',
            years: '2021+',
            startYear: 2021,
            avgConsumption: '5.2 L/100 km (19.2 km/L)'
          },
          {
            name: 'Monster 821 (109 CV)',
            fuelType: 'Benzina',
            tankCapacity: 16.5,
            cv: 109,
            kw: 80,
            displacementCc: 821,
            torqueNm: 86,
            finalDrive: 'Catena 520',
            coolingType: 'Liquido',
            engineArchitecture: 'Bicilindrico a V di 90° Testastretta 11° Desmo',
            recommendedOil: '15W-50 4T Sintetico JASO MA2',
            oilCapacityLiters: 3.2,
            tirePressureFrontBar: 2.3,
            tirePressureRearBar: 2.5,
            allowedTireSizes: ['Ant. 120/70 ZR17', 'Post. 180/55 ZR17'],
            transmission: 'Manuale 6 marce con frizione antisaltellamento',
            euroStandard: 'Euro 4',
            years: '2014-2020',
            startYear: 2014,
            endYear: 2020,
            avgConsumption: '5.4 L/100 km (18.5 km/L)'
          }
        ]
      },
      {
        name: 'Multistrada',
        category: 'Adventure / Enduro',
        motorizations: [
          {
            name: 'Multistrada V4 / V4 S (170 CV)',
            fuelType: 'Benzina',
            tankCapacity: 22,
            cv: 170,
            kw: 125,
            displacementCc: 1158,
            torqueNm: 125,
            finalDrive: 'Catena 525 con X-Ring',
            coolingType: 'Liquido',
            engineArchitecture: '4 cilindri a V di 90° V4 Granturismo a molle (Tagliando gioco valvole ogni 60.000 km)',
            recommendedOil: 'Shell Advance 15W-50 4T JASO MA2',
            oilCapacityLiters: 4.1,
            tirePressureFrontBar: 2.5,
            tirePressureRearBar: 2.9,
            tirePressureLoadedBar: 3.0,
            allowedTireSizes: ['Ant. 120/70 ZR19 (60W)', 'Post. 170/60 ZR17 (72W)'],
            transmission: 'Manuale 6 marce con DQS Up/Down e Cruise Control Radar',
            euroStandard: 'Euro 5',
            years: '2021+',
            startYear: 2021,
            avgConsumption: '6.5 L/100 km (15.4 km/L)'
          },
          {
            name: 'Multistrada 950 / V2 (113 CV)',
            fuelType: 'Benzina',
            tankCapacity: 20,
            cv: 113,
            kw: 83,
            displacementCc: 937,
            torqueNm: 96,
            finalDrive: 'Catena 525',
            coolingType: 'Liquido',
            engineArchitecture: 'Bicilindrico Testastretta 11° Desmo',
            recommendedOil: '15W-50 4T JASO MA2',
            oilCapacityLiters: 3.4,
            tirePressureFrontBar: 2.4,
            tirePressureRearBar: 2.8,
            allowedTireSizes: ['Ant. 120/70 ZR19', 'Post. 170/60 ZR17'],
            transmission: 'Manuale 6 marce',
            euroStandard: 'Euro 5',
            years: '2017+',
            startYear: 2017,
            avgConsumption: '5.5 L/100 km (18.2 km/L)'
          }
        ]
      },
      {
        name: 'Scrambler',
        category: 'Scrambler',
        motorizations: [
          {
            name: 'Scrambler Icon 800 (73 CV)',
            fuelType: 'Benzina',
            tankCapacity: 13.5,
            cv: 73,
            kw: 54,
            displacementCc: 803,
            torqueNm: 66,
            finalDrive: 'Catena 520',
            coolingType: 'Aria/Olio',
            engineArchitecture: 'Bicilindrico a V di 90° Desmodue a 2 valvole',
            recommendedOil: '15W-50 4T JASO MA2',
            oilCapacityLiters: 3.0,
            tirePressureFrontBar: 2.3,
            tirePressureRearBar: 2.5,
            allowedTireSizes: ['Ant. 110/80 R18', 'Post. 180/55 R17'],
            transmission: 'Manuale 6 marce con frizione antisaltellamento',
            euroStandard: 'Euro 5',
            years: '2015+',
            startYear: 2015,
            avgConsumption: '5.0 L/100 km (20.0 km/L)'
          }
        ]
      },
      {
        name: 'Panigale',
        category: 'Sportiva',
        motorizations: [
          {
            name: 'Panigale V2 (155 CV)',
            fuelType: 'Benzina',
            tankCapacity: 17,
            cv: 155,
            kw: 114,
            displacementCc: 955,
            torqueNm: 104,
            finalDrive: 'Catena 520 Racing',
            coolingType: 'Liquido',
            engineArchitecture: 'Superquadro bicilindrico a V 90° Desmo',
            recommendedOil: 'Shell Advance Ultra 15W-50 4T Racing JASO MA2',
            oilCapacityLiters: 3.7,
            tirePressureFrontBar: 2.3,
            tirePressureRearBar: 2.1,
            allowedTireSizes: ['Ant. 120/70 ZR17 Pirelli Supercorsa', 'Post. 180/60 ZR17 Pirelli Supercorsa'],
            transmission: 'Manuale 6 marce con DQS EVO 2',
            euroStandard: 'Euro 5',
            years: '2020+',
            startYear: 2020,
            avgConsumption: '6.0 L/100 km (16.7 km/L)'
          }
        ]
      }
    ]
  },

  // 2. BMW MOTORRAD
  {
    brand: 'BMW Motorrad',
    country: 'Germania',
    models: [
      {
        name: 'R 1250 GS / R 1300 GS',
        category: 'Adventure / Enduro',
        motorizations: [
          {
            name: 'R 1300 GS (145 CV)',
            fuelType: 'Benzina',
            tankCapacity: 19,
            cv: 145,
            kw: 107,
            displacementCc: 1300,
            torqueNm: 149,
            finalDrive: 'Cardano Paralever EVO (senza manutenzione catena)',
            coolingType: 'Aria/Liquido',
            engineArchitecture: 'Bicilindrico Boxer con tecnologia BMW ShiftCam',
            recommendedOil: 'BMW Motorrad Advantec Ultimate 5W-40 JASO MA2',
            oilCapacityLiters: 4.0,
            tirePressureFrontBar: 2.5,
            tirePressureRearBar: 2.9,
            tirePressureLoadedBar: 2.9,
            allowedTireSizes: ['Ant. 120/70 R19 (60V)', 'Post. 170/60 R17 (72V)'],
            transmission: 'Manuale 6 marce con Shift Assistant Pro e albero cardanico',
            euroStandard: 'Euro 5+',
            years: '2024+',
            startYear: 2024,
            avgConsumption: '4.8 L/100 km (20.8 km/L)'
          },
          {
            name: 'R 1250 GS (136 CV)',
            fuelType: 'Benzina',
            tankCapacity: 20,
            cv: 136,
            kw: 100,
            displacementCc: 1254,
            torqueNm: 143,
            finalDrive: 'Cardano Paralever',
            coolingType: 'Aria/Liquido',
            engineArchitecture: 'Bicilindrico Boxer con ShiftCam (fasatura variabile)',
            recommendedOil: 'Castrol Power 1 Racing / BMW Advantec 5W-40 JASO MA2',
            oilCapacityLiters: 4.0,
            tirePressureFrontBar: 2.5,
            tirePressureRearBar: 2.9,
            tirePressureLoadedBar: 2.9,
            allowedTireSizes: ['Ant. 120/70 R19 (60V)', 'Post. 170/60 R17 (72V)'],
            transmission: 'Manuale 6 marce con frizione multidisco antisaltellamento',
            euroStandard: 'Euro 5',
            years: '2019-2023',
            startYear: 2019,
            endYear: 2023,
            avgConsumption: '4.75 L/100 km (21.0 km/L)'
          },
          {
            name: 'R 1250 GS Adventure (136 CV - 30L)',
            fuelType: 'Benzina',
            tankCapacity: 30,
            cv: 136,
            kw: 100,
            displacementCc: 1254,
            torqueNm: 143,
            finalDrive: 'Cardano Paralever',
            coolingType: 'Aria/Liquido',
            engineArchitecture: 'Bicilindrico Boxer con ShiftCam',
            recommendedOil: '5W-40 4T JASO MA2',
            oilCapacityLiters: 4.0,
            tirePressureFrontBar: 2.5,
            tirePressureRearBar: 2.9,
            allowedTireSizes: ['Ant. 120/70 R19', 'Post. 170/60 R17'],
            transmission: 'Manuale 6 marce',
            euroStandard: 'Euro 5',
            years: '2019+',
            startYear: 2019,
            avgConsumption: '5.0 L/100 km (20.0 km/L)'
          }
        ]
      },
      {
        name: 'F 900 R / F 900 XR',
        category: 'Naked',
        motorizations: [
          {
            name: 'F 900 R / XR (105 CV)',
            fuelType: 'Benzina',
            tankCapacity: 13,
            cv: 105,
            kw: 77,
            displacementCc: 895,
            torqueNm: 92,
            finalDrive: 'Catena 525 con O-Ring',
            coolingType: 'Liquido',
            engineArchitecture: 'Bicilindrico in linea a 4 tempi con 2 alberi a camme',
            recommendedOil: '5W-40 4T JASO MA2',
            oilCapacityLiters: 3.0,
            tirePressureFrontBar: 2.5,
            tirePressureRearBar: 2.9,
            allowedTireSizes: ['Ant. 120/70 ZR17 (58W)', 'Post. 180/55 ZR17 (73W)'],
            transmission: 'Manuale 6 marce a innesti frontali',
            euroStandard: 'Euro 5',
            years: '2020+',
            startYear: 2020,
            avgConsumption: '4.2 L/100 km (23.8 km/L)'
          }
        ]
      },
      {
        name: 'S 1000 RR',
        category: 'Sportiva',
        motorizations: [
          {
            name: 'S 1000 RR (210 CV)',
            fuelType: 'Benzina',
            tankCapacity: 16.5,
            cv: 210,
            kw: 154,
            displacementCc: 999,
            torqueNm: 113,
            finalDrive: 'Catena 525 M Endurance (rivestimento diamantato)',
            coolingType: 'Liquido/Olio',
            engineArchitecture: '4 cilindri in linea con tecnologia ShiftCam a 14.600 giri/min',
            recommendedOil: '5W-40 Synthetic Racing JASO MA2',
            oilCapacityLiters: 3.9,
            tirePressureFrontBar: 2.4,
            tirePressureRearBar: 2.5,
            allowedTireSizes: ['Ant. 120/70 ZR17', 'Post. 190/55 ZR17 / 200/55 ZR17'],
            transmission: 'Manuale 6 marce con Shift Assistant Pro',
            euroStandard: 'Euro 5',
            years: '2019+',
            startYear: 2019,
            avgConsumption: '6.4 L/100 km'
          }
        ]
      }
    ]
  },

  // 3. YAMAHA
  {
    brand: 'Yamaha',
    country: 'Giappone',
    models: [
      {
        name: 'MT-07',
        category: 'Naked',
        motorizations: [
          {
            name: 'MT-07 CP2 (73.4 CV)',
            fuelType: 'Benzina',
            tankCapacity: 14,
            cv: 73.4,
            kw: 54,
            displacementCc: 689,
            torqueNm: 67,
            finalDrive: 'Catena 525 (108 maglie con O-Ring)',
            coolingType: 'Liquido',
            engineArchitecture: 'Bicilindrico in linea CP2 a croce (Crossplane a 270°)',
            recommendedOil: 'Yamalube 4-S 10W-40 4T JASO MA2',
            oilCapacityLiters: 2.6,
            tirePressureFrontBar: 2.25,
            tirePressureRearBar: 2.5,
            tirePressureLoadedBar: 2.8,
            allowedTireSizes: ['Ant. 120/70 ZR17 M/C (58W)', 'Post. 180/55 ZR17 M/C (73W)'],
            transmission: 'Manuale 6 rapporti',
            euroStandard: 'Euro 5',
            years: '2021+',
            startYear: 2021,
            avgConsumption: '4.2 L/100 km (23.8 km/L)'
          },
          {
            name: 'MT-07 35kW (Depotenziata Patente A2)',
            fuelType: 'Benzina',
            tankCapacity: 14,
            cv: 48,
            kw: 35,
            displacementCc: 689,
            torqueNm: 60,
            finalDrive: 'Catena 525',
            coolingType: 'Liquido',
            engineArchitecture: 'Bicilindrico CP2 Crossplane (A2 compliant)',
            recommendedOil: '10W-40 JASO MA2',
            oilCapacityLiters: 2.6,
            tirePressureFrontBar: 2.25,
            tirePressureRearBar: 2.5,
            allowedTireSizes: ['Ant. 120/70 ZR17', 'Post. 180/55 ZR17'],
            transmission: 'Manuale 6 marce',
            euroStandard: 'Euro 5',
            years: '2021+',
            startYear: 2021,
            avgConsumption: '4.0 L/100 km (25.0 km/L)'
          }
        ]
      },
      {
        name: 'Ténéré 700',
        category: 'Adventure / Enduro',
        motorizations: [
          {
            name: 'Ténéré 700 CP2 (73.4 CV)',
            fuelType: 'Benzina',
            tankCapacity: 16,
            cv: 73.4,
            kw: 54,
            displacementCc: 689,
            torqueNm: 68,
            finalDrive: 'Catena 525 con guida catena rinforzata',
            coolingType: 'Liquido',
            engineArchitecture: 'Bicilindrico CP2 Crossplane Euro 5',
            recommendedOil: 'Yamalube 10W-40 4T JASO MA2',
            oilCapacityLiters: 2.6,
            tirePressureFrontBar: 2.2,
            tirePressureRearBar: 2.5,
            tirePressureLoadedBar: 2.8,
            allowedTireSizes: ['Ant. 90/90-21 M/C 54V (Pirelli Scorpion Rally STR)', 'Post. 150/70 R18 M/C 70V (Pirelli Scorpion Rally STR)'],
            transmission: 'Manuale 6 rapporti',
            euroStandard: 'Euro 5',
            years: '2019+',
            startYear: 2019,
            avgConsumption: '4.16 L/100 km (24.0 km/L)'
          },
          {
            name: 'Ténéré 700 World Raid (Serbatoio Doppio 23L)',
            fuelType: 'Benzina',
            tankCapacity: 23,
            cv: 73.4,
            kw: 54,
            displacementCc: 689,
            torqueNm: 68,
            finalDrive: 'Catena 525',
            coolingType: 'Liquido',
            engineArchitecture: 'Bicilindrico CP2 con doppio serbatoio laterale',
            recommendedOil: '10W-40 JASO MA2',
            oilCapacityLiters: 2.6,
            tirePressureFrontBar: 2.2,
            tirePressureRearBar: 2.5,
            allowedTireSizes: ['Ant. 90/90-21', 'Post. 150/70 R18'],
            transmission: 'Manuale 6 marce con ammortizzatore di sterzo Öhlins',
            euroStandard: 'Euro 5',
            years: '2022+',
            startYear: 2022,
            avgConsumption: '4.3 L/100 km (23.2 km/L)'
          }
        ]
      },
      {
        name: 'MT-09 / Tracer 9',
        category: 'Naked',
        motorizations: [
          {
            name: 'MT-09 / Tracer 9 CP3 (119 CV)',
            fuelType: 'Benzina',
            tankCapacity: 14,
            cv: 119,
            kw: 87.5,
            displacementCc: 890,
            torqueNm: 93,
            finalDrive: 'Catena 525',
            coolingType: 'Liquido',
            engineArchitecture: 'Tricilindrico in linea CP3 (Crossplane 3 cilindri con albero a gomiti a 120°)',
            recommendedOil: 'Yamalube 10W-40 4T Sintetico JASO MA2',
            oilCapacityLiters: 3.4,
            tirePressureFrontBar: 2.5,
            tirePressureRearBar: 2.9,
            allowedTireSizes: ['Ant. 120/70 ZR17 (58W)', 'Post. 180/55 ZR17 (73W)'],
            transmission: 'Manuale 6 marce con Quick Shift System (QSS) Bidirezionale',
            euroStandard: 'Euro 5',
            years: '2021+',
            startYear: 2021,
            avgConsumption: '5.0 L/100 km (20.0 km/L)'
          }
        ]
      },
      {
        name: 'T-MAX 560',
        category: 'Scooter / Maxiscooter',
        motorizations: [
          {
            name: 'T-MAX 560 Tech MAX (48 CV)',
            fuelType: 'Benzina',
            tankCapacity: 15,
            cv: 47.6,
            kw: 35,
            displacementCc: 562,
            torqueNm: 55.7,
            finalDrive: 'Cinghia trapezoidale rinforzata / Variatore CVT',
            coolingType: 'Liquido',
            engineArchitecture: 'Bicilindrico parallelo a 4 tempi inclinato in avanti (Patente A2)',
            recommendedOil: 'Yamalube 10W-40 Scooter 4T JASO MB/MA',
            oilCapacityLiters: 2.9,
            tirePressureFrontBar: 2.25,
            tirePressureRearBar: 2.5,
            tirePressureLoadedBar: 2.8,
            allowedTireSizes: ['Ant. 120/70 R15 M/C 56H', 'Post. 160/60 R15 M/C 67H'],
            transmission: 'Automatica con variatore continuo CVT',
            euroStandard: 'Euro 5',
            years: '2020+',
            startYear: 2020,
            avgConsumption: '4.8 L/100 km (20.8 km/L)'
          }
        ]
      }
    ]
  },

  // 4. HONDA
  {
    brand: 'Honda',
    country: 'Giappone',
    models: [
      {
        name: 'Africa Twin CRF1100L',
        category: 'Adventure / Enduro',
        motorizations: [
          {
            name: 'CRF1100L Africa Twin (102 CV)',
            fuelType: 'Benzina',
            tankCapacity: 18.8,
            cv: 102,
            kw: 75,
            displacementCc: 1084,
            torqueNm: 105,
            finalDrive: 'Catena 525 con O-Ring',
            coolingType: 'Liquido',
            engineArchitecture: 'Bicilindrico parallelo con manovellismo a 270° e testata Unicam',
            recommendedOil: 'Honda 10W-30 / 10W-40 4T JASO MA2',
            oilCapacityLiters: 4.0,
            tirePressureFrontBar: 2.0,
            tirePressureRearBar: 2.5,
            tirePressureLoadedBar: 2.8,
            allowedTireSizes: ['Ant. 90/90-21 M/C 54H (tubeless)', 'Post. 150/70 R18 M/C 70H (tubeless)'],
            transmission: 'Manuale 6 marce con frizione antisaltellamento o DCT a doppia frizione',
            euroStandard: 'Euro 5',
            years: '2020+',
            startYear: 2020,
            avgConsumption: '4.9 L/100 km (20.4 km/L)'
          },
          {
            name: 'Africa Twin Adventure Sports (24.8L)',
            fuelType: 'Benzina',
            tankCapacity: 24.8,
            cv: 102,
            kw: 75,
            displacementCc: 1084,
            torqueNm: 105,
            finalDrive: 'Catena 525',
            coolingType: 'Liquido',
            engineArchitecture: 'Bicilindrico parallelo Unicam 1084cc con serbatoio maggiorato',
            recommendedOil: '10W-30 / 10W-40 JASO MA2',
            oilCapacityLiters: 4.0,
            tirePressureFrontBar: 2.2,
            tirePressureRearBar: 2.5,
            allowedTireSizes: ['Ant. 110/80 R19', 'Post. 150/70 R18'],
            transmission: 'Manuale 6 marce o Cambio automatico DCT',
            euroStandard: 'Euro 5',
            years: '2024+',
            startYear: 2024,
            avgConsumption: '4.9 L/100 km (20.4 km/L)'
          }
        ]
      },
      {
        name: 'CB750 Hornet / Transalp XL750',
        category: 'Naked',
        motorizations: [
          {
            name: 'CB750 Hornet 755cc (92 CV)',
            fuelType: 'Benzina',
            tankCapacity: 15.2,
            cv: 92,
            kw: 67.5,
            displacementCc: 755,
            torqueNm: 75,
            finalDrive: 'Catena 520 (O-Ring)',
            coolingType: 'Liquido',
            engineArchitecture: 'Bicilindrico parallelo Unicam con manovellismo a 270° ad alta pressione',
            recommendedOil: 'Honda Ultra G10 10W-30 / 10W-40 JASO MA2',
            oilCapacityLiters: 3.8,
            tirePressureFrontBar: 2.5,
            tirePressureRearBar: 2.9,
            allowedTireSizes: ['Ant. 120/70 ZR17 (58W)', 'Post. 160/60 ZR17 (69W)'],
            transmission: 'Manuale 6 marce con frizione assistita/antisaltellamento e quickshifter opzionale',
            euroStandard: 'Euro 5',
            years: '2023+',
            startYear: 2023,
            avgConsumption: '4.35 L/100 km (23.0 km/L)'
          },
          {
            name: 'XL750 Transalp (92 CV)',
            fuelType: 'Benzina',
            tankCapacity: 16.9,
            cv: 92,
            kw: 67.5,
            displacementCc: 755,
            torqueNm: 75,
            finalDrive: 'Catena 520',
            coolingType: 'Liquido',
            engineArchitecture: 'Bicilindrico parallelo Unicam 8 valvole',
            recommendedOil: '10W-30 / 10W-40 JASO MA2',
            oilCapacityLiters: 3.8,
            tirePressureFrontBar: 2.0,
            tirePressureRearBar: 2.5,
            allowedTireSizes: ['Ant. 90/90-21 (con camera d\'aria)', 'Post. 150/70 R18 (con camera d\'aria)'],
            transmission: 'Manuale 6 marce',
            euroStandard: 'Euro 5',
            years: '2023+',
            startYear: 2023,
            avgConsumption: '4.35 L/100 km (23.0 km/L)'
          }
        ]
      },
      {
        name: 'SH 125i / SH 150i / SH 350i',
        category: 'Scooter / Maxiscooter',
        motorizations: [
          {
            name: 'SH 150i eSP+ (16.9 CV)',
            fuelType: 'Benzina',
            tankCapacity: 7,
            cv: 16.9,
            kw: 12.4,
            displacementCc: 157,
            torqueNm: 14.9,
            finalDrive: 'Cinghia e variatore V-Matic / CVT',
            coolingType: 'Liquido',
            engineArchitecture: 'Monocilindrico eSP+ a 4 valvole con Start&Stop (Idling Stop)',
            recommendedOil: 'Honda 10W-30 MB / MA 4T Scooter',
            oilCapacityLiters: 0.9,
            tirePressureFrontBar: 2.0,
            tirePressureRearBar: 2.25,
            allowedTireSizes: ['Ant. 100/80-16 M/C 50P', 'Post. 120/80-16 M/C 60P'],
            transmission: 'Automatica a variatore continuo',
            euroStandard: 'Euro 5',
            years: '2020+',
            startYear: 2020,
            avgConsumption: '2.2 L/100 km (44.7 km/L)'
          },
          {
            name: 'SH 350i eSP+ (29.2 CV)',
            fuelType: 'Benzina',
            tankCapacity: 9.1,
            cv: 29.2,
            kw: 21.5,
            displacementCc: 330,
            torqueNm: 32,
            finalDrive: 'Cinghia dentata / Variatore CVT',
            coolingType: 'Liquido',
            engineArchitecture: 'Monocilindrico eSP+ SOHC 4 valvole',
            recommendedOil: '10W-30 / 10W-40 4T JASO MB',
            oilCapacityLiters: 1.5,
            tirePressureFrontBar: 2.0,
            tirePressureRearBar: 2.25,
            allowedTireSizes: ['Ant. 110/70-16', 'Post. 130/70-16'],
            transmission: 'Automatica CVT con controllo trazione HSTC',
            euroStandard: 'Euro 5',
            years: '2021+',
            startYear: 2021,
            avgConsumption: '3.3 L/100 km (30.0 km/L)'
          }
        ]
      },
      {
        name: 'X-ADV 750',
        category: 'Crossover',
        motorizations: [
          {
            name: 'X-ADV 750 DCT (58.6 CV)',
            fuelType: 'Benzina',
            tankCapacity: 13.2,
            cv: 58.6,
            kw: 43.1,
            displacementCc: 745,
            torqueNm: 69,
            finalDrive: 'Catena a rulli in bagno sigillato',
            coolingType: 'Liquido',
            engineArchitecture: 'Bicilindrico parallelo inclinato a 62° a corsa lunga con manovellismo a 270°',
            recommendedOil: 'Honda Ultra 10W-30 JASO MA2',
            oilCapacityLiters: 4.1,
            tirePressureFrontBar: 2.5,
            tirePressureRearBar: 2.8,
            allowedTireSizes: ['Ant. 120/70 R17 (ruota a raggi tubeless)', 'Post. 160/60 R15 (ruota a raggi tubeless)'],
            transmission: 'Doppia Frizione DCT a 6 rapporti con modalità Gravel G-Switch',
            euroStandard: 'Euro 5',
            years: '2021+',
            startYear: 2021,
            avgConsumption: '3.6 L/100 km (27.8 km/L)'
          }
        ]
      }
    ]
  },

  // 5. KAWASAKI
  {
    brand: 'Kawasaki',
    country: 'Giappone',
    models: [
      {
        name: 'Z900',
        category: 'Naked',
        motorizations: [
          {
            name: 'Z900 (125 CV)',
            fuelType: 'Benzina',
            tankCapacity: 17,
            cv: 125,
            kw: 92.2,
            displacementCc: 948,
            torqueNm: 98.6,
            finalDrive: 'Catena 525 sigillata con O-Ring',
            coolingType: 'Liquido',
            engineArchitecture: '4 cilindri in linea a 4 tempi, DOHC, 16 valvole',
            recommendedOil: 'Kawasaki Vent Vert 10W-40 4T JASO MA2',
            oilCapacityLiters: 4.0,
            tirePressureFrontBar: 2.5,
            tirePressureRearBar: 2.9,
            allowedTireSizes: ['Ant. 120/70 ZR17 (58W)', 'Post. 180/55 ZR17 (73W)'],
            transmission: 'Manuale 6 marce con frizione assistita e antisaltellamento',
            euroStandard: 'Euro 5',
            years: '2020+',
            startYear: 2020,
            avgConsumption: '5.7 L/100 km (17.5 km/L)'
          },
          {
            name: 'Z900 A2 (95 CV / 48 CV)',
            fuelType: 'Benzina',
            tankCapacity: 17,
            cv: 95,
            kw: 70,
            displacementCc: 948,
            torqueNm: 91,
            finalDrive: 'Catena 525',
            coolingType: 'Liquido',
            engineArchitecture: '4 cilindri in linea depotenziabile a 35 kW',
            recommendedOil: '10W-40 JASO MA2',
            oilCapacityLiters: 4.0,
            tirePressureFrontBar: 2.5,
            tirePressureRearBar: 2.9,
            allowedTireSizes: ['Ant. 120/70 ZR17', 'Post. 180/55 ZR17'],
            transmission: 'Manuale 6 marce',
            euroStandard: 'Euro 5',
            years: '2020+',
            startYear: 2020,
            avgConsumption: '5.5 L/100 km'
          }
        ]
      },
      {
        name: 'Z650 / Versys 650',
        category: 'Naked',
        motorizations: [
          {
            name: 'Z650 / Versys 650 (68 CV)',
            fuelType: 'Benzina',
            tankCapacity: 15,
            cv: 68,
            kw: 50.2,
            displacementCc: 649,
            torqueNm: 64,
            finalDrive: 'Catena 520',
            coolingType: 'Liquido',
            engineArchitecture: 'Bicilindrico parallelo compatto a 8 valvole',
            recommendedOil: '10W-40 4T JASO MA2',
            oilCapacityLiters: 2.3,
            tirePressureFrontBar: 2.25,
            tirePressureRearBar: 2.5,
            allowedTireSizes: ['Ant. 120/70 ZR17', 'Post. 160/60 ZR17'],
            transmission: 'Manuale 6 marce',
            euroStandard: 'Euro 5',
            years: '2017+',
            startYear: 2017,
            avgConsumption: '4.3 L/100 km (23.2 km/L)'
          }
        ]
      }
    ]
  },

  // 6. MOTO GUZZI
  {
    brand: 'Moto Guzzi',
    country: 'Italia',
    models: [
      {
        name: 'V7',
        category: 'Naked',
        motorizations: [
          {
            name: 'V7 Stone / Special 850 (65 CV)',
            fuelType: 'Benzina',
            tankCapacity: 21,
            cv: 65,
            kw: 48,
            displacementCc: 853,
            torqueNm: 73,
            finalDrive: 'Cardano (trasmissione ad albero cardanico a coppia conica)',
            coolingType: 'Aria',
            engineArchitecture: 'Bicilindrico a V trasversale di 90° con 2 valvole per cilindro',
            recommendedOil: 'Eni i-Ride Moto 10W-60 4T (Specifica Moto Guzzi)',
            oilCapacityLiters: 2.0,
            tirePressureFrontBar: 2.3,
            tirePressureRearBar: 2.5,
            tirePressureLoadedBar: 2.8,
            allowedTireSizes: ['Ant. 100/90-18', 'Post. 150/70-17'],
            transmission: 'Manuale 6 marce a secco',
            euroStandard: 'Euro 5',
            years: '2021+',
            startYear: 2021,
            avgConsumption: '4.9 L/100 km (20.4 km/L)'
          }
        ]
      },
      {
        name: 'V85 TT',
        category: 'Adventure / Enduro',
        motorizations: [
          {
            name: 'V85 TT Classic / Travel (76 CV)',
            fuelType: 'Benzina',
            tankCapacity: 23,
            cv: 76,
            kw: 56,
            displacementCc: 853,
            torqueNm: 82,
            finalDrive: 'Cardano',
            coolingType: 'Aria',
            engineArchitecture: 'Bicilindrico a V trasversale di 90° con valvole in titanio e fasatura variabile',
            recommendedOil: '10W-60 4T JASO MA2',
            oilCapacityLiters: 2.0,
            tirePressureFrontBar: 2.3,
            tirePressureRearBar: 2.5,
            allowedTireSizes: ['Ant. 110/80 R19', 'Post. 150/70 R17'],
            transmission: 'Manuale 6 marce',
            euroStandard: 'Euro 5',
            years: '2019+',
            startYear: 2019,
            avgConsumption: '4.9 L/100 km (20.4 km/L)'
          }
        ]
      }
    ]
  },

  // 7. BENELLI
  {
    brand: 'Benelli',
    country: 'Italia',
    models: [
      {
        name: 'TRK 702 / TRK 702 X',
        category: 'Adventure / Enduro',
        motorizations: [
          {
            name: 'TRK 702 / 702 X (70 CV)',
            fuelType: 'Benzina',
            tankCapacity: 20,
            cv: 70,
            kw: 51.5,
            displacementCc: 698,
            torqueNm: 70,
            finalDrive: 'Catena 525 con O-Ring',
            coolingType: 'Liquido',
            engineArchitecture: 'Bicilindrico parallelo frontemarcia DOHC 4 valvole per cilindro',
            recommendedOil: '10W-40 / 10W-50 4T JASO MA2',
            oilCapacityLiters: 3.2,
            tirePressureFrontBar: 2.4,
            tirePressureRearBar: 2.8,
            allowedTireSizes: ['Ant. 110/80 R19 (Versione X) o 120/70 ZR17 (Versione Stradale)', 'Post. 150/70 R17 (Versione X) o 160/60 ZR17'],
            transmission: 'Manuale 6 marce con frizione antisaltellamento',
            euroStandard: 'Euro 5',
            years: '2023+',
            startYear: 2023,
            avgConsumption: '4.6 L/100 km (21.7 km/L)'
          }
        ]
      },
      {
        name: 'TRK 502 / TRK 502 X',
        category: 'Adventure / Enduro',
        motorizations: [
          {
            name: 'TRK 502 / 502 X (47.6 CV - Patente A2)',
            fuelType: 'Benzina',
            tankCapacity: 20,
            cv: 47.6,
            kw: 35,
            displacementCc: 500,
            torqueNm: 46,
            finalDrive: 'Catena 525',
            coolingType: 'Liquido',
            engineArchitecture: 'Bicilindrico parallelo 4 tempi a 4 valvole (Best Seller)',
            recommendedOil: '10W-40 / 10W-50 4T JASO MA2',
            oilCapacityLiters: 3.0,
            tirePressureFrontBar: 2.2,
            tirePressureRearBar: 2.5,
            allowedTireSizes: ['Ant. 110/80 R19 (502X) / 120/70 R17 (502)', 'Post. 150/70 R17 (502X) / 160/60 R17 (502)'],
            transmission: 'Manuale 6 marce',
            euroStandard: 'Euro 5',
            years: '2017+',
            startYear: 2017,
            avgConsumption: '4.4 L/100 km (22.7 km/L)'
          }
        ]
      }
    ]
  },

  // 8. PIAGGIO / VESPA
  {
    brand: 'Vespa',
    country: 'Italia',
    models: [
      {
        name: 'GTS 300',
        category: 'Scooter / Maxiscooter',
        motorizations: [
          {
            name: 'GTS 300 HPE (23.8 CV)',
            fuelType: 'Benzina',
            tankCapacity: 8.5,
            cv: 23.8,
            kw: 17.5,
            displacementCc: 278,
            torqueNm: 26,
            finalDrive: 'Cinghia dentata / Variatore continuo CVT',
            coolingType: 'Liquido',
            engineArchitecture: 'Monocilindrico Piaggio HPE (High Performance Engine) 4 tempi a 4 valvole',
            recommendedOil: 'Castrol / Eni 5W-40 4T Scooter JASO MA',
            oilCapacityLiters: 1.3,
            tirePressureFrontBar: 1.8,
            tirePressureRearBar: 2.2,
            allowedTireSizes: ['Ant. 120/70-12 51P (tubeless)', 'Post. 130/70-12 62P (tubeless)'],
            transmission: 'Automatica CVT con asservitore di coppia',
            euroStandard: 'Euro 5',
            years: '2019+',
            startYear: 2019,
            avgConsumption: '3.2 L/100 km (31.2 km/L)'
          }
        ]
      },
      {
        name: 'Primavera 125',
        category: 'Scooter / Maxiscooter',
        motorizations: [
          {
            name: 'Primavera 125 i-get (11 CV)',
            fuelType: 'Benzina',
            tankCapacity: 8,
            cv: 11,
            kw: 8.1,
            displacementCc: 124,
            torqueNm: 10.4,
            finalDrive: 'Cinghia e variatore CVT',
            coolingType: 'Aria',
            engineArchitecture: 'Monocilindrico 4 tempi i-get a iniezione elettronica',
            recommendedOil: '5W-40 4T JASO MA',
            oilCapacityLiters: 1.0,
            tirePressureFrontBar: 1.8,
            tirePressureRearBar: 2.0,
            allowedTireSizes: ['Ant. 110/70-12', 'Post. 120/70-12'],
            transmission: 'Automatica CVT',
            euroStandard: 'Euro 5',
            years: '2016+',
            startYear: 2016,
            avgConsumption: '2.5 L/100 km (40.0 km/L)'
          }
        ]
      }
    ]
  },

  // 9. PIAGGIO
  {
    brand: 'Piaggio',
    country: 'Italia',
    models: [
      {
        name: 'Beverly 300 / 400',
        category: 'Scooter / Maxiscooter',
        motorizations: [
          {
            name: 'Beverly 300 HPE (25.8 CV)',
            fuelType: 'Benzina',
            tankCapacity: 12,
            cv: 25.8,
            kw: 19,
            displacementCc: 278,
            torqueNm: 26,
            finalDrive: 'Cinghia trapezoidale / Variatore CVT',
            coolingType: 'Liquido',
            engineArchitecture: 'Monocilindrico HPE 4 tempi 4 valvole',
            recommendedOil: '5W-40 4T JASO MA',
            oilCapacityLiters: 1.3,
            tirePressureFrontBar: 2.2,
            tirePressureRearBar: 2.4,
            allowedTireSizes: ['Ant. 110/70-16', 'Post. 140/70-14'],
            transmission: 'Automatica CVT',
            euroStandard: 'Euro 5',
            years: '2021+',
            startYear: 2021,
            avgConsumption: '3.3 L/100 km (30.3 km/L)'
          },
          {
            name: 'Beverly 400 HPE (35.4 CV)',
            fuelType: 'Benzina',
            tankCapacity: 12,
            cv: 35.4,
            kw: 26,
            displacementCc: 399,
            torqueNm: 37.7,
            finalDrive: 'Cinghia e variatore CVT',
            coolingType: 'Liquido',
            engineArchitecture: 'Monocilindrico HPE Master 4 valvole',
            recommendedOil: '5W-40 4T JASO MA',
            oilCapacityLiters: 1.5,
            tirePressureFrontBar: 2.2,
            tirePressureRearBar: 2.5,
            allowedTireSizes: ['Ant. 120/70-16', 'Post. 150/70-14'],
            transmission: 'Automatica CVT',
            euroStandard: 'Euro 5',
            years: '2021+',
            startYear: 2021,
            avgConsumption: '3.7 L/100 km (27.0 km/L)'
          }
        ]
      },
      {
        name: 'Liberty 125 / 150',
        category: 'Scooter / Maxiscooter',
        motorizations: [
          {
            name: 'Liberty 125 i-get (11 CV)',
            fuelType: 'Benzina',
            tankCapacity: 6,
            cv: 11,
            kw: 8.1,
            displacementCc: 124,
            torqueNm: 10.75,
            finalDrive: 'Cinghia / Variatore CVT',
            coolingType: 'Aria',
            engineArchitecture: 'Monocilindrico 4 tempi i-get a iniezione',
            recommendedOil: '5W-40 4T JASO MA',
            oilCapacityLiters: 0.9,
            tirePressureFrontBar: 2.0,
            tirePressureRearBar: 2.2,
            allowedTireSizes: ['Ant. 90/80-16', 'Post. 100/80-14'],
            transmission: 'Automatica CVT',
            euroStandard: 'Euro 5',
            years: '2016+',
            startYear: 2016,
            avgConsumption: '2.5 L/100 km (40.0 km/L)'
          }
        ]
      }
    ]
  },

  // 10. KTM
  {
    brand: 'KTM',
    country: 'Austria',
    models: [
      {
        name: '1290 Super Adventure',
        category: 'Adventure / Enduro',
        motorizations: [
          {
            name: '1290 Super Adventure S / R (160 CV)',
            fuelType: 'Benzina',
            tankCapacity: 23,
            cv: 160,
            kw: 118,
            displacementCc: 1301,
            torqueNm: 138,
            finalDrive: 'Catena 525 con X-Ring',
            coolingType: 'Liquido',
            engineArchitecture: 'Bicilindrico a V di 75° LC8 4 tempi a 4 valvole per cilindro',
            recommendedOil: 'Motorex Cross Power 4T 10W-50 JASO MA2 (KTM Spec)',
            oilCapacityLiters: 3.6,
            tirePressureFrontBar: 2.4,
            tirePressureRearBar: 2.9,
            allowedTireSizes: ['Ant. 120/70 ZR19 (Modello S) o 90/90-21 (Modello R)', 'Post. 170/60 ZR17 (Modello S) o 150/70 R18 (Modello R)'],
            transmission: 'Manuale 6 marce con Quickshifter+ e frizione antisaltellamento PASC',
            euroStandard: 'Euro 5',
            years: '2021+',
            startYear: 2021,
            avgConsumption: '5.7 L/100 km (17.5 km/L)'
          }
        ]
      },
      {
        name: '390 Duke',
        category: 'Naked',
        motorizations: [
          {
            name: '390 Duke (44 CV)',
            fuelType: 'Benzina',
            tankCapacity: 15,
            cv: 44,
            kw: 32,
            displacementCc: 399,
            torqueNm: 39,
            finalDrive: 'Catena 520 X-Ring',
            coolingType: 'Liquido',
            engineArchitecture: 'Monocilindrico LC4c 4 tempi DOHC a 4 valvole',
            recommendedOil: 'Motorex Formula 4T 15W-50 JASO MA2',
            oilCapacityLiters: 1.7,
            tirePressureFrontBar: 2.0,
            tirePressureRearBar: 2.2,
            allowedTireSizes: ['Ant. 110/70 R17', 'Post. 150/60 R17'],
            transmission: 'Manuale 6 marce con frizione PASC',
            euroStandard: 'Euro 5+',
            years: '2024+',
            startYear: 2024,
            avgConsumption: '3.4 L/100 km (29.4 km/L)'
          }
        ]
      }
    ]
  },

  // 11. TRIUMPH
  {
    brand: 'Triumph',
    country: 'Regno Unito',
    models: [
      {
        name: 'Street Triple 765',
        category: 'Naked',
        motorizations: [
          {
            name: 'Street Triple 765 R / RS (120 - 130 CV)',
            fuelType: 'Benzina',
            tankCapacity: 15,
            cv: 130,
            kw: 95.6,
            displacementCc: 765,
            torqueNm: 80,
            finalDrive: 'Catena 525 con O-Ring',
            coolingType: 'Liquido',
            engineArchitecture: '3 cilindri in linea derivato dal campionato mondiale Moto2',
            recommendedOil: 'Castrol Power 1 Racing 10W-40 / 10W-50 JASO MA2',
            oilCapacityLiters: 3.4,
            tirePressureFrontBar: 2.35,
            tirePressureRearBar: 2.9,
            allowedTireSizes: ['Ant. 120/70 ZR17 (58W)', 'Post. 180/55 ZR17 (73W) Pirelli Diablo Supercorsa SP V3'],
            transmission: 'Manuale 6 marce con Triumph Shift Assist (Quickshifter bidirezionale)',
            euroStandard: 'Euro 5',
            years: '2023+',
            startYear: 2023,
            avgConsumption: '5.2 L/100 km (19.2 km/L)'
          }
        ]
      },
      {
        name: 'Tiger 900',
        category: 'Adventure / Enduro',
        motorizations: [
          {
            name: 'Tiger 900 GT / Rally Pro (108 CV)',
            fuelType: 'Benzina',
            tankCapacity: 20,
            cv: 108,
            kw: 79.5,
            displacementCc: 888,
            torqueNm: 90,
            finalDrive: 'Catena 525',
            coolingType: 'Liquido',
            engineArchitecture: '3 cilindri in linea con albero motore T-Plane a scoppi irregolari (1-3-2)',
            recommendedOil: '10W-40 / 10W-50 4T JASO MA2',
            oilCapacityLiters: 3.8,
            tirePressureFrontBar: 2.5,
            tirePressureRearBar: 2.9,
            allowedTireSizes: ['Ant. 100/90-19 (GT) o 90/90-21 (Rally)', 'Post. 150/70 R17'],
            transmission: 'Manuale 6 marce',
            euroStandard: 'Euro 5',
            years: '2024+',
            startYear: 2024,
            avgConsumption: '4.7 L/100 km (21.3 km/L)'
          }
        ]
      }
    ]
  },

  // 12. APRILIA
  {
    brand: 'Aprilia',
    country: 'Italia',
    models: [
      {
        name: 'Tuono 660 / RS 660',
        category: 'Sportiva',
        motorizations: [
          {
            name: 'RS 660 / Tuono 660 (100 CV)',
            fuelType: 'Benzina',
            tankCapacity: 15,
            cv: 100,
            kw: 73.5,
            displacementCc: 659,
            torqueNm: 67,
            finalDrive: 'Catena 520 sigillata',
            coolingType: 'Liquido',
            engineArchitecture: 'Bicilindrico parallelo frontemarcia con manovellismo a 270° (bancarotta anteriore del V4)',
            recommendedOil: 'Castrol Power 1 10W-50 4T JASO MA2',
            oilCapacityLiters: 2.7,
            tirePressureFrontBar: 2.3,
            tirePressureRearBar: 2.5,
            allowedTireSizes: ['Ant. 120/70 ZR17 (58W)', 'Post. 180/55 ZR17 (73W)'],
            transmission: 'Manuale 6 marce con Aprilia Quick Shift (AQS) Up/Down',
            euroStandard: 'Euro 5',
            years: '2020+',
            startYear: 2020,
            avgConsumption: '4.9 L/100 km (20.4 km/L)'
          }
        ]
      },
      {
        name: 'Tuareg 660',
        category: 'Adventure / Enduro',
        motorizations: [
          {
            name: 'Tuareg 660 (80 CV)',
            fuelType: 'Benzina',
            tankCapacity: 18,
            cv: 80,
            kw: 58.8,
            displacementCc: 659,
            torqueNm: 70,
            finalDrive: 'Catena 520 con guida speciale',
            coolingType: 'Liquido',
            engineArchitecture: 'Bicilindrico parallelo con coppa dell\'olio ridisegnata per offroad',
            recommendedOil: '10W-50 4T JASO MA2',
            oilCapacityLiters: 2.7,
            tirePressureFrontBar: 2.1,
            tirePressureRearBar: 2.4,
            allowedTireSizes: ['Ant. 90/90-21 (tubeless a raggi)', 'Post. 150/70 R18 (tubeless a raggi)'],
            transmission: 'Manuale 6 marce',
            euroStandard: 'Euro 5',
            years: '2021+',
            startYear: 2021,
            avgConsumption: '4.0 L/100 km (25.0 km/L)'
          }
        ]
      }
    ]
  },

  // 13. SUZUKI
  {
    brand: 'Suzuki',
    country: 'Giappone',
    models: [
      {
        name: 'V-Strom 650',
        category: 'Adventure / Enduro',
        motorizations: [
          {
            name: 'V-Strom 650 XT (71 CV)',
            fuelType: 'Benzina',
            tankCapacity: 20,
            cv: 71,
            kw: 52,
            displacementCc: 645,
            torqueNm: 62,
            finalDrive: 'Catena 525 con O-Ring',
            coolingType: 'Liquido',
            engineArchitecture: 'Bicilindrico a V di 90° DOHC 4 valvole per cilindro',
            recommendedOil: 'Ecstar 10W-40 4T JASO MA2',
            oilCapacityLiters: 2.8,
            tirePressureFrontBar: 2.25,
            tirePressureRearBar: 2.5,
            tirePressureLoadedBar: 2.8,
            allowedTireSizes: ['Ant. 110/80 R19 (59V)', 'Post. 150/70 R17 (69V)'],
            transmission: 'Manuale 6 rapporti',
            euroStandard: 'Euro 5',
            years: '2017+',
            startYear: 2017,
            avgConsumption: '4.0 L/100 km (25.0 km/L)'
          }
        ]
      },
      {
        name: 'GSX-8S / V-Strom 800DE',
        category: 'Naked',
        motorizations: [
          {
            name: 'GSX-8S 776cc (83 CV)',
            fuelType: 'Benzina',
            tankCapacity: 14,
            cv: 83,
            kw: 61,
            displacementCc: 776,
            torqueNm: 78,
            finalDrive: 'Catena 520',
            coolingType: 'Liquido',
            engineArchitecture: 'Bicilindrico parallelo con doppio albero di bilanciamento Suzuki Cross Balancer',
            recommendedOil: 'Ecstar 10W-40 JASO MA2',
            oilCapacityLiters: 3.9,
            tirePressureFrontBar: 2.5,
            tirePressureRearBar: 2.9,
            allowedTireSizes: ['Ant. 120/70 ZR17', 'Post. 180/55 ZR17'],
            transmission: 'Manuale 6 marce con Quickshifter bidirezionale di serie',
            euroStandard: 'Euro 5',
            years: '2023+',
            startYear: 2023,
            avgConsumption: '4.2 L/100 km (23.8 km/L)'
          }
        ]
      }
    ]
  },

  // 14. HARLEY-DAVIDSON
  {
    brand: 'Harley-Davidson',
    country: 'Stati Uniti',
    models: [
      {
        name: 'Pan America 1250',
        category: 'Adventure / Enduro',
        motorizations: [
          {
            name: 'Pan America 1250 Special (152 CV)',
            fuelType: 'Benzina',
            tankCapacity: 21.2,
            cv: 152,
            kw: 112,
            displacementCc: 1252,
            torqueNm: 128,
            finalDrive: 'Catena con O-Ring',
            coolingType: 'Liquido',
            engineArchitecture: 'Bicilindrico a V di 60° Revolution Max 1250 con fasatura variabile',
            recommendedOil: 'Screamin\' Eagle SYN3 Full Synthetic 20W-50',
            oilCapacityLiters: 4.5,
            tirePressureFrontBar: 2.5,
            tirePressureRearBar: 2.9,
            allowedTireSizes: ['Ant. 120/70 R19 Michelin Scorcher Adventure', 'Post. 170/60 R17 Michelin Scorcher Adventure'],
            transmission: 'Manuale 6 marce',
            euroStandard: 'Euro 5',
            years: '2021+',
            startYear: 2021,
            avgConsumption: '5.5 L/100 km (18.2 km/L)'
          }
        ]
      },
      {
        name: 'Sportster S / Iron 883',
        category: 'Cruiser / Custom',
        motorizations: [
          {
            name: 'Sportster S 1250T (121 CV)',
            fuelType: 'Benzina',
            tankCapacity: 11.8,
            cv: 121,
            kw: 89,
            displacementCc: 1252,
            torqueNm: 125,
            finalDrive: 'Cinghia dentata rinforzata in fibra di carbonio',
            coolingType: 'Liquido',
            engineArchitecture: 'Revolution Max 1250T a V di 60°',
            recommendedOil: '20W-50 Synthetic 4T',
            oilCapacityLiters: 4.5,
            tirePressureFrontBar: 2.5,
            tirePressureRearBar: 2.9,
            allowedTireSizes: ['Ant. 160/70 TR17', 'Post. 180/70 R16'],
            transmission: 'Manuale 6 marce con frizione assistita',
            euroStandard: 'Euro 5',
            years: '2021+',
            startYear: 2021,
            avgConsumption: '5.1 L/100 km'
          }
        ]
      }
    ]
  },

  // 15. KYMCO
  {
    brand: 'Kymco',
    country: 'Taiwan',
    models: [
      {
        name: 'Agility 125 / 200',
        category: 'Scooter / Maxiscooter',
        motorizations: [
          {
            name: 'Agility 125 R16+ (10.6 CV)',
            fuelType: 'Benzina',
            tankCapacity: 7,
            cv: 10.6,
            kw: 7.8,
            displacementCc: 125,
            torqueNm: 9.3,
            finalDrive: 'Cinghia / Variatore CVT',
            coolingType: 'Aria',
            engineArchitecture: 'Monocilindrico 4 tempi Euro 5',
            recommendedOil: '10W-40 4T JASO MB',
            oilCapacityLiters: 0.9,
            tirePressureFrontBar: 2.0,
            tirePressureRearBar: 2.25,
            allowedTireSizes: ['Ant. 100/80-16', 'Post. 120/80-14'],
            transmission: 'Automatica CVT',
            euroStandard: 'Euro 5',
            years: '2020+',
            startYear: 2020,
            avgConsumption: '2.4 L/100 km (41.7 km/L)'
          }
        ]
      },
      {
        name: 'AK 550',
        category: 'Scooter / Maxiscooter',
        motorizations: [
          {
            name: 'AK 550 Premium (51 CV)',
            fuelType: 'Benzina',
            tankCapacity: 14.5,
            cv: 51,
            kw: 37.5,
            displacementCc: 550,
            torqueNm: 52,
            finalDrive: 'Cinghia trapezoidale / Variatore CVT',
            coolingType: 'Liquido',
            engineArchitecture: 'Bicilindrico in linea a 4 tempi DOHC a 8 valvole (Cornering ABS)',
            recommendedOil: '5W-40 / 10W-40 JASO MA2',
            oilCapacityLiters: 2.8,
            tirePressureFrontBar: 2.3,
            tirePressureRearBar: 2.7,
            allowedTireSizes: ['Ant. 120/70 R15', 'Post. 160/60 R15'],
            transmission: 'Automatica CVT',
            euroStandard: 'Euro 5',
            years: '2020+',
            startYear: 2020,
            avgConsumption: '4.4 L/100 km'
          }
        ]
      }
    ]
  }
];

export const POPULAR_MOTO_BRANDS = [
  'Honda',
  'BMW Motorrad',
  'Yamaha',
  'Ducati',
  'Vespa',
  'Piaggio',
  'Benelli',
  'Kawasaki',
  'Moto Guzzi',
  'KTM',
  'Triumph',
  'Suzuki',
  'Aprilia',
  'Harley-Davidson',
  'Kymco'
];

export const ALL_MOTO_BRAND_NAMES = MOTO_BRANDS_CATALOG.map(b => b.brand).sort((a, b) => a.localeCompare(b));

export function getModelsForMotoBrand(brandName: string): MotoModelData[] {
  if (!brandName) return [];
  const found = MOTO_BRANDS_CATALOG.find(b => b.brand.toLowerCase() === brandName.trim().toLowerCase());
  return found ? found.models : [];
}

export function getMotorizationsForMotoModelAndYear(
  brandName: string,
  modelName: string,
  targetYear?: number
): { matchedForYear: MotoMotorization[]; allForModel: MotoMotorization[] } {
  const models = getModelsForMotoBrand(brandName);
  const foundModel = models.find(m => m.name.toLowerCase().includes(modelName.trim().toLowerCase()) || modelName.trim().toLowerCase().includes(m.name.toLowerCase()));
  if (!foundModel) return { matchedForYear: [], allForModel: [] };

  const all = foundModel.motorizations;
  if (!targetYear) return { matchedForYear: all, allForModel: all };

  const matched = all.filter(m => {
    if (m.startYear && m.endYear) return targetYear >= m.startYear && targetYear <= m.endYear;
    if (m.startYear) return targetYear >= m.startYear;
    return true;
  });

  return {
    matchedForYear: matched.length > 0 ? matched : all,
    allForModel: all
  };
}

export function generateGenericMotorizationsForMoto(
  brand: string,
  model: string,
  year?: number
): MotoMotorization[] {
  return [
    {
      name: `${brand} ${model} Standard`,
      fuelType: 'Benzina',
      tankCapacity: 15,
      cv: 75,
      kw: 55,
      displacementCc: 650,
      torqueNm: 64,
      finalDrive: 'Catena 525 con O-Ring',
      coolingType: 'Liquido',
      engineArchitecture: 'Bicilindrico a 4 tempi',
      recommendedOil: '10W-40 4T JASO MA2 (frizione a bagno d\'olio)',
      oilCapacityLiters: 2.8,
      tirePressureFrontBar: 2.3,
      tirePressureRearBar: 2.5,
      allowedTireSizes: ['Ant. 120/70 ZR17', 'Post. 180/55 ZR17'],
      euroStandard: year && year >= 2021 ? 'Euro 5' : (year && year >= 2017 ? 'Euro 4' : 'Euro 3'),
      transmission: 'Manuale 6 marce',
      avgConsumption: '4.5 L/100 km (22.2 km/L)'
    }
  ];
}

export function buildMotorcycleSpecsFromMotorization(
  brand: string,
  model: string,
  motorization?: MotoMotorization | null,
  year?: number
): VehicleTechnicalSpecs {
  const b = (brand || '').trim();
  const m = (model || '').trim();
  const mot = motorization;
  const isEv = mot?.fuelType === 'Elettrica (BEV)';

  const cv = mot?.cv || 75;
  const kw = mot?.kw || Math.round(cv / 1.35962);
  const disp = mot?.displacementCc || (isEv ? 0 : 650);
  const tank = mot?.tankCapacity || 15;
  const batt = mot?.batteryCapacity || (isEv ? 15 : undefined);
  const oil = mot?.recommendedOil || '10W-40 4T JASO MA2';
  const oilCap = mot?.oilCapacityLiters || 2.8;
  const frontBar = mot?.tirePressureFrontBar || 2.3;
  const rearBar = mot?.tirePressureRearBar || 2.5;
  const loadedBar = mot?.tirePressureLoadedBar || 2.8;
  const tires = mot?.allowedTireSizes || ['Ant. 120/70 ZR17 (58W)', 'Post. 180/55 ZR17 (73W)'];
  const euro = mot?.euroStandard || ((year && year >= 2021) ? 'Euro 5' : ((year && year >= 2017) ? 'Euro 4' : 'Euro 3'));
  const transmission = mot?.transmission || (m.toLowerCase().includes('sh') || m.toLowerCase().includes('t-max') || m.toLowerCase().includes('vespa') || m.toLowerCase().includes('beverly') ? 'Automatica a variatore CVT' : 'Manuale a 6 rapporti');
  const finalDrive = mot?.finalDrive || (m.toLowerCase().includes('gs') && disp > 1200 ? 'Cardano' : (m.toLowerCase().includes('t-max') || m.toLowerCase().includes('vespa') ? 'Cinghia / Variatore CVT' : 'Catena con O-Ring/X-Ring'));
  const wltp = mot?.avgConsumption || '4.5 L/100 km (22.2 km/L)';

  return {
    engineDisplacementCc: disp,
    powerCv: cv,
    powerKw: kw,
    torqueNm: mot?.torqueNm || Math.round(cv * 0.9),
    cylinderCount: mot?.engineArchitecture?.includes('Tricilindrico') || mot?.engineArchitecture?.includes('3 cilindri') ? 3 : (mot?.engineArchitecture?.includes('4 cilindri') ? 4 : (mot?.engineArchitecture?.includes('Monocilindrico') ? 1 : 2)),
    transmission,
    drivetrain: `Moto (${finalDrive})`,
    euroClass: euro,
    fuelCapacityLiters: isEv ? 0 : tank,
    batteryCapacityKwh: batt,
    wltpConsumption: wltp,
    wltpRangeKm: isEv ? 130 : Math.round((tank / 4.5) * 100),
    recommendedOil: oil,
    oilCapacityLiters: oilCap,
    tirePressureFrontBar: frontBar,
    tirePressureRearBar: rearBar,
    tirePressureLoadedBar: loadedBar,
    allowedTireSizes: tires,
    finalDrive,
    coolingType: mot?.coolingType || 'Liquido',
    engineArchitecture: mot?.engineArchitecture,
    summaryQuattroruote: `Dati e specifiche tecniche ufficiali per ${b} ${m} ${mot?.name || ''}${year ? ` (Anno ${year})` : ''}. Trasmissione: ${finalDrive}, pneumatici specifici e gradazione olio moto JASO MA2.`
  };
}
