import React, { useState, useEffect } from 'react';
import { AppView, Zone, Business, Activity, AmbulantClient, ActivityClient, ServiceRequest, StaffApplication, StaffUser } from '../types';

interface AdminDashboardProps {
  onNavigate: (view: AppView) => void;
}

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

interface ApprovalModalData {
  id: string;
  nombre: string;
  email: string;
  activationLink?: string;
  emailStatus?: { status: string; message?: string };
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'zones' | 'businesses' | 'ambulant' | 'activity' | 'services' | 'staff'>('zones');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Data
  const [zones, setZones] = useState<Zone[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [ambulantClients, setAmbulantClients] = useState<AmbulantClient[]>([]);
  const [activityClients, setActivityClients] = useState<ActivityClient[]>([]);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [staffApplications, setStaffApplications] = useState<StaffApplication[]>([]);
  const [staffUsers, setStaffUsers] = useState<StaffUser[]>([]);
  
  // Modals
  const [showZoneModal, setShowZoneModal] = useState(false);
  const [showBusinessModal, setShowBusinessModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState<{type: 'zone' | 'activity'; id: string; name: string} | null>(null);
  const [approvalModal, setApprovalModal] = useState<ApprovalModalData | null>(null);
  
  // Forms
  const [newZone, setNewZone] = useState({ nombre: '', descripcion: '' });
  const [newBusiness, setNewBusiness] = useState({ nombre: '', direccion: '', telefono: '' });
  const [newActivity, setNewActivity] = useState({ nombre: '', negocioId: '', descripcion: '' });
  const [selectedStaff, setSelectedStaff] = useState<string[]>([]);
  
  const [isApproving, setIsApproving] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  // Load all data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [zRes, bRes, aRes, acRes, ecRes, sRes, stRes, suRes] = await Promise.all([
        fetch(`${API_URL}/api/zones`),
        fetch(`${API_URL}/api/businesses`),
        fetch(`${API_URL}/api/activities`),
        fetch(`${API_URL}/api/ambulant-clients`),
        fetch(`${API_URL}/api/activity-clients`),
        fetch(`${API_URL}/api/services`),
        fetch(`${API_URL}/api/staff`),
        fetch(`${API_URL}/api/staff/users`)
      ]);
      if (zRes.ok) setZones(await zRes.json());
      if (bRes.ok) setBusinesses(await bRes.json());
      if (aRes.ok) setActivities(await aRes.json());
      if (acRes.ok) setAmbulantClients(await acRes.json());
      if (ecRes.ok) setActivityClients(await ecRes.json());
      if (sRes.ok) setServiceRequests(await sRes.json());
      if (stRes.ok) setStaffApplications((await stRes.json()).filter((s: StaffApplication) => s.status === 'pendiente'));
      if (suRes.ok) setStaffUsers(await suRes.json());
    } catch (err) {
      console.error('Error loading data:', err);
    }
  };

  // Zone CRUD
  const handleCreateZone = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/zones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newZone, activa: true, fotografosAsignados: [] })
      });
      if (res.ok) {
        loadData();
        setShowZoneModal(false);
        setNewZone({ nombre: '', descripcion: '' });
      }
    } catch (err) { console.error(err); }
  };

  const handleDeleteZone = async (id: string) => {
    if (!confirm('¿Eliminar esta zona?')) return;
    await fetch(`${API_URL}/api/zones/${id}`, { method: 'DELETE' });
    loadData();
  };

  // Business CRUD
  const handleCreateBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/businesses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newBusiness, activo: true })
      });
      if (res.ok) {
        loadData();
        setShowBusinessModal(false);
        setNewBusiness({ nombre: '', direccion: '', telefono: '' });
      }
    } catch (err) { console.error(err); }
  };

  const handleDeleteBusiness = async (id: string) => {
    if (!confirm('¿Eliminar este negocio y sus actividades?')) return;
    await fetch(`${API_URL}/api/businesses/${id}`, { method: 'DELETE' });
    loadData();
  };

  // Activity CRUD
  const handleCreateActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newActivity, activa: true, fotografosAsignados: [] })
      });
      if (res.ok) {
        loadData();
        setShowActivityModal(false);
        setNewActivity({ nombre: '', negocioId: '', descripcion: '' });
      }
    } catch (err) { console.error(err); }
  };

  const handleDeleteActivity = async (id: string) => {
    if (!confirm('¿Eliminar esta actividad?')) return;
    await fetch(`${API_URL}/api/activities/${id}`, { method: 'DELETE' });
    loadData();
  };

  // Staff Assignment
  const handleAssignStaff = async () => {
    if (!showAssignModal) return;
    const endpoint = showAssignModal.type === 'zone' 
      ? `/api/zones/${showAssignModal.id}/staff`
      : `/api/activities/${showAssignModal.id}/staff`;
    
    await fetch(`${API_URL}${endpoint}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ staffIds: selectedStaff })
    });
    loadData();
    setShowAssignModal(null);
    setSelectedStaff([]);
  };

  // Staff Approval
  const handleApproveStaff = async (app: StaffApplication) => {
    setIsApproving(true);
    try {
      const res = await fetch(`${API_URL}/api/staff/approve/${app.id}`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setApprovalModal({
          id: app.id,
          nombre: data.nombre,
          email: data.email,
          activationLink: data.activationLink,
          emailStatus: data.emailStatus
        });
        loadData();
      }
    } catch (err) { console.error(err); }
    setIsApproving(false);
  };

  const handleRejectStaff = async (id: string) => {
    await fetch(`${API_URL}/api/staff/${id}`, { method: 'DELETE' });
    loadData();
  };

  // Delete clients
  const handleDeleteAmbulant = async (id: string) => {
    await fetch(`${API_URL}/api/ambulant-clients/${id}`, { method: 'DELETE' });
    loadData();
  };

  const handleDeleteActivityClient = async (id: string) => {
    await fetch(`${API_URL}/api/activity-clients/${id}`, { method: 'DELETE' });
    loadData();
  };

  const handleDeleteService = async (id: string) => {
    await fetch(`${API_URL}/api/services/${id}`, { method: 'DELETE' });
    loadData();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleWhatsApp = (phone: string, name: string) => {
    const msg = `¡Hola ${name}! Tus fotos de Fotos Express están listas. 📸`;
    window.open(`https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const menuItems = [
    { id: 'zones', label: 'Zonas', icon: 'map', count: zones.length },
    { id: 'businesses', label: 'Negocios', icon: 'store', count: businesses.length },
    { id: 'ambulant', label: 'Ambulantes', icon: 'directions_walk', count: ambulantClients.length },
    { id: 'activity', label: 'Actividades', icon: 'celebration', count: activityClients.length },
    { id: 'services', label: 'Cotizaciones', icon: 'request_quote', count: serviceRequests.length },
    { id: 'staff', label: 'Reclutamiento', icon: 'badge', count: staffApplications.length },
  ];

  return (
    <div className="flex min-h-screen bg-background text-text-primary relative font-sans">
      {/* Mobile Backdrop */}
      {isSidebarOpen && <div className="fixed inset-0 bg-black/80 z-[85] lg:hidden" onClick={() => setIsSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed lg:sticky top-0 left-0 z-[90] h-screen bg-background-card border-r border-white/5 transition-transform duration-300 w-72 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-8 flex flex-col h-full">
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate(AppView.LANDING)}>
              <div className="bg-primary p-2 rounded-xl">
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
            {menuItems.map(item => (
              <button 
                key={item.id}
                onClick={() => { setActiveTab(item.id as any); setIsSidebarOpen(false); }}
                className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl font-black text-[10px] uppercase transition-all ${activeTab === item.id ? 'bg-primary text-background' : 'text-text-tertiary hover:bg-white/5'}`}
              >
                <div className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-xl">{item.icon}</span>
                  {item.label}
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[8px] ${activeTab === item.id ? 'bg-background text-primary' : 'bg-primary/10 text-primary'}`}>
                  {item.count}
                </span>
              </button>
            ))}
          </nav>

          <div className="pt-8 border-t border-white/5 space-y-4">
            <div className="flex items-center gap-3 px-4">
              <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-success text-sm">online_prediction</span>
              </div>
              <span className="text-[10px] font-bold text-success uppercase">Admin Conectado</span>
            </div>
            <button onClick={() => onNavigate(AppView.LANDING)} className="w-full flex items-center gap-3 text-text-tertiary hover:text-error transition-colors font-black uppercase text-[10px] px-4 py-2">
              <span className="material-symbols-outlined text-lg">power_settings_new</span> Cerrar Sesión
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 flex flex-col">
        <div className="lg:hidden sticky top-0 w-full bg-background/80 backdrop-blur-xl border-b border-white/5 z-[80] px-6 h-20 flex items-center justify-between">
          <span className="font-black italic uppercase text-xs tracking-widest">Panel Admin</span>
          <button onClick={() => setIsSidebarOpen(true)} className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-xl">
            <span className="material-symbols-outlined">menu</span>
          </button>
        </div>

        <div className="p-6 md:p-10 lg:p-16 max-w-[1400px] mx-auto w-full">
          
          {/* ZONES TAB */}
          {activeTab === 'zones' && (
            <div className="animate-fade-in space-y-8">
              <header className="flex justify-between items-end">
                <div>
                  <h2 className="text-4xl lg:text-5xl font-black uppercase italic tracking-tighter">ZONAS <span className="text-primary">AMBULANTES</span></h2>
                  <p className="text-text-secondary text-[10px] uppercase tracking-[0.3em] font-bold">Áreas donde trabajan fotógrafos ambulantes</p>
                </div>
                <button onClick={() => setShowZoneModal(true)} className="bg-primary text-background font-black px-6 py-4 rounded-xl text-[10px] uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-2">
                  <span className="material-symbols-outlined">add</span> Nueva Zona
                </button>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {zones.map(zone => (
                  <div key={zone.id} className="bg-background-card border border-white/5 p-8 rounded-[2rem] group hover:border-primary/30 transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-black uppercase italic">{zone.nombre}</h3>
                        <p className="text-text-tertiary text-[10px] uppercase tracking-widest">{zone.descripcion}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase ${zone.activa ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>
                        {zone.activa ? 'Activa' : 'Inactiva'}
                      </span>
                    </div>
                    
                    <div className="mb-6">
                      <p className="text-[9px] font-black text-text-tertiary uppercase tracking-widest mb-2">Fotógrafos Asignados ({zone.fotografosAsignados.length})</p>
                      <div className="flex flex-wrap gap-1">
                        {zone.fotografosAsignados.map(sid => {
                          const staff = staffUsers.find(s => s.id === sid);
                          return staff ? (
                            <span key={sid} className="bg-primary/10 text-primary text-[9px] font-bold px-2 py-1 rounded">{staff.nombre}</span>
                          ) : null;
                        })}
                        {zone.fotografosAsignados.length === 0 && <span className="text-text-tertiary text-[10px]">Sin asignar</span>}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button onClick={() => { setShowAssignModal({ type: 'zone', id: zone.id, name: zone.nombre }); setSelectedStaff(zone.fotografosAsignados); }} className="flex-1 bg-white/5 text-white font-black py-3 rounded-xl text-[9px] uppercase hover:bg-primary hover:text-background transition-all">
                        Asignar Staff
                      </button>
                      <button onClick={() => handleDeleteZone(zone.id)} className="w-12 bg-error/10 text-error rounded-xl hover:bg-error hover:text-white transition-all flex items-center justify-center">
                        <span className="material-symbols-outlined text-lg">delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* BUSINESSES TAB */}
          {activeTab === 'businesses' && (
            <div className="animate-fade-in space-y-8">
              <header className="flex justify-between items-end">
                <div>
                  <h2 className="text-4xl lg:text-5xl font-black uppercase italic tracking-tighter">NEGOCIOS Y <span className="text-secondary">ACTIVIDADES</span></h2>
                  <p className="text-text-secondary text-[10px] uppercase tracking-[0.3em] font-bold">Lugares y eventos con servicio de fotografía</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setShowBusinessModal(true)} className="bg-white text-background font-black px-6 py-4 rounded-xl text-[10px] uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-2">
                    <span className="material-symbols-outlined">store</span> Nuevo Negocio
                  </button>
                  <button onClick={() => setShowActivityModal(true)} className="bg-secondary text-white font-black px-6 py-4 rounded-xl text-[10px] uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-2">
                    <span className="material-symbols-outlined">celebration</span> Nueva Actividad
                  </button>
                </div>
              </header>

              {businesses.map(business => (
                <div key={business.id} className="bg-background-card border border-white/5 rounded-[2rem] overflow-hidden">
                  <div className="p-6 border-b border-white/5 flex justify-between items-center">
                    <div>
                      <h3 className="text-2xl font-black uppercase italic">{business.nombre}</h3>
                      <p className="text-text-tertiary text-[10px] uppercase tracking-widest">{business.direccion}</p>
                    </div>
                    <button onClick={() => handleDeleteBusiness(business.id)} className="w-10 h-10 bg-error/10 text-error rounded-xl hover:bg-error hover:text-white transition-all flex items-center justify-center">
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                  
                  <div className="p-6">
                    <p className="text-[9px] font-black text-text-tertiary uppercase tracking-widest mb-4">Actividades de este negocio</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {activities.filter(a => a.negocioId === business.id).map(activity => (
                        <div key={activity.id} className="bg-background-input p-4 rounded-xl border border-white/5">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="text-lg font-black uppercase italic">{activity.nombre}</h4>
                              <p className="text-text-tertiary text-[9px]">{activity.descripcion}</p>
                            </div>
                            <span className={`px-2 py-0.5 rounded text-[8px] font-black ${activity.activa ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>
                              {activity.activa ? 'Activa' : 'Inactiva'}
                            </span>
                          </div>
                          
                          <div className="mb-3">
                            <p className="text-[8px] font-black text-text-tertiary uppercase mb-1">Staff ({activity.fotografosAsignados.length})</p>
                            <div className="flex flex-wrap gap-1">
                              {activity.fotografosAsignados.map(sid => {
                                const staff = staffUsers.find(s => s.id === sid);
                                return staff ? <span key={sid} className="bg-secondary/10 text-secondary text-[8px] font-bold px-2 py-0.5 rounded">{staff.nombre}</span> : null;
                              })}
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <button onClick={() => { setShowAssignModal({ type: 'activity', id: activity.id, name: activity.nombre }); setSelectedStaff(activity.fotografosAsignados); }} className="flex-1 bg-secondary/20 text-secondary font-black py-2 rounded text-[8px] uppercase hover:bg-secondary hover:text-white transition-all">
                              Asignar
                            </button>
                            <button onClick={() => handleDeleteActivity(activity.id)} className="w-8 bg-error/10 text-error rounded hover:bg-error hover:text-white transition-all flex items-center justify-center">
                              <span className="material-symbols-outlined text-sm">delete</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* AMBULANT CLIENTS TAB */}
          {activeTab === 'ambulant' && (
            <div className="animate-fade-in space-y-8">
              <header>
                <h2 className="text-4xl lg:text-5xl font-black uppercase italic tracking-tighter">CLIENTES <span className="text-primary">AMBULANTES</span></h2>
                <p className="text-text-secondary text-[10px] uppercase tracking-[0.3em] font-bold">Personas fotografiadas en zonas públicas</p>
              </header>

              <div className="bg-background-card border border-white/10 rounded-[2.5rem] overflow-x-auto">
                <table className="w-full text-left min-w-[900px]">
                  <thead className="bg-white/[0.02] text-[9px] font-black text-text-tertiary uppercase tracking-widest border-b border-white/5">
                    <tr>
                      <th className="px-6 py-5">Foto</th>
                      <th className="px-6 py-5">Nombre</th>
                      <th className="px-6 py-5">Teléfono</th>
                      <th className="px-6 py-5">Instagram</th>
                      <th className="px-6 py-5">Zona</th>
                      <th className="px-6 py-5">Publicidad</th>
                      <th className="px-6 py-5">Estado</th>
                      <th className="px-6 py-5">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {ambulantClients.map(client => (
                      <tr key={client.id} className="hover:bg-white/[0.01]">
                        <td className="px-6 py-4">
                          <img src={client.fotoReferencia || 'https://picsum.photos/50'} alt="Ref" className="w-12 h-12 rounded-lg object-cover" />
                        </td>
                        <td className="px-6 py-4 font-black uppercase">{client.nombre}</td>
                        <td className="px-6 py-4 text-xs font-bold">{client.telefono}</td>
                        <td className="px-6 py-4 text-xs text-primary">{client.instagram || '-'}</td>
                        <td className="px-6 py-4 text-xs">{client.zonaNombre}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-[8px] font-black ${client.aceptaPublicidad ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>
                            {client.aceptaPublicidad ? 'Sí' : 'No'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-[8px] font-black ${client.status === 'atendido' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                            {client.status === 'atendido' ? 'Listo' : 'Pendiente'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button onClick={() => handleWhatsApp(client.telefono, client.nombre)} className="w-8 h-8 rounded bg-success/10 text-success hover:bg-success hover:text-white transition-all flex items-center justify-center">
                              <span className="material-symbols-outlined text-sm">chat</span>
                            </button>
                            <button onClick={() => handleDeleteAmbulant(client.id)} className="w-8 h-8 rounded bg-error/10 text-error hover:bg-error hover:text-white transition-all flex items-center justify-center">
                              <span className="material-symbols-outlined text-sm">delete</span>
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

          {/* ACTIVITY CLIENTS TAB */}
          {activeTab === 'activity' && (
            <div className="animate-fade-in space-y-8">
              <header>
                <h2 className="text-4xl lg:text-5xl font-black uppercase italic tracking-tighter">CLIENTES DE <span className="text-secondary">ACTIVIDADES</span></h2>
                <p className="text-text-secondary text-[10px] uppercase tracking-[0.3em] font-bold">Personas de eventos y celebraciones</p>
              </header>

              <div className="bg-background-card border border-white/10 rounded-[2.5rem] overflow-x-auto">
                <table className="w-full text-left min-w-[900px]">
                  <thead className="bg-white/[0.02] text-[9px] font-black text-text-tertiary uppercase tracking-widest border-b border-white/5">
                    <tr>
                      <th className="px-6 py-5">Foto</th>
                      <th className="px-6 py-5">Nombre</th>
                      <th className="px-6 py-5">Teléfono</th>
                      <th className="px-6 py-5">Negocio</th>
                      <th className="px-6 py-5">Actividad</th>
                      <th className="px-6 py-5">Estado</th>
                      <th className="px-6 py-5">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {activityClients.map(client => (
                      <tr key={client.id} className="hover:bg-white/[0.01]">
                        <td className="px-6 py-4">
                          <img src={client.fotoReferencia || 'https://picsum.photos/50'} alt="Ref" className="w-12 h-12 rounded-lg object-cover" />
                        </td>
                        <td className="px-6 py-4 font-black uppercase">{client.nombre}</td>
                        <td className="px-6 py-4 text-xs font-bold">{client.telefono}</td>
                        <td className="px-6 py-4 text-xs">{client.negocioNombre}</td>
                        <td className="px-6 py-4 text-xs text-secondary">{client.actividadNombre}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-[8px] font-black ${client.status === 'atendido' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                            {client.status === 'atendido' ? 'Listo' : 'Pendiente'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button onClick={() => handleWhatsApp(client.telefono, client.nombre)} className="w-8 h-8 rounded bg-success/10 text-success hover:bg-success hover:text-white transition-all flex items-center justify-center">
                              <span className="material-symbols-outlined text-sm">chat</span>
                            </button>
                            <button onClick={() => handleDeleteActivityClient(client.id)} className="w-8 h-8 rounded bg-error/10 text-error hover:bg-error hover:text-white transition-all flex items-center justify-center">
                              <span className="material-symbols-outlined text-sm">delete</span>
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

          {/* SERVICES TAB */}
          {activeTab === 'services' && (
            <div className="animate-fade-in space-y-8">
              <header>
                <h2 className="text-4xl lg:text-5xl font-black uppercase italic tracking-tighter">SOLICITUDES DE <span className="text-secondary">SERVICIO</span></h2>
              </header>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {serviceRequests.map(service => (
                  <div key={service.id} className="bg-background-card border border-white/5 p-8 rounded-[2rem]">
                    <span className="bg-secondary/10 text-secondary text-[8px] font-black px-3 py-1 rounded-full uppercase">{service.tipo}</span>
                    <h4 className="text-xl font-black uppercase italic mt-4">{service.contacto.nombre}</h4>
                    <p className="text-text-tertiary text-[10px]">{service.contacto.email}</p>
                    <div className="my-4 space-y-2 text-[10px]">
                      <p><strong>Fecha:</strong> {service.detalles.fechaEvento}</p>
                      <p><strong>Duración:</strong> {service.detalles.horas}h</p>
                      <p><strong>Personas:</strong> {service.detalles.personas}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleWhatsApp(service.contacto.telefono, service.contacto.nombre)} className="flex-1 bg-white text-background font-black py-3 rounded-xl text-[9px] uppercase">Contactar</button>
                      <button onClick={() => handleDeleteService(service.id)} className="w-12 bg-error/10 text-error rounded-xl hover:bg-error hover:text-white transition-all flex items-center justify-center">
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STAFF TAB */}
          {activeTab === 'staff' && (
            <div className="animate-fade-in space-y-8">
              <header>
                <h2 className="text-4xl lg:text-5xl font-black uppercase italic tracking-tighter">RECLUTAMIENTO <span className="text-primary">STAFF</span></h2>
              </header>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {staffApplications.map(app => (
                  <div key={app.id} className="bg-background-card border border-white/5 p-8 rounded-[2rem]">
                    <h4 className="text-2xl font-black uppercase italic">{app.nombre}</h4>
                    <p className="text-primary text-sm font-bold">{app.email}</p>
                    <p className="text-text-tertiary text-xs">{app.telefono}</p>
                    <div className="my-4 py-4 border-y border-white/5 space-y-2 text-[10px]">
                      <p><strong>Equipo:</strong> {app.equipo}</p>
                      <p><strong>Experiencia:</strong> {app.experiencia}</p>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => handleRejectStaff(app.id)} className="flex-1 bg-white/5 text-text-tertiary font-black py-4 rounded-xl text-[9px] uppercase hover:bg-error/20 hover:text-error">Rechazar</button>
                      <button onClick={() => handleApproveStaff(app)} disabled={isApproving} className="flex-[1.5] bg-white text-background font-black py-4 rounded-xl text-[9px] uppercase hover:scale-105 transition-all disabled:opacity-50">
                        {isApproving ? 'Procesando...' : 'Aprobar'}
                      </button>
                    </div>
                  </div>
                ))}
                {staffApplications.length === 0 && (
                  <div className="col-span-full text-center py-20 opacity-50">
                    <span className="material-symbols-outlined text-6xl mb-4">group_add</span>
                    <p className="text-[10px] font-black uppercase tracking-widest">No hay candidatos pendientes</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* MODALS */}
      
      {/* Zone Modal */}
      {showZoneModal && (
        <div className="fixed inset-0 z-[200] bg-background/95 backdrop-blur-xl flex items-center justify-center p-6" onClick={() => setShowZoneModal(false)}>
          <div className="max-w-md w-full bg-background-card p-10 rounded-[2rem] border border-white/10" onClick={e => e.stopPropagation()}>
            <h3 className="text-2xl font-black uppercase italic mb-6">Nueva Zona</h3>
            <form onSubmit={handleCreateZone} className="space-y-4">
              <input type="text" required value={newZone.nombre} onChange={e => setNewZone({...newZone, nombre: e.target.value})} placeholder="Nombre de la zona" className="w-full bg-background-input border border-white/5 rounded-xl px-5 py-4 text-white font-bold outline-none focus:border-primary" />
              <input type="text" value={newZone.descripcion} onChange={e => setNewZone({...newZone, descripcion: e.target.value})} placeholder="Descripción (opcional)" className="w-full bg-background-input border border-white/5 rounded-xl px-5 py-4 text-white font-bold outline-none focus:border-primary" />
              <button type="submit" className="w-full bg-primary text-background font-black py-5 rounded-xl uppercase tracking-widest text-xs">Crear Zona</button>
            </form>
          </div>
        </div>
      )}

      {/* Business Modal */}
      {showBusinessModal && (
        <div className="fixed inset-0 z-[200] bg-background/95 backdrop-blur-xl flex items-center justify-center p-6" onClick={() => setShowBusinessModal(false)}>
          <div className="max-w-md w-full bg-background-card p-10 rounded-[2rem] border border-white/10" onClick={e => e.stopPropagation()}>
            <h3 className="text-2xl font-black uppercase italic mb-6">Nuevo Negocio</h3>
            <form onSubmit={handleCreateBusiness} className="space-y-4">
              <input type="text" required value={newBusiness.nombre} onChange={e => setNewBusiness({...newBusiness, nombre: e.target.value})} placeholder="Nombre del negocio" className="w-full bg-background-input border border-white/5 rounded-xl px-5 py-4 text-white font-bold outline-none focus:border-primary" />
              <input type="text" value={newBusiness.direccion} onChange={e => setNewBusiness({...newBusiness, direccion: e.target.value})} placeholder="Dirección" className="w-full bg-background-input border border-white/5 rounded-xl px-5 py-4 text-white font-bold outline-none focus:border-primary" />
              <input type="text" value={newBusiness.telefono} onChange={e => setNewBusiness({...newBusiness, telefono: e.target.value})} placeholder="Teléfono" className="w-full bg-background-input border border-white/5 rounded-xl px-5 py-4 text-white font-bold outline-none focus:border-primary" />
              <button type="submit" className="w-full bg-white text-background font-black py-5 rounded-xl uppercase tracking-widest text-xs">Crear Negocio</button>
            </form>
          </div>
        </div>
      )}

      {/* Activity Modal */}
      {showActivityModal && (
        <div className="fixed inset-0 z-[200] bg-background/95 backdrop-blur-xl flex items-center justify-center p-6" onClick={() => setShowActivityModal(false)}>
          <div className="max-w-md w-full bg-background-card p-10 rounded-[2rem] border border-white/10" onClick={e => e.stopPropagation()}>
            <h3 className="text-2xl font-black uppercase italic mb-6">Nueva Actividad</h3>
            <form onSubmit={handleCreateActivity} className="space-y-4">
              <select required value={newActivity.negocioId} onChange={e => setNewActivity({...newActivity, negocioId: e.target.value})} className="w-full bg-background-input border border-white/5 rounded-xl px-5 py-4 text-white font-bold outline-none focus:border-secondary appearance-none">
                <option value="">Seleccionar negocio</option>
                {businesses.map(b => <option key={b.id} value={b.id}>{b.nombre}</option>)}
              </select>
              <input type="text" required value={newActivity.nombre} onChange={e => setNewActivity({...newActivity, nombre: e.target.value})} placeholder="Nombre de la actividad" className="w-full bg-background-input border border-white/5 rounded-xl px-5 py-4 text-white font-bold outline-none focus:border-secondary" />
              <input type="text" value={newActivity.descripcion} onChange={e => setNewActivity({...newActivity, descripcion: e.target.value})} placeholder="Descripción" className="w-full bg-background-input border border-white/5 rounded-xl px-5 py-4 text-white font-bold outline-none focus:border-secondary" />
              <button type="submit" className="w-full bg-secondary text-white font-black py-5 rounded-xl uppercase tracking-widest text-xs">Crear Actividad</button>
            </form>
          </div>
        </div>
      )}

      {/* Assign Staff Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-[200] bg-background/95 backdrop-blur-xl flex items-center justify-center p-6" onClick={() => setShowAssignModal(null)}>
          <div className="max-w-md w-full bg-background-card p-10 rounded-[2rem] border border-white/10" onClick={e => e.stopPropagation()}>
            <h3 className="text-2xl font-black uppercase italic mb-2">Asignar Staff</h3>
            <p className="text-text-tertiary text-[10px] uppercase tracking-widest mb-6">{showAssignModal.name}</p>
            
            <div className="space-y-3 max-h-60 overflow-y-auto mb-6">
              {staffUsers.map(staff => (
                <label key={staff.id} className="flex items-center gap-3 p-4 bg-background-input rounded-xl cursor-pointer hover:bg-white/5 transition-all">
                  <input 
                    type="checkbox" 
                    checked={selectedStaff.includes(staff.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedStaff([...selectedStaff, staff.id]);
                      } else {
                        setSelectedStaff(selectedStaff.filter(id => id !== staff.id));
                      }
                    }}
                    className="w-5 h-5 rounded accent-primary"
                  />
                  <div>
                    <p className="font-black text-sm">{staff.nombre}</p>
                    <p className="text-text-tertiary text-[10px]">{staff.email}</p>
                  </div>
                </label>
              ))}
            </div>
            
            <button onClick={handleAssignStaff} className="w-full bg-primary text-background font-black py-5 rounded-xl uppercase tracking-widest text-xs">
              Guardar Asignación ({selectedStaff.length})
            </button>
          </div>
        </div>
      )}

      {/* Approval Modal */}
      {approvalModal && (
        <div className="fixed inset-0 z-[200] bg-background/95 backdrop-blur-xl flex items-center justify-center p-6" onClick={() => setApprovalModal(null)}>
          <div className="max-w-lg w-full bg-background-card p-10 rounded-[2rem] border border-success/20" onClick={e => e.stopPropagation()}>
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-5xl text-success">check_circle</span>
              </div>
              <h3 className="text-2xl font-black uppercase italic">¡Fotógrafo Aprobado!</h3>
            </div>

            <div className="space-y-4 mb-6">
              <div className="bg-background-input p-4 rounded-xl">
                <p className="text-[8px] font-black text-text-tertiary uppercase tracking-widest mb-1">Nombre</p>
                <p className="font-black text-white">{approvalModal.nombre}</p>
              </div>
              <div className="bg-background-input p-4 rounded-xl">
                <p className="text-[8px] font-black text-text-tertiary uppercase tracking-widest mb-1">Email</p>
                <p className="text-primary font-bold">{approvalModal.email}</p>
              </div>

              {approvalModal.emailStatus && (
                <div className={`p-4 rounded-xl ${approvalModal.emailStatus.status === 'success' ? 'bg-success/10' : 'bg-warning/10'}`}>
                  <p className={`text-[10px] font-black uppercase ${approvalModal.emailStatus.status === 'success' ? 'text-success' : 'text-warning'}`}>
                    {approvalModal.emailStatus.status === 'success' ? 'Email enviado' : 'Email no enviado - Comparte el link manualmente'}
                  </p>
                </div>
              )}

              <div className="bg-primary/5 p-4 rounded-xl">
                <p className="text-[9px] font-black text-primary uppercase tracking-widest mb-2">Link de Activación</p>
                <p className="text-[10px] font-mono text-text-secondary break-all">{approvalModal.activationLink}</p>
                <button onClick={() => copyToClipboard(approvalModal.activationLink || '')} className="w-full mt-3 bg-primary text-background font-black py-3 rounded-xl text-[10px] uppercase flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-lg">{linkCopied ? 'check' : 'content_copy'}</span>
                  {linkCopied ? 'Copiado!' : 'Copiar Link'}
                </button>
              </div>
            </div>

            <button onClick={() => setApprovalModal(null)} className="w-full bg-white/5 text-white font-black py-4 rounded-xl uppercase tracking-widest text-xs">Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
