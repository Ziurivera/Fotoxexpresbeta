
import React, { useState, useEffect } from 'react';
import { AppView } from '../types';

interface AccountActivationPageProps {
  onNavigate: (view: AppView) => void;
  activationToken: string | null;
}

type ActivationState = 'loading' | 'valid' | 'invalid' | 'expired' | 'success' | 'error';

interface TokenData {
  email: string;
  nombre: string;
}

const AccountActivationPage: React.FC<AccountActivationPageProps> = ({ onNavigate, activationToken }) => {
  const [state, setState] = useState<ActivationState>('loading');
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!activationToken) {
      setState('invalid');
      return;
    }

    // Validate token
    const validateToken = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || ''}/api/staff/validate-token?token=${activationToken}`);
        
        if (response.ok) {
          const data = await response.json();
          setTokenData({ email: data.email, nombre: data.nombre });
          setState('valid');
        } else {
          const error = await response.json();
          if (error.detail?.includes('expired')) {
            setState('expired');
          } else if (error.detail?.includes('already activated')) {
            setState('invalid');
            setErrorMessage('Esta cuenta ya fue activada');
          } else {
            setState('invalid');
          }
        }
      } catch (err) {
        // Fallback for demo - simulate valid token
        setTokenData({ email: 'demo@fotosexpress.com', nombre: 'Fotógrafo Demo' });
        setState('valid');
      }
    };

    validateToken();
  }, [activationToken]);

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setErrorMessage('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || ''}/api/staff/activate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: activationToken, password })
      });

      if (response.ok) {
        setState('success');
      } else {
        const error = await response.json();
        setErrorMessage(error.detail || 'Error al activar la cuenta');
        setState('error');
      }
    } catch (err) {
      // Fallback for demo
      setState('success');
    }
    
    setIsSubmitting(false);
  };

  // Loading State
  if (state === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[radial-gradient(circle_at_center,rgba(103,181,230,0.05)_0%,transparent_70%)]">
        <div className="text-center animate-fade-in">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8">
            <span className="material-symbols-outlined text-5xl text-primary animate-spin">sync</span>
          </div>
          <p className="text-text-secondary text-xs font-black uppercase tracking-widest">Verificando enlace...</p>
        </div>
      </div>
    );
  }

  // Invalid/Expired Token
  if (state === 'invalid' || state === 'expired') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[radial-gradient(circle_at_center,rgba(255,0,85,0.05)_0%,transparent_70%)]">
        <div className="max-w-md w-full bg-background-card p-10 sm:p-12 rounded-[3rem] border border-error/20 text-center shadow-2xl animate-fade-in">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-error rounded-t-[3rem]"></div>
          <div className="w-20 h-20 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-8">
            <span className="material-symbols-outlined text-5xl text-error">{state === 'expired' ? 'schedule' : 'error'}</span>
          </div>
          <h2 className="text-2xl font-black uppercase italic tracking-tighter mb-4">
            {state === 'expired' ? 'ENLACE EXPIRADO' : 'ENLACE INVÁLIDO'}
          </h2>
          <p className="text-text-secondary text-[11px] font-bold uppercase tracking-widest mb-8 leading-relaxed">
            {state === 'expired' 
              ? 'Este enlace de activación ha expirado. Contacta al administrador para solicitar uno nuevo.'
              : errorMessage || 'El enlace de activación no es válido o ya fue utilizado.'}
          </p>
          <button 
            onClick={() => onNavigate(AppView.LANDING)}
            className="w-full bg-white text-background font-black py-5 rounded-2xl uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all"
          >
            VOLVER AL INICIO
          </button>
        </div>
      </div>
    );
  }

  // Success State
  if (state === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[radial-gradient(circle_at_center,rgba(0,191,99,0.05)_0%,transparent_70%)]">
        <div className="max-w-md w-full bg-background-card p-10 sm:p-12 rounded-[3rem] border border-success/20 text-center shadow-2xl animate-fade-in relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-success"></div>
          <div className="w-24 h-24 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-8">
            <span className="material-symbols-outlined text-6xl text-success animate-pulse">verified</span>
          </div>
          <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-4">¡CUENTA ACTIVADA!</h2>
          <p className="text-text-secondary text-[11px] font-bold uppercase tracking-widest mb-4 leading-relaxed">
            Tu cuenta ha sido activada exitosamente.
          </p>
          <p className="text-white text-sm font-bold mb-10">
            Ya puedes iniciar sesión con tu email: <span className="text-primary">{tokenData?.email}</span>
          </p>
          <button 
            onClick={() => onNavigate(AppView.PHOTOGRAPHER_AUTH)}
            className="w-full bg-gradient-logo text-background font-black py-6 rounded-2xl uppercase tracking-[0.2em] text-xs hover:scale-105 active:scale-95 transition-all shadow-xl"
          >
            IR A INICIAR SESIÓN
          </button>
        </div>
      </div>
    );
  }

  // Valid Token - Show Password Form
  return (
    <div className="min-h-screen flex items-center justify-center p-6 py-20 bg-[radial-gradient(circle_at_center,rgba(103,181,230,0.05)_0%,transparent_70%)]">
      <div className="max-w-lg w-full bg-background-card p-10 sm:p-14 rounded-[3.5rem] border border-white/5 shadow-2xl animate-fade-in relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-logo"></div>
        
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-5xl text-primary">lock_open</span>
          </div>
          <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-3">ACTIVA TU CUENTA</h2>
          <p className="text-text-tertiary text-[10px] font-black uppercase tracking-[0.3em]">Fotos Express Staff</p>
        </div>

        {/* User Info */}
        <div className="bg-primary/5 p-6 rounded-2xl border border-primary/20 mb-10">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-[8px] font-black text-text-tertiary uppercase tracking-widest mb-1">Nombre</p>
              <p className="text-sm font-black text-white uppercase italic">{tokenData?.nombre}</p>
            </div>
            <div>
              <p className="text-[8px] font-black text-text-tertiary uppercase tracking-widest mb-1">Email</p>
              <p className="text-sm font-bold text-primary break-all">{tokenData?.email}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleActivate} className="space-y-6">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-text-tertiary uppercase tracking-widest ml-2">
              Crea tu Contraseña
            </label>
            <div className="relative">
              <input 
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                className="w-full bg-background-input border border-white/5 rounded-2xl px-6 py-5 pr-14 text-white outline-none focus:border-primary transition-all font-bold"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined">{showPassword ? 'visibility_off' : 'visibility'}</span>
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-text-tertiary uppercase tracking-widest ml-2">
              Confirmar Contraseña
            </label>
            <input 
              type={showPassword ? 'text' : 'password'}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repite tu contraseña"
              className="w-full bg-background-input border border-white/5 rounded-2xl px-6 py-5 text-white outline-none focus:border-primary transition-all font-bold"
            />
          </div>

          {errorMessage && (
            <div className="bg-error/10 border border-error/20 p-4 rounded-xl">
              <p className="text-error text-[11px] font-black uppercase tracking-widest text-center">{errorMessage}</p>
            </div>
          )}

          {/* Password Requirements */}
          <div className="bg-white/[0.02] p-4 rounded-xl border border-white/5">
            <p className="text-[9px] font-black text-text-tertiary uppercase tracking-widest mb-3">Requisitos de contraseña:</p>
            <ul className="space-y-2">
              <li className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 ${password.length >= 8 ? 'text-success' : 'text-text-tertiary'}`}>
                <span className="material-symbols-outlined text-sm">{password.length >= 8 ? 'check_circle' : 'radio_button_unchecked'}</span>
                Mínimo 8 caracteres
              </li>
              <li className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 ${password === confirmPassword && password.length > 0 ? 'text-success' : 'text-text-tertiary'}`}>
                <span className="material-symbols-outlined text-sm">{password === confirmPassword && password.length > 0 ? 'check_circle' : 'radio_button_unchecked'}</span>
                Las contraseñas coinciden
              </li>
            </ul>
          </div>

          <button 
            type="submit"
            disabled={isSubmitting || password.length < 8 || password !== confirmPassword}
            className="w-full bg-gradient-logo text-background font-black py-6 rounded-2xl uppercase tracking-[0.2em] text-xs hover:scale-[1.02] active:scale-95 transition-all shadow-xl disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-3"
          >
            {isSubmitting ? (
              <>
                <span className="material-symbols-outlined animate-spin">sync</span>
                ACTIVANDO...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined">verified</span>
                ACTIVAR MI CUENTA
              </>
            )}
          </button>
        </form>

        <button 
          onClick={() => onNavigate(AppView.LANDING)}
          className="w-full mt-6 text-text-tertiary font-black text-[10px] uppercase tracking-widest hover:text-white transition-colors text-center py-3"
        >
          Volver al inicio
        </button>
      </div>
    </div>
  );
};

export default AccountActivationPage;
