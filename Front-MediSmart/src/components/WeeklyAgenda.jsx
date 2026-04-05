import React, { useState } from "react";
import "./doctorspage.css";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOURS = ["09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00"];

function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun
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
  const end = addDays(weekStart, 6);
  const opts = { month: "long", day: "numeric" };
  const optsEnd = { day: "numeric", year: "numeric" };
  return `${weekStart.toLocaleDateString("en-US", opts)} - ${end.toLocaleDateString("en-US", optsEnd)}`;
}

const ChevronLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const ChevronRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const PlusIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

export default function WeeklyAgenda() {
  const [weekStart, setWeekStart] = useState(getWeekStart(new Date()));
  const [appointments, setAppointments] = useState([
    { id: 1, dayOffset: 0, hour: "09:00", name: "Sarah M.", tag: "new" },
    { id: 2, dayOffset: 1, hour: "11:00", name: "Sarah M.", tag: "new" },
    { id: 3, dayOffset: 3, hour: "10:00", name: "Sarah M.", tag: "new" },
    { id: 4, dayOffset: 4, hour: "14:00", name: "Sarah M.", tag: "new" },
  ]);
  const [adding, setAdding] = useState(null); // { dayOffset, hour }
  const [form, setForm] = useState({ name: "", tag: "new" });

  const prevWeek = () => setWeekStart(w => addDays(w, -7));
  const nextWeek = () => setWeekStart(w => addDays(w, 7));

  const weekDays = DAYS.map((label, i) => ({
    label,
    date: addDays(weekStart, i),
    offset: i,
  }));

  const getAppt = (dayOffset, hour) =>
    appointments.filter(a => a.dayOffset === dayOffset && a.hour === hour);

  const handleCellClick = (dayOffset, hour) => {
    const existing = getAppt(dayOffset, hour);
    if (existing.length === 0) {
      setAdding({ dayOffset, hour });
      setForm({ name: "", tag: "new" });
    }
  };

  const handleAdd = () => {
    if (!form.name.trim()) return;
    setAppointments(prev => [
      ...prev,
      { id: Date.now(), dayOffset: adding.dayOffset, hour: adding.hour, name: form.name, tag: form.tag },
    ]);
    setAdding(null);
  };

  const handleDelete = (id, e) => {
    e.stopPropagation();
    setAppointments(prev => prev.filter(a => a.id !== id));
  };

  return (
    <div className="agenda-outer">
      {/* Top bar */}
      <div className="agenda-topbar">
        <span className="agenda-range">{formatRange(weekStart)}</span>
        <div className="agenda-nav">
          <button className="nav-btn" onClick={prevWeek}><ChevronLeft /></button>
          <div className="nav-divider" />
          <button className="nav-btn" onClick={nextWeek}><ChevronRight /></button>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="agenda-grid-wrapper">
        <div className="agenda-grid">
          {/* Header row */}
          <div className="agenda-time-col header-spacer" />
          {weekDays.map(({ label, date, offset }) => (
            <div key={offset} className="agenda-day-header">
              <span className="day-label">{label}</span>
              <span className="day-number">{date.getDate()}</span>
            </div>
          ))}

          {/* Hour rows */}
          {HOURS.map(hour => (
            <React.Fragment key={hour}>
              <div className="agenda-time-col">
                <span>{hour}</span>
              </div>
              {weekDays.map(({ offset }) => {
                const appts = getAppt(offset, hour);
                const isAdding = adding && adding.dayOffset === offset && adding.hour === hour;
                return (
                  <div
                    key={offset}
                    className="agenda-cell"
                    onClick={() => handleCellClick(offset, hour)}
                  >
                    {appts.map(appt => (
                      <div key={appt.id} className="appt-card-doc" onClick={e => e.stopPropagation()}>
                        <span className="appt-name">{appt.name}</span>
                        <span className="appt-tag">{appt.tag}</span>
                        <button className="appt-delete" onClick={e => handleDelete(appt.id, e)}>×</button>
                      </div>
                    ))}
                    {appts.length === 0 && !isAdding && (
                      <div className="cell-plus"><PlusIcon /></div>
                    )}
                    {isAdding && (
                      <div className="appt-form" onClick={e => e.stopPropagation()}>
                        <input
                          autoFocus
                          className="appt-input"
                          placeholder="Patient name"
                          value={form.name}
                          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                          onKeyDown={e => { if (e.key === "Enter") handleAdd(); if (e.key === "Escape") setAdding(null); }}
                        />
                        <div className="appt-form-actions">
                          <button className="appt-save" onClick={handleAdd}>Add</button>
                          <button className="appt-cancel" onClick={() => setAdding(null)}>✕</button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}