import React, { useState, useEffect } from "react";
import "./doctorspage.css";

const STATUT_CONFIG = {
  confirme: { label: "Confirmed", color: "#10b981", bg: "#d1fae5" },
  planifie: { label: "Planned",   color: "#f59e0b", bg: "#fef3c7" },
  annule:   { label: "Cancelled", color: "#ef4444", bg: "#fee2e2" },
  termine:  { label: "Completed", color: "#6366f1", bg: "#ede9fe" },
};



const TABS = [
  { id: "status",     label: "Patient Status",   },
  { id: "diagnostic", label: "Diagnostic",        },
  { id: "treatment",  label: "Medicines & Cure",   },
];

export default function AppointmentDetailModal({ appointment, onClose }) {
  const [activeTab, setActiveTab] = useState("status");

  const statut = STATUT_CONFIG[appointment?.statut] || STATUT_CONFIG.planifie;

  const doctorName = appointment?.medecin
    ? `Dr. ${appointment.medecin.prenom ?? ""} ${appointment.medecin.nom ?? ""}`.trim()
    : appointment?.medecin_nom
    ? `Dr. ${appointment.medecin_nom}`
    : "—";

  const specialty = appointment?.medecin?.specialite ?? appointment?.specialite ?? "—";

  const dateStr = appointment?.date_heure
    ? new Date(appointment.date_heure).toLocaleDateString("en-GB", {
        day: "numeric", month: "long", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      })
    : appointment?.date_heure_formatee ?? "—";

  const motif = appointment?.motif ?? "No reason specified.";

  // Backdrop + Escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="adm-backdrop" onClick={handleBackdrop}>
      <div className="adm-modal">

        {/* ── Header ── */}
        <div className="adm-header">
          <div className="adm-header__left">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="rgba(255,255,255,0.65)" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8"  y1="2" x2="8"  y2="6"/>
              <line x1="3"  y1="10" x2="21" y2="10"/>
            </svg>
            <div>
              <h3 className="adm-header__title">Appointment Details</h3>
              <p className="adm-header__sub">{dateStr}</p>
            </div>
          </div>
          <div className="adm-header__right">
            <span className="adm-statut-badge"
              style={{ color: statut.color, background: statut.bg }}>
              {statut.label}
            </span>
            <button className="adm-close" onClick={onClose}>
              X
            </button>
          </div>
        </div>

        

        {/* ── Main: sidebar tabs + content ── */}
        <div className="adm-main">

          {/* Left sidebar — vertical tabs */}
          <div className="adm-sidebar">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                className={`adm-sidebar-tab ${activeTab === tab.id ? "adm-sidebar-tab--active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Right content area */}
          <div className="adm-content">

            {activeTab === "status" && (
              <div className="adm-section">
                <div className="adm-field">
                  <span className="adm-field__label">Reason for Visit</span>
                  <p className="adm-field__value">{motif}</p>
                </div>
                <div className="adm-field">
                  <span className="adm-field__label">Status</span>
                  <span className="adm-field__badge"
                    style={{ color: statut.color, background: statut.bg }}>
                    {statut.label}
                  </span>
                </div>
                <div className="adm-field">
                  <span className="adm-field__label">Date & Time</span>
                  <p className="adm-field__value">{dateStr}</p>
                </div>
                {appointment?.patient && (
                  <>
                    <div className="adm-field">
                      <span className="adm-field__label">Patient</span>
                      <p className="adm-field__value">
                        {appointment.patient.prenom} {appointment.patient.nom}
                      </p>
                    </div>
                    {appointment.patient.telephone && (
                      <div className="adm-field">
                        <span className="adm-field__label">Phone</span>
                        <p className="adm-field__value">{appointment.patient.telephone}</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {activeTab === "diagnostic" && (
              <div className="adm-section">
                
                <div className="adm-field">
                  <span className="adm-field__label">Diagnostic Notes</span>
                  <div className="adm-empty-note">
                    
                    <p>No diagnostic recorded yet.</p>
                    <span>The doctor will fill this after the consultation.</span>
                  </div>
                </div>
                
              </div>
            )}

            {activeTab === "treatment" && (
              <div className="adm-section">
                <div className="adm-field">
                  <span className="adm-field__label">Prescribed Medicines</span>
                  <div className="adm-empty-note">
                    
                    <p>No prescriptions recorded yet.</p>
                    <span>Prescriptions will appear here after the consultation.</span>
                  </div>
                </div>
                
              </div>
            )}

          </div>
        </div>

        {/* ── Footer ── */}
        <div className="adm-footer">
          <button className="adm-btn adm-btn--secondary" onClick={onClose}>
            Close
          </button>
        </div>

      </div>
    </div>
  );
}