// WeatherGPT Application Configuration Constants
// Contains only geographical gazetteer and language configuration. All weather, forecast, and alerts are fetched dynamically in real time from backend / Open-Meteo.

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
  { name: 'Lucknow', state: 'Uttar Pradesh', lat: 26.8467, lon: 80.9462, region: 'Northern India' },
  { name: 'Srinagar', state: 'Jammu & Kashmir', lat: 34.0837, lon: 74.7973, region: 'Northern India' },
  { name: 'Patna', state: 'Bihar', lat: 25.5941, lon: 85.1376, region: 'Eastern India' },
  { name: 'Bhopal', state: 'Madhya Pradesh', lat: 23.2599, lon: 77.4126, region: 'Central India' },
  { name: 'Thiruvananthapuram', state: 'Kerala', lat: 8.5241, lon: 76.9366, region: 'Southern India' }
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

export const DEFAULT_CITY = 'Mumbai';
