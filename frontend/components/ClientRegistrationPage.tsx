
import React, { useState } from 'react';
import { AppView } from '../types';

interface ClientRegistrationPageProps {
  onNavigate: (view: AppView) => void;
}

const countryCodes = [
  { code: '+1', country: 'PR/US' },
  { code: '+1-809', country: 'DO' },
  { code: '+52', country: 'MX' },
  { code: '+34', country: 'ES' },
  { code: '+57', country: 'CO' },
  { code: '+507', country: 'PA' },
  { code: '+54', country: 'AR' },
  { code: '+56', country: 'CL' },
  { code: '+58', country: 'VE' },
  { code: '+51', country: 'PE' },
  { code: '+506', country: 'CR' },
];

const ClientRegistrationPage: React.FC<ClientRegistrationPageProps> = ({ onNavigate }) => {
  const [submitted, setSubmitted] = useState(false);
  const [countryCode, setCountryCode] = useState('+1');

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center animate-fade-in bg-[radial-gradient(circle_at_center,rgba(0,191,99,0.05)_0%,transparent_70%)]">
        <div className="max-w-md w-full bg-background-card p-10 sm:p-12 rounded-[3rem] sm:rounded-[4rem] border border-success/20 shadow-2xl relative">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-success rounded-t-full"></div>
          <div className="w-20 h-20 sm:w-24 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-8">
            <span className="material-symbols-outlined text-5xl sm:text-6xl text-success animate-pulse">verified</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black uppercase italic mb-4 tracking-tighter">¡VINCULACIÓN EXITOSA!</h2>
          <p className="text-text-secondary mb-10 font-bold uppercase text-[10px] sm:text-[11px] tracking-widest leading-relaxed px-4">
            Recibirás una notificación cuando tus fotos estén procesadas y listas para descarga HD.
          </p>
          <button onClick={() => onNavigate(AppView.LANDING)} className="w-full bg-white text-background font-black py-4 sm:py-5 rounded-2xl hover:scale-105 active:scale-95 transition-all uppercase tracking-widest text-[10px] sm:text-xs">VOLVER AL INICIO</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-12 px-4 sm:px-8 flex items-center justify-center">
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-center">
        
        {/* Intro Section */}
        <div className="lg:col-span-5 space-y-6 sm:space-y-8 text-center lg:text-left order-2 lg:order-1">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/30 text-secondary text-[9px] sm:text-[10px] font-black uppercase tracking-[0.4em]">
            Paso Requerido
          </div>
          <h2 className="text-[12vw] sm:text-7xl lg:text-[7rem] font-black italic uppercase tracking-tighter leading-[0.85] mb-6">
            REGISTRO <br />
            <span className="neon-glow-primary">CLIENTE</span>
          </h2>
          <p className="text-text-secondary font-bold uppercase text-[10px] sm:text-[12px] tracking-[0.2em] leading-relaxed max-w-sm mx-auto lg:mx-0 opacity-80">
            Regístrate para que nuestro equipo pueda filtrar tus fotos personales y entregarlas de forma segura.
          </p>
        </div>

        {/* Form Card */}
        <div className="lg:col-span-7 bg-background-card p-6 sm:p-10 lg:p-14 rounded-[2.5rem] sm:rounded-[3.5rem] lg:rounded-[4.5rem] border border-white/5 shadow-2xl relative animate-fade-in order-1 lg:order-2">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none"></div>
          
          <form className="space-y-6 sm:space-y-8" onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
              <div className="space-y-3">
                <label className="text-[9px] sm:text-[10px] font-black text-text-tertiary uppercase tracking-widest ml-2">Nombre Completo</label>
                <input type="text" required placeholder="Juan Rivera" className="w-full h-14 sm:h-18 bg-background-input border border-white/5 rounded-2xl sm:rounded-3xl px-6 sm:px-8 text-white outline-none focus:border-primary transition-all font-bold text-sm sm:text-base" />
              </div>
              <div className="space-y-3">
                <label className="text-[9px] sm:text-[10px] font-black text-text-tertiary uppercase tracking-widest ml-2">WhatsApp</label>
                <div className="flex gap-2 h-14 sm:h-18">
                  <select 
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="bg-background-input border border-white/5 rounded-2xl sm:rounded-3xl px-3 text-white text-[10px] font-black outline-none appearance-none min-w-[70px] text-center cursor-pointer"
                  >
                    {countryCodes.map(c => (
                      <option key={c.code} value={c.code}>{c.code}</option>
                    ))}
                  </select>
                  <input type="tel" required placeholder="000-0000" className="flex-1 bg-background-input border border-white/5 rounded-2xl sm:rounded-3xl px-6 sm:px-8 text-white outline-none focus:border-primary transition-all font-bold text-sm sm:text-base" />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[9px] sm:text-[10px] font-black text-text-tertiary uppercase tracking-widest ml-2">Referencia Facial (Selfie)</label>
              <div className="bg-white/[0.03] p-6 rounded-[2rem] border border-white/5 flex items-center gap-6 group">
                <div className="relative shrink-0">
                  <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full border-2 border-dashed border-primary/30 flex items-center justify-center text-text-tertiary group-hover:border-primary transition-all cursor-pointer bg-background">
                    <span className="material-symbols-outlined text-2xl sm:text-4xl group-hover:scale-110 transition-transform">add_a_photo</span>
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" />
                  </div>
                </div>
                <div className="space-y-1">
                  <h4 className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-white">Sube tu Foto</h4>
                  <p className="text-[8px] sm:text-[10px] font-bold text-text-tertiary uppercase tracking-widest leading-relaxed">
                    Utilizada por el staff para identificarte en el evento.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-background-input p-5 rounded-2xl sm:rounded-3xl border border-white/5">
              <label className="flex items-start gap-4 cursor-pointer group">
                <div className="relative mt-1">
                  <input type="checkbox" className="peer sr-only" />
                  <div className="w-5 h-5 border-2 border-white/10 rounded-lg bg-background peer-checked:bg-secondary transition-all"></div>
                  <span className="material-symbols-outlined absolute inset-0 text-white text-[10px] flex items-center justify-center opacity-0 peer-checked:opacity-100 font-bold">check</span>
                </div>
                <span className="text-[8px] sm:text-[10px] font-black uppercase text-text-tertiary group-hover:text-white transition-colors leading-relaxed tracking-wider">
                  Autorizo el uso de mis capturas en el portafolio profesional.
                </span>
              </label>
            </div>

            <button type="submit" className="w-full bg-gradient-logo text-background font-black h-16 sm:h-20 rounded-[1.5rem] sm:rounded-3xl shadow-2xl hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-[0.3em] text-[10px] sm:text-xs">
              FINALIZAR REGISTRO
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ClientRegistrationPage;
