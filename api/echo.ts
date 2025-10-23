// Minimal serverless endpoint prototype for Echo AI
// Deploy this as a serverless function (Vercel/Netlify/Cloud Run). It reads OPENAI_API_KEY from env.
import type { IncomingMessage, ServerResponse } from 'http'
// Quick ambient to avoid missing Node type defs in some environments
declare const process: any
declare const Buffer: any

function redactPII(text: string) {
  // very small heuristic PII redaction: emails, phone numbers
  return text
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[redacted-email]')
    .replace(/\+?\d[\d\s\-().]{6,}\d/g, '[redacted-phone]')
}

async function callOpenAI(prompt: string, apiKey: string) {
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
    const t = await res.text()
    throw new Error(`OpenAI error: ${res.status} ${t}`)
  }

  const j = await res.json()
  // navigate response
  const text = j?.choices?.[0]?.message?.content ?? ''
  return { text, model: j?.model ?? 'unknown', raw: j }
}

export default async function handler(req: IncomingMessage & { body?: any }, res: ServerResponse) {
  try {
    if (req.method !== 'POST') {
      res.writeHead(405, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'Method not allowed' }))
      return
    }

    // parse body for non-node serverless platforms; if body exists as string parse
    let body: any = (req as any).body
    if (!body) {
      // try to read raw
      const chunks: Uint8Array[] = []
      for await (const chunk of req) chunks.push(chunk as Uint8Array)
      const raw = Buffer.concat(chunks).toString('utf8')
      body = raw ? JSON.parse(raw) : {}
    }

    const { text, tone } = body || {}
    if (!text || typeof text !== 'string') {
      res.writeHead(400, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'Missing text' }))
      return
    }

    const clean = redactPII(text)
    const prompt = `Read the user's reflection and produce a short compassionate reflection (1-3 sentences) in a gentle tone. User text:\n\n${clean}\n\nRespond empathetically and non-judgmentally.`

    const hfKey = process.env.HUGGINGFACE_API_KEY
    const hfModel = process.env.HF_MODEL || 'tiiuae/falcon-7b-instruct'
    // Try Hugging Face first
    if (hfKey) {
      try {
        const r = await fetch(`https://router.huggingface.co/hf-inference/${hfModel}`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${hfKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ inputs: `Respond compassionately to this reflection:\n${text}`, parameters: { max_new_tokens: 120 } }),
        })
        if (r.ok) {
          const data = await r.json()
          const out = data?.generated_text || data?.[0]?.generated_text || (Array.isArray(data) && data.length ? JSON.stringify(data[0]) : '')
          const hfText = (out || '').trim()
          if (hfText) {
            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ reflection: hfText, model: hfModel, tokensUsed: 0, safety: { flagged: false }, source: 'huggingface' }))
            return
          }
        } else {
          const t = await r.text()
          console.error('HuggingFace router error:', r.status, t)
        }
      } catch (e) {
        console.error('HuggingFace router exception:', e)
      }
    }

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      // mock response when no key provided
      const mock = `I hear you — it sounds like you're carrying a lot. Remember, it's okay to feel this way; you're doing your best and that matters.`
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ reflection: mock, model: 'mock', tokensUsed: 0, safety: { flagged: false } }))
      return
    }

    try {
      const result = await callOpenAI(prompt, apiKey)
      const reflection = (result.text || '').trim()
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ reflection, model: result.model, tokensUsed: 0, safety: { flagged: false }, raw: result.raw, source: 'openai' }))
      return
    } catch (err: any) {
      const msg = String(err || '')
      const isQuota = /quota|insufficient_quota|429|rate limit/i.test(msg)
      console.error('OpenAI call failed:', msg)
      if (isQuota) {
        const mock = `I hear you — it sounds like you're carrying a lot. Remember, it's okay to feel this way; you're doing your best and that matters.`
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ reflection: mock, model: 'mock', tokensUsed: 0, safety: { flagged: false }, fallback: true, reason: 'openai_insufficient_quota' }))
        return
      }
      res.writeHead(500, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: err?.message ?? String(err) }))
      return
    }
  } catch (err: any) {
    res.writeHead(500, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: err?.message ?? String(err) }))
  }
}
