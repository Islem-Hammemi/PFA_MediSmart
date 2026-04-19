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
  const [activeTab,  setActiveTab]  = useState("diagnostic");
  const [saving,     setSaving]     = useState(false);
  const [saved,      setSaved]      = useState(false);
  const intervalRef = useRef(null);

  const draftKey = currentPatient
    ? `consultationDraft:${currentPatient.source_type}:${currentPatient.source_id}`
    : null;

  const loadDraft = () => {
    if (!draftKey) return { diagnostic: "", traitement: "", notes: "" };
    try {
      const saved = localStorage.getItem(draftKey);
      if (!saved) return { diagnostic: "", traitement: "", notes: "" };
      return JSON.parse(saved);
    } catch (err) {
      console.warn("Failed to load consultation draft", err);
      return { diagnostic: "", traitement: "", notes: "" };
    }
  };

  const saveDraft = (values) => {
    if (!draftKey) return;
    try {
      localStorage.setItem(draftKey, JSON.stringify(values));
    } catch (err) {
      console.warn("Failed to save consultation draft", err);
    }
  };

  const clearDraft = () => {
    if (!draftKey) return;
    localStorage.removeItem(draftKey);
  };

  useEffect(() => {
    const computeSeconds = () => {
      if (!currentPatient) return 0;
      const start = currentPatient.started_at
        ? Number(currentPatient.started_at) * 1000
        : null;
      if (!start || Number.isNaN(start)) return 0;
      return Math.max(0, Math.floor((Date.now() - start) / 1000));
    };

    const draft = loadDraft();
    setSeconds(computeSeconds());
    setDiagnostic(draft.diagnostic || "");
    setTraitement(draft.traitement || "");
    setNotes(draft.notes || "");
    setActiveTab("diagnostic");
    setSaved(false);
    if (currentPatient) setRunning(true);
    else setRunning(false);
  }, [currentPatient?.source_id, currentPatient?.source_type, currentPatient?.started_at]);

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
      await onFinish(currentPatient, { notes, diagnostic, traitement, duration: seconds });
      clearDraft();
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
      <div className="consultation-header">
        <div className="consultation-patient">
          <div className="patient-icon-circle">
            <UserIcon />
          </div>
          <div>
            <span className="consultation-patient-name">{patientName}</span>
            <span className="patient-status">
              {isActive ? "Active consultation" : "No patient selected"}
            </span>
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

      <div className="consultation-grid">
        <aside className="consultation-sidebar">
          <div className="consultation-sidebar-info">
            <span className="sidebar-title">Consultation</span>
            <p className="sidebar-subtitle">Review and record the patient session.</p>
          </div>
          <div className="sidebar-items">
            <button
              type="button"
              className={`sidebar-item ${activeTab === "diagnostic" ? "active" : ""}`}
              onClick={() => setActiveTab("diagnostic")}
            >
              <span>Diagnostic</span>
            </button>
            <button
              type="button"
              className={`sidebar-item ${activeTab === "traitement" ? "active" : ""}`}
              onClick={() => setActiveTab("traitement")}
            >
              <span>Traitement</span>
            </button>
            <button
              type="button"
              className={`sidebar-item ${activeTab === "notes" ? "active" : ""}`}
              onClick={() => setActiveTab("notes")}
            >
              <span>Consultation Notes</span>
            </button>
          </div>
          <div className="sidebar-action">
            {isActive ? (
              <button
                className={`start-consultation-btn finish-btn ${saving ? "running" : ""}`}
                onClick={handleFinish}
                disabled={saving}
              >
                {saving ? "Saving…" : <><CheckIcon /> End consultation</>}
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
        </aside>

        <section className="consultation-main">
          <div className="consultation-main-panel">
            <div className="notes-header-row">
              <div>
                <span className="notes-heading">
                  {activeTab === "diagnostic" && "Diagnostic"}
                  {activeTab === "traitement" && "Traitement"}
                  {activeTab === "notes" && "Consultation Notes"}
                </span>
                <p className="notes-subtext">
                  {activeTab === "diagnostic" && "Describe the clinical diagnosis."}
                  {activeTab === "traitement" && "Write the prescribed treatment plan."}
                  {activeTab === "notes" && "Add observations and clinical notes."}
                </p>
              </div>
            </div>
            <textarea
              className="notes-textarea notes-textarea--large"
              placeholder={isActive
                ? activeTab === "diagnostic"
                  ? "Enter diagnosis..."
                  : activeTab === "traitement"
                    ? "Enter treatment plan..."
                    : "Type clinical notes, prescriptions, and observations here..."
                : "Select a patient to start writing notes..."
              }
              value={activeTab === "diagnostic" ? diagnostic : activeTab === "traitement" ? traitement : notes}
              onChange={e => {
                const value = e.target.value;
                if (activeTab === "diagnostic") {
                  setDiagnostic(value);
                  saveDraft({ diagnostic: value, traitement, notes });
                } else if (activeTab === "traitement") {
                  setTraitement(value);
                  saveDraft({ diagnostic, traitement: value, notes });
                } else {
                  setNotes(value);
                  saveDraft({ diagnostic, traitement, notes: value });
                }
              }}
              disabled={!isActive}
              rows={12}
            />
          </div>
        </section>
      </div>
    </div>
  );
}