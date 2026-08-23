import React, { useState, useEffect, useMemo } from 'react';
import { Vehicle, RefuelRecord, MaintenanceRecord, AppNotification, AppSettings, UserAccount, EnergySourceType } from './types';
import { SEED_GARAGE } from './data/seedGarage';
import { Header } from './components/Header';
import { GarageHome } from './components/GarageHome';
import { VehicleDetail } from './components/VehicleDetail';
import { AuthGate } from './components/AuthGate';
import { AddVehicleModal } from './components/modals/AddVehicleModal';
import { RefuelModal } from './components/modals/RefuelModal';
import { MaintenanceModal } from './components/modals/MaintenanceModal';
import { SettingsModal } from './components/modals/SettingsModal';
import { NotificationsModal } from './components/modals/NotificationsModal';
import { AccountModal } from './components/modals/AccountModal';
import { AuthLoginModal } from './components/modals/AuthLoginModal';
import { auth, onAuthStateChanged, db, doc, setDoc, getDoc, signOut } from './firebase';

// Initial Demo Notifications
const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'n_1',
    carPlate: 'GA 892 TR',
    title: 'Controllo Tagliando Ordinario Imminente',
    message: 'Hai superato gli 84.000 km. Si consiglia controllo livello olio motore e filtro abitacolo per Alfa Romeo Giulia.',
    type: 'maintenance',
    date: '2026-08-18',
    read: false
  },
  {
    id: 'n_2',
    carPlate: 'FY 119 PK',
    title: 'Promemoria Revisione Ministeriale',
    message: 'La revisione periodica biennale per la Golf GTE è prevista entro i prossimi 60 giorni.',
    type: 'alert',
    date: '2026-08-10',
    read: false
  },
  {
    id: 'n_3',
    carPlate: 'GE 402 EV',
    title: 'Check Salute Batteria 12V',
    message: 'Consiglio AI: Verifica tensione della batteria ausiliaria 12V per Tesla Model 3 prima della stagione invernale.',
    type: 'service',
    date: '2026-08-02',
    read: true
  }
];

