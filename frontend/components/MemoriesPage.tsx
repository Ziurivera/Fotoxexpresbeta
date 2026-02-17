import React, { useState, useEffect } from 'react';
import { AppView, AmbulantClient, ActivityClient, Business, Activity, Zone } from '../types';

interface MemoriesPageProps {
  onNavigate: (view: AppView) => void;
}

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const countryCodes = [
  { code: '+1', country: 'PR/US' },
  { code: '+1-809', country: 'DO' },
  { code: '+52', country: 'MX' },
  { code: '+34', country: 'ES' },
];

const MemoriesPage: React.FC<MemoriesPageProps> = ({ onNavigate }) => {
  // Tab state
  const [activeTab, setActiveTab] = useState<'ambulante' | 'actividad'>('ambulante');
  
  // Search state
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+1');
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');
  
  // Activity selection state
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState('');
  const [selectedActivity, setSelectedActivity] = useState('');
  
  // Results
  const [ambulantResult, setAmbulantResult] = useState<AmbulantClient | null>(null);
  const [activityResult, setActivityResult] = useState<ActivityClient | null>(null);
  
  // Gallery state
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Load businesses and activities
  useEffect(() => {
    const loadData = async () => {
      try {
        const [bizRes, actRes] = await Promise.all([
          fetch(`${API_URL}/api/businesses/active`),
          fetch(`${API_URL}/api/activities/active`)
        ]);
        if (bizRes.ok) setBusinesses(await bizRes.json());
        if (actRes.ok) setActivities(await actRes.json());
      } catch (err) {
        console.error('Error loading data:', err);
      }
    };
    loadData();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setAmbulantResult(null);
    setActivityResult(null);
    setIsSearching(true);

    const fullPhone = phone.replace(/\D/g, '');

    try {
      if (activeTab === 'ambulante') {
        const res = await fetch(`${API_URL}/api/ambulant-clients/phone/${fullPhone}`);
        if (res.ok) {
          setAmbulantResult(await res.json());
        } else {
          setError('No encontramos fotos asociadas a este número. Verifica e intenta de nuevo.');
        }
      } else {
        if (!selectedBusiness || !selectedActivity) {
          setError('Por favor selecciona el negocio y la actividad.');
          setIsSearching(false);
          return;
        }
        const res = await fetch(`${API_URL}/api/activity-clients/phone/${fullPhone}?negocioId=${selectedBusiness}&actividadId=${selectedActivity}`);
        if (res.ok) {
          setActivityResult(await res.json());
        } else {
          setError('No encontramos fotos asociadas a este número en esta actividad.');
        }
      }
    } catch (err) {
      setError('Error de conexión. Intenta de nuevo.');
    }

    setIsSearching(false);
  };

  const currentResult = activeTab === 'ambulante' ? ambulantResult : activityResult;
  const currentPhotos = currentResult?.fotosSubidas || [];

  const resetSearch = () => {
    setAmbulantResult(null);
    setActivityResult(null);
    setPhone('');
    setError('');
    setSelectedBusiness('');
    setSelectedActivity('');
  };

  // Filter activities by selected business
  const filteredActivities = activities.filter(a => a.negocioId === selectedBusiness);

  return (
    <div className="min-h-screen pt-28 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-black uppercase italic tracking-tighter leading-none mb-4">
            MIS <span className="text-primary">FOTOS</span>
          </h1>
          <p className="text-text-tertiary text-[11px] uppercase tracking-[0.4em] font-bold">
            Busca y descarga tus fotografías HD
          </p>
        </div>

        {/* Show results or search form */}
        {currentResult && currentResult.status === 'atendido' ? (
          // GALLERY VIEW
          <div className="animate-fade-in">
            <div className="bg-background-card border border-white/5 rounded-[3rem] p-8 md:p-12 mb-8">
              <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
                {currentResult.fotoReferencia && (
                  <img 
                    src={currentResult.fotoReferencia} 
                    alt="Referencia" 
                    className="w-24 h-24 rounded-2xl object-cover border border-white/10"
                  />
                )}
                <div className="text-center md:text-left">
                  <h2 className="text-3xl font-black uppercase italic tracking-tighter">{currentResult.nombre}</h2>
                  <p className="text-text-tertiary text-[10px] uppercase tracking-widest font-bold mt-1">
                    {activeTab === 'ambulante' 
                      ? `Zona: ${(ambulantResult as AmbulantClient)?.zonaNombre}`
                      : `${(activityResult as ActivityClient)?.negocioNombre} • ${(activityResult as ActivityClient)?.actividadNombre}`
                    }
                  </p>
                  <p className="text-primary text-xs font-bold mt-2">{currentPhotos.length} fotos disponibles</p>
                </div>
              </div>

              {/* Photo Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {currentPhotos.map((url, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => setLightboxIndex(idx)}
                    className="aspect-[4/5] rounded-2xl overflow-hidden cursor-pointer group relative bg-background-input border border-white/5"
                  >
                    <img src={url} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <span className="material-symbols-outlined text-white text-3xl">zoom_in</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button 
              onClick={resetSearch}
              className="w-full bg-white/5 text-white font-black py-5 rounded-2xl uppercase tracking-widest text-xs hover:bg-white/10 transition-all"
            >
              BUSCAR OTRA PERSONA
            </button>
          </div>
        ) : currentResult && currentResult.status === 'esperando_fotos' ? (
          // WAITING VIEW
          <div className="bg-background-card border border-warning/20 rounded-[3rem] p-12 text-center animate-fade-in">
            <div className="w-24 h-24 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-8">
              <span className="material-symbols-outlined text-warning text-5xl animate-pulse">hourglass_top</span>
            </div>
            <h2 className="text-2xl font-black uppercase italic tracking-tighter mb-4">Fotos en Proceso</h2>
            <p className="text-text-secondary text-sm mb-8">
              ¡Hola <strong>{currentResult.nombre}</strong>! Tus fotos aún están siendo procesadas. 
              Te notificaremos cuando estén listas.
            </p>
            <button onClick={resetSearch} className="bg-white text-background font-black py-4 px-10 rounded-2xl uppercase tracking-widest text-xs">
              VOLVER
            </button>
          </div>
        ) : (
          // SEARCH FORM
          <div className="animate-fade-in">
            {/* Tab Selector */}
            <div className="flex bg-background-card border border-white/5 rounded-2xl p-2 mb-8">
              <button
                onClick={() => { setActiveTab('ambulante'); resetSearch(); }}
                className={`flex-1 py-4 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                  activeTab === 'ambulante' 
                    ? 'bg-primary text-background' 
                    : 'text-text-tertiary hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-lg align-middle mr-2">directions_walk</span>
                FOTOS AMBULANTES
              </button>
              <button
                onClick={() => { setActiveTab('actividad'); resetSearch(); }}
                className={`flex-1 py-4 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                  activeTab === 'actividad' 
                    ? 'bg-secondary text-background' 
                    : 'text-text-tertiary hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-lg align-middle mr-2">celebration</span>
                FOTOS DE ACTIVIDAD
              </button>
            </div>

            {/* Search Form */}
            <div className="bg-background-card border border-white/5 rounded-[3rem] p-8 md:p-12">
              <div className="text-center mb-10">
                <div className={`w-20 h-20 ${activeTab === 'ambulante' ? 'bg-primary/10' : 'bg-secondary/10'} rounded-full flex items-center justify-center mx-auto mb-6`}>
                  <span className={`material-symbols-outlined text-4xl ${activeTab === 'ambulante' ? 'text-primary' : 'text-secondary'}`}>
                    {activeTab === 'ambulante' ? 'photo_camera' : 'event'}
                  </span>
                </div>
                <h2 className="text-2xl font-black uppercase italic tracking-tighter mb-2">
                  {activeTab === 'ambulante' ? 'Fotos Ambulantes' : 'Fotos de Actividad'}
                </h2>
                <p className="text-text-tertiary text-[10px] uppercase tracking-widest font-bold">
                  {activeTab === 'ambulante' 
                    ? 'Fotos tomadas en la calle o lugares públicos'
                    : 'Fotos de eventos, fiestas y celebraciones'
                  }
                </p>
              </div>

              <form onSubmit={handleSearch} className="space-y-6">
                {/* Activity Selection (only for actividad tab) */}
                {activeTab === 'actividad' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-text-tertiary uppercase tracking-widest ml-2">
                        Selecciona el Negocio
                      </label>
                      <select
                        value={selectedBusiness}
                        onChange={(e) => { setSelectedBusiness(e.target.value); setSelectedActivity(''); }}
                        className="w-full bg-background-input border border-white/5 rounded-2xl px-6 py-5 text-white font-bold outline-none focus:border-secondary transition-all appearance-none cursor-pointer"
                        required
                      >
                        <option value="">-- Seleccionar negocio --</option>
                        {businesses.map(b => (
                          <option key={b.id} value={b.id}>{b.nombre}</option>
                        ))}
                      </select>
                    </div>

                    {selectedBusiness && (
                      <div className="space-y-2 animate-fade-in">
                        <label className="text-[10px] font-black text-text-tertiary uppercase tracking-widest ml-2">
                          Selecciona la Actividad
                        </label>
                        <select
                          value={selectedActivity}
                          onChange={(e) => setSelectedActivity(e.target.value)}
                          className="w-full bg-background-input border border-white/5 rounded-2xl px-6 py-5 text-white font-bold outline-none focus:border-secondary transition-all appearance-none cursor-pointer"
                          required
                        >
                          <option value="">-- Seleccionar actividad --</option>
                          {filteredActivities.map(a => (
                            <option key={a.id} value={a.id}>{a.nombre}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                )}

                {/* Phone Input */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-text-tertiary uppercase tracking-widest ml-2">
                    Tu Número de Teléfono
                  </label>
                  <div className="flex gap-3">
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="bg-background-input border border-white/5 rounded-2xl px-4 py-5 text-white font-bold outline-none appearance-none cursor-pointer w-28"
                    >
                      {countryCodes.map(c => (
                        <option key={c.code} value={c.code}>{c.code}</option>
                      ))}
                    </select>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="787-000-0000"
                      className="flex-1 bg-background-input border border-white/5 rounded-2xl px-6 py-5 text-white font-bold outline-none focus:border-primary transition-all"
                    />
                  </div>
                </div>

                {error && (
                  <div className="bg-error/10 border border-error/20 p-4 rounded-xl">
                    <p className="text-error text-[11px] font-black uppercase tracking-widest text-center">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSearching || (activeTab === 'actividad' && (!selectedBusiness || !selectedActivity))}
                  className={`w-full font-black py-6 rounded-2xl uppercase tracking-widest text-xs transition-all disabled:opacity-50 flex items-center justify-center gap-3 ${
                    activeTab === 'ambulante' 
                      ? 'bg-gradient-logo text-background hover:scale-[1.02]' 
                      : 'bg-secondary text-white hover:scale-[1.02]'
                  }`}
                >
                  {isSearching ? (
                    <>
                      <span className="material-symbols-outlined animate-spin">sync</span>
                      BUSCANDO...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined">search</span>
                      BUSCAR MIS FOTOS
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Lightbox */}
        {lightboxIndex !== null && currentPhotos.length > 0 && (
          <div 
            className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in"
            onClick={() => setLightboxIndex(null)}
          >
            <button 
              onClick={() => setLightboxIndex(null)}
              className="absolute top-6 right-6 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all z-10"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            {lightboxIndex > 0 && (
              <button
                onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex - 1); }}
                className="absolute left-4 md:left-8 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
            )}

            {lightboxIndex < currentPhotos.length - 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex + 1); }}
                className="absolute right-4 md:right-8 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all"
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            )}

            <img
              src={currentPhotos[lightboxIndex]}
              alt="Foto HD"
              className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4">
              <span className="text-white/60 text-[10px] font-black uppercase tracking-widest">
                {lightboxIndex + 1} / {currentPhotos.length}
              </span>
              <a
                href={currentPhotos[lightboxIndex]}
                download
                onClick={(e) => e.stopPropagation()}
                className="bg-primary text-background px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-all"
              >
                <span className="material-symbols-outlined text-lg">download</span>
                DESCARGAR
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemoriesPage;
