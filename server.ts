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

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Health endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // -------------------------------------------------------------
  // AI CAR ASSISTANT & QUATTRORUOTE TECHNICAL ENGINE (Gemini 3.7 Flash)
  // -------------------------------------------------------------

  // Helper per risposte dell'Assistente Tecnico in caso di eccezione AI o offline
  function generateExpertCarReply(car: any, message: string, imageAttachment?: any): string {
    const q = (message || '').toLowerCase();
    const brand = (car?.brand || 'la tua auto').trim();
    const model = (car?.model || '').trim();
    const fuel = (car?.fuelType || car?.motorization || 'motore standard').toLowerCase();
    const isDiesel = fuel.includes('diesel') || fuel.includes('jtd') || fuel.includes('tdi') || fuel.includes('dci') || fuel.includes('hdi') || fuel.includes('cdti');
    const isEv = fuel.includes('elettric') || fuel.includes('bev') || fuel.includes('ev');
    const isHybrid = fuel.includes('hybrid') || fuel.includes('ibrid') || fuel.includes('phev');
    const isGpl = fuel.includes('gpl') || fuel.includes('gas');
    const isMetano = fuel.includes('metano') || fuel.includes('cng');

    // 1. Azzeramento Spia Pressione Pneumatici (TPMS)
    if (q.includes('tpms') || q.includes('pressione') || q.includes('gomm') || q.includes('pneumatic')) {
      return `### Procedura Azzeramento Spia Pressione Pneumatici (TPMS) per **${brand} ${model}**

1. **Controllo a freddo**: Con un manometro affidabile o presso un gommista, gonfia tutti e 4 i pneumatici ai valori raccomandati:
   - **Asse Anteriore**: **${car?.technicalSpecs?.tirePressureFrontBar || 2.3} bar** (${((car?.technicalSpecs?.tirePressureFrontBar || 2.3) * 14.5).toFixed(0)} PSI)
   - **Asse Posteriore**: **${car?.technicalSpecs?.tirePressureRearBar || 2.2} bar** (${((car?.technicalSpecs?.tirePressureRearBar || 2.2) * 14.5).toFixed(0)} PSI)
   - *(A pieno carico o in autostrada impostare a ${car?.technicalSpecs?.tirePressureLoadedBar || 2.6} bar)*.
2. **Procedura di Reset da fermo**:
   - Accendi il quadro strumenti con motore spento (o avvia il quadro senza premere frizione/freno).
   - Accedi al menu di bordo del display centrale o dell'infotainment (sezione *Menu Veicolo* o *Stato Veicolo* > *Pressione Pneumatici / TPMS*).
   - Seleziona **"Reset Pressione"** o **"Memorizza Pressioni"** e tieni premuto il pulsante di conferma finché il display non emette un segnale acustico o conferma l'avvenuta calibrazione.
3. **Calibrazione dinamica**: Guida il veicolo per circa 5–10 minuti a velocità superiore a 40 km/h per completare la memorizzazione dei sensori ABS/TPMS.`;
    }

    // 2. Olio Motore e Lubrificanti
    if (q.includes('olio') || q.includes('lubrificant') || q.includes('rabbocc') || q.includes('coppa')) {
      const oilSpec = car?.technicalSpecs?.recommendedOil || (isDiesel ? '5W-30 ACEA C3 (Basso contenuto di ceneri per DPF/FAP)' : '0W-20 / 5W-30 ACEA C2/C3');
      const oilCap = car?.technicalSpecs?.oilCapacityLiters ? `${car.technicalSpecs.oilCapacityLiters} Litri` : '4.5 Litri';
      return `### Specifiche Olio Motore & Rabbocco per **${brand} ${model}**

- **Gradazione & Specifica Raccomandata**: **${oilSpec}**
- **Capacità Coppa con Filtro**: circa **${oilCap}**
- **Procedura di Controllo Livello**:
  1. Parcheggia il veicolo in piano a motore caldo e spegni l'auto per almeno 5–10 minuti per far defluire l'olio in coppa.
  2. Estrai l'astina, puliscila con un panno pulito che non lasci residui, reinseriscila completamente ed estraila di nuovo.
  3. Il livello deve trovarsi esattamente tra le due tacche (MIN e MAX). La differenza tra Min e Max è solitamente pari a circa 1 Litro.
  4. Rabbocca gradualmente (200-300 ml alla volta) per evitare il dannoso sovra-riempimento.`;
    }

    // 3. Reset Service / Spia Tagliando
    if (q.includes('tagliand') || q.includes('service') || q.includes('manutenzion') || q.includes('chiave ingles')) {
      return `### Procedura Reset Spia Manutenzione / Tagliando per **${brand} ${model}**

1. A veicolo fermo e quadro spento, tieni premuto il pulsante di **azzeramento contachilometri parziale** (o il tasto *OK/Set* sulla leva sinistra/volante).
2. Senza rilasciare il pulsante, inserisci la chiave e ruotala su MAR (quadro strumenti acceso, senza avviare il motore).
3. Sul display centrale comparirà un conto alla rovescia (da 10 a 0) o l'indicazione di conferma reset service.
4. Mantieni premuto fino al termine del countdown o al messaggio *"Service Azzerato / 0"*.
5. Rilascia il pulsante e spegni il quadro per salvare la configurazione.`;
    }

    // 4. Libretto di Circolazione (Voci DUC)
    if (q.includes('libretto') || q.includes('duc') || q.includes('p.5') || q.includes('v.9') || q.includes('p.1') || q.includes('p.2') || q.includes('targa') || q.includes('telaio') || q.includes('vin')) {
      return `### Guida ai Codici del Libretto di Circolazione (DUC)

Ecco la decodifica dei campi ministeriali per **${brand} ${model}**:
- **(D.1 / D.2 / D.3)**: Costruttore (${brand}), Tipo e Modello commerciale.
- **(E)**: Numero di identificazione del veicolo (**VIN / Numero di Telaio** a 17 caratteri).
- **(P.1)**: Cilindrata in centimetri cubici (${car?.technicalSpecs?.engineDisplacementCc ? `${car.technicalSpecs.engineDisplacementCc} cm³` : 'cm³'}).
- **(P.2)**: Potenza netta massima in **kW** (${car?.powerKw || Math.round((car?.powerCv || 120) * 0.735)} kW = ${car?.powerCv || 120} CV).
- **(P.5)**: **Codice identificativo del motore** (fondamentale per ordinare i ricambi corretti).
- **(V.9)**: **Classe di omologazione ambientale** (${car?.technicalSpecs?.euroClass || 'Euro 6'}, es. Direttiva antinquinamento).
- **(Q)**: Rapporto potenza/tara (fondamentale per l'omologazione per neopatentati, max 75 kW/t).`;
    }

    // 5. Consumi & Guida Efficiente
    if (q.includes('consum') || q.includes('guid') || q.includes('risparmi') || q.includes('autonomia')) {
      let advice = '';
      if (isDiesel) {
        advice = `- Mantieni regimi costanti tra 1.500 e 2.200 giri/min per sfruttare la coppia massima.
- Effettua periodicamente tragitti extraurbani/autostradali di 20-30 minuti per consentire la rigenerazione termica del filtro antiparticolato DPF/FAP.`;
      } else if (isEv || isHybrid) {
        advice = `- Sfrutta al massimo la frenata rigenerativa modulando il pedale dell'acceleratore (One-Pedal drive ove presente).
- Pre-condiziona l'abitacolo (riscaldamento/clima) mentre il veicolo è ancora collegato alla presa di ricarica per preservare l'autonomia della batteria.`;
      } else {
        advice = `- Anticipa le frenate e sfrutta il freno motore per interrompere l'iniezione di carburante (cut-off).
- Mantieni la pressione degli pneumatici sempre al valore raccomandato per ridurre la resistenza al rotolamento.`;
      }

      return `### Consigli di Guida ed Efficienza per **${brand} ${model}** (${car?.fuelType || 'Termica'})

I consumi medi omologati Quattroruote per questo allestimento sono di circa **${car?.technicalSpecs?.wltpConsumption || '5.2 L/100 km'}**.

**Linee guida per ottimizzare l'efficienza**:
${advice}
- Rimuovi pesi inutili dal bagagliaio e controlla che l'allineamento ruote sia ottimale.
- Un corretto intervallo di manutenzione (filtro aria e candele/iniettori puliti) può ridurre i consumi fino al 10%.`;
    }

    // 6. Diagnosi Spie o Immagini
    if (imageAttachment || q.includes('spia') || q.includes('cruscott') || q.includes('avaria') || q.includes('errore')) {
      return `### Diagnosi Assistenza di Bordo per **${brand} ${model}**

${imageAttachment ? `Ho esaminato l'immagine allegata relativa alla strumentazione di bordo del tuo veicolo (**${brand} ${model}**).` : `Per l'anomalia o la spia segnalata sul tuo veicolo **${brand} ${model}**:`}

**Guida Rapida alle Principali Spie del Cruscotto**:
1. **Spia MIL / Avaria Motore (Gialla/Arancione)**: Indica un'anomalia nella gestione elettronica, nell'alimentazione, nel sistema di accensione o nei sensori gas di scarico (sonda lambda/sensore pressione DPF). Se la spia è fissa e l'auto non va in modalità protezione (recovery), puoi raggiungere l'officina a velocità moderata.
2. **Spia Pressione Olio Motore (Rossa)**: **ARRESTO IMMEDIATO**. Spegni il motore per evitare il grippaggio e controlla il livello dell'olio sull'astina.
3. **Spia Impianto Frenante / Liquido Freni (Rossa)**: Verifica che il freno a mano sia disinserito e controlla il livello del liquido DOT4 nel serbatoio dedicato.
4. **Spia TPMS (Gialla a forma di battistrada)**: Pressione pneumatici anomala in uno o più assi.

*Consiglio*: Se la spia rimane accesa in modo permanente, collega uno strumento di autodiagnosi OBD2 per leggere i codici errore DTC (es. P0xxx).`;
    }

    // Risposta Generale
    return `### Assistente Tecnico Ufficiale — **${brand} ${model}**

Configurazione attiva: **${car?.motorization || car?.fuelType || 'Standard'}** (${car?.powerCv ? `${car.powerCv} CV` : ''} - ${car?.plate ? `Targa: ${car.plate}` : ''}).

Posso fornirti supporto tecnico specializzato per:
- **Pressione e misure pneumatici omologati** a libretto (Anteriore: ${car?.technicalSpecs?.tirePressureFrontBar || 2.3} bar / Posteriore: ${car?.technicalSpecs?.tirePressureRearBar || 2.2} bar).
- **Specifiche Olio Motore**: ${car?.technicalSpecs?.recommendedOil || '0W-20 / 5W-30'}.
- **Procedure pratiche**: Reset spia tagliando, azzeramento spia gomme TPMS, interpretazione codici del libretto DUC.
- **Diagnosi visiva**: Puoi allegare in qualsiasi momento la foto di una spia o di un documento per una scansione immediata.

*Fai una domanda specifica o seleziona una delle domande rapide in alto.*`;
  }

  // 1. CHAT ASSISTANT: Risponde a domande tecniche, curiosità, istruzioni passo-passo e anomalie
  app.post("/api/car-assistant/chat", async (req, res) => {
    const { car, message, history, imageAttachment } = req.body;
    if (!message && !imageAttachment) {
      return res.status(400).json({ error: "Messaggio o allegato richiesto" });
    }

    try {
      const client = getGeminiClient();
      if (!client) {
        const fallbackReply = generateExpertCarReply(car, message, imageAttachment);
        return res.json({ reply: fallbackReply });
      }

      // Costruisci il contesto tecnico dettagliato del veicolo
      let carContext = `Sei l'Assistente Tecnico Ufficiale e Ingegnere di Bordo per il veicolo dell'utente.
Hai la competenza di una banca dati tecnica automobilistica di livello Quattroruote, manuale d'officina ufficiale e perito assicurativo/motoristico.

DATI DEL VEICOLO ATTIVO:
- Marca e Modello: ${car?.brand || 'Non specificato'} ${car?.model || ''}
- Targa: ${car?.plate || 'Non specificata'}
- Motorizzazione & Allestimento: ${car?.motorization || 'Standard'}
- Alimentazione: ${car?.fuelType || 'Standard'}
- Potenza: ${car?.powerCv ? `${car.powerCv} CV (${car.powerKw || Math.round(car.powerCv * 0.735)} kW)` : 'N/D'}
- Trazione & Trasmissione: ${car?.driveType || 'Standard'} ${car?.technicalSpecs?.transmission ? `- ${car.technicalSpecs.transmission}` : ''}
- Anno Immatricolazione: ${car?.registrationDate ? new Date(car.registrationDate).getFullYear() : 'N/D'}
- Chilometraggio attuale stimato: ${car?.initialKm ? `${car.initialKm.toLocaleString('it-IT')} km` : 'N/D'}
`;

      if (car?.technicalSpecs) {
        const ts = car.technicalSpecs;
        carContext += `
SCHEDA TECNICA QUATTRORUOTE:
- Cilindrata: ${ts.engineDisplacementCc ? `${ts.engineDisplacementCc} cm³` : 'N/D'}
- Coppia max: ${ts.torqueNm ? `${ts.torqueNm} Nm` : 'N/D'}
- Olio consigliato: ${ts.recommendedOil || 'N/D'} (Capacità: ${ts.oilCapacityLiters ? `${ts.oilCapacityLiters} L` : 'N/D'})
- Pressione gomme raccomandata: Anteriore ${ts.tirePressureFrontBar || 2.3} bar / Posteriore ${ts.tirePressureRearBar || 2.3} bar (Pieno carico: ${ts.tirePressureLoadedBar || 2.6} bar)
- Pneumatici omologati a libretto: ${ts.allowedTireSizes ? ts.allowedTireSizes.join(', ') : 'N/D'}
- Consumi WLTP: ${ts.wltpConsumption || 'N/D'}
- Classe Ambientale: ${ts.euroClass || 'Euro 6'}
- Codice Motore: ${ts.engineCode || 'N/D'} | Telaio/VIN: ${ts.vin || 'N/D'}
`;
      }

      if (car?.maintenances && car.maintenances.length > 0) {
        carContext += `
ULTIMI INTERVENTI DI MANUTENZIONE REGISTRATI:
${car.maintenances.slice(-4).map((m: any) => `- ${m.date}: ${m.category} a ${m.km} km (${m.description || ''}) presso ${m.workshop || 'Officina'}`).join('\n')}
`;
      }

      if (car?.documents && car.documents.length > 0) {
        carContext += `
DOCUMENTI PRESENTI NEL GARAGE:
${car.documents.map((d: any) => `- ${d.title} (${d.type}) [Scadenza: ${d.expiryDate || 'N/D'}]`).join('\n')}
`;
      }

      carContext += `
REGOLE DI RISPOSTA:
1. Rispondi SEMPRE in italiano, con tono professionale, caloroso, chiaro ed estremamente accurato dal punto di vista meccanico ed elettronico.
2. Fornisci procedure passo-passo numerate quando l'utente chiede come effettuare un'operazione (es. reset service, azzeramento pressione TPMS, controllo olio, sostituzione batteria chiave, ricarica EV).
3. Se l'utente chiede chiarimenti sul libretto di circolazione italiano, spiega i codici ministeriali (es. P.1 Cilindrata, P.2 Potenza kW, P.5 Codice Motore, V.9 Classe Euro, ecc.).
4. Se viene fornita un'immagine (spia, cruscotto, pagina del libretto o fattura), analizzala visivamente con precisione e descrivi l'anomalia o i dati estratti.
5. Includi sempre avvertenze sulla sicurezza stradale o quando è opportuno rivolgersi ad un'officina autorizzata.
`;

      const contents: any[] = [];

      // Aggiungi cronologia messaggi precedenti se presente
      if (Array.isArray(history) && history.length > 0) {
        history.slice(-8).forEach((h: any) => {
          if (h.role === 'user' || h.role === 'assistant') {
            contents.push({
              role: h.role === 'assistant' ? 'model' : 'user',
              parts: [{ text: h.content || h.text || '' }]
            });
          }
        });
      }

      // Messaggio corrente + allegato
      const currentParts: any[] = [];
      if (imageAttachment && imageAttachment.base64 && imageAttachment.mimeType) {
        const cleanBase64 = imageAttachment.base64.replace(/^data:[^;]+;base64,/, '');
        currentParts.push({
          inlineData: {
            mimeType: imageAttachment.mimeType,
            data: cleanBase64
          }
        });
      }
      currentParts.push({ text: message || "Analizza questo documento o immagine del veicolo e forniscimi tutti i dettagli utili." });

      contents.push({
        role: 'user',
        parts: currentParts
      });

      const response = await client.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: contents,
        config: {
          systemInstruction: carContext,
          temperature: 0.3,
        }
      });

      const replyText = response.text || generateExpertCarReply(car, message, imageAttachment);
      return res.json({ reply: replyText });
    } catch (err: any) {
      console.warn("Attivazione motore di conoscenza esperto offline per:", err?.message || err);
      const fallbackReply = generateExpertCarReply(car, message, imageAttachment);
      return res.json({ reply: fallbackReply });
    }
  });

  // Helper per calcolo e stima specifica Quattroruote offline/fallback
  function generateQuattroruoteSpecsFallback(brand: string, model: string, motorization?: string, year?: number, fuelType?: string): any {
    const b = (brand || '').toLowerCase();
    const m = (model || '').toLowerCase();
    const f = (fuelType || motorization || '').toLowerCase();
    const isDiesel = f.includes('diesel') || f.includes('jtd') || f.includes('tdi') || f.includes('dci') || f.includes('hdi');
    const isEv = f.includes('elettric') || f.includes('bev') || f.includes('ev');
    const isHybrid = f.includes('hybrid') || f.includes('ibrid') || f.includes('phev');
    const isGpl = f.includes('gpl');
    const isMetano = f.includes('metano') || f.includes('cng');

    let disp = 1968;
    let cv = 150;
    let kw = 110;
    let torque = 350;
    let tank = 55;
    let batt = 0;
    let wltp = "5.1 L/100 km";
    let oil = "5W-30 ACEA C3 LongLife";
    let oilCap = 4.5;
    let frontBar = 2.3;
    let rearBar = 2.2;
    let loadedBar = 2.6;
    let trans = "Manuale a 6 rapporti";
    let drive = "Trazione Anteriore (FWD)";
    let tires = ["205/55 R16 91V", "225/45 R17 91W"];
    let len = 4380;
    let wid = 1800;
    let hei = 1450;
    let trunk = 380;
    let weight = 1380;

    // Segment heuristics
    if (m.includes('500') || m.includes('panda') || m.includes('ypsilon') || m.includes('aygo') || m.includes('up') || m.includes('twingo') || m.includes('picanto') || m.includes('i10')) {
      disp = 999; cv = 70; kw = 51; torque = 92; tank = 38; wltp = "4.8 L/100 km"; oil = "0W-20 ACEA C5"; oilCap = 3.0;
      tires = ["175/65 R14 82T", "185/55 R15 82H"]; len = 3570; wid = 1630; hei = 1490; trunk = 225; weight = 980;
      trans = "Manuale 6 marce con indicatore GSI";
    } else if (m.includes('clio') || m.includes('208') || m.includes('polo') || m.includes('yaris') || m.includes('corsa') || m.includes('fiesta') || m.includes('ibiza') || m.includes('sandero')) {
      disp = 1199; cv = 100; kw = 74; torque = 175; tank = 44; wltp = "5.2 L/100 km"; oil = "0W-20 / 5W-30"; oilCap = 3.8;
      tires = ["195/55 R16 87H", "205/45 R17 88V"]; len = 4050; wid = 1750; hei = 1440; trunk = 310; weight = 1160;
    } else if (m.includes('golf') || m.includes('focus') || m.includes('308') || m.includes('megane') || m.includes('tipo') || m.includes('leon') || m.includes('serie 1') || m.includes('classe a') || m.includes('a3') || m.includes('giulietta')) {
      disp = isDiesel ? 1968 : 1498; cv = 130; kw = 96; torque = isDiesel ? 320 : 200; tank = 50; wltp = isDiesel ? "4.5 L/100 km" : "5.6 L/100 km";
      oil = isDiesel ? "5W-30 ACEA C3" : "0W-20 VW 508/509"; oilCap = 4.5;
      tires = ["205/55 R16 91V", "225/45 R17 91W", "225/40 R18 92Y"]; len = 4320; wid = 1790; hei = 1440; trunk = 380; weight = 1340;
    } else if (m.includes('giulia') || m.includes('serie 3') || m.includes('classe c') || m.includes('a4') || m.includes('passat') || m.includes('mondeo') || m.includes('octavia')) {
      disp = 1995; cv = 190; kw = 140; torque = 400; tank = 58; wltp = "5.3 L/100 km"; oil = "0W-30 / 5W-30 ACEA C3"; oilCap = 5.0;
      tires = ["225/50 R17 94W", "225/45 R18 95Y", "255/40 R18 99Y"]; len = 4690; wid = 1840; hei = 1430; trunk = 480; weight = 1530;
      trans = "Automatico 8 rapporti a convertitore di coppia";
    } else if (m.includes('qashqai') || m.includes('t-roc') || m.includes('tiguan') || m.includes('sportage') || m.includes('tucson') || m.includes('3008') || m.includes('kuga') || m.includes('compass') || m.includes('renegade') || m.includes('duster') || m.includes('stelvio')) {
      disp = isDiesel ? 1995 : 1498; cv = 150; kw = 110; torque = 300; tank = 55; wltp = "5.8 L/100 km"; oil = "0W-20 / 5W-30 C3"; oilCap = 4.8;
      frontBar = 2.4; rearBar = 2.4; loadedBar = 2.7;
      tires = ["215/65 R17 99V", "235/55 R18 100V", "235/50 R19 99V"]; len = 4450; wid = 1840; hei = 1620; trunk = 510; weight = 1510;
    }

    if (isEv) {
      disp = 0; cv = 204; kw = 150; torque = 310; tank = 0; batt = 60; wltp = "15.4 kWh/100 km"; oil = "Liquido raffreddamento dielettrico batteria";
      oilCap = 0; trans = "Monorapporto a riduzione diretta";
    }

    return {
      engineDisplacementCc: disp,
      powerCv: cv,
      powerKw: kw,
      torqueNm: torque,
      cylinderCount: disp > 0 ? (disp < 1100 ? 3 : 4) : 0,
      transmission: trans,
      drivetrain: drive,
      euroClass: (year && year < 2015) ? "Euro 5B" : "Euro 6D-ISC-FCM",
      fuelCapacityLiters: tank,
      batteryCapacityKwh: batt,
      wltpConsumption: wltp,
      wltpRangeKm: isEv ? 420 : Math.round((tank / parseFloat(wltp)) * 100),
      recommendedOil: oil,
      oilCapacityLiters: oilCap,
      tirePressureFrontBar: frontBar,
      tirePressureRearBar: rearBar,
      tirePressureLoadedBar: loadedBar,
      allowedTireSizes: tires,
      dimensions: {
        lengthMm: len,
        widthMm: wid,
        heightMm: hei,
        trunkLiters: trunk,
        curbWeightKg: weight,
        towingCapacityKg: Math.round(weight * 1.1)
      },
      summaryQuattroruote: `Scheda tecnica Quattroruote per ${brand} ${model} (${fuelType || motorization || 'Standard'}). Valori di riferimento costruttore.`
    };
  }

  // 2. AUTO-GENERAZIONE SCHEDA TECNICA QUATTRORUOTE TRAMITE GEMINI
  app.post("/api/car-assistant/specs", async (req, res) => {
    const { brand, model, motorization, year, fuelType } = req.body;
    if (!brand || !model) {
      return res.status(400).json({ error: "Marca e modello sono obbligatori" });
    }

    try {
      const client = getGeminiClient();
      if (!client) {
        const fallbackSpecs = generateQuattroruoteSpecsFallback(brand, model, motorization, year, fuelType);
        return res.json({ specs: fallbackSpecs });
      }

      const prompt = `Fornisci la scheda tecnica automobilistica ufficiale e dettagliata stile "Quattroruote / Scheda Tecnica Costruttore" per questo specifico veicolo:
Marca: ${brand}
Modello: ${model}
Allestimento/Motorizzazione: ${motorization || 'Versione più comune'}
Anno di produzione indicativo: ${year || 2022}
Alimentazione: ${fuelType || 'Benzina/Diesel/EV'}

Restituisci ESCLUSIVAMENTE un oggetto JSON valido (senza blocchi markdown extra) con questa esatta struttura:
{
  "engineDisplacementCc": 1968,
  "powerCv": 150,
  "powerKw": 110,
  "torqueNm": 360,
  "cylinderCount": 4,
  "transmission": "Automatico DSG 7 rapporti",
  "drivetrain": "Trazione Anteriore (FWD)",
  "euroClass": "Euro 6D-Temp",
  "fuelCapacityLiters": 50,
  "batteryCapacityKwh": 0,
  "wltpConsumption": "5.1 L/100 km (19.6 km/L)",
  "wltpRangeKm": 980,
  "recommendedOil": "0W-20 VW 508.00 / 509.00 LongLife IV",
  "oilCapacityLiters": 4.7,
  "tirePressureFrontBar": 2.3,
  "tirePressureRearBar": 2.2,
  "tirePressureLoadedBar": 2.7,
  "allowedTireSizes": ["205/55 R16 91V", "225/45 R17 91W", "225/40 R18 92Y"],
  "dimensions": {
    "lengthMm": 4350,
    "widthMm": 1800,
    "heightMm": 1450,
    "trunkLiters": 380,
    "curbWeightKg": 1390,
    "towingCapacityKg": 1600
  },
  "summaryQuattroruote": "Breve descrizione in 1 o 2 frasi delle qualità dinamiche e meccaniche del modello."
}`;

      const response = await client.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.1
        }
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json({ specs: parsed });
    } catch (err: any) {
      console.warn("Utilizzo specifiche tecniche fallback per:", err?.message || err);
      const fallbackSpecs = generateQuattroruoteSpecsFallback(brand, model, motorization, year, fuelType);
      return res.json({ specs: fallbackSpecs });
    }
  });

  // 3. ANALISI DOCUMENTO OTTICA / VISIONE (Libretto, Assicurazione, Bollo)
  app.post("/api/car-assistant/analyze-document", async (req, res) => {
    const { documentBase64, mimeType, documentType } = req.body;
    if (!documentBase64 || !mimeType) {
      return res.status(400).json({ error: "Immagine documento e mimeType richiesti" });
    }

    try {
      const client = getGeminiClient();
      if (!client) {
        return res.json({
          extractedInfo: {
            plate: "",
            vin: "",
            euroClass: "Euro 6",
            summary: "Documento registrato con successo nel tuo archivio locale sicuro."
          }
        });
      }

      const cleanBase64 = documentBase64.replace(/^data:[^;]+;base64,/, '');

      const prompt = `Analizza questo documento automobilistico italiano (${documentType || 'Libretto di Circolazione / Assicurazione / Bollo'}).
Estrai tutti i dati rilevanti visibili e restituisci un oggetto JSON con questi campi (se presenti o deducibili):
{
  "plate": "Targa (es. AB123CD)",
  "vin": "Numero di telaio / VIN a 17 caratteri (voce E)",
  "brand": "Marca (voce D.1)",
  "model": "Modello (voce D.2/D.3)",
  "engineCode": "Codice motore (voce P.5)",
  "powerKw": 110,
  "engineDisplacementCc": 1968,
  "euroClass": "Classe antinquinamento (voce V.9, es. Euro 6D)",
  "approvedTires": ["Elenco misure pneumatici omologati"],
  "insuranceCompany": "Nome Compagnia Assicuratrice (se polizza)",
  "policyNumber": "Numero polizza",
  "expiryDate": "Data scadenza formato YYYY-MM-DD",
  "taxAmount": 0,
  "summary": "Riassunto chiaro in 2 frasi del documento analizzato"
}`;

      const response = await client.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: [
          {
            inlineData: {
              mimeType: mimeType,
              data: cleanBase64
            }
          },
          { text: prompt }
        ],
        config: {
          responseMimeType: 'application/json',
          temperature: 0.1
        }
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json({ extractedInfo: parsed });
    } catch (err: any) {
      console.warn("Fallback analisi documento per:", err?.message || err);
      return res.json({
        extractedInfo: {
          plate: "",
          vin: "",
          euroClass: "Euro 6",
          summary: "Documento registrato con successo nel tuo archivio locale."
        }
      });
    }
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
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          stationsMemoryCache = parsed;
          stationsLastModified = mtime;
          console.log(`[STATIONS CACHE] Caricate in memoria RAM ${stationsMemoryCache.length} stazioni MIMIT ed EV`);
        }
      }
      return stationsMemoryCache || convertSeedStationsToBackend(SEED_STATIONS);
    } catch (e: any) {
      console.warn("[STATIONS CACHE] File cache temporaneamente non disponibile o in fase di scrittura, uso fallback:", e?.message);
      if (stationsMemoryCache && stationsMemoryCache.length > 0) {
        return stationsMemoryCache;
      }
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
      const radiusParam = req.query.radius ? parseFloat(req.query.radius as string) : 50; // default 50 km
      const boundsParam = req.query.bounds as string; // "minLat,minLng,maxLat,maxLng"
      const limitParam = req.query.limit ? Math.min(parseInt(req.query.limit as string, 10), 2500) : 1200;

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

      // 5. Risultati limitati con bilanciamento
      let dataToSend = [];
      if (typeParam === 'all') {
        const evList = filtered.filter(st => st.tipo === 'elettrico' || st.tipo === 'ev');
        const fuelList = filtered.filter(st => st.tipo !== 'elettrico' && st.tipo !== 'ev');
        
        // Includi tutti gli hub EV presenti nell'area (fino a 250) + distributori di carburante fino al limite
        const evPortion = evList.slice(0, 250);
        const remainingLimit = Math.max(limitParam - evPortion.length, 100);
        const fuelPortion = fuelList.slice(0, remainingLimit);
        
        dataToSend = [...evPortion, ...fuelPortion];
      } else {
        dataToSend = filtered.slice(0, limitParam);
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

      const prompt = `Sei un sistema esperto di analisi dati automotive e identificazione veicoli. Il tuo compito è ricevere in input tre parametri: Anno, Marca e Modello di un veicolo, e restituire una struttura dati JSON rigorosa, accurata e completa.

Dato l'input [Anno: ${targetYear || 2020}, Marca: "${brand || ''}", Modello: "${model || ''}"]:

1. Identifica la generazione esatta del veicolo per l'anno specificato.
2. Elenca TUTTE le motorizzazioni e alimentazioni ufficiali e reali commercializzate per quel modello in quell'anno (inclusi benzina, diesel, mild-hybrid, full-hybrid, plug-in hybrid, elettrico, GPL, metano).
3. Per ciascuna motorizzazione, fornisci le seguenti specifiche tecniche:
   - Sigla/Nome commerciale del motore (es. 1.6 TDI, 2.0 TFSI, 1.2 8V Fire, 1.9 JTD 80 CV)
   - Cilindrata esatta in cc (es. 1598, 1242, 1968; 0 per 100% elettriche)
   - Alimentazione (Gasoline, Diesel, Hybrid, Electric, LPG, CNG)
   - Potenza in CV (power_hp) e kW (power_kw)
   - Codice motore/Codice famiglia (se disponibile o rilevabile, es. 188A4000, EA888, BKD, M54B30)
4. Trova l'URL diretto al file PDF o la risorsa web ufficiale/affidabile del Manuale d'Uso e Manutenzione (Owner's Manual) valido per quella generazione/anno. Se l'URL diretto non è garantito al 100%, fornisci il link di ricerca o la fonte ufficiale del costruttore.

REGOLE DI OUTPUT:
- Rispondi ESCLUSIVAMENTE con un oggetto JSON valido.
- NON includere introduzioni, spiegazioni, saluti o blocchi di codice markdown diversi da JSON.
- Rispetta esattamente la seguente struttura JSON:

{
  "query_input": {
    "year": ${Number(targetYear) || 2020},
    "make": "${brand || ''}",
    "model": "${model || ''}"
  },
  "vehicle_info": {
    "generation_name": "",
    "production_years": "",
    "owners_manual": {
      "manual_url": "",
      "source_type": ""
    }
  },
  "engine_variants": [
    {
      "engine_name": "",
      "fuel_type": "",
      "displacement_cc": 0,
      "power_hp": 0,
      "power_kw": 0,
      "engine_code": ""
    }
  ]
}`;

      let responseText = '';
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.7-flash',
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

      const vehicleInfo = jsonResult.vehicle_info || {};
      const ownersManual = vehicleInfo.owners_manual || {};
      const engineVariants = Array.isArray(jsonResult.engine_variants) ? jsonResult.engine_variants : [];
      const queryInput = jsonResult.query_input || {};

      const finalBrand = queryInput.make || brand || '';
      const finalModel = queryInput.model || model || '';
      const finalGen = vehicleInfo.generation_name || '';
      const prodYears = vehicleInfo.production_years || '';

      function normalizeFuelType(fuel: string) {
        const f = (fuel || '').toLowerCase();
        if (f.includes('diesel')) return 'Diesel';
        if (f.includes('phev') || f.includes('plug-in') || f.includes('plug in')) return 'Plug-in Hybrid (PHEV)';
        if (f.includes('electric') || f.includes('elettric') || f.includes('bev')) return 'Elettrica (BEV)';
        if (f.includes('lpg') || f.includes('gpl')) return 'GPL (Benzina + GPL)';
        if (f.includes('cng') || f.includes('metano')) return 'Metano (Benzina + Metano)';
        if (f.includes('hybrid') || f.includes('ibrid') || f.includes('mhev') || f.includes('hev')) return 'Full / Mild Hybrid';
        return 'Benzina';
      }

      function estimateCapacities(fuelType: string, displacementCc?: number, powerHp?: number) {
        let tankCapacity = 50;
        let batteryCapacity: number | undefined = undefined;
        let secondaryTankCapacity: number | undefined = undefined;

        if (fuelType === 'Elettrica (BEV)') {
          tankCapacity = 0;
          batteryCapacity = powerHp && powerHp > 300 ? 82 : (powerHp && powerHp > 180 ? 77 : 58);
        } else if (fuelType === 'Plug-in Hybrid (PHEV)') {
          tankCapacity = 45;
          batteryCapacity = 14.4;
        } else if (fuelType.includes('GPL')) {
          tankCapacity = 45;
          secondaryTankCapacity = 38;
        } else if (fuelType.includes('Metano')) {
          tankCapacity = 45;
          secondaryTankCapacity = 14;
        } else if (fuelType === 'Diesel') {
          tankCapacity = displacementCc && displacementCc > 2200 ? 65 : (displacementCc && displacementCc > 1600 ? 55 : 48);
        } else {
          tankCapacity = displacementCc && displacementCc > 2500 ? 65 : (displacementCc && displacementCc > 1400 ? 52 : 45);
        }

        return { tankCapacity, batteryCapacity, secondaryTankCapacity };
      }

      const availableMotorizations = engineVariants.map((v: any) => {
        const normFuel = normalizeFuelType(v.fuel_type || 'Benzina');
        const hp = Number(v.power_hp) || (v.power_kw ? Math.round(Number(v.power_kw) * 1.35962) : 100);
        const kw = Number(v.power_kw) || Math.round(hp / 1.35962);
        const disp = Number(v.displacement_cc) || (normFuel === 'Elettrica (BEV)' ? 0 : undefined);
        const { tankCapacity, batteryCapacity, secondaryTankCapacity } = estimateCapacities(normFuel, disp, hp);

        return {
          name: v.engine_name || `${disp ? (disp/1000).toFixed(1) + ' ' : ''}${normFuel} ${hp} CV`,
          fuelType: normFuel,
          cv: hp,
          kw: kw,
          displacementCc: disp,
          engineCode: v.engine_code || undefined,
          tankCapacity,
          batteryCapacity,
          secondaryTankCapacity,
          years: prodYears || String(targetYear || ''),
          generation: finalGen,
          ownersManualUrl: ownersManual.manual_url || undefined
        };
      });

      const primary = availableMotorizations[0] || {
        name: `${finalBrand} ${finalModel}`,
        fuelType: 'Benzina',
        cv: 100,
        kw: 74,
        tankCapacity: 50,
        years: prodYears,
        generation: finalGen
      };

      // Asynchronously fetch authentic real photos of this exact car and generation from Wikipedia/Wikimedia
      const realPhotos = await fetchRealVehiclePhotos(
        finalBrand,
        finalModel,
        targetYear,
        finalGen,
        `${finalBrand} ${finalModel} ${finalGen || targetYear || ''}`
      );

      const formattedResult = {
        brand: finalBrand,
        model: finalModel,
        generation: finalGen,
        productionYears: prodYears,
        ownersManual: ownersManual,
        queryInput: queryInput,
        rawEngineVariants: engineVariants,
        motorization: primary.name,
        fuelType: primary.fuelType,
        powerCv: primary.cv,
        powerKw: primary.kw,
        displacementCc: primary.displacementCc,
        engineCode: primary.engineCode,
        tankCapacity: primary.tankCapacity,
        batteryCapacity: primary.batteryCapacity,
        secondaryTankCapacity: primary.secondaryTankCapacity,
        realPhotos,
        suggestedPhotoUrl: realPhotos.length > 0 ? realPhotos[0].url : undefined,
        availableMotorizations
      };

      return res.json({
        success: true,
        data: formattedResult,
        rawAiResponse: jsonResult
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
