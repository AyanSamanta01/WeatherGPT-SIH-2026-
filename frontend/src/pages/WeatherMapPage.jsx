import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import { 
  Map as MapIcon, 
  Layers, 
  CloudRain, 
  Thermometer, 
  Wind, 
  AlertTriangle, 
  Gauge, 
  MapPin, 
  Maximize2 
} from 'lucide-react';

// Custom Map Marker Icon for Leaflet
const createCustomIcon = (cityName, temp, condition) => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div className="flex items-center space-x-1.5 bg-slate-900/90 border border-cyan-500/60 text-white text-xs px-2.5 py-1 rounded-xl shadow-xl backdrop-blur-md hover:scale-110 transition-transform">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
        <span className="font-bold">${cityName}</span>
        <span className="text-cyan-300 font-extrabold">${temp}°</span>
      </div>
    `,
    iconSize: [100, 30],
    iconAnchor: [50, 15]
  });
};

const WeatherMapPage = () => {
  const { INDIAN_CITIES, selectedCity, setSelectedCity, weatherData } = useApp();
  const [activeLayer, setActiveLayer] = useState('rain'); // 'rain' | 'temp' | 'wind' | 'pressure' | 'hazards'

  const layersList = [
    { id: 'rain', label: 'Precipitation / Radar', icon: CloudRain, color: 'text-sky-400' },
    { id: 'temp', label: 'Temperature Heatmap', icon: Thermometer, color: 'text-red-400' },
    { id: 'wind', label: 'Wind Velocity Streamlines', icon: Wind, color: 'text-cyan-400' },
    { id: 'pressure', label: 'Barometric Isobars', icon: Gauge, color: 'text-purple-400' },
    { id: 'hazards', label: 'Active Cyclone & Flood Hazards', icon: AlertTriangle, color: 'text-amber-400' },
  ];

  return (
    <div className="space-y-6">
      {/* Map Control Bar */}
      <div className="glass-panel p-4 rounded-3xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-cyan-400 text-xs font-semibold mb-1">
            <Layers className="w-4 h-4" />
            <span>GIS Geospatial Visualization Engine</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white">
            Interactive Weather & Radar Map: <span className="text-cyan-400">{selectedCity} Focus</span>
          </h1>
        </div>

        {/* Layer Buttons Selector */}
        <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar max-w-full">
          {layersList.map((layer) => {
            const Icon = layer.icon;
            const isActive = activeLayer === layer.id;

            return (
              <button
                key={layer.id}
                onClick={() => setActiveLayer(layer.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-md shadow-cyan-500/10'
                    : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${layer.color}`} />
                <span className="whitespace-nowrap">{layer.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Map Container Box */}
      <div className="glass-panel p-2 rounded-3xl border border-slate-800 h-[650px] relative overflow-hidden shadow-2xl">
        <MapContainer
          center={[20.5937, 78.9629]} // Center of India
          zoom={5}
          scrollWheelZoom={true}
          style={{ width: '100%', height: '100%', borderRadius: '1.25rem' }}
        >
          {/* Dark Mode Basemap Layer */}
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a> Dark Matter'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />

          {/* Additional Layer Overlay Simulation */}
          {activeLayer === 'rain' && (
            <TileLayer
              attribution="OpenWeatherMap Precipitation"
              url="https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=439d4b8044b357376374221575388c64"
              opacity={0.6}
            />
          )}

          {/* Active Hazard Zones Circles */}
          {activeLayer === 'hazards' && (
            <>
              {/* Mumbai Cyclone Circle */}
              <Circle
                center={[19.0760, 72.8777]}
                radius={120000}
                pathOptions={{ color: 'red', fillColor: 'red', fillOpacity: 0.25 }}
              />
              {/* Kolkata Flood Circle */}
              <Circle
                center={[22.5726, 88.3639]}
                radius={90000}
                pathOptions={{ color: 'orange', fillColor: 'orange', fillOpacity: 0.25 }}
              />
            </>
          )}

          {/* City Markers */}
          {INDIAN_CITIES.map((city) => (
            <Marker
              key={city.name}
              position={[city.lat, city.lon]}
              icon={createCustomIcon(city.name, 29, 'Thunderstorm')}
              eventHandlers={{
                click: () => setSelectedCity(city.name)
              }}
            >
              <Popup>
                <div className="p-1 space-y-1.5 text-xs text-slate-100">
                  <div className="flex items-center justify-between border-b border-slate-700 pb-1">
                    <span className="font-bold text-cyan-300 text-sm">{city.name}</span>
                    <span className="text-[10px] text-slate-400">{city.state}</span>
                  </div>
                  <p className="text-slate-200">Temp: <strong className="text-white">29°C</strong></p>
                  <p className="text-slate-200">Condition: <strong className="text-cyan-400">Thunderstorm & Rain</strong></p>
                  <p className="text-slate-200">Wind: <strong className="text-slate-100">24 km/h SW</strong></p>
                  <button
                    onClick={() => setSelectedCity(city.name)}
                    className="w-full mt-2 py-1 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-bold border border-cyan-500/40 hover:bg-cyan-500/30"
                  >
                    Select Location
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Floating Legend Box */}
        <div className="absolute bottom-6 left-6 z-[1000] glass-panel p-3.5 rounded-2xl border border-slate-800 text-xs space-y-2 max-w-xs shadow-2xl">
          <div className="flex items-center space-x-2 font-bold text-white">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>GIS Overlay Legend</span>
          </div>
          {activeLayer === 'rain' && (
            <div className="space-y-1 text-[11px] text-slate-300">
              <div className="flex items-center justify-between">
                <span>Light Rain (&lt;5mm/h)</span>
                <span className="w-4 h-2 rounded bg-sky-400"></span>
              </div>
              <div className="flex items-center justify-between">
                <span>Heavy Monsoon (&gt;20mm/h)</span>
                <span className="w-4 h-2 rounded bg-blue-600"></span>
              </div>
              <div className="flex items-center justify-between">
                <span>Severe Storm (&gt;50mm/h)</span>
                <span className="w-4 h-2 rounded bg-purple-600"></span>
              </div>
            </div>
          )}

          {activeLayer === 'hazards' && (
            <div className="space-y-1 text-[11px] text-slate-300">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-red-500/50 border border-red-500"></span>
                <span>Red Alert Cyclone Zone</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-orange-500/50 border border-orange-500"></span>
                <span>Orange Alert Flood Zone</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WeatherMapPage;
