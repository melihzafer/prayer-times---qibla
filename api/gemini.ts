/**
 * Gemini API Backend Server
 * 
 * This server provides secure API endpoints for Gemini AI features.
 * The GEMINI_API_KEY is kept server-side only and never exposed to clients.
 * 
 * Usage:
 *   npm run dev:api
 * 
 * This will start the server on http://localhost:3001
 */

import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

// Load environment variables
dotenv.config();

const app: Express = express();
const PORT = process.env.API_PORT || 3001;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Initialize Gemini AI client
const ai = new GoogleGenAI({
  apiKey: GEMINI_API_KEY,
});

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.CLIENT_URL 
    : 'http://localhost:3000', // Vite default port
  credentials: true,
}));
app.use(express.json());

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    geminiAvailable: !!GEMINI_API_KEY,
  });
});

/**
 * POST /api/gemini/translate
 * Translates text using Gemini API
 */
app.post('/api/gemini/translate', async (req: Request, res: Response) => {
  try {
    if (!GEMINI_API_KEY) {
      return res.status(503).json({ error: 'Gemini API not configured' });
    }

    const { text, targetLanguage } = req.body;

    if (!text || !targetLanguage) {
      return res.status(400).json({ error: 'Missing text or targetLanguage' });
    }

    // Call Gemini API using SDK
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: `Translate the following text to ${targetLanguage}:\n\n${text}`,
    });

    // Extract text from response safely
    let translatedText = '';
    if (response && typeof response.text === 'string') {
      translatedText = response.text;
    } else if (response?.candidates?.[0]?.content?.parts?.[0]) {
      const part = response.candidates[0].content.parts[0];
      translatedText = (part as any).text || '';
    }

    res.json({ translatedText });
  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({ error: 'Translation failed', details: String(error) });
  }
});

/**
 * POST /api/gemini/nearby-mosques
 * Finds nearby mosques using Gemini API
 */
app.post('/api/gemini/nearby-mosques', async (req: Request, res: Response) => {
  try {
    if (!GEMINI_API_KEY) {
      return res.status(503).json({ error: 'Gemini API not configured' });
    }

    const { latitude, longitude, city } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Missing coordinates' });
    }

    console.log(`🕌 [Backend] Finding mosques for ${latitude}, ${longitude}${city ? ` (${city})` : ''}`);
    const startTime = Date.now();

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-lite',
      contents: `List ${city || 'nearby'} mosques near (${latitude}, ${longitude}) in JSON format only: [{"name":"","address":"","distance":"","uri":""}]. Include Google Maps URI for each mosque. Just the array, no markdown.`,
    });

    // Extract text from response safely
    let content = '';
    if (response && typeof response.text === 'string') {
      content = response.text;
    } else if (response?.candidates?.[0]?.content?.parts?.[0]) {
      const part = response.candidates[0].content.parts[0];
      content = (part as any).text || '';
    }

    console.log(`🕌 [Backend] Gemini response received in ${Date.now() - startTime}ms:`, content);

    // Try to parse as JSON, fallback to raw text
    let mosques;
    try {
      // Handle markdown code blocks and clean up
      const cleanContent = content
        .replace(/```json\n?|\n?```/g, '') // Remove markdown code blocks
        .replace(/```\n?|\n?```/g, '') // Remove other code blocks
        .trim();
      
      console.log(`🕌 [Backend] Cleaned content:`, cleanContent);
      
      mosques = JSON.parse(cleanContent);
      
      // If parsed result is an array, keep it as-is
      // If it's an object, check if it has a mosques property
      if (Array.isArray(mosques)) {
        console.log(`🕌 [Backend] Got array of ${mosques.length} mosques`);
      } else if (typeof mosques === 'object' && mosques !== null && 'mosques' in mosques) {
        console.log(`🕌 [Backend] Got object with mosques property`);
        // Already in correct format
      } else if (typeof mosques === 'object' && mosques !== null) {
        console.log(`🕌 [Backend] Got object, wrapping in mosques property`);
        mosques = { mosques: mosques };
      }
    } catch (parseError) {
      console.error(`🕌 [Backend] JSON parse failed:`, parseError);
      console.error(`🕌 [Backend] Raw content was:`, content);
      mosques = { mosques: [], raw: content, error: 'Failed to parse Gemini response' };
    }

    // Ensure response always has { mosques: [...] } format
    const finalResponse = Array.isArray(mosques) 
      ? { mosques }
      : (typeof mosques === 'object' && mosques !== null)
      ? mosques
      : { mosques: [], error: 'Invalid response format' };

    console.log(`🕌 [Backend] Sending response (${Date.now() - startTime}ms total):`, finalResponse);
    res.json(finalResponse);
  } catch (error) {
    console.error('Nearby mosques error:', error);
    res.status(500).json({ error: 'Failed to find nearby mosques', details: String(error) });
  }
});

/**
 * POST /api/gemini/event-info
 * Gets information about Islamic events
 */
app.post('/api/gemini/event-info', async (req: Request, res: Response) => {
  try {
    if (!GEMINI_API_KEY) {
      return res.status(503).json({ error: 'Gemini API not configured' });
    }

    const { eventName, languageCode } = req.body;

    if (!eventName) {
      return res.status(400).json({ error: 'Missing eventName' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Provide information about the Islamic event "${eventName}" in ${languageCode || 'English'}. Include: date, significance, and traditions.`,
    });

    // Extract text from response safely
    let information = '';
    if (response && typeof response.text === 'string') {
      information = response.text;
    } else if (response?.candidates?.[0]?.content?.parts?.[0]) {
      const part = response.candidates[0].content.parts[0];
      information = (part as any).text || '';
    }

    res.json({ information });
  } catch (error) {
    console.error('Event info error:', error);
    res.status(500).json({ error: 'Failed to get event information', details: String(error) });
  }
});

/**
 * POST /api/gemini/name-info
 * Gets information about Islamic names
 */
app.post('/api/gemini/name-info', async (req: Request, res: Response) => {
  try {
    if (!GEMINI_API_KEY) {
      return res.status(503).json({ error: 'Gemini API not configured' });
    }

    const { name, meaning, languageCode } = req.body;

    if (!name || !meaning) {
      return res.status(400).json({ error: 'Missing name or meaning' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Provide detailed information about the Islamic name "${name}" (meaning: ${meaning}) in ${languageCode || 'English'}. Include: Arabic origin, significance in Islam, and historical usage.`,
    });

    const information = response.text || '';

    res.json({ information });
  } catch (error) {
    console.error('Name info error:', error);
    res.status(500).json({ error: 'Failed to get name information' });
  }
});

// Error handler
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════╗
║  Gemini API Backend Server Started 🚀      ║
╚════════════════════════════════════════════╝

📍 Server running on: http://localhost:${PORT}
🔐 Gemini API: ${GEMINI_API_KEY ? '✅ Configured' : '❌ Not configured'}

Available endpoints:
  POST /api/gemini/translate
  POST /api/gemini/nearby-mosques
  POST /api/gemini/event-info
  POST /api/gemini/name-info
  GET  /health

Environment: ${process.env.NODE_ENV || 'development'}
  `);
});

export default app;
