
import React, { useState, useEffect, useCallback } from 'react';
import { AppView } from '../types';

interface PortfolioPageProps {
  onNavigate: (view: AppView) => void;
}

const PortfolioPage: React.FC<PortfolioPageProps> = ({ onNavigate }) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const photos = Array.from({ length: 15 }, (_, i) => ({
    id: `photo-${i}`,
    url: `https://picsum.photos/id/${i + 40}/1000/1250`
  }));

  const nextImage = useCallback(() => {
    if (selectedIndex !== null) {
      setSelectedIndex((prev) => (prev! + 1) % photos.length);
    }
  }, [selectedIndex, photos.length]);

  const prevImage = useCallback(() => {
    if (selectedIndex !== null) {
      setSelectedIndex((prev) => (prev! - 1 + photos.length) % photos.length);
    }
  }, [selectedIndex, photos.length]);

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

  return (
    <div className="pb-32 pt-28 sm:pt-40">
      <div className="max-w-7xl mx-auto px-6 mb-20 sm:mb-32 text-center space-y-8 animate-fade-in">
        <div className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white/[0.03] border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.5em] backdrop-blur-md">
           Standard de Excelencia Visual
        </div>
        <h2 className="text-7xl sm:text-8xl lg:text-[11rem] font-black uppercase italic leading-[0.75] tracking-tighter">
          PORT<span className="neon-glow-primary">FOLIO</span>
        </h2>
        <p className="text-text-secondary text-xs sm:text-sm max-w-2xl mx-auto font-bold uppercase tracking-[0.3em] leading-relaxed opacity-60">
          Cada captura es una narrativa visual única, procesada con los estándares más altos del caribe.
        </p>
      </div>

      {/* Grid de Portafolio */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-10">
        {photos.map((photo, index) => (
          <div 
            key={photo.id}
            onClick={() => setSelectedIndex(index)}
            className="group relative aspect-[4/5] overflow-hidden rounded-[2.5rem] sm:rounded-[3.5rem] cursor-pointer bg-background-card border border-white/5 animate-fade-in shadow-2xl"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <img 
              src={photo.url}
              className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000 ease-out"
              alt="Artistic shot"
            />
            <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center backdrop-blur-sm">
              <div className="w-16 h-16 rounded-full bg-white text-background flex items-center justify-center scale-50 group-hover:scale-100 transition-transform duration-500 shadow-2xl">
                <span className="material-symbols-outlined text-3xl font-bold">zoom_in</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CTA Sección Inferior */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 mt-40">
        <div className="bg-background-card border border-white/5 p-12 sm:p-24 rounded-[3.5rem] sm:rounded-[5rem] text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-logo"></div>
          <h3 className="text-4xl sm:text-6xl font-black mb-8 uppercase italic tracking-tighter leading-none">¿LISTO PARA <br className="sm:hidden" /> TU SESIÓN?</h3>
          <p className="text-text-secondary mb-12 max-w-xl mx-auto font-bold uppercase text-[10px] sm:text-[11px] tracking-[0.3em] leading-relaxed px-4">
            Disponibilidad limitada para eventos y sesiones exclusivas en todo Puerto Rico. Reserva tu fecha con antelación.
          </p>
          <button 
            onClick={() => onNavigate(AppView.REQUEST_SERVICE)}
            className="w-full sm:w-auto bg-white text-background font-black px-16 py-6 rounded-3xl text-xs uppercase tracking-[0.4em] hover:scale-105 active:scale-95 transition-all shadow-2xl"
          >
            SOLICITAR COTIZACIÓN VIP
          </button>
        </div>
      </div>

      {/* Fullscreen Preview: Navegable */}
      {selectedIndex !== null && (
        <div 
          className="fixed inset-0 z-[100] bg-background/98 backdrop-blur-3xl flex items-center justify-center p-4 sm:p-10 animate-fade-in select-none"
          onClick={() => setSelectedIndex(null)}
        >
          {/* Botón Cerrar (X) - Top Right */}
          <button 
            onClick={() => setSelectedIndex(null)}
            className="absolute top-8 right-8 w-14 h-14 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-error transition-all active:scale-90 z-[110]"
          >
            <span className="material-symbols-outlined text-4xl">close</span>
          </button>

          {/* Navegación: Atrás */}
          <button 
            onClick={(e) => { e.stopPropagation(); prevImage(); }}
            className="absolute left-4 sm:left-10 w-16 h-16 sm:w-24 sm:h-24 flex items-center justify-center text-white/20 hover:text-primary transition-all active:scale-75 z-[110]"
          >
            <span className="material-symbols-outlined text-5xl sm:text-7xl">chevron_left</span>
          </button>

          {/* Contenedor de Imagen */}
          <div className="relative w-full max-w-4xl h-full flex flex-col items-center justify-center gap-6 z-[105]" onClick={(e) => e.stopPropagation()}>
            <img 
              src={photos[selectedIndex].url} 
              className="max-w-full max-h-[75vh] object-contain rounded-3xl sm:rounded-[4rem] shadow-[0_0_120px_rgba(103,181,230,0.2)] border border-white/5 animate-fade-in" 
              alt="Fullscreen capture" 
            />
            
            <div className="flex flex-col items-center gap-6 w-full px-4">
              <div className="bg-white/5 border border-white/10 px-8 py-3 rounded-full flex items-center gap-4">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-text-tertiary">Obra</span>
                <span className="text-xl font-black italic text-primary">{selectedIndex + 1} / {photos.length}</span>
              </div>
              
              <button 
                onClick={() => setSelectedIndex(null)}
                className="bg-white/5 border border-white/10 text-white font-black px-12 py-4 rounded-2xl text-[10px] uppercase tracking-widest hover:bg-error hover:text-white transition-all shadow-xl flex items-center gap-3"
              >
                <span className="material-symbols-outlined text-lg">close</span>
                CERRAR GALERÍA
              </button>
            </div>
          </div>

          {/* Navegación: Adelante */}
          <button 
            onClick={(e) => { e.stopPropagation(); nextImage(); }}
            className="absolute right-4 sm:right-10 w-16 h-16 sm:w-24 sm:h-24 flex items-center justify-center text-white/20 hover:text-primary transition-all active:scale-75 z-[110]"
          >
            <span className="material-symbols-outlined text-5xl sm:text-7xl">chevron_right</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default PortfolioPage;
