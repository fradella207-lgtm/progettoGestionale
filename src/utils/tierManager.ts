import { UserTier, ProFeatureName, ProPricingOption } from '../types';

export const USER_TIER_STORAGE_KEY = 'garage_user_tier';

/**
 * Get stored user tier from localStorage.
 * Defaults strictly to 'FREE' as requested.
 */
export function getStoredUserTier(): UserTier {
  try {
    const stored = localStorage.getItem(USER_TIER_STORAGE_KEY);
    if (stored === 'PRO' || stored === 'FREE') {
      return stored;
    }
  } catch (e) {
    // ignore
  }
  return 'FREE';
}

/**
 * Save user tier to localStorage.
 */
export function setStoredUserTier(tier: UserTier): void {
  try {
    localStorage.setItem(USER_TIER_STORAGE_KEY, tier);
  } catch (e) {
    // ignore
  }
}

export const saveUserTier = setStoredUserTier;

export function simulateUpgradeToPro(): UserTier {
  setStoredUserTier('PRO');
  return 'PRO';
}

/**
 * Checks if the user has access to a specific feature.
 *
 * Rules:
 * - 'PRO' users have access to everything.
 * - 'FREE' users:
 *   - 'multi_vehicle': Allowed ONLY if vehiclesCount < 1 (max 1 vehicle).
 *   - 'ai_assistant', 'export_pdf', 'cloud_sync', 'fuel_alerts': BLOCKED.
 */
export function checkFeatureAccess(
  featureName: ProFeatureName,
  userTier: UserTier,
  context?: { vehiclesCount?: number }
): boolean {
  if (userTier === 'PRO') {
    return true;
  }

  // FREE tier limitations
  switch (featureName) {
    case 'multi_vehicle':
    case 'unlimited_garage':
      // Free users are allowed at most 1 vehicle.
      // If they already have 1 or more vehicles, adding another is blocked.
      return (context?.vehiclesCount ?? 0) < 1;

    case 'ai_assistant':
    case 'export_pdf':
    case 'export_csv':
    case 'cloud_sync':
    case 'cloud_backup':
    case 'shared_garage':
    case 'multi_account_sync':
    case 'fuel_alerts':
    case 'price_history':
    case 'favorite_stations':
    default:
      return false;
  }
}

export interface ProFeatureDetail {
  id: ProFeatureName;
  title: string;
  shortTitle: string;
  description: string;
  badge: string;
  freeLimit: string;
  proLimit: string;
}

const BASE_MULTI_VEHICLE: ProFeatureDetail = {
  id: 'multi_vehicle',
  title: 'Garage Illimitato (2+ Veicoli)',
  shortTitle: 'Veicoli Illimitati',
  description: 'Gestisci auto, moto, scooter e veicoli commerciali della famiglia o aziendali senza limiti.',
  badge: 'Garage Illimitato',
  freeLimit: 'Max 1 Veicolo (Auto o Moto)',
  proLimit: 'Veicoli Illimitati'
};

const BASE_AI: ProFeatureDetail = {
  id: 'ai_assistant',
  title: 'Assistente Meccanico AI & Manuali',
  shortTitle: 'Assistente AI',
  description: 'Supporto diagnostico intelligente per codici errore OBD2, spiegazione spie, intervalli di manutenzione e consultazione istantanea del manuale di bordo.',
  badge: 'AI Illimitata',
  freeLimit: 'Non incluso nel piano Free',
  proLimit: 'Diagnostica & Chat Illimitata'
};

const BASE_EXPORT: ProFeatureDetail = {
  id: 'export_pdf',
  title: 'Passaporto Digitale (Report PDF & CSV)',
  shortTitle: 'Esporta PDF/CSV',
  description: 'Genera ed esporta il report ufficiale completo del veicolo con storico manutenzioni, scadenze, consumi certificati e scheda tecnica per la vendita o revisione.',
  badge: 'Report Completo',
  freeLimit: 'Esportazione base JSON',
  proLimit: 'Passaporto Digitale PDF & CSV'
};

const BASE_CLOUD: ProFeatureDetail = {
  id: 'cloud_sync',
  title: 'Cloud Backup & Sincronizzazione Automatica',
  shortTitle: 'Cloud Sync',
  description: 'Salvataggio automatico crittografato su cloud per non perdere mai dati e accedere istantaneamente da qualsiasi smartphone o computer.',
  badge: 'Cloud Sync',
  freeLimit: 'Solo salvataggio locale nel browser',
  proLimit: 'Backup Cloud Automatico Multi-Dispositivo'
};

