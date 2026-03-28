import { useEffect, useState } from 'react';
import { getToken } from '../services/authService';
import './patient.css';

const API_BASE = "http://localhost:5000/api";

// Format date: "March 20" + "10:30 AM"
const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  const day = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  const time = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  return { day, time };
};

const statusLabel = {
  planifie: 'Planned',
  confirme: 'Confirmed',
};

function Nextapp() {
  const [rdv,     setRdv]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNext = async () => {
      try {
        const res  = await fetch(`${API_BASE}/patient/dashboard/next-appointment`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        const json = await res.json();
        if (json.success) setRdv(json.data); // null if none
      } catch (err) {
        console.error("Erreur next appointment:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchNext();
  }, []);

  const initials = rdv
    ? `${rdv.medecin_prenom?.[0] ?? ""}${rdv.medecin_nom?.[0] ?? ""}`.toUpperCase()
    : "";

  const { day, time } = rdv ? formatDate(rdv.date_heure) : {};

  return (
    <div className="appointment-card">
      <div className="appointment-card__header">
        <span className="appointment-card__title">Next Appointment</span>
        <a href="/appointments" className="appointment-card__view-all">View all</a>
      </div>

      {/* Loading */}
      {loading && (
        <div className="appointment-card__empty">Loading...</div>
      )}

      {/* No appointment */}
      {!loading && !rdv && (
        <div className="appointment-card__empty">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
            stroke="#cbd5e1" strokeWidth="1.5">
            <rect x="3" y="4" width="18" height="18" rx="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8"  y1="2" x2="8"  y2="6"/>
            <line x1="3"  y1="10" x2="21" y2="10"/>
          </svg>
          <p>You have no upcoming appointments.</p>
          <a href="/doctors" className="appointment-card__book-btn">Book one now →</a>
        </div>
      )}

      {/* Next appointment */}
      {!loading && rdv && (
        <div className="appointment-card__row">
          <div className="appointment-card__left">
            <div className="appointment-card__avatar">{initials}</div>
            <div className="appointment-card__info">
              <span className="appointment-card__name">
                Dr. {rdv.medecin_prenom} {rdv.medecin_nom}
              </span>
              <span className="appointment-card__specialty">{rdv.specialite}</span>
            </div>
          </div>

          <div className="appointment-card__right">
            <div className="appointment-card__date">
              <span className="appointment-card__date-day">{day}</span>
              <span className="appointment-card__date-time">{time}</span>
            </div>
            <span className="appointment-card__status">
              {statusLabel[rdv.statut] ?? rdv.statut}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default Nextapp;
 