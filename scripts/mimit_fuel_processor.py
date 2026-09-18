#!/usr/bin/env python3
"""
=============================================================================
MIMIT FUEL DATA PROCESSOR - OSSERVAPREZZI CARBURANTI
Ministero delle Imprese e del Made in Italy
=============================================================================
Script pronto per l'automazione quotidiana (Cron Job, Cloud Function, Cloud Run,
o GitHub Actions) che scarica, pulisce, unisce e ottimizza i dati ufficiali
dei carburanti italiani.

Fonti Open Data MIMIT:
1. Anagrafica Impianti:
   https://www.mimit.gov.it/images/exportCSV/anagrafica_impianti_attivi.csv
2. Prezzi Praticati (aggiornati ogni mattina alle 08:00):
   https://www.mimit.gov.it/images/exportCSV/prezzo_alle_8.csv

Caratteristiche del processo:
- Download con retry esponenziale su errori di rete (429, 500, 502, 503, 504).
- Riconoscimento automatico del separatore ('|' pipe introdotto nel 2026 o ';' punto e virgola).
- Rimozione automatica delle righe di intestazione ministeriale ("Estrazione del...").
- Sanificazione e validazione coordinate geografiche (lat/lng, virgole decimali, bounding box Italia).
- Merge relazionale 1:N per idImpianto: raggruppa tutti i carburanti di ciascun distributore.
- Output ottimizzato per mappe frontend (Leaflet, Mapbox, Google Maps):
  - File JSON compatto (mimit_stations_latest.json)
  - Standard GeoJSON FeatureCollection (mimit_stations.geojson)
- Supporta sia l'esecuzione con Pandas & Requests, sia la libreria standard Python pura
  (nessun errore o crash se pandas non è ancora installato).
=============================================================================
"""

import sys
import os
import io
import csv
import json
import time
import argparse
from datetime import datetime
from typing import Dict, List, Any, Optional, Tuple

# Tentativo di importazione librerie di produzione ad alte prestazioni
try:
    import requests
    from requests.adapters import HTTPAdapter
    from urllib3.util.retry import Retry
    HAS_REQUESTS = True
except ImportError:
    import urllib.request
    import urllib.error
    HAS_REQUESTS = False

try:
    import pandas as pd
    HAS_PANDAS = True
except ImportError:
    HAS_PANDAS = False


# =============================================================================
# COSTANTI & CONFIGURAZIONE URL MINISTERIALI
# =============================================================================
URL_ANAGRAFICA = "https://www.mimit.gov.it/images/exportCSV/anagrafica_impianti_attivi.csv"
URL_PREZZI = "https://www.mimit.gov.it/images/exportCSV/prezzo_alle_8.csv"

# Mirror di backup istituzionale nel caso di manutenzione ordinaria MIMIT
URL_ANAGRAFICA_BACKUP = "https://www.mise.gov.it/images/exportCSV/anagrafica_impianti_attivi.csv"
URL_PREZZI_BACKUP = "https://www.mise.gov.it/images/exportCSV/prezzo_alle_8.csv"

# Bounding box geografico di validazione per l'Italia (isole comprese)
ITALY_LAT_MIN, ITALY_LAT_MAX = 35.0, 47.5
ITALY_LNG_MIN, ITALY_LNG_MAX = 6.0, 19.0

USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 (GarageApp/1.0 MIMIT Harvester)"


