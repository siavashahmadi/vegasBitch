import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const Countdown: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  // Set target date to March 27, 2025
  const targetDate = new Date('2025-03-27T00:00:00').getTime();

  useEffect(() => {
    // Set initial time
    const now = new Date().getTime();
    const distance = targetDate - now;
    
    if (distance > 0) {
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    }

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        // Trip has started
        clearInterval(interval);
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0
        });
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  // Single digit animation
  const SingleDigit: React.FC<{ digit: string; changed: boolean }> = ({ digit, changed }) => {
    const animation = {
      initial: { y: changed ? 20 : 0, opacity: changed ? 0 : 1 },
      animate: { y: 0, opacity: 1 },
      exit: { y: -20, opacity: 0 },
      transition: { 
        type: 'spring', 
        stiffness: 300, 
        damping: 25,
        duration: changed ? 0.3 : 0
      }
    };

    return (
      <motion.div
        key={digit}
        initial={animation.initial}
        animate={animation.animate}
        exit={animation.exit}
        transition={animation.transition}
        className="text-3xl font-bold text-cyber-pink neon-text"
      >
        {digit}
      </motion.div>
    );
  };

  // Digit component with change detection
  const Digit: React.FC<{ value: number; prevValue: number }> = ({ value, prevValue }) => {
    const formattedValue = value < 10 ? `0${value}` : value.toString();
    const formattedPrevValue = prevValue < 10 ? `0${prevValue}` : prevValue.toString();
    
    return (
      <div className="flex">
        {formattedValue.split('').map((digit, index) => {
          const digitChanged = formattedPrevValue[index] !== digit;
          return (
            <div key={index} className="w-8 h-16 flex items-center justify-center overflow-hidden">
              <SingleDigit digit={digit} changed={digitChanged} />
            </div>
          );
        })}
      </div>
    );
  };

  // Component for each time unit
  const TimeUnit: React.FC<{ value: number; prevValue: number; unit: string }> = ({ value, prevValue, unit }) => (
    <div className="flex flex-col items-center mx-2">
      <div className="glass-panel w-16 h-16 flex items-center justify-center mb-1">
        <Digit value={value} prevValue={prevValue} />
      </div>
      <span className="text-cyber-blue uppercase text-xs tracking-wider">{unit}</span>
    </div>
  );

  // Track previous time values for animation
  const prevTimeRef = useRef(timeLeft);
  useEffect(() => {
    prevTimeRef.current = timeLeft;
  });
  const prevTime = prevTimeRef.current;

  const particles = Array.from({ length: 20 }).map((_, i) => (
    <div 
      key={i}
      className="particle"
      style={{
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 10}s`
      }}
    />
  ));

  return (
    <motion.div 
      className="relative w-full max-w-2xl"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="glass p-8 rounded-lg relative overflow-hidden">
        {particles}
        
        <h3 className="text-center text-xl mb-8 text-white">
          <span className="text-cyber-green neon-text">COUNTDOWN</span> TO VEGAS
        </h3>
        
        <div className="flex justify-center items-center">
          <TimeUnit value={timeLeft.days} prevValue={prevTime.days} unit="Days" />
          <TimeUnit value={timeLeft.hours} prevValue={prevTime.hours} unit="Hours" />
          <TimeUnit value={timeLeft.minutes} prevValue={prevTime.minutes} unit="Minutes" />
          <TimeUnit value={timeLeft.seconds} prevValue={prevTime.seconds} unit="Seconds" />
        </div>
        
        <div className="mt-8 text-center">
          <motion.button 
            className="cyber-btn"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            VIEW ITINERARY
          </motion.button>
        </div>
        
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-cyber-pink via-cyber-blue to-cyber-green" />
      </div>
    </motion.div>
  );
};

export default Countdown; 