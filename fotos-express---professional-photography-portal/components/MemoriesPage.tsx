
import React, { useState, useEffect, useCallback } from 'react';
import { AppView } from '../types';
import { ExtendedClientLead } from '../App';

interface MemoriesPageProps {
  onNavigate: (view: AppView) => void;
  clientLeads: ExtendedClientLead[];
}

type SearchState = 'idle' | 'searching' | 'not_registered' | 'pending' | 'ready';

const countryCodes = [
  { code: '+1', country: 'PR/US' },
  { code: '+1-809', country: 'DO' },
  { code: '+52', country: 'MX' },
  { code: '+34', country: 'ES' },
  { code: '+57', country: 'CO' },
];

const MemoriesPage: React.FC<MemoriesPageProps> = ({ onNavigate, clientLeads }) => {
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+1');
  const [searchState, setSearchState] = useState<SearchState>('idle');
  const [countdown, setCountdown] = useState(10);
  const [activeLead, setActiveLead] = useState<ExtendedClientLead | null>(null);
  
  // Lightbox State
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handleSearch = () => {
    setSearchState('searching');
    setTimeout(() => {
      const foundLead = clientLeads.find(l => l.telefono === phone);
      
      if (foundLead) {
        setActiveLead(foundLead);
        if (foundLead.status === 'atendido') {
          setSearchState('ready');
        } else {
          setSearchState('pending');
        }
      } else {
        setSearchState('not_registered');
        setCountdown(10);
      }
    }, 1500);
  };

  useEffect(() => {
    let timer: number;
    if (searchState === 'not_registered' && countdown > 0) {
      timer = window.setInterval(() => setCountdown(c => c - 1), 1000);
    } else if (searchState === 'not_registered' && countdown === 0) {
      onNavigate(AppView.CLIENT_REGISTRATION);
    }
    return () => clearInterval(timer);
  }, [searchState, countdown, onNavigate]);

  const nextImage = useCallback(() => {
    if (activeLead?.fotosSubidas && selectedIndex !== null) {
      setSelectedIndex((prev) => (prev! + 1) % activeLead.fotosSubidas!.length);
    }
  }, [activeLead, selectedIndex]);

  const prevImage = useCallback(() => {
    if (activeLead?.fotosSubidas && selectedIndex !== null) {
      setSelectedIndex((prev) => (prev! - 1 + activeLead.fotosSubidas!.length) % activeLead.fotosSubidas!.length);
    }
  }, [activeLead, selectedIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIndex === null) return;
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'Escape') setSelectedIndex(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, nextImage, prevImage]);

  // Pantalla de Fotos Listas
  if (searchState === 'ready' && activeLead) {
    return (
      <div className="px-4 sm:px-10 py-28 sm:py-36 animate-fade-in max-w-7xl mx-auto">
        <header className="flex flex-col sm:flex-row justify-between items-center sm:items-end gap-8 mb-16 sm:mb-24">
          <div className="text-center sm:text-left space-y-4">
            <h2 className="text-6xl sm:text-8xl font-black italic uppercase tracking-tighter leading-none">HOLA, <span className="neon-glow-primary">{activeLead.nombre.split(' ')[0]}</span></h2>
            <div className="flex items-center justify-center sm:justify-start gap-3">
              <span className="w-3 h-3 rounded-full bg-success animate-pulse"></span>
              <p className="text-[10px] sm:text-sm font-black uppercase tracking-[0.4em] text-text-secondary">Tus fotos están: <span className="text-success">LISTAS HD</span></p>
            </div>
          </div>
          <button className="w-full sm:w-auto bg-white text-background font-black px-12 py-5 sm:py-6 rounded-2xl flex items-center justify-center gap-4 text-[11px] sm:text-xs uppercase tracking-[0.3em] shadow-[0_20px_40px_rgba(255,255,255,0.1)] hover:scale-105 active:scale-95 transition-all">
            <span className="material-symbols-outlined text-2xl font-bold">cloud_download</span>
            DESCARGAR ÁLBUM COMPLETO
          </button>
        </header>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-8">
          {(activeLead.fotosSubidas || []).map((url, idx) => (
            <div 
              key={idx} 
              onClick={() => setSelectedIndex(idx)}
              className="group relative aspect-[3/4] overflow-hidden rounded-[2.5rem] bg-background-card border border-white/5 transition-all hover:border-primary/50 shadow-lg cursor-pointer"
            >
              <img src={url} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt={`Capture ${idx}`} />
              <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all p-6 flex flex-col justify-end">
                <div className="w-full bg-primary text-background font-black py-4 rounded-2xl text-[10px] uppercase tracking-widest flex items-center justify-center gap-2">
                   <span className="material-symbols-outlined text-sm">zoom_in</span>
                   AMPLIAR
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Fullscreen Slider (Lightbox) */}
        {selectedIndex !== null && activeLead.fotosSubidas && (
          <div 
            className="fixed inset-0 z-[200] bg-background/98 backdrop-blur-3xl flex items-center justify-center p-4 sm:p-10 animate-fade-in select-none"
            onClick={() => setSelectedIndex(null)}
          >
            {/* Botón Cerrar (X) - Superior Derecha Accesible */}
            <button 
              onClick={(e) => { e.stopPropagation(); setSelectedIndex(null); }}
              className="fixed top-8 right-8 w-16 h-16 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-error transition-all active:scale-90 z-[210] shadow-2xl border border-white/10"
              aria-label="Cerrar visor"
            >
              <span className="material-symbols-outlined text-4xl">close</span>
            </button>

            {/* Navegación: Atrás */}
            <button 
              onClick={(e) => { e.stopPropagation(); prevImage(); }}
              className="absolute left-4 sm:left-10 w-16 h-16 sm:w-24 sm:h-24 flex items-center justify-center text-white/20 hover:text-primary transition-all active:scale-75 z-[210]"
              aria-label="Foto anterior"
            >
              <span className="material-symbols-outlined text-5xl sm:text-7xl">chevron_left</span>
            </button>

            {/* Contenedor de Imagen Central */}
            <div className="relative w-full max-w-4xl h-full flex flex-col items-center justify-center gap-6 z-[205]" onClick={(e) => e.stopPropagation()}>
              <img 
                src={activeLead.fotosSubidas[selectedIndex]} 
                className="max-w-full max-h-[70vh] object-contain rounded-3xl sm:rounded-[4rem] shadow-[0_0_120px_rgba(103,181,230,0.15)] border border-white/5 animate-fade-in" 
                alt="Fullscreen" 
              />
              
              <div className="flex flex-col items-center gap-6 w-full px-4">
                <div className="bg-white/5 border border-white/10 px-8 py-3 rounded-full flex items-center gap-4 backdrop-blur-md">
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-text-tertiary">Tu Recuerdo</span>
                  <span className="text-xl font-black italic text-primary">{selectedIndex + 1} / {activeLead.fotosSubidas.length}</span>
                </div>
                
                <div className="flex flex-wrap justify-center gap-4 w-full">
                  <button 
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = activeLead.fotosSubidas![selectedIndex!];
                      link.download = `Recuerdo-${selectedIndex! + 1}.jpg`;
                      link.click();
                    }}
                    className="bg-white text-background font-black px-10 py-4 rounded-2xl text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-xl flex items-center gap-3"
                  >
                    <span className="material-symbols-outlined text-lg">download</span>
                    GUARDAR HD
                  </button>

                  <button 
                    onClick={() => setSelectedIndex(null)}
                    className="bg-white/5 border border-white/10 text-white font-black px-10 py-4 rounded-2xl text-[10px] uppercase tracking-widest hover:bg-error hover:text-white transition-all shadow-xl flex items-center gap-3"
                  >
                    <span className="material-symbols-outlined text-lg">close</span>
                    CERRAR VISOR
                  </button>
                </div>
              </div>
            </div>

            {/* Navegación: Adelante */}
            <button 
              onClick={(e) => { e.stopPropagation(); nextImage(); }}
              className="absolute right-4 sm:right-10 w-16 h-16 sm:w-24 sm:h-24 flex items-center justify-center text-white/20 hover:text-primary transition-all active:scale-75 z-[210]"
              aria-label="Siguiente foto"
            >
              <span className="material-symbols-outlined text-5xl sm:text-7xl">chevron_right</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  // Pantalla de Fotos en Proceso (Pending)
  if (searchState === 'pending') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-24 px-4 pb-12 animate-fade-in">
        <div className="w-full max-w-md bg-background-card p-12 sm:p-16 rounded-[4rem] border border-secondary/20 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-secondary/50"></div>
          
          <div className="relative w-28 h-28 mx-auto mb-10">
            <div className="absolute inset-0 bg-secondary/10 rounded-full animate-ping"></div>
            <div className="relative w-full h-full bg-secondary/20 rounded-full flex items-center justify-center border border-secondary/30">
              <span className="material-symbols-outlined text-secondary text-5xl animate-spin-slow">auto_fix_high</span>
            </div>
          </div>

          <h2 className="text-3xl font-black uppercase italic mb-6 tracking-tighter leading-none">
            FOTOS EN <br />
            <span className="text-secondary">PROCESO</span>
          </h2>
          
          <div className="space-y-6 mb-12">
            <p className="text-white font-black uppercase text-[12px] tracking-widest">
              ¡Hola {activeLead?.nombre.split(' ')[0]}! Hemos localizado tu registro.
            </p>
            <p className="text-text-secondary leading-relaxed font-bold uppercase text-[10px] tracking-[0.2em] px-4">
              Aun sus fotos se están editando, coteje de nuevo en las próximas horas o espere a que nuestro equipo le notifique por WhatsApp.
            </p>
          </div>

          <button onClick={() => onNavigate(AppView.LANDING)} className="w-full bg-white text-background font-black py-5 rounded-2xl uppercase tracking-widest text-[11px] hover:scale-105 active:scale-95 transition-all shadow-xl">
            ENTENDIDO
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center pt-24 px-4 pb-12">
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        
        {searchState === 'not_registered' ? (
          <div className="bg-background-card p-12 sm:p-16 rounded-[4rem] border border-error/20 text-center shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-error/50"></div>
            <div className="w-24 h-24 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-10">
              <span className="material-symbols-outlined text-error text-6xl">no_accounts</span>
            </div>
            <h2 className="text-3xl font-black uppercase italic mb-4 tracking-tighter">SESIÓN NO ENCONTRADA</h2>
            <p className="text-text-secondary text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] leading-relaxed mb-12 px-2">
              El número <span className="text-white">{countryCode} {phone}</span> no aparece en nuestro sistema.
            </p>
            <button onClick={() => onNavigate(AppView.CLIENT_REGISTRATION)} className="w-full bg-white text-background font-black py-5 rounded-2xl uppercase tracking-widest text-[11px] hover:scale-105 transition-all shadow-xl">
              IR A REGISTRO AHORA
            </button>
          </div>
        ) : (
          <div className="bg-background-card p-10 sm:p-14 rounded-[4rem] border border-white/5 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-logo"></div>
            <div className="text-center mb-14">
              <h2 className="text-6xl sm:text-7xl font-black italic uppercase tracking-tighter mb-4 leading-none">MIS <span className="neon-glow-primary">FOTOS</span></h2>
              <p className="text-text-tertiary text-[10px] font-black uppercase tracking-[0.5em] opacity-60">Acceso Seguro con tu Móvil</p>
            </div>
            
            <div className="space-y-8">
              <div className="flex gap-2 h-16 sm:h-20">
                <div className="relative shrink-0">
                  <select 
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="h-full bg-background-input border border-white/5 rounded-3xl px-4 text-white text-[11px] font-black outline-none focus:border-primary min-w-[85px] text-center transition-all cursor-pointer appearance-none"
                  >
                    {countryCodes.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
                  </select>
                </div>
                <input 
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="000-0000"
                  className="flex-1 h-full bg-background-input border border-white/5 rounded-3xl px-8 text-white outline-none focus:border-primary font-bold text-xl tracking-[0.2em] transition-all"
                />
              </div>
              
              <button 
                onClick={handleSearch}
                disabled={searchState === 'searching' || phone.length < 7}
                className="w-full bg-primary text-background font-black h-16 sm:h-24 rounded-[2rem] sm:rounded-3xl flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-primary/20 disabled:opacity-50 uppercase tracking-[0.4em] text-[11px] sm:text-xs"
              >
                {searchState === 'searching' ? <span className="material-symbols-outlined animate-spin text-3xl">sync</span> : 'VER MI GALERÍA HD'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemoriesPage;
