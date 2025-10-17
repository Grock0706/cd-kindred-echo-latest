import { useState } from "react";

type Prefs = { fontSize: number; highContrast: boolean; tts: boolean }

export default function Onboarding({ onStart, initial, visible=true }:{ onStart: (p: Prefs)=>void, initial?: Partial<Prefs>, visible?: boolean }) {
  const [fontSize, setFontSize] = useState(initial?.fontSize ?? 16);
  const [highContrast, setHighContrast] = useState(initial?.highContrast ?? false);
  const [tts, setTts] = useState(initial?.tts ?? false);

  return (
    <div className="device-center">
      <div className="device" style={{ fontSize, fontFamily: 'Inter, system-ui, -apple-system, \'Segoe UI\', Roboto, \'Helvetica Neue\', Arial', background: 'var(--card)', borderRadius: 'var(--rounded-device)', boxShadow: '0 10px 32px rgba(16,24,40,0.12)' }}>
        <div className="journal-card" style={{ borderRadius: 20, boxShadow: '0 6px 24px rgba(16,24,40,0.10)', padding: '2.5rem 2rem', maxWidth: 380, margin: '0 auto' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: 0, letterSpacing: '-0.5px', fontFamily: 'inherit' }}>Welcome to Kindred Echo</h1>
          <p className="muted" style={{ marginTop: 10, fontSize: '1.1rem', fontWeight: 500, letterSpacing: '-0.1px' }}>Your space to reflect and connect</p>

          <div style={{ marginTop: 28, display: 'grid', gap: 18 }}>
            <label style={{ display: 'block', marginBottom: 0 }}>
              <div style={{ marginBottom: 8, fontWeight: 500 }}>Font size</div>
              <input type="range" min={14} max={24} value={fontSize} onChange={(e)=>setFontSize(Number(e.target.value))} style={{ width: '100%', accentColor: 'var(--accent)', height: 4, borderRadius: 8 }} />
            </label>

            <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '6px 0' }}>
              <span style={{ fontWeight: 500 }}>High contrast</span>
              <input type="checkbox" checked={highContrast} onChange={(e)=>setHighContrast(e.target.checked)} style={{ width: 20, height: 20, accentColor: 'var(--accent)' }} />
            </label>

            <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '6px 0' }}>
              <span style={{ fontWeight: 500 }}>Text-to-speech</span>
              <input type="checkbox" checked={tts} onChange={(e)=>setTts(e.target.checked)} style={{ width: 20, height: 20, accentColor: 'var(--accent-2)' }} />
            </label>
          </div>

          <div style={{ marginTop: 32, textAlign: 'center' }}>
            <button
              onClick={() => onStart({ fontSize, highContrast, tts })}
              className="cta"
              style={{
                fontSize: '1.1rem',
                borderRadius: 14,
                fontWeight: 700,
                boxShadow: '0 2px 8px rgba(247,198,191,0.18)',
                padding: '1rem 2.2rem',
                letterSpacing: '0.01em',
                border: 'none',
                outline: 'none',
                margin: 0,
                cursor: 'pointer',
                transition: 'background 0.15s',
              }}
            >
              Begin Your Journey
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
