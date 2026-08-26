// Mock and fallback dataset for WeatherGPT SIH 2026

export const INDIAN_CITIES = [
  'Mumbai',
  'Delhi',
  'Kolkata',
  'Chennai',
  'Bengaluru',
  'Hyderabad',
  'Ahmedabad',
  'Pune',
  'Bhubaneswar',
  'Guwahati'
];

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', native: 'English', stt: 'en-IN', tts: 'en-US' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', stt: 'hi-IN', tts: 'hi-IN' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা', stt: 'bn-IN', tts: 'bn-IN' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்', stt: 'ta-IN', tts: 'ta-IN' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు', stt: 'te-IN', tts: 'te-IN' },
  { code: 'mr', name: 'Marathi', native: 'मराठी', stt: 'mr-IN', tts: 'mr-IN' }
];

export const MOCK_WEATHER_BY_CITY = {
  Mumbai: {
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    coordinates: { lat: 19.076, lon: 72.8777 },
    temperature: 31,
    feelsLike: 36,
    tempMin: 27,
    tempMax: 33,
    condition: 'Humid & Partly Cloudy',
    description: 'High coastal humidity with moderate sea breeze and intermittent sun breaks.',
    humidity: 78,
    windSpeed: 18,
    windDirection: 'WSW',
    pressure: 1011,
    visibility: 6.5,
    uvIndex: 8,
    airQualityIndex: 112,
    airQualityStatus: 'Moderate',
    dewPoint: 25,
    cloudCover: 45,
    sunrise: '06:18 AM',
    sunset: '06:52 PM',
    lastUpdated: 'Live telemetry synced from IMD AWS Santacruz',
    hourly: [
      { time: '06:00', temp: 27, condition: 'Clear', rainProb: 5, icon: 'sun' },
      { time: '09:00', temp: 29, condition: 'Partly Cloudy', rainProb: 15, icon: 'cloud-sun' },
      { time: '12:00', temp: 32, condition: 'Sunny', rainProb: 10, icon: 'sun' },
      { time: '15:00', temp: 31, condition: 'Humid', rainProb: 20, icon: 'cloud' },
      { time: '18:00', temp: 29, condition: 'Partly Cloudy', rainProb: 25, icon: 'cloud-sun' },
      { time: '21:00', temp: 28, condition: 'Clear', rainProb: 10, icon: 'moon' },
      { time: '00:00', temp: 27, condition: 'Clear', rainProb: 5, icon: 'moon' }
    ],
    dailyForecast: [
      { day: 'Today', date: 'Oct 24', min: 27, max: 33, condition: 'Partly Cloudy', rainProb: 20, icon: 'cloud-sun' },
      { day: 'Fri', date: 'Oct 25', min: 26, max: 32, condition: 'Scattered Showers', rainProb: 65, icon: 'cloud-rain' },
      { day: 'Sat', date: 'Oct 26', min: 26, max: 31, condition: 'Heavy Rain', rainProb: 85, icon: 'cloud-lightning' },
      { day: 'Sun', date: 'Oct 27', min: 25, max: 30, condition: 'Thunderstorms', rainProb: 80, icon: 'cloud-lightning' },
      { day: 'Mon', date: 'Oct 28', min: 26, max: 32, condition: 'Light Rain', rainProb: 40, icon: 'cloud-drizzle' },
      { day: 'Tue', date: 'Oct 29', min: 27, max: 33, condition: 'Partly Cloudy', rainProb: 20, icon: 'cloud-sun' },
      { day: 'Wed', date: 'Oct 30', min: 27, max: 34, condition: 'Sunny', rainProb: 10, icon: 'sun' }
    ],
    agriculturalAdvisory: 'High humidity favors fungal leaf spots in horticultural plantations. Ensure proper soil drainage before weekend precipitation.',
    disasterRiskLevel: 'Moderate'
  },
  Delhi: {
    city: 'Delhi',
    state: 'National Capital Territory',
    country: 'India',
    coordinates: { lat: 28.7041, lon: 77.1025 },
    temperature: 34,
    feelsLike: 37,
    tempMin: 22,
    tempMax: 35,
    condition: 'Hazy Sun',
    description: 'Dry continental weather with elevated particulate haze and low boundary layer mixing.',
    humidity: 42,
    windSpeed: 8,
    windDirection: 'NW',
    pressure: 1014,
    visibility: 3.2,
    uvIndex: 7,
    airQualityIndex: 285,
    airQualityStatus: 'Poor (PM2.5 Elevated)',
    dewPoint: 17,
    cloudCover: 15,
    sunrise: '06:29 AM',
    sunset: '05:44 PM',
    lastUpdated: 'Live telemetry synced from Safdarjung IMD Observatory',
    hourly: [
      { time: '06:00', temp: 23, condition: 'Haze', rainProb: 0, icon: 'cloud' },
      { time: '09:00', temp: 28, condition: 'Hazy Sun', rainProb: 0, icon: 'sun' },
      { time: '12:00', temp: 33, condition: 'Sunny', rainProb: 0, icon: 'sun' },
      { time: '15:00', temp: 35, condition: 'Dry Heat', rainProb: 0, icon: 'sun' },
      { time: '18:00', temp: 31, condition: 'Haze', rainProb: 0, icon: 'cloud' },
      { time: '21:00', temp: 27, condition: 'Clear', rainProb: 0, icon: 'moon' },
      { time: '00:00', temp: 24, condition: 'Clear', rainProb: 0, icon: 'moon' }
    ],
    dailyForecast: [
      { day: 'Today', date: 'Oct 24', min: 22, max: 35, condition: 'Haze', rainProb: 0, icon: 'sun' },
      { day: 'Fri', date: 'Oct 25', min: 21, max: 34, condition: 'Haze', rainProb: 5, icon: 'sun' },
      { day: 'Sat', date: 'Oct 26', min: 20, max: 33, condition: 'Clear', rainProb: 0, icon: 'sun' },
      { day: 'Sun', date: 'Oct 27', min: 19, max: 32, condition: 'Sunny', rainProb: 0, icon: 'sun' },
      { day: 'Mon', date: 'Oct 28', min: 19, max: 31, condition: 'Sunny', rainProb: 0, icon: 'sun' },
      { day: 'Tue', date: 'Oct 29', min: 18, max: 31, condition: 'Clear', rainProb: 0, icon: 'sun' },
      { day: 'Wed', date: 'Oct 30', min: 18, max: 30, condition: 'Clear', rainProb: 0, icon: 'sun' }
    ],
    agriculturalAdvisory: 'Optimal weather for pre-sowing rabi wheat land preparation. Conserve residual soil moisture with light mulching.',
    disasterRiskLevel: 'Low'
  },
  Kolkata: {
    city: 'Kolkata',
    state: 'West Bengal',
    country: 'India',
    coordinates: { lat: 22.5726, lon: 88.3639 },
    temperature: 30,
    feelsLike: 35,
    tempMin: 25,
    tempMax: 32,
    condition: 'Thunderstorm Approaching',
    description: 'Convective cloud bands drifting inland from North Bay of Bengal with squally wind gusts.',
    humidity: 84,
    windSpeed: 24,
    windDirection: 'SE',
    pressure: 1008,
    visibility: 5.0,
    uvIndex: 6,
    airQualityIndex: 88,
    airQualityStatus: 'Good',
    dewPoint: 26,
    cloudCover: 75,
    sunrise: '05:36 AM',
    sunset: '05:07 PM',
    lastUpdated: 'Live telemetry synced from Alipore Meteorological Centre',
    hourly: [
      { time: '06:00', temp: 26, condition: 'Cloudy', rainProb: 30, icon: 'cloud' },
      { time: '09:00', temp: 28, condition: 'Overcast', rainProb: 50, icon: 'cloud-rain' },
      { time: '12:00', temp: 30, condition: 'Squall & Rain', rainProb: 85, icon: 'cloud-lightning' },
      { time: '15:00', temp: 28, condition: 'Heavy Rain', rainProb: 90, icon: 'cloud-lightning' },
      { time: '18:00', temp: 27, condition: 'Showers', rainProb: 70, icon: 'cloud-rain' },
      { time: '21:00', temp: 26, condition: 'Drizzle', rainProb: 40, icon: 'cloud-drizzle' },
      { time: '00:00', temp: 25, condition: 'Overcast', rainProb: 20, icon: 'cloud' }
    ],
    dailyForecast: [
      { day: 'Today', date: 'Oct 24', min: 25, max: 32, condition: 'Thunderstorm', rainProb: 85, icon: 'cloud-lightning' },
      { day: 'Fri', date: 'Oct 25', min: 24, max: 30, condition: 'Squally Heavy Rain', rainProb: 95, icon: 'cloud-lightning' },
      { day: 'Sat', date: 'Oct 26', min: 24, max: 29, condition: 'Very Heavy Rain', rainProb: 90, icon: 'cloud-rain' },
      { day: 'Sun', date: 'Oct 27', min: 25, max: 31, condition: 'Scattered Rain', rainProb: 55, icon: 'cloud-rain' },
      { day: 'Mon', date: 'Oct 28', min: 26, max: 32, condition: 'Partly Cloudy', rainProb: 30, icon: 'cloud-sun' },
      { day: 'Tue', date: 'Oct 29', min: 26, max: 33, condition: 'Sunny', rainProb: 15, icon: 'sun' },
      { day: 'Wed', date: 'Oct 30', min: 25, max: 33, condition: 'Sunny', rainProb: 10, icon: 'sun' }
    ],
    agriculturalAdvisory: 'Urgent: Postpone all fertilizer broadcasting. Secure harvested aman paddy sheaves on raised dry platforms immediately.',
    disasterRiskLevel: 'Extreme'
  },
  Chennai: {
    city: 'Chennai',
    state: 'Tamil Nadu',
    country: 'India',
    coordinates: { lat: 13.0827, lon: 80.2707 },
    temperature: 32,
    feelsLike: 38,
    tempMin: 26,
    tempMax: 33,
    condition: 'Coastal Showers',
    description: 'Northeast monsoon surge triggering coastal rainfall bands along Coromandel Coast.',
    humidity: 82,
    windSpeed: 20,
    windDirection: 'NE',
    pressure: 1010,
    visibility: 7.0,
    uvIndex: 7,
    airQualityIndex: 65,
    airQualityStatus: 'Satisfactory',
    dewPoint: 25,
    cloudCover: 60,
    sunrise: '06:01 AM',
    sunset: '05:48 PM',
    lastUpdated: 'Live telemetry synced from Meenambakkam IMD Radar',
    hourly: [
      { time: '06:00', temp: 26, condition: 'Showers', rainProb: 60, icon: 'cloud-rain' },
      { time: '09:00', temp: 29, condition: 'Partly Cloudy', rainProb: 40, icon: 'cloud-sun' },
      { time: '12:00', temp: 32, condition: 'Showers', rainProb: 55, icon: 'cloud-rain' },
      { time: '15:00', temp: 31, condition: 'Cloudy', rainProb: 35, icon: 'cloud' },
      { time: '18:00', temp: 29, condition: 'Light Rain', rainProb: 50, icon: 'cloud-drizzle' },
      { time: '21:00', temp: 27, condition: 'Showers', rainProb: 65, icon: 'cloud-rain' },
      { time: '00:00', temp: 26, condition: 'Passing Showers', rainProb: 40, icon: 'cloud-rain' }
    ],
    dailyForecast: [
      { day: 'Today', date: 'Oct 24', min: 26, max: 33, condition: 'Coastal Showers', rainProb: 60, icon: 'cloud-rain' },
      { day: 'Fri', date: 'Oct 25', min: 25, max: 32, condition: 'Moderate Rain', rainProb: 75, icon: 'cloud-rain' },
      { day: 'Sat', date: 'Oct 26', min: 25, max: 31, condition: 'Heavy Rain', rainProb: 80, icon: 'cloud-lightning' },
      { day: 'Sun', date: 'Oct 27', min: 26, max: 32, condition: 'Scattered Rain', rainProb: 50, icon: 'cloud-rain' },
      { day: 'Mon', date: 'Oct 28', min: 26, max: 33, condition: 'Partly Cloudy', rainProb: 30, icon: 'cloud-sun' },
      { day: 'Tue', date: 'Oct 29', min: 27, max: 33, condition: 'Sunny', rainProb: 20, icon: 'sun' },
      { day: 'Wed', date: 'Oct 30', min: 27, max: 34, condition: 'Clear', rainProb: 10, icon: 'sun' }
    ],
    agriculturalAdvisory: 'Maintain drainage channels open in samba paddy nurseries to prevent submergence injury.',
    disasterRiskLevel: 'Moderate'
  },
  Bengaluru: {
    city: 'Bengaluru',
    state: 'Karnataka',
    country: 'India',
    coordinates: { lat: 12.9716, lon: 77.5946 },
    temperature: 26,
    feelsLike: 27,
    tempMin: 19,
    tempMax: 28,
    condition: 'Pleasant Breeze & Overcast',
    description: 'Plateau orographic clouding with cool easterly winds and isolated evening drizzle.',
    humidity: 68,
    windSpeed: 14,
    windDirection: 'E',
    pressure: 1015,
    visibility: 8.0,
    uvIndex: 6,
    airQualityIndex: 48,
    airQualityStatus: 'Good',
    dewPoint: 18,
    cloudCover: 50,
    sunrise: '06:09 AM',
    sunset: '05:58 PM',
    lastUpdated: 'Live telemetry synced from Bengaluru IMD Observatory',
    hourly: [
      { time: '06:00', temp: 20, condition: 'Cool Breeze', rainProb: 10, icon: 'cloud' },
      { time: '09:00', temp: 23, condition: 'Partly Cloudy', rainProb: 10, icon: 'cloud-sun' },
      { time: '12:00', temp: 27, condition: 'Pleasant', rainProb: 20, icon: 'sun' },
      { time: '15:00', temp: 28, condition: 'Cloudy', rainProb: 30, icon: 'cloud' },
      { time: '18:00', temp: 24, condition: 'Light Drizzle', rainProb: 40, icon: 'cloud-drizzle' },
      { time: '21:00', temp: 22, condition: 'Cool', rainProb: 15, icon: 'moon' },
      { time: '00:00', temp: 20, condition: 'Clear', rainProb: 5, icon: 'moon' }
    ],
    dailyForecast: [
      { day: 'Today', date: 'Oct 24', min: 19, max: 28, condition: 'Pleasant', rainProb: 30, icon: 'cloud-sun' },
      { day: 'Fri', date: 'Oct 25', min: 18, max: 27, condition: 'Afternoon Rain', rainProb: 45, icon: 'cloud-rain' },
      { day: 'Sat', date: 'Oct 26', min: 18, max: 27, condition: 'Overcast', rainProb: 35, icon: 'cloud' },
      { day: 'Sun', date: 'Oct 27', min: 19, max: 28, condition: 'Pleasant', rainProb: 20, icon: 'cloud-sun' },
      { day: 'Mon', date: 'Oct 28', min: 18, max: 29, condition: 'Sunny', rainProb: 10, icon: 'sun' },
      { day: 'Tue', date: 'Oct 29', min: 18, max: 29, condition: 'Sunny', rainProb: 10, icon: 'sun' },
      { day: 'Wed', date: 'Oct 30', min: 17, max: 28, condition: 'Clear', rainProb: 5, icon: 'sun' }
    ],
    agriculturalAdvisory: 'Favorable conditions for ragi harvesting and sericulture cocoon rearing.',
    disasterRiskLevel: 'Low'
  }
};

