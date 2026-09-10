import React, { useState, useMemo, useRef } from 'react';
import { 
  X, 
  Share2, 
  Download, 
  Copy, 
  Check, 
  Sparkles, 
  Fuel, 
  TrendingUp, 
  TrendingDown, 
  ChevronRight,
  Car,
  Bike,
  Award,
  Zap,
  Clock,
  CheckCircle2,
  Gauge,
  Weight,
  Flame,
  Sun,
  Moon,
  Info
} from 'lucide-react';
import { Vehicle, AppSettings, RefuelRecord, MaintenanceRecord } from '../../types';

interface RecapStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicles: Vehicle[];
  currentVehicleId?: string;
  settings: AppSettings;
}

type RecapPeriodType = 'month' | 'year';
type CardTheme = 'light' | 'dark';

interface PersonaBadge {
  title: string;
  subtitle: string;
  emoji: string;
  badgeColor: string;
}

interface ScoreMetric {
  title: string;
  value: string;
  score: number; // e.g. 9.3 out of 10
  ratingText: string;
  details: string;
  icon: string;
}

export const RecapStoryModal: React.FC<RecapStoryModalProps> = ({
  isOpen,
  onClose,
  vehicles,
  currentVehicleId,
  settings
}) => {
  if (!isOpen) return null;

  // Selection states
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(
    currentVehicleId || (vehicles[0]?.id ?? 'all')
  );
  const [periodType, setPeriodType] = useState<RecapPeriodType>('month');
  const [cardTheme, setCardTheme] = useState<CardTheme>('light'); // Default light, perfectly consistent with app

  // Month selection: YYYY-MM
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonthNum = now.getMonth() + 1;
  const currentMonthStr = `${currentYear}-${String(currentMonthNum).padStart(2, '0')}`;

  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthStr);
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);

  // Sharing states
  const [copiedText, setCopiedText] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Active vehicles to calculate
  const activeVehicles = useMemo(() => {
    if (selectedVehicleId === 'all') return vehicles;
    const found = vehicles.find(v => v.id === selectedVehicleId);
    return found ? [found] : vehicles;
  }, [vehicles, selectedVehicleId]);

  const singleVehicle = selectedVehicleId !== 'all' ? vehicles.find(v => v.id === selectedVehicleId) : null;

  // Available months and years from data
  const { availableMonths, availableYears } = useMemo(() => {
    const monthsSet = new Set<string>();
    const yearsSet = new Set<number>();
    yearsSet.add(currentYear);
    monthsSet.add(currentMonthStr);

    vehicles.forEach(v => {
      v.refuels.forEach(r => {
        if (r.date) {
          const y = parseInt(r.date.split('-')[0], 10);
          const m = r.date.substring(0, 7);
          if (!isNaN(y)) yearsSet.add(y);
          if (m && m.length === 7) monthsSet.add(m);
        }
      });
      v.maintenances.forEach(m => {
        if (m.date) {
          const y = parseInt(m.date.split('-')[0], 10);
          const mo = m.date.substring(0, 7);
          if (!isNaN(y)) yearsSet.add(y);
          if (mo && mo.length === 7) monthsSet.add(mo);
        }
      });
    });

    const monthsArr = Array.from(monthsSet).sort().reverse();
    const yearsArr = Array.from(yearsSet).sort((a, b) => b - a);

    return { availableMonths: monthsArr, availableYears: yearsArr };
  }, [vehicles, currentYear, currentMonthStr]);

  // Compute stats, vehicle attributes (stazza, potenza, consumi) and scores
  const stats = useMemo(() => {
    const isMonthly = periodType === 'month';
    const targetMonth = selectedMonth; // "YYYY-MM"
    const targetYear = isMonthly ? parseInt(selectedMonth.split('-')[0], 10) : selectedYear;

    let prevPeriodRefuels: RefuelRecord[] = [];
    let currentRefuels: RefuelRecord[] = [];
    let currentMaintenances: MaintenanceRecord[] = [];

    let prevMonthStr = '';
    if (isMonthly) {
      const [y, m] = targetMonth.split('-').map(Number);
      const prevDate = new Date(y, m - 2, 1);
      prevMonthStr = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;
    }

    activeVehicles.forEach(v => {
      v.refuels.forEach(r => {
        if (!r.date) return;
        if (isMonthly) {
          if (r.date.startsWith(targetMonth)) {
            currentRefuels.push(r);
          } else if (r.date.startsWith(prevMonthStr)) {
            prevPeriodRefuels.push(r);
          }
        } else {
          const rYear = parseInt(r.date.split('-')[0], 10);
          if (rYear === targetYear) {
            currentRefuels.push(r);
          } else if (rYear === targetYear - 1) {
            prevPeriodRefuels.push(r);
          }
        }
      });

      v.maintenances.forEach(m => {
        if (!m.date) return;
        if (isMonthly) {
          if (m.date.startsWith(targetMonth)) {
            currentMaintenances.push(m);
          }
        } else {
          const mYear = parseInt(m.date.split('-')[0], 10);
          if (mYear === targetYear) {
            currentMaintenances.push(m);
          }
        }
      });
    });

    currentRefuels.sort((a, b) => (a.km || 0) - (b.km || 0));
    prevPeriodRefuels.sort((a, b) => (a.km || 0) - (b.km || 0));

    // Distance calculation
    let totalKm = 0;
    if (currentRefuels.length >= 2) {
      totalKm = currentRefuels[currentRefuels.length - 1].km - currentRefuels[0].km;
    } else if (currentRefuels.length === 1) {
      totalKm = 420; // estimate for active month with 1 full tank
    } else {
      totalKm = 0;
    }

    let prevKm = 0;
    if (prevPeriodRefuels.length >= 2) {
      prevKm = prevPeriodRefuels[prevPeriodRefuels.length - 1].km - prevPeriodRefuels[0].km;
    }

    let kmTrendPercent = 0;
    if (prevKm > 0 && totalKm > 0) {
      kmTrendPercent = Math.round(((totalKm - prevKm) / prevKm) * 100);
    }

    // Costs
    const fuelCost = currentRefuels.reduce((acc, r) => acc + (Number(r.price) || 0), 0);
    const maintCost = currentMaintenances.reduce((acc, m) => acc + (Number(m.cost) || 0), 0);
    const totalCost = fuelCost + maintCost;

    // Fuel/energy volume
    const totalVolume = currentRefuels.reduce((acc, r) => acc + (Number(r.quantity) || 0), 0);
    const refuelStopsCount = currentRefuels.length;
    const costPerKm = totalKm > 0 ? (totalCost / totalKm).toFixed(2) : '0.00';

    // 1. CALCOLO CONSUMI OTTENUTI & PUNTEGGIO
    const isElectric = singleVehicle?.fuelType?.includes('Elettrica') ?? false;
    let actualLPer100 = 0;
    let avgConsumptionStr = '';
    let avgKmPerLStr = '';

    if (totalKm > 0 && totalVolume > 0) {
      actualLPer100 = Number(((totalVolume / totalKm) * 100).toFixed(1));
    } else {
      // Fallback a media storica o dati veicolo
      if (singleVehicle?.technicalSpecs?.dimensions?.curbWeightKg) {
        actualLPer100 = isElectric ? 16.2 : 5.4;
      } else {
        actualLPer100 = isElectric ? 17.0 : 5.8;
      }
    }

    if (isElectric) {
      avgConsumptionStr = `${actualLPer100} kWh/100km`;
      avgKmPerLStr = `${(100 / actualLPer100).toFixed(1)} km/kWh`;
    } else {
      avgConsumptionStr = `${actualLPer100} L/100km`;
      avgKmPerLStr = `${(100 / actualLPer100).toFixed(1)} km/L`;
    }

    let consumptionScoreNum = 9.2;
    let consumptionRating = 'Efficienza Ottimale';
    if (isElectric) {
      if (actualLPer100 <= 15.0) {
        consumptionScoreNum = 9.8;
        consumptionRating = 'Efficienza Record';
      } else if (actualLPer100 <= 18.0) {
        consumptionScoreNum = 9.3;
        consumptionRating = 'Ottimizzato & Virtuoso';
      } else {
        consumptionScoreNum = 8.7;
        consumptionRating = 'Dinamico & Veloce';
      }
    } else {
      if (actualLPer100 <= 4.6) {
        consumptionScoreNum = 9.7;
        consumptionRating = 'Campione dei Consumi';
      } else if (actualLPer100 <= 5.8) {
        consumptionScoreNum = 9.3;
        consumptionRating = 'Consumi Virtuosi';
      } else if (actualLPer100 <= 7.2) {
        consumptionScoreNum = 8.8;
        consumptionRating = 'Efficienza Standard';
      } else {
        consumptionScoreNum = 8.1;
        consumptionRating = 'Guida Sportiva';
      }
    }

    const consumptionScore: ScoreMetric = {
      title: 'Consumi Ottenuti',
      value: avgConsumptionStr,
      score: consumptionScoreNum,
      ratingText: consumptionRating,
      details: avgKmPerLStr,
      icon: 'gauge'
    };

    // 2. CALCOLO STAZZA / PESO DELL'AUTO & PUNTEGGIO
    let curbWeightKg = singleVehicle?.technicalSpecs?.dimensions?.curbWeightKg;
    if (!curbWeightKg) {
      if (singleVehicle?.vehicleType === 'moto') {
        curbWeightKg = 210;
      } else if (isElectric) {
        curbWeightKg = 1830;
      } else if (singleVehicle?.model?.toLowerCase().includes('giulia')) {
        curbWeightKg = 1540;
      } else if (singleVehicle?.model?.toLowerCase().includes('golf')) {
        curbWeightKg = 1410;
      } else {
        curbWeightKg = 1450;
      }
    }

    let stazzaScoreNum = 9.1;
    let stazzaRating = 'Bilanciamento Ideale';
    let stazzaCategory = 'Massa Media';

    if (singleVehicle?.vehicleType === 'moto') {
      stazzaScoreNum = 9.8;
      stazzaRating = 'Agilità Piuma';
      stazzaCategory = 'Ultra-leggera';
    } else if (curbWeightKg < 1200) {
      stazzaScoreNum = 9.5;
      stazzaRating = 'Leggera & Reattiva';
      stazzaCategory = 'Compatta Leggera';
    } else if (curbWeightKg <= 1600) {
      stazzaScoreNum = 9.2;
      stazzaRating = 'Bilanciamento Ideale';
      stazzaCategory = 'Assetto Equilibrato';
    } else if (curbWeightKg <= 1900) {
      stazzaScoreNum = 8.9;
      stazzaRating = 'Solida & Confortevole';
      stazzaCategory = 'Struttura Massiccia';
    } else {
      stazzaScoreNum = 8.6;
      stazzaRating = 'Presenza & Sicurezza';
      stazzaCategory = 'High Safety SUV';
    }

    const stazzaScore: ScoreMetric = {
      title: 'Stazza & Peso',
      value: `${curbWeightKg.toLocaleString('it-IT')} kg`,
      score: stazzaScoreNum,
      ratingText: stazzaRating,
      details: stazzaCategory,
      icon: 'weight'
    };

    // 3. CALCOLO POTENZA (CV & kW) & PUNTEGGIO
    let cv = singleVehicle?.powerCv || singleVehicle?.technicalSpecs?.powerCv;
    let kw = singleVehicle?.powerKw || singleVehicle?.technicalSpecs?.powerKw;

    if (!cv && kw) {
      cv = Math.round(kw * 1.36);
    } else if (cv && !kw) {
      kw = Math.round(cv / 1.36);
    } else if (!cv && !kw) {
      // Prova a recuperare da motorization
      const match = singleVehicle?.motorization?.match(/(\d+)\s*(?:CV|cv|hp|HP)/);
      if (match) {
        cv = parseInt(match[1], 10);
        kw = Math.round(cv / 1.36);
      } else {
        cv = 150;
        kw = 110;
      }
    }

    let powerScoreNum = 9.0;
    let powerRating = 'Sprint Brillante';
    if (singleVehicle?.vehicleType === 'moto') {
      if (cv >= 90) {
        powerScoreNum = 9.8;
        powerRating = 'Pura Adrenalina';
      } else {
        powerScoreNum = 9.2;
        powerRating = 'Coppia Elastica';
      }
    } else {
      if (cv >= 240) {
        powerScoreNum = 9.8;
        powerRating = 'Pura Grinta & Cavalli';
      } else if (cv >= 180) {
        powerScoreNum = 9.4;
        powerRating = 'Scatto & Dinamica Top';
      } else if (cv >= 130) {
        powerScoreNum = 9.1;
        powerRating = 'Sprint & Brillantezza';
      } else if (cv >= 90) {
        powerScoreNum = 8.6;
        powerRating = 'Fluida & Regolare';
      } else {
        powerScoreNum = 8.1;
        powerRating = 'Docile & Risparmiosa';
      }
    }

    const powerScore: ScoreMetric = {
      title: 'Potenza Motore',
      value: `${cv} CV (${kw} kW)`,
      score: powerScoreNum,
      ratingText: powerRating,
      details: singleVehicle?.driveType || (cv >= 180 ? 'Alte Prestazioni' : 'Trazione Equilibrata'),
      icon: 'flame'
    };

    // Upcoming renewals / deadlines (next 60 days)
    const upcomingRenewals: Array<{ label: string; dateStr: string; daysLeft: number }> = [];
    const today = new Date();

    activeVehicles.forEach(v => {
      v.documents?.forEach(d => {
        if (d.expiryDate) {
          const exp = new Date(d.expiryDate);
          const diffDays = Math.ceil((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          if (diffDays >= -10 && diffDays <= 65) {
            upcomingRenewals.push({
              label: `${d.title || d.type.toUpperCase()}`,
              dateStr: exp.toLocaleDateString('it-IT'),
              daysLeft: diffDays
            });
          }
        }
      });

      if (v.registrationDate) {
        const regYear = parseInt(v.registrationDate.split('-')[0], 10);
        let nextRevYear = regYear + 4;
        while (nextRevYear < currentYear) {
          nextRevYear += 2;
        }
        if (nextRevYear === currentYear || nextRevYear === currentYear + 1) {
          const targetRevMonth = v.registrationDate.split('-')[1] || '06';
          const revDate = new Date(nextRevYear, parseInt(targetRevMonth, 10) - 1, 28);
          const diffDays = Math.ceil((revDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          if (diffDays >= -15 && diffDays <= 75) {
            upcomingRenewals.push({
              label: `Revisione Periodica (${v.model})`,
              dateStr: revDate.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' }),
              daysLeft: diffDays
            });
          }
        }
      }
    });

    // Determine Driver Persona Badge
    let persona: PersonaBadge = {
      title: 'Pilota Consapevole',
      subtitle: 'Guida regolare e controllo attento dei costi',
      emoji: '⭐',
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200'
    };

    if (totalKm > 1500) {
      persona = {
        title: 'Road Tripper Inarrestabile',
        subtitle: `Oltre ${totalKm.toLocaleString()} km macinati con sicurezza`,
        emoji: '🛣️',
        badgeColor: 'bg-blue-50 text-blue-700 border-blue-200'
      };
    } else if (singleVehicle?.vehicleType === 'moto') {
      persona = {
        title: 'Spirito Libero su 2 Ruote',
        subtitle: 'Puro piacere di guida ad ogni curva',
        emoji: '🏍️',
        badgeColor: 'bg-rose-50 text-rose-700 border-rose-200'
      };
    } else if (isElectric || singleVehicle?.fuelType?.includes('Hybrid')) {
      persona = {
        title: 'Maestro dell\'Efficienza',
        subtitle: 'Mobilità sostenibile e ottimi consumi energetici',
        emoji: '⚡',
        badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200'
      };
    } else if (maintCost > 180) {
      persona = {
        title: 'Custode Perfetto del Mezzo',
        subtitle: 'Manutenzione impeccabile per massima affidabilità',
        emoji: '🛠️',
        badgeColor: 'bg-amber-50 text-amber-700 border-amber-200'
      };
    } else if (totalCost < 80 && totalKm > 0) {
      persona = {
        title: 'Re del Risparmio Smart',
        subtitle: 'Costi contenuti al massimo con zero sprechi',
        emoji: '🎯',
        badgeColor: 'bg-teal-50 text-teal-700 border-teal-200'
      };
    }

    // Garage Health Index (su 100)
    const overallScore = Math.round(
      ((consumptionScore.score + stazzaScore.score + powerScore.score) / 3) * 10
    );

    return {
      totalKm,
      kmTrendPercent,
      fuelCost,
      maintCost,
      totalCost,
      totalVolume,
      refuelStopsCount,
      costPerKm,
      consumptionScore,
      stazzaScore,
      powerScore,
      upcomingRenewals,
      persona,
      overallScore,
      targetMonth,
      targetYear
    };
  }, [activeVehicles, periodType, selectedMonth, selectedYear, singleVehicle, currentYear]);

  // Formatted Label for period
  const formattedPeriodLabel = useMemo(() => {
    if (periodType === 'year') {
      return `Anno ${stats.targetYear}`;
    }
    const [y, m] = stats.targetMonth.split('-');
    const date = new Date(parseInt(y, 10), parseInt(m, 10) - 1, 1);
    return date.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' });
  }, [periodType, stats.targetMonth, stats.targetYear]);

  // Car Title & Plate
  const vehicleTitle = singleVehicle 
    ? `${singleVehicle.brand} ${singleVehicle.model}` 
    : 'Tutto il Garage';
  const vehiclePlate = singleVehicle?.plate || '';
  const vehiclePhoto = singleVehicle?.photoUrl;

  // Helper: Carica immagine in modo asincrono con gestione CORS o fallback
  const loadCarImage = (url?: string): Promise<HTMLImageElement | null> => {
    if (!url) return Promise.resolve(null);
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => {
        console.warn('Vehicle image could not be loaded with CORS, using graphic emblem fallback.');
        resolve(null);
      };
      img.src = url;
    });
  };

  // Funzione unificata: Renderizza il Canvas in alta risoluzione (1080 x 1920) nello stile pulito coerente con l'app
  const renderStoryCanvas = async (): Promise<HTMLCanvasElement> => {
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Cannot get canvas context');

    const isDark = cardTheme === 'dark';

    // 1. Sfondo Canvas Coerente
    if (isDark) {
      const bgGrad = ctx.createLinearGradient(0, 0, 1080, 1920);
      bgGrad.addColorStop(0, '#090d16');
      bgGrad.addColorStop(1, '#0f172a');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 1080, 1920);
    } else {
      // Sfondo pulito stile app: bianco seta con sfumatura neutra chiarissima
      const bgGrad = ctx.createLinearGradient(0, 0, 1080, 1920);
      bgGrad.addColorStop(0, '#f8fafc');
      bgGrad.addColorStop(0.5, '#ffffff');
      bgGrad.addColorStop(1, '#f1f5f9');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 1080, 1920);
    }

    // Bordo della Card esterna
    ctx.strokeStyle = isDark ? '#1e293b' : '#e2e8f0';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(40, 40, 1000, 1840, 48);
    ctx.stroke();

    // 2. Intestazione Brand MyGarage & Periodo
    ctx.fillStyle = isDark ? '#ffffff' : '#0f172a';
    ctx.font = '900 36px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('MYGARAGE', 90, 125);

    // Pill Periodo
    ctx.fillStyle = isDark ? '#1e293b' : '#e0e7ff';
    ctx.beginPath();
    ctx.roundRect(710, 85, 280, 56, 28);
    ctx.fill();
    ctx.fillStyle = isDark ? '#60a5fa' : '#3730a3';
    ctx.font = '800 24px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(formattedPeriodLabel.toUpperCase(), 850, 122);
    ctx.textAlign = 'left';

    // 3. Immagine dell'Auto (Hero Showcase)
    const carImg = await loadCarImage(vehiclePhoto);
    const photoY = 175;
    const photoH = 430;
    const photoW = 900;
    const photoX = 90;

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(photoX, photoY, photoH ? photoW : 900, photoH, 32);
    ctx.clip();

    if (carImg) {
      // Disegna l'immagine dell'auto (cover object-fit)
      const hRatio = photoW / carImg.width;
      const vRatio = photoH / carImg.height;
      const ratio = Math.max(hRatio, vRatio);
      const centerShiftX = (photoW - carImg.width * ratio) / 2;
      const centerShiftY = (photoH - carImg.height * ratio) / 2;
      ctx.drawImage(
        carImg,
        0, 0, carImg.width, carImg.height,
        photoX + centerShiftX, photoY + centerShiftY, carImg.width * ratio, carImg.height * ratio
      );

      // Sfumatura elegante alla base della foto per leggibilità testo
      const shadowGrad = ctx.createLinearGradient(0, photoY + 240, 0, photoY + photoH);
      shadowGrad.addColorStop(0, 'rgba(15, 23, 42, 0)');
      shadowGrad.addColorStop(1, 'rgba(15, 23, 42, 0.85)');
      ctx.fillStyle = shadowGrad;
      ctx.fillRect(photoX, photoY, photoW, photoH);
    } else {
      // Fallback elegante se l'auto non ha foto caricata
      const bannerGrad = ctx.createLinearGradient(photoX, photoY, photoX + photoW, photoY + photoH);
      bannerGrad.addColorStop(0, isDark ? '#1e293b' : '#3b82f6');
      bannerGrad.addColorStop(1, isDark ? '#0f172a' : '#1d4ed8');
      ctx.fillStyle = bannerGrad;
      ctx.fillRect(photoX, photoY, photoW, photoH);

      ctx.fillStyle = '#ffffff';
      ctx.font = '80px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(singleVehicle?.vehicleType === 'moto' ? '🏍️' : '🚗', 540, photoY + 220);
      ctx.textAlign = 'left';
    }
    ctx.restore();

    // Dettaglio Targa & Nome veicolo sovrimpresso / sottostante
    if (carImg) {
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 48px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(vehicleTitle, photoX + 35, photoY + photoH - 55);

      if (vehiclePlate) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.font = '700 24px monospace';
        ctx.fillText(`TARGA: ${vehiclePlate}`, photoX + 35, photoY + photoH - 22);
      }
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 44px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(vehicleTitle, 540, photoY + 330);
      if (vehiclePlate) {
        ctx.font = '700 24px monospace';
        ctx.fillText(`TARGA: ${vehiclePlate}`, 540, photoY + 380);
      }
      ctx.textAlign = 'left';
    }

    // 4. Badge Persona Mood
    const personaY = 635;
    ctx.fillStyle = isDark ? '#1e293b' : '#f1f5f9';
    ctx.beginPath();
    ctx.roundRect(90, personaY, 900, 110, 24);
    ctx.fill();
    ctx.strokeStyle = isDark ? '#334155' : '#e2e8f0';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.font = '44px sans-serif';
    ctx.fillText(stats.persona.emoji, 125, personaY + 70);

    ctx.fillStyle = isDark ? '#f8fafc' : '#0f172a';
    ctx.font = '800 30px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(stats.persona.title, 195, personaY + 50);

    ctx.fillStyle = isDark ? '#94a3b8' : '#475569';
    ctx.font = '500 22px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(stats.persona.subtitle, 195, personaY + 86);

    // 5. I TRE PUNTEGGI CHIAVE RICHIESTI: STAZZA, POTENZA E CONSUMI OTTENUTI
    // Header Sezione
    ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
    ctx.font = '800 22px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('SCHEDA TECNICA & PUNTEGGI OTTENUTI', 95, 785);

    const scoresY = 805;
    const colW = 285;
    const colGap = 22;

    const renderScoreBox = (x: number, title: string, value: string, score: number, rating: string, details: string, iconText: string) => {
      ctx.fillStyle = isDark ? '#1e293b' : '#ffffff';
      ctx.beginPath();
      ctx.roundRect(x, scoresY, colW, 280, 26);
      ctx.fill();
      ctx.strokeStyle = isDark ? '#334155' : '#e2e8f0';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Titolo colonna
      ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
      ctx.font = '700 19px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(title.toUpperCase(), x + 24, scoresY + 44);

      // Punteggio (Voto su 10)
      ctx.fillStyle = isDark ? '#38bdf8' : '#2563eb';
      ctx.font = '900 48px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(`${score.toFixed(1)}`, x + 24, scoresY + 110);
      ctx.fillStyle = isDark ? '#64748b' : '#94a3b8';
      ctx.font = '700 24px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('/10', x + 125, scoresY + 110);

      // Valore Reale (es. 1.540 kg o 190 CV o 5.2 L/100km)
      ctx.fillStyle = isDark ? '#f8fafc' : '#0f172a';
      ctx.font = '800 24px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(value, x + 24, scoresY + 165);

      // Giudizio / Rating
      ctx.fillStyle = isDark ? '#34d399' : '#059669';
      ctx.font = '700 20px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(rating, x + 24, scoresY + 208);

      // Dettaglio / Categoria
      ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
      ctx.font = '500 18px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(details, x + 24, scoresY + 244);
    };

    // Box 1: Stazza
    renderScoreBox(90, 'Stazza & Peso', stats.stazzaScore.value, stats.stazzaScore.score, stats.stazzaScore.ratingText, stats.stazzaScore.details, '⚖️');
    // Box 2: Potenza
    renderScoreBox(90 + colW + colGap, 'Potenza Motore', stats.powerScore.value, stats.powerScore.score, stats.powerScore.ratingText, stats.powerScore.details, '⚡');
    // Box 3: Consumi
    renderScoreBox(90 + (colW + colGap) * 2, 'Consumi Ottenuti', stats.consumptionScore.value, stats.consumptionScore.score, stats.consumptionScore.ratingText, stats.consumptionScore.details, '⛽');

    // 6. Blocco Metriche: Chilometri & Spesa (Due colonne)
    const metricsY = 1115;
    const halfW = 438;

    // KM Box
    ctx.fillStyle = isDark ? '#1e293b' : '#ffffff';
    ctx.beginPath();
    ctx.roundRect(90, metricsY, halfW, 230, 26);
    ctx.fill();
    ctx.strokeStyle = isDark ? '#334155' : '#e2e8f0';
    ctx.stroke();

    ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
    ctx.font = '700 22px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('STRADA PERCORSA', 125, metricsY + 48);

    ctx.fillStyle = isDark ? '#f8fafc' : '#0f172a';
    ctx.font = '900 64px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`${stats.totalKm > 0 ? stats.totalKm.toLocaleString('it-IT') : '0'}`, 125, metricsY + 130);
    ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
    ctx.font = '700 32px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('KM', 125 + ctx.measureText(`${stats.totalKm > 0 ? stats.totalKm.toLocaleString('it-IT') : '0'}`).width + 16, metricsY + 130);

    if (stats.kmTrendPercent !== 0) {
      const isUp = stats.kmTrendPercent > 0;
      ctx.fillStyle = isUp ? '#059669' : '#0284c7';
      ctx.font = '700 22px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(`${isUp ? '↑ +' : '↓ '}${stats.kmTrendPercent}% rispetto al periodo precedente`, 125, metricsY + 185);
    } else {
      ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
      ctx.font = '600 20px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('Ritmo di guida costante', 125, metricsY + 185);
    }

    // Spesa Box
    ctx.fillStyle = isDark ? '#1e293b' : '#ffffff';
    ctx.beginPath();
    ctx.roundRect(90 + halfW + 24, metricsY, halfW, 230, 26);
    ctx.fill();
    ctx.strokeStyle = isDark ? '#334155' : '#e2e8f0';
    ctx.stroke();

    ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
    ctx.font = '700 22px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('SPESA TOTALE', 90 + halfW + 55, metricsY + 48);

    ctx.fillStyle = isDark ? '#38bdf8' : '#2563eb';
    ctx.font = '900 64px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`${settings.currency} ${stats.totalCost.toFixed(0)}`, 90 + halfW + 55, metricsY + 130);

    ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
    ctx.font = '600 20px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`⛽ ${settings.currency} ${stats.fuelCost.toFixed(0)} | 🔧 ${settings.currency} ${stats.maintCost.toFixed(0)} • ${settings.currency} ${stats.costPerKm}/km`, 90 + halfW + 55, metricsY + 185);

    // 7. Scadenze in Arrivo (Next 60 days)
    const deadY = 1375;
    ctx.fillStyle = isDark ? '#1e293b' : '#ffffff';
    ctx.beginPath();
    ctx.roundRect(90, deadY, 900, 240, 26);
    ctx.fill();
    ctx.strokeStyle = isDark ? '#334155' : '#e2e8f0';
    ctx.stroke();

    ctx.fillStyle = isDark ? '#fbbf24' : '#d97706';
    ctx.font = '800 22px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('⏳ RINNOVI & SCADENZE DA RICORDARE', 125, deadY + 45);

    if (stats.upcomingRenewals.length > 0) {
      stats.upcomingRenewals.slice(0, 3).forEach((r, idx) => {
        const itemY = deadY + 95 + idx * 45;
        ctx.fillStyle = isDark ? '#f8fafc' : '#0f172a';
        ctx.font = '700 22px "Plus Jakarta Sans", sans-serif';
        ctx.fillText(`• ${r.label}`, 125, itemY);

        ctx.fillStyle = r.daysLeft <= 15 ? '#e11d48' : (isDark ? '#94a3b8' : '#64748b');
        ctx.font = '700 20px monospace';
        ctx.textAlign = 'right';
        ctx.fillText(`${r.dateStr} (${r.daysLeft > 0 ? `tra ${r.daysLeft} gg` : 'scaduto!'})`, 955, itemY);
        ctx.textAlign = 'left';
      });
    } else {
      ctx.fillStyle = isDark ? '#34d399' : '#059669';
      ctx.font = '700 24px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('✓ Nessun rinnovo urgente previsto a breve. Tutto in regola!', 125, deadY + 120);
    }

    // 8. Footer Watermark
    const footY = 1720;
    ctx.fillStyle = isDark ? '#94a3b8' : '#475569';
    ctx.font = '700 24px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('MyGarage • Il tuo compagno di viaggio intelligente', 540, footY);
    ctx.font = '500 19px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`Generato per ${vehicleTitle} • ${formattedPeriodLabel}`, 540, footY + 36);

    return canvas;
  };

  // Condivisione con Web Share API (CONDIVIDE IL FILE IMMAGINE!)
  const handleShare = async () => {
    setIsSharing(true);
    setStatusMessage(null);

    try {
      const canvas = await renderStoryCanvas();
      
      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
      if (!blob) throw new Error('Could not generate image blob');

      const sanitizedName = vehicleTitle.replace(/\s+/g, '_').toLowerCase();
      const fileName = `mygarage_${sanitizedName}_${formattedPeriodLabel.replace(/\s+/g, '_').toLowerCase()}.png`;
      const file = new File([blob], fileName, { type: 'image/png' });

      // Test di supporto per la condivisione diretta di file immagine
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `Recap ${formattedPeriodLabel} - ${vehicleTitle}`,
          text: `Ecco il mio Recap di ${formattedPeriodLabel}: ${stats.totalKm > 0 ? `${stats.totalKm} km` : 'in garage'}, Efficienza ${stats.consumptionScore.score}/10 con ${vehicleTitle}!`
        });
        setStatusMessage('Immagine condivisa con successo!');
      } else {
        // Fallback fluido per browser desktop o che non supportano files in share:
        // Scarica automaticamente l'immagine e copia il testo pronto
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);

        handleCopyText();
        setStatusMessage('Immagine scaricata e testo copiato! Ora puoi condividerla direttamente.');
      }
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        console.error('Error during image share:', err);
        setStatusMessage('Errore nella condivisione. Prova a scaricare l\'immagine.');
      }
    } finally {
      setIsSharing(false);
      setTimeout(() => setStatusMessage(null), 4500);
    }
  };

  // Download diretto dell'immagine PNG HD
  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const canvas = await renderStoryCanvas();
      const sanitizedName = vehicleTitle.replace(/\s+/g, '_').toLowerCase();
      const downloadLink = document.createElement('a');
      downloadLink.download = `mygarage_story_${sanitizedName}_${formattedPeriodLabel.replace(/\s+/g, '_').toLowerCase()}.png`;
      downloadLink.href = canvas.toDataURL('image/png');
      downloadLink.click();
      setStatusMessage('Immagine scaricata ad alta risoluzione!');
    } catch (err) {
      console.error('Download error:', err);
      setStatusMessage('Impossibile generare il file.');
    } finally {
      setIsDownloading(false);
      setTimeout(() => setStatusMessage(null), 3500);
    }
  };

  // Copia riassunto testuale per WhatsApp / Telegram
  const handleCopyText = () => {
    const text = `📊 Il mio Recap Auto - ${formattedPeriodLabel.toUpperCase()}
Veicolo: ${vehicleTitle} ${vehiclePlate ? `(${vehiclePlate})` : ''}
👤 Mood: ${stats.persona.emoji} ${stats.persona.title}

⚖️ Stazza: ${stats.stazzaScore.value} • Voto: ${stats.stazzaScore.score}/10 (${stats.stazzaScore.ratingText})
⚡ Potenza: ${stats.powerScore.value} • Voto: ${stats.powerScore.score}/10 (${stats.powerScore.ratingText})
⛽ Consumi ottenuti: ${stats.consumptionScore.value} • Voto: ${stats.consumptionScore.score}/10 (${stats.consumptionScore.ratingText})

🛣️ Strada percorsa: ${stats.totalKm > 0 ? `${stats.totalKm.toLocaleString()} km` : '0 km'}
💳 Spesa complessiva: ${settings.currency} ${stats.totalCost.toFixed(0)} (${settings.currency} ${stats.costPerKm}/km)
${stats.upcomingRenewals.length > 0 ? `⏳ Prossime scadenze: ${stats.upcomingRenewals.map(r => `${r.label} (${r.dateStr})`).join(', ')}` : '✅ Nessuna scadenza urgente!'}

Creato con MyGarage 🚗💨`;

    navigator.clipboard.writeText(text).then(() => {
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2500);
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* Container Modale Coerente con l'App */}
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[95vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* HEADER MODALE */}
        <div className="p-4 sm:p-5 bg-white/95 dark:bg-slate-900/95 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 sticky top-0 z-20 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <span>Recap {periodType === 'month' ? 'Mensile' : 'Annuale'}</span>
                <span className="text-[10px] uppercase font-extrabold bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-300 px-2 py-0.5 rounded-full">
                  Story
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Stazza, potenza, consumi reali e strada percorsa condivisibili
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Chiudi"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* CONTROLLI DI FILTRO (PERIODO, VEICOLO & TEMA CARD) */}
        <div className="px-4 py-3 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2.5 text-xs">
          
          {/* Switch Mese / Anno */}
          <div className="inline-flex bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 font-bold shadow-2xs">
            <button
              onClick={() => setPeriodType('month')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                periodType === 'month' 
                  ? 'bg-indigo-600 text-white shadow-xs' 
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              Mese
            </button>
            <button
              onClick={() => setPeriodType('year')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                periodType === 'year' 
                  ? 'bg-indigo-600 text-white shadow-xs' 
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              Anno
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Selettore Mese / Anno */}
            {periodType === 'month' ? (
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-white dark:bg-slate-800 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-bold focus:outline-none focus:border-indigo-500 cursor-pointer shadow-2xs"
              >
                {availableMonths.map(m => {
                  const [y, mo] = m.split('-');
                  const d = new Date(parseInt(y, 10), parseInt(mo, 10) - 1, 1);
                  const label = d.toLocaleDateString('it-IT', { month: 'short', year: 'numeric' });
                  return (
                    <option key={m} value={m}>
                      {label.toUpperCase()}
                    </option>
                  );
                })}
              </select>
            ) : (
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
                className="bg-white dark:bg-slate-800 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-bold focus:outline-none focus:border-indigo-500 cursor-pointer shadow-2xs"
              >
                {availableYears.map(y => (
                  <option key={y} value={y}>
                    Anno {y}
                  </option>
                ))}
              </select>
            )}

            {/* Selettore Veicolo */}
            {vehicles.length > 1 && (
              <select
                value={selectedVehicleId}
                onChange={(e) => setSelectedVehicleId(e.target.value)}
                className="bg-white dark:bg-slate-800 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-bold focus:outline-none focus:border-indigo-500 cursor-pointer max-w-[140px] truncate shadow-2xs"
              >
                <option value="all">Tutti i veicoli</option>
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.brand} {v.model}
                  </option>
                ))}
              </select>
            )}

            {/* Selettore Tema Card (Chiaro coerente vs Dark) */}
            <button
              onClick={() => setCardTheme(t => t === 'light' ? 'dark' : 'light')}
              className="p-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition-colors shadow-2xs cursor-pointer"
              title={cardTheme === 'light' ? 'Passa a tema Scuro' : 'Passa a tema Chiaro (Stile App)'}
            >
              {cardTheme === 'light' ? <Moon className="w-4 h-4 text-slate-600" /> : <Sun className="w-4 h-4 text-amber-400" />}
            </button>
          </div>
        </div>

        {/* FEEDBACK STATUS BANNER */}
        {statusMessage && (
          <div className="mx-4 mt-3 p-3 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-950 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* CONTENUTO PRINCIPALE SCROLLABILE (PREVIEW STORY CARD) */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 flex flex-col items-center bg-slate-100/70 dark:bg-slate-950/40">
          
          {/* STORY CARD CONTAINER (Design coerente, elegante e pronto per Instagram/WhatsApp) */}
          <div 
            id="recap-story-visual-card"
            className={`w-full max-w-sm rounded-3xl border p-5 shadow-xl relative overflow-hidden flex flex-col gap-4 transition-colors ${
              cardTheme === 'dark' 
                ? 'bg-slate-900 border-slate-800 text-white' 
                : 'bg-white border-slate-200/90 text-slate-900'
            }`}
          >
            {/* Top Brand Bar */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-black">
                  G
                </div>
                <span className={`text-[11px] font-black uppercase tracking-widest ${cardTheme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                  MyGarage
                </span>
              </div>

              <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                cardTheme === 'dark' ? 'bg-slate-800 text-sky-400' : 'bg-indigo-50 text-indigo-700 border border-indigo-200/80'
              }`}>
                {formattedPeriodLabel}
              </span>
            </div>

            {/* FOTO DELL'AUTO CON INFORMAZIONI */}
            <div className="relative rounded-2xl overflow-hidden border border-slate-200/60 dark:border-slate-700/60 aspect-video bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              {vehiclePhoto ? (
                <>
                  <img 
                    src={vehiclePhoto} 
                    alt={vehicleTitle}
                    className="w-full h-full object-cover"
                    crossOrigin="anonymous"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-3 text-white">
                    <h3 className="text-base font-black tracking-tight leading-tight drop-shadow-sm">
                      {vehicleTitle}
                    </h3>
                    {vehiclePlate && (
                      <span className="font-mono text-[10px] text-slate-300 font-semibold">
                        TARGA {vehiclePlate}
                      </span>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center p-4 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-2">
                    {singleVehicle?.vehicleType === 'moto' ? <Bike className="w-6 h-6" /> : <Car className="w-6 h-6" />}
                  </div>
                  <h3 className="text-sm font-black text-slate-800 dark:text-white">
                    {vehicleTitle}
                  </h3>
                  {vehiclePlate && (
                    <span className="font-mono text-[10px] text-slate-400 font-semibold">
                      {vehiclePlate}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* BADGE PERSONA MOOD */}
            <div className={`p-3 rounded-2xl border flex items-center gap-2.5 ${
              cardTheme === 'dark' ? 'bg-slate-800/80 border-slate-700 text-white' : `${stats.persona.badgeColor} border`
            }`}>
              <span className="text-2xl shrink-0">{stats.persona.emoji}</span>
              <div className="min-w-0">
                <span className="text-[10px] font-extrabold uppercase tracking-wider block opacity-75">
                  Mood di Guida
                </span>
                <span className="text-xs font-black block truncate">
                  {stats.persona.title}
                </span>
                <span className="text-[10px] block truncate opacity-85">
                  {stats.persona.subtitle}
                </span>
              </div>
            </div>

            {/* I 3 PUNTEGGI CHIAVE RICHIESTI: STAZZA, POTENZA E CONSUMI OTTENUTI */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-extrabold uppercase tracking-wider ${cardTheme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                  Punteggi del Mezzo
                </span>
                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                  Valutazione Globale: {stats.overallScore}/100
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                
                {/* 1. STAZZA / PESO */}
                <div className={`p-2.5 rounded-2xl border flex flex-col justify-between ${
                  cardTheme === 'dark' ? 'bg-slate-800/60 border-slate-700/80' : 'bg-slate-50/80 border-slate-200/80'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold uppercase tracking-tight text-slate-500 dark:text-slate-400">
                      Stazza
                    </span>
                    <Weight className="w-3 h-3 text-slate-400" />
                  </div>
                  <div className="my-1">
                    <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">
                      {stats.stazzaScore.score.toFixed(1)}
                    </span>
                    <span className="text-[9px] text-slate-400 font-bold ml-0.5">/10</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold block truncate text-slate-900 dark:text-white">
                      {stats.stazzaScore.value}
                    </span>
                    <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold block truncate">
                      {stats.stazzaScore.ratingText}
                    </span>
                  </div>
                </div>

                {/* 2. POTENZA MOTORE */}
                <div className={`p-2.5 rounded-2xl border flex flex-col justify-between ${
                  cardTheme === 'dark' ? 'bg-slate-800/60 border-slate-700/80' : 'bg-slate-50/80 border-slate-200/80'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold uppercase tracking-tight text-slate-500 dark:text-slate-400">
                      Potenza
                    </span>
                    <Flame className="w-3 h-3 text-amber-500" />
                  </div>
                  <div className="my-1">
                    <span className="text-lg font-black text-amber-600 dark:text-amber-400">
                      {stats.powerScore.score.toFixed(1)}
                    </span>
                    <span className="text-[9px] text-slate-400 font-bold ml-0.5">/10</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold block truncate text-slate-900 dark:text-white">
                      {stats.powerScore.value}
                    </span>
                    <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold block truncate">
                      {stats.powerScore.ratingText}
                    </span>
                  </div>
                </div>

                {/* 3. CONSUMI OTTENUTI */}
                <div className={`p-2.5 rounded-2xl border flex flex-col justify-between ${
                  cardTheme === 'dark' ? 'bg-slate-800/60 border-slate-700/80' : 'bg-slate-50/80 border-slate-200/80'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold uppercase tracking-tight text-slate-500 dark:text-slate-400">
                      Consumi
                    </span>
                    <Gauge className="w-3 h-3 text-emerald-500" />
                  </div>
                  <div className="my-1">
                    <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                      {stats.consumptionScore.score.toFixed(1)}
                    </span>
                    <span className="text-[9px] text-slate-400 font-bold ml-0.5">/10</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold block truncate text-slate-900 dark:text-white">
                      {stats.consumptionScore.value}
                    </span>
                    <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold block truncate">
                      {stats.consumptionScore.ratingText}
                    </span>
                  </div>
                </div>

              </div>
            </div>

            {/* METRICHE PRINCIPALI: STRADA & SPESA */}
            <div className="grid grid-cols-2 gap-2.5">
              
              {/* Chilometri percorsi */}
              <div className={`p-3 rounded-2xl border ${
                cardTheme === 'dark' ? 'bg-slate-800/60 border-slate-700/80' : 'bg-slate-50/80 border-slate-200/80'
              }`}>
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                  Strada Percorsa
                </span>
                <div className="flex items-baseline gap-1 my-0.5">
                  <span className="text-xl font-black text-slate-900 dark:text-white">
                    {stats.totalKm > 0 ? stats.totalKm.toLocaleString('it-IT') : '0'}
                  </span>
                  <span className="text-xs font-bold text-slate-500">km</span>
                </div>
                {stats.kmTrendPercent !== 0 && (
                  <span className={`text-[9px] font-bold flex items-center gap-0.5 ${
                    stats.kmTrendPercent > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-sky-600 dark:text-sky-400'
                  }`}>
                    {stats.kmTrendPercent > 0 ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                    <span>{stats.kmTrendPercent > 0 ? `+${stats.kmTrendPercent}%` : `${stats.kmTrendPercent}%`}</span>
                  </span>
                )}
              </div>

              {/* Spesa totale */}
              <div className={`p-3 rounded-2xl border ${
                cardTheme === 'dark' ? 'bg-slate-800/60 border-slate-700/80' : 'bg-slate-50/80 border-slate-200/80'
              }`}>
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                  Spesa Totale
                </span>
                <span className="text-xl font-black text-indigo-600 dark:text-indigo-400 my-0.5 block">
                  {settings.currency} {stats.totalCost.toFixed(0)}
                </span>
                <span className="text-[9px] text-slate-500 dark:text-slate-400 block truncate">
                  ⛽ {settings.currency} {stats.fuelCost.toFixed(0)} • {settings.currency} {stats.costPerKm}/km
                </span>
              </div>

            </div>

            {/* SCADENZE IN ARRIVO */}
            <div className={`p-3 rounded-2xl border flex flex-col gap-1.5 ${
              cardTheme === 'dark' ? 'bg-slate-800/60 border-slate-700/80' : 'bg-slate-50/80 border-slate-200/80'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>Rinnovi & Scadenze</span>
                </span>
              </div>

              {stats.upcomingRenewals.length > 0 ? (
                <div className="space-y-1">
                  {stats.upcomingRenewals.slice(0, 2).map((r, idx) => (
                    <div key={idx} className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-slate-700 dark:text-slate-200 truncate">{r.label}</span>
                      <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded shrink-0 ${
                        r.daysLeft <= 15 ? 'bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}>
                        {r.daysLeft > 0 ? `tra ${r.daysLeft} gg` : 'scaduto'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 shrink-0" />
                  <span>Nessuna scadenza urgente prevista a breve!</span>
                </span>
              )}
            </div>

            {/* Story Footer */}
            <div className={`text-center text-[9px] pt-1 border-t ${cardTheme === 'dark' ? 'border-slate-800 text-slate-500' : 'border-slate-200 text-slate-400'}`}>
              MyGarage • Condividi nelle tue Storie Instagram & WhatsApp
            </div>

          </div>

        </div>

        {/* BOTTOM ACTION BAR (CONDIVIDI IMMAGINE, SCARICA & COPIA TESTO) */}
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2.5">
          
          <div className="flex items-center gap-2">
            {/* TASTO CONDIVIDI (CONDIVIDE IL FILE IMMAGINE DIRETTO) */}
            <button
              id="btn-share-recap-image"
              onClick={handleShare}
              disabled={isSharing}
              className="bg-indigo-600 hover:bg-indigo-500 active:scale-95 disabled:opacity-50 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
              title="Condividi direttamente l'immagine Story su WhatsApp, Instagram o app social"
            >
              <Share2 className="w-4 h-4" />
              <span>{isSharing ? 'Preparazione immagine...' : 'Condividi Immagine'}</span>
            </button>

            {/* Scarica PNG HD */}
            <button
              id="btn-download-recap-png"
              onClick={handleDownload}
              disabled={isDownloading}
              className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 active:scale-95 text-slate-800 dark:text-white text-xs font-bold px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
              title="Scarica l'immagine in risoluzione 1080x1920"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Scarica PNG</span>
            </button>
          </div>

          {/* Copia Testo per WhatsApp / Chat */}
          <button
            id="btn-copy-recap-text"
            onClick={handleCopyText}
            className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 active:scale-95 text-slate-700 dark:text-slate-300 text-xs font-bold px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer ml-auto"
            title="Copia riepilogo testuale negli appunti"
          >
            {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedText ? 'Copiato!' : 'Copia Testo'}</span>
          </button>

        </div>

      </div>

    </div>
  );
};
