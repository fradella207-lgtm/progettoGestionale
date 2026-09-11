import { RefuelRecord, Vehicle, EnergySourceType } from '../types';

export interface RefuelWithCalculation extends RefuelRecord {
  deltaKm: number | null;
  unitPrice: string | null;
  intervalConsumption?: {
    kmPerUnit: number;
    unitPer100Km: number;
    formattedKmPerUnit: string;
    formattedUnitPer100Km: string;
  };
  tripId?: string;
}

export interface BoardTrip {
  id: string;
  tripIndex: number;
  title: string;
  startDate: string;
  endDate: string;
  daysDuration: number;
  startKm: number;
  endKm: number;
  distanceKm: number;
  totalQuantity: number;
  unit: string;
  totalSpent: number;
  kmPerUnit: number;
  unitPer100Km: number;
  formattedKmPerUnit: string;
  formattedUnitPer100Km: string;
  costPerKm: string;
  costPer100Km: string;
  refuelsCount: number;
  refuels: RefuelWithCalculation[];
  energyType?: EnergySourceType;
  efficiencyVsAveragePercent?: number; // e.g. +5.2% or -3.1%
  isBest?: boolean;
  isWorst?: boolean;
  usageCategory?: string; // Optional user classification tag (e.g. "Lavoro", "Viaggio", "Città", "Tempo Libero")
}

export interface DetailedConsumptionMetrics {
  isCertified: boolean;
  totalDistance: number;
  totalFuelSpent: number;
  totalMaintSpent: number;
  totalOverallSpent: number;
  costPerKm: string;
  fuelCostPerKm: string;
  costPer100Km: string;
  kmPerUnit: string;
  unitPer100Km: string;
  fuelUnit: string;
  // Dual-fuel / PHEV specifics
  isPHEV: boolean;
  isBEV: boolean;
  isBifuel: boolean;
  electricRefuelsCount: number;
  thermalRefuelsCount: number;
  totalElectricKwh: number;
  totalElectricSpent: number;
  totalThermalLiters: number;
  totalThermalSpent: number;
  electricKwhPer100Km: string;
  thermalLPer100Km: string;
  kmPerKwh: string;
  kmPerLiter: string;
  gasRefuelsCount?: number;
  totalGasQuantity?: number;
  totalGasSpent?: number;
  gasPer100Km?: string;
  kmPerGasUnit?: string;
  calculatedRefuels: RefuelWithCalculation[];
  boardTrips: BoardTrip[];
  bestTrip?: BoardTrip;
  worstTrip?: BoardTrip;
  avgTripDistanceKm: number;
  avgTripCost: number;
}

/**
 * Standard Metrological Automotive Consumption Algorithm (Spritmonitor / Fuelio standard)
 * Correctly accounts for:
 * 1. Full-to-Full intervals including intermediate partial refills.
 * 2. Mixed energy tracking for PHEV (Electric kWh vs Fuel Liters).
 * 3. Bifuel tracking (GPL/Metano vs Petrol).
 * 4. Automatic extraction of Board Trips (Trip di Bordo Pieno-Pieno)
 */
