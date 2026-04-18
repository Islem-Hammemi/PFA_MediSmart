import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import "./doctorspage.css";

// ── Helpers ───────────────────────────────────────────────────
const STATUT_CONFIG = {
  confirme: { label: "Confirmed", color: "#10b981", bg: "#d1fae5" },
  planifie: { label: "Planned",   color: "#f59e0b", bg: "#fef3c7" },
  annule:   { label: "Cancelled", color: "#ef4444", bg: "#fee2e2" },
  termine:  { label: "Completed", color: "#6366f1", bg: "#ede9fe" },
};

const formatDateTime = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d)) return iso;
  return d.toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
};

const getInitials = (prenom = "", nom = "") =>
  `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();


const TABS = [
  { id: "case",      label: "Patient Case"  },
  { id: "medicines", label: "Medicines" },
];

// ── Main component ────────────────────────────────────────────
export default function PastAppointmentDetail({ appointment, onClose }) {
  const [activeTab, setActiveTab] = useState("case");

  const statut   = STATUT_CONFIG[appointment?.statut] || STATUT_CONFIG.termine;
  const medecin  = appointment?.medecin ?? {};
  const docName  = `Dr. ${medecin.prenom ?? ""} ${medecin.nom ?? ""}`.trim();
  const initials = getInitials(medecin.prenom, medecin.nom);
  const specialty = medecin.specialite ?? "—";
  const dateStr   = formatDateTime(appointment?.date_heure);
  const motif     = appointment?.motif || "No reason specified.";

  // Close on Escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  //  Portal renders directly into document.body — never affected by any parent blur/filter
  return createPortal(
    <div className="pad-backdrop" onClick={handleBackdrop}>
      <div className="pad-modal">

        {/* Header */}
        <div className="pad-header">
          <div className="pad-header__left">
            
            <div>
              <h3 className="pad-header__title">Past Appointment</h3>
              <p className="pad-header__sub">{dateStr}</p>
            </div>
          </div>
          <div className="pad-header__right">
            <span className="pad-statut"
              style={{ color: statut.color, background: statut.bg }}>
              {statut.label}
            </span>
            <button className="pad-close" onClick={onClose}>
              X
            </button>
          </div>
        </div>

        {/* Doctor info */}
        <div className="pad-doctor">
          <div className="pad-doctor__avatar">{initials}</div>
          <div className="pad-doctor__info">
            <p className="pad-doctor__name">{docName}</p>
            <p className="pad-doctor__spec">{specialty}</p>
          </div>
        </div>

        {/* Body: sidebar + content */}
        <div className="pad-body">

          {/* Left navy sidebar */}
          <div className="pad-sidebar">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                className={`pad-tab ${activeTab === tab.id ? "pad-tab--active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Right white content */}
          <div className="pad-content">

            {activeTab === "case" && (
              <div className="pad-section">
                <div className="pad-field">
                  <span className="pad-field__label">Reason for Visit</span>
                  <p className="pad-field__value">{motif}</p>
                </div>
                <div className="pad-field">
                  <span className="pad-field__label">Patient Case Description</span>
                  <div className="pad-empty">
                    
                    <p>No case description recorded.</p>
                    <span>The doctor will complete this during or after the consultation.</span>
                  </div>
                </div>
                
              </div>
            )}

            {activeTab === "medicines" && (
              <div className="pad-section">
                <div className="pad-field">
                  <span className="pad-field__label">Prescribed Medicines</span>
                  <div className="pad-empty">
                    
                    <p>No medicines prescribed yet.</p>
                    <span>Prescriptions written by the doctor will appear here.</span>
                  </div>
                </div>
               
                
              </div>
            )}

          </div>
        </div>

        {/* Footer */}
        <div className="pad-footer">
          <button className="pad-btn" onClick={onClose}>Close</button>
        </div>

      </div>
    </div>,
    document.body   //  always above everything, never blurred
  );
}