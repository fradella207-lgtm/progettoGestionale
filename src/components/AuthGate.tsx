import React, { useState } from 'react';
import { 
  Car, 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  ShieldCheck, 
  ArrowRight,
  Globe,
  KeyRound,
  CheckCircle2,
  Sparkles,
  Zap,
  Fuel,
  Wrench,
  Gauge,
  Copy,
  Check,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { UserAccount } from '../types';
import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} from '../firebase';

interface AuthGateProps {
  onLoginSuccess: (account: UserAccount) => void;
}

export const AuthGate: React.FC<AuthGateProps> = ({ onLoginSuccess }) => {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // States
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isUnauthorizedDomain, setIsUnauthorizedDomain] = useState(false);
  const [copiedDomain, setCopiedDomain] = useState(false);

  const isApkMode = typeof window !== 'undefined' && (
    window.location.hostname === 'localhost' ||
    window.location.protocol === 'capacitor:' ||
    window.location.protocol === 'file:'
  );

  // Quick Tester / Demo Login for testing the APK immediately without hurdles
  const handleGuestLogin = () => {
    const guestUser: UserAccount = {
      id: `tester_${Date.now()}`,
      name: 'Tester Android',
      email: 'tester@my360garage.local',
      plan: 'Pro Garage Cloud (Firebase)',
      syncStatus: 'synced',
      memberSince: 'Settembre 2026',
      provider: 'email',
      isLoggedIn: true
    };
    setSuccessMessage('Accesso come Tester avviato!');
    setTimeout(() => {
      onLoginSuccess(guestUser);
    }, 400);
  };

  // Handle Google Sign-In with Firebase Auth
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    setIsUnauthorizedDomain(false);

    try {
      googleProvider.setCustomParameters({
        prompt: 'select_account'
      });
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      const googleUser: UserAccount = {
        id: user.uid,
        name: user.displayName || (user.email ? user.email.split('@')[0] : 'Utente Google'),
        email: user.email || '',
        plan: 'Pro Garage Cloud (Firebase)',
        syncStatus: 'synced',
        memberSince: 'Agosto 2026',
        provider: 'google',
        isLoggedIn: true,
        avatarUrl: user.photoURL || undefined
      };

      try {
        if (user.email) {
          localStorage.setItem(`auth_provider_for_${user.email.toLowerCase()}`, 'google');
        }
      } catch (e) {}

      setSuccessMessage('Accesso eseguito con successo!');
      setTimeout(() => {
        onLoginSuccess(googleUser);
      }, 500);
    } catch (err: any) {
      console.warn('Firebase Google Auth error / cancel:', err);
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        setErrorMessage('Selezione account Google annullata.');
      } else if (err.code === 'auth/popup-blocked') {
        setErrorMessage('La finestra popup per Google è stata bloccata dal browser. Consenti i popup per accedere.');
      } else if (err.code === 'auth/account-exists-with-different-credential') {
        setErrorMessage('Questa email è già registrata con password. Accedi inserendo la tua password nella scheda "Accedi" per evitare account duplicati.');
      } else if (err.code === 'auth/unauthorized-domain' || err.message?.includes('unauthorized-domain')) {
        setIsUnauthorizedDomain(true);
        setErrorMessage(null);
      } else {
        setErrorMessage(err.message || 'Accesso con Google non riuscito. Riprova.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Classic Email/Password Login
  const handleClassicLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password.trim()) {
      setErrorMessage('Inserisci indirizzo email e password.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('La password deve contenere almeno 6 caratteri.');
      return;
    }

    // Check if this email was previously authenticated via Google
    try {
      const knownProvider = localStorage.getItem(`auth_provider_for_${cleanEmail}`);
      if (knownProvider === 'google') {
        setErrorMessage('Questa email risulta registrata tramite Account Google. Clicca su "Continua con Google" per accedere al tuo garage senza creare account duplicati.');
        return;
      }
    } catch (e) {}

    setIsLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, password);
      const user = userCredential.user;
      const derivedName = cleanEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

      const loggedUser: UserAccount = {
        id: user.uid,
        name: user.displayName || name.trim() || derivedName || 'Utente Garage',
        email: user.email || cleanEmail,
        plan: 'Pro Garage Cloud (Firebase)',
        syncStatus: 'synced',
        memberSince: 'Agosto 2026',
        provider: 'email',
        isLoggedIn: true
      };

      try {
        localStorage.setItem(`auth_provider_for_${cleanEmail}`, 'email');
      } catch (e) {}

      setSuccessMessage('Accesso effettuato con successo!');
      setTimeout(() => {
        onLoginSuccess(loggedUser);
      }, 500);
    } catch (err: any) {
      console.warn('Firebase Email Auth:', err.code, err.message);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        setErrorMessage('Credenziali non valide. Se ti sei registrato in precedenza con Google, clicca su "Continua con Google". Altrimenti controlla l\'indirizzo email e la password digitata.');
      } else if (err.code === 'auth/account-exists-with-different-credential') {
        setErrorMessage('Questa email è registrata tramite Google. Clicca su "Continua con Google" per accedere.');
      } else if (err.code === 'auth/too-many-requests') {
        setErrorMessage('Troppi tentativi falliti. Attendi qualche minuto o reimposta la password.');
      } else {
        setErrorMessage(err.message || 'Errore durante l\'accesso. Verifica le credenziali inserite.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Classic Register
  const handleClassicRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!name.trim()) {
      setErrorMessage('Inserisci il tuo nome e cognome.');
      return;
    }

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMessage('Inserisci un indirizzo email valido.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('La password deve avere almeno 6 caratteri.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Le password non coincidono.');
      return;
    }

    // Check if user already logged in with Google using this email
    try {
      const knownProvider = localStorage.getItem(`auth_provider_for_${cleanEmail}`);
      if (knownProvider === 'google') {
        setErrorMessage('Questa email è già associata a un Account Google! Clicca su "Continua con Google" per entrare nel tuo garage ed evitare account duplicati.');
        return;
      }
    } catch (e) {}

    setIsLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
      const user = userCredential.user;

      const newUser: UserAccount = {
        id: user.uid,
        name: name.trim(),
        email: user.email || cleanEmail,
        plan: 'Pro Garage Cloud (Firebase)',
        syncStatus: 'synced',
        memberSince: 'Agosto 2026',
        provider: 'email',
        isLoggedIn: true
      };

      try {
        localStorage.setItem(`auth_provider_for_${cleanEmail}`, 'email');
      } catch (e) {}

      setSuccessMessage('Account creato con successo! Accesso effettuato.');
      setTimeout(() => {
        onLoginSuccess(newUser);
      }, 500);
    } catch (err: any) {
      console.warn('Firebase register:', err.code, err.message);
      if (err.code === 'auth/email-already-in-use') {
        setErrorMessage('Questa email è già registrata! Se avevi effettuato l\'accesso con Google in precedenza, clicca su "Continua con Google". Se avevi già una password, passa alla scheda "Accedi".');
      } else if (err.code === 'auth/invalid-email') {
        setErrorMessage('Indirizzo email non valido.');
      } else if (err.code === 'auth/weak-password') {
        setErrorMessage('La password è troppo semplice. Usa almeno 6 caratteri.');
      } else {
        setErrorMessage(err.message || 'Impossibile completare la registrazione.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0b0f17] text-[#0f172a] font-['Plus_Jakarta_Sans',sans-serif] flex flex-col justify-center items-center p-3 sm:p-6 lg:p-8 relative overflow-hidden">
      
      {/* AMBIENT BACKGROUND GLOW */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md flex flex-col gap-4 relative z-10 animate-in fade-in zoom-in-95 duration-200">
        
        {/* MAIN AUTH CARD WITH DEDICATED COVER SECTION */}
        <div className="bg-white rounded-3xl border border-slate-800/80 shadow-2xl overflow-hidden flex flex-col">
          
          {/* COVER HERO BANNER WITH NEW LOGO */}
          <div className="relative bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white p-6 sm:p-7 flex flex-col items-center text-center overflow-hidden border-b border-slate-800">
            {/* Background lighting */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-blue-600/25 blur-3xl rounded-full pointer-events-none" />

            {/* Official App Logo Cover Badge */}
            <div className="relative group mb-3">
              <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-3xl p-1 bg-gradient-to-tr from-blue-600 via-indigo-500 to-sky-400 shadow-xl shadow-blue-500/20 flex items-center justify-center">
                <img 
                  src="/logo.png" 
                  alt="My360Garage" 
                  className="w-full h-full rounded-[20px] object-cover bg-slate-900"
                />
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center justify-center gap-1.5">
              My360Garage
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xs leading-relaxed font-medium">
              Gestione veicolo: consumi, rifornimenti, manutenzioni e scadenze
            </p>

            <div className="inline-flex items-center gap-1.5 mt-2.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[11px] font-semibold text-slate-200 backdrop-blur-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Versione Ufficiale • Web & Mobile</span>
            </div>
          </div>

          {/* CARD BODY WITH AUTH CONTROLS */}
          <div className="p-6 sm:p-7 flex flex-col gap-4.5 bg-white">
            
            {/* TAB TOGGLE: LOGIN / REGISTER */}
            <div className="flex items-center p-1 bg-[#f1f5f9] rounded-xl">
              <button
                type="button"
                id="tab-login-btn"
                onClick={() => {
                  setAuthMode('login');
                  setErrorMessage(null);
                }}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  authMode === 'login'
                    ? 'bg-white text-[#2563eb] shadow-xs'
                    : 'text-[#64748b] hover:text-[#0f172a]'
                }`}
              >
                Accedi
              </button>
              <button
                type="button"
                id="tab-register-btn"
                onClick={() => {
                  setAuthMode('register');
                  setErrorMessage(null);
                }}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  authMode === 'register'
                    ? 'bg-white text-[#2563eb] shadow-xs'
                    : 'text-[#64748b] hover:text-[#0f172a]'
                }`}
              >
                Crea Account
              </button>
            </div>

            {/* FEEDBACK NOTICES */}
            {isUnauthorizedDomain && (
              <div className="p-4 bg-amber-50/90 border border-amber-300 rounded-2xl flex flex-col gap-3 text-xs text-amber-950 animate-in fade-in zoom-in-98 duration-150 shadow-xs">
                <div className="flex items-start gap-2.5">
                  <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-black text-amber-950 text-sm block">
                      {window.location.hostname === 'localhost' ? 'App Android (APK): autorizzazione Firebase richiesta' : 'Dominio web da autorizzare su Firebase'}
                    </span>
                    <p className="text-amber-900/90 text-xs mt-0.5 leading-relaxed">
                      {window.location.hostname === 'localhost' ? (
                        <>Sull'app Android (APK), il WebView esegue su <code>localhost</code>. Per utilizzare il pulsante Google, aggiungi <strong>localhost</strong> nei Domini autorizzati di Firebase, oppure <strong>accedi subito con Email e Password</strong> (100% funzionante senza configurazioni).</>
                      ) : (
                        <>Google richiede che questo dominio sia inserito tra i <strong>Domini autorizzati</strong> della console Firebase del progetto (<code>subtle-well-504509-q0</code>).</>
                      )}
                    </p>
                  </div>
                </div>

                <div className="bg-white p-2.5 rounded-xl border border-amber-200/80 flex items-center justify-between gap-2 shadow-2xs">
                  <div className="min-w-0 font-mono text-[11px] text-slate-800 font-bold truncate">
                    {window.location.hostname}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.hostname);
                      setCopiedDomain(true);
                      setTimeout(() => setCopiedDomain(false), 2500);
                    }}
                    className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg font-bold text-[11px] flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                    title="Copia negli appunti"
                  >
                    {copiedDomain ? <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedDomain ? 'Copiato!' : 'Copia'}</span>
                  </button>
                </div>

                <div className="space-y-1 text-[11px] text-amber-900/90 bg-amber-100/50 p-2.5 rounded-xl border border-amber-200/50">
                  <span className="font-bold block text-amber-950">Come risolvere su Firebase Console:</span>
                  <p>1. Vai su <strong>Authentication</strong> → <strong>Impostazioni</strong> → <strong>Domini autorizzati</strong>.</p>
                  <p>2. Clicca <strong>Aggiungi dominio</strong> e incolla <code>{window.location.hostname}</code> (oppure <code>run.app</code>).</p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-0.5">
                  <a
                    href="https://console.firebase.google.com/project/subtle-well-504509-q0/authentication/settings"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 px-3 bg-slate-900 hover:bg-slate-800 active:scale-98 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all text-center shadow-xs"
                  >
                    <span>Apri Console Firebase</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setIsUnauthorizedDomain(false);
                      setAuthMode('login');
                    }}
                    className="py-2 px-3 bg-white border border-amber-300 hover:bg-amber-100 text-amber-950 rounded-xl text-xs font-bold transition-colors cursor-pointer text-center"
                  >
                    Accedi subito con Email
                  </button>
                </div>
              </div>
            )}

            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-xs text-red-700 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-xs text-emerald-700 font-bold">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* GOOGLE SIGN-IN BUTTON */}
            <button
              type="button"
              id="btn-login-with-google"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full bg-white hover:bg-slate-50 text-[#0f172a] border border-[#cbd5e1] font-bold text-sm py-3 px-4 rounded-xl transition-all shadow-xs flex items-center justify-center gap-3 cursor-pointer hover:border-slate-400 active:scale-[0.99] disabled:opacity-50"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>{isLoading ? 'Accesso in corso...' : 'Continua con Google'}</span>
            </button>

            {/* DIVIDER */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-[#e2e8f0]"></div>
              <span className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-wider">
                oppure con email
              </span>
              <div className="flex-1 h-px bg-[#e2e8f0]"></div>
            </div>

            {/* EMAIL/PASSWORD FORM */}
            {authMode === 'login' ? (
              <form onSubmit={handleClassicLogin} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#0f172a] uppercase tracking-wider">
                    Indirizzo Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="input-login-email"
                      type="email"
                      required
                      placeholder="nome@esempio.it"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded-xl pl-10 pr-3.5 py-2.5 text-sm focus:outline-none focus:border-[#2563eb] focus:bg-white transition-colors"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#0f172a] uppercase tracking-wider">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="input-login-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded-xl pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:border-[#2563eb] focus:bg-white transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  id="btn-login-submit"
                  disabled={isLoading}
                  className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-extrabold text-sm py-3 px-4 rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] disabled:opacity-50 mt-1"
                >
                  <span>{isLoading ? 'Verifica credenziali...' : 'Accedi al Tuo Garage'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
            <form onSubmit={handleClassicRegister} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#0f172a] uppercase tracking-wider">
                  Nome e Cognome
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="input-register-name"
                    type="text"
                    required
                    placeholder="Es. Mario Rossi"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded-xl pl-10 pr-3.5 py-2.5 text-sm focus:outline-none focus:border-[#2563eb] focus:bg-white transition-colors"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#0f172a] uppercase tracking-wider">
                  Indirizzo Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="input-register-email"
                    type="email"
                    required
                    placeholder="nome@esempio.it"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded-xl pl-10 pr-3.5 py-2.5 text-sm focus:outline-none focus:border-[#2563eb] focus:bg-white transition-colors"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#0f172a] uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="input-register-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Minimo 6 caratteri"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded-xl pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:border-[#2563eb] focus:bg-white transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#0f172a] uppercase tracking-wider">
                  Conferma Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="input-register-confirm-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Ripeti la password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded-xl pl-10 pr-3.5 py-2.5 text-sm focus:outline-none focus:border-[#2563eb] focus:bg-white transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                id="btn-register-submit"
                disabled={isLoading}
                className="w-full bg-[#059669] hover:bg-emerald-700 text-white font-extrabold text-sm py-3 px-4 rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] disabled:opacity-50 mt-1"
              >
                <span>{isLoading ? 'Creazione account...' : 'Registrati e Accedi'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* QUICK TESTER ACCESS FOR APK / EVALUATION */}
          <div className="pt-2 pb-1 border-t border-slate-100 flex flex-col items-center">
            <button
              type="button"
              id="btn-guest-tester"
              onClick={handleGuestLogin}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 hover:underline flex items-center gap-1.5 py-1 transition-colors cursor-pointer"
            >
              <span>🧪 Vuoi solo provare l'app? Entra subito come Tester Locale</span>
            </button>
          </div>

          </div>
        </div>

        {/* SECURITY & CLOUD HIGHLIGHTS FOOTER */}
        <div className="grid grid-cols-2 gap-3 text-[11px] text-slate-400">
          <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-2xl flex items-center gap-2.5 shadow-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Accesso protetto & Cloud Firebase</span>
          </div>
          <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-2xl flex items-center gap-2.5 shadow-sm">
            <Globe className="w-4 h-4 text-blue-400 shrink-0" />
            <span>Sincronizzazione dati in tempo reale</span>
          </div>
        </div>

      </div>

    </div>
  );
};
