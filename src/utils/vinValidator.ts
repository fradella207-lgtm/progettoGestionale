/**
 * Utility per la validazione e formattazione del Codice Telaio (VIN - Vehicle Identification Number)
 * Conforme allo standard internazionale ISO 3779.
 */

export interface VinValidationResult {
  isValid: boolean;
  normalized: string;
  error?: string;
  charCount: number;
  hasForbiddenChars: boolean;
  forbiddenCharsFound: string[];
}

/**
 * Valida un codice telaio (VIN).
 * Regole ISO 3779:
 * - 17 caratteri alfanumerici esatti
 * - Le lettere I, O, Q sono severamente escluse per non confonderle con 1 e 0.
 * - Spazi e trattini vengono rimossi automaticamente durante la normalizzazione.
 *
 * @param vin Stringa del codice telaio
 * @param isOptional Se true, una stringa vuota è considerata valida
 */
export function validateVin(vin: string | undefined | null, isOptional = true): VinValidationResult {
  if (!vin || vin.trim() === '') {
    return {
      isValid: isOptional,
      normalized: '',
      charCount: 0,
      hasForbiddenChars: false,
      forbiddenCharsFound: [],
      error: isOptional ? undefined : 'Il codice telaio è obbligatorio'
    };
  }

  // Rimuove spazi, trattini e porta in maiuscolo
  const rawClean = vin.toUpperCase().replace(/[\s\-_]/g, '');
  
  // Trova caratteri vietati (I, O, Q)
  const forbiddenChars: string[] = [];
  for (const char of ['I', 'O', 'Q']) {
    if (rawClean.includes(char)) {
      forbiddenChars.push(char);
    }
  }

  // Controlla se contiene caratteri non alfanumerici
  const nonAlphaNumMatch = rawClean.match(/[^A-Z0-9]/g);
  if (nonAlphaNumMatch) {
    return {
      isValid: false,
      normalized: rawClean,
      charCount: rawClean.length,
      hasForbiddenChars: forbiddenChars.length > 0,
      forbiddenCharsFound: forbiddenChars,
      error: 'Il codice telaio può contenere solo lettere e numeri (nessun simbolo speciale).'
    };
  }

  if (forbiddenChars.length > 0) {
    return {
      isValid: false,
      normalized: rawClean,
      charCount: rawClean.length,
      hasForbiddenChars: true,
      forbiddenCharsFound: forbiddenChars,
      error: `Lettere non ammesse: ${forbiddenChars.join(', ')} (nello standard ISO 3779 non si usano I, O, Q per evitare confusione con 1 e 0).`
    };
  }

  if (rawClean.length !== 17) {
    return {
      isValid: false,
      normalized: rawClean,
      charCount: rawClean.length,
      hasForbiddenChars: false,
      forbiddenCharsFound: [],
      error: `Il codice telaio deve avere 17 caratteri esatti (attualmente: ${rawClean.length}/17).`
    };
  }

  return {
    isValid: true,
    normalized: rawClean,
    charCount: 17,
    hasForbiddenChars: false,
    forbiddenCharsFound: []
  };
}

/**
 * Raggruppa visivamente il VIN in WMI (3 car.) - VDS (6 car.) - VIS (8 car.)
 * Es: ZAR-EA1234-A1234567 per maggiore leggibilità umana
 */
export function formatVinForDisplay(vin: string | undefined | null): string {
  if (!vin) return '';
  const clean = vin.toUpperCase().replace(/[\s\-_]/g, '');
  if (clean.length === 17) {
    return `${clean.slice(0, 3)} ${clean.slice(3, 9)} ${clean.slice(9)}`;
  }
  return clean;
}
