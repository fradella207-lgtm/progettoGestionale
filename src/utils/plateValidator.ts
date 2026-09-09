/**
 * Validatore e formattatore per Targhe Automobilistiche Italiane ed Estere.
 * Supporta:
 * - Standard Italiano Moderno (1994 - oggi): LL NNN LL (es. AB 123 CD), senza lettere I, O, Q, U
 * - Moto Italiane Moderne: LL NNNNN (es. AB 12345)
 * - Targhe Storiche Provinciali (pre-1994): Sigla provincia (MI, RM, TO, ROMA) + 4-6 cifre
 * - Targhe Speciali / Estere: 3-10 caratteri alfanumerici
 */

export interface PlateValidationResult {
  isValid: boolean;
  cleanPlate: string;
  formattedPlate: string;
  plateType: 'standard_it' | 'motorcycle_it' | 'historic_it' | 'foreign_custom' | 'invalid';
  description: string;
  errorMessage?: string;
  estimatedYear?: number;
}

// Province italiane storiche per controllo targhe pre-1994
const ITALIAN_HISTORIC_PROVINCES = new Set([
  'AG','AL','AN','AO','AP','AQ','AR','AT','AV','BA','BG','BI','BL','BN','BO','BR','BS','BT',
  'BZ','CA','CB','CE','CH','CL','CN','CO','CR','CS','CT','CZ','EN','FC','FE','FG','FI','FM',
  'FR','GE','GO','GR','IM','IS','KR','LC','LE','LI','LO','LT','LU','MB','MC','ME','MI','MN',
  'MO','MS','MT','NA','NO','NU','OR','PA','PC','PD','PE','PG','PI','PN','PO','PR','PT','PU',
  'PV','PZ','RA','RC','RE','RG','RI','RM','RN','RO','ROMA','SA','SI','SO','SP','SR','SS','SU',
  'SV','TA','TE','TN','TO','TP','TR','TS','TV','UD','VA','VB','VC','VE','VI','VR','VT','VV'
]);

