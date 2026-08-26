import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Settings as SettingsIcon, 
  User, 
  Globe, 
  Volume2, 
  MapPin, 
  Plus, 
  Trash2, 
  Check, 
  Save, 
  ShieldCheck,
  Bell,
  Sparkles
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { addLocation, deleteLocation, setDefaultLocation } from '../store/slices/locationsSlice';
import { updateUserProfile } from '../store/slices/authSlice';

const SettingsPage = () => {
  const dispatch = useDispatch();
  const { 
    user, 
    language, 
    setLanguage, 
    supportedLanguages, 
    voiceEnabled, 
    setVoiceEnabled, 
    voiceSpeed, 
    setVoiceSpeed,
    speakText
  } = useApp();

  const savedLocations = useSelector(state => state.locations.savedLocations || []);

  const [userName, setUserName] = useState(user?.name || 'Ayan Samanta');
  const [userEmail, setUserEmail] = useState(user?.email || 'user@weathergpt.gov.in');
  const [userRole, setUserRole] = useState(user?.role || 'Meteorology Lead');
  const [savedStatus, setSavedStatus] = useState(false);

  // New location form state
  const [showAddLoc, setShowAddLoc] = useState(false);
  const [newLocName, setNewLocName] = useState('');
  const [newLocCity, setNewLocCity] = useState('Mumbai');
  const [newLocType, setNewLocType] = useState('Agriculture');

  const handleSaveProfile = (e) => {
    e.preventDefault();
    dispatch(updateUserProfile({
      name: userName,
      email: userEmail,
      role: userRole
    }));
    setSavedStatus(true);
    setTimeout(() => setSavedStatus(false), 2500);
  };

  const handleAddLocation = (e) => {
    e.preventDefault();
    if (!newLocName.trim()) return;

    const newLoc = {
      id: 'loc-' + Date.now().toString().slice(-4),
      name: newLocName.trim(),
      city: newLocCity,
      state: 'India',
      type: newLocType,
      lat: 19.076,
      lon: 72.877,
      isDefault: false
    };

    dispatch(addLocation(newLoc));
    setNewLocName('');
    setShowAddLoc(false);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2">
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            User Preferences & Farm Locations
          </h1>
          <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold">
            Personalization
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Customize meteorological alerts, regional voice dialects, and favorite agricultural telemetry points.
        </p>
      </div>

      {/* Profile Section */}
      <form onSubmit={handleSaveProfile} className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm font-bold text-white">
            <User className="w-4 h-4 text-cyan-400" />
            <span>Profile Information</span>
          </div>

          {savedStatus && (
            <span className="text-xs font-bold text-emerald-400 flex items-center space-x-1 animate-in fade-in">
              <Check className="w-3.5 h-3.5" />
              <span>Saved Successfully!</span>
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-400">Full Name</label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-400">Official Email</label>
            <input
              type="email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-400">Primary Role</label>
            <select
              value={userRole}
              onChange={(e) => setUserRole(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="Meteorology Lead">Meteorology Lead</option>
              <option value="Disaster Response Officer">Disaster Response Officer</option>
              <option value="Agricultural Extension Officer">Agricultural Extension Officer</option>
              <option value="Progressive Farmer (Kisan)">Progressive Farmer (Kisan)</option>
              <option value="Climate Researcher">Climate Researcher</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 shadow-lg shadow-cyan-500/25 transition"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Profile</span>
          </button>
        </div>
      </form>

      {/* Voice & Multilingual Preferences */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-xl space-y-5">
        <div className="flex items-center space-x-2 text-sm font-bold text-white">
          <Globe className="w-4 h-4 text-cyan-400" />
          <span>Regional Language & Voice Audio</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
          {/* Dialect Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300">Default Dialect for Voice & AI Answers</label>
            <div className="grid grid-cols-2 gap-2">
              {supportedLanguages.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => setLanguage(l.name)}
                  className={`p-2.5 rounded-xl text-xs font-semibold text-left transition flex items-center justify-between ${
                    language === l.name
                      ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <span>{l.name}</span>
                  <span className="text-[10px] text-slate-400 font-normal">{l.native}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Voice Engine Controls */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-white">Read Aloud Audio Responses</div>
                <div className="text-[10px] text-slate-400">Synthesize text-to-speech for agricultural alerts</div>
              </div>
              <input
                type="checkbox"
                checked={voiceEnabled}
                onChange={(e) => setVoiceEnabled(e.target.checked)}
                className="w-4 h-4 accent-cyan-500 rounded"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span>Voice Playback Speed</span>
                <span className="text-cyan-400">{voiceSpeed}x</span>
              </div>
              <input
                type="range"
                min="0.7"
                max="1.4"
                step="0.1"
                value={voiceSpeed}
                onChange={(e) => setVoiceSpeed(parseFloat(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                <span>0.7x (Clear Farmer Pace)</span>
                <span>1.0x (Standard)</span>
                <span>1.4x (Fast)</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => speakText(`Namaste! Testing WeatherGPT audio playback speed at ${voiceSpeed}x in ${language}.`)}
              className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-cyan-300 border border-slate-700 flex items-center justify-center space-x-1.5 transition"
            >
              <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Test Audio Readout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Saved Locations & Farms Manager */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm font-bold text-white">
            <MapPin className="w-4 h-4 text-cyan-400" />
            <span>Saved Agricultural Farms & Monitoring Zones</span>
          </div>

          <button
            onClick={() => setShowAddLoc(!showAddLoc)}
            className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 text-cyan-300 text-xs font-bold flex items-center space-x-1 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Location</span>
          </button>
        </div>

        {/* Add Location Subform */}
        {showAddLoc && (
          <form onSubmit={handleAddLocation} className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-3 animate-in fade-in">
            <div className="text-xs font-bold text-white">Register New Telemetry Favorite</div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Zone / Farm Label (e.g. Pune Vineyard)"
                value={newLocName}
                onChange={(e) => setNewLocName(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                required
              />

              <select
                value={newLocCity}
                onChange={(e) => setNewLocCity(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="Mumbai">Mumbai</option>
                <option value="Delhi">Delhi</option>
                <option value="Kolkata">Kolkata</option>
                <option value="Chennai">Chennai</option>
                <option value="Bengaluru">Bengaluru</option>
                <option value="Hyderabad">Hyderabad</option>
                <option value="Nashik">Nashik</option>
                <option value="Bhubaneswar">Bhubaneswar</option>
              </select>

              <select
                value={newLocType}
                onChange={(e) => setNewLocType(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="Agriculture">Agriculture / Farming</option>
                <option value="Aquaculture">Aquaculture / Fisheries</option>
                <option value="Disaster Relief Base">Disaster Relief Base</option>
                <option value="Urban Meteorology">Urban Meteorology</option>
              </select>
            </div>

            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowAddLoc(false)}
                className="px-3 py-1.5 rounded-xl bg-slate-700 text-xs font-bold text-slate-300 hover:bg-slate-600 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-extrabold transition shadow"
              >
                Save Location
              </button>
            </div>
          </form>
        )}

        {/* Locations List */}
        <div className="space-y-2 pt-1">
          {savedLocations.map((loc) => (
            <div
              key={loc.id}
              className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between gap-3 hover:bg-slate-800/80 transition"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-white">{loc.name}</span>
                    {loc.isDefault && (
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-bold">
                        Default
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {loc.city}, {loc.state} • <span className="text-slate-300">{loc.type}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {!loc.isDefault && (
                  <button
                    onClick={() => dispatch(setDefaultLocation(loc.id))}
                    className="px-2.5 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-[10px] font-semibold text-slate-200 transition"
                  >
                    Set Default
                  </button>
                )}
                <button
                  onClick={() => dispatch(deleteLocation(loc.id))}
                  className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition"
                  title="Remove location"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default SettingsPage;
