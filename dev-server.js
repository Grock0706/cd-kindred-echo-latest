#!/usr/bin/env node
import express from 'express'
import bodyParser from 'body-parser'
import fs from 'fs'
import path from 'path'

const app = express()
app.use(bodyParser.json())

// Reuse the logic in api/echo by importing compiled JS first, then TS, with clear logging.
let handler = null
const tryImportHandler = async () => {
  const candidates = ['./api/echo.js', './api/echo.ts']
  for (const rel of candidates) {
    const p = path.resolve(rel)
    if (fs.existsSync(p)) {
      try {
        const mod = await import(`file://${p}`)
        if (mod && mod.default) {
          console.log(`Loaded echo handler from ${rel}`)
          return mod.default
        }
      } catch (err) {
        console.error(`Failed to import ${rel}:`, err && err.stack ? err.stack : String(err))
      }
    }
  }

  // fallback - simple inline handler
  console.log('Using fallback mock echo handler')
  return async function (req, res) {
    const { text } = req.body || {}
    if (!text) return res.status(400).json({ error: 'Missing text' })
    return res.json({ reflection: `Mock echo: I hear you — "${String(text).slice(0, 80)}..."` })
  }
}

try {
  handler = await tryImportHandler()
} catch (err) {
  console.error('Unexpected error while loading echo handler:', err)
  handler = await tryImportHandler()
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
process.on('uncaughtException', (err) => {
  console.error('uncaughtException', err && err.stack ? err.stack : err)
})
process.on('unhandledRejection', (reason) => {
  console.error('unhandledRejection', reason)
})

app.listen(port, () => console.log(`Dev API server running at http://localhost:${port}`))
