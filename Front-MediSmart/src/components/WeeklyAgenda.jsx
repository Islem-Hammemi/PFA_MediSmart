import React, { useState, useEffect } from "react";
import { getToken, getCurrentUser } from "../services/authService";
import "./doctorspage.css";


const API_BASE = "http://localhost:5000/api";

const DAYS  = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOURS = ["08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00"];

// ── Helpers ────────────────────────────────────────────────────
function getWeekStart(date) {
  const d   = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function formatRange(weekStart) {
  const end  = addDays(weekStart, 6);
  const opts = { month: "long", day: "numeric" };
  return `${weekStart.toLocaleDateString("en-US", opts)} – ${end.toLocaleDateString("en-US", { day: "numeric", year: "numeric" })}`;
}

function isSameDay(date1, date2) {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth()    === date2.getMonth()    &&
    date1.getDate()     === date2.getDate()
  );
}

function getHourStr(date) {
  return `${String(date.getHours()).padStart(2,"0")}:00`;
}

const STATUS_COLOR = {
  confirme: { bg: "#1e3270", text: "#c8d4ff" },
  planifie: { bg: "#1e4d2b", text: "#a7f3d0" },
  termine:  { bg: "#3a2a00", text: "#fcd34d" },
  annule:   { bg: "#3a0a0a", text: "#fca5a5" },
};

