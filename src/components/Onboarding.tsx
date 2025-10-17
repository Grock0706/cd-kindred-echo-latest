import { useState } from "react";

type Prefs = { fontSize: number; highContrast: boolean; tts: boolean }

export default function Onboarding({ onStart, initial, visible=true }:{ onStart: (p: Prefs)=>void, initial?: Partial<Prefs>, visible?: boolean }) {
  const [fontSize, setFontSize] = useState(initial?.fontSize ?? 16);
  const [highContrast, setHighContrast] = useState(initial?.highContrast ?? false);
  const [tts, setTts] = useState(initial?.tts ?? false);

  return (
    <main
      className={`min-h-screen flex flex-col items-center justify-center ${
        highContrast ? "bg-black text-white" : "bg-white text-black"
      } ${visible? '' : 'animate-fade-out'}`}
      style={{ fontSize }}
    >
      <h1 className="text-3xl font-bold mb-4">Welcome to Kindred Echo</h1>
      <p className="text-center max-w-md mb-6">
        Your space for reflection and connection — where accessibility meets empathy.
      </p>

      <div className="w-full max-w-sm bg-gray-50 p-4 rounded-xl shadow space-y-4">
        <label className="flex justify-between items-center">
          <span>Font Size</span>
          <input
            type="range"
            min="14"
            max="24"
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
          />
        </label>

        <label className="flex justify-between items-center">
          <span>High Contrast Mode</span>
          <input
            type="checkbox"
            checked={highContrast}
            onChange={(e) => setHighContrast(e.target.checked)}
          />
        </label>

        <label className="flex justify-between items-center">
          <span>Enable Text-to-Speech</span>
          <input
            type="checkbox"
            checked={tts}
            onChange={(e) => setTts(e.target.checked)}
          />
        </label>
      </div>

      <button
        onClick={() => onStart({ fontSize, highContrast, tts })}
        className="mt-6 px-6 py-3 bg-black text-white rounded-lg shadow hover:bg-gray-800"
      >
        Begin Your Journey →
      </button>
    </main>
  );
}
