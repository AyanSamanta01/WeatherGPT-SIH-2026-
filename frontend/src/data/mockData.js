// Comprehensive Mock Data & GeoJSON Layers for WeatherGPT Application

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
  { name: 'Pune', state: 'Maharashtra', lat: 18.5204, lon: 73.8567, region: 'Western India' },
  { name: 'Jaipur', state: 'Rajasthan', lat: 26.9124, lon: 75.7873, region: 'Northern India' },
  { name: 'Lucknow', state: 'Uttar Pradesh', lat: 26.8467, lon: 80.9462, region: 'Northern India' }
];

export const SUPPORTED_LANGUAGES = [
  { name: 'English', native: 'English', code: 'en', speechCode: 'en-IN' },
  { name: 'Hindi', native: 'हिन्दी', code: 'hi', speechCode: 'hi-IN' },
  { name: 'Bengali', native: 'বাংলা', code: 'bn', speechCode: 'bn-IN' },
  { name: 'Tamil', native: 'தமிழ்', code: 'ta', speechCode: 'ta-IN' },
  { name: 'Telugu', native: 'తెలుగు', code: 'te', speechCode: 'te-IN' },
  { name: 'Marathi', native: 'मराठी', code: 'mr', speechCode: 'mr-IN' },
  { name: 'Gujarati', native: 'ગુજરાતી', code: 'gu', speechCode: 'gu-IN' },
  { name: 'Kannada', native: 'ಕನ್ನಡ', code: 'kn', speechCode: 'kn-IN' }
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
    lastUpdated: 'Just now',
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
    lastUpdated: 'Just now',
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
    lastUpdated: 'Just now',
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
    lastUpdated: 'Just now',
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
    lastUpdated: 'Just now',
    coordinates: { lat: 12.9716, lon: 77.5946 }
  }
};

export const MOCK_HOURLY_FORECAST = [
  { time: '00:00', temp: 27, pop: 10, condition: 'Partly Cloudy' },
  { time: '03:00', temp: 26, pop: 20, condition: 'Partly Cloudy' },
  { time: '06:00', temp: 26, pop: 40, condition: 'Light Drizzle' },
  { time: '09:00', temp: 28, pop: 65, condition: 'Rain & Showers' },
  { time: '12:00', temp: 30, pop: 85, condition: 'Heavy Thunderstorm' },
  { time: '15:00', temp: 29, pop: 90, condition: 'Heavy Rain' },
  { time: '18:00', temp: 28, pop: 50, condition: 'Scattered Showers' },
  { time: '21:00', temp: 27, pop: 25, condition: 'Overcast' }
];

export const MOCK_DAILY_FORECAST = [
  { day: 'Today', date: 'Aug 26', tempMin: 26, tempMax: 31, condition: 'Heavy Rain', pop: 85, humidity: 84 },
  { day: 'Thu', date: 'Aug 27', tempMin: 25, tempMax: 30, condition: 'Thunderstorm & Rain', pop: 90, humidity: 88 },
  { day: 'Fri', date: 'Aug 28', tempMin: 26, tempMax: 32, condition: 'Moderate Showers', pop: 70, humidity: 80 },
  { day: 'Sat', date: 'Aug 29', tempMin: 27, tempMax: 33, condition: 'Partly Cloudy', pop: 40, humidity: 75 },
  { day: 'Sun', date: 'Aug 30', tempMin: 26, tempMax: 32, condition: 'Scattered Rain', pop: 60, humidity: 78 },
  { day: 'Mon', date: 'Aug 31', tempMin: 25, tempMax: 30, condition: 'Heavy Rain', pop: 80, humidity: 85 },
  { day: 'Tue', date: 'Sep 01', tempMin: 26, tempMax: 31, condition: 'Passing Showers', pop: 50, humidity: 82 }
];

