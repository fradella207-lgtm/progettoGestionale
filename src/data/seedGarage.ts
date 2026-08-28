import { Vehicle } from '../types';

export const SEED_GARAGE: Vehicle[] = [
  {
    id: 'car_1',
    brand: 'Alfa Romeo',
    model: 'Giulia 2.2 Turbo',
    plate: 'GA 892 TR',
    fuelType: 'Diesel',
    tankCapacity: 52,
    motorization: '2.2 Turbo Diesel 190 CV AT8 Q2',
    powerCv: 190,
    powerKw: 140,
    driveType: 'Trazione Posteriore (RWD)',
    differential: 'Differenziale Autobloccante Meccanico Q2',
    registrationDate: '2021-04-15',
    initialKm: 50000,
    photoUrl: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800&auto=format&fit=crop&q=80',
    technicalSpecs: {
      engineDisplacementCc: 2143,
      powerCv: 190,
      powerKw: 140,
      torqueNm: 450,
      cylinderCount: 4,
      transmission: 'Automatico AT8 ZF ad 8 rapporti con palette in alluminio',
      drivetrain: 'Trazione Posteriore con albero di trasmissione in fibra di carbonio',
      euroClass: 'Euro 6D-Temp-EVAP-ISC',
      fuelCapacityLiters: 52,
      wltpConsumption: '5.2 L/100 km (19.2 km/L)',
      wltpRangeKm: 1000,
      recommendedOil: '0W-20 Selenia WR Forward (Specifica Fiat 9.55535-DSX)',
      oilCapacityLiters: 4.3,
      tirePressureFrontBar: 2.3,
      tirePressureRearBar: 2.5,
      tirePressureLoadedBar: 2.8,
      allowedTireSizes: [
        '225/50 R17 94W',
        'Ant. 225/45 R18 91Y - Post. 255/40 R18 95Y',
        'Ant. 225/40 R19 89Y - Post. 255/35 R19 92Y'
      ],
      dimensions: {
        lengthMm: 4643,
        widthMm: 1860,
        heightMm: 1436,
        trunkLiters: 480,
        curbWeightKg: 1540,
        towingCapacityKg: 1600
      },
      vin: 'ZAR95200007891234',
      engineCode: '55271040',
      summaryQuattroruote: 'Berlina sportiva con telaio Giorgio, distribuzione pesi 50:50 perfetta e sterzo ultra-diretto con rapporto 11.8:1.'
    },
    documents: [
      {
        id: 'doc_1_1',
        title: 'Libretto di Circolazione (DUC)',
        type: 'libretto',
        fileName: 'Libretto_Alfa_Giulia_GA892TR.pdf',
        fileType: 'application/pdf',
        fileData: '',
        uploadDate: '2026-05-10',
        notes: 'Documento Unico di Circolazione e Proprietà (DUC)'
      },
      {
        id: 'doc_1_2',
        title: 'Certificato Polizza RCA + Furto/Incendio',
        type: 'assicurazione',
        fileName: 'Polizza_Allianz_2026.pdf',
        fileType: 'application/pdf',
        fileData: '',
        uploadDate: '2026-04-10',
        expiryDate: '2027-04-15',
        notes: 'Allianz Direct - Polizza n. 892019482'
      }
    ],
    refuels: [
      { id: 'r_1', date: '2026-06-10', km: 81200, quantity: 45.5, price: 82.00, type: 'full', notes: 'Q8 Easy Autostrada A1' },
      { id: 'r_2', date: '2026-07-02', km: 82100, quantity: 46.0, price: 83.50, type: 'full', notes: 'Eni Station' },
      { id: 'r_3', date: '2026-07-28', km: 83150, quantity: 51.2, price: 92.00, type: 'full', notes: 'IP Self Service' },
      { id: 'r_4', date: '2026-08-15', km: 84500, quantity: 48.0, price: 87.00, type: 'full', notes: 'Tamoil tangenziale' }
    ],
    maintenances: [
      { id: 'm_1', date: '2024-05-10', km: 45000, category: 'Tagliando Ordinario', description: 'Olio Motore 0W20 Selenia, Filtro Olio, Filtro Aria, Filtro Abitacolo', workshop: 'Alfa Romeo Motor Village', cost: 380.00 },
      { id: 'm_2', date: '2025-06-20', km: 65000, category: 'Freni (Pastiglie/Dischi)', description: 'Sostituzione pastiglie freno anteriori e posteriori Brembo', workshop: 'Autofficina Rossi', cost: 260.00 },
      { id: 'm_3', date: '2026-02-14', km: 78000, category: 'Tagliando Ordinario', description: 'Tagliando completo e controllo livelli', workshop: 'Alfa Romeo Service', cost: 420.00 }
    ]
  },
  {
    id: 'car_2',
    brand: 'Tesla',
    model: 'Model 3 Long Range',
    plate: 'GE 402 EV',
    fuelType: 'Elettrica (BEV)',
    tankCapacity: 75,
    batteryCapacity: 75,
    motorization: 'Dual Motor AWD Long Range 498 CV',
    powerCv: 498,
    powerKw: 366,
    driveType: 'Trazione Integrale Dual Motor (AWD)',
    registrationDate: '2022-09-10',
    initialKm: 12000,
    photoUrl: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&auto=format&fit=crop&q=80',
    technicalSpecs: {
      powerCv: 498,
      powerKw: 366,
      torqueNm: 493,
      transmission: 'Rapporto Fisso con inverter al carburo di silicio (SiC)',
      drivetrain: 'Doppio Motore Elettrico (Induzione Anteriore + Magneti Permanenti Posteriore)',
      euroClass: 'Zero Emissioni (Z.E.)',
      batteryCapacityKwh: 75,
      wltpConsumption: '14.7 kWh/100 km',
      wltpRangeKm: 629,
      tirePressureFrontBar: 2.9,
      tirePressureRearBar: 2.9,
      tirePressureLoadedBar: 3.1,
      allowedTireSizes: [
        '235/45 R18 98Y XL',
        '235/40 R19 96W XL',
        '235/35 R20 92Y'
      ],
      dimensions: {
        lengthMm: 4694,
        widthMm: 1849,
        heightMm: 1443,
        trunkLiters: 594,
        curbWeightKg: 1847,
        towingCapacityKg: 1000
      },
      vin: '5YJ3E7EB8NF129038',
      summaryQuattroruote: 'Berlina elettrica ad alta efficienza aerodinamica (Cx 0.219), ricarica Supercharger V3 fino a 250 kW.'
    },
    documents: [
      {
        id: 'doc_2_1',
        title: 'Libretto di Circolazione Digitale',
        type: 'libretto',
        fileName: 'Libretto_Tesla_Model3.pdf',
        fileType: 'application/pdf',
        fileData: '',
        uploadDate: '2026-05-15',
        notes: 'Documento di circolazione'
      }
    ],
    refuels: [
      { id: 'r_201', date: '2026-07-01', km: 41200, quantity: 60.0, price: 28.00, type: 'full', notes: 'Tesla Supercharger Melegnano' },
      { id: 'r_202', date: '2026-07-20', km: 41580, quantity: 58.5, price: 27.50, type: 'full', notes: 'Free To X Autostrada' },
      { id: 'r_203', date: '2026-08-10', km: 42020, quantity: 62.0, price: 29.00, type: 'full', notes: 'Wallbox Domestica' }
    ],
    maintenances: [
      { id: 'm_201', date: '2024-09-15', km: 28000, category: 'Tagliando Ordinario', description: 'Sostituzione filtro aria abitacolo HEPA e controllo liquido freni', workshop: 'Tesla Service Center Milano', cost: 130.00 }
    ]
  },
  {
    id: 'car_3',
    brand: 'Volkswagen',
    model: 'Golf GTE Plug-in',
    plate: 'FY 119 PK',
    fuelType: 'Plug-in Hybrid (PHEV)',
    tankCapacity: 40,
    batteryCapacity: 13.0,
    motorization: '1.4 TSI eHybrid 245 CV DSG (PHEV)',
    powerCv: 245,
    powerKw: 180,
    driveType: 'Trazione Anteriore (FWD)',
    registrationDate: '2020-03-20',
    initialKm: 30000,
    photoUrl: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800&auto=format&fit=crop&q=80',
    technicalSpecs: {
      engineDisplacementCc: 1395,
      powerCv: 245,
      powerKw: 180,
      torqueNm: 400,
      cylinderCount: 4,
      transmission: 'Automatico doppia frizione DSG DQ400e a 6 rapporti',
      drivetrain: 'Trazione Anteriore con differenziale elettronico XDS',
      euroClass: 'Euro 6D-ISC-FCM',
      fuelCapacityLiters: 40,
      batteryCapacityKwh: 13.0,
      wltpConsumption: '1.2 L/100 km + 14.9 kWh/100 km',
      wltpRangeKm: 62,
      recommendedOil: '0W-20 VW 508.00 / 509.00 (LongLife IV)',
      oilCapacityLiters: 4.0,
      tirePressureFrontBar: 2.4,
      tirePressureRearBar: 2.3,
      tirePressureLoadedBar: 2.7,
      allowedTireSizes: [
        '205/55 R16 91V',
        '225/45 R17 91W',
        '225/40 R18 92Y XL'
      ],
      dimensions: {
        lengthMm: 4284,
        widthMm: 1789,
        heightMm: 1456,
        trunkLiters: 273,
        curbWeightKg: 1624,
        towingCapacityKg: 1500
      },
      vin: 'WVWZZZCDZLW089412',
      engineCode: 'DGEA',
      summaryQuattroruote: 'Compatta ibrida plug-in sportiva con motore 1.4 TSI accoppiato a motore elettrico sincrono da 110 CV integrato nel cambio DSG.'
    },
    documents: [
      {
        id: 'doc_3_1',
        title: 'Libretto e Polizza Assicurativa',
        type: 'assicurazione',
        fileName: 'Polizza_GolfGTE_UnipolSai.pdf',
        fileType: 'application/pdf',
        fileData: '',
        uploadDate: '2026-03-20',
        expiryDate: '2027-03-20',
        notes: 'UnipolSai Tariffa Km Sicuri'
      }
    ],
    refuels: [
      { id: 'r_301', date: '2026-06-15', km: 68000, quantity: 36.0, price: 65.00, type: 'full', energyType: 'fuel', unit: 'L', notes: 'Pieno Benzina 95 ottani' },
      { id: 'r_302', date: '2026-06-25', km: 68350, quantity: 11.8, price: 4.80, type: 'full', energyType: 'electricity', unit: 'kWh', notes: 'Ricarica Wallbox Casa (100%)' },
      { id: 'r_303', date: '2026-07-10', km: 68750, quantity: 35.5, price: 64.00, type: 'full', energyType: 'fuel', unit: 'L', notes: 'Rifornimento Benzina IP' },
      { id: 'r_304', date: '2026-07-22', km: 69120, quantity: 12.2, price: 5.90, type: 'full', energyType: 'electricity', unit: 'kWh', notes: 'Colonnina Enel X Way' },
      { id: 'r_305', date: '2026-08-05', km: 69500, quantity: 36.5, price: 66.00, type: 'full', energyType: 'fuel', unit: 'L', notes: 'Pieno benzina Q8' }
    ],
    maintenances: [
      { id: 'm_301', date: '2025-03-10', km: 58000, category: 'Tagliando Ordinario', description: 'Cambio olio motore, candele di accensione, controllo impianto alta tensione e filtro DSG', workshop: 'VW Zentrum', cost: 520.00 }
    ]
  }
];
