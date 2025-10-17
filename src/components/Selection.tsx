import React from 'react'

export type Flow = 'echo'|'circles'

function IconEcho(){
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M21 15a4 4 0 0 0-4-4" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M17 19a8 8 0 0 0-8-8" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9 5v.01" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function IconCircles(){
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="3" stroke="#0f172a" strokeWidth="1.5"/>
      <circle cx="7" cy="7" r="2" stroke="#0f172a" strokeWidth="1.5"/>
      <circle cx="17" cy="17" r="2" stroke="#0f172a" strokeWidth="1.5"/>
    </svg>
  )
}

export default function Selection({ onChoose }:{ onChoose: (f: Flow)=>void }){
  return (
    <div className="device-center">
      <div className="device">
        <div style={{ textAlign: 'center', marginBottom: 12 }}>
          <h2 style={{ margin: 0 }}>How are you feeling today?</h2>
        </div>
        <div style={{ display: 'grid', gap: 12 }}>
          <button onClick={()=>onChoose('echo')} className="journal-card" style={{ display: 'flex', gap: 12, alignItems: 'center', justifyContent:'center', padding: 20 }}>
            <IconEcho />
            <div style={{ fontSize: 18 }}>Echo</div>
          </button>
          <button onClick={()=>onChoose('circles')} className="journal-card" style={{ display: 'flex', gap: 12, alignItems: 'center', justifyContent:'center', padding: 20 }}>
            <IconCircles />
            <div style={{ fontSize: 18 }}>Circles</div>
          </button>
        </div>
      </div>
    </div>
  )
}
