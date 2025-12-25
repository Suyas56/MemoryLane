
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Ensure we load the `.env` file that sits next to this server file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { GoogleGenAI } from '@google/genai';
import { User, MemoryEvent } from './models.js';
import LRUCache from './lru.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// Allow larger payloads for inline photo uploads; if still too big, prefer Cloudinary upload instead of base64 bodies
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

// Robust CORS for Vercel + Render + Localhost variations
const allowedOrigins = [
  'http://localhost:5173', 
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://localhost:3001',
  process.env.FRONTEND_URL, 
  process.env.FRONTEND_URL?.replace(/\/$/, "") // Handle potential trailing slash from env
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log("Blocked CORS for origin:", origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// DSA: Initialize LRU Cache (Capacity 50)
const eventCache = new LRUCache(50);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/memorylane')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB error:', err));

// --- Auth Middleware ---
const authenticateToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// --- Routes ---

// 1. Auth
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'Email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();
    
    const token = jwt.sign({ id: user._id, name: user.name }, process.env.JWT_SECRET);
    res.cookie('token', token, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    }).json({ user: { id: user._id, name, email } });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'User not found' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: 'Invalid password' });

    const token = jwt.sign({ id: user._id, name: user.name }, process.env.JWT_SECRET);
    res.cookie('token', token, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    }).json({ user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token', { 
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  }).json({ message: 'Logged out' });
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  res.json(user);
});

// 2. Events (CRUD + DSA)

