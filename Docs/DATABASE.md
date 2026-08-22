# WeatherGPT Database Design

## Core Collections/Tables

### users
- id
- name
- email
- password_hash / external_auth_id
- preferred_language
- created_at

### locations
- id
- user_id
- name
- latitude
- longitude
- created_at

### weather_records
- id
- location
- observed_at
- temperature
- humidity
- pressure
- wind_speed
- rainfall
- source

### forecasts
- id
- location
- forecast_time
- temperature
- rainfall_probability
- precipitation
- wind_speed
- source
- model

### alerts
- id
- location
- severity
- alert_type
- title
- description
- valid_from
- valid_until
- source

### chat_messages
- id
- user_id
- conversation_id
- role
- content
- created_at

### alert_preferences
- id
- user_id
- location_id
- alert_types
- notification_channels
- enabled

## Important
Weather observations and forecasts should retain their source and timestamp so that answers can be traced back to the underlying data.
