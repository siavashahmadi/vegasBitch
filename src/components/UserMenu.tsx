import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { authService } from '../services/auth';
import { useNavigate } from 'react-router-dom';

const UserMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  const handleLogout = async () => {
    await authService.logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="relative">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-md bg-cyber-dark/50 border border-cyber-blue/30 hover:border-cyber-pink/50 transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="w-8 h-8 rounded-full bg-cyber-blue/20 flex items-center justify-center border border-cyber-blue/50">
          <span className="text-cyber-blue font-bold">
            {user.profile?.nickname?.[0] || user.email[0].toUpperCase()}
          </span>
        </div>
        <span className="text-white">{user.profile?.nickname || user.email}</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-cyber-dark border border-cyber-blue/30"
            onMouseLeave={() => setIsOpen(false)}
          >
            <div className="px-4 py-2 border-b border-cyber-blue/20">
              <p className="text-sm text-cyber-blue">Signed in as</p>
              <p className="text-sm font-medium text-white truncate">{user.email}</p>
            </div>

            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-sm text-white hover:bg-cyber-pink/20 transition-colors flex items-center space-x-2"
            >
              <span className="text-cyber-pink">⟨/⟩</span>
              <span>Sign out</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserMenu; 