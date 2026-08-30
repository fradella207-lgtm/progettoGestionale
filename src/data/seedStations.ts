import { Station, FuelType } from '../types';

export const SEED_STATIONS: Station[] = [
  // =========================================================================
  // 1. LOMBARDIA (Milano, Brescia, Bergamo, Monza, Como, Varese, Pavia, Cremona, Mantova, Lecco)
  // =========================================================================
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
  {
    id: 'st_mi_6',
    name: 'Tamoil Express - Milano Lorenteggio',
    brand: 'Tamoil',
    type: 'fuel',
    address: 'Via Lorenteggio 260',
    city: 'Milano',
    province: 'MI',
    lat: 45.4431,
    lng: 9.1234,
    isOpen24h: true,
    hasCarWash: true,
    hasBar: false,
    hasShop: false,
    rating: 4.2,
    operatorName: 'Tamoil Italia',
    fuelPrices: [
      { fuel: 'Benzina', price: 1.745, isSelf: true, updatedAt: 'Oggi, 07:45' },
      { fuel: 'Diesel', price: 1.659, isSelf: true, updatedAt: 'Oggi, 07:45' },
      { fuel: 'GPL', price: 0.689, isSelf: false, updatedAt: 'Oggi, 07:45' }
    ]
  },
  {
    id: 'st_mi_7',
    name: 'Esso Self - Viale Certosa',
    brand: 'Esso',
    type: 'fuel',
    address: 'Viale Certosa 148',
    city: 'Milano',
    province: 'MI',
    lat: 45.4950,
    lng: 9.1412,
    isOpen24h: true,
    hasCarWash: true,
    hasBar: true,
    hasShop: true,
    rating: 4.3,
    operatorName: 'Esso Italiana',
    fuelPrices: [
      { fuel: 'Benzina', price: 1.759, isSelf: true, updatedAt: 'Oggi, 08:10' },
      { fuel: 'Diesel', price: 1.679, isSelf: true, updatedAt: 'Oggi, 08:10' }
    ]
  },
  {
    id: 'st_mi_8',
    name: 'Enercoop Carburanti - San Giuliano Milanese',
    brand: 'Enercoop',
    type: 'both',
    address: 'Via della Pace 26',
    city: 'San Giuliano Milanese',
    province: 'MI',
    lat: 45.3942,
    lng: 9.2891,
    isOpen24h: true,
    hasCarWash: true,
    hasBar: true,
    hasShop: true,
    rating: 4.7,
    operatorName: 'Coop Lombardia',
    fuelPrices: [
      { fuel: 'Benzina', price: 1.719, isSelf: true, updatedAt: 'Oggi, 07:00' },
      { fuel: 'Diesel', price: 1.639, isSelf: true, updatedAt: 'Oggi, 07:00' },
      { fuel: 'GPL', price: 0.669, isSelf: false, updatedAt: 'Oggi, 07:00' },
      { fuel: 'Metano', price: 1.259, isSelf: false, updatedAt: 'Oggi, 07:00' }
    ],
    evPlugs: [
      { type: 'CCS Combo 2 (DC)', powerKw: 150, pricePerKwh: 0.55, availableCount: 4, totalCount: 4, status: 'available' }
    ]
  },
  {
    id: 'st_mb_1',
    name: 'Eni Station - Monza Brianza',
    brand: 'Eni',
    type: 'fuel',
    address: 'Viale Brianza 32',
    city: 'Monza',
    province: 'MB',
    lat: 45.5921,
    lng: 9.2741,
    isOpen24h: true,
    hasCarWash: true,
    hasBar: true,
    hasShop: true,
    rating: 4.4,
    operatorName: 'Eni Live',
    fuelPrices: [
      { fuel: 'Benzina', price: 1.759, isSelf: true, updatedAt: 'Oggi, 08:20' },
      { fuel: 'Diesel', price: 1.679, isSelf: true, updatedAt: 'Oggi, 08:20' },
      { fuel: 'GPL', price: 0.689, isSelf: false, updatedAt: 'Oggi, 08:20' }
    ]
  },
  {
    id: 'st_bg_1',
    name: 'Q8 Orio al Serio - Aeroporto',
    brand: 'Q8',
    type: 'both',
    address: 'Via Portico 71',
    city: 'Bergamo',
    province: 'BG',
    lat: 45.6672,
    lng: 9.6981,
    isOpen24h: true,
    hasCarWash: true,
    hasBar: true,
    hasShop: true,
    rating: 4.6,
    operatorName: 'Q8 Petroleum',
    fuelPrices: [
      { fuel: 'Benzina', price: 1.749, isSelf: true, updatedAt: 'Oggi, 08:00' },
      { fuel: 'Diesel', price: 1.669, isSelf: true, updatedAt: 'Oggi, 08:00' },
      { fuel: 'GPL', price: 0.679, isSelf: false, updatedAt: 'Oggi, 08:00' }
    ],
    evPlugs: [
      { type: 'CCS Combo 2 (DC)', powerKw: 300, pricePerKwh: 0.62, availableCount: 4, totalCount: 4, status: 'available' },
      { type: 'Tesla Supercharger', powerKw: 250, pricePerKwh: 0.44, availableCount: 8, totalCount: 8, status: 'available' }
    ]
  },
  {
    id: 'st_bs_1',
    name: 'IP Gruppo api - Brescia Tangenziale Sud',
    brand: 'IP',
    type: 'both',
    address: 'Via Orzinuovi 110',
    city: 'Brescia',
    province: 'BS',
    lat: 45.5261,
    lng: 10.1852,
    isOpen24h: true,
    hasCarWash: true,
    hasBar: true,
    hasShop: true,
    rating: 4.4,
    operatorName: 'IP Gruppo api',
    fuelPrices: [
      { fuel: 'Benzina', price: 1.749, isSelf: true, updatedAt: 'Oggi, 07:30' },
      { fuel: 'Diesel', price: 1.669, isSelf: true, updatedAt: 'Oggi, 07:30' },
      { fuel: 'Metano', price: 1.279, isSelf: false, updatedAt: 'Oggi, 07:30' }
    ],
    evPlugs: [
      { type: 'CCS Combo 2 (DC)', powerKw: 150, pricePerKwh: 0.58, availableCount: 2, totalCount: 2, status: 'available' }
    ]
  },
  {
    id: 'st_co_1',
    name: 'Tamoil Express - Como Monte Olimpino',
    brand: 'Tamoil',
    type: 'fuel',
    address: 'Via Bellinzona 140',
    city: 'Como',
    province: 'CO',
    lat: 45.8285,
    lng: 9.0612,
    isOpen24h: true,
    hasCarWash: true,
    hasBar: false,
    hasShop: false,
    rating: 4.3,
    operatorName: 'Tamoil',
    fuelPrices: [
      { fuel: 'Benzina', price: 1.769, isSelf: true, updatedAt: 'Oggi, 08:15' },
      { fuel: 'Diesel', price: 1.689, isSelf: true, updatedAt: 'Oggi, 08:15' }
    ]
  },
  {
    id: 'st_va_1',
    name: 'Eni Live - Varese Ippodromo',
    brand: 'Eni',
    type: 'fuel',
    address: 'Viale Ippodromo 2',
    city: 'Varese',
    province: 'VA',
    lat: 45.8310,
    lng: 8.8412,
    isOpen24h: true,
    hasCarWash: true,
    hasBar: true,
    hasShop: true,
    rating: 4.4,
    operatorName: 'Eni Live',
    fuelPrices: [
      { fuel: 'Benzina', price: 1.759, isSelf: true, updatedAt: 'Oggi, 08:10' },
      { fuel: 'Diesel', price: 1.679, isSelf: true, updatedAt: 'Oggi, 08:10' },
      { fuel: 'GPL', price: 0.699, isSelf: false, updatedAt: 'Oggi, 08:10' }
    ]
  },
  {
    id: 'st_pv_1',
    name: 'Costantin Carburanti - Pavia Sud',
    brand: 'Costantin',
    type: 'fuel',
    address: 'Strada Nuova 150',
    city: 'Pavia',
    province: 'PV',
    lat: 45.1764,
    lng: 9.1582,
    isOpen24h: true,
    hasCarWash: true,
    hasBar: false,
    hasShop: false,
    rating: 4.5,
    operatorName: 'Costantin',
    fuelPrices: [
      { fuel: 'Benzina', price: 1.729, isSelf: true, updatedAt: 'Oggi, 07:15' },
      { fuel: 'Diesel', price: 1.649, isSelf: true, updatedAt: 'Oggi, 07:15' },
      { fuel: 'GPL', price: 0.675, isSelf: false, updatedAt: 'Oggi, 07:15' }
    ]
  },

  // =========================================================================
  // 2. LAZIO (Roma, Latina, Frosinone, Viterbo, Rieti, Fiumicino, Civitavecchia, Pomezia)
  // =========================================================================
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
    lat: 41.9124,
    lng: 12.6045,
    isOpen24h: true,
    hasCarWash: false,
    hasBar: true,
    hasShop: true,
    rating: 4.9,
    operatorName: 'Tesla / Ionity',
    evPlugs: [
      { type: 'Tesla Supercharger', powerKw: 250, pricePerKwh: 0.44, availableCount: 12, totalCount: 16, status: 'available' },
      { type: 'CCS Combo 2 (DC)', powerKw: 350, pricePerKwh: 0.69, availableCount: 6, totalCount: 6, status: 'available' }
    ]
  },
  {
    id: 'st_rm_4',
    name: 'IP Gruppo api - GRA Ardeatina',
    brand: 'IP',
    type: 'fuel',
    address: 'GRA Km 48.200 Corsia Interna',
    city: 'Roma',
    province: 'RM',
    lat: 41.8123,
    lng: 12.5312,
    isOpen24h: true,
    hasCarWash: true,
    hasBar: true,
    hasShop: true,
    rating: 4.2,
    operatorName: 'IP',
    fuelPrices: [
      { fuel: 'Benzina', price: 1.769, isSelf: true, updatedAt: 'Oggi, 08:40' },
      { fuel: 'Diesel', price: 1.689, isSelf: true, updatedAt: 'Oggi, 08:40' },
      { fuel: 'GPL', price: 0.689, isSelf: false, updatedAt: 'Oggi, 08:40' }
    ]
  },
  {
    id: 'st_rm_5',
    name: 'Beyfin Carburanti - Roma Tiburtina',
    brand: 'Beyfin',
    type: 'fuel',
    address: 'Via Tiburtina 1040',
    city: 'Roma',
    province: 'RM',
    lat: 41.9312,
    lng: 12.5891,
    isOpen24h: true,
    hasCarWash: true,
    hasBar: false,
    hasShop: false,
    rating: 4.6,
    operatorName: 'Beyfin SpA',
    fuelPrices: [
      { fuel: 'Benzina', price: 1.725, isSelf: true, updatedAt: 'Oggi, 07:10' },
      { fuel: 'Diesel', price: 1.645, isSelf: true, updatedAt: 'Oggi, 07:10' },
      { fuel: 'GPL', price: 0.659, isSelf: false, updatedAt: 'Oggi, 07:10' },
      { fuel: 'Metano', price: 1.249, isSelf: false, updatedAt: 'Oggi, 07:10' }
    ]
  },
  {
    id: 'st_lt_1',
    name: 'Conad Carburanti - Latina Pontina',
    brand: 'Conad',
    type: 'fuel',
    address: 'SS 148 Pontina Km 72.500',
    city: 'Latina',
    province: 'LT',
    lat: 41.4672,
    lng: 12.9034,
    isOpen24h: true,
    hasCarWash: true,
    hasBar: true,
    hasShop: true,
    rating: 4.7,
    operatorName: 'Conad Carburanti',
    fuelPrices: [
      { fuel: 'Benzina', price: 1.719, isSelf: true, updatedAt: 'Oggi, 07:05' },
      { fuel: 'Diesel', price: 1.639, isSelf: true, updatedAt: 'Oggi, 07:05' },
      { fuel: 'GPL', price: 0.655, isSelf: false, updatedAt: 'Oggi, 07:05' }
    ]
  },
  {
    id: 'st_vt_1',
    name: 'Eni Station - Viterbo Cassia Nord',
    brand: 'Eni',
    type: 'fuel',
    address: 'Via Cassia Nord 48',
    city: 'Viterbo',
    province: 'VT',
    lat: 42.4382,
    lng: 12.0984,
    isOpen24h: true,
    hasCarWash: true,
    hasBar: true,
    hasShop: true,
    rating: 4.4,
    operatorName: 'Eni Live',
    fuelPrices: [
      { fuel: 'Benzina', price: 1.749, isSelf: true, updatedAt: 'Oggi, 08:00' },
      { fuel: 'Diesel', price: 1.669, isSelf: true, updatedAt: 'Oggi, 08:00' },
      { fuel: 'GPL', price: 0.679, isSelf: false, updatedAt: 'Oggi, 08:00' }
    ]
  },

  // =========================================================================
  // 3. CAMPANIA (Napoli, Salerno, Caserta, Avellino, Benevento, Pozzuoli, Giugliano, Nola)
  // =========================================================================
  {
    id: 'st_na_1',
    name: 'Q8 Tangenziale Napoli - Doganella',
    brand: 'Q8',
    type: 'both',
    address: 'Via Nuova del Campo 50',
    city: 'Napoli',
    province: 'NA',
    lat: 40.8712,
    lng: 14.2834,
    isOpen24h: true,
    hasCarWash: true,
    hasBar: true,
    hasShop: true,
    rating: 4.3,
    operatorName: 'Q8 Petroleum',
    fuelPrices: [
      { fuel: 'Benzina', price: 1.739, isSelf: true, updatedAt: 'Oggi, 08:00' },
      { fuel: 'Diesel', price: 1.659, isSelf: true, updatedAt: 'Oggi, 08:00' },
      { fuel: 'GPL', price: 0.675, isSelf: false, updatedAt: 'Oggi, 08:00' },
      { fuel: 'Metano', price: 1.289, isSelf: false, updatedAt: 'Oggi, 08:00' }
    ],
    evPlugs: [
      { type: 'CCS Combo 2 (DC)', powerKw: 150, pricePerKwh: 0.58, availableCount: 2, totalCount: 2, status: 'available' }
    ]
  },
  {
    id: 'st_na_2',
    name: 'IP Gruppo api - Napoli Fuorigrotta',
    brand: 'IP',
    type: 'fuel',
    address: 'Via Diocleziano 180',
    city: 'Napoli',
    province: 'NA',
    lat: 40.8195,
    lng: 14.1812,
    isOpen24h: true,
    hasCarWash: true,
    hasBar: true,
    hasShop: false,
    rating: 4.2,
    operatorName: 'IP',
    fuelPrices: [
      { fuel: 'Benzina', price: 1.759, isSelf: true, updatedAt: 'Oggi, 08:30' },
      { fuel: 'Diesel', price: 1.679, isSelf: true, updatedAt: 'Oggi, 08:30' },
      { fuel: 'GPL', price: 0.685, isSelf: false, updatedAt: 'Oggi, 08:30' }
    ]
  },
  {
    id: 'st_na_3',
    name: 'Tesla Supercharger & Enel X Way - Afragola AV',
    brand: 'Tesla',
    type: 'ev',
    address: 'Stazione Alta Velocità Napoli Afragola',
    city: 'Afragola',
    province: 'NA',
    lat: 40.9312,
    lng: 14.3318,
    isOpen24h: true,
    hasCarWash: false,
    hasBar: true,
    hasShop: true,
    rating: 4.8,
    operatorName: 'Tesla / Enel X',
    evPlugs: [
      { type: 'Tesla Supercharger', powerKw: 250, pricePerKwh: 0.45, availableCount: 10, totalCount: 12, status: 'available' },
      { type: 'CCS Combo 2 (DC)', powerKw: 300, pricePerKwh: 0.64, availableCount: 4, totalCount: 4, status: 'available' }
    ]
  },
  {
    id: 'st_sa_1',
    name: 'Eni Station - Salerno Lungomare',
    brand: 'Eni',
    type: 'fuel',
    address: 'Lungomare Marconi 42',
    city: 'Salerno',
    province: 'SA',
    lat: 40.6698,
    lng: 14.7891,
    isOpen24h: true,
    hasCarWash: true,
    hasBar: true,
    hasShop: true,
    rating: 4.5,
    operatorName: 'Eni Live',
    fuelPrices: [
      { fuel: 'Benzina', price: 1.749, isSelf: true, updatedAt: 'Oggi, 08:15' },
      { fuel: 'Diesel', price: 1.669, isSelf: true, updatedAt: 'Oggi, 08:15' },
      { fuel: 'GPL', price: 0.679, isSelf: false, updatedAt: 'Oggi, 08:15' }
    ]
  },
  {
    id: 'st_ce_1',
    name: 'Tamoil Express - Caserta Reggia Nord',
    brand: 'Tamoil',
    type: 'both',
    address: 'Viale Carlo III 80',
    city: 'Caserta',
    province: 'CE',
    lat: 41.0542,
    lng: 14.3219,
    isOpen24h: true,
    hasCarWash: true,
    hasBar: true,
    hasShop: true,
    rating: 4.4,
    operatorName: 'Tamoil',
    fuelPrices: [
      { fuel: 'Benzina', price: 1.735, isSelf: true, updatedAt: 'Oggi, 07:40' },
      { fuel: 'Diesel', price: 1.655, isSelf: true, updatedAt: 'Oggi, 07:40' },
      { fuel: 'GPL', price: 0.669, isSelf: false, updatedAt: 'Oggi, 07:40' },
      { fuel: 'Metano', price: 1.269, isSelf: false, updatedAt: 'Oggi, 07:40' }
    ],
    evPlugs: [
      { type: 'CCS Combo 2 (DC)', powerKw: 150, pricePerKwh: 0.58, availableCount: 2, totalCount: 2, status: 'available' }
    ]
  },

  // =========================================================================
  // 4. PIEMONTE (Torino, Novara, Alessandria, Asti, Cuneo, Vercelli, Biella)
  // =========================================================================
  {
    id: 'st_to_1',
    name: 'Eni Live Station - Torino Moncalieri',
    brand: 'Eni',
    type: 'both',
    address: 'Corso Moncalieri 310',
    city: 'Torino',
    province: 'TO',
    lat: 45.0298,
    lng: 7.6745,
    isOpen24h: true,
    hasCarWash: true,
    hasBar: true,
    hasShop: true,
    rating: 4.5,
    operatorName: 'Eni Live',
    fuelPrices: [
      { fuel: 'Benzina', price: 1.759, isSelf: true, updatedAt: 'Oggi, 08:30' },
      { fuel: 'Diesel', price: 1.679, isSelf: true, updatedAt: 'Oggi, 08:30' },
      { fuel: 'GPL', price: 0.689, isSelf: false, updatedAt: 'Oggi, 08:30' },
      { fuel: 'Metano', price: 1.289, isSelf: false, updatedAt: 'Oggi, 08:30' }
    ],
    evPlugs: [
      { type: 'CCS Combo 2 (DC)', powerKw: 150, pricePerKwh: 0.59, availableCount: 2, totalCount: 2, status: 'available' }
    ]
  },
  {
    id: 'st_to_2',
    name: 'Q8 Easy - Torino Corso Francia',
    brand: 'Q8',
    type: 'fuel',
    address: 'Corso Francia 402',
    city: 'Torino',
    province: 'TO',
    lat: 45.0765,
    lng: 7.6189,
    isOpen24h: true,
    hasCarWash: true,
    hasBar: false,
    hasShop: false,
    rating: 4.3,
    operatorName: 'Q8 Petroleum',
    fuelPrices: [
      { fuel: 'Benzina', price: 1.745, isSelf: true, updatedAt: 'Oggi, 07:15' },
      { fuel: 'Diesel', price: 1.665, isSelf: true, updatedAt: 'Oggi, 07:15' }
    ]
  },
  {
    id: 'st_to_3',
    name: 'Tesla Supercharger & Free To X - Moncalieri A6',
    brand: 'Tesla',
    type: 'ev',
    address: 'Area di Servizio A6 Torino-Savona',
    city: 'Moncalieri',
    province: 'TO',
    lat: 44.9812,
    lng: 7.6891,
    isOpen24h: true,
    hasCarWash: false,
    hasBar: true,
    hasShop: true,
    rating: 4.8,
    operatorName: 'Tesla / Free To X',
    evPlugs: [
      { type: 'Tesla Supercharger', powerKw: 250, pricePerKwh: 0.44, availableCount: 8, totalCount: 10, status: 'available' },
      { type: 'CCS Combo 2 (DC)', powerKw: 300, pricePerKwh: 0.65, availableCount: 4, totalCount: 4, status: 'available' }
    ]
  },
  {
    id: 'st_no_1',
    name: 'Enercoop Carburanti - Novara Est',
    brand: 'Enercoop',
    type: 'fuel',
    address: 'Corso Milano 98',
    city: 'Novara',
    province: 'NO',
    lat: 45.4412,
    lng: 8.6419,
    isOpen24h: true,
    hasCarWash: true,
    hasBar: true,
    hasShop: true,
    rating: 4.7,
    operatorName: 'Enercoop',
    fuelPrices: [
      { fuel: 'Benzina', price: 1.719, isSelf: true, updatedAt: 'Oggi, 07:00' },
      { fuel: 'Diesel', price: 1.639, isSelf: true, updatedAt: 'Oggi, 07:00' },
      { fuel: 'GPL', price: 0.669, isSelf: false, updatedAt: 'Oggi, 07:00' }
    ]
  },
  {
    id: 'st_al_1',
    name: 'IP Gruppo api - Alessandria Marengo',
    brand: 'IP',
    type: 'fuel',
    address: 'Via Marengo 120',
    city: 'Alessandria',
    province: 'AL',
    lat: 44.9124,
    lng: 8.6312,
    isOpen24h: true,
    hasCarWash: true,
    hasBar: true,
    hasShop: false,
    rating: 4.3,
    operatorName: 'IP',
    fuelPrices: [
      { fuel: 'Benzina', price: 1.749, isSelf: true, updatedAt: 'Oggi, 08:10' },
      { fuel: 'Diesel', price: 1.669, isSelf: true, updatedAt: 'Oggi, 08:10' }
    ]
  },
  {
    id: 'st_cn_1',
    name: 'Eni Station - Cuneo Borgo Gesso',
    brand: 'Eni',
    type: 'fuel',
    address: 'Via Spinetta 12',
    city: 'Cuneo',
    province: 'CN',
    lat: 44.3812,
    lng: 7.5598,
    isOpen24h: true,
    hasCarWash: true,
    hasBar: true,
    hasShop: true,
    rating: 4.4,
    operatorName: 'Eni Live',
    fuelPrices: [
      { fuel: 'Benzina', price: 1.759, isSelf: true, updatedAt: 'Oggi, 08:20' },
      { fuel: 'Diesel', price: 1.679, isSelf: true, updatedAt: 'Oggi, 08:20' },
      { fuel: 'GPL', price: 0.689, isSelf: false, updatedAt: 'Oggi, 08:20' }
    ]
  },

  // =========================================================================
  // 5. VENETO (Venezia, Verona, Padova, Vicenza, Treviso, Rovigo, Belluno, Affi)
  // =========================================================================
  {
    id: 'st_ve_1',
    name: 'Eni Live Station - Venezia Mestre',
    brand: 'Eni',
    type: 'both',
    address: 'Via della Libertà 82',
    city: 'Venezia',
    province: 'VE',
    lat: 45.4789,
    lng: 12.2412,
    isOpen24h: true,
    hasCarWash: true,
    hasBar: true,
    hasShop: true,
    rating: 4.4,
    operatorName: 'Eni Live',
    fuelPrices: [
      { fuel: 'Benzina', price: 1.769, isSelf: true, updatedAt: 'Oggi, 08:45' },
      { fuel: 'Diesel', price: 1.689, isSelf: true, updatedAt: 'Oggi, 08:45' },
      { fuel: 'GPL', price: 0.689, isSelf: false, updatedAt: 'Oggi, 08:45' }
    ],
    evPlugs: [
      { type: 'CCS Combo 2 (DC)', powerKw: 150, pricePerKwh: 0.59, availableCount: 2, totalCount: 2, status: 'available' }
    ]
  },
  {
    id: 'st_vr_1',
    name: 'Tesla Supercharger & Ionity - Affi Lake Garda',
    brand: 'Tesla',
    type: 'ev',
    address: 'Via Pascoli 31 (Uscita A22 Affi)',
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
    name: 'Q8 Easy - Verona Corso Milano',
    brand: 'Q8',
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
    operatorName: 'Q8',
    fuelPrices: [
      { fuel: 'Benzina', price: 1.749, isSelf: true, updatedAt: 'Oggi, 08:20' },
      { fuel: 'Diesel', price: 1.669, isSelf: true, updatedAt: 'Oggi, 08:20' },
      { fuel: 'GPL', price: 0.679, isSelf: false, updatedAt: 'Oggi, 08:20' },
      { fuel: 'Metano', price: 1.285, isSelf: false, updatedAt: 'Oggi, 08:20' }
    ]
  },
  {
    id: 'st_pd_1',
    name: 'Costantin Carburanti - Padova Tangenziale',
    brand: 'Costantin',
    type: 'fuel',
    address: 'Corso Stati Uniti 14',
    city: 'Padova',
    province: 'PD',
    lat: 45.3912,
    lng: 11.9312,
    isOpen24h: true,
    hasCarWash: true,
    hasBar: true,
    hasShop: true,
    rating: 4.6,
    operatorName: 'Costantin',
    fuelPrices: [
      { fuel: 'Benzina', price: 1.729, isSelf: true, updatedAt: 'Oggi, 07:15' },
      { fuel: 'Diesel', price: 1.649, isSelf: true, updatedAt: 'Oggi, 07:15' },
      { fuel: 'GPL', price: 0.669, isSelf: false, updatedAt: 'Oggi, 07:15' },
      { fuel: 'Metano', price: 1.269, isSelf: false, updatedAt: 'Oggi, 07:15' }
    ]
  },
  {
    id: 'st_vi_1',
    name: 'IP Gruppo api - Vicenza Est',
    brand: 'IP',
    type: 'fuel',
    address: 'Viale Camisano 80',
    city: 'Vicenza',
    province: 'VI',
    lat: 45.5412,
    lng: 11.5812,
    isOpen24h: true,
    hasCarWash: true,
    hasBar: true,
    hasShop: false,
    rating: 4.3,
    operatorName: 'IP',
    fuelPrices: [
      { fuel: 'Benzina', price: 1.749, isSelf: true, updatedAt: 'Oggi, 08:00' },
      { fuel: 'Diesel', price: 1.669, isSelf: true, updatedAt: 'Oggi, 08:00' }
    ]
  },
  {
    id: 'st_tv_1',
    name: 'Tamoil Express - Treviso Nord',
    brand: 'Tamoil',
    type: 'fuel',
    address: 'Viale della Repubblica 210',
    city: 'Treviso',
    province: 'TV',
    lat: 45.6812,
    lng: 12.2312,
    isOpen24h: true,
    hasCarWash: true,
    hasBar: false,
    hasShop: false,
    rating: 4.4,
    operatorName: 'Tamoil',
    fuelPrices: [
      { fuel: 'Benzina', price: 1.739, isSelf: true, updatedAt: 'Oggi, 07:45' },
      { fuel: 'Diesel', price: 1.659, isSelf: true, updatedAt: 'Oggi, 07:45' },
      { fuel: 'GPL', price: 0.679, isSelf: false, updatedAt: 'Oggi, 07:45' }
    ]
  },

  // =========================================================================
  // 6. EMILIA-ROMAGNA (Bologna, Modena, Reggio Emilia, Parma, Ravenna, Rimini, Ferrara, Piacenza, Forlì)
  // =========================================================================
  {
    id: 'st_bo_1',
    name: 'Eni Live Station - Bologna Tangenziale',
    brand: 'Eni',
    type: 'both',
    address: 'Viale Togliatti 21',
    city: 'Bologna',
    province: 'BO',
    lat: 44.5124,
    lng: 11.2981,
    isOpen24h: true,
    hasCarWash: true,
    hasBar: true,
    hasShop: true,
    rating: 4.5,
    operatorName: 'Eni Live',
    fuelPrices: [
      { fuel: 'Benzina', price: 1.759, isSelf: true, updatedAt: 'Oggi, 08:30' },
      { fuel: 'Diesel', price: 1.679, isSelf: true, updatedAt: 'Oggi, 08:30' },
      { fuel: 'GPL', price: 0.679, isSelf: false, updatedAt: 'Oggi, 08:30' },
      { fuel: 'Metano', price: 1.279, isSelf: false, updatedAt: 'Oggi, 08:30' }
    ],
    evPlugs: [
      { type: 'CCS Combo 2 (DC)', powerKw: 300, pricePerKwh: 0.64, availableCount: 2, totalCount: 2, status: 'available' }
    ]
  },
  {
    id: 'st_bo_2',
    name: 'Enercoop - Bologna San Vitale',
    brand: 'Enercoop',
    type: 'fuel',
    address: 'Via Villanova 29',
    city: 'Bologna',
    province: 'BO',
    lat: 44.4981,
    lng: 11.4112,
    isOpen24h: true,
    hasCarWash: true,
    hasBar: true,
    hasShop: true,
    rating: 4.7,
    operatorName: 'Enercoop',
    fuelPrices: [
      { fuel: 'Benzina', price: 1.719, isSelf: true, updatedAt: 'Oggi, 07:00' },
      { fuel: 'Diesel', price: 1.639, isSelf: true, updatedAt: 'Oggi, 07:00' },
      { fuel: 'GPL', price: 0.659, isSelf: false, updatedAt: 'Oggi, 07:00' },
      { fuel: 'Metano', price: 1.249, isSelf: false, updatedAt: 'Oggi, 07:00' }
    ]
  },
  {
    id: 'st_mo_1',
    name: 'Tesla Supercharger & Q8 - Modena Nord (A1)',
    brand: 'Tesla',
    type: 'both',
    address: 'Via Emilia Ovest 1240',
    city: 'Modena',
    province: 'MO',
    lat: 44.6645,
    lng: 10.8712,
    isOpen24h: true,
    hasCarWash: true,
    hasBar: true,
    hasShop: true,
    rating: 4.8,
    operatorName: 'Tesla / Q8',
    fuelPrices: [
      { fuel: 'Benzina', price: 1.745, isSelf: true, updatedAt: 'Oggi, 08:00' },
      { fuel: 'Diesel', price: 1.665, isSelf: true, updatedAt: 'Oggi, 08:00' },
      { fuel: 'GPL', price: 0.675, isSelf: false, updatedAt: 'Oggi, 08:00' },
      { fuel: 'Metano', price: 1.269, isSelf: false, updatedAt: 'Oggi, 08:00' }
    ],
    evPlugs: [
      { type: 'Tesla Supercharger', powerKw: 250, pricePerKwh: 0.44, availableCount: 12, totalCount: 16, status: 'available' },
      { type: 'CCS Combo 2 (DC)', powerKw: 300, pricePerKwh: 0.64, availableCount: 4, totalCount: 4, status: 'available' }
    ]
  },
  {
    id: 'st_re_1',
    name: 'Conad Carburanti - Reggio Emilia Sud',
    brand: 'Conad',
    type: 'fuel',
    address: 'Via Morandi 16',
    city: 'Reggio Emilia',
    province: 'RE',
    lat: 44.6812,
    lng: 10.6312,
    isOpen24h: true,
    hasCarWash: true,
    hasBar: true,
    hasShop: true,
    rating: 4.7,
    operatorName: 'Conad',
    fuelPrices: [
      { fuel: 'Benzina', price: 1.719, isSelf: true, updatedAt: 'Oggi, 07:15' },
      { fuel: 'Diesel', price: 1.639, isSelf: true, updatedAt: 'Oggi, 07:15' },
      { fuel: 'GPL', price: 0.655, isSelf: false, updatedAt: 'Oggi, 07:15' }
    ]
  },
  {
    id: 'st_pr_1',
    name: 'IP Gruppo api - Parma Ovest',
    brand: 'IP',
    type: 'fuel',
    address: 'Via Emilia Ovest 90',
    city: 'Parma',
    province: 'PR',
    lat: 44.8098,
    lng: 10.2981,
    isOpen24h: true,
    hasCarWash: true,
    hasBar: true,
    hasShop: false,
    rating: 4.3,
    operatorName: 'IP',
    fuelPrices: [
      { fuel: 'Benzina', price: 1.749, isSelf: true, updatedAt: 'Oggi, 08:10' },
      { fuel: 'Diesel', price: 1.669, isSelf: true, updatedAt: 'Oggi, 08:10' }
    ]
  },
  {
    id: 'st_rn_1',
    name: 'Eni Station - Rimini Marecchiese',
    brand: 'Eni',
    type: 'fuel',
    address: 'Via Marecchiese 170',
    city: 'Rimini',
    province: 'RN',
    lat: 44.0412,
    lng: 12.5412,
    isOpen24h: true,
    hasCarWash: true,
    hasBar: true,
    hasShop: true,
    rating: 4.4,
    operatorName: 'Eni Live',
    fuelPrices: [
      { fuel: 'Benzina', price: 1.759, isSelf: true, updatedAt: 'Oggi, 08:20' },
      { fuel: 'Diesel', price: 1.679, isSelf: true, updatedAt: 'Oggi, 08:20' },
      { fuel: 'GPL', price: 0.679, isSelf: false, updatedAt: 'Oggi, 08:20' }
    ]
  },

  // =========================================================================
  // 7. TOSCANA (Firenze, Pisa, Livorno, Lucca, Arezzo, Pistoia, Prato, Siena, Grosseto)
  // =========================================================================
  {
    id: 'st_fi_1',
    name: 'Eni Live Station - Firenze Novoli',
    brand: 'Eni',
    type: 'both',
    address: 'Viale Guidoni 130',
    city: 'Firenze',
    province: 'FI',
    lat: 43.7945,
    lng: 11.2189,
    isOpen24h: true,
    hasCarWash: true,
    hasBar: true,
    hasShop: true,
    rating: 4.5,
    operatorName: 'Eni Live',
    fuelPrices: [
      { fuel: 'Benzina', price: 1.769, isSelf: true, updatedAt: 'Oggi, 08:40' },
      { fuel: 'Diesel', price: 1.689, isSelf: true, updatedAt: 'Oggi, 08:40' },
      { fuel: 'GPL', price: 0.689, isSelf: false, updatedAt: 'Oggi, 08:40' },
      { fuel: 'Metano', price: 1.289, isSelf: false, updatedAt: 'Oggi, 08:40' }
    ],
    evPlugs: [
      { type: 'CCS Combo 2 (DC)', powerKw: 150, pricePerKwh: 0.59, availableCount: 2, totalCount: 2, status: 'available' }
    ]
  },
  {
    id: 'st_fi_2',
    name: 'Tesla Supercharger & Free To X - Firenze Nord (A1)',
    brand: 'Tesla',
    type: 'ev',
    address: 'Area di Servizio Bisenzio Est (A1)',
    city: 'Campi Bisenzio',
    province: 'FI',
    lat: 43.8291,
    lng: 11.1412,
    isOpen24h: true,
    hasCarWash: false,
    hasBar: true,
    hasShop: true,
    rating: 4.8,
    operatorName: 'Tesla / Free To X',
    evPlugs: [
      { type: 'Tesla Supercharger', powerKw: 250, pricePerKwh: 0.44, availableCount: 8, totalCount: 12, status: 'available' },
      { type: 'CCS Combo 2 (DC)', powerKw: 300, pricePerKwh: 0.65, availableCount: 4, totalCount: 4, status: 'available' }
    ]
  },
  {
    id: 'st_pi_1',
    name: 'Conad Carburanti - Pisa Cisanello',
    brand: 'Conad',
    type: 'fuel',
    address: 'Via Cisanello 45',
    city: 'Pisa',
    province: 'PI',
    lat: 43.7112,
    lng: 10.4312,
    isOpen24h: true,
    hasCarWash: true,
    hasBar: true,
    hasShop: true,
    rating: 4.7,
    operatorName: 'Conad',
    fuelPrices: [
      { fuel: 'Benzina', price: 1.719, isSelf: true, updatedAt: 'Oggi, 07:05' },
      { fuel: 'Diesel', price: 1.639, isSelf: true, updatedAt: 'Oggi, 07:05' },
      { fuel: 'GPL', price: 0.659, isSelf: false, updatedAt: 'Oggi, 07:05' }
    ]
  },
  {
    id: 'st_li_1',
    name: 'Q8 Easy - Livorno Aurelia',
    brand: 'Q8',
    type: 'fuel',
    address: 'Via Aurelia 190',
    city: 'Livorno',
    province: 'LI',
    lat: 43.5312,
    lng: 10.3212,
    isOpen24h: true,
    hasCarWash: true,
    hasBar: false,
    hasShop: false,
    rating: 4.3,
    operatorName: 'Q8',
    fuelPrices: [
      { fuel: 'Benzina', price: 1.745, isSelf: true, updatedAt: 'Oggi, 07:45' },
      { fuel: 'Diesel', price: 1.665, isSelf: true, updatedAt: 'Oggi, 07:45' }
    ]
  },
  {
    id: 'st_ar_1',
    name: 'IP Gruppo api - Arezzo Raccordo',
    brand: 'IP',
    type: 'fuel',
    address: 'Raccordo Autostradale A1 22',
    city: 'Arezzo',
    province: 'AR',
    lat: 43.4612,
    lng: 11.8512,
    isOpen24h: true,
    hasCarWash: true,
    hasBar: true,
    hasShop: true,
    rating: 4.4,
    operatorName: 'IP',
    fuelPrices: [
      { fuel: 'Benzina', price: 1.749, isSelf: true, updatedAt: 'Oggi, 08:10' },
      { fuel: 'Diesel', price: 1.669, isSelf: true, updatedAt: 'Oggi, 08:10' },
      { fuel: 'GPL', price: 0.679, isSelf: false, updatedAt: 'Oggi, 08:10' }
    ]
  },
  {
    id: 'st_si_1',
    name: 'Beyfin Carburanti - Siena Ovest',
    brand: 'Beyfin',
    type: 'fuel',
    address: 'Strada Massetana Romana 58',
    city: 'Siena',
    province: 'SI',
    lat: 43.3098,
    lng: 11.3198,
    isOpen24h: true,
    hasCarWash: true,
    hasBar: false,
    hasShop: false,
    rating: 4.6,
    operatorName: 'Beyfin',
    fuelPrices: [
      { fuel: 'Benzina', price: 1.729, isSelf: true, updatedAt: 'Oggi, 07:20' },
      { fuel: 'Diesel', price: 1.649, isSelf: true, updatedAt: 'Oggi, 07:20' },
      { fuel: 'GPL', price: 0.665, isSelf: false, updatedAt: 'Oggi, 07:20' },
      { fuel: 'Metano', price: 1.259, isSelf: false, updatedAt: 'Oggi, 07:20' }
    ]
  },

  // =========================================================================
  // 8. PUGLIA (Bari, Taranto, Foggia, Lecce, Brindisi, Barletta, Andria)
  // =========================================================================
  {
    id: 'st_ba_1',
    name: 'Eni Live Station - Bari Tangenziale Sud',
    brand: 'Eni',
    type: 'both',
    address: 'Via Fanelli 285',
    city: 'Bari',
    province: 'BA',
    lat: 41.0984,
    lng: 16.8812,
    isOpen24h: true,
    hasCarWash: true,
    hasBar: true,
    hasShop: true,
    rating: 4.5,
    operatorName: 'Eni Live',
    fuelPrices: [
      { fuel: 'Benzina', price: 1.749, isSelf: true, updatedAt: 'Oggi, 08:30' },
      { fuel: 'Diesel', price: 1.669, isSelf: true, updatedAt: 'Oggi, 08:30' },
      { fuel: 'GPL', price: 0.679, isSelf: false, updatedAt: 'Oggi, 08:30' },
      { fuel: 'Metano', price: 1.285, isSelf: false, updatedAt: 'Oggi, 08:30' }
    ],
    evPlugs: [
      { type: 'CCS Combo 2 (DC)', powerKw: 150, pricePerKwh: 0.59, availableCount: 2, totalCount: 2, status: 'available' }
    ]
  },
  {
    id: 'st_ba_2',
    name: 'Tesla Supercharger - Modugno Bari Ovest',
    brand: 'Tesla',
    type: 'ev',
    address: 'SP 231 Km 1.200',
    city: 'Modugno',
    province: 'BA',
    lat: 41.0891,
    lng: 16.7812,
    isOpen24h: true,
    hasCarWash: false,
    hasBar: true,
    hasShop: true,
    rating: 4.8,
    operatorName: 'Tesla',
    evPlugs: [
      { type: 'Tesla Supercharger', powerKw: 250, pricePerKwh: 0.44, availableCount: 8, totalCount: 8, status: 'available' }
    ]
  },
  {
    id: 'st_le_1',
    name: 'Q8 Easy - Lecce Tangenziale Est',
    brand: 'Q8',
    type: 'fuel',
    address: 'Via San Cesario 110',
    city: 'Lecce',
    province: 'LE',
    lat: 40.3398,
    lng: 18.1612,
    isOpen24h: true,
    hasCarWash: true,
    hasBar: false,
    hasShop: false,
    rating: 4.4,
    operatorName: 'Q8',
    fuelPrices: [
      { fuel: 'Benzina', price: 1.739, isSelf: true, updatedAt: 'Oggi, 07:30' },
      { fuel: 'Diesel', price: 1.659, isSelf: true, updatedAt: 'Oggi, 07:30' },
      { fuel: 'GPL', price: 0.669, isSelf: false, updatedAt: 'Oggi, 07:30' }
    ]
  },
  {
    id: 'st_ta_1',
    name: 'IP Gruppo api - Taranto Tamburi',
    brand: 'IP',
    type: 'fuel',
    address: 'Via Appia Km 650',
    city: 'Taranto',
    province: 'TA',
    lat: 40.4812,
    lng: 17.2312,
    isOpen24h: true,
    hasCarWash: true,
    hasBar: true,
    hasShop: false,
    rating: 4.2,
    operatorName: 'IP',
    fuelPrices: [
      { fuel: 'Benzina', price: 1.745, isSelf: true, updatedAt: 'Oggi, 08:15' },
      { fuel: 'Diesel', price: 1.665, isSelf: true, updatedAt: 'Oggi, 08:15' }
    ]
  },
  {
    id: 'st_fg_1',
    name: 'Conad Carburanti - Foggia Salice',
    brand: 'Conad',
    type: 'fuel',
    address: 'Via degli Aviatori 120',
    city: 'Foggia',
    province: 'FG',
    lat: 41.4498,
    lng: 15.5412,
    isOpen24h: true,
    hasCarWash: true,
    hasBar: true,
    hasShop: true,
    rating: 4.7,
    operatorName: 'Conad',
    fuelPrices: [
      { fuel: 'Benzina', price: 1.719, isSelf: true, updatedAt: 'Oggi, 07:10' },
      { fuel: 'Diesel', price: 1.639, isSelf: true, updatedAt: 'Oggi, 07:10' },
      { fuel: 'GPL', price: 0.659, isSelf: false, updatedAt: 'Oggi, 07:10' }
    ]
  },

  // =========================================================================
  // 9. SICILIA (Palermo, Catania, Messina, Siracusa, Trapani, Ragusa, Agrigento)
  // =========================================================================
  {
    id: 'st_pa_1',
    name: 'Eni Live Station - Palermo Viale Regione Siciliana',
    brand: 'Eni',
    type: 'both',
    address: 'Viale Regione Siciliana 3450',
    city: 'Palermo',
    province: 'PA',
    lat: 38.1298,
    lng: 13.3312,
    isOpen24h: true,
    hasCarWash: true,
    hasBar: true,
    hasShop: true,
    rating: 4.4,
    operatorName: 'Eni Live',
    fuelPrices: [
      { fuel: 'Benzina', price: 1.769, isSelf: true, updatedAt: 'Oggi, 08:30' },
      { fuel: 'Diesel', price: 1.689, isSelf: true, updatedAt: 'Oggi, 08:30' },
      { fuel: 'GPL', price: 0.699, isSelf: false, updatedAt: 'Oggi, 08:30' },
      { fuel: 'Metano', price: 1.299, isSelf: false, updatedAt: 'Oggi, 08:30' }
    ],
    evPlugs: [
      { type: 'CCS Combo 2 (DC)', powerKw: 150, pricePerKwh: 0.59, availableCount: 2, totalCount: 2, status: 'available' }
    ]
  },
  {
    id: 'st_ct_1',
    name: 'Tesla Supercharger & Q8 - Catania Centro Sicilia',
    brand: 'Tesla',
    type: 'both',
    address: 'Tangenziale Ovest Uscita San Giorgio',
    city: 'Catania',
    province: 'CT',
    lat: 37.4912,
    lng: 15.0412,
    isOpen24h: true,
    hasCarWash: true,
    hasBar: true,
    hasShop: true,
    rating: 4.8,
    operatorName: 'Tesla / Q8',
    fuelPrices: [
      { fuel: 'Benzina', price: 1.745, isSelf: true, updatedAt: 'Oggi, 08:00' },
      { fuel: 'Diesel', price: 1.665, isSelf: true, updatedAt: 'Oggi, 08:00' },
      { fuel: 'GPL', price: 0.685, isSelf: false, updatedAt: 'Oggi, 08:00' }
    ],
    evPlugs: [
      { type: 'Tesla Supercharger', powerKw: 250, pricePerKwh: 0.45, availableCount: 8, totalCount: 12, status: 'available' },
      { type: 'CCS Combo 2 (DC)', powerKw: 300, pricePerKwh: 0.64, availableCount: 4, totalCount: 4, status: 'available' }
    ]
  },
  {
    id: 'st_me_1',
    name: 'IP Gruppo api - Messina Boccetta',
    brand: 'IP',
    type: 'fuel',
    address: 'Viale Boccetta 45',
    city: 'Messina',
    province: 'ME',
    lat: 38.2012,
    lng: 15.5512,
    isOpen24h: true,
    hasCarWash: true,
    hasBar: true,
    hasShop: true,
    rating: 4.3,
    operatorName: 'IP',
    fuelPrices: [
      { fuel: 'Benzina', price: 1.765, isSelf: true, updatedAt: 'Oggi, 08:15' },
      { fuel: 'Diesel', price: 1.685, isSelf: true, updatedAt: 'Oggi, 08:15' }
    ]
  },
  {
    id: 'st_sr_1',
    name: 'Tamoil Express - Siracusa Scala Greca',
    brand: 'Tamoil',
    type: 'fuel',
    address: 'Viale Scala Greca 110',
    city: 'Siracusa',
    province: 'SR',
    lat: 37.0912,
    lng: 15.2712,
    isOpen24h: true,
    hasCarWash: true,
    hasBar: false,
    hasShop: false,
    rating: 4.4,
    operatorName: 'Tamoil',
    fuelPrices: [
      { fuel: 'Benzina', price: 1.745, isSelf: true, updatedAt: 'Oggi, 07:50' },
      { fuel: 'Diesel', price: 1.665, isSelf: true, updatedAt: 'Oggi, 07:50' },
      { fuel: 'GPL', price: 0.689, isSelf: false, updatedAt: 'Oggi, 07:50' }
    ]
  },

  // =========================================================================
  // 10. SARDEGNA (Cagliari, Sassari, Olbia, Nuoro, Oristano, Alghero)
  // =========================================================================
  {
    id: 'st_ca_1',
    name: 'Eni Live Station - Cagliari Poetto',
    brand: 'Eni',
    type: 'both',
    address: 'Viale Poetto 90',
    city: 'Cagliari',
    province: 'CA',
    lat: 39.2112,
    lng: 9.1512,
    isOpen24h: true,
    hasCarWash: true,
    hasBar: true,
    hasShop: true,
    rating: 4.5,
    operatorName: 'Eni Live',
    fuelPrices: [
      { fuel: 'Benzina', price: 1.769, isSelf: true, updatedAt: 'Oggi, 08:30' },
      { fuel: 'Diesel', price: 1.689, isSelf: true, updatedAt: 'Oggi, 08:30' },
      { fuel: 'GPL', price: 0.709, isSelf: false, updatedAt: 'Oggi, 08:30' }
    ],
    evPlugs: [
      { type: 'CCS Combo 2 (DC)', powerKw: 150, pricePerKwh: 0.59, availableCount: 2, totalCount: 2, status: 'available' }
    ]
  },
  {
    id: 'st_ss_1',
    name: 'Q8 Easy - Sassari Predda Niedda',
    brand: 'Q8',
    type: 'fuel',
    address: 'Strada 1 Predda Niedda 40',
    city: 'Sassari',
    province: 'SS',
    lat: 40.7312,
    lng: 8.5312,
    isOpen24h: true,
    hasCarWash: true,
    hasBar: false,
    hasShop: false,
    rating: 4.4,
    operatorName: 'Q8',
    fuelPrices: [
      { fuel: 'Benzina', price: 1.749, isSelf: true, updatedAt: 'Oggi, 07:30' },
      { fuel: 'Diesel', price: 1.669, isSelf: true, updatedAt: 'Oggi, 07:30' },
      { fuel: 'GPL', price: 0.699, isSelf: false, updatedAt: 'Oggi, 07:30' }
    ]
  },
  {
    id: 'st_ol_1',
    name: 'Tesla Supercharger & Enel X - Olbia Aeroporto',
    brand: 'Tesla',
    type: 'ev',
    address: 'Aeroporto Costa Smeralda',
    city: 'Olbia',
    province: 'SS',
    lat: 40.9012,
    lng: 9.5112,
    isOpen24h: true,
    hasCarWash: false,
    hasBar: true,
    hasShop: true,
    rating: 4.9,
    operatorName: 'Tesla / Enel X',
    evPlugs: [
      { type: 'Tesla Supercharger', powerKw: 250, pricePerKwh: 0.45, availableCount: 8, totalCount: 8, status: 'available' },
      { type: 'CCS Combo 2 (DC)', powerKw: 300, pricePerKwh: 0.65, availableCount: 4, totalCount: 4, status: 'available' }
    ]
  },

  // =========================================================================
  // 11. LIGURIA (Genova, La Spezia, Savona, Sanremo, Imperia)
  // =========================================================================
  {
    id: 'st_ge_1',
    name: 'Eni Live Station - Genova Aeroporto (A10)',
    brand: 'Eni',
    type: 'both',
    address: 'Via Guido Rossa 12',
    city: 'Genova',
    province: 'GE',
    lat: 44.4145,
    lng: 8.8712,
    isOpen24h: true,
    hasCarWash: true,
    hasBar: true,
    hasShop: true,
    rating: 4.4,
    operatorName: 'Eni Live',
    fuelPrices: [
      { fuel: 'Benzina', price: 1.769, isSelf: true, updatedAt: 'Oggi, 08:30' },
      { fuel: 'Diesel', price: 1.689, isSelf: true, updatedAt: 'Oggi, 08:30' },
      { fuel: 'GPL', price: 0.699, isSelf: false, updatedAt: 'Oggi, 08:30' }
    ],
    evPlugs: [
      { type: 'CCS Combo 2 (DC)', powerKw: 150, pricePerKwh: 0.59, availableCount: 2, totalCount: 2, status: 'available' }
    ]
  },
  {
    id: 'st_sp_1',
    name: 'IP Gruppo api - La Spezia Porto',
    brand: 'IP',
    type: 'fuel',
    address: 'Viale Italia 210',
    city: 'La Spezia',
    province: 'SP',
    lat: 44.1112,
    lng: 9.8312,
    isOpen24h: true,
    hasCarWash: true,
    hasBar: true,
    hasShop: false,
    rating: 4.3,
    operatorName: 'IP',
    fuelPrices: [
      { fuel: 'Benzina', price: 1.759, isSelf: true, updatedAt: 'Oggi, 08:10' },
      { fuel: 'Diesel', price: 1.679, isSelf: true, updatedAt: 'Oggi, 08:10' }
    ]
  },

  // =========================================================================
  // 12. MARCHE, ABRUZZO & UMBRIA (Ancona, Pescara, Perugia, Pesaro, L'Aquila, Terni)
  // =========================================================================
  {
    id: 'st_an_1',
    name: 'Q8 Easy - Ancona Baraccola',
    brand: 'Q8',
    type: 'fuel',
    address: 'Via I Maggio 70',
    city: 'Ancona',
    province: 'AN',
    lat: 43.5612,
    lng: 13.5112,
    isOpen24h: true,
    hasCarWash: true,
    hasBar: true,
    hasShop: true,
    rating: 4.4,
    operatorName: 'Q8',
    fuelPrices: [
      { fuel: 'Benzina', price: 1.739, isSelf: true, updatedAt: 'Oggi, 07:30' },
      { fuel: 'Diesel', price: 1.659, isSelf: true, updatedAt: 'Oggi, 07:30' },
      { fuel: 'GPL', price: 0.679, isSelf: false, updatedAt: 'Oggi, 07:30' },
      { fuel: 'Metano', price: 1.279, isSelf: false, updatedAt: 'Oggi, 07:30' }
    ]
  },
  {
    id: 'st_pe_1',
    name: 'Eni Live - Pescara Aeroporto',
    brand: 'Eni',
    type: 'both',
    address: 'Via Tiburtina Valeria 310',
    city: 'Pescara',
    province: 'PE',
    lat: 42.4412,
    lng: 14.1812,
    isOpen24h: true,
    hasCarWash: true,
    hasBar: true,
    hasShop: true,
    rating: 4.5,
    operatorName: 'Eni Live',
    fuelPrices: [
      { fuel: 'Benzina', price: 1.749, isSelf: true, updatedAt: 'Oggi, 08:20' },
      { fuel: 'Diesel', price: 1.669, isSelf: true, updatedAt: 'Oggi, 08:20' },
      { fuel: 'GPL', price: 0.675, isSelf: false, updatedAt: 'Oggi, 08:20' }
    ],
    evPlugs: [
      { type: 'CCS Combo 2 (DC)', powerKw: 150, pricePerKwh: 0.58, availableCount: 2, totalCount: 2, status: 'available' }
    ]
  },
  {
    id: 'st_pg_1',
    name: 'Beyfin Carburanti - Perugia Ponte San Giovanni',
    brand: 'Beyfin',
    type: 'fuel',
    address: 'Via Benucci 15',
    city: 'Perugia',
    province: 'PG',
    lat: 43.0812,
    lng: 12.4312,
    isOpen24h: true,
    hasCarWash: true,
    hasBar: true,
    hasShop: true,
    rating: 4.6,
    operatorName: 'Beyfin',
    fuelPrices: [
      { fuel: 'Benzina', price: 1.725, isSelf: true, updatedAt: 'Oggi, 07:15' },
      { fuel: 'Diesel', price: 1.645, isSelf: true, updatedAt: 'Oggi, 07:15' },
      { fuel: 'GPL', price: 0.659, isSelf: false, updatedAt: 'Oggi, 07:15' },
      { fuel: 'Metano', price: 1.249, isSelf: false, updatedAt: 'Oggi, 07:15' }
    ]
  },

  // =========================================================================
  // 13. TRENTINO-ALTO ADIGE & FRIULI-VENEZIA GIULIA (Trento, Bolzano, Trieste, Udine)
  // =========================================================================
  {
    id: 'st_tn_1',
    name: 'Eni Station - Trento Nord (A22)',
    brand: 'Eni',
    type: 'both',
    address: 'Via Brennero 180',
    city: 'Trento',
    province: 'TN',
    lat: 46.0912,
    lng: 11.1212,
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
      { fuel: 'Metano', price: 1.289, isSelf: false, updatedAt: 'Oggi, 08:30' }
    ],
    evPlugs: [
      { type: 'CCS Combo 2 (DC)', powerKw: 300, pricePerKwh: 0.64, availableCount: 4, totalCount: 4, status: 'available' },
      { type: 'CCS Combo 2 (DC)', powerKw: 150, pricePerKwh: 0.58, availableCount: 2, totalCount: 2, status: 'available' }
    ]
  },
  {
    id: 'st_bz_1',
    name: 'Tesla Supercharger & Q8 - Bolzano Sud (A22)',
    brand: 'Tesla',
    type: 'both',
    address: 'Via Einstein 8',
    city: 'Bolzano',
    province: 'BZ',
    lat: 46.4712,
    lng: 11.3312,
    isOpen24h: true,
    hasCarWash: true,
    hasBar: true,
    hasShop: true,
    rating: 4.8,
    operatorName: 'Tesla / Q8',
    fuelPrices: [
      { fuel: 'Benzina', price: 1.765, isSelf: true, updatedAt: 'Oggi, 08:00' },
      { fuel: 'Diesel', price: 1.685, isSelf: true, updatedAt: 'Oggi, 08:00' }
    ],
    evPlugs: [
      { type: 'Tesla Supercharger', powerKw: 250, pricePerKwh: 0.44, availableCount: 12, totalCount: 12, status: 'available' }
    ]
  },
  {
    id: 'st_ts_1',
    name: 'IP Gruppo api - Trieste Costiera',
    brand: 'IP',
    type: 'fuel',
    address: 'Strada Costiera 45',
    city: 'Trieste',
    province: 'TS',
    lat: 45.6912,
    lng: 13.7312,
    isOpen24h: true,
    hasCarWash: true,
    hasBar: true,
    hasShop: false,
    rating: 4.4,
    operatorName: 'IP',
    fuelPrices: [
      { fuel: 'Benzina', price: 1.759, isSelf: true, updatedAt: 'Oggi, 08:15' },
      { fuel: 'Diesel', price: 1.679, isSelf: true, updatedAt: 'Oggi, 08:15' }
    ]
  },
  {
    id: 'st_ud_1',
    name: 'Costantin Carburanti - Udine Nord',
    brand: 'Costantin',
    type: 'fuel',
    address: 'Via Nazionale 85',
    city: 'Udine',
    province: 'UD',
    lat: 46.0912,
    lng: 13.2312,
    isOpen24h: true,
    hasCarWash: true,
    hasBar: true,
    hasShop: true,
    rating: 4.6,
    operatorName: 'Costantin',
    fuelPrices: [
      { fuel: 'Benzina', price: 1.729, isSelf: true, updatedAt: 'Oggi, 07:10' },
      { fuel: 'Diesel', price: 1.649, isSelf: true, updatedAt: 'Oggi, 07:10' },
      { fuel: 'GPL', price: 0.669, isSelf: false, updatedAt: 'Oggi, 07:10' },
      { fuel: 'Metano', price: 1.259, isSelf: false, updatedAt: 'Oggi, 07:10' }
    ]
  },

  // =========================================================================
  // 14. CALABRIA & BASILICATA (Reggio Calabria, Cosenza, Catanzaro, Potenza, Matera)
  // =========================================================================
  {
    id: 'st_rc_1',
    name: 'Eni Station - Reggio Calabria Porto',
    brand: 'Eni',
    type: 'fuel',
    address: 'Viale Zerbi 12',
    city: 'Reggio Calabria',
    province: 'RC',
    lat: 38.1189,
    lng: 15.6512,
    isOpen24h: true,
    hasCarWash: true,
    hasBar: true,
    hasShop: true,
    rating: 4.4,
    operatorName: 'Eni Live',
    fuelPrices: [
      { fuel: 'Benzina', price: 1.765, isSelf: true, updatedAt: 'Oggi, 08:20' },
      { fuel: 'Diesel', price: 1.685, isSelf: true, updatedAt: 'Oggi, 08:20' },
      { fuel: 'GPL', price: 0.699, isSelf: false, updatedAt: 'Oggi, 08:20' }
    ]
  },
  {
    id: 'st_cs_1',
    name: 'Tesla Supercharger & Q8 - Cosenza Rende (A2)',
    brand: 'Tesla',
    type: 'both',
    address: 'Via Marconi 110',
    city: 'Rende',
    province: 'CS',
    lat: 39.3312,
    lng: 16.2412,
    isOpen24h: true,
    hasCarWash: true,
    hasBar: true,
    hasShop: true,
    rating: 4.8,
    operatorName: 'Tesla / Q8',
    fuelPrices: [
      { fuel: 'Benzina', price: 1.745, isSelf: true, updatedAt: 'Oggi, 08:00' },
      { fuel: 'Diesel', price: 1.665, isSelf: true, updatedAt: 'Oggi, 08:00' },
      { fuel: 'GPL', price: 0.679, isSelf: false, updatedAt: 'Oggi, 08:00' }
    ],
    evPlugs: [
      { type: 'Tesla Supercharger', powerKw: 250, pricePerKwh: 0.45, availableCount: 8, totalCount: 8, status: 'available' }
    ]
  },
  {
    id: 'st_pz_1',
    name: 'IP Gruppo api - Potenza Basentana',
    brand: 'IP',
    type: 'fuel',
    address: 'SS 407 Basentana Km 5.200',
    city: 'Potenza',
    province: 'PZ',
    lat: 40.6412,
    lng: 15.8112,
    isOpen24h: true,
    hasCarWash: true,
    hasBar: true,
    hasShop: false,
    rating: 4.3,
    operatorName: 'IP',
    fuelPrices: [
      { fuel: 'Benzina', price: 1.755, isSelf: true, updatedAt: 'Oggi, 08:15' },
      { fuel: 'Diesel', price: 1.675, isSelf: true, updatedAt: 'Oggi, 08:15' }
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
