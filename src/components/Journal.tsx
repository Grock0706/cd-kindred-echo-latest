import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { db, type Note } from "../db";
import type { Flow } from './Selection'
import React from 'react'

export default function Journal({ flow }: { flow?: Flow }): JSX.Element {
  const [notes, setNotes] = useState<Note[]>([]);
  const [text, setText] = useState("");
  const [tag, setTag] = useState("");

  useEffect(() => {
    void loadNotes();
  }, []);

  async function loadNotes() {
    const allNotes = await db.notes.toArray();
    setNotes(allNotes.reverse());
  }

  async function addNote() {
    if (!text.trim()) return;
    await db.notes.add({
      id: crypto.randomUUID(),
      text,
      tags: tag ? [tag] : [],
      createdAt: new Date().toISOString(),
    });
    setText("");
    setTag("");
    void loadNotes();
  }

  async function exportPDF() {
    // Dynamically import jsPDF so it's only loaded when the user requests export
    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF();
    notes.forEach((note, i) => {
      const tagLabel = note.tags && note.tags.length ? note.tags.join(', ') : 'general'
      doc.text(`${dayjs(note.createdAt).format("MMM D, YYYY HH:mm")} - ${tagLabel}`, 10, 20 + i * 10);
      doc.text(note.text, 10, 30 + i * 10);
    });
    doc.save("KindredEcho_Notes.pdf");
  }

  // Echo AI reflection
  const [loadingEcho, setLoadingEcho] = useState(false)
  const [echoResult, setEchoResult] = useState<string | null>(null)
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)

  async function reflectWithEcho(note: Note) {
    setSelectedNote(note)
    setLoadingEcho(true)
    setEchoResult(null)
    try {
      const r = await fetch('/api/echo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: note.text })
      })
      const j = await r.json()
      if (j?.reflection) setEchoResult(j.reflection)
      else setEchoResult(j?.error || 'No reflection returned')
    } catch (e: any) {
      setEchoResult(`Error: ${e?.message || String(e)}`)
    } finally {
      setLoadingEcho(false)
    }
  }

  function saveEchoAsNote() {
    if (!echoResult) return
    void db.notes.add({ id: crypto.randomUUID(), text: `Echo reflection: ${echoResult}`, tags: ['echo'], createdAt: new Date().toISOString() })
    setEchoResult(null)
    void loadNotes()
  }

  return (
    <div className="device-center">
      <div className="device">
        <div className="journal-hero">
          <h2>Daily Reflections</h2>
          <div className="muted">{flow === 'echo' ? 'A short reflective prompt to yourself' : flow === 'circles' ? 'Prompts for sharing with your circle' : 'Your space to reflect and connect'}</div>
        </div>

        <div className="journal-card">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write your reflection here..."
            className="input"
            rows={4}
          />
          <input
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            placeholder="Tag (emotion, thought, event)"
            className="input"
          />
          <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
            <button onClick={addNote} className="cta">Begin Your Journey</button>
            <button onClick={exportPDF} style={{ padding: '.5rem .75rem', borderRadius: 10 }}>Export</button>
          </div>
        </div>

        <ul style={{ marginTop: 18, listStyle: 'none', padding: 0 }}>
          {notes.map((n) => (
            <li key={n.id} style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: '#6b7280', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{dayjs(n.createdAt).format('MMM D, HH:mm')}</span>
                <button onClick={() => reflectWithEcho(n)} style={{ fontSize: 12, background: 'transparent', border: 'none', color: '#7d93f6', cursor: 'pointer' }}>
                  Reflect with Echo
                </button>
              </div>
              <div style={{ background: 'white', borderRadius: 12, padding: 12, boxShadow: '0 4px 10px rgba(16,24,40,0.04)', marginTop: 6 }}>{n.text}</div>
              {n.tags && n.tags.length > 0 && <div style={{ marginTop: 6 }}><span className="tag-pill">#{n.tags[0]}</span></div>}
            </li>
          ))}
        </ul>
        
        {/* Echo modal */}
        {selectedNote && (
          <div style={{ position: 'fixed', left: 0, right: 0, top: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: 'rgba(0,0,0,0.35)', position: 'absolute', inset: 0 }} onClick={() => { setSelectedNote(null); setEchoResult(null) }} />
            <div style={{ zIndex: 50, background: 'white', padding: 18, borderRadius: 12, maxWidth: 560, width: '94%', boxShadow: '0 12px 40px rgba(16,24,40,0.12)' }}>
              <h3 style={{ marginTop: 0 }}>Echo's Reflection</h3>
              <div style={{ minHeight: 60 }}>{loadingEcho ? <div>Thinking…</div> : <div style={{ whiteSpace: 'pre-wrap' }}>{echoResult}</div>}</div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12 }}>
                <button onClick={() => { setSelectedNote(null); setEchoResult(null) }} className="secondary">Close</button>
                <button onClick={saveEchoAsNote} className="cta" disabled={!echoResult}>Save Reflection</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
