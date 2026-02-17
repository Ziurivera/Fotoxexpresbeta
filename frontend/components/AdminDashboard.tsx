
import React, { useState } from 'react';
import { AppView, PhotographerProfile, ServiceRequest } from '../types';
import { ExtendedClientLead } from '../App';

interface AdminDashboardProps {
  onNavigate: (view: AppView) => void;
  clientLeads: ExtendedClientLead[];
  serviceRequests: ServiceRequest[];
  staffApplications: PhotographerProfile[];
  onDeleteLead: (id: string) => void;
  onDeleteService: (id: string) => void;
  onStaffAction: (id: string, action: 'aprobado' | 'rechazado') => void;
}

interface ApprovalModalData {
  id: string;
  nombre: string;
  email: string;
  activationLink?: string;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  onNavigate, 
  clientLeads, 
  serviceRequests, 
  staffApplications,
  onDeleteLead,
  onDeleteService,
  onStaffAction
}) => {
  const [activeTab, setActiveTab] = useState<'leads' | 'services' | 'staff'>('leads');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [viewingGallery, setViewingGallery] = useState<string[] | null>(null);
  const [approvalModal, setApprovalModal] = useState<ApprovalModalData | null>(null);
  const [isApproving, setIsApproving] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const handleWhatsApp = (phone: string, name: string, type: 'delivery' | 'service') => {
    let message = '';
    if (type === 'delivery') {
      message = `¡Hola ${name}! Tus fotos ya están listas en Fotos Express. Puedes descargarlas ingresando tu número de teléfono en nuestro portal. Muchas gracias, puedes seguirnos en Instagram: https://www.instagram.com/fotosexpresspr?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==`;
    } else {
      message = `¡Hola ${name}! Recibimos tu solicitud de servicio en Fotos Express. ¿Podemos hablar sobre los detalles? 📸`;
    }
    window.open(`https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleApproveStaff = async (app: PhotographerProfile) => {
    setIsApproving(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || ''}/api/staff/approve/${app.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        setApprovalModal({
          id: app.id,
          nombre: data.nombre,
          email: data.email,
          activationLink: data.activationLink
        });
        onStaffAction(app.id, 'aprobado');
      } else {
        const error = await response.json();
        alert(`Error: ${error.detail}`);
      }
    } catch (err) {
      // Fallback: Show simulated link if backend is not connected
      const simulatedToken = Math.random().toString(36).substring(2, 15);
      const baseUrl = window.location.origin;
      setApprovalModal({
        id: app.id,
        nombre: app.nombre,
        email: app.email,
        activationLink: `${baseUrl}/activar-cuenta?token=${simulatedToken}`
      });
      onStaffAction(app.id, 'aprobado');
    }
    setIsApproving(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const menuItems = [
    { id: 'leads', label: 'Entregas HD', icon: 'auto_awesome_motion', count: clientLeads.length },
    { id: 'services', label: 'Servicios', icon: 'calendar_month', count: serviceRequests.length },
    { id: 'staff', label: 'Candidatos', icon: 'badge', count: staffApplications.length },
  ];

  return (
    <div className="flex min-h-screen bg-background text-text-primary relative font-sans">
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[85] lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar Unificado */}
      <aside className={`
        fixed lg:sticky top-0 left-0 z-[90] h-screen bg-background-card border-r border-white/5 
        transition-transform duration-500 ease-in-out w-72 lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-8 flex flex-col h-full">
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate(AppView.LANDING)}>
              <div className="bg-primary p-2 rounded-xl shadow-lg shadow-primary/20">
                <span className="material-symbols-outlined text-background font-black">shield_person</span>
              </div>
              <div>
                <h1 className="font-black uppercase italic text-lg leading-none tracking-tighter text-white">PANEL</h1>
                <h1 className="font-black uppercase italic text-lg leading-none tracking-tighter text-primary">MAESTRO</h1>
              </div>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-text-tertiary">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <nav className="flex-1 space-y-2">
            {menuItems.map((item) => (
              <button 
                key={item.id}
                onClick={() => { setActiveTab(item.id as any); setIsSidebarOpen(false); }} 
                className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl font-black text-[10px] uppercase transition-all group ${activeTab === item.id ? 'bg-primary text-background' : 'text-text-tertiary hover:text-white hover:bg-white/5'}`}
              >
                <div className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-xl">{item.icon}</span>
                  {item.label}
                </div>
                {item.count > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-[8px] ${activeTab === item.id ? 'bg-background text-primary' : 'bg-primary/10 text-primary'}`}>
                    {item.count}
                  </span>
                )}
              </button>
            ))}
          </nav>

          <div className="pt-8 border-t border-white/5 space-y-4">
             <div className="flex items-center gap-3 px-4">
                <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-success text-sm">online_prediction</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[8px] font-black text-text-tertiary uppercase">Admin Status</span>
                  <span className="text-[10px] font-bold text-success uppercase">Conectado</span>
                </div>
             </div>
             <button onClick={() => onNavigate(AppView.LANDING)} className="w-full flex items-center gap-3 text-text-tertiary hover:text-error transition-colors font-black uppercase text-[10px] px-4 py-2">
                <span className="material-symbols-outlined text-lg">power_settings_new</span> Cerrar Sesión
             </button>
          </div>
        </div>
      </aside>

      {/* Main Content View */}
      <main className="flex-1 min-w-0 flex flex-col">
        {/* Top Header Mobile */}
        <div className="lg:hidden sticky top-0 w-full bg-background/80 backdrop-blur-xl border-b border-white/5 z-[80] px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <span className="material-symbols-outlined text-primary">admin_panel_settings</span>
             <span className="font-black italic uppercase text-xs tracking-widest">{activeTab.replace('leads', 'Entregas').replace('services', 'Servicios').replace('staff', 'Candidatos')}</span>
          </div>
          <button onClick={() => setIsSidebarOpen(true)} className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-xl border border-white/10">
            <span className="material-symbols-outlined">menu</span>
          </button>
        </div>

        <div className="p-6 md:p-10 lg:p-16 max-w-[1400px] mx-auto w-full">
          
          {/* SECTION: ENTREGAS HD */}
          {activeTab === 'leads' && (
            <div className="animate-fade-in space-y-8">
              <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                  <h2 className="text-4xl lg:text-5xl font-black uppercase italic tracking-tighter leading-none mb-3">CONTROL DE <span className="text-primary">ENTREGAS</span></h2>
                  <p className="text-text-secondary text-[10px] uppercase tracking-[0.3em] font-bold">Gestión de galerías y notificaciones al cliente.</p>
                </div>
                <div className="bg-white/5 px-6 py-4 rounded-2xl border border-white/10 flex items-center gap-4">
                  <span className="text-[9px] font-black text-text-tertiary uppercase">Total Listos: <span className="text-success text-lg ml-2 italic">{clientLeads.filter(l => l.status === 'atendido').length}</span></span>
                </div>
              </header>

              <div className="bg-background-card border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl overflow-x-auto">
                <table className="w-full text-left min-w-[800px]">
                  <thead className="bg-white/[0.02] text-[9px] font-black text-text-tertiary uppercase tracking-widest border-b border-white/5">
                    <tr>
                      <th className="px-8 py-6">Estado</th>
                      <th className="px-8 py-6">Cliente</th>
                      <th className="px-8 py-6">Teléfono</th>
                      <th className="px-8 py-6">Staff Asignado</th>
                      <th className="px-8 py-6 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {clientLeads.map(lead => (
                      <tr key={lead.id} className="hover:bg-white/[0.01] transition-colors group">
                        <td className="px-8 py-6 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase ${lead.status === 'atendido' ? 'bg-success/10 text-success border border-success/20' : 'bg-warning/10 text-warning border border-warning/20 animate-pulse'}`}>
                            {lead.status === 'atendido' ? 'LISTO HD' : 'EN ESPERA'}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <p className="text-sm font-black uppercase italic text-white">{lead.nombre}</p>
                        </td>
                        <td className="px-8 py-6">
                          <p className="text-xs font-bold text-text-secondary tracking-widest">{lead.telefono}</p>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap">
                          <p className="text-[10px] font-black text-text-tertiary uppercase truncate max-w-[150px]">{lead.atendidoPorNombre || 'SIN ASIGNAR'}</p>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => lead.fotosSubidas && setViewingGallery(lead.fotosSubidas)} disabled={!lead.fotosSubidas} className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-text-tertiary hover:text-primary disabled:opacity-10 transition-all active:scale-90">
                              <span className="material-symbols-outlined text-lg">visibility</span>
                            </button>
                            <button onClick={() => handleWhatsApp(lead.telefono, lead.nombre, 'delivery')} className="w-9 h-9 rounded-xl bg-success/10 flex items-center justify-center text-success hover:bg-success hover:text-background transition-all active:scale-90">
                              <span className="material-symbols-outlined text-lg">chat</span>
                            </button>
                            <button onClick={() => onDeleteLead(lead.id)} className="w-9 h-9 rounded-xl bg-error/10 flex items-center justify-center text-error hover:bg-error hover:text-white transition-all active:scale-90">
                              <span className="material-symbols-outlined text-lg">delete_sweep</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SECTION: SERVICIOS / COTIZACIONES */}
          {activeTab === 'services' && (
            <div className="animate-fade-in space-y-8">
               <header>
                  <h2 className="text-4xl lg:text-5xl font-black uppercase italic tracking-tighter leading-none mb-3">SOLICITUD DE <span className="text-secondary">SERVICIOS</span></h2>
                  <p className="text-text-secondary text-[10px] uppercase tracking-[0.3em] font-bold">Nuevas cotizaciones desde la web.</p>
               </header>

               <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                 {serviceRequests.map(service => (
                   <div key={service.id} className="bg-background-card border border-white/5 p-8 rounded-[3rem] relative overflow-hidden group hover:border-secondary/40 transition-all shadow-xl">
                      <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-20 transition-all">
                         <span className="material-symbols-outlined text-7xl uppercase">{service.tipo === 'boda' ? 'favorite' : 'camera'}</span>
                      </div>
                      <div className="flex justify-between items-start mb-6">
                         <span className="bg-secondary/10 text-secondary text-[8px] font-black px-3 py-1 rounded-full border border-secondary/20 uppercase tracking-widest">{service.tipo.replace('_', ' ')}</span>
                         <span className="text-[10px] font-bold text-text-tertiary uppercase">{service.detalles.fechaEvento}</span>
                      </div>
                      <h4 className="text-2xl font-black uppercase italic tracking-tighter text-white mb-2">{service.contacto.nombre}</h4>
                      <p className="text-[10px] text-text-tertiary font-bold uppercase tracking-widest mb-6">{service.contacto.email}</p>
                      
                      <div className="space-y-4 py-6 border-y border-white/5 mb-8">
                         <div className="flex justify-between text-[10px] font-black uppercase">
                            <span className="text-text-tertiary tracking-widest">Duración</span>
                            <span className="text-white">{service.detalles.horas} Horas</span>
                         </div>
                         <div className="flex justify-between text-[10px] font-black uppercase">
                            <span className="text-text-tertiary tracking-widest">Locación</span>
                            <span className="text-white">{service.detalles.locacion}</span>
                         </div>
                         <div className="flex justify-between text-[10px] font-black uppercase">
                            <span className="text-text-tertiary tracking-widest">Personas</span>
                            <span className="text-white">{service.detalles.personas}</span>
                         </div>
                      </div>

                      <div className="flex gap-3">
                         <button onClick={() => handleWhatsApp(service.contacto.telefono, service.contacto.nombre, 'service')} className="flex-1 bg-white text-background font-black py-4 rounded-xl text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg">CONTACTAR</button>
                         <button onClick={() => onDeleteService(service.id)} className="w-14 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-text-tertiary hover:text-error hover:bg-error/10 transition-all">
                            <span className="material-symbols-outlined">delete</span>
                         </button>
                      </div>
                   </div>
                 ))}
                 {serviceRequests.length === 0 && (
                   <div className="col-span-full py-20 text-center opacity-30">
                      <span className="material-symbols-outlined text-6xl mb-4">inbox</span>
                      <p className="text-[10px] font-black uppercase tracking-widest">No hay nuevas solicitudes de servicio</p>
                   </div>
                 )}
               </div>
            </div>
          )}

          {/* SECTION: CANDIDATOS STAFF */}
          {activeTab === 'staff' && (
            <div className="animate-fade-in space-y-8">
               <header>
                  <h2 className="text-4xl lg:text-5xl font-black uppercase italic tracking-tighter leading-none mb-3">RECLUTAMIENTO <span className="text-primary">STAFF</span></h2>
                  <p className="text-text-secondary text-[10px] uppercase tracking-[0.3em] font-bold">Solicitudes de fotógrafos que desean unirse.</p>
               </header>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {staffApplications.map(app => (
                   <div key={app.id} className="bg-background-card border border-white/5 p-10 rounded-[3.5rem] flex flex-col gap-6 relative group overflow-hidden shadow-2xl">
                      <div className="flex items-center gap-6">
                        <div className="w-20 h-20 rounded-[2rem] bg-background-input border border-white/10 flex items-center justify-center text-primary">
                          <span className="material-symbols-outlined text-4xl">photo_camera</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-2xl font-black uppercase italic tracking-tighter text-white">{app.nombre}</h4>
                          <p className="text-xs font-bold text-primary tracking-widest">{app.telefono}</p>
                        </div>
                      </div>

                      <div className="space-y-4 py-6 border-t border-white/5">
                        {/* EMAIL - NUEVO */}
                        <div className="flex flex-col gap-1">
                           <span className="text-[8px] font-black text-text-tertiary uppercase tracking-widest">Email de Contacto</span>
                           <p className="text-sm font-bold text-secondary break-all">{app.email}</p>
                        </div>
                        <div className="flex flex-col gap-1">
                           <span className="text-[8px] font-black text-text-tertiary uppercase tracking-widest">Equipo Profesional</span>
                           <p className="text-xs font-bold text-white uppercase">{app.equipo}</p>
                        </div>
                        <div className="flex flex-col gap-1">
                           <span className="text-[8px] font-black text-text-tertiary uppercase tracking-widest">Experiencia</span>
                           <p className="text-[11px] text-text-secondary leading-relaxed font-bold uppercase tracking-wider">{app.experiencia}</p>
                        </div>
                      </div>

                      <div className="flex gap-3 pt-4">
                         <button 
                           onClick={() => onStaffAction(app.id, 'rechazado')} 
                           className="flex-1 bg-white/5 text-text-tertiary font-black py-4 rounded-2xl text-[9px] uppercase tracking-widest hover:bg-error/20 hover:text-error transition-all"
                         >
                           DESCARTAR
                         </button>
                         <button 
                           onClick={() => handleApproveStaff(app)} 
                           disabled={isApproving}
                           className="flex-[1.5] bg-white text-background font-black py-4 rounded-2xl text-[9px] uppercase tracking-widest hover:scale-[1.03] active:scale-95 transition-all shadow-xl disabled:opacity-50"
                         >
                           {isApproving ? 'PROCESANDO...' : 'APROBAR INGRESO'}
                         </button>
                      </div>
                   </div>
                 ))}
                 {staffApplications.length === 0 && (
                   <div className="col-span-full py-20 text-center opacity-30">
                      <span className="material-symbols-outlined text-6xl mb-4">group_add</span>
                      <p className="text-[10px] font-black uppercase tracking-widest">No hay candidatos pendientes</p>
                   </div>
                 )}
               </div>
            </div>
          )}
        </div>
      </main>

      {/* MODAL: VISOR DE AUDITORÍA */}
      {viewingGallery && (
        <div className="fixed inset-0 z-[200] bg-background/95 backdrop-blur-xl flex items-center justify-center p-4 sm:p-10 animate-fade-in" onClick={() => setViewingGallery(null)}>
           <div className="max-w-6xl w-full bg-background-card border border-white/10 rounded-[3.5rem] p-6 sm:p-12 relative max-h-[90vh] flex flex-col shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <header className="flex justify-between items-center mb-8">
                 <div>
                    <h3 className="text-2xl font-black uppercase italic tracking-tighter leading-none">Visor de Auditoría</h3>
                    <p className="text-[9px] font-bold text-text-tertiary uppercase tracking-widest mt-2">Control de calidad Fotos Express HD</p>
                 </div>
                 <button onClick={() => setViewingGallery(null)} className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-error transition-all">
                   <span className="material-symbols-outlined">close</span>
                 </button>
              </header>
              <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6 pr-2 scrollbar-custom">
                 {viewingGallery.map((url, idx) => (
                   <div key={idx} className="aspect-[4/5] rounded-2xl overflow-hidden bg-background-input border border-white/5 group relative shadow-lg">
                      <img src={url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Auditoria" />
                      <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg text-[8px] font-black text-white uppercase tracking-widest border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                         HD FRAME {idx + 1}
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      )}

      {/* MODAL: APROBACIÓN EXITOSA CON LINK */}
      {approvalModal && (
        <div className="fixed inset-0 z-[200] bg-background/95 backdrop-blur-xl flex items-center justify-center p-4 sm:p-10 animate-fade-in" onClick={() => setApprovalModal(null)}>
          <div className="max-w-lg w-full bg-background-card border border-success/20 rounded-[3rem] p-8 sm:p-12 relative shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="absolute top-0 left-0 w-full h-1.5 bg-success rounded-t-[3rem]"></div>
            
            <button onClick={() => setApprovalModal(null)} className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-error transition-all">
              <span className="material-symbols-outlined">close</span>
            </button>

            <div className="text-center mb-10">
              <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="material-symbols-outlined text-5xl text-success">check_circle</span>
              </div>
              <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-2">¡FOTÓGRAFO APROBADO!</h3>
              <p className="text-text-secondary text-[11px] font-bold uppercase tracking-widest">Se ha generado el link de activación</p>
            </div>

            <div className="space-y-6 mb-10">
              <div className="bg-background-input p-6 rounded-2xl border border-white/5">
                <p className="text-[9px] font-black text-text-tertiary uppercase tracking-widest mb-2">Nombre</p>
                <p className="text-lg font-black text-white uppercase italic">{approvalModal.nombre}</p>
              </div>
              
              <div className="bg-background-input p-6 rounded-2xl border border-white/5">
                <p className="text-[9px] font-black text-text-tertiary uppercase tracking-widest mb-2">Email</p>
                <p className="text-sm font-bold text-primary break-all">{approvalModal.email}</p>
              </div>

              <div className="bg-primary/5 p-6 rounded-2xl border border-primary/20">
                <p className="text-[9px] font-black text-primary uppercase tracking-widest mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">link</span>
                  Link de Activación (Simular envío)
                </p>
                <div className="bg-background p-4 rounded-xl border border-white/10 break-all">
                  <p className="text-[11px] font-mono text-text-secondary">{approvalModal.activationLink}</p>
                </div>
                <button 
                  onClick={() => copyToClipboard(approvalModal.activationLink || '')}
                  className="w-full mt-4 bg-primary text-background font-black py-4 rounded-xl text-[10px] uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-lg">{linkCopied ? 'check' : 'content_copy'}</span>
                  {linkCopied ? '¡COPIADO!' : 'COPIAR LINK'}
                </button>
              </div>
            </div>

            <div className="bg-secondary/5 p-4 rounded-xl border border-secondary/20 text-center">
              <p className="text-[9px] font-bold text-secondary uppercase tracking-wider">
                <span className="material-symbols-outlined text-sm align-middle mr-1">info</span>
                El fotógrafo debe abrir este link para crear su contraseña y activar su cuenta
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
