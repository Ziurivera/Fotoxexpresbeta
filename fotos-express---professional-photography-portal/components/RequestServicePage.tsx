
import React, { useState } from 'react';
import { AppView } from '../types';

interface RequestServicePageProps {
  onNavigate: (view: AppView) => void;
}

type ServiceType = 'boda' | 'sesion_privada' | 'evento_social' | 'corporativo';

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

const RequestServicePage: React.FC<RequestServicePageProps> = ({ onNavigate }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    tipo: 'sesion_privada' as ServiceType,
    locacion: 'exterior',
    fecha: '',
    horas: '2',
    personas: '1',
    descripcion: '',
    nombre: '',
    telefono: '',
    countryCode: '+1',
    email: ''
  });

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Solicitud enviada con éxito. Nuestro administrador revisará los detalles para contactarte al ${formData.countryCode} ${formData.telefono}.`);
    onNavigate(AppView.LANDING);
  };

  return (
    <div className="max-w-4xl mx-auto py-32 px-6">
      <div className="text-center mb-16">
        <h2 className="text-6xl font-black italic uppercase tracking-tighter mb-4 neon-glow-primary">Solicitar Cotización</h2>
        <p className="text-text-tertiary text-xs font-black uppercase tracking-[0.3em] mb-8">Cuéntanos sobre tu visión para darte el mejor precio</p>
        
        {/* Progress Bar */}
        <div className="flex items-center justify-center gap-4 max-w-xs mx-auto">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex-1 h-1.5 rounded-full overflow-hidden bg-white/5 border border-white/5">
              <div className={`h-full bg-gradient-logo transition-all duration-500 ${step >= i ? 'w-full' : 'w-0'}`}></div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-background-card p-10 sm:p-16 rounded-[3.5rem] border border-white/5 shadow-2xl relative overflow-hidden animate-fade-in">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-logo opacity-50"></div>

        {step === 1 && (
          <div className="space-y-10 animate-fade-in">
            <h3 className="text-3xl font-black uppercase italic text-center">¿Qué tipo de evento capturaremos?</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { id: 'boda', label: 'Boda / Wedding', icon: 'favorite', desc: 'Cobertura completa del gran día' },
                { id: 'sesion_privada', label: 'Sesión Privada', icon: 'person', desc: 'Retrato, Branding, Parejas' },
                { id: 'evento_social', label: 'Evento Social', icon: 'celebration', desc: 'Cumpleaños, Quinceañeros, Fiestas' },
                { id: 'corporativo', label: 'Corporativo', icon: 'business_center', desc: 'Lanzamientos, Conferencias, Marcas' }
              ].map((type) => (
                <button 
                  key={type.id}
                  onClick={() => { setFormData({...formData, tipo: type.id as ServiceType}); nextStep(); }}
                  className={`group p-8 rounded-[2.5rem] border text-left transition-all hover:scale-[1.02] ${formData.tipo === type.id ? 'bg-primary/10 border-primary shadow-lg shadow-primary/10' : 'bg-background-input border-white/5 hover:border-primary/40'}`}
                >
                  <span className={`material-symbols-outlined text-4xl mb-4 ${formData.tipo === type.id ? 'text-primary' : 'text-text-tertiary group-hover:text-primary transition-colors'}`}>{type.icon}</span>
                  <h4 className="text-xl font-black uppercase italic leading-none mb-1">{type.label}</h4>
                  <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">{type.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-10 animate-fade-in">
            <h3 className="text-3xl font-black uppercase italic text-center">Detalles de Tiempo y Alcance</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-[11px] font-black text-text-tertiary uppercase tracking-[0.2em] ml-2">Fecha Estimada</label>
                <input 
                  type="date" 
                  value={formData.fecha}
                  onChange={(e) => setFormData({...formData, fecha: e.target.value})}
                  className="w-full bg-background-input border border-white/5 rounded-2xl px-6 py-5 text-white outline-none focus:border-primary transition-all font-bold" 
                />
              </div>
              <div className="space-y-4">
                <label className="text-[11px] font-black text-text-tertiary uppercase tracking-[0.2em] ml-2">Duración (Horas)</label>
                <div className="flex gap-2">
                  {['2', '4', '6', '8+'].map(h => (
                    <button 
                      key={h}
                      onClick={() => setFormData({...formData, horas: h})}
                      className={`flex-1 py-5 rounded-2xl border text-sm font-black transition-all ${formData.horas === h ? 'bg-primary text-background border-primary' : 'bg-background-input border-white/5 text-text-tertiary'}`}
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-4 md:col-span-2">
                <label className="text-[11px] font-black text-text-tertiary uppercase tracking-[0.2em] ml-2">Cantidad de Personas Aproximada</label>
                <div className="flex gap-2 flex-wrap">
                  {['1-2', '3-10', '10-50', '50-100', '100+'].map(p => (
                    <button 
                      key={p}
                      onClick={() => setFormData({...formData, personas: p})}
                      className={`px-6 py-4 rounded-2xl border text-[11px] font-black transition-all ${formData.personas === p ? 'bg-secondary text-white border-secondary shadow-lg shadow-secondary/20' : 'bg-background-input border-white/5 text-text-tertiary'}`}
                    >
                      {p} PERSONAS
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-4 pt-6">
              <button onClick={prevStep} className="flex-1 bg-white/5 text-white font-black py-5 rounded-2xl hover:bg-white/10 transition-all uppercase tracking-widest text-[11px]">VOLVER</button>
              <button onClick={nextStep} disabled={!formData.fecha} className="flex-[2] bg-white text-background font-black py-5 rounded-2xl hover:scale-105 transition-all uppercase tracking-widest text-[11px] disabled:opacity-50">CONTINUAR A LOCACIÓN</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-10 animate-fade-in">
            <h3 className="text-3xl font-black uppercase italic text-center">Ambiente y Visión</h3>
            <div className="space-y-6">
              <label className="text-[11px] font-black text-text-tertiary uppercase tracking-[0.2em] ml-2 block text-center">Preferencia de Locación</label>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { id: 'exterior', icon: 'forest', label: 'Exterior' },
                  { id: 'estudio', icon: 'camera', label: 'Estudio' },
                  { id: 'interior', icon: 'home', label: 'Interior' }
                ].map(loc => (
                  <button 
                    key={loc.id}
                    onClick={() => setFormData({...formData, locacion: loc.id})}
                    className={`flex flex-col items-center gap-3 p-6 rounded-[2rem] border transition-all ${formData.locacion === loc.id ? 'bg-primary/10 border-primary text-primary' : 'bg-background-input border-white/5 text-text-tertiary'}`}
                  >
                    <span className="material-symbols-outlined text-3xl">{loc.icon}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest">{loc.label}</span>
                  </button>
                ))}
              </div>
              <div className="space-y-4 pt-4">
                <label className="text-[11px] font-black text-text-tertiary uppercase tracking-[0.2em] ml-2">Descripción del Servicio / Lugar específico</label>
                <textarea 
                  rows={4} 
                  value={formData.descripcion}
                  onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                  placeholder="Ej: Boda en El Morro, San Juan. Buscamos un estilo cinematográfico y fotos espontáneas..." 
                  className="w-full bg-background-input border border-white/5 rounded-3xl px-8 py-6 text-white outline-none focus:border-primary resize-none font-medium text-sm leading-relaxed" 
                />
              </div>
            </div>
            <div className="flex gap-4">
              <button onClick={prevStep} className="flex-1 bg-white/5 text-white font-black py-5 rounded-2xl hover:bg-white/10 transition-all uppercase tracking-widest text-[11px]">VOLVER</button>
              <button onClick={nextStep} className="flex-[2] bg-white text-background font-black py-5 rounded-2xl hover:scale-105 transition-all uppercase tracking-widest text-[11px]">FINALIZAR CONTACTO</button>
            </div>
          </div>
        )}

        {step === 4 && (
          <form className="space-y-10 animate-fade-in" onSubmit={handleSubmit}>
            <h3 className="text-3xl font-black uppercase italic text-center">Información de Contacto</h3>
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[11px] font-black text-text-tertiary uppercase tracking-[0.2em] ml-2">Nombre Completo</label>
                <input 
                  type="text" 
                  required
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  placeholder="Tu nombre aquí" 
                  className="w-full bg-background-input border border-white/5 rounded-2xl px-8 py-5 text-white outline-none focus:border-primary font-bold" 
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-text-tertiary uppercase tracking-[0.2em] ml-2">Número de Teléfono</label>
                  <div className="flex gap-2">
                    <select 
                      value={formData.countryCode}
                      onChange={(e) => setFormData({...formData, countryCode: e.target.value})}
                      className="bg-background-input border border-white/5 rounded-2xl px-3 text-white text-xs font-bold outline-none focus:border-primary cursor-pointer appearance-none"
                    >
                      {countryCodes.map(c => (
                        <option key={c.code} value={c.code}>{c.code} ({c.country})</option>
                      ))}
                    </select>
                    <input 
                      type="tel" 
                      required
                      value={formData.telefono}
                      onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                      placeholder="787-000-0000" 
                      className="flex-1 bg-background-input border border-white/5 rounded-2xl px-8 py-5 text-white outline-none focus:border-primary font-bold" 
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-text-tertiary uppercase tracking-[0.2em] ml-2">Correo Electrónico</label>
                  <input 
                    type="email" 
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="ejemplo@correo.com" 
                    className="w-full bg-background-input border border-white/5 rounded-2xl px-8 py-5 text-white outline-none focus:border-primary font-bold" 
                  />
                </div>
              </div>
            </div>
            
            <div className="p-6 bg-primary/5 rounded-3xl border border-primary/20 flex gap-4 items-start">
              <span className="material-symbols-outlined text-primary">info</span>
              <p className="text-[10px] font-bold text-text-secondary uppercase leading-relaxed tracking-wider">
                Al enviar esta solicitud, nuestro equipo analizará la complejidad, equipo necesario y fecha para asignarte un fotógrafo del staff. Recibirás un correo y una llamada con la propuesta formal.
              </p>
            </div>

            <div className="flex gap-4 pt-6">
              <button type="button" onClick={prevStep} className="flex-1 bg-white/5 text-white font-black py-5 rounded-2xl hover:bg-white/10 transition-all uppercase tracking-widest text-[11px]">VOLVER</button>
              <button type="submit" className="flex-[2] bg-gradient-logo text-background font-black py-6 rounded-2xl shadow-2xl shadow-primary/30 hover:scale-[1.03] transition-all uppercase tracking-[0.2em] text-xs">ENVIAR SOLICITUD DE COTIZACIÓN</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default RequestServicePage;
