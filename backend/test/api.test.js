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

  // Test 6: Chat Grounding endpoint
  await runTest('POST /api/v1/chat returns grounded response with sources and risk', async () => {
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
    if (res.status !== 200 || !res.data.data.answer || !res.data.data.sources) {
      throw new Error(`Invalid chat response: ${JSON.stringify(res)}`);
    }
  });

  // Test 7: Active Weather Alerts
  await runTest('GET /api/v1/alerts returns active alerts', async () => {
    const res = await request('/api/v1/alerts');
    if (res.status !== 200 || !Array.isArray(res.data.data)) {
      throw new Error(`Invalid alerts response: ${JSON.stringify(res)}`);
    }
  });

  // Test 8: Nearby Alerts endpoint
  await runTest('GET /api/v1/alerts/nearby?lat=21.5&lon=87.5 returns nearby alerts', async () => {
    const res = await request('/api/v1/alerts/nearby?lat=21.5&lon=87.5');
    if (res.status !== 200 || !Array.isArray(res.data.data)) {
      throw new Error(`Invalid nearby alerts response: ${JSON.stringify(res)}`);
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

  // Test 13: Geocoding search
  await runTest('GET /api/v1/weather/geocode?q=Kolkata returns geocoded coordinates', async () => {
    const res = await request('/api/v1/weather/geocode?q=Kolkata');
    if (res.status !== 200 || !Array.isArray(res.data.data)) {
      throw new Error(`Invalid geocode response: ${JSON.stringify(res)}`);
    }
  });

  // Test 14: User Locations (POST & GET)
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
    if (postRes.status !== 201) {
      throw new Error(`Create location failed: ${JSON.stringify(postRes)}`);
    }

    const getRes = await request('/api/v1/locations', {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    if (getRes.status !== 200) {
      throw new Error(`Get locations failed: ${JSON.stringify(getRes)}`);
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

  server.close();
  if (failed > 0) {
    process.exit(1);
  }
};

testSuite().catch((err) => {
  console.error('Fatal test runner error:', err);
  if (server) server.close();
  process.exit(1);
});
