import React, { useState, useEffect } from "react";
import "./doctorspage.css";

const API_BASE = "http://localhost:5000";

const PlayIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <polygon points="5,3 19,12 5,21" />
  </svg>
);

function NowServingBadge() {
  return <span className="now-serving-badge">NOW SERVING</span>;
}

function TypeBadge({ type }) {
  return (
    <span className={`type-badge type-badge--${type}`}>
      {type === "ticket" ? " Ticket" : " RDV"}
    </span>
  );
}

function ServeButton({ onClick }) {
  return (
    <button className="tq-serve-btn" onClick={onClick}>
      <PlayIcon size={12} />
      Serve
    </button>
  );
}

const pillStyle = {
  display: "flex", alignItems: "center", gap: "7px",
  background: "#f7f8fc", borderRadius: "10px", padding: "10px 16px",
  fontSize: "12px", color: "#5f6880",
};

const strongStyle = { color: "#1a1f36", fontWeight: 500 };

function EmptyQueue({ lastFetched }) {
  const [secondsAgo, setSecondsAgo] = useState(0);

  useEffect(() => {
    if (!lastFetched) return;
    setSecondsAgo(0);
    const tick = setInterval(() => {
      setSecondsAgo(Math.floor((Date.now() - lastFetched) / 1000));
    }, 1000);
    return () => clearInterval(tick);
  }, [lastFetched]);

  const timeLabel =
    secondsAgo < 5  ? "just now" :
    secondsAgo < 60 ? `${secondsAgo}s ago` :
                      `${Math.floor(secondsAgo / 60)}m ago`;

  const nextRefresh = Math.max(0, 2 - secondsAgo);

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      alignItems: "center", gap: "20px",
      padding: "56px 32px",
    }}>
      <div style={{
        width: "72px", height: "72px", borderRadius: "50%",
        background: "#f0f4ff",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none"
          stroke="#4a7aff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      </div>

      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: "17px", fontWeight: 500, color: "#1a1f36", margin: "0 0 8px" }}>
          Queue is clear
        </p>
        <p style={{ fontSize: "13px", color: "#8a90aa", maxWidth: "320px", lineHeight: 1.6, margin: 0 }}>
          No patients are waiting right now. New patients will appear here when
          they check in or book an appointment.
        </p>
      </div>

      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
        <div style={pillStyle}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
          Last updated&nbsp;<strong style={strongStyle}>{timeLabel}</strong>
        </div>

        <div style={pillStyle}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10"/>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
          </svg>
          Next refresh in&nbsp;<strong style={strongStyle}>{nextRefresh}s</strong>
        </div>
      </div>
    </div>
  );
}

export default function TicketQueue({
  currentPatient = null,
  queue = [],
  loading = false,
  onServe,
  lastFetched = null,
}) {
  if (loading) {
    return (
      <div className="ticket-queue-wrapper">
        <div className="queue-table">
          {[1, 2, 3].map(i => (
            <div key={i} className="queue-row" style={{ opacity: 0.4 }}>
              <span>—</span><span>Loading...</span><span>—</span><span>—</span><span>—</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="ticket-queue-wrapper">

      {/* ── Currently serving ── */}
      {currentPatient ? (
        <div className="current-patient">
          <div className="current-left">
            <span className="current-ticket">
              {currentPatient.source_type === "ticket" && currentPatient.ticket_numero
                ? `T-${String(currentPatient.ticket_numero).padStart(3, "0")}`
                : "RDV"}
            </span>
            <div className="current-info">
              <span className="current-name">{currentPatient.patient_nom}</span>
              <span className="current-checkin">
                • Checked in at &nbsp;<strong>{currentPatient.heure_affichee}</strong>
              </span>
            </div>
          </div>
          <NowServingBadge />
        </div>
      ) : null}

      {/* ── Waiting queue or empty state ── */}
      {queue.length === 0 ? (
        <EmptyQueue lastFetched={lastFetched} />
      ) : (
        <div className="tq-wrapper">
          {/* Column headers */}
          <div className="tq-table-header">
            <span>Ticket</span>
            <span>Patient</span>
            <span>Type</span>
            <span>Checked In</span>
            <span></span>
          </div>

          <div className="tq-list">
            {queue.map((patient, index) => (
              <div
                key={`${patient.source_type}-${patient.source_id}`}
                className={`tq-row ${index === 0 ? "next-row" : ""}`}
              >
                {/* Ticket */}
                <div className="queue-ticket-cell">
                  <span className={`queue-ticket ${index === 0 ? "ticket-orange" : "ticket-gray"}`}>
                    {patient.source_type === "ticket" && patient.ticket_numero
                      ? `T-${String(patient.ticket_numero).padStart(3, "0")}`
                      : "RDV"}
                  </span>
                  {index === 0 && <span className="next-badge">NEXT</span>}
                </div>

                {/* Patient */}
                <div className="tq-patient">
                  <span className="tq-name">{patient.patient_nom}</span>
                </div>

                {/* Type */}
                <TypeBadge type={patient.source_type} />

                {/* Checked In */}
                <span className="tq-time">{patient.heure_affichee}</span>

                {/* Action — same row, right after time */}
                <ServeButton onClick={() => onServe && onServe(patient)} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}