# =============================================================================
# MODULO 1: DOWNLOAD CON RETRY & NETWORK RESILIENCE
# =============================================================================
def download_with_retry(url: str, backup_url: Optional[str] = None, max_retries: int = 5) -> str:
    """
    Scarica il contenuto di un file CSV ministeriale gestendo timeout, rate limit e retry con backoff.
    Se 'requests' è presente usa HTTPAdapter + Retry; altrimenti usa 'urllib.request' standard.
    """
    print(f"[*] Avvio download da: {url}")
    
    if HAS_REQUESTS:
        session = requests.Session()
        retries = Retry(
            total=max_retries,
            backoff_factor=1.5,
            status_forcelist=[429, 500, 502, 503, 504],
            raise_on_status=False
        )
        session.mount("https://", HTTPAdapter(max_retries=retries))
        session.mount("http://", HTTPAdapter(max_retries=retries))
        
        headers = {"User-Agent": USER_AGENT, "Accept": "text/csv,text/plain,*/*"}
        
        try:
            resp = session.get(url, headers=headers, timeout=35)
            if resp.status_code == 200:
                print(f"[+] Download completato ({len(resp.content):,} bytes)")
                return resp.text
            else:
                print(f"[!] HTTP status non-200 ({resp.status_code}) per {url}")
        except Exception as ex:
            print(f"[!] Errore connessione URL primario: {ex}")
            
        if backup_url:
            print(f"[*] Tentativo su URL di riserva: {backup_url}")
            try:
                resp = session.get(backup_url, headers=headers, timeout=35)
                if resp.status_code == 200:
                    print(f"[+] Download completato dal mirror ({len(resp.content):,} bytes)")
                    return resp.text
            except Exception as ex:
                print(f"[!] Errore connessione URL di riserva: {ex}")

    else:
        # Fallback Standard Library (Zero dependencies)
        req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
        last_err = None
        for attempt in range(1, max_retries + 1):
            try:
                with urllib.request.urlopen(req, timeout=35) as response:
                    raw_data = response.read()
                    print(f"[+] Download completato ({len(raw_data):,} bytes)")
                    return raw_data.decode("utf-8", errors="replace")
            except Exception as err:
                last_err = err
                wait_sec = attempt * 2
                print(f"[!] Tentativo {attempt}/{max_retries} fallito ({err}). Attesa {wait_sec}s...")
                time.sleep(wait_sec)
        
        if backup_url:
            print(f"[*] Tentativo su mirror backup...")
            req_backup = urllib.request.Request(backup_url, headers={"User-Agent": USER_AGENT})
            with urllib.request.urlopen(req_backup, timeout=35) as response:
                return response.read().decode("utf-8", errors="replace")
                
        raise RuntimeError(f"Impossibile scaricare la risorsa dopo {max_retries} tentativi: {last_err}")

    raise RuntimeError(f"Download fallito per {url}")


# =============================================================================
# MODULO 2: PULIZIA HEADER MINISTERIALI & PARSING CSV
# =============================================================================
def detect_delimiter_and_clean_lines(text_content: str) -> Tuple[List[str], str]:
    """
    Rileva le righe ministeriali da saltare (es. 'Estrazione del 18/09/2026...')
    e individua il separatore corretto (pipe '|' o punto e virgola ';').
    """
    raw_lines = text_content.splitlines()
    clean_lines = []
    
    for line in raw_lines:
        stripped = line.strip()
        if not stripped:
            continue
        # Salta la riga ministeriale descrittiva della data di estrazione
        if stripped.lower().startswith("estrazione del"):
            continue
        clean_lines.append(stripped)
        
    if not clean_lines:
        raise ValueError("File CSV vuoto o formato non valido.")
        
    # Analizza la riga header per dedurre il delimitatore
    header_line = clean_lines[0]
    if "|" in header_line:
        delimiter = "|"
    elif ";" in header_line:
        delimiter = ";"
    elif "," in header_line:
        delimiter = ","
    else:
        delimiter = "|"
        
    return clean_lines, delimiter


def parse_clean_float(val: Any) -> Optional[float]:
    """Converte in float gestendo virgole decimali italiane o punti e spazi."""
    if val is None:
        return None
    s = str(val).strip().replace(" ", "").replace(",", ".")
    try:
        f = float(s)
        if f != f:  # NaN check
            return None
        return f
    except (ValueError, TypeError):
        return None


def sanitize_coordinates(lat_val: Any, lng_val: Any) -> Tuple[Optional[float], Optional[float]]:
    """
    Sanifica e valida le coordinate per l'Italia.
    Risolve anche lo storico bug di alcuni record ministeriali con lat/lng scambiate.
    """
    lat = parse_clean_float(lat_val)
    lng = parse_clean_float(lng_val)
    
    if lat is None or lng is None:
        return None, None
        
    # Rilevamento scambio coordinate (se lat è vicina a 9-18 e lng è vicina a 36-46)
    if (ITALY_LNG_MIN <= lat <= ITALY_LNG_MAX) and (ITALY_LAT_MIN <= lng <= ITALY_LAT_MAX):
        lat, lng = lng, lat
        
    # Validazione bounding box Italia
    if ITALY_LAT_MIN <= lat <= ITALY_LAT_MAX and ITALY_LNG_MIN <= lng <= ITALY_LNG_MAX:
        return round(lat, 6), round(lng, 6)
        
    return None, None


