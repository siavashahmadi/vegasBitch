import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DaySchedule } from '../types';

interface NotificationPanelProps {
  schedule: DaySchedule[];
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'alert' | 'reminder';
  timeUntil?: string;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ schedule }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Generate notifications from schedule
  useEffect(() => {
    const generateNotifications = () => {
      const now = new Date();
      const notifs: Notification[] = [];
      
      // Find today's events
      const todayDate = now.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      
      const todaySchedule = schedule.find(day => day.date === todayDate);
      
      if (todaySchedule) {
        // Add today's upcoming events as notifications
        todaySchedule.events.forEach(event => {
          const [hours, minutes] = event.time.match(/(\d+):(\d+)/)?.slice(1).map(Number) || [0, 0];
          const eventTime = new Date();
          eventTime.setHours(hours, minutes, 0);
          
          // Only include future events from today
          if (eventTime > now) {
            const timeDiff = eventTime.getTime() - now.getTime();
            const hoursUntil = Math.floor(timeDiff / (1000 * 60 * 60));
            const minutesUntil = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
            
            // Only show events coming up within the next 6 hours
            if (hoursUntil < 6) {
              let timeUntilStr = '';
              if (hoursUntil > 0) {
                timeUntilStr += `${hoursUntil}h `;
              }
              timeUntilStr += `${minutesUntil}m`;
              
              notifs.push({
                id: `event-${todaySchedule.day}-${event.time}`,
                title: `Upcoming: ${event.time}`,
                message: event.description,
                type: hoursUntil < 1 ? 'alert' : 'reminder',
                timeUntil: timeUntilStr
              });
            }
          }
        });
      }
      
      // Find tomorrow's events
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowDate = tomorrow.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      
      const tomorrowSchedule = schedule.find(day => day.date === tomorrowDate);
      
      if (tomorrowSchedule) {
        // Add the first event of tomorrow as a reminder
        const firstEvent = tomorrowSchedule.events[0];
        if (firstEvent) {
          notifs.push({
            id: `tomorrow-first-${tomorrowSchedule.day}`,
            title: 'Tomorrow',
            message: `${firstEvent.time} - ${firstEvent.description}`,
            type: 'info'
          });
        }
      }
      
      // Fake hotel notification
      notifs.push({
        id: 'hotel-check-in-reminder',
        title: 'Hotel Check-in',
        message: 'Digital key is available in MGM Rewards app',
        type: 'info'
      });
      
      setNotifications(notifs);
      setUnreadCount(notifs.length);
    };
    
    generateNotifications();
    
    // Update notifications every 5 minutes
    const interval = setInterval(generateNotifications, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [schedule]);
  
  const handleNotificationClick = () => {
    setExpanded(!expanded);
    if (expanded) {
      setUnreadCount(0);
    }
  };
  
  const getNotificationColor = (type: 'info' | 'alert' | 'reminder') => {
    switch (type) {
      case 'alert': return 'border-cyber-pink';
      case 'reminder': return 'border-cyber-green';
      default: return 'border-cyber-blue';
    }
  };
  
  return (
    <div className="relative">
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="glass-panel px-4 py-2 rounded-full cursor-pointer flex items-center"
        onClick={handleNotificationClick}
      >
        <div className="relative mr-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-cyber-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          
          {unreadCount > 0 && (
            <motion.div 
              className="absolute -top-1 -right-1 w-4 h-4 bg-cyber-pink rounded-full flex items-center justify-center text-white text-xs"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 10 }}
            >
              {unreadCount}
            </motion.div>
          )}
        </div>
        <span className="text-sm">Updates</span>
      </motion.div>
      
      <AnimatePresence>
        {expanded && (
          <motion.div
            className="absolute top-12 right-0 w-72 max-h-96 overflow-y-auto glass-panel z-50"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="p-4">
              <h3 className="text-cyber-blue text-lg font-bold mb-4">Notifications</h3>
              
              {notifications.length === 0 ? (
                <p className="text-white/70 text-center py-4">No new notifications</p>
              ) : (
                notifications.map(notification => (
                  <motion.div
                    key={notification.id}
                    className={`mb-3 p-3 border-l-4 ${getNotificationColor(notification.type)} bg-black/20 rounded`}
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="text-white font-medium">{notification.title}</h4>
                      {notification.timeUntil && (
                        <span className="text-xs bg-cyber-dark px-2 py-1 rounded text-cyber-green">
                          in {notification.timeUntil}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-white/70 mt-1">{notification.message}</p>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationPanel; 