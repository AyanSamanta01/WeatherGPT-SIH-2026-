/**
 * Server-Sent Events (SSE) Real-Time Alert & Emergency Notification Stream
 * Enables real-time push communication from backend to React/Mobile clients
 * without heavy socket connection overhead.
 */
const logger = require('../utils/logger');

class SseService {
  constructor() {
    this.clients = new Set();

    // Send heartbeat every 30 seconds to keep HTTP connections alive
    this.heartbeatTimer = setInterval(() => this.sendHeartbeat(), 30000);
    if (this.heartbeatTimer.unref) {
      this.heartbeatTimer.unref();
    }
  }

  /**
   * Register a new client SSE response stream
   */
  addClient(req, res) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx proxy buffering
    res.flushHeaders?.();

    const client = { id: 'client_' + Date.now() + '_' + Math.random().toString(36).substring(7), res };
    this.clients.add(client);
    logger.info(`[SSE] Client connected: ${client.id}. Total active streams: ${this.clients.size}`);

    // Send initial connection payload
    this.sendToClient(client, 'connected', {
      message: 'Connected to WeatherGPT Real-Time Disaster & Alert Stream',
      timestamp: new Date().toISOString()
    });

    req.on('close', () => {
      this.clients.delete(client);
      logger.info(`[SSE] Client disconnected: ${client.id}. Remaining: ${this.clients.size}`);
    });
  }

  /**
   * Broadcast an emergency weather alert or disaster bulletin to all connected clients
   */
  broadcastAlert(alertData) {
    if (this.clients.size === 0) return;

    logger.info(`[SSE] Broadcasting live alert "${alertData.title}" to ${this.clients.size} clients`);
    const payload = {
      event: 'DISASTER_ALERT',
      alert: alertData,
      timestamp: new Date().toISOString()
    };

    for (const client of this.clients) {
      this.sendToClient(client, 'alert', payload);
    }
  }

  /**
   * Send SSE formatted data to a single client
   */
  sendToClient(client, eventName, data) {
    try {
      client.res.write(`event: ${eventName}\n`);
      client.res.write(`data: ${JSON.stringify(data)}\n\n`);
    } catch (err) {
      this.clients.delete(client);
    }
  }

  /**
   * Send periodic heartbeat
   */
  sendHeartbeat() {
    for (const client of this.clients) {
      try {
        client.res.write(`: heartbeat ${Date.now()}\n\n`);
      } catch (err) {
        this.clients.delete(client);
      }
    }
  }

  /**
   * Return number of active streams
   */
  getActiveClientCount() {
    return this.clients.size;
  }
}

module.exports = new SseService();
