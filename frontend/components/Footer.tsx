
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="border-t border-white/5 mt-20 pt-20 pb-12 bg-background-card/30 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16">
          
          <div className="md:col-span-6 space-y-8">
            <div className="flex items-center gap-4">
              <div className="relative w-12 h-12 flex items-center justify-center">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl"></div>
                <img 
                  src="https://raw.githubusercontent.com/lucas-labs/assets/main/fotos-express-logo.png" 
                  alt="Logo" 
                  className="w-full h-full object-contain relative z-10 opacity-80"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement!.innerHTML = '<span class="material-symbols-outlined text-primary text-3xl">camera_front</span>';
                  }}
                />
              </div>
              <div className="flex flex-col">
                <h1 className="text-lg font-black tracking-tighter text-white uppercase italic leading-none">FOTOS</h1>
                <h1 className="text-lg font-black tracking-tighter text-primary uppercase italic leading-none">EXPRESS</h1>
              </div>
            </div>
            <p className="text-text-tertiary text-[11px] font-bold uppercase tracking-[0.2em] leading-relaxed max-w-sm">
              Capturando la esencia de Puerto Rico a través del lente. Plataforma líder en gestión de galerías privadas y servicios fotográficos profesionales.
            </p>
            <div className="flex gap-4">
              {['instagram', 'facebook', 'youtube'].map(social => (
                <a key={social} href="#" className="w-10 h-10 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-text-tertiary hover:text-primary hover:border-primary/40 transition-all group">
                  <span className="material-symbols-outlined text-lg group-hover:scale-110 transition-transform">public</span>
                </a>
              ))}
            </div>
          </div>

          <div className="md:col-span-3 space-y-8">
            <h4 className="text-white font-black text-[10px] uppercase tracking-[0.4em] italic">Navegación</h4>
            <ul className="space-y-4">
              {['Portafolio', 'Servicios', 'Mis Fotos', 'Staff Login'].map(item => (
                <li key={item}>
                  <a href="#" className="text-text-tertiary hover:text-primary transition-all text-[11px] font-black uppercase tracking-widest flex items-center gap-2 group">
                    <span className="w-1 h-1 rounded-full bg-primary/30 group-hover:bg-primary transition-colors"></span>
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-3 space-y-8">
            <h4 className="text-white font-black text-[10px] uppercase tracking-[0.4em] italic">Contacto Oficial</h4>
            <ul className="space-y-6">
              <li className="flex items-start gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary border border-primary/10">
                  <span className="material-symbols-outlined text-lg">call</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-text-tertiary uppercase tracking-widest mb-1">Teléfono</span>
                  <a href="tel:7874458061" className="text-[11px] font-black text-white hover:text-primary transition-colors tracking-widest">787-445-8061</a>
                </div>
              </li>
              <li className="flex items-start gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-secondary/5 flex items-center justify-center text-secondary border border-secondary/10">
                  <span className="material-symbols-outlined text-lg">mail</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-text-tertiary uppercase tracking-widest mb-1">Email</span>
                  <a href="mailto:admin@fotosexpresspr.com" className="text-[11px] font-black text-white hover:text-secondary transition-colors tracking-widest">admin@fotosexpresspr.com</a>
                </div>
              </li>
              <li className="flex items-start gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-text-tertiary border border-white/5">
                  <span className="material-symbols-outlined text-lg">location_on</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-text-tertiary uppercase tracking-widest mb-1">Sede</span>
                  <span className="text-[11px] font-black text-white tracking-widest">SAN JUAN, PUERTO RICO</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-24 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] font-black text-text-tertiary uppercase tracking-[0.3em]">
            © 2025 FOTOS EXPRESS PR. DESIGNED FOR EXCELLENCE.
          </p>
          <div className="flex gap-8">
            <a href="#" className="text-[10px] font-black text-text-tertiary uppercase tracking-widest hover:text-white transition-colors">Términos</a>
            <a href="#" className="text-[10px] font-black text-text-tertiary uppercase tracking-widest hover:text-white transition-colors">Privacidad</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
