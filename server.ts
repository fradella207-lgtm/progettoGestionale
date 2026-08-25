import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

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
  const PORT = 3000;

  app.use(express.json());

  // Health endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
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
Fornisci un'analisi tecnica a 360° per QUALSIASI veicolo inserito (anche marche rare, veicoli commerciali, d'epoca, supercar o moto):
1. Identifica la GENERAZIONE ESATTA e periodo di produzione per l'anno indicato.
2. Identifica la CATEGORIA esatta (Berlina, SUV, Compatta, Citycar, Station Wagon, Coupé, Cabrio, Monovolume, Furgone / Commerciale, Moto / Scooter).
3. Restituisci TUTTE le motorizzazioni e allestimenti ufficiali omologati per quell'anno/generazione (Diesel, Benzina, Mild Hybrid, Full Hybrid, Plug-in PHEV, Elettrica BEV, GPL, Metano).
4. Per ogni motore indica: nome commerciale completo, fuelType esatto, CV, kW, cilindrata cc, capacità serbatoio carburante litri (0 se 100% elettrica), capacità batteria kWh (per PHEV o BEV), capacità bombola GPL/Metano se applicabile, autonomia elettrica WLTP se applicabile, cambio, classe Euro (es. Euro 3, Euro 4, Euro 5, Euro 6, Euro 6d, Euro 6e), anni di produzione, e consumo medio reale/dichiarato.
5. Inserisci anche la query fotografica ottimale per trovare la foto reale del veicolo (photoQuery) e il titolo dell'articolo Wikipedia principale (wikiTitle).

FORMATO RISPOSTA ESCLUSIVAMENTE JSON:
{
  "brand": "Nome Marca (es. Alfa Romeo, Volkswagen, Fiat, Toyota, Porsche, Dacia, Iveco, Ducati)",
  "model": "Nome Modello (es. Giulietta, Golf, Panda, Yaris, 911, Duster, Daily, Monster)",
  "generation": "Generazione e anni esatti (es. 'Giulietta I Serie (2010-2016)' o 'Golf V (2003-2008)')",
  "category": "Berlina" | "SUV" | "Station Wagon" | "Compatta" | "Coupé" | "Citycar" | "Monovolume" | "Furgone / Commerciale" | "Moto / Scooter",
  "estimatedRegistrationYear": 2012,
  "wikiTitle": "Alfa Romeo Giulietta (2010)",
  "photoQuery": "Alfa Romeo Giulietta 2012",
  "primaryMotorization": {
    "name": "Nome commerciale completo versione (es. 1.6 JTDm 105 CV Distinctive)",
    "fuelType": "Diesel" | "Benzina" | "Full / Mild Hybrid" | "Plug-in Hybrid (PHEV)" | "Elettrica (BEV)" | "GPL (Benzina + GPL)" | "Metano (Benzina + Metano)",
    "cv": 105,
    "kw": 77,
    "displacementCc": 1598,
    "tankCapacity": 60,
    "batteryCapacity": null,
    "secondaryTankCapacity": null,
    "wltpElectricRangeKm": null,
    "transmission": "Manuale 6m",
    "euroStandard": "Euro 5",
    "years": "2010-2015",
    "generation": "Giulietta I Serie",
    "avgConsumption": "4.4 L/100km"
  },
  "availableMotorizations": [
    {
      "name": "1.6 JTDm 105 CV",
      "fuelType": "Diesel",
      "cv": 105,
      "kw": 77,
      "displacementCc": 1598,
      "tankCapacity": 60,
      "batteryCapacity": null,
      "secondaryTankCapacity": null,
      "wltpElectricRangeKm": null,
      "transmission": "Manuale 6m",
      "euroStandard": "Euro 5",
      "years": "2010-2015",
      "generation": "Giulietta I Serie",
      "avgConsumption": "4.4 L/100km"
    }
  ]
}`;

      let responseText = '';
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
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
        wltpElectricRangeKm: primary.wltpElectricRangeKm ? Number(primary.wltpElectricRangeKm) : undefined,
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
  });
}

startServer();
