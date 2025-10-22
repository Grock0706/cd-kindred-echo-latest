import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { db, type Note } from "../db";
import type { Flow } from './Selection'

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
              <div style={{ fontSize: 12, color: '#6b7280' }}>{dayjs(n.createdAt).format('MMM D, HH:mm')}</div>
              <div style={{ background: 'white', borderRadius: 12, padding: 12, boxShadow: '0 4px 10px rgba(16,24,40,0.04)', marginTop: 6 }}>{n.text}</div>
              {n.tags && n.tags.length > 0 && <div style={{ marginTop: 6 }}><span className="tag-pill">#{n.tags[0]}</span></div>}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