export const MOCK_ALERTS = [
  {
    id: 'ALT-2026-001',
    title: 'Red Alert: Severe Cyclone & Extreme Heavy Rainfall Warning',
    category: 'cyclone',
    severity: 'extreme', // Red
    color: 'red',
    issuedBy: 'India Meteorological Department (IMD)',
    issuedAt: '2026-08-26 10:30 IST',
    affectedRegions: ['Mumbai Metro', 'Thane', 'Palghar', 'Raigad', 'Ratnagiri'],
    summary: 'Deep Depression over Arabian Sea intensified into a Severe Cyclonic Storm. Gale winds of 85-100 km/h with localized tidal surge and inundation expected.',
    advisories: [
      '🌾 Farmers: Suspend harvesting, dig field runoff trenches, and secure paddy crops.',
      '⚓ Fishermen: Total suspension of fishing operations along Maharashtra & Goa coasts.',
      '🏙️ Citizens: Stay indoors, avoid coastal promenades and waterlogged subways.',
      '✈️ Aviation & Rail: Expect significant schedule delays and transit diversions.'
    ],
    geometry: {
      type: 'Polygon',
      coordinates: [
        [[72.4, 18.2], [73.5, 18.2], [73.5, 19.8], [72.4, 19.8], [72.4, 18.2]]
      ]
    }
  },
  {
    id: 'ALT-2026-002',
    title: 'Orange Alert: Urban Inundation & Flash Flood Watch',
    category: 'flood',
    severity: 'severe', // Orange
    color: 'orange',
    issuedBy: 'Regional Meteorological Centre (RMC Kolkata)',
    issuedAt: '2026-08-26 09:15 IST',
    affectedRegions: ['Kolkata South', 'Howrah', 'Hooghly', 'North 24 Parganas'],
    summary: 'High tide in Hooghly river combined with persistent monsoon convection is likely to cause acute waterlogging across low-lying municipal wards.',
    advisories: [
      '🚜 Municipal Authorities: Keep stormwater dewatering pumps on high-alert standby.',
      '🚆 Commuters: Prioritize underground metro corridors over arterial roadways.',
      '⚡ Power Distribution: Isolate grounded transformers in inundated sectors.'
    ],
    geometry: {
      type: 'Polygon',
      coordinates: [
        [[87.8, 22.1], [88.9, 22.1], [88.9, 23.1], [87.8, 23.1], [87.8, 22.1]]
      ]
    }
  },
  {
    id: 'ALT-2026-003',
    title: 'Yellow Alert: Heatwave & Dust Storm Advisory',
    category: 'heatwave',
    severity: 'advisory', // Yellow
    color: 'yellow',
    issuedBy: 'National Weather Forecasting Centre (NWFC)',
    issuedAt: '2026-08-26 08:00 IST',
    affectedRegions: ['Jaipur', 'Bikaner', 'Gurugram', 'South Delhi'],
    summary: 'Day temperatures expected to peak at 41°C with strong desiccating westerly winds (Loo) blowing during afternoon hours.',
    advisories: [
      '🥤 General Public: Maintain high hydration, drink ORS / lime water, and wear light cotton clothing.',
      '🌾 Farmers: Provide light, frequent micro-irrigation to standing vegetable and millet crops.'
    ],
    geometry: {
      type: 'Polygon',
      coordinates: [
        [[75.2, 26.2], [77.8, 26.2], [77.8, 28.9], [75.2, 28.9], [75.2, 26.2]]
      ]
    }
  }
];

