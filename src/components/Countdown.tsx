import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const VegasFunFacts: React.FC = () => {
  const [currentFact, setCurrentFact] = useState<number>(0);
  const [currentQuote, setCurrentQuote] = useState<number>(0);
  const [isAutoAdvancing, setIsAutoAdvancing] = useState<boolean>(true);

  // Vegas fun facts
  const facts = [
    "The Bellagio Fountains contain 1,214 jets that can shoot water up to 460 feet in the air.",
    "The MGM Grand is the largest single hotel in the United States with 6,852 rooms.",
    "The light beam atop the Luxor can be seen from space and uses 39 xenon lamps at 7,000 watts each.",
    "Las Vegas has more hotel rooms than any other city on Earth at ~150,000 rooms.",
    "A little over 41 million people visit Las Vegas every year.",
    "The Las Vegas Strip isn't actually in Las Vegas. It's located in Paradise, Nevada.",
    "The Sphere has the world's highest resolution LED screen with 1.2 million LED panels.",
    "The famous 'Welcome to Fabulous Las Vegas' sign was created in 1959.",
    "A Clark County ordinance requires casinos to have no clocks visible on the gaming floor.",
    "The Venetian Resort contains enough marble to pave a road from Las Vegas to L.A.",
    "Over 100,000 weddings take place in Las Vegas every year.",
    "The Strip is 4.2 miles long from the 'Welcome to Fabulous Las Vegas' sign to Sahara Avenue."
  ];

  // Vegas quotes
  const quotes = [
    { text: "Las Vegas is the only place I know where money really talks—it says, 'Goodbye.'", author: "Frank Sinatra" },
    { text: "Las Vegas looks the way you'd imagine heaven must look at night.", author: "Chuck Palahniuk" },
    { text: "Las Vegas is sort of like how God would do it if he had money.", author: "Steve Wynn" },
    { text: "What happens in Vegas, stays in Vegas.", author: "Las Vegas Convention and Visitors Authority" },
    { text: "Man, I really like Vegas.", author: "Elvis Presley" },
    { text: "Vegas means comedy, tragedy, happiness and sadness all at the same time.", author: "Artie Lange" },
    { text: "Las Vegas is a city built on hopes, dreams, and a little bit of crazy.", author: "Michael McDonald" },
    { text: "Gambling in Vegas is the ultimate rush.", author: "Ben Affleck" },
    { text: "Las Vegas, it's a city where you can have an identity crisis for 48 hours... and create another one.", author: "Dov Davidoff" },
    { text: "Las Vegas is the boiling point of evolution.", author: "Showgirls" }
  ];

  // Auto advance facts and quotes every 12 seconds if auto-advancing is enabled
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isAutoAdvancing) {
      interval = setInterval(() => {
        setCurrentFact(prev => (prev + 1) % facts.length);
        setCurrentQuote(prev => (prev + 1) % quotes.length);
      }, 12000);
    }
    
    return () => clearInterval(interval);
  }, [isAutoAdvancing, facts.length, quotes.length]);

  // Manual advance to next fact/quote
  const advanceToNext = () => {
    setCurrentFact(prev => (prev + 1) % facts.length);
    setCurrentQuote(prev => (prev + 1) % quotes.length);
  };

  return (
    <motion.div 
      className="relative w-full max-w-2xl"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="glass p-8 rounded-lg relative overflow-hidden">
        {/* Particle effects */}
        {Array.from({ length: 20 }).map((_, i) => (
          <div 
            key={i}
            className="particle"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`
            }}
          />
        ))}
        
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl text-white">
            <span className="text-cyber-green neon-text">VEGAS</span> INFO
          </h3>
          <div className="flex items-center">
            <button 
              onClick={() => setIsAutoAdvancing(!isAutoAdvancing)}
              className={`mr-2 text-xs px-2 py-1 rounded ${isAutoAdvancing ? 'bg-cyber-green text-black' : 'bg-cyber-dark text-cyber-green border border-cyber-green'}`}
            >
              {isAutoAdvancing ? 'AUTO' : 'MANUAL'}
            </button>
            {!isAutoAdvancing && (
              <button 
                onClick={advanceToNext}
                className="text-cyber-pink"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>
        </div>
        
        {/* Fun Fact Section */}
        <motion.div 
          key={`fact-${currentFact}`}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.5 }}
          className="glass-panel p-4 mb-6"
        >
          <div className="flex items-start mb-2">
            <div className="mr-3 mt-1">
              <motion.div 
                className="text-cyber-gold"
                animate={{ 
                  rotate: [0, 10, 0, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  repeatType: "loop"
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </motion.div>
            </div>
            <div>
              <h4 className="text-cyber-gold text-sm font-bold mb-1">DID YOU KNOW?</h4>
              <p className="text-white">{facts[currentFact]}</p>
            </div>
          </div>
        </motion.div>
        
        {/* Quote Section */}
        <motion.div 
          key={`quote-${currentQuote}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="glass-panel p-4"
        >
          <div className="flex items-start">
            <div className="text-cyber-pink mr-3 mt-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
            </div>
            <div>
              <p className="text-white italic mb-2">"{quotes[currentQuote].text}"</p>
              <p className="text-cyber-blue text-sm text-right">— {quotes[currentQuote].author}</p>
            </div>
          </div>
        </motion.div>
        
        {/* Progress bar */}
        {isAutoAdvancing && (
          <div className="mt-6">
            <div className="h-1 bg-cyber-dark rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-cyber-pink via-cyber-blue to-cyber-green" 
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ 
                  duration: 12, 
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default VegasFunFacts; 