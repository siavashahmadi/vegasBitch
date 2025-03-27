import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface WeatherData {
  temperature: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'stormy';
  humidity: number;
  windSpeed: number;
  highTemp: number;
  lowTemp: number;
  precipitation: number;
  weatherCode: number;
  apparentTemperature: number;
  uvIndex: number;
}

// WMO Weather interpretation codes (WW)
const getConditionFromWMO = (code: number): 'sunny' | 'cloudy' | 'rainy' | 'stormy' => {
  // Clear sky
  if (code === 0) return 'sunny';
  // Mainly clear, partly cloudy, and overcast
  if (code >= 1 && code <= 3) return 'cloudy';
  // Fog and depositing rime fog
  if (code === 45 || code === 48) return 'cloudy';
  // Drizzle: Light, moderate, and dense intensity
  if (code >= 51 && code <= 55) return 'rainy';
  // Freezing Drizzle: Light and dense intensity
  if (code === 56 || code === 57) return 'rainy';
  // Rain: Slight, moderate and heavy intensity
  if (code >= 61 && code <= 65) return 'rainy';
  // Freezing Rain: Light and heavy intensity
  if (code === 66 || code === 67) return 'rainy';
  // Snow and snow grains
  if ((code >= 71 && code <= 75) || code === 77) return 'rainy';
  // Rain showers: Slight, moderate, and violent
  if (code >= 80 && code <= 82) return 'rainy';
  // Snow showers slight and heavy
  if (code === 85 || code === 86) return 'rainy';
  // Thunderstorm: Slight, moderate, with hail
  if (code === 95 || code === 96 || code === 99) return 'stormy';
  
  // Default
  return 'sunny';
};

