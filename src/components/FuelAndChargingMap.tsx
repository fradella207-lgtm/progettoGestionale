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
    if (station.type === 'ev' && station.evPlugs && station.evPlugs.length > 0) {
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
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery + ', Italia')}&limit=1`);
      const data = await res.json();
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        setUserLocation({ lat, lng: lon });
        setLocationStatus(`Mappa centrata su ${data[0].display_name.split(',')[0]}`);
        setTimeout(() => setLocationStatus(''), 4000);

        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([lat, lon], 13, { duration: 1.2 });
        }
      } else {
        setLocationStatus('Località non trovata. Prova con un\'altra città.');
        setTimeout(() => setLocationStatus(''), 4000);
      }
    } catch (err) {
      setLocationStatus('Errore di connessione durante la ricerca.');
      setTimeout(() => setLocationStatus(''), 4000);
    } finally {
      setIsSearchingCity(false);
    }
  };

  // Quick preset cities
  const handleSelectPresetCity = (cityName: string, lat: number, lng: number) => {
    setSearchQuery(cityName);
    setUserLocation({ lat, lng });
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([lat, lng], 13, { duration: 1.2 });
    }
  };

  // Calculate stations with distance to user location
  const processedStations = useMemo(() => {
    const baseLat = userLocation?.lat ?? 45.4642; // default Milan if no GPS
    const baseLng = userLocation?.lng ?? 9.1900;

    return SEED_STATIONS.map(st => {
      const dist = calculateDistanceKm(baseLat, baseLng, st.lat, st.lng);
      return {
        ...st,
        distanceKm: dist
      };
    });
  }, [userLocation]);

  // Filtered and sorted stations (Showing ALL unless restricted by filters)
  const filteredStations = useMemo(() => {
    return processedStations.filter(st => {
      // Type filter
      if (typeFilter !== 'all') {
        if (typeFilter === 'fuel' && st.type === 'ev') return false;
        if (typeFilter === 'ev' && st.type === 'fuel') return false;
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

  // UPDATE ALL STATION MARKERS ON MAP WITH COLOR-CODED PRICES
  useEffect(() => {
    if (!mapInstanceRef.current || !markersGroupRef.current) return;

    markersGroupRef.current.clearLayers();

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
  }, [filteredStations, selectedStation, lowestPriceStationId]);

  return (
    <div className="flex flex-col gap-4 w-full font-['Plus_Jakarta_Sans',sans-serif]">

      {/* 1. TOP POSITION & CITY SEARCH BAR (SOPRA LA MAPPA) */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#e2e8f0] shadow-xs flex flex-col gap-3.5">
        
        {/* ROW 1: SEARCH BAR + FILTERS BUTTON */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          
          {/* SEARCH CITY OR ADDRESS */}
          <form onSubmit={handleSearchCity} className="flex-1 relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5" />
            <input 
              type="text"
              id="input-search-stations-city"
              placeholder="Cerca qualsiasi città o CAP (es. Milano, Roma, Torino, Bologna, A1...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#f8fafc] border border-[#cbd5e1] focus:border-[#2563eb] focus:bg-white text-xs font-medium text-[#0f172a] pl-10 pr-20 py-2.5 rounded-2xl outline-hidden transition-all shadow-2xs"
            />
            <button
              type="submit"
              disabled={isSearchingCity}
              className="absolute right-1.5 top-1.5 bottom-1.5 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold px-3 rounded-xl transition-all cursor-pointer flex items-center gap-1"
            >
              {isSearchingCity ? <RefreshCw className="w-3 h-3 animate-spin" /> : <span>Cerca</span>}
            </button>
          </form>

          {/* FILTERS BUTTON (RACCHIUDE TUTTI I FILTRI) */}
          <button
            type="button"
            id="btn-toggle-station-filters"
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold border transition-all cursor-pointer shrink-0 shadow-xs ${
              isFiltersOpen || activeFiltersCount > 0
                ? 'bg-blue-50 border-blue-300 text-[#2563eb]'
                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filtri</span>
            {activeFiltersCount > 0 && (
              <span className="bg-[#2563eb] text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isFiltersOpen ? 'rotate-180' : ''}`} />
          </button>

        </div>

        {/* ROW 2: PRESET CITIES SHORTCUTS */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          <span className="text-[11px] font-bold text-slate-400 whitespace-nowrap mr-1">Città:</span>
          {[
            { name: 'Milano', lat: 45.4642, lng: 9.1900 },
            { name: 'Roma', lat: 41.9028, lng: 12.4964 },
            { name: 'Torino', lat: 45.0703, lng: 7.6869 },
            { name: 'Bologna', lat: 44.4949, lng: 11.3426 },
            { name: 'Firenze', lat: 43.7696, lng: 11.2558 },
            { name: 'Napoli', lat: 40.8518, lng: 14.2681 },
            { name: 'Bari', lat: 41.1171, lng: 16.8719 },
            { name: 'Verona (Affi)', lat: 45.5532, lng: 10.7712 }
          ].map(c => (
            <button
              key={c.name}
              type="button"
              onClick={() => handleSelectPresetCity(c.name, c.lat, c.lng)}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold border transition-all shrink-0 cursor-pointer ${
                searchQuery === c.name 
                  ? 'bg-blue-50 border-blue-300 text-[#2563eb] shadow-2xs' 
                  : 'bg-[#f8fafc] border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* OPTIONAL GEOLOCATION PROMPT BANNER (PUÒ ESSERE RIFIUTATO E NASCOSTO) */}
        {!hasDeclinedLocation && !userLocation && (
          <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl flex items-center justify-between gap-3 text-xs animate-in fade-in">
            <div className="flex items-center gap-2.5 text-slate-700 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-[#2563eb] flex items-center justify-center shrink-0">
                <LocateFixed className="w-4 h-4" />
              </div>
              <span className="truncate">
                Vuoi attivare la posizione per calcolare la distanza esatta dai distributori?
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => handleRequestLocation(true)}
                disabled={isLocating}
                className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-all shadow-2xs"
              >
                {isLocating ? 'Rilevamento...' : 'Consenti'}
              </button>
              <button
                type="button"
                onClick={handleDismissLocationBanner}
                className="bg-white hover:bg-slate-200 text-slate-600 border border-slate-200 text-xs font-bold px-2.5 py-1.5 rounded-xl transition-all"
                title="Non mostrare più"
              >
                Rifiuta
              </button>
            </div>
          </div>
        )}

        {/* STATUS MESSAGE IF ANY */}
        {locationStatus && (
          <div className="bg-blue-50/80 border border-blue-200 text-[#2563eb] px-3.5 py-2 rounded-xl text-xs font-bold flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 shrink-0" />
              <span>{locationStatus}</span>
            </div>
            <button type="button" onClick={() => setLocationStatus('')} className="p-1 hover:bg-blue-100 rounded-lg">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

      </div>

      {/* 2. EXPANDABLE FILTERS PANEL (RACCHIUSO NEL TASTO FILTRI) */}
      {isFiltersOpen && (
        <div className="bg-white rounded-3xl p-5 border border-blue-200 shadow-lg flex flex-col gap-4 animate-in fade-in slide-in-from-top-2 duration-150">
          
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
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
              className="text-xs font-bold text-[#2563eb] hover:underline"
            >
              Ripristina Filtri
            </button>
          </div>

          {/* MAIN CATEGORY TABS */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-extrabold uppercase text-slate-500 tracking-wider">
              Tipologia Stazione
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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
                    className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-black border transition-all cursor-pointer ${
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            
            {/* Specific Fuel */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-extrabold uppercase text-slate-500 tracking-wider">
                Carburante / Spina
              </label>
              <select
                value={specificFuelFilter}
                onChange={(e) => setSpecificFuelFilter(e.target.value)}
                className="bg-[#f8fafc] border border-[#cbd5e1] rounded-xl px-3 py-2 text-xs font-bold text-[#0f172a] outline-hidden cursor-pointer"
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
              <label className="text-[11px] font-extrabold uppercase text-slate-500 tracking-wider">
                Compagnia / Rete
              </label>
              <select
                value={brandFilter}
                onChange={(e) => setBrandFilter(e.target.value)}
                className="bg-[#f8fafc] border border-[#cbd5e1] rounded-xl px-3 py-2 text-xs font-bold text-[#0f172a] outline-hidden cursor-pointer"
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
              <label className="text-[11px] font-extrabold uppercase text-slate-500 tracking-wider">
                Ordinamento
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-[#f8fafc] border border-[#cbd5e1] rounded-xl px-3 py-2 text-xs font-bold text-[#0f172a] outline-hidden cursor-pointer"
              >
                <option value="price">Prezzo più Basso</option>
                <option value="distance">Distanza (Più Vicino)</option>
                <option value="rating">Miglior Valutazione</option>
              </select>
            </div>

          </div>

          {/* CHECKBOXES & CLOSE */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-4 text-slate-700 font-bold">
              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={onlyOpen24h}
                  onChange={(e) => setOnlyOpen24h(e.target.checked)}
                  className="w-4 h-4 rounded-md text-[#2563eb] accent-[#2563eb]"
                />
                <span>Aperto 24h</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={onlyWithServices}
                  onChange={(e) => setOnlyWithServices(e.target.checked)}
                  className="w-4 h-4 rounded-md text-[#2563eb] accent-[#2563eb]"
                />
                <span>Bar / Autolavaggio</span>
              </label>
            </div>

            <button
              type="button"
              onClick={() => setIsFiltersOpen(false)}
              className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-bold px-4 py-2 rounded-xl transition-all"
            >
              Applica Filtri ({filteredStations.length} stazioni)
            </button>
          </div>

        </div>
      )}

      {/* 3. COLOR LEGEND BAR FOR PRICES (COLORI PER DISTINGUERE I PREZZI) */}
      <div className="flex items-center justify-between px-3 py-2 bg-white rounded-2xl border border-slate-200 text-[11px] font-bold text-slate-600 overflow-x-auto gap-3">
        <span className="text-slate-400 whitespace-nowrap">Legenda Prezzi:</span>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-600 shrink-0"></span>
            <span>Economico / Miglior Prezzo</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-600 shrink-0"></span>
            <span>Prezzo Medio</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-600 shrink-0"></span>
            <span>Sopra la Media</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-teal-600 shrink-0"></span>
            <span>Colonnina EV</span>
          </div>
        </div>
      </div>

      {/* 4. MAIN MAP & LIST GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[560px]">
        
        {/* MAP CONTAINER (7 COLS ON DESKTOP) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-3 border border-[#e2e8f0] shadow-xs flex flex-col relative overflow-hidden h-[420px] sm:h-[500px] lg:h-[620px]">
          
          <div 
            ref={mapContainerRef} 
            className="w-full h-full rounded-2xl z-10"
          />

          {/* Map Overlay Badge */}
          <div className="absolute top-6 left-6 z-20 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-2 pointer-events-none">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[11px] font-black text-[#0f172a]">Tutti i distributori rilevati ({filteredStations.length})</span>
          </div>

          {/* Map Controls Floating Helper */}
          <div className="absolute bottom-6 left-6 right-6 z-20 pointer-events-none flex justify-center">
            <div className="bg-slate-900/85 backdrop-blur-md text-white text-[11px] font-semibold px-4 py-2 rounded-2xl shadow-lg border border-white/10 flex items-center gap-2">
              <Info className="w-3.5 h-3.5 text-blue-400" />
              <span>Clicca sui pin per i dettagli completi, prezzi e collegamento al navigatore</span>
            </div>
          </div>

        </div>

        {/* LIST / DETAIL SIDEBAR (5 COLS ON DESKTOP) */}
        <div className="lg:col-span-5 flex flex-col gap-4">

          {/* IF A STATION IS SELECTED: SHOW RICH DETAIL CARD */}
          {selectedStation ? (
            <div className="bg-white rounded-3xl p-5 border-2 border-blue-500 shadow-md flex flex-col gap-4 animate-in fade-in slide-in-from-top-2">
              
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border shadow-2xs shrink-0 ${
                    selectedStation.type === 'ev' 
                      ? 'bg-teal-50 text-teal-600 border-teal-100' 
                      : 'bg-blue-50 text-[#2563eb] border-blue-100'
                  }`}>
                    {selectedStation.type === 'ev' ? <Zap className="w-6 h-6" /> : <Fuel className="w-6 h-6" />}
                  </div>
                  <div>
                    <h3 className="text-base font-black text-[#0f172a] leading-tight">
                      {selectedStation.name}
                    </h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{selectedStation.address}, {selectedStation.city} ({selectedStation.province})</span>
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedStation(null)}
                  className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Distance & Badges */}
              <div className="flex flex-wrap items-center gap-2">
                {selectedStation.distanceKm !== undefined && (
                  <span className="bg-blue-50 text-[#2563eb] border border-blue-200 px-2.5 py-1 rounded-xl text-xs font-black">
                    📍 {selectedStation.distanceKm} km da te
                  </span>
                )}
                {selectedStation.isOpen24h && (
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-lg text-[10px] font-bold">
                    Aperto 24/7
                  </span>
                )}
                {selectedStation.rating && (
                  <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-lg text-[10px] font-bold flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                    <span>{selectedStation.rating}</span>
                  </span>
                )}
                {selectedStation.hasCarWash && (
                  <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-lg text-[10px] font-bold">
                    🧼 Autolavaggio
                  </span>
                )}
                {selectedStation.hasBar && (
                  <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-lg text-[10px] font-bold">
                    ☕ Bar & Ristoro
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
                <div className="flex items-center gap-2">
                  {/* DIRECT GOOGLE MAPS LINK */}
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${selectedStation.lat},${selectedStation.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-bold py-2.5 px-4 rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <Navigation className="w-4 h-4" />
                    <span>Apri in Google Maps</span>
                  </a>

                  {/* SIMPLE COPY BUTTON FOR ANY NAVIGATOR (WAZE, APPLE MAPS, TOMTOM) */}
                  <button
                    type="button"
                    onClick={() => handleCopyNavigation(selectedStation)}
                    className="flex-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2.5 px-3 rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    title="Copia l'indirizzo e coordinate esatte per inserirlo nel tuo navigatore"
                  >
                    {copiedStationId === selectedStation.id ? (
                      <>
                        <CheckCheck className="w-4 h-4 text-emerald-400" />
                        <span className="text-emerald-400">Indirizzo Copiato!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copia per Navigatore</span>
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
