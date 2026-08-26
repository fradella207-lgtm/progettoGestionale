import { Station } from '../types';

export const SEED_STATIONS: Station[] = [
  // MILANO
  {
    id: 'st_mi_1',
    name: 'Eni Live Station - Milano Testi',
    brand: 'Eni',
    type: 'both',
    address: 'Viale Fulvio Testi 280',
    city: 'Milano',
    province: 'MI',
    lat: 45.5218,
    lng: 9.2134,
    isOpen24h: true,
    hasCarWash: true,
    hasBar: true,
    hasShop: true,
    rating: 4.5,
    operatorName: 'Eni Live',
    fuelPrices: [
      { fuel: 'Benzina', price: 1.769, isSelf: true, updatedAt: 'Oggi, 08:30' },
      { fuel: 'Diesel', price: 1.689, isSelf: true, updatedAt: 'Oggi, 08:30' },
      { fuel: 'GPL', price: 0.699, isSelf: false, updatedAt: 'Oggi, 08:30' },
      { fuel: 'Benzina', price: 1.989, isSelf: false, updatedAt: 'Oggi, 08:30' },
      { fuel: 'Diesel', price: 1.899, isSelf: false, updatedAt: 'Oggi, 08:30' }
    ],
    evPlugs: [
      { type: 'CCS Combo 2 (DC)', powerKw: 300, pricePerKwh: 0.64, availableCount: 2, totalCount: 2, status: 'available' },
      { type: 'Type 2 (AC)', powerKw: 22, pricePerKwh: 0.49, availableCount: 1, totalCount: 2, status: 'available' }
    ]
  },
  {
    id: 'st_mi_2',
    name: 'Q8 Easy - Milano Novara',
    brand: 'Q8',
    type: 'fuel',
    address: 'Via Novara 345',
    city: 'Milano',
    province: 'MI',
    lat: 45.4745,
    lng: 9.0988,
    isOpen24h: true,
    hasCarWash: true,
    hasBar: false,
    hasShop: false,
    rating: 4.3,
    operatorName: 'Q8 Petroleum',
    fuelPrices: [
      { fuel: 'Benzina', price: 1.749, isSelf: true, updatedAt: 'Oggi, 07:15' },
      { fuel: 'Diesel', price: 1.669, isSelf: true, updatedAt: 'Oggi, 07:15' },
      { fuel: 'GPL', price: 0.685, isSelf: false, updatedAt: 'Oggi, 07:15' },
      { fuel: 'Metano', price: 1.289, isSelf: false, updatedAt: 'Oggi, 07:15' }
    ]
  },
  {
    id: 'st_mi_3',
    name: 'Tesla Supercharger & Be Charge - Milano Sud',
    brand: 'Tesla',
    type: 'ev',
    address: 'Via dei Missaglia 97',
    city: 'Milano',
    province: 'MI',
    lat: 45.4182,
    lng: 9.1764,
    isOpen24h: true,
    hasCarWash: false,
    hasBar: true,
    hasShop: true,
    rating: 4.8,
    operatorName: 'Tesla / Be Charge',
    evPlugs: [
      { type: 'Tesla Supercharger', powerKw: 250, pricePerKwh: 0.46, availableCount: 8, totalCount: 12, status: 'available' },
      { type: 'CCS Combo 2 (DC)', powerKw: 150, pricePerKwh: 0.59, availableCount: 4, totalCount: 4, status: 'available' },
      { type: 'Type 2 (AC)', powerKw: 22, pricePerKwh: 0.44, availableCount: 2, totalCount: 2, status: 'available' }
    ]
  },
  {
    id: 'st_mi_4',
    name: 'IP Gruppo api - Corso Sempione',
    brand: 'IP',
    type: 'fuel',
    address: 'Corso Sempione 102',
    city: 'Milano',
    province: 'MI',
    lat: 45.4851,
    lng: 9.1623,
    isOpen24h: true,
    hasCarWash: false,
    hasBar: true,
    hasShop: true,
    rating: 4.1,
    operatorName: 'IP Gruppo api',
    fuelPrices: [
      { fuel: 'Benzina', price: 1.774, isSelf: true, updatedAt: 'Ieri, 18:40' },
      { fuel: 'Diesel', price: 1.694, isSelf: true, updatedAt: 'Ieri, 18:40' },
      { fuel: 'Benzina', price: 2.019, isSelf: false, updatedAt: 'Ieri, 18:40' },
      { fuel: 'Diesel', price: 1.939, isSelf: false, updatedAt: 'Ieri, 18:40' }
    ]
  },
  {
    id: 'st_mi_5',
    name: 'Enel X Way Ultra-Fast - Milano Porta Nuova',
    brand: 'Enel X Way',
    type: 'ev',
    address: 'Piazza Gae Aulenti 1',
    city: 'Milano',
    province: 'MI',
    lat: 45.4842,
    lng: 9.1898,
    isOpen24h: true,
    hasCarWash: false,
    hasBar: true,
    hasShop: true,
    rating: 4.7,
    operatorName: 'Enel X Way',
    evPlugs: [
      { type: 'CCS Combo 2 (DC)', powerKw: 350, pricePerKwh: 0.62, availableCount: 3, totalCount: 4, status: 'available' },
      { type: 'CHAdeMO', powerKw: 60, pricePerKwh: 0.58, availableCount: 1, totalCount: 1, status: 'available' },
      { type: 'Type 2 (AC)', powerKw: 22, pricePerKwh: 0.45, availableCount: 2, totalCount: 2, status: 'available' }
    ]
  },

  // ROMA
  {
    id: 'st_rm_1',
    name: 'Eni Live Station - Roma Colombo',
    brand: 'Eni',
    type: 'both',
    address: 'Via Cristoforo Colombo 450',
    city: 'Roma',
    province: 'RM',
    lat: 41.8542,
    lng: 12.4931,
    isOpen24h: true,
    hasCarWash: true,
    hasBar: true,
    hasShop: true,
    rating: 4.6,
    operatorName: 'Eni Live',
    fuelPrices: [
      { fuel: 'Benzina', price: 1.759, isSelf: true, updatedAt: 'Oggi, 09:10' },
      { fuel: 'Diesel', price: 1.679, isSelf: true, updatedAt: 'Oggi, 09:10' },
      { fuel: 'GPL', price: 0.679, isSelf: false, updatedAt: 'Oggi, 09:10' },
      { fuel: 'Metano', price: 1.299, isSelf: false, updatedAt: 'Oggi, 09:10' },
      { fuel: 'Benzina', price: 1.979, isSelf: false, updatedAt: 'Oggi, 09:10' }
    ],
    evPlugs: [
      { type: 'CCS Combo 2 (DC)', powerKw: 150, pricePerKwh: 0.59, availableCount: 2, totalCount: 2, status: 'available' },
      { type: 'Type 2 (AC)', powerKw: 22, pricePerKwh: 0.45, availableCount: 2, totalCount: 2, status: 'available' }
    ]
  },
  {
    id: 'st_rm_2',
    name: 'Q8 Easy - Roma Salaria',
    brand: 'Q8',
    type: 'fuel',
    address: 'Via Salaria 715',
    city: 'Roma',
    province: 'RM',
    lat: 41.9568,
    lng: 12.5089,
    isOpen24h: true,
    hasCarWash: true,
    hasBar: false,
    hasShop: false,
    rating: 4.4,
    operatorName: 'Q8 Petroleum',
    fuelPrices: [
      { fuel: 'Benzina', price: 1.739, isSelf: true, updatedAt: 'Oggi, 06:50' },
      { fuel: 'Diesel', price: 1.659, isSelf: true, updatedAt: 'Oggi, 06:50' },
      { fuel: 'GPL', price: 0.669, isSelf: false, updatedAt: 'Oggi, 06:50' }
    ]
  },
  {
    id: 'st_rm_3',
    name: 'Tesla Supercharger & Ionity - Roma Est',
    brand: 'Tesla',
    type: 'ev',
    address: 'Via Collatina km 12.800',
    city: 'Roma',
    province: 'RM',
    lat: 41.9054,
    lng: 12.6071,
    isOpen24h: true,
    hasCarWash: false,
    hasBar: true,
    hasShop: true,
    rating: 4.9,
    operatorName: 'Tesla / Ionity',
    evPlugs: [
      { type: 'Tesla Supercharger', powerKw: 250, pricePerKwh: 0.44, availableCount: 12, totalCount: 16, status: 'available' },
      { type: 'CCS Combo 2 (DC)', powerKw: 350, pricePerKwh: 0.65, availableCount: 4, totalCount: 6, status: 'available' }
    ]
  },
  {
    id: 'st_rm_4',
    name: 'Tamoil - Circonvallazione Gianicolense',
    brand: 'Tamoil',
    type: 'fuel',
    address: 'Circonvallazione Gianicolense 198',
    city: 'Roma',
    province: 'RM',
    lat: 41.8711,
    lng: 12.4552,
    isOpen24h: true,
    hasCarWash: false,
    hasBar: true,
    hasShop: false,
    rating: 4.0,
    operatorName: 'Tamoil Italia',
    fuelPrices: [
      { fuel: 'Benzina', price: 1.745, isSelf: true, updatedAt: 'Oggi, 08:00' },
      { fuel: 'Diesel', price: 1.665, isSelf: true, updatedAt: 'Oggi, 08:00' },
      { fuel: 'GPL', price: 0.675, isSelf: false, updatedAt: 'Oggi, 08:00' }
    ]
  },

  // TORINO
  {
    id: 'st_to_1',
    name: 'Eni Station - Torino Corso Francia',
    brand: 'Eni',
    type: 'fuel',
    address: 'Corso Francia 312',
    city: 'Torino',
    province: 'TO',
    lat: 45.0748,
    lng: 7.6251,
    isOpen24h: true,
    hasCarWash: true,
    hasBar: true,
    hasShop: true,
    rating: 4.3,
    operatorName: 'Eni Live',
    fuelPrices: [
      { fuel: 'Benzina', price: 1.755, isSelf: true, updatedAt: 'Oggi, 07:45' },
      { fuel: 'Diesel', price: 1.675, isSelf: true, updatedAt: 'Oggi, 07:45' },
      { fuel: 'Metano', price: 1.279, isSelf: false, updatedAt: 'Oggi, 07:45' }
    ]
  },
  {
    id: 'st_to_2',
    name: 'Be Charge Fast Hub - Torino Lingotto',
    brand: 'Be Charge',
    type: 'ev',
    address: 'Via Nizza 280',
    city: 'Torino',
    province: 'TO',
    lat: 45.0321,
    lng: 7.6654,
    isOpen24h: true,
    hasCarWash: false,
    hasBar: true,
    hasShop: true,
    rating: 4.7,
    operatorName: 'Be Charge (Plenitude)',
    evPlugs: [
      { type: 'CCS Combo 2 (DC)', powerKw: 150, pricePerKwh: 0.58, availableCount: 4, totalCount: 6, status: 'available' },
      { type: 'Type 2 (AC)', powerKw: 22, pricePerKwh: 0.44, availableCount: 2, totalCount: 2, status: 'available' }
    ]
  },

  // BOLOGNA
  {
    id: 'st_bo_1',
    name: 'Free To X & Eni - Area Cantagallo Est (A1)',
    brand: 'Free To X',
    type: 'both',
    address: 'Autostrada A1 km 198',
    city: 'Casalecchio di Reno',
    province: 'BO',
    lat: 44.4751,
    lng: 11.2612,
    isOpen24h: true,
    hasCarWash: false,
    hasBar: true,
    hasShop: true,
    highway: 'A1 Milano-Napoli',
    rating: 4.6,
    operatorName: 'Free To X / Autostrade per l’Italia',
    fuelPrices: [
      { fuel: 'Benzina', price: 1.849, isSelf: true, updatedAt: 'Oggi, 09:00' },
      { fuel: 'Diesel', price: 1.779, isSelf: true, updatedAt: 'Oggi, 09:00' },
      { fuel: 'GPL', price: 0.749, isSelf: false, updatedAt: 'Oggi, 09:00' }
    ],
    evPlugs: [
      { type: 'CCS Combo 2 (DC)', powerKw: 300, pricePerKwh: 0.68, availableCount: 5, totalCount: 6, status: 'available' },
      { type: 'CHAdeMO', powerKw: 60, pricePerKwh: 0.62, availableCount: 1, totalCount: 1, status: 'available' }
    ]
  },
  {
    id: 'st_bo_2',
    name: 'Tesla Supercharger - Bologna San Lazzaro',
    brand: 'Tesla',
    type: 'ev',
    address: 'Via Villanova 29',
    city: 'San Lazzaro di Savena',
    province: 'BO',
    lat: 44.4823,
    lng: 11.4112,
    isOpen24h: true,
    hasCarWash: false,
    hasBar: true,
    hasShop: true,
    rating: 4.8,
    operatorName: 'Tesla Inc.',
    evPlugs: [
      { type: 'Tesla Supercharger', powerKw: 250, pricePerKwh: 0.45, availableCount: 10, totalCount: 12, status: 'available' }
    ]
  },

  // FIRENZE
  {
    id: 'st_fi_1',
    name: 'Q8 Hi-Perform - Firenze Viale Europa',
    brand: 'Q8',
    type: 'fuel',
    address: 'Viale Europa 110',
    city: 'Firenze',
    province: 'FI',
    lat: 43.7548,
    lng: 11.2954,
    isOpen24h: true,
    hasCarWash: true,
    hasBar: true,
    hasShop: false,
    rating: 4.4,
    operatorName: 'Q8 Petroleum',
    fuelPrices: [
      { fuel: 'Benzina', price: 1.759, isSelf: true, updatedAt: 'Oggi, 08:15' },
      { fuel: 'Diesel', price: 1.679, isSelf: true, updatedAt: 'Oggi, 08:15' },
      { fuel: 'GPL', price: 0.689, isSelf: false, updatedAt: 'Oggi, 08:15' }
    ]
  },
  {
    id: 'st_fi_2',
    name: 'Enel X Way Fast - Firenze Fortezza',
    brand: 'Enel X Way',
    type: 'ev',
    address: 'Viale Filippo Strozzi 1',
    city: 'Firenze',
    province: 'FI',
    lat: 43.7812,
    lng: 11.2501,
    isOpen24h: true,
    hasCarWash: false,
    hasBar: true,
    hasShop: false,
    rating: 4.5,
    operatorName: 'Enel X Way',
    evPlugs: [
      { type: 'CCS Combo 2 (DC)', powerKw: 150, pricePerKwh: 0.60, availableCount: 2, totalCount: 2, status: 'available' },
      { type: 'Type 2 (AC)', powerKw: 22, pricePerKwh: 0.45, availableCount: 2, totalCount: 2, status: 'available' }
    ]
  },

  // NAPOLI
  {
    id: 'st_na_1',
    name: 'IP Gruppo api - Napoli Corso Malta',
    brand: 'IP',
    type: 'fuel',
    address: 'Corso Malta 140',
    city: 'Napoli',
    province: 'NA',
    lat: 40.8612,
    lng: 14.2815,
    isOpen24h: true,
    hasCarWash: true,
    hasBar: true,
    hasShop: true,
    rating: 4.2,
    operatorName: 'IP Gruppo api',
    fuelPrices: [
      { fuel: 'Benzina', price: 1.749, isSelf: true, updatedAt: 'Oggi, 08:45' },
      { fuel: 'Diesel', price: 1.669, isSelf: true, updatedAt: 'Oggi, 08:45' },
      { fuel: 'GPL', price: 0.669, isSelf: false, updatedAt: 'Oggi, 08:45' }
    ]
  },
  {
    id: 'st_na_2',
    name: 'Eni Live & Plenitude Fast - Napoli Fuorigrotta',
    brand: 'Eni',
    type: 'both',
    address: 'Viale Augusto 95',
    city: 'Napoli',
    province: 'NA',
    lat: 40.8251,
    lng: 14.1954,
    isOpen24h: true,
    hasCarWash: true,
    hasBar: true,
    hasShop: true,
    rating: 4.5,
    operatorName: 'Eni / Plenitude',
    fuelPrices: [
      { fuel: 'Benzina', price: 1.759, isSelf: true, updatedAt: 'Oggi, 09:20' },
      { fuel: 'Diesel', price: 1.679, isSelf: true, updatedAt: 'Oggi, 09:20' },
      { fuel: 'GPL', price: 0.675, isSelf: false, updatedAt: 'Oggi, 09:20' }
    ],
    evPlugs: [
      { type: 'CCS Combo 2 (DC)', powerKw: 150, pricePerKwh: 0.59, availableCount: 2, totalCount: 2, status: 'available' },
      { type: 'Type 2 (AC)', powerKw: 22, pricePerKwh: 0.45, availableCount: 1, totalCount: 2, status: 'available' }
    ]
  },

  // BARI
  {
    id: 'st_ba_1',
    name: 'Q8 Easy - Bari Tangenziale',
    brand: 'Q8',
    type: 'fuel',
    address: 'Strada Statale 16 km 805',
    city: 'Bari',
    province: 'BA',
    lat: 41.1089,
    lng: 16.8854,
    isOpen24h: true,
    hasCarWash: true,
    hasBar: false,
    hasShop: false,
    rating: 4.3,
    operatorName: 'Q8 Petroleum',
    fuelPrices: [
      { fuel: 'Benzina', price: 1.735, isSelf: true, updatedAt: 'Oggi, 07:30' },
      { fuel: 'Diesel', price: 1.655, isSelf: true, updatedAt: 'Oggi, 07:30' },
      { fuel: 'GPL', price: 0.659, isSelf: false, updatedAt: 'Oggi, 07:30' },
      { fuel: 'Metano', price: 1.269, isSelf: false, updatedAt: 'Oggi, 07:30' }
    ]
  },
  {
    id: 'st_ba_2',
    name: 'Be Charge Ultra-Fast - Bari Fiera del Levante',
    brand: 'Be Charge',
    type: 'ev',
    address: 'Lungomare Starita 4',
    city: 'Bari',
    province: 'BA',
    lat: 41.1356,
    lng: 16.8421,
    isOpen24h: true,
    hasCarWash: false,
    hasBar: true,
    hasShop: false,
    rating: 4.6,
    operatorName: 'Be Charge',
    evPlugs: [
      { type: 'CCS Combo 2 (DC)', powerKw: 300, pricePerKwh: 0.62, availableCount: 4, totalCount: 4, status: 'available' },
      { type: 'Type 2 (AC)', powerKw: 22, pricePerKwh: 0.44, availableCount: 2, totalCount: 2, status: 'available' }
    ]
  },

  // VERONA / AFFI (HUB STRATEGICO DEL NORD)
  {
    id: 'st_vr_1',
    name: 'Tesla Supercharger & Ionity - Affi Lake Garda',
    brand: 'Tesla',
    type: 'ev',
    address: 'Via Pascoli 31 (Uscita A22)',
    city: 'Affi',
    province: 'VR',
    lat: 45.5532,
    lng: 10.7712,
    isOpen24h: true,
    hasCarWash: false,
    hasBar: true,
    hasShop: true,
    rating: 4.9,
    operatorName: 'Tesla / Ionity',
    evPlugs: [
      { type: 'Tesla Supercharger', powerKw: 250, pricePerKwh: 0.43, availableCount: 18, totalCount: 24, status: 'available' },
      { type: 'CCS Combo 2 (DC)', powerKw: 350, pricePerKwh: 0.65, availableCount: 6, totalCount: 6, status: 'available' }
    ]
  },
  {
    id: 'st_vr_2',
    name: 'Eni Station - Verona Corso Milano',
    brand: 'Eni',
    type: 'fuel',
    address: 'Corso Milano 128',
    city: 'Verona',
    province: 'VR',
    lat: 45.4412,
    lng: 10.9654,
    isOpen24h: true,
    hasCarWash: true,
    hasBar: true,
    hasShop: true,
    rating: 4.4,
    operatorName: 'Eni Live',
    fuelPrices: [
      { fuel: 'Benzina', price: 1.749, isSelf: true, updatedAt: 'Oggi, 08:20' },
      { fuel: 'Diesel', price: 1.669, isSelf: true, updatedAt: 'Oggi, 08:20' },
      { fuel: 'GPL', price: 0.679, isSelf: false, updatedAt: 'Oggi, 08:20' },
      { fuel: 'Metano', price: 1.285, isSelf: false, updatedAt: 'Oggi, 08:20' }
    ]
  }
];

// Helper to calculate distance in km between two lat/lng pairs
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}
