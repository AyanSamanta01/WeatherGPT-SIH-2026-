// Comprehensive Mock Data for WeatherGPT Application

export const INDIAN_CITIES = [
  { name: 'Mumbai', state: 'Maharashtra', lat: 19.0760, lon: 72.8777, region: 'Western India' },
  { name: 'New Delhi', state: 'Delhi', lat: 28.6139, lon: 77.2090, region: 'Northern India' },
  { name: 'Kolkata', state: 'West Bengal', lat: 22.5726, lon: 88.3639, region: 'Eastern India' },
  { name: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lon: 80.2707, region: 'Southern India' },
  { name: 'Bengaluru', state: 'Karnataka', lat: 12.9716, lon: 77.5946, region: 'Southern India' },
  { name: 'Hyderabad', state: 'Telangana', lat: 17.3850, lon: 78.4867, region: 'Southern India' },
  { name: 'Guwahati', state: 'Assam', lat: 26.1445, lon: 91.7362, region: 'North-Eastern India' },
  { name: 'Bhubaneswar', state: 'Odisha', lat: 20.2961, lon: 85.8245, region: 'Eastern India' },
  { name: 'Ahmedabad', state: 'Gujarat', lat: 23.0225, lon: 72.5714, region: 'Western India' },
];

export const MOCK_WEATHER_BY_CITY = {
  'Mumbai': {
    city: 'Mumbai',
    country: 'India',
    temp: 29,
    feelsLike: 33,
    tempMin: 26,
    tempMax: 31,
    condition: 'Thunderstorm & Heavy Rain',
    icon: 'CloudRain',
    humidity: 84,
    windSpeed: 24,
    windDirection: 'SW',
    pressure: 1008,
    visibility: 4.5,
    uvIndex: 4,
    aqi: 68,
    aqiStatus: 'Moderate',
    dewPoint: 25,
    sunrise: '06:14 AM',
    sunset: '07:05 PM',
    lastUpdated: '10 mins ago',
    coordinates: { lat: 19.0760, lon: 72.8777 }
  },
  'New Delhi': {
    city: 'New Delhi',
    country: 'India',
    temp: 34,
    feelsLike: 39,
    tempMin: 28,
    tempMax: 37,
    condition: 'Hazy Sun & Dust Storm',
    icon: 'Sun',
    humidity: 58,
    windSpeed: 16,
    windDirection: 'NW',
    pressure: 1004,
    visibility: 3.0,
    uvIndex: 9,
    aqi: 245,
    aqiStatus: 'Poor',
    dewPoint: 22,
    sunrise: '05:54 AM',
    sunset: '06:58 PM',
    lastUpdated: '5 mins ago',
    coordinates: { lat: 28.6139, lon: 77.2090 }
  },
  'Kolkata': {
    city: 'Kolkata',
    country: 'India',
    temp: 31,
    feelsLike: 37,
    tempMin: 27,
    tempMax: 33,
    condition: 'Scattered Showers',
    icon: 'CloudDrizzle',
    humidity: 82,
    windSpeed: 18,
    windDirection: 'SE',
    pressure: 1006,
    visibility: 6.0,
    uvIndex: 6,
    aqi: 92,
    aqiStatus: 'Satisfactory',
    dewPoint: 26,
    sunrise: '05:18 AM',
    sunset: '06:22 PM',
    lastUpdated: '12 mins ago',
    coordinates: { lat: 22.5726, lon: 88.3639 }
  },
  'Chennai': {
    city: 'Chennai',
    country: 'India',
    temp: 33,
    feelsLike: 40,
    tempMin: 27,
    tempMax: 35,
    condition: 'Partly Cloudy & Humid',
    icon: 'CloudSun',
    humidity: 76,
    windSpeed: 20,
    windDirection: 'E',
    pressure: 1010,
    visibility: 8.0,
    uvIndex: 8,
    aqi: 54,
    aqiStatus: 'Good',
    dewPoint: 27,
    sunrise: '05:58 AM',
    sunset: '06:36 PM',
    lastUpdated: '8 mins ago',
    coordinates: { lat: 13.0827, lon: 80.2707 }
  },
  'Bengaluru': {
    city: 'Bengaluru',
    country: 'India',
    temp: 24,
    feelsLike: 25,
    tempMin: 20,
    tempMax: 27,
    condition: 'Pleasant & Light Breeze',
    icon: 'Cloud',
    humidity: 65,
    windSpeed: 14,
    windDirection: 'W',
    pressure: 1015,
    visibility: 10.0,
    uvIndex: 5,
    aqi: 38,
    aqiStatus: 'Good',
    dewPoint: 17,
    sunrise: '06:08 AM',
    sunset: '06:47 PM',
    lastUpdated: '2 mins ago',
    coordinates: { lat: 12.9716, lon: 77.5946 }
  }
};

