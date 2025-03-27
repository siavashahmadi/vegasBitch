import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { authService } from '../services/auth';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await authService.login(email, password);
      navigate('/chat'); // Redirect to chat after successful login
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cyber-black p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-cyber-dark/80 backdrop-blur-md p-8 rounded-lg border border-cyber-blue/30 shadow-lg">
          <div className="text-center mb-8">
            <motion.h1
              className="text-4xl font-bold text-cyber-blue mb-2"
              animate={{ 
                textShadow: [
                  "0 0 7px #05D9E8",
                  "0 0 10px #05D9E8",
                  "0 0 21px #05D9E8",
                  "0 0 42px #05D9E8",
                  "0 0 82px #05D9E8",
                  "0 0 92px #05D9E8",
                  "0 0 102px #05D9E8",
                  "0 0 151px #05D9E8"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
            >
              VEGAS CREW
            </motion.h1>
            <p className="text-cyber-pink">Access Terminal</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-cyber-blue mb-2 text-sm" htmlFor="email">
                EMAIL
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 bg-black/50 border border-cyber-blue/30 rounded-md text-white focus:outline-none focus:border-cyber-pink focus:ring-1 focus:ring-cyber-pink transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-cyber-blue mb-2 text-sm" htmlFor="password">
                PASSWORD
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-black/50 border border-cyber-blue/30 rounded-md text-white focus:outline-none focus:border-cyber-pink focus:ring-1 focus:ring-cyber-pink transition-colors"
                required
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-500 text-sm bg-red-500/10 border border-red-500/30 p-3 rounded"
              >
                {error}
              </motion.div>
            )}

            <motion.button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 rounded-md text-white font-semibold relative overflow-hidden ${
                isLoading ? 'bg-cyber-blue/50' : 'bg-cyber-blue hover:bg-cyber-blue/80'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isLoading ? (
                <motion.div
                  className="absolute inset-0 bg-cyber-blue"
                  animate={{
                    x: ["-100%", "100%"]
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
              ) : null}
              <span className="relative z-10">
                {isLoading ? 'ACCESSING...' : 'LOGIN'}
              </span>
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Login; 