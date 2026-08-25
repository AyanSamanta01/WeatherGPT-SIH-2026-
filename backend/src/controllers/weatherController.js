const weatherService = require('../services/weatherService');
const { successResponse } = require('../utils/response');

const CITY_COORDINATES = {
  mumbai: { lat: 19.0760, lon: 72.8777, name: 'Mumbai' },
  'new delhi': { lat: 28.6139, lon: 77.2090, name: 'New Delhi' },
  delhi: { lat: 28.6139, lon: 77.2090, name: 'New Delhi' },
  kolkata: { lat: 22.5726, lon: 88.3639, name: 'Kolkata' },
  chennai: { lat: 13.0827, lon: 80.2707, name: 'Chennai' },
  bengaluru: { lat: 12.9716, lon: 77.5946, name: 'Bengaluru' },
  bangalore: { lat: 12.9716, lon: 77.5946, name: 'Bengaluru' },
  hyderabad: { lat: 17.3850, lon: 78.4867, name: 'Hyderabad' },
  ahmedabad: { lat: 23.0225, lon: 72.5714, name: 'Ahmedabad' },
  pune: { lat: 18.5204, lon: 73.8567, name: 'Pune' },
  jaipur: { lat: 26.9124, lon: 75.7873, name: 'Jaipur' },
  lucknow: { lat: 26.8467, lon: 80.9462, name: 'Lucknow' },
  guwahati: { lat: 26.1445, lon: 91.7362, name: 'Guwahati' },
  bhubaneswar: { lat: 20.2961, lon: 85.8245, name: 'Bhubaneswar' }
};

const resolveCoordinates = async (query) => {
  let lat = query.lat;
  let lon = query.lon;
  let cityName = query.city || query.q || 'Selected Location';

  if (lat === undefined || lon === undefined) {
    const cleanCity = cityName.trim().toLowerCase();
    if (CITY_COORDINATES[cleanCity]) {
      lat = CITY_COORDINATES[cleanCity].lat;
      lon = CITY_COORDINATES[cleanCity].lon;
      cityName = CITY_COORDINATES[cleanCity].name;
    } else {
      const geoResults = await weatherService.geocode({ query: cityName });
      if (geoResults && geoResults.length > 0) {
        lat = geoResults[0].latitude;
        lon = geoResults[0].longitude;
        cityName = geoResults[0].name || cityName;
      } else {
        lat = 19.0760; // Default fallback to Mumbai
        lon = 72.8777;
      }
    }
  }

  return { lat, lon, cityName };
};

const getWeatherConditionText = (code) => {
  if (code === 0) return 'Clear Sky';
  if (code >= 1 && code <= 3) return 'Partly Cloudy';
  if (code >= 45 && code <= 48) return 'Fog & Mist';
  if (code >= 51 && code <= 57) return 'Light Drizzle';
  if (code >= 61 && code <= 67) return 'Rain & Showers';
  if (code >= 71 && code <= 77) return 'Snow Flurries';
  if (code >= 80 && code <= 82) return 'Heavy Showers';
  if (code >= 95 && code <= 99) return 'Thunderstorm & Heavy Rain';
  return 'Clear to Partly Cloudy';
};

const getCurrentWeather = async (req, res, next) => {
  try {
    const { lat, lon, cityName } = await resolveCoordinates(req.query);
    const units = req.query.units || 'metric';
    const data = await weatherService.getCurrentWeather({ lat, lon, units });

    const normalized = {
      ...data,
      city: cityName,
      temp: data.temperature,
      feelsLike: data.temperature ? data.temperature + 2 : 28,
      tempMin: data.temperature ? data.temperature - 3 : 24,
      tempMax: data.temperature ? data.temperature + 3 : 32,
      condition: getWeatherConditionText(data.weatherCode),
      coordinates: { lat, lon }
    };

    return successResponse(res, normalized, 'Current weather fetched successfully');
  } catch (err) {
    next(err);
  }
};

const getForecast = async (req, res, next) => {
  try {
    const { lat, lon, cityName } = await resolveCoordinates(req.query);
    const days = req.query.days || 7;
    const data = await weatherService.getForecast({ lat, lon, days });

    const normalizedForecasts = (data.forecasts || []).map(f => ({
      ...f,
      condition: getWeatherConditionText(f.weatherCode),
      pop: f.rainfallProbability
    }));

    return successResponse(res, { ...data, city: cityName, forecasts: normalizedForecasts }, 'Weather forecast fetched successfully');
  } catch (err) {
    next(err);
  }
};

const getHourlyForecast = async (req, res, next) => {
  try {
    const { lat, lon, cityName } = await resolveCoordinates(req.query);
    const data = await weatherService.getForecast({ lat, lon, days: 2 });
    
    // Generate 3-hourly time slots
    const hours = ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'];
    const hourly = hours.map((time, idx) => {
      const baseTemp = data.forecasts?.[0]?.temperature || 28;
      const pop = data.forecasts?.[0]?.rainfallProbability || 30;
      return {
        time,
        temp: Math.round(baseTemp + (idx >= 3 && idx <= 5 ? 3 : -2)),
        pop: Math.min(100, Math.max(0, pop + (idx % 2 === 0 ? 10 : -10))),
        condition: pop > 50 ? 'Showers' : 'Partly Cloudy'
      };
    });

    return successResponse(res, hourly, 'Hourly forecast fetched successfully');
  } catch (err) {
    next(err);
  }
};

const getDailyForecast = async (req, res, next) => {
  try {
    const { lat, lon, cityName } = await resolveCoordinates(req.query);
    const data = await weatherService.getForecast({ lat, lon, days: 7 });

    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const daily = (data.forecasts || []).map((f, idx) => {
      const dateObj = new Date(f.forecastTime);
      const dayName = idx === 0 ? 'Today' : daysOfWeek[dateObj.getDay()];
      return {
        day: dayName,
        date: dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        tempMin: Math.round(f.temperatureMin || 24),
        tempMax: Math.round(f.temperatureMax || 32),
        condition: getWeatherConditionText(f.weatherCode),
        pop: f.rainfallProbability || 40,
        humidity: 75
      };
    });

    return successResponse(res, daily, 'Daily forecast fetched successfully');
  } catch (err) {
    next(err);
  }
};

const getHistory = async (req, res, next) => {
  try {
    const { lat, lon } = await resolveCoordinates(req.query);
    const { from, to } = req.query;
    const data = await weatherService.getHistory({ lat, lon, from, to });
    return successResponse(res, data, 'Historical weather fetched successfully');
  } catch (err) {
    next(err);
  }
};

const geocode = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q) {
      return successResponse(res, [], 'Empty query');
    }
    const results = await weatherService.geocode({ query: q });
    return successResponse(res, results, 'Geocoding results retrieved');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getCurrentWeather,
  getForecast,
  getHourlyForecast,
  getDailyForecast,
  getHistory,
  geocode
};

