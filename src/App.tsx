import { useEffect, useMemo, useRef, useState } from 'react'
import dayjs from 'dayjs'
import { db, type Note } from './db'
import { jsPDF } from 'jspdf'

const TAGS = ['symptom','task','appointment','other'] as const
type Tag = typeof TAGS[number]
type Tab = 'notes' | 'summary' | 'about'

export default function App(){
  const [notes, setNotes] = useState<Note[]>([])
  const [text, setText] = useState('')
  const [selTags, setSelTags] = useState<Tag[]>([])
  const [recording, setRecording] = useState(false)
  const [tab, setTab] = useState<Tab>('notes')
  const [fromDate, setFromDate] = useState<string>('')
  const [toDate, setToDate] = useState<string>('')
  const [showBanner, setShowBanner] = useState(true)
  // SpeechRecognition type may not be present in all TS DOM libs; use any to be safe
  const recRef = useRef<any>(null)

  // Load notes on start
  useEffect(() => { void loadNotes() }, [])
  async function loadNotes(){
    const all = await db.notes.orderBy('createdAt').reverse().toArray()
    setNotes(all)
  }

  // Speech recognition (Web Speech API) — optional
  useEffect(() => {
    const SR: any = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
    if (!SR) return
    const rec = new SR()
    rec.continuous = false; rec.interimResults = false; rec.lang = 'en-US'
    rec.onresult = (e: any) => {
      const t = e.results[0][0].transcript
      setText(prev => (prev ? prev + ' ' : '') + t)
    }
    rec.onend = () => setRecording(false)
    recRef.current = rec
  }, [])

  const toggleTag = (tag: Tag) => {
    setSelTags(prev => prev.includes(tag) ? prev.filter(t=>t!==tag) : [...prev, tag])
  }

  const addNote = async () => {
    const t = text.trim()
    if(!t) return
    const n: Note = {
      id: crypto.randomUUID(),
      text: t,
      tags: [...selTags],
      createdAt: new Date().toISOString()
    }
    await db.notes.add(n)
    setText(''); setSelTags([])
    await loadNotes()
  }

  const removeNote = async (id: string) => {
    await db.notes.delete(id)
    await loadNotes()
  }

  const startVoice = () => {
    if(!recRef.current){ alert('Speech recognition not supported in this browser'); return }
    setRecording(true); recRef.current.start()
  }

  const assist = async (note: Note) => {
    const checklist = generateChecklist(note.text)
    alert('Next steps:\n- ' + checklist.join('\n- '))
  }

  // --- Summary helpers ---
  const filtered = useMemo(() => {
    let arr = [...notes]
    if (fromDate) arr = arr.filter(n => n.createdAt >= new Date(fromDate).toISOString())
    if (toDate) arr = arr.filter(n => n.createdAt <= dayjs(toDate).endOf('day').toISOString())
    return arr
  }, [notes, fromDate, toDate])

  const groupedByDay = useMemo(() => {
    const map = new Map<string, Note[]>()
    for (const n of filtered){
      const key = dayjs(n.createdAt).format('YYYY-MM-DD')
      if(!map.has(key)) map.set(key, [])
      map.get(key)!.push(n)
    }
    return Array.from(map.entries()).sort((a,b)=> (a[0] < b[0] ? 1 : -1))
  }, [filtered])

  const summaryText = useMemo(() => buildSummaryText(groupedByDay), [groupedByDay])

  function downloadText(){
    const blob = new Blob([summaryText], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `KindredEcho_Summary_${dayjs().format('YYYYMMDD_HHmm')}.txt`
    a.click(); URL.revokeObjectURL(url)
  }

  function downloadPdf(){
    const doc = new jsPDF({ unit: 'pt', format: 'letter' })
    const margin = 48
    const width = doc.internal.pageSize.getWidth() - margin*2
    const lines = doc.splitTextToSize(summaryText, width)
    let y = margin
    doc.setFont('Times', 'Normal'); doc.setFontSize(12)
    for (const line of lines){
      if (y > doc.internal.pageSize.getHeight() - margin){ doc.addPage(); y = margin }
      doc.text(line, margin, y)
      y += 16
    }
    doc.save(`KindredEcho_Summary_${dayjs().format('YYYYMMDD_HHmm')}.pdf`)
  }

  return (
    <main className="min-h-screen" style={{ background: 'white', color: 'black', padding: '1rem' }}>
      <header className="max-w-2xl mx-auto mb-4 text-center relative">
        <h1 className="text-3xl font-bold mb-2">Kindred Echo</h1>

        {showBanner && (
          <div 
            className="bg-gray-100 border border-gray-300 rounded-lg p-3 text-sm text-gray-800 shadow-sm animate-fade-in relative"
            role="region" 
            aria-label="App purpose banner"
          >
            <p>
              Kindred Echo helps you capture thoughts, track emotions, and reflect on your day — 
              designed to support inclusion, accessibility, and mindful journaling.
              <button 
                onClick={() => setTab('about')} 
                className="ml-2 text-blue-600 underline hover:text-blue-800"
              >
                Learn more →
              </button>
            </p>
            <button
              onClick={() => setShowBanner(false)}
              aria-label="Dismiss banner"
              className="absolute top-2 right-2 text-gray-500 hover:text-black text-lg"
            >
              ×
            </button>
          </div>
        )}
      </header>

      {/* Tabs */}
      <div role="tablist" aria-label="Views" style={{ maxWidth: 680, margin: '0 auto 1rem', display: 'flex', gap: '0.5rem' }}>
        <button role="tab" aria-selected={tab==='notes'} onClick={()=>setTab('notes')} style={tab==='notes'?activeTab:tabStyle}>Notes</button>
        <button role="tab" aria-selected={tab==='summary'} onClick={()=>setTab('summary')} style={tab==='summary'?activeTab:tabStyle}>Summary</button>
        <button role="tab" aria-selected={tab==='about'} onClick={()=>setTab('about')} style={tab==='about'?activeTab:tabStyle}>About</button>
      </div>

      {tab==='notes' && (
        <>
          <section aria-labelledby="new-note" style={cardStyle}>
            <h2 id="new-note" style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>New Note</h2>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>
              <span style={{ display: 'block', marginBottom: '0.25rem' }}>Text</span>
              <textarea
                value={text}
                onChange={e=>setText(e.target.value)}
                rows={4}
                aria-label="Note text"
                style={{ width: '100%', border: '1px solid #ccc', borderRadius: 8, padding: 12 }}
              />
            </label>
            <div role="group" aria-label="Tags" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
              {TAGS.map(t => (
                <button key={t}
                  onClick={()=>toggleTag(t)}
                  aria-pressed={selTags.includes(t)}
                  style={selTags.includes(t)?pillActive:pill}>
                  {t}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={addNote} aria-label="Add note" style={btn}>+ Add Note</button>
              <button onClick={startVoice} aria-pressed={recording} aria-label="Start voice input" style={btn}>🎤 Voice</button>
            </div>
          </section>

          <section aria-labelledby="notes" style={{ maxWidth: 680, margin: '1rem auto 0' }}>
            <h2 id="notes" style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>Your Notes</h2>
            <ul style={{ display: 'grid', gap: 12, listStyle: 'none', padding: 0 }}>
              {notes.map(n => (
                <li key={n.id} style={cardItem}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: 12, color: '#666' }}>{dayjs(n.createdAt).format('MMM D, HH:mm')}</div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {n.tags.map(t => <span key={t} style={tagBadge}>{t}</span>)}
                    </div>
                  </div>
                  <p style={{ marginTop: 8, fontSize: 18 }}>{n.text}</p>
                  <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                    <button onClick={()=>assist(n)} style={btn}>🧭 What should I do next?</button>
                    <button onClick={()=>removeNote(n.id)} style={btn}>🗑️ Delete</button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}

      {tab==='summary' && (
        <section aria-labelledby="summary" style={cardStyle}>
          <h2 id="summary" style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 12 }}>Summary</h2>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'end', marginBottom: 12 }}>
            <label style={{ display: 'block' }}>
              <span style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>From</span>
              <input type="date" value={fromDate} onChange={e=>setFromDate(e.target.value)} style={input} />
            </label>
            <label style={{ display: 'block' }}>
              <span style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>To</span>
              <input type="date" value={toDate} onChange={e=>setToDate(e.target.value)} style={input} />
            </label>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
              <button onClick={downloadText} style={btn}>⬇️ Export .txt</button>
              <button onClick={downloadPdf} style={btn}>⬇️ Export .pdf</button>
            </div>
          </div>

          {groupedByDay.length===0 ? (
            <p style={{ color: '#666' }}>No notes in this range.</p>
          ) : (
            <ul style={{ display: 'grid', gap: 12, listStyle: 'none', padding: 0 }}>
              {groupedByDay.map(([day, list]) => (
                <li key={day} style={cardItem}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 600 }}>{dayjs(day).format('MMM D, YYYY')}</h3>
                    <span style={{ fontSize: 12, color: '#666' }}>{list.length} note{list.length>1?'s':''}</span>
                  </div>
                  <ul style={{ display: 'grid', gap: 6, listStyle: 'none', padding: 0 }}>
                    {list.map(n => (
                      <li key={n.id}>
                        <div style={{ fontSize: 12, color: '#666' }}>{dayjs(n.createdAt).format('HH:mm')} • {(n.tags||[]).join(', ') || 'no tags'}</div>
                        <div style={{ fontSize: 16 }}>{n.text}</div>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {tab==='about' && (
        <section aria-labelledby="about" style={cardStyle}>
          <h2 id="about" style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 12 }}>Kindred Echo — Purpose & Vision</h2>
          <div style={{ color: '#333', lineHeight: 1.6 }}>
            <h3 style={{ marginTop: 0 }}>🌿 MISSION + VISION STATEMENTS</h3>
            <h4 style={{ marginBottom: 8 }}>💫 Vision Statement</h4>
            <p>
              To create a compassionate digital space where reflection becomes connection — empowering every person, regardless of ability, to express, be heard, and belong.
            </p>
            <h4 style={{ marginTop: 12, marginBottom: 8 }}>🎯 Mission Statement</h4>
            <p>
              Kindred Echo bridges private self-reflection and collective empathy through accessible journaling, guided AI insights, and supportive community circles.
              We champion inclusion, mindfulness, and emotional wellbeing by transforming personal stories into shared understanding.
            </p>
            <p>
              By allowing users to share insights, connect through lived experiences, and echo support for one another, Kindred Echo aims to bridge isolation and build empathy through technology.
            </p>
            <p>
              It’s not just a personal wellness app — it’s a growing digital community of reflection, compassion, and accessibility.
            </p>
          </div>
        </section>
      )}
    </main>
  )
}

const btn: React.CSSProperties = { padding: '10px 14px', borderRadius: 10, border: '1px solid #ccc', background: 'white', cursor: 'pointer' }
const tabStyle: React.CSSProperties = { padding: '10px 12px', borderRadius: 12, border: '1px solid #ccc', background: 'white', cursor: 'pointer' }
const activeTab: React.CSSProperties = { ...tabStyle, background: 'black', color: 'white' }
const pill: React.CSSProperties = { padding: '8px 12px', borderRadius: 999, border: '1px solid #ccc', background: 'white', cursor: 'pointer' }
const pillActive: React.CSSProperties = { ...pill, background: 'black', color: 'white' }
const cardStyle: React.CSSProperties = { maxWidth: 680, margin: '0 auto', border: '1px solid #e5e5e5', borderRadius: 16, padding: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }
const cardItem: React.CSSProperties = { border: '1px solid #e5e5e5', borderRadius: 12, padding: 12 }
const tagBadge: React.CSSProperties = { fontSize: 12, border: '1px solid #ddd', borderRadius: 999, padding: '2px 8px' }
const input: React.CSSProperties = { border: '1px solid #ccc', borderRadius: 8, padding: 8 }

function generateChecklist(text: string){
  const lower = text.toLowerCase()
  const items: string[] = []
  if(lower.includes('appointment')) items.push('Check date & set reminder')
  if(lower.includes('pain')||lower.includes('symptom')) items.push('Record severity (1–10) and duration')
  if(lower.includes('med')) items.push('Verify dosage & set a schedule')
  if(items.length===0) items.push('Break note into one small next step')
  return items
}

function buildSummaryText(grouped: [string, Note[]][]) {
  const lines: string[] = []
  lines.push('Kindred Echo — Daily Summary')
  lines.push(`Generated: ${dayjs().format('YYYY-MM-DD HH:mm')}`)
  lines.push('')
  for (const [day, list] of grouped){
    lines.push(dayjs(day).format('MMMM D, YYYY'))
    lines.push('---------------------------')
    for (const n of list){
      lines.push(`• ${dayjs(n.createdAt).format('HH:mm')} [${(n.tags||[]).join(', ')||'no tags'}] ${n.text}`)
    }
    lines.push('')
  }
  return lines.join('\n')
}
