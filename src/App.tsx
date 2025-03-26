import React, { useState } from 'react';
import { motion } from 'framer-motion';
import itinerary from './itinerary';
import './App.css';

// Import components
import Countdown from './components/Countdown';
import Timeline from './components/Timeline';
import Dashboard from './components/Dashboard';
import VegasMap from './components/VegasMap';
import Navbar from './components/Navbar';
import NightlifeMode from './components/NightlifeMode';
import WeatherWidget from './components/WeatherWidget';
import AmbientBackground from './components/AmbientBackground';
import NotificationPanel from './components/NotificationPanel';
import AnimatedTitle from './components/AnimatedTitle';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<'home' | 'timeline' | 'dashboard' | 'map' | 'nightlife'>('home');
  const [nightMode, setNightMode] = useState<boolean>(false);

  // If nightMode is true, show the NightlifeMode component regardless of activeView
  if (nightMode) {
    return (
      <div className="App min-h-screen bg-black">
        <NightlifeMode />
        <div className="fixed bottom-4 right-4 z-20">
          <button
            onClick={() => setNightMode(false)}
            className="cyber-btn text-sm"
          >
            Exit Nightlife Mode
          </button>
        </div>
      </div>
    );
  }

  const renderView = () => {
    switch (activeView) {
      case 'home':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center min-h-screen px-4"
          >
            <div className="mb-8 w-full max-w-5xl">
              <AnimatedTitle text={itinerary.tripName} />
            </div>
            <motion.h2 
              className="text-2xl md:text-3xl mb-12 text-cyber-blue neon-text flex items-center justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              <motion.span
                animate={{ 
                  textShadow: [
                    "0 0 5px #05D9E8, 0 0 10px #05D9E8", 
                    "0 0 10px #05D9E8, 0 0 20px #05D9E8", 
                    "0 0 5px #05D9E8, 0 0 10px #05D9E8"
                  ] 
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="mx-2"
              >
                🗓️
              </motion.span>
              {itinerary.dates}
              <motion.span
                animate={{ 
                  textShadow: [
                    "0 0 5px #05D9E8, 0 0 10px #05D9E8", 
                    "0 0 10px #05D9E8, 0 0 20px #05D9E8", 
                    "0 0 5px #05D9E8, 0 0 10px #05D9E8"
                  ] 
                }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                className="mx-2"
              >
                📅
              </motion.span>
            </motion.h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl mb-12">
              <Countdown />
              <div className="flex flex-col gap-4">
                <WeatherWidget />
                <div className="flex justify-end">
                  <NotificationPanel schedule={itinerary.schedule} />
                </div>
              </div>
            </div>
            
            <div className="mt-8 text-center">
              <motion.p 
                className="text-white mb-4 font-bold text-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <motion.span
                  className="inline-block mx-1 text-cyber-green"
                  animate={{ 
                    y: [0, -5, 0],
                    rotate: [0, 5, 0, -5, 0],
                  }}
                  transition={{ duration: 2, repeat: Infinity, repeatType: "mirror" }}
                >
                  👥
                </motion.span>
                <span className="text-cyber-pink">6</span> travelers, 
                <span className="text-cyber-gold mx-1">4</span> days of 
                <motion.span
                  className="inline-block mx-1 text-cyber-pink"
                  animate={{ 
                    scale: [1, 1.2, 1],
                    textShadow: [
                      "0 0 5px #FF2A6D, 0 0 10px #FF2A6D", 
                      "0 0 10px #FF2A6D, 0 0 20px #FF2A6D", 
                      "0 0 5px #FF2A6D, 0 0 10px #FF2A6D"
                    ]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  adventure
                </motion.span>
                <motion.span
                  className="inline-block mx-1"
                  animate={{ 
                    rotate: [0, 20, 0, -20, 0]
                  }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  🎮
                </motion.span>
              </motion.p>
              <motion.button 
                className="cyber-btn text-lg relative overflow-hidden group"
                onClick={() => setActiveView('timeline')}
                whileHover={{ 
                  scale: 1.05,
                  textShadow: "0 0 8px rgb(255, 255, 255)",
                  boxShadow: "0 0 25px rgba(255, 42, 109, 0.8)",
                  transition: { duration: 0.1 }
                }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="mr-2">🎰</span>
                VIEW ITINERARY
                <motion.span 
                  className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-cyber-gold via-cyber-pink to-cyber-blue"
                  initial={{ width: 0 }}
                  animate={{ width: ['0%', '100%', '0%'] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
              </motion.button>
            </div>
          </motion.div>
        );
      case 'timeline':
        return <Timeline schedule={itinerary.schedule} />;
      case 'dashboard':
        return <Dashboard people={itinerary.people} flights={itinerary.flights} hotels={itinerary.hotels} />;
      case 'map':
        return <VegasMap schedule={itinerary.schedule} />;
      case 'nightlife':
        return (
          <div className="flex flex-col items-center justify-center min-h-screen">
            <h2 className="text-3xl font-bold mb-6 text-cyber-pink">Nightlife Mode</h2>
            <p className="text-xl text-cyber-blue mb-8">This will switch to full nightlife view</p>
            <button 
              onClick={() => setNightMode(true)}
              className="cyber-btn"
            >
              Enter Nightlife Mode
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="App min-h-screen">
      {/* Ambient background with day/night cycle */}
      <AmbientBackground className="z-0" />

      <div className="cyber-grid absolute inset-0 pointer-events-none z-10 opacity-20">
        <div className="grid-overlay"></div>
      </div>

      {/* Background particles */}
      {Array.from({ length: 20 }).map((_, index) => (
        <div
          key={index}
          className="particle z-10"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`
          }}
        />
      ))}

      <Navbar
        activeView={activeView}
        setActiveView={setActiveView}
        nightMode={nightMode}
        setNightMode={setNightMode}
      />

      <main className="container mx-auto py-8 relative z-20">
        {renderView()}
      </main>

      <div className="fixed bottom-4 right-4 z-30">
        <button
          onClick={() => setNightMode(!nightMode)}
          className="cyber-btn text-sm"
        >
          {nightMode ? 'Exit Nightlife Mode' : 'Nightlife Mode'}
        </button>
      </div>
    </div>
  );
};

export default App;