// GET Event by ID (Public + LRU Cache)
app.get('/api/events/:id', async (req, res) => {
  const { id } = req.params;

  // Check Cache (O(1))
  const cached = eventCache.get(id);
  if (cached) {
    console.log(`Cache HIT for ${id}`);
    return res.json(cached);
  }

  try {
    console.log(`Cache MISS for ${id} - Fetching DB`);
    const event = await MemoryEvent.findById(id);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    
    // Convert to plain object and ensure photos are properly serialized
    const eventObj = event.toObject();
    if (eventObj.photos && Array.isArray(eventObj.photos)) {
      eventObj.photos = eventObj.photos.map(photo => ({
        id: photo.id || crypto.randomUUID(),
        url: photo.url,
        width: photo.width || 1000,
        height: photo.height || 750,
        aspectRatio: photo.aspectRatio || (photo.width && photo.height ? photo.width / photo.height : 4 / 3),
        caption: photo.caption || undefined
      }));
    } else {
      eventObj.photos = [];
    }
    
    // Store in Cache
    eventCache.put(id, eventObj);
    res.json(eventObj);
  } catch (err) {
    console.error('Error fetching event:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create Event
app.post('/api/events', authenticateToken, async (req, res) => {
  try {
    const photos = Array.isArray(req.body.photos) ? req.body.photos : [];
    
    const validPhotos = photos
      .filter(photo => photo && photo.url)
      .map(photo => ({
        id: photo.id || crypto.randomUUID(),
        url: photo.url,
        width: photo.width || 1000,
        height: photo.height || 750,
        aspectRatio: photo.aspectRatio || (photo.width && photo.height ? photo.width / photo.height : 4 / 3),
        caption: photo.caption || undefined
      }));

    const event = new MemoryEvent({
      title: req.body.title,
      occasion: req.body.occasion,
      recipientName: req.body.recipientName,
      message: req.body.message,
      photos: validPhotos,
      theme: req.body.theme || 'modern',
      userId: req.user.id,
      shareCode: crypto.randomUUID(),
      isPublic: true,
      views: 0,
      likes: 0,
      createdAt: Date.now()
    });
    await event.save();
    
    // Warm cache
    eventCache.put(event._id.toString(), event.toObject());
    
    // Return full event object
    const eventObj = event.toObject();
    res.json({ ...eventObj, _id: event._id.toString(), id: event._id.toString() });
  } catch (err) {
    console.error('Error creating event:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get User's Events
app.get('/api/my-events', authenticateToken, async (req, res) => {
  const events = await MemoryEvent.find({ userId: req.user.id }).sort({ createdAt: -1 });
  res.json(events);
});

// Delete Event
app.delete('/api/events/:id', authenticateToken, async (req, res) => {
  try {
    console.log(`[DELETE] Attempting to delete event ${req.params.id} by user ${req.user.id}`);
    const event = await MemoryEvent.findById(req.params.id);
    if (!event) {
      console.log(`[DELETE] Event ${req.params.id} not found`);
      return res.status(404).json({ error: 'Event not found' });
    }
    
    console.log(`[DELETE] Event userId: ${event.userId}, Request userId: ${req.user.id}`);
    
    // Check if user owns this event (compare as strings)
    if (event.userId.toString() !== req.user.id.toString()) {
      console.log(`[DELETE] User ${req.user.id} not authorized to delete event owned by ${event.userId}`);
      return res.status(403).json({ error: 'Not authorized to delete this event' });
    }
    
    await MemoryEvent.findByIdAndDelete(req.params.id);
    eventCache.put(req.params.id, null); // Invalidate cache
    console.log(`[DELETE] Event ${req.params.id} deleted successfully`);
    res.json({ success: true, message: 'Event deleted successfully' });
  } catch (err) {
    console.error('[DELETE] Error deleting event:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update Event
app.put('/api/events/:id', authenticateToken, async (req, res) => {
  try {
    console.log(`[UPDATE] Attempting to update event ${req.params.id} by user ${req.user.id}`);
    const event = await MemoryEvent.findById(req.params.id);
    if (!event) {
      console.log(`[UPDATE] Event ${req.params.id} not found`);
      return res.status(404).json({ error: 'Event not found' });
    }
    
    console.log(`[UPDATE] Event userId: ${event.userId}, Request userId: ${req.user.id}`);
    
    // Check if user owns this event (compare as strings)
    if (event.userId.toString() !== req.user.id.toString()) {
      console.log(`[UPDATE] User ${req.user.id} not authorized to edit event owned by ${event.userId}`);
      return res.status(403).json({ error: 'Not authorized to edit this event' });
    }
    
    // Validate and sanitize photos
    const photos = Array.isArray(req.body.photos) ? req.body.photos : [];
    const validPhotos = photos
      .filter(photo => photo && photo.url)
      .map(photo => ({
        id: photo.id || crypto.randomUUID(),
        url: photo.url,
        width: photo.width || 1000,
        height: photo.height || 750,
        aspectRatio: photo.aspectRatio || (photo.width && photo.height ? photo.width / photo.height : 4 / 3),
        caption: photo.caption || undefined
      }));
    
    const updatedEvent = await MemoryEvent.findByIdAndUpdate(
      req.params.id,
      {
        title: req.body.title,
        occasion: req.body.occasion,
        recipientName: req.body.recipientName,
        message: req.body.message,
        photos: validPhotos,
        theme: req.body.theme || 'modern'
      },
      { new: true }
    );
    
    // Update cache
    eventCache.put(req.params.id, updatedEvent.toObject());
    console.log(`[UPDATE] Event ${req.params.id} updated successfully`);
    res.json({ ...updatedEvent.toObject(), _id: updatedEvent._id.toString(), id: updatedEvent._id.toString() });
  } catch (err) {
    console.error('[UPDATE] Error updating event:', err);
    res.status(500).json({ error: err.message });
  }
});

// Increment View
app.post('/api/events/:id/view', async (req, res) => {
  try {
    await MemoryEvent.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
    // Invalidate/Update cache
    const event = await MemoryEvent.findById(req.params.id);
    if(event) eventCache.put(req.params.id, event.toObject());
    res.json({ success: true });
  } catch(e) {
    res.status(500).send();
  }
});

// Toggle Like
app.post('/api/events/:id/like', async (req, res) => {
  try {
    await MemoryEvent.findByIdAndUpdate(req.params.id, { $inc: { likes: 1 } });
    const event = await MemoryEvent.findById(req.params.id);
    if(event) eventCache.put(req.params.id, event.toObject());
    res.json({ success: true });
  } catch(e) {
    res.status(500).send();
  }
});

// 3. Search & Ranking (Backend DSA)
app.get('/api/search', authenticateToken, async (req, res) => {
  const { q } = req.query;
  if (!q) return res.json([]);

  const normalized = q.toLowerCase();
  
  // Fetch candidates
  const events = await MemoryEvent.find({ userId: req.user.id });
  
  // Custom Ranking Algorithm
  // Score = (Views * 1) + (Likes * 2)
  // Filter = Prefix match
  const results = events
    .filter(e => 
      e.title.toLowerCase().includes(normalized) || 
      e.recipientName.toLowerCase().includes(normalized) ||
      e.occasion.toLowerCase().includes(normalized)
    )
    .map(e => ({
      event: e,
      score: (e.views * 1) + (e.likes * 2)
    }))
    .sort((a, b) => b.score - a.score);

  res.json(results);
});

// 4. Gemini AI
app.post('/api/ai/generate', authenticateToken, async (req, res) => {
  const { prompt } = req.body;
  
  // Support both GEMINI_API_KEY and GOOGLE_API_KEY for backward compatibility
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  
  if (!apiKey) {
    return res.status(500).json({ error: "Server missing API Key" });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    res.json({ text: response.text });
  } catch (error) {
    console.error("Gemini Error", error);
    res.status(500).json({ error: "Failed to generate text" });
  }
});

// Health check endpoint for deployment testing
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/', (req, res) => {
  res.json({ 
    message: 'MemoryLane API', 
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth/*',
      events: '/api/events/*',
      ai: '/api/ai/*'
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
