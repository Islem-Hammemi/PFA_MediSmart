import React, { useState, useEffect, useRef } from "react";
import "./doctorspage.css";

const ClockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const PlayIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="5,3 19,12 5,21" />
  </svg>
);

const UserIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
    stroke="#4a7aff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const NoteIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="#8a90aa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

function pad(n) {
  return String(n).padStart(2, "0");
}

export default function ConsultationTimer({
  patient = { name: "Sarah Mansour" },
  onStart,
}) {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [notes, setNotes] = useState("");
  const intervalRef = useRef(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const hours = pad(Math.floor(seconds / 3600));
  const mins  = pad(Math.floor((seconds % 3600) / 60));
  const secs  = pad(seconds % 60);

  const handleStart = () => {
    setRunning(true);
    setSeconds(0);
    if (onStart) onStart();
  };

  return (
    <div className="consultation-wrapper">
      {/* Header row */}
      <div className="consultation-header">
        <div className="consultation-patient">
          <div className="patient-icon-circle">
            <UserIcon />
          </div>
          <span className="consultation-patient-name">{patient.name}</span>
        </div>
        <div className="consultation-timer-display">
          <span className="timer-clock-icon"><ClockIcon /></span>
          <span className="timer-digits">
            {hours}:{mins}:{secs}
          </span>
          <span className="timer-label">Session Timer</span>
        </div>
      </div>

      {/* Notes area */}
      <div className="consultation-notes-section">
        <div className="notes-label-row">
          <NoteIcon />
          <span className="notes-label">Consultation Notes</span>
        </div>
        <textarea
          className="notes-textarea"
          placeholder="Type clinical notes, prescriptions, and observations here...."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      {/* Start button */}
      <div className="consultation-footer">
        <button
          className={`start-consultation-btn ${running ? "running" : ""}`}
          onClick={handleStart}
        >
          <PlayIcon />
          {running ? "Restart Consultation" : "Start Consultation"}
        </button>
      </div>
    </div>
  );
}