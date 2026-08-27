// Web Speech STT & TTS Service for WeatherGPT SIH 2026

export const SpeechRecognition = 
  (typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)) || 
  null;

export const isSpeechRecognitionSupported = () => !!SpeechRecognition;
export const isSpeechSynthesisSupported = () => typeof window !== 'undefined' && 'speechSynthesis' in window;

class VoiceService {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
  }

  // Initialize Speech-to-Text with real-time transcript streaming
  startListening({ language = 'en', onResult, onInterim, onError, onEnd }) {
    if (!SpeechRecognition) {
      if (onError) onError(new Error('Voice recognition is not supported in this browser. Please use Chrome or Edge.'));
      return null;
    }

    // Stop any existing active session
    this.stopListening();

    try {
      const recognition = new SpeechRecognition();
      this.recognition = recognition;
      recognition.continuous = false;
      recognition.interimResults = true;

      // Indian Regional & English Language mapping
      const langMap = {
        en: 'en-IN',
        hi: 'hi-IN',
        bn: 'bn-IN',
        ta: 'ta-IN',
        te: 'te-IN',
        mr: 'mr-IN',
        gu: 'gu-IN',
        kn: 'kn-IN',
        pa: 'pa-IN'
      };
      recognition.lang = langMap[language] || language || 'en-IN';

      recognition.onstart = () => {
        this.isListening = true;
      };

      recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        if (finalTranscript && onResult) {
          onResult(finalTranscript.trim());
        } else if (interimTranscript && onInterim) {
          onInterim(interimTranscript.trim());
        }
      };

      recognition.onerror = (event) => {
        this.isListening = false;
        // Ignore benign silence timeout
        if (event.error === 'no-speech') {
          if (onEnd) onEnd();
          return;
        }
        if (event.error === 'not-allowed' || event.error === 'permission-denied') {
          if (onError) onError(new Error('Microphone permission denied. Please allow microphone access in your browser settings.'));
          return;
        }
        if (onError) onError(event.error ? new Error(`Voice error: ${event.error}`) : event);
      };

      recognition.onend = () => {
        this.isListening = false;
        if (onEnd) onEnd();
      };

      recognition.start();
      return recognition;
    } catch (err) {
      this.isListening = false;
      if (onError) onError(err);
      return null;
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (_) {}
    }
    this.isListening = false;
  }

  // Text-to-Speech Synthesis
  speak(text, { language = 'en', speed = 1.0, onStart, onEnd, onError } = {}) {
    if (!this.synth) {
      if (onError) onError(new Error('Speech synthesis not supported.'));
      return;
    }

    try {
      this.synth.cancel();

      // Clean markdown symbols for natural speech
      const cleanText = text
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/\*(.*?)\*/g, '$1')
        .replace(/#{1,6}\s?/g, '')
        .replace(/\[(.*?)\]\(.*?\)/g, '$1')
        .replace(/`{1,3}(.*?)`{1,3}/g, '$1')
        .replace(/[-*•]\s+/g, '')
        .replace(/\n+/g, '. ');

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = Math.max(0.7, Math.min(1.5, speed));

      const langMap = {
        en: 'en-IN',
        hi: 'hi-IN',
        bn: 'bn-IN',
        ta: 'ta-IN',
        te: 'te-IN',
        mr: 'mr-IN'
      };
      utterance.lang = langMap[language] || 'en-IN';

      if (onStart) utterance.onstart = onStart;
      if (onEnd) utterance.onend = onEnd;
      if (onError) utterance.onerror = onError;

      this.synth.speak(utterance);
    } catch (err) {
      if (onError) onError(err);
    }
  }

  stopSpeaking() {
    if (this.synth) {
      try {
        this.synth.cancel();
      } catch (_) {}
    }
  }
}

export const voiceService = new VoiceService();
