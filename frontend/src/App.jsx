import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';

// Pages
import AuthPage from './pages/AuthPage';
import ChatPage from './pages/ChatPage';
import CurrentWeatherPage from './pages/CurrentWeatherPage';
import ForecastPage from './pages/ForecastPage';
import WeatherMapPage from './pages/WeatherMapPage';
import AlertsPage from './pages/AlertsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';

const MainContent = () => {
  const { activeScreen } = useApp();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const renderScreen = () => {
    switch (activeScreen) {
      case 'auth':
        return <AuthPage />;
      case 'chat':
        return <ChatPage />;
      case 'current':
        return <CurrentWeatherPage />;
      case 'forecast':
        return <ForecastPage />;
      case 'map':
        return <WeatherMapPage />;
      case 'alerts':
        return <AlertsPage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <ChatPage />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 relative">
      {/* Top Navbar */}
      <Navbar onOpenMobileMenu={() => setIsMobileOpen(true)} />

      {/* Main Body Layout */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto p-4 lg:p-6 gap-6">
        {/* Sidebar */}
        <Sidebar 
          isMobileOpen={isMobileOpen} 
          onCloseMobile={() => setIsMobileOpen(false)} 
        />

        {/* Dynamic Screen Workspace */}
        <main className="flex-1 min-w-0">
          {renderScreen()}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
