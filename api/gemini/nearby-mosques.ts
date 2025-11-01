import { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const ai = new GoogleGenAI({
  apiKey: GEMINI_API_KEY,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (!GEMINI_API_KEY) {
    return res.status(503).json({ error: 'Gemini API not configured' });
  }

  try {
    const { latitude, longitude, city } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Missing coordinates' });
    }

    console.log(`🕌 [Vercel] Finding mosques for ${latitude}, ${longitude}${city ? ` (${city})` : ''}`);
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

    console.log(`🕌 [Vercel] Response received in ${Date.now() - startTime}ms:`, content.substring(0, 100));

    // Parse JSON
    let mosques;
    try {
      const cleanContent = content
        .replace(/```json\n?|\n?```/g, '')
        .replace(/```\n?|\n?```/g, '')
        .trim();

      mosques = JSON.parse(cleanContent);

      if (Array.isArray(mosques)) {
        console.log(`🕌 [Vercel] Got array of ${mosques.length} mosques`);
      } else if (typeof mosques === 'object' && mosques !== null && 'mosques' in mosques) {
        console.log(`🕌 [Vercel] Got object with mosques property`);
      } else if (typeof mosques === 'object' && mosques !== null) {
        console.log(`🕌 [Vercel] Got object, wrapping`);
        mosques = { mosques: mosques };
      }
    } catch (parseError) {
      console.error(`🕌 [Vercel] JSON parse failed:`, parseError);
      mosques = { mosques: [], raw: content, error: 'Failed to parse Gemini response' };
    }

    const finalResponse = Array.isArray(mosques)
      ? { mosques }
      : typeof mosques === 'object' && mosques !== null
        ? mosques
        : { mosques: [], error: 'Invalid response format' };

    console.log(`🕌 [Vercel] Sending response (${Date.now() - startTime}ms total)`);
    return res.json(finalResponse);
  } catch (error) {
    console.error('🕌 [Vercel] Error:', error);
    return res.status(500).json({
      error: 'Failed to find nearby mosques',
      details: String(error),
    });
  }
}
