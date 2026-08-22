# WeatherGPT AI Design

## Goal
Allow users to ask weather questions naturally while grounding answers in trusted weather data.

## Processing Pipeline

```text
User Question
     |
     v
Intent Detection
     |
     v
Extract Location + Time + Weather Variables
     |
     v
Select Tool
     |
     v
Retrieve Weather Data
     |
     v
Risk/Analytics Engine
     |
     v
LLM Response Generation
     |
     v
Answer + Source + Advisory
```

## Example

Question:

> Will I need an umbrella tomorrow evening?

Structured request:

```json
{
  "intent": "forecast",
  "weather_variable": "precipitation",
  "time_range": "tomorrow_evening",
  "location": "user_location"
}
```

The backend retrieves the actual forecast. The LLM then explains the result.

## Guardrails
- Do not fabricate weather values.
- Prefer structured weather data over model memory.
- Show uncertainty where appropriate.
- Include data timestamp/source.
- Do not present speculative output as an official warning.
- Clearly distinguish official warnings from AI-generated advisories.

## Multilingual
Support should be designed around the same structured weather result, then generate the explanation in the requested language.
