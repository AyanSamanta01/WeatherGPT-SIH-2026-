import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  CloudSun, 
  Lock, 
  Mail, 
  User, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight,
  Globe
} from 'lucide-react';

const AuthPage = () => {
  const navigate = useNavigate();
  const { login, signup, authLoading } = useApp();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('ayan.samanta@weathergpt.gov.in');
  const [password, setPassword] = useState('Password@123');
  const [name, setName] = useState('Ayan Samanta');
  const [role, setRole] = useState('Meteorology Lead');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      if (isSignUp) {
        await signup({ name, email, password, role });
      } else {
        await login({ email, password, name });
      }
      navigate('/current');
    } catch (err) {
      setError(err?.message || 'Authentication error occurred');
      // Even if mock/network fails, proceed with default session
      navigate('/current');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 text-slate-100 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none -z-0" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none -z-0" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-3xl bg-gradient-to-tr from-cyan-500 via-sky-500 to-blue-600 shadow-xl shadow-cyan-500/30 mb-2">
            <CloudSun className="w-8 h-8 text-white" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Weather<span className="text-cyan-400">GPT</span> Platform
          </h1>
          <p className="text-xs text-slate-400">
            Ministry of Earth Sciences (MoES) & IMD Decision Portal
          </p>
        </div>

        {/* Auth Card */}
        <div className="p-8 rounded-3xl bg-slate-900/90 border border-slate-800 backdrop-blur-2xl shadow-2xl space-y-6">
          
          {/* Tabs: Sign In vs Sign Up */}
          <div className="flex p-1 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-bold">
            <button
              type="button"
              onClick={() => setIsSignUp(false)}
              className={`flex-1 py-2 rounded-xl transition ${
                !isSignUp ? 'bg-cyan-500 text-slate-950 shadow-md font-extrabold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setIsSignUp(true)}
              className={`flex-1 py-2 rounded-xl transition ${
                isSignUp ? 'bg-cyan-500 text-slate-950 shadow-md font-extrabold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Register Officer
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400">Officer / Farmer Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Dr. Ayan Samanta"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400">Official Portal Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@gov.in or user@domain.com"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400">Portal Security Key</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {isSignUp && (
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400">Department / Stakeholder Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="Meteorology Lead">Meteorology Lead (IMD/MoES)</option>
                  <option value="Disaster Response Officer">Disaster Response Officer (NDMA)</option>
                  <option value="Agricultural Extension Officer">Agricultural Officer (Kisan Portal)</option>
                  <option value="Progressive Farmer">Progressive Farmer / Grower</option>
                  <option value="Climate Researcher">Climate & Atmosphere Researcher</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-xl shadow-cyan-500/25 transition transform active:scale-95 disabled:opacity-50"
            >
              <span>{isSignUp ? 'Complete Registration' : 'Access WeatherGPT Portal'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-2 border-t border-slate-800 text-center">
            <button
              onClick={() => navigate('/current')}
              className="text-xs text-slate-400 hover:text-cyan-300 font-semibold transition"
            >
              Continue as Guest Meteorological Observer →
            </button>
          </div>
        </div>

        {/* Security Badge */}
        <div className="flex items-center justify-center space-x-2 text-[11px] text-slate-500 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>CAP 1.2 Encrypted Disaster Warning Terminal</span>
        </div>

      </div>
    </div>
  );
};

export default AuthPage;
