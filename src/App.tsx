
import React, { useState, lazy, Suspense } from 'react';
import Onboarding from './components/Onboarding';
import type { Flow } from './components/Selection';
const FeelingPage = lazy(() => import('./components/FeelingPage'));
import Journal from './components/Journal';

export default function App() {
  // App flow: onboard (welcome) → select (Echo/Circles) → journal (if Echo) → circles (placeholder)
  const [stage, setStage] = useState<'onboard' | 'select' | 'journal' | 'circles'>('onboard');
  const [flow, setFlow] = useState<Flow | null>(null);

  // Only show onboarding welcome card
  if (stage === 'onboard') {
    return <Onboarding onStart={() => setStage('select')} />;
  }

  // Show selection screen (Echo/Circles) — replaced by FeelingPage
  if (stage === 'select') {
    return (
      <Suspense fallback={<div className="device-center"><div className="device journal-card">Loading…</div></div>}>
        <FeelingPage onSelect={(choice) => {
          if (choice === 'echo') { setStage('journal'); setFlow('echo') }
          else { setStage('circles'); setFlow('circles') }
        }} />
      </Suspense>
    )
  }

  /* 'feeling' stage removed — FeelingPage is shown for 'select' */

  // Show journal if Echo selected
  if (stage === 'journal') {
    return <Journal flow={flow ?? undefined} />;
  }

  // Show Circles placeholder if Circles selected
  if (stage === 'circles') {
    return (
      <main className="device-center">
        <div className="device journal-card" style={{ minHeight: 400, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <h2>Circles — Coming Soon!</h2>
        </div>
      </main>
    );
  }

  return null;
}
