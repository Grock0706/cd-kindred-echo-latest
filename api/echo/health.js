// Safe health endpoint for Echo API
// Returns whether an OpenAI key is present (boolean) and the service mode (mock|live)

export default function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }
  const hasOpenAIKey = Boolean(process.env.OPENAI_API_KEY)
  const echoModeEnvRaw = process.env.ECHO_MODE
  const sanitize = (v) => {
    if (v == null) return ''
    let s = String(v).trim()
    try {
      if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
        s = JSON.parse(s)
      }
    } catch (e) {
      // ignore
    }
    s = s.replace(/^['"]+|['"]+$/g, '').trim()
    return s.toLowerCase()
  }
  const echoModeEnv = sanitize(echoModeEnvRaw)
  // ECHO_MODE explicit override: 'mock' or 'live' takes highest priority
  let mode
  if (echoModeEnv === 'mock') mode = 'mock'
  else if (echoModeEnv === 'live') mode = 'live'
  else mode = hasOpenAIKey ? 'live' : 'mock'

  const hasHuggingFaceKey = Boolean(process.env.HUGGINGFACE_API_KEY)

  res.status(200).json({
    hasOpenAIKey,
    hasHuggingFaceKey,
    echoMode: echoModeEnvRaw ?? null,
    mode,
  })
}
