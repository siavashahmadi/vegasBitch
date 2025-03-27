import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import itinerary from '../itinerary';

interface WellnessMetrics {
  hydration: number; // 0-100%
  sleep: number; // Hours
  alcoholUnits: number;
  lastMeditation: Date | null;
  hangoverRisk?: number; // 0-100%
}

const WellnessTracker: React.FC = () => {
  // Get stored data from localStorage or use defaults
  const getInitialMetrics = (): Record<string, WellnessMetrics> => {
    const stored = localStorage.getItem('vegasBitchWellnessMetrics');
    if (stored) {
      const parsed = JSON.parse(stored);
      // Convert lastMeditation strings back to Date objects
      Object.keys(parsed).forEach(person => {
        if (parsed[person].lastMeditation) {
          parsed[person].lastMeditation = new Date(parsed[person].lastMeditation);
        }
      });
      return parsed;
    }
    
    // Create default metrics for each person
    const defaults: Record<string, WellnessMetrics> = {};
    itinerary.people.forEach(person => {
      defaults[person.name] = {
        hydration: 70,
        sleep: 7,
        alcoholUnits: 0,
        lastMeditation: null,
        hangoverRisk: 0
      };
    });
    return defaults;
  };

  const [metrics, setMetrics] = useState<Record<string, WellnessMetrics>>(getInitialMetrics);
  const [activePerson, setActivePerson] = useState<string>(itinerary.people[0].name);
  const [meditationTime, setMeditationTime] = useState<number>(5); // In minutes
  const [isMeditating, setIsMeditating] = useState<boolean>(false);
  const [meditationTimeLeft, setMeditationTimeLeft] = useState<number>(0);
  const [showTips, setShowTips] = useState<boolean>(false);
  const [showHangoverModal, setShowHangoverModal] = useState<boolean>(false);

  // Save metrics to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('vegasBitchWellnessMetrics', JSON.stringify(metrics));
  }, [metrics]);

  // Calculate hangover risk when alcohol or hydration changes
  useEffect(() => {
    updateHangoverRisk();
  }, [metrics[activePerson]?.alcoholUnits, metrics[activePerson]?.hydration, metrics[activePerson]?.sleep]);

  // Meditation timer
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    
    if (isMeditating && meditationTimeLeft > 0) {
      timer = setInterval(() => {
        setMeditationTimeLeft(prev => {
          if (prev <= 1) {
            // Meditation complete
            if (timer) clearInterval(timer);
            setIsMeditating(false);
            
            // Update last meditation time
            setMetrics(prev => ({
              ...prev,
              [activePerson]: {
                ...prev[activePerson],
                lastMeditation: new Date(),
                // Bonus hydration for meditating
                hydration: Math.min(100, prev[activePerson].hydration + 5)
              }
            }));
            
            return 0;
          }
          return prev - 1;
        });
      }, 1000); // Update every second
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isMeditating, meditationTimeLeft, activePerson]);

  const startMeditation = () => {
    setMeditationTimeLeft(meditationTime * 60); // Convert minutes to seconds
    setIsMeditating(true);
  };

  const stopMeditation = () => {
    setIsMeditating(false);
  };

  const updateMetric = (metric: keyof WellnessMetrics, value: number) => {
    setMetrics(prev => ({
      ...prev,
      [activePerson]: {
        ...prev[activePerson],
        [metric]: value
      }
    }));
  };

  const addWater = () => {
    setMetrics(prev => ({
      ...prev,
      [activePerson]: {
        ...prev[activePerson],
        hydration: Math.min(100, prev[activePerson].hydration + 10)
      }
    }));
  };

  const addAlcohol = () => {
    setMetrics(prev => ({
      ...prev,
      [activePerson]: {
        ...prev[activePerson],
        alcoholUnits: prev[activePerson].alcoholUnits + 1,
        // Alcohol decreases hydration
        hydration: Math.max(0, prev[activePerson].hydration - 5)
      }
    }));
  };

  const updateHangoverRisk = () => {
    if (!metrics[activePerson]) return;
    
    const { alcoholUnits, hydration, sleep } = metrics[activePerson];
    
    // Calculate hangover risk based on various factors
    // Algorithm:
    // - Each alcohol unit adds 10% risk
    // - Every 10% hydration below 60% adds 5% risk
    // - Every hour of sleep below 6 hours adds 5% risk
    
    let risk = alcoholUnits * 10;
    
    if (hydration < 60) {
      risk += ((60 - hydration) / 10) * 5;
    }
    
    if (sleep < 6) {
      risk += (6 - sleep) * 5;
    }
    
    // Cap risk at 100%
    risk = Math.min(100, Math.max(0, risk));
    
    setMetrics(prev => ({
      ...prev,
      [activePerson]: {
        ...prev[activePerson],
        hangoverRisk: Math.round(risk)
      }
    }));
  };

  const getHangoverRecoveryTips = () => {
    const risk = metrics[activePerson]?.hangoverRisk || 0;
    const alcoholUnits = metrics[activePerson]?.alcoholUnits || 0;
    
    if (risk < 20) {
      return ["You're in good shape! Keep hydrating."];
    }
    
    const tips = [
      "Drink a large glass of water before bed",
      "Take a B vitamin supplement",
      "Consider some electrolytes (Gatorade/Pedialyte)",
    ];
    
    if (risk > 40) {
      tips.push("Take ibuprofen before sleeping (but not acetaminophen/Tylenol)");
      tips.push("Eat something with protein and healthy fats before bed");
    }
    
    if (risk > 60) {
      tips.push("Set a reminder to drink water throughout the night");
      tips.push("Consider skipping your first morning event to sleep in");
      tips.push("Place a sports drink by your bed for the morning");
    }
    
    if (risk > 80) {
      tips.push("Seriously consider slowing down on the drinks");
      tips.push("Arrange a late checkout if possible");
      tips.push("Have an emergency hangover kit ready (pain relievers, antacids, electrolytes)");
    }
    
    return tips;
  };

  const getHangoverRiskColor = (risk: number) => {
    if (risk < 20) return 'text-green-500';
    if (risk < 40) return 'text-yellow-500';
    if (risk < 60) return 'text-orange-500';
    if (risk < 80) return 'text-red-500';
    return 'text-purple-500';
  };

  const getHangoverRiskEmoji = (risk: number) => {
    if (risk < 20) return '😀';
    if (risk < 40) return '🙂';
    if (risk < 60) return '😐';
    if (risk < 80) return '🥴';
    return '☠️';
  };

  const getHangoverRiskText = (risk: number) => {
    if (risk < 20) return 'Low';
    if (risk < 40) return 'Moderate';
    if (risk < 60) return 'High';
    if (risk < 80) return 'Severe';
    return 'Extreme';
  };

  const getHydrationColor = (level: number) => {
    if (level < 30) return 'text-red-500';
    if (level < 60) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getHydrationRecommendation = (person: string) => {
    const personMetrics = metrics[person];
    
    if (personMetrics.hydration < 30) {
      return "Critical! Drink water immediately!";
    }
    
    if (personMetrics.hydration < 50) {
      return "You're dehydrated. Drink a bottle of water soon.";
    }
    
    if (personMetrics.alcoholUnits > 3) {
      return "Alternate each drink with a glass of water.";
    }
    
    return "Hydration looks good! Keep it up!";
  };

  const formatLastMeditation = (date: Date | null) => {
    if (!date) return 'Never meditated';
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHrs = diffMs / (1000 * 60 * 60);
    
    if (diffHrs < 1) {
      return 'Less than an hour ago';
    }
    
    if (diffHrs < 24) {
      return `${Math.floor(diffHrs)} hours ago`;
    }
    
    return `${Math.floor(diffHrs / 24)} days ago`;
  };

  const getMeditationRecommendation = () => {
    const sleepHours = metrics[activePerson]?.sleep || 0;
    const alcoholUnits = metrics[activePerson]?.alcoholUnits || 0;
    
    if (alcoholUnits > 5) {
      return "Drinking heavily? A 10-minute meditation could help clear your head.";
    }
    
    if (sleepHours < 6) {
      return "Low on sleep? Meditation can help you feel more rested.";
    }
    
    return "A quick meditation can help you stay centered during your Vegas adventure.";
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <motion.div 
      className="bg-black/80 backdrop-blur-md rounded-xl p-6 text-white border border-cyber-blue/30"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl font-bold mb-4 text-cyber-blue flex items-center">
        <motion.span
          className="inline-block mr-2"
          animate={{ 
            rotate: [0, 10, 0, -10, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          💧
        </motion.span>
        Vegas Wellness Tracker
      </h2>
      
      {/* Person Selector */}
      <div className="mb-6">
        <h3 className="text-cyber-gold mb-2">Select Person:</h3>
        <div className="flex flex-wrap gap-2">
          {itinerary.people.map(person => (
            <motion.button
              key={person.name}
              className={`px-3 py-1 rounded-full text-sm ${
                activePerson === person.name 
                  ? 'bg-cyber-pink text-black font-bold' 
                  : 'bg-gray-800 text-white'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActivePerson(person.name)}
            >
              {person.name}
            </motion.button>
          ))}
        </div>
      </div>
      
      {/* Metrics Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Hydration */}
        <motion.div 
          className="relative p-4 rounded-lg border border-cyber-blue/20 bg-gradient-to-br from-black/60 to-blue-900/30"
          whileHover={{ scale: 1.02 }}
        >
          <h3 className="text-cyber-blue mb-2 flex items-center">
            <span className="mr-2">💧</span>Hydration
          </h3>
          <div className="w-full h-6 bg-gray-800 rounded overflow-hidden mb-2">
            <motion.div 
              className="h-full bg-gradient-to-r from-blue-700 to-cyan-400"
              initial={{ width: 0 }}
              animate={{ width: `${metrics[activePerson]?.hydration || 0}%` }}
              transition={{ duration: 1 }}
            />
          </div>
          <div className="flex justify-between">
            <span className={getHydrationColor(metrics[activePerson]?.hydration || 0)}>
              {metrics[activePerson]?.hydration || 0}%
            </span>
            <div className="flex gap-2">
              <motion.button
                className="px-2 py-1 bg-blue-600 rounded text-xs"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={addWater}
              >
                +Water
              </motion.button>
              <motion.button
                className="px-2 py-1 bg-purple-600 rounded text-xs"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={addAlcohol}
              >
                +Drink
              </motion.button>
            </div>
          </div>
          <p className="text-xs mt-2 text-blue-300">
            {getHydrationRecommendation(activePerson)}
          </p>
        </motion.div>
        
        {/* Sleep */}
        <motion.div 
          className="p-4 rounded-lg border border-cyber-blue/20 bg-gradient-to-br from-black/60 to-indigo-900/30"
          whileHover={{ scale: 1.02 }}
        >
          <h3 className="text-cyber-blue mb-2 flex items-center">
            <span className="mr-2">😴</span>Sleep
          </h3>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0"
              max="12"
              step="0.5"
              value={metrics[activePerson]?.sleep || 0}
              onChange={(e) => updateMetric('sleep', parseFloat(e.target.value))}
              className="w-full"
            />
            <span className="w-12 text-right">{metrics[activePerson]?.sleep || 0}h</span>
          </div>
          <p className="text-xs mt-2 text-indigo-300">
            {metrics[activePerson]?.sleep && metrics[activePerson]?.sleep < 6 
              ? "You're running low on sleep. Consider a nap or earlier night." 
              : "You're getting good sleep. Keep it up!"}
          </p>
        </motion.div>
        
        {/* Alcohol Tracker */}
        <motion.div 
          className="p-4 rounded-lg border border-cyber-blue/20 bg-gradient-to-br from-black/60 to-purple-900/30"
          whileHover={{ scale: 1.02 }}
        >
          <h3 className="text-cyber-blue mb-2 flex items-center">
            <span className="mr-2">🍸</span>Alcohol Units
          </h3>
          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              {[...Array(Math.min(10, metrics[activePerson]?.alcoholUnits || 0))].map((_, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-lg"
                >
                  🍸
                </motion.span>
              ))}
              {metrics[activePerson]?.alcoholUnits && metrics[activePerson]?.alcoholUnits > 10 && 
                <span className="text-cyber-pink">+{metrics[activePerson]?.alcoholUnits - 10}</span>
              }
            </div>
            <div className="flex gap-2">
              <motion.button
                className="px-2 py-1 bg-purple-600 rounded text-xs"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={addAlcohol}
              >
                Add Drink
              </motion.button>
              <motion.button
                className="px-2 py-1 bg-gray-700 rounded text-xs"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => updateMetric('alcoholUnits', Math.max(0, (metrics[activePerson]?.alcoholUnits || 0) - 1))}
              >
                Remove
              </motion.button>
            </div>
          </div>
          <p className="text-xs mt-2 text-purple-300">
            {metrics[activePerson]?.alcoholUnits && metrics[activePerson]?.alcoholUnits > 8 
              ? "Drink responsibly! Make sure to hydrate." 
              : metrics[activePerson]?.alcoholUnits && metrics[activePerson]?.alcoholUnits > 4 
                ? "You're having fun! Remember to drink water too." 
                : "Enjoy your night!"}
          </p>
        </motion.div>
        
        {/* NEW - Hangover Risk Predictor */}
        <motion.div 
          className="p-4 rounded-lg border border-cyber-blue/20 bg-gradient-to-br from-black/60 to-red-900/30"
          whileHover={{ scale: 1.02 }}
        >
          <h3 className="text-cyber-blue mb-2 flex items-center">
            <span className="mr-2">🤢</span>Hangover Risk
          </h3>
          <div className="w-full h-6 bg-gray-800 rounded overflow-hidden mb-2">
            <motion.div 
              className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"
              initial={{ width: 0 }}
              animate={{ width: `${metrics[activePerson]?.hangoverRisk || 0}%` }}
              transition={{ duration: 1 }}
            />
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <span className={`text-lg mr-2 ${getHangoverRiskColor(metrics[activePerson]?.hangoverRisk || 0)}`}>
                {getHangoverRiskEmoji(metrics[activePerson]?.hangoverRisk || 0)}
              </span>
              <span className={getHangoverRiskColor(metrics[activePerson]?.hangoverRisk || 0)}>
                {metrics[activePerson]?.hangoverRisk || 0}% - {getHangoverRiskText(metrics[activePerson]?.hangoverRisk || 0)}
              </span>
            </div>
            <motion.button
              className="px-2 py-1 bg-cyber-pink/80 rounded text-xs"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowHangoverModal(true)}
            >
              Recovery Tips
            </motion.button>
          </div>
          <p className="text-xs mt-2 text-red-300">
            {(metrics[activePerson]?.hangoverRisk ?? 0) > 50
              ? "High risk of hangover tomorrow. Get some water!"
              : "Your hangover risk is currently manageable."}
          </p>
        </motion.div>
        
        {/* Meditation */}
        <motion.div 
          className="p-4 rounded-lg border border-cyber-blue/20 bg-gradient-to-br from-black/60 to-green-900/30"
          whileHover={{ scale: 1.02 }}
        >
          <h3 className="text-cyber-blue mb-2 flex items-center">
            <span className="mr-2">🧘</span>Meditation
          </h3>
          
          {isMeditating ? (
            <div className="text-center">
              <motion.div 
                className="w-24 h-24 rounded-full bg-green-500/20 mx-auto mb-3 flex items-center justify-center text-2xl"
                animate={{ 
                  scale: [1, 1.1, 1],
                  boxShadow: [
                    '0 0 0 0 rgba(5, 217, 232, 0.7)',
                    '0 0 0 20px rgba(5, 217, 232, 0)',
                    '0 0 0 0 rgba(5, 217, 232, 0)'
                  ]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  repeatType: 'loop' 
                }}
              >
                {formatTime(meditationTimeLeft)}
              </motion.div>
              <motion.button
                className="px-4 py-2 bg-red-600 rounded"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={stopMeditation}
              >
                Stop
              </motion.button>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm">Time:</span>
                <div className="flex gap-2">
                  {[1, 3, 5, 10].map(time => (
                    <motion.button
                      key={time}
                      className={`px-2 py-1 rounded text-xs ${
                        meditationTime === time ? 'bg-green-600' : 'bg-gray-700'
                      }`}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setMeditationTime(time)}
                    >
                      {time}m
                    </motion.button>
                  ))}
                </div>
              </div>
              <div className="text-center">
                <motion.button
                  className="px-4 py-2 bg-green-600 rounded"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startMeditation}
                >
                  Start Meditation
                </motion.button>
              </div>
              <p className="text-xs mt-2 text-green-300">
                Last meditation: {formatLastMeditation(metrics[activePerson]?.lastMeditation)}
              </p>
            </div>
          )}
        </motion.div>
      </div>
      
      {/* Vegas Wellness Tips */}
      <motion.div
        className="mt-4"
        initial={{ height: 0, opacity: 0 }}
        animate={{ 
          height: showTips ? 'auto' : 0,
          opacity: showTips ? 1 : 0
        }}
        transition={{ duration: 0.3 }}
      >
        <div className="p-4 rounded-lg border border-cyber-gold/20 bg-gradient-to-br from-black/60 to-amber-900/20">
          <h3 className="text-cyber-gold mb-2">Vegas Wellness Tips</h3>
          <ul className="text-sm space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-cyber-pink">🌡️</span>
              <span>Vegas is dry! Drink more water than you think you need.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyber-pink">💊</span>
              <span>Taking Advil and drinking water before bed helps prevent hangovers.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyber-pink">🌞</span>
              <span>Use sunscreen at pool parties - the sun is stronger than you think!</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyber-pink">👟</span>
              <span>Wear comfortable shoes - you'll walk more than you expect.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyber-pink">⏰</span>
              <span>A 20-minute power nap before going out can make your night better.</span>
            </li>
          </ul>
        </div>
      </motion.div>
      
      <motion.button
        className="mt-4 w-full py-2 bg-cyber-blue/20 rounded-lg text-cyber-blue border border-cyber-blue/30 text-sm"
        whileHover={{ scale: 1.02, backgroundColor: 'rgba(5, 217, 232, 0.3)' }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setShowTips(!showTips)}
      >
        {showTips ? 'Hide Tips' : 'Show Wellness Tips'}
      </motion.button>
      
      {/* Hangover Recovery Modal */}
      {showHangoverModal && (
        <motion.div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowHangoverModal(false)}
        >
          <motion.div
            className="bg-black/90 rounded-xl p-6 max-w-md w-full border border-cyber-pink/30 shadow-lg"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-cyber-pink flex items-center">
                <span className="mr-2">🧪</span>
                Hangover Recovery Plan
              </h3>
              <motion.button
                className="text-gray-400 hover:text-white"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowHangoverModal(false)}
              >
                ✕
              </motion.button>
            </div>
            
            <div className="mb-4">
              <div className="flex items-center mb-2">
                <motion.div 
                  className="w-10 h-10 rounded-full flex items-center justify-center mr-3 text-lg"
                  animate={{ 
                    backgroundColor: [
                      'rgba(255, 0, 0, 0.2)',
                      'rgba(255, 0, 0, 0.3)',
                      'rgba(255, 0, 0, 0.2)'
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {getHangoverRiskEmoji(metrics[activePerson]?.hangoverRisk || 0)}
                </motion.div>
                <div>
                  <div className="text-sm text-gray-400">Current risk level</div>
                  <div className={`font-bold ${getHangoverRiskColor(metrics[activePerson]?.hangoverRisk || 0)}`}>
                    {getHangoverRiskText(metrics[activePerson]?.hangoverRisk || 0)} ({metrics[activePerson]?.hangoverRisk || 0}%)
                  </div>
                </div>
              </div>
              
              <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden mb-4">
                <motion.div 
                  className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${metrics[activePerson]?.hangoverRisk || 0}%` }}
                  transition={{ duration: 1 }}
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="text-cyber-gold font-bold mb-2">Prevention Steps</h4>
              <ul className="space-y-2">
                {getHangoverRecoveryTips().map((tip, index) => (
                  <motion.li 
                    key={index}
                    className="flex items-start gap-2 text-sm"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <span className="text-cyber-pink flex-shrink-0 mt-0.5">✓</span>
                    <span>{tip}</span>
                  </motion.li>
                ))}
              </ul>
              
              <div className="pt-2">
                <h4 className="text-cyber-gold font-bold mb-2">Morning Recovery</h4>
                <p className="text-sm text-gray-300 mb-2">
                  If you wake up feeling awful, try these steps:
                </p>
                <ul className="space-y-2">
                  <li className="text-sm flex items-start gap-2">
                    <span className="text-cyber-blue flex-shrink-0 mt-0.5">1.</span>
                    <span>Drink 16oz of water with electrolytes immediately</span>
                  </li>
                  <li className="text-sm flex items-start gap-2">
                    <span className="text-cyber-blue flex-shrink-0 mt-0.5">2.</span>
                    <span>Take ibuprofen with food (never on empty stomach)</span>
                  </li>
                  <li className="text-sm flex items-start gap-2">
                    <span className="text-cyber-blue flex-shrink-0 mt-0.5">3.</span>
                    <span>Eat protein & complex carbs (eggs & toast ideal)</span>
                  </li>
                  <li className="text-sm flex items-start gap-2">
                    <span className="text-cyber-blue flex-shrink-0 mt-0.5">4.</span>
                    <span>Take a cool shower followed by a 30-min nap</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <motion.button
              className="w-full mt-6 p-3 bg-cyber-pink/20 rounded text-cyber-pink border border-cyber-pink/30"
              whileHover={{ scale: 1.02, backgroundColor: 'rgba(255, 42, 109, 0.3)' }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowHangoverModal(false)}
            >
              I Got This
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default WellnessTracker; 