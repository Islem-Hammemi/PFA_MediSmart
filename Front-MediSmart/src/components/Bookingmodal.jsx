import React, { useState, useEffect } from "react";
import "./bookingmodal.css";
import { getToken } from "../services/authService";

const API_BASE = "http://localhost:5000";

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const DAYS = ["Mo","Tu","We","Th","Fr","Sa","Su"];
const MORNING_SLOTS   = ["09:00 AM","09:30 AM","10:00 AM","11:30 AM"];
const AFTERNOON_SLOTS = ["01:00 PM","02:30 PM","03:00 PM","04:30 PM"];

function getDaysInMonth(year, month) { return new Date(year, month + 1, 0).getDate(); }
function getFirstDayOfMonth(year, month) {
  let d = new Date(year, month, 1).getDay();
  return d === 0 ? 6 : d - 1;
}
const to24h = (timeStr) => {
  const pad = (n) => String(n).padStart(2, "0");
  const [time, period] = timeStr.split(" ");
  let [h, m] = time.split(":").map(Number);
  if (period === "PM" && h !== 12) h += 12;
  if (period === "AM" && h === 12) h = 0;
  return `${pad(h)}:${pad(m)}`;
};
const buildDateHeure = (selectedDate, selectedTime) => {
  const pad = (n) => String(n).padStart(2, "0");
  const { year, month, day } = selectedDate;
  return `${year}-${pad(month + 1)}-${pad(day)} ${to24h(selectedTime)}:00`;
};

function Calendar({ selected, onSelect }) {
  const today = new Date();
  const [year, setYear]   = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay    = getFirstDayOfMonth(year, month);
  const cells = Array(firstDay).fill(null)
    .concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y-1); } else setMonth(m => m-1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y+1); } else setMonth(m => m+1); };

  const isToday    = (d) => d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  const isPast     = (d) => new Date(year, month, d) < new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const isSelected = (d) => selected && selected.day === d && selected.month === month && selected.year === year;

  return (
    <div className="bm-calendar">
      <div className="bm-calendar__nav">
        <span className="bm-calendar__month">{MONTHS[month]} {year}</span>
        <div className="bm-calendar__arrows">
          <button onClick={prevMonth} className="bm-calendar__arrow">‹</button>
          <button onClick={nextMonth} className="bm-calendar__arrow">›</button>
        </div>
      </div>
      <div className="bm-calendar__grid">
        {DAYS.map(d => <div key={d} className="bm-calendar__day-label">{d}</div>)}
        {cells.map((d, i) => (
          <div
            key={i}
            className={[
              "bm-calendar__cell",
              !d               ? "bm-calendar__cell--empty"    : "",
              d && isPast(d)   ? "bm-calendar__cell--past"     : "",
              d && isToday(d)  ? "bm-calendar__cell--today"    : "",
              d && isSelected(d) ? "bm-calendar__cell--selected" : "",
            ].join(" ")}
            onClick={() => d && !isPast(d) && onSelect({ day: d, month, year })}
          >
            {d || ""}
          </div>
        ))}
      </div>
    </div>
  );
}

