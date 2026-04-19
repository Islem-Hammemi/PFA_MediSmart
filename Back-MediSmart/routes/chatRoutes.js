// ============================================================
//  routes/chatRoutes.js
//  Mount in app.js as: app.use('/api/chat', chatRoutes);
// ============================================================

const express = require('express');
const router  = express.Router();

// ✅ openrouter/free = auto-selects any working free model
// Fallbacks if it ever fails: meta-llama/llama-3.3-70b-instruct:free
//                              google/gemma-3-27b-it:free
//                              deepseek/deepseek-r1:free
const MODEL = 'openrouter/free';

router.post('/', async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages array required.' });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      console.error('[chatRoutes] OPENROUTER_API_KEY not set in .env');
      return res.status(500).json({ error: 'API key not configured on server.' });
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type':  'application/json',
        'HTTP-Referer':  'http://localhost:5173',
        'X-Title':       'MediSmart AI',
      },
      body: JSON.stringify({
        model:       MODEL,
        messages:    messages,
        max_tokens:  400,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('[chatRoutes] OpenRouter error:', response.status, errText);
      return res.status(502).json({ error: 'OpenRouter request failed.', detail: errText });
    }

    const data = await response.json();
    return res.json(data);

  } catch (err) {
    console.error('[chatRoutes] Unexpected error:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;