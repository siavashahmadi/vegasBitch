import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet marker icon issue in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png'
});

// Enhanced Nightlife Locations
interface VenueLocation {
  id: string;
  name: string;
  coordinates: [number, number];
  type: 'club' | 'bar' | 'lounge' | 'restaurant' | 'casino';
  description: string;
  hours?: string;
  entry?: string;
  music?: string;
  rating?: number;
}

const NightlifeMode: React.FC = () => {
  const [drinkCount, setDrinkCount] = useState<number>(0);
  const [totalSpent, setTotalSpent] = useState<number>(0);
  const [drinkPrice, setDrinkPrice] = useState<number>(18);
  const [emergencyMode, setEmergencyMode] = useState<boolean>(false);
  const [selectedVenue, setSelectedVenue] = useState<VenueLocation | null>(null);
  const [venueInfoModal, setVenueInfoModal] = useState<boolean>(false);
  
  // Nightlife locations - real Las Vegas venues with actual coordinates
  const venues: VenueLocation[] = [
    {
      id: 'omnia',
      name: 'Omnia',
      coordinates: [36.1165, -115.1743],
      type: 'club',
      description: 'Premier nightclub at Caesars Palace featuring world-class DJs and a spectacular chandelier.',
      hours: '10:30 PM - 4:00 AM',
      entry: '$30-100',
      music: 'EDM, Hip-Hop',
      rating: 4.5
    },
    {
      id: 'xs',
      name: 'XS Nightclub',
      coordinates: [36.1261, -115.1678],
      type: 'club',
      description: 'One of the top grossing clubs in the US, located at Encore.',
      hours: '10:00 PM - 4:00 AM',
      entry: '$30-75',
      music: 'EDM, House',
      rating: 4.6
    },
    {
      id: 'hakkasan',
      name: 'Hakkasan',
      coordinates: [36.1036, -115.1689],
      type: 'club',
      description: 'Five-level club at MGM Grand with a restaurant, lounge, and main nightclub area.',
      hours: '10:30 PM - 4:00 AM',
      entry: '$20-100',
      music: 'EDM, Top 40',
      rating: 4.3
    },
    {
      id: 'marquee',
      name: 'Marquee',
      coordinates: [36.1146, -115.1728],
      type: 'club',
      description: 'Popular nightclub in The Cosmopolitan with an outdoor pool deck.',
      hours: '10:30 PM - 4:00 AM',
      entry: '$20-50',
      music: 'EDM, Pop',
      rating: 4.2
    },
    {
      id: 'chandelier',
      name: 'The Chandelier',
      coordinates: [36.1095, -115.1760],
      type: 'lounge',
      description: 'Multi-story cocktail venue inside a giant chandelier at The Cosmopolitan.',
      hours: '24 hours',
      entry: 'Free',
      music: 'Ambient',
      rating: 4.7
    },
    {
      id: 'ghostbar',
      name: 'Ghostbar',
      coordinates: [36.1178, -115.1754],
      type: 'lounge',
      description: 'Rooftop bar with panoramic views of the Strip.',
      hours: '8:00 PM - 4:00 AM',
      entry: '$20-30',
      music: 'Mixed',
      rating: 4.4
    }
  ];
  
  const addDrink = () => {
    setDrinkCount(prev => prev + 1);
    setTotalSpent(prev => prev + drinkPrice);
  };
  
  const removeDrink = () => {
    if (drinkCount > 0) {
      setDrinkCount(prev => prev - 1);
      setTotalSpent(prev => prev - drinkPrice);
    }
  };

  // Create custom markers for the map based on venue type
  const createVenueIcon = (type: string) => {
    const getColor = () => {
      switch (type) {
        case 'club': return '#FF2A6D'; // cyber-pink
        case 'bar': return '#05D9E8'; // cyber-blue
        case 'lounge': return '#D1FF33'; // cyber-green 
        case 'restaurant': return '#FFD700'; // cyber-gold
        case 'casino': return '#7638FA'; // cyber-purple
        default: return '#FFFFFF';
      }
    };

    return L.divIcon({
      className: 'custom-venue-icon',
      html: `
        <div style="
          width: 20px;
          height: 20px;
          background-color: ${getColor()};
          border-radius: 50%;
          display: flex;
          justify-content: center;
          align-items: center;
          box-shadow: 0 0 10px ${getColor()};
          border: 2px solid rgba(255, 255, 255, 0.8);
          animation: pulse 1.5s infinite alternate;
        ">
        </div>
        <style>
          @keyframes pulse {
            0% { transform: scale(0.95); box-shadow: 0 0 10px ${getColor()}; }
            100% { transform: scale(1.05); box-shadow: 0 0 15px ${getColor()}, 0 0 25px ${getColor()}; }
          }
        </style>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
  };

  // Component to handle map centering
  const MapController = () => {
    const map = useMap();
    
    useEffect(() => {
      // Center map on Vegas Strip
      map.setView([36.1169, -115.1731], 14);
    }, [map]);
    
    return null;
  };

  // Venue information modal
  const VenueInfoModal = () => {
    if (!selectedVenue) return null;
    
    return (
      <motion.div 
        className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div 
          className="bg-cyber-dark border border-cyber-blue rounded-lg p-6 max-w-md w-full"
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-2xl font-bold text-cyber-blue">{selectedVenue.name}</h3>
              <p className="text-sm text-cyber-pink">{selectedVenue.type.toUpperCase()}</p>
            </div>
            <button 
              className="text-white/70 hover:text-white"
              onClick={() => setVenueInfoModal(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <p className="text-white mb-4">{selectedVenue.description}</p>
          
          <div className="grid grid-cols-2 gap-3 mb-4">
            {selectedVenue.hours && (
              <div>
                <p className="text-xs text-white/60">HOURS</p>
                <p className="text-sm text-cyber-blue">{selectedVenue.hours}</p>
              </div>
            )}
            
            {selectedVenue.entry && (
              <div>
                <p className="text-xs text-white/60">ENTRY</p>
                <p className="text-sm text-cyber-gold">{selectedVenue.entry}</p>
              </div>
            )}
            
            {selectedVenue.music && (
              <div>
                <p className="text-xs text-white/60">MUSIC</p>
                <p className="text-sm text-cyber-green">{selectedVenue.music}</p>
              </div>
            )}
            
            {selectedVenue.rating && (
              <div>
                <p className="text-xs text-white/60">RATING</p>
                <div className="flex text-cyber-pink">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className={i < Math.floor(selectedVenue.rating || 0) ? "text-cyber-gold" : "text-white/30"}>★</span>
                  ))}
                  <span className="ml-1 text-xs text-white/70">{selectedVenue.rating}</span>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex justify-between">
            <button 
              className="text-black bg-cyber-green font-bold py-2 px-4 rounded"
              onClick={() => window.open(`https://maps.google.com/?q=${selectedVenue.coordinates[0]},${selectedVenue.coordinates[1]}`, '_blank')}
            >
              DIRECTIONS
            </button>
            <button 
              className="border border-cyber-blue text-cyber-blue font-bold py-2 px-4 rounded"
              onClick={() => setVenueInfoModal(false)}
            >
              CLOSE
            </button>
          </div>
        </motion.div>
      </motion.div>
    );
  };
  
  return (
    <motion.div 
      className="min-h-screen bg-black text-white py-8 px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {emergencyMode ? (
        <div className="fixed inset-0 bg-cyber-pink/90 z-50 flex flex-col items-center justify-center">
          <motion.div 
            className="text-5xl font-bold mb-8"
            animate={{ scale: [1, 1.1, 1], opacity: [1, 0.8, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            EMERGENCY MODE
          </motion.div>
          
          <div className="bg-black/80 rounded-lg p-6 max-w-xs w-full">
            <div className="text-center mb-6">
              <p className="text-2xl font-bold">Call for help?</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <button 
                className="bg-cyber-blue text-black font-bold py-3 rounded-lg"
                onClick={() => setEmergencyMode(false)}
              >
                I'M OKAY
              </button>
              <button className="bg-white text-cyber-pink font-bold py-3 rounded-lg">
                CALL FRIEND
              </button>
            </div>
            
            <div className="mt-6">
              <button 
                className="w-full bg-cyber-green text-black font-bold py-3 rounded-lg"
                onClick={() => setEmergencyMode(false)}
              >
                EXIT EMERGENCY MODE
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {venueInfoModal && <VenueInfoModal />}
          
          <div className="flex justify-between items-center mb-12">
            <div className="text-xl font-bold text-cyber-pink">NIGHTLIFE MODE</div>
            <div className="flex items-center">
              <div className="h-3 w-3 bg-cyber-green rounded-full animate-pulse mr-2"></div>
              <span className="text-sm text-cyber-green">LIVE</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="glass-panel p-6">
              <h2 className="text-xl font-bold text-cyber-blue mb-4">DRINK TRACKER</h2>
              
              <div className="flex justify-between items-center mb-6">
                <div className="text-4xl font-bold text-cyber-pink">{drinkCount}</div>
                <div className="flex space-x-2">
                  <button 
                    className="bg-cyber-dark h-10 w-10 rounded-full flex items-center justify-center border border-cyber-pink"
                    onClick={removeDrink}
                  >
                    <span className="text-cyber-pink text-xl">-</span>
                  </button>
                  <button 
                    className="bg-cyber-dark h-10 w-10 rounded-full flex items-center justify-center border border-cyber-green"
                    onClick={addDrink}
                  >
                    <span className="text-cyber-green text-xl">+</span>
                  </button>
                </div>
              </div>
              
              <div className="flex justify-between text-sm mb-1">
                <span>Total spent</span>
                <span className="text-cyber-gold">${totalSpent}</span>
              </div>
              
              <div className="flex justify-between text-sm mb-4">
                <span>Avg price</span>
                <div className="flex items-center">
                  <span className="text-cyber-blue mr-2">${drinkPrice}</span>
                  <div className="flex flex-col">
                    <button 
                      className="text-xs text-cyber-green"
                      onClick={() => setDrinkPrice(prev => prev + 1)}
                    >
                      ▲
                    </button>
                    <button 
                      className="text-xs text-cyber-pink"
                      onClick={() => setDrinkPrice(prev => Math.max(1, prev - 1))}
                    >
                      ▼
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="h-2 bg-cyber-dark rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-cyber-green to-cyber-pink" 
                  style={{ width: `${Math.min(100, drinkCount * 20)}%` }}
                ></div>
              </div>
              
              <p className="text-xs text-cyber-blue mt-2">
                Recommended max: 5 drinks
              </p>
            </div>
            
            <div className="glass-panel p-6">
              <h2 className="text-xl font-bold text-cyber-blue mb-4">QUICK ACTIONS</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <button 
                  className="cyber-btn text-sm"
                  onClick={() => setVenueInfoModal(true)}
                >
                  VENUE INFO
                </button>
                <button 
                  className="bg-cyber-pink text-white font-bold py-2 px-4 rounded-lg"
                  onClick={() => setEmergencyMode(true)}
                >
                  EMERGENCY
                </button>
              </div>
              
              <div className="mt-6">
                <h3 className="text-sm font-bold text-cyber-gold mb-2">VIP STATUS</h3>
                <div className="glass-panel p-3 bg-cyber-dark/70">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Omnia Nightclub</span>
                    <div className="flex items-center">
                      <div className="h-2 w-2 bg-cyber-green rounded-full mr-1"></div>
                      <span className="text-xs text-cyber-green">CONFIRMED</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="glass-panel p-4 mb-8">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-bold text-cyber-blue">NIGHTLIFE MAP</h2>
              <div className="text-xs text-cyber-pink animate-pulse">LIVE TRACKING</div>
            </div>
            
            <div className="h-80 rounded-lg overflow-hidden">
              <MapContainer 
                center={[36.1169, -115.1731]} 
                zoom={14}
                style={{ height: "100%", width: "100%" }}
                zoomControl={false}
              >
                {/* Dark cyberpunk-themed map style */}
                <TileLayer
                  url="https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />
                
                <MapController />
                
                {/* Show all venues on the map */}
                {venues.map(venue => (
                  <Marker 
                    key={venue.id}
                    position={venue.coordinates}
                    icon={createVenueIcon(venue.type)}
                    eventHandlers={{
                      click: () => {
                        setSelectedVenue(venue);
                        setVenueInfoModal(true);
                      }
                    }}
                  >
                    <Popup>
                      <div className="text-black">
                        <strong>{venue.name}</strong>
                        <p className="text-xs">{venue.type}</p>
                      </div>
                    </Popup>
                  </Marker>
                ))}
                
                {/* Your current location marker */}
                <Marker 
                  position={[36.1169, -115.1731]}
                  icon={L.divIcon({
                    className: 'custom-location-icon',
                    html: `
                      <div style="
                        width: 16px;
                        height: 16px;
                        background-color: #FFFFFF;
                        border-radius: 50%;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        border: 3px solid #05D9E8;
                        box-shadow: 0 0 10px #05D9E8, 0 0 20px #05D9E8;
                        animation: locationPulse 2s infinite;
                      ">
                      </div>
                      <style>
                        @keyframes locationPulse {
                          0% { transform: scale(0.8); opacity: 0.7; }
                          50% { transform: scale(1.2); opacity: 1; }
                          100% { transform: scale(0.8); opacity: 0.7; }
                        }
                      </style>
                    `,
                    iconSize: [20, 20],
                    iconAnchor: [10, 10]
                  })}
                >
                  <Popup>
                    <div className="text-black text-xs">
                      <strong>Your Location</strong>
                    </div>
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
          </div>
          
          <div className="fixed bottom-4 left-0 right-0 flex justify-center">
            <div className="glass-panel bg-cyber-dark/80 p-2 rounded-full">
              <div className="flex space-x-6">
                <button 
                  className="text-cyber-pink h-12 w-12 rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                  onClick={() => window.location.href = '/'}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </button>
                <button 
                  className="text-cyber-blue h-12 w-12 rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                  onClick={() => setEmergencyMode(!emergencyMode)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
                <button 
                  className="text-cyber-green h-12 w-12 rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                  onClick={() => setVenueInfoModal(true)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default NightlifeMode; 