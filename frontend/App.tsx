import React, { useState, useEffect } from 'react';
import { AppView } from './types';
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

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.LANDING);
  const [activationToken, setActivationToken] = useState<string | null>(null);

  // Check URL for activation token on load
  useEffect(() => {
    const checkActivationUrl = () => {
      const url = new URL(window.location.href);
      const pathname = url.pathname;
      const token = url.searchParams.get('token');
      
      if (pathname === '/activar-cuenta' && token) {
        setActivationToken(token);
        setCurrentView(AppView.ACCOUNT_ACTIVATION);
      }
    };
    
    checkActivationUrl();
    window.addEventListener('popstate', checkActivationUrl);
    return () => window.removeEventListener('popstate', checkActivationUrl);
  }, []);

  const handleNavigate = (view: AppView) => {
    if (view !== AppView.ACCOUNT_ACTIVATION) {
      window.history.pushState({}, '', '/');
    }
    setCurrentView(view);
  };

  const renderView = () => {
    switch (currentView) {
      case AppView.LANDING:
        return <LandingPage onNavigate={handleNavigate} />;
      case AppView.MEMORIES:
        return <MemoriesPage onNavigate={handleNavigate} />;
      case AppView.CLIENT_REGISTRATION:
        return <ClientRegistrationPage onNavigate={handleNavigate} />;
      case AppView.PORTFOLIO:
        return <PortfolioPage onNavigate={handleNavigate} />;
      case AppView.ADMIN:
        return <AdminDashboard onNavigate={handleNavigate} />;
      case AppView.REQUEST_SERVICE:
        return <RequestServicePage onNavigate={handleNavigate} />;
      case AppView.PHOTOGRAPHER_AUTH:
        return <PhotographerAuth onNavigate={handleNavigate} />;
      case AppView.PHOTOGRAPHER_DASHBOARD:
        return <PhotographerDashboard onNavigate={handleNavigate} />;
      case AppView.ACCOUNT_ACTIVATION:
        return <AccountActivationPage onNavigate={handleNavigate} activationToken={activationToken} />;
      default:
        return <LandingPage onNavigate={handleNavigate} />;
    }
  };

  const showNavAndFooter = ![
    AppView.ADMIN,
    AppView.PHOTOGRAPHER_DASHBOARD,
    AppView.ACCOUNT_ACTIVATION
  ].includes(currentView);

  return (
    <div className="min-h-screen bg-background text-text-primary">
      {showNavAndFooter && <Navbar currentView={currentView} onNavigate={handleNavigate} />}
      <main className="transition-all duration-300">
        {renderView()}
      </main>
      {showNavAndFooter && <Footer />}
    </div>
  );
};

export default App;
