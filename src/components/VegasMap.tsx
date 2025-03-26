import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DaySchedule } from '../types';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet marker icon issue in React
// This is needed because webpack handles assets differently than Leaflet expects
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png'
});

interface VegasMapProps {
  schedule: DaySchedule[];
}

interface MapLocation {
  id: string;
  name: string;
  coordinates: [number, number]; // [latitude, longitude]
  type: 'hotel' | 'casino' | 'restaurant' | 'attraction' | 'nightclub';
  description: string;
}

// Component to change map view based on selected area
const ChangeMapView = ({ center, zoom }: { center: [number, number], zoom: number }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

const VegasMap: React.FC<VegasMapProps> = ({ schedule }) => {
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null);
  const [mapView, setMapView] = useState<'overview' | 'strip' | 'fremont'>('strip');
  
  // Real Las Vegas locations with actual coordinates
  const locations: MapLocation[] = [
    { 
      id: 'aria', 
      name: 'Aria', 
      coordinates: [36.1072, -115.1740], 
      type: 'hotel',
      description: 'Luxury hotel on the Strip featuring modern architecture and amenities.'
    },
    { 
      id: 'mgm-grand', 
      name: 'MGM Grand', 
      coordinates: [36.1025, -115.1701], 
      type: 'hotel',
      description: 'One of the largest hotels on the Strip with a signature lion entrance.'
    },
    { 
      id: 'golden-nugget', 
      name: 'Golden Nugget', 
      coordinates: [36.1709, -115.1452], 
      type: 'hotel',
      description: 'Historic hotel and casino in downtown Las Vegas with a famous shark tank pool.'
    },
    { 
      id: 'sphere', 
      name: 'Sphere', 
      coordinates: [36.1147, -115.1695], 
      type: 'attraction',
      description: 'Revolutionary entertainment venue with state-of-the-art immersive experiences.'
    },
    { 
      id: 'caesars', 
      name: 'Caesars Palace', 
      coordinates: [36.1162, -115.1745], 
      type: 'casino',
      description: 'Iconic Las Vegas resort with Roman-inspired architecture and the Bacchanal Buffet.'
    },
    { 
      id: 'omnia', 
      name: 'Omnia', 
      coordinates: [36.1165, -115.1743], 
      type: 'nightclub',
      description: 'Premier nightclub at Caesars Palace featuring world-class DJs and a spectacular chandelier.'
    },
    { 
      id: 'fremont', 
      name: 'Fremont Street', 
      coordinates: [36.1699, -115.1398], 
      type: 'attraction',
      description: 'Historic street in downtown Las Vegas with the famous canopy light show.'
    },
    { 
      id: 'area15', 
      name: 'Area 15', 
      coordinates: [36.1589, -115.1967], 
      type: 'attraction',
      description: 'Immersive entertainment complex featuring art installations and virtual reality experiences.'
    },
    { 
      id: 'sugarcane', 
      name: 'Sugarcane', 
      coordinates: [36.1092, -115.1710], 
      type: 'restaurant',
      description: 'Global small plates restaurant with raw bar and open fire grill.'
    },
    { 
      id: 'kassi-beach', 
      name: 'Kassi Beach House', 
      coordinates: [36.1066, -115.1775], 
      type: 'restaurant',
      description: 'Coastal Italian restaurant with a luxurious beach club atmosphere.'
    },
    { 
      id: 'liv-beach', 
      name: 'LIV Beach', 
      coordinates: [36.1027, -115.1690], 
      type: 'nightclub',
      description: 'Day club featuring premier DJs and a vibrant pool party atmosphere.'
    },
    { 
      id: 'jollibee', 
      name: 'Jollibee', 
      coordinates: [36.1290, -115.1695], 
      type: 'restaurant',
      description: 'Filipino fast-food chain famous for its Chickenjoy and sweet-style spaghetti.'
    }
  ];
  
  // Determine map center and zoom based on selected view
  const getMapSettings = () => {
    switch (mapView) {
      case 'overview':
        return { center: [36.1444, -115.1652] as [number, number], zoom: 11 };
      case 'strip':
        return { center: [36.1147, -115.1730] as [number, number], zoom: 14 };
      case 'fremont':
        return { center: [36.1699, -115.1398] as [number, number], zoom: 15 };
      default:
        return { center: [36.1147, -115.1730] as [number, number], zoom: 14 };
    }
  };
  
  // Filter locations based on the current view
  const visibleLocations = (() => {
    switch (mapView) {
      case 'overview':
        return locations;
      case 'strip':
        return locations.filter(loc => loc.id !== 'golden-nugget' && loc.id !== 'fremont');
      case 'fremont':
        return locations.filter(loc => loc.id === 'golden-nugget' || loc.id === 'fremont');
      default:
        return locations;
    }
  })();

  // Create custom markers based on location type
  const createCustomIcon = (type: string) => {
    const getColor = () => {
      switch (type) {
        case 'hotel': return '#05D9E8'; // cyber-blue
        case 'casino': return '#FFD700'; // cyber-gold
        case 'restaurant': return '#D1FF33'; // cyber-green
        case 'nightclub': return '#FF2A6D'; // cyber-pink
        case 'attraction': return '#7638FA'; // cyber-purple
        default: return '#FFFFFF';
      }
    };

    return L.divIcon({
      className: 'custom-icon',
      html: `
        <div style="
          width: 24px;
          height: 24px;
          background-color: ${getColor()};
          border-radius: 50%;
          display: flex;
          justify-content: center;
          align-items: center;
          box-shadow: 0 0 10px ${getColor()}, 0 0 20px ${getColor()};
          border: 2px solid rgba(255, 255, 255, 0.8);
          animation: pulse 2s infinite alternate;
        ">
        </div>
        <style>
          @keyframes pulse {
            0% { transform: scale(0.95); box-shadow: 0 0 10px ${getColor()}, 0 0 20px ${getColor()}; }
            100% { transform: scale(1.05); box-shadow: 0 0 15px ${getColor()}, 0 0 30px ${getColor()}; }
          }
        </style>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });
  };

  // Map settings
  const { center, zoom } = getMapSettings();

  return (
    <motion.div
      className="w-full max-w-4xl mx-auto px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-center text-4xl font-bold mb-8 text-cyber-purple neon-text">VEGAS MAP</h2>

      <div className="flex justify-center mb-6 space-x-4">
        <button
          className={`cyber-btn text-sm ${mapView === 'overview' ? 'bg-cyber-pink text-white' : ''}`}
          onClick={() => setMapView('overview')}
        >
          OVERVIEW
        </button>
        <button
          className={`cyber-btn text-sm ${mapView === 'strip' ? 'bg-cyber-pink text-white' : ''}`}
          onClick={() => setMapView('strip')}
        >
          THE STRIP
        </button>
        <button
          className={`cyber-btn text-sm ${mapView === 'fremont' ? 'bg-cyber-pink text-white' : ''}`}
          onClick={() => setMapView('fremont')}
        >
          FREMONT
        </button>
      </div>
      
      <div className="relative">
        <div className="glass-panel aspect-[16/9] w-full overflow-hidden rounded-xl">
          {/* Real Leaflet Map */}
          <MapContainer 
            center={center} 
            zoom={zoom} 
            style={{ height: "100%", width: "100%" }}
            zoomControl={false}
            attributionControl={false}
          >
            {/* Use a darker cyberpunk-themed map style */}
            <TileLayer
              url="https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
            />
            
            {/* Update view when buttons are clicked */}
            <ChangeMapView center={center} zoom={zoom} />
            
            {/* Map all locations with custom markers */}
            {visibleLocations.map((location) => (
              <Marker 
                key={location.id}
                position={location.coordinates}
                icon={createCustomIcon(location.type)}
                eventHandlers={{
                  click: () => {
                    setSelectedLocation(location);
                  }
                }}
              >
                <Popup className="cyberpunk-popup">
                  <div className="bg-cyber-dark text-white p-2 rounded-md">
                    <h3 className="text-lg font-bold mb-1 text-center">{location.name}</h3>
                    <p className="text-sm">{location.description}</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
          
          {/* Map overlay with cyber grid effect - REDUCED DARKNESS */}
          <div className="absolute inset-0 pointer-events-none" style={{ 
            background: 'radial-gradient(circle, rgba(0,0,0,0) 0%, rgba(0,0,0,0.1) 100%)',
            boxShadow: 'inset 0 0 50px rgba(5, 217, 232, 0.1), inset 0 0 100px rgba(255, 42, 109, 0.1)'
          }}>
            <div className="absolute inset-0 opacity-5" style={{
              backgroundImage: 'linear-gradient(to right, #FF2A6D 1px, transparent 1px), linear-gradient(to bottom, #05D9E8 1px, transparent 1px)',
              backgroundSize: '40px 40px'
            }}></div>
          </div>
          
          {/* Map legend - IMPROVED VISIBILITY */}
          <div className="absolute bottom-4 left-4 bg-cyber-dark/80 border border-cyber-blue p-3 rounded-md text-xs z-10">
            <div className="flex flex-col space-y-2">
              <h4 className="text-cyber-blue font-bold text-sm">LEGEND</h4>
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-cyber-blue mr-2 shadow-neon-blue"></div>
                <span className="text-white">Hotels</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-cyber-gold mr-2 shadow-neon-gold"></div>
                <span className="text-white">Casinos</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-cyber-green mr-2 shadow-neon-green"></div>
                <span className="text-white">Restaurants</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-cyber-pink mr-2 shadow-neon-pink"></div>
                <span className="text-white">Nightclubs</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-cyber-purple mr-2" style={{ boxShadow: '0 0 5px #7638FA, 0 0 20px #7638FA' }}></div>
                <span className="text-white">Attractions</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Selected location details */}
        <AnimatePresence>
          {selectedLocation && (
            <motion.div
              className="glass-panel p-4 mt-4 rounded-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-cyber-blue neon-text">{selectedLocation.name}</h3>
                  <p className="text-white/70 mt-1">{selectedLocation.description}</p>
                  
                  {/* Show related events from schedule */}
                  <div className="mt-4">
                    <h4 className="text-cyber-pink text-sm font-bold mb-2">SCHEDULED EVENTS:</h4>
                    {schedule.flatMap(day => 
                      day.events.filter(event => 
                        event.description.toLowerCase().includes(selectedLocation.name.toLowerCase())
                      ).map((event, idx) => (
                        <div key={idx} className="bg-black/30 p-2 rounded-md mb-2">
                          <div className="flex justify-between">
                            <span className="text-cyber-green">{day.day}, {day.date}</span>
                            <span className="text-cyber-blue">{event.time}</span>
                          </div>
                          <p className="text-white text-sm">{event.description}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedLocation(null)}
                  className="text-white/60 hover:text-white"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default VegasMap; 