export const MOCK_HOURLY_FORECAST = [
  { time: '00:00', temp: 27, pop: 10, icon: 'Cloud' },
  { time: '03:00', temp: 26, pop: 20, icon: 'Cloud' },
  { time: '06:00', temp: 26, pop: 40, icon: 'CloudDrizzle' },
  { time: '09:00', temp: 28, pop: 65, icon: 'CloudRain' },
  { time: '12:00', temp: 30, pop: 85, icon: 'Thunderstorm' },
  { time: '15:00', temp: 29, pop: 90, icon: 'CloudRain' },
  { time: '18:00', temp: 28, pop: 50, icon: 'CloudDrizzle' },
  { time: '21:00', temp: 27, pop: 25, icon: 'Cloud' }
];

export const MOCK_DAILY_FORECAST = [
  { day: 'Today', date: 'Aug 24', tempMin: 26, tempMax: 31, condition: 'Heavy Rain', pop: 85, humidity: 84 },
  { day: 'Tue', date: 'Aug 25', tempMin: 25, tempMax: 30, condition: 'Thunderstorm', pop: 90, humidity: 88 },
  { day: 'Wed', date: 'Aug 26', tempMin: 26, tempMax: 32, condition: 'Moderate Showers', pop: 70, humidity: 80 },
  { day: 'Thu', date: 'Aug 27', tempMin: 27, tempMax: 33, condition: 'Partly Cloudy', pop: 40, humidity: 75 },
  { day: 'Fri', date: 'Aug 28', tempMin: 26, tempMax: 32, condition: 'Scattered Rain', pop: 60, humidity: 78 },
  { day: 'Sat', date: 'Aug 29', tempMin: 25, tempMax: 30, condition: 'Heavy Rain', pop: 80, humidity: 85 },
  { day: 'Sun', date: 'Aug 30', tempMin: 26, tempMax: 31, condition: 'Passing Showers', pop: 50, humidity: 82 }
];

export const MOCK_ALERTS = [
  {
    id: 'ALT-2026-001',
    title: 'Red Alert: Severe Cyclone Warning (Konkan & Mumbai)',
    category: 'Cyclone & Heavy Rainfall',
    severity: 'Extreme', // Red
    color: 'red',
    issuedBy: 'India Meteorological Department (IMD)',
    issuedAt: '2026-08-24 18:30 IST',
    affectedRegions: ['Mumbai Metro', 'Thane', 'Palghar', 'Raigad', 'Ratnagiri'],
    summary: 'Deep Depression over Arabian Sea intensified into Severe Cyclonic Storm. Wind speeds of 85-100 km/h accompanied by extremely heavy rainfall (above 200mm).',
    advisories: [
      'Farmers: Suspend harvesting & drain excess water from rice fields.',
      'Fishermen: Do not venture into coastal waters until Aug 27.',
      'General Public: Avoid low-lying coastal flood zones and remain indoors.',
      'Aviation & Railways: Expect temporary delays & flight rerouting.'
    ]
  },
  {
    id: 'ALT-2026-002',
    title: 'Orange Alert: Urban Flood Advisory (Kolkata & Howrah)',
    category: 'Urban Flooding',
    severity: 'Severe', // Orange
    color: 'orange',
    issuedBy: 'Regional Meteorological Centre (RMC Kolkata)',
    issuedAt: '2026-08-24 16:15 IST',
    affectedRegions: ['Kolkata South', 'Howrah', 'Hooghly', '24 Parganas'],
    summary: 'High tide in Hooghly river coinciding with continuous heavy monsoon precipitation leading to waterlogging in low-lying city zones.',
    advisories: [
      'Municipal Authorities: Activate high-capacity drainage pumps.',
      'Commuters: Use metro services instead of surface transport.'
    ]
  },
  {
    id: 'ALT-2026-003',
    title: 'Yellow Alert: Heatwave Advisory (North-West Rajasthan & Delhi NCR)',
    category: 'Extreme Heat',
    severity: 'Advisory', // Yellow
    color: 'yellow',
    issuedBy: 'National Weather Forecasting Centre (NWFC)',
    issuedAt: '2026-08-24 12:00 IST',
    affectedRegions: ['Jaipur', 'Bikaner', 'Gurugram', 'South Delhi'],
    summary: 'Day temperatures likely to exceed 41°C with hot westerly winds (Loo conditions) expected during peak afternoon hours.',
    advisories: [
      'Avoid direct sun exposure between 12:00 PM and 04:00 PM.',
      'Stay hydrated and carry oral rehydration salts (ORS).'
    ]
  }
];

