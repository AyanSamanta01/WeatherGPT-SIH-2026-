import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { alertService } from '../services/api';
import { 
  AlertTriangle, 
  ShieldAlert, 
  BellRing, 
  CheckCircle2, 
  MapPin, 
  Clock, 
  UserCheck, 
  Filter, 
  Sparkles, 
  Zap, 
  Radio, 
  ArrowRight, 
  PlusCircle, 
  RefreshCw,
  Flame,
  CloudLightning,
  Waves,
  Send,
  Share2,
  Volume2
} from 'lucide-react';

const AlertsPage = () => {
  const { 
    selectedCity, 
    notificationsEnabled, 
    setNotificationsEnabled, 
    triggerSimulatedAlert, 
    setActiveScreen, 
    activeAlertsList,
    speakText
  } = useApp();

  const [severityFilter, setSeverityFilter] = useState('All');
  const [alerts, setAlerts] = useState(activeAlertsList || []);
  const [loading, setLoading] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);

  // 3D Parallax Tilt for Header Card
  const [heroTilt, setHeroTilt] = useState({ x: 0, y: 0, glareX: 50, glareY: 50 });
  const heroCardRef = useRef(null);

  const handleHeroMouseMove = useCallback((e) => {
    if (!heroCardRef.current) return;
    const rect = heroCardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rotateX = ((y / rect.height) - 0.5) * -6;
    const rotateY = ((x / rect.width) - 0.5) * 6;
    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;
    setHeroTilt({ x: rotateX, y: rotateY, glareX, glareY });
  }, []);

  const handleHeroMouseLeave = () => {
    setHeroTilt({ x: 0, y: 0, glareX: 50, glareY: 50 });
  };

  useEffect(() => {
    const fetchAlerts = async () => {
      setLoading(true);
      try {
        const data = await alertService.getAlerts();
        if (data && data.length > 0) {
          setAlerts(data);
        }
      } catch (err) {
        console.warn('Failed to load alerts from backend:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAlerts();
  }, []);

  // Update whenever activeAlertsList in global context changes
  useEffect(() => {
    if (activeAlertsList && activeAlertsList.length > 0) {
      setAlerts(activeAlertsList);
    }
  }, [activeAlertsList]);

  const filteredAlerts = alerts.filter(alert => {
    if (severityFilter === 'All') return true;
    return alert.severity?.toLowerCase() === severityFilter.toLowerCase();
  });

  // Calculate statistics
  const redCount = alerts.filter(a => a.severity?.toLowerCase() === 'extreme' || a.color === 'red').length;
  const orangeCount = alerts.filter(a => a.severity?.toLowerCase() === 'severe' || a.color === 'orange').length;

  const handleSimulateCapIngest = async () => {
    setIsSimulating(true);
    const demoCap = {
      id: 'CAP-' + Date.now().toString().slice(-4),
      headline: 'Extreme Red Alert: Severe Coastal Squall & Heavy Monsoon Inundation',
      title: 'Red Alert: Severe Coastal Squall & Inundation',
      severity: 'extreme',
      event: 'cyclone',
      areaDesc: 'Maharashtra Coastal Belt & Mumbai Metro',
      locationName: 'Maharashtra Coastal Belt',
      latitude: 19.0760,
      longitude: 72.8777,
      radiusKm: 120,
      description: 'Official Common Alerting Protocol (CAP 1.2) emergency warning bulletin issued by India Meteorological Department & NDMA. Squall gusts up to 95 km/h with heavy tidal surges.',
      instruction: 'Suspend agricultural spraying and harvest transit immediately. Secure livestock and coastal vessels.',
      senderName: 'India Meteorological Department (IMD / NDMA Feed)',
      affectedRegions: ['Mumbai Metro', 'Raigad Coast', 'Thane District', 'Ratnagiri Belt'],
      advisories: [
        'Suspend all open field agricultural operations and irrigation pumps.',
        'Clear farm drainage channels to prevent root waterlogging in standing crops.',
        'Mooring warning for small marine vessels and coastal artisanal fisheries.',
        'Secure greenhouse polytunnels and rooftop solar structures against 90 km/h wind shear.'
      ]
    };

    try {
      const created = await alertService.ingestCapAlert(demoCap);
      triggerSimulatedAlert(created);
      setAlerts(prev => [created, ...prev]);
      speakText("Emergency CAP Alert ingested. Red Alert issued for coastal storm squall.");
    } catch (err) {
      triggerSimulatedAlert(demoCap);
      setAlerts(prev => [demoCap, ...prev]);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="space-y-6 select-none perspective-[1200px] pb-10">
      
      {/* ========================================================================= */}
      {/* 1. 3D LIQUID HERO DISASTER DISSEMINATION HEADER                           */}
      {/* ========================================================================= */}
      <div 
        ref={heroCardRef}
        onMouseMove={handleHeroMouseMove}
        onMouseLeave={handleHeroMouseLeave}
        className="liquid-sidebar rounded-3xl p-6 sm:p-7 relative overflow-hidden shadow-2xl transition-transform duration-300 ease-out transform-gpu group"
        style={{
          transform: `rotateX(${heroTilt.x}deg) rotateY(${heroTilt.y}deg)`,
          transformStyle: 'preserve-3d'
        }}
      >
        {/* Specular Liquid Glare Overlay */}
        <div 
          className="absolute inset-0 pointer-events-none z-30 opacity-70 transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at ${heroTilt.glareX}% ${heroTilt.glareY}%, rgba(255, 255, 255, 0.18) 0%, rgba(239, 68, 68, 0.08) 35%, transparent 70%)`
          }}
        />

        {/* Ambient Morphing Red/Amber Warning Blobs */}
        <div className="absolute top-0 right-10 w-96 h-96 bg-gradient-to-br from-red-600/20 via-rose-600/15 to-orange-600/15 rounded-full blur-3xl animate-liquid-1 pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-gradient-to-tr from-amber-500/15 to-rose-600/20 rounded-full blur-3xl animate-liquid-2 pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2.5">
            <div className="flex items-center space-x-2.5">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-red-500/20 border border-red-400/40 text-red-300 text-xs font-bold backdrop-blur-md shadow-sm">
                <ShieldAlert className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                <span>CAP 1.2 Standard Dissemination Engine</span>
              </div>
              <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider bg-red-500/20 text-red-300 border border-red-500/30 rounded-md">
                {redCount} Extreme Alerts Active
              </span>
            </div>

            <div>
              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight drop-shadow-md">
                Active Severe Weather & Disaster Bulletins
              </h1>
              <p className="text-xs text-slate-300/90 font-medium mt-1">
                Authoritative early warning dispatches ingested directly from India Meteorological Department (IMD) & National Disaster Management Authority (NDMA).
              </p>
            </div>
          </div>

          {/* Action Trigger Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleSimulateCapIngest}
              disabled={isSimulating}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:brightness-110 text-white text-xs font-black shadow-lg shadow-red-600/30 flex items-center space-x-2 transition active:scale-95 cursor-pointer border border-red-400/40"
              title="Simulate Official CAP 1.2 Alert Ingestion"
            >
              <Radio className={`w-4 h-4 ${isSimulating ? 'animate-spin text-white' : 'animate-pulse text-amber-300'}`} />
              <span>{isSimulating ? 'Ingesting Bulletin...' : 'Test Ingest CAP 1.2 Alert'}</span>
            </button>

            <button
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              className={`px-4 py-2.5 rounded-2xl border text-xs font-bold flex items-center space-x-2 transition cursor-pointer active:scale-95 ${
                notificationsEnabled 
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-lg shadow-emerald-500/10' 
                  : 'bg-slate-900/90 text-slate-300 border-white/10 hover:border-cyan-400/40'
              }`}
            >
              <BellRing className={`w-4 h-4 ${notificationsEnabled ? 'animate-bounce text-emerald-400' : ''}`} />
              <span>{notificationsEnabled ? 'Push Alerts Active' : 'Enable Push Alerts'}</span>
            </button>
          </div>
        </div>

        {/* Severity Filter Tabs */}
        <div className="mt-5 pt-4 border-t border-white/10 flex items-center space-x-2 overflow-x-auto scrollbar-none relative z-10">
          <span className="text-xs font-bold text-slate-300 flex items-center space-x-1 flex-shrink-0 mr-1">
            <Filter className="w-3.5 h-3.5 text-cyan-400" />
            <span>Filter Severity:</span>
          </span>
          {[
            { id: 'All', label: 'All Active Bulletins', count: alerts.length },
            { id: 'Extreme', label: 'Extreme Red Alert', count: redCount },
            { id: 'Severe', label: 'Severe Orange Alert', count: orangeCount },
            { id: 'Advisory', label: 'Advisory Level', count: alerts.length - redCount - orangeCount }
          ].map((lvl) => {
            const isActive = severityFilter.toLowerCase() === lvl.id.toLowerCase();
            return (
              <button
                key={lvl.id}
                onClick={() => setSeverityFilter(lvl.id)}
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-2xl text-xs font-bold transition flex-shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500 to-sky-600 text-white shadow-lg shadow-cyan-500/30 border border-cyan-300/40 scale-105'
                    : 'bg-slate-900/90 text-slate-300 hover:text-white border border-white/10 hover:border-cyan-400/40'
                }`}
              >
                <span>{lvl.label}</span>
                <span className={`text-[9px] px-1.5 py-0.2 rounded-md font-black ${
                  isActive ? 'bg-white/20 text-white' : 'bg-white/10 text-cyan-300'
                }`}>
                  {lvl.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. 3D SEVERE WARNING BULLETIN CARDS MATRIX                                 */}
      {/* ========================================================================= */}
      <div className="space-y-6">
        {filteredAlerts.map((alert) => {
          const isRed = alert.severity?.toLowerCase() === 'extreme' || alert.color === 'red';
          const isOrange = alert.severity?.toLowerCase() === 'severe' || alert.color === 'orange';

          return (
            <div
              key={alert.id}
              className={`liquid-sidebar rounded-3xl p-6 sm:p-7 relative overflow-hidden transition-all duration-300 shadow-2xl hover:-translate-y-1 hover:shadow-2xl group ${
                isRed 
                  ? 'border-2 border-red-500/60 shadow-red-950/40' 
                  : isOrange 
                  ? 'border-2 border-orange-500/60 shadow-orange-950/40'
                  : 'border border-amber-500/40 shadow-amber-950/30'
              }`}
            >
              {/* Dynamic Warning Ambient Glow Background */}
              <div className={`absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl pointer-events-none ${
                isRed ? 'bg-red-500/15' : isOrange ? 'bg-orange-500/15' : 'bg-amber-500/10'
              }`} />

              <div className="space-y-4 relative z-10">
                
                {/* Card Top Header Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3.5">
                  <div className="flex items-center space-x-3">
                    <span className={`px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-md ${
                      isRed 
                        ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-red-500/40 border border-red-400/50' 
                        : isOrange 
                        ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-orange-500/40 border border-orange-400/50' 
                        : 'bg-amber-400 text-slate-950 font-black'
                    }`}>
                      {alert.severity} Hazard Classification
                    </span>
                    <span className="text-xs text-slate-400 font-bold">CAP Ref: {alert.id}</span>
                  </div>

                  <div className="flex items-center space-x-2 text-xs text-slate-300">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Dispatched: {alert.issuedAt || new Date().toLocaleTimeString()}</span>
                  </div>
                </div>

                {/* Title and Headline */}
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-white leading-snug drop-shadow">
                    {alert.title || alert.headline}
                  </h2>
                  <p className="text-xs text-slate-200 mt-2 leading-relaxed font-medium">
                    {alert.summary || alert.description}
                  </p>
                </div>

                {/* Affected Sub-Districts & Regional Grids */}
                {alert.affectedRegions && alert.affectedRegions.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[11px] uppercase font-black text-cyan-400 flex items-center gap-1.5 tracking-wider">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400" /> Affected Sub-Districts & Agricultural Mandals:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {alert.affectedRegions.map((region, idx) => (
                        <span key={idx} className="px-3 py-1 rounded-xl bg-slate-900/90 border border-white/15 text-slate-200 text-xs font-bold shadow-sm">
                          {region}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actionable Guidelines Matrix */}
                {alert.advisories && alert.advisories.length > 0 && (
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/10 space-y-2.5">
                    <span className="text-xs font-extrabold text-cyan-300 flex items-center gap-1.5">
                      <UserCheck className="w-4 h-4 text-cyan-400" /> Immediate Farmer & Public Safety Protocols:
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
                      {alert.advisories.map((adv, idx) => (
                        <div key={idx} className="flex items-start space-x-2.5 text-xs text-slate-200 p-2.5 rounded-xl bg-slate-900/80 border border-white/10">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 flex-shrink-0 shadow-sm shadow-cyan-400" />
                          <span className="leading-relaxed font-medium">{adv}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Footer Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                  <span className="text-[11px] text-slate-400 font-semibold">
                    Dissemination Authority: <strong className="text-slate-200">{alert.issuedBy || alert.senderName || 'IMD Official Dissemination Feed'}</strong>
                  </span>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setActiveScreen('map')}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-900/90 border border-white/15 text-cyan-300 hover:text-white hover:border-cyan-400 text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer"
                    >
                      <span>Locate on GIS Map</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setActiveScreen('chat')}
                      className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-600 text-white text-xs font-black shadow-md shadow-cyan-500/25 hover:brightness-110 transition cursor-pointer"
                    >
                      Query AI Advisory
                    </button>
                  </div>
                </div>

              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};

export default AlertsPage;
