# Alerts & GIS Design

## Alert Pipeline

```text
Weather Data
     |
     v
Hazard Detection
     |
     v
Severity Classification
     |
     v
Location Matching
     |
     v
User Preferences
     |
     v
Notification
```

## Suggested Severity

- INFO
- WATCH
- WARNING
- SEVERE / EMERGENCY

The exact classification should be based on authoritative thresholds and available official warning data.

## GIS Features
- Current user location
- Saved locations
- Weather overlays
- Rainfall visualization
- Hazard polygons
- Forecast layers
- Alert regions
- Map-based location selection

## Safety Principle
Official warnings should be clearly distinguished from WeatherGPT-generated summaries or advisories.