const BASE_SHARED_GARAGE: ProFeatureDetail = {
  id: 'shared_garage',
  title: 'Garage Condiviso & Sincronizzazione Multi-Account (Coppia / Famiglia)',
  shortTitle: 'Sincronizzazione Multi-Account',
  description: 'Condividi in tempo reale la gestione di un\'auto o dell\'intero garage con il coniuge o familiari. Inserisci spese, rifornimenti e tagliandi da entrambi gli account sincronizzati.',
  badge: 'Multi-Account Sync',
  freeLimit: 'Non disponibile nel piano Free (1 account)',
  proLimit: 'Sincronizzazione Live Multi-Account (Link o Codice)'
};

const BASE_FUEL: ProFeatureDetail = {
  id: 'fuel_alerts',
  title: 'Avvisi e Notifiche Prezzi Carburante di Zona',
  shortTitle: 'Allerte Prezzi',
  description: 'Radar convenienza con monitoraggio automatico dei distributori più economici lungo i tuoi tragitti abituali e avvisi di ribasso prezzi.',
  badge: 'Radar Risparmio',
  freeLimit: 'Consultazione mappa base',
  proLimit: 'Allerte Live & Radar Risparmio'
};

const BASE_PRICE_HISTORY: ProFeatureDetail = {
  id: 'price_history',
  title: 'Distributori Preferiti & Andamento Prezzo nel Tempo',
  shortTitle: 'Andamento Prezzi',
  description: 'Grafico dell\'andamento storico dei prezzi nel tempo per i distributori preferiti in primo piano: monitora le oscillazioni per fare il pieno sempre al miglior prezzo.',
  badge: 'Grafico Storico',
  freeLimit: 'Solo prezzi attuali',
  proLimit: 'Preferiti in primo piano + Grafico andamento prezzi nel tempo'
};

export const PRO_FEATURES_CATALOG: Record<ProFeatureName, ProFeatureDetail> = {
  multi_vehicle: BASE_MULTI_VEHICLE,
  unlimited_garage: { ...BASE_MULTI_VEHICLE, id: 'unlimited_garage' },
  ai_assistant: BASE_AI,
  export_pdf: BASE_EXPORT,
  export_csv: { ...BASE_EXPORT, id: 'export_csv' },
  cloud_sync: BASE_CLOUD,
  cloud_backup: { ...BASE_CLOUD, id: 'cloud_backup' },
  shared_garage: BASE_SHARED_GARAGE,
  multi_account_sync: { ...BASE_SHARED_GARAGE, id: 'multi_account_sync' },
  fuel_alerts: BASE_FUEL,
  price_history: BASE_PRICE_HISTORY,
  favorite_stations: BASE_PRICE_HISTORY
};

export const PRO_PRICING_OPTIONS: ProPricingOption[] = [
  {
    id: 'annual',
    name: 'Abbonamento Annuale',
    price: '4,99 €',
    numericPrice: 4.99,
    period: '/ anno',
    description: 'Fatturato annualmente (~0,41 € al mese). Disdici in qualsiasi momento con un clic.',
    savings: 'Solo 0,41 €/mese'
  },
  {
    id: 'lifetime',
    name: 'Pass a Vita (Lifetime)',
    price: '12,99 €',
    numericPrice: 12.99,
    period: 'una tantum',
    highlight: true,
    badge: 'Più Popolare',
    description: 'Paga una sola volta e ottieni MyGarage360 PRO per sempre, inclusi tutti i futuri aggiornamenti.',
    savings: 'Miglior Valore • Zero Rinnovi'
  }
];

export const FREE_VS_PRO_COMPARISON = [
  {
    feature: 'Veicoli Registrabili',
    free: '1 Veicolo (Auto o Moto)',
    pro: 'Illimitati (Flotta completa)'
  },
  {
    feature: 'Rifornimenti, Spese e Scadenze',
    free: 'Incluso (Base)',
    pro: 'Incluso (Avanzato + Statistiche)'
  },
  {
    feature: 'Assistente Meccanico AI',
    free: 'Non incluso',
    pro: 'Illimitato 24/7 con Manuali'
  },
  {
    feature: 'Passaporto Digitale (PDF/CSV)',
    free: 'Non incluso',
    pro: 'Download istantaneo certificato'
  },
  {
    feature: 'Backup & Sincronizzazione',
    free: 'Solo locale (Micro-cache)',
    pro: 'Cloud Sync automatico in tempo reale'
  },
  {
    feature: 'Auto Condivisa (Coppia / Famiglia)',
    free: 'Non disponibile (1 solo account)',
    pro: 'Sincronizzazione Live Bidirezionale (Link o Codice)'
  },
  {
    feature: 'Allerte Prezzi Carburante',
    free: 'Solo mappa manuale',
    pro: 'Radar automatico & Allerte di zona'
  },
  {
    feature: 'Distributori Preferiti & Andamento Prezzi',
    free: 'Solo prezzi del giorno',
    pro: 'Preferiti in primo piano + Grafico andamento prezzi nel tempo'
  }
];
