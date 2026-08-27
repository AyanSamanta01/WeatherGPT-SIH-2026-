import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { chatService } from '../services/api';
import { DEFAULT_WELCOME_MESSAGES } from '../store/slices/chatSlice';
import { 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Bot, 
  User, 
  Sparkles, 
  CloudRain, 
  ShieldAlert, 
  RefreshCw, 
  History, 
  Plus, 
  Trash2, 
  CheckCircle, 
  MessageSquare, 
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Sun,
  CloudDrizzle,
  AlertTriangle,
  Radio,
  FileText
} from 'lucide-react';

const CHAT_SUGGESTIONS = [
  'Current weather telemetry',
  'Rain probability for tomorrow',
  'Agricultural pesticide spraying advisory',
  'Active severe weather alerts in India'
];

const ChatPage = () => {
  const { 
    selectedCity, 
    weatherData,
    formatTemp, 
    speakText, 
    stopSpeaking,
    voiceEnabled, 
    setVoiceEnabled,
    language,
    getLanguageDetails,
    activeConversationId,
    setActiveConversationId,
    conversationsList,
    setConversationsList,
    clearAllHistory
  } = useApp();

  const [messages, setMessages] = useState(DEFAULT_WELCOME_MESSAGES || []);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [historyDrawerOpen, setHistoryDrawerOpen] = useState(false);
  const [currentlySpeakingId, setCurrentlySpeakingId] = useState(null);

  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Load conversations on mount
  useEffect(() => {
    const fetchThreads = async () => {
      try {
        const convs = await chatService.getConversations();
        if (convs) setConversationsList(convs);
      } catch (err) {
        console.debug('Failed to fetch threads:', err);
      }
    };
    fetchThreads();
  }, [setConversationsList]);

  // Load history when a conversation thread is clicked
  const handleSelectThread = async (conv) => {
    setActiveConversationId(conv.id);
    setLoading(true);
    try {
      const history = await chatService.getHistory(conv.id);
      if (history && history.length > 0) {
        setMessages(history);
      } else {
        setMessages([
          {
            id: `start-${conv.id}`,
            sender: 'ai',
            text: `Loaded thread: **${conv.title}**.\n\nAsk any additional meteorological or agricultural query!`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    } catch (err) {
      console.warn('Failed to load thread history:', err);
    } finally {
      setLoading(false);
      setHistoryDrawerOpen(false);
    }
  };

  // Start a new fresh chat
  const handleStartNewChat = () => {
    setActiveConversationId(null);
    setMessages(INITIAL_CHAT_MESSAGES);
    setInputQuery('');
    setHistoryDrawerOpen(false);
    stopSpeaking();
  };

  // Delete a conversation thread
  const handleDeleteThread = async (e, convId) => {
    e.stopPropagation();
    try {
      await chatService.deleteConversation(convId);
      setConversationsList(prev => prev.filter(c => c.id !== convId));
      if (activeConversationId === convId) {
        handleStartNewChat();
      }
    } catch (err) {
      console.warn('Failed to delete conversation:', err);
    }
  };

  // Handle Speech Recognition (Web Speech API)
  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please type your query.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      const langInfo = getLanguageDetails();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = langInfo.speechCode || 'en-IN';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputQuery(transcript);
        handleSendMessage(transcript);
      };

      recognition.start();
    } catch (err) {
      console.error('Speech recognition error:', err);
      setIsListening(false);
    }
  };

  // Send Message Logic
  const handleSendMessage = async (textToSend) => {
    const query = textToSend || inputQuery;
    if (!query.trim()) return;

    // Append User Message
    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    try {
      const langInfo = getLanguageDetails();
      const result = await chatService.sendMessage({
        message: query,
        latitude: weatherData?.coordinates?.lat || 19.0760,
        longitude: weatherData?.coordinates?.lon || 72.8777,
        language: langInfo.code || 'en',
        conversationId: activeConversationId
      });

      if (result.conversationId && !activeConversationId) {
        setActiveConversationId(result.conversationId);
        // Refresh conversation threads
        const updatedThreads = await chatService.getConversations();
        if (updatedThreads) setConversationsList(updatedThreads);
      }

      const reply = result.replyText || result.answer || result.text;
      const suggestedActions = result.suggestedActions || result.suggested_actions || [];
      const aiMsg = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources: result.sources || ['IMD Regional Centre', 'Open-Meteo GFS Ensemble'],
        weatherCard: result.weatherCard || null,
        suggestedActions
      };

      setMessages(prev => [...prev, aiMsg]);
      
      if (voiceEnabled) {
        setCurrentlySpeakingId(aiMsg.id);
        speakText(reply);
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'ai',
          text: 'I encountered an issue querying the numerical weather prediction models. Please verify your connection or try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Read individual message aloud
  const handleToggleSpeakMessage = (msg) => {
    if (currentlySpeakingId === msg.id) {
      stopSpeaking();
      setCurrentlySpeakingId(null);
    } else {
      stopSpeaking();
      setCurrentlySpeakingId(msg.id);
      speakText(msg.text);
    }
  };

  // Helper: Format AI message text with markdown highlights
  const renderFormattedText = (text) => {
    if (!text) return null;

    // Split text by lines
    const lines = text.split('\n');
    return (
      <div className="space-y-2">
        {lines.map((line, idx) => {
          if (!line.trim()) return <div key={idx} className="h-1" />;

          // Check if line is bullet point
          const isBullet = line.trim().startsWith('*') || line.trim().startsWith('-') || /^\d+\./.test(line.trim());
          
          // Parse bold text **bold**
          const parts = line.split(/(\*\*.*?\*\*)/g);
          const formattedParts = parts.map((part, pIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return (
                <strong key={pIdx} className="text-white font-bold bg-cyan-500/10 px-1 py-0.5 rounded border border-cyan-500/20">
                  {part.slice(2, -2)}
                </strong>
              );
            }
            return part;
          });

          if (isBullet) {
            return (
              <div key={idx} className="flex items-start space-x-2 pl-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 flex-shrink-0" />
                <p className="flex-1">{formattedParts}</p>
              </div>
            );
          }

          return <p key={idx}>{formattedParts}</p>;
        })}
      </div>
    );
  };

  return (
    <div className="h-[calc(100vh-6.5rem)] flex glass-panel rounded-3xl border border-slate-800/80 overflow-hidden shadow-2xl relative">
      
      {/* 1. Left Conversation History Drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-72 bg-slate-950/95 backdrop-blur-2xl border-r border-slate-800 p-4 transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${
          historyDrawerOpen ? 'translate-x-0' : '-translate-x-full md:hidden'
        }`}
      >
        <div className="flex flex-col h-full justify-between">
          <div className="space-y-4">
            {/* Header & New Chat */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2 text-cyan-400 font-bold text-xs">
                <History className="w-4 h-4" />
                <span>Chat History</span>
              </div>
              <button
                onClick={() => setHistoryDrawerOpen(false)}
                className="md:hidden text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <button
              onClick={handleStartNewChat}
              className="w-full py-2.5 px-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-bold shadow-lg shadow-cyan-500/20 hover:brightness-110 transition flex items-center justify-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Start New Weather Chat</span>
            </button>

            {/* Conversation Threads List */}
            <div className="space-y-1.5 overflow-y-auto max-h-[60vh] pr-1">
              <div className="flex items-center justify-between px-2 pb-1">
                <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  Saved Threads
                </p>
                {conversationsList.length > 0 && (
                  <button
                    onClick={clearAllHistory}
                    className="text-[10px] font-bold text-rose-400 hover:text-rose-300 hover:underline transition cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {conversationsList.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500">
                  No previous chat threads.
                </div>
              ) : (
                conversationsList.map((conv) => {
                  const isSelected = activeConversationId === conv.id;
                  return (
                    <div
                      key={conv.id}
                      onClick={() => handleSelectThread(conv)}
                      className={`group p-2.5 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                        isSelected 
                          ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-300 font-semibold' 
                          : 'bg-slate-900/60 border-slate-800/80 text-slate-300 hover:bg-slate-900 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                        <MessageSquare className={`w-3.5 h-3.5 flex-shrink-0 ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`} />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs truncate">{conv.title || conv.preview || 'Weather Query'}</p>
                          <p className="text-[10px] text-slate-500">
                            {new Date(conv.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => handleDeleteThread(e, conv.id)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/20 transition opacity-80 sm:opacity-0 sm:group-hover:opacity-100 cursor-pointer active:scale-90"
                        title="Delete Thread"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-500 text-center">
            Grounded in IMD-WRF & GFS Ensembles
          </div>
        </div>
      </div>

      {/* 2. Main Chat Conversation Panel */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-950/40">
        {/* Chat Header Bar */}
        <div className="px-4 sm:px-6 py-3.5 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/70">
          <div className="flex items-center space-x-3">
            {/* Toggle Drawer Button */}
            <button
              onClick={() => setHistoryDrawerOpen(!historyDrawerOpen)}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 transition"
              title="Toggle Chat History Drawer"
            >
              <History className="w-4 h-4 text-cyan-400" />
            </button>

            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
                <Bot className="w-5 h-5" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-900" />
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <h2 className="font-bold text-slate-100 text-xs sm:text-sm">WeatherGPT Conversational Engine</h2>
                <span className="hidden sm:inline px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-md">
                  Grounded RAG
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400">
                Location Context: <strong className="text-cyan-400">{selectedCity}</strong> • Language: <strong className="text-slate-200">{language}</strong>
              </p>
            </div>
          </div>

          {/* Controls: New Chat & Voice Toggle */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleStartNewChat}
              className="hidden sm:flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-700 transition"
            >
              <Plus className="w-3.5 h-3.5 text-cyan-400" />
              <span>New Chat</span>
            </button>

            <button
              onClick={() => {
                if (voiceEnabled) stopSpeaking();
                setVoiceEnabled(!voiceEnabled);
              }}
              className={`p-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition ${
                voiceEnabled 
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' 
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
              title="Toggle Automated Speech Synthesis"
            >
              {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span className="hidden md:inline">{voiceEnabled ? 'Voice Output Active' : 'Voice Muted'}</span>
            </button>
          </div>
        </div>

        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {messages.map((msg) => {
            const isAI = msg.sender === 'ai';
            const isSpeakingThis = currentlySpeakingId === msg.id;

            return (
              <div
                key={msg.id}
                className={`flex items-start space-x-3 ${
                  !isAI ? 'flex-row-reverse space-x-reverse' : ''
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md ${
                    !isAI
                      ? 'bg-gradient-to-tr from-sky-500 to-blue-600 text-white'
                      : 'bg-gradient-to-tr from-cyan-500 to-teal-600 text-white'
                  }`}
                >
                  {!isAI ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Bubble Container */}
                <div className={`max-w-2xl space-y-2 ${!isAI ? 'text-right' : 'text-left'}`}>
                  {/* Message Box */}
                  <div
                    className={`p-4 rounded-3xl text-xs leading-relaxed ${
                      !isAI
                        ? 'bg-gradient-to-r from-sky-600 to-blue-600 text-white rounded-tr-none shadow-lg'
                        : 'glass-card border border-slate-700/60 text-slate-200 rounded-tl-none shadow-xl'
                    }`}
                  >
                    {isAI ? renderFormattedText(msg.text) : <p className="whitespace-pre-wrap">{msg.text}</p>}

                    {/* Embedded Interactive Weather Card Widget */}
                    {msg.weatherCard && (
                      <div className="mt-3 p-3.5 rounded-2xl bg-slate-900/95 border border-cyan-500/40 text-left flex items-center justify-between shadow-inner">
                        <div className="flex items-center space-x-3">
                          <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-300">
                            <CloudRain className="w-6 h-6" />
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <p className="font-extrabold text-slate-100 text-xs">{msg.weatherCard.location}</p>
                              <span className="px-1.5 py-0.2 text-[9px] font-bold bg-cyan-500/20 text-cyan-300 rounded">
                                Live Observation
                              </span>
                            </div>
                            <p className="text-[11px] text-cyan-400 font-semibold mt-0.5">{msg.weatherCard.condition}</p>
                          </div>
                        </div>

                        <div className="text-right space-y-0.5">
                          <p className="text-xl font-extrabold text-white tracking-tight">{msg.weatherCard.temp}</p>
                          <p className="text-[10px] text-sky-400 font-medium">Rain Prob: {msg.weatherCard.rainChance}</p>
                        </div>
                      </div>
                    )}

                    {/* Dynamic Suggested Follow-Up Actions */}
                    {isAI && msg.suggestedActions && msg.suggestedActions.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-slate-700/50 space-y-1.5">
                        <p className="text-[10px] font-bold text-cyan-400/90 uppercase tracking-wider flex items-center space-x-1">
                          <Sparkles className="w-3 h-3 text-cyan-400" />
                          <span>Suggested Queries:</span>
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {msg.suggestedActions.map((action, aIdx) => (
                            <button
                              key={aIdx}
                              onClick={() => handleSendMessage(action)}
                              className="px-2.5 py-1 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:border-cyan-500/60 text-[11px] font-medium transition text-left shadow-sm cursor-pointer"
                            >
                              {action}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Message Metadata & Grounding Citations */}
                  <div className="flex items-center justify-between text-[10px] text-slate-400 px-1 gap-2">
                    <span>{msg.timestamp}</span>

                    <div className="flex items-center space-x-3">
                      {isAI && msg.sources && (
                        <div className="flex items-center space-x-1 text-cyan-400/90 font-medium">
                          <CheckCircle className="w-3 h-3 text-cyan-400" />
                          <span className="hidden sm:inline">Grounded in: {msg.sources.join(', ')}</span>
                          <span className="sm:hidden">IMD Grounded</span>
                        </div>
                      )}

                      {isAI && (
                        <button
                          onClick={() => handleToggleSpeakMessage(msg)}
                          className={`p-1 rounded hover:text-cyan-300 transition flex items-center space-x-1 ${
                            isSpeakingThis ? 'text-cyan-400 font-bold animate-pulse' : 'text-slate-500'
                          }`}
                          title="Read Aloud in Selected Language"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          <span className="text-[10px]">{isSpeakingThis ? 'Speaking...' : 'Listen'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Loading Indicator */}
          {loading && (
            <div className="flex items-center space-x-3 text-slate-400 text-xs animate-pulse">
              <div className="w-8 h-8 rounded-2xl bg-cyan-500/20 flex items-center justify-center text-cyan-400 shadow">
                <RefreshCw className="w-4 h-4 animate-spin" />
              </div>
              <span className="font-medium">
                WeatherGPT is synthesizing IMD satellite radar feeds & GFS model ensembles...
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Chips */}
        <div className="px-4 py-2 bg-slate-950/70 border-t border-slate-800/60 flex items-center space-x-2 overflow-x-auto no-scrollbar">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
          <span className="text-[10px] uppercase font-bold text-slate-400 flex-shrink-0">Quick Queries:</span>
          {CHAT_SUGGESTIONS.map((suggestion, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(suggestion)}
              className="flex-shrink-0 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-700/60 hover:border-cyan-500/50 hover:bg-cyan-500/15 text-slate-300 hover:text-cyan-300 text-[11px] font-medium transition"
            >
              {suggestion}
            </button>
          ))}
        </div>

        {/* Input Box Area */}
        <div className="p-3 sm:p-4 bg-slate-900/90 border-t border-slate-800 flex items-center space-x-2.5">
          {/* Voice Input Button */}
          <button
            onClick={handleVoiceInput}
            className={`p-3 rounded-2xl border transition-all shadow-lg flex-shrink-0 ${
              isListening
                ? 'bg-red-500 text-white border-red-400 animate-pulse shadow-red-500/50'
                : 'bg-slate-800/90 text-slate-300 border-slate-700 hover:text-cyan-300 hover:border-cyan-500/50'
            }`}
            title={`Voice Input (Language: ${language})`}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={
              isListening 
                ? `Listening in ${language}... speak now` 
                : `Ask WeatherGPT about ${selectedCity} forecasts, cyclone alerts, or crop advisories in ${language}...`
            }
            className="flex-1 glass-input rounded-2xl px-4 py-3 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 transition"
          />

          {/* Send Button */}
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputQuery.trim() || loading}
            className="p-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 text-white font-semibold shadow-lg shadow-cyan-500/25 hover:brightness-110 disabled:opacity-50 transition flex-shrink-0"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>

    </div>
  );
};

export default ChatPage;