const WeatherWidget: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData>({
    temperature: 82,
    condition: 'sunny',
    humidity: 20,
    windSpeed: 5,
    highTemp: 88,
    lowTemp: 65,
    precipitation: 0,
    weatherCode: 0,
    apparentTemperature: 80,
    uvIndex: 8
  });
  
  const [loading, setLoading] = useState<boolean>(true);
  const [time, setTime] = useState<Date>(new Date());
  const [error, setError] = useState<string | null>(null);
  const [forecast, setForecast] = useState<{day: string, temp: number, condition: string}[]>([]);

  // Fetch real weather data from Open-Meteo API
  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        setLoading(true);
        // Las Vegas coordinates
        const lat = 36.17;
        const lon = -115.14;
        
        // Open-Meteo API URL with required parameters
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,uv_index_max&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timezone=America%2FLos_Angeles`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.reason || 'Failed to fetch weather data');
        }
        
        // Extract current weather data
        const currentWeather = data.current;
        const dailyWeather = data.daily;
        
        // Set the current weather
        setWeather({
          temperature: Math.round(currentWeather.temperature_2m),
          condition: getConditionFromWMO(currentWeather.weather_code),
          humidity: Math.round(currentWeather.relative_humidity_2m),
          windSpeed: Math.round(currentWeather.wind_speed_10m),
          highTemp: Math.round(dailyWeather.temperature_2m_max[0]),
          lowTemp: Math.round(dailyWeather.temperature_2m_min[0]),
          precipitation: currentWeather.precipitation,
          weatherCode: currentWeather.weather_code,
          apparentTemperature: Math.round(currentWeather.apparent_temperature),
          uvIndex: Math.round(dailyWeather.uv_index_max[0])
        });
        
        // Create 3-day forecast
        const futureForecast = [];
        const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        
        for (let i = 1; i < 4; i++) {
          if (dailyWeather.time[i]) {
            const date = new Date(dailyWeather.time[i]);
            futureForecast.push({
              day: daysOfWeek[date.getDay()],
              temp: Math.round(dailyWeather.temperature_2m_max[i]),
              condition: getConditionFromWMO(dailyWeather.weather_code[i])
            });
          }
        }
        
        setForecast(futureForecast);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching weather data:', err);
        setError('Could not load weather data');
        setLoading(false);
      }
    };
    
    fetchWeatherData();
    
    // Refresh weather data every 30 minutes
    const weatherInterval = setInterval(fetchWeatherData, 30 * 60 * 1000);
    
    return () => clearInterval(weatherInterval);
  }, []);
  
  // Update the time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      // Set time to Vegas time (PST/PDT)
      const vegasTime = new Date();
      setTime(vegasTime);
    }, 60000);
    
    // Set initial time
    const initialVegasTime = new Date();
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

  // Get weather description based on WMO code
  const getWeatherDescription = (code: number): string => {
    if (code === 0) return "Clear sky";
    if (code === 1) return "Mainly clear";
    if (code === 2) return "Partly cloudy";
    if (code === 3) return "Overcast";
    if (code === 45 || code === 48) return "Foggy";
    if (code >= 51 && code <= 55) return "Drizzle";
    if (code === 56 || code === 57) return "Freezing drizzle";
    if (code >= 61 && code <= 65) return "Rain";
    if (code === 66 || code === 67) return "Freezing rain";
    if (code >= 71 && code <= 75) return "Snow";
    if (code === 77) return "Snow grains";
    if (code >= 80 && code <= 82) return "Rain showers";
    if (code === 85 || code === 86) return "Snow showers";
    if (code === 95) return "Thunderstorm";
    if (code === 96 || code === 99) return "Thunderstorm with hail";
    return "Unknown";
  };

  // Get forecast weather icon
  const getForecastIcon = (condition: string) => {
    switch (condition) {
      case 'sunny':
        return "☀️";
      case 'cloudy':
        return "☁️";
      case 'rainy':
        return "🌧️";
      case 'stormy':
        return "⚡";
      default:
        return "☀️";
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
                day: 'numeric',
                timeZone: 'America/Los_Angeles'
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
        ) : error ? (
          <div className="flex flex-col justify-center items-center h-40 text-center">
            <div className="text-cyber-pink mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="text-cyber-pink">{error}</p>
            <button 
              className="mt-3 cyber-btn text-xs"
              onClick={() => window.location.reload()}
            >
              RETRY
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
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
                <div className="text-xs text-white/80 mt-1">
                  {getWeatherDescription(weather.weatherCode)}
                </div>
                <div className="flex items-center text-sm mt-2">
                  <span className="text-cyber-green mr-2">H: {weather.highTemp}°</span>
                  <span className="text-cyber-pink">L: {weather.lowTemp}°</span>
                </div>
              </div>
              {getWeatherIcon()}
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
              <div className="bg-cyber-dark/40 p-2 rounded">
                <div className="text-cyber-blue mb-1">Humidity</div>
                <div className="text-white">{weather.humidity}%</div>
              </div>
              <div className="bg-cyber-dark/40 p-2 rounded">
                <div className="text-cyber-blue mb-1">Wind</div>
                <div className="text-white">{weather.windSpeed} mph</div>
              </div>
              <div className="bg-cyber-dark/40 p-2 rounded">
                <div className="text-cyber-blue mb-1">Feels Like</div>
                <div className="text-white">{weather.apparentTemperature}°</div>
              </div>
              <div className="bg-cyber-dark/40 p-2 rounded">
                <div className="text-cyber-blue mb-1">UV Index</div>
                <div className="text-white">{weather.uvIndex}</div>
              </div>
            </div>
            
            {/* 3-Day Forecast */}
            <div className="mt-4 pt-3 border-t border-cyber-dark">
              <div className="text-xs text-cyber-blue mb-2">3-DAY FORECAST</div>
              <div className="flex justify-between">
                {forecast.map((day, index) => (
                  <div key={index} className="text-center px-2">
                    <div className="text-xs text-white mb-1">{day.day}</div>
                    <div className="text-lg mb-1">{getForecastIcon(day.condition)}</div>
                    <div className="text-sm text-white">{day.temp}°</div>
                  </div>
                ))}
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