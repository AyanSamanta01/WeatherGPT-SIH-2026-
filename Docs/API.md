# WeatherGPT API Specification

Base URL:

```text
/api
```

## Authentication

```http
POST /auth/signup
POST /auth/login
POST /auth/logout
GET  /auth/me
```

## Weather

```http
GET /weather/current?lat={lat}&lon={lon}
GET /weather/forecast?lat={lat}&lon={lon}
GET /weather/history?lat={lat}&lon={lon}&from={date}&to={date}
```

## Chat

```http
POST /chat
```

Example request:

```json
{
  "message": "Will it rain tomorrow evening?",
  "latitude": 22.57,
  "longitude": 88.36,
  "language": "en"
}
```

Example response:

```json
{
  "answer": "Rain is possible tomorrow evening.",
  "location": "Kolkata",
  "sources": ["weather-service"],
  "risk": "moderate"
}
```

## Alerts

```http
GET  /alerts
POST /alerts/preferences
GET  /alerts/nearby?lat={lat}&lon={lon}
```

## Locations

```http
GET  /locations
POST /locations
DELETE /locations/{id}
```

## Climate

```http
GET /climate/trends?lat={lat}&lon={lon}&years=10
```

## Design Rules
- Validate all input.
- Never expose API keys.
- Return consistent error structures.
- Add authentication to user-specific endpoints.
- Include source metadata for weather-derived answers.
