import { 
  db, 
  doc, 
  getDoc, 
  setDoc, 
  onSnapshot, 
  deleteDoc,
  auth
} from '../firebase';
import { Vehicle, UserAccount, SharedGarage, SharedGarageMember } from '../types';

/**
 * Strips undefined properties recursively from objects and arrays so Firestore never rejects payloads
 */
export function sanitizeForFirestore<T>(data: T): T {
  if (data === undefined) {
    return null as unknown as T;
  }
  if (data === null || typeof data !== 'object') {
    return data;
  }
  if (Array.isArray(data)) {
    return data
      .filter(item => item !== undefined)
      .map(item => sanitizeForFirestore(item)) as unknown as T;
  }
  const sanitized: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      sanitized[key] = sanitizeForFirestore(value);
    }
  }
  return sanitized as unknown as T;
}

/**
 * Generate a friendly, readable 6-character code (e.g. GARAGE-7K9M)
 */
export function generateShareCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let rand = '';
  for (let i = 0; i < 4; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `GARAGE-${rand}`;
}

/**
 * Creates or updates a Shared Garage entry in Firestore
 */
export async function createOrUpdateSharedGarage(
  vehicle: Vehicle,
  user: UserAccount,
  options?: {
    permissionsLevel?: 'full' | 'read_only' | 'refuel_only';
    allowDocumentView?: boolean;
    notifyOnExpenses?: boolean;
  }
): Promise<SharedGarage> {
  const code = vehicle.sharedGarageCode || generateShareCode();
  const shareDocRef = doc(db, 'shared_garages', code);

  const existingSnap = await getDoc(shareDocRef).catch(() => null);
  const now = new Date().toISOString();
  const existingData = (existingSnap && existingSnap.exists()) ? (existingSnap.data() as SharedGarage) : null;

  let members: SharedGarageMember[] = [
    {
      uid: user.id || auth.currentUser?.uid || 'user_owner',
      name: user.name || 'Proprietario',
      email: user.email || 'proprietario@garage.it',
      role: 'owner',
      joinedAt: now
    }
  ];

  if (existingData && Array.isArray(existingData.members)) {
    members = existingData.members;
    // Ensure current user is listed as owner
    const hasCurrent = members.some(m => m.uid === (user.id || auth.currentUser?.uid));
    if (!hasCurrent) {
      members.push({
        uid: user.id || auth.currentUser?.uid || 'user_owner',
        name: user.name || 'Proprietario',
        email: user.email || 'proprietario@garage.it',
        role: 'owner',
        joinedAt: now
      });
    }
  }

  const allowedUids = members.map(m => m.uid);

  const resolvedPermLevel: 'full' | 'read_only' | 'refuel_only' = 
    options?.permissionsLevel || 
    vehicle.sharedPermissionsLevel || 
    existingData?.permissionsLevel || 
    (existingData?.vehicle as any)?.sharedPermissionsLevel || 
    'full';

  const resolvedAllowDocView: boolean = 
    typeof options?.allowDocumentView === 'boolean'
      ? options.allowDocumentView
      : (typeof vehicle.sharedAllowDocumentView === 'boolean'
          ? vehicle.sharedAllowDocumentView
          : (typeof existingData?.allowDocumentView === 'boolean' ? existingData.allowDocumentView : true));

  const resolvedNotifyExp: boolean = 
    typeof options?.notifyOnExpenses === 'boolean'
      ? options.notifyOnExpenses
      : (typeof existingData?.notifyOnExpenses === 'boolean' ? existingData.notifyOnExpenses : true);

  const sharedGarageData: SharedGarage = {
    id: code,
    code,
    ownerId: user.id || auth.currentUser?.uid || 'user_owner',
    ownerName: user.name || 'Proprietario Auto',
    ownerEmail: user.email || '',
    vehicleId: vehicle.id,
    vehicleName: `${vehicle.brand} ${vehicle.model} (${vehicle.plate})`,
    permissionsLevel: resolvedPermLevel,
    allowDocumentView: resolvedAllowDocView,
    notifyOnExpenses: resolvedNotifyExp,
    vehicle: {
      ...vehicle,
      isShared: true,
      sharedGarageCode: code,
      sharedOwnerName: user.name || 'Proprietario',
      sharedOwnerEmail: user.email || '',
      sharedRole: 'owner',
      sharedMembersCount: members.length,
      sharedPermissionsLevel: resolvedPermLevel,
      sharedAllowDocumentView: resolvedAllowDocView,
      lastSyncTimestamp: now
    },
    members,
    allowedUids,
    createdAt: existingData?.createdAt || now,
    updatedAt: now,
    active: true
  };

  await setDoc(shareDocRef, sanitizeForFirestore(sharedGarageData), { merge: true });
  return sharedGarageData;
}

/**
 * Look up an existing shared garage invitation by code
 */