// Fallback generator for other cities
INDIAN_CITIES.forEach(cityName => {
  if (!MOCK_WEATHER_BY_CITY[cityName]) {
    MOCK_WEATHER_BY_CITY[cityName] = {
      ...MOCK_WEATHER_BY_CITY['Mumbai'],
      city: cityName,
      state: 'India',
      temperature: 28 + Math.floor(Math.random() * 5),
      humidity: 60 + Math.floor(Math.random() * 20),
      condition: 'Partly Cloudy'
    };
  }
});

export const MOCK_ALERTS = [
  {
    id: 'ALT-IMD-2026-089',
    title: 'Red Alert: Severe Cyclone Flash Inundation Warning (Bay of Bengal)',
    category: 'cyclone',
    severity: 'extreme',
    issuedBy: 'India Meteorological Department (IMD) & NDMA',
    issuedAt: '12 mins ago',
    validUntil: 'Valid next 24 Hours',
    affectedRegions: ['Digha', 'Kakdwip', 'Sagar Island', 'Sundarbans', 'Paradip'],
    coordinates: { lat: 21.62, lon: 87.52 },
    summary: 'Deep Cyclonic Depression intensifying into a Very Severe Cyclonic Storm. Expected landfall near North Odisha / West Bengal coast with 110-125 km/h squalls and 3.5m tidal surges.',
    advisories: [
      'Immediate mandatory evacuation of low-lying coastal mangrove settlements.',
      'Total ban on deep-sea and mechanized trawler fishing operations.',
      'Secure stored agricultural produce and livestock in cyclone shelters.'
    ],
    colorCode: '#ef4444'
  },
  {
    id: 'ALT-IMD-2026-090',
    title: 'Orange Alert: Heavy Squall & Thunderstorm Watch',
    category: 'thunderstorm',
    severity: 'severe',
    issuedBy: 'Regional Meteorological Centre Kolkata',
    issuedAt: '45 mins ago',
    validUntil: 'Valid next 12 Hours',
    affectedRegions: ['Howrah', 'Hooghly', 'North 24 Parganas', 'South 24 Parganas'],
    coordinates: { lat: 22.57, lon: 88.36 },
    summary: 'Severe convective storm clusters with lightning activity and wind gusts reaching 65-75 km/h.',
    advisories: [
      'Avoid sheltering under isolated tall trees and metal towers during lightning strikes.',
      'Farmers should suspend pesticide spraying and open drainage gates.'
    ],
    colorCode: '#f97316'
  },
  {
    id: 'ALT-IMD-2026-091',
    title: 'Yellow Alert: Heatwave & Elevated Solar Radiation Advisory',
    category: 'heatwave',
    severity: 'moderate',
    issuedBy: 'IMD New Delhi',
    issuedAt: '3 hours ago',
    validUntil: 'Valid till 6:00 PM',
    affectedRegions: ['Delhi NCR', 'Gurugram', 'Noida', 'Faridabad'],
    coordinates: { lat: 28.61, lon: 77.20 },
    summary: 'Day temperatures exceeding normal by 3-4°C with high PM2.5 haze entrapment.',
    advisories: [
      'Maintain frequent hydration and avoid strenuous outdoor work between 12 PM - 3 PM.',
      'Provide shaded shelter and fresh water for cattle and poultry.'
    ],
    colorCode: '#eab308'
  }
];

