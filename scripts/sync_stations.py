#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
SCRIPT PYTHON PER L'AGGIORNAMENTO QUOTIDIANO DEI PUNTI SULLA MAPPA
===================================================================
1. DISTRIBUTORI CARBURANTE (MIMIT - Ministero delle Imprese e del Made in Italy)
   - Scarica Anagrafica Impianti e Prezzi aggiornati alle 08:00
   - Unisce i dati tramite 'idImpianto' per associare prezzi reali a latitudine e longitudine.

2. COLONNINE DI RICARICA ELETTRICA (Open Charge Map + Tariffe Operatori)
   - Scarica le colonnine geolocalizzate per l'Italia (CCS, Type 2, CHAdeMO)
   - Applica tariffe di riferimento o crowdsourcing.

3. OUTPUT JSON STANDARDIZZATO:
   - Salva il file JSON pronto per essere letto dall'API o dal frontend.

Utilizzo:
   python3 scripts/sync_stations.py
"""

import os
import io
import csv
import json
import urllib.request
from datetime import datetime

# -----------------------------------------------------------------------------
# CONFIGURAZIONE URL SORGENTI DATI
# -----------------------------------------------------------------------------
MIMIT_ANAGRAFICA_URL = "https://www.mimit.gov.it/images/exportCSV/anagrafica_impianti_attivi.csv"
MIMIT_PREZZI_URL = "https://www.mimit.gov.it/images/exportCSV/prezzo_alle_8.csv"

# Backup su vecchio dominio MISE in caso di manutenzione
MISE_ANAGRAFICA_BACKUP = "https://www.mise.gov.it/images/exportCSV/anagrafica_impianti_attivi.csv"
MISE_PREZZI_BACKUP = "https://www.mise.gov.it/images/exportCSV/prezzo_alle_8.csv"

# Open Charge Map API Key (gratuita)
OCM_API_KEY = os.getenv("OPEN_CHARGE_MAP_API_KEY", "fb30b201-9f93-4a11-a83d-3687c4f49495")
OCM_API_URL = f"https://api.openchargemap.io/v3/poi/?output=json&countrycode=IT&maxresults=300&compact=true&verbose=false&key={OCM_API_KEY}"

OUTPUT_JSON_PATH = os.path.join(os.getcwd(), "src", "data", "live_stations_output.json")

# Tariffe di riferimento per operatore EV (in €/kWh)
TARIFFE_EV = {
    "Tesla": {"ac": 0.45, "dc_fast": 0.43, "dc_ultra": 0.46},
    "Enel X Way": {"ac": 0.58, "dc_fast": 0.69, "dc_ultra": 0.89},
    "Be Charge": {"ac": 0.55, "dc_fast": 0.68, "dc_ultra": 0.85},
    "Ionity": {"ac": 0.60, "dc_fast": 0.79, "dc_ultra": 0.79},
    "Free To X": {"ac": 0.58, "dc_fast": 0.69, "dc_ultra": 0.79},
    "Default": {"ac": 0.55, "dc_fast": 0.68, "dc_ultra": 0.79}
}

def scarica_testo(url_primario, url_backup=None):
    """Scarica il contenuto testuale di un URL con gestione del timeout."""
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
    req = urllib.request.Request(url_primario, headers=headers)
    try:
        print(f"[DOWNLOAD] Connessione a: {url_primario}")
        with urllib.request.urlopen(req, timeout=30) as response:
            return response.read().decode('utf-8', errors='ignore')
    except Exception as e:
        if url_backup:
            print(f"[RETRY] Tentativo su URL di riserva: {url_backup}")
            req_bak = urllib.request.Request(url_backup, headers=headers)
            with urllib.request.urlopen(req_bak, timeout=30) as response:
                return response.read().decode('utf-8', errors='ignore')
        raise e

def elabora_distributori_mimit():
    """Scarica e unisce Anagrafica e Prezzi del Ministero (MIMIT)."""
    print("\n--- 1. Elaborazione Distributori Carburante (MIMIT) ---")
    try:
        csv_anagrafica = scarica_testo(MIMIT_ANAGRAFICA_URL, MISE_ANAGRAFICA_BACKUP)
        csv_prezzi = scarica_testo(MIMIT_PREZZI_URL, MISE_PREZZI_BACKUP)
    except Exception as e:
        print(f"[-] Errore download CSV MIMIT: {e}")
        return []

    # 1. Parsing Anagrafica Impianti
    # Formato: idImpianto;Gestore;Bandiera;Tipo Impianto;Nome Impianto;Indirizzo;Comune;Provincia;Latitudine;Longitudine
    mappa_impianti = {}
    reader_ana = csv.reader(io.StringIO(csv_anagrafica), delimiter=';')
    
    start_parsing = False
    for riga in reader_ana:
        if not riga or len(riga) < 8:
            continue
        if 'idimpianto' in riga[0].lower():
            start_parsing = True
            continue
        if not start_parsing:
            continue

        id_impianto = riga[0].strip()
        gestore = riga[1].strip() if len(riga) > 1 else "Indipendente"
        bandiera = riga[2].strip() if len(riga) > 2 else gestore
        indirizzo = riga[5].strip() if len(riga) > 5 else ""
        comune = riga[6].strip() if len(riga) > 6 else ""
        provincia = riga[7].strip() if len(riga) > 7 else ""

        try:
            lat = float(riga[8].replace(',', '.')) if len(riga) > 8 else 0.0
            lng = float(riga[9].replace(',', '.')) if len(riga) > 9 else 0.0
            # Correzione coordinate invertite
            if 5 < lat < 20 and 35 < lng < 50:
                lat, lng = lng, lat

            if 35 <= lat <= 48 and 6 <= lng <= 19:
                mappa_impianti[id_impianto] = {
                    "bandiera": bandiera or gestore or "Distributore",
                    "indirizzo": indirizzo,
                    "comune": comune,
                    "provincia": provincia,
                    "lat": lat,
                    "lng": lng
                }
        except ValueError:
            continue

    print(f"[✓] Impianti validi in anagrafica: {len(mappa_impianti)}")

    # 2. Parsing Prezzi
    # Formato: idImpianto;descCarburante;prezzo;isSelf;dtComu
    mappa_prezzi = {}
    reader_prz = csv.reader(io.StringIO(csv_prezzi), delimiter=';')
    
    start_prz = False
    for riga in reader_prz:
        if not riga or len(riga) < 4:
            continue
        if 'idimpianto' in riga[0].lower():
            start_prz = True
            continue
        if not start_prz:
            continue

        id_imp = riga[0].strip()
        desc_carb = riga[1].strip()
        try:
            prz_num = float(riga[2].replace(',', '.'))
        except ValueError:
            continue

        is_self = riga[3].strip() in ('1', 'true', 'True')
        dt_comu = riga[4].strip() if len(riga) > 4 else datetime.utcnow().isoformat()

        if prz_num < 0.5 or prz_num > 4.0:
            continue

        modalita = "Self" if is_self else "Servito"
        nome_servizio = f"{desc_carb} {modalita}"

        if id_imp not in mappa_prezzi:
            mappa_prezzi[id_imp] = []

        mappa_prezzi[id_imp].append({
            "tipo_servizio": nome_servizio,
            "prezzo": round(prz_num, 3),
            "valuta": "EUR",
            "ultimo_aggiornamento": dt_comu
        })

    # 3. Join finale tra anagrafica e prezzi
    stazioni_output = []
    for id_imp, prezzi in mappa_prezzi.items():
        if id_imp in mappa_impianti:
            info = mappa_impianti[id_imp]
            indirizzo_completo = f"{info['indirizzo']}, {info['comune']} ({info['provincia']})".strip(", ")
            stazioni_output.append({
                "id": f"mimit_{id_imp}",
                "tipo": "carburante",
                "nome_gestore": info["bandiera"],
                "indirizzo_completo": indirizzo_completo,
                "comune": info["comune"],
                "coordinate": {
                    "lat": info["lat"],
                    "lng": info["lng"]
                },
                "servizi_prezzi": prezzi
            })

    print(f"[✓] Distributori carburante elaborati: {len(stazioni_output)}")
    return stazioni_output

def elabora_colonnine_ev():
    """Scarica e converte le colonnine di ricarica da Open Charge Map."""
    print("\n--- 2. Elaborazione Colonnine Elettriche (Open Charge Map) ---")
    headers = {'User-Agent': 'GestionaleAuto360/1.0', 'Accept': 'application/json'}
    req = urllib.request.Request(OCM_API_URL, headers=headers)
    
    colonnine_output = []
    try:
        with urllib.request.urlopen(req, timeout=25) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            print(f"[✓] Punti Open Charge Map ricevuti: {len(data)}")

            now_iso = datetime.utcnow().isoformat() + "Z"
            for poi in data:
                addr = poi.get("AddressInfo")
                if not addr or not addr.get("Latitude") or not addr.get("Longitude"):
                    continue

                operatore = (poi.get("OperatorInfo") or {}).get("Title") or poi.get("Title") or "Operatore EV"
                
                # Trova tariffa operatore
                tariffa = TARIFFE_EV["Default"]
                for op_k in TARIFFE_EV:
                    if op_k.lower() in operatore.lower():
                        tariffa = TARIFFE_EV[op_k]
                        break

                conns = poi.get("Connections") or []
                servizi_prezzi = []

                if conns:
                    for c in conns:
                        title_conn = (c.get("ConnectionType") or {}).get("Title") or "Type 2"
                        power = c.get("PowerKW") or 22
                        prezzo_kwh = tariffa["dc_ultra"] if power >= 100 else (tariffa["dc_fast"] if power > 22 else tariffa["ac"])
                        servizi_prezzi.append({
                            "tipo_servizio": f"{title_conn} {power}kW",
                            "prezzo": round(prezzo_kwh, 2),
                            "valuta": "EUR",
                            "ultimo_aggiornamento": now_iso
                        })
                else:
                    servizi_prezzi.append({
                        "tipo_servizio": "Type 2 & CCS Fast",
                        "prezzo": tariffa["dc_fast"],
                        "valuta": "EUR",
                        "ultimo_aggiornamento": now_iso
                    })

                ind_completo = f"{addr.get('AddressLine1', '')}, {addr.get('Town', '')} ({addr.get('StateOrProvince', '')})".strip(", ")
                colonnine_output.append({
                    "id": f"ocm_{poi.get('ID')}",
                    "tipo": "elettrico",
                    "nome_gestore": operatore,
                    "indirizzo_completo": ind_completo or addr.get('Town', 'Italia'),
                    "comune": addr.get('Town', 'Comune ND'),
                    "coordinate": {
                        "lat": addr.get("Latitude"),
                        "lng": addr.get("Longitude")
                    },
                    "servizi_prezzi": servizi_prezzi
                })
    except Exception as e:
        print(f"[-] Errore elaborazione Open Charge Map: {e}")

    print(f"[✓] Colonnine EV elaborate: {len(colonnine_output)}")
    return colonnine_output

def main():
    print("=======================================================")
    print(f"AVVIO AGGIORNAMENTO GIORNALIERO: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=======================================================")
    
    distributori = elabora_distributori_mimit()
    colonnine = elabora_colonnine_ev()
    
    dataset_unificato = distributori + colonnine
    
    os.makedirs(os.path.dirname(OUTPUT_JSON_PATH), exist_ok=True)
    with open(OUTPUT_JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(dataset_unificato, f, ensure_ascii=False, indent=2)

    print("=======================================================")
    print(f"COMPLETATO! Totale stazioni salvate: {len(dataset_unificato)}")
    print(f"File salvato in: {OUTPUT_JSON_PATH}")
    print("=======================================================")

if __name__ == "__main__":
    main()
