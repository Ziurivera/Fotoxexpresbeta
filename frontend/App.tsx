
import React, { useState, useEffect } from 'react';
import { AppView, ClientLead, ServiceRequest, PhotographerProfile } from './types';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import MemoriesPage from './components/MemoriesPage';
import PortfolioPage from './components/PortfolioPage';
import AdminDashboard from './components/AdminDashboard';
import RequestServicePage from './components/RequestServicePage';
import ClientRegistrationPage from './components/ClientRegistrationPage';
import PhotographerAuth from './components/PhotographerAuth';
import PhotographerDashboard from './components/PhotographerDashboard';
import AccountActivationPage from './components/AccountActivationPage';
import Footer from './components/Footer';

export interface ExtendedClientLead extends ClientLead {
  atendidoPorNombre?: string;
  fotosSubidas?: string[];
}

// Extended AppView to include account activation
enum ExtendedAppView {
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

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ExtendedAppView | AppView>(AppView.LANDING);
  const [activationToken, setActivationToken] = useState<string | null>(null);
  
  // Estado Global de Clientes (Entregas de fotos)
  const [clientLeads, setClientLeads] = useState<ExtendedClientLead[]>([
    { 
      id: 'L01', 
      nombre: 'Carla Rivera', 
      telefono: '3234764379', 
      instagram: '@carla.riv', 
      aceptaRedes: true, 
      status: 'atendido', 
      atendidoPorNombre: 'maria@fotosexpress.com',
      fotosSubidas: [
        'https://picsum.photos/id/10/800/1000',
        'https://picsum.photos/id/11/800/1000',
        'https://picsum.photos/id/12/800/1000',
        'https://picsum.photos/id/13/800/1000',
        'https://picsum.photos/id/14/800/1000'
      ],
      fechaRegistro: '2025-02-10' 
    },
    { 
      id: 'L02', 
      nombre: 'Marcos Soto', 
      telefono: '7875550123', 
      instagram: '@marcos_pro', 
      aceptaRedes: false, 
      status: 'esperando_fotos', 
      fechaRegistro: '2025-02-12' 
    }
  ]);

  // Estado Global de Solicitudes de Servicio (Cotizaciones)
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([
    {
      id: 'SR01',
      tipo: 'boda',
      detalles: {
        locacion: 'exterior',
        descripcion: 'Boda en la playa Isabela',
        fechaEvento: '2025-05-20',
        horas: 6,
        personas: 100
      },
      contacto: {
        nombre: 'Valeria Martinez',
        telefono: '787-111-2222',
        email: 'valeria@email.com'
      },
      status: 'pendiente'
    }
  ]);

  // Estado Global de Candidatos a Staff
  const [staffApplications, setStaffApplications] = useState<PhotographerProfile[]>([
    { 
      id: 'P01', 
      nombre: 'Javier Rodriguez', 
      email: 'javier@cam.pr', 
      telefono: '787-999-8888',
      experiencia: '5 años en eventos sociales y bodas.', 
      equipo: 'Sony A7IV, Sigma 24-70mm', 
      especialidades: ['Evento'], 
      fotosReferencia: [], 
      status: 'pendiente' 
    }
  ]);

  // Check URL for activation token on load
  useEffect(() => {
    const checkActivationUrl = () => {
      const url = new URL(window.location.href);
      const pathname = url.pathname;
      const token = url.searchParams.get('token');
      
      if (pathname === '/activar-cuenta' && token) {
        setActivationToken(token);
        setCurrentView(ExtendedAppView.ACCOUNT_ACTIVATION);
      }
    };
    
    checkActivationUrl();
    
    // Handle browser back/forward
    window.addEventListener('popstate', checkActivationUrl);
    return () => window.removeEventListener('popstate', checkActivationUrl);
  }, []);

  // Update URL when view changes
  const handleNavigate = (view: ExtendedAppView | AppView) => {
    if (view !== ExtendedAppView.ACCOUNT_ACTIVATION) {
      // Clear URL params when navigating away from activation
      window.history.pushState({}, '', '/');
    }
    setCurrentView(view);
  };

  const updateLead = (updatedLead: ExtendedClientLead) => {
    setClientLeads(prev => prev.map(l => l.id === updatedLead.id ? updatedLead : l));
  };

  const deleteLead = (id: string) => {
    setClientLeads(prev => prev.filter(l => l.id !== id));
  };

  const deleteService = (id: string) => {
    setServiceRequests(prev => prev.filter(s => s.id !== id));
  };

  const handleStaffAction = (id: string, newStatus: 'aprobado' | 'rechazado') => {
    setStaffApplications(prev => prev.filter(p => p.id !== id));
  };

  const renderView = () => {
    // Account Activation Page
    if (currentView === ExtendedAppView.ACCOUNT_ACTIVATION) {
      return <AccountActivationPage onNavigate={handleNavigate as any} activationToken={activationToken} />;
    }

    switch (currentView) {
      case AppView.LANDING: 
        return <LandingPage onNavigate={handleNavigate as any} />;
      case AppView.MEMORIES: 
        return <MemoriesPage onNavigate={handleNavigate as any} clientLeads={clientLeads} />;
      case AppView.CLIENT_REGISTRATION: 
        return <ClientRegistrationPage onNavigate={handleNavigate as any} />;
      case AppView.PORTFOLIO: 
        return <PortfolioPage onNavigate={handleNavigate as any} />;
      case AppView.ADMIN: 
        return (
          <AdminDashboard 
            onNavigate={handleNavigate as any} 
            clientLeads={clientLeads} 
            serviceRequests={serviceRequests}
            staffApplications={staffApplications}
            onDeleteLead={deleteLead} 
            onDeleteService={deleteService}
            onStaffAction={handleStaffAction}
          />
        );
      case AppView.REQUEST_SERVICE: 
        return <RequestServicePage onNavigate={handleNavigate as any} />;
      case AppView.PHOTOGRAPHER_AUTH: 
        return <PhotographerAuth onNavigate={handleNavigate as any} />;
      case AppView.PHOTOGRAPHER_DASHBOARD: 
        return <PhotographerDashboard onNavigate={handleNavigate as any} clientLeads={clientLeads} onUpdateLead={updateLead} />;
      default: 
        return <LandingPage onNavigate={handleNavigate as any} />;
    }
  };

  const showNavAndFooter = currentView !== AppView.ADMIN && 
                           currentView !== AppView.PHOTOGRAPHER_DASHBOARD && 
                           currentView !== ExtendedAppView.ACCOUNT_ACTIVATION;

  return (
    <div className="min-h-screen bg-background text-text-primary">
      {showNavAndFooter && (
        <Navbar currentView={currentView as AppView} onNavigate={handleNavigate as any} />
      )}
      <main className="transition-all duration-300">
        {renderView()}
      </main>
      {showNavAndFooter && <Footer />}
    </div>
  );
};

export default App;
