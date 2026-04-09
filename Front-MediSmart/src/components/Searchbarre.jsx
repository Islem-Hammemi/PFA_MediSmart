import { useEffect, useState, useRef } from "react";
import DoctorCard from "./Doctorcard";
import "./components.css";

const API_BASE   = "http://localhost:5000/api";
const PRESENT    = ["disponible", "en_consultation"];
const POLL_MS    = 30000; // refresh every 30 seconds

const Searchbarre = () => {
  const [allDoctors,     setAllDoctors]     = useState([]);
  const [presentDoctors, setPresentDoctors] = useState([]);
  const [displayed,      setDisplayed]      = useState([]);
  const [search,         setSearch]         = useState("");
  const [specialty,      setSpecialty]      = useState("");
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState(null);
  const [showAll,        setShowAll]        = useState(false);
  const intervalRef = useRef(null);

  // ── Fetch all doctors ────────────────────────────────────
  const fetchAll = async (isInitial = false) => {
    if (isInitial) setLoading(true);
    try {
      const res  = await fetch(`${API_BASE}/medecins`);
      if (!res.ok) throw new Error("Erreur serveur");
      const json = await res.json();
      const data = json.data || [];
      setAllDoctors(data);
      setPresentDoctors(data.filter((d) => PRESENT.includes(d.statut)));
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  // ── Initial fetch + polling ──────────────────────────────
  useEffect(() => {
    fetchAll(true);

    // Poll every 30s to reflect status changes in real time
    intervalRef.current = setInterval(() => fetchAll(false), POLL_MS);

    return () => clearInterval(intervalRef.current);
  }, []);

  // ── Filter logic ─────────────────────────────────────────
  useEffect(() => {
    const isSearching = search.trim() !== "" || specialty !== "";

    if (!isSearching) {
      setDisplayed(presentDoctors);
    } else {
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
      setDisplayed(result);
    }
    setShowAll(false);
  }, [search, specialty, allDoctors, presentDoctors]);

  const onlineCount = presentDoctors.length;
  const specialties = [...new Set(allDoctors.map((d) => d.specialite))].sort();
  const visibleCards = showAll ? displayed : displayed.slice(0, 4);

  return (
    <section className="doctor-section">

      <div className="doctor-section__top">
        <h2 className="doctor-section__title">
          Doctors Available Now
          <span className="online-pill">{onlineCount} online</span>
        </h2>
        <p className="doctor-section__sub">
          These doctors are ready to see you — book your appointment in minutes
        </p>
      </div>

      <div className="doctor-section__filters">
        <div className="search-wrap">
          <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            className="search-input"
            type="text"
            placeholder="Search doctors or specialties..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-wrap">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
          </svg>
          <select
            className="filter-select"
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
          >
            <option value="">Choose Specialty</option>
            {specialties.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <button
          className="btn-find"
          onClick={() => { setSearch(""); setSpecialty(""); }}
        >
          Find Care
        </button>
      </div>

      {loading && (
        <div className="skeleton-grid">
          {[1, 2, 3, 4].map((i) => <div key={i} className="skeleton-card" />)}
        </div>
      )}

      {error && (
        <div className="state-container state-container--error">
          <p>⚠️ {error}</p>
        </div>
      )}

      {!loading && !error && displayed.length === 0 && (
        <div className="state-container">
          <p className="state-empty">No doctors found matching your search.</p>
        </div>
      )}

      {!loading && !error && displayed.length > 0 && (
        <>
          <div className="doctor-grid">
            {visibleCards.map((doc, i) => (
              <DoctorCard key={doc.id} doctor={doc} index={i} />
            ))}
          </div>

          {displayed.length > 4 && (
            <div className="doctor-section__cta">
              <button className="btn-view-all" onClick={() => setShowAll(!showAll)}>
                {showAll ? "Show Less" : "View All Doctors"}
              </button>
            </div>
          )}
        </>
      )}

    </section>
  );
};

export default Searchbarre;