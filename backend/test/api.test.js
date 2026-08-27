const app = require('../src/app');
const http = require('http');

let server;
const PORT = 5099;

const testSuite = async () => {
  console.log('🧪 Starting WeatherGPT Backend Automated API Test Suite...\n');
  let passed = 0;
  let failed = 0;

  const runTest = async (name, fn) => {
    try {
      await fn();
      console.log(`✅ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`❌ FAIL: ${name} ->`, err.message);
      failed++;
    }
  };

  server = app.listen(PORT);

  const request = async (path, options = {}) => {
    const response = await fetch(`http://localhost:${PORT}${path}`, options);
    const data = await response.json();
    return { status: response.status, data };
  };

  // Test 1: Health endpoint
  await runTest('GET /health returns 200 and healthy status', async () => {
    const res = await request('/health');
    if (res.status !== 200 || res.data.status !== 'healthy') {
      throw new Error(`Unexpected response: ${JSON.stringify(res)}`);
    }
  });

  // Test 2: Readiness endpoint
  await runTest('GET /ready returns 200 and readiness payload', async () => {
    const res = await request('/ready');
    if (res.status !== 200 || res.data.status !== 'ready') {
      throw new Error(`Unexpected response: ${JSON.stringify(res)}`);
    }
  });

  // Test 3: Root info endpoint
  await runTest('GET / returns 200 and API info', async () => {
    const res = await request('/');
    if (res.status !== 200 || !res.data.documentation) {
      throw new Error(`Unexpected response: ${JSON.stringify(res)}`);
    }
  });

  // Test 3: Weather Current endpoint (Open-Meteo live)
  await runTest('GET /api/v1/weather/current?lat=22.57&lon=88.36 returns current weather', async () => {
    const res = await request('/api/v1/weather/current?lat=22.57&lon=88.36');
    if (res.status !== 200 || !res.data.success || res.data.data.temperature === undefined) {
      throw new Error(`Invalid weather response: ${JSON.stringify(res)}`);
    }
  });

  // Test 4: Weather Forecast endpoint
  await runTest('GET /api/v1/weather/forecast?lat=22.57&lon=88.36 returns forecasts array', async () => {
    const res = await request('/api/v1/weather/forecast?lat=22.57&lon=88.36&days=3');
    if (res.status !== 200 || !Array.isArray(res.data.data.forecasts)) {
      throw new Error(`Invalid forecast response: ${JSON.stringify(res)}`);
    }
  });

  // Test 5: Validation Error on missing parameters
  await runTest('GET /api/v1/weather/current without params returns 400 Validation Error', async () => {
    const res = await request('/api/v1/weather/current');
    if (res.status !== 400 || res.data.success !== false) {
      throw new Error(`Expected 400 validation error, got: ${res.status}`);
    }
  });

  // Test 6: Chat Grounding endpoint & Conversation generation
  let createdConversationId;
  await runTest('POST /api/v1/chat returns grounded response with sources, risk, and conversationId', async () => {
    const res = await request('/api/v1/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Will it rain tomorrow in Mumbai?',
        latitude: 19.076,
        longitude: 72.877,
        language: 'en'
      })
    });
    if (res.status !== 200 || !res.data.data.answer || !res.data.data.sources || !res.data.data.conversationId) {
      throw new Error(`Invalid chat response: ${JSON.stringify(res)}`);
    }
    createdConversationId = res.data.data.conversationId;
  });

  // Test 6_alias: AI Chat alias POST /ai/chat with { prompt }
  await runTest('POST /api/v1/ai/chat accepts { prompt } and returns { replyText, sources }', async () => {
    const res = await request('/api/v1/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: 'Show cyclone alert advisory for Mumbai'
      })
    });
    if (res.status !== 200 || !res.data.data.replyText || !Array.isArray(res.data.data.sources)) {
      throw new Error(`Invalid /ai/chat response: ${JSON.stringify(res)}`);
    }
  });

  // Test 6b: Get Conversations
  await runTest('GET /api/v1/chat/conversations lists conversations', async () => {
    const res = await request('/api/v1/chat/conversations');
    if (res.status !== 200 || !Array.isArray(res.data.data) || res.data.data.length === 0) {
      throw new Error(`Invalid conversations response: ${JSON.stringify(res)}`);
    }
  });

  // Test 6c: Get Conversation History
  await runTest('GET /api/v1/chat/history/:conversationId retrieves message history', async () => {
    const res = await request(`/api/v1/chat/history/${createdConversationId}`);
    if (res.status !== 200 || !Array.isArray(res.data.data) || res.data.data.length < 2) {
      throw new Error(`Invalid history response: ${JSON.stringify(res)}`);
    }
  });

  // Test 6d: Delete Conversation
  await runTest('DELETE /api/v1/chat/conversations/:conversationId removes conversation', async () => {
    const res = await request(`/api/v1/chat/conversations/${createdConversationId}`, {
      method: 'DELETE'
    });
    if (res.status !== 200 || !res.data.data.success) {
      throw new Error(`Delete conversation failed: ${JSON.stringify(res)}`);
    }
  });

  // Test 6e: City Name Query Resolution on Weather
  await runTest('GET /api/v1/weather/current?city=Mumbai automatically geocodes and returns weather', async () => {
    const res = await request('/api/v1/weather/current?city=Mumbai');
    if (res.status !== 200 || !res.data.data.temp || res.data.data.city !== 'Mumbai') {
      throw new Error(`Invalid city current weather response: ${JSON.stringify(res)}`);
    }
  });

  // Test 6f: Hourly Forecast Breakdown
  await runTest('GET /api/v1/weather/hourly?city=Mumbai returns 3-hourly forecast array', async () => {
    const res = await request('/api/v1/weather/hourly?city=Mumbai');
    if (res.status !== 200 || !Array.isArray(res.data.data) || res.data.data.length === 0 || !res.data.data[0].time) {
      throw new Error(`Invalid hourly forecast response: ${JSON.stringify(res)}`);
    }
  });

  // Test 6g: Daily Forecast Summary
  await runTest('GET /api/v1/weather/daily?city=Mumbai returns 7-day daily forecast array', async () => {
    const res = await request('/api/v1/weather/daily?city=Mumbai');
    if (res.status !== 200 || !Array.isArray(res.data.data) || res.data.data.length === 0 || !res.data.data[0].day) {
      throw new Error(`Invalid daily forecast response: ${JSON.stringify(res)}`);
    }
  });


  // Test 7: Active Weather Alerts
  await runTest('GET /api/v1/alerts returns active alerts', async () => {
    const res = await request('/api/v1/alerts');
    if (res.status !== 200 || !Array.isArray(res.data.data)) {
      throw new Error(`Invalid alerts response: ${JSON.stringify(res)}`);
    }
  });

  // Test 7b: GIS GeoJSON FeatureCollection Layer
  await runTest('GET /api/v1/alerts/gis/layers returns standard GeoJSON FeatureCollection', async () => {
    const res = await request('/api/v1/alerts/gis/layers');
    if (
      res.status !== 200 ||
      res.data.data.type !== 'FeatureCollection' ||
      !Array.isArray(res.data.data.features) ||
      res.data.data.features.length === 0
    ) {
      throw new Error(`Invalid GeoJSON response: ${JSON.stringify(res)}`);
    }
    const firstFeature = res.data.data.features[0];
    if (!firstFeature.properties.strokeColor || !firstFeature.properties.imdColorCode) {
      throw new Error(`Missing IMD styling properties in GeoJSON feature: ${JSON.stringify(firstFeature)}`);
    }
  });

  // Test 7c: Live Meteorological Hazard Evaluation & IMD Color Code
  await runTest('GET /api/v1/alerts/hazard/check returns hazard classification and safety advisories', async () => {
    const res = await request('/api/v1/alerts/hazard/check?lat=22.57&lon=88.36');
    if (
      res.status !== 200 ||
      !res.data.data.hazardEvaluation ||
      !res.data.data.hazardEvaluation.colorCode ||
      !Array.isArray(res.data.data.hazardEvaluation.advisories)
    ) {
      throw new Error(`Invalid hazard check response: ${JSON.stringify(res)}`);
    }
  });

  // Test 7d: CAP 1.2 Alert Ingestion
  await runTest('POST /api/v1/alerts/cap/ingest ingests CAP 1.2 disaster alert with Polygon', async () => {
    const res = await request('/api/v1/alerts/cap/ingest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        headline: 'NDMA Warning: Flash Flood in Mahanadi Basin',
        event: 'flood',
        severity: 'severe',
        areaDesc: 'Mahanadi Delta Catchment',
        latitude: 20.45,
        longitude: 85.88,
        radiusKm: 75,
        polygon: [
          [85.0, 20.0],
          [86.5, 20.0],
          [86.5, 21.0],
          [85.0, 21.0],
          [85.0, 20.0]
        ],
        senderName: 'NDMA-IMD-DisasterGateway'
      })
    });
    if (res.status !== 201 || !res.data.data.id || res.data.data.alertType !== 'flood') {
      throw new Error(`CAP Ingestion failed: ${JSON.stringify(res)}`);
    }
  });

  // Test 7e: SSE Real-Time Alert Stream Connection
  await runTest('GET /api/v1/alerts/stream initiates text/event-stream connection', async () => {
    const http = require('http');
    await new Promise((resolve, reject) => {
      const req = http.get(`http://localhost:${PORT}/api/v1/alerts/stream`, (res) => {
        if (res.statusCode !== 200) {
          return reject(new Error(`Expected 200, got ${res.statusCode}`));
        }
        if (!res.headers['content-type']?.includes('text/event-stream')) {
          return reject(new Error(`Expected text/event-stream header, got ${res.headers['content-type']}`));
        }
        req.destroy();
        resolve();
      });
      req.on('error', reject);
    });
  });

  // Test 8: Nearby Alerts endpoint & Point-in-Polygon containment check
  await runTest('GET /api/v1/alerts/nearby evaluates spatial Point-in-Polygon containment', async () => {
    // Point inside the Bay of Bengal cyclone polygon (87.5, 21.5)
    const res = await request('/api/v1/alerts/nearby?lat=21.5&lon=87.5');
    if (res.status !== 200 || !Array.isArray(res.data.data) || res.data.data.length === 0) {
      throw new Error(`Expected nearby alerts inside polygon, got: ${JSON.stringify(res)}`);
    }
  });

  // Test 9: Auth Signup
  const testEmail = `tester_${Date.now()}@weathergpt.ai`;
  let authToken;
  await runTest('POST /api/v1/auth/signup registers a user and returns JWT token', async () => {
    const res = await request('/api/v1/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Scientist',
        email: testEmail,
        password: 'Password@123',
        preferredLanguage: 'hi'
      })
    });
    if (res.status !== 201 || !res.data.data.token) {
      throw new Error(`Signup failed: ${JSON.stringify(res)}`);
    }
    authToken = res.data.data.token;
  });

  // Test 10: Auth /me protected endpoint
  await runTest('GET /api/v1/auth/me with valid Bearer token returns profile', async () => {
    const res = await request('/api/v1/auth/me', {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    if (res.status !== 200 || !res.data.data.user) {
      throw new Error(`Me endpoint failed: ${JSON.stringify(res)}`);
    }
  });

  // Test 10b: Auth /me profile update
  await runTest('PUT /api/v1/auth/me updates preferred language and deviceToken', async () => {
    const res = await request('/api/v1/auth/me', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        name: 'Senior Meteorologist',
        preferredLanguage: 'bn',
        deviceToken: 'fcm_token_updated_123'
      })
    });
    if (res.status !== 200 || res.data.data.user.preferredLanguage !== 'bn' || res.data.data.user.name !== 'Senior Meteorologist') {
      throw new Error(`Profile update failed: ${JSON.stringify(res)}`);
    }
  });

  // Test 11: Auth /me without token returns 401
  await runTest('GET /api/v1/auth/me without token returns 401', async () => {
    const res = await request('/api/v1/auth/me');
    if (res.status !== 401) {
      throw new Error(`Expected 401, got: ${res.status}`);
    }
  });

  // Test 12: Weather History
  await runTest('GET /api/v1/weather/history returns historical records', async () => {
    const res = await request('/api/v1/weather/history?lat=22.57&lon=88.36&from=2024-01-01&to=2024-01-03');
    if (res.status !== 200 || !Array.isArray(res.data.data.history)) {
      throw new Error(`Invalid history response: ${JSON.stringify(res)}`);
    }
  });

  // Test 12b: Weather Caching Layer
  await runTest('GET /api/v1/weather/current served from in-memory cache on subsequent requests', async () => {
    const start = Date.now();
    const res = await request('/api/v1/weather/current?lat=22.57&lon=88.36');
    const elapsed = Date.now() - start;
    if (res.status !== 200 || !res.data.data.cached) {
      throw new Error(`Expected cached weather response with cached:true, got: ${JSON.stringify(res)}`);
    }
  });

  // Test 13: Geocoding search
  await runTest('GET /api/v1/weather/geocode?q=Kolkata returns geocoded coordinates', async () => {
    const res = await request('/api/v1/weather/geocode?q=Kolkata');
    if (res.status !== 200 || !Array.isArray(res.data.data)) {
      throw new Error(`Invalid geocode response: ${JSON.stringify(res)}`);
    }
  });

  // Test 14: User Locations (POST, GET, GET by ID, PUT)
  let createdLocationId;
  await runTest('POST & GET /api/v1/locations creates and retrieves saved locations', async () => {
    const postRes = await request('/api/v1/locations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        name: 'Salt Lake Sector V',
        latitude: 22.58,
        longitude: 88.42,
        isDefault: true
      })
    });
    if (postRes.status !== 201 || !postRes.data.data.id) {
      throw new Error(`Create location failed: ${JSON.stringify(postRes)}`);
    }
    createdLocationId = postRes.data.data.id;

    const getRes = await request('/api/v1/locations', {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    if (getRes.status !== 200 || !Array.isArray(getRes.data.data) || getRes.data.data.length === 0) {
      throw new Error(`Get locations failed: ${JSON.stringify(getRes)}`);
    }
  });

  // Test 14b: GET /locations/:id
  await runTest('GET /api/v1/locations/:id retrieves single location', async () => {
    const res = await request(`/api/v1/locations/${createdLocationId}`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    if (res.status !== 200 || res.data.data.name !== 'Salt Lake Sector V') {
      throw new Error(`Get single location failed: ${JSON.stringify(res)}`);
    }
  });

  // Test 14c: PUT /locations/:id
  await runTest('PUT /api/v1/locations/:id updates location name and default status', async () => {
    const res = await request(`/api/v1/locations/${createdLocationId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        name: 'Salt Lake Tech Hub',
        isDefault: false
      })
    });
    if (res.status !== 200 || res.data.data.name !== 'Salt Lake Tech Hub') {
      throw new Error(`Update location failed: ${JSON.stringify(res)}`);
    }
  });

  // Test 15: Alert Preferences
  await runTest('GET & POST /api/v1/alerts/preferences manages alert settings', async () => {
    const postRes = await request('/api/v1/alerts/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        alertTypes: ['cyclone', 'flood'],
        notificationChannels: ['push'],
        enabled: true
      })
    });
    if (postRes.status !== 200) {
      throw new Error(`Update preferences failed: ${JSON.stringify(postRes)}`);
    }
  });

  // Test 16: Climate Trends
  await runTest('GET /api/v1/climate/trends returns multi-year trends', async () => {
    const res = await request('/api/v1/climate/trends?lat=22.57&lon=88.36&years=3');
    if (res.status !== 200 || !Array.isArray(res.data.data.trends)) {
      throw new Error(`Invalid climate trends response: ${JSON.stringify(res)}`);
    }
  });

  // Test 16b: Climate Analytics Alias
  await runTest('GET /api/v1/analytics/climate returns climate trends via alias route', async () => {
    const res = await request('/api/v1/analytics/climate?lat=22.57&lon=88.36&years=3');
    if (res.status !== 200 || !Array.isArray(res.data.data.trends)) {
      throw new Error(`Invalid analytics climate response: ${JSON.stringify(res)}`);
    }
  });


  // Test 17: 404 Route handling
  await runTest('GET /non-existent-route returns 404', async () => {
    const res = await request('/non-existent-route');
    if (res.status !== 404) {
      throw new Error(`Expected 404, got: ${res.status}`);
    }
  });

  console.log(`\n========================================`);
  console.log(`Test Summary: ${passed} Passed, ${failed} Failed`);
  console.log(`========================================\n`);

  if (server) {
    server.close(() => {
      process.exit(failed > 0 ? 1 : 0);
    });
  } else {
    process.exit(failed > 0 ? 1 : 0);
  }
};

testSuite().catch((err) => {
  console.error('Fatal test runner error:', err);
  if (server) server.close(() => process.exit(1));
  else process.exit(1);
});
