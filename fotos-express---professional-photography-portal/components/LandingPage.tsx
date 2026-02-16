
import React from 'react';
import { AppView } from '../types';

interface LandingPageProps {
  onNavigate: (view: AppView) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  return (
    <div className="pb-24">
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center text-center px-4 sm:px-8 pt-24 overflow-hidden">
        {/* Background Atmosphere */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-[-5%] left-1/2 -translate-x-1/2 w-full max-w-[1400px] h-[600px] bg-primary/10 rounded-full blur-[140px] opacity-60"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[120px]"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background"></div>
        </div>

        {/* Experience Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full bg-white/[0.03] border border-white/10 text-primary text-[8px] sm:text-[10px] font-black uppercase tracking-[0.4em] mb-10 animate-fade-in backdrop-blur-xl">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary"></span>
          </span>
          Servicios en toda la Isla
        </div>

        {/* Dynamic Typography Hero */}
        <div className="animate-fade-in select-none mb-16 sm:mb-24" style={{ animationDelay: '0.2s' }}>
          <h1 className="text-[16vw] sm:text-[11rem] lg:text-[13rem] font-black tracking-tighter uppercase italic leading-[0.8] transition-all">
            <span className="text-white drop-shadow-2xl">FOTOS</span><br />
            <span className="neon-glow-primary">EXPRESS</span>
          </h1>
        </div>

        {/* Primary Action Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 w-full max-w-7xl mx-auto animate-fade-in px-2 mb-8" style={{ animationDelay: '0.4s' }}>
          
          {/* Action: Mis Fotos */}
          <button 
            onClick={() => onNavigate(AppView.MEMORIES)}
            className="group relative w-full aspect-[16/7] md:aspect-auto md:h-[300px] bg-primary rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-10 flex flex-row items-center justify-between hover:scale-[1.02] transition-all duration-500 shadow-2xl shadow-primary/20 overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:scale-125 transition-all duration-700 pointer-events-none">
               <span className="material-symbols-outlined text-[6rem] sm:text-[10rem] text-background font-thin">collections</span>
            </div>
            <div className="text-left relative z-10">
              <h3 className="font-black text-xl sm:text-4xl lg:text-5xl text-background uppercase italic tracking-tighter leading-none mb-1 sm:mb-2">MIS FOTOS</h3>
              <p className="text-[7px] sm:text-[10px] font-black text-background/50 uppercase tracking-[0.2em]">Acceso a tu Galería HD</p>
            </div>
            <div className="w-12 h-12 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-background flex items-center justify-center shadow-xl shrink-0 group-hover:rotate-[-5deg] transition-transform">
               <span className="material-symbols-outlined text-xl sm:text-4xl text-primary font-bold">download</span>
            </div>
          </button>

          {/* Action: Registro Cliente */}
          <button 
            onClick={() => onNavigate(AppView.CLIENT_REGISTRATION)}
            className="group relative w-full aspect-[16/7] md:aspect-auto md:h-[300px] bg-background-card border border-white/10 rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-10 flex flex-row items-center justify-between hover:border-primary/40 transition-all duration-500 shadow-2xl overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-125 transition-all duration-700 pointer-events-none">
               <span className="material-symbols-outlined text-[6rem] sm:text-[10rem]">face</span>
            </div>
            <div className="text-left relative z-10">
              <h3 className="font-black text-xl sm:text-4xl lg:text-5xl text-white uppercase italic tracking-tighter leading-none mb-1 sm:mb-2">REGISTRO</h3>
              <p className="text-[7px] sm:text-[10px] font-black text-text-tertiary uppercase tracking-[0.2em]">Verificación rápida y segura</p>
            </div>
            <div className="w-12 h-12 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-white/5 flex items-center justify-center border border-white/10 shrink-0 group-hover:rotate-[5deg] transition-transform">
               <span className="material-symbols-outlined text-xl sm:text-4xl text-primary font-bold">camera_front</span>
            </div>
          </button>
        </div>

        {/* Secondary Action Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 w-full max-w-7xl mx-auto animate-fade-in px-2" style={{ animationDelay: '0.5s' }}>
          
          {/* Action: Servicios */}
          <button 
            onClick={() => onNavigate(AppView.REQUEST_SERVICE)}
            className="group relative w-full aspect-[16/6] lg:aspect-square bg-background-card border border-white/10 rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 flex flex-row lg:flex-col items-center lg:items-start justify-between lg:justify-end hover:border-primary/30 transition-all duration-500 shadow-2xl overflow-hidden"
          >
            <div className="text-left relative z-10">
              <h3 className="font-black text-lg sm:text-2xl lg:text-3xl text-white uppercase italic tracking-tighter leading-none mb-1">SERVICIOS</h3>
              <p className="text-[7px] sm:text-[9px] font-black text-text-tertiary uppercase tracking-[0.2em]">Cotiza tu sesión fácilmente</p>
            </div>
            <div className="w-10 h-10 lg:w-16 lg:h-16 lg:absolute lg:top-8 lg:left-8 rounded-xl lg:rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 shrink-0 group-hover:scale-110 transition-transform">
               <span className="material-symbols-outlined text-lg lg:text-3xl text-primary/80">calendar_month</span>
            </div>
          </button>

          {/* Action: Portafolio */}
          <button 
            onClick={() => onNavigate(AppView.PORTFOLIO)}
            className="group relative w-full aspect-[16/6] lg:aspect-square bg-background-card border border-white/10 rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 flex flex-row lg:flex-col items-center lg:items-start justify-between lg:justify-end hover:border-secondary/40 transition-all duration-500 shadow-2xl overflow-hidden"
          >
            <div className="text-left relative z-10">
              <h3 className="font-black text-lg sm:text-2xl lg:text-3xl text-white uppercase italic tracking-tighter leading-none mb-1">PORTAFOLIO</h3>
              <p className="text-[7px] sm:text-[9px] font-black text-text-tertiary uppercase tracking-[0.2em]">Descubre nuestro trabajo</p>
            </div>
            <div className="w-10 h-10 lg:w-16 lg:h-16 lg:absolute lg:top-8 lg:left-8 rounded-xl lg:rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 shrink-0 group-hover:scale-110 transition-transform">
               <span className="material-symbols-outlined text-lg lg:text-3xl text-secondary/80">auto_awesome</span>
            </div>
          </button>

          {/* Action: Fotógrafos */}
          <button 
            onClick={() => onNavigate(AppView.PHOTOGRAPHER_AUTH)}
            className="group relative w-full aspect-[16/6] lg:aspect-square bg-secondary/10 border border-secondary/20 rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 flex flex-row lg:flex-col items-center lg:items-start justify-between lg:justify-end hover:bg-secondary/20 transition-all duration-500 shadow-2xl overflow-hidden sm:col-span-2 lg:col-span-1"
          >
            <div className="text-left relative z-10 pr-4 lg:pr-0">
              <h3 className="font-black text-base sm:text-xl lg:text-2xl text-secondary uppercase italic tracking-tighter leading-none mb-1">PORTAL DE FOTÓGRAFOS</h3>
              <p className="text-[7px] sm:text-[8px] lg:text-[9px] font-black text-secondary/50 uppercase tracking-[0.2em] leading-tight max-w-[150px] lg:max-w-none">Regístrate y comienza a recibir servicios</p>
            </div>
            <div className="w-10 h-10 lg:w-16 lg:h-16 lg:absolute lg:top-8 lg:left-8 rounded-xl lg:rounded-2xl bg-secondary text-background flex items-center justify-center shrink-0 group-hover:rotate-12 transition-transform shadow-lg shadow-secondary/20">
               <span className="material-symbols-outlined text-lg lg:text-3xl font-black">photo_camera</span>
            </div>
          </button>

        </div>
      </section>
    </div>
  );
};

export default LandingPage;
