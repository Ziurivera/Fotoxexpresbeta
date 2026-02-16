
import React, { useState } from 'react';
import { AppView } from '../types';
import { ExtendedClientLead } from '../App';

interface PhotographerDashboardProps {
  onNavigate: (view: AppView) => void;
  clientLeads: ExtendedClientLead[];
  onUpdateLead: (lead: ExtendedClientLead) => void;
}

const PhotographerDashboard: React.FC<PhotographerDashboardProps> = ({ onNavigate, clientLeads, onUpdateLead }) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Upload Process States
  const [uploadingToId, setUploadingToId] = useState<string | null>(null);
  const [staffEmail, setStaffEmail] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const pendingLeads = clientLeads.filter(l => l.status === 'esperando_fotos');
  const completedLeads = clientLeads.filter(l => l.status === 'atendido');

  const handleStartUpload = (clientId: string) => {
    setUploadingToId(clientId);
    setProgress(0);
    setIsUploading(false);
  };

  const handleConfirmUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffEmail || !selectedFiles || selectedFiles.length === 0) return;

    setIsUploading(true);
    
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 10;
      setProgress(currentProgress);
      if (currentProgress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          const mockPhotos = Array.from({ length: selectedFiles.length }, (_, i) => `https://picsum.photos/id/${Math.floor(Math.random() * 200) + 20}/800/1000`);
          
          const leadToUpdate = clientLeads.find(l => l.id === uploadingToId);
          if (leadToUpdate) {
            onUpdateLead({
              ...leadToUpdate,
              status: 'atendido',
              atendidoPorNombre: staffEmail,
              fotosSubidas: mockPhotos
            });
          }

          setUploadingToId(null);
          setStaffEmail('');
          setSelectedFiles(null);
          setIsUploading(false);
        }, 800);
      }
    }, 80);
  };

  return (
    <div className="flex min-h-screen bg-background relative">
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[85] lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Staff - Responsivo */}
      <aside className={`
        fixed lg:sticky top-0 left-0 z-[90] h-screen bg-background-card border-r border-white/5 
        transition-transform duration-300 ease-in-out w-64 lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-8 flex flex-col h-full">
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-3">
              <div className="bg-secondary p-1.5 rounded-lg shadow-lg shadow-secondary/20">
                <span className="material-symbols-outlined text-white font-bold">photo_camera</span>
              </div>
              <h1 className="font-black uppercase italic text-sm tracking-tighter">STAFF<br /><span className="text-secondary">DASHBOARD</span></h1>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-text-tertiary">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <nav className="flex-1 space-y-2">
            <button 
              onClick={() => { setActiveTab('pending'); setIsSidebarOpen(false); }} 
              className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl font-black text-[10px] uppercase transition-all ${activeTab === 'pending' ? 'bg-secondary text-white shadow-xl shadow-secondary/10' : 'text-text-tertiary hover:bg-white/5'}`}
            >
              <span className="material-symbols-outlined text-lg">person_search</span> Identificar ({pendingLeads.length})
            </button>
            <button 
              onClick={() => { setActiveTab('completed'); setIsSidebarOpen(false); }} 
              className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl font-black text-[10px] uppercase transition-all ${activeTab === 'completed' ? 'bg-secondary text-white shadow-xl shadow-secondary/10' : 'text-text-tertiary hover:bg-white/5'}`}
            >
              <span className="material-symbols-outlined text-lg">cloud_done</span> Entregas ({completedLeads.length})
            </button>
          </nav>

          <button onClick={() => onNavigate(AppView.LANDING)} className="mt-auto flex items-center gap-3 text-text-tertiary hover:text-error transition-colors text-[10px] font-black uppercase pt-8 border-t border-white/5">
            <span className="material-symbols-outlined">logout</span> Salir
          </button>
        </div>
      </aside>

      {/* Contenido Principal */}
      <main className="flex-1 min-w-0">
        {/* Mobile Header */}
        <div className="lg:hidden fixed top-0 w-full bg-background/80 backdrop-blur-xl border-b border-white/5 z-[80] px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary">photo_camera</span>
            <span className="font-black italic uppercase text-xs tracking-widest">Portal Staff</span>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-xl border border-white/10"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
        </div>

        <div className="p-6 md:p-16 pt-28 lg:pt-16 max-w-5xl mx-auto">
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
            <div>
              <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter leading-none mb-2">
                {activeTab === 'pending' ? 'Clientes en Espera' : 'Sesiones Entregadas'}
              </h2>
              <p className="text-text-tertiary text-[10px] font-black uppercase tracking-widest">
                {activeTab === 'pending' ? 'Registros pendientes por subir fotos' : 'Historial de trabajos finalizados'}
              </p>
            </div>
            
            {/* BOTÓN REGRESAR AL INICIO SOLICITADO */}
            <button 
              onClick={() => onNavigate(AppView.LANDING)}
              className="group flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-text-secondary hover:text-white hover:border-white/20 transition-all shadow-lg"
            >
              <span className="material-symbols-outlined text-lg">home</span>
              Regresar al Inicio
            </button>
          </header>

          <div className="grid grid-cols-1 gap-6">
            {(activeTab === 'pending' ? pendingLeads : completedLeads).map(client => (
              <div key={client.id} className="bg-background-card border border-white/5 p-6 sm:p-8 rounded-[2.5rem] flex flex-col sm:flex-row items-center justify-between gap-6 group hover:border-secondary/30 transition-all shadow-xl">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl overflow-hidden border border-white/10 bg-background-input">
                    <img 
                      src={client.fotoReferencia || `https://picsum.photos/id/${Math.floor(Math.random() * 50) + 50}/400/400`} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                      alt="Ref" 
                    />
                  </div>
                  <div className="space-y-1 text-center sm:text-left">
                    <h4 className="text-2xl font-black uppercase italic tracking-tighter leading-none">{client.nombre}</h4>
                    <p className="text-xs font-bold text-text-tertiary tracking-widest">{client.telefono}</p>
                    {client.status === 'atendido' && (
                      <span className="text-[8px] font-black text-success uppercase tracking-[0.2em] block pt-2">Entrega Finalizada HD</span>
                    )}
                  </div>
                </div>

                {activeTab === 'pending' && (
                  <button 
                    onClick={() => handleStartUpload(client.id)} 
                    className="w-full sm:w-auto bg-white text-background font-black px-10 py-5 rounded-2xl text-[10px] uppercase tracking-widest hover:bg-secondary hover:text-white transition-all shadow-xl active:scale-95"
                  >
                    SUBIR IMÁGENES
                  </button>
                )}
                
                {activeTab === 'completed' && (
                  <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center text-success border border-success/20">
                    <span className="material-symbols-outlined">check_circle</span>
                  </div>
                )}
              </div>
            ))}
            
            {(activeTab === 'pending' ? pendingLeads : completedLeads).length === 0 && (
              <div className="py-24 text-center bg-white/[0.02] rounded-[3rem] border border-dashed border-white/5">
                <span className="material-symbols-outlined text-6xl text-text-tertiary mb-4">inbox</span>
                <p className="text-[10px] font-black text-text-tertiary uppercase tracking-[0.4em]">No hay registros para mostrar</p>
              </div>
            )}
          </div>
        </div>

        {/* Modal de Carga */}
        {uploadingToId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-background/95 backdrop-blur-xl animate-fade-in">
            <div className="max-w-md w-full bg-background-card border border-white/10 p-10 rounded-[3.5rem] shadow-2xl relative">
              <button onClick={() => setUploadingToId(null)} className="absolute top-6 right-6 text-text-tertiary hover:text-white transition-all">
                <span className="material-symbols-outlined">close</span>
              </button>

              <div className="text-center mb-8">
                <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-2">Entrega de Galería</h3>
                <p className="text-text-tertiary text-[9px] font-black uppercase tracking-widest">Cliente: {clientLeads.find(l => l.id === uploadingToId)?.nombre}</p>
              </div>

              {isUploading ? (
                <div className="space-y-6 py-8">
                  <div className="text-center">
                    <p className="text-[32px] font-black text-secondary italic leading-none">{progress}%</p>
                    <p className="text-[9px] font-black text-text-tertiary uppercase tracking-widest mt-2">Subiendo archivos HD...</p>
                  </div>
                  <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <div className="h-full bg-gradient-logo transition-all duration-300" style={{ width: `${progress}%` }}></div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleConfirmUpload} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-text-tertiary uppercase tracking-widest ml-1">Tu Email de Staff</label>
                    <input type="email" required value={staffEmail} onChange={(e) => setStaffEmail(e.target.value)} placeholder="staff@fotosexpress.com" className="w-full bg-background-input border border-white/5 rounded-2xl px-6 py-4 text-white outline-none font-bold" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-text-tertiary uppercase tracking-widest ml-1 block">Seleccionar Fotos HD</label>
                    <div className="relative group">
                       <input 
                         type="file" 
                         multiple 
                         required 
                         accept="image/*" 
                         onChange={(e) => setSelectedFiles(e.target.files)} 
                         className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                       />
                       <div className="w-full bg-background-input border border-dashed border-white/10 rounded-2xl p-8 text-center group-hover:border-secondary transition-all">
                         <span className="material-symbols-outlined text-4xl text-text-tertiary group-hover:text-secondary mb-2">cloud_upload</span>
                         <p className="text-[10px] font-black text-text-tertiary uppercase tracking-widest">
                           {selectedFiles ? `${selectedFiles.length} archivos seleccionados` : 'Arrastra o haz clic para subir'}
                         </p>
                       </div>
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-gradient-logo text-background font-black py-5 rounded-2xl uppercase tracking-widest text-[11px] shadow-xl hover:scale-[1.02] transition-all">
                    CONFIRMAR ENTREGA FINAL
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default PhotographerDashboard;
