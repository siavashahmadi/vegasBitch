import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import UserMenu from './UserMenu';

interface NavbarProps {
  activeView: 'home' | 'chat' | 'wellness' | 'itinerary' | 'polls';
  setActiveView: (view: 'home' | 'chat' | 'wellness' | 'itinerary' | 'polls') => void;
  nightMode: boolean;
  setNightMode: (mode: boolean) => void;
}

const Navbar: React.FC<NavbarProps> = ({ activeView, setActiveView, nightMode, setNightMode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [scrolled, setScrolled] = useState(false);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(timer);
  }, []);

  // Listen for scroll to add background when scrolled
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'timeline', label: 'Itinerary', icon: '📅' },
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'map', label: 'Map', icon: '🗺️' },
    { id: 'billsplit', label: 'Bill Split', icon: '💸' },
    { id: 'wellness', label: 'Wellness', icon: '💧' },
    { id: 'groupchat', label: 'Crew Chat', icon: '👥' },
    { id: 'nightlife', label: 'Nightlife', icon: '🌙' },
  ];

  const toggleNavbar = () => {
    setIsOpen(!isOpen);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <nav className={`fixed top-0 left-0 w-full z-40 transition-all duration-300 ${scrolled || isOpen ? 'bg-black/80 backdrop-blur-md' : 'bg-transparent'}`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Time */}
          <div className="flex items-center">
            <motion.div
              className="flex-shrink-0 cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setActiveView('home');
                setIsOpen(false);
              }}
            >
              <div className="flex items-center">
                <motion.span 
                  className="text-lg mr-2"
                  animate={{ 
                    rotate: [0, 10, 0, -10, 0],
                    scale: [1, 1.1, 1] 
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  🎲
                </motion.span>
                <span className="text-xl font-bold text-cyber-pink">Vegas</span>
                <span className="text-xl font-bold text-cyber-blue">Crew</span>
              </div>
            </motion.div>
            
            <div className="ml-4 hidden md:flex">
              <motion.div 
                className="text-sm text-cyber-gold tracking-widest"
                animate={{ 
                  textShadow: [
                    "0 0 5px rgba(255, 215, 0, 0.5)", 
                    "0 0 15px rgba(255, 215, 0, 0.7)", 
                    "0 0 5px rgba(255, 215, 0, 0.5)"
                  ] 
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {formatTime(currentTime)}
              </motion.div>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {navItems.map(item => (
              <motion.button
                key={item.id}
                className={`px-3 py-1 rounded-full text-sm ${
                  activeView === item.id 
                    ? 'bg-cyber-pink text-black font-bold' 
                    : 'text-white'
                }`}
                whileHover={{ 
                  scale: 1.05,
                  backgroundColor: activeView === item.id 
                    ? 'rgba(255, 42, 109, 1)' 
                    : 'rgba(255, 42, 109, 0.2)'
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveView(item.id as any)}
              >
                <span className="mr-1">{item.icon}</span>
                {item.label}
              </motion.button>
            ))}

            <div className="ml-4 border-l border-cyber-blue/30 pl-4">
              <UserMenu />
            </div>
          </div>
          
          {/* Mobile Navigation Button */}
          <div className="md:hidden flex items-center">
            <UserMenu />
            <motion.button
              onClick={toggleNavbar}
              className="ml-4 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-cyber-blue/20 focus:outline-none"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <span className="sr-only">Open main menu</span>
              {!isOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </motion.button>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="md:hidden bg-black/90 border-t border-cyber-blue/30"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="px-4 py-2 space-y-2">
              {navItems.map(item => (
                <motion.button
                  key={item.id}
                  className={`w-full text-left p-3 rounded ${
                    activeView === item.id 
                      ? 'bg-cyber-pink/20 border border-cyber-pink/30' 
                      : 'hover:bg-black/50'
                  }`}
                  whileHover={{ x: 5 }}
                  onClick={() => {
                    setActiveView(item.id as any);
                    setIsOpen(false);
                  }}
                >
                  <span className="mr-3 inline-block w-6 text-center">{item.icon}</span>
                  <span className={activeView === item.id ? 'text-cyber-pink font-bold' : 'text-white'}>
                    {item.label}
                  </span>
                </motion.button>
              ))}
              
              <div className="pt-2 border-t border-gray-800 flex justify-between items-center">
                <div className="text-sm text-cyber-gold">
                  {formatTime(currentTime)}
                </div>
                <motion.button
                  className="px-3 py-1 rounded-full text-xs bg-cyber-blue/20 text-cyber-blue"
                  whileHover={{ scale: 1.05, backgroundColor: 'rgba(5, 217, 232, 0.3)' }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setNightMode(!nightMode);
                    setIsOpen(false);
                  }}
                >
                  {nightMode ? 'Exit Nightlife' : 'Nightlife Mode'}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar; 