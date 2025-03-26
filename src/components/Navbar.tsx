import React from 'react';
import { motion } from 'framer-motion';

interface NavbarProps {
  activeView: 'home' | 'timeline' | 'dashboard' | 'map' | 'nightlife';
  setActiveView: React.Dispatch<React.SetStateAction<'home' | 'timeline' | 'dashboard' | 'map' | 'nightlife'>>;
  nightMode: boolean;
  setNightMode: React.Dispatch<React.SetStateAction<boolean>>;
}

const Navbar: React.FC<NavbarProps> = ({ activeView, setActiveView, nightMode }) => {
  const navItems = [
    { id: 'home', label: 'HOME' },
    { id: 'timeline', label: 'TIMELINE' },
    { id: 'dashboard', label: 'DASHBOARD' },
    { id: 'map', label: 'VEGAS MAP' },
  ] as const;

  return (
    <nav className={`sticky top-0 z-30 glass py-4 px-6 ${nightMode ? 'bg-black/70' : ''}`}>
      <div className="container mx-auto flex justify-between items-center">
        <motion.div 
          className="text-xl font-bold text-cyber-pink neon-text"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          VEGAS OUTLAWZ
        </motion.div>
        
        <ul className="hidden md:flex space-x-8">
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => setActiveView(item.id as any)}
                className={`relative px-4 py-2 font-medium tracking-wider transition-colors duration-300 ${
                  activeView === item.id
                    ? 'text-cyber-blue neon-text'
                    : 'text-white hover:text-cyber-green'
                }`}
              >
                {item.label}
                {activeView === item.id && (
                  <motion.div
                    className="absolute bottom-0 left-0 w-full h-0.5 bg-cyber-blue"
                    layoutId="navbar-indicator"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </button>
            </li>
          ))}
        </ul>
        
        {/* Mobile menu button */}
        <div className="md:hidden">
          <button className="text-white hover:text-cyber-pink">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Mobile menu - hidden by default */}
      <div className="md:hidden hidden">
        <ul className="px-4 pt-2 pb-3 space-y-1">
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => setActiveView(item.id as any)}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  activeView === item.id
                    ? 'text-cyber-blue bg-cyber-dark'
                    : 'text-white hover:bg-cyber-dark/50'
                }`}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar; 