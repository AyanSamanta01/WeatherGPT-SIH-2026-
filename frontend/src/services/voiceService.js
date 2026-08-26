// Web Speech STT & TTS Service for WeatherGPT SIH 2026

export const SpeechRecognition = 
  window.SpeechRecognition || 
  window.webkitSpeechRecognition || 
  null;

export const isSpeechRecognitionSupported = () => !!SpeechRecognition;
export const isSpeechSynthesisSupported = () => 'speechSynthesis' in window;

class VoiceService {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.synth = window.speechSynthesis || null;
  }

  // Initialize Speech-to-Text
  startListening({ language = 'en', onResult, onError, onEnd }) {
    if (!SpeechRecognition) {
      if (onError) onError(new Error('Speech recognition not supported in this browser.'));
      return null;
    }

    // Stop any existing session
    this.stopListening();

    try {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;

      // Set language code
      const langMap = {
        en: 'en-IN',
        hi: 'hi-IN',
        bn: 'bn-IN',
        ta: 'ta-IN',
        te: 'te-IN',
        mr: 'mr-IN'
      };
      this.recognition.lang = langMap[language] || 'en-IN';

      this.recognition.onstart = () => {
        this.isListening = true;
      };

      this.recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (onResult) onResult(transcript);
      };

      this.recognition.onerror = (event) => {
        this.isListening = false;
        if (onError) onError(event);
      };

      this.recognition.onend = () => {
        this.isListening = false;
        if (onEnd) onEnd();
      };

      this.recognition.start();
      return this.recognition;
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
      } catch (e) {}
    }
    this.isListening = false;
  }

  // Text-to-Speech Synthesis
  speak(text, { language = 'en', speed = 1.0, onStart, onEnd, onError } = {}) {
    if (!this.synth) {
      if (onError) onError(new Error('Speech synthesis not supported.'));
      return;
    }

    // Stop ongoing speech
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
    utterance.rate = Math.max(0.7, Math.min(1.5, speed || 1.0));
    utterance.pitch = 1.0;

    const langMap = {
      en: 'en-IN',
      hi: 'hi-IN',
      bn: 'bn-IN',
      ta: 'ta-IN',
      te: 'te-IN',
      mr: 'mr-IN'
    };
    utterance.lang = langMap[language] || 'en-IN';

    // Voice selection if available
    const voices = this.synth.getVoices();
    const matchingVoice = voices.find(v => v.lang.startsWith(utterance.lang.slice(0, 2)));
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    if (onStart) utterance.onstart = onStart;
    if (onEnd) utterance.onend = onEnd;
    if (onError) utterance.onerror = onError;

    this.synth.speak(utterance);
  }

  stopSpeaking() {
    if (this.synth) {
      this.synth.cancel();
    }
  }
}

export const voiceService = new VoiceService();
export default voiceService;
