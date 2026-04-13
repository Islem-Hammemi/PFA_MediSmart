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

const toFriendlyError = (rawMessage) => {
  if (!rawMessage) return "Something went wrong. Please try again.";
  if (
    rawMessage.length < 120 &&
    !/Error:|SQL|mysql|ER_|duplicate entry|ECONNREFUSED|stack trace/i.test(rawMessage)
  ) {
    return rawMessage;
  }
  if (/duplicate entry/i.test(rawMessage))
    return "This slot is already booked. Please choose another time.";
  if (/ECONNREFUSED|ETIMEDOUT|network/i.test(rawMessage))
    return "Cannot reach the server. Please check your connection.";
  if (/unauthorized|401/i.test(rawMessage))
    return "Your session has expired. Please log in again.";
  if (/forbidden|403/i.test(rawMessage))
    return "You do not have permission to do this.";
  return "Something went wrong. Please try again.";
};

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

const isSlotPast = (selectedDate, timeStr) => {
  if (!selectedDate) return false;
  const today = new Date();
  const isTodayDate =
    selectedDate.day   === today.getDate()    &&
    selectedDate.month === today.getMonth()   &&
    selectedDate.year  === today.getFullYear();
  if (!isTodayDate) return false;
  const [time, period] = timeStr.split(" ");
  let [h, m] = time.split(":").map(Number);
  if (period === "PM" && h !== 12) h += 12;
  if (period === "AM" && h === 12) h = 0;
  const slotDate = new Date();
  slotDate.setHours(h, m, 0, 0);
  return slotDate <= new Date();
};

const isToday = (selectedDate) => {
  if (!selectedDate) return false;
  const today = new Date();
  return (
    selectedDate.day   === today.getDate()    &&
    selectedDate.month === today.getMonth()   &&
    selectedDate.year  === today.getFullYear()
  );
};

