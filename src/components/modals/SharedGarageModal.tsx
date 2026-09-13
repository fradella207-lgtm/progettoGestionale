import React, { useState, useEffect } from 'react';
import { 
  X, 
  Users, 
  Share2, 
  Copy, 
  Check, 
  Crown, 
  Sparkles, 
  Car, 
  Bike,
  RefreshCw, 
  Link as LinkIcon, 
  ShieldCheck, 
  Trash2, 
  MessageCircle, 
  CheckCircle2, 
  Sliders,
  Eye,
  Edit3,
  Fuel,
  FileText,
  Bell,
  UserX,
  KeyRound,
  AlertTriangle
} from 'lucide-react';
import { Vehicle, UserAccount, UserTier, SharedGarage } from '../../types';
import { checkFeatureAccess } from '../../utils/tierManager';
import { 
  createOrUpdateSharedGarage, 
  getSharedGarageByCode, 
  joinSharedGarage, 
  leaveOrRevokeSharedGarage,
  updateSharedGarageSettings,
  removeMemberFromSharedGarage,
  regenerateSharedGarageCode
} from '../../utils/sharedGarageService';
import { useSwipeBack } from '../../hooks/useSwipeBack';
import { ConfirmationModal } from './ConfirmationModal';

interface SharedGarageModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicles: Vehicle[];
  activeVehicleId?: string;
  userAccount: UserAccount;
  userTier: UserTier;
  onOpenUpgradeModal: (feature?: any) => void;
  onVehicleUpdated: (updatedVehicle: Vehicle) => void;
  onVehicleAdded: (newVehicle: Vehicle) => void;
  onShowToast: (message: string, type: 'success' | 'error' | 'info') => void;
  initialCode?: string;
}

