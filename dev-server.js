#!/usr/bin/env node
import express from 'express'
import bodyParser from 'body-parser'
import fs from 'fs'
import path from 'path'

const app = express()
app.use(bodyParser.json())

// Reuse the logic in api/echo.ts by importing it dynamically
const echoPath = path.resolve('./api/echo.ts')
let handler = null
try {
  handler = (await import(`file://${echoPath}`)).default
} catch (e) {
  // fallback - simple inline handler
  handler = async function (req, res) {
    const { text } = req.body || {}
    if (!text) return res.status(400).json({ error: 'Missing text' })
    return res.json({ reflection: `Mock echo: I hear you — "${text.slice(0, 80)}..."` })
  }
}

app.post('/api/echo', async (req, res) => {
  // adapt to the function signature (node http style)
  const fakeReq = { method: 'POST', body: req.body }
  const chunks = []
  const fakeRes = {
    writeHead: (code, headers) => {
      res.status(code)
      if (headers && headers['Content-Type']) res.type(headers['Content-Type'])
    },
    end: (content) => res.send(content),
  }
  try {
    await handler(fakeReq, fakeRes)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: String(err) })
  }
})

const port = process.env.DEV_SERVER_PORT || 3001
app.listen(port, () => console.log(`Dev API server running at http://localhost:${port}`))