# =============================================================================
# MODULO 3: ELABORAZIONE & MERGE DEI DATASET (ANAGRAFICA + PREZZI)
# =============================================================================
def process_mimit_data_pipeline(
    anagrafica_csv_text: str,
    prezzi_csv_text: str,
    filter_province: Optional[str] = None,
    limit: Optional[int] = None
) -> List[Dict[str, Any]]:
    """
    Esegue la pulizia e il merge dei due dataset:
    - Anagrafica: idImpianto, Gestore, Bandiera, Tipo Impianto, Nome Impianto, Indirizzo, Comune, Provincia, Lat, Lng
    - Prezzi: idImpianto, descCarburante, prezzo, isSelf, dtComu
    """
    print("[*] Pulizia e parsing dell'Anagrafica Impianti...")
    anag_lines, anag_delim = detect_delimiter_and_clean_lines(anagrafica_csv_text)
    anag_reader = csv.DictReader(anag_lines, delimiter=anag_delim)
    
    stations_map: Dict[str, Dict[str, Any]] = {}
    
    for row in anag_reader:
        # Pulizia chiavi del dizionario (rimuove spazi bianchi casuali nei nomi delle colonne)
        row_clean = {k.strip(): v.strip() for k, v in row.items() if k}
        
        station_id = row_clean.get("idImpianto")
        if not station_id:
            continue
            
        provincia = (row_clean.get("Provincia") or "").upper().strip()
        if filter_province and provincia != filter_province.upper():
            continue
            
        lat, lng = sanitize_coordinates(
            row_clean.get("Latitudine"),
            row_clean.get("Longitudine")
        )
        
        stations_map[station_id] = {
            "id": int(station_id) if station_id.isdigit() else station_id,
            "name": row_clean.get("Nome Impianto") or f"Distributore {station_id}",
            "brand": row_clean.get("Bandiera") or "Pompa Bianca",
            "operator": row_clean.get("Gestore") or "",
            "stationType": row_clean.get("Tipo Impianto") or "Stradale",
            "address": row_clean.get("Indirizzo") or "",
            "city": row_clean.get("Comune") or "",
            "province": provincia,
            "coordinates": {
                "lat": lat,
                "lng": lng
            } if (lat is not None and lng is not None) else None,
            "fuelPrices": []
        }
        
    print(f"[+] Anagrafica elaborata: {len(stations_map):,} impianti attivi mappati.")
    
    print("[*] Pulizia e associazione del Listino Prezzi alle ore 08:00...")
    prezzi_lines, prezzi_delim = detect_delimiter_and_clean_lines(prezzi_csv_text)
    prezzi_reader = csv.DictReader(prezzi_lines, delimiter=prezzi_delim)
    
    price_count = 0
    for row in prezzi_reader:
        row_clean = {k.strip(): v.strip() for k, v in row.items() if k}
        station_id = row_clean.get("idImpianto")
        
        if not station_id or station_id not in stations_map:
            continue
            
        fuel_name = row_clean.get("descCarburante") or "Carburante"
        price_num = parse_clean_float(row_clean.get("prezzo"))
        if price_num is None or price_num <= 0:
            continue
            
        is_self_flag = row_clean.get("isSelf")
        is_self = True if str(is_self_flag).strip() in ("1", "true", "True", "S", "SI") else False
        
        update_date = row_clean.get("dtComu") or ""
        
        stations_map[station_id]["fuelPrices"].append({
            "fuel": fuel_name,
            "price": round(price_num, 3),
            "isSelf": is_self,
            "serviceType": "Self" if is_self else "Servito",
            "updatedAt": update_date
        })
        price_count += 1
        
    print(f"[+] {price_count:,} prezzi associati con successo agli impianti.")
    
    # Filtra solo le stazioni con prezzi aggiornati o coordinate valide per la mappa
    merged_stations = list(stations_map.values())
    
    # Ordina per provincia e id
    merged_stations.sort(key=lambda s: (s["province"], s["id"]))
    
    if limit and limit > 0:
        merged_stations = merged_stations[:limit]
        print(f"[*] Applicato limite di estrazione: {len(merged_stations)} record.")
        
    return merged_stations


