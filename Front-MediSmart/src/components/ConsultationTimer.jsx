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

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
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
  </svg>
);

function pad(n) {
  return String(n).padStart(2, "0");
}

export default function ConsultationTimer({ currentPatient = null, onFinish }) {
  const [seconds,    setSeconds]    = useState(0);
  const [running,    setRunning]    = useState(false);
  const [diagnostic, setDiagnostic] = useState("");
  const [traitement, setTraitement] = useState("");
  const [notes,      setNotes]      = useState("");
  const [saving,     setSaving]     = useState(false);
  const [saved,      setSaved]      = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    setSeconds(0);
    setDiagnostic("");
    setTraitement("");
    setNotes("");
    setSaved(false);
    if (currentPatient) setRunning(true);
    else setRunning(false);
  }, [currentPatient?.source_id, currentPatient?.source_type]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const hours = pad(Math.floor(seconds / 3600));
  const mins  = pad(Math.floor((seconds % 3600) / 60));
  const secs  = pad(seconds % 60);

  const handleFinish = async () => {
    if (!currentPatient || saving) return;
    setSaving(true);
    try {
      await onFinish(currentPatient, { notes, diagnostic, traitement });
      setRunning(false);
      setSaved(true);
      setDiagnostic("");
      setTraitement("");
      setNotes("");
      setSeconds(0);
    } catch (err) {
      alert("Erreur: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const isActive    = !!currentPatient;
  const patientName = currentPatient?.patient_nom ?? "No active patient";

  return (
    <div className={`consultation-wrapper ${isActive ? "consultation-wrapper--active" : ""}`}>

      {/* Header */}
      <div className="consultation-header">
        <div className="consultation-patient">
          <div className="patient-icon-circle">
            <UserIcon />
          </div>
          <div>
            <span className="consultation-patient-name">{patientName}</span>
            {isActive
              ? <span className="consultation-patient-sub">In consultation</span>
              : <span className="consultation-patient-sub">Serve a patient to begin</span>
            }
          </div>
        </div>
        <div className="consultation-timer-display">
          <span className="timer-clock-icon"><ClockIcon /></span>
          <span className={`timer-digits ${isActive ? "timer-digits--active" : ""}`}>
            {hours}:{mins}:{secs}
          </span>
          <span className="timer-label">Session Timer</span>
        </div>
      </div>

      {/* Notes fields */}
      <div className="consultation-notes-section">

        {/* Diagnostic */}
        <div className="notes-label-row" style={{ marginBottom: "6px" }}>
          <NoteIcon />
          <span className="notes-label">Diagnostic</span>
        </div>
        <textarea
          className="notes-textarea"
          placeholder={isActive ? "Enter diagnosis..." : "Select a patient first..."}
          value={diagnostic}
          onChange={e => setDiagnostic(e.target.value)}
          disabled={!isActive}
          rows={2}
          style={{ marginBottom: "14px" }}
        />

        {/* Traitement */}
        <div className="notes-label-row" style={{ marginBottom: "6px" }}>
          <NoteIcon />
          <span className="notes-label">Traitement</span>
        </div>
        <textarea
          className="notes-textarea"
          placeholder={isActive ? "Enter treatment plan..." : "Select a patient first..."}
          value={traitement}
          onChange={e => setTraitement(e.target.value)}
          disabled={!isActive}
          rows={2}
          style={{ marginBottom: "14px" }}
        />

        {/* Notes */}
        <div className="notes-label-row" style={{ marginBottom: "6px" }}>
          <NoteIcon />
          <span className="notes-label">Consultation Notes</span>
        </div>
        <textarea
          className="notes-textarea"
          placeholder={isActive ? "Type clinical notes, prescriptions, and observations here..." : "Select a patient to start writing notes..."}
          value={notes}
          onChange={e => setNotes(e.target.value)}
          disabled={!isActive}
          rows={3}
        />
      </div>

      {/* Action button */}
      <div className="consultation-footer">
        {isActive ? (
          <button
            className={`start-consultation-btn finish-btn ${saving ? "running" : ""}`}
            onClick={handleFinish}
            disabled={saving}
          >
            {saving ? <>Saving…</> : <><CheckIcon /> End &amp; Save Consultation</>}
          </button>
        ) : (
          <button className="start-consultation-btn" disabled>
            <PlayIcon /> Start Consultation
          </button>
        )}
        {saved && (
          <p className="save-confirmation">Consultation saved successfully.</p>
        )}
      </div>
    </div>
  );
}