export const SharedGarageModal: React.FC<SharedGarageModalProps> = ({
  isOpen,
  onClose,
  vehicles,
  activeVehicleId,
  userAccount,
  userTier,
  onOpenUpgradeModal,
  onVehicleUpdated,
  onVehicleAdded,
  onShowToast,
  initialCode
}) => {
  const [activeTab, setActiveTab] = useState<'share' | 'join'>(initialCode ? 'join' : 'share');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(activeVehicleId || vehicles[0]?.id || '');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [joinCodeInput, setJoinCodeInput] = useState(initialCode || '');
  const [previewGarage, setPreviewGarage] = useState<SharedGarage | null>(null);
  const [currentSharedGarage, setCurrentSharedGarage] = useState<SharedGarage | null>(null);

  // Control Panel configurable options
  const [permLevel, setPermLevel] = useState<'full' | 'read_only' | 'refuel_only'>('full');
  const [allowDocView, setAllowDocView] = useState<boolean>(true);
  const [notifyExp, setNotifyExp] = useState<boolean>(true);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Custom confirmation modal state (no native browser confirm)
  const [confirmModalConfig, setConfirmModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel: string;
    cancelLabel?: string;
    isDestructive?: boolean;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    confirmLabel: '',
    onConfirm: () => {}
  });

  const hasProAccess = checkFeatureAccess('shared_garage', userTier);

  // Selected vehicle object
  const currentVehicle = vehicles.find(v => v.id === selectedVehicleId) || vehicles[0];

  // Update selected vehicle if activeVehicleId changes on modal open
  useEffect(() => {
    if (activeVehicleId && vehicles.some(v => v.id === activeVehicleId)) {
      setSelectedVehicleId(activeVehicleId);
    } else if (vehicles.length > 0 && !vehicles.some(v => v.id === selectedVehicleId)) {
      setSelectedVehicleId(vehicles[0].id);
    }
  }, [activeVehicleId, vehicles]);

  // Load shared garage data if vehicle is shared
  useEffect(() => {
    if (currentVehicle?.sharedGarageCode) {
      getSharedGarageByCode(currentVehicle.sharedGarageCode).then(garage => {
        if (garage) {
          setCurrentSharedGarage(garage);
          if (garage.permissionsLevel) setPermLevel(garage.permissionsLevel);
          if (typeof garage.allowDocumentView === 'boolean') setAllowDocView(garage.allowDocumentView);
          if (typeof garage.notifyOnExpenses === 'boolean') setNotifyExp(garage.notifyOnExpenses);
        } else {
          setCurrentSharedGarage(null);
        }
      });
    } else {
      setCurrentSharedGarage(null);
    }
  }, [currentVehicle]);

  // Support swipe right gesture to go back
  useSwipeBack({
    onBack: onClose,
    enabled: isOpen
  });

  if (!isOpen) return null;

  const currentShareCode = currentSharedGarage?.code || currentVehicle?.sharedGarageCode || '';
  const shareUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}${window.location.pathname}?join_garage=${currentShareCode}` 
    : '';

  const isCurrentVehicleMoto = currentVehicle?.vehicleType === 'moto';

  // Handler: Generate or activate share code
  const handleCreateShare = async () => {
    if (!hasProAccess) {
      onOpenUpgradeModal('shared_garage');
      return;
    }

    if (!currentVehicle) {
      onShowToast('Nessun veicolo selezionato', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const shared = await createOrUpdateSharedGarage(currentVehicle, userAccount);
      setCurrentSharedGarage(shared);
      onVehicleUpdated(shared.vehicle);
      onShowToast(`Condivisione attivata per ${currentVehicle.brand} ${currentVehicle.model}!`, 'success');
    } catch (err: any) {
      console.error(err);
      onShowToast('Errore durante la generazione della condivisione', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Handler: Save Control Settings
  const handleSaveControlSettings = async () => {
    if (!currentShareCode) return;
    setIsSavingSettings(true);
    try {
      await updateSharedGarageSettings(currentShareCode, {
        permissionsLevel: permLevel,
        allowDocumentView: allowDocView,
        notifyOnExpenses: notifyExp
      });
      const updatedVehicle: Vehicle = {
        ...currentVehicle,
        sharedPermissionsLevel: permLevel,
        sharedAllowDocumentView: allowDocView
      };
      onVehicleUpdated(updatedVehicle);
      onShowToast('Regole di controllo e permessi aggiornati con successo!', 'success');
    } catch (e) {
      onShowToast('Errore salvataggio regole', 'error');
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Handler: Regenerate Share Code
  const handleRegenerateCode = () => {
    if (!currentShareCode || !currentVehicle) return;
    setConfirmModalConfig({
      isOpen: true,
      title: 'Generare un nuovo codice?',
      message: 'Il vecchio codice non sarà più valido per nuovi inviti. Gli utenti già connessi rimarranno comunque sincronizzati.',
      confirmLabel: 'Rigenera Codice',
      cancelLabel: 'Annulla',
      isDestructive: false,
      onConfirm: async () => {
        setConfirmModalConfig(prev => ({ ...prev, isOpen: false }));
        setIsLoading(true);
        try {
          const regenerated = await regenerateSharedGarageCode(currentShareCode, currentVehicle, userAccount);
          setCurrentSharedGarage(regenerated);
          onVehicleUpdated(regenerated.vehicle);
          onShowToast('Nuovo codice generato con successo!', 'success');
        } catch (e) {
          onShowToast('Errore durante la generazione del nuovo codice', 'error');
        } finally {
          setIsLoading(false);
        }
      }
    });
  };

  // Handler: Kick / Remove single member
  const handleKickMember = (memberUid: string, memberName: string) => {
    if (!currentShareCode) return;
    setConfirmModalConfig({
      isOpen: true,
      title: 'Disconnettere questo utente?',
      message: `Vuoi disconnettere ${memberName} da questo veicolo? Non riceverà più aggiornamenti né potrà inserire dati.`,
      confirmLabel: 'Disconnetti',
      cancelLabel: 'Annulla',
      isDestructive: true,
      onConfirm: async () => {
        setConfirmModalConfig(prev => ({ ...prev, isOpen: false }));
        setIsLoading(true);
        try {
          const updated = await removeMemberFromSharedGarage(currentShareCode, memberUid);
          setCurrentSharedGarage(updated);
          onShowToast(`${memberName} è stato disconnesso dal veicolo`, 'info');
        } catch (e) {
          onShowToast('Errore durante la rimozione del membro', 'error');
        } finally {
          setIsLoading(false);
        }
      }
    });
  };

  // Handler: Copy Share Link
  const handleCopyLink = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    onShowToast('Link di condivisione copiato negli appunti!', 'success');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Handler: Copy Share Code
  const handleCopyCode = () => {
    if (!currentShareCode) return;
    navigator.clipboard.writeText(currentShareCode);
    setCopiedCode(true);
    onShowToast(`Codice "${currentShareCode}" copiato!`, 'success');
    setTimeout(() => setCopiedCode(false), 2500);
  };

  // Handler: Share via WhatsApp
  const handleShareWhatsApp = () => {
    if (!currentShareCode) return;
    const typeLabel = isCurrentVehicleMoto ? 'della moto' : "dell'auto";
    const msg = `Ciao! Ho condiviso con te la gestione ${typeLabel} ${currentVehicle.brand} ${currentVehicle.model} (${currentVehicle.plate}) su MyGarage360.\n\nAccedi qui con il link diretto:\n${shareUrl}\n\nOppure inserisci questo codice di sincronizzazione nell'app:\n${currentShareCode}`;
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank');
  };

  // Handler: Verify code before joining
  const handleVerifyJoinCode = async () => {
    const clean = joinCodeInput.trim().toUpperCase();
    if (!clean) {
      onShowToast('Inserisci un codice valido', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const garage = await getSharedGarageByCode(clean);
      if (!garage) {
        onShowToast('Codice non trovato o condivisione non più attiva', 'error');
        setPreviewGarage(null);
      } else {
        setPreviewGarage(garage);
        onShowToast(`Veicolo trovato: ${garage.vehicleName}`, 'success');
      }
    } catch (err) {
      onShowToast('Errore durante la verifica del codice', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Handler: Confirm join and sync vehicle
  const handleConfirmJoin = async () => {
    if (!previewGarage) return;

    setIsLoading(true);
    try {
      const { vehicle } = await joinSharedGarage(previewGarage.code, userAccount);
      
      const existsIndex = vehicles.findIndex(v => v.id === vehicle.id || v.plate === vehicle.plate);
      if (existsIndex >= 0) {
        onVehicleUpdated(vehicle);
        onShowToast(`Sincronizzazione aggiornata per ${vehicle.brand} ${vehicle.model}!`, 'success');
      } else {
        onVehicleAdded(vehicle);
        onShowToast(`🎉 Veicolo ${vehicle.brand} ${vehicle.model} aggiunto e sincronizzato con successo!`, 'success');
      }
      onClose();
    } catch (err: any) {
      onShowToast(err.message || 'Errore durante la sincronizzazione', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Handler: Revoke / Stop Sharing (Termina quando vuole lui)
  const handleRevokeShare = () => {
    if (!currentShareCode || !currentVehicle) return;
    const isGarageAdmin = !currentVehicle?.sharedRole || currentVehicle.sharedRole === 'owner' || (currentSharedGarage && currentSharedGarage.ownerId === userAccount.id);

    setConfirmModalConfig({
      isOpen: true,
      title: isGarageAdmin ? 'Terminare la condivisione?' : 'Scollegare il veicolo?',
      message: isGarageAdmin
        ? `Vuoi terminare la condivisione per ${currentVehicle.brand} ${currentVehicle.model}? Tutti i partner connessi perderanno l'accesso istantaneamente e il veicolo tornerà privato al 100%.`
        : `Vuoi scollegare ${currentVehicle.brand} ${currentVehicle.model} dal tuo account? Non riceverai più aggiornamenti su questo veicolo.`,
      confirmLabel: isGarageAdmin ? 'Termina Condivisione' : 'Scollega Veicolo',
      cancelLabel: 'Annulla',
      isDestructive: true,
      onConfirm: async () => {
        setConfirmModalConfig(prev => ({ ...prev, isOpen: false }));
        setIsLoading(true);
        try {
          await leaveOrRevokeSharedGarage(currentShareCode, userAccount.id, isGarageAdmin);
          const updatedVehicle: Vehicle = {
            ...currentVehicle,
            isShared: false,
            sharedGarageCode: undefined,
            sharedOwnerName: undefined,
            sharedOwnerEmail: undefined,
            sharedRole: undefined,
            sharedMembersCount: undefined,
            sharedPermissionsLevel: undefined,
            sharedAllowDocumentView: undefined
          };
          onVehicleUpdated(updatedVehicle);
          setCurrentSharedGarage(null);
          onShowToast(isGarageAdmin ? 'Condivisione terminata. Il veicolo ora è privato ed esclusivo per te.' : 'Hai scollegato il veicolo dal tuo account.', 'info');
          onClose();
        } catch (err) {
          onShowToast('Errore durante la terminazione della condivisione', 'error');
        } finally {
          setIsLoading(false);
        }
      }
    });
  };

  const isGarageAdmin = !currentVehicle?.sharedRole || currentVehicle.sharedRole === 'owner' || (currentSharedGarage && currentSharedGarage.ownerId === userAccount.id);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto font-['Plus_Jakarta_Sans',sans-serif] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <div className="relative bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-7 overflow-hidden">
          <div className="absolute -top-16 -right-16 w-56 h-56 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

          {/* Close button */}
          <button 
            type="button"
            onClick={onClose}
            aria-label="Chiudi pannello di controllo"
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all cursor-pointer backdrop-blur-sm"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Badge PRO */}
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 text-[11px] font-black tracking-wide uppercase shadow-md shadow-amber-500/20">
              <Crown className="w-3.5 h-3.5 fill-slate-950" />
              <span>Pannello di Controllo PRO</span>
            </span>
            <span className="text-xs text-indigo-200 font-medium">
              Multi-Account Cloud Sync
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white leading-snug flex items-center gap-2.5">
            <Sliders className="w-6 h-6 text-indigo-400" />
            <span>Condivisione & Controllo Veicolo</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-lg">
            Decidi con chi condividere auto o moto, imposta i permessi e interrompi la condivisione istantaneamente quando vuoi tu.
          </p>
        </div>

        {/* TAB SELECTOR */}
        <div className="flex border-b border-slate-200 bg-slate-50/80 p-2 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('share')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'share'
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Pannello di Controllo</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('join')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'join'
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <LinkIcon className="w-4 h-4" />
            <span>Unisciti con Codice</span>
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="p-6 sm:p-7 space-y-6 max-h-[75vh] overflow-y-auto">

          {/* NON-PRO BANNER IF ON FREE TIER */}
          {!hasProAccess && (
            <div className="bg-gradient-to-br from-amber-500/10 via-amber-50 to-indigo-50 border border-amber-200/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow-md shadow-amber-500/20">
                  <Crown className="w-5 h-5 fill-slate-950" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Sblocca la Condivisione Veicoli
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Nel piano PRO puoi condividere e gestire l'auto o moto con il partner su più smartphone con permessi granulari e sincronizzazione cloud live.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onOpenUpgradeModal('shared_garage')}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 transition-all cursor-pointer shrink-0"
              >
                <Sparkles className="w-4 h-4 fill-slate-950" />
                <span>Passa a PRO</span>
              </button>
            </div>
          )}

          {/* TAB 1: CONTROL PANEL */}
          {activeTab === 'share' && (
            <div className="space-y-6">
              {/* Vehicle Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Seleziona Veicolo da gestire
                </label>
                <div className="relative">
                  <select
                    value={selectedVehicleId}
                    onChange={(e) => setSelectedVehicleId(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/70 text-slate-900 font-bold text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
                  >
                    {vehicles.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.vehicleType === 'moto' ? '🏍️' : '🚗'} {v.brand} {v.model} ({v.plate}) {v.isShared ? '• [Condivisa Live]' : '• [Privata]'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* State A: Currently Shared -> FULL CONTROL PANEL */}
              {currentShareCode ? (
                <div className="space-y-6">
                  {/* Status Banner */}
                  <div className="bg-emerald-50/90 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative shrink-0">
                        <div className="w-3.5 h-3.5 bg-emerald-500 rounded-full" />
                        <div className="w-3.5 h-3.5 bg-emerald-500 rounded-full animate-ping absolute inset-0 opacity-75" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black uppercase tracking-wider text-emerald-800">
                            Sincronizzazione Attiva
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-200/80 text-emerald-950 text-[10px] font-black">
                            {isGarageAdmin ? 'Tu sei Proprietario' : 'Connesso come Membro'}
                          </span>
                        </div>
                        <span className="text-xs text-emerald-700 font-medium block mt-0.5">
                          {currentVehicle.brand} {currentVehicle.model} è collegata al cloud Firestore in tempo reale.
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* VIEW SEPARATION: MEMBER (CANNOT RE-SHARE) VS OWNER (FULL CONTROL) */}
                  {!isGarageAdmin ? (
                    /* MEMBER VIEW: Cannot re-share, cannot view/share invite codes, cannot edit rules */
                    <div className="space-y-4">
                      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                            <ShieldCheck className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-sm font-black text-slate-900">
                              Veicolo Condiviso da {currentVehicle.sharedOwnerName || currentVehicle.sharedOwnerEmail || 'Proprietario'}
                            </h4>
                            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                              Sei connesso come utente autorizzato con sincronizzazione in tempo reale. <strong className="text-slate-700 font-bold">Solo il proprietario</strong> può generare nuovi inviti, condividere il veicolo o modificare le regole di accesso.
                            </p>
                          </div>
                        </div>

                        <div className="border-t border-slate-200/80 pt-3.5 space-y-2.5">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                            Regole applicate al tuo account:
                          </span>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                            <div className="p-3 bg-white rounded-xl border border-slate-200 flex flex-col gap-1 shadow-2xs">
                              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                                <Fuel className="w-4 h-4 text-indigo-600 shrink-0" />
                                <span>Operazioni Consentite</span>
                              </span>
                              <span className="text-slate-600 text-[11px] leading-snug">
                                {currentVehicle.sharedPermissionsLevel === 'read_only' && (
                                  <span className="text-amber-700 font-medium">🔒 Sola Lettura: Puoi consultare storico e km, ma non puoi registrare rifornimenti o spese.</span>
                                )}
                                {currentVehicle.sharedPermissionsLevel === 'refuel_only' && (
                                  <span className="text-blue-700 font-medium">⛽ Solo Rifornimenti: Puoi registrare carburante/ricariche e km. Tagliandi riservati.</span>
                                )}
                                {(currentVehicle.sharedPermissionsLevel === 'full' || !currentVehicle.sharedPermissionsLevel) && (
                                  <span className="text-emerald-700 font-medium">✅ Completo: Puoi registrare sia rifornimenti che interventi di manutenzione.</span>
                                )}
                              </span>
                            </div>

                            <div className="p-3 bg-white rounded-xl border border-slate-200 flex flex-col gap-1 shadow-2xs">
                              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                                <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                                <span>Documenti di Bordo</span>
                              </span>
                              <span className="text-slate-600 text-[11px] leading-snug">
                                {currentVehicle.sharedAllowDocumentView === false ? (
                                  <span className="text-amber-700 font-medium">🔒 Riservati: I documenti del veicolo sono visibili unicamente al proprietario.</span>
                                ) : (
                                  <span className="text-emerald-700 font-medium">📄 Visibili: Puoi consultare libretto e documenti di bordo del veicolo.</span>
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Scollega dal garage */}
                      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <span className="text-xs font-bold text-slate-800 block">
                            Vuoi rimuovere questo veicolo?
                          </span>
                          <span className="text-[11px] text-slate-500">
                            Scollega il veicolo dal tuo garage se non desideri più visualizzarlo. I dati del proprietario non verranno cancellati.
                          </span>
                        </div>
                        <button
                          type="button"
                          id="btn-leave-shared-garage-member"
                          onClick={handleRevokeShare}
                          disabled={isLoading}
                          className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0 active:scale-95"
                        >
                          <UserX className="w-4 h-4" />
                          <span>Scollega Veicolo</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* OWNER VIEW: Share Code, Controls, Members, Revoke */
                    <div className="space-y-6">
                      {/* Share Code and Direct Links */}
                      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                            Codice di Sincronizzazione
                          </span>
                          <button
                            type="button"
                            onClick={handleRegenerateCode}
                            disabled={isLoading}
                            className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer transition-colors"
                            title="Genera un nuovo codice per invalidare quello vecchio"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                            <span>Rigenera codice</span>
                          </button>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-3">
                          <div className="flex-1 w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-white border-2 border-indigo-200 shadow-2xs">
                            <span className="font-mono text-xl sm:text-2xl font-black text-indigo-700 tracking-widest">
                              {currentShareCode}
                            </span>
                            <button
                              type="button"
                              onClick={handleCopyCode}
                              className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                            >
                              {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                              <span>{copiedCode ? 'Copiato' : 'Copia'}</span>
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={handleShareWhatsApp}
                            className="w-full sm:w-auto px-4 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer shrink-0"
                          >
                            <MessageCircle className="w-4 h-4" />
                            <span>Invia su WhatsApp</span>
                          </button>
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                          <input 
                            type="text" 
                            readOnly 
                            value={shareUrl}
                            className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-500 font-mono text-[11px] select-all focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={handleCopyLink}
                            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
                          >
                            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedLink ? 'Copiato' : 'Copia Link'}</span>
                          </button>
                        </div>
                      </div>

                      {/* 2. REALE PANNELLO DI CONTROLLO: REGOLE E PERMESSI */}
                      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4 shadow-2xs">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                          <div className="flex items-center gap-2">
                            <Sliders className="w-4 h-4 text-indigo-600" />
                            <h4 className="text-sm font-black text-slate-900">
                              Console Regole di Controllo
                            </h4>
                          </div>
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                            Controllo Totale
                          </span>
                        </div>

                        {/* Livello di Accesso */}
                        <div className="space-y-2">
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                            Autorizzazioni Operative Partner
                          </label>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            {[
                              { 
                                id: 'full', 
                                title: 'Completo', 
                                desc: 'Inserimento e modifica di rifornimenti, spese e tagliandi',
                                icon: Edit3 
                              },
                              { 
                                id: 'refuel_only', 
                                title: 'Solo Rifornimenti', 
                                desc: 'Registrazione carburante/ricarica e km. Tagliandi bloccati',
                                icon: Fuel 
                              },
                              { 
                                id: 'read_only', 
                                title: 'Sola Lettura', 
                                desc: 'Solo consultazione: blocca ogni inserimento o modifica',
                                icon: Eye 
                              }
                            ].map(opt => {
                              const Icon = opt.icon;
                              const isSel = permLevel === opt.id;
                              return (
                                <button
                                  key={opt.id}
                                  type="button"
                                  onClick={() => setPermLevel(opt.id as any)}
                                  className={`p-3 rounded-xl border text-left flex flex-col justify-between gap-1.5 transition-all cursor-pointer ${
                                    isSel
                                      ? 'bg-indigo-50/90 border-indigo-600 text-indigo-950 shadow-2xs ring-1 ring-indigo-500/20'
                                      : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200 text-slate-700'
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-black flex items-center gap-1.5">
                                      <Icon className="w-3.5 h-3.5 text-indigo-600" />
                                      {opt.title}
                                    </span>
                                    {isSel && <Check className="w-3.5 h-3.5 text-indigo-700 stroke-[3]" />}
                                  </div>
                                  <span className="text-[10px] text-slate-500 leading-tight">
                                    {opt.desc}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Opzioni Aggiuntive */}
                        <div className="pt-2 space-y-2.5">
                          <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80 cursor-pointer hover:bg-slate-100/60 transition-colors">
                            <div className="flex items-center gap-2.5 pr-2">
                              <FileText className="w-4 h-4 text-slate-600 shrink-0" />
                              <div>
                                <span className="text-xs font-bold text-slate-800 block">
                                  Visualizzazione Documenti e Libretto
                                </span>
                                <span className="text-[11px] text-slate-500 leading-tight block mt-0.5">
                                  Se disattivato, i documenti di bordo e il libretto restano privati e riservati solo a te.
                                </span>
                              </div>
                            </div>
                            <input 
                              type="checkbox"
                              checked={allowDocView}
                              onChange={(e) => setAllowDocView(e.target.checked)}
                              className="w-4 h-4 accent-indigo-600 cursor-pointer shrink-0"
                            />
                          </label>

                          <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80 cursor-pointer hover:bg-slate-100/60 transition-colors">
                            <div className="flex items-center gap-2.5 pr-2">
                              <Bell className="w-4 h-4 text-slate-600 shrink-0" />
                              <div>
                                <span className="text-xs font-bold text-slate-800 block">
                                  Notifiche di Nuove Spese & Pieni
                                </span>
                                <span className="text-[11px] text-slate-500 leading-tight block mt-0.5">
                                  Ricevi un avviso ogni volta che il partner registra una spesa o un rifornimento.
                                </span>
                              </div>
                            </div>
                            <input 
                              type="checkbox"
                              checked={notifyExp}
                              onChange={(e) => setNotifyExp(e.target.checked)}
                              className="w-4 h-4 accent-indigo-600 cursor-pointer shrink-0"
                            />
                          </label>
                        </div>

                        <div className="flex justify-end pt-1">
                          <button
                            type="button"
                            onClick={handleSaveControlSettings}
                            disabled={isSavingSettings}
                            className="w-full sm:w-auto px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-black rounded-xl transition-all cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
                          >
                            {isSavingSettings ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                            <span>Salva Regole di Controllo</span>
                          </button>
                        </div>
                      </div>

                      {/* 3. ACCOUNT CONNESSI & GESTIONE DISPOSITIVI */}
                      {currentSharedGarage?.members && currentSharedGarage.members.length > 0 && (
                        <div className="border-t border-slate-200 pt-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                              Dispositivi e Account Connessi ({currentSharedGarage.members.length})
                            </span>
                            <span className="text-[11px] text-slate-400">
                              Live
                            </span>
                          </div>

                          <div className="space-y-2">
                            {currentSharedGarage.members.map((m, idx) => {
                              const isMe = m.uid === userAccount.id;
                              const isMemberOwner = m.role === 'owner';

                              return (
                                <div 
                                  key={m.uid || idx} 
                                  className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs"
                                >
                                  <div className="flex items-center gap-3 min-w-0 pr-2">
                                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-black flex items-center justify-center text-xs shrink-0">
                                      {m.name ? m.name.charAt(0).toUpperCase() : 'U'}
                                    </div>
                                    <div className="min-w-0">
                                      <div className="flex items-center gap-1.5">
                                        <span className="font-black text-slate-800 truncate">
                                          {m.name || m.email || 'Utente Connesso'}
                                        </span>
                                        {isMe && (
                                          <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.2 rounded shrink-0">
                                            (Tu)
                                          </span>
                                        )}
                                      </div>
                                      <span className="text-[11px] text-slate-500 truncate block">
                                        {m.email || 'Account sincronizzato'}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2 shrink-0">
                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                                      isMemberOwner ? 'bg-amber-100 text-amber-900 border border-amber-200' : 'bg-slate-200 text-slate-800'
                                    }`}>
                                      {isMemberOwner ? 'Proprietario' : 'Partner'}
                                    </span>

                                    {/* Bottone Espulsione singolo membro per l'Admin */}
                                    {!isMemberOwner && (
                                      <button
                                        type="button"
                                        onClick={() => handleKickMember(m.uid, m.name || m.email)}
                                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                        title={`Disconnetti ${m.name || 'questo utente'}`}
                                      >
                                        <UserX className="w-4 h-4" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* 4. TERMINA CONDIVISIONE QUANDO VUOLE LUI (PULSANTE DEFINITIVO DI REVOCA) */}
                      <div className="pt-2">
                        <div className="bg-rose-50/90 border-2 border-rose-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                              <AlertTriangle className="w-5 h-5" />
                            </div>
                            <div>
                              <span className="text-xs font-black text-rose-950 uppercase tracking-wide block">
                                Termina Condivisione del Veicolo
                              </span>
                              <span className="text-[11px] text-rose-800 leading-tight block mt-0.5 max-w-md">
                                Puoi interrompere la condivisione in qualsiasi momento. Tutti gli altri account connessi verranno disconnessi istantaneamente e il veicolo tornerà 100% privato nel tuo garage.
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            id="btn-terminate-sharing-admin"
                            onClick={handleRevokeShare}
                            disabled={isLoading}
                            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-sm active:scale-95"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>Termina Condivisione</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* State B: Not yet shared -> Generate Code and activate */
                <div className="text-center py-8 px-5 bg-slate-50/70 border-2 border-dashed border-slate-200 rounded-2xl space-y-5">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-inner">
                    {isCurrentVehicleMoto ? (
                      <Bike className="w-8 h-8" />
                    ) : (
                      <Car className="w-8 h-8" />
                    )}
                  </div>

                  <div className="max-w-md mx-auto">
                    <h3 className="text-base sm:text-lg font-black text-slate-900">
                      Condividi {currentVehicle?.brand} {currentVehicle?.model} ({currentVehicle?.plate})
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
                      Genera un codice protetto per permettere al partner di visualizzare e inserire rifornimenti, spese e tagliandi in tempo reale dal suo smartphone.
                    </p>
                  </div>

                  {/* Pre-impostazione permessi */}
                  <div className="max-w-md mx-auto bg-white p-3.5 rounded-xl border border-slate-200 text-left space-y-1.5">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                      Permesso Iniziale Partner
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setPermLevel('full')}
                        className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold border text-center transition-all cursor-pointer ${
                          permLevel === 'full' ? 'bg-indigo-50 border-indigo-600 text-indigo-900' : 'bg-slate-50 border-slate-200 text-slate-600'
                        }`}
                      >
                        Completo
                      </button>
                      <button
                        type="button"
                        onClick={() => setPermLevel('refuel_only')}
                        className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold border text-center transition-all cursor-pointer ${
                          permLevel === 'refuel_only' ? 'bg-indigo-50 border-indigo-600 text-indigo-900' : 'bg-slate-50 border-slate-200 text-slate-600'
                        }`}
                      >
                        Solo Rifornimenti
                      </button>
                      <button
                        type="button"
                        onClick={() => setPermLevel('read_only')}
                        className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold border text-center transition-all cursor-pointer ${
                          permLevel === 'read_only' ? 'bg-indigo-50 border-indigo-600 text-indigo-900' : 'bg-slate-50 border-slate-200 text-slate-600'
                        }`}
                      >
                        Sola Lettura
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleCreateShare}
                    disabled={isLoading}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs sm:text-sm shadow-md shadow-indigo-600/20 transition-all cursor-pointer active:scale-95"
                  >
                    {isLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Share2 className="w-4 h-4" />
                    )}
                    <span>Attiva Condivisione & Genera Codice</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: JOIN / ENTER CODE */}
          {activeTab === 'join' && (
            <div className="space-y-6">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Codice di Sincronizzazione
                  </label>
                  <p className="text-xs text-slate-500 mb-3">
                    Inserisci il codice fornito dal proprietario (es. <span className="font-mono font-bold text-indigo-600">GARAGE-7B3K</span>)
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="es. GARAGE-7B3K"
                      value={joinCodeInput}
                      onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                      className="flex-1 px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 font-mono font-black text-base uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={handleVerifyJoinCode}
                      disabled={isLoading || !joinCodeInput.trim()}
                      className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
                    >
                      {isLoading ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4" />
                      )}
                      <span>Verifica</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Preview of found vehicle */}
              {previewGarage && (
                <div className="bg-indigo-50/70 border border-indigo-200 rounded-2xl p-5 space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-indigo-700 flex items-center gap-1.5">
                      {previewGarage.vehicle.vehicleType === 'moto' ? <Bike className="w-4 h-4" /> : <Car className="w-4 h-4" />}
                      Veicolo Trovato
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black">
                      Pronto per la Sincronizzazione
                    </span>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-indigo-100 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                      {previewGarage.vehicle.vehicleType === 'moto' ? <Bike className="w-6 h-6" /> : <Car className="w-6 h-6" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base font-black text-slate-900 truncate">
                        {previewGarage.vehicle.brand} {previewGarage.vehicle.model}
                      </h4>
                      <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                        <span className="font-mono font-bold bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 text-slate-800">
                          {previewGarage.vehicle.plate}
                        </span>
                        <span>•</span>
                        <span>Condivisa da: <strong>{previewGarage.ownerName}</strong></span>
                      </p>
                    </div>
                  </div>

                  <div className="text-xs text-slate-600 bg-white/60 p-3 rounded-xl space-y-1">
                    <p className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Rifornimenti e spese inserite si sincronizzeranno in tempo reale.</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Lo storico e i chilometri rimarranno sempre allineati.</span>
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleConfirmJoin}
                    disabled={isLoading}
                    className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                  >
                    {isLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Users className="w-4 h-4" />
                    )}
                    <span>Accetta e Sincronizza nel Mio Garage</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Sincronizzazione Cloud Crittografata Firestore</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 font-bold hover:bg-slate-200/60 transition-all cursor-pointer"
          >
            Chiudi
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModalConfig.isOpen}
        title={confirmModalConfig.title}
        message={confirmModalConfig.message}
        confirmLabel={confirmModalConfig.confirmLabel}
        cancelLabel={confirmModalConfig.cancelLabel}
        isDestructive={confirmModalConfig.isDestructive}
        onConfirm={confirmModalConfig.onConfirm}
        onCancel={() => setConfirmModalConfig(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};
