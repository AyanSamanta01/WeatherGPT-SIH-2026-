import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bot, Sparkles, ArrowLeft, MessageSquare } from 'lucide-react';

const FloatingAIChatButton = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isHovered, setIsHovered] = useState(false);
  const [previousRoute, setPreviousRoute] = useState('/current');

  const isChatActive = location.pathname === '/chat';

  // Track last non-chat route
  React.useEffect(() => {
    if (location.pathname !== '/chat' && location.pathname !== '/login') {
      setPreviousRoute(location.pathname);
    }
  }, [location.pathname]);

  const handleToggleChat = () => {
    navigate(isChatActive ? (previousRoute || '/current') : '/chat');
  };

  const getPageLabel = (path) => {
    const labels = {
      '/current': 'Telemetry', '/forecast': 'Forecast',
      '/map': 'GIS Map', '/alerts': 'Warnings',
      '/analytics': 'Analytics', '/settings': 'Settings'
    };
    return labels[path] || 'Dashboard';
  };

  // Don't render on login page
  if (location.pathname === '/login') return null;

  return (
    <div
      className="fixed right-5 bottom-6 z-50 select-none flex items-center space-x-3"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Tooltip Label */}
      <div
        className="hidden sm:flex items-center space-x-2 px-3.5 py-2 rounded-2xl text-xs font-semibold text-white pointer-events-none transition-all duration-300"
        style={{
          background: 'rgba(5, 12, 28, 0.95)',
          border: '1px solid rgba(6, 182, 212, 0.25)',
          backdropFilter: 'blur(24px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          opacity: isHovered ? 1 : 0,
          transform: isHovered ? 'translateX(0) scale(1)' : 'translateX(8px) scale(0.95)',
        }}
      >
        {isChatActive ? (
          <>
            <ArrowLeft className="w-3.5 h-3.5 text-cyan-400" />
            <span>Back to {getPageLabel(previousRoute)}</span>
          </>
        ) : (
          <>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping flex-shrink-0" />
            <span>WeatherGPT AI</span>
            <span
              className="text-[9px] font-black px-1.5 py-0.5 rounded-md"
              style={{ background: 'rgba(6, 182, 212, 0.2)', color: '#67e8f9', border: '1px solid rgba(6, 182, 212, 0.3)' }}
            >
              RAG LLM
            </span>
          </>
        )}
      </div>

      {/* Main FAB */}
      <button
        onClick={handleToggleChat}
        type="button"
        title={isChatActive ? `Back to ${getPageLabel(previousRoute)}` : 'Open WeatherGPT AI'}
        className="relative w-14 h-14 rounded-2xl flex items-center justify-center group cursor-pointer transition-all duration-500"
        style={{
          background: isChatActive
            ? 'linear-gradient(135deg, #06b6d4, #3b82f6, #6366f1)'
            : 'linear-gradient(135deg, #06b6d4, #3b82f6)',
          boxShadow: isChatActive
            ? '0 8px 32px rgba(6, 182, 212, 0.6), 0 0 60px rgba(6, 182, 212, 0.2)'
            : isHovered
            ? '0 12px 40px rgba(6, 182, 212, 0.5), 0 0 40px rgba(6, 182, 212, 0.15)'
            : '0 6px 24px rgba(6, 182, 212, 0.35)',
          transform: isHovered ? 'scale(1.1) translateY(-2px)' : isChatActive ? 'scale(1.05)' : 'scale(1)',
          border: '2px solid rgba(255,255,255,0.15)'
        }}
      >
        {/* Inner glow layer */}
        <div
          className="absolute inset-0 rounded-2xl"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, transparent 60%)',
            pointerEvents: 'none'
          }}
        />

        {/* Ambient glow ring */}
        <div
          className="absolute -inset-2 rounded-3xl -z-10 animate-pulse-glow"
          style={{
            background: 'radial-gradient(circle, rgba(6, 182, 212, 0.25) 0%, transparent 70%)',
            filter: 'blur(8px)'
          }}
        />

        {/* Icon */}
        {isChatActive ? (
          <div className="relative">
            <Bot className="w-6 h-6 text-white transition-all duration-300 group-hover:opacity-0 group-hover:scale-75" />
            <ArrowLeft className="w-5 h-5 text-white absolute inset-0 m-auto transition-all duration-300 opacity-0 group-hover:opacity-100 group-hover:scale-110" />
          </div>
        ) : (
          <Bot className="w-7 h-7 text-white group-hover:rotate-6 group-hover:scale-110 transition-transform duration-300" />
        )}

        {/* Sparkle badge */}
        {!isChatActive && (
          <div
            className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center animate-bounce border-2 border-slate-950"
            style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)' }}
          >
            <Sparkles className="w-3 h-3 text-white fill-current" />
          </div>
        )}

        {/* Live status dot */}
        <div
          className="absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full border-2 border-slate-950"
          style={{ background: '#34d399' }}
        />
      </button>
    </div>
  );
};

export default FloatingAIChatButton;
