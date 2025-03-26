import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DaySchedule } from '../types';

interface TimelineProps {
  schedule: DaySchedule[];
}

// Array of cyberpunk-themed colors for events
const eventColors = [
  { 
    bg: 'bg-cyber-pink/20', 
    border: 'border-cyber-pink', 
    nodeBg: 'bg-cyber-pink/60',
    nodeBorder: 'border-cyber-pink',
    text: 'text-cyber-pink',
    shadow: 'shadow-neon-pink'
  },
  { 
    bg: 'bg-cyber-blue/20', 
    border: 'border-cyber-blue', 
    nodeBg: 'bg-cyber-blue/60',
    nodeBorder: 'border-cyber-blue',
    text: 'text-cyber-blue',
    shadow: 'shadow-neon-blue'
  },
  { 
    bg: 'bg-cyber-purple/20', 
    border: 'border-cyber-purple', 
    nodeBg: 'bg-cyber-purple/60',
    nodeBorder: 'border-cyber-purple',
    text: 'text-cyber-purple',
    shadow: 'shadow-neon-purple'
  },
  { 
    bg: 'bg-cyber-yellow/20', 
    border: 'border-cyber-yellow', 
    nodeBg: 'bg-cyber-yellow/60',
    nodeBorder: 'border-cyber-yellow',
    text: 'text-cyber-yellow',
    shadow: 'shadow-neon-yellow'
  },
];

const Timeline: React.FC<TimelineProps> = ({ schedule }) => {
  const [activeDay, setActiveDay] = useState<string>(schedule[0]?.day || '');
  
  // Check if an event is currently happening
  const isCurrentDay = (date: string) => {
    const today = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    return today === date;
  };

  const isCurrentEvent = (dayDate: string, eventTime: string, endTime?: string) => {
    if (!isCurrentDay(dayDate)) return false;
    
    const now = new Date();
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTimeInMinutes = currentHours * 60 + currentMinutes;
    
    // Parse event time
    const [eventHours, eventMinutes] = eventTime.match(/(\d+):(\d+)/)?.slice(1).map(Number) || [0, 0];
    const eventTimeInMinutes = eventHours * 60 + eventMinutes;
    
    // Parse end time if available
    let eventEndTimeInMinutes = 24 * 60; // Default to end of day
    if (endTime) {
      const [endHours, endMinutes] = endTime.match(/(\d+):(\d+)/)?.slice(1).map(Number) || [0, 0];
      eventEndTimeInMinutes = endHours * 60 + endMinutes;
    }
    
    // Check if current time is within event time range
    return currentTimeInMinutes >= eventTimeInMinutes && currentTimeInMinutes < eventEndTimeInMinutes;
  };

  // Get the active day's schedule
  const activeDaySchedule = schedule.find(day => day.day === activeDay) || schedule[0];

  return (
    <motion.div 
      className="w-full max-w-6xl mx-auto px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-center text-4xl font-bold mb-8 text-cyber-blue neon-text">TRIP TIMELINE</h2>
      
      {/* Day tabs */}
      <div className="flex overflow-x-auto mb-8 pb-2 scrollbar-thin scrollbar-track-cyber-dark">
        {schedule.map(day => {
          const isToday = isCurrentDay(day.date);
          
          return (
            <motion.button
              key={day.day}
              className={`px-6 py-3 mx-1 rounded-lg flex-shrink-0 transition-all ${
                activeDay === day.day 
                  ? 'bg-cyber-pink text-white shadow-neon-pink' 
                  : 'bg-cyber-dark/50 text-white/80 hover:bg-cyber-dark'
              } ${isToday ? 'border-l-4 border-cyber-green' : ''}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveDay(day.day)}
            >
              <div className="flex flex-col items-center">
                <span className="font-bold">{day.day}</span>
                <span className="text-xs opacity-80">{day.date.split(',')[0]}</span>
                {isToday && (
                  <div className="flex items-center mt-1">
                    <div className="h-2 w-2 bg-cyber-green rounded-full animate-pulse mr-1" />
                    <span className="text-cyber-green text-xs">TODAY</span>
                  </div>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
      
      {/* Timeline for the active day */}
      {activeDaySchedule && (
        <div className="glass-panel p-6 rounded-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold">
              <span className="text-cyber-pink neon-text">{activeDaySchedule.day}</span>
              <span className="text-white ml-2">{activeDaySchedule.date}</span>
            </h3>
          </div>
          
          <div className="relative pl-16 border-l-2 border-cyber-blue">
            {activeDaySchedule.events.map((event, index) => {
              const isNow = isCurrentEvent(activeDaySchedule.date, event.time, event.endTime);
              const timeDisplay = event.endTime ? `${event.time} - ${event.endTime}` : event.time;
              
              // Get color based on event index
              const colorIndex = index % eventColors.length;
              const color = eventColors[colorIndex];
              
              return (
                <motion.div
                  key={`${activeDaySchedule.day}-${index}`}
                  className={`mb-12 relative ${isNow ? 'z-10' : ''}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {/* Timeline node */}
                  <div 
                    className={`absolute -left-[30px] top-0 w-16 h-16 rounded-full flex flex-col items-center justify-center ${
                      isNow 
                        ? 'bg-cyber-green shadow-neon-green text-black animate-pulse' 
                        : `${color.nodeBg} border ${color.nodeBorder} ${color.shadow}`
                    }`}
                  >
                    <span className="text-sm font-mono leading-none">
                      {event.time.split(' ')[0]}
                    </span>
                    <span className="text-xs font-mono mt-1">
                      {event.time.split(' ')[1]}
                    </span>
                  </div>
                  
                  {/* Event content */}
                  <div 
                    className={`ml-8 p-4 rounded-lg transition-all ${
                      isNow 
                        ? 'bg-cyber-green/10 border border-cyber-green' 
                        : `${color.bg} border ${color.border}`
                    }`}
                  >
                    <div className="flex flex-col">
                      <h4 className={`text-xl font-bold mb-2 ${isNow ? 'text-cyber-blue' : color.text}`}>
                        {event.description}
                      </h4>
                      <div className="flex items-center">
                        <span className={`text-sm ${isNow ? 'text-cyber-pink' : color.text}`}>{timeDisplay}</span>
                        {isNow && (
                          <div className="flex items-center ml-4">
                            <div className="h-2 w-2 bg-cyber-green rounded-full animate-pulse mr-1" />
                            <span className="text-cyber-green text-xs font-bold">HAPPENING NOW</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Timeline; 