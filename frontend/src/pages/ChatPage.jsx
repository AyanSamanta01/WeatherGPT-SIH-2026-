import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Send, 
  Mic, 
  MicOff, 
  Bot, 
  User, 
  Volume2, 
  VolumeX, 
  Sparkles,
  Globe,
  Loader,
  ChevronRight
} from 'lucide-react';

const SUGGESTED_QUERIES = [
  '🌧️ Will it rain tomorrow in Mumbai?',
  '🌾 Sowing advice for rabi wheat in Punjab',
  '🚨 Active cyclone warnings Bay of Bengal',
  '🌡️ Heatwave forecast for Delhi NCR next week',
  '🐟 Sea conditions for fishermen Kakdwip',
  '💧 Irrigation schedule for paddy this week',
  '⛈️ Thunderstorm risk Karnataka today',
  '🌊 Flood risk Brahmaputra basin forecast'
];

const MessageBubble = ({ message, speakText }) => {
  const isBot = message.sender === 'bot';

  const renderText = (text) => {
    const parts = text.split(/(\*\*.*?\*\*|\n|```[\s\S]*?```)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="text-white font-bold">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('```') && part.endsWith('```')) {
        return (
          <pre key={i}
            className="text-xs rounded-xl p-3 my-2 overflow-x-auto"
            style={{ background: 'rgba(4, 10, 24, 0.9)', border: '1px solid rgba(30, 41, 59, 0.8)', color: '#67e8f9' }}
          >
            {part.slice(3, -3).trim()}
          </pre>
        );
      }
      if (part === '\n') return <br key={i} />;
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div className={`flex items-start gap-3 animate-fade-in-up ${isBot ? '' : 'flex-row-reverse'}`}>
      {/* Avatar */}
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
        style={isBot ? {
          background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
          boxShadow: '0 2px 12px rgba(6, 182, 212, 0.3)'
        } : {
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          boxShadow: '0 2px 12px rgba(99, 102, 241, 0.25)'
        }}
      >
        {isBot ? (
          <Bot className="w-4 h-4 text-white" />
        ) : (
          <User className="w-4 h-4 text-white" />
        )}
      </div>

      {/* Bubble */}
      <div className={`max-w-[80%] space-y-2 ${isBot ? '' : 'items-end flex flex-col'}`}>
        <div
          className="px-4 py-3 rounded-2xl text-xs leading-relaxed"
          style={isBot ? {
            background: 'rgba(10, 22, 42, 0.9)',
            border: '1px solid rgba(6, 182, 212, 0.12)',
            color: '#cbd5e1',
            borderRadius: '4px 18px 18px 18px'
          } : {
            background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(99, 102, 241, 0.15) 100%)',
            border: '1px solid rgba(6, 182, 212, 0.25)',
            color: '#e2e8f0',
            borderRadius: '18px 4px 18px 18px'
          }}
        >
          {renderText(message.text || message.content || '')}
        </div>

        {/* Meta */}
        <div className={`flex items-center space-x-2 px-1 ${isBot ? '' : 'flex-row-reverse space-x-reverse'}`}>
          <span className="text-[10px] text-slate-600 font-medium">
            {message.timestamp || 'Just now'}
          </span>

          {isBot && message.sources?.length > 0 && (
            <div className="flex items-center space-x-1">
              {message.sources.slice(0, 2).map((src, i) => (
                <span
                  key={i}
                  className="text-[9px] px-1.5 py-0.5 rounded font-bold"
                  style={{
                    background: 'rgba(6, 182, 212, 0.1)',
                    border: '1px solid rgba(6, 182, 212, 0.2)',
                    color: '#67e8f9'
                  }}
                >
                  {src}
                </span>
              ))}
            </div>
          )}

          {isBot && speakText && (
            <button
              onClick={() => speakText(message.text || message.content || '')}
              className="text-slate-600 hover:text-cyan-400 transition-colors"
            >
              <Volume2 className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Weather card embed */}
        {isBot && message.weatherCard && (
          <div
            className="p-3 rounded-2xl text-xs space-y-1.5 mt-1"
            style={{
              background: 'rgba(6, 182, 212, 0.06)',
              border: '1px solid rgba(6, 182, 212, 0.15)'
            }}
          >
            <div className="font-bold text-cyan-300">{message.weatherCard.city}</div>
            <div className="text-slate-300">
              {message.weatherCard.temperature}°C · {message.weatherCard.condition}
            </div>
            {message.weatherCard.rainProb != null && (
              <div className="text-blue-400">Rain: {message.weatherCard.rainProb}%</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const ChatPage = () => {
  const {
    messages: chatMessages,
    sendMessage: handleSendMessage,
    chatLoading: isChatLoading,
    language,
    startVoiceInput,
    stopVoiceInput,
    isListening,
    speakText,
    voiceEnabled,
    setVoiceEnabled
  } = useApp();

  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isChatLoading]);

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || isChatLoading) return;
    setInputText('');
    await handleSendMessage(text);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] min-h-0 animate-fade-in-up">

      {/* Header */}
      <div
        className="flex-shrink-0 flex items-center justify-between px-5 py-4 rounded-t-3xl"
        style={{
          background: 'rgba(5, 12, 28, 0.95)',
          border: '1px solid rgba(6, 182, 212, 0.12)',
          borderBottom: '1px solid rgba(30, 41, 59, 0.8)'
        }}
      >
        <div className="flex items-center space-x-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #06b6d4, #6366f1)',
              boxShadow: '0 4px 16px rgba(6, 182, 212, 0.35)'
            }}
          >
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-sm font-black text-white flex items-center space-x-2" style={{ fontFamily: 'Outfit, Inter, sans-serif' }}>
              <span>WeatherGPT AI</span>
              <span className="badge-live">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>RAG + ML</span>
              </span>
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              WRF · GFS · IMD · NDMA · Offline XGBoost Inference
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 text-[10px] text-slate-500 font-medium">
            <Globe className="w-3 h-3 text-cyan-600" />
            <span>{language}</span>
          </div>
          <button
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className="p-2 rounded-xl transition-all duration-200"
            style={voiceEnabled ? {
              background: 'rgba(6, 182, 212, 0.15)',
              border: '1px solid rgba(6, 182, 212, 0.3)',
              color: '#06b6d4'
            } : {
              background: 'rgba(10, 20, 40, 0.8)',
              border: '1px solid rgba(51, 65, 85, 0.6)',
              color: '#475569'
            }}
            title={voiceEnabled ? 'Disable Voice Readout' : 'Enable Voice Readout'}
          >
            {voiceEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div
        className="flex-1 overflow-y-auto px-5 py-5 space-y-5 min-h-0"
        style={{
          background: 'rgba(4, 10, 24, 0.9)',
          border: '1px solid rgba(6, 182, 212, 0.08)',
          borderTop: 'none',
          borderBottom: 'none'
        }}
      >
        {chatMessages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} speakText={voiceEnabled ? speakText : null} />
        ))}

        {isChatLoading && (
          <div className="flex items-start gap-3 animate-fade-in-up">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #06b6d4, #3b82f6)', boxShadow: '0 2px 12px rgba(6, 182, 212, 0.3)' }}
            >
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div
              className="px-4 py-3 rounded-2xl"
              style={{
                background: 'rgba(10, 22, 42, 0.9)',
                border: '1px solid rgba(6, 182, 212, 0.12)',
                borderRadius: '4px 18px 18px 18px'
              }}
            >
              <div className="flex items-center space-x-2">
                <Loader className="w-4 h-4 text-cyan-400 animate-spin" />
                <div className="flex space-x-1">
                  {[0, 1, 2].map(i => (
                    <div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
                <span className="text-xs text-slate-400">Querying IMD telemetry...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Queries */}
      <div
        className="flex-shrink-0 px-4 pt-3 pb-1"
        style={{
          background: 'rgba(4, 10, 24, 0.95)',
          border: '1px solid rgba(6, 182, 212, 0.08)',
          borderBottom: 'none',
          borderTop: '1px solid rgba(30, 41, 59, 0.8)'
        }}
      >
        <div className="flex space-x-2 overflow-x-auto pb-2 no-scrollbar">
          {SUGGESTED_QUERIES.map((q, i) => (
            <button
              key={i}
              onClick={() => { setInputText(q.replace(/^[^\w\s]+\s/, '')); inputRef.current?.focus(); }}
              className="flex-shrink-0 px-3 py-1.5 rounded-xl text-[11px] font-medium transition-all duration-150"
              style={{
                background: 'rgba(10, 22, 42, 0.8)',
                border: '1px solid rgba(30, 41, 59, 0.9)',
                color: '#64748b',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.3)'; e.currentTarget.style.color = '#67e8f9'; e.currentTarget.style.background = 'rgba(6, 182, 212, 0.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(30, 41, 59, 0.9)'; e.currentTarget.style.color = '#64748b'; e.currentTarget.style.background = 'rgba(10, 22, 42, 0.8)'; }}
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Input Row */}
      <div
        className="flex-shrink-0 px-4 pb-4 pt-2 rounded-b-3xl"
        style={{
          background: 'rgba(5, 12, 28, 0.95)',
          border: '1px solid rgba(6, 182, 212, 0.12)',
          borderTop: 'none'
        }}
      >
        <div className="flex items-end gap-2.5">
          {/* Voice Button */}
          <button
            onClick={isListening ? stopVoiceInput : () => startVoiceInput()}
            className="flex-shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-200"
            style={isListening ? {
              background: 'linear-gradient(135deg, #dc2626, #ef4444)',
              boxShadow: '0 4px 16px rgba(239, 68, 68, 0.4)'
            } : {
              background: 'rgba(10, 22, 42, 0.9)',
              border: '1px solid rgba(51, 65, 85, 0.7)'
            }}
            title={isListening ? 'Stop Listening' : 'Voice Input'}
          >
            {isListening
              ? <MicOff className="w-5 h-5 text-white animate-pulse" />
              : <Mic className="w-5 h-5 text-cyan-400" />
            }
          </button>

          {/* Text Input */}
          <div
            className="flex-1 flex items-end rounded-2xl overflow-hidden"
            style={{
              background: 'rgba(4, 10, 24, 0.9)',
              border: '1px solid rgba(51, 65, 85, 0.7)',
              boxShadow: 'inset 0 1px 4px rgba(0,0,0,0.3)'
            }}
            onFocus={e => e.currentTarget.parentElement.style.borderColor = 'rgba(6, 182, 212, 0.4)'}
            onBlur={e => e.currentTarget.parentElement.style.borderColor = 'rgba(51, 65, 85, 0.7)'}
          >
            <textarea
              ref={inputRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about rain, cyclones, crop advisories, or any weather query..."
              disabled={isChatLoading}
              rows={1}
              className="flex-1 px-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none resize-none overflow-hidden leading-relaxed"
              style={{
                background: 'transparent',
                minHeight: '44px',
                maxHeight: '120px'
              }}
              onInput={e => {
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
              }}
            />

            {inputText.trim() && (
              <div className="pr-2 pb-2">
                <span
                  className="text-[10px] font-semibold px-2 py-1 rounded-lg"
                  style={{ color: '#475569', background: 'rgba(30, 41, 59, 0.5)' }}
                >
                  ↵ Enter
                </span>
              </div>
            )}
          </div>

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={!inputText.trim() || isChatLoading}
            className="flex-shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-200"
            style={inputText.trim() && !isChatLoading ? {
              background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
              boxShadow: '0 4px 16px rgba(6, 182, 212, 0.4)'
            } : {
              background: 'rgba(10, 22, 42, 0.5)',
              border: '1px solid rgba(30, 41, 59, 0.8)',
              cursor: 'not-allowed'
            }}
          >
            {isChatLoading
              ? <Loader className="w-5 h-5 text-cyan-400 animate-spin" />
              : <Send className="w-5 h-5" style={{ color: inputText.trim() ? '#fff' : '#334155' }} />
            }
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
