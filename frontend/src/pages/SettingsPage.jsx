import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Settings, 
  Globe, 
  MapPin, 
  Bell, 
  Volume2, 
  Thermometer, 
  Cpu, 
  Check, 
  Plus, 
  Trash2, 
  Star, 
  Sparkles,
  Save,
  Radio,
  ArrowRight,
  ShieldCheck,
  User,
  Mail,
  Phone,
  Briefcase,
  Building,
  CheckCircle2
} from 'lucide-react';

const SettingsPage = () => {
  const { 
    user,
    updateUserProfile,
    language, 
    setLanguage, 
    SUPPORTED_LANGUAGES,
    selectedCity, 
    setSelectedCity, 
    INDIAN_CITIES,
    notificationsEnabled, 
    setNotificationsEnabled,
    voiceEnabled, 
    setVoiceEnabled,
    voiceSpeed, 
    setVoiceSpeed,
    speakText,
    tempUnit, 
    setTempUnit,
    savedLocations,
    addSavedLocation,
    removeSavedLocation,
    setDefaultSavedLocation,
    setActiveScreen
  } = useApp();

  // User Profile Form State
  const [profileName, setProfileName] = useState(user?.name || 'Ayan Samanta');
  const [profileEmail, setProfileEmail] = useState(user?.email || 'ayan.s@weathergpt.gov.in');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '+91 98765 43210');
  const [profileRole, setProfileRole] = useState(user?.role || 'Lead Meteorologist');
  const [profileLocation, setProfileLocation] = useState(user?.stateDistrict || 'Maharashtra, Pune District');
  const [profileAffiliation, setProfileAffiliation] = useState(user?.affiliation || 'Regional Meteorological Centre (IMD)');
  const [profileSavedSuccess, setProfileSavedSuccess] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Sync state if user changes
  useEffect(() => {
    if (user) {
      if (user.name) setProfileName(user.name);
      if (user.email) setProfileEmail(user.email);
      if (user.phone) setProfilePhone(user.phone);
      if (user.role) setProfileRole(user.role);
      if (user.stateDistrict) setProfileLocation(user.stateDistrict);
      if (user.affiliation) setProfileAffiliation(user.affiliation);
    }
  }, [user]);

  // Handle Profile Save
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSavingProfile(true);
    await updateUserProfile({
      name: profileName.trim(),
      email: profileEmail.trim(),
      phone: profilePhone.trim(),
      role: profileRole,
      stateDistrict: profileLocation.trim(),
      affiliation: profileAffiliation.trim()
    });
    setIsSavingProfile(false);
    setProfileSavedSuccess(true);
    setTimeout(() => {
      setProfileSavedSuccess(false);
    }, 4000);
  };

  // New Location Form State
  const [newLocName, setNewLocName] = useState('');
  const [newLocLat, setNewLocLat] = useState('');
  const [newLocLon, setNewLocLon] = useState('');
  const [isAddingLoc, setIsAddingLoc] = useState(false);

  const handleAddLocationSubmit = async (e) => {
    e.preventDefault();
    if (!newLocName.trim() || !newLocLat || !newLocLon) return;

    await addSavedLocation({
      name: newLocName.trim(),
      latitude: parseFloat(newLocLat),
      longitude: parseFloat(newLocLon),
      isDefault: savedLocations.length === 0
    });

    setNewLocName('');
    setNewLocLat('');
    setNewLocLon('');
    setIsAddingLoc(false);
  };

  const handleTestVoice = () => {
    speakText("WeatherGPT is configured and ready to provide real-time agricultural advisories.");
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-8">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex items-center justify-between shadow-2xl relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
        <div>
          <div className="flex items-center space-x-2 text-cyan-400 text-xs font-semibold mb-1">
            <Settings className="w-4 h-4" />
            <span>Preferences & Identity Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            User Profile & System Control Center
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage your personal stakeholder profile, regional languages, voice speech rate, and monitored farm locations
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 👤 1. USER PROFILE & PERSONAL DETAILS SETTINGS CARD                        */}
      {/* ========================================================================= */}
      <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-slate-800 space-y-6 shadow-2xl relative overflow-hidden">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 via-sky-500 to-blue-600 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-cyan-500/30 border border-white/20">
              {profileName ? profileName.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-white">{profileName}</h2>
                <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-md">
                  {profileRole}
                </span>
              </div>
              <p className="text-xs text-slate-400">{profileEmail}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Verified Identity</span>
            </div>
          </div>
        </div>

        {/* Success Alert Banner */}
        {profileSavedSuccess && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs font-bold flex items-center space-x-2 animate-fade-in backdrop-blur-md">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Personal profile details successfully updated and saved!</span>
          </div>
        )}

        {/* Profile Edit Form */}
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                <User className="w-3.5 h-3.5 text-cyan-400" />
                <span>Full Name</span>
              </label>
              <input
                type="text"
                required
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                placeholder="Your Full Name"
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-2xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition"
              />
            </div>

            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                <Mail className="w-3.5 h-3.5 text-cyan-400" />
                <span>Email Address</span>
              </label>
              <input
                type="email"
                required
                value={profileEmail}
                onChange={(e) => setProfileEmail(e.target.value)}
                placeholder="name@weathergpt.gov.in"
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-2xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition"
              />
            </div>

            {/* Emergency Phone Number for CAP 1.2 SMS */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>Phone / Emergency Warning SMS Number</span>
              </label>
              <input
                type="tel"
                value={profilePhone}
                onChange={(e) => setProfilePhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-2xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition"
              />
            </div>

            {/* Stakeholder Role */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                <Briefcase className="w-3.5 h-3.5 text-amber-400" />
                <span>Stakeholder Role / Persona</span>
              </label>
              <select
                value={profileRole}
                onChange={(e) => setProfileRole(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-2xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition"
              >
                <option value="Lead Meteorologist">Lead Meteorologist / Scientist (IMD)</option>
                <option value="Agricultural Farmer">Agricultural Farmer / Grower</option>
                <option value="Disaster Response Officer">Disaster Response Officer (NDRF / SDMA)</option>
                <option value="General Citizen">General Citizen / Rural Resident</option>
              </select>
            </div>

            {/* Operational District / State */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                <span>Primary Operational State & District</span>
              </label>
              <input
                type="text"
                value={profileLocation}
                onChange={(e) => setProfileLocation(e.target.value)}
                placeholder="e.g. Maharashtra, Pune District"
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-2xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition"
              />
            </div>

            {/* Organization / Farm Plot Details */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                <Building className="w-3.5 h-3.5 text-purple-400" />
                <span>Affiliation / Farm Details</span>
              </label>
              <input
                type="text"
                value={profileAffiliation}
                onChange={(e) => setProfileAffiliation(e.target.value)}
                placeholder="e.g. 15-Acre Precision Crop Plot"
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-2xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSavingProfile}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-sky-600 hover:brightness-110 text-white text-xs font-bold shadow-lg shadow-cyan-500/25 flex items-center space-x-2 transition active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isSavingProfile ? 'Saving Changes...' : 'Save Profile Details'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* ========================================================================= */}
      {/* 2. MULTILINGUAL INDIAN LANGUAGE SELECTION CARD                             */}
      {/* ========================================================================= */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 text-sm font-bold text-white">
            <Globe className="w-5 h-5 text-cyan-400" />
            <span>Multilingual Indian Language Selection (SIH Key Feature 8)</span>
          </div>
          <span className="text-xs text-cyan-400 font-bold">Active: {language}</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {SUPPORTED_LANGUAGES.map((lang) => (
            <button
              key={lang.name}
              onClick={() => setLanguage(lang.name)}
              className={`p-3.5 rounded-2xl border text-left transition flex items-center justify-between ${
                language === lang.name
                  ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-lg shadow-cyan-500/10 scale-102'
                  : 'bg-slate-900/70 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <div>
                <p className="text-xs font-bold">{lang.name}</p>
                <p className="text-[10px] text-slate-400 font-medium">{lang.native}</p>
              </div>
              {language === lang.name && <Check className="w-4 h-4 text-cyan-400" />}
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. SAVED FAVORITE LOCATIONS CRUD                                          */}
      {/* ========================================================================= */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 text-sm font-bold text-white">
            <MapPin className="w-5 h-5 text-cyan-400" />
            <span>Saved Farm & Weather Station Locations</span>
          </div>

          <button
            onClick={() => setIsAddingLoc(!isAddingLoc)}
            className="px-3 py-1.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 text-xs font-bold transition flex items-center space-x-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isAddingLoc ? 'Cancel' : 'Add Location'}</span>
          </button>
        </div>

        {/* Add Location Form */}
        {isAddingLoc && (
          <form onSubmit={handleAddLocationSubmit} className="p-4 rounded-2xl bg-slate-900/90 border border-cyan-500/30 space-y-3">
            <p className="text-xs font-bold text-white">Add New Monitored Farm or District</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Location Name (e.g. Pune Vineyard)"
                required
                value={newLocName}
                onChange={(e) => setNewLocName(e.target.value)}
                className="glass-input rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <input
                type="number"
                step="any"
                placeholder="Latitude (e.g. 18.5204)"
                required
                value={newLocLat}
                onChange={(e) => setNewLocLat(e.target.value)}
                className="glass-input rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <input
                type="number"
                step="any"
                placeholder="Longitude (e.g. 73.8567)"
                required
                value={newLocLon}
                onChange={(e) => setNewLocLon(e.target.value)}
                className="glass-input rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-cyan-500 text-white text-xs font-bold hover:brightness-110 transition shadow-lg shadow-cyan-500/20"
              >
                Save Location
              </button>
            </div>
          </form>
        )}

        {/* Locations List */}
        <div className="space-y-2">
          {savedLocations.map((loc) => (
            <div
              key={loc.id}
              className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 flex items-center justify-between gap-3 text-xs transition"
            >
              <div className="flex items-center space-x-3 min-w-0">
                <button
                  onClick={() => setDefaultSavedLocation(loc.id)}
                  className={`p-1.5 rounded-lg transition ${
                    loc.isDefault ? 'text-amber-400' : 'text-slate-600 hover:text-amber-400'
                  }`}
                  title={loc.isDefault ? 'Default Favorite' : 'Set as Default'}
                >
                  <Star className="w-4 h-4 fill-current" />
                </button>
                <div className="min-w-0">
                  <div className="flex items-center space-x-2">
                    <p className="font-bold text-white truncate">{loc.name}</p>
                    {loc.isDefault && (
                      <span className="px-1.5 py-0.2 text-[9px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Coords: {loc.latitude}°N, {loc.longitude}°E
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    setSelectedCity(loc.name.split(' ')[0]);
                    setActiveScreen('current');
                  }}
                  className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[11px] font-semibold transition"
                >
                  View Telemetry
                </button>
                <button
                  onClick={() => removeSavedLocation(loc.id)}
                  className="p-1.5 rounded-xl text-slate-500 hover:text-red-400 transition"
                  title="Remove Location"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. VOICE SYNTHESIS & RURAL ACCESSIBILITY                                  */}
      {/* ========================================================================= */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4 shadow-2xl">
        <div className="flex items-center space-x-3 text-sm font-bold text-white">
          <Volume2 className="w-5 h-5 text-cyan-400" />
          <span>Voice Synthesis & Rural Accessibility Controls</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
          <div>
            <p className="text-xs font-bold text-white">Auto Text-to-Speech Output</p>
            <p className="text-[11px] text-slate-400">Read AI weather and agricultural advisories aloud in selected language</p>
          </div>
          <button
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition shadow ${
              voiceEnabled ? 'bg-cyan-500 text-white' : 'bg-slate-800 text-slate-400'
            }`}
          >
            {voiceEnabled ? 'Voice Enabled' : 'Voice Disabled'}
          </button>
        </div>

        {voiceEnabled && (
          <div className="space-y-3 pt-2">
            <div className="flex justify-between text-xs text-slate-300">
              <span>Speech Speed Rate:</span>
              <span className="font-bold text-cyan-400">{voiceSpeed}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="1.5"
              step="0.1"
              value={voiceSpeed}
              onChange={(e) => setVoiceSpeed(parseFloat(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
            <div className="flex justify-end">
              <button
                onClick={handleTestVoice}
                className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-cyan-300 text-xs font-semibold hover:bg-slate-800 transition"
              >
                Test Voice Output
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 5. THEME MODE, TEMPERATURE UNITS & SYSTEM ARCHITECTURE                    */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* 🌓 Theme Mode */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-3 shadow-2xl">
          <div className="flex items-center space-x-3 text-sm font-bold text-white">
            {theme === 'light' ? (
              <Sun className="w-5 h-5 text-amber-400" />
            ) : (
              <Moon className="w-5 h-5 text-cyan-400" />
            )}
            <span>Visual Theme Mode</span>
          </div>
          <div className="flex items-center space-x-3 pt-1">
            <button
              onClick={() => setTheme('dark')}
              className={`flex-1 py-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer ${
                theme === 'dark' 
                  ? 'bg-gradient-to-r from-cyan-500 to-sky-600 text-white border-cyan-400 shadow-md shadow-cyan-500/20' 
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              <span>Dark Mode</span>
            </button>
            <button
              onClick={() => setTheme('light')}
              className={`flex-1 py-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer ${
                theme === 'light' 
                  ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-md shadow-amber-500/20' 
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              <span>Light Mode</span>
            </button>
          </div>
        </div>

        {/* Temperature Unit */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-3 shadow-2xl">
          <div className="flex items-center space-x-3 text-sm font-bold text-white">
            <Thermometer className="w-5 h-5 text-cyan-400" />
            <span>Temperature Calibration</span>
          </div>
          <div className="flex items-center space-x-3 pt-1">
            <button
              onClick={() => setTempUnit('C')}
              className={`flex-1 py-2.5 rounded-xl border text-xs font-bold transition ${
                tempUnit === 'C' ? 'bg-cyan-500 text-white border-cyan-400 shadow-md shadow-cyan-500/20' : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              Celsius (°C)
            </button>
            <button
              onClick={() => setTempUnit('F')}
              className={`flex-1 py-2.5 rounded-xl border text-xs font-bold transition ${
                tempUnit === 'F' ? 'bg-cyan-500 text-white border-cyan-400 shadow-md shadow-cyan-500/20' : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              Fahrenheit (°F)
            </button>
          </div>
        </div>

        {/* SIH Specs */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-3 shadow-2xl">
          <div className="flex items-center space-x-3 text-sm font-bold text-white">
            <Cpu className="w-5 h-5 text-cyan-400" />
            <span>System Architecture Overview</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
              <p className="text-[10px] text-slate-400">Gateway</p>
              <p className="font-bold text-cyan-300">Node.js + SSE</p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
              <p className="text-[10px] text-slate-400">GIS Engine</p>
              <p className="font-bold text-cyan-300">React-Leaflet</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default SettingsPage;
