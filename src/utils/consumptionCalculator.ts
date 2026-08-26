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
          const currentTripId = `trip-${lastFullRefuel.id}-${current.id}`;
          tripId = currentTripId;

          intervalConsumption = {
            kmPerUnit: kmPerUnitVal,
            unitPer100Km: unitPer100KmVal,
            formattedKmPerUnit: kmPerUnitVal.toFixed(1),
            formattedUnitPer100Km: unitPer100KmVal.toFixed(2)
          };

          certifiedDeltaKmSum += spanKm;
          certifiedQuantitySum += spanQty;
          hasValidFullIntervals = true;

          // Days duration
          const dStart = new Date(lastFullRefuel.date).getTime();
          const dEnd = new Date(current.date).getTime();
          const daysDuration = Math.max(1, Math.round(Math.abs(dEnd - dStart) / (1000 * 60 * 60 * 24)));

          const tripUnit = current.unit || fuelUnit;

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
            totalQuantity: Number(spanQty.toFixed(2)),
            unit: tripUnit,
            totalSpent: Number(spanSpent.toFixed(2)),
            kmPerUnit: kmPerUnitVal,
            unitPer100Km: unitPer100KmVal,
            formattedKmPerUnit: kmPerUnitVal.toFixed(1),
            formattedUnitPer100Km: unitPer100KmVal.toFixed(2),
            costPerKm: (spanSpent / spanKm).toFixed(3),
            costPer100Km: ((spanSpent / spanKm) * 100).toFixed(2),
            refuelsCount: tripRefuels.length,
            refuels: [], // filled below with enriched refuels
            energyType: current.energyType
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

  // Enrich Board Trips with efficiency comparisons and identify best/worst
  let bestTrip: BoardTrip | undefined = undefined;
  let worstTrip: BoardTrip | undefined = undefined;

  if (boardTrips.length > 0 && finalKmPerUnit > 0) {
    // Higher kmPerUnit is better (or lower unitPer100Km is better)
    const sortedByEfficiency = [...boardTrips].sort((a, b) => b.kmPerUnit - a.kmPerUnit);
    const bestId = sortedByEfficiency[0].id;
    const worstId = sortedByEfficiency[sortedByEfficiency.length - 1].id;

    boardTrips.forEach(t => {
      // Comparison vs global average
      const diffPercent = ((t.kmPerUnit - finalKmPerUnit) / finalKmPerUnit) * 100;
      t.efficiencyVsAveragePercent = Number(diffPercent.toFixed(1));
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
    ? Number((boardTrips.reduce((acc, t) => acc + t.totalSpent, 0) / boardTrips.length).toFixed(2))
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
    kmPerUnit: finalKmPerUnit > 0 ? finalKmPerUnit.toFixed(1) : '--',
    unitPer100Km: finalUnitPer100Km > 0 ? finalUnitPer100Km.toFixed(2) : '--',
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
