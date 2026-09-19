export type AppView = 'garage' | 'my_car' | 'detail' | 'stations';
export type VehicleSubModal = 'trips' | 'refuels' | 'maintenances' | 'recap' | 'shared';
export type GlobalModal = 'settings' | 'notifications' | 'account' | 'add-car' | 'recap' | 'auth';

export interface AppRoute {
  view: AppView;
  vehicleId?: string;
  subModal?: VehicleSubModal | null;
  globalModal?: GlobalModal | null;
}

/**
 * Parse current window.location.hash into a structured AppRoute
 */
export function parseCurrentRoute(fallbackVehicleId?: string): AppRoute {
  const hash = window.location.hash.replace(/^#\/?/, '').trim();

  if (!hash || hash === 'garage') {
    return { view: 'garage', subModal: null, globalModal: null };
  }

  if (hash === 'stations') {
    return { view: 'stations', subModal: null, globalModal: null };
  }

  if (hash === 'my-car' || hash === 'my_car') {
    return { view: 'my_car', subModal: null, globalModal: null };
  }

  if (hash === 'settings') {
    return { view: 'garage', globalModal: 'settings', subModal: null };
  }

  if (hash === 'notifications') {
    return { view: 'garage', globalModal: 'notifications', subModal: null };
  }

  if (hash === 'account') {
    return { view: 'garage', globalModal: 'account', subModal: null };
  }

  if (hash === 'add-car') {
    return { view: 'garage', globalModal: 'add-car', subModal: null };
  }

  // Check vehicle routes: vehicle/:id, vehicle/:id/trips, vehicle/:id/refuels, vehicle/:id/maintenances
  const vehicleMatch = hash.match(/^vehicle\/([^\/]+)(?:\/([^\/]+))?$/);
  if (vehicleMatch) {
    const vId = decodeURIComponent(vehicleMatch[1]);
    const sub = vehicleMatch[2] as VehicleSubModal | undefined;
    const validSubModals: VehicleSubModal[] = ['trips', 'refuels', 'maintenances', 'recap', 'shared'];
    return {
      view: 'detail',
      vehicleId: vId,
      subModal: sub && validSubModals.includes(sub) ? sub : null,
      globalModal: null
    };
  }

  // Fallback
  return { view: 'garage', vehicleId: fallbackVehicleId, subModal: null, globalModal: null };
}

/**
 * Build hash string from AppRoute
 */
export function buildRouteHash(route: Partial<AppRoute>): string {
  if (route.globalModal) {
    return `/${route.globalModal}`;
  }

  if (route.view === 'stations') {
    return '/stations';
  }

  if (route.view === 'my_car') {
    return '/my-car';
  }

  if (route.view === 'detail' && route.vehicleId) {
    const base = `/vehicle/${encodeURIComponent(route.vehicleId)}`;
    if (route.subModal) {
      return `${base}/${route.subModal}`;
    }
    return base;
  }

  return '/garage';
}

/**
 * Navigate to a specific route by pushing into browser history
 */
export function pushAppRoute(route: Partial<AppRoute>, replace: boolean = false) {
  const hashPath = '#' + buildRouteHash(route);
  if (window.location.hash === hashPath) {
    return;
  }

  if (replace) {
    window.history.replaceState({ ...route, navigated: true }, '', hashPath);
  } else {
    window.history.pushState({ ...route, navigated: true }, '', hashPath);
  }

  // Dispatch custom event to notify listeners
  window.dispatchEvent(new CustomEvent('app-route-change', { detail: route }));
}

/**
 * Helper to go back if there is history, otherwise fallback to route
 */
export function goBackOrRoute(fallbackRoute: Partial<AppRoute>) {
  if (window.history.length > 1 && window.history.state?.navigated) {
    window.history.back();
  } else {
    pushAppRoute(fallbackRoute, true);
  }
}
