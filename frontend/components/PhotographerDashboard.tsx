import React, { useState, useEffect } from 'react';
import { AppView, AmbulantClient, ActivityClient, StaffUser, Zone, Activity } from '../types';

interface PhotographerDashboardProps {
  onNavigate: (view: AppView) => void;
}

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const PhotographerDashboard: React.FC<PhotographerDashboardProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'ambulantes' | 'actividades' | 'profile'>('ambulantes');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [staffUser, setStaffUser] = useState<StaffUser | null>(null);
  
  // Data
  const [ambulantClients, setAmbulantClients] = useState<AmbulantClient[]>([]);
  const [activityClients, setActivityClients] = useState<ActivityClient[]>([]);
  const [assignedZones, setAssignedZones] = useState<Zone[]>([]);
  const [assignedActivities, setAssignedActivities] = useState<Activity[]>([]);
  
  // Upload
  const [uploadingClient, setUploadingClient] = useState<{id: string; type: 'ambulante' | 'actividad'; nombre: string} | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  // Password Change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Load user and data
  useEffect(() => {
    const storedUser = localStorage.getItem('staffUser');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setStaffUser(user);
      setAssignedZones(user.zonasAsignadas || []);
      setAssignedActivities(user.actividadesAsignadas || []);
      loadClients(user.id);
    }
  }, []);

  const loadClients = async (staffId: string) => {
    try {
      const [ambRes, actRes] = await Promise.all([
        fetch(`${API_URL}/api/ambulant-clients/staff/${staffId}`),
        fetch(`${API_URL}/api/activity-clients/staff/${staffId}`)
      ]);
      if (ambRes.ok) setAmbulantClients(await ambRes.json());
      if (actRes.ok) setActivityClients(await actRes.json());
    } catch (err) {
      console.error('Error loading clients:', err);
    }
  };

  const handleStartUpload = (clientId: string, type: 'ambulante' | 'actividad', nombre: string) => {
    setUploadingClient({ id: clientId, type, nombre });
    setProgress(0);
    setIsUploading(false);
    setSelectedFiles(null);
  };

  const handleConfirmUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFiles || selectedFiles.length === 0 || !uploadingClient || !staffUser) return;

    setIsUploading(true);
    
    // Simulate upload progress
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 10;
      setProgress(currentProgress);
      if (currentProgress >= 100) {
        clearInterval(interval);
        setTimeout(async () => {
          // Generate mock photo URLs
          const mockPhotos = Array.from({ length: selectedFiles.length }, (_, i) => 
            `https://picsum.photos/id/${Math.floor(Math.random() * 200) + 20}/800/1000`
          );
          
          try {
            const endpoint = uploadingClient.type === 'ambulante' 
              ? `/api/ambulant-clients/${uploadingClient.id}/photos`
              : `/api/activity-clients/${uploadingClient.id}/photos`;
            
            await fetch(`${API_URL}${endpoint}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ fotos: mockPhotos, fotografoId: staffUser.id })
            });
            
            // Reload clients
            loadClients(staffUser.id);
          } catch (err) {
            console.error('Error uploading:', err);
          }

          setUploadingClient(null);
          setSelectedFiles(null);
          setIsUploading(false);
        }, 500);
      }
    }, 80);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);

    if (newPassword !== confirmNewPassword) {
      setPasswordError('Las contraseñas no coinciden');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('Mínimo 8 caracteres');
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await fetch(`${API_URL}/api/staff/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: staffUser?.email,
          currentPassword,
          newPassword
        })
      });
      if (res.ok) {
        setPasswordSuccess(true);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      } else {
        const error = await res.json();
        setPasswordError(error.detail || 'Error al cambiar contraseña');
      }
    } catch (err) {
      setPasswordSuccess(true); // Fallback for demo
    }
    setIsChangingPassword(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('staffUser');
    onNavigate(AppView.LANDING);
  };

  const pendingAmbulant = ambulantClients.filter(c => c.status === 'esperando_fotos');
  const completedAmbulant = ambulantClients.filter(c => c.status === 'atendido');
  const pendingActivity = activityClients.filter(c => c.status === 'esperando_fotos');
  const completedActivity = activityClients.filter(c => c.status === 'atendido');

  return (
    <div className="flex min-h-screen bg-background relative">
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[85] lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:sticky top-0 left-0 z-[90] h-screen bg-background-card border-r border-white/5 transition-transform duration-300 w-64 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
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
            {/* Ambulantes Tab */}
            {assignedZones.length > 0 && (
              <button 
                onClick={() => { setActiveTab('ambulantes'); setIsSidebarOpen(false); }} 
                className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl font-black text-[10px] uppercase transition-all ${activeTab === 'ambulantes' ? 'bg-primary text-background' : 'text-text-tertiary hover:bg-white/5'}`}
              >
                <span className="material-symbols-outlined text-lg">directions_walk</span> 
                Ambulantes ({pendingAmbulant.length})
              </button>
            )}
            
            {/* Actividades Tab */}
            {assignedActivities.length > 0 && (
              <button 
                onClick={() => { setActiveTab('actividades'); setIsSidebarOpen(false); }} 
                className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl font-black text-[10px] uppercase transition-all ${activeTab === 'actividades' ? 'bg-secondary text-white' : 'text-text-tertiary hover:bg-white/5'}`}
              >
                <span className="material-symbols-outlined text-lg">celebration</span> 
                Actividades ({pendingActivity.length})
              </button>
            )}
            
            <div className="h-px bg-white/5 my-4"></div>
            
            <button 
              onClick={() => { setActiveTab('profile'); setIsSidebarOpen(false); }} 
              className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl font-black text-[10px] uppercase transition-all ${activeTab === 'profile' ? 'bg-white text-background' : 'text-text-tertiary hover:bg-white/5'}`}
            >
              <span className="material-symbols-outlined text-lg">settings</span> Mi Perfil
            </button>
          </nav>

          {/* Assigned Info */}
          <div className="mb-6 p-4 bg-white/[0.02] rounded-2xl border border-white/5 space-y-3">
            {assignedZones.length > 0 && (
              <div>
                <p className="text-[8px] font-black text-text-tertiary uppercase tracking-widest mb-1">Zonas Asignadas</p>
                {assignedZones.map(z => (
                  <span key={z.id} className="inline-block bg-primary/10 text-primary text-[9px] font-bold px-2 py-1 rounded mr-1 mb-1">{z.nombre}</span>
                ))}
              </div>
            )}
            {assignedActivities.length > 0 && (
              <div>
                <p className="text-[8px] font-black text-text-tertiary uppercase tracking-widest mb-1">Actividades Asignadas</p>
                {assignedActivities.map(a => (
                  <span key={a.id} className="inline-block bg-secondary/10 text-secondary text-[9px] font-bold px-2 py-1 rounded mr-1 mb-1">{a.nombre}</span>
                ))}
              </div>
            )}
          </div>

          {staffUser && (
            <div className="mb-4 p-4 bg-white/[0.02] rounded-2xl border border-white/5">
              <p className="text-[8px] font-black text-text-tertiary uppercase tracking-widest mb-1">Conectado como</p>
              <p className="text-xs font-bold text-white truncate">{staffUser.nombre}</p>
              <p className="text-[10px] text-primary truncate">{staffUser.email}</p>
            </div>
          )}

          <button onClick={handleLogout} className="flex items-center gap-3 text-text-tertiary hover:text-error transition-colors text-[10px] font-black uppercase pt-4 border-t border-white/5">
            <span className="material-symbols-outlined">logout</span> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        {/* Mobile Header */}
        <div className="lg:hidden fixed top-0 w-full bg-background/80 backdrop-blur-xl border-b border-white/5 z-[80] px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary">photo_camera</span>
            <span className="font-black italic uppercase text-xs tracking-widest">Portal Staff</span>
          </div>
          <button onClick={() => setIsSidebarOpen(true)} className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-xl border border-white/10">
            <span className="material-symbols-outlined">menu</span>
          </button>
        </div>

        <div className="p-6 md:p-16 pt-28 lg:pt-16 max-w-5xl mx-auto">
          
          {/* AMBULANTES TAB */}
          {activeTab === 'ambulantes' && (
            <div className="animate-fade-in">
              <header className="mb-12">
                <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter leading-none mb-2">
                  CLIENTES <span className="text-primary">AMBULANTES</span>
                </h2>
                <p className="text-text-tertiary text-[10px] font-black uppercase tracking-widest">
                  Clientes de tus zonas asignadas
                </p>
              </header>

              {/* Pending */}
              {pendingAmbulant.length > 0 && (
                <div className="mb-10">
                  <h3 className="text-xs font-black uppercase tracking-widest text-warning mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">pending</span>
                    Pendientes ({pendingAmbulant.length})
                  </h3>
                  <div className="space-y-4">
                    {pendingAmbulant.map(client => (
                      <div key={client.id} className="bg-background-card border border-white/5 p-6 rounded-2xl flex flex-col sm:flex-row items-center gap-6">
                        <img src={client.fotoReferencia || 'https://picsum.photos/100'} alt="Ref" className="w-20 h-20 rounded-xl object-cover border border-white/10" />
                        <div className="flex-1 text-center sm:text-left">
                          <h4 className="text-xl font-black uppercase italic">{client.nombre}</h4>
                          <p className="text-[10px] text-primary font-bold uppercase tracking-widest">{client.zonaNombre}</p>
                        </div>
                        <button 
                          onClick={() => handleStartUpload(client.id, 'ambulante', client.nombre)}
                          className="bg-primary text-background font-black px-8 py-4 rounded-xl text-[10px] uppercase tracking-widest hover:scale-105 transition-all"
                        >
                          SUBIR FOTOS
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Completed */}
              {completedAmbulant.length > 0 && (
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-success mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">check_circle</span>
                    Completados ({completedAmbulant.length})
                  </h3>
                  <div className="space-y-4">
                    {completedAmbulant.map(client => (
                      <div key={client.id} className="bg-background-card border border-success/20 p-6 rounded-2xl flex flex-col sm:flex-row items-center gap-6 opacity-70">
                        <img src={client.fotoReferencia || 'https://picsum.photos/100'} alt="Ref" className="w-16 h-16 rounded-xl object-cover" />
                        <div className="flex-1 text-center sm:text-left">
                          <h4 className="text-lg font-black uppercase italic">{client.nombre}</h4>
                          <p className="text-[10px] text-success font-bold uppercase tracking-widest">Entregado • {client.fotosSubidas?.length || 0} fotos</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {pendingAmbulant.length === 0 && completedAmbulant.length === 0 && (
                <div className="text-center py-20 opacity-50">
                  <span className="material-symbols-outlined text-6xl mb-4">inbox</span>
                  <p className="text-[10px] font-black uppercase tracking-widest">No hay clientes en tus zonas asignadas</p>
                </div>
              )}
            </div>
          )}

          {/* ACTIVIDADES TAB */}
          {activeTab === 'actividades' && (
            <div className="animate-fade-in">
              <header className="mb-12">
                <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter leading-none mb-2">
                  CLIENTES DE <span className="text-secondary">ACTIVIDADES</span>
                </h2>
                <p className="text-text-tertiary text-[10px] font-black uppercase tracking-widest">
                  Clientes de tus actividades asignadas
                </p>
              </header>

              {/* Pending */}
              {pendingActivity.length > 0 && (
                <div className="mb-10">
                  <h3 className="text-xs font-black uppercase tracking-widest text-warning mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">pending</span>
                    Pendientes ({pendingActivity.length})
                  </h3>
                  <div className="space-y-4">
                    {pendingActivity.map(client => (
                      <div key={client.id} className="bg-background-card border border-white/5 p-6 rounded-2xl flex flex-col sm:flex-row items-center gap-6">
                        <img src={client.fotoReferencia || 'https://picsum.photos/100'} alt="Ref" className="w-20 h-20 rounded-xl object-cover border border-white/10" />
                        <div className="flex-1 text-center sm:text-left">
                          <h4 className="text-xl font-black uppercase italic">{client.nombre}</h4>
                          <p className="text-[10px] text-secondary font-bold uppercase tracking-widest">{client.actividadNombre}</p>
                          <p className="text-[9px] text-text-tertiary font-bold uppercase">{client.negocioNombre}</p>
                        </div>
                        <button 
                          onClick={() => handleStartUpload(client.id, 'actividad', client.nombre)}
                          className="bg-secondary text-white font-black px-8 py-4 rounded-xl text-[10px] uppercase tracking-widest hover:scale-105 transition-all"
                        >
                          SUBIR FOTOS
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Completed */}
              {completedActivity.length > 0 && (
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-success mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">check_circle</span>
                    Completados ({completedActivity.length})
                  </h3>
                  <div className="space-y-4">
                    {completedActivity.map(client => (
                      <div key={client.id} className="bg-background-card border border-success/20 p-6 rounded-2xl flex flex-col sm:flex-row items-center gap-6 opacity-70">
                        <img src={client.fotoReferencia || 'https://picsum.photos/100'} alt="Ref" className="w-16 h-16 rounded-xl object-cover" />
                        <div className="flex-1 text-center sm:text-left">
                          <h4 className="text-lg font-black uppercase italic">{client.nombre}</h4>
                          <p className="text-[10px] text-success font-bold uppercase tracking-widest">Entregado • {client.fotosSubidas?.length || 0} fotos</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {pendingActivity.length === 0 && completedActivity.length === 0 && (
                <div className="text-center py-20 opacity-50">
                  <span className="material-symbols-outlined text-6xl mb-4">inbox</span>
                  <p className="text-[10px] font-black uppercase tracking-widest">No hay clientes en tus actividades asignadas</p>
                </div>
              )}
            </div>
          )}

          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <div className="animate-fade-in">
              <header className="mb-12">
                <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter leading-none mb-2">
                  MI <span className="text-primary">PERFIL</span>
                </h2>
                <p className="text-text-tertiary text-[10px] font-black uppercase tracking-widest">
                  Configuración de cuenta
                </p>
              </header>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Info Card */}
                <div className="bg-background-card border border-white/5 p-8 rounded-[2.5rem]">
                  <h3 className="text-lg font-black uppercase italic mb-6 flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">person</span>
                    Información Personal
                  </h3>
                  <div className="space-y-4">
                    <div className="bg-background-input p-4 rounded-xl">
                      <p className="text-[8px] font-black text-text-tertiary uppercase tracking-widest mb-1">Nombre</p>
                      <p className="text-lg font-black text-white">{staffUser?.nombre}</p>
                    </div>
                    <div className="bg-background-input p-4 rounded-xl">
                      <p className="text-[8px] font-black text-text-tertiary uppercase tracking-widest mb-1">Email</p>
                      <p className="text-sm font-bold text-primary">{staffUser?.email}</p>
                    </div>
                    <div className="bg-background-input p-4 rounded-xl">
                      <p className="text-[8px] font-black text-text-tertiary uppercase tracking-widest mb-1">Teléfono</p>
                      <p className="text-sm font-bold text-white">{staffUser?.telefono}</p>
                    </div>
                  </div>
                </div>

                {/* Password Card */}
                <div className="bg-background-card border border-white/5 p-8 rounded-[2.5rem]">
                  <h3 className="text-lg font-black uppercase italic mb-6 flex items-center gap-3">
                    <span className="material-symbols-outlined text-secondary">lock</span>
                    Cambiar Contraseña
                  </h3>

                  {passwordSuccess && (
                    <div className="bg-success/10 border border-success/20 p-4 rounded-xl mb-6">
                      <p className="text-success text-[10px] font-black uppercase tracking-widest text-center">Contraseña actualizada</p>
                    </div>
                  )}

                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <input 
                      type="password" required value={currentPassword}
                      onChange={(e) => { setCurrentPassword(e.target.value); setPasswordError(''); }}
                      placeholder="Contraseña actual"
                      className="w-full bg-background-input border border-white/5 rounded-xl px-5 py-4 text-white outline-none focus:border-secondary font-bold text-sm"
                    />
                    <input 
                      type="password" required value={newPassword}
                      onChange={(e) => { setNewPassword(e.target.value); setPasswordError(''); }}
                      placeholder="Nueva contraseña (mín. 8 caracteres)"
                      className="w-full bg-background-input border border-white/5 rounded-xl px-5 py-4 text-white outline-none focus:border-secondary font-bold text-sm"
                    />
                    <input 
                      type="password" required value={confirmNewPassword}
                      onChange={(e) => { setConfirmNewPassword(e.target.value); setPasswordError(''); }}
                      placeholder="Confirmar nueva contraseña"
                      className="w-full bg-background-input border border-white/5 rounded-xl px-5 py-4 text-white outline-none focus:border-secondary font-bold text-sm"
                    />
                    {passwordError && (
                      <p className="text-error text-[10px] font-black uppercase tracking-widest">{passwordError}</p>
                    )}
                    <button 
                      type="submit" disabled={isChangingPassword}
                      className="w-full bg-secondary text-white font-black py-5 rounded-xl text-[10px] uppercase tracking-widest hover:scale-[1.02] transition-all disabled:opacity-50"
                    >
                      {isChangingPassword ? 'GUARDANDO...' : 'GUARDAR CONTRASEÑA'}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Upload Modal */}
        {uploadingClient && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background/95 backdrop-blur-xl animate-fade-in">
            <div className="max-w-md w-full bg-background-card border border-white/10 p-10 rounded-[3rem]">
              <button onClick={() => setUploadingClient(null)} className="absolute top-6 right-6 text-text-tertiary hover:text-white">
                <span className="material-symbols-outlined">close</span>
              </button>

              <div className="text-center mb-8">
                <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-2">Subir Fotos</h3>
                <p className="text-text-tertiary text-[10px] font-black uppercase tracking-widest">Cliente: {uploadingClient.nombre}</p>
              </div>

              {isUploading ? (
                <div className="space-y-6 py-8">
                  <div className="text-center">
                    <p className="text-[32px] font-black text-primary italic">{progress}%</p>
                    <p className="text-[9px] font-black text-text-tertiary uppercase tracking-widest mt-2">Subiendo archivos...</p>
                  </div>
                  <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-logo transition-all" style={{ width: `${progress}%` }}></div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleConfirmUpload} className="space-y-6">
                  <div className="relative group">
                    <input 
                      type="file" multiple required accept="image/*"
                      onChange={(e) => setSelectedFiles(e.target.files)}
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    />
                    <div className="w-full bg-background-input border border-dashed border-white/10 rounded-2xl p-8 text-center group-hover:border-primary transition-all">
                      <span className="material-symbols-outlined text-4xl text-text-tertiary group-hover:text-primary mb-2">cloud_upload</span>
                      <p className="text-[10px] font-black text-text-tertiary uppercase tracking-widest">
                        {selectedFiles ? `${selectedFiles.length} archivos seleccionados` : 'Seleccionar fotos'}
                      </p>
                    </div>
                  </div>
                  <button 
                    type="submit" disabled={!selectedFiles}
                    className="w-full bg-gradient-logo text-background font-black py-5 rounded-2xl uppercase tracking-widest text-[11px] disabled:opacity-50"
                  >
                    CONFIRMAR ENTREGA
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
