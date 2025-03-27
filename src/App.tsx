import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import GroupChat from './components/GroupChat';
import WellnessTracker from './components/WellnessTracker';
import Itinerary from './components/Itinerary';
import Polls from './components/Polls';
import Login from './components/Login';
import { authService } from './services/auth';

type ViewType = 'home' | 'chat' | 'wellness' | 'itinerary' | 'polls';

const isValidView = (view: string): view is ViewType => {
  return ['home', 'chat', 'wellness', 'itinerary', 'polls'].includes(view);
};

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = authService.isAuthenticated();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewType>('chat');
  const [nightMode, setNightMode] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Check authentication on mount
  useEffect(() => {
    if (!authService.isAuthenticated() && location.pathname !== '/login') {
      navigate('/login');
    }
  }, [location.pathname, navigate]);

  // Update activeView based on current path
  useEffect(() => {
    const path = location.pathname.slice(1);
    if (path && path !== 'login' && isValidView(path)) {
      setActiveView(path);
    }
  }, [location.pathname]);

  return (
    <div className={`min-h-screen ${nightMode ? 'bg-black' : 'bg-cyber-black'}`}>
      {location.pathname !== '/login' && (
        <Navbar
          activeView={activeView}
          setActiveView={(view) => {
            setActiveView(view);
            navigate(`/${view}`);
          }}
          nightMode={nightMode}
          setNightMode={setNightMode}
        />
      )}

      <main className="pt-16">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/login" element={<Login />} />
            
            <Route path="/chat" element={
              <ProtectedRoute>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <GroupChat />
                </motion.div>
              </ProtectedRoute>
            } />

            <Route path="/wellness" element={
              <ProtectedRoute>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <WellnessTracker />
                </motion.div>
              </ProtectedRoute>
            } />

            <Route path="/itinerary" element={
              <ProtectedRoute>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Itinerary />
                </motion.div>
              </ProtectedRoute>
            } />

            <Route path="/polls" element={
              <ProtectedRoute>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Polls />
                </motion.div>
              </ProtectedRoute>
            } />

            <Route path="/" element={<Navigate to="/chat" replace />} />
          </Routes>
        </AnimatePresence>
      </main>
    </div>
  );
};

// Wrap the app with Router
const AppWrapper: React.FC = () => {
  return (
    <Router>
      <App />
    </Router>
  );
};

export default AppWrapper;
