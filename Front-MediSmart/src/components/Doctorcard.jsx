import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { isAuthenticated } from "../services/authService";
import BookingModal from "./BookingModal";
import TicketModal from "./TicketModal";
import "./cmp.css";

// ── Status Badge — only Available or Absent ───────────────────
const StatusBadge = ({ statut }) => {
  // disponible OR en_consultation → Available
  const isOnline = statut === "disponible" || statut === "en_consultation";
  return isOnline
    ? <span className="badge badge--available">Available</span>
    : <span className="badge badge--absent">Absent</span>;
};

// ── Star Rating ──────────────────────────────────────────────
const StarRating = ({ note }) => {
  const stars = [];
  const full  = Math.floor(note || 0);
  const half  = (note - full) >= 0.5;
  for (let i = 1; i <= 5; i++) {
    if (i <= full)                   stars.push(<span key={i} className="star star--full">★</span>);
    else if (i === full + 1 && half) stars.push(<span key={i} className="star star--half">★</span>);
    else                             stars.push(<span key={i} className="star star--empty">★</span>);
  }
  return (
    <div className="star-row">
      {stars}
      <span className="star-score">{note ? Number(note).toFixed(1) : "—"}</span>
    </div>
  );
};

// ── Doctor Card ──────────────────────────────────────────────
const DoctorCard = ({ doctor, index = 0 }) => {
  const API_BASE = "http://localhost:5000";
  const navigate = useNavigate();
  const photoUrl = doctor.photo ? `${API_BASE}${doctor.photo}` : null;
  const initials = `${doctor.prenom?.[0] ?? ""}${doctor.nom?.[0] ?? ""}`.toUpperCase();

  const [showBooking, setShowBooking] = useState(false);
  const [showTicket,  setShowTicket]  = useState(false);

  const handleBook = () => {
    if (!isAuthenticated()) navigate("/login");
    else setShowBooking(true);
  };

  const handleTicket = () => {
    if (!isAuthenticated()) navigate("/login");
    else setShowTicket(true);
  };

  return (
    <>
      <div className="doctor-card" style={{ animationDelay: `${index * 80}ms` }}>

        <div className="doctor-card__overlay">
          <button className="overlay-btn overlay-btn--appointment" onClick={handleBook}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8"  y1="2" x2="8"  y2="6"/>
              <line x1="3"  y1="10" x2="21" y2="10"/>
            </svg>
            Book Appointment
          </button>
          <button className="overlay-btn overlay-btn--ticket" onClick={handleTicket}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2">
              <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2z"/>
            </svg>
            Same-Day Ticket
          </button>
        </div>

        <div className="doctor-card__content">
          <div className="doctor-card__header">
            <div className="doctor-card__avatar-wrap">
              {photoUrl ? (
                <img src={photoUrl} alt={`Dr. ${doctor.prenom} ${doctor.nom}`}
                  className="doctor-card__avatar" />
              ) : (
                <div className="doctor-card__avatar doctor-card__avatar--initials">
                  {initials}
                </div>
              )}
            </div>
            <div className="doctor-card__info">
              <div className="doctor-card__name-row">
                <h3 className="doctor-card__name">Dr. {doctor.prenom} {doctor.nom}</h3>
                <StatusBadge statut={doctor.statut} />
              </div>
              <p className="doctor-card__specialty">{doctor.specialite}</p>
              <StarRating note={doctor.evaluation} />
            </div>
          </div>
          <div className="doctor-card__footer">
            <div className="doctor-card__meta">
              <span className="meta-item meta-item--patients">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
                {doctor.nb_evaluations ?? 0} patients
              </span>
              <span className="meta-item meta-item--time">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
                ~15 min
              </span>
            </div>
          </div>
        </div>
      </div>

      {showBooking && (
        <BookingModal doctor={doctor} onClose={() => setShowBooking(false)} />
      )}
      {showTicket && (
        <TicketModal doctor={doctor} onClose={() => setShowTicket(false)} />
      )}
    </>
  );
};

export default DoctorCard;