import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { alertService } from '../services/api';
import { MOCK_GIS_GEOJSON } from '../data/mockData';
import { 
  MapContainer, 
  TileLayer, 
  Marker, 
  Popup, 
  GeoJSON,
  useMapEvents,
  useMap
} from 'react-leaflet';
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
  ShieldAlert,
  Activity,
  Compass,
  X,
  Sparkles,
  Info,
  Radio,
  Zap,
  CheckCircle2,
  Navigation,
  Crosshair,
  Maximize2
} from 'lucide-react';

// Custom Map Marker Icon for Leaflet
const createCustomIcon = (cityName, temp, isSelected) => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div class="flex items-center space-x-1.5 ${
        isSelected 
          ? 'bg-gradient-to-r from-cyan-500 to-sky-600 border-2 border-white text-white scale-110 shadow-[0_0_20px_rgba(6,182,212,0.8)]' 
          : 'bg-slate-900/95 border border-cyan-500/70 text-white'
      } text-xs px-2.5 py-1 rounded-xl shadow-2xl backdrop-blur-md hover:scale-115 transition-transform">
        <span class="w-2 h-2 rounded-full ${isSelected ? 'bg-white animate-ping' : 'bg-cyan-400 animate-pulse'}"></span>
        <span class="font-bold">${cityName}</span>
        <span class="text-cyan-200 font-black">${temp}°</span>
      </div>
    `,
    iconSize: [115, 34],
    iconAnchor: [57, 17]
  });
};

// Map Click Inspector Component
const MapClickHandler = ({ onMapClick }) => {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      onMapClick(lat, lng);
    }
  });
  return null;
};

// Programmatic Map Center Controller
const MapViewUpdater = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom || 6, { duration: 1.5 });
    }
  }, [center, zoom, map]);
  return null;
};

const WeatherMapPage = () => {
  const { INDIAN_CITIES, selectedCity, setSelectedCity, weatherData, setActiveScreen } = useApp();

  const [activeLayer, setActiveLayer] = useState('hazards'); // 'hazards' | 'rain' | 'temp' | 'wind' | 'pressure'
  const [geoJsonData, setGeoJsonData] = useState(MOCK_GIS_GEOJSON);
  const [inspectorData, setInspectorData] = useState(null);
  const [inspectorLoading, setInspectorLoading] = useState(false);
  const [clickedCoords, setClickedCoords] = useState(null);
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]); // Center of India
  const [mapZoom, setMapZoom] = useState(5);

  // 3D Parallax Tilt for Header Card
  const [heroTilt, setHeroTilt] = useState({ x: 0, y: 0, glareX: 50, glareY: 50 });
  const heroCardRef = useRef(null);

  const handleHeroMouseMove = useCallback((e) => {
    if (!heroCardRef.current) return;
    const rect = heroCardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rotateX = ((y / rect.height) - 0.5) * -6;
    const rotateY = ((x / rect.width) - 0.5) * 6;
    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;
    setHeroTilt({ x: rotateX, y: rotateY, glareX, glareY });
  }, []);

  const handleHeroMouseLeave = () => {
    setHeroTilt({ x: 0, y: 0, glareX: 50, glareY: 50 });
  };

  // Fetch live GeoJSON disaster layers
  useEffect(() => {
    const fetchLayers = async () => {
      try {
        const layers = await alertService.getGisLayers();
        if (layers && layers.features) {
          setGeoJsonData(layers);
        }
      } catch (err) {
        console.warn('Failed to load GIS GeoJSON layers:', err);
      }
    };
    fetchLayers();
  }, []);

  // Handle map click coordinate hazard check
  const handleMapClick = async (lat, lon) => {
    const roundedLat = parseFloat(lat.toFixed(4));
    const roundedLon = parseFloat(lon.toFixed(4));
    setClickedCoords({ lat: roundedLat, lon: roundedLon });
    setInspectorLoading(true);

    try {
      const evaluation = await alertService.checkLocationHazard(roundedLat, roundedLon);
      setInspectorData(evaluation);
    } catch (err) {
      console.warn('Hazard evaluation error:', err);
    } finally {
      setInspectorLoading(false);
    }
  };

  // Quick pan to city
  const handleJumpToCity = (city) => {
    setSelectedCity(city.name);
    setMapCenter([city.lat, city.lon]);
    setMapZoom(7);
    handleMapClick(city.lat, city.lon);
  };

  // GeoJSON style parser
  const getGeoJsonStyle = (feature) => {
    const severity = feature.properties?.severity?.toLowerCase() || 'warning';
    if (severity === 'extreme' || feature.properties?.color === '#ef4444') {
      return {
        color: '#dc2626',
        fillColor: '#ef4444',
        fillOpacity: 0.4,
        weight: 3,
        dashArray: '5, 5'
      };
    }
    if (severity === 'severe' || feature.properties?.color === '#f97316') {
      return {
        color: '#ea580c',
        fillColor: '#f97316',
        fillOpacity: 0.4,
        weight: 2.5
      };
    }
    return {
      color: '#ca8a04',
      fillColor: '#eab308',
      fillOpacity: 0.3,
      weight: 2
    };
  };

  const onEachGeoJsonFeature = (feature, layer) => {
    const props = feature.properties || {};
    const popupContent = `
      <div style="font-family: sans-serif; font-size: 12px; padding: 6px; min-width: 180px;">
        <div style="font-weight: 900; color: #38bdf8; margin-bottom: 4px; font-size: 14px;">${props.title || 'Disaster Zone'}</div>
        <div style="color: #94a3b8; font-size: 11px; margin-bottom: 6px;">Severity: <strong style="color: ${props.color || '#ef4444'}; text-transform: uppercase; font-weight: 800;">${props.severity || 'High'}</strong></div>
        <div style="color: #f1f5f9; line-height: 1.4; margin-bottom: 8px;">${props.description || 'Hazard polygon area active.'}</div>
        <div style="font-size: 10px; color: #38bdf8; font-weight: 700;">📍 Click anywhere to inspect IMD advisories</div>
      </div>
    `;
    layer.bindPopup(popupContent);
  };

  const layersList = [
    { id: 'hazards', label: 'Disaster Hazard Polygons', icon: AlertTriangle, color: 'text-amber-400', badge: 'GeoJSON' },
    { id: 'rain', label: 'Precipitation Doppler Radar', icon: CloudRain, color: 'text-sky-400', badge: 'Live' },
    { id: 'temp', label: 'Temperature Heatmap', icon: Thermometer, color: 'text-rose-400', badge: 'Thermal' },
    { id: 'wind', label: 'Wind Streamlines', icon: Wind, color: 'text-cyan-400', badge: 'Vector' },
    { id: 'pressure', label: 'Barometric Isobars', icon: Gauge, color: 'text-purple-400', badge: 'Isobar' },
  ];

  return (
    <div className="space-y-6 select-none perspective-[1200px] pb-10">
      
      {/* ========================================================================= */}
      {/* 1. 3D LIQUID HERO GIS CONTROLLER HEADER                                   */}
      {/* ========================================================================= */}
      <div 
        ref={heroCardRef}
        onMouseMove={handleHeroMouseMove}
        onMouseLeave={handleHeroMouseLeave}
        className="liquid-sidebar rounded-3xl p-6 sm:p-7 relative overflow-hidden shadow-2xl transition-transform duration-300 ease-out transform-gpu group"
        style={{
          transform: `rotateX(${heroTilt.x}deg) rotateY(${heroTilt.y}deg)`,
          transformStyle: 'preserve-3d'
        }}
      >
        {/* Specular Liquid Glare Overlay */}
        <div 
          className="absolute inset-0 pointer-events-none z-30 opacity-70 transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at ${heroTilt.glareX}% ${heroTilt.glareY}%, rgba(255, 255, 255, 0.18) 0%, rgba(6, 182, 212, 0.08) 35%, transparent 70%)`
          }}
        />

        {/* Ambient Morphing Liquid Blobs */}
        <div className="absolute top-0 right-10 w-96 h-96 bg-gradient-to-br from-cyan-500/20 via-sky-600/15 to-blue-600/20 rounded-full blur-3xl animate-liquid-1 pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-gradient-to-tr from-amber-500/15 to-rose-600/15 rounded-full blur-3xl animate-liquid-2 pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2.5">
            <div className="flex items-center space-x-2.5">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-xs font-bold backdrop-blur-md shadow-sm">
                <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                <span>GIS Early Warning & Hazard Radar Grid</span>
              </div>
              <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-md">
                GeoJSON 1.0 Live
              </span>
            </div>

            <div>
              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight drop-shadow-md">
                Interactive Geospatial Disaster Radar: <span className="text-cyan-400">{selectedCity}</span>
              </h1>
              <p className="text-xs text-slate-300/90 font-medium mt-1">
                Click anywhere on the map to evaluate Point-in-Polygon containment, cyclone buffers, flood levels, and IMD safety advisories.
              </p>
            </div>
          </div>

          {/* Quick Focus Station Chips */}
          <div className="flex flex-col sm:items-end space-y-2">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Fast Pan to Regional Hub</span>
            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 max-w-md scrollbar-none">
              {INDIAN_CITIES.slice(0, 6).map((city) => (
                <button
                  key={city.name}
                  onClick={() => handleJumpToCity(city)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1 flex-shrink-0 ${
                    selectedCity === city.name
                      ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/30 border border-cyan-300'
                      : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-white/10 hover:border-cyan-400/40'
                  }`}
                >
                  <MapPin className="w-3 h-3" />
                  <span>{city.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Layer Selector Chips Bar */}
        <div className="mt-5 pt-4 border-t border-white/10 flex items-center space-x-2 overflow-x-auto scrollbar-none relative z-10">
          <span className="text-xs font-bold text-slate-300 flex items-center space-x-1 flex-shrink-0 mr-1">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>Active Layer:</span>
          </span>
          {layersList.map((layer) => {
            const Icon = layer.icon;
            const isActive = activeLayer === layer.id;

            return (
              <button
                key={layer.id}
                onClick={() => setActiveLayer(layer.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-2xl text-xs font-bold transition flex-shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500 to-sky-600 text-white shadow-lg shadow-cyan-500/30 border border-cyan-300/40 scale-105'
                    : 'bg-slate-900/90 text-slate-300 hover:text-white border border-white/10 hover:border-cyan-400/40'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : layer.color}`} />
                <span className="whitespace-nowrap">{layer.label}</span>
                <span className={`text-[9px] px-1.5 py-0.2 rounded-md font-black ${
                  isActive ? 'bg-white/20 text-white' : 'bg-white/10 text-cyan-300'
                }`}>
                  {layer.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. 3D GLASSPHENE GIS MAP CONTAINER                                        */}
      {/* ========================================================================= */}
      <div className="relative liquid-sidebar rounded-3xl border-2 border-cyan-500/30 h-[660px] overflow-hidden shadow-2xl group">
        
        {/* Live Leaflet Map */}
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          scrollWheelZoom={true}
          style={{ width: '100%', height: '100%', borderRadius: '1.5rem' }}
        >
          <MapViewUpdater center={mapCenter} zoom={mapZoom} />

          {/* Dark Matter Premium Carto Basemap */}
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a> Dark Matter'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />

          {/* Click Handler Hook */}
          <MapClickHandler onMapClick={handleMapClick} />

          {/* GeoJSON Disaster Hazard Polygons Layer */}
          {activeLayer === 'hazards' && geoJsonData && (
            <GeoJSON
              key={JSON.stringify(geoJsonData)}
              data={geoJsonData}
              style={getGeoJsonStyle}
              onEachFeature={onEachGeoJsonFeature}
            />
          )}

          {/* Precipitation Radar Overlay Layer */}
          {activeLayer === 'rain' && (
            <TileLayer
              attribution="OpenWeatherMap Precipitation"
              url="https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=439d4b8044b357376374221575388c64"
              opacity={0.7}
            />
          )}

          {/* City Interactive Markers */}
          {INDIAN_CITIES.map((city) => (
            <Marker
              key={city.name}
              position={[city.lat, city.lon]}
              icon={createCustomIcon(city.name, city.name === selectedCity ? (weatherData?.temp || 29) : 28, city.name === selectedCity)}
              eventHandlers={{
                click: () => {
                  setSelectedCity(city.name);
                  handleMapClick(city.lat, city.lon);
                }
              }}
            >
              <Popup>
                <div className="p-1 space-y-2 text-xs text-slate-100 min-w-[160px]">
                  <div className="flex items-center justify-between border-b border-slate-700 pb-1">
                    <span className="font-extrabold text-cyan-300 text-sm">{city.name}</span>
                    <span className="text-[10px] text-slate-400 font-semibold">{city.state}</span>
                  </div>
                  <p className="text-slate-200">Observed Temp: <strong className="text-white">29°C</strong></p>
                  <p className="text-slate-200">Weather Condition: <strong className="text-cyan-400">Thunderstorm & Rain</strong></p>
                  <p className="text-slate-200">Wind Heading: <strong className="text-slate-100">24 km/h SW</strong></p>
                  <button
                    onClick={() => {
                      setSelectedCity(city.name);
                      setActiveScreen('chat');
                    }}
                    className="w-full mt-2 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-600 text-white text-xs font-bold shadow-md hover:brightness-110 transition"
                  >
                    Query WeatherGPT AI
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* 3D Floating GIS Legend HUD (Bottom-Left) */}
        <div className="absolute bottom-6 left-6 z-[1000] p-4 rounded-3xl bg-slate-950/90 border border-white/15 text-xs space-y-2.5 max-w-xs shadow-2xl backdrop-blur-2xl">
          <div className="flex items-center space-x-2 font-bold text-white">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>GIS Hazard Severity Legend</span>
          </div>

          <div className="space-y-2 text-[11px] text-slate-300 pt-0.5">
            <div className="flex items-center space-x-2.5">
              <span className="w-3 h-3 rounded-full bg-red-500 shadow-md shadow-red-500/50 border border-white/40 animate-pulse"></span>
              <span className="font-bold text-red-400">Red Alert Cyclone & Flood Inundation</span>
            </div>
            <div className="flex items-center space-x-2.5">
              <span className="w-3 h-3 rounded-full bg-orange-500 shadow-md shadow-orange-500/50 border border-white/40"></span>
              <span className="font-bold text-orange-400">Orange Alert Severe Convective Squall</span>
            </div>
            <div className="flex items-center space-x-2.5">
              <span className="w-3 h-3 rounded-full bg-yellow-400 shadow-md shadow-yellow-400/50 border border-white/40"></span>
              <span className="font-bold text-yellow-300">Yellow Alert Heatwave Warning</span>
            </div>
          </div>
        </div>

        {/* 3D Coordinate Hazard Inspector Slide-Over Drawer (Right Side) */}
        {clickedCoords && (
          <div className="absolute top-4 right-4 bottom-4 w-80 sm:w-96 z-[1000] p-6 rounded-3xl bg-slate-950/95 border-2 border-cyan-400/50 shadow-[0_15px_50px_rgba(0,0,0,0.8)] backdrop-blur-3xl flex flex-col justify-between overflow-y-auto animate-fade-in">
            <div className="space-y-4">
              
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center space-x-2 text-cyan-300 font-extrabold text-xs">
                  <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
                  <span>Point-in-Polygon Hazard Inspector</span>
                </div>
                <button
                  onClick={() => setClickedCoords(null)}
                  className="p-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white border border-white/10 transition"
                  title="Close Inspector"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Coordinates Coordinate Badge */}
              <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-white/10 flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                  <Crosshair className="w-4 h-4 text-cyan-400" /> Target Coordinate:
                </span>
                <span className="font-black text-white">
                  {clickedCoords.lat}°N, {clickedCoords.lon}°E
                </span>
              </div>

              {/* Loader or Content */}
              {inspectorLoading ? (
                <div className="p-10 text-center text-xs text-slate-300 space-y-3">
                  <div className="w-8 h-8 border-3 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto shadow-lg shadow-cyan-500/30" />
                  <p className="font-semibold">Evaluating Point-in-Polygon containment & IMD warning thresholds...</p>
                </div>
              ) : inspectorData ? (
                <div className="space-y-4">
                  {/* Severity Card */}
                  <div className={`p-4 rounded-2xl border ${
                    inspectorData.hazardEvaluation?.colorCode === 'RED'
                      ? 'bg-red-950/50 border-red-500/70 text-red-200 shadow-lg shadow-red-950/50'
                      : inspectorData.hazardEvaluation?.colorCode === 'ORANGE'
                      ? 'bg-orange-950/50 border-orange-500/70 text-orange-200 shadow-lg shadow-orange-950/50'
                      : 'bg-emerald-950/50 border-emerald-500/70 text-emerald-200 shadow-lg shadow-emerald-950/50'
                  }`}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] uppercase font-black tracking-wider">IMD Hazard Classification</span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-slate-950/90 border border-white/20">
                        {inspectorData.hazardEvaluation?.rating || 'NORMAL'}
                      </span>
                    </div>
                    <p className="font-black text-white text-base">
                      {inspectorData.hazardEvaluation?.primaryRisk || 'Standard Ambient Conditions'}
                    </p>
                  </div>

                  {/* Weather Telemetry at Point */}
                  {inspectorData.weatherObservation && (
                    <div className="grid grid-cols-2 gap-2.5 text-xs">
                      <div className="p-3 rounded-2xl bg-slate-900/90 border border-white/10">
                        <p className="text-[10px] text-slate-400 font-semibold">Point Wind Vector</p>
                        <p className="font-black text-white text-sm mt-0.5">{inspectorData.weatherObservation.windSpeed} km/h</p>
                      </div>
                      <div className="p-3 rounded-2xl bg-slate-900/90 border border-white/10">
                        <p className="text-[10px] text-slate-400 font-semibold">Precipitation Rate</p>
                        <p className="font-black text-sky-400 text-sm mt-0.5">{inspectorData.weatherObservation.rainfall} mm/h</p>
                      </div>
                    </div>
                  )}

                  {/* Advisories */}
                  {inspectorData.hazardEvaluation?.advisories && (
                    <div className="space-y-2 pt-1">
                      <p className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-cyan-400" /> Actionable Safety Advisories:
                      </p>
                      <div className="space-y-2 text-xs text-slate-200">
                        {inspectorData.hazardEvaluation.advisories.map((adv, idx) => (
                          <div key={idx} className="flex items-start space-x-2.5 p-2.5 rounded-2xl bg-slate-900/80 border border-white/10">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 flex-shrink-0 shadow-sm shadow-cyan-400" />
                            <p className="leading-relaxed font-medium">{adv}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            {/* Bottom AI Query Button */}
            <button
              onClick={() => setActiveScreen('chat')}
              className="w-full mt-4 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-sky-600 text-white font-black text-xs shadow-lg shadow-cyan-500/30 hover:brightness-110 transition active:scale-95 cursor-pointer"
            >
              Ask AI Crop Advisory for Point
            </button>
          </div>
        )}
      </div>

    </div>
  );
};

export default WeatherMapPage;