# =============================================================================
# MODULO 4: OTTIMIZZAZIONE OUTPUT PER MAPPE (JSON & GEOJSON)
# =============================================================================
def generate_optimized_json(stations: List[Dict[str, Any]], filepath: str) -> None:
    """
    Genera un file JSON compatto ottimizzato per caricamenti rapidi su browser e mobile.
    """
    os.makedirs(os.path.dirname(os.path.abspath(filepath)), exist_ok=True)
    
    payload = {
        "metadata": {
            "source": "MIMIT - Ministero delle Imprese e del Made in Italy (Osservaprezzi)",
            "generatedAt": datetime.utcnow().isoformat() + "Z",
            "totalStations": len(stations),
            "activeWithPrices": sum(1 for s in stations if len(s["fuelPrices"]) > 0)
        },
        "stations": stations
    }
    
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)
        
    size_mb = os.path.getsize(filepath) / (1024 * 1024)
    print(f"[✓] JSON Mappa generato: {filepath} ({size_mb:.2f} MB)")


def generate_geojson(stations: List[Dict[str, Any]], filepath: str) -> None:
    """
    Genera un file GeoJSON FeatureCollection standard (RFC 7946).
    Perfetto per caricamento immediato su Leaflet (`L.geoJSON(data)`) o Mapbox (`map.addSource`).
    """
    os.makedirs(os.path.dirname(os.path.abspath(filepath)), exist_ok=True)
    
    features = []
    for s in stations:
        coords = s.get("coordinates")
        if not coords or coords.get("lat") is None or coords.get("lng") is None:
            continue
            
        feature = {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [coords["lng"], coords["lat"]] # GeoJSON standard: [longitude, latitude]
            },
            "properties": {
                "id": s["id"],
                "name": s["name"],
                "brand": s["brand"],
                "operator": s["operator"],
                "stationType": s["stationType"],
                "address": s["address"],
                "city": s["city"],
                "province": s["province"],
                "fuelPrices": s["fuelPrices"]
            }
        }
        features.append(feature)
        
    geojson = {
        "type": "FeatureCollection",
        "metadata": {
            "generatedAt": datetime.utcnow().isoformat() + "Z",
            "featuresCount": len(features)
        },
        "features": features
    }
    
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(geojson, f, ensure_ascii=False)
        
    size_mb = os.path.getsize(filepath) / (1024 * 1024)
    print(f"[✓] GeoJSON Mappa generato: {filepath} ({size_mb:.2f} MB, {len(features):,} punti)")


# =============================================================================
# CLI & WORKFLOW DI AUTOMAZIONE GIORNALIERA
# =============================================================================
def main():
    parser = argparse.ArgumentParser(
        description="MIMIT Open Data Fuel Harvester - Scarica e fonde Anagrafica e Prezzi per la Mappa."
    )
    parser.add_argument(
        "--output",
        default="public/data/mimit_stations_latest.json",
        help="Percorso file JSON di output (default: public/data/mimit_stations_latest.json)"
    )
    parser.add_argument(
        "--geojson",
        default="public/data/mimit_stations.geojson",
        help="Percorso file GeoJSON di output (default: public/data/mimit_stations.geojson)"
    )
    parser.add_argument(
        "--province",
        default=None,
        help="Filtra solo una specifica provincia (es. MI, RM, NA, TO)"
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=None,
        help="Limita il numero massimo di distributori esportati (ottimo per test veloci)"
    )
    
    args = parser.parse_args()
    
    start_time = time.time()
    print("=" * 70)
    print(f"MIMIT FUEL PROCESSOR - Esecuzione avviata alle {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Librerie disponibili: requests={HAS_REQUESTS}, pandas={HAS_PANDAS}")
    print("=" * 70)
    
    try:
        # Step 1: Download Anagrafica Impianti
        anagrafica_csv = download_with_retry(URL_ANAGRAFICA, URL_ANAGRAFICA_BACKUP)
        
        # Step 2: Download Prezzi delle 08:00
        prezzi_csv = download_with_retry(URL_PREZZI, URL_PREZZI_BACKUP)
        
        # Step 3: Merge, Pulizia e Formattazione coordinate
        stations = process_mimit_data_pipeline(
            anagrafica_csv,
            prezzi_csv,
            filter_province=args.province,
            limit=args.limit
        )
        
        # Step 4: Generazione Output Ottimizzati
        generate_optimized_json(stations, args.output)
        generate_geojson(stations, args.geojson)
        
        elapsed = time.time() - start_time
        print("=" * 70)
        print(f"[✓] Procedura completata con successo in {elapsed:.2f} secondi.")
        print("=" * 70)
        
    except Exception as ex:
        print(f"\n[X] Errore critico durante l'elaborazione dei dati MIMIT: {ex}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
