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
    const { eventName, languageCode } = req.body;

    if (!eventName) {
      return res.status(400).json({ error: 'Missing eventName' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Provide information about the Islamic event "${eventName}" in ${languageCode || 'English'}. Include: date, significance, and traditions.`,
    });

    let information = '';
    if (response && typeof response.text === 'string') {
      information = response.text;
    } else if (response?.candidates?.[0]?.content?.parts?.[0]) {
      const part = response.candidates[0].content.parts[0];
      information = (part as any).text || '';
    }

    return res.json({ information });
  } catch (error) {
    console.error('Event info error:', error);
    return res.status(500).json({ error: 'Failed to get event information', details: String(error) });
  }
}
