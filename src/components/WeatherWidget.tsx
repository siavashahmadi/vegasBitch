import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface WeatherData {
  temperature: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'stormy';
  humidity: number;
  windSpeed: number;
  highTemp: number;
  lowTemp: number;
}

const WeatherWidget: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData>({
    temperature: 82,
    condition: 'sunny',
    humidity: 20,
    windSpeed: 5,
    highTemp: 88,
    lowTemp: 65
  });
  
  const [loading, setLoading] = useState<boolean>(false);
  const [time, setTime] = useState<Date>(new Date());

  // In a real application, this would fetch real weather data from an API
  useEffect(() => {
    // Mock a weather data fetch
    setLoading(true);
    
    const mockFetch = setTimeout(() => {
      // This is sample data - in a real app, you'd fetch from a weather API
      setWeather({
        temperature: 82,
        condition: 'sunny',
        humidity: 20,
        windSpeed: 5,
        highTemp: 88,
        lowTemp: 65
      });
      setLoading(false);
    }, 1500);
    
    return () => clearTimeout(mockFetch);
  }, []);
  
  // Update the time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      // Set time to Vegas time (PST/PDT)
      const vegasTime = new Date();
      // Adjust to Vegas timezone (UTC-7 or UTC-8 depending on daylight savings)
      // This is simplified - a real app would use a timezone library
      vegasTime.setHours(vegasTime.getHours() - 7);
      setTime(vegasTime);
    }, 60000);
    
    // Set initial time
    const initialVegasTime = new Date();
    initialVegasTime.setHours(initialVegasTime.getHours() - 7);
    setTime(initialVegasTime);
    
    return () => clearInterval(timer);
  }, []);

  const getWeatherIcon = () => {
    switch (weather.condition) {
      case 'sunny':
        return (
          <motion.div
            className="text-cyber-gold text-5xl"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ 
              scale: [1, 1.1, 1], 
              opacity: 1,
              rotate: 360
            }}
            transition={{ 
              duration: 10, 
              repeat: Infinity,
              repeatType: "loop"
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <circle cx="12" cy="12" r="5" strokeWidth="2" />
              <line x1="12" y1="1" x2="12" y2="3" strokeWidth="2" strokeLinecap="round" />
              <line x1="12" y1="21" x2="12" y2="23" strokeWidth="2" strokeLinecap="round" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" strokeWidth="2" strokeLinecap="round" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" strokeWidth="2" strokeLinecap="round" />
              <line x1="1" y1="12" x2="3" y2="12" strokeWidth="2" strokeLinecap="round" />
              <line x1="21" y1="12" x2="23" y2="12" strokeWidth="2" strokeLinecap="round" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" strokeWidth="2" strokeLinecap="round" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </motion.div>
        );
      case 'cloudy':
        return (
          <motion.div
            className="text-cyber-blue text-5xl"
            initial={{ x: -20, opacity: 0 }}
            animate={{ 
              x: [0, 10, 0], 
              opacity: 1
            }}
            transition={{ 
              duration: 5, 
              repeat: Infinity,
              repeatType: "mirror"
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
            </svg>
          </motion.div>
        );
      case 'rainy':
        return (
          <div className="text-cyber-blue text-5xl relative">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
            </svg>
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute bottom-0 w-0.5 bg-cyber-blue"
                style={{ 
                  height: 10 + Math.random() * 10,
                  left: 5 + (i * 7) + Math.random() * 3,
                }}
                initial={{ y: -10, opacity: 0 }}
                animate={{ 
                  y: 20, 
                  opacity: [0, 1, 0],
                }}
                transition={{ 
                  duration: 1 + Math.random() * 0.5, 
                  repeat: Infinity,
                  delay: Math.random() * 2,
                  repeatType: "loop"
                }}
              />
            ))}
          </div>
        );
      case 'stormy':
        return (
          <div className="text-cyber-purple text-5xl relative">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
            </svg>
            <motion.div
              className="absolute bottom-1 left-6 text-cyber-pink"
              initial={{ y: 0, opacity: 0 }}
              animate={{ 
                y: [0, 15, 0], 
                opacity: [0, 1, 0],
              }}
              transition={{ 
                duration: 0.7, 
                repeat: Infinity,
                repeatDelay: 1.5
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </motion.div>
          </div>
        );
      default:
        return null;
    }
  };

  const getBackgroundGradient = () => {
    switch (weather.condition) {
      case 'sunny':
        return 'from-cyber-gold/20 via-cyber-dark to-cyber-dark';
      case 'cloudy':
        return 'from-cyber-blue/20 via-cyber-dark to-cyber-dark';
      case 'rainy':
        return 'from-cyber-blue/30 via-cyber-dark to-cyber-dark';
      case 'stormy':
        return 'from-cyber-purple/20 via-cyber-dark to-cyber-pink/10';
      default:
        return 'from-cyber-dark via-cyber-dark to-cyber-dark';
    }
  };

  return (
    <motion.div
      className={`glass-panel overflow-hidden w-full max-w-sm bg-gradient-to-br ${getBackgroundGradient()}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-xl font-bold text-cyber-blue">LAS VEGAS</h3>
            <p className="text-sm text-white/70">
              {time.toLocaleString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit',
                hour12: true,
                month: 'short',
                day: 'numeric'
              })}
            </p>
          </div>
          <div className="bg-cyber-dark/50 px-2 py-1 rounded flex items-center">
            <div className="h-2 w-2 bg-cyber-green rounded-full animate-pulse mr-2"></div>
            <span className="text-xs text-cyber-green">LIVE</span>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <motion.div 
              className="h-4 w-4 bg-cyber-pink rounded-full"
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-end">
                  {weather.temperature.toString().split('').map((digit, index) => (
                    <div 
                      key={index} 
                      className="temp-display text-5xl font-bold"
                      style={{ 
                        animationDelay: `${index * 0.2}s`,
                        animationDuration: `${3 + index * 0.5}s`
                      }}
                    >
                      {digit}
                    </div>
                  ))}
                  <div 
                    className="temp-display text-5xl font-bold ml-1"
                    style={{ animationDelay: '0.6s' }}
                  >
                    °
                  </div>
                </div>
                <div className="flex items-center text-sm mt-3">
                  <span className="text-cyber-green mr-2">H: {weather.highTemp}°</span>
                  <span className="text-cyber-pink">L: {weather.lowTemp}°</span>
                </div>
              </div>
              {getWeatherIcon()}
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-cyber-dark/40 p-2 rounded">
                <div className="text-cyber-blue mb-1">Humidity</div>
                <div className="text-white">{weather.humidity}%</div>
              </div>
              <div className="bg-cyber-dark/40 p-2 rounded">
                <div className="text-cyber-blue mb-1">Wind</div>
                <div className="text-white">{weather.windSpeed} mph</div>
              </div>
            </div>
          </>
        )}
      </div>
      
      <div className="h-1 w-full bg-gradient-to-r from-cyber-pink via-cyber-blue to-cyber-green" />
    </motion.div>
  );
};

export default WeatherWidget; 