export function calculateVehicleConsumptionMetrics(vehicle: Vehicle): DetailedConsumptionMetrics {
  const isPHEV = vehicle.fuelType === 'Plug-in Hybrid (PHEV)';
  const isBEV = vehicle.fuelType.includes('Elettrica') || vehicle.fuelType.includes('BEV');
  const isLPG = vehicle.fuelType.includes('GPL');
  const isCNG = vehicle.fuelType.includes('Metano');
  const isBifuel = isLPG || isCNG;
  const fuelUnit = isBEV ? 'kWh' : (isCNG ? 'Kg' : 'L');

  const rawRefuels = vehicle.refuels || [];
  const rawMaints = vehicle.maintenances || [];

  // Sort refuels chronologically (oldest to newest) for interval math
  const sortedRefuels = [...rawRefuels].sort((a, b) => {
    const timeA = new Date(a.date).getTime();
    const timeB = new Date(b.date).getTime();
    if (timeA !== timeB) return timeA - timeB;
    return (Number(a.km) || 0) - (Number(b.km) || 0);
  });

  const refuelsKm = rawRefuels.map(r => Number(r.km) || 0);
  const maintKm = rawMaints.map(m => Number(m.km) || 0);
  const currentKm = Math.max(Number(vehicle.initialKm) || 0, ...refuelsKm, ...maintKm);

  const totalFuelSpent = rawRefuels.reduce((acc, r) => acc + (Number(r.price) || 0), 0);
  const totalMaintSpent = rawMaints.reduce((acc, m) => acc + (Number(m.cost) || 0), 0);
  const totalOverallSpent = totalFuelSpent + totalMaintSpent;

  // Starting base odometer
  const minOdo = sortedRefuels.length > 0 
    ? Math.min(Number(vehicle.initialKm) || Infinity, Number(sortedRefuels[0].km))
    : (Number(vehicle.initialKm) || 0);
  
  const totalDistance = Math.max(0, currentKm - (minOdo === Infinity ? 0 : minOdo));

  const costPerKm = totalDistance > 0 ? (totalOverallSpent / totalDistance).toFixed(3) : '0.000';
  const fuelCostPerKm = totalDistance > 0 ? (totalFuelSpent / totalDistance).toFixed(3) : '0.000';
  const costPer100Km = totalDistance > 0 ? ((totalFuelSpent / totalDistance) * 100).toFixed(2) : '--';

  // 1. Separate energy streams
  const electricRefuels = sortedRefuels.filter(r => r.energyType === 'electricity' || r.unit === 'kWh' || (isBEV && !r.energyType));
  const thermalFuelRefuels = sortedRefuels.filter(r => (r.energyType === 'fuel' || r.unit === 'L' || (!r.energyType && !r.unit && !isBEV && !isBifuel)) && r.energyType !== 'lpg' && r.energyType !== 'cng');
  const gasRefuels = sortedRefuels.filter(r => r.energyType === 'lpg' || r.energyType === 'cng' || r.unit === 'Kg');

  const totalElectricKwh = electricRefuels.reduce((acc, r) => acc + (Number(r.quantity) || 0), 0);
  const totalElectricSpent = electricRefuels.reduce((acc, r) => acc + (Number(r.price) || 0), 0);

  const totalThermalLiters = thermalFuelRefuels.reduce((acc, r) => acc + (Number(r.quantity) || 0), 0);
  const totalThermalSpent = thermalFuelRefuels.reduce((acc, r) => acc + (Number(r.price) || 0), 0);

  const totalGasQuantity = gasRefuels.reduce((acc, r) => acc + (Number(r.quantity) || 0), 0);
  const totalGasSpent = gasRefuels.reduce((acc, r) => acc + (Number(r.price) || 0), 0);

  let electricKwhPer100Km = '--';
  let thermalLPer100Km = '--';
  let kmPerKwh = '--';
  let kmPerLiter = '--';
  let gasPer100Km = '--';
  let kmPerGasUnit = '--';

  if (totalDistance > 0) {
    if (totalElectricKwh > 0) {
      electricKwhPer100Km = ((totalElectricKwh / totalDistance) * 100).toFixed(1);
      kmPerKwh = (totalDistance / totalElectricKwh).toFixed(1);
    }
    if (totalThermalLiters > 0) {
      thermalLPer100Km = ((totalThermalLiters / totalDistance) * 100).toFixed(1);
      kmPerLiter = (totalDistance / totalThermalLiters).toFixed(1);
    }
    if (totalGasQuantity > 0) {
      gasPer100Km = ((totalGasQuantity / totalDistance) * 100).toFixed(1);
      kmPerGasUnit = (totalDistance / totalGasQuantity).toFixed(1);
    }
  }

  // 2. Full-to-Full Windowed Certified Consumption Algorithm & Board Trips Builder
  let certifiedDeltaKmSum = 0;
  let certifiedQuantitySum = 0;
  let hasValidFullIntervals = false;

  let lastFullIndex = -1;
  const calculatedMap = new Map<string, RefuelWithCalculation>();
  const rawTrips: BoardTrip[] = [];

  for (let i = 0; i < sortedRefuels.length; i++) {
    const current = sortedRefuels[i];
    const prev = i > 0 ? sortedRefuels[i - 1] : null;
    const deltaKm = prev ? Math.max(0, Number(current.km) - Number(prev.km)) : null;
    const qty = Number(current.quantity) || 0;
    const price = Number(current.price) || 0;
    const unitPrice = (qty > 0 && price > 0) ? (price / qty).toFixed(3) : null;

    let intervalConsumption: RefuelWithCalculation['intervalConsumption'] | undefined = undefined;
    let tripId: string | undefined = undefined;

    if (current.type === 'full') {
      if (lastFullIndex !== -1) {
        const lastFullRefuel = sortedRefuels[lastFullIndex];
        const spanKm = Number(current.km) - Number(lastFullRefuel.km);
        
        // Sum all fuel added in this full-to-full window (from after last full to current full)
        let spanQty = 0;
        let spanSpent = 0;
        const tripRefuels: RefuelRecord[] = [];

        for (let j = lastFullIndex + 1; j <= i; j++) {
          const item = sortedRefuels[j];
          spanQty += Number(item.quantity) || 0;
          spanSpent += Number(item.price) || 0;
          tripRefuels.push(item);
        }

        if (spanKm > 0 && spanQty > 0) {
          const kmPerUnitVal = spanKm / spanQty;
          const unitPer100KmVal = (spanQty / spanKm) * 100;
          const roundedKmPerUnit = Math.round(kmPerUnitVal * 10) / 10;
          const roundedUnitPer100Km = Math.round(unitPer100KmVal * 100) / 100;
          const currentTripId = `trip-${lastFullRefuel.id}-${current.id}`;
          tripId = currentTripId;

          intervalConsumption = {
            kmPerUnit: roundedKmPerUnit,
            unitPer100Km: roundedUnitPer100Km,
            formattedKmPerUnit: roundedKmPerUnit.toFixed(1),
            formattedUnitPer100Km: roundedUnitPer100Km.toFixed(2)
          };

          certifiedDeltaKmSum += spanKm;
          certifiedQuantitySum += spanQty;
          hasValidFullIntervals = true;

          // Days duration
          const dStart = new Date(lastFullRefuel.date).getTime();
          const dEnd = new Date(current.date).getTime();
          const daysDuration = Math.max(1, Math.round(Math.abs(dEnd - dStart) / (1000 * 60 * 60 * 24)));

          const tripUnit = current.unit || fuelUnit;
          const assignedUsage = (vehicle.tripUsages && vehicle.tripUsages[currentTripId]) || current.usageType || lastFullRefuel.usageType;

          rawTrips.push({
            id: currentTripId,
            tripIndex: rawTrips.length + 1,
            title: `Trip #${rawTrips.length + 1}`,
            startDate: lastFullRefuel.date,
            endDate: current.date,
            daysDuration,
            startKm: Number(lastFullRefuel.km),
            endKm: Number(current.km),
            distanceKm: spanKm,
            totalQuantity: Math.round(spanQty * 100) / 100,
            unit: tripUnit,
            totalSpent: Math.round(spanSpent * 100) / 100,
            kmPerUnit: roundedKmPerUnit,
            unitPer100Km: roundedUnitPer100Km,
            formattedKmPerUnit: roundedKmPerUnit.toFixed(1),
            formattedUnitPer100Km: roundedUnitPer100Km.toFixed(2),
            costPerKm: (spanSpent / spanKm).toFixed(3),
            costPer100Km: ((spanSpent / spanKm) * 100).toFixed(2),
            refuelsCount: tripRefuels.length,
            refuels: [], // filled below with enriched refuels
            energyType: current.energyType,
            usageCategory: assignedUsage
          });
        }
      }
      lastFullIndex = i;
    }

    calculatedMap.set(current.id, {
      ...current,
      deltaKm,
      unitPrice,
      intervalConsumption,
      tripId
    });
  }

  // Populate trips with enriched refuels
  const boardTrips: BoardTrip[] = rawTrips.map(trip => {
    const matchingRefuels: RefuelWithCalculation[] = [];
    for (const r of sortedRefuels) {
      if (Number(r.km) > trip.startKm && Number(r.km) <= trip.endKm) {
        matchingRefuels.push(calculatedMap.get(r.id)!);
      }
    }
    return {
      ...trip,
      refuels: matchingRefuels
    };
  });

  // Determine overall kmPerUnit and unitPer100Km
  let finalKmPerUnit = 0;
  let finalUnitPer100Km = 0;
  const isCertified = hasValidFullIntervals && certifiedDeltaKmSum > 0 && certifiedQuantitySum > 0;

  if (isCertified) {
    finalKmPerUnit = certifiedDeltaKmSum / certifiedQuantitySum;
    finalUnitPer100Km = (certifiedQuantitySum / certifiedDeltaKmSum) * 100;
  } else {
    // Fallback global fleet average
    const primaryStream = isBEV ? electricRefuels : (isBifuel ? (gasRefuels.length > 0 ? gasRefuels : thermalFuelRefuels) : sortedRefuels);
    const totalPrimaryQty = primaryStream.reduce((acc, r) => acc + (Number(r.quantity) || 0), 0);
    if (totalDistance > 0 && totalPrimaryQty > 0) {
      finalKmPerUnit = totalDistance / totalPrimaryQty;
      finalUnitPer100Km = (totalPrimaryQty / totalDistance) * 100;
    }
  }

  const safeKmPerUnit = isFinite(finalKmPerUnit) && !isNaN(finalKmPerUnit) ? Math.round(finalKmPerUnit * 10) / 10 : 0;
  const safeUnitPer100Km = isFinite(finalUnitPer100Km) && !isNaN(finalUnitPer100Km) ? Math.round(finalUnitPer100Km * 100) / 100 : 0;

  // Enrich Board Trips with efficiency comparisons and identify best/worst
  let bestTrip: BoardTrip | undefined = undefined;
  let worstTrip: BoardTrip | undefined = undefined;

  if (boardTrips.length > 0 && safeKmPerUnit > 0) {
    // Higher kmPerUnit is better (or lower unitPer100Km is better)
    const sortedByEfficiency = [...boardTrips].sort((a, b) => b.kmPerUnit - a.kmPerUnit);
    const bestId = sortedByEfficiency[0].id;
    const worstId = sortedByEfficiency[sortedByEfficiency.length - 1].id;

    boardTrips.forEach(t => {
      // Comparison vs global average
      const diffPercent = ((t.kmPerUnit - safeKmPerUnit) / safeKmPerUnit) * 100;
      t.efficiencyVsAveragePercent = isFinite(diffPercent) ? Math.round(diffPercent * 10) / 10 : 0;
      if (t.id === bestId && boardTrips.length > 1) t.isBest = true;
      if (t.id === worstId && boardTrips.length > 1) t.isWorst = true;
    });

    bestTrip = boardTrips.find(t => t.id === bestId);
    worstTrip = boardTrips.find(t => t.id === worstId);
  }

  const avgTripDistanceKm = boardTrips.length > 0
    ? Math.round(boardTrips.reduce((acc, t) => acc + t.distanceKm, 0) / boardTrips.length)
    : 0;

  const avgTripCost = boardTrips.length > 0
    ? Math.round((boardTrips.reduce((acc, t) => acc + t.totalSpent, 0) / boardTrips.length) * 100) / 100
    : 0;

  const calculatedRefuels: RefuelWithCalculation[] = sortedRefuels
    .map(r => calculatedMap.get(r.id)!)
    .reverse(); // Newest first for list presentation

  return {
    isCertified,
    totalDistance,
    totalFuelSpent,
    totalMaintSpent,
    totalOverallSpent,
    costPerKm,
    fuelCostPerKm,
    costPer100Km,
    kmPerUnit: safeKmPerUnit > 0 ? safeKmPerUnit.toFixed(1) : '--',
    unitPer100Km: safeUnitPer100Km > 0 ? safeUnitPer100Km.toFixed(2) : '--',
    fuelUnit,
    isPHEV,
    isBEV,
    isBifuel,
    electricRefuelsCount: electricRefuels.length,
    thermalRefuelsCount: thermalFuelRefuels.length,
    totalElectricKwh,
    totalElectricSpent,
    totalThermalLiters,
    totalThermalSpent,
    electricKwhPer100Km,
    thermalLPer100Km,
    kmPerKwh,
    kmPerLiter,
    gasRefuelsCount: gasRefuels.length,
    totalGasQuantity,
    totalGasSpent,
    gasPer100Km,
    kmPerGasUnit,
    calculatedRefuels,
    boardTrips: boardTrips.reverse(), // Newest trip first
    bestTrip,
    worstTrip,
    avgTripDistanceKm,
    avgTripCost
  };
}

