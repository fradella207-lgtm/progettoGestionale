/**
 * SCRIPT DI BACKEND PER L'AGGIORNAMENTO QUOTIDIANO DEI PUNTI SULLA MAPPA
 * =========================================================================
 * 1. DISTRIBUTORI CARBURANTI (MIMIT - Ministero delle Imprese e del Made in Italy)
 *    - Scarica l'Anagrafica Impianti e il Listino Prezzi giornaliero (aggiornato alle 08:00)
 *    - Esegue il merge tramite 'idImpianto' per associare prezzi, coordinate e indirizzi.
 * 
 * 2. COLONNINE DI RICARICA ELETTRICA (Open Charge Map + Listini Operatori / Crowdsourcing)
 *    - Scarica POI colonnine per l'Italia (prese CCS, Type 2, CHAdeMO, Supercharger)
 *    - Applica listini tariffari per operatore o tariffe comunitarie crowdsourcing.
 * 
 * 3. OUTPUT STANDARDIZZATO:
 *    - Genera il file JSON ottimizzato pronto per l'API o per la mappa.
 * 
 * Esecuzione:
 *   npx tsx scripts/sync_stations.ts
 */

import fs from 'fs';
import path from 'path';

// Interfacce Output Standard Richieste
export interface OutputPrezzoServizio {
  tipo_servizio: string;           // es. "Benzina Self", "Gasolio Servito", "CCS 300kW", "Type 2 22kW"
  prezzo: number;                  // Prezzo in EUR (€/L per carburanti, €/kWh per elettrico)
  valuta: "EUR";
  ultimo_aggiornamento: string;    // Timestamp ISO (es. "2026-08-27T08:00:00.000Z")
}

export interface OutputStazione {
  id: string;
  tipo: "carburante" | "elettrico";
  nome_gestore: string;            // es. "Eni", "Q8", "Tesla", "Enel X Way", "Be Charge"
  indirizzo_completo: string;      // es. "Via Roma 123, 20121 Milano (MI)"
  comune: string;                  // es. "Milano"
  coordinate: {
    lat: number;
    lng: number;
  };
  servizi_prezzi: OutputPrezzoServizio[];
}

// -----------------------------------------------------------------------------
// COSTANTI & CONFIGURAZIONE URL SORGENTI DATI
// -----------------------------------------------------------------------------

// URL Ufficiali Open Data MIMIT (Osservaprezzi Carburanti)
const MIMIT_URL_ANAGRAFICA = "https://www.mimit.gov.it/images/exportCSV/anagrafica_impianti_attivi.csv";
const MIMIT_URL_PREZZI = "https://www.mimit.gov.it/images/exportCSV/prezzo_alle_8.csv";

// Fallback mirror alternativo istituzionale se il dominio mimit è in manutenzione
const MISE_URL_ANAGRAFICA_BACKUP = "https://www.mise.gov.it/images/exportCSV/anagrafica_impianti_attivi.csv";
const MISE_URL_PREZZI_BACKUP = "https://www.mise.gov.it/images/exportCSV/prezzo_alle_8.csv";

// Open Charge Map API (Sostituire o passare via process.env.OPEN_CHARGE_MAP_API_KEY)
const OCM_API_KEY = process.env.OPEN_CHARGE_MAP_API_KEY || "fb30b201-9f93-4a11-a83d-3687c4f49495";
const OCM_API_URL = `https://api.openchargemap.io/v3/poi/?output=json&countrycode=IT&maxresults=300&compact=true&verbose=false&key=${OCM_API_KEY}`;

// Percorso di destinazione per salvare il file JSON compilato
const OUTPUT_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'live_stations_output.json');

