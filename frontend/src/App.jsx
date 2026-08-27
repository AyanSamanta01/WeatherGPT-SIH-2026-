import React, { useState } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import EmergencyBanner from './components/layout/EmergencyBanner';
import FloatingAIChatButton from './components/layout/FloatingAIChatButton';

// Pages
import AuthPage from './pages/AuthPage';
import ChatPage from './pages/ChatPage';
import CurrentWeatherPage from './pages/CurrentWeatherPage';
import ForecastPage from './pages/ForecastPage';
import WeatherMapPage from './pages/WeatherMapPage';
import AlertsPage from './pages/AlertsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';

// Protected Dashboard Layout with React Router Outlet
const DashboardLayout = () => {
  const { user } = useApp();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // If unauthenticated, redirect to /login
  if (!user || !user.isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 relative selection:bg-cyan-500 selection:text-white">
      {/* Top Emergency Dissemination Banner */}
      <EmergencyBanner />

      {/* Top Navbar with Hamburger Sidebar Toggle */}
      <Navbar 
        isSidebarOpen={isSidebarOpen} 
        onToggleSidebar={() => setIsSidebarOpen(prev => !prev)} 
      />

      {/* Main Body Layout with items-start for Sticky Sidebar */}
      <div className="flex-1 flex items-start max-w-[1600px] w-full mx-auto p-4 lg:p-6 gap-6">
        {/* Left Sidebar Navigation */}
        <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
        />

        {/* Dynamic Screen Workspace via React Router */}
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>

      {/* 🤖 Floating Action Button for WeatherGPT AI Chat in Right Bottom Corner */}
      <FloatingAIChatButton />
    </div>
  );
};

// Auth Guard Route for /login
const AuthRoute = () => {
  const { user } = useApp();
  if (user && user.isLoggedIn) {
    return <Navigate to="/current" replace />;
  }
  return <AuthPage />;
};

export default function App() {
  return (
    <AppProvider>
      <Routes>
        {/* Auth Gateway */}
        <Route path="/login" element={<AuthRoute />} />

        {/* Authenticated Dashboard Routes */}
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Navigate to="/current" replace />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/current" element={<CurrentWeatherPage />} />
          <Route path="/forecast" element={<ForecastPage />} />
          <Route path="/map" element={<WeatherMapPage />} />
          <Route path="/alerts" element={<AlertsPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        {/* Catch-all fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppProvider>
  );
}
