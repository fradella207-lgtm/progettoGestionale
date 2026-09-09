export type Language = 'it' | 'en';

export const TRANSLATIONS = {
  it: {
    // Navigation & Header
    nav_garage: 'Garage',
    nav_my_car: 'La Mia Auto',
    nav_stations: 'Distributori & EV',
    header_garage_subtitle: 'Gestione veicoli, consumi e scadenze',
    header_my_car_subtitle: 'Scheda tecnica, documenti DUC e manuale',
    header_stations_subtitle: 'Prezzi carburanti MIMIT e colonnine elettriche',
    btn_add_vehicle: 'Aggiungi Veicolo',
    btn_edit_vehicle: 'Modifica',
    btn_back: 'Indietro',
    btn_back_to_garage: 'Torna al Garage',
    btn_save: 'Salva Modifiche',
    btn_cancel: 'Annulla',
    btn_close: 'Chiudi',
    btn_delete: 'Elimina',

    // Theme & Language
    theme_title: 'Tema Applicazione',
    theme_light: 'Chiaro',
    theme_dark: 'Scuro',
    theme_system: 'Sistema',
    theme_color_palette: 'Colore di Accento',
    language_title: 'Lingua / Language',
    language_italian: 'Italiano (IT)',
    language_english: 'English (EN)',

    // Garage Home
    garage_title: 'Il Mio Garage',
    garage_registered_cars: 'veicoli registrati',
    garage_total_value: 'Valore parco auto',
    garage_monthly_costs: 'Costi del mese',
    garage_no_vehicles: 'Nessun veicolo nel tuo garage',
    garage_add_first: 'Aggiungi il tuo primo veicolo per iniziare a tracciare manutenzioni, rifornimenti e scadenze.',
    garage_filter_all: 'Tutti i veicoli',

    // VIN / Codice Telaio
    vin_label: 'Codice Telaio (VIN)',
    vin_optional: 'Opzionale',
    vin_placeholder: 'Es. ZAR95200007123456',
    vin_help: '17 caratteri alfanumerici standard ISO 3779 (senza I, O, Q)',
    vin_valid: 'VIN Valido (17 caratteri standard ISO)',
    vin_invalid_length: 'Caratteri: {count}/17 (richiesti 17)',
    vin_forbidden_chars: 'Lettere non ammesse nello standard VIN: {chars}',
    vin_copied: 'Codice telaio copiato negli appunti!',
    btn_copy_vin: 'Copia VIN',

    // Vehicle Detail & My Car
    tab_overview: 'Panoramica',
    tab_refuels: 'Rifornimenti',
    tab_maintenance: 'Manutenzioni',
    tab_documents: 'Documenti & Scadenze',
    tab_manual: 'Manuale di Bordo',
    spec_plate: 'Targa',
    spec_year: 'Anno',
    spec_fuel: 'Alimentazione',
    spec_mileage: 'Chilometraggio',
    spec_power: 'Potenza',
    spec_tank: 'Capacità Serbatoio',
    spec_battery: 'Capacità Batteria',

    // Documents & Deadlines
    doc_tax: 'Bollo Auto',
    doc_insurance: 'Assicurazione',
    doc_inspection: 'Revisione Ministeriale',
    doc_status_valid: 'In regola',
    doc_status_expiring: 'In scadenza',
    doc_status_expired: 'Scaduto',
    doc_expired_section: 'Storico Scadenze & Pagati',

    // Settings
    settings_title: 'Impostazioni',
    settings_subtitle: 'Personalizza interfaccia, tema, lingua e dati',
    settings_units: 'Unità di Misura & Valuta',
    settings_distance: 'Distanza',
    settings_currency: 'Valuta',
    settings_smart_features: 'Funzionalità Intelligenti',
    settings_predictive: 'Avvisi Manutenzione Predittiva AI',
    settings_notifications: 'Notifiche Scadenze e Tagliandi',
    settings_data_management: 'Gestione Dati & Backup',
    settings_export_json: 'Esporta Garage (JSON)',
    settings_import_json: 'Importa da JSON',
    settings_reset_garage: 'Reimposta Garage'
  },
  en: {
    // Navigation & Header
    nav_garage: 'Garage',
    nav_my_car: 'My Car',
    nav_stations: 'Fuel & EV Stations',
    header_garage_subtitle: 'Manage vehicles, expenses and deadlines',
    header_my_car_subtitle: 'Technical specs, documents and manual',
    header_stations_subtitle: 'Live fuel prices and EV charging stations',
    btn_add_vehicle: 'Add Vehicle',
    btn_edit_vehicle: 'Edit',
    btn_back: 'Back',
    btn_back_to_garage: 'Back to Garage',
    btn_save: 'Save Changes',
    btn_cancel: 'Cancel',
    btn_close: 'Close',
    btn_delete: 'Delete',

    // Theme & Language
    theme_title: 'App Theme',
    theme_light: 'Light',
    theme_dark: 'Dark',
    theme_system: 'System',
    theme_color_palette: 'Accent Color',
    language_title: 'Language / Lingua',
    language_italian: 'Italiano (IT)',
    language_english: 'English (EN)',

    // Garage Home
    garage_title: 'My Garage',
    garage_registered_cars: 'vehicles registered',
    garage_total_value: 'Total estimated value',
    garage_monthly_costs: 'Monthly expenses',
    garage_no_vehicles: 'No vehicles in your garage',
    garage_add_first: 'Add your first vehicle to start tracking maintenance, refuels, and deadlines.',
    garage_filter_all: 'All vehicles',

    // VIN / Codice Telaio
    vin_label: 'Chassis Number (VIN)',
    vin_optional: 'Optional',
    vin_placeholder: 'E.g. ZAR95200007123456',
    vin_help: '17 alphanumeric characters ISO 3779 standard (no I, O, Q)',
    vin_valid: 'Valid VIN (17 characters ISO standard)',
    vin_invalid_length: 'Characters: {count}/17 (17 required)',
    vin_forbidden_chars: 'Disallowed characters in VIN standard: {chars}',
    vin_copied: 'Chassis number copied to clipboard!',
    btn_copy_vin: 'Copy VIN',

    // Vehicle Detail & My Car
    tab_overview: 'Overview',
    tab_refuels: 'Refuels',
    tab_maintenance: 'Maintenance',
    tab_documents: 'Documents & Deadlines',
    tab_manual: 'Owner Manual',
    spec_plate: 'License Plate',
    spec_year: 'Year',
    spec_fuel: 'Fuel Type',
    spec_mileage: 'Mileage',
    spec_power: 'Power',
    spec_tank: 'Tank Capacity',
    spec_battery: 'Battery Capacity',

    // Documents & Deadlines
    doc_tax: 'Road Tax',
    doc_insurance: 'Insurance',
    doc_inspection: 'Vehicle Inspection (MOT)',
    doc_status_valid: 'Valid',
    doc_status_expiring: 'Expiring soon',
    doc_status_expired: 'Expired',
    doc_expired_section: 'Archive & Paid Records',

    // Settings
    settings_title: 'Settings',
    settings_subtitle: 'Customize interface, theme, language and data',
    settings_units: 'Units & Currency',
    settings_distance: 'Distance',
    settings_currency: 'Currency',
    settings_smart_features: 'Smart Features',
    settings_predictive: 'AI Predictive Maintenance Alerts',
    settings_notifications: 'Deadlines & Service Notifications',
    settings_data_management: 'Data Management & Backup',
    settings_export_json: 'Export Garage (JSON)',
    settings_import_json: 'Import from JSON',
    settings_reset_garage: 'Reset Garage'
  }
} as const;

export type TranslationKey = keyof typeof TRANSLATIONS.it;

export function getTranslation(lang: Language, key: TranslationKey, params?: Record<string, string | number>): string {
  const dictionary = TRANSLATIONS[lang] || TRANSLATIONS.it;
  let text: string = dictionary[key] || TRANSLATIONS.it[key] || key;
  if (params) {
    Object.entries(params).forEach(([paramKey, paramVal]) => {
      text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramVal));
    });
  }
  return text;
}