export default function App() {
  // 1. ALL VEHICLES IN GARAGE STATE
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    const cached = localStorage.getItem('garage_all_vehicles');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error('Error loading garage cache:', e);
      }
    }
    return SEED_GARAGE;
  });

  // 2. VIEW NAVIGATION STATE: 'garage' | 'detail'
  const [currentView, setCurrentView] = useState<'garage' | 'detail'>('garage');
  const [selectedCarId, setSelectedCarId] = useState<string>(() => {
    return vehicles[0]?.id || 'car_1';
  });

  // 3. APP SETTINGS STATE
  const [settings, setSettings] = useState<AppSettings>(() => {
    const cached = localStorage.getItem('garage_settings');
    if (cached) {
      try { return JSON.parse(cached); } catch (e) {}
    }
    return {
      unitDistance: 'km',
      currency: '€',
      fuelPriceAlerts: true,
      predictiveAlerts: true,
      autoBackup: true
    };
  });

  // 4. NOTIFICATIONS STATE
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const cached = localStorage.getItem('garage_notifications');
    if (cached) {
      try { return JSON.parse(cached); } catch (e) {}
    }
    return INITIAL_NOTIFICATIONS;
  });

  // 5. ACCOUNT STATE
  const [account, setAccount] = useState<UserAccount>(() => {
    const cached = localStorage.getItem('garage_user_account');
    if (cached) {
      try { 
        const parsed = JSON.parse(cached);
        if (parsed && parsed.email && parsed.isLoggedIn) {
          return {
            id: parsed.id || 'user_default',
            name: parsed.name || 'Francesco Dell\'Aquila',
            email: parsed.email || "francesco.dell'aquila@alessandrinimainardi.edu.it",
            plan: parsed.plan || 'Pro Garage Cloud',
            syncStatus: parsed.syncStatus || 'synced',
            memberSince: parsed.memberSince || 'Marzo 2024',
            provider: parsed.provider || 'google',
            isLoggedIn: true
          };
        }
      } catch (e) {}
    }
    return {
      id: '',
      name: 'Utente Garage',
      email: '',
      plan: 'Pro Garage Cloud',
      syncStatus: 'synced',
      memberSince: 'Agosto 2026',
      provider: 'google',
      isLoggedIn: false
    };
  });

  // 6. TOAST NOTIFICATIONS
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // 7. MODALS STATE
  const [isAddCarModalOpen, setIsAddCarModalOpen] = useState(false);
  const [vehicleToEdit, setVehicleToEdit] = useState<Vehicle | null>(null);

  const [isRefuelModalOpen, setIsRefuelModalOpen] = useState(false);
  const [editingRefuel, setEditingRefuel] = useState<RefuelRecord | null>(null);
  const [refuelDefaultEnergyType, setRefuelDefaultEnergyType] = useState<EnergySourceType | undefined>(undefined);

  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [editingMaintenance, setEditingMaintenance] = useState<MaintenanceRecord | null>(null);

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Sync to localStorage and Firestore
  useEffect(() => {
    localStorage.setItem('garage_all_vehicles', JSON.stringify(vehicles));
    // Optional Cloud Sync to Firestore if user is authenticated
    if (account.isLoggedIn && account.id) {
      try {
        const userDocRef = doc(db, 'users', account.id);
        setDoc(userDocRef, {
          vehicles,
          account,
          updatedAt: new Date().toISOString()
        }, { merge: true }).catch(err => {
          console.debug('Firestore sync notice:', err);
        });
      } catch (e) {
        console.debug('Firestore offline queue active');
      }
    }
  }, [vehicles, account]);

  useEffect(() => {
    localStorage.setItem('garage_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('garage_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('garage_user_account', JSON.stringify(account));
  }, [account]);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setAccount(prev => ({
          ...prev,
          id: firebaseUser.uid,
          name: firebaseUser.displayName || prev.name,
          email: firebaseUser.email || prev.email,
          plan: 'Pro Garage Cloud (Firebase)',
          syncStatus: 'synced',
          isLoggedIn: true,
          provider: firebaseUser.providerData[0]?.providerId.includes('google') ? 'google' : 'email',
          avatarUrl: firebaseUser.photoURL || prev.avatarUrl
        }));
      }
    });
    return () => unsubscribe();
  }, []);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Selected Active Vehicle
  const selectedVehicle = useMemo(() => {
    return vehicles.find(v => v.id === selectedCarId) || vehicles[0];
  }, [vehicles, selectedCarId]);

  // Handler: Select vehicle and navigate to detail
  const handleSelectVehicle = (vehicleId: string) => {
    setSelectedCarId(vehicleId);
    setCurrentView('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handler: Save vehicle (Create or Update)
  const handleSaveVehicle = (vehicleData: Partial<Vehicle>) => {
    if (vehicleToEdit) {
      // Update
      const updatedList = vehicles.map(v => v.id === vehicleToEdit.id ? { ...v, ...vehicleData } as Vehicle : v);
      setVehicles(updatedList);
      showToast(`Veicolo ${vehicleData.brand} ${vehicleData.model} aggiornato con successo!`, 'success');
    } else {
      // Create new
      const newCar: Vehicle = {
        id: vehicleData.id || `car_${Date.now()}`,
        brand: vehicleData.brand || 'Nuova Marca',
        model: vehicleData.model || 'Nuovo Modello',
        plate: vehicleData.plate || 'AA 000 AA',
        fuelType: vehicleData.fuelType || 'Diesel',
        tankCapacity: Number(vehicleData.tankCapacity) || 50,
        registrationDate: vehicleData.registrationDate || new Date().toISOString().split('T')[0],
        initialKm: Number(vehicleData.initialKm) || 0,
        photoUrl: vehicleData.photoUrl || '',
        refuels: [],
        maintenances: []
      };
      setVehicles([newCar, ...vehicles]);
      setSelectedCarId(newCar.id);
      showToast(`Nuovo veicolo aggiunto al garage: ${newCar.brand} ${newCar.model}`, 'success');
    }
  };

  // Handler: Delete vehicle
  const handleDeleteVehicle = (vehicleId: string) => {
    const updated = vehicles.filter(v => v.id !== vehicleId);
    setVehicles(updated);
    if (selectedCarId === vehicleId && updated.length > 0) {
      setSelectedCarId(updated[0].id);
    }
    showToast('Veicolo rimosso dal garage.', 'info');
  };

  // Handler: Save Refuel
  const handleSaveRefuel = (refuelData: RefuelRecord) => {
    if (!selectedVehicle) return;

    const existingIndex = (selectedVehicle.refuels || []).findIndex(r => r.id === refuelData.id);
    let updatedRefuels = [...(selectedVehicle.refuels || [])];

    if (existingIndex >= 0) {
      updatedRefuels[existingIndex] = refuelData;
      showToast('Rifornimento aggiornato con successo!', 'success');
    } else {
      updatedRefuels = [refuelData, ...updatedRefuels];
      showToast('Nuovo rifornimento registrato nel log!', 'success');
    }

    const updatedVehicle: Vehicle = {
      ...selectedVehicle,
      refuels: updatedRefuels
    };

    setVehicles(vehicles.map(v => v.id === updatedVehicle.id ? updatedVehicle : v));
  };

  // Handler: Delete Refuel
  const handleDeleteRefuel = (refuelId: string) => {
    if (!selectedVehicle) return;
    const updatedRefuels = (selectedVehicle.refuels || []).filter(r => r.id !== refuelId);
    const updatedVehicle: Vehicle = {
      ...selectedVehicle,
      refuels: updatedRefuels
    };
    setVehicles(vehicles.map(v => v.id === updatedVehicle.id ? updatedVehicle : v));
    showToast('Rifornimento eliminato.', 'info');
  };

  // Handler: Save Maintenance
  const handleSaveMaintenance = (maintData: MaintenanceRecord) => {
    if (!selectedVehicle) return;

    const existingIndex = (selectedVehicle.maintenances || []).findIndex(m => m.id === maintData.id);
    let updatedMaints = [...(selectedVehicle.maintenances || [])];

    if (existingIndex >= 0) {
      updatedMaints[existingIndex] = maintData;
      showToast('Intervento manutenzione aggiornato con successo!', 'success');
    } else {
      updatedMaints = [maintData, ...updatedMaints];
      showToast('Nuovo intervento registrato nel libretto tagliandi!', 'success');
    }

    const updatedVehicle: Vehicle = {
      ...selectedVehicle,
      maintenances: updatedMaints
    };

    setVehicles(vehicles.map(v => v.id === updatedVehicle.id ? updatedVehicle : v));
  };

  // Handler: Delete Maintenance
  const handleDeleteMaintenance = (maintId: string) => {
    if (!selectedVehicle) return;
    const updatedMaints = (selectedVehicle.maintenances || []).filter(m => m.id !== maintId);
    const updatedVehicle: Vehicle = {
      ...selectedVehicle,
      maintenances: updatedMaints
    };
    setVehicles(vehicles.map(v => v.id === updatedVehicle.id ? updatedVehicle : v));
    showToast('Intervento di manutenzione eliminato.', 'info');
  };

  // Notifications handlers
  const handleMarkNotificationAsRead = (id: string) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleMarkAllNotificationsAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    showToast('Tutte le notifiche sono state contrassegnate come lette.', 'success');
  };

  const handleClearNotifications = () => {
    setNotifications([]);
    showToast('Registro notifiche svuotato.', 'info');
  };

  // Reset Garage to demo seed
  const handleResetGarage = () => {
    setVehicles(SEED_GARAGE);
    setSelectedCarId(SEED_GARAGE[0].id);
    localStorage.setItem('garage_all_vehicles', JSON.stringify(SEED_GARAGE));
    showToast('Garage ripristinato con i veicoli demo.', 'success');
  };

  // Import Garage from JSON
  const handleImportGarage = (imported: Vehicle[]) => {
    setVehicles(imported);
    if (imported.length > 0) {
      setSelectedCarId(imported[0].id);
    }
    localStorage.setItem('garage_all_vehicles', JSON.stringify(imported));
    showToast(`${imported.length} veicoli importati con successo!`, 'success');
  };

  // Auth Login Handlers
  const handleLoginSuccess = (newAccount: UserAccount) => {
    setAccount(newAccount);
    setIsAuthModalOpen(false);
    showToast(`Benvenuto, ${newAccount.name}! Accesso effettuato.`, 'success');
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {}
    const guestAccount: UserAccount = {
      id: '',
      name: 'Utente Garage',
      email: '',
      plan: 'Pro Garage Cloud',
      syncStatus: 'local_only',
      memberSince: 'Agosto 2026',
      provider: 'guest',
      isLoggedIn: false
    };
    setAccount(guestAccount);
    localStorage.removeItem('garage_user_account');
    setIsAccountModalOpen(false);
    setIsAuthModalOpen(false);
    showToast('Disconnessione effettuata. Effettua l\'accesso per continuare.', 'info');
  };

  // IF NOT LOGGED IN: SHOW AUTH GATE (LOGIN WALL)
  if (!account.isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] font-['Plus_Jakarta_Sans',sans-serif] flex flex-col antialiased">
        <AuthGate onLoginSuccess={handleLoginSuccess} />
        
        {/* TOAST NOTIFICATION */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5">
            <div className={`px-4 py-3 rounded-2xl shadow-xl border text-xs font-bold flex items-center gap-2 ${
              toastMessage.type === 'success' 
                ? 'bg-[#0f172a] text-white border-slate-700' 
                : toastMessage.type === 'error'
                  ? 'bg-red-600 text-white border-red-500'
                  : 'bg-[#2563eb] text-white border-blue-400'
            }`}>
              <span>{toastMessage.text}</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] font-['Plus_Jakarta_Sans',sans-serif] flex flex-col antialiased">
      
      {/* 1. TOP NAVIGATION & HUB MENU */}
      <Header 
        currentView={currentView}
        selectedVehicle={selectedVehicle}
        notifications={notifications}
        settings={settings}
        account={account}
        onNavigateGarage={() => setCurrentView('garage')}
        onOpenAddCar={() => {
          setVehicleToEdit(null);
          setIsAddCarModalOpen(true);
        }}
        onOpenEditCar={() => {
          setVehicleToEdit(selectedVehicle);
          setIsAddCarModalOpen(true);
        }}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenNotifications={() => setIsNotificationsModalOpen(true)}
        onOpenAccount={() => setIsAccountModalOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onMarkAllNotificationsRead={handleMarkAllNotificationsAsRead}
        onLogout={handleLogout}
      />

      {/* 2. MAIN VIEW (HOME GARAGE OR VEHICLE DETAIL) */}
      <main className="flex-1 flex flex-col">
        {currentView === 'garage' ? (
          <GarageHome 
            vehicles={vehicles}
            settings={settings}
            onSelectVehicle={handleSelectVehicle}
            onOpenAddCar={() => {
              setVehicleToEdit(null);
              setIsAddCarModalOpen(true);
            }}
            onOpenEditCar={(car) => {
              setVehicleToEdit(car);
              setIsAddCarModalOpen(true);
            }}
            onDeleteVehicle={handleDeleteVehicle}
          />
        ) : (
          selectedVehicle ? (
            <VehicleDetail 
              vehicle={selectedVehicle}
              settings={settings}
              onOpenEditCar={() => {
                setVehicleToEdit(selectedVehicle);
                setIsAddCarModalOpen(true);
              }}
              onOpenAddRefuel={(energyType) => {
                setEditingRefuel(null);
                setRefuelDefaultEnergyType(energyType);
                setIsRefuelModalOpen(true);
              }}
              onOpenEditRefuel={(refuel) => {
                setEditingRefuel(refuel);
                setIsRefuelModalOpen(true);
              }}
              onOpenAddMaintenance={() => {
                setEditingMaintenance(null);
                setIsMaintenanceModalOpen(true);
              }}
              onOpenEditMaintenance={(maint) => {
                setEditingMaintenance(maint);
                setIsMaintenanceModalOpen(true);
              }}
              onOpenFixTank={() => {
                setVehicleToEdit(selectedVehicle);
                setIsAddCarModalOpen(true);
              }}
            />
          ) : (
            <div className="text-center py-20">
              <p className="text-base text-[#64748b]">Nessun veicolo selezionato.</p>
              <button 
                onClick={() => setCurrentView('garage')}
                className="mt-4 bg-[#2563eb] text-white text-xs font-bold px-4 py-2 rounded-xl"
              >
                Torna al Garage
              </button>
            </div>
          )
        )}
      </main>

      {/* 3. FOOTER */}
      <footer className="bg-white border-t border-[#e2e8f0] py-4 px-6 text-center text-xs text-[#64748b] flex flex-wrap justify-between items-center max-w-7xl mx-auto w-full mt-auto">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[#0f172a]">Gestionale Auto PWA</span>
          <span>•</span>
          <span>{vehicles.length} veicoli nel garage</span>
        </div>
        <div>
          <span>Micro-Cache Locale & Offline Ready</span>
        </div>
      </footer>

      {/* 4. TOAST NOTIFICATION CONTAINER */}
      {toastMessage && (
        <div 
          id="toast-notification"
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl shadow-xl text-xs font-bold text-white flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200 ${
            toastMessage.type === 'success' 
              ? 'bg-[#059669]' 
              : toastMessage.type === 'error' 
                ? 'bg-[#dc2626]' 
                : 'bg-[#0f172a]'
          }`}
        >
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* 5. MODALS */}
      <AddVehicleModal 
        isOpen={isAddCarModalOpen}
        vehicleToEdit={vehicleToEdit}
        onClose={() => {
          setIsAddCarModalOpen(false);
          setVehicleToEdit(null);
        }}
        onSave={handleSaveVehicle}
      />

      {selectedVehicle && (
        <>
          <RefuelModal 
            isOpen={isRefuelModalOpen}
            vehicle={selectedVehicle}
            editingRefuel={editingRefuel}
            defaultEnergyType={refuelDefaultEnergyType}
            onClose={() => {
              setIsRefuelModalOpen(false);
              setEditingRefuel(null);
              setRefuelDefaultEnergyType(undefined);
            }}
            onSave={handleSaveRefuel}
            onDelete={handleDeleteRefuel}
          />

          <MaintenanceModal 
            isOpen={isMaintenanceModalOpen}
            vehicle={selectedVehicle}
            editingMaintenance={editingMaintenance}
            onClose={() => {
              setIsMaintenanceModalOpen(false);
              setEditingMaintenance(null);
            }}
            onSave={handleSaveMaintenance}
            onDelete={handleDeleteMaintenance}
          />
        </>
      )}

      <SettingsModal 
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        vehicles={vehicles}
        onSaveSettings={(newSettings) => {
          setSettings(newSettings);
          showToast('Impostazioni salvate con successo!', 'success');
        }}
        onResetGarage={handleResetGarage}
        onImportGarage={handleImportGarage}
      />

      <NotificationsModal 
        isOpen={isNotificationsModalOpen}
        onClose={() => setIsNotificationsModalOpen(false)}
        notifications={notifications}
        onMarkAsRead={handleMarkNotificationAsRead}
        onMarkAllAsRead={handleMarkAllNotificationsAsRead}
        onClearNotifications={handleClearNotifications}
      />

      <AccountModal 
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        account={account}
        vehiclesCount={vehicles.length}
        onSaveAccount={(newAccount) => {
          setAccount(newAccount);
          showToast('Profilo utente aggiornato!', 'success');
        }}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
      />

      <AuthLoginModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentAccount={account}
        onLoginSuccess={handleLoginSuccess}
      />

    </div>
  );
}
