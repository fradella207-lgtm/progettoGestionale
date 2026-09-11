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
  user: UserAccount
): Promise<SharedGarage> {
  const code = vehicle.sharedGarageCode || generateShareCode();
  const shareDocRef = doc(db, 'shared_garages', code);

  const existingSnap = await getDoc(shareDocRef).catch(() => null);
  const now = new Date().toISOString();

  let members: SharedGarageMember[] = [
    {
      uid: user.id || auth.currentUser?.uid || 'user_owner',
      name: user.name || 'Proprietario',
      email: user.email || 'proprietario@garage.it',
      role: 'owner',
      joinedAt: now
    }
  ];

  if (existingSnap && existingSnap.exists()) {
    const existingData = existingSnap.data() as SharedGarage;
    if (Array.isArray(existingData.members)) {
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
  }

  const allowedUids = members.map(m => m.uid);

  const sharedGarageData: SharedGarage = {
    id: code,
    code,
    ownerId: user.id || auth.currentUser?.uid || 'user_owner',
    ownerName: user.name || 'Proprietario Auto',
    ownerEmail: user.email || '',
    vehicleId: vehicle.id,
    vehicleName: `${vehicle.brand} ${vehicle.model} (${vehicle.plate})`,
    vehicle: {
      ...vehicle,
      isShared: true,
      sharedGarageCode: code,
      sharedOwnerName: user.name,
      sharedOwnerEmail: user.email,
      sharedRole: 'owner',
      sharedMembersCount: members.length,
      lastSyncTimestamp: now
    },
    members,
    allowedUids,
    createdAt: (existingSnap && existingSnap.exists() ? existingSnap.data()?.createdAt : null) || now,
    updatedAt: now,
    active: true
  };

  await setDoc(shareDocRef, sharedGarageData, { merge: true });
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

  await setDoc(shareDocRef, {
    members: currentMembers,
    allowedUids,
    updatedAt: now
  }, { merge: true });

  const vehicleWithShareInfo: Vehicle = {
    ...data.vehicle,
    isShared: true,
    sharedGarageCode: cleanCode,
    sharedOwnerName: data.ownerName,
    sharedOwnerEmail: data.ownerEmail,
    sharedRole: data.ownerId === joiningUid ? 'owner' : 'member',
    sharedMembersCount: currentMembers.length,
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

  try {
    const code = vehicle.sharedGarageCode;
    const shareDocRef = doc(db, 'shared_garages', code);
    const now = new Date().toISOString();

    await setDoc(shareDocRef, {
      vehicle: {
        ...vehicle,
        lastSyncTimestamp: now
      },
      updatedAt: now
    }, { merge: true });
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
    await setDoc(shareDocRef, {
      members: remainingMembers,
      allowedUids: remainingUids,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  }
}