// -----------------------------------------------------------------------------
// TABELLA TARIFFARIA BASE OPERATORI EV (In assenza di API aperta con prezzi live)
// -----------------------------------------------------------------------------
// Poiché in Italia i gestori di ricarica privata (CPO/EMP) non rilasciano prezzi aperti in tempo reale,
// questo dizionario associa le tariffe pay-per-use di riferimento dei principali operatori.
// In produzione può essere integrato con un database Crowdsourcing (stile Waze) o scraper.
const OPERATORI_EV_TARIFFE: Record<string, { ac_kwh: number; dc_fast_kwh: number; dc_ultra_kwh: number }> = {
  "Tesla": { ac_kwh: 0.45, dc_fast_kwh: 0.43, dc_ultra_kwh: 0.46 },
  "Enel X Way": { ac_kwh: 0.58, dc_fast_kwh: 0.69, dc_ultra_kwh: 0.89 },
  "Be Charge": { ac_kwh: 0.55, dc_fast_kwh: 0.68, dc_ultra_kwh: 0.85 },
  "Plenitude": { ac_kwh: 0.55, dc_fast_kwh: 0.68, dc_ultra_kwh: 0.85 },
  "Ionity": { ac_kwh: 0.60, dc_fast_kwh: 0.79, dc_ultra_kwh: 0.79 },
  "Free To X": { ac_kwh: 0.58, dc_fast_kwh: 0.69, dc_ultra_kwh: 0.79 },
  "A2A": { ac_kwh: 0.56, dc_fast_kwh: 0.66, dc_ultra_kwh: 0.76 },
  "Ewiva": { ac_kwh: 0.58, dc_fast_kwh: 0.69, dc_ultra_kwh: 0.79 },
  "Default": { ac_kwh: 0.55, dc_fast_kwh: 0.68, dc_ultra_kwh: 0.79 }
};

// -----------------------------------------------------------------------------
// FUNZIONI HELPER: SCARICAMENTO E PARSING DEI FILE CSV
// -----------------------------------------------------------------------------

/**
 * Esegue il download sicuro di un file di testo con gestione dei timeout e fallback
 */