export async function getSharedGarageByCode(code: string): Promise<SharedGarage | null> {
  const cleanCode = code.trim().toUpperCase();
  if (!cleanCode) return null;

  try {
    const shareDocRef = doc(db, 'shared_garages', cleanCode);
    const snap = await getDoc(shareDocRef);
    if (!snap.exists()) return null;
    const data = snap.data() as SharedGarage;
    if (!data.active) return null;
    return data;
  } catch (err) {
    console.error('Error fetching shared garage:', err);
    return null;
  }
}

/**
 * Join a shared garage using a share code
 */
export async function joinSharedGarage(
  code: string,
  joiningUser: UserAccount
): Promise<{ sharedGarage: SharedGarage; vehicle: Vehicle }> {
  const cleanCode = code.trim().toUpperCase();
  const shareDocRef = doc(db, 'shared_garages', cleanCode);
  const snap = await getDoc(shareDocRef);

  if (!snap.exists()) {
    throw new Error(`Codice di sincronizzazione "${cleanCode}" non trovato. Verifica di averlo inserito correttamente.`);
  }

  const data = snap.data() as SharedGarage;
  if (!data.active) {
    throw new Error('Questa condivisione non è più attiva o è stata revocata dal proprietario.');
  }

  const now = new Date().toISOString();
  const joiningUid = joiningUser.id || auth.currentUser?.uid || `guest_${Date.now()}`;

  const currentMembers = Array.isArray(data.members) ? [...data.members] : [];
  const existingMemberIndex = currentMembers.findIndex(m => m.uid === joiningUid);

  if (existingMemberIndex === -1) {
    currentMembers.push({
      uid: joiningUid,
      name: joiningUser.name || 'Coniuge / Membro Famiglia',
      email: joiningUser.email || '',
      role: 'member',
      joinedAt: now
    });
  }

  const allowedUids = Array.from(new Set([...(data.allowedUids || []), joiningUid]));

  const updatedSharedGarage: SharedGarage = {
    ...data,
    members: currentMembers,
    allowedUids,
    updatedAt: now
  };

  await setDoc(shareDocRef, sanitizeForFirestore({
    members: currentMembers,
    allowedUids,
    updatedAt: now
  }), { merge: true });

  const effectivePermLevel: 'full' | 'read_only' | 'refuel_only' = 
    data.permissionsLevel || 
    (data.vehicle as any)?.sharedPermissionsLevel || 
    'full';

  const effectiveAllowDoc: boolean = 
    typeof data.allowDocumentView === 'boolean'
      ? data.allowDocumentView
      : (typeof (data.vehicle as any)?.sharedAllowDocumentView === 'boolean'
          ? (data.vehicle as any).sharedAllowDocumentView
          : true);

  const vehicleWithShareInfo: Vehicle = {
    ...data.vehicle,
    isShared: true,
    sharedGarageCode: cleanCode,
    sharedOwnerName: data.ownerName,
    sharedOwnerEmail: data.ownerEmail,
    sharedRole: data.ownerId === joiningUid ? 'owner' : 'member',
    sharedMembersCount: currentMembers.length,
    sharedPermissionsLevel: effectivePermLevel,
    sharedAllowDocumentView: effectiveAllowDoc,
    lastSyncTimestamp: now
  };

  return {
    sharedGarage: updatedSharedGarage,
    vehicle: vehicleWithShareInfo
  };
}

/**
 * Synchronize changes made to a shared vehicle up to Firestore
 */
export async function syncSharedVehicleToCloud(vehicle: Vehicle): Promise<void> {
  if (!vehicle.isShared || !vehicle.sharedGarageCode) return;

  // Se l'utente è un membro in sola lettura, non può sincronizzare sovrascrivendo i dati
  if (vehicle.sharedRole === 'member' && vehicle.sharedPermissionsLevel === 'read_only') {
    console.warn('Sync bloccata: utente membro in modalità sola lettura.');
    return;
  }

  try {
    const code = vehicle.sharedGarageCode;
    const shareDocRef = doc(db, 'shared_garages', code);
    const now = new Date().toISOString();

    const isOwner = vehicle.sharedRole !== 'member';

    await setDoc(shareDocRef, sanitizeForFirestore({
      ...(isOwner && vehicle.sharedPermissionsLevel ? { permissionsLevel: vehicle.sharedPermissionsLevel } : {}),
      ...(isOwner && typeof vehicle.sharedAllowDocumentView === 'boolean' ? { allowDocumentView: vehicle.sharedAllowDocumentView } : {}),
      vehicle: {
        ...vehicle,
        sharedPermissionsLevel: vehicle.sharedPermissionsLevel || 'full',
        sharedAllowDocumentView: vehicle.sharedAllowDocumentView ?? true,
        lastSyncTimestamp: now
      },
      updatedAt: now
    }), { merge: true });
  } catch (err) {
    console.debug('Failed to sync shared vehicle to cloud:', err);
  }
}