export const MOCK_GIS_GEOJSON = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      id: 'ALT-2026-001',
      properties: {
        id: 'ALT-2026-001',
        title: 'Red Alert: Severe Cyclone Zone (Konkan)',
        severity: 'extreme',
        alertType: 'cyclone',
        color: '#ef4444',
        fillColor: '#ef4444',
        fillOpacity: 0.35,
        strokeColor: '#dc2626',
        strokeWeight: 2,
        locationName: 'Mumbai & Konkan Coast',
        description: 'Severe cyclonic storm hazard polygon with wind gusts exceeding 90 km/h and torrential rainfall.'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [[72.4, 18.2], [73.5, 18.2], [73.5, 19.8], [72.4, 19.8], [72.4, 18.2]]
        ]
      }
    },
    {
      type: 'Feature',
      id: 'ALT-2026-002',
      properties: {
        id: 'ALT-2026-002',
        title: 'Orange Alert: Urban Inundation (Ganges Delta)',
        severity: 'severe',
        alertType: 'flood',
        color: '#f97316',
        fillColor: '#f97316',
        fillOpacity: 0.35,
        strokeColor: '#ea580c',
        strokeWeight: 2,
        locationName: 'Kolkata & Howrah',
        description: 'Heavy precipitation inundation hazard zone along coastal estuary basin.'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [[87.8, 22.1], [88.9, 22.1], [88.9, 23.1], [87.8, 23.1], [87.8, 22.1]]
        ]
      }
    },
    {
      type: 'Feature',
      id: 'ALT-2026-003',
      properties: {
        id: 'ALT-2026-003',
        title: 'Yellow Alert: Heatwave Watch (Northwest Plains)',
        severity: 'advisory',
        alertType: 'heatwave',
        color: '#eab308',
        fillColor: '#eab308',
        fillOpacity: 0.25,
        strokeColor: '#ca8a04',
        strokeWeight: 2,
        locationName: 'Delhi NCR & Rajasthan',
        description: 'Elevated daytime temperatures and high surface UV radiation zone.'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [[75.2, 26.2], [77.8, 26.2], [77.8, 28.9], [75.2, 28.9], [75.2, 26.2]]
        ]
      }
    }
  ]
};

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
  ],
  soilMoisture: [
    { month: 'Jan', topSoil: 42, rootZone: 58, pet: 110, retention: 76 },
    { month: 'Feb', topSoil: 35, rootZone: 52, pet: 125, retention: 70 },
    { month: 'Mar', topSoil: 28, rootZone: 45, pet: 155, retention: 62 },
    { month: 'Apr', topSoil: 20, rootZone: 38, pet: 180, retention: 55 },
    { month: 'May', topSoil: 18, rootZone: 32, pet: 210, retention: 48 },
    { month: 'Jun', topSoil: 65, rootZone: 72, pet: 160, retention: 82 },
    { month: 'Jul', topSoil: 92, rootZone: 95, pet: 130, retention: 96 },
    { month: 'Aug', topSoil: 88, rootZone: 92, pet: 125, retention: 94 },
    { month: 'Sep', topSoil: 78, rootZone: 85, pet: 135, retention: 88 },
    { month: 'Oct', topSoil: 60, rootZone: 74, pet: 140, retention: 80 },
    { month: 'Nov', topSoil: 48, rootZone: 66, pet: 120, retention: 74 },
    { month: 'Dec', topSoil: 44, rootZone: 62, pet: 105, retention: 78 }
  ]
};

export const MOCK_CONVERSATIONS = [
  {
    id: 'conv-1',
    title: 'Mumbai Cyclone & Rain Advisory',
    createdAt: new Date(Date.now() - 3600 * 1000).toISOString(),
    preview: 'Will it rain heavily in Mumbai tomorrow afternoon?'
  },
  {
    id: 'conv-2',
    title: 'Nashik Grape Cultivation Advisory',
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    preview: 'क्या कल नासिक में अंगूर की खेती के लिए मौसम ठीक रहेगा?'
  },
  {
    id: 'conv-3',
    title: 'Kolkata Urban Flood & High Tide Check',
    createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    preview: 'Is there high tide alert for Kolkata lowlands?'
  }
];

export const INITIAL_CHAT_MESSAGES = [
  {
    id: 'msg-1',
    sender: 'ai',
    text: 'Hello! I am **WeatherGPT**, your meteorological AI intelligence assistant grounded in real-time India Meteorological Department (IMD) radar telemetry and NWP numerical prediction models (GFS & WRF).\n\nAsk me about upcoming monsoons, agricultural crop spray advisories, cyclonic wind forecasts, or GIS disaster hazard zones in your local language.',
    timestamp: '12:00',
    sources: ['IMD Numerical Weather Prediction', 'Open-Meteo GFS Ensemble', 'NDMA CAP 1.2 Feed'],
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
  "Will it rain heavily in Mumbai tomorrow afternoon?",
  "क्या कल नासिक में अंगूर की खेती के लिए मौसम ठीक रहेगा?",
  "Show active cyclone & flood hazard zones in Maharashtra",
  "What is the current Air Quality Index (AQI) in New Delhi?",
  "Give crop advisory for paddy farmers facing heavy rainfall",
  "Compare current monthly temperature with 50-year baseline"
];

export const MOCK_SAVED_LOCATIONS = [
  {
    id: 'loc-1',
    name: 'Nashik Grape Vineyard (Plot A)',
    latitude: 19.9975,
    longitude: 73.7898,
    isDefault: true,
    createdAt: '2026-08-20'
  },
  {
    id: 'loc-2',
    name: 'Alibaug Coastal Farm',
    latitude: 18.6414,
    longitude: 72.8722,
    isDefault: false,
    createdAt: '2026-08-22'
  },
  {
    id: 'loc-3',
    name: 'Howrah Paddy Field',
    latitude: 22.5958,
    longitude: 88.2636,
    isDefault: false,
    createdAt: '2026-08-24'
  }
];