export interface RecapPeriodMetrics {
  totalKm: number;
  odometer: number;
  kmTrendPercent: number;
  fuelCost: number;
  maintCost: number;
  totalCost: number;
  totalVolume: number;
  refuelStopsCount: number;
  costPerKm: string;
  avgConsumptionStr: string;
  avgKmPerLStr: string;
  fuelUnit: string;
}

/**
 * Calculates exact historical and periodic recap metrics for one or more vehicles.
 * Period can be 'month' (YYYY-MM), 'year' (number), or 'all' (entire lifetime).
 * Strictly calculates mathematically precise distance, costs, volumes, and consumptions
 * without using arbitrary estimates or hardcoded fallbacks.
 */
export function calculateRecapMetrics(
  vehicles: Vehicle[],
  periodType: 'month' | 'year' | 'all',
  targetMonth: string,
  targetYear: number,
  _currency = '€'
): RecapPeriodMetrics {
  if (!vehicles || vehicles.length === 0) {
    return {
      totalKm: 0,
      odometer: 0,
      kmTrendPercent: 0,
      fuelCost: 0,
      maintCost: 0,
      totalCost: 0,
      totalVolume: 0,
      refuelStopsCount: 0,
      costPerKm: '0.00',
      avgConsumptionStr: '--',
      avgKmPerLStr: '--',
      fuelUnit: 'L'
    };
  }

  // Determine previous month string (YYYY-MM)
  let prevMonthStr = '';
  if (periodType === 'month' && targetMonth) {
    const [y, m] = targetMonth.split('-').map(Number);
    const prevDate = new Date(y, m - 2, 1);
    prevMonthStr = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;
  }

  let totalKmSum = 0;
  let prevKmSum = 0;
  let fuelCostSum = 0;
  let maintCostSum = 0;
  let totalVolumeSum = 0;
  let refuelStopsSum = 0;
  let maxOdometerFound = 0;

  // Track primary unit (L, kWh, Kg)
  const isSingle = vehicles.length === 1;
  const singleVehicle = isSingle ? vehicles[0] : null;
  const isBEV = singleVehicle ? (singleVehicle.fuelType.includes('Elettrica') || singleVehicle.fuelType.includes('BEV')) : false;
  const isCNG = singleVehicle ? singleVehicle.fuelType.includes('Metano') : false;
  const fuelUnit = isBEV ? 'kWh' : (isCNG ? 'Kg' : 'L');

  // Pre-calculate full metrics per vehicle for lifetime reference
  const fullMetricsMap = new Map<string, DetailedConsumptionMetrics>();
  vehicles.forEach(v => {
    fullMetricsMap.set(v.id, calculateVehicleConsumptionMetrics(v));
  });

  if (periodType === 'all') {
    vehicles.forEach(v => {
      const m = fullMetricsMap.get(v.id)!;
      totalKmSum += m.totalDistance;
      fuelCostSum += m.totalFuelSpent;
      maintCostSum += m.totalMaintSpent;
      totalVolumeSum += (m.totalThermalLiters || 0) + (m.totalElectricKwh || 0) + (m.totalGasQuantity || 0);
      refuelStopsSum += v.refuels ? v.refuels.length : 0;
      const vOdo = Math.max(v.initialKm || 0, ...(v.refuels?.map(r => r.km) || [0]), ...(v.maintenances?.map(maint => maint.km) || [0]));
      maxOdometerFound = Math.max(maxOdometerFound, vOdo);
    });

    const totalCostSum = fuelCostSum + maintCostSum;
    const costPerKm = totalKmSum > 0 ? (totalCostSum / totalKmSum).toFixed(2) : '0.00';

    let avgConsumptionStr = '--';
    let avgKmPerLStr = '--';

    if (isSingle && singleVehicle) {
      const m = fullMetricsMap.get(singleVehicle.id)!;
      if (m.unitPer100Km !== '--') {
        avgConsumptionStr = `${m.unitPer100Km} ${m.fuelUnit}/100km`;
      }
      if (m.kmPerUnit !== '--') {
        avgKmPerLStr = `${m.kmPerUnit} km/${m.fuelUnit}`;
      }
    } else if (totalKmSum > 0 && totalVolumeSum > 0) {
      const per100 = (totalVolumeSum / totalKmSum) * 100;
      avgConsumptionStr = `${per100.toFixed(1)} L/100km`;
      avgKmPerLStr = `${(100 / per100).toFixed(1)} km/L`;
    }

    return {
      totalKm: totalKmSum,
      odometer: maxOdometerFound,
      kmTrendPercent: 0,
      fuelCost: fuelCostSum,
      maintCost: maintCostSum,
      totalCost: totalCostSum,
      totalVolume: totalVolumeSum,
      refuelStopsCount: refuelStopsSum,
      costPerKm,
      avgConsumptionStr,
      avgKmPerLStr,
      fuelUnit
    };
  }

    // Periodic calculation: 'month' or 'year'
  let certifiedTripKmSum = 0;
  let certifiedTripQtySum = 0;

  vehicles.forEach(v => {
    const rawRefuels = v.refuels || [];
    const rawMaints = v.maintenances || [];
    const vInitKm = Number(v.initialKm) || 0;
    const vMetrics = fullMetricsMap.get(v.id)!;

    const isCurrentPeriod = (d: string) => {
      if (!d || d.length < 4) return false;
      if (periodType === 'year') {
        return d.startsWith(String(targetYear));
      }
      return d.startsWith(targetMonth);
    };

    const isPrevPeriod = (d: string) => {
      if (!d || d.length < 4) return false;
      if (periodType === 'year') {
        return d.startsWith(String(targetYear - 1));
      }
      return prevMonthStr ? d.startsWith(prevMonthStr) : false;
    };

    const isUpToEndOfCurrent = (d: string) => {
      if (!d || d.length < 4) return false;
      if (periodType === 'year') {
        const y = parseInt(d.split('-')[0], 10);
        return !isNaN(y) && y <= targetYear;
      }
      return d.substring(0, 7) <= targetMonth;
    };

    const isBeforeCurrent = (d: string) => {
      if (!d || d.length < 4) return false;
      if (periodType === 'year') {
        const y = parseInt(d.split('-')[0], 10);
        return !isNaN(y) && y < targetYear;
      }
      return d.substring(0, 7) < targetMonth;
    };

    const isBeforePrev = (d: string) => {
      if (!d || d.length < 4) return false;
      if (periodType === 'year') {
        const y = parseInt(d.split('-')[0], 10);
        return !isNaN(y) && y < targetYear - 1;
      }
      return prevMonthStr ? d.substring(0, 7) < prevMonthStr : false;
    };

    // 1. FINANCIAL & VOLUME EVENTS (Accounts for 100% of costs, even if km was not recorded)
    rawRefuels.forEach(r => {
      if (isCurrentPeriod(r.date)) {
        fuelCostSum += Number(r.price) || 0;
        totalVolumeSum += Number(r.quantity) || 0;
        refuelStopsSum += 1;
      }
    });

    rawMaints.forEach(m => {
      if (isCurrentPeriod(m.date)) {
        maintCostSum += Number(m.cost) || 0;
      }
    });

    // 2. ODOMETER & DISTANCE TIMELINE (Only events with verified km > 0)
    interface KmEvent {
      date: string;
      km: number;
      type: 'refuel' | 'maintenance';
    }

    const kmEvents: KmEvent[] = [
      ...rawRefuels.filter(r => (Number(r.km) || 0) > 0 && r.date?.length >= 7).map(r => ({
        date: r.date,
        km: Number(r.km),
        type: 'refuel' as const
      })),
      ...rawMaints.filter(m => (Number(m.km) || 0) > 0 && m.date?.length >= 7).map(m => ({
        date: m.date,
        km: Number(m.km),
        type: 'maintenance' as const
      }))
    ];

    kmEvents.sort((a, b) => {
      const diff = new Date(a.date).getTime() - new Date(b.date).getTime();
      if (diff !== 0) return diff;
      return a.km - b.km;
    });

    // Calculate vehicle distance in current period with metrological precision
    const currentKmEvents = kmEvents.filter(e => isCurrentPeriod(e.date));
    const eventsBeforeCurrent = kmEvents.filter(e => isBeforeCurrent(e.date));
    const eventsUpToEndCurrent = kmEvents.filter(e => isUpToEndOfCurrent(e.date));

    let vPeriodDistance = 0;
    const vOdometer = Math.max(vInitKm, ...eventsUpToEndCurrent.map(e => e.km));

    if (currentKmEvents.length > 0) {
      const firstCurrent = currentKmEvents[0];
      const lastCurrent = currentKmEvents[currentKmEvents.length - 1];

      if (currentKmEvents.length >= 2) {
        // If multiple odometer entries in this period, the intra-period spread is definite
        const intraPeriodSpread = lastCurrent.km - firstCurrent.km;

        if (eventsBeforeCurrent.length > 0) {
          const lastBefore = eventsBeforeCurrent[eventsBeforeCurrent.length - 1];
          const totalSpanDelta = lastCurrent.km - lastBefore.km;
          const daysGap = Math.max(1, (new Date(firstCurrent.date).getTime() - new Date(lastBefore.date).getTime()) / (1000 * 3600 * 24));
          
          // If the gap before is reasonable (<= 45 days for month, 365 for year), attribute full replenished span
          if (daysGap <= (periodType === 'year' ? 366 : 45) && totalSpanDelta >= intraPeriodSpread) {
            vPeriodDistance = totalSpanDelta;
          } else {
            vPeriodDistance = intraPeriodSpread;
          }
        } else {
          vPeriodDistance = intraPeriodSpread;
        }
      } else {
        // Exactly 1 odometer entry in this period
        if (eventsBeforeCurrent.length > 0) {
          const lastBefore = eventsBeforeCurrent[eventsBeforeCurrent.length - 1];
          if (lastCurrent.km >= lastBefore.km) {
            vPeriodDistance = lastCurrent.km - lastBefore.km;
          }
        } else if (v.registrationDate && isCurrentPeriod(v.registrationDate) && vInitKm > 0 && lastCurrent.km >= vInitKm) {
          vPeriodDistance = lastCurrent.km - vInitKm;
        } else {
          vPeriodDistance = 0;
        }
      }
    }

    // Check certified Board Trips completed within this period
    const tripsInCurrentPeriod = vMetrics.boardTrips.filter(t => isCurrentPeriod(t.endDate));
    let vCertifiedTripKm = 0;
    let vCertifiedTripQty = 0;

    tripsInCurrentPeriod.forEach(t => {
      vCertifiedTripKm += t.distanceKm;
      vCertifiedTripQty += t.totalQuantity;
    });

    if (vCertifiedTripKm > vPeriodDistance) {
      vPeriodDistance = vCertifiedTripKm;
    }

    certifiedTripKmSum += vCertifiedTripKm;
    certifiedTripQtySum += vCertifiedTripQty;

    // Calculate vehicle distance in previous period for trend comparison
    const prevKmEvents = kmEvents.filter(e => isPrevPeriod(e.date));
    const eventsBeforePrev = kmEvents.filter(e => isBeforePrev(e.date));
    let vPrevDistance = 0;

    if (prevKmEvents.length > 0) {
      const firstPrev = prevKmEvents[0];
      const lastPrev = prevKmEvents[prevKmEvents.length - 1];

      if (prevKmEvents.length >= 2) {
        vPrevDistance = Math.max(0, lastPrev.km - firstPrev.km);
      } else if (eventsBeforePrev.length > 0) {
        const lastBeforePrev = eventsBeforePrev[eventsBeforePrev.length - 1];
        if (lastPrev.km >= lastBeforePrev.km) {
          vPrevDistance = lastPrev.km - lastBeforePrev.km;
        }
      }
    }

    // Accumulate sums
    totalKmSum += vPeriodDistance;
    prevKmSum += vPrevDistance;
    maxOdometerFound = Math.max(maxOdometerFound, vOdometer);
  });

  const totalCostSum = fuelCostSum + maintCostSum;
  const costPerKm = totalKmSum > 0 ? (totalCostSum / totalKmSum).toFixed(2) : '--';

  let kmTrendPercent = 0;
  if (prevKmSum > 0 && totalKmSum > 0) {
    kmTrendPercent = Math.round(((totalKmSum - prevKmSum) / prevKmSum) * 100);
  }

  // Exact period consumption calculation with highest fidelity
  let avgConsumptionStr = '--';
  let avgKmPerLStr = '--';

  if (certifiedTripKmSum > 0 && certifiedTripQtySum > 0) {
    // 1. High precision certified full-to-full trips completed in this period
    const lPer100 = (certifiedTripQtySum / certifiedTripKmSum) * 100;
    const kmPerL = certifiedTripKmSum / certifiedTripQtySum;
    avgConsumptionStr = `${lPer100.toFixed(1)} ${fuelUnit}/100km`;
    avgKmPerLStr = `${kmPerL.toFixed(1)} km/${fuelUnit}`;
  } else if (totalKmSum > 0 && totalVolumeSum > 0) {
    // 2. Continuous period metric with physics plausibility bounds check
    const rawLPer100 = (totalVolumeSum / totalKmSum) * 100;
    const rawKmPerL = totalKmSum / totalVolumeSum;
    const minPlausible = isBEV ? 8 : (isCNG ? 2 : 2.5);
    const maxPlausible = isBEV ? 40 : (isCNG ? 12 : 24);

    if (rawLPer100 >= minPlausible && rawLPer100 <= maxPlausible) {
      avgConsumptionStr = `${rawLPer100.toFixed(1)} ${fuelUnit}/100km`;
      avgKmPerLStr = `${rawKmPerL.toFixed(1)} km/${fuelUnit}`;
    } else if (isSingle && singleVehicle) {
      const m = fullMetricsMap.get(singleVehicle.id)!;
      if (m.unitPer100Km !== '--') {
        avgConsumptionStr = `${m.unitPer100Km} ${m.fuelUnit}/100km (media)`;
        avgKmPerLStr = `${m.kmPerUnit} km/${m.fuelUnit}`;
      }
    }
  } else if (isSingle && singleVehicle) {
    // 3. Fallback to vehicle certified lifetime average or technical specs
    const m = fullMetricsMap.get(singleVehicle.id)!;
    if (m.unitPer100Km !== '--') {
      avgConsumptionStr = `${m.unitPer100Km} ${m.fuelUnit}/100km (media)`;
      avgKmPerLStr = `${m.kmPerUnit} km/${m.fuelUnit}`;
    } else if (singleVehicle.technicalSpecs?.wltpConsumption) {
      avgConsumptionStr = `${singleVehicle.technicalSpecs.wltpConsumption}`;
    }
  }

  return {
    totalKm: totalKmSum,
    odometer: maxOdometerFound,
    kmTrendPercent,
    fuelCost: fuelCostSum,
    maintCost: maintCostSum,
    totalCost: totalCostSum,
    totalVolume: totalVolumeSum,
    refuelStopsCount: refuelStopsSum,
    costPerKm,
    avgConsumptionStr,
    avgKmPerLStr,
    fuelUnit
  };
}