/**
 * Revoke or leave a shared garage
 */
export async function leaveOrRevokeSharedGarage(
  code: string,
  userId: string,
  isOwner: boolean
): Promise<void> {
  const shareDocRef = doc(db, 'shared_garages', code);
  const snap = await getDoc(shareDocRef);

  if (!snap.exists()) return;

  if (isOwner) {
    // Owner deletes or deactivates the share
    await deleteDoc(shareDocRef);
  } else {
    // Member leaves the share
    const data = snap.data() as SharedGarage;
    const remainingMembers = (data.members || []).filter(m => m.uid !== userId);
    const remainingUids = (data.allowedUids || []).filter(uid => uid !== userId);
    await setDoc(shareDocRef, sanitizeForFirestore({
      members: remainingMembers,
      allowedUids: remainingUids,
      updatedAt: new Date().toISOString()
    }), { merge: true });
  }
}

/**
 * Update control settings (permissions, document visibility, notifications)
 */
export async function updateSharedGarageSettings(
  code: string,
  updates: {
    permissionsLevel?: 'full' | 'read_only' | 'refuel_only';
    allowDocumentView?: boolean;
    notifyOnExpenses?: boolean;
    allowEditPastRecords?: boolean;
  }
): Promise<void> {
  const cleanCode = code.trim().toUpperCase();
  const shareDocRef = doc(db, 'shared_garages', cleanCode);
  const now = new Date().toISOString();

  // Fetch current doc to also update the embedded vehicle's permissions
  const snap = await getDoc(shareDocRef).catch(() => null);
  let updatedVehicleData: Partial<Vehicle> | undefined = undefined;

  if (snap && snap.exists()) {
    const data = snap.data() as SharedGarage;
    if (data.vehicle) {
      updatedVehicleData = {
        ...data.vehicle,
        sharedPermissionsLevel: updates.permissionsLevel ?? data.permissionsLevel ?? 'full',
        sharedAllowDocumentView: typeof updates.allowDocumentView === 'boolean' 
          ? updates.allowDocumentView 
          : (typeof data.allowDocumentView === 'boolean' ? data.allowDocumentView : true),
        lastSyncTimestamp: now
      };
    }
  }

  await setDoc(shareDocRef, sanitizeForFirestore({
    ...updates,
    ...(updatedVehicleData ? { vehicle: updatedVehicleData } : {}),
    updatedAt: now
  }), { merge: true });
}

/**
 * Real-time subscription to a shared garage document
 */
export function subscribeToSharedGarage(
  code: string,
  onUpdate: (sharedGarage: SharedGarage) => void,
  onRevoked: () => void
): () => void {
  const cleanCode = code.trim().toUpperCase();
  const shareDocRef = doc(db, 'shared_garages', cleanCode);

  return onSnapshot(
    shareDocRef,
    (snap) => {
      if (!snap.exists()) {
        onRevoked();
        return;
      }
      const data = snap.data() as SharedGarage;
      if (!data.active) {
        onRevoked();
        return;
      }
      onUpdate(data);
    },
    (error) => {
      console.warn('Subscription error on shared garage:', error);
    }
  );
}

/**
 * Remove a specific member from the shared garage (Admin kick)
 */
export async function removeMemberFromSharedGarage(
  code: string,
  memberUid: string
): Promise<SharedGarage> {
  const cleanCode = code.trim().toUpperCase();
  const shareDocRef = doc(db, 'shared_garages', cleanCode);
  const snap = await getDoc(shareDocRef);

  if (!snap.exists()) {
    throw new Error('Garage condiviso non trovato.');
  }

  const data = snap.data() as SharedGarage;
  const filteredMembers = (data.members || []).filter(m => m.uid !== memberUid);
  const filteredUids = (data.allowedUids || []).filter(u => u !== memberUid);
  const now = new Date().toISOString();

  const updated: SharedGarage = {
    ...data,
    members: filteredMembers,
    allowedUids: filteredUids,
    updatedAt: now
  };

  await setDoc(shareDocRef, sanitizeForFirestore({
    members: filteredMembers,
    allowedUids: filteredUids,
    updatedAt: now
  }), { merge: true });

  return updated;
}

/**
 * Regenerate a new code for the shared garage, invalidating old code
 */
export async function regenerateSharedGarageCode(
  oldCode: string,
  vehicle: Vehicle,
  user: UserAccount
): Promise<SharedGarage> {
  // 1. Delete old code doc
  if (oldCode) {
    try {
      await deleteDoc(doc(db, 'shared_garages', oldCode));
    } catch {}
  }

  // 2. Create with new random code
  const newCode = generateShareCode();
  const vehicleWithNewCode: Vehicle = {
    ...vehicle,
    sharedGarageCode: newCode
  };

  return await createOrUpdateSharedGarage(vehicleWithNewCode, user);
}

