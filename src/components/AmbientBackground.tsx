import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface AmbientBackgroundProps {
  className?: string;
}

const AmbientBackground: React.FC<AmbientBackgroundProps> = ({ className = '' }) => {
  const [timeOfDay, setTimeOfDay] = useState<'dawn' | 'day' | 'dusk' | 'night'>('day');
  const [vegasTime, setVegasTime] = useState<Date>(new Date());
  
  // Update Vegas time every minute
  useEffect(() => {
    const getVegasTime = () => {
      // Get current time and adjust to Vegas timezone (PDT, UTC-7)
      const now = new Date();
      // Create a new date object for Vegas time
      const vegasTimeObj = new Date(now.getTime());
      // Adjust to Vegas timezone (simplified approach)
      vegasTimeObj.setHours(now.getUTCHours() - 7);
      return vegasTimeObj;
    };
    
    const updateTimeOfDay = (time: Date) => {
      const hour = time.getHours();
      if (hour >= 5 && hour < 8) {
        setTimeOfDay('dawn');
      } else if (hour >= 8 && hour < 17) {
        setTimeOfDay('day');
      } else if (hour >= 17 && hour < 20) {
        setTimeOfDay('dusk');
      } else {
        setTimeOfDay('night');
      }
    };
    
    // Initial update
    const initialVegasTime = getVegasTime();
    setVegasTime(initialVegasTime);
    updateTimeOfDay(initialVegasTime);
    
    // Set up interval for updates
    const interval = setInterval(() => {
      const currentVegasTime = getVegasTime();
      setVegasTime(currentVegasTime);
      updateTimeOfDay(currentVegasTime);
    }, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, []);
  
  // Background gradients for different times of day
  const getGradient = () => {
    switch (timeOfDay) {
      case 'dawn':
        return 'bg-gradient-to-b from-[#FF9E80] via-[#FF6B6B] to-[#1A1A2E]';
      case 'day':
        return 'bg-gradient-to-b from-[#7FDBFF] via-[#39CCCC] to-[#1A1A2E]';
      case 'dusk':
        return 'bg-gradient-to-b from-[#FF851B] via-[#9D02FF] to-[#1A1A2E]';
      case 'night':
        return 'bg-gradient-to-b from-[#001F3F] via-[#0B0B45] to-[#1A1A2E]';
      default:
        return 'bg-gradient-to-b from-[#1A1A2E] to-[#0D0D0D]';
    }
  };
  
  // Number of stars based on time of day
  const getStarsCount = () => {
    switch (timeOfDay) {
      case 'night': return 100;
      case 'dawn':
      case 'dusk': return 50;
      default: return 15;
    }
  };
  
  return (
    <div className={`fixed inset-0 transition-colors duration-1000 ${getGradient()} ${className}`}>
      {/* Stars */}
      {Array.from({ length: getStarsCount() }).map((_, index) => (
        <div
          key={index}
          className="absolute rounded-full bg-white"
          style={{
            width: `${Math.random() * 2 + 1}px`,
            height: `${Math.random() * 2 + 1}px`,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            opacity: Math.random() * 0.8 + 0.2,
            animation: `twinkle ${Math.random() * 5 + 2}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 5}s`
          }}
        />
      ))}
      
      {/* Moving clouds for day and dawn */}
      {(timeOfDay === 'day' || timeOfDay === 'dawn') && (
        <motion.div
          className="absolute inset-0 overflow-hidden opacity-30 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ duration: 2 }}
        >
          {Array.from({ length: 5 }).map((_, index) => (
            <motion.div
              key={index}
              className="absolute bg-white rounded-full filter blur-xl"
              style={{
                width: `${Math.random() * 200 + 100}px`,
                height: `${Math.random() * 100 + 50}px`,
                top: `${Math.random() * 50}%`,
                left: `-20%`,
              }}
              initial={{ x: "-20%" }}
              animate={{ x: "120%" }}
              transition={{
                duration: Math.random() * 200 + 100,
                repeat: Infinity,
                repeatType: "loop",
                ease: "linear",
                delay: Math.random() * 50
              }}
            />
          ))}
        </motion.div>
      )}
      
      {/* City skyline silhouette */}
      <div className="absolute bottom-0 left-0 right-0 h-[15vh] bg-[#000000] opacity-70" style={{
        maskImage: "url('https://assets.codepen.io/567707/vegas-skyline.png')",
        maskSize: "cover",
        maskPosition: "bottom",
        WebkitMaskImage: "url('https://assets.codepen.io/567707/vegas-skyline.png')",
        WebkitMaskSize: "cover",
        WebkitMaskPosition: "bottom",
      }} />
      
      {/* Vegas time display (small and discreet) */}
      {/* <div className="absolute top-16 right-4 text-sm text-white bg-black/50 px-3 py-1.5 mt-6 rounded-full backdrop-blur-sm border border-cyber-blue/30 z-40 shadow-neon-blue hidden md:block">
        Vegas time: {vegasTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
      </div> */}
    </div>
  );
};

export default AmbientBackground; 