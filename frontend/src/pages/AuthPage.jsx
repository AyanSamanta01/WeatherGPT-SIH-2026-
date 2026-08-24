import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  CloudRain, 
  Mail, 
  Lock, 
  User, 
  Briefcase, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck 
} from 'lucide-react';

const AuthPage = () => {
  const { loginUser } = useApp();
  const [isLoginTab, setIsLoginTab] = useState(true);
  
  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('Meteorologist');

  const handleSubmit = (e) => {
    e.preventDefault();
    loginUser(name || 'Ayan Samanta', email || 'ayan.s@weathergpt.gov.in');
  };

  const handleDemoLogin = () => {
    loginUser('Demo Researcher', 'demo@weathergpt.gov.in');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md glass-panel border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Top Glow Accent */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-xl shadow-cyan-500/30">
            <CloudRain className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Weather<span className="text-cyan-400">GPT</span> Access Portal
          </h2>
          <p className="text-xs text-slate-400">
            Conversational Intelligence for IMD Weather & Disaster Alerts
          </p>
        </div>

        {/* Tabs: Login / Signup */}
        <div className="flex bg-slate-900/80 p-1 rounded-2xl border border-slate-800 mb-6">
          <button
            onClick={() => setIsLoginTab(true)}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition ${
              isLoginTab ? 'bg-cyan-500 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setIsLoginTab(false)}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition ${
              !isLoginTab ? 'bg-cyan-500 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLoginTab && (
            <div>
              <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Ayan Samanta"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl glass-input text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1">
              Government / Official Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                placeholder="ayan.s@weathergpt.gov.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl glass-input text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl glass-input text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {!isLoginTab && (
            <div>
              <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1">
                Primary User Persona
              </label>
              <div className="relative">
                <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl glass-input text-xs text-slate-200 bg-slate-900 focus:outline-none focus:border-cyan-500"
                >
                  <option value="Meteorologist">Meteorologist / Researcher</option>
                  <option value="Disaster Manager">Disaster Manager (NDRF/SDMA)</option>
                  <option value="Farmer">Farmer / Agriculture Advisory</option>
                  <option value="Aviation">Aviation & Maritime Operations</option>
                  <option value="General Public">General Public</option>
                </select>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 text-white font-semibold text-xs shadow-lg shadow-cyan-500/25 hover:brightness-110 transition flex items-center justify-center space-x-2"
          >
            <span>{isLoginTab ? 'Sign In to WeatherGPT' : 'Complete Registration'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Login Option */}
        <div className="mt-6 pt-4 border-t border-slate-800 text-center">
          <p className="text-[11px] text-slate-400 mb-2">Evaluator Shortcut</p>
          <button
            onClick={handleDemoLogin}
            className="w-full py-2 rounded-xl bg-slate-900 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10 text-xs font-semibold flex items-center justify-center space-x-2 transition"
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Instant Demo Login (One-Click)</span>
          </button>
        </div>

        {/* Security Footer */}
        <div className="mt-4 flex items-center justify-center space-x-1.5 text-[10px] text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Encrypted Gateway • Ministry of Earth Sciences Protocol</span>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
