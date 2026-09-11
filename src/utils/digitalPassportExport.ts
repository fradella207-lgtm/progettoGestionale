import { Vehicle } from '../types';
import { calculateVehicleConsumptionMetrics } from './consumptionCalculator';

/**
 * Generates and downloads a CSV export of the complete vehicle Digital Passport.
 */
export function exportVehiclePassportCSV(vehicle: Vehicle): void {
  const metrics = calculateVehicleConsumptionMetrics(vehicle);
  const refuelsKm = (vehicle.refuels || []).map(r => Number(r.km) || 0);
  const maintKm = (vehicle.maintenances || []).map(m => Number(m.km) || 0);
  const currentKm = Math.max(Number(vehicle.initialKm) || 0, ...refuelsKm, ...maintKm);

  const rows: string[][] = [];

  rows.push(['=== PASSAPORTO DIGITALE VEICOLO - MYGARAGE360 PRO ===']);
  rows.push(['Data Generazione', new Date().toLocaleString('it-IT')]);
  rows.push(['Marca', vehicle.brand]);
  rows.push(['Modello', vehicle.model]);
  rows.push(['Allestimento', vehicle.trimLevel || 'N/D']);
  rows.push(['Targa', vehicle.plate]);
  rows.push(['Telaio (VIN)', vehicle.vin || 'N/D']);
  rows.push(['Alimentazione', vehicle.fuelType]);
  rows.push(['Immatricolazione', vehicle.registrationDate || 'N/D']);
  rows.push(['Chilometraggio Iniziale', `${vehicle.initialKm || 0} km`]);
  rows.push(['Chilometri Attuali Stimati', `${currentKm} km`]);
  rows.push(['Spesa Totale Carburante (€)', metrics.totalFuelSpent.toFixed(2)]);
  rows.push(['Spesa Totale Manutenzioni (€)', metrics.totalMaintSpent.toFixed(2)]);
  rows.push(['Spesa Complessiva (€)', metrics.totalOverallSpent.toFixed(2)]);
  rows.push([]);

  // Sezione Manutenzioni
  rows.push(['--- STORICO MANUTENZIONI & TAGLIANDI ---']);
  rows.push(['Data', 'Chilometri', 'Categoria', 'Descrizione', 'Officina', 'Costo (€)', 'Note']);
  (vehicle.maintenances || []).forEach(m => {
    rows.push([
      m.date,
      String(m.km),
      `"${(m.category || '').replace(/"/g, '""')}"`,
      `"${(m.description || '').replace(/"/g, '""')}"`,
      `"${(m.workshop || '').replace(/"/g, '""')}"`,
      String(m.cost),
      `"${(m.notes || '').replace(/"/g, '""')}"`
    ]);
  });
  rows.push([]);

  // Sezione Rifornimenti
  rows.push(['--- STORICO RIFORNIMENTI & RICARICHE ---']);
  rows.push(['Data', 'Chilometri', 'Quantità (L/kWh/Kg)', 'Spesa (€)', 'Tipo', 'Note']);
  (vehicle.refuels || []).forEach(r => {
    rows.push([
      r.date,
      String(r.km),
      String(r.quantity),
      String(r.price),
      r.type,
      `"${(r.notes || '').replace(/"/g, '""')}"`
    ]);
  });
  rows.push([]);

  // Sezione Documenti & Scadenze
  rows.push(['--- DOCUMENTI & SCADENZE REGISTRATE ---']);
  rows.push(['Titolo', 'Tipologia', 'Data Caricamento', 'Data Scadenza', 'Note']);
  (vehicle.documents || []).forEach(d => {
    rows.push([
      `"${(d.title || '').replace(/"/g, '""')}"`,
      d.type,
      d.uploadDate || 'N/D',
      d.expiryDate || 'Nessuna',
      `"${(d.notes || '').replace(/"/g, '""')}"`
    ]);
  });

  const csvContent = '\uFEFF' + rows.map(e => e.join(';')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `passaporto_digitale_${vehicle.plate.replace(/\s+/g, '_')}_${vehicle.brand}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Opens a print-friendly Digital Passport document formatted in HTML with professional styling,
 * allowing instant printing or saving as PDF directly from the browser.
 */
export function openPrintableDigitalPassport(vehicle: Vehicle): void {
  const metrics = calculateVehicleConsumptionMetrics(vehicle);
  const refuelsKm = (vehicle.refuels || []).map(r => Number(r.km) || 0);
  const maintKm = (vehicle.maintenances || []).map(m => Number(m.km) || 0);
  const currentKm = Math.max(Number(vehicle.initialKm) || 0, ...refuelsKm, ...maintKm);

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    // Fallback: download CSV if popups blocked
    exportVehiclePassportCSV(vehicle);
    return;
  }

  const maintRows = (vehicle.maintenances || [])
    .map(m => `
      <tr>
        <td>${m.date}</td>
        <td><strong>${Number(m.km).toLocaleString('it-IT')} km</strong></td>
        <td><span class="badge">${m.category || 'Tagliando'}</span></td>
        <td>${m.description || 'Intervento ordinario'}</td>
        <td>${m.workshop || 'Officina specializzata'}</td>
        <td class="price">${Number(m.cost).toLocaleString('it-IT', { minimumFractionDigits: 2 })} €</td>
      </tr>
    `).join('');

  const docRows = (vehicle.documents || [])
    .map(d => `
      <tr>
        <td><strong>${d.title}</strong></td>
        <td>${d.type.toUpperCase()}</td>
        <td>${d.expiryDate ? new Date(d.expiryDate).toLocaleDateString('it-IT') : 'Nessuna scadenza'}</td>
        <td>${d.notes || 'Documento verificato'}</td>
      </tr>
    `).join('');

  const html = `
    <!DOCTYPE html>
    <html lang="it">
    <head>
      <meta charset="UTF-8">
      <title>Passaporto Digitale - ${vehicle.brand} ${vehicle.model} (${vehicle.plate})</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          color: #0f172a;
          margin: 0;
          padding: 32px;
          background: #ffffff;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 2px solid #0f172a;
          padding-bottom: 20px;
          margin-bottom: 24px;
        }
        .title h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 900;
          letter-spacing: -0.5px;
        }
        .title p {
          margin: 4px 0 0 0;
          font-size: 12px;
          color: #64748b;
        }
        .stamp {
          text-align: right;
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          padding: 8px 16px;
          border-radius: 8px;
        }
        .stamp-title {
          font-size: 11px;
          font-weight: 800;
          color: #1d4ed8;
          text-transform: uppercase;
        }
        .stamp-date {
          font-size: 11px;
          color: #64748b;
        }
        .car-hero {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 20px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 24px;
        }
        .car-specs-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }
        .spec-box {
          background: #ffffff;
          padding: 10px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        }
        .spec-label {
          font-size: 9px;
          text-transform: uppercase;
          font-weight: 800;
          color: #94a3b8;
          display: block;
        }
        .spec-val {
          font-size: 13px;
          font-weight: 800;
          color: #0f172a;
          margin-top: 2px;
          display: block;
        }
        .summary-stats {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 14px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .stat-line {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          padding: 6px 0;
          border-bottom: 1px dashed #e2e8f0;
        }
        .stat-line:last-child {
          border-bottom: none;
          font-weight: 900;
          color: #2563eb;
        }
        h2 {
          font-size: 14px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 6px;
          margin-top: 28px;
          margin-bottom: 12px;
          display: flex;
          justify-content: space-between;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 11px;
          margin-bottom: 20px;
        }
        th {
          background: #f1f5f9;
          text-align: left;
          padding: 8px 10px;
          font-weight: 800;
          color: #475569;
          border-bottom: 1px solid #cbd5e1;
        }
        td {
          padding: 8px 10px;
          border-bottom: 1px solid #e2e8f0;
        }
        td.price {
          text-align: right;
          font-weight: 800;
          color: #0f172a;
        }
        .badge {
          background: #f1f5f9;
          border: 1px solid #cbd5e1;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 9px;
          font-weight: 700;
        }
        .footer {
          margin-top: 40px;
          border-top: 1px solid #cbd5e1;
          padding-top: 16px;
          display: flex;
          justify-content: space-between;
          font-size: 10px;
          color: #94a3b8;
        }
        @media print {
          body { padding: 10px; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="no-print" style="margin-bottom: 16px; text-align: right;">
        <button onclick="window.print()" style="background: #2563eb; color: #fff; font-weight: 800; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer;">
          🖨️ Stampa / Salva come PDF
        </button>
      </div>

      <div class="header">
        <div class="title">
          <h1>PASSAPORTO DIGITALE VEICOLO</h1>
          <p>Certificato storico di manutenzione e stato veicolo • MyGarage360 PRO</p>
        </div>
        <div class="stamp">
          <div class="stamp-title">MyGarage360 PRO Verified</div>
          <div class="stamp-date">Rilasciato il ${new Date().toLocaleDateString('it-IT')}</div>
        </div>
      </div>

      <div class="car-hero">
        <div>
          <h3 style="margin: 0 0 12px 0; font-size: 18px; font-weight: 900;">${vehicle.brand} ${vehicle.model} ${vehicle.trimLevel ? `• ${vehicle.trimLevel}` : ''}</h3>
          <div class="car-specs-grid">
            <div class="spec-box">
              <span class="spec-label">Targa</span>
              <span class="spec-val">${vehicle.plate}</span>
            </div>
            <div class="spec-box">
              <span class="spec-label">Telaio (VIN)</span>
              <span class="spec-val">${vehicle.vin || 'Non inserito'}</span>
            </div>
            <div class="spec-box">
              <span class="spec-label">Alimentazione</span>
              <span class="spec-val">${vehicle.fuelType}</span>
            </div>
            <div class="spec-box">
              <span class="spec-label">Km Attuali Certificati</span>
              <span class="spec-val">${currentKm.toLocaleString('it-IT')} km</span>
            </div>
            <div class="spec-box">
              <span class="spec-label">Prima Immatricolazione</span>
              <span class="spec-val">${vehicle.registrationDate || 'N/D'}</span>
            </div>
            <div class="spec-box">
              <span class="spec-label">Potenza CV / kW</span>
              <span class="spec-val">${vehicle.powerCv ? `${vehicle.powerCv} CV` : 'N/D'}</span>
            </div>
          </div>
        </div>

        <div class="summary-stats">
          <div>
            <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #64748b; margin-bottom: 8px;">Riepilogo Spese</div>
            <div class="stat-line">
              <span>Spesa Carburante:</span>
              <span>${metrics.totalFuelSpent.toLocaleString('it-IT', { minimumFractionDigits: 2 })} €</span>
            </div>
            <div class="stat-line">
              <span>Manutenzioni & Riparazioni:</span>
              <span>${metrics.totalMaintSpent.toLocaleString('it-IT', { minimumFractionDigits: 2 })} €</span>
            </div>
          </div>
          <div class="stat-line">
            <span>Spesa Totale Documentata:</span>
            <span>${metrics.totalOverallSpent.toLocaleString('it-IT', { minimumFractionDigits: 2 })} €</span>
          </div>
        </div>
      </div>

      <h2>Storico Interventi di Manutenzione & Tagliandi (${vehicle.maintenances?.length || 0})</h2>
      <table>
        <thead>
          <tr>
            <th>Data</th>
            <th>Km Intervento</th>
            <th>Categoria</th>
            <th>Descrizione</th>
            <th>Officina / Centro</th>
            <th style="text-align: right;">Importo</th>
          </tr>
        </thead>
        <tbody>
          ${maintRows || '<tr><td colspan="6" style="text-align: center; color: #94a3b8;">Nessun intervento registrato.</td></tr>'}
        </tbody>
      </table>

      <h2>Documenti & Scadenze Associate (${vehicle.documents?.length || 0})</h2>
      <table>
        <thead>
          <tr>
            <th>Documento</th>
            <th>Tipologia</th>
            <th>Data Scadenza</th>
            <th>Note</th>
          </tr>
        </thead>
        <tbody>
          ${docRows || '<tr><td colspan="4" style="text-align: center; color: #94a3b8;">Nessun documento caricato.</td></tr>'}
        </tbody>
      </table>

      <div class="footer">
        <span>Documento generato dall'applicazione MyGarage360 PRO • Proprietà dei dati riservata al proprietario</span>
        <span>ID Veicolo: ${vehicle.id}</span>
      </div>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}