// ── Add RDV Modal ──────────────────────────────────────────────
function AddRdvModal({ selectedSlot, patients, onClose, onSaved }) {
  const [patientId,   setPatientId]   = useState("");
  const [motif,       setMotif]       = useState("");
  const [statut,      setStatut]      = useState("confirme");
  const [dateHeure,   setDateHeure]   = useState(selectedSlot?.datetime ?? "");
  const [submitting,  setSubmitting]  = useState(false);
  const [error,       setError]       = useState("");

  const handleSubmit = async () => {
    if (!patientId || !dateHeure) {
      setError("Patient and date/time are required.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      // ✅ Use doctor-side booking endpoint
      const res  = await fetch(`${API_BASE}/rendez-vous/medecin/reserver`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          patientId: Number(patientId),
          dateHeure: dateHeure.replace("T", " ") + ":00",
          motif,
          statut,
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      onSaved();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="sm-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="sm-modal">
        <div className="sm-header">
          <h3 className="sm-title">Add Appointment</h3>
          <button className="sm-close" onClick={onClose}>✕</button>
        </div>

        <div className="sm-body">
          {error && <p className="sm-error">{error}</p>}

          <div className="sm-field">
            <label className="sm-label">Patient</label>
            <select
              className="sm-select"
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
            >
              <option value="">Select a patient...</option>
              {patients.map((p) => (
                <option key={p.patient_id} value={p.patient_id}>
                  {p.nom_complet}
                </option>
              ))}
            </select>
          </div>

          <div className="sm-field">
            <label className="sm-label">Date & Time</label>
            <input
              className="sm-input"
              type="datetime-local"
              value={dateHeure}
              onChange={(e) => setDateHeure(e.target.value)}
            />
          </div>

          <div className="sm-field">
            <label className="sm-label">Status</label>
            <select
              className="sm-select"
              value={statut}
              onChange={(e) => setStatut(e.target.value)}
            >
              <option value="confirme">Confirmed</option>
              <option value="planifie">Planned</option>
            </select>
          </div>

          <div className="sm-field">
            <label className="sm-label">Reason (optional)</label>
            <textarea
              className="sm-textarea"
              placeholder="Reason for visit..."
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <div className="sm-footer">
          <button className="sm-btn sm-btn--secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className="sm-btn sm-btn--primary"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? "Saving..." : "Save Appointment"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main WeeklyAgenda ──────────────────────────────────────────
export default function WeeklyAgenda() {
  const user = getCurrentUser();

  const [weekStart,    setWeekStart]    = useState(getWeekStart(new Date()));
  const [appointments, setAppointments] = useState([]);
  const [patients,     setPatients]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [showModal,    setShowModal]    = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const weekDays = DAYS.map((label, i) => ({
    label,
    date:   addDays(weekStart, i),
    offset: i,
  }));

  // ── Fetch appointments ─────────────────────────────────────
  const fetchData = async () => {
    setLoading(true);
    try {
      const [planRes, patRes] = await Promise.all([
        fetch(`${API_BASE}/rendez-vous/medecin/planning`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        }),
        fetch(`${API_BASE}/dossiers/mes-patients`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        }),
      ]);

      const planJson = await planRes.json();
      const patJson  = await patRes.json();

      if (planJson.success) {
        // rendezVousService.getPlanningMedecin returns array directly
        const allRdv = Array.isArray(planJson.data)
          ? planJson.data
          : [...(planJson.data?.rdv_a_venir || []), ...(planJson.data?.rdv_passes || [])];
        setAppointments(allRdv);
      }

      if (patJson.success) {
        setPatients(patJson.patients || []);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // ── Get appointments for a cell ────────────────────────────
  const getCellAppts = (dayDate, hour) => {
    return appointments.filter((appt) => {
      if (!appt.date_heure_formatee && !appt.date_heure) return false;
      // Parse date — format is "dd/mm/yyyy à HH:mm" or ISO
      let apptDate;
      if (appt.date_heure_formatee) {
        const [datePart, timePart] = appt.date_heure_formatee.split(" à ");
        const [d, m, y] = datePart.split("/");
        apptDate = new Date(`${y}-${m}-${d}T${timePart}:00`);
      } else {
        apptDate = new Date(appt.date_heure);
      }
      return isSameDay(apptDate, dayDate) && getHourStr(apptDate) === hour;
    });
  };

  // ── Handle cell click → open modal ────────────────────────
  const handleCellClick = (dayDate, hour) => {
    const [h] = hour.split(":");
    const dt  = new Date(dayDate);
    dt.setHours(Number(h), 0, 0, 0);
    const pad = (n) => String(n).padStart(2, "0");
    const datetime = `${dt.getFullYear()}-${pad(dt.getMonth()+1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:00`;
    setSelectedSlot({ dayDate, hour, datetime });
    setShowModal(true);
  };

  const prevWeek = () => setWeekStart((w) => addDays(w, -7));
  const nextWeek = () => setWeekStart((w) => addDays(w, 7));

  return (
    <>
      <div className="agenda-outer">

        {/* Top bar */}
        <div className="agenda-topbar">
          <span className="agenda-range">{formatRange(weekStart)}</span>
          <div className="agenda-nav">
            <button className="nav-btn" onClick={prevWeek}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </button>
            <div className="nav-divider"/>
            <button className="nav-btn" onClick={nextWeek}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          </div>
        </div>

        {loading && (
          <div className="agenda-loading">Loading appointments...</div>
        )}

        {/* Calendar grid */}
        <div className="agenda-grid-wrapper">
          <div className="agenda-grid">

            {/* Header */}
            <div className="agenda-time-col header-spacer"/>
            {weekDays.map(({ label, date, offset }) => (
              <div key={offset} className="agenda-day-header">
                <span className="day-label">{label}</span>
                <span className="day-number">{date.getDate()}</span>
              </div>
            ))}

            {/* Hour rows */}
            {HOURS.map((hour) => (
              <React.Fragment key={hour}>
                <div className="agenda-time-col">
                  <span>{hour}</span>
                </div>
                {weekDays.map(({ date, offset }) => {
                  const appts = getCellAppts(date, hour);
                  return (
                    <div
                      key={offset}
                      className="agenda-cell"
                      onClick={() => handleCellClick(date, hour)}
                    >
                      {appts.map((appt, i) => {
                        const colors = STATUS_COLOR[appt.statut] || STATUS_COLOR.planifie;
                        // Support both flat (date_heure_formatee) and nested (patient.nom) formats
                        const patientName = appt.patient
                          ? `${appt.patient.prenom ?? ""} ${appt.patient.nom ?? ""}`.trim()
                          : (appt.patient_nom || "Patient");
                        return (
                          <div
                            key={i}
                            className="appt-card"
                            style={{ background: colors.bg }}
                            onClick={(e) => e.stopPropagation()}
                            title={`${patientName} — ${appt.motif || "No reason"}`}
                          >
                            <span className="appt-name" style={{ color: colors.text }}>
                              {patientName}
                            </span>
                            <span className="appt-tag" style={{ color: colors.text, opacity: 0.7 }}>
                              {appt.statut}
                            </span>
                          </div>
                        );
                      })}
                      {appts.length === 0 && (
                        <div className="cell-plus">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2.5">
                            <line x1="12" y1="5" x2="12" y2="19"/>
                            <line x1="5"  y1="12" x2="19" y2="12"/>
                          </svg>
                        </div>
                      )}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="agenda-legend">
          {Object.entries(STATUS_COLOR).map(([key, val]) => (
            <span key={key} className="legend-item">
              <span className="legend-dot" style={{ background: val.bg, border: `2px solid ${val.text}` }}/>
              {key}
            </span>
          ))}
        </div>
      </div>

      {/* Add appointment modal */}
      {showModal && (
        <AddRdvModal
          selectedSlot={selectedSlot}
          patients={patients}
          onClose={() => setShowModal(false)}
          onSaved={fetchData}
        />
      )}
    </>
  );
}