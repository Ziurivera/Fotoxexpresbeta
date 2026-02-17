export enum AppView {
  LANDING = 'landing',
  MEMORIES = 'memories',
  CLIENT_REGISTRATION = 'client_registration',
  PORTFOLIO = 'portfolio',
  ADMIN = 'admin',
  REQUEST_SERVICE = 'request_service',
  PHOTOGRAPHER_AUTH = 'photographer_auth',
  PHOTOGRAPHER_DASHBOARD = 'photographer_dashboard',
  ACCOUNT_ACTIVATION = 'account_activation'
}

// Zones (Ambulant areas)
export interface Zone {
  id: string;
  nombre: string;
  descripcion?: string;
  activa: boolean;
  fotografosAsignados: string[];
}

// Businesses
export interface Business {
  id: string;
  nombre: string;
  direccion?: string;
  telefono?: string;
  activo: boolean;
}

// Activities
export interface Activity {
  id: string;
  nombre: string;
  negocioId: string;
  negocioNombre?: string;
  descripcion?: string;
  activa: boolean;
  fotografosAsignados: string[];
}

// Ambulant Client
export interface AmbulantClient {
  id: string;
  nombre: string;
  telefono: string;
  instagram?: string;
  aceptaPublicidad: boolean;
  fotoReferencia?: string;
  zonaId: string;
  zonaNombre?: string;
  status: 'esperando_fotos' | 'atendido';
  fotografoAsignado?: string;
  fotosSubidas?: string[];
  fechaRegistro?: string;
}

// Activity Client
export interface ActivityClient {
  id: string;
  nombre: string;
  telefono: string;
  negocioId: string;
  negocioNombre?: string;
  actividadId: string;
  actividadNombre?: string;
  fotoReferencia?: string;
  status: 'esperando_fotos' | 'atendido';
  fotografoAsignado?: string;
  fotosSubidas?: string[];
  fechaRegistro?: string;
}

// Service Request
export interface ServiceRequest {
  id: string;
  tipo: string;
  detalles: {
    locacion: string;
    descripcion: string;
    fechaEvento: string;
    horas: number;
    personas: number;
  };
  contacto: {
    nombre: string;
    telefono: string;
    email: string;
  };
  status: string;
}

// Staff Application
export interface StaffApplication {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  experiencia: string;
  equipo: string;
  especialidades: string[];
  fotosReferencia: string[];
  status: string;
}

// Staff User
export interface StaffUser {
  id: string;
  email: string;
  nombre: string;
  telefono: string;
  isActive: boolean;
  zonasAsignadas?: Zone[];
  actividadesAsignadas?: Activity[];
}

// Legacy types for compatibility
export interface ClientLead {
  id: string;
  nombre: string;
  telefono: string;
  instagram?: string;
  aceptaRedes?: boolean;
  status: string;
  fotoReferencia?: string;
  fechaRegistro?: string;
}

export interface PhotographerProfile {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  experiencia: string;
  equipo: string;
  especialidades: string[];
  fotosReferencia: string[];
  status: string;
}
