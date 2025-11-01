import { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const ai = new GoogleGenAI({
  apiKey: GEMINI_API_KEY,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (!GEMINI_API_KEY) {
    return res.status(503).json({ error: 'Gemini API not configured' });
  }

  try {
    const { name, meaning, languageCode } = req.body;

    if (!name || !meaning) {
      return res.status(400).json({ error: 'Missing name or meaning' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Provide detailed information about the Islamic name "${name}" (meaning: ${meaning}) in ${languageCode || 'English'}. Include: Arabic origin, significance in Islam, and historical usage.`,
    });

    const information = response.text || '';

    return res.json({ information });
  } catch (error) {
    console.error('Name info error:', error);
    return res.status(500).json({ error: 'Failed to get name information', details: String(error) });
  }
}