export function validatePlate(input: string, vehicleType?: 'car' | 'moto'): PlateValidationResult {
  if (!input || !input.trim()) {
    return {
      isValid: false,
      cleanPlate: '',
      formattedPlate: '',
      plateType: 'invalid',
      description: 'Inserisci la targa del veicolo',
      errorMessage: 'La targa è obbligatoria'
    };
  }

  // Pulisci rimuovendo spazi e trattini
  const clean = input.toUpperCase().replace(/[\s\-_.]/g, '');

  if (clean.length < 3) {
    return {
      isValid: false,
      cleanPlate: clean,
      formattedPlate: clean,
      plateType: 'invalid',
      description: 'Targa troppo corta',
      errorMessage: 'La targa deve contenere almeno 3 caratteri'
    };
  }

  // 1. MOTO ITALIANE (1999 - oggi): 2 Lettere, 5 Numeri (totale 7 caratteri, es. AB 12345)
  // Regola di legge: le lettere I, O, Q, U non sono utilizzate nelle targhe moto post-1999
  const motoItLenient = /^[A-Z]{2}[0-9]{5}$/;
  if (motoItLenient.test(clean)) {
    const formatted = `${clean.slice(0, 2)} ${clean.slice(2)}`;
    const forbiddenMatch = clean.match(/[IOQU]/g);
    if (forbiddenMatch) {
      return {
        isValid: false,
        cleanPlate: clean,
        formattedPlate: formatted,
        plateType: 'invalid',
        description: `Contiene caratteri non ammessi (${forbiddenMatch.join(', ')})`,
        errorMessage: `Le lettere I, O, Q, U non esistono nelle targhe italiane (per non confonderle con 1, 0, V)`
      };
    }

    return {
      isValid: true,
      cleanPlate: clean,
      formattedPlate: formatted,
      plateType: 'motorcycle_it',
      description: 'Targa Moto Italiana Regolare (2 Lettere + 5 Cifre)'
    };
  }

  // 2. CICLOMOTORE / SCOOTER 50cc (2004 - oggi): 6 caratteri alfanumerici (es. X12345)
  if (/^[A-HJ-NPR-TV-Z0-9]{6}$/.test(clean) && /[A-Z]/.test(clean) && /[0-9]/.test(clean)) {
    return {
      isValid: true,
      cleanPlate: clean,
      formattedPlate: `${clean.slice(0, 2)} ${clean.slice(2)}`,
      plateType: 'motorcycle_it',
      description: 'Targa Ciclomotore / Scooter 50cc'
    };
  }

  // 3. STANDARD ITALIANO AUTO (1994 - oggi): 2 Lettere, 3 Numeri, 2 Lettere (totale 7 caratteri)
  // Regola di legge: le lettere I, O, Q, U non sono utilizzate nelle targhe italiane post-1994
  const standardItStrict = /^[A-HJ-NPR-TV-Z]{2}[0-9]{3}[A-HJ-NPR-TV-Z]{2}$/;
  const standardItLenient = /^[A-Z]{2}[0-9]{3}[A-Z]{2}$/;

  if (clean.length === 7 && standardItLenient.test(clean)) {
    const formatted = `${clean.slice(0, 2)} ${clean.slice(2, 5)} ${clean.slice(5, 7)}`;
    
    // Controlla se contiene I, O, Q, U
    const forbiddenMatch = clean.match(/[IOQU]/g);
    if (forbiddenMatch) {
      return {
        isValid: false,
        cleanPlate: clean,
        formattedPlate: formatted,
        plateType: 'invalid',
        description: `Contiene caratteri non ammessi (${forbiddenMatch.join(', ')})`,
        errorMessage: `Le lettere I, O, Q, U non esistono nelle targhe italiane (per non confonderle con 1, 0, V)`
      };
    }

    return {
      isValid: true,
      cleanPlate: clean,
      formattedPlate: formatted,
      plateType: 'standard_it',
      description: vehicleType === 'moto' 
        ? 'Targa Auto (Formato Europeo AA 000 AA)' 
        : 'Targa Italiana Regolare (Standard Europeo)',
    };
  }

  // 3. TARGA STORICA PROVINCIALE (Pre-1994): es. MI123456, ROMA12345
  if (/^ROMA[0-9]{4,6}$/.test(clean)) {
    return {
      isValid: true,
      cleanPlate: clean,
      formattedPlate: `ROMA ${clean.slice(4)}`,
      plateType: 'historic_it',
      description: 'Targa Storica Provinciale (Roma)'
    };
  }

  const prov2 = clean.slice(0, 2);
  const provDigits = clean.slice(2);
  if (ITALIAN_HISTORIC_PROVINCES.has(prov2) && /^[0-9]{4,6}$/.test(provDigits)) {
    return {
      isValid: true,
      cleanPlate: clean,
      formattedPlate: `${prov2} ${provDigits}`,
      plateType: 'historic_it',
      description: `Targa Storica Provinciale (${prov2})`
    };
  }

  // 4. TARGA ESTERA / PERSONALIZZATA VALIDA (3 a 10 caratteri alfanumerici)
  if (/^[A-Z0-9]{3,10}$/.test(clean)) {
    // Se ha formato quasi italiano ma con lunghezza 7 e lettere/numeri invertiti
    if (clean.length === 7) {
      return {
        isValid: false,
        cleanPlate: clean,
        formattedPlate: clean,
        plateType: 'invalid',
        description: 'Formato targa non riconosciuto',
        errorMessage: 'La targa italiana standard deve avere 2 lettere, 3 cifre e 2 lettere (es. AB 123 CD)'
      };
    }

    return {
      isValid: true,
      cleanPlate: clean,
      formattedPlate: clean,
      plateType: 'foreign_custom',
      description: 'Targa Estera o Formato Speciale'
    };
  }

  return {
    isValid: false,
    cleanPlate: clean,
    formattedPlate: clean,
    plateType: 'invalid',
    description: 'Caratteri non validi',
    errorMessage: 'La targa può contenere solo lettere e numeri (senza simboli speciali)'
  };
}
