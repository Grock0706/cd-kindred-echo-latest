// Vercel-ready Echo AI serverless function (JS)
// Clean, ESM-friendly implementation that works with dev-server's adapter.

function redactPII(text) {
  return String(text)
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[redacted-email]')
    .replace(/\+?\d[\d\s\-().]{6,}\d/g, '[redacted-phone]')
}

async function callOpenAI(prompt, apiKey) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are Echo, a gentle, empathetic assistant. Keep replies brief, non-judgmental, and supportive.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 300,
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`OpenAI error: ${res.status} ${text}`)
  }

  const j = await res.json()
  const text = j?.choices?.[0]?.message?.content ?? ''
  return { text, model: j?.model ?? 'unknown', raw: j }
}

async function callHuggingFace(text, hfKey, model) {
  try {
    const r = await fetch(`https://router.huggingface.co/hf-inference/${model}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${hfKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: `Respond compassionately to this reflection:\n${text}`,
        parameters: { max_new_tokens: 120 },
      }),
    })
    if (!r.ok) {
      const t = await r.text()
      throw new Error(`HuggingFace router error: ${r.status} ${t}`)
    }
    const data = await r.json()
    const output = data?.generated_text || data?.[0]?.generated_text || (Array.isArray(data) && data.length ? JSON.stringify(data[0]) : '')
    return { text: (output || '').trim(), model }
  } catch (err) {
    console.error('HF router inference failed:', String(err))
    throw err
  }
}

// The handler uses a minimal adapter contract expected by dev-server:
// handler({ method, body, query }, { writeHead, end })
export default async function handler(req, res) {
  // --- CORS headers ---
  // Always set basic CORS headers early so every response (including errors) includes them.
  const ALLOWED_ORIGIN = (process.env.ALLOWED_ORIGIN || 'https://grock0706.github.io')
  try { res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN) } catch (e) {}
  try { res.setHeader('Vary', 'Origin') } catch (e) {}
  try { res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS') } catch (e) {}
  try { res.setHeader('Access-Control-Allow-Headers', 'Content-Type') } catch (e) {}

  // Handle preflight requests from the GitHub Pages frontend
  if (req.method === 'OPTIONS') {
    if (typeof res.status === 'function') return res.status(204).end()
    if (typeof res.writeHead === 'function') {
      res.writeHead(204, {})
      return typeof res.end === 'function' ? res.end() : undefined
    }
    return typeof res.end === 'function' ? res.end() : undefined
  }

  try {
    // ECHO_MODE toggle: set ECHO_MODE=mock to force the safe mock response (no LLM calls)
    // sanitize env value (strip surrounding single/double quotes and whitespace)
    const rawEchoMode = process.env.ECHO_MODE
    const sanitize = (v) => {
      if (v == null) return ''
      let s = String(v).trim()
      // If value looks like a JSON string (e.g. "mock"), try to parse it
      try {
        if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
          s = JSON.parse(s)
        }
      } catch (e) {
        // ignore parse errors
      }
      // strip any remaining surrounding quotes
      s = s.replace(/^['"]+|['"]+$/g, '').trim()
      return s.toLowerCase()
    }
    const mode = sanitize(rawEchoMode) || 'mock'
    if (mode === 'mock') {
      const payload = {
        reflection:
          "I hear you — it sounds like you're carrying a lot. Remember, it's okay to feel this way; you're doing your best and that matters.",
        model: 'mock',
        tokensUsed: 0,
        safety: { flagged: false },
        mode: 'mock',
      }
      if (typeof res.writeHead === 'function' && typeof res.end === 'function') {
        res.writeHead(200, { 'Content-Type': 'application/json' })
        return res.end(JSON.stringify(payload))
      }
      if (typeof res.status === 'function' && typeof res.json === 'function') {
        return res.status(200).json(payload)
      }
      return
    }
    // Accept either the full node req/res or the adapter's simplified objects
    const method = req.method || (req.method === undefined && 'POST')
    const query = req.query || {}
    let body = req.body

    if (method !== 'POST') {
      res.writeHead?.(405, { 'Content-Type': 'application/json' })
      return res.end?.(JSON.stringify({ error: 'Method not allowed' }))
    }

    if (!body) {
      // try to parse raw body if present
      try {
        if (req.on) {
          // Not needed in adapter, but keep safe
        }
      } catch (e) {
        // ignore
      }
    }

    const { text } = body || {}
    if (!text || typeof text !== 'string') {
      res.writeHead?.(400, { 'Content-Type': 'application/json' })
      return res.end?.(JSON.stringify({ error: 'Missing text' }))
    }

    const clean = redactPII(text)
    const prompt = `Read the user's reflection and produce a short compassionate reflection (1-3 sentences) in a gentle tone. User text:\n\n${clean}\n\nRespond empathetically and non-judgmentally.`

    const hfKey = process.env.HUGGINGFACE_API_KEY
    const hfModel = process.env.HF_MODEL || 'tiiuae/falcon-7b-instruct'
    let hfError = null

    if (hfKey) {
      try {
        const hf = await callHuggingFace(text, hfKey, hfModel)
        if (hf && hf.text) {
          const payload = { reflection: hf.text, model: hf.model, tokensUsed: 0, safety: { flagged: false }, source: 'huggingface' }
          res.writeHead?.(200, { 'Content-Type': 'application/json' })
          return res.end?.(JSON.stringify(payload))
        }
      } catch (e) {
        hfError = String(e?.message ?? e)
        console.error('HuggingFace failed, falling back to OpenAI or mock:', hfError)
      }
    }

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      const mock = `I hear you — it sounds like you're carrying a lot. Remember, it's okay to feel this way; you're doing your best and that matters.`
      const payload = { reflection: mock, model: 'mock', tokensUsed: 0, safety: { flagged: false } }
      res.writeHead?.(200, { 'Content-Type': 'application/json' })
      return res.end?.(JSON.stringify(payload))
    }

    try {
      const result = await callOpenAI(prompt, apiKey)
      const reflection = (result.text || '').trim()
      const payload = { reflection, model: result.model, tokensUsed: 0, safety: { flagged: false }, raw: result.raw }
      res.writeHead?.(200, { 'Content-Type': 'application/json' })
      return res.end?.(JSON.stringify(payload))
    } catch (err) {
      const msg = String(err || '')
      const isQuota = /quota|insufficient_quota|429|rate limit/i.test(msg)
      console.error('OpenAI call failed:', msg)

      if (isQuota) {
        const mock = `I hear you — it sounds like you're carrying a lot. Remember, it's okay to feel this way; you're doing your best and that matters.`
        const payload = { reflection: mock, model: 'mock', tokensUsed: 0, safety: { flagged: false }, fallback: true }
        // include reason/hfError only when ECHO_DEBUG is enabled
        const debug = Boolean(process.env.ECHO_DEBUG && process.env.ECHO_DEBUG !== '0')
        if (debug) payload.reason = 'openai_insufficient_quota'
        if (debug && query && (query.debug === '1' || query.debug === 'true')) payload.hfError = hfError
        res.writeHead?.(200, { 'Content-Type': 'application/json' })
        return res.end?.(JSON.stringify(payload))
      }

      const payload = { error: String(err) }
      const debug = Boolean(process.env.ECHO_DEBUG && process.env.ECHO_DEBUG !== '0')
      if (debug && query && (query.debug === '1' || query.debug === 'true')) payload.hfError = hfError
      res.writeHead?.(500, { 'Content-Type': 'application/json' })
      return res.end?.(JSON.stringify(payload))
    }
  } catch (err) {
    res.writeHead?.(500, { 'Content-Type': 'application/json' })
    return res.end?.(JSON.stringify({ error: String(err) }))
  }
}
