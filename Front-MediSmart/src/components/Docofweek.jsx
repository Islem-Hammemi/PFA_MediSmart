import { useEffect, useState } from "react";
import "./cmp.css";

const API_BASE = "http://localhost:5000/api";  // ✅ fixed

const StarRating = ({ note }) => {
  const stars = [];
  const full  = Math.floor(note || 0);
  const half  = (note - full) >= 0.5;

  for (let i = 1; i <= 5; i++) {
    if (i <= full)                   stars.push(<span key={i} className="dow-star dow-star--full">★</span>);
    else if (i === full + 1 && half) stars.push(<span key={i} className="dow-star dow-star--half">★</span>);
    else                             stars.push(<span key={i} className="dow-star dow-star--empty">★</span>);
  }
  return <div className="dow-stars">{stars}</div>;
};

const Docofweek = () => {
  const [doctor,  setDoctor]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const res  = await fetch(`${API_BASE}/medecins/semaine`);
        if (!res.ok) throw new Error("Erreur serveur");
        const json = await res.json();
        setDoctor(json.data || null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetch_();
  }, []);

  const photoUrl = doctor?.photo ? `http://localhost:5000${doctor.photo}` : null;
  const initials = doctor
    ? `${doctor.prenom?.[0] ?? ""}${doctor.nom?.[0] ?? ""}`.toUpperCase()
    : "";

  return (
    <section className="dow-section">

      <div className="dow-label">
        <span className="dow-label__bar" />
        <h2 className="dow-label__text">Doctor of the Week</h2>
      </div>

      {loading && (
        <div className="dow-skeleton">
          <div className="dow-skeleton__left" />
          <div className="dow-skeleton__right">
            <div className="dow-skeleton__line dow-skeleton__line--title" />
            <div className="dow-skeleton__line" />
            <div className="dow-skeleton__line dow-skeleton__line--short" />
            <div className="dow-skeleton__stats" />
            <div className="dow-skeleton__btn" />
          </div>
        </div>
      )}

      {error && <div className="dow-error">⚠️ {error}</div>}

      {!loading && !error && !doctor && (
        <div className="dow-error">No doctor of the week found.</div>
      )}

      {!loading && !error && doctor && (
        <div className="dow-card">

          <div className="dow-card__left">
            <div className="dow-card__circle" />

            <div className="dow-card__photo-wrap">
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt={`Dr. ${doctor.prenom} ${doctor.nom}`}
                  className="dow-card__photo"
                />
              ) : (
                <div className="dow-card__photo dow-card__photo--initials">
                  {initials}
                </div>
              )}
            </div>

            <div className="dow-card__identity">
              <h3 className="dow-card__name">Dr. {doctor.prenom} {doctor.nom}</h3>
              <p className="dow-card__specialty">{doctor.specialite}</p>
              <div className="dow-card__rating">
                <StarRating note={doctor.note_moyenne} />
                <span className="dow-card__rating-text">
                  {doctor.note_moyenne ? Number(doctor.note_moyenne).toFixed(1) : "—"}
                  &nbsp;({doctor.nb_evaluations ?? 0} reviews this week)
                </span>
              </div>
            </div>
          </div>

          <div className="dow-card__right">
            <h4 className="dow-card__tagline">Exceptional Patient Care</h4>
            <p className="dow-card__testimonial">
              "{doctor.commentaire || `Dr. ${doctor.nom} is an exceptional doctor who goes above and beyond for their patients.`}"
            </p>

            <div className="dow-card__stats">
              <div className="dow-stat">
                <svg className="dow-stat__icon" width="28" height="28" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
                <span className="dow-stat__label">Patients Seen</span>
                <span className="dow-stat__value">{doctor.nb_patients_semaine ?? 0}</span>
                <span className="dow-stat__sub">this week</span>
              </div>

              <div className="dow-stat">
                <svg className="dow-stat__icon" width="28" height="28" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="1.6">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
                <span className="dow-stat__label">Avg Wait Time</span>
                <div className="dow-stat__value-row">
                  <span className="dow-stat__value">8</span>
                  <span className="dow-stat__unit">min</span>
                </div>
                <span className="dow-stat__sub">this week</span>
              </div>
            </div>

            <button className="dow-btn">Book Appointment &nbsp;→</button>
          </div>

        </div>
      )}
    </section>
  );
};

export default Docofweek;