import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Person, Flight, HotelStay } from '../types';

// Import profile pictures
import siaImg from '../assets/sia.jpg';
import lukeImg from '../assets/luke.jpg';
import kyonImg from '../assets/kyon.jpg';
import peteImg from '../assets/pete.jpg';
import kiaImg from '../assets/kia.jpg';
import danImg from '../assets/dan.jpg';

interface DashboardProps {
  people: Person[];
  flights: {
    toVegas: Flight[];
    toHome: Flight[];
  };
  hotels: HotelStay[];
}

const Dashboard: React.FC<DashboardProps> = ({ people, flights, hotels }) => {
  const [selectedPerson, setSelectedPerson] = useState<string | null>(null);

  const getPersonDetails = (personName: string) => {
    // Map full names to shortened names used in data
    const nameMapping: { [key: string]: string } = {
      'Kiarash': 'Kia',
      'Siavash': 'Sia'
    };
    
    // Use the mapped name if it exists, otherwise use the original name
    const dataName = nameMapping[personName] || personName;
    
    const flightToVegas = flights.toVegas.find(f => f.person === dataName);
    const flightToHome = flights.toHome.find(f => f.person === dataName);
    const hotel = hotels.find(h => h.person === dataName);

    return { flightToVegas, flightToHome, hotel };
  };

  const getProfilePicture = (name: string) => {
    const nameToImage: { [key: string]: string } = {
      'Siavash': siaImg,
      'Lucas': lukeImg,
      'Kyon': kyonImg,
      'Peter': peteImg,
      'Kiarash': kiaImg,
      'Daniel': danImg
    };
    return nameToImage[name] || '';
  };

  return (
    <motion.div
      className="w-full max-w-4xl mx-auto px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-center text-4xl font-bold mb-12 text-cyber-green neon-text">TRAVELER DASHBOARD</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12">
        {people.map((person, index) => {
          const color = index % 3 === 0 
            ? '#FF2A6D' 
            : index % 3 === 1 
              ? '#05D9E8' 
              : '#D1FF33';
              
          return (
            <motion.div
              key={person.name}
              className={`cursor-pointer relative overflow-hidden rounded-lg border-2 ${
                selectedPerson === person.name ? 'ring-4 ring-offset-0 ring-white/70' : ''
              }`}
              style={{
                borderColor: color,
                boxShadow: `0 0 15px ${color}60`,
                backgroundImage: `url(${getProfilePicture(person.name)})`,
                backgroundSize: 'cover',
                backgroundPosition: 'top center',
                backgroundRepeat: 'no-repeat',
                height: 200
              }}
              whileHover={{ 
                scale: 1.05,
                borderColor: 'white',
                boxShadow: `0 0 20px ${color}`,
                transition: { duration: 0.3 } 
              }}
              onClick={() => setSelectedPerson(selectedPerson === person.name ? null : person.name)}
            >
              {/* Top header with name and nickname */}
              <div className="absolute top-0 left-0 right-0 p-2 bg-gradient-to-b from-black/80 to-transparent">
                <div className="flex items-center">
                  <h3 className="text-lg font-bold text-white drop-shadow-[0_0_5px_rgba(0,0,0,0.9)] uppercase">{person.name}</h3>
                  <p className="ml-2 text-sm text-white opacity-90 drop-shadow-[0_0_3px_rgba(0,0,0,0.9)]">{person.nickname}</p>
                </div>
              </div>
              
              {/* Bottom footer with ID */}
              <div className="absolute bottom-0 left-0 right-0 p-2">
                <div 
                  className="text-center py-1 px-2 rounded-sm backdrop-blur-sm"
                  style={{ 
                    backgroundColor: `${color}30`,
                    borderLeft: `2px solid ${color}`,
                    borderRight: `2px solid ${color}`,
                    boxShadow: `0 0 8px ${color}50`
                  }}
                >
                  <p className="text-white font-mono text-sm tracking-wide">
                    ID: VGS-{index + 1000}
                  </p>
                </div>
              </div>
              
              {/* Colored overlay for visual effect */}
              <div className="absolute inset-0" style={{ backgroundColor: `${color}15`, mixBlendMode: 'overlay' }}></div>
            </motion.div>
          );
        })}
      </div>
      
      <AnimatePresence>
        {selectedPerson && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="glass-panel p-6 mb-8"
          >
            <h3 className="text-2xl font-bold mb-6 text-cyber-pink neon-text">
              {selectedPerson}'s Trip Details
            </h3>
            
            {(() => {
              const { flightToVegas, flightToHome, hotel } = getPersonDetails(selectedPerson);
              
              return (
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-xl font-bold mb-4 text-cyber-blue">Flight Information</h4>
                    
                    <div className="mb-6 bg-cyber-dark/50 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-cyber-green font-medium">TO VEGAS</span>
                        <div className="h-1 flex-grow mx-4 bg-gradient-to-r from-transparent via-cyber-green to-transparent"></div>
                        <span className="text-cyber-green font-medium">MAR 27</span>
                      </div>
                      
                      {flightToVegas ? (
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-2xl font-bold text-white">{flightToVegas.departure}</p>
                            <p className="text-sm text-cyber-blue">Departure</p>
                          </div>
                          
                          <div className="flex-1 px-4">
                            <div className="relative h-0.5 bg-cyber-pink">
                              <div className="absolute -top-2 right-0 w-4 h-4 bg-cyber-pink rounded-full" />
                            </div>
                            <p className="text-center text-xs mt-2 text-white">Flight</p>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-2xl font-bold text-white">{flightToVegas.arrival}</p>
                            <p className="text-sm text-cyber-blue">Arrival</p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-white">No flight information</p>
                      )}
                    </div>
                    
                    <div className="bg-cyber-dark/50 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-cyber-gold font-medium">TO HOME</span>
                        <div className="h-1 flex-grow mx-4 bg-gradient-to-r from-transparent via-cyber-gold to-transparent"></div>
                        <span className="text-cyber-gold font-medium">MAR 30</span>
                      </div>
                      
                      {flightToHome ? (
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-2xl font-bold text-white">{flightToHome.departure}</p>
                            <p className="text-sm text-cyber-blue">Departure</p>
                          </div>
                          
                          <div className="flex-1 px-4">
                            <div className="relative h-0.5 bg-cyber-gold">
                              <div className="absolute -top-2 right-0 w-4 h-4 bg-cyber-gold rounded-full" />
                            </div>
                            <p className="text-center text-xs mt-2 text-white">Flight</p>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-2xl font-bold text-white">{flightToHome.arrival}</p>
                            <p className="text-sm text-cyber-blue">Arrival</p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-white">No flight information</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-xl font-bold mb-4 text-cyber-blue">Hotel Information</h4>
                    
                    {hotel ? (
                      <>
                        <div className="mb-6 bg-cyber-dark/50 p-4 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-cyber-pink font-medium">MAR 27</span>
                            <div className="h-1 flex-grow mx-4 bg-gradient-to-r from-transparent via-cyber-pink to-transparent"></div>
                            <span className="text-cyber-pink font-medium">THURSDAY</span>
                          </div>
                          
                          <div className="text-center py-4">
                            <p className="text-2xl font-bold text-white neon-text">{hotel.thursday}</p>
                          </div>
                        </div>
                        
                        <div className="mb-6 bg-cyber-dark/50 p-4 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-cyber-green font-medium">MAR 28-30</span>
                            <div className="h-1 flex-grow mx-4 bg-gradient-to-r from-transparent via-cyber-green to-transparent"></div>
                            <span className="text-cyber-green font-medium">FRI-SUN</span>
                          </div>
                          
                          <div className="text-center py-4">
                            <p className="text-2xl font-bold text-white neon-text">{hotel.fridayToSunday}</p>
                          </div>
                        </div>
                      </>
                    ) : (
                      <p className="text-white">No hotel information</p>
                    )}
                    
                    <div className="glass-panel p-4 mt-6">
                      <h4 className="text-lg font-bold mb-2 text-cyber-blue">Connection Status</h4>
                      <div className="flex items-center">
                        <div className="h-3 w-3 bg-cyber-green rounded-full animate-pulse mr-2"></div>
                        <p className="text-white">Connected to Vegas Network</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="glass-panel p-6">
        <h3 className="text-2xl font-bold mb-6 text-cyber-gold neon-text">Trip Overview</h3>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h4 className="text-xl font-bold mb-4 text-cyber-blue">Arrival Timeline</h4>
            <div className="space-y-4">
              {[...flights.toVegas]
                .sort((a, b) => {
                  const timeA = a.arrival.split(':').map(Number);
                  const timeB = b.arrival.split(':').map(Number);
                  return (timeA[0] * 60 + timeA[1]) - (timeB[0] * 60 + timeB[1]);
                })
                .map((flight) => (
                  <div key={`arrival-${flight.person}`} className="flex items-center">
                    <div className="w-16 text-center">
                      <span className="text-cyber-pink font-mono">{flight.arrival}</span>
                    </div>
                    <div className="ml-4 h-0.5 w-12 bg-cyber-blue"></div>
                    <div className="ml-4">
                      <p className="text-white">{flight.person}</p>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
          
          <div>
            <h4 className="text-xl font-bold mb-4 text-cyber-blue">Hotel Distribution</h4>
            <div className="space-y-6">
              <div>
                <h5 className="text-lg font-medium text-cyber-pink mb-2">Thursday Night</h5>
                {Array.from(new Set(hotels.map(h => h.thursday))).map(hotelName => (
                  <div key={`thu-${hotelName}`} className="mb-2">
                    <p className="text-white font-bold">{hotelName}</p>
                    <p className="text-sm text-cyber-blue">
                      {hotels.filter(h => h.thursday === hotelName).map(h => h.person).join(', ')}
                    </p>
                  </div>
                ))}
              </div>
              
              <div>
                <h5 className="text-lg font-medium text-cyber-green mb-2">Friday - Sunday</h5>
                {Array.from(new Set(hotels.map(h => h.fridayToSunday))).map(hotelName => (
                  <div key={`fri-${hotelName}`} className="mb-2">
                    <p className="text-white font-bold">{hotelName}</p>
                    <p className="text-sm text-cyber-blue">
                      {hotels.filter(h => h.fridayToSunday === hotelName).map(h => h.person).join(', ')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard; 