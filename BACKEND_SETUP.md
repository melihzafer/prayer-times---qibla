# 🔐 Gemini API Backend Setup Guide

## Overview

The Prayer Times & Qibla application uses **Google Gemini AI** for advanced features like translation, nearby mosque finding, and Islamic event information. To keep your API keys **secure**, all Gemini API calls go through a **backend server** instead of being exposed in the client.

**Architecture:**
```
Client (React/Vite)
    ↓
Backend API Server (Express)
    ↓ (API KEY HERE - NEVER IN CLIENT)
Google Gemini API
```

---

## ⚙️ Setup Instructions

### Step 1: Create a Google Gemini API Key

1. Go to: https://console.cloud.google.com/
2. Create a new project or select existing one
3. Enable the **Generative Language API**
4. Go to **APIs & Services → Credentials**
5. Click **Create Credentials → API Key**
6. Copy the key (keep it private!)

### Step 2: Store the Key Locally

**Create `.env.local` file in the project root:**

```bash
GEMINI_API_KEY=your_actual_api_key_here
VITE_API_URL=http://localhost:3001
```

**Important:**
- ✅ `.env.local` is in `.gitignore` — will NOT be committed
- ✅ Only exists on your local machine
- ❌ Never share this file
- ❌ Never commit it to Git

### Step 3: Install Dependencies

```bash
npm install
```

This installs backend dependencies:
- `express` — API server framework
- `cors` — Enable cross-origin requests
- `dotenv` — Load environment variables
- `concurrently` — Run dev server + API server together

### Step 4: Run Development Environment

**Option A: Run dev server and API server together (recommended)**

```bash
npm run dev:all
```

This starts:
- 🎨 Vite dev server: http://localhost:5173
- 🔧 API server: http://localhost:3001

**Option B: Run individually**

Terminal 1 (Frontend):
```bash
npm run dev
```

Terminal 2 (Backend):
```bash
npm run dev:api
```

### Step 5: Verify Setup

Check the backend is running:

```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-10-31T...",
  "geminiAvailable": true
}
```

---

## 📡 API Endpoints

The backend provides these secure endpoints:

### 1. **POST /api/gemini/translate**
Translates text to another language.

**Request:**
```bash
curl -X POST http://localhost:3001/api/gemini/translate \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello", "targetLanguage": "Arabic"}'
```

**Response:**
```json
{
  "translatedText": "مرحبا"
}
```

### 2. **POST /api/gemini/nearby-mosques**
Finds nearby mosques using coordinates.

**Request:**
```bash
curl -X POST http://localhost:3001/api/gemini/nearby-mosques \
  -H "Content-Type: application/json" \
  -d '{"latitude": 40.7128, "longitude": -74.0060}'
```

**Response:**
```json
{
  "mosques": [
    {
      "name": "Islamic Center of New York",
      "address": "...",
      "distance": "0.5 km"
    }
  ]
}
```

### 3. **POST /api/gemini/event-info**
Gets information about Islamic events.

**Request:**
```bash
curl -X POST http://localhost:3001/api/gemini/event-info \
  -H "Content-Type: application/json" \
  -d '{"eventName": "Ramadan", "languageCode": "en"}'
```

**Response:**
```json
{
  "information": "Ramadan is the ninth month of the Islamic calendar..."
}
```

### 4. **POST /api/gemini/name-info**
Gets information about Islamic names.

**Request:**
```bash
curl -X POST http://localhost:3001/api/gemini/name-info \
  -H "Content-Type: application/json" \
  -d '{"name": "Muhammad", "meaning": "Praised", "languageCode": "en"}'
```

**Response:**
```json
{
  "information": "Muhammad is the name of the Prophet and means..."
}
```

---

## 🛡️ Security Features

✅ **API Key Never Exposed to Client**
- Stored in `.env.local` (server-side only)
- Never injected into JavaScript bundle
- Cannot be seen in browser Network tab

✅ **CORS Protected**
- Only accepts requests from your frontend
- Prevents external abuse of your API

✅ **Error Handling**
- API key not configured? Returns 503 error
- Invalid request? Returns 400 error
- Server errors logged safely

✅ **Environment Isolation**
- Development: Different settings than production
- `.env.local` never committed to Git
- Easy to rotate keys

---

## 📦 Deployment

### Local Testing
```bash
npm run dev:all
```

### Production Build
```bash
npm run build
npm run build:api  # Type-check API code
```

### Deploy to Vercel

1. Push code to GitHub (`.env.local` is in `.gitignore`, won't be pushed)
2. Connect repo to Vercel
3. Add environment variables in Vercel dashboard:
   - `GEMINI_API_KEY=your_actual_key`
   - `NODE_ENV=production`
4. Deploy! Vercel will run API as serverless functions

**Vercel Configuration** (automatic):
```
frontend: /
api: /api/
```

### Deploy to Custom Server

If using your own server (AWS, DigitalOcean, etc.):

1. Deploy both frontend and backend
2. Set environment variables on server
3. Point client to your backend URL
4. Update `VITE_API_URL` in `.env.local`

---

## 🧪 Testing

Tests mock the API endpoints, so no real key is needed:

```bash
npm test
```

---

## ⚠️ Common Issues

### "Cannot find module 'express'"
**Solution:** Run `npm install`

### "Gemini API not configured" (503 error)
**Solution:** Check `.env.local` exists and has valid `GEMINI_API_KEY`

### API server not starting
**Solution:** Ensure port 3001 is free, or change `API_PORT` in `.env.local`

### CORS errors in browser
**Solution:** Ensure `VITE_API_URL` points to correct backend URL (http://localhost:3001 for dev)

---

## 📚 How It Works

### Client-Side (React)

```typescript
// Instead of exposing API key:
import { translateText } from './services/api';

// Client just calls the backend endpoint:
const result = await translateText('Hello', 'Arabic');
```

### Server-Side (Express)

```typescript
// Backend receives the request
app.post('/api/gemini/translate', async (req, res) => {
  // Server has access to the secret API key
  const key = process.env.GEMINI_API_KEY;
  
  // Call Gemini API with the key (safely on server)
  const response = await fetch('https://generativelanguage.googleapis.com/...', {
    headers: { 'x-goog-api-key': key }
  });
  
  // Return result to client
  res.json(result);
});
```

**Result:** API key is never exposed to the browser! ✅

---

## 🔄 Environment Variables Checklist

### Development (`.env.local`)
- [ ] `GEMINI_API_KEY` set to your actual key
- [ ] `VITE_API_URL=http://localhost:3001`

### Production (Vercel/Server)
- [ ] `GEMINI_API_KEY` set in deployment platform
- [ ] `VITE_API_URL` set to production backend URL
- [ ] `NODE_ENV=production`

---

## 📞 Support

If you encounter issues:

1. Check that backend is running: `curl http://localhost:3001/health`
2. Check `.env.local` has valid `GEMINI_API_KEY`
3. Check CORS is not blocking requests (look for 403 errors)
4. Check server logs for detailed errors

---

**You're all set!** Your Gemini API integration is now secure and production-ready. 🎉

