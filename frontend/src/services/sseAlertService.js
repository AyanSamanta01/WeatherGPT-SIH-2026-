// Server-Sent Events (SSE) Client for Real-Time Disaster Warnings

class SseAlertService {
  constructor() {
    this.eventSource = null;
    this.subscribers = new Set();
    this.reconnectTimeout = null;
    this.isConnected = false;
  }

  connect(onAlertReceived) {
    if (onAlertReceived) {
      this.subscribers.add(onAlertReceived);
    }

    if (this.eventSource) {
      return; // Already connected
    }

    const streamUrl = `${import.meta.env.VITE_API_URL || '/api/v1'}/alerts/stream`;

    try {
      this.eventSource = new EventSource(streamUrl);

      this.eventSource.onopen = () => {
        this.isConnected = true;
        console.log('⚡ Connected to WeatherGPT Live Disaster Alert SSE Stream');
      };

      this.eventSource.addEventListener('alert', (event) => {
        try {
          const payload = JSON.parse(event.data);
          const alertData = payload.alert || payload;
          this.subscribers.forEach((cb) => cb(alertData));
        } catch (e) {
          console.warn('Error parsing SSE alert event:', e);
        }
      });

      this.eventSource.addEventListener('heartbeat', () => {
        // Keepalive received
      });

      this.eventSource.onerror = (err) => {
        console.warn('SSE stream disconnected, attempting reconnection in 5s...', err);
        this.isConnected = false;
        this.disconnect();
        this.reconnectTimeout = setTimeout(() => {
          this.connect();
        }, 5000);
      };
    } catch (e) {
      console.warn('EventSource initialization failed:', e);
    }
  }

  disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    this.isConnected = false;
  }

  unsubscribe(callback) {
    this.subscribers.delete(callback);
    if (this.subscribers.size === 0) {
      this.disconnect();
    }
  }
}

export const sseAlertService = new SseAlertService();
export default sseAlertService;
