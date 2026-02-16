
import React, { useState } from 'react';
import { AppView } from '../types';

interface NavbarProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { label: 'MIS FOTOS', view: AppView.MEMORIES, color: 'cyan' },
    { label: 'PORTAFOLIO', view: AppView.PORTFOLIO, color: 'violet' },
    { label: 'SERVICIOS', view: AppView.REQUEST_SERVICE, color: 'cyan' },
  ];

  const handleNavigate = (view: AppView) => {
    onNavigate(view);
    setIsMenuOpen(false);
  };

  return (
    <>
      <header className="fixed top-0 z-[60] w-full border-b border-white/5 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-20 sm:h-24 flex items-center justify-between">
          {/* Logo Section */}
          <div 
            className="flex items-center gap-3 sm:gap-4 cursor-pointer group" 
            onClick={() => handleNavigate(AppView.LANDING)}
          >
            <div className="relative w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center">
              <img 
                src="https://raw.githubusercontent.com/lucas-labs/assets/main/fotos-express-logo.png" 
                alt="Logo" 
                className="w-full h-full object-contain logo-shimmer"
              />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xs sm:text-sm font-black tracking-tighter text-white uppercase italic leading-none">FOTOS</h1>
              <h1 className="text-xs sm:text-sm font-black tracking-tighter text-primary uppercase italic leading-none">EXPRESS</h1>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-10">
            {navLinks.map((link) => (
              <button 
                key={link.label}
                onClick={() => handleNavigate(link.view)} 
                className={`text-[10px] font-black uppercase tracking-[0.3em] transition-all relative py-2 ${currentView === link.view ? 'text-primary' : 'text-text-secondary hover:text-white'}`}
              >
                {link.label}
                {currentView === link.view && (
                  <span className="absolute bottom-0 left-0 w-full h-[2px] bg-primary rounded-full animate-fade-in"></span>
                )}
              </button>
            ))}
          </nav>

          {/* Desktop Staff Access */}
          <div className="hidden lg:flex items-center gap-4">
            <button 
              onClick={() => handleNavigate(AppView.PHOTOGRAPHER_AUTH)}
              className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-text-secondary hover:text-primary hover:border-primary/40 transition-all"
            >
              Portal Staff
            </button>
          </div>

          {/* Mobile Hamburger Button */}
          <button 
            onClick={() => setIsMenuOpen(true)}
            className="lg:hidden w-12 h-12 flex items-center justify-center text-white bg-white/5 rounded-2xl border border-white/10 active:scale-90 transition-transform z-[65]"
            aria-label="Menu"
          >
            <span className="material-symbols-outlined text-3xl">menu</span>
          </button>
        </div>
      </header>

      {/* Mobile Fullscreen Neon Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gradient-to-b from-black via-[#050A14] to-black backdrop-blur-3xl animate-fade-in">
          
          {/* Neon Glow Atmospheric Background */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(103,181,230,0.1),transparent_70%)] pointer-events-none"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(157,123,234,0.05),transparent_60%)] pointer-events-none"></div>

          {/* Close Button (X) */}
          <button 
            onClick={() => setIsMenuOpen(false)}
            className="absolute top-8 right-8 w-14 h-14 flex items-center justify-center text-primary hover:text-white transition-all active:scale-90 z-[110]"
          >
            <span className="material-symbols-outlined text-4xl font-light">close</span>
          </button>

          {/* Menu Options Group */}
          <div className="relative flex flex-col gap-8 w-full max-w-[300px]">
            {navLinks.map((link, idx) => (
              <button
                key={link.label}
                onClick={() => handleNavigate(link.view)}
                className={`
                  w-full py-6 rounded-[2rem] text-lg font-black uppercase tracking-[0.25em] italic
                  border transition-all duration-300 active:scale-95
                  ${link.color === 'cyan' 
                    ? 'border-primary/40 bg-primary/5 text-primary shadow-[0_0_25px_rgba(103,181,230,0.15)] hover:bg-primary/10 hover:shadow-[0_0_40px_rgba(103,181,230,0.3)]' 
                    : 'border-secondary/40 bg-secondary/5 text-secondary shadow-[0_0_25px_rgba(157,123,234,0.15)] hover:bg-secondary/10 hover:shadow-[0_0_40px_rgba(157,123,234,0.3)]'
                  }
                  ${currentView === link.view ? 'scale-105 brightness-125 border-opacity-100' : 'opacity-90'}
                `}
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                {link.label}
              </button>
            ))}

            {/* Subtle Divider */}
            <div className="w-12 h-px bg-white/10 mx-auto my-2"></div>

            {/* Portal Staff Accessory */}
            <button 
              onClick={() => handleNavigate(AppView.PHOTOGRAPHER_AUTH)}
              className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 hover:text-primary transition-colors py-4 text-center"
            >
              PORTAL DE FOTÓGRAFOS
            </button>
          </div>

          {/* Branding Bottom */}
          <div className="absolute bottom-12 flex flex-col items-center gap-3 opacity-20 pointer-events-none">
            <img src="https://raw.githubusercontent.com/lucas-labs/assets/main/fotos-express-logo.png" alt="Logo" className="w-6 h-6 object-contain grayscale" />
            <p className="text-[8px] font-black text-white uppercase tracking-[0.6em]">Premium Puerto Rico</p>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
