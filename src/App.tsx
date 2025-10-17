
import { useState } from 'react';
import Onboarding from './components/Onboarding';
import Selection, { type Flow } from './components/Selection';
import Journal from './components/Journal';

export default function App() {
  // App flow: onboard (welcome) → select (Echo/Circles) → journal (if Echo) → circles (placeholder)
  const [stage, setStage] = useState<'onboard' | 'select' | 'journal' | 'circles'>('onboard');
  const [flow, setFlow] = useState<Flow | null>(null);

  // Only show onboarding welcome card
  if (stage === 'onboard') {
    return <Onboarding onStart={() => setStage('select')} />;
  }

  // Show selection screen (Echo/Circles)
  if (stage === 'select') {
    return <Selection onChoose={choice => {
      if (choice === 'echo') {
        setFlow('echo');
        setStage('journal');
      } else {
        setFlow('circles');
        setStage('circles');
      }
    }} />;
  }

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
