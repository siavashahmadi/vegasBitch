import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

// Password validation
export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  if (!/[!@#$%^&*]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&*)');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Rate limiting middleware
export const createUserLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 5, // limit each IP to 5 requests per windowMs
  message: { error: 'Too many account creation attempts. Please try again in an hour.' }
});

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: 5, // limit each IP to 5 login attempts per windowMs
  message: { error: 'Too many login attempts. Please try again in 15 minutes.' }
});

// Authentication middleware
export const authenticateUser = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ 
      error: 'Unauthorized',
      details: 'No authentication token provided'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ 
        error: 'Unauthorized',
        details: 'Invalid or expired token'
      });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    return res.status(500).json({ 
      error: 'Authentication error',
      details: 'Failed to verify authentication token'
    });
  }
};

// Error handling utilities
export const handleAuthError = (error: any) => {
  if (error.message?.includes('Email already registered')) {
    return {
      status: 409,
      error: 'Email already registered',
      details: 'This email address is already associated with an account'
    };
  }
  
  if (error.message?.includes('Invalid login credentials')) {
    return {
      status: 401,
      error: 'Invalid credentials',
      details: 'The email or password you entered is incorrect'
    };
  }

  // Default error
  return {
    status: 500,
    error: 'Authentication error',
    details: 'An unexpected error occurred during authentication'
  };
};

// Types
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
} 