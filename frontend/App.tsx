
import React, { useState } from 'react';
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
import Footer from './components/Footer';

export interface ExtendedClientLead extends ClientLead {
  atendidoPorNombre?: string;
  fotosSubidas?: string[];
}

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.LANDING);
  
  // Estado Global de Clientes (Entregas de fotos)
  const [clientLeads, setClientLeads] = useState<ExtendedClientLead[]>([
    { 
      id: 'L01', 
      nombre: 'Carla Rivera', 
      telefono: '3234764379', 
      instagram: '@carla.riv', 
      aceptaRedes: true, 
      status: 'atendido', 
      atendidoPorNombre: 'staff@fotosexpress.com',
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
    if (newStatus === 'aprobado') {
      alert('Fotógrafo aprobado y añadido al sistema.');
    }
  };

  const renderView = () => {
    switch (currentView) {
      case AppView.LANDING: return <LandingPage onNavigate={setCurrentView} />;
      case AppView.MEMORIES: return <MemoriesPage onNavigate={setCurrentView} clientLeads={clientLeads} />;
      case AppView.CLIENT_REGISTRATION: return <ClientRegistrationPage onNavigate={setCurrentView} />;
      case AppView.PORTFOLIO: return <PortfolioPage onNavigate={setCurrentView} />;
      case AppView.ADMIN: 
        return (
          <AdminDashboard 
            onNavigate={setCurrentView} 
            clientLeads={clientLeads} 
            serviceRequests={serviceRequests}
            staffApplications={staffApplications}
            onDeleteLead={deleteLead} 
            onDeleteService={deleteService}
            onStaffAction={handleStaffAction}
          />
        );
      case AppView.REQUEST_SERVICE: return <RequestServicePage onNavigate={setCurrentView} />;
      case AppView.PHOTOGRAPHER_AUTH: return <PhotographerAuth onNavigate={setCurrentView} />;
      case AppView.PHOTOGRAPHER_DASHBOARD: return <PhotographerDashboard onNavigate={setCurrentView} clientLeads={clientLeads} onUpdateLead={updateLead} />;
      default: return <LandingPage onNavigate={setCurrentView} />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-text-primary">
      {currentView !== AppView.ADMIN && currentView !== AppView.PHOTOGRAPHER_DASHBOARD && (
        <Navbar currentView={currentView} onNavigate={setCurrentView} />
      )}
      <main className="transition-all duration-300">
        {renderView()}
      </main>
      {currentView !== AppView.ADMIN && currentView !== AppView.PHOTOGRAPHER_DASHBOARD && <Footer />}
    </div>
  );
};

export default App;
