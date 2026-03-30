import React, { useState, useEffect } from "react";
import { isAuthenticated } from "../services/authService";
import { useNavigate } from "react-router-dom";
import "./doccmp.css";
import BookingModal from "./BookingModal";
import TicketModal from "./TicketModal";

const API_BASE = "http://localhost:5000/api";
const PER_PAGE = 9;

// ── Status Badge ──────────────────────────────────────────────
const StatusBadge = ({ statut }) => {
  const config = {
    disponible:      { label: "Available", className: "dg-badge dg-badge--available" },
    en_consultation: { label: "Busy",      className: "dg-badge dg-badge--busy"      },
    absent:          { label: "Absent",    className: "dg-badge dg-badge--absent"     },
  };
  const { label, className } = config[statut] || config.absent;
  return <span className={className}>{label}</span>;
};

// ── Star Rating ───────────────────────────────────────────────
const StarRating = ({ note }) => {
  const stars = [];
  const full  = Math.floor(note || 0);
  const half  = (note - full) >= 0.5;
  for (let i = 1; i <= 5; i++) {
    if (i <= full)                   stars.push(<span key={i} className="dg-star dg-star--full">★</span>);
    else if (i === full + 1 && half) stars.push(<span key={i} className="dg-star dg-star--half">★</span>);
    else                             stars.push(<span key={i} className="dg-star dg-star--empty">★</span>);
  }
  return (
    <div className="dg-stars">
      {stars}
      <span className="dg-score">{note ? Number(note).toFixed(1) : "—"}</span>
    </div>
  );
};

// ── Doctor Card ───────────────────────────────────────────────
// Receives onBook and onTicket as props from DoctorsGrid
const DoctorCard = ({ doctor, index, onBook, onTicket }) => {
  const photoUrl = doctor.photo ? `http://localhost:5000${doctor.photo}` : null;
  const initials = `${doctor.prenom?.[0] ?? ""}${doctor.nom?.[0] ?? ""}`.toUpperCase();

  return (
    <div className="dg-card" style={{ animationDelay: `${index * 60}ms` }}>

      <div className="dg-overlay">
        <button
          className="dg-overlay__btn dg-overlay__btn--appointment"
          onClick={() => onBook(doctor)}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8"  y1="2" x2="8"  y2="6"/>
            <line x1="3"  y1="10" x2="21" y2="10"/>
          </svg>
          Book Appointment
        </button>

        <button
          className="dg-overlay__btn dg-overlay__btn--ticket"
          onClick={() => onTicket(doctor)}   // ✅ clean — handled in parent
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2">
            <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2z"/>
          </svg>
          Same-Day Ticket
        </button>
      </div>

      <div className="dg-content">
        <div className="dg-header">
          {photoUrl ? (
            <img src={photoUrl} alt={`Dr. ${doctor.prenom}`} className="dg-avatar" />
          ) : (
            <div className="dg-avatar dg-avatar--initials">{initials}</div>
          )}
          <div className="dg-info">
            <div className="dg-name-row">
              <h3 className="dg-name">Dr. {doctor.prenom} {doctor.nom}</h3>
              <StatusBadge statut={doctor.statut} />
            </div>
            <p className="dg-specialty">{doctor.specialite}</p>
            <StarRating note={doctor.evaluation} />
          </div>
        </div>

        <div className="dg-footer">
          <span className="dg-meta dg-meta--patients">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            {doctor.nb_evaluations ?? 0} patients
          </span>
          <span className="dg-meta dg-meta--time">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            ~15 min
          </span>
        </div>
      </div>
    </div>
  );
};

// ── Pagination ────────────────────────────────────────────────
const Pagination = ({ current, total, onChange }) => {
  if (total <= 1) return null;
  return (
    <div className="dg-pagination">
      <button
        className="dg-page-btn dg-page-btn--arrow"
        onClick={() => onChange(current - 1)}
        disabled={current === 1}
      >‹</button>
      {Array.from({ length: total }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          className={`dg-page-btn ${current === p ? "dg-page-btn--active" : ""}`}
          onClick={() => onChange(p)}
        >{p}</button>
      ))}
      <button
        className="dg-page-btn dg-page-btn--arrow"
        onClick={() => onChange(current + 1)}
        disabled={current === total}
      >›</button>
    </div>
  );
};

// ── Main DoctorsGrid ──────────────────────────────────────────
function DoctorsGrid({ search = "", specialty = "" }) {
  const navigate = useNavigate();

  const [showModal,       setShowModal]       = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [doctor,          setDoctor]          = useState(null);
  const [allDoctors,      setAllDoctors]      = useState([]);
  const [filtered,        setFiltered]        = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [error,           setError]           = useState(null);
  const [page,            setPage]            = useState(1);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res  = await fetch(`${API_BASE}/medecins`);
        if (!res.ok) throw new Error("Erreur serveur");
        const json = await res.json();
        setAllDoctors(json.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  useEffect(() => {
    let result = allDoctors;
    if (search.trim()) {
      const kw = search.toLowerCase();
      result = result.filter(
        (d) =>
          d.nom.toLowerCase().includes(kw)       ||
          d.prenom.toLowerCase().includes(kw)    ||
          d.specialite.toLowerCase().includes(kw)
      );
    }
    if (specialty) {
      result = result.filter((d) => d.specialite === specialty);
    }
    setFiltered(result);
    setPage(1);
  }, [search, specialty, allDoctors]);

  // ── Handlers (auth check lives here) ─────────────────────
  const handleBook = (doc) => {
    if (!isAuthenticated()) navigate("/login");
    else { setDoctor(doc); setShowModal(true); }
  };

  const handleTicket = (doc) => {
    if (!isAuthenticated()) navigate("/login");
    else { setDoctor(doc); setShowTicketModal(true); }
  };

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const visible    = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <>
      <div className="dg-wrap">

        <p className="dg-count">
          <span className="dg-count__num">{filtered.length}</span> doctors found
        </p>

        {loading && (
          <div className="dg-grid">
            {[1,2,3,4,5,6].map((i) => <div key={i} className="dg-skeleton" />)}
          </div>
        )}

        {error && <div className="dg-state">⚠️ {error}</div>}

        {!loading && !error && filtered.length === 0 && (
          <div className="dg-state">No doctors found matching your search.</div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <>
            <div className="dg-grid">
              {visible.map((doc, i) => (
                <DoctorCard
                  key={doc.id}
                  doctor={doc}
                  index={i}
                  onBook={handleBook}
                  onTicket={handleTicket}
                />
              ))}
            </div>
            <Pagination current={page} total={totalPages} onChange={setPage} />
          </>
        )}

      </div>

      {showModal && doctor && (
        <BookingModal
          doctor={doctor}
          onClose={() => { setShowModal(false); setDoctor(null); }}
        />
      )}

      {showTicketModal && doctor && (
        <TicketModal
          doctor={doctor}
          onClose={() => { setShowTicketModal(false); setDoctor(null); }}
        />
      )}
    </>
  );
}

export default DoctorsGrid;