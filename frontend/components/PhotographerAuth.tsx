
import React, { useState } from 'react';
import { AppView } from '../types';

interface PhotographerAuthProps {
  onNavigate: (view: AppView) => void;
}

const countryCodes = [
  { code: '+1', country: 'PR/US' },
  { code: '+1-809', country: 'DO' },
  { code: '+52', country: 'MX' },
  { code: '+34', country: 'ES' },
];

const PhotographerAuth: React.FC<PhotographerAuthProps> = ({ onNavigate }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  
  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  
  // Form State for Registration
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    phone: '',
    countryCode: '+1',
    experiencia: '',
    equipo: ''
  });

  const handleStaffLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Credenciales de staff: staff@fotosexpress.com / Fotosexpress@
    if (loginEmail === 'staff@fotosexpress.com' && loginPassword === 'Fotosexpress@') {
      onNavigate(AppView.PHOTOGRAPHER_DASHBOARD);
    } else {
      alert('Credenciales de staff incorrectas. Por favor, verifique su email y contraseña.');
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === 'Fotosexpress2026$') {
      onNavigate(AppView.ADMIN);
    } else {
      // ALERTA ESPECÍFICA SOLICITADA
      alert('Contraseña incorrecta, intentar de nuevo.');
      setAdminPassword(''); // Limpiar para re-intento
    }
  };

  const isStep1Valid = formData.nombre && formData.apellido && formData.email && formData.phone && formData.experiencia && formData.equipo;

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center bg-[radial-gradient(circle_at_top,#1A1A2E,transparent)]">
        <div className="max-w-md bg-background-card p-12 rounded-[3.5rem] border border-white/5 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-logo opacity-50"></div>
          
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-10 animate-bounce">
            <span className="material-symbols-outlined text-6xl text-primary drop-shadow-[0_0_15px_rgba(103,181,230,1)]">verified</span>
          </div>
          
          <h2 className="text-3xl font-black uppercase italic mb-6 tracking-tighter leading-none">
            PORTAFOLIO EN <span className="text-primary">REVISIÓN</span>
          </h2>
          
          <div className="space-y-4 mb-12">
            <p className="text-white font-black uppercase text-[12px] tracking-widest">
              Hemos recibido tu solicitud correctamente.
            </p>
            <p className="text-text-secondary leading-relaxed font-bold uppercase text-[10px] tracking-[0.2em] px-4">
              Nuestro equipo la evaluará y te notificará cuando estés listo para comenzar a atender clientes.
            </p>
          </div>

          <button 
            onClick={() => onNavigate(AppView.LANDING)} 
            className="w-full bg-white text-background font-black py-6 rounded-2xl hover:scale-[1.03] active:scale-95 transition-all uppercase tracking-[0.3em] text-[11px] shadow-2xl"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-32 px-6 flex items-center justify-center bg-[radial-gradient(circle_at_bottom,#0F1122,transparent)]">
      <div className="max-w-xl w-full bg-background-card p-12 rounded-[3.5rem] border border-white/5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-logo"></div>
        
        {!isAdminLogin ? (
          <>
            <div className="text-center mb-12">
              <h2 className="text-5xl font-black italic uppercase tracking-tighter mb-3">
                {isLogin ? 'Ingreso Staff' : 'Unirse al Staff'}
              </h2>
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                <p className="text-text-tertiary text-[10px] font-black uppercase tracking-[0.3em]">
                  {isLogin ? 'Panel de Fotógrafos' : 'Registro de Talento Pro'}
                </p>
              </div>
              
              {!isLogin && (
                <div className="flex justify-center gap-2 mt-6">
                  {[1, 2, 3].map(i => (
                    <div key={i} className={`h-1 rounded-full transition-all duration-500 ${step === i ? 'w-8 bg-primary' : 'w-4 bg-white/10'}`}></div>
                  ))}
                </div>
              )}
            </div>

            {isLogin ? (
              <form className="space-y-5" onSubmit={handleStaffLogin}>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-text-tertiary uppercase tracking-widest ml-1 block">Email Profesional</label>
                  <input 
                    type="email" 
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="staff@fotosexpress.com" 
                    className="w-full bg-background-input border border-white/5 rounded-2xl px-8 py-5 text-white outline-none focus:border-primary transition-all font-bold" 
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-text-tertiary uppercase tracking-widest ml-1 block">Contraseña</label>
                  <input 
                    type="password" 
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••" 
                    className="w-full bg-background-input border border-white/5 rounded-2xl px-8 py-5 text-white outline-none focus:border-primary transition-all font-bold tracking-[0.3em]" 
                  />
                </div>
                <button type="submit" className="w-full bg-gradient-logo text-background font-black py-6 rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-[0.2em] text-xs mt-4">INGRESAR A TRABAJAR</button>
                
                <div className="flex flex-col items-center gap-5 pt-10 border-t border-white/5 mt-8">
                  <button type="button" onClick={() => setIsLogin(false)} className="group flex items-center gap-3">
                    <span className="text-[10px] font-black text-text-tertiary uppercase group-hover:text-white transition-colors tracking-widest">¿No tienes cuenta?</span>
                    <span className="text-[10px] font-black text-secondary uppercase group-hover:underline tracking-widest">Regístrate aquí</span>
                  </button>
                  <button type="button" onClick={() => setIsAdminLogin(true)} className="flex items-center gap-3 px-8 py-3 rounded-full bg-white/5 text-[9px] font-black text-text-tertiary uppercase hover:bg-white/10 hover:text-primary transition-all tracking-[0.3em] border border-transparent hover:border-primary/20">
                    <span className="material-symbols-outlined text-[16px]">security</span>
                    Acceso Administrativo
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-8 animate-fade-in">
                {step === 1 && (
                  <div className="space-y-5">
                    <div className="grid grid-cols-2 gap-5">
                      <input 
                        type="text" 
                        required
                        value={formData.nombre}
                        onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                        placeholder="Nombre" 
                        className="bg-background-input border border-white/5 rounded-2xl px-8 py-5 text-white outline-none focus:border-secondary transition-all font-bold" 
                      />
                      <input 
                        type="text" 
                        required
                        value={formData.apellido}
                        onChange={(e) => setFormData({...formData, apellido: e.target.value})}
                        placeholder="Apellido" 
                        className="bg-background-input border border-white/5 rounded-2xl px-8 py-5 text-white outline-none focus:border-secondary transition-all font-bold" 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-text-tertiary uppercase tracking-widest ml-1">Email Profesional (Requerido)</label>
                      <input 
                        type="email" 
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        placeholder="email@ejemplo.com" 
                        className="w-full bg-background-input border border-white/5 rounded-2xl px-8 py-5 text-white outline-none focus:border-secondary transition-all font-bold" 
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-text-tertiary uppercase tracking-widest ml-1">WhatsApp / Celular (Requerido)</label>
                      <div className="flex gap-2">
                        <select 
                          value={formData.countryCode}
                          onChange={(e) => setFormData({...formData, countryCode: e.target.value})}
                          className="bg-background-input border border-white/5 rounded-2xl px-4 text-white font-bold outline-none appearance-none"
                        >
                          {countryCodes.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
                        </select>
                        <input 
                          type="tel" 
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          placeholder="787-000-0000" 
                          className="flex-1 bg-background-input border border-white/5 rounded-2xl px-8 py-5 text-white outline-none focus:border-secondary transition-all font-bold" 
                        />
                      </div>
                    </div>

                    <textarea 
                      required
                      value={formData.experiencia}
                      onChange={(e) => setFormData({...formData, experiencia: e.target.value})}
                      placeholder="Describe tu experiencia profesional..." 
                      className="w-full bg-background-input border border-white/5 rounded-2xl px-8 py-5 text-white min-h-[120px] outline-none focus:border-secondary transition-all font-bold resize-none" 
                    />
                    
                    <input 
                      type="text" 
                      required
                      value={formData.equipo}
                      onChange={(e) => setFormData({...formData, equipo: e.target.value})}
                      placeholder="Equipo Fotográfico Principal" 
                      className="w-full bg-background-input border border-white/5 rounded-2xl px-8 py-5 text-white outline-none focus:border-secondary transition-all font-bold" 
                    />

                    <button 
                      onClick={() => setStep(2)} 
                      disabled={!isStep1Valid}
                      className="w-full bg-white text-background font-black py-5 rounded-2xl hover:scale-105 transition-all text-xs uppercase tracking-[0.2em] mt-4 shadow-xl disabled:opacity-30 disabled:hover:scale-100"
                    >
                      CORROBORAR INFORMACIÓN
                    </button>
                    <button onClick={() => setIsLogin(true)} className="w-full text-[10px] font-black text-text-tertiary uppercase text-center pt-2 tracking-widest hover:text-white transition-colors">Ya soy del staff</button>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-10 animate-fade-in py-4">
                    <div className="text-center space-y-4">
                      <h3 className="text-2xl font-black uppercase italic tracking-tighter">¿Tus datos son <span className="text-primary">correctos</span>?</h3>
                      <p className="text-[10px] text-text-tertiary uppercase tracking-widest font-bold px-8 leading-relaxed">
                        Es vital que el Email y WhatsApp sean exactos para notificarte sobre tus pagos y clientes asignados.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="bg-background-input/50 p-8 rounded-3xl border border-white/5 flex flex-col gap-6 relative group overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                          <span className="material-symbols-outlined text-6xl">verified_user</span>
                        </div>
                        
                        <div className="space-y-1">
                          <p className="text-[9px] font-black text-text-tertiary uppercase tracking-widest">Email de Contacto</p>
                          <p className="text-xl font-bold text-white break-all">{formData.email}</p>
                        </div>

                        <div className="space-y-1">
                          <p className="text-[9px] font-black text-text-tertiary uppercase tracking-widest">WhatsApp / Celular</p>
                          <p className="text-xl font-bold text-primary tracking-widest">{formData.countryCode} {formData.phone}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <button onClick={() => setStep(1)} className="flex-1 bg-white/5 text-white font-black py-5 rounded-2xl hover:bg-white/10 transition-all text-[11px] uppercase tracking-widest">EDITAR</button>
                      <button onClick={() => setStep(3)} className="flex-[2] bg-primary text-background font-black py-5 rounded-2xl shadow-xl hover:scale-105 transition-all text-[11px] uppercase tracking-widest">DATOS CORRECTOS</button>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-8 animate-fade-in">
                    <div className="text-center space-y-3">
                      <p className="text-sm font-black uppercase text-secondary tracking-widest">Validación de Calidad</p>
                      <p className="text-[10px] text-text-tertiary uppercase tracking-widest font-bold">Sube 5 fotos que representen tu mejor trabajo</p>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="aspect-square bg-background-input border-2 border-dashed border-white/5 rounded-[2rem] flex items-center justify-center text-text-tertiary hover:border-secondary hover:text-secondary cursor-pointer transition-all group overflow-hidden">
                          <span className="material-symbols-outlined text-4xl group-hover:scale-125 group-hover:rotate-12 transition-all">add_a_photo</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-4 pt-4">
                      <button onClick={() => setStep(2)} className="flex-1 bg-white/5 text-white font-black py-5 rounded-2xl hover:bg-white/10 transition-all text-[11px] uppercase tracking-widest">VOLVER</button>
                      <button onClick={() => setSubmitted(true)} className="flex-[2] bg-gradient-logo text-background font-black py-5 rounded-2xl shadow-xl hover:scale-105 transition-all text-[11px] uppercase tracking-widest">SOMETER SOLICITUD</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="animate-fade-in py-6">
            <div className="text-center mb-12">
              <div className="w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-primary/20">
                <span className="material-symbols-outlined text-primary text-6xl drop-shadow-[0_0_15px_rgba(103,181,230,0.8)]">admin_panel_settings</span>
              </div>
              <h2 className="text-5xl font-black italic uppercase tracking-tighter mb-4">Panel Maestro</h2>
              <p className="text-text-tertiary text-[11px] font-black uppercase tracking-[0.4em]">Control de Gestión Fotos Express</p>
            </div>
            <form onSubmit={handleAdminLogin} className="space-y-8">
              <div className="space-y-4">
                <label className="text-[11px] font-black text-text-tertiary uppercase tracking-[0.3em] block text-center">Contraseña Administrativa</label>
                <input 
                  type="password" 
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full bg-background-input border border-white/5 rounded-[2rem] px-8 py-6 text-white outline-none focus:border-primary text-center font-bold text-2xl tracking-[0.6em] shadow-inner transition-all" 
                />
              </div>
              <button type="submit" className="w-full bg-white text-background font-black py-6 rounded-[2rem] hover:scale-[1.03] transition-all uppercase tracking-[0.3em] text-xs shadow-2xl">VERIFICAR IDENTIDAD</button>
              <button type="button" onClick={() => setIsAdminLogin(false)} className="w-full text-[11px] font-black text-text-tertiary uppercase text-center pt-6 tracking-widest hover:text-white transition-colors">Volver a Staff Login</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotographerAuth;
