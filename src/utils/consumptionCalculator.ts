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
  vehicles.forEach(v => {
    const rawRefuels = v.refuels || [];
    const rawMaints = v.maintenances || [];
    const vInitKm = Number(v.initialKm) || 0;

    // Build complete event timeline
    interface TimelineEvent {
      date: string;
      km: number;
      type: 'refuel' | 'maintenance';
      price: number;
      quantity: number;
    }

    const events: TimelineEvent[] = [
      ...rawRefuels.map(r => ({
        date: r.date || '',
        km: Number(r.km) || 0,
        type: 'refuel' as const,
        price: Number(r.price) || 0,
        quantity: Number(r.quantity) || 0
      })),
      ...rawMaints.map(m => ({
        date: m.date || '',
        km: Number(m.km) || 0,
        type: 'maintenance' as const,
        price: Number(m.cost) || 0,
        quantity: 0
      }))
    ].filter(e => e.date.length >= 7);

    events.sort((a, b) => {
      const diff = new Date(a.date).getTime() - new Date(b.date).getTime();
      if (diff !== 0) return diff;
      return a.km - b.km;
    });

    const isCurrentPeriod = (d: string) => {
      if (periodType === 'year') {
        return d.startsWith(String(targetYear));
      }
      return d.startsWith(targetMonth);
    };

    const isPrevPeriod = (d: string) => {
      if (periodType === 'year') {
        return d.startsWith(String(targetYear - 1));
      }
      return prevMonthStr ? d.startsWith(prevMonthStr) : false;
    };

    const isUpToEndOfCurrent = (d: string) => {
      if (periodType === 'year') {
        const y = parseInt(d.split('-')[0], 10);
        return !isNaN(y) && y <= targetYear;
      }
      return d.substring(0, 7) <= targetMonth;
    };

    const isBeforeCurrent = (d: string) => {
      if (periodType === 'year') {
        const y = parseInt(d.split('-')[0], 10);
        return !isNaN(y) && y < targetYear;
      }
      return d.substring(0, 7) < targetMonth;
    };

    const isUpToEndOfPrev = (d: string) => {
      if (periodType === 'year') {
        const y = parseInt(d.split('-')[0], 10);
        return !isNaN(y) && y <= targetYear - 1;
      }
      return prevMonthStr ? d.substring(0, 7) <= prevMonthStr : false;
    };

    const isBeforePrev = (d: string) => {
      if (periodType === 'year') {
        const y = parseInt(d.split('-')[0], 10);
        return !isNaN(y) && y < targetYear - 1;
      }
      return prevMonthStr ? d.substring(0, 7) < prevMonthStr : false;
    };

    // Calculate vehicle distance in current period
    const currentEvents = events.filter(e => isCurrentPeriod(e.date));
    let vPeriodDistance = 0;
    let vOdometer = vInitKm;

    if (currentEvents.length > 0) {
      const eventsUpToEnd = events.filter(e => isUpToEndOfCurrent(e.date));
      const eventsBefore = events.filter(e => isBeforeCurrent(e.date));

      const maxKmEnd = Math.max(vInitKm, ...eventsUpToEnd.map(e => e.km));
      const maxKmBefore = eventsBefore.length > 0 
        ? Math.max(vInitKm, ...eventsBefore.map(e => e.km))
        : (vInitKm > 0 ? vInitKm : (currentEvents.length > 1 ? Math.min(...currentEvents.map(e => e.km)) : currentEvents[0].km));

      vPeriodDistance = Math.max(0, maxKmEnd - maxKmBefore);
      vOdometer = maxKmEnd;
    } else {
      // No events in this period; odometer is highest km up to this period
      const eventsUpToEnd = events.filter(e => isUpToEndOfCurrent(e.date));
      vOdometer = Math.max(vInitKm, ...eventsUpToEnd.map(e => e.km));
    }

    // Calculate vehicle distance in previous period for trend
    const prevEvents = events.filter(e => isPrevPeriod(e.date));
    let vPrevDistance = 0;
    if (prevEvents.length > 0) {
      const eventsUpToEndPrev = events.filter(e => isUpToEndOfPrev(e.date));
      const eventsBeforePrev = events.filter(e => isBeforePrev(e.date));

      const maxKmEndPrev = Math.max(vInitKm, ...eventsUpToEndPrev.map(e => e.km));
      const maxKmBeforePrev = eventsBeforePrev.length > 0
        ? Math.max(vInitKm, ...eventsBeforePrev.map(e => e.km))
        : (vInitKm > 0 ? vInitKm : (prevEvents.length > 1 ? Math.min(...prevEvents.map(e => e.km)) : prevEvents[0].km));

      vPrevDistance = Math.max(0, maxKmEndPrev - maxKmBeforePrev);
    }

    // Accumulate sums
    totalKmSum += vPeriodDistance;
    prevKmSum += vPrevDistance;
    maxOdometerFound = Math.max(maxOdometerFound, vOdometer);

    currentEvents.forEach(e => {
      if (e.type === 'refuel') {
        fuelCostSum += e.price;
        totalVolumeSum += e.quantity;
        refuelStopsSum += 1;
      } else {
        maintCostSum += e.price;
      }
    });
  });

  const totalCostSum = fuelCostSum + maintCostSum;
  const costPerKm = totalKmSum > 0 ? (totalCostSum / totalKmSum).toFixed(2) : '0.00';

  let kmTrendPercent = 0;
  if (prevKmSum > 0 && totalKmSum > 0) {
    kmTrendPercent = Math.round(((totalKmSum - prevKmSum) / prevKmSum) * 100);
  }

  // Exact period consumption calculation
  let avgConsumptionStr = '--';
  let avgKmPerLStr = '--';

  if (totalKmSum > 0 && totalVolumeSum > 0) {
    const lPer100 = (totalVolumeSum / totalKmSum) * 100;
    avgConsumptionStr = `${lPer100.toFixed(1)} ${fuelUnit}/100km`;
    avgKmPerLStr = `${(100 / lPer100).toFixed(1)} km/${fuelUnit}`;
  } else if (isSingle && singleVehicle) {
    // If no refuels or no km in this month, display certified lifetime average with clear note
    const m = fullMetricsMap.get(singleVehicle.id)!;
    if (m.unitPer100Km !== '--') {
      avgConsumptionStr = `${m.unitPer100Km} ${m.fuelUnit}/100km (media)`;
    }
    if (m.kmPerUnit !== '--') {
      avgKmPerLStr = `${m.kmPerUnit} km/${m.fuelUnit}`;
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

