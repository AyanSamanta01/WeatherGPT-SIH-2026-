// Server-Sent Events (SSE) Client for Real-Time Disaster Warnings

const MAX_RETRIES = 3;

class SseAlertService {
  constructor() {
    this.eventSource = null;
    this.subscribers = new Set();
    this.reconnectTimeout = null;
    this.isConnected = false;
    this.retryCount = 0;
  }

  connect(onAlertReceived) {
    if (onAlertReceived) {
      this.subscribers.add(onAlertReceived);
    }

    if (this.eventSource || typeof window === 'undefined' || !window.EventSource) {
      return;
    }

    if (this.retryCount >= MAX_RETRIES) {
      return; // Silent offline mode
    }

    const streamUrl = `${import.meta.env.VITE_API_URL || '/api/v1'}/alerts/stream`;

    try {
      this.eventSource = new EventSource(streamUrl);

      this.eventSource.onopen = () => {
        this.isConnected = true;
        this.retryCount = 0;
      };

      this.eventSource.addEventListener('alert', (event) => {
        try {
          const payload = JSON.parse(event.data);
          const alertData = payload.alert || payload;
          this.subscribers.forEach((cb) => cb(alertData));
        } catch (e) {
          // silent error
        }
      });

      this.eventSource.onerror = () => {
        this.isConnected = false;
        this.retryCount += 1;
        this.disconnect();

        if (this.retryCount < MAX_RETRIES) {
          const delay = Math.min(8000 * this.retryCount, 30000);
          this.reconnectTimeout = setTimeout(() => {
            this.connect();
          }, delay);
        }
      };
    } catch (_) {
      this.retryCount += 1;
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
      this.retryCount = 0;
    }
  }
}

export const sseAlertService = new SseAlertService();
export default sseAlertService;
