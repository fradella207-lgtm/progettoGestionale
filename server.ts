import "dotenv/config";
import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { sincronizzaMappaStazioni, OutputStazione } from "./scripts/sync_stations";
import { SEED_STATIONS } from "./src/data/seedStations";

let genAIClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  if (!genAIClient && process.env.GEMINI_API_KEY) {
    genAIClient = new GoogleGenAI({ 
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return genAIClient;
}

export interface RealVehiclePhoto {
  url: string;
  title: string;
  source: string;
}

/**
 * Searches real, authentic high-definition photographs of ANY vehicle model, generation and year
 * from Wikipedia and Wikimedia Commons open automotive repositories.
 */
async function fetchRealVehiclePhotos(
  brand: string,
  model: string,
  year?: string | number,
  generation?: string,
  customQuery?: string
): Promise<RealVehiclePhoto[]> {
  const photos: RealVehiclePhoto[] = [];
  const seenUrls = new Set<string>();

  const b = (brand || '').trim();
  const m = (model || '').trim();
  const y = (year || '').toString().trim();
  const gen = (generation || '').trim();
  const q = (customQuery || '').trim();

  // Queries in order of precision
  const queriesToTry: string[] = [];
  if (q) {
    queriesToTry.push(q);
  }
  if (b && m && gen) {
    queriesToTry.push(`${b} ${m} ${gen}`);
  }
  if (b && m && y && y !== 'undefined') {
    queriesToTry.push(`${b} ${m} ${y}`);
  }
  if (b && m) {
    queriesToTry.push(`${b} ${m}`);
  }
  if (m && !b) {
    queriesToTry.push(m);
  }

  const customHeaders = {
    'User-Agent': 'GestionaleAutoPW/1.0 (Automotive Management System; contact@gestionaleauto.it)',
    'Accept': 'application/json'
  };

  // 1. Search Wikipedia (EN and IT) for official article vehicle lead photos
  for (const queryStr of queriesToTry) {
    if (photos.length >= 8) break;
    for (const lang of ['en', 'it']) {
      try {
        const wikiUrl = `https://${lang}.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(queryStr)}&gsrlimit=4&prop=pageimages&pithumbsize=1200&format=json&origin=*`;
        const wikiRes = await fetch(wikiUrl, { headers: customHeaders });
        if (wikiRes.ok) {
          const wikiData = await wikiRes.json();
          const pages = wikiData?.query?.pages;
          if (pages) {
            for (const pageId in pages) {
              const page = pages[pageId];
              const imgUrl = page.thumbnail?.source;
              if (imgUrl && !seenUrls.has(imgUrl)) {
                if (!/logo|flag|coat_of_arms|map|icon|symbol|diagram/i.test(imgUrl)) {
                  seenUrls.add(imgUrl);
                  photos.push({
                    url: imgUrl,
                    title: `${page.title || `${b} ${m}`} (Wikipedia ${lang.toUpperCase()})`,
                    source: `Wikipedia ${lang.toUpperCase()}`
                  });
                }
              }
            }
          }
        }
      } catch (e) {
        // Continue to next source
      }
    }
  }

  // 2. Search Wikimedia Commons for real automotive photographs (exterior shots)
  for (const queryStr of queriesToTry) {
    if (photos.length >= 10) break;
    try {
      const commonsSearch = `${queryStr} automobile car`;
      const commonsUrl = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(commonsSearch)}&gsrnamespace=6&gsrlimit=15&prop=imageinfo&iiprop=url|size|mime&iiurlwidth=1200&format=json&origin=*`;
      const commRes = await fetch(commonsUrl, { headers: customHeaders });
      if (commRes.ok) {
        const commData = await commRes.json();
        const pages = commData?.query?.pages;
        if (pages) {
          for (const pageId in pages) {
            const page = pages[pageId];
            const ii = page.imageinfo?.[0];
            const url = ii?.thumburl || ii?.url;
            const fileTitle = page.title || '';

            if (url && !seenUrls.has(url)) {
              // Exclude interiors, dashboards, engines, logos, wrecked cars
              const isNonExterior = /interior|dashboard|engine|motor|chassis|steering|cockpit|wheel|rim|blueprint|diagram|sign|plate|logo|badge|icon|wreck|crash|gear/i.test(fileTitle);
              const isValidExt = /\.(jpe?g|png|webp)(\?|$)/i.test(url) || (ii?.mime && /jpeg|png|webp/i.test(ii.mime));

              if (!isNonExterior && isValidExt && (ii?.width ? ii.width >= 350 : true)) {
                seenUrls.add(url);
                photos.push({
                  url,
                  title: fileTitle.replace(/^File:/i, '').replace(/\.[^.]+$/, '').replace(/_/g, ' '),
                  source: 'Wikimedia Commons'
                });
              }
            }
            if (photos.length >= 10) break;
          }
        }
      }
    } catch (e) {
      // Continue
    }
  }

  return photos;
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // Global CORS & JSON Middlewares
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });

  app.use(express.json());

  // Health endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // -------------------------------------------------------------
  // IN-MEMORY CACHE & SPATIAL ENGINE PER 21.000+ STAZIONI MIMIT + EV
  // -------------------------------------------------------------
  let stationsMemoryCache: any[] | null = null;
  let stationsLastModified = '';
  let isSyncingInBackground = false;

  function convertSeedStationsToBackend(seeds: typeof SEED_STATIONS): OutputStazione[] {
    const nowIso = new Date().toISOString();
    return seeds.map(st => {
      const serviziPrezzi: any[] = [];
      if (st.fuelPrices) {
        st.fuelPrices.forEach(fp => {
          serviziPrezzi.push({
            tipo_servizio: `${fp.fuel} ${fp.isSelf ? 'Self' : 'Servito'}`,
            prezzo: fp.price,
            valuta: "EUR",
            ultimo_aggiornamento: nowIso
          });
        });
      }
      if (st.evPlugs) {
        st.evPlugs.forEach(ep => {
          serviziPrezzi.push({
            tipo_servizio: `${ep.type} ${ep.powerKw}kW`,
            prezzo: ep.pricePerKwh,
            valuta: "EUR",
            ultimo_aggiornamento: nowIso
          });
        });
      }
      return {
        id: st.id,
        tipo: (st.type === 'ev' ? 'elettrico' : 'carburante') as "elettrico" | "carburante",
        nome_gestore: st.brand || st.name,
        indirizzo_completo: `${st.address}, ${st.city} (${st.province})`,
        comune: st.city,
        coordinate: {
          lat: st.lat,
          lng: st.lng
        },
        servizi_prezzi: serviziPrezzi
      };
    });
  }

  function getLoadedStations(): any[] {
    const liveFilePath = path.join(process.cwd(), 'src', 'data', 'live_stations_output.json');
    if (!fs.existsSync(liveFilePath)) {
      // Se il file JSON non è ancora generato, usa istantaneamente il database seed integrato
      if (!isSyncingInBackground) {
        isSyncingInBackground = true;
        console.log("[STATIONS CACHE] Avvio prima sincronizzazione MIMIT ed EV in background...");
        sincronizzaMappaStazioni()
          .then(() => {
            isSyncingInBackground = false;
            stationsMemoryCache = null; // Forza ricaricamento
            console.log("[STATIONS CACHE] Sincronizzazione background completata con successo.");
          })
          .catch((err) => {
            isSyncingInBackground = false;
            console.warn("[STATIONS CACHE] Sincronizzazione background non riuscita:", err?.message);
          });
      }
      return convertSeedStationsToBackend(SEED_STATIONS);
    }

    try {
      const stats = fs.statSync(liveFilePath);
      const mtime = stats.mtime.toISOString();
      if (!stationsMemoryCache || stationsLastModified !== mtime) {
        const raw = fs.readFileSync(liveFilePath, 'utf-8');
        stationsMemoryCache = JSON.parse(raw);
        stationsLastModified = mtime;
        console.log(`[STATIONS CACHE] Caricate in memoria RAM ${stationsMemoryCache?.length} stazioni MIMIT ed EV`);
      }
      return stationsMemoryCache || [];
    } catch (e) {
      console.error("[STATIONS CACHE] Errore caricamento:", e);
      return convertSeedStationsToBackend(SEED_STATIONS);
    }
  }

  function calcDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // -------------------------------------------------------------
  // ENDPOINT MAPPA: RESTITUISCE TUTTI I DISTRIBUTORI & COLONNINE AGGIORNATI
  // Supporta filtri per coordinate, bounding box, tipo (fuel, ev, all) e ricerca testuale
  // -------------------------------------------------------------
  app.get("/api/stations", async (req, res) => {
    try {
      const stations = getLoadedStations();
      const totalDatabaseCount = stations.length;

      const q = (req.query.q as string || '').trim().toLowerCase();
      const typeParam = (req.query.type as string || 'all').toLowerCase(); // 'all' | 'fuel' | 'ev'
      const latParam = req.query.lat ? parseFloat(req.query.lat as string) : NaN;
      const lngParam = req.query.lng ? parseFloat(req.query.lng as string) : NaN;
      const radiusParam = req.query.radius ? parseFloat(req.query.radius as string) : 40; // default 40 km
      const boundsParam = req.query.bounds as string; // "minLat,minLng,maxLat,maxLng"
      const limitParam = req.query.limit ? parseInt(req.query.limit as string, 10) : 350;

      let filtered = stations;

      // 1. Filtro Tipo (Carburante vs Colonnina Elettrica)
      if (typeParam === 'ev' || typeParam === 'elettrico') {
        filtered = filtered.filter(st => 
          st.tipo === 'elettrico' || 
          st.tipo === 'ev' || 
          (st.servizi_prezzi && st.servizi_prezzi.some((sp: any) => 
            sp.tipo_servizio?.toLowerCase().includes('kw') || 
            sp.tipo_servizio?.toLowerCase().includes('type') || 
            sp.tipo_servizio?.toLowerCase().includes('ccs') ||
            sp.tipo_servizio?.toLowerCase().includes('tesla') ||
            sp.tipo_servizio?.toLowerCase().includes('supercharger') ||
            sp.tipo_servizio?.toLowerCase().includes('chademo')
          ))
        );
      } else if (typeParam === 'fuel' || typeParam === 'carburante') {
        filtered = filtered.filter(st => 
          st.tipo === 'carburante' || 
          st.tipo === 'fuel' || 
          (st.servizi_prezzi && st.servizi_prezzi.some((sp: any) => 
            sp.tipo_servizio?.toLowerCase().includes('benzina') || 
            sp.tipo_servizio?.toLowerCase().includes('gasolio') || 
            sp.tipo_servizio?.toLowerCase().includes('diesel') ||
            sp.tipo_servizio?.toLowerCase().includes('gpl') ||
            sp.tipo_servizio?.toLowerCase().includes('metano')
          ))
        );
      }

      // 2. Filtro per Bounding Box (Viewport della mappa)
      if (boundsParam) {
        const [minLat, minLng, maxLat, maxLng] = boundsParam.split(',').map(n => parseFloat(n.trim()));
        if (!isNaN(minLat) && !isNaN(minLng) && !isNaN(maxLat) && !isNaN(maxLng)) {
          filtered = filtered.filter(st => {
            const lat = st.coordinate?.lat;
            const lng = st.coordinate?.lng;
            return lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng;
          });
        }
      }
      // 3. Filtro per coordinate + raggio (es. GPS utente o centro città)
      else if (!isNaN(latParam) && !isNaN(lngParam)) {
        const withDist = filtered.map(st => {
          const lat = st.coordinate?.lat || 0;
          const lng = st.coordinate?.lng || 0;
          const dist = calcDistanceKm(latParam, lngParam, lat, lng);
          return { st, dist };
        }).filter(item => item.dist <= radiusParam);

        withDist.sort((a, b) => a.dist - b.dist);
        filtered = withDist.map(item => item.st);
      }

      // 4. Ricerca testuale (Città, comune, brand, via)
      if (q) {
        filtered = filtered.filter(st => {
          const gestore = (st.nome_gestore || '').toLowerCase();
          const indirizzo = (st.indirizzo_completo || '').toLowerCase();
          const comune = (st.comune || '').toLowerCase();
          return gestore.includes(q) || indirizzo.includes(q) || comune.includes(q);
        });
      }

      // 5. Quando richiesto 'all', garantisci che le colonnine EV nell'area non vengano sommerse dai distributori
      let dataToSend = [];
      if (typeParam === 'all') {
        const evList = filtered.filter(st => st.tipo === 'elettrico' || st.tipo === 'ev');
        const fuelList = filtered.filter(st => st.tipo !== 'elettrico' && st.tipo !== 'ev');
        
        // Includi tutti gli hub EV presenti nell'area (fino a 100) + distributori di carburante fino al limite
        const evPortion = evList.slice(0, 100);
        const remainingLimit = Math.max(limitParam - evPortion.length, 50);
        const fuelPortion = fuelList.slice(0, remainingLimit);
        
        dataToSend = [...evPortion, ...fuelPortion];
      } else {
        dataToSend = filtered.slice(0, Math.min(limitParam, 500));
      }

      return res.json({
        success: true,
        totalInDatabase: totalDatabaseCount,
        count: dataToSend.length,
        updatedAt: stationsLastModified || new Date().toISOString(),
        data: dataToSend
      });
    } catch (err: any) {
      console.error("Errore lettura stazioni:", err);
      return res.status(500).json({ error: err?.message || "Errore lettura stazioni" });
    }
  });

  // ENDPOINT DI TRIGGER PER CRON JOB O WEBHOOK ESTERNO
  app.post("/api/stations/sync", async (req, res) => {
    try {
      const result = await sincronizzaMappaStazioni();
      return res.json({
        success: true,
        message: "Sincronizzazione MIMIT e Open Charge Map completata con successo",
        ...result
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: err?.message || "Errore sincronizzazione"
      });
    }
  });

  // Dedicated Real Vehicle Photos Search endpoint (Wikipedia / Wikimedia Commons)
  app.all("/api/vehicle-photos", async (req, res) => {
    const brand = (req.query.brand as string) || req.body?.brand || '';
    const model = (req.query.model as string) || req.body?.model || '';
    const year = (req.query.year as string) || req.body?.year || '';
    const generation = (req.query.generation as string) || req.body?.generation || '';
    const query = (req.query.query as string) || req.body?.query || '';

    try {
      const photos = await fetchRealVehiclePhotos(brand, model, year, generation, query);
      return res.json({
        success: true,
        count: photos.length,
        photos
      });
    } catch (err: any) {
      console.warn("Errore ricerca foto reali:", err?.message || err);
      return res.json({
        success: false,
        count: 0,
        photos: []
      });
    }
  });

  // 360° AI & External Registry Vehicle Lookup endpoint for ANY vehicle
  app.post("/api/vehicle-lookup", async (req, res) => {
    const { query, brand, model, year, plate } = req.body;

    // 1. Precise Italian License Plate Estimation (1994 to 2026+)
    let plateEstimatedYear: number | null = null;
    let cleanPlate = '';
    if (plate && typeof plate === 'string') {
      cleanPlate = plate.toUpperCase().replace(/[^A-Z0-9]/g, '');
      if (cleanPlate.length >= 2) {
        const p1 = cleanPlate[0];
        const p2 = cleanPlate[1];
        if (p1 === 'A') {
          if (p2 <= 'D') plateEstimatedYear = 1994;
          else if (p2 <= 'K') plateEstimatedYear = 1995;
          else if (p2 <= 'R') plateEstimatedYear = 1996;
          else if (p2 <= 'V') plateEstimatedYear = 1997;
          else plateEstimatedYear = 1998;
        } else if (p1 === 'B') {
          if (p2 <= 'E') plateEstimatedYear = 1999;
          else if (p2 <= 'M') plateEstimatedYear = 2000;
          else if (p2 <= 'T') plateEstimatedYear = 2001;
          else plateEstimatedYear = 2002;
        } else if (p1 === 'C') {
          if (p2 <= 'E') plateEstimatedYear = 2002;
          else if (p2 <= 'K') plateEstimatedYear = 2003;
          else if (p2 <= 'R') plateEstimatedYear = 2004;
          else if (p2 <= 'W') plateEstimatedYear = 2005;
          else plateEstimatedYear = 2006;
        } else if (p1 === 'D') {
          if (p2 <= 'C') plateEstimatedYear = 2006;
          else if (p2 <= 'J') plateEstimatedYear = 2007;
          else if (p2 <= 'R') plateEstimatedYear = 2008;
          else plateEstimatedYear = 2009;
        } else if (p1 === 'E') {
          if (p2 <= 'C') plateEstimatedYear = 2010;
          else if (p2 <= 'G') plateEstimatedYear = 2011;
          else if (p2 <= 'L') plateEstimatedYear = 2012;
          else if (p2 <= 'R') plateEstimatedYear = 2013;
          else plateEstimatedYear = 2014;
        } else if (p1 === 'F') {
          if (p2 <= 'D') plateEstimatedYear = 2015;
          else if (p2 <= 'H') plateEstimatedYear = 2016;
          else if (p2 <= 'N') plateEstimatedYear = 2017;
          else if (p2 <= 'V') plateEstimatedYear = 2018;
          else plateEstimatedYear = 2019;
        } else if (p1 === 'G') {
          if (p2 <= 'B') plateEstimatedYear = 2019;
          else if (p2 <= 'E') plateEstimatedYear = 2020;
          else if (p2 <= 'K') plateEstimatedYear = 2021;
          else if (p2 <= 'P') plateEstimatedYear = 2022;
          else if (p2 <= 'V') plateEstimatedYear = 2023;
          else plateEstimatedYear = 2024;
        } else if (p1 === 'H') {
          if (p2 <= 'C') plateEstimatedYear = 2024;
          else if (p2 <= 'G') plateEstimatedYear = 2025;
          else plateEstimatedYear = 2026;
        }
      }
    }

    // Determine target year
    let targetYear = year;
    if (typeof targetYear === 'string' && targetYear.includes('-')) {
      const parsed = parseInt(targetYear.split('-')[0], 10);
      if (!isNaN(parsed) && parsed > 1970) targetYear = parsed;
    }

    const searchQuery = query || `${brand || ''} ${model || ''} ${targetYear ? 'anno ' + targetYear : ''}`.trim();

    if (!searchQuery && !brand && !model) {
      return res.status(400).json({ error: "Specificare almeno Marca, Modello o Anno di ricerca" });
    }

    try {
      const ai = getGeminiClient();
      if (!ai) {
        const realPhotos = await fetchRealVehiclePhotos(brand, model, targetYear);
        return res.json({ 
          success: false,
          useFallback: true,
          realPhotos,
          message: "GEMINI_API_KEY non configurata sul server, fallback catalogo attivo" 
        });
      }

      const prompt = `Sei il massimo ingegnere automobilistico ed esperto globale di omologazioni, schede tecniche, motorizzazioni, generazioni e listini veicoli (auto di ogni segmento, SUV, sportive, supercar, auto storiche/vintage, veicoli commerciali/furgoni, moto e scooter dal 1970 al 2026).

PARAMETRI DEL VEICOLO DA ANALIZZARE A 360°:
- Marca: "${brand || 'Da identificare'}"
- Modello: "${model || 'Da identificare'}"
- Anno di Immatricolazione / Riferimento: "${targetYear || 'Attuale / Recente'}"
- Query supplementare: "${searchQuery}"

OBIETTIVO ASSOLUTO:
Fornisci un'analisi tecnica a 360° e TROVA TUTTE LE MOTORIZZAZIONI UFFICIALI DISPONIBILI per questo modello e generazione:
1. Identifica la GENERAZIONE ESATTA e periodo di produzione per l'anno indicato.
2. Identifica la CATEGORIA esatta (Berlina, SUV, Compatta, Citycar, Station Wagon, Coupé, Cabrio, Monovolume, Furgone / Commerciale, Moto / Scooter).
3. CERCA E RESTITUISCI TUTTE LE MOTORIZZAZIONI UFFICIALI omologate per quel modello e generazione (trovane il maggior numero possibile, tipicamente da 6 a 18 versioni diverse coprendo Diesel, Benzina, Mild Hybrid, Full Hybrid, Plug-in Hybrid PHEV, Elettrica BEV, GPL, Metano, varianti sportive e commerciali).
4. Per OGNI singola motorizzazione indica con precisione ingegneristica:
   - "name": Nome commerciale ufficiale completo e accurato (es. "1.6 MultiJet 120 CV Lounge", "2.0 TDI 150 CV DSG 4Motion", "1.4 T-Jet 120 CV GPL", "Plug-in Hybrid 1.4 TSI 245 CV e-Hybrid", "2.0 TFSI 204 CV quattro S-tronic", "1.5 eTSI 150 CV DSG", "Long Range Dual Motor AWD 514 CV").
   - "fuelType": esatto ("Diesel" | "Benzina" | "Full / Mild Hybrid" | "Plug-in Hybrid (PHEV)" | "Elettrica (BEV)" | "GPL (Benzina + GPL)" | "Metano (Benzina + Metano)").
   - "cv": Potenza esatta in CV (cavalli vapore).
   - "kw": Potenza esatta in kW (calcolata con formula standard kW = CV / 1.35962 arrotondato).
   - "displacementCc": Cilindrata esatta in cc (null per BEV).
   - "tankCapacity": Capacità reale serbatoio carburante principale in litri (0 per 100% Elettrica BEV; tipicamente 40-70 L per termici e PHEV).
   - "batteryCapacity": Capacità nominale/netta batteria di trazione in kWh (obbligatoria per PHEV come 13.0, 15.5 o 19.7 kWh, e per BEV come 50, 60, 77, 100 kWh; null per termici tradizionali).
   - "secondaryTankCapacity": Capacità serbatoio secondario per GPL (Litri) o Metano (Kg); null per altre alimentazioni.
   - "driveType": Differenziale e Trazione ("Trazione Anteriore (FWD)" | "Trazione Posteriore (RWD)" | "Trazione Integrale (4x4 / AWD / 4Motion / Q4 / quattro / xDrive / Dual Motor)").
   - "differential": Note differenziale (es. "Anteriore elettronico", "Integrale Haldex / 4Motion", "Torsen permanente", "Autobloccante meccanico LSD", "Dual Motor e-AWD", "Differenziale aperto").
   - "transmission": Tipo di cambio (es. "Manuale 6m", "Automatico DSG 7m", "EAT8 8m", "E-CVT", "Automatico 9G-Tronic").
   - "euroStandard": Omologazione Euro (es. "Euro 4", "Euro 5", "Euro 6", "Euro 6d-ISC-FCM", "Euro 6e").
   - "wltpElectricRangeKm": Autonomia elettrica WLTP stimata (per PHEV o BEV).
   - "years": Anni di produzione della specifica versione (es. "2015-2020").
   - "avgConsumption": Consumo medio dichiarato (es. "4.4 L/100km", "0.5 L/100km + 15.0 kWh/100km", "16.8 kWh/100km").
5. Inserisci anche la query fotografica ottimale (photoQuery) e il titolo dell'articolo Wikipedia principale (wikiTitle).

FORMATO RISPOSTA ESCLUSIVAMENTE JSON:
{
  "brand": "Nome Marca (es. Alfa Romeo, Volkswagen, Fiat, Toyota, Porsche, Dacia, Iveco, Audi, BMW)",
  "model": "Nome Modello (es. Giulietta, Golf, Panda, Yaris, 911, Duster, Daily, A3, Serie 3)",
  "generation": "Generazione e anni esatti (es. 'Giulietta I Serie (2010-2016)' o 'Golf VII (2012-2020)')",
  "category": "Berlina" | "SUV" | "Station Wagon" | "Compatta" | "Coupé" | "Citycar" | "Monovolume" | "Furgone / Commerciale" | "Moto / Scooter",
  "estimatedRegistrationYear": 2015,
  "wikiTitle": "Alfa Romeo Giulietta (2010)",
  "photoQuery": "Alfa Romeo Giulietta 2015",
  "primaryMotorization": {
    "name": "1.6 JTDm 120 CV Distinctive",
    "fuelType": "Diesel",
    "cv": 120,
    "kw": 88,
    "displacementCc": 1598,
    "tankCapacity": 60,
    "batteryCapacity": null,
    "secondaryTankCapacity": null,
    "driveType": "Trazione Anteriore (FWD)",
    "differential": "Differenziale Elettronico Q2",
    "transmission": "Manuale 6m",
    "euroStandard": "Euro 6",
    "years": "2015-2020",
    "generation": "Giulietta Restyling",
    "avgConsumption": "4.3 L/100km"
  },
  "availableMotorizations": [
    {
      "name": "1.6 JTDm 120 CV",
      "fuelType": "Diesel",
      "cv": 120,
      "kw": 88,
      "displacementCc": 1598,
      "tankCapacity": 60,
      "batteryCapacity": null,
      "secondaryTankCapacity": null,
      "driveType": "Trazione Anteriore (FWD)",
      "differential": "Differenziale Q2",
      "transmission": "Manuale 6m",
      "euroStandard": "Euro 6",
      "years": "2015-2020",
      "generation": "Giulietta Restyling",
      "avgConsumption": "4.3 L/100km"
    },
    {
      "name": "2.0 JTDm 150 CV",
      "fuelType": "Diesel",
      "cv": 150,
      "kw": 110,
      "displacementCc": 1956,
      "tankCapacity": 60,
      "batteryCapacity": null,
      "secondaryTankCapacity": null,
      "driveType": "Trazione Anteriore (FWD)",
      "differential": "Differenziale Q2",
      "transmission": "Manuale 6m",
      "euroStandard": "Euro 6",
      "years": "2013-2020",
      "generation": "Giulietta",
      "avgConsumption": "4.7 L/100km"
    },
    {
      "name": "1.4 Turbo GPL 120 CV",
      "fuelType": "GPL (Benzina + GPL)",
      "cv": 120,
      "kw": 88,
      "displacementCc": 1368,
      "tankCapacity": 60,
      "batteryCapacity": null,
      "secondaryTankCapacity": 38,
      "driveType": "Trazione Anteriore (FWD)",
      "differential": "Differenziale Q2",
      "transmission": "Manuale 6m",
      "euroStandard": "Euro 6",
      "years": "2011-2018",
      "generation": "Giulietta Turbo GPL",
      "avgConsumption": "8.2 L/100km GPL"
    }
  ]
}`;

      let responseText = '';
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            temperature: 0.1
          }
        });
        responseText = response.text || '';
      } catch (geminiError: any) {
        console.warn("Avviso chiamata modello Gemini:", geminiError?.message || geminiError);
        const realPhotos = await fetchRealVehiclePhotos(brand, model, targetYear);
        return res.json({ 
          success: false,
          useFallback: true,
          realPhotos,
          error: geminiError?.message || "AI unavailable"
        });
      }

      let jsonResult: any;
      try {
        jsonResult = JSON.parse(responseText);
      } catch {
        const clean = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        jsonResult = JSON.parse(clean);
      }

      const primary = jsonResult.primaryMotorization || jsonResult;
      const finalBrand = jsonResult.brand || brand || '';
      const finalModel = jsonResult.model || model || '';
      const finalGen = jsonResult.generation || '';

      // Asynchronously fetch authentic real photos of this exact car and generation from Wikipedia/Wikimedia
      const realPhotos = await fetchRealVehiclePhotos(
        finalBrand,
        finalModel,
        targetYear || jsonResult.estimatedRegistrationYear,
        finalGen,
        jsonResult.photoQuery || `${finalBrand} ${finalModel} ${targetYear || ''}`
      );

      const formattedResult = {
        brand: finalBrand,
        model: finalModel,
        generation: finalGen,
        category: jsonResult.category || 'Berlina',
        motorization: primary.name || primary.motorization || '',
        fuelType: primary.fuelType || 'Diesel',
        powerCv: Number(primary.cv || primary.powerCv) || 120,
        powerKw: Number(primary.kw || primary.powerKw) || Math.round(Number(primary.cv || primary.powerCv || 120) / 1.35962),
        displacementCc: primary.displacementCc ? Number(primary.displacementCc) : undefined,
        tankCapacity: Number(primary.tankCapacity ?? 50),
        batteryCapacity: primary.batteryCapacity ? Number(primary.batteryCapacity) : undefined,
        secondaryTankCapacity: primary.secondaryTankCapacity ? Number(primary.secondaryTankCapacity) : undefined,
        driveType: primary.driveType || primary.trazione,
        differential: primary.differential || primary.differenziale,
        transmission: primary.transmission,
        euroStandard: primary.euroStandard,
        avgConsumption: primary.avgConsumption,
        photoQuery: jsonResult.photoQuery,
        realPhotos,
        suggestedPhotoUrl: realPhotos.length > 0 ? realPhotos[0].url : undefined,
        availableMotorizations: Array.isArray(jsonResult.availableMotorizations) 
          ? jsonResult.availableMotorizations.map((m: any) => ({
              name: m.name || '',
              fuelType: m.fuelType || 'Benzina',
              cv: Number(m.cv) || 100,
              kw: Number(m.kw) || Math.round(Number(m.cv || 100) / 1.35962),
              displacementCc: m.displacementCc ? Number(m.displacementCc) : undefined,
              tankCapacity: Number(m.tankCapacity ?? 50),
              batteryCapacity: m.batteryCapacity ? Number(m.batteryCapacity) : undefined,
              secondaryTankCapacity: m.secondaryTankCapacity ? Number(m.secondaryTankCapacity) : undefined,
              wltpElectricRangeKm: m.wltpElectricRangeKm ? Number(m.wltpElectricRangeKm) : undefined,
              driveType: m.driveType || m.trazione,
              differential: m.differential || m.differenziale,
              transmission: m.transmission,
              euroStandard: m.euroStandard,
              years: m.years,
              generation: m.generation || jsonResult.generation,
              avgConsumption: m.avgConsumption
            }))
          : []
      };

      return res.json({
        success: true,
        data: formattedResult
      });

    } catch (err: any) {
      console.warn("Fallback catalogo attivato per ricerca veicolo:", err?.message || err);
      const realPhotos = await fetchRealVehiclePhotos(brand, model, targetYear);
      return res.json({ 
        success: false,
        useFallback: true,
        realPhotos,
        error: err?.message || "Errore elaborazione"
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);

    // Pianificazione automatica ogni mattina alle 08:30 (Ora Locale)
    function pianificaProssimoAggiornamento() {
      const now = new Date();
      const nextRun = new Date();
      nextRun.setHours(8, 30, 0, 0);

      // Se le 08:30 di oggi sono già passate, programma per domani alle 08:30
      if (now.getTime() >= nextRun.getTime()) {
        nextRun.setDate(nextRun.getDate() + 1);
      }

      const msUntilNextRun = nextRun.getTime() - now.getTime();
      const ore = (msUntilNextRun / (1000 * 60 * 60)).toFixed(1);
      console.log(`[CRON ENGINE] Prossimo aggiornamento automatico MIMIT programmato tra ${ore} ore (${nextRun.toLocaleString('it-IT')})`);

      setTimeout(async () => {
        try {
          console.log("[CRON ENGINE] Esecuzione aggiornamento automatico delle 08:30...");
          await sincronizzaMappaStazioni();
        } catch (e: any) {
          console.error("[CRON ENGINE] Errore aggiornamento programmato:", e.message);
        } finally {
          pianificaProssimoAggiornamento();
        }
      }, msUntilNextRun);
    }

    pianificaProssimoAggiornamento();
  });
}

startServer();