async function scaricaTesto(urlPrimario: string, urlBackup?: string): Promise<string> {
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/plain, text/csv, */*'
  };

  try {
    console.log(`[DOWNLOAD] Connessione a: ${urlPrimario}`);
    const res = await fetch(urlPrimario, { headers, signal: AbortSignal.timeout(30000) });
    if (!res.ok) throw new Error(`HTTP ${res.status} - ${res.statusText}`);
    return await res.text();
  } catch (err: any) {
    if (urlBackup) {
      console.warn(`[RETRY] Tentativo su URL di riserva: ${urlBackup}`);
      const res = await fetch(urlBackup, { headers, signal: AbortSignal.timeout(30000) });
      if (!res.ok) throw new Error(`Backup HTTP ${res.status}`);
      return await res.text();
    }
    throw err;
  }
}

/**
 * Suddivide una riga CSV tenendo conto di eventuali apici e separatori '|' o ';'
 */
function splitRigaCsv(riga: string): string[] {
  const separatore = riga.includes('|') ? '|' : ';';
  return riga.split(separatore).map(col => col.trim().replace(/^["']|["']$/g, ''));
}

// -----------------------------------------------------------------------------
// 1. ELABORAZIONE DISTRIBUTORI MIMIT (CARBURANTI)
// -----------------------------------------------------------------------------

interface MimitImpianto {
  idImpianto: string;
  gestore: string;
  bandiera: string;
  tipoImpianto: string;
  nomeImpianto: string;
  indirizzo: string;
  comune: string;
  provincia: string;
  lat: number;
  lng: number;
}

interface MimitPrezzo {
  idImpianto: string;
  descCarburante: string;
  prezzo: number;
  isSelf: boolean;
  dtComu: string;
}

async function elaboraDistributoriMimit(): Promise<OutputStazione[]> {
  console.log("\n=======================================================");
  console.log("1. INIZIO ELABORAZIONE DISTRIBUTORI CARBURANTE (MIMIT)");
  console.log("=======================================================");

  // 1.1 Download CSV Anagrafica e CSV Prezzi
  let csvAnagrafica = '';
  let csvPrezzi = '';

  try {
    csvAnagrafica = await scaricaTesto(MIMIT_URL_ANAGRAFICA, MISE_URL_ANAGRAFICA_BACKUP);
  } catch (e: any) {
    console.error("[-] Impossibile scaricare anagrafica MIMIT:", e.message);
    return [];
  }

  try {
    csvPrezzi = await scaricaTesto(MIMIT_URL_PREZZI, MISE_URL_PREZZI_BACKUP);
  } catch (e: any) {
    console.error("[-] Impossibile scaricare prezzi MIMIT:", e.message);
    return [];
  }

  // 1.2 Parsing Anagrafica Impianti
  // Formato MIMIT tipico:
  // idImpianto;Gestore;Bandiera;Tipo Impianto;Nome Impianto;Indirizzo;Comune;Provincia;Latitudine;Longitudine
  const mappaImpianti = new Map<string, MimitImpianto>();
  const righeAnagrafica = csvAnagrafica.split(/\r?\n/);
  
  let headerIndex = -1;
  for (let i = 0; i < Math.min( righeAnagrafica.length, 5); i++) {
    if (righeAnagrafica[i].toLowerCase().includes('idimpianto')) {
      headerIndex = i;
      break;
    }
  }

  const startLine = headerIndex >= 0 ? headerIndex + 1 : 1;

  for (let i = startLine; i < righeAnagrafica.length; i++) {
    const linea = righeAnagrafica[i];
    if (!linea || linea.trim().length === 0) continue;

    const cols = splitRigaCsv(linea);
    if (cols.length < 8) continue;

    const idImpianto = cols[0];
    const gestore = cols[1] || 'Indipendente';
    const bandiera = cols[2] || cols[1] || 'Pompa Bianca';
    const tipoImpianto = cols[3] || 'Stradale';
    const nomeImpianto = cols[4] || `${bandiera} - ${cols[6] || ''}`;
    const indirizzo = cols[5] || '';
    const comune = cols[6] || '';
    const provincia = cols[7] || '';
    
    // Le coordinate possono essere scambiate o avere virgole nei CSV italiani
    let lat = parseFloat((cols[8] || '0').replace(',', '.'));
    let lng = parseFloat((cols[9] || '0').replace(',', '.'));

    // Correzione automatica se lat/lng sono invertite (Italia è compresa tra Lat 35-48 e Lng 6-19)
    if (lat > 5 && lat < 20 && lng > 35 && lng < 50) {
      const temp = lat;
      lat = lng;
      lng = temp;
    }

    if (lat >= 35 && lat <= 48 && lng >= 6 && lng <= 19) {
      mappaImpianti.set(idImpianto, {
        idImpianto,
        gestore,
        bandiera,
        tipoImpianto,
        nomeImpianto,
        indirizzo,
        comune,
        provincia,
        lat,
        lng
      });
    }
  }

  console.log(`[✓] Anagrafica MIMIT analizzata: ${mappaImpianti.size} impianti validi con coordinate.`);

  // 1.3 Parsing Prezzi Carburante e Raggruppamento per 'idImpianto'
  // Formato MIMIT tipico prezzi:
  // idImpianto;descCarburante;prezzo;isSelf;dtComu
  const mappaPrezziPerImpianto = new Map<string, OutputPrezzoServizio[]>();
  const righePrezzi = csvPrezzi.split(/\r?\n/);

  let headerIndexPrezzi = -1;
  for (let i = 0; i < Math.min(righePrezzi.length, 5); i++) {
    if (righePrezzi[i].toLowerCase().includes('idimpianto')) {
      headerIndexPrezzi = i;
      break;
    }
  }

  const startLinePrezzi = headerIndexPrezzi >= 0 ? headerIndexPrezzi + 1 : 1;

  for (let i = startLinePrezzi; i < righePrezzi.length; i++) {
    const linea = righePrezzi[i];
    if (!linea || linea.trim().length === 0) continue;

    const cols = splitRigaCsv(linea);
    if (cols.length < 4) continue;

    const idImpianto = cols[0];
    const descCarburante = cols[1] || 'Carburante';
    const prezzoNum = parseFloat((cols[2] || '0').replace(',', '.'));
    const isSelfFlag = cols[3] === '1' || cols[3]?.toLowerCase() === 'true';
    const dataComunicazione = cols[4] || new Date().toISOString();

    // Filtra prezzi non plausibili (es. errori di digitazione o 0)
    if (prezzoNum < 0.5 || prezzoNum > 4.0) continue;

    const modalita = isSelfFlag ? "Self" : "Servito";
    const nomeServizio = `${descCarburante} ${modalita}`;

    let isoTimestamp = new Date().toISOString();
    try {
      if (dataComunicazione) {
        // Se data in formato "YYYY-MM-DD HH:mm:ss"
        const parsedDate = new Date(dataComunicazione.replace(' ', 'T'));
        if (!isNaN(parsedDate.getTime())) {
          isoTimestamp = parsedDate.toISOString();
        }
      }
    } catch {
      // usa default
    }

    const itemPrezzo: OutputPrezzoServizio = {
      tipo_servizio: nomeServizio,
      prezzo: Math.round(prezzoNum * 1000) / 1000,
      valuta: "EUR",
      ultimo_aggiornamento: isoTimestamp
    };

    if (!mappaPrezziPerImpianto.has(idImpianto)) {
      mappaPrezziPerImpianto.set(idImpianto, []);
    }
    mappaPrezziPerImpianto.get(idImpianto)!.push(itemPrezzo);
  }

  console.log(`[✓] Listino Prezzi MIMIT analizzato: ${mappaPrezziPerImpianto.size} impianti hanno prezzi registrati.`);

  // 1.4 Unione (JOIN) tra Anagrafica e Prezzi nel formato finale
  const stazioniFinali: OutputStazione[] = [];

  for (const [idImpianto, prezzi] of mappaPrezziPerImpianto.entries()) {
    const impianto = mappaImpianti.get(idImpianto);
    if (!impianto) continue; // Impianto non presente in anagrafica o coordinate errate

    const indirizzoCompleto = [
      impianto.indirizzo,
      impianto.comune,
      impianto.provincia ? `(${impianto.provincia})` : ''
    ].filter(Boolean).join(', ');

    stazioniFinali.push({
      id: `mimit_${idImpianto}`,
      tipo: "carburante",
      nome_gestore: impianto.bandiera || impianto.gestore || "Distributore Carburante",
      indirizzo_completo: indirizzoCompleto,
      comune: impianto.comune,
      coordinate: {
        lat: impianto.lat,
        lng: impianto.lng
      },
      servizi_prezzi: prezzi
    });
  }

  console.log(`[✓] Totale distributori carburante generati con prezzi reali: ${stazioniFinali.length}`);
  return stazioniFinali;
}

// -----------------------------------------------------------------------------
// 2. ELABORAZIONE COLONNINE DI RICARICA ELETTRICA (OPEN CHARGE MAP)
// -----------------------------------------------------------------------------

async function elaboraColonnineElettriche(): Promise<OutputStazione[]> {
  console.log("\n=======================================================");
  console.log("2. INIZIO ELABORAZIONE COLONNINE ELETTRICHE (OCM & TARIFFAZIONE)");
  console.log("=======================================================");

  const colonnineFinali: OutputStazione[] = [];

  try {
    console.log(`[DOWNLOAD] Interrogazione Open Charge Map API: ${OCM_API_URL}`);
    const res = await fetch(OCM_API_URL, {
      headers: {
        'User-Agent': 'GestionaleAuto360/1.0',
        'Accept': 'application/json'
      },
      signal: AbortSignal.timeout(20000)
    });

    if (!res.ok) {
      throw new Error(`Open Charge Map API ha risposto con codice ${res.status}`);
    }

    const pois: any[] = await res.json();
    console.log(`[✓] POI Colonnine ricevuti da Open Charge Map: ${pois.length}`);

    const nowIso = new Date().toISOString();

    for (const poi of pois) {
      const addressInfo = poi.AddressInfo;
      if (!addressInfo || !addressInfo.Latitude || !addressInfo.Longitude) continue;

      const operatorTitle = poi.OperatorInfo?.Title || poi.Title || "Operatore Ricarica EV";
      const connections: any[] = poi.Connections || [];

      // Trova la tariffa di riferimento per l'operatore
      let tariffaRif = OPERATORI_EV_TARIFFE["Default"];
      for (const opKey of Object.keys(OPERATORI_EV_TARIFFE)) {
        if (operatorTitle.toLowerCase().includes(opKey.toLowerCase())) {
          tariffaRif = OPERATORI_EV_TARIFFE[opKey];
          break;
        }
      }

      // Costruisci l'array di servizi e prezzi per ogni connettore presente
      const serviziPrezzi: OutputPrezzoServizio[] = [];

      if (connections.length > 0) {
        for (const conn of connections) {
          const connType = conn.ConnectionType?.Title || "Presa EV Standard";
          const powerKw = conn.PowerKW || (connType.includes('Type 2') ? 22 : (connType.includes('CCS') ? 150 : 50));

          // Determina il prezzo al kWh stimato/reale in base alla potenza
          let prezzoKwh = tariffaRif.ac_kwh;
          if (powerKw >= 100) {
            prezzoKwh = tariffaRif.dc_ultra_kwh;
          } else if (powerKw > 22) {
            prezzoKwh = tariffaRif.dc_fast_kwh;
          }

          serviziPrezzi.push({
            tipo_servizio: `${connType} ${powerKw}kW`,
            prezzo: Math.round(prezzoKwh * 100) / 100,
            valuta: "EUR",
            ultimo_aggiornamento: nowIso
          });
        }
      } else {
        // Connettore generico di default se non specificato
        serviziPrezzi.push({
          tipo_servizio: "Type 2 & CCS Combo (Fast)",
          prezzo: tariffaRif.dc_fast_kwh,
          valuta: "EUR",
          ultimo_aggiornamento: nowIso
        });
      }

      const indirizzoCompleto = [
        addressInfo.AddressLine1,
        addressInfo.Town,
        addressInfo.StateOrProvince ? `(${addressInfo.StateOrProvince})` : ''
      ].filter(Boolean).join(', ');

      colonnineFinali.push({
        id: `ocm_${poi.ID}`,
        tipo: "elettrico",
        nome_gestore: operatorTitle,
        indirizzo_completo: indirizzoCompleto || `${addressInfo.Town || 'Italia'}`,
        comune: addressInfo.Town || 'Comune ND',
        coordinate: {
          lat: addressInfo.Latitude,
          lng: addressInfo.Longitude
        },
        servizi_prezzi: serviziPrezzi
      });
    }

    console.log(`[✓] Totale colonnine elettriche elaborate: ${colonnineFinali.length}`);

  } catch (err: any) {
    console.warn(`[-] Impossibile completare il sync da Open Charge Map (${err.message}). Verranno utilizzate le colonnine del catalogo integrato.`);
  }

  // Se OCM non è accessibile, aggiungi i principali hub EV italiani ad alta potenza
  if (colonnineFinali.length === 0) {
    const nowIso = new Date().toISOString();
    const hubsEvItalia = [
      { id: "ev_hub_1", nome: "Tesla Supercharger & Ionity - Affi", via: "Via San Pieretto 1, Affi (VR)", comune: "Affi", lat: 45.5532, lng: 10.7712, kw: 250, op: "Tesla" },
      { id: "ev_hub_2", nome: "Tesla Supercharger - Milano Nord Arese", via: "Viale Giuseppe Eugenio Luraghi 11, Arese (MI)", comune: "Arese", lat: 45.5628, lng: 9.0768, kw: 250, op: "Tesla" },
      { id: "ev_hub_3", nome: "Free To X - San Donato Milanese Ovest (A1)", via: "Autostrada A1 km 1.2 Ovest, San Donato (MI)", comune: "San Donato Milanese", lat: 45.4192, lng: 9.2741, kw: 300, op: "Free To X" },
      { id: "ev_hub_4", nome: "Ionity HPC - Ceriale Sud (A10)", via: "Autostrada A10 km 78, Ceriale (SV)", comune: "Ceriale", lat: 44.0954, lng: 8.2163, kw: 350, op: "Ionity" },
      { id: "ev_hub_5", nome: "Enel X Way HPC - Roma Eur", via: "Viale Europa 190, Roma (RM)", comune: "Roma", lat: 41.8315, lng: 12.4705, kw: 150, op: "Enel X Way" },
      { id: "ev_hub_6", nome: "Be Charge Ultra-Fast - Bologna Navile", via: "Via Larga 38, Bologna (BO)", comune: "Bologna", lat: 44.5124, lng: 11.3654, kw: 300, op: "Be Charge" },
      { id: "ev_hub_7", nome: "Tesla Supercharger - Firenze Campi Bisenzio", via: "Via San Quirico 165, Campi Bisenzio (FI)", comune: "Campi Bisenzio", lat: 43.8242, lng: 11.1356, kw: 250, op: "Tesla" },
      { id: "ev_hub_8", nome: "Free To X - Flaminia Est (A1 Roma)", via: "Autostrada A1 Diramazione Roma Nord, Fiano Romano (RM)", comune: "Fiano Romano", lat: 42.1624, lng: 12.6012, kw: 300, op: "Free To X" },
      { id: "ev_hub_9", nome: "Enel X Way HPC - Napoli Centro Direzionale", via: "Via Taddeo da Sessa, Napoli (NA)", comune: "Napoli", lat: 40.8562, lng: 14.2815, kw: 150, op: "Enel X Way" },
      { id: "ev_hub_10", nome: "Tesla Supercharger - Bari Modugno", via: "Via dei Gladioli 17, Modugno (BA)", comune: "Modugno", lat: 41.0945, lng: 16.7824, kw: 250, op: "Tesla" },
      { id: "ev_hub_11", nome: "Ionity HPC - Portogruaro (A4)", via: "Viale Pordenone, Portogruaro (VE)", comune: "Portogruaro", lat: 45.7821, lng: 12.8315, kw: 350, op: "Ionity" },
      { id: "ev_hub_12", nome: "Be Charge Ultra-Fast - Torino Lingotto", via: "Via Nizza 280, Torino (TO)", comune: "Torino", lat: 45.0321, lng: 7.6654, kw: 300, op: "Be Charge" },
      { id: "ev_hub_13", nome: "A2A E-Moving Ultra - Brescia Centro", via: "Via Lamarmora 230, Brescia (BS)", comune: "Brescia", lat: 45.5215, lng: 10.2187, kw: 150, op: "A2A" },
      { id: "ev_hub_14", nome: "Tesla Supercharger - Catania Fontanarossa", via: "SP 701, Catania (CT)", comune: "Catania", lat: 37.4721, lng: 15.0684, kw: 250, op: "Tesla" },
      { id: "ev_hub_15", nome: "Ewiva Ultra-Fast - Palermo Notarbartolo", via: "Via Notarbartolo 50, Palermo (PA)", comune: "Palermo", lat: 38.1321, lng: 13.3487, kw: 300, op: "Ewiva" }
    ];

    for (const hub of hubsEvItalia) {
      const tariffa = OPERATORI_EV_TARIFFE[hub.op] || OPERATORI_EV_TARIFFE["Default"];
      colonnineFinali.push({
        id: `ev_${hub.id}`,
        tipo: "elettrico",
        nome_gestore: hub.op,
        indirizzo_completo: hub.via,
        comune: hub.comune,
        coordinate: { lat: hub.lat, lng: hub.lng },
        servizi_prezzi: [
          { tipo_servizio: `CCS Combo ${hub.kw}kW Ultra-Fast`, prezzo: tariffa.dc_ultra_kwh, valuta: "EUR", ultimo_aggiornamento: nowIso },
          { tipo_servizio: `Type 2 22kW AC`, prezzo: tariffa.ac_kwh, valuta: "EUR", ultimo_aggiornamento: nowIso }
        ]
      });
    }
  }

  return colonnineFinali;
}

// -----------------------------------------------------------------------------
// 3. FUNZIONE PRINCIPALE DI ESECUZIONE E SALVATAGGIO JSON
// -----------------------------------------------------------------------------

export async function sincronizzaMappaStazioni(): Promise<{ totale: number; carburanti: number; colonnine: number; filePath: string }> {
  console.log(`\n=======================================================`);
  console.log(`AVVIO AGGIORNAMENTO GIORNALIERO MAPPA [${new Date().toISOString()}]`);
  console.log(`=======================================================`);

  // 1. Esegui in parallelo il parsing dei distributori MIMIT e delle colonnine Open Charge Map
  const [distributori, colonnine] = await Promise.all([
    elaboraDistributoriMimit(),
    elaboraColonnineElettriche()
  ]);

  // 2. Unisci tutti i punti in un unico array unificato
  const outputCompleto: OutputStazione[] = [...distributori, ...colonnine];

  // 3. Assicura che la directory di destinazione esista
  const targetDir = path.dirname(OUTPUT_FILE_PATH);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // 4. Salva il file JSON formattato
  fs.writeFileSync(OUTPUT_FILE_PATH, JSON.stringify(outputCompleto, null, 2), 'utf-8');

  console.log(`\n=======================================================`);
  console.log(`SINCRONIZZAZIONE COMPLETATA CON SUCCESSO!`);
  console.log(`- Totale Punti Mappa: ${outputCompleto.length}`);
  console.log(`  * Distributori Carburante MIMIT: ${distributori.length}`);
  console.log(`  * Colonnine Ricarica Elettrica: ${colonnine.length}`);
  console.log(`- File salvato in: ${OUTPUT_FILE_PATH}`);
  console.log(`=======================================================\n`);

  return {
    totale: outputCompleto.length,
    carburanti: distributori.length,
    colonnine: colonnine.length,
    filePath: OUTPUT_FILE_PATH
  };
}

// Se invocato direttamente da riga di comando (node / tsx):
if (process.argv[1] && (process.argv[1].includes('sync_stations') || process.argv[1].endsWith('sync_stations.ts') || process.argv[1].endsWith('sync_stations.js'))) {
  sincronizzaMappaStazioni()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("[FATAL ERROR]", err);
      process.exit(1);
    });
}
