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
}

/**
 * Standard Metrological Automotive Consumption Algorithm (Spritmonitor / Fuelio standard)
 * Correctly accounts for:
 * 1. Full-to-Full intervals including intermediate partial refills.
 * 2. Mixed energy tracking for PHEV (Electric kWh vs Fuel Liters).
 * 3. Bifuel tracking (GPL/Metano vs Petrol).
 * 4. Fallback global odometer tracking when insufficient full refuels exist.
 */
export function calculateVehicleConsumptionMetrics(vehicle: Vehicle): DetailedConsumptionMetrics {
  const isPHEV = vehicle.fuelType === 'Plug-in Hybrid (PHEV)';
  const isBEV = vehicle.fuelType.includes('Elettrica') || vehicle.fuelType.includes('BEV');
  const isLPG = vehicle.fuelType.includes('GPL');
  const isCNG = vehicle.fuelType.includes('Metano');
  const isBifuel = isLPG || isCNG;

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

  // 2. Full-to-Full Windowed Certified Consumption Algorithm
  // We compute intervals for primary fuel (or electricity if BEV)
  const primaryStream = isBEV ? electricRefuels : (isBifuel ? (gasRefuels.length > 0 ? gasRefuels : thermalFuelRefuels) : sortedRefuels);
  
  let certifiedDeltaKmSum = 0;
  let certifiedQuantitySum = 0;
  let hasValidFullIntervals = false;

  let lastFullIndex = -1;
  const calculatedMap = new Map<string, RefuelWithCalculation>();

  for (let i = 0; i < sortedRefuels.length; i++) {
    const current = sortedRefuels[i];
    const prev = i > 0 ? sortedRefuels[i - 1] : null;
    const deltaKm = prev ? Math.max(0, Number(current.km) - Number(prev.km)) : null;
    const qty = Number(current.quantity) || 0;
    const price = Number(current.price) || 0;
    const unitPrice = (qty > 0 && price > 0) ? (price / qty).toFixed(3) : null;

    let intervalConsumption: RefuelWithCalculation['intervalConsumption'] | undefined = undefined;

    if (current.type === 'full') {
      if (lastFullIndex !== -1) {
        const lastFullRefuel = sortedRefuels[lastFullIndex];
        const spanKm = Number(current.km) - Number(lastFullRefuel.km);
        
        // Sum all fuel added in this full-to-full window (from after last full to current full)
        let spanQty = 0;
        for (let j = lastFullIndex + 1; j <= i; j++) {
          spanQty += Number(sortedRefuels[j].quantity) || 0;
        }

        if (spanKm > 0 && spanQty > 0) {
          const kmPerUnitVal = spanKm / spanQty;
          const unitPer100KmVal = (spanQty / spanKm) * 100;

          intervalConsumption = {
            kmPerUnit: kmPerUnitVal,
            unitPer100Km: unitPer100KmVal,
            formattedKmPerUnit: kmPerUnitVal.toFixed(1),
            formattedUnitPer100Km: unitPer100KmVal.toFixed(2)
          };

          certifiedDeltaKmSum += spanKm;
          certifiedQuantitySum += spanQty;
          hasValidFullIntervals = true;
        }
      }
      lastFullIndex = i;
    }

    calculatedMap.set(current.id, {
      ...current,
      deltaKm,
      unitPrice,
      intervalConsumption
    });
  }

  // Determine overall kmPerUnit and unitPer100Km
  let finalKmPerUnit = 0;
  let finalUnitPer100Km = 0;
  const isCertified = hasValidFullIntervals && certifiedDeltaKmSum > 0 && certifiedQuantitySum > 0;

  if (isCertified) {
    finalKmPerUnit = certifiedDeltaKmSum / certifiedQuantitySum;
    finalUnitPer100Km = (certifiedQuantitySum / certifiedDeltaKmSum) * 100;
  } else {
    // Fallback global fleet average
    const totalPrimaryQty = primaryStream.reduce((acc, r) => acc + (Number(r.quantity) || 0), 0);
    if (totalDistance > 0 && totalPrimaryQty > 0) {
      finalKmPerUnit = totalDistance / totalPrimaryQty;
      finalUnitPer100Km = (totalPrimaryQty / totalDistance) * 100;
    }
  }

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
    calculatedRefuels
  };
}
