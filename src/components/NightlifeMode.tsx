import React, { useState } from 'react';
import { motion } from 'framer-motion';

const NightlifeMode: React.FC = () => {
  const [drinkCount, setDrinkCount] = useState<number>(0);
  const [totalSpent, setTotalSpent] = useState<number>(0);
  const [drinkPrice, setDrinkPrice] = useState<number>(18);
  const [emergencyMode, setEmergencyMode] = useState<boolean>(false);
  
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
                <button className="cyber-btn text-sm">RIDESHARE</button>
                <button className="cyber-btn text-sm">MEETUP</button>
                <button className="cyber-btn text-sm">VENUE INFO</button>
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
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-cyber-blue">MY LOCATION</h2>
              <div className="text-xs text-cyber-pink animate-pulse">LIVE TRACKING</div>
            </div>
            <div className="h-40 bg-cyber-dark/50 mt-3 rounded-lg flex items-center justify-center">
              <p className="text-cyber-blue">Map visualization</p>
            </div>
          </div>
          
          <div className="fixed bottom-4 left-0 right-0 flex justify-center">
            <div className="glass-panel bg-cyber-dark/80 p-2 rounded-full">
              <div className="flex space-x-6">
                <button className="text-cyber-pink h-12 w-12 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </button>
                <button className="text-cyber-blue h-12 w-12 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
                <button className="text-cyber-green h-12 w-12 rounded-full flex items-center justify-center">
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