function BookingModal({ doctor, onClose }) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [reason,       setReason]       = useState("");
  const [submitted,    setSubmitted]    = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState(null);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const photoUrl  = doctor.photo ? `${API_BASE}${doctor.photo}` : null;
  const initials  = `${doctor.prenom?.[0] ?? ""}${doctor.nom?.[0] ?? ""}`.toUpperCase();
  const canSubmit = selectedDate && selectedTime && !loading;

  const formatDate = () => {
    if (!selectedDate) return "Not selected";
    return `${MONTHS[selectedDate.month]} ${selectedDate.day}, ${selectedDate.year}`;
  };

  const handleConfirm = async () => {
    if (!canSubmit) return;
    setLoading(true); setError(null);
    try {
      const dateHeure = buildDateHeure(selectedDate, selectedTime);
      const res = await fetch(`${API_BASE}/api/rendez-vous`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ medecinId: doctor.id, dateHeure, motif: reason.trim() || null }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      setSubmitted(true);
      window.dispatchEvent(new Event("appointment-booked"));
    } catch (err) {
      setError(err.message || "Could not book appointment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bm-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bm-modal">

        {/* Header */}
        <div className="bm-modal__header">
          <h2 className="bm-modal__title">Book Appointment</h2>
          <button className="bm-modal__close" onClick={onClose}>✕</button>
        </div>

        {submitted ? (
          <div className="bm-success">
            <div className="bm-success__icon">✓</div>
            <h3>Appointment Confirmed!</h3>
            <p>Your appointment with Dr. {doctor.prenom} {doctor.nom} is booked for</p>
            <strong>{formatDate()} at {selectedTime}</strong>
            <button className="bm-btn bm-btn--primary" onClick={onClose} style={{ marginTop: 24 }}>Done</button>
          </div>
        ) : (
          <div className="bm-modal__body">

            {/* ── LEFT ── */}
            <div className="bm-modal__left">

              {/* 1. Doctor */}
              <div className="doc bm-card">
                <div className="bm-doctor">
                  {photoUrl
                    ? <img src={photoUrl} alt="" className="bm-doctor__photo" />
                    : <div className="bm-doctor__initials">{initials}</div>
                  }
                  <div className="bm-doctor__info">
                    <h3 className="bm-doctor__name">Dr. {doctor.prenom} {doctor.nom}</h3>
                    <p className="bm-doctor__specialty">{doctor.specialite}</p>
                    <div className="bm-doctor__meta">
                      <span className="bm-doctor__star"> {doctor.evaluation ? Number(doctor.evaluation).toFixed(1) : "—"}</span>
                      <span className="bm-doctor__wait">· ~15 min avg wait</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Calendar */}
              <div className="cal bm-card">
                <p className="bm-section__label">2. Select Date &amp; Time</p>
                <Calendar selected={selectedDate} onSelect={setSelectedDate} />
                {selectedDate && (
                  <div className="bm-slots">
                    <p className="bm-slots__group">MORNING</p>
                    <div className="bm-slots__row">
                      {MORNING_SLOTS.map(t => (
                        <button key={t} className={`bm-slot ${selectedTime === t ? "bm-slot--active" : ""}`} onClick={() => setSelectedTime(t)}>{t}</button>
                      ))}
                    </div>
                    <p className="bm-slots__group">AFTERNOON</p>
                    <div className="bm-slots__row">
                      {AFTERNOON_SLOTS.map(t => (
                        <button key={t} className={`bm-slot ${selectedTime === t ? "bm-slot--active" : ""}`} onClick={() => setSelectedTime(t)}>{t}</button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 3. Reason */}
              <div className="bm-sectionn bm-card">
                <p className="bm-section__label">3. Reason for Visit</p>
                <textarea
                  className="bm-textarea"
                  placeholder="Briefly describe your symptoms or reason for consultation..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                />
              </div>

            </div>

            {/* ── RIGHT ── */}
            <div className="bm-modal__right">
              <div className="bm-summary">
                <h4 className="bm-summary__title">Booking Summary</h4>

                <div className="bm-summary__item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8"  y1="2" x2="8"  y2="6"/>
                    <line x1="3"  y1="10" x2="21" y2="10"/>
                  </svg>
                  <div>
                    <span className="bm-summary__label">Date</span>
                    <span className="bm-summary__value">{formatDate()}</span>
                  </div>
                </div>

                <div className="bm-summary__item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                  <div>
                    <span className="bm-summary__label">Time</span>
                    <span className="bm-summary__value">{selectedTime || "Not selected"}</span>
                  </div>
                </div>

                {error && (
                  <p style={{ color:"#e53e3e", fontSize:"0.75rem", marginTop:"6px", textAlign:"center" }}>{error}</p>
                )}

                <button
                  className={`bm-btn bm-btn--primary bm-btn--full ${!canSubmit ? "bm-btn--disabled" : ""}`}
                  onClick={handleConfirm}
                  disabled={!canSubmit}
                >
                  {loading ? "Booking…" : "Confirm Booking"}
                </button>

                {!canSubmit && !loading && (
                  <p className="bm-summary__hint">Please select a date and time to continue</p>
                )}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}

export default BookingModal;