export const MOCK_CLIMATE_TRENDS = {
  monthlyTemperature: [
    { month: 'Jan', historicalAvg: 24.2, currentYear: 25.1, anomaly: +0.9 },
    { month: 'Feb', historicalAvg: 25.8, currentYear: 26.9, anomaly: +1.1 },
    { month: 'Mar', historicalAvg: 28.5, currentYear: 30.2, anomaly: +1.7 },
    { month: 'Apr', historicalAvg: 31.4, currentYear: 33.0, anomaly: +1.6 },
    { month: 'May', historicalAvg: 33.8, currentYear: 35.1, anomaly: +1.3 },
    { month: 'Jun', historicalAvg: 31.2, currentYear: 31.8, anomaly: +0.6 },
    { month: 'Jul', historicalAvg: 29.5, currentYear: 30.1, anomaly: +0.6 },
    { month: 'Aug', historicalAvg: 29.1, currentYear: 29.8, anomaly: +0.7 },
    { month: 'Sep', historicalAvg: 29.3, currentYear: 29.9, anomaly: +0.6 },
    { month: 'Oct', historicalAvg: 30.1, currentYear: 30.9, anomaly: +0.8 },
    { month: 'Nov', historicalAvg: 28.2, currentYear: 29.0, anomaly: +0.8 },
    { month: 'Dec', historicalAvg: 25.6, currentYear: 26.5, anomaly: +0.9 }
  ],
  decadalRainfall: [
    { year: '2016', annualRainfall: 2150, normal: 2200 },
    { year: '2017', annualRainfall: 2380, normal: 2200 },
    { year: '2018', annualRainfall: 1950, normal: 2200 },
    { year: '2019', annualRainfall: 3470, normal: 2200 },
    { year: '2020', annualRainfall: 3680, normal: 2200 },
    { year: '2021', annualRainfall: 3120, normal: 2200 },
    { year: '2022', annualRainfall: 2890, normal: 2200 },
    { year: '2023', annualRainfall: 2750, normal: 2200 },
    { year: '2024', annualRainfall: 3050, normal: 2200 },
    { year: '2025', annualRainfall: 3200, normal: 2200 }
  ]
};

export const INITIAL_CHAT_MESSAGES = [
  {
    id: 'msg-1',
    sender: 'ai',
    text: 'Hello! I am **WeatherGPT**, your meteorological AI assistant grounded in real-time IMD data and GFS numerical weather prediction models.\n\nHow can I help you with weather forecasts, extreme climate alerts, or crop advisories today?',
    timestamp: '20:45',
    sources: ['IMD Numerical Models', 'Open-Meteo GFS API'],
    weatherCard: {
      location: 'Mumbai',
      temp: '29°C',
      condition: 'Thunderstorm & Heavy Rain',
      highLow: '31° / 26°',
      rainChance: '85%'
    }
  }
];

export const CHAT_SUGGESTIONS = [
  "Will it rain in Mumbai tomorrow afternoon?",
  "Show active cyclone & flood alerts for Maharashtra",
  "What is the current Air Quality Index (AQI) in New Delhi?",
  "Give crop advisory for rice farmers in West Bengal",
  "Compare August rainfall trend with historical 10-year average"
];
