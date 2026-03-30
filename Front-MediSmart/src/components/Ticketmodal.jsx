import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getToken } from "../services/authService";
import "./ticketmodal.css";

const API_BASE = "http://localhost:5000/api";

function TicketModal({ doctor, onClose }) {
  const navigate   = useNavigate();
  const [status, setStatus]   = useState("idle"); // idle | loading | success | duplicate | error
  const [ticket, setTicket]   = useState(null);
  const [errMsg, setErrMsg]   = useState("");

  const photoUrl = doctor.photo ? `http://localhost:5000${doctor.photo}` : null;
  const initials = `${doctor.prenom?.[0] ?? ""}${doctor.nom?.[0] ?? ""}`.toUpperCase();

  // Close on backdrop click
  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleGetTicket = async () => {
    setStatus("loading");
    try {
      const res  = await fetch(`${API_BASE}/tickets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ medecin_id: doctor.id }),
      });
      const json = await res.json();

      if (!json.success) {
        // Check if it's a duplicate ticket error
        if (
          json.message?.toLowerCase().includes("déjà") ||
          json.message?.toLowerCase().includes("already") ||
          res.status === 409
        ) {
          setStatus("duplicate");
        } else {
          setErrMsg(json.message || "Erreur serveur.");
          setStatus("error");
        }
        return;
      }

      setTicket(json.ticket);
      setStatus("success");

    } catch (err) {
      setErrMsg(err.message);
      setStatus("error");
    }
  };

  return (
    <div className="tm-backdrop" onClick={handleBackdrop}>
      <div className="tm-modal">

        {/* ── Idle: confirm screen ── */}
        {status === "idle" && (
          <>
            <div className="tm-modal__header">
              <h2 className="tm-modal__title">Same-Day Ticket</h2>
              <button className="tm-modal__close" onClick={onClose}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6"  y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div className="tm-body">
              <div className="tm-doctor">
                {photoUrl ? (
                  <img src={photoUrl} alt="" className="tm-doctor__photo" />
                ) : (
                  <div className="tm-doctor__initials">{initials}</div>
                )}
                <div>
                  <h3 className="tm-doctor__name">Dr. {doctor.prenom} {doctor.nom}</h3>
                  <p className="tm-doctor__specialty">{doctor.specialite}</p>
                </div>
              </div>

              <div className="tm-info-box">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <p>You'll join the queue immediately. Only one ticket  per day is allowed.</p>
              </div>

              <div className="tm-actions">
                <button className="tm-btn tm-btn--secondary" onClick={onClose}>
                  Cancel
                </button>
                <button className="tm-btn tm-btn--primary" onClick={handleGetTicket}>
                  Get My Ticket
                </button>
              </div>
            </div>
          </>
        )}

        {/* ── Loading ── */}
        {status === "loading" && (
          <div className="tm-state">
            <div className="tm-spinner" />
            <p>Generating your ticket...</p>
          </div>
        )}

        {/* ── Success ── */}
        {status === "success" && ticket && (
          <>
            <div className="tm-modal__header tm-modal__header--success">
              <h2 className="tm-modal__title">Ticket Created ✓</h2>
              <button className="tm-modal__close" onClick={onClose}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6"  y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div className="tm-body">
              {/* Ticket card */}
              <div className="tm-ticket">
                <div className="tm-ticket__left">
                  <span className="tm-ticket__label">Ticket</span>
                  <span className="tm-ticket__id">
                    #T-2026-{String(ticket.id).padStart(4, "0")}
                  </span>
                </div>
                <div className="tm-ticket__divider" />
                <div className="tm-ticket__right">
                  <div className="tm-ticket__row">
                    <span className="tm-ticket__key">Doctor</span>
                    <span className="tm-ticket__val">{ticket.medecin_nom}</span>
                  </div>
                  <div className="tm-ticket__row">
                    <span className="tm-ticket__key">Specialty</span>
                    <span className="tm-ticket__val">{ticket.specialite}</span>
                  </div>
                  <div className="tm-ticket__row">
                    <span className="tm-ticket__key">Position</span>
                    <span className="tm-ticket__val tm-ticket__val--accent">#{ticket.position}</span>
                  </div>
                  <div className="tm-ticket__row">
                    <span className="tm-ticket__key">Est. Wait</span>
                    <span className="tm-ticket__val">~{ticket.position * 4} min</span>
                  </div>
                </div>
              </div>

              <p className="tm-success__hint">
                Please stay nearby. You'll be called when it's your turn.
              </p>

              <div className="tm-actions">
                <button className="tm-btn tm-btn--secondary" onClick={onClose}>
                  Close
                </button>
                <button
                  className="tm-btn tm-btn--primary"
                  onClick={() => { onClose(); navigate("/queue"); }}
                >
                  Track Queue →
                </button>
              </div>
            </div>
          </>
        )}

        {/* ── Duplicate ticket ── */}
        {status === "duplicate" && (
          <>
            <div className="tm-modal__header tm-modal__header--warning">
              <h2 className="tm-modal__title">Already in Queue</h2>
              <button className="tm-modal__close" onClick={onClose}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6"  y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div className="tm-body">
              <div className="tm-duplicate">
                <div className="tm-duplicate__icon">⚠️</div>
                <h3>You already have a ticket</h3>
               <p>
                  You already have an active ticket today.
                   Only <strong>one ticket per day</strong> is allowed across all doctors.
                </p>
              </div>

              <div className="tm-actions">
                <button className="tm-btn tm-btn--secondary" onClick={onClose}>
                  Close
                </button>
                <button
                  className="tm-btn tm-btn--primary"
                  onClick={() => { onClose(); navigate("/queue"); }}
                >
                  View My Ticket →
                </button>
              </div>
            </div>
          </>
        )}

        {/* ── Error ── */}
        {status === "error" && (
          <div className="tm-state">
            <div className="tm-error-icon">✕</div>
            <p className="tm-error-msg">{errMsg}</p>
            <button className="tm-btn tm-btn--secondary" onClick={onClose}>Close</button>
          </div>
        )}

      </div>
    </div>
  );
}

export default TicketModal;