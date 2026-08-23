import { Vehicle } from '../types';

export const SEED_GARAGE: Vehicle[] = [
  {
    id: 'car_1',
    brand: 'Alfa Romeo',
    model: 'Giulia 2.2 Turbo',
    plate: 'GA 892 TR',
    fuelType: 'Diesel',
    tankCapacity: 52,
    registrationDate: '2021-04-15',
    initialKm: 50000,
    photoUrl: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800&auto=format&fit=crop&q=80',
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
    registrationDate: '2022-09-10',
    initialKm: 12000,
    photoUrl: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&auto=format&fit=crop&q=80',
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
    registrationDate: '2020-03-20',
    initialKm: 30000,
    photoUrl: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800&auto=format&fit=crop&q=80',
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
