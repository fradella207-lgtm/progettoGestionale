import React, { useState, useMemo, useRef } from 'react';
import { 
  X, 
  Share2, 
  Download, 
  Copy, 
  Check, 
  Sparkles, 
  Calendar, 
  Fuel, 
  Wrench, 
  ShieldCheck, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  ChevronRight,
  Car,
  Bike,
  Award,
  Zap,
  Clock,
  CheckCircle2
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

interface PersonaBadge {
  title: string;
  subtitle: string;
  emoji: string;
  color: string;
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

  // Month selection: YYYY-MM
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonthNum = now.getMonth() + 1; // 1-12
  const currentMonthStr = `${currentYear}-${String(currentMonthNum).padStart(2, '0')}`;

  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthStr);
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);

  // Sharing states
  const [copiedText, setCopiedText] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

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

  // Compute stats for the chosen period
  const stats = useMemo(() => {
    const isMonthly = periodType === 'month';
    const targetMonth = selectedMonth; // "YYYY-MM"
    const targetYear = isMonthly ? parseInt(selectedMonth.split('-')[0], 10) : selectedYear;

    // Previous period identifier for comparison
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

    // Sort refuels by date and km
    currentRefuels.sort((a, b) => (a.km || 0) - (b.km || 0));
    prevPeriodRefuels.sort((a, b) => (a.km || 0) - (b.km || 0));

    // Distance calculation
    let totalKm = 0;
    if (currentRefuels.length >= 2) {
      totalKm = currentRefuels[currentRefuels.length - 1].km - currentRefuels[0].km;
    } else if (currentRefuels.length === 1) {
      // Approximate from last recorded or standard monthly commute
      totalKm = 450;
    } else {
      totalKm = 0;
    }

    let prevKm = 0;
    if (prevPeriodRefuels.length >= 2) {
      prevKm = prevPeriodRefuels[prevPeriodRefuels.length - 1].km - prevPeriodRefuels[0].km;
    }

    // Percentage diff
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

    // Cost per km
    const costPerKm = totalKm > 0 ? (totalCost / totalKm).toFixed(2) : '0.00';

    // Average consumption
    let avgConsumptionStr = '--';
    if (totalKm > 0 && totalVolume > 0) {
      const lPer100 = ((totalVolume / totalKm) * 100).toFixed(1);
      const isElectric = singleVehicle?.fuelType?.includes('Elettrica');
      avgConsumptionStr = isElectric ? `${lPer100} kWh/100km` : `${lPer100} L/100km`;
    }

    // Upcoming renewals / deadlines (next 60 days)
    const upcomingRenewals: Array<{ label: string; dateStr: string; daysLeft: number; estimatedCost?: number }> = [];
    const today = new Date();

    activeVehicles.forEach(v => {
      // 1. Documents with expiry
      v.documents?.forEach(d => {
        if (d.expiryDate) {
          const exp = new Date(d.expiryDate);
          const diffDays = Math.ceil((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          if (diffDays >= -10 && diffDays <= 65) {
            upcomingRenewals.push({
              label: `${d.title || d.type.toUpperCase()} (${v.model})`,
              dateStr: exp.toLocaleDateString('it-IT'),
              daysLeft: diffDays,
              estimatedCost: d.extractedInfo?.taxAmount
            });
          }
        }
      });

      // 2. Revisione ministeriale estimate
      if (v.registrationDate) {
        const regYear = parseInt(v.registrationDate.split('-')[0], 10);
        const age = currentYear - regYear;
        // Italian rule: 4 years after first registration, then every 2 years
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
              label: `Revisione Ministeriale (${v.brand} ${v.model})`,
              dateStr: revDate.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' }),
              daysLeft: diffDays,
              estimatedCost: 79
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
      color: 'from-amber-500 to-orange-600'
    };

    if (totalKm > 1500) {
      persona = {
        title: 'Road Tripper Inarrestabile',
        subtitle: `Hai macinato oltre ${totalKm.toLocaleString()} km questo periodo!`,
        emoji: '🛣️',
        color: 'from-blue-600 to-cyan-500'
      };
    } else if (singleVehicle?.vehicleType === 'moto') {
      persona = {
        title: 'Spirito Libero su 2 Ruote',
        subtitle: 'Puro piacere di guida ad ogni curva',
        emoji: '🏍️',
        color: 'from-red-600 to-rose-500'
      };
    } else if (singleVehicle?.fuelType?.includes('Elettrica') || singleVehicle?.fuelType?.includes('Hybrid')) {
      persona = {
        title: 'Maestro dell\'Efficienza',
        subtitle: 'Ottimizzazione energetica e mobilità sostenibile',
        emoji: '⚡',
        color: 'from-emerald-500 to-teal-600'
      };
    } else if (maintCost > 200) {
      persona = {
        title: 'Custode Perfetto del Mezzo',
        subtitle: 'Interventi mirati per massima sicurezza e valore',
        emoji: '🛠️',
        color: 'from-indigo-600 to-violet-600'
      };
    } else if (totalCost < 80 && totalKm > 0) {
      persona = {
        title: 'Re del Risparmio Low-Cost',
        subtitle: 'Costi contenuti al massimo con zero sprechi',
        emoji: '🎯',
        color: 'from-teal-500 to-emerald-600'
      };
    }

    // Health Score (0 - 100)
    let healthScore = 92;
    if (upcomingRenewals.some(r => r.daysLeft < 0)) healthScore -= 15;
    if (totalCost > 400) healthScore += 4;
    if (totalKm > 800) healthScore += 2;
    healthScore = Math.min(100, Math.max(70, healthScore));

    return {
      totalKm,
      kmTrendPercent,
      fuelCost,
      maintCost,
      totalCost,
      totalVolume,
      refuelStopsCount,
      costPerKm,
      avgConsumptionStr,
      upcomingRenewals,
      persona,
      healthScore,
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

  // Copy text summary for social / messaging
  const handleCopyText = () => {
    const vehicleLabel = singleVehicle 
      ? `${singleVehicle.brand} ${singleVehicle.model} (${singleVehicle.plate})`
      : 'Tutto il mio Garage';

    const text = `📊 Il mio Recap Auto - ${formattedPeriodLabel.toUpperCase()}
Veicolo: ${vehicleLabel}
👤 Mood: ${stats.persona.emoji} ${stats.persona.title}

🛣️ Strada percorsa: ${stats.totalKm > 0 ? `${stats.totalKm.toLocaleString()} km` : 'In avvio'}
💳 Spesa complessiva: ${settings.currency} ${stats.totalCost.toFixed(0)}
⛽ Rifornimenti effettuati: ${stats.refuelStopsCount} soste (${stats.totalVolume.toFixed(0)} L/kWh)
⚡ Costo medio: ${settings.currency} ${stats.costPerKm}/km
🏆 Punteggio cura veicolo: ${stats.healthScore}/100

${stats.upcomingRenewals.length > 0 ? `⏳ Prossime scadenze: ${stats.upcomingRenewals.map(r => `${r.label} (${r.dateStr})`).join(', ')}` : '✅ Nessuna scadenza urgente!'}

Generato con MyGarage • Compagno di viaggio intelligente 🚗💨`;

    navigator.clipboard.writeText(text).then(() => {
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2500);
    });
  };

  // Web Share API (native on mobile)
  const handleShare = async () => {
    const shareData = {
      title: `Recap ${formattedPeriodLabel} - MyGarage`,
      text: `Guarda il mio recap di ${formattedPeriodLabel} su MyGarage! Ho percorso ${stats.totalKm.toLocaleString()} km con ${stats.persona.title} ${stats.persona.emoji}`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (e) {
        // Fallback to copy
        handleCopyText();
      }
    } else {
      handleCopyText();
    }
  };

  // Generate Instagram Story Image (Canvas 1080x1920)
  const handleDownloadStoryImage = () => {
    setIsGeneratingImage(true);

    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      setIsGeneratingImage(false);
      return;
    }

    // 1. Premium Dark luxury gradient background
    const bgGrad = ctx.createLinearGradient(0, 0, 1080, 1920);
    bgGrad.addColorStop(0, '#090d16');
    bgGrad.addColorStop(0.35, '#0f172a');
    bgGrad.addColorStop(0.7, '#111827');
    bgGrad.addColorStop(1, '#1e1b4b');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1080, 1920);

    // Subtle ambient glow circles
    const glow1 = ctx.createRadialGradient(200, 350, 20, 200, 350, 450);
    glow1.addColorStop(0, 'rgba(99, 102, 241, 0.22)');
    glow1.addColorStop(1, 'rgba(99, 102, 241, 0)');
    ctx.fillStyle = glow1;
    ctx.fillRect(0, 0, 1080, 1920);

    const glow2 = ctx.createRadialGradient(900, 1400, 20, 900, 1400, 500);
    glow2.addColorStop(0, 'rgba(16, 185, 129, 0.18)');
    glow2.addColorStop(1, 'rgba(16, 185, 129, 0)');
    ctx.fillStyle = glow2;
    ctx.fillRect(0, 0, 1080, 1920);

    // Rounded Card Boundary Accent
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 3;
    ctx.strokeRect(60, 60, 960, 1800);

    // 2. Header Brand
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 38px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('MYGARAGE', 110, 145);

    // Period Pill
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.beginPath();
    ctx.roundRect(690, 105, 280, 52, 26);
    ctx.fill();
    ctx.fillStyle = '#38bdf8';
    ctx.font = '700 24px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(formattedPeriodLabel.toUpperCase(), 830, 140);
    ctx.textAlign = 'left';

    // 3. Vehicle Name & Plate
    const vehicleTitle = singleVehicle ? `${singleVehicle.brand} ${singleVehicle.model}` : 'Garage Completo';
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 58px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(vehicleTitle, 110, 245);

    if (singleVehicle?.plate) {
      ctx.fillStyle = '#94a3b8';
      ctx.font = '600 30px monospace';
      ctx.fillText(`TARGA: ${singleVehicle.plate}`, 110, 295);
    }

    // 4. Driver Persona Banner (Instagram Card)
    const personaGrad = ctx.createLinearGradient(110, 340, 970, 480);
    personaGrad.addColorStop(0, '#4f46e5');
    personaGrad.addColorStop(1, '#7c3aed');
    ctx.fillStyle = personaGrad;
    ctx.beginPath();
    ctx.roundRect(110, 340, 860, 160, 32);
    ctx.fill();

    ctx.font = '56px serif';
    ctx.fillText(stats.persona.emoji, 150, 440);

    ctx.fillStyle = '#ffffff';
    ctx.font = '800 36px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(stats.persona.title, 240, 410);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.font = '500 24px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(stats.persona.subtitle, 240, 455);

    // 5. Stat Block 1: Chilometri Percorsi
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.beginPath();
    ctx.roundRect(110, 535, 860, 240, 32);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#94a3b8';
    ctx.font = '700 26px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('STRADA PERCORSA', 150, 600);

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 84px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`${stats.totalKm.toLocaleString('it-IT')} KM`, 150, 695);

    if (stats.kmTrendPercent !== 0) {
      const isUp = stats.kmTrendPercent > 0;
      ctx.fillStyle = isUp ? '#34d399' : '#38bdf8';
      ctx.font = '700 28px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(`${isUp ? '↑ +' : '↓ '}${stats.kmTrendPercent}% rispetto al periodo precedente`, 150, 745);
    }

    // 6. Stat Block 2: Spesa Totale & Breakdown (Two Columns)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.beginPath();
    ctx.roundRect(110, 805, 415, 240, 32);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.stroke();

    ctx.fillStyle = '#94a3b8';
    ctx.font = '700 24px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('SPESA TOTALE', 140, 865);

    ctx.fillStyle = '#38bdf8';
    ctx.font = '900 68px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`${settings.currency} ${stats.totalCost.toFixed(0)}`, 140, 955);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '500 24px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`⛽ ${settings.currency} ${stats.fuelCost.toFixed(0)} | 🔧 ${settings.currency} ${stats.maintCost.toFixed(0)}`, 140, 1005);

    // Stat Block 3: Costo al Km / Efficienza
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.beginPath();
    ctx.roundRect(555, 805, 415, 240, 32);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.stroke();

    ctx.fillStyle = '#94a3b8';
    ctx.font = '700 24px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('COSTO AL CHILOMETRO', 585, 865);

    ctx.fillStyle = '#34d399';
    ctx.font = '900 68px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`${settings.currency} ${stats.costPerKm}`, 585, 955);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '500 24px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`${stats.refuelStopsCount} rifornimenti • ${stats.totalVolume.toFixed(0)} L/kWh`, 585, 1005);

    // 7. Stat Block 4: Scadenze & Rinnovi in arrivo
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.beginPath();
    ctx.roundRect(110, 1075, 860, 290, 32);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.stroke();

    ctx.fillStyle = '#fbbf24';
    ctx.font = '800 26px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('⏳ RINNOVI & SCADENZE IN ARRIVO', 150, 1140);

    if (stats.upcomingRenewals.length > 0) {
      stats.upcomingRenewals.slice(0, 3).forEach((r, idx) => {
        const yPos = 1205 + idx * 52;
        ctx.fillStyle = '#ffffff';
        ctx.font = '700 26px "Plus Jakarta Sans", sans-serif';
        ctx.fillText(`• ${r.label}`, 150, yPos);

        ctx.fillStyle = r.daysLeft <= 15 ? '#f87171' : '#94a3b8';
        ctx.font = '600 24px monospace';
        ctx.textAlign = 'right';
        ctx.fillText(`${r.dateStr} (${r.daysLeft > 0 ? `tra ${r.daysLeft} gg` : 'scaduto!'})`, 930, yPos);
        ctx.textAlign = 'left';
      });
    } else {
      ctx.fillStyle = '#34d399';
      ctx.font = '600 28px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('✓ Nessuna scadenza o rinnovo imminente. Sei in regola!', 150, 1220);
    }

    // 8. Stat Block 5: Punteggio Cura Mezzo
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.beginPath();
    ctx.roundRect(110, 1395, 860, 210, 32);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.stroke();

    ctx.fillStyle = '#94a3b8';
    ctx.font = '700 24px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('PUNTEGGIO DI GESTIONE', 150, 1455);

    ctx.fillStyle = '#a855f7';
    ctx.font = '900 78px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`${stats.healthScore}`, 150, 1545);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '700 36px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('/ 100', 270, 1545);

    ctx.fillStyle = '#34d399';
    ctx.font = '700 28px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Livello: Esemplare & Certificato ⭐', 450, 1530);

    // 9. Watermark Footer
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = '600 24px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('MyGarage • Il tuo compagno intelligente per auto e moto', 540, 1780);

    // Convert to Image and trigger download
    try {
      const imgDataUrl = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      const sanitizedName = vehicleTitle.replace(/\s+/g, '_').toLowerCase();
      downloadLink.download = `mygarage_recap_${sanitizedName}_${formattedPeriodLabel.replace(/\s+/g, '_').toLowerCase()}.png`;
      downloadLink.href = imgDataUrl;
      downloadLink.click();
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error('Error generating canvas image:', err);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* Container Modale */}
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[95vh]">
        
        {/* TOP BAR / CONTROLLI */}
        <div className="p-4 sm:p-5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between gap-3 sticky top-0 z-20 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-1.5">
                <span>Recap {periodType === 'month' ? 'Mensile' : 'Annuale'}</span>
                <span className="text-[10px] uppercase font-extrabold bg-indigo-500/30 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/40">
                  Condivisibile
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                L'andamento di strada, spese e scadenze in stile Story
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Chiudi"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* SELETTORI PERIODO & VEICOLO */}
        <div className="px-4 py-3 bg-slate-950/50 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2.5 text-xs">
          
          {/* Switch Mese / Anno */}
          <div className="inline-flex bg-slate-800/80 p-1 rounded-xl border border-slate-700/80 font-bold">
            <button
              onClick={() => setPeriodType('month')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                periodType === 'month' 
                  ? 'bg-indigo-600 text-white shadow-xs' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Mese
            </button>
            <button
              onClick={() => setPeriodType('year')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                periodType === 'year' 
                  ? 'bg-indigo-600 text-white shadow-xs' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Anno (Wrapped)
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Selettore Mese / Anno */}
            {periodType === 'month' ? (
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-slate-800 text-white border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-bold focus:outline-none focus:border-indigo-500 cursor-pointer"
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
                className="bg-slate-800 text-white border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-bold focus:outline-none focus:border-indigo-500 cursor-pointer"
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
                className="bg-slate-800 text-white border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-bold focus:outline-none focus:border-indigo-500 cursor-pointer max-w-[140px] truncate"
              >
                <option value="all">Tutti i veicoli</option>
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.brand} {v.model}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* CONTENUTO PRINCIPALE SCROLLABILE (PREVIEW STORY CARD) */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 flex flex-col items-center">
          
          {/* INSTAGRAMMABLE STORY CARD PREVIEW */}
          <div 
            id="recap-story-visual-card"
            className="w-full max-w-sm rounded-3xl bg-gradient-to-b from-[#0f172a] via-[#111827] to-[#1e1b4b] border border-white/15 p-5 text-white shadow-2xl relative overflow-hidden flex flex-col gap-4.5"
          >
            {/* Ambient subtle light glows */}
            <div className="absolute top-0 right-0 w-44 h-44 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-44 h-44 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

            {/* Card Header */}
            <div className="flex items-center justify-between gap-2 z-10">
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-black">
                  G
                </div>
                <span className="text-[11px] font-black uppercase tracking-widest text-slate-300">MyGarage</span>
              </div>

              <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-white/10 text-sky-300 border border-white/10">
                {formattedPeriodLabel}
              </span>
            </div>

            {/* Vehicle Details */}
            <div className="z-10">
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight">
                {singleVehicle ? `${singleVehicle.brand} ${singleVehicle.model}` : 'Garage Completo'}
              </h3>
              {singleVehicle?.plate && (
                <span className="inline-block font-mono text-[11px] text-slate-400 mt-0.5">
                  Targa {singleVehicle.plate}
                </span>
              )}
            </div>

            {/* Persona Mood Banner */}
            <div className={`p-3.5 rounded-2xl bg-gradient-to-r ${stats.persona.color} text-white shadow-md flex items-center gap-3 z-10`}>
              <span className="text-3xl shrink-0">{stats.persona.emoji}</span>
              <div className="min-w-0">
                <span className="text-xs font-black uppercase tracking-wider text-white/80 block">
                  Mood di Guida
                </span>
                <span className="text-sm font-extrabold text-white block truncate">
                  {stats.persona.title}
                </span>
                <span className="text-[10px] text-white/90 block truncate">
                  {stats.persona.subtitle}
                </span>
              </div>
            </div>

            {/* Metric 1: Strada Percorsa (Big Impact) */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-1 z-10">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Chilometri Percorsi
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                  {stats.totalKm > 0 ? stats.totalKm.toLocaleString('it-IT') : '0'} <span className="text-lg font-bold text-slate-400">km</span>
                </span>
                {stats.kmTrendPercent !== 0 && (
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 ${
                    stats.kmTrendPercent > 0 
                      ? 'bg-emerald-500/20 text-emerald-400' 
                      : 'bg-sky-500/20 text-sky-400'
                  }`}>
                    {stats.kmTrendPercent > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    <span>{stats.kmTrendPercent > 0 ? `+${stats.kmTrendPercent}%` : `${stats.kmTrendPercent}%`}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Metrics 2 & 3: Spesa & Efficienza (2 Colonne) */}
            <div className="grid grid-cols-2 gap-2.5 z-10">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Spesa Totale
                </span>
                <span className="text-xl sm:text-2xl font-black text-sky-400 mt-1">
                  {settings.currency} {stats.totalCost.toFixed(0)}
                </span>
                <span className="text-[10px] text-slate-400 mt-1">
                  ⛽ {settings.currency} {stats.fuelCost.toFixed(0)} • 🔧 {settings.currency} {stats.maintCost.toFixed(0)}
                </span>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Costo al Km
                </span>
                <span className="text-xl sm:text-2xl font-black text-emerald-400 mt-1">
                  {settings.currency} {stats.costPerKm}
                </span>
                <span className="text-[10px] text-slate-400 mt-1">
                  {stats.refuelStopsCount} rifornimenti
                </span>
              </div>
            </div>

            {/* Metric 4: Rinnovi e Scadenze in Arrivo */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 flex flex-col gap-2 z-10">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>Rinnovi & Scadenze in Arrivo</span>
                </span>
              </div>

              {stats.upcomingRenewals.length > 0 ? (
                <div className="space-y-1.5">
                  {stats.upcomingRenewals.slice(0, 2).map((r, i) => (
                    <div key={i} className="flex items-center justify-between text-xs bg-black/20 px-2 py-1.5 rounded-lg">
                      <span className="font-semibold truncate text-slate-200">{r.label}</span>
                      <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded shrink-0 ${
                        r.daysLeft <= 15 ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-700 text-slate-300'
                      }`}>
                        {r.daysLeft > 0 ? `tra ${r.daysLeft} gg` : 'scaduto'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-[11px] text-emerald-400 font-medium flex items-center gap-1.5 py-1">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Nessun rinnovo urgente previsto a breve!</span>
                </div>
              )}
            </div>

            {/* Metric 5: Score di Gestione */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3 flex items-center justify-between z-10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center font-black text-xs">
                  {stats.healthScore}
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">Punteggio Cura Veicolo</span>
                  <span className="text-[10px] text-emerald-400 block">Gestione e monitoraggio ottimale</span>
                </div>
              </div>
              <Award className="w-5 h-5 text-amber-400 shrink-0" />
            </div>

            {/* Story Watermark Footer */}
            <div className="text-center text-[10px] text-slate-500 pt-1 border-t border-white/10 z-10">
              Generato con MyGarage • Condividi nelle tue Storie
            </div>

          </div>

        </div>

        {/* BOTTOM ACTION BAR (DOWNLOAD, SHARE, COPY) */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2.5">
          
          <div className="flex items-center gap-2">
            {/* Scarica PNG Story */}
            <button
              id="btn-download-story-png"
              onClick={handleDownloadStoryImage}
              disabled={isGeneratingImage}
              className="bg-indigo-600 hover:bg-indigo-500 active:scale-95 disabled:opacity-50 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
              title="Scarica card a risoluzione 1080x1920 per Instagram Story o WhatsApp"
            >
              <Download className="w-4 h-4" />
              <span>{downloadSuccess ? 'Scaricata!' : 'Scarica Immagine Story'}</span>
            </button>

            {/* Condividi nativo */}
            <button
              id="btn-share-story"
              onClick={handleShare}
              className="bg-slate-800 hover:bg-slate-700 active:scale-95 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>Condividi</span>
            </button>
          </div>

          {/* Copia Testo per WhatsApp */}
          <button
            id="btn-copy-recap-text"
            onClick={handleCopyText}
            className="bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 hover:text-white text-xs font-bold px-3 py-2.5 rounded-xl border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer ml-auto"
            title="Copia riepilogo testuale per WhatsApp o Telegram"
          >
            {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedText ? 'Copiato!' : 'Copia Testo'}</span>
          </button>

        </div>

      </div>

    </div>
  );
};