export const INITIAL_CHAT_MESSAGES = [
  {
    id: 'msg-welcome-01',
    sender: 'bot',
    timestamp: 'Just now',
    text: 'Namaste! I am **WeatherGPT**, India’s specialized AI meteorology and disaster decision support assistant.\n\nAsk me about:\n- 🌾 **Agricultural Crop Advisories** (Irrigation, sowing, pest alerts)\n- 🚨 **Live IMD / NDMA Disaster Warnings** (Cyclones, floods, heatwaves)\n- 🌦️ **7-Day NWP Forecast Models** (GFS & WRF high-resolution telemetry)\n- 🎙️ **Voice Assistance** in 6 Indian languages (Hindi, Bengali, Tamil, Telugu, Marathi, English)',
    sources: ['IMD Official Feeds', 'WRF-GFS 3km Ensemble', 'NDMA CAP 1.2'],
    weatherCard: {
      city: 'Mumbai',
      temperature: 31,
      condition: 'Humid & Partly Cloudy',
      rainProb: 20,
      riskLevel: 'Moderate'
    }
  }
];

export const MOCK_SAVED_LOCATIONS = [
  {
    id: 'loc-01',
    name: 'Nashik Vineyard Zone',
    city: 'Nashik',
    state: 'Maharashtra',
    type: 'Agriculture',
    lat: 19.9975,
    lon: 73.7898,
    isDefault: true
  },
  {
    id: 'loc-02',
    name: 'Kakdwip Coastal Farm',
    city: 'Kakdwip',
    state: 'West Bengal',
    type: 'Aquaculture',
    lat: 21.8753,
    lon: 88.1887,
    isDefault: false
  },
  {
    id: 'loc-03',
    name: 'NCR Agri Research Field',
    city: 'Delhi',
    state: 'Delhi NCR',
    type: 'Research',
    lat: 28.7041,
    lon: 77.1025,
    isDefault: false
  }
];

