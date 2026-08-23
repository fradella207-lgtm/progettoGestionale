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

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // AI Vehicle Lookup & Motorization Autofill endpoint
  app.post("/api/vehicle-lookup", async (req, res) => {
    const { query, brand, model, year, plate } = req.body;

    // Estimate year from Italian license plate if provided
    let plateEstimatedYear: number | null = null;
    if (plate && typeof plate === 'string') {
      const cleanPlate = plate.toUpperCase().replace(/[^A-Z0-9]/g, '');
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

    // Extract numerical year if embedded in year/regDate string
    let extractedYear: string | number | undefined = year;
    if (typeof year === 'string' && year.includes('-')) {
      const parsed = parseInt(year.split('-')[0], 10);
      if (!isNaN(parsed) && parsed > 1970) extractedYear = parsed;
    }

    // If year is unset or current year (2025/2026) but plate indicates older year, prioritize plate
    const currentYear = new Date().getFullYear();
    if (plateEstimatedYear && (!extractedYear || Number(extractedYear) >= currentYear - 1)) {
      extractedYear = plateEstimatedYear;
    } else if (plateEstimatedYear && Math.abs(Number(extractedYear) - plateEstimatedYear) > 4) {
      // Large discrepancy (e.g. user selected 2026 but plate is D... 2007)
      extractedYear = plateEstimatedYear;
    }

    const searchQuery = query || `${brand || ''} ${model || ''} ${extractedYear ? 'anno ' + extractedYear : ''} ${plate || ''}`.trim();

    if (!searchQuery) {
      return res.status(400).json({ error: "Parametro di ricerca o veicolo mancante" });
    }

    try {
      const ai = getGeminiClient();
      if (!ai) {
        return res.json({ 
          success: false,
          useFallback: true,
          message: "GEMINI_API_KEY non configurata sul server, fallback catalogo attivo" 
        });
      }

      const prompt = `Sei il massimo ingegnere automobilistico ed esperto di omologazioni e banche dati europee (Quattroruote, Eurotax, DAT, KBA, Motorizzazione Civile e listini costruttori dal 1995 al 2026).

RICHIESTA DI ANALISI VEICOLO:
Query di ricerca: "${searchQuery}"
Marca indicata: "${brand || ''}"
Modello indicato: "${model || ''}"
Anno di immatricolazione / produzione target: "${extractedYear || (plateEstimatedYear ? `Circa ${plateEstimatedYear} (da targa ${plate})` : 'Non specificato')}"
Targa italiana (se fornita): "${plate || ''}"

OBIETTIVO CRITICO - COERENZA TEMPORALE ASSOLUTA (ANNO / GENERAZIONE):
1. SE L'ANNO O LA TARGA INDICANO UN VEICOLO DEL PASSATO (es. 2005, 2007, 2008, 2011, 2014, 2017, ecc.):
   - DEVI IDENTIFICARE LA GENERAZIONE ESATTA DI QUELL'EPOCA E FORNIRE ESCLUSIVAMENTE LE MOTORIZZAZIONI DI QUELL'ANNO!
   - VIETATO ASSOLUTAMENTE restituire modelli del 2020-2024 (es. PHEV/MHEV moderne) se la vettura è del 2007/2008!
   - Esempi di coerenza storica:
     * Volkswagen Golf 2007/2008 (targa D...): DEVE essere Golf V (5ª serie) -> 1.9 TDI 105 CV, 2.0 TDI 140/170 CV, 1.4 TSI 122/140/170 CV, 1.6 102 CV, 1.6 FSI 115 CV, 2.0 TFSI GTI 200 CV, R32 250 CV, Euro 4, serbatoio 55L.
     * Audi A3 2007/2008 (targa D...): DEVE essere Audi A3 8P -> 1.9 TDI 105 CV, 2.0 TDI 140/170 CV, 1.6 102 CV, 1.4 TFSI 125 CV, 1.8 TFSI 160 CV, 2.0 TFSI 200 CV, Euro 4, serbatoio 55L.
     * Fiat Grande Punto / Punto 2007/2008: 1.3 Multijet 75/90 CV, 1.9 Multijet 120/130 CV, 1.2 65 CV, 1.4 77 CV, 1.4 T-Jet 120 CV, Natural Power Metano, GPL, Euro 4.
     * Fiat Panda 2007/2008: Panda 2ª serie (169) -> 1.1 54 CV, 1.2 60 CV, 1.3 Multijet 69/75 CV, Natural Power Metano, 4x4 Climbing, Euro 4, serbatoio 35L/38L.
     * BMW Serie 3 2007/2008 (targa D...): BMW E90/E91 -> 320d 163/177 CV, 318d 143 CV, 320i 150/170 CV, 325d, 330d 231 CV, 335d 286 CV, 335i 306 CV, Euro 4, serbatoio 61L/63L.
     * Ford Fiesta 2007/2008: Fiesta V restyling / Mk6 -> 1.4 TDCi 68 CV, 1.6 TDCi 90 CV, 1.2 75 CV, 1.4 80 CV, 1.6 100 CV, ST 150 CV, Euro 4.
     * Ford Focus 2007/2008: Focus II (Mk2) -> 1.6 TDCi 90/109 CV, 2.0 TDCi 136 CV, 1.6 100/115 CV, 2.0 145 CV, 2.5 ST 225 CV, Euro 4.

2. SE IL VEICOLO È MODERNO (2020-2026):
   - Fornisci le motorizzazioni attuali (Mild Hybrid, Plug-in PHEV con kWh netti e autonomia WLTP reale, Diesel, Elettriche BEV).

3. Fornisci sia la motorizzazione primaria più diffusa/probabile, sia l'elenco COMPLETO in "availableMotorizations" (almeno 5-10 versioni ufficiali per quella specifica annata).

FORMATO RISPOSTA:
Restituisci ESCLUSIVAMENTE un oggetto JSON valido con la seguente struttura:

{
  "brand": "Nome Marca",
  "model": "Nome Modello",
  "generation": "Nome generazione esatta e anni (es. 'Golf V (2003-2008)' oppure 'Formentor I Serie (2020-2024)')",
  "category": "Berlina" | "SUV" | "Station Wagon" | "Compatta" | "Coupé" | "Citycar" | "Monovolume",
  "primaryMotorization": {
    "name": "Nome commerciale completo (es. 1.9 TDI 105 CV Comfortline)",
    "fuelType": "Diesel" | "Benzina" | "Full / Mild Hybrid" | "Plug-in Hybrid (PHEV)" | "Elettrica (BEV)" | "GPL (Benzina + GPL)" | "Metano (Benzina + Metano)",
    "cv": 105,
    "kw": 77,
    "displacementCc": 1896,
    "tankCapacity": 55,
    "batteryCapacity": null,
    "secondaryTankCapacity": null,
    "wltpElectricRangeKm": null,
    "transmission": "Manuale 5m",
    "euroStandard": "Euro 4",
    "years": "2003-2008",
    "generation": "V Serie (1K)",
    "avgConsumption": "5.2 L/100km"
  },
  "availableMotorizations": [
    {
      "name": "1.9 TDI 105 CV",
      "fuelType": "Diesel",
      "cv": 105,
      "kw": 77,
      "displacementCc": 1896,
      "tankCapacity": 55,
      "batteryCapacity": null,
      "secondaryTankCapacity": null,
      "wltpElectricRangeKm": null,
      "transmission": "Manuale 5m",
      "euroStandard": "Euro 4",
      "years": "2003-2008",
      "generation": "V Serie (1K)",
      "avgConsumption": "5.2 L/100km"
    }
  ],
  "photoQuery": "volkswagen golf 5 2007"
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
        return res.json({ 
          success: false,
          useFallback: true,
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

      // Format response to ensure backward compatibility and rich motorization list
      const primary = jsonResult.primaryMotorization || jsonResult;
      
      const formattedResult = {
        brand: jsonResult.brand || brand || '',
        model: jsonResult.model || model || '',
        generation: jsonResult.generation || '',
        category: jsonResult.category || 'Berlina',
        motorization: primary.name || primary.motorization || '',
        fuelType: primary.fuelType || 'Diesel',
        powerCv: Number(primary.cv || primary.powerCv) || 150,
        powerKw: Number(primary.kw || primary.powerKw) || Math.round(Number(primary.cv || primary.powerCv || 150) / 1.35962),
        displacementCc: primary.displacementCc ? Number(primary.displacementCc) : undefined,
        tankCapacity: Number(primary.tankCapacity ?? 50),
        batteryCapacity: primary.batteryCapacity ? Number(primary.batteryCapacity) : undefined,
        secondaryTankCapacity: primary.secondaryTankCapacity ? Number(primary.secondaryTankCapacity) : undefined,
        wltpElectricRangeKm: primary.wltpElectricRangeKm ? Number(primary.wltpElectricRangeKm) : undefined,
        transmission: primary.transmission,
        euroStandard: primary.euroStandard,
        avgConsumption: primary.avgConsumption,
        photoQuery: jsonResult.photoQuery,
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
      return res.json({ 
        success: false,
        useFallback: true,
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
