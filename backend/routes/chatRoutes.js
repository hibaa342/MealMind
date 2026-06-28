// routes/chatRoutes.js
// ─── Chatbot proxy route → Groq (free LLM API) ────────────────────────────
const express = require('express');
const router  = express.Router();

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL        = 'llama-3.3-70b-versatile';

const SYSTEM_PROMPT = `You are a helpful voice assistant for a Moroccan food app called MealMind.
You support Darija, French, and English — always reply in the user's language.
Keep spoken replies short (2–3 sentences).

SPECIAL RULE — RECIPES:
If the user asks for a recipe (any food, any language), do NOT reply in plain text.
Instead, reply with ONLY a valid JSON object in this exact format, nothing else:

{
  "type": "recipe",
  "title": "Recipe name",
  "description": "One line description",
  "servings": 4,
  "ingredients": [
    { "id": "0001", "name": "ingredient name", "amount": 2, "unit": "cup" }
  ],
  "steps": [
    { "id": "s1", "title": "Step title", "content": "Full instruction here.", "timer_seconds": 300 }
  ],
  "notes": "Optional tips"
}

Units allowed: g, kg, ml, l, tsp, tbsp, cup, fl_oz, oz, lb — or omit unit for whole items.
For timer_seconds: only add it if the step involves waiting (cooking, baking, resting). Omit otherwise.
Do NOT wrap the JSON in markdown code fences. Output raw JSON only.`;

/**
 * POST /api/chat
 * Body:    { message: string }
 * Returns: { reply: string }
 */
router.post('/', async (req, res) => {
    const { message } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
        return res.status(400).json({ error: 'message field is required.' });
    }

    const apiKey = (process.env.GROQ_API_KEY || '').trim().replace(/^['"]|['"]$/g, '');

    if (!apiKey || apiKey === 'YOUR_GROQ_API_KEY_HERE') {
        console.error('[chat] GROQ_API_KEY not set — get a free key at https://console.groq.com/keys');
        return res.status(500).json({
            error: 'Groq API key not configured. Add GROQ_API_KEY to backend/.env — free at console.groq.com/keys',
        });
    }

    console.log(`[chat] model=${MODEL} msg="${message.substring(0, 60)}"`);

    try {
        const response = await fetch(GROQ_API_URL, {
            method:  'POST',
            headers: {
                'Content-Type':  'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model:       MODEL,
                max_tokens:  1024,
                temperature: 0.7,
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
                    { role: 'user',   content: message.trim() },
                ],
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            const errMsg = data?.error?.message || `Groq API error ${response.status}`;
            console.error('[chat] Groq error:', errMsg);
            return res.status(response.status).json({ error: errMsg });
        }

        const reply = data?.choices?.[0]?.message?.content?.trim() || '';
        if (!reply) return res.status(502).json({ error: 'Empty response from Groq.' });

        console.log(`[chat] OK reply="${reply.substring(0, 120)}"`);
        return res.json({ reply });

    } catch (err) {
        console.error('[chat] Fetch error:', err.message);
        return res.status(500).json({ error: err.message || 'Internal server error' });
    }
});

module.exports = router;
