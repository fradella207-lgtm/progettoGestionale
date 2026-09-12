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
  RefreshCw, 
  Link as LinkIcon, 
  ShieldCheck, 
  Trash2, 
  Send,
  MessageCircle,
  ExternalLink,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Vehicle, UserAccount, UserTier, SharedGarage } from '../../types';
import { checkFeatureAccess } from '../../utils/tierManager';
import { 
  createOrUpdateSharedGarage, 
  getSharedGarageByCode, 
  joinSharedGarage, 
  leaveOrRevokeSharedGarage 
} from '../../utils/sharedGarageService';
import { useSwipeBack } from '../../hooks/useSwipeBack';

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

  const isPro = userTier === 'PRO';
  const hasProAccess = checkFeatureAccess('shared_garage', userTier);

  // Selected vehicle object
  const currentVehicle = vehicles.find(v => v.id === selectedVehicleId) || vehicles[0];

  // Check if current vehicle is already shared
  useEffect(() => {
    if (currentVehicle?.sharedGarageCode) {
      getSharedGarageByCode(currentVehicle.sharedGarageCode).then(garage => {
        setCurrentSharedGarage(garage);
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
    const msg = `Ciao! Ho condiviso con te la gestione dell'auto ${currentVehicle.brand} ${currentVehicle.model} (${currentVehicle.plate}) su MyGarage360.\n\nAccedi qui con il link diretto:\n${shareUrl}\n\nOppure inserisci questo codice di sincronizzazione nell'app:\n${currentShareCode}`;
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
      
      // Check if vehicle is already in local list
      const existsIndex = vehicles.findIndex(v => v.id === vehicle.id || v.plate === vehicle.plate);
      if (existsIndex >= 0) {
        onVehicleUpdated(vehicle);
        onShowToast(`Sincronizzazione aggiornata per ${vehicle.brand} ${vehicle.model}!`, 'success');
      } else {
        onVehicleAdded(vehicle);
        onShowToast(`🎉 Auto ${vehicle.brand} ${vehicle.model} aggiunta e sincronizzata con successo!`, 'success');
      }
      onClose();
    } catch (err: any) {
      onShowToast(err.message || 'Errore durante la sincronizzazione', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Handler: Revoke / Stop Sharing
  const handleRevokeShare = async () => {
    if (!currentShareCode) return;
    if (!window.confirm('Sei sicuro di voler revocare la condivisione? Il partner non riceverà più aggiornamenti su questo veicolo.')) {
      return;
    }

    setIsLoading(true);
    try {
      await leaveOrRevokeSharedGarage(currentShareCode, userAccount.id, true);
      const updatedVehicle: Vehicle = {
        ...currentVehicle,
        isShared: false,
        sharedGarageCode: undefined,
        sharedOwnerName: undefined,
        sharedOwnerEmail: undefined,
        sharedRole: undefined,
        sharedMembersCount: undefined
      };
      onVehicleUpdated(updatedVehicle);
      setCurrentSharedGarage(null);
      onShowToast('Condivisione revocata con successo', 'info');
    } catch (err) {
      onShowToast('Errore durante la revoca', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl w-full max-w-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto font-['Plus_Jakarta_Sans',sans-serif] animate-in zoom-in-95 duration-150"
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
            aria-label="Chiudi finestra"
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all cursor-pointer backdrop-blur-sm"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Badge PRO */}
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 text-[11px] font-black tracking-wide uppercase shadow-md shadow-amber-500/20">
              <Crown className="w-3.5 h-3.5 fill-slate-950" />
              <span>Funzione PRO</span>
            </span>
            <span className="text-xs text-indigo-200 font-medium">
              Multi-Account Live Sync
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white leading-snug flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-400" />
            Garage Condiviso Famiglia
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-md">
            Sincronizza l'auto con il partner o coniuge in tempo reale. Entrambi potete consultare e inserire spese, rifornimenti e tagliandi.
          </p>
        </div>

        {/* TAB SELECTOR */}
        <div className="flex border-b border-slate-200 bg-slate-50/80 p-2 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('share')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'share'
                ? 'bg-white text-indigo-600 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Share2 className="w-4 h-4" />
            <span>Condividi la tua Auto</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('join')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'join'
                ? 'bg-white text-indigo-600 shadow-sm border border-slate-200'
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
                    Sblocca la Sincronizzazione Multi-Account
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Nel piano PRO puoi condividere e gestire l'auto insieme su due o più smartphone con aggiornamento live bidirezionale.
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

          {/* TAB 1: SHARE CAR */}
          {activeTab === 'share' && (
            <div className="space-y-6">
              {/* Vehicle selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Seleziona il veicolo da condividere
                </label>
                <select
                  value={selectedVehicleId}
                  onChange={(e) => setSelectedVehicleId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 font-semibold text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                >
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.brand} {v.model} ({v.plate}) {v.isShared ? '• Già condivisa' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* State A: Already Shared */}
              {currentShareCode ? (
                <div className="space-y-5">
                  {/* Status Banner */}
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="relative">
                        <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                        <div className="w-3 h-3 bg-emerald-500 rounded-full animate-ping absolute inset-0 opacity-75" />
                      </div>
                      <div>
                        <span className="text-xs font-black uppercase tracking-wider text-emerald-800 block">
                          Sincronizzazione Live Attiva
                        </span>
                        <span className="text-xs text-emerald-700 font-medium">
                          I dati inseriti da qualsiasi account verranno sincronizzati automaticamente.
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Share Code Card */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-center space-y-3">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                      Codice di Sincronizzazione Monouso / Famiglia
                    </span>
                    <div className="inline-flex items-center justify-center gap-3 px-6 py-3 rounded-2xl bg-white border-2 border-indigo-200 shadow-sm">
                      <span className="font-mono text-2xl sm:text-3xl font-black text-indigo-700 tracking-widest">
                        {currentShareCode}
                      </span>
                    </div>
                    <div className="flex items-center justify-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handleCopyCode}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs transition-all cursor-pointer"
                      >
                        {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedCode ? 'Copiato!' : 'Copia Codice'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Direct Link & Share Actions */}
                  <div className="space-y-2.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                      Link diretto di invito
                    </label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        readOnly 
                        value={shareUrl}
                        className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 font-mono text-xs select-all focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleCopyLink}
                        className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
                      >
                        {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        <span>{copiedLink ? 'Copiato' : 'Copia Link'}</span>
                      </button>
                    </div>
                    
                    <button
                      type="button"
                      onClick={handleShareWhatsApp}
                      className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Condividi su WhatsApp con il Partner</span>
                    </button>
                  </div>

                  {/* Connected Accounts List */}
                  {currentSharedGarage?.members && currentSharedGarage.members.length > 0 && (
                    <div className="border-t border-slate-100 pt-4 space-y-2">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                        Account Connessi ({currentSharedGarage.members.length})
                      </span>
                      <div className="space-y-1.5">
                        {currentSharedGarage.members.map((m, idx) => (
                          <div 
                            key={m.uid || idx} 
                            className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                                {m.name ? m.name.charAt(0).toUpperCase() : 'U'}
                              </div>
                              <div>
                                <span className="font-bold text-slate-800 block">
                                  {m.name || m.email || 'Utente Connesso'}
                                  {m.uid === userAccount.id && ' (Tu)'}
                                </span>
                                <span className="text-[11px] text-slate-500">
                                  {m.email || 'Account sincronizzato'}
                                </span>
                              </div>
                            </div>
                            <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold uppercase">
                              {m.role === 'owner' ? 'Proprietario' : 'Coniuge / Membro'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Revoke / Interrompi Condivisione (Riservato all'Amministratore) */}
                  {(() => {
                    const isGarageAdmin = !currentVehicle?.sharedRole || currentVehicle.sharedRole === 'owner' || (currentSharedGarage && currentSharedGarage.ownerId === userAccount.id);
                    return isGarageAdmin ? (
                      <div className="pt-3 border-t border-slate-150 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-rose-50/70 p-3.5 rounded-2xl border border-rose-200">
                        <div className="flex items-start gap-2.5">
                          <ShieldCheck className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
                          <div>
                            <span className="text-xs font-black text-rose-950 block">
                              Gestione Amministratore
                            </span>
                            <span className="text-[11px] text-rose-800 leading-tight">
                              Hai creato tu questo codice di condivisione. Puoi interrompere la condivisione per tutti gli account connessi in qualsiasi momento.
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          id="btn-revoke-shared-garage-admin"
                          onClick={handleRevokeShare}
                          disabled={isLoading}
                          className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-xs active:scale-95"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Interrompi Condivisione</span>
                        </button>
                      </div>
                    ) : (
                      <div className="pt-3 border-t border-slate-150 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                        <span className="text-xs text-slate-600 leading-tight">
                          Sei connesso come membro. La revoca globale è riservata all'amministratore ({currentSharedGarage?.ownerName || currentVehicle?.sharedOwnerName || 'creatore'}).
                        </span>
                        <button
                          type="button"
                          onClick={handleRevokeShare}
                          disabled={isLoading}
                          className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0"
                        >
                          <span>Scollega dal mio account</span>
                        </button>
                      </div>
                    );
                  })()}
                </div>
              ) : (
                /* State B: Not yet shared */
                <div className="text-center py-6 px-4 bg-slate-50/70 border border-dashed border-slate-200 rounded-2xl space-y-4">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-inner">
                    <Share2 className="w-7 h-7" />
                  </div>
                  <div className="max-w-md mx-auto">
                    <h3 className="text-base font-bold text-slate-900">
                      Condividi {currentVehicle?.brand} {currentVehicle?.model}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
                      Genera un link o un codice di accoppiamento per permettere al partner di vedere e registrare rifornimenti, spese e tagliandi in tempo reale dal suo account.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleCreateShare}
                    disabled={isLoading}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
                  >
                    {isLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Share2 className="w-4 h-4" />
                    )}
                    <span>Attiva Sincronizzazione Live</span>
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
                    Inserisci il codice fornito dal proprietario del veicolo (es. <span className="font-mono font-bold text-indigo-600">GARAGE-7B3K</span>)
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
                      <Car className="w-4 h-4" />
                      Veicolo Trovato
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black">
                      Pronto per la Sincronizzazione
                    </span>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-indigo-100 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                      <Car className="w-6 h-6" />
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
                      <span>Tutti i rifornimenti e le spese inserite si sincronizzeranno in tempo reale.</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Lo storico tagliandi e documenti rimarrà accessibile da entrambi gli account.</span>
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
            <span>Crittografia end-to-end Firebase Firestore</span>
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
    </div>
  );
};
