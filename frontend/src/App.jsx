import React, { useState } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import EmergencyBanner from './components/layout/EmergencyBanner';
import FloatingAIChatButton from './components/layout/FloatingAIChatButton';

// Page Views
import CurrentWeatherPage from './pages/CurrentWeatherPage';
import ForecastPage from './pages/ForecastPage';
import WeatherMapPage from './pages/WeatherMapPage';
import AlertsPage from './pages/AlertsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ChatPage from './pages/ChatPage';
import SettingsPage from './pages/SettingsPage';
import AuthPage from './pages/AuthPage';

function App() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = useSelector((state) => state.auth.user);

  const isAuthPage = location.pathname === '/login';

  // Auth guard — redirect unauthenticated users to login
  if (!isAuthPage && !user?.isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (isAuthPage) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen flex flex-col font-sans" style={{ background: 'var(--bg-primary)' }}>
      {/* 1. National Early Warning Emergency Siren Banner */}
      <EmergencyBanner />

      {/* 2. Main Layout Container with Sidebar & Top Navbar */}
      <div className="flex flex-1 relative">
        {/* Navigation Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Content View Area */}
        <div className="flex-1 flex flex-col min-w-0 lg:pl-64 transition-all duration-300">
          <Navbar
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          />

          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1800px] w-full mx-auto">
            <Routes>
              <Route path="/" element={<CurrentWeatherPage />} />
              <Route path="/current" element={<CurrentWeatherPage />} />
              <Route path="/forecast" element={<ForecastPage />} />
              <Route path="/map" element={<WeatherMapPage />} />
              <Route path="/alerts" element={<AlertsPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </div>

      {/* 3. Floating 3D AI Chat Action Button */}
      <FloatingAIChatButton />
    </div>
  );
}

export default App;
