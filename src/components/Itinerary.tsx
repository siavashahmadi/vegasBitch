import React from 'react';
import { motion } from 'framer-motion';

const Itinerary: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-cyber-dark/80 backdrop-blur-md p-6 rounded-lg border border-cyber-blue/30"
      >
        <h2 className="text-2xl font-bold text-cyber-blue mb-4 flex items-center">
          <motion.span
            className="inline-block mr-2"
            animate={{ 
              rotate: [0, 10, 0, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            📅
          </motion.span>
          Vegas Itinerary
        </h2>
        <p className="text-cyber-pink">Coming soon...</p>
      </motion.div>
    </div>
  );
};

export default Itinerary; 