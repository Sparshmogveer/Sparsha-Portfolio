export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { text, language } = req.body;
    const langName = language === 'kn' ? 'Kannada' : 'Hindi';

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        max_tokens: 1000,
        temperature: 0.1,
        messages: [{
          role: 'user',
          content: `Translate the following text to ${langName}. Return ONLY the translated text, nothing else. Keep any HTML tags, emojis, symbols, names (Sparsha B T, NammaQA, etc), technical terms (Python, React, ML, AI, CGPA), numbers, and dates exactly as they are — only translate the natural language words.\n\nText to translate:\n${text}`
        }]
      }),
    });

    const data = await response.json();
    const translated = data.choices?.[0]?.message?.content?.trim() || text;
    return res.status(200).json({ translated });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}