function Calendar({ selected, onSelect }) {
  const today = new Date();
  const [year, setYear]   = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay    = getFirstDayOfMonth(year, month);
  const cells = Array(firstDay).fill(null)
    .concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));

  const prevMonth = () => {
    const now = new Date();
    if (year === now.getFullYear() && month === now.getMonth()) return;
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  const isPast     = (d) => new Date(year, month, d) < new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const isTodayDay = (d) => d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  const isSelected = (d) => selected && selected.day === d && selected.month === month && selected.year === year;

  return (
    <div className="bm-calendar">
      <div className="bm-calendar__nav">
        <span className="bm-calendar__month">{MONTHS[month]} {year}</span>
        <div className="bm-calendar__arrows">
          <button onClick={prevMonth} className="bm-calendar__arrow">&#8249;</button>
          <button onClick={nextMonth} className="bm-calendar__arrow">&#8250;</button>
        </div>
      </div>
      <div className="bm-calendar__grid">
        {DAYS.map(d => <div key={d} className="bm-calendar__day-label">{d}</div>)}
        {cells.map((d, i) => (
          <div
            key={i}
            className={[
              "bm-calendar__cell",
              !d                 ? "bm-calendar__cell--empty"    : "",
              d && isPast(d)     ? "bm-calendar__cell--past"     : "",
              d && isTodayDay(d) ? "bm-calendar__cell--today"    : "",
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
  const [bookedTimes,  setBookedTimes]  = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [hasRdvOnDate, setHasRdvOnDate] = useState(false);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  // Fetch booked slots for selected date
  useEffect(() => {
    if (!selectedDate || !doctor?.id) return;
    const fetchBookedSlots = async () => {
      setLoadingSlots(true);
      try {
        const pad = (n) => String(n).padStart(2, "0");
        const dateStr = `${selectedDate.year}-${pad(selectedDate.month + 1)}-${pad(selectedDate.day)}`;
        const res  = await fetch(`${API_BASE}/api/rendez-vous/disponibilite/${doctor.id}/${dateStr}`);
        const json = await res.json();
        if (json.success) setBookedTimes(json.booked || []);
      } catch {
        setBookedTimes([]);
      } finally {
        setLoadingSlots(false);
      }
    };
    fetchBookedSlots();
  }, [selectedDate, doctor?.id]);

  // Check if patient already has an RDV on selected date
  useEffect(() => {
    if (!selectedDate) { setHasRdvOnDate(false); return; }
    const checkMyRdv = async () => {
      try {
        const res  = await fetch(`${API_BASE}/api/rendez-vous/upcoming`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        const json = await res.json();
        if (!json.success) return;
        const pad = (n) => String(n).padStart(2, "0");
        const dateStr = `${selectedDate.year}-${pad(selectedDate.month + 1)}-${pad(selectedDate.day)}`;
        const already = (json.data || []).some(rdv =>
          rdv.date_heure?.startsWith(dateStr)
        );
        setHasRdvOnDate(already);
      } catch {
        setHasRdvOnDate(false);
      }
    };
    checkMyRdv();
  }, [selectedDate]);

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setBookedTimes([]);
    setHasRdvOnDate(false);
    setError(null);
    if (selectedTime && isSlotPast(date, selectedTime)) setSelectedTime(null);
  };

  const photoUrl = doctor.photo ? `${API_BASE}${doctor.photo}` : null;
  const initials = `${doctor.prenom?.[0] ?? ""}${doctor.nom?.[0] ?? ""}`.toUpperCase();

  const doctorAbsentToday = doctor.statut === "absent" && selectedDate && isToday(selectedDate);
  const canSubmit = selectedDate && selectedTime && !loading && !doctorAbsentToday && !hasRdvOnDate;

  const formatDate = () => {
    if (!selectedDate) return "Not selected";
    return `${MONTHS[selectedDate.month]} ${selectedDate.day}, ${selectedDate.year}`;
  };

  const refetchBooked = () => {
    if (!selectedDate || !doctor?.id) return;
    const pad = (n) => String(n).padStart(2, "0");
    const dateStr = `${selectedDate.year}-${pad(selectedDate.month + 1)}-${pad(selectedDate.day)}`;
    fetch(`${API_BASE}/api/rendez-vous/disponibilite/${doctor.id}/${dateStr}`)
      .then(r => r.json())
      .then(j => { if (j.success) setBookedTimes(j.booked || []); })
      .catch(() => {});
  };

  const handleConfirm = async () => {
    if (!canSubmit) return;

    if (isSlotPast(selectedDate, selectedTime)) {
      setError("This time has already passed. Please select another slot.");
      setSelectedTime(null);
      return;
    }

    if (doctorAbsentToday) {
      setError("This doctor is absent today. Please pick a future date.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/api/rendez-vous`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          medecinId: doctor.id,
          dateHeure: buildDateHeure(selectedDate, selectedTime),
          motif: reason.trim() || null,
        }),
      });

      const json = await res.json();

      if (!json.success) {
        setError(toFriendlyError(json.message));
        if (/taken|booked|unavailable|already/i.test(json.message || "")) {
          setSelectedTime(null);
          refetchBooked();
        }
        return;
      }

      setSubmitted(true);
      window.dispatchEvent(new Event("appointment-booked"));
    } catch {
      setError("Cannot reach the server. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderSlot = (t) => {
    const past     = isSlotPast(selectedDate, t);
    const booked   = !past && bookedTimes.includes(t);
    const disabled = past || booked || loadingSlots || hasRdvOnDate;

    return (
      <button
        key={t}
        className={`bm-slot ${selectedTime === t ? "bm-slot--active" : ""}`}
        onClick={() => !disabled && setSelectedTime(t)}
        disabled={disabled}
        title={past ? "Time already passed" : booked ? "Already booked" : ""}
        style={disabled ? {
          opacity: 0.4,
          cursor: "not-allowed",
          textDecoration: "line-through",
          background: booked ? "#fee2e2" : undefined,
          color:      booked ? "#ef4444" : undefined,
        } : {}}
      >
        {t}
        {booked && (
          <span style={{ fontSize: "9px", display: "block", color: "#ef4444", fontWeight: 600 }}>
            Taken
          </span>
        )}
      </button>
    );
  };

  return (
    <div className="bm-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bm-modal">
        <div className="bm-modal__header">
          <h2 className="bm-modal__title">Book Appointment</h2>
          <button className="bm-modal__close" onClick={onClose}>&#x2715;</button>
        </div>

        {submitted ? (
          <div className="bm-success">
            <div className="bm-success__icon">&#x2713;</div>
            <h3>Appointment Confirmed!</h3>
            <p>Your appointment with Dr. {doctor.prenom} {doctor.nom} is booked for</p>
            <strong>{formatDate()} at {selectedTime}</strong>
            <button className="bm-btn bm-btn--primary" onClick={onClose} style={{ marginTop: 24 }}>
              Done
            </button>
          </div>
        ) : (
          <div className="bm-modal__body">
            <div className="bm-modal__left">

              {/* Doctor card */}
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
                      <span className="bm-doctor__star">
                        {doctor.evaluation ? Number(doctor.evaluation).toFixed(1) : "—"}
                      </span>
                      <span className="bm-doctor__wait">· ~15 min avg wait</span>
                    </div>
                    {doctor.statut === "absent" && (
                      <span style={{
                        display: "inline-block", marginTop: "6px",
                        background: "#fef2f2", color: "#dc2626",
                        border: "1px solid #fecaca", borderRadius: "6px",
                        padding: "2px 8px", fontSize: "0.75rem", fontWeight: 600,
                      }}>
                        Absent today
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Calendar */}
              <div className="cal bm-card">
                <p className="bm-section__label">2. Select Date &amp; Time</p>
                <Calendar selected={selectedDate} onSelect={handleDateSelect} />

                {doctorAbsentToday && (
                  <div style={{
                    background: "#fef2f2", border: "1px solid #fecaca",
                    borderRadius: "8px", padding: "10px 14px",
                    color: "#dc2626", fontSize: "0.85rem", marginTop: "10px",
                  }}>
                    This doctor is absent today. Please select a future date.
                  </div>
                )}

                {hasRdvOnDate && (
                  <div style={{
                    background: "#fef2f2", border: "1px solid #fecaca",
                    borderRadius: "8px", padding: "10px 14px",
                    color: "#dc2626", fontSize: "0.85rem", marginTop: "10px",
                  }}>
                    You already have an appointment on this date. Please choose another day.
                  </div>
                )}

                {selectedDate && !doctorAbsentToday && !hasRdvOnDate && (
                  <div className="bm-slots">
                    {loadingSlots && (
                      <p style={{ fontSize: "12px", color: "#94a3b8", margin: "8px 0" }}>
                        Checking availability…
                      </p>
                    )}
                    <p className="bm-slots__group">MORNING</p>
                    <div className="bm-slots__row">{MORNING_SLOTS.map(renderSlot)}</div>
                    <p className="bm-slots__group">AFTERNOON</p>
                    <div className="bm-slots__row">{AFTERNOON_SLOTS.map(renderSlot)}</div>
                  </div>
                )}
              </div>

              {/* Reason */}
              <div className="bm-sectionn bm-card">
                <p className="bm-section__label">3. Reason for Visit</p>
                <textarea
                  className="bm-textarea"
                  placeholder="Briefly describe your symptoms or reason for consultation…"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            {/* Summary */}
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
                  <div style={{
                    background: "#fef2f2", border: "1px solid #fecaca",
                    borderRadius: "8px", padding: "10px 14px",
                    color: "#dc2626", fontSize: "0.82rem", marginTop: "8px",
                    lineHeight: "1.4",
                  }}>
                    {error}
                  </div>
                )}

                <button
                  className={`bm-btn bm-btn--primary bm-btn--full ${!canSubmit ? "bm-btn--disabled" : ""}`}
                  onClick={handleConfirm}
                  disabled={!canSubmit}
                >
                  {loading ? "Booking…" : "Confirm Booking"}
                </button>

                {!canSubmit && !loading && !error && (
                  <p className="bm-summary__hint">
                    {doctorAbsentToday
                      ? "Doctor is absent today — pick another date"
                      : hasRdvOnDate
                      ? "You already have an appointment this day"
                      : "Please select a date and time to continue"}
                  </p>
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