export const MOCK_CLIMATE_TRENDS = [
  { year: '2015', avgTemp: 27.2, anomaly: '+0.4', rainfall: 1140, extremeEvents: 6 },
  { year: '2016', avgTemp: 27.8, anomaly: '+1.0', rainfall: 1080, extremeEvents: 9 },
  { year: '2017', avgTemp: 27.5, anomaly: '+0.7', rainfall: 1220, extremeEvents: 7 },
  { year: '2018', avgTemp: 27.6, anomaly: '+0.8', rainfall: 1190, extremeEvents: 8 },
  { year: '2019', avgTemp: 28.1, anomaly: '+1.3', rainfall: 1350, extremeEvents: 14 },
  { year: '2020', avgTemp: 27.7, anomaly: '+0.9', rainfall: 1280, extremeEvents: 11 },
  { year: '2021', avgTemp: 28.0, anomaly: '+1.2', rainfall: 1410, extremeEvents: 15 },
  { year: '2022', avgTemp: 28.3, anomaly: '+1.5', rainfall: 1160, extremeEvents: 16 },
  { year: '2023', avgTemp: 28.6, anomaly: '+1.8', rainfall: 1090, extremeEvents: 19 },
  { year: '2024', avgTemp: 28.9, anomaly: '+2.1', rainfall: 1380, extremeEvents: 22 },
  { year: '2025', avgTemp: 29.1, anomaly: '+2.3', rainfall: 1440, extremeEvents: 25 },
  { year: '2026 (YTD)', avgTemp: 29.3, anomaly: '+2.5', rainfall: 1490, extremeEvents: 27 }
];
