
export enum AppView {
  LANDING = 'landing',
  MEMORIES = 'memories', // Receive photos
  CLIENT_REGISTRATION = 'client_registration', // Register to receive photos
  PORTFOLIO = 'portfolio',
  ADMIN = 'admin',
  REQUEST_SERVICE = 'request_service',
  PHOTOGRAPHER_AUTH = 'photographer_auth', // Login/Register for photographers
  PHOTOGRAPHER_DASHBOARD = 'photographer_dashboard'
}

export type UserRole = 'admin' | 'photographer' | 'client';

export interface PhotographerProfile {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  experiencia: string;
  equipo: string;
  especialidades: string[]; 
  fotosReferencia: string[];
  status: 'pendiente' | 'aprobado' | 'rechazado';
}

export interface ClientLead {
  id: string;
  nombre: string;
  telefono: string;
  instagram?: string;
  aceptaRedes: boolean;
  fotoReferencia?: string; // Selfie for ID
  status: 'esperando_fotos' | 'atendido';
  atendidoPorId?: string;
  fechaRegistro: string;
}

export interface ServiceRequest {
  id: string;
  // Fix: Extended allowed types to include values used in the application like 'boda', 'evento_social' and 'corporativo'
  tipo: 'sesion_privada' | 'evento' | 'boda' | 'evento_social' | 'corporativo';
  detalles: {
    locacion: 'estudio' | 'exterior' | 'interior';
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
  cotizacionEstimada?: number;
  fotografoAsignadoId?: string;
  status: 'pendiente' | 'cotizado' | 'asignado';
}
