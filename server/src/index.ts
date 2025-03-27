import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { createServer } from 'http';
import { setupWebSocket } from './websocket';
import { uploadFile, deleteFile, upload } from './fileUpload';
import { validatePassword, createUserLimiter, loginLimiter, authenticateUser, handleAuthError } from './auth';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;
const httpServer = createServer(app);

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize admin Supabase client with service role key
const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Middleware
app.use(cors());
app.use(express.json());

// Admin authentication middleware
const ADMIN_API_KEY = process.env.ADMIN_API_KEY || 'your-secure-admin-key';
const authenticateAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const apiKey = req.headers['x-admin-api-key'];
  
  if (!apiKey || apiKey !== ADMIN_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized: Invalid admin API key' });
  }
  
  next();
};

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Chat endpoints
app.get('/api/chat/messages', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('timestamp', { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

app.post('/api/chat/messages', async (req, res) => {
  try {
    const { sender, text, isLocation, location, isVoiceMemo, voiceMemoUrl, isPhoto, photoUrl } = req.body;
    
    const { data, error } = await supabase
      .from('messages')
      .insert([
        {
          sender,
          text,
          is_location: isLocation,
          location,
          is_voice_memo: isVoiceMemo,
          voice_memo_url: voiceMemoUrl,
          is_photo: isPhoto,
          photo_url: photoUrl,
          timestamp: new Date().toISOString()
        }
      ])
      .select();

    if (error) throw error;
    res.json(data[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// File upload endpoints
app.post('/api/upload', upload.single('file'), uploadFile);
app.delete('/api/upload/:filePath', deleteFile);

// Wellness endpoints
app.get('/api/wellness/metrics', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('wellness_metrics')
      .select('*');

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch wellness metrics' });
  }
});

app.put('/api/wellness/metrics', async (req, res) => {
  try {
    const { person, metrics } = req.body;
    
    const { data, error } = await supabase
      .from('wellness_metrics')
      .upsert([
        {
          person,
          ...metrics,
          updated_at: new Date().toISOString()
        }
      ])
      .select();

    if (error) throw error;
    res.json(data[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update wellness metrics' });
  }
});

// Additional endpoints for other features
app.get('/api/itinerary', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('itinerary')
      .select('*')
      .order('date', { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch itinerary' });
  }
});

app.post('/api/itinerary', async (req, res) => {
  try {
    const { date, activity, location, time } = req.body;
    
    const { data, error } = await supabase
      .from('itinerary')
      .insert([
        {
          date,
          activity,
          location,
          time,
          created_at: new Date().toISOString()
        }
      ])
      .select();

    if (error) throw error;
    res.json(data[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create itinerary item' });
  }
});

// Poll endpoints
app.get('/api/polls', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('polls')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch polls' });
  }
});

app.post('/api/polls', async (req, res) => {
  try {
    const { question, options, creator } = req.body;
    
    const { data, error } = await supabase
      .from('polls')
      .insert([
        {
          question,
          options,
          creator,
          votes: {},
          is_active: true,
          created_at: new Date().toISOString()
        }
      ])
      .select();

    if (error) throw error;
    res.json(data[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create poll' });
  }
});

app.post('/api/polls/:id/vote', async (req, res) => {
  try {
    const { id } = req.params;
    const { person, optionIndex } = req.body;
    
    const { data: poll, error: pollError } = await supabase
      .from('polls')
      .select('votes')
      .eq('id', id)
      .single();

    if (pollError) throw pollError;

    const votes = poll.votes || {};
    votes[person] = optionIndex;

    const { data, error } = await supabase
      .from('polls')
      .update({ votes })
      .eq('id', id)
      .select();

    if (error) throw error;
    res.json(data[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to vote on poll' });
  }
});

// Admin Authentication endpoints
app.post('/api/admin/create-user', authenticateAdmin, createUserLimiter, async (req, res) => {
  try {
    const { email, password, userData } = req.body;

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        error: 'Invalid password',
        details: passwordValidation.errors
      });
    }
    
    // Create the user
    const { data: user, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });

    if (createError) {
      const errorResponse = handleAuthError(createError);
      return res.status(errorResponse.status).json(errorResponse);
    }

    // If additional user data needs to be stored
    if (userData) {
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert([
          {
            id: user.user.id,
            ...userData,
            created_at: new Date().toISOString()
          }
        ]);

      if (profileError) {
        console.error('Error creating profile:', profileError);
        return res.status(500).json({
          error: 'Failed to create user profile',
          details: 'User account created but profile data could not be saved'
        });
      }
    }

    res.json({ 
      message: 'User created successfully',
      user: user.user
    });
  } catch (error) {
    const errorResponse = handleAuthError(error);
    res.status(errorResponse.status).json(errorResponse);
  }
});

// Authentication endpoints
app.post('/api/auth/login', loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      const errorResponse = handleAuthError(error);
      return res.status(errorResponse.status).json(errorResponse);
    }

    // Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
    }

    res.json({
      session: data.session,
      user: {
        ...data.user,
        profile: profile || null
      }
    });
  } catch (error) {
    const errorResponse = handleAuthError(error);
    res.status(errorResponse.status).json(errorResponse);
  }
});

app.post('/api/auth/logout', authenticateUser, async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) throw error;
    
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ 
      error: 'Logout failed',
      details: 'Failed to sign out user'
    });
  }
});

app.get('/api/auth/user', authenticateUser, async (req, res) => {
  try {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
    }

    res.json({
      user: {
        ...req.user,
        profile: profile || null
      }
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Profile fetch failed',
      details: 'Failed to retrieve user profile'
    });
  }
});

// Protect all API routes that require authentication
app.use('/api/chat', authenticateUser);
app.use('/api/wellness', authenticateUser);
app.use('/api/itinerary', authenticateUser);
app.use('/api/polls', authenticateUser);

// Setup WebSocket
setupWebSocket(httpServer);

// Start server
httpServer.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 