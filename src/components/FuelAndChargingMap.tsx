import React, { useState, useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import { Station, FuelType, Vehicle, EnergySourceType, AppSettings } from '../types';
import { SEED_STATIONS, calculateDistanceKm } from '../data/seedStations';
import { 
  Fuel, 
  Zap, 
  MapPin, 
  Navigation, 
  Search, 
  SlidersHorizontal, 
  ArrowUpDown, 
  Sparkles, 
  ExternalLink, 
  Check, 
  PlusCircle, 
  Clock, 
  Coffee, 
  Car, 
  ShoppingBag, 
  Star,
  LocateFixed,
  Filter,
  Info,
  RefreshCw,
  ChevronRight,
  X,
  Copy,
  CheckCheck,
  ChevronDown
} from 'lucide-react';

interface FuelAndChargingMapProps {
  vehicles: Vehicle[];
  selectedVehicle?: Vehicle;
  settings?: AppSettings;
  onOpenRefuelWithStation?: (station: Station, fuelOrPlug: { price: number; type: EnergySourceType; name: string }) => void;
}

export const FuelAndChargingMap: React.FC<FuelAndChargingMapProps> = ({
  vehicles,
  selectedVehicle,
  settings,
  onOpenRefuelWithStation
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);

  // Data source state: Live from /api/stations with fallback to SEED_STATIONS and offline localStorage cache
  const [liveStations, setLiveStations] = useState<Station[]>(() => {
    try {
      const cached = localStorage.getItem('garage_cached_stations_v1');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return SEED_STATIONS;
  });
  const [isSyncingLive, setIsSyncingLive] = useState(false);
  const [isLoadingAreaStations, setIsLoadingAreaStations] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [totalDbCount, setTotalDbCount] = useState<number>(21638);
  const [currentZoom, setCurrentZoom] = useState<number>(11);

  // Helper parser from backend API model to UI Station model
  const parseBackendStations = (rawArray: any[]): Station[] => {
    return rawArray.map((item: any) => {
      if (item.fuelPrices || item.evPlugs) return item as Station;

      const isEvType = item.tipo === 'elettrico' || item.tipo === 'ev' || 
        (item.nome_gestore && (
          item.nome_gestore.toLowerCase().includes('tesla') || 
          item.nome_gestore.toLowerCase().includes('enel x') || 
          item.nome_gestore.toLowerCase().includes('be charge') || 
          item.nome_gestore.toLowerCase().includes('ionity') || 
          item.nome_gestore.toLowerCase().includes('ewiva') || 
          item.nome_gestore.toLowerCase().includes('free to x') || 
          item.nome_gestore.toLowerCase().includes('a2a') || 
          item.nome_gestore.toLowerCase().includes('neogy')
        ));

      const fuelPrices = (item.servizi_prezzi || [])
        .filter((sp: any) => {
          const t = sp.tipo_servizio?.toLowerCase() || '';
          return !t.includes('kw') && !t.includes('type') && !t.includes('ccs') && !t.includes('supercharger') && !t.includes('chademo') && !t.includes('ricarica');
        })
        .map((sp: any) => {
          const isSelf = sp.tipo_servizio?.toLowerCase().includes('self');
          let fuelName: FuelType = 'Benzina';
          if (sp.tipo_servizio?.toLowerCase().includes('gasolio') || sp.tipo_servizio?.toLowerCase().includes('diesel')) fuelName = 'Diesel';
          else if (sp.tipo_servizio?.toLowerCase().includes('gpl')) fuelName = 'GPL';
          else if (sp.tipo_servizio?.toLowerCase().includes('metano')) fuelName = 'Metano';
          return {
            fuel: fuelName,
            price: sp.prezzo,
            isSelf,
            updatedAt: sp.ultimo_aggiornamento ? new Date(sp.ultimo_aggiornamento).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }) : 'Oggi'
          };
        });

      let evPlugs = (item.servizi_prezzi || [])
        .filter((sp: any) => {
          const t = sp.tipo_servizio?.toLowerCase() || '';
          return t.includes('kw') || t.includes('type') || t.includes('ccs') || t.includes('supercharger') || t.includes('chademo') || t.includes('ricarica');
        })
        .map((sp: any) => {
          const matchKw = sp.tipo_servizio?.match(/(\d+)\s*kw/i);
          const powerKw = matchKw ? parseInt(matchKw[1], 10) : (sp.tipo_servizio?.includes('Supercharger') ? 250 : 150);
          return {
            type: sp.tipo_servizio || 'CCS Combo 2 (DC)',
            powerKw,
            pricePerKwh: sp.prezzo || 0.59,
            availableCount: 3,
            totalCount: 4,
            status: 'available' as const
          };
        });

      if (isEvType && evPlugs.length === 0) {
        const isTesla = item.nome_gestore?.toLowerCase().includes('tesla');
        evPlugs = [
          {
            type: isTesla ? 'Tesla Supercharger' : 'CCS Combo 2 (DC)',
            powerKw: isTesla ? 250 : 150,
            pricePerKwh: isTesla ? 0.46 : 0.59,
            availableCount: 4,
            totalCount: 6,
            status: 'available' as const
          },
          {
            type: 'Type 2 (AC)',
            powerKw: 22,
            pricePerKwh: 0.45,
            availableCount: 2,
            totalCount: 2,
            status: 'available' as const
          }
        ];
      }

      let determinedType: 'fuel' | 'ev' | 'both' = 'fuel';
      if (isEvType || (evPlugs.length > 0 && fuelPrices.length === 0)) {
        determinedType = 'ev';
      } else if (evPlugs.length > 0 && fuelPrices.length > 0) {
        determinedType = 'both';
      }

      return {
        id: item.id,
        name: item.nome_gestore ? `${item.nome_gestore} - ${item.comune || ''}` : (isEvType ? 'Colonnina Ricarica EV' : 'Stazione Rifornimento'),
        brand: item.nome_gestore || (isEvType ? 'Colonnina EV' : 'Distributore'),
        type: determinedType,
        address: item.indirizzo_completo || item.comune || '',
        city: item.comune || 'Italia',
        province: '',
        lat: item.coordinate?.lat || 45.4642,
        lng: item.coordinate?.lng || 9.1900,
        isOpen24h: true,
        hasCarWash: !isEvType && (item.nome_gestore?.toLowerCase().includes('eni') || item.nome_gestore?.toLowerCase().includes('q8')),
        hasBar: true,
        hasShop: false,
        rating: 4.6,
        operatorName: item.nome_gestore,
        fuelPrices: fuelPrices.length > 0 ? fuelPrices : undefined,
        evPlugs: evPlugs.length > 0 ? evPlugs : undefined
      };
    });
  };

  // Dynamic fetcher from backend
  const fetchAreaStations = async (options: { lat?: number; lng?: number; radius?: number; q?: string; bounds?: string; type?: string }) => {
    setIsLoadingAreaStations(true);
    try {
      const params = new URLSearchParams();
      if (options.lat !== undefined && !isNaN(options.lat)) params.append('lat', options.lat.toString());
      if (options.lng !== undefined && !isNaN(options.lng)) params.append('lng', options.lng.toString());
      if (options.radius !== undefined) params.append('radius', options.radius.toString());
      if (options.q) params.append('q', options.q);
      if (options.bounds) params.append('bounds', options.bounds);
      const activeType = options.type || (typeFilter !== 'all' ? typeFilter : undefined);
      if (activeType) {
        params.append('type', activeType);
      }
      params.append('limit', '350');

      const res = await fetch(`/api/stations?${params.toString()}`);
      if (!res.ok) throw new Error('API error');
      const json = await res.json();

      if (json.totalInDatabase) {
        setTotalDbCount(json.totalInDatabase);
      }
      if (json.updatedAt) {
        setLastSyncTime(new Date(json.updatedAt).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }));
      }

      if (json.data && Array.isArray(json.data) && json.data.length > 0) {
        const mapped = parseBackendStations(json.data);
        setLiveStations(mapped);
        try {
          // Cache in localStorage for instantaneous offline and mobile startup
          localStorage.setItem('garage_cached_stations_v1', JSON.stringify(mapped.slice(0, 150)));
        } catch {
          // localStorage safe ignore
        }
      }
    } catch (e) {
      console.warn('Caricamento stazioni API non disponibile, utilizzo catalogo offline:', e);
    } finally {
      setIsLoadingAreaStations(false);
    }
  };

  // Initial load: Attempt automatic GPS position on mobile & desktop, with graceful fallback
  useEffect(() => {
    if (navigator.geolocation && !localStorage.getItem('garage_location_dismissed')) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          };
          setUserLocation(coords);
          fetchAreaStations({ lat: coords.lat, lng: coords.lng, radius: 35, type: 'all' });
          if (mapInstanceRef.current) {
            mapInstanceRef.current.setView([coords.lat, coords.lng], 12);
          }
        },
        () => {
          // Default fallback Milan
          fetchAreaStations({ lat: 45.4642, lng: 9.1900, radius: 45, type: 'all' });
        },
        { enableHighAccuracy: false, timeout: 6000 }
      );
    } else {
      fetchAreaStations({ lat: 45.4642, lng: 9.1900, radius: 45, type: 'all' });
    }
  }, []);

  // Trigger manual sync with backend
  const handleManualSync = async () => {
    setIsSyncingLive(true);
    setLocationStatus('Sincronizzazione dati MIMIT & Open Charge Map in corso...');
    try {
      const res = await fetch('/api/stations/sync', { method: 'POST' });
      if (!res.ok) throw new Error('Sync fallita');
      const data = await res.json();
      
      // Reload stations
      const refreshRes = await fetch('/api/stations');
      if (refreshRes.ok) {
        const refreshJson = await refreshRes.json();
        if (refreshJson.data && refreshJson.data.length > 0) {
          // Re-map as above
          const mapped = refreshJson.data.map((item: any) => {
            if (item.fuelPrices || item.evPlugs) return item;
            return {
              id: item.id,
              name: item.nome_gestore ? `${item.nome_gestore} - ${item.comune}` : 'Stazione',
              brand: item.nome_gestore || 'Distributore',
              type: item.tipo === 'carburante' ? 'fuel' : 'ev',
              address: item.indirizzo_completo,
              city: item.comune,
              lat: item.coordinate.lat,
              lng: item.coordinate.lng,
              isOpen24h: true,
              hasCarWash: true,
              hasBar: true,
              fuelPrices: (item.servizi_prezzi || []).map((sp: any) => ({
                fuel: sp.tipo_servizio.includes('Diesel') ? 'Diesel' : (sp.tipo_servizio.includes('GPL') ? 'GPL' : (sp.tipo_servizio.includes('Metano') ? 'Metano' : 'Benzina')),
                price: sp.prezzo,
                isSelf: sp.tipo_servizio.includes('Self'),
                updatedAt: 'Oggi'
              }))
            };
          });
          setLiveStations(mapped);
          setLastSyncTime(new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }));
        }
      }
      setLocationStatus(`Sincronizzazione completata con successo! ${data.totale || ''} stazioni aggiornate.`);
      setTimeout(() => setLocationStatus(''), 4000);
    } catch (err: any) {
      setLocationStatus('Errore durante la sincronizzazione con i server MIMIT.');
      setTimeout(() => setLocationStatus(''), 4000);
    } finally {
      setIsSyncingLive(false);
    }
  };

  // User coordinates
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState<string>('');
  
  // Geolocation permission / banner state
  // Check if previously dismissed or declined in session
  const [hasDeclinedLocation, setHasDeclinedLocation] = useState<boolean>(() => {
    return localStorage.getItem('garage_location_dismissed') === 'true';
  });

  // Search input & selected city
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchingCity, setIsSearchingCity] = useState(false);

  // Toggle modal/dropdown for filters
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  // Copy navigation command status
  const [copiedStationId, setCopiedStationId] = useState<string | null>(null);

  // Determine Default Type Filter from garage vehicles and settings
  const defaultCategoryFilter = useMemo<'all' | 'fuel' | 'ev' | 'both'>(() => {
    const prefMode = settings?.stationDisplayMode || 'auto';
    if (prefMode === 'fuel_only') return 'fuel';
    if (prefMode === 'ev_only') return 'ev';
    if (prefMode === 'all') return 'all';

    // Auto mode based on garage vehicles
    if (vehicles.length > 0) {
      const hasOnlyBEV = vehicles.every(v => v.fuelType === 'Elettrica (BEV)');
      if (hasOnlyBEV) return 'ev';

      const hasOnlyCombustionOrMild = vehicles.every(v => 
        v.fuelType === 'Benzina' || 
        v.fuelType === 'Diesel' || 
        v.fuelType === 'Full / Mild Hybrid' || 
        v.fuelType === 'GPL' || 
        v.fuelType === 'Metano' || 
        v.fuelType.includes('GPL') || 
        v.fuelType.includes('Metano')
      );
      if (hasOnlyCombustionOrMild) return 'fuel';

      const hasPHEV = vehicles.some(v => v.fuelType === 'Plug-in Hybrid (PHEV)');
      if (hasPHEV) return 'both';
    }

    return 'all';
  }, [vehicles, settings?.stationDisplayMode]);

  // Filtering & Sorting State
  const [typeFilter, setTypeFilter] = useState<'all' | 'fuel' | 'ev' | 'both'>(defaultCategoryFilter);
  const [specificFuelFilter, setSpecificFuelFilter] = useState<string>('all');
  const [brandFilter, setBrandFilter] = useState<string>('all');
  const [maxDistanceKm, setMaxDistanceKm] = useState<number>(500); // Default to all Italy so all stations show
  const [sortBy, setSortBy] = useState<'distance' | 'price' | 'rating'>('price');
  const [onlyOpen24h, setOnlyOpen24h] = useState(false);
  const [onlyWithServices, setOnlyWithServices] = useState(false);

  // Update default filter when vehicles or settings change if not manually edited
  useEffect(() => {
    setTypeFilter(defaultCategoryFilter);
  }, [defaultCategoryFilter]);

  // Selected Station for detail card
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);

  // Helper to extract minimum relevant price for sorting, badges and color classification
  const getMinPrice = (station: Station): { price: number; label: string; unit: string; fuelCategory: 'fuel' | 'ev' } => {
    if ((station.type === 'ev' || typeFilter === 'ev') && station.evPlugs && station.evPlugs.length > 0) {
      const minEv = Math.min(...station.evPlugs.map(p => p.pricePerKwh));
      return { price: minEv, label: 'EV', unit: '€/kWh', fuelCategory: 'ev' };
    }
    if (station.fuelPrices && station.fuelPrices.length > 0) {
      if (specificFuelFilter !== 'all') {
        const matched = station.fuelPrices.filter(p => p.fuel === specificFuelFilter);
        if (matched.length > 0) {
          const selfP = matched.find(m => m.isSelf);
          const p = selfP ? selfP.price : matched[0].price;
          return { price: p, label: specificFuelFilter, unit: '€/L', fuelCategory: 'fuel' };
        }
      }
      // default self benzina or diesel
      const selfBenz = station.fuelPrices.find(p => p.fuel === 'Benzina' && p.isSelf);
      const selfDiesel = station.fuelPrices.find(p => p.fuel === 'Diesel' && p.isSelf);
      const chosen = selfBenz || selfDiesel || station.fuelPrices[0];
      return { price: chosen.price, label: chosen.fuel, unit: '€/L', fuelCategory: 'fuel' };
    }
    if (station.evPlugs && station.evPlugs.length > 0) {
      const minEv = Math.min(...station.evPlugs.map(p => p.pricePerKwh));
      return { price: minEv, label: 'EV', unit: '€/kWh', fuelCategory: 'ev' };
    }
    return { price: 0, label: '', unit: '', fuelCategory: 'fuel' };
  };

  // Compute price ranges for chromatic price color scale (Green = Cheap, Amber = Average, Red = Expensive)
  const priceColorClass = (price: number, category: 'fuel' | 'ev') => {
    if (!price || price <= 0) return { bg: 'bg-slate-800', text: 'text-white', border: 'border-slate-700', level: 'normal', badge: 'bg-slate-100 text-slate-800' };
    
    if (category === 'fuel') {
      // Fuel price scale in Italy (e.g. 1.65 - 1.75 = cheap, 1.76 - 1.83 = medium, >1.84 = high/servito)
      if (price <= 1.745) {
        return { 
          bg: 'bg-emerald-600', 
          hoverBg: 'hover:bg-emerald-700',
          text: 'text-white', 
          border: 'border-emerald-300', 
          level: 'conveniente',
          badge: 'bg-emerald-100 text-emerald-800 border border-emerald-200'
        };
      }
      if (price <= 1.800) {
        return { 
          bg: 'bg-amber-600', 
          hoverBg: 'hover:bg-amber-700',
          text: 'text-white', 
          border: 'border-amber-300', 
          level: 'nella media',
          badge: 'bg-amber-100 text-amber-800 border border-amber-200'
        };
      }
      return { 
        bg: 'bg-rose-600', 
        hoverBg: 'hover:bg-rose-700',
        text: 'text-white', 
        border: 'border-rose-300', 
        level: 'più caro',
        badge: 'bg-rose-100 text-rose-800 border border-rose-200'
      };
    } else {
      // EV price per kWh scale (<0.48 = cheap/Supercharger, 0.49 - 0.61 = normal AC/Fast, >0.62 = Ultra-fast high)
      if (price <= 0.46) {
        return { 
          bg: 'bg-emerald-600', 
          hoverBg: 'hover:bg-emerald-700',
          text: 'text-white', 
          border: 'border-emerald-300', 
          level: 'ottimo prezzo',
          badge: 'bg-emerald-100 text-emerald-800 border border-emerald-200'
        };
      }
      if (price <= 0.59) {
        return { 
          bg: 'bg-teal-600', 
          hoverBg: 'hover:bg-teal-700',
          text: 'text-white', 
          border: 'border-teal-300', 
          level: 'standard',
          badge: 'bg-teal-100 text-teal-800 border border-teal-200'
        };
      }
      return { 
        bg: 'bg-indigo-600', 
        hoverBg: 'hover:bg-indigo-700',
        text: 'text-white', 
        border: 'border-indigo-300', 
        level: 'ultra-fast',
        badge: 'bg-indigo-100 text-indigo-800 border border-indigo-200'
      };
    }
  };

  // Request browser GPS location
  const handleRequestLocation = (alertOnError = true) => {
    if (!navigator.geolocation) {
      if (alertOnError) setLocationStatus('Geolocalizzazione non supportata dal browser');
      return;
    }

    setIsLocating(true);
    setLocationStatus('Rilevamento posizione in corso...');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        };
        setUserLocation(coords);
        setIsLocating(false);
        setLocationStatus('Posizione GPS rilevata');
        setTimeout(() => setLocationStatus(''), 3000);

        // Fetch all local MIMIT stations around user
        fetchAreaStations({ lat: coords.lat, lng: coords.lng, radius: 35 });

        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([coords.lat, coords.lng], 13, { duration: 1.2 });
        }
      },
      (err) => {
        setIsLocating(false);
        if (alertOnError) {
          setLocationStatus('Permesso posizione non concesso.');
          setTimeout(() => setLocationStatus(''), 3500);
        }
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Dismiss / decline location prompt permanently for session
  const handleDismissLocationBanner = () => {
    setHasDeclinedLocation(true);
    localStorage.setItem('garage_location_dismissed', 'true');
  };

  // Search city / address via OpenStreetMap Nominatim
  const handleSearchCity = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearchingCity(true);
    setLocationStatus(`Ricerca "${searchQuery}" in corso...`);

    try {
      // Direct search in local database first for fast results
      fetchAreaStations({ q: searchQuery });

      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery + ', Italia')}&limit=1`);
      const data = await res.json();
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        setUserLocation({ lat, lng: lon });
        setLocationStatus(`Mappa centrata su ${data[0].display_name.split(',')[0]}`);
        setTimeout(() => setLocationStatus(''), 4000);

        // Fetch all stations around searched coordinates
        fetchAreaStations({ lat, lng: lon, radius: 35 });

        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([lat, lon], 13, { duration: 1.2 });
        }
      } else {
        setLocationStatus('Località non trovata su OpenStreetMap, ricerca effettuata nel database MIMIT.');
        setTimeout(() => setLocationStatus(''), 4000);
      }
    } catch (err) {
      setLocationStatus('Errore durante la ricerca geografica.');
      setTimeout(() => setLocationStatus(''), 4000);
    } finally {
      setIsSearchingCity(false);
    }
  };

  // Quick preset cities
  const handleSelectPresetCity = (cityName: string, lat: number, lng: number) => {
    setSearchQuery(cityName);
    setUserLocation({ lat, lng });
    fetchAreaStations({ lat, lng, radius: 40 });
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([lat, lng], 13, { duration: 1.2 });
    }
  };

  // Calculate stations with distance to user location
  const processedStations = useMemo(() => {
    const baseLat = userLocation?.lat ?? 45.4642; // default Milan if no GPS
    const baseLng = userLocation?.lng ?? 9.1900;

    return (liveStations.length > 0 ? liveStations : SEED_STATIONS).map(st => {
      const dist = calculateDistanceKm(baseLat, baseLng, st.lat, st.lng);
      return {
        ...st,
        distanceKm: dist
      };
    });
  }, [userLocation, liveStations]);

  // Filtered and sorted stations (Showing ALL unless restricted by filters)
  const filteredStations = useMemo(() => {
    return processedStations.filter(st => {
      // Type filter
      if (typeFilter !== 'all') {
        if (typeFilter === 'fuel' && st.type === 'ev') return false;
        if (typeFilter === 'ev' && st.type === 'fuel' && (!st.evPlugs || st.evPlugs.length === 0)) return false;
        if (typeFilter === 'both' && st.type !== 'both') return false;
      }

      // Specific fuel
      if (specificFuelFilter !== 'all') {
        if (specificFuelFilter === 'Elettrico (Tutte)') {
          if (!st.evPlugs || st.evPlugs.length === 0) return false;
        } else if (specificFuelFilter === 'Fast DC (>100kW)') {
          if (!st.evPlugs || !st.evPlugs.some(p => p.powerKw >= 100)) return false;
        } else if (specificFuelFilter === 'Tesla Supercharger') {
          if (!st.evPlugs || !st.evPlugs.some(p => p.type === 'Tesla Supercharger')) return false;
        } else {
          if (!st.fuelPrices || !st.fuelPrices.some(p => p.fuel === specificFuelFilter)) return false;
        }
      }

      // Brand filter
      if (brandFilter !== 'all' && st.brand.toLowerCase() !== brandFilter.toLowerCase()) {
        return false;
      }

      // Max Distance
      if (maxDistanceKm < 500 && st.distanceKm && st.distanceKm > maxDistanceKm) {
        return false;
      }

      // 24h filter
      if (onlyOpen24h && !st.isOpen24h) return false;

      // Services
      if (onlyWithServices && !st.hasCarWash && !st.hasBar && !st.hasShop) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'distance') {
        return (a.distanceKm || 0) - (b.distanceKm || 0);
      }
      if (sortBy === 'price') {
        const priceA = getMinPrice(a).price || 999;
        const priceB = getMinPrice(b).price || 999;
        return priceA - priceB;
      }
      if (sortBy === 'rating') {
        return (b.rating || 0) - (a.rating || 0);
      }
      return 0;
    });
  }, [processedStations, typeFilter, specificFuelFilter, brandFilter, maxDistanceKm, sortBy, onlyOpen24h, onlyWithServices]);

  // Lowest price in active filter (for absolute best badge)
  const lowestPriceStationId = useMemo(() => {
    if (filteredStations.length === 0) return null;
    let minP = Infinity;
    let bestId = null;
    filteredStations.forEach(st => {
      const p = getMinPrice(st).price;
      if (p > 0 && p < minP) {
        minP = p;
        bestId = st.id;
      }
    });
    return bestId;
  }, [filteredStations, specificFuelFilter]);

  // Active filters count for the button badge
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (typeFilter !== 'all') count++;
    if (specificFuelFilter !== 'all') count++;
    if (brandFilter !== 'all') count++;
    if (maxDistanceKm < 500) count++;
    if (onlyOpen24h) count++;
    if (onlyWithServices) count++;
    return count;
  }, [typeFilter, specificFuelFilter, brandFilter, maxDistanceKm, onlyOpen24h, onlyWithServices]);

  // Copy GPS Coordinates / Full Address to Clipboard
  const handleCopyNavigation = (station: Station) => {
    const textToCopy = `${station.name}, ${station.address}, ${station.city} (${station.lat.toFixed(6)}, ${station.lng.toFixed(6)})`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedStationId(station.id);
    setTimeout(() => setCopiedStationId(null), 3000);
  };

  // INITIALIZE LEAFLET MAP
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const initialLat = userLocation?.lat ?? 45.4642;
      const initialLng = userLocation?.lng ?? 9.1900;

      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: 11,
        zoomControl: false
      });

      // CartoDB Positron tiles (super clean, modern and performant)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(map);

      // Add zoom control in top right
      L.control.zoom({ position: 'topright' }).addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      markersGroupRef.current = markersGroup;
      mapInstanceRef.current = map;

      // Listen to map pan/zoom to dynamically load real MIMIT stations and handle clustering at different zoom levels
      let moveTimeout: any = null;
      map.on('moveend', () => {
        clearTimeout(moveTimeout);
        moveTimeout = setTimeout(() => {
          const z = map.getZoom();
          setCurrentZoom(z);
          const bounds = map.getBounds();
          if (z >= 8) {
            const boundsStr = `${bounds.getSouth().toFixed(4)},${bounds.getWest().toFixed(4)},${bounds.getNorth().toFixed(4)},${bounds.getEast().toFixed(4)}`;
            fetchAreaStations({ bounds: boundsStr });
          } else {
            const c = map.getCenter();
            fetchAreaStations({ lat: c.lat, lng: c.lng, radius: 50 });
          }
        }, 350);
      });
      map.on('zoomend', () => {
        setCurrentZoom(map.getZoom());
      });
    }

    const resizeObserver = new ResizeObserver(() => {
      mapInstanceRef.current?.invalidateSize();
    });
    resizeObserver.observe(mapContainerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // UPDATE USER LOCATION MARKER
  useEffect(() => {
    if (!mapInstanceRef.current || !userLocation) return;

    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
    }

    const userHtml = `
      <div class="relative flex items-center justify-center">
        <div class="absolute w-8 h-8 bg-blue-500/25 rounded-full animate-ping"></div>
        <div class="w-5 h-5 bg-blue-600 border-2 border-white rounded-full shadow-lg flex items-center justify-center text-white text-[9px] font-black">
          •
        </div>
      </div>
    `;

    const userIcon = L.divIcon({
      className: 'custom-user-pin',
      html: userHtml,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    const marker = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
      .addTo(mapInstanceRef.current)
      .bindPopup('<b>📍 La tua posizione selezionata</b>', { offset: [0, -10] });

    userMarkerRef.current = marker;
  }, [userLocation]);

  // UPDATE ALL STATION MARKERS ON MAP WITH INTELLIGENT CLUSTERING AT LOW ZOOMS & COLOR-CODED PINS AT HIGH ZOOMS
  useEffect(() => {
    if (!mapInstanceRef.current || !markersGroupRef.current) return;

    markersGroupRef.current.clearLayers();

    // If zoomed out (e.g. initial view of Italy or whole region zoom < 12), aggregate nearby stations into clean cluster badges
    // When zoomed in (zoom >= 12), show individual detailed price pins with no overlap
    if (currentZoom < 12 && filteredStations.length > 10) {
      // Grid-based clustering calculation
      const gridSize = currentZoom <= 7 ? 1.2 : (currentZoom <= 9 ? 0.45 : (currentZoom <= 10 ? 0.22 : 0.09));
      const clusters: {
        [key: string]: {
          latSum: number;
          lngSum: number;
          stations: Station[];
          minPrice: number;
          hasEv: boolean;
          hasFuel: boolean;
        }
      } = {};

      filteredStations.forEach(st => {
        const gridX = Math.floor(st.lat / gridSize);
        const gridY = Math.floor(st.lng / gridSize);
        const key = `${gridX}_${gridY}`;

        if (!clusters[key]) {
          clusters[key] = {
            latSum: 0,
            lngSum: 0,
            stations: [],
            minPrice: Infinity,
            hasEv: false,
            hasFuel: false
          };
        }

        const cl = clusters[key];
        cl.latSum += st.lat;
        cl.lngSum += st.lng;
        cl.stations.push(st);

        if (st.type === 'ev' || st.type === 'both') cl.hasEv = true;
        if (st.type === 'fuel' || st.type === 'both') cl.hasFuel = true;

        const p = getMinPrice(st).price;
        if (p > 0 && p < cl.minPrice) {
          cl.minPrice = p;
        }
      });

      // Render each cluster badge or individual station if cluster size is 1
      Object.values(clusters).forEach(cl => {
        const count = cl.stations.length;
        const centerLat = cl.latSum / count;
        const centerLng = cl.lngSum / count;

        if (count === 1) {
          const st = cl.stations[0];
          const minInfo = getMinPrice(st);
          const isBestPrice = st.id === lowestPriceStationId;
          const isSelected = selectedStation?.id === st.id;
          const colorScheme = priceColorClass(minInfo.price, minInfo.fuelCategory);

          let iconSymbol = '⛽';
          if (st.type === 'ev') iconSymbol = '⚡';
          if (st.type === 'both') iconSymbol = '⛽⚡';

          const priceText = minInfo.price > 0 ? `€${minInfo.price.toFixed(3).replace('.', ',')}` : st.brand;

          const markerHtml = `
            <div class="custom-station-pin cursor-pointer flex flex-col items-center group ${isSelected ? 'scale-120 z-50' : 'hover:scale-110'} transition-transform">
              <div class="${colorScheme.bg} text-white px-2 py-1 rounded-xl shadow-md border ${isSelected ? 'border-amber-300 ring-3 ring-amber-400' : (isBestPrice ? 'border-emerald-300 ring-2 ring-emerald-400' : 'border-white/90')} text-[11px] font-black tracking-tight whitespace-nowrap flex items-center gap-1">
                <span>${iconSymbol}</span>
                <span>${priceText}</span>
              </div>
              <div class="w-2 h-2 ${colorScheme.bg} rotate-45 -mt-1 shadow-xs border-r border-b border-black/10"></div>
            </div>
          `;

          const customIcon = L.divIcon({
            className: 'custom-station-pin-container',
            html: markerHtml,
            iconSize: [60, 30],
            iconAnchor: [30, 30]
          });

          const marker = L.marker([st.lat, st.lng], { icon: customIcon });
          marker.on('click', () => {
            setSelectedStation(st);
            mapInstanceRef.current?.panTo([st.lat, st.lng], { animate: true, duration: 0.5 });
          });
          markersGroupRef.current?.addLayer(marker);
        } else {
          // Clustered bubble icon with station count & min price tag
          let typeIcon = '⛽';
          if (cl.hasEv && cl.hasFuel) typeIcon = '⛽⚡';
          else if (cl.hasEv) typeIcon = '⚡';

          const priceBadge = cl.minPrice !== Infinity 
            ? `<div class="bg-white/95 text-slate-900 px-1.5 py-0.5 rounded-full text-[10px] font-black shadow-xs border border-slate-200 whitespace-nowrap">da €${cl.minPrice.toFixed(3).replace('.', ',')}</div>`
            : '';

          const clusterHtml = `
            <div class="custom-cluster-badge cursor-pointer flex flex-col items-center group transition-all duration-200">
              <div class="bg-gradient-to-br from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white rounded-2xl px-2.5 py-1.5 shadow-lg border-2 border-white flex items-center gap-1.5 ring-2 ring-blue-500/30">
                <span class="text-xs">${typeIcon}</span>
                <span class="text-xs font-black tracking-tight">${count} stazioni</span>
              </div>
              ${priceBadge ? `<div class="-mt-1 z-10">${priceBadge}</div>` : ''}
            </div>
          `;

          const clusterIcon = L.divIcon({
            className: 'custom-cluster-container',
            html: clusterHtml,
            iconSize: [80, 42],
            iconAnchor: [40, 21]
          });

          const clusterMarker = L.marker([centerLat, centerLng], { icon: clusterIcon });
          
          // Clicking cluster zooms in smoothly towards that city/area
          clusterMarker.on('click', () => {
            const nextZoom = Math.min(currentZoom + 3, 15);
            mapInstanceRef.current?.flyTo([centerLat, centerLng], nextZoom, { duration: 0.8 });
          });

          markersGroupRef.current?.addLayer(clusterMarker);
        }
      });
    } else {
      // Zoom >= 12: High-resolution individual station markers with complete price tags
      filteredStations.forEach(st => {
        const minInfo = getMinPrice(st);
        const isBestPrice = st.id === lowestPriceStationId;
        const isSelected = selectedStation?.id === st.id;
        const colorScheme = priceColorClass(minInfo.price, minInfo.fuelCategory);

        let iconSymbol = '⛽';
        if (st.type === 'ev') iconSymbol = '⚡';
        if (st.type === 'both') iconSymbol = '⛽⚡';

        const priceText = minInfo.price > 0 ? `€${minInfo.price.toFixed(3).replace('.', ',')}` : st.brand;

        const markerHtml = `
          <div class="custom-station-pin cursor-pointer flex flex-col items-center group ${isSelected ? 'scale-120 z-50' : 'hover:scale-110'} transition-transform">
            <div class="${colorScheme.bg} text-white px-2 py-1 rounded-xl shadow-md border ${isSelected ? 'border-amber-300 ring-3 ring-amber-400' : (isBestPrice ? 'border-emerald-300 ring-2 ring-emerald-400' : 'border-white/90')} text-[11px] font-black tracking-tight whitespace-nowrap flex items-center gap-1">
              <span>${iconSymbol}</span>
              <span>${priceText}</span>
            </div>
            <div class="w-2 h-2 ${colorScheme.bg} rotate-45 -mt-1 shadow-xs border-r border-b border-black/10"></div>
          </div>
        `;

        const customIcon = L.divIcon({
          className: 'custom-station-pin-container',
          html: markerHtml,
          iconSize: [60, 30],
          iconAnchor: [30, 30]
        });

        const marker = L.marker([st.lat, st.lng], { icon: customIcon });

        marker.on('click', () => {
          setSelectedStation(st);
          mapInstanceRef.current?.panTo([st.lat, st.lng], { animate: true, duration: 0.5 });
        });

        markersGroupRef.current?.addLayer(marker);
      });
    }
  }, [filteredStations, selectedStation, lowestPriceStationId, currentZoom]);

  return (
    <div className="flex flex-col gap-4 w-full font-['Plus_Jakarta_Sans',sans-serif]">

      {/* 1. TOP POSITION & CITY SEARCH BAR (SOPRA LA MAPPA) */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-4 border border-[#e2e8f0] shadow-xs flex flex-col gap-2.5">
        
        {/* ROW 1: SEARCH BAR + COMPACT FILTERS & SYNC ICONS */}
        <div className="flex items-center gap-1.5 sm:gap-2 w-full">
          
          {/* SEARCH CITY OR ADDRESS */}
          <form onSubmit={handleSearchCity} className="flex-1 relative flex items-center min-w-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none shrink-0" />
            <input 
              type="text"
              id="input-search-stations-city"
              placeholder="Cerca città o CAP (es. Milano, Roma, A1...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#f8fafc] border border-[#cbd5e1] focus:border-[#2563eb] focus:bg-white text-xs font-medium text-[#0f172a] pl-9 pr-14 py-2 rounded-xl sm:rounded-2xl outline-hidden transition-all shadow-2xs"
            />
            <button
              type="submit"
              disabled={isSearchingCity}
              className="absolute right-1 top-1 bottom-1 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold px-2.5 rounded-lg sm:rounded-xl transition-all cursor-pointer flex items-center justify-center shrink-0"
            >
              {isSearchingCity ? <RefreshCw className="w-3 h-3 animate-spin" /> : <span>Cerca</span>}
            </button>
          </form>

          {/* FILTERS BUTTON (SOLO ICONA / LOGO AFFIANCATO AL CERCA) */}
          <button
            type="button"
            id="btn-toggle-station-filters"
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            title="Filtri carburante, marchio e raggio"
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 border transition-all cursor-pointer relative shadow-2xs ${
              isFiltersOpen || activeFiltersCount > 0
                ? 'bg-blue-50 border-blue-400 text-[#2563eb] ring-2 ring-blue-100'
                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            {activeFiltersCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#2563eb] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs border-2 border-white">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* REFRESH / SYNC BUTTON (COMPATTO) */}
          <button
            type="button"
            id="btn-sync-stations-live"
            onClick={handleManualSync}
            disabled={isSyncingLive}
            title="Aggiorna listini MIMIT e colonnine adesso"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-all cursor-pointer shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isSyncingLive ? 'animate-spin' : ''}`} />
          </button>

        </div>

        {/* ROW 2: PRESET CITIES SHORTCUTS & COMPACT STATUS */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-0.5 text-xs no-scrollbar">
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap mr-0.5">Città:</span>
            {[
              { name: 'Milano', lat: 45.4642, lng: 9.1900 },
              { name: 'Roma', lat: 41.9028, lng: 12.4964 },
              { name: 'Napoli', lat: 40.8518, lng: 14.2681 },
              { name: 'Torino', lat: 45.0703, lng: 7.6869 },
              { name: 'Palermo', lat: 38.1157, lng: 13.3615 },
              { name: 'Genova', lat: 44.4056, lng: 8.9463 },
              { name: 'Bologna', lat: 44.4949, lng: 11.3426 },
              { name: 'Firenze', lat: 43.7696, lng: 11.2558 },
              { name: 'Bari', lat: 41.1171, lng: 16.8719 },
              { name: 'Catania', lat: 37.5079, lng: 15.0830 },
              { name: 'Verona (Affi)', lat: 45.5532, lng: 10.7712 },
              { name: 'Venezia', lat: 45.4408, lng: 12.3155 },
              { name: 'Brescia', lat: 45.5416, lng: 10.2118 },
              { name: 'Cagliari', lat: 39.2238, lng: 9.1217 }
            ].map(c => (
              <button
                key={c.name}
                type="button"
                onClick={() => handleSelectPresetCity(c.name, c.lat, c.lng)}
                className={`px-2 py-0.5 rounded-lg text-[11px] font-bold border transition-all shrink-0 cursor-pointer ${
                  searchQuery === c.name 
                    ? 'bg-blue-50 border-blue-300 text-[#2563eb] shadow-2xs' 
                    : 'bg-[#f8fafc] border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[9px] sm:text-[10px] font-extrabold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded-md flex items-center gap-1">
              🏛️ {totalDbCount.toLocaleString('it-IT')} Stazioni MIMIT
            </span>
            {lastSyncTime && (
              <span className="text-[9px] sm:text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></span>
                {lastSyncTime}
              </span>
            )}
          </div>
        </div>

        {/* OPTIONAL GEOLOCATION PROMPT BANNER (PUÒ ESSERE RIFIUTATO E NASCOSTO) */}
        {!hasDeclinedLocation && !userLocation && (
          <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl sm:rounded-2xl flex items-center justify-between gap-2 text-xs animate-in fade-in">
            <div className="flex items-center gap-2 text-slate-700 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-blue-100 text-[#2563eb] flex items-center justify-center shrink-0">
                <LocateFixed className="w-3.5 h-3.5" />
              </div>
              <span className="truncate text-[11px]">
                Attiva GPS per calcolare la distanza esatta dai distributori
              </span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => handleRequestLocation(true)}
                disabled={isLocating}
                className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all shadow-2xs"
              >
                {isLocating ? 'Rilevo...' : 'Consenti'}
              </button>
              <button
                type="button"
                onClick={handleDismissLocationBanner}
                className="bg-white hover:bg-slate-200 text-slate-600 border border-slate-200 text-[11px] font-bold px-2 py-1 rounded-lg transition-all"
                title="Non mostrare più"
              >
                Rifiuta
              </button>
            </div>
          </div>
        )}

        {/* STATUS MESSAGE IF ANY */}
        {locationStatus && (
          <div className="bg-blue-50/80 border border-blue-200 text-[#2563eb] px-3 py-1.5 rounded-xl text-xs font-bold flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 shrink-0" />
              <span className="text-[11px]">{locationStatus}</span>
            </div>
            <button type="button" onClick={() => setLocationStatus('')} className="p-0.5 hover:bg-blue-100 rounded-lg">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

      </div>

      {/* 2. EXPANDABLE FILTERS PANEL (RACCHIUSO NEL TASTO FILTRI) */}
      {isFiltersOpen && (
        <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-blue-200 shadow-lg flex flex-col gap-3.5 animate-in fade-in slide-in-from-top-2 duration-150">
          
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-[#2563eb]" />
              <span className="text-xs font-black uppercase text-[#0f172a] tracking-wider">Filtri di Ricerca</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setTypeFilter('all');
                setSpecificFuelFilter('all');
                setBrandFilter('all');
                setMaxDistanceKm(500);
                setOnlyOpen24h(false);
                setOnlyWithServices(false);
              }}
              className="text-[11px] font-bold text-[#2563eb] hover:underline cursor-pointer"
            >
              Ripristina Filtri
            </button>
          </div>

          {/* MAIN CATEGORY TABS */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">
              Tipologia Stazione
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2">
              {[
                { id: 'all', label: 'Tutto', icon: Sparkles },
                { id: 'fuel', label: 'Carburante', icon: Fuel },
                { id: 'ev', label: 'Colonnine EV', icon: Zap },
                { id: 'both', label: 'Ibridi / Dual', icon: PlusCircle }
              ].map(tab => {
                const Icon = tab.icon;
                const isActive = typeFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setTypeFilter(tab.id as any)}
                    className={`flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-blue-50 text-[#2563eb] border-blue-300 shadow-2xs' 
                        : 'bg-[#f8fafc] text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#2563eb]' : 'text-slate-400'}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SPECIFIC FUEL, BRAND, DISTANCE, SORT */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            
            {/* Specific Fuel */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">
                Carburante / Spina
              </label>
              <select
                value={specificFuelFilter}
                onChange={(e) => setSpecificFuelFilter(e.target.value)}
                className="bg-[#f8fafc] border border-[#cbd5e1] rounded-xl px-2.5 py-1.5 text-xs font-bold text-[#0f172a] outline-hidden cursor-pointer"
              >
                <option value="all">Tutti i carburanti</option>
                <option value="Benzina">Benzina (SP95)</option>
                <option value="Diesel">Gasolio (Diesel)</option>
                <option value="GPL">GPL</option>
                <option value="Metano">Metano (CNG)</option>
                <option value="Elettrico (Tutte)">Elettrico: Tutte le Colonnine</option>
                <option value="Fast DC (>100kW)">Elettrico: Fast DC (&gt;100 kW)</option>
                <option value="Tesla Supercharger">Tesla Supercharger (V3/V4)</option>
              </select>
            </div>

            {/* Brand */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">
                Compagnia / Rete
              </label>
              <select
                value={brandFilter}
                onChange={(e) => setBrandFilter(e.target.value)}
                className="bg-[#f8fafc] border border-[#cbd5e1] rounded-xl px-2.5 py-1.5 text-xs font-bold text-[#0f172a] outline-hidden cursor-pointer"
              >
                <option value="all">Tutte le compagnie</option>
                <option value="Eni">Eni Live / Eni</option>
                <option value="Q8">Q8 / Q8 Easy</option>
                <option value="IP">IP Gruppo api</option>
                <option value="Tamoil">Tamoil</option>
                <option value="Tesla">Tesla Supercharger</option>
                <option value="Enel X Way">Enel X Way</option>
                <option value="Be Charge">Be Charge (Plenitude)</option>
                <option value="Free To X">Free To X (Autostrade)</option>
              </select>
            </div>

            {/* Sort */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">
                Ordinamento
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-[#f8fafc] border border-[#cbd5e1] rounded-xl px-2.5 py-1.5 text-xs font-bold text-[#0f172a] outline-hidden cursor-pointer"
              >
                <option value="price">Prezzo più Basso</option>
                <option value="distance">Distanza (Più Vicino)</option>
                <option value="rating">Miglior Valutazione</option>
              </select>
            </div>

          </div>

          {/* CHECKBOXES & CLOSE */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2.5 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-3 text-slate-700 font-bold">
              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={onlyOpen24h}
                  onChange={(e) => setOnlyOpen24h(e.target.checked)}
                  className="w-4 h-4 rounded-md text-[#2563eb] accent-[#2563eb]"
                />
                <span className="text-[11px]">Aperto 24h</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={onlyWithServices}
                  onChange={(e) => setOnlyWithServices(e.target.checked)}
                  className="w-4 h-4 rounded-md text-[#2563eb] accent-[#2563eb]"
                />
                <span className="text-[11px]">Bar / Lavaggio</span>
              </label>
            </div>

            <button
              type="button"
              onClick={() => setIsFiltersOpen(false)}
              className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all shadow-2xs"
            >
              Applica ({filteredStations.length})
            </button>
          </div>

        </div>
      )}

      {/* 3. COLOR LEGEND BAR FOR PRICES (COMPATTA) */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-white rounded-xl sm:rounded-2xl border border-slate-200 text-[10px] sm:text-[11px] font-bold text-slate-600 overflow-x-auto gap-2.5 no-scrollbar">
        <span className="text-slate-400 whitespace-nowrap">Prezzi:</span>
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0"></span>
            <span>Conveniente</span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-600 shrink-0"></span>
            <span>Medio</span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 shrink-0"></span>
            <span>Alto</span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-600 shrink-0"></span>
            <span>Colonnina EV</span>
          </div>
        </div>
      </div>

      {/* 4. MAIN MAP & LIST GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-5 min-h-[460px]">
        
        {/* MAP CONTAINER */}
        <div className="lg:col-span-7 bg-white rounded-2xl sm:rounded-3xl p-2 sm:p-2.5 border border-[#e2e8f0] shadow-xs flex flex-col relative overflow-hidden h-[340px] sm:h-[460px] lg:h-[600px]">
          
          <div 
            ref={mapContainerRef} 
            className="w-full h-full rounded-xl sm:rounded-2xl z-10"
          />

          {/* Map Overlay Badge */}
          <div className="absolute top-4 left-4 z-20 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-xl border border-slate-200 shadow-xs flex items-center gap-1.5 pointer-events-none">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[10px] sm:text-[11px] font-black text-[#0f172a]">{filteredStations.length} distributori</span>
          </div>

          {/* Loading indicator when panning/fetching */}
          {isLoadingAreaStations && (
            <div className="absolute top-4 right-4 z-20 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-xl border border-slate-200 shadow-xs flex items-center gap-1.5 pointer-events-none text-[10px] font-bold text-blue-600">
              <RefreshCw className="w-3 h-3 animate-spin" />
              <span>Caricamento area...</span>
            </div>
          )}

          {/* Map Controls Floating Helper */}
          <div className="absolute bottom-3 left-3 right-3 z-20 pointer-events-none flex justify-center">
            <div className="bg-slate-900/80 backdrop-blur-md text-white text-[10px] sm:text-[11px] font-medium px-3 py-1.5 rounded-xl shadow-md border border-white/10 flex items-center gap-1.5 text-center">
              <Info className="w-3 h-3 text-blue-400 shrink-0" />
              <span>Tocca un distributore per listino e navigazione</span>
            </div>
          </div>

        </div>

        {/* LIST / DETAIL SIDEBAR (5 COLS ON DESKTOP) */}
        <div className="lg:col-span-5 flex flex-col gap-3 sm:gap-4">

          {/* IF A STATION IS SELECTED: SHOW RICH DETAIL CARD */}
          {selectedStation ? (
            <div className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 border-2 border-blue-500 shadow-md flex flex-col gap-3 animate-in fade-in slide-in-from-top-2">
              
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl flex items-center justify-center border shadow-2xs shrink-0 ${
                    selectedStation.type === 'ev' 
                      ? 'bg-teal-50 text-teal-600 border-teal-100' 
                      : 'bg-blue-50 text-[#2563eb] border-blue-100'
                  }`}>
                    {selectedStation.type === 'ev' ? <Zap className="w-5 h-5" /> : <Fuel className="w-5 h-5" />}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm sm:text-base font-black text-[#0f172a] leading-tight truncate">
                      {selectedStation.name}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{selectedStation.address}, {selectedStation.city}</span>
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedStation(null)}
                  className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Distance & Badges */}
              <div className="flex flex-wrap items-center gap-1.5">
                {selectedStation.distanceKm !== undefined && (
                  <span className="bg-blue-50 text-[#2563eb] border border-blue-200 px-2 py-0.5 rounded-lg text-[11px] font-black">
                    📍 {selectedStation.distanceKm} km
                  </span>
                )}
                {selectedStation.isOpen24h && (
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-lg text-[10px] font-bold">
                    24/7
                  </span>
                )}
                {selectedStation.rating && (
                  <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-lg text-[10px] font-bold flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                    <span>{selectedStation.rating}</span>
                  </span>
                )}
                {selectedStation.hasCarWash && (
                  <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded-md text-[10px] font-bold">
                    🧼 Lavaggio
                  </span>
                )}
                {selectedStation.hasBar && (
                  <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded-md text-[10px] font-bold">
                    ☕ Bar
                  </span>
                )}
              </div>

              {/* PRICE LIST TABLE */}
              <div className="bg-[#f8fafc] rounded-2xl p-3.5 border border-slate-200 flex flex-col gap-2.5">
                <span className="text-[11px] font-black uppercase text-slate-500 tracking-wider">
                  Listino Prezzi Rilevati
                </span>

                {/* Fuel Prices */}
                {selectedStation.fuelPrices && selectedStation.fuelPrices.length > 0 && (
                  <div className="flex flex-col gap-1.5">
                    {selectedStation.fuelPrices.map((fp, i) => {
                      const col = priceColorClass(fp.price, 'fuel');
                      return (
                        <div key={i} className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-slate-100 shadow-2xs">
                          <div className="flex items-center gap-2">
                            <span className={`w-2.5 h-2.5 rounded-full ${col.bg}`}></span>
                            <span className="text-xs font-bold text-[#0f172a]">{fp.fuel}</span>
                            <span className="text-[10px] text-slate-400 font-medium">{fp.isSelf ? '(Self)' : '(Servito)'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-[#0f172a]">
                              € {fp.price.toFixed(3).replace('.', ',')} / L
                            </span>
                            {onOpenRefuelWithStation && (
                              <button
                                type="button"
                                onClick={() => onOpenRefuelWithStation(selectedStation, { price: fp.price, type: (fp.fuel === 'GPL' ? 'lpg' : (fp.fuel === 'Metano' ? 'cng' : 'fuel')), name: `${selectedStation.name} (${fp.fuel})` })}
                                title="Registra rifornimento con questo prezzo"
                                className="bg-blue-50 hover:bg-blue-100 text-[#2563eb] text-[10px] font-black px-2 py-1 rounded-lg border border-blue-200 transition-all cursor-pointer"
                              >
                                Registra
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* EV Plugs */}
                {selectedStation.evPlugs && selectedStation.evPlugs.length > 0 && (
                  <div className="flex flex-col gap-1.5 mt-1">
                    {selectedStation.evPlugs.map((ep, i) => {
                      const col = priceColorClass(ep.pricePerKwh, 'ev');
                      return (
                        <div key={i} className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-teal-100 shadow-2xs">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1.5">
                              <Zap className="w-3.5 h-3.5 text-teal-600" />
                              <span className="text-xs font-bold text-[#0f172a]">{ep.type}</span>
                            </div>
                            <span className="text-[10px] text-teal-600 font-extrabold">{ep.powerKw} kW ({ep.availableCount}/{ep.totalCount} libere)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-[#0f172a]">
                              € {ep.pricePerKwh.toFixed(2).replace('.', ',')} / kWh
                            </span>
                            {onOpenRefuelWithStation && (
                              <button
                                type="button"
                                onClick={() => onOpenRefuelWithStation(selectedStation, { price: ep.pricePerKwh, type: 'electricity', name: `${selectedStation.name} (${ep.type})` })}
                                title="Registra ricarica con questo prezzo"
                                className="bg-teal-50 hover:bg-teal-100 text-teal-700 text-[10px] font-black px-2 py-1 rounded-lg border border-teal-200 transition-all cursor-pointer"
                              >
                                Ricarica
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

              </div>

              {/* ACTION BUTTONS & SIMPLE NAVIGATION COPY COMMAND */}
              <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {/* DIRECT GOOGLE MAPS LINK */}
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${selectedStation.lat},${selectedStation.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-bold py-2.5 px-3 rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5"
                    title="Apri itinerario su Google Maps con traffico in tempo reale"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Google Maps</span>
                  </a>

                  {/* DIRECT WAZE LINK */}
                  <a
                    href={`https://waze.com/ul?ll=${selectedStation.lat},${selectedStation.lng}&navigate=yes`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#00d8ff] hover:bg-[#00bfe5] text-slate-900 text-xs font-bold py-2.5 px-3 rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5"
                    title="Avvia navigazione su Waze per evitare il traffico e gli autovelox"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Waze</span>
                  </a>

                  {/* SIMPLE COPY BUTTON FOR ANY NAVIGATOR (APPLE MAPS, TOMTOM, NATIVE CAR GPS) */}
                  <button
                    type="button"
                    onClick={() => handleCopyNavigation(selectedStation)}
                    className="col-span-2 sm:col-span-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2.5 px-3 rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    title="Copia l'indirizzo e coordinate esatte per inserirlo nel navigatore dell'auto"
                  >
                    {copiedStationId === selectedStation.id ? (
                      <>
                        <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400 text-[11px]">Copiato!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span className="text-[11px]">Copia GPS</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="bg-slate-50 p-2 rounded-xl text-[11px] text-slate-500 font-medium flex items-center justify-between">
                  <span className="truncate">📍 {selectedStation.address}, {selectedStation.city}</span>
                  <span className="text-[10px] text-slate-400 shrink-0 ml-2">({selectedStation.lat.toFixed(4)}, {selectedStation.lng.toFixed(4)})</span>
                </div>
              </div>

            </div>
          ) : null}

          {/* STATIONS LIST OVERVIEW */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#e2e8f0] shadow-xs flex flex-col gap-3 flex-1 max-h-[620px] overflow-y-auto">
            
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-[#0f172a] tracking-wider flex items-center gap-1.5">
                <Fuel className="w-3.5 h-3.5 text-[#2563eb]" />
                Elenco Completo Distributori & Colonnine ({filteredStations.length})
              </span>
              <span className="text-[10px] text-slate-400 font-bold">
                {sortBy === 'price' ? 'Ordinato per prezzo' : 'Ordinato per distanza'}
              </span>
            </div>

            {filteredStations.length === 0 ? (
              <div className="bg-[#f8fafc] border border-dashed border-slate-200 rounded-2xl p-8 text-center flex flex-col items-center justify-center gap-2">
                <Fuel className="w-8 h-8 text-slate-300" />
                <p className="text-xs font-bold text-slate-600">Nessuna stazione trovata con i filtri selezionati.</p>
                <button
                  type="button"
                  onClick={() => {
                    setTypeFilter('all');
                    setSpecificFuelFilter('all');
                    setBrandFilter('all');
                    setMaxDistanceKm(500);
                  }}
                  className="mt-2 text-xs font-bold text-[#2563eb] hover:underline cursor-pointer"
                >
                  Ripristina tutti i filtri
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {filteredStations.map((st) => {
                  const minInfo = getMinPrice(st);
                  const isSelected = selectedStation?.id === st.id;
                  const isBestPrice = st.id === lowestPriceStationId;
                  const colorScheme = priceColorClass(minInfo.price, minInfo.fuelCategory);

                  return (
                    <div
                      key={st.id}
                      onClick={() => {
                        setSelectedStation(st);
                        mapInstanceRef.current?.flyTo([st.lat, st.lng], 14, { duration: 0.8 });
                      }}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected 
                          ? 'bg-blue-50/50 border-[#2563eb] shadow-xs ring-1 ring-[#2563eb]' 
                          : (isBestPrice 
                              ? 'bg-emerald-50/30 border-emerald-300 hover:border-emerald-400' 
                              : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50')
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center border shrink-0 ${
                          st.type === 'ev' 
                            ? 'bg-teal-50 text-teal-600 border-teal-100' 
                            : 'bg-blue-50 text-[#2563eb] border-blue-100'
                        }`}>
                          {st.type === 'ev' ? <Zap className="w-4 h-4" /> : <Fuel className="w-4 h-4" />}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-xs font-bold text-[#0f172a] truncate">
                              {st.name}
                            </h4>
                            {isBestPrice && (
                              <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-1.5 py-0.5 rounded-md shrink-0 border border-emerald-200">
                                Più Economico
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 truncate">
                            {st.city} ({st.province}) • {st.address}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col items-end shrink-0 gap-0.5">
                        {minInfo.price > 0 && (
                          <span className={`text-xs font-black px-2 py-0.5 rounded-lg ${colorScheme.badge}`}>
                            € {minInfo.price.toFixed(3).replace('.', ',')}
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400 font-bold">
                          {st.distanceKm !== undefined ? `${st.distanceKm} km` : minInfo.unit}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
};
