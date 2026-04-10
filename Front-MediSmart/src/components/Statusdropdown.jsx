import { useState, useRef, useEffect } from "react";
import { getToken } from "../services/authService";
import "./doctorspage.css";

const API_BASE = "http://localhost:5000/api";

// ✅ Only 2 statuses — no more "In Service"
const STATUSES = [
  { id: "disponible", label: "Online",  color: "#4ade80" },
  { id: "absent",     label: "Absent",  color: "#f87171" },
];

const getStatusById = (id) => {
  // Map "en_consultation" → Online as well
  if (id === "disponible" || id === "en_consultation") return STATUSES[0];
  return STATUSES[1]; // absent by default
};

export default function Statusdropdown() {
  const [selected, setSelected] = useState(STATUSES[1]); // default: absent
  const [open,     setOpen]     = useState(false);
  const [loading,  setLoading]  = useState(false);
  const ref = useRef(null);

  // ── Load doctor's real current status on mount ────────────
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res  = await fetch(`${API_BASE}/medecins/mon-statut`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        const json = await res.json();
        if (json.success && json.statut) {
          setSelected(getStatusById(json.statut));
        }
      } catch (err) {
        console.error("Fetch statut error:", err);
      }
    };
    fetchStatus();
  }, []);

  // ── Close on outside click ────────────────────────────────
  useEffect(() => {
    const handle = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  // ── Select new status → call backend ─────────────────────
  const handleSelect = async (status) => {
    if (status.id === selected.id) { setOpen(false); return; }
    setLoading(true);
    setOpen(false);
    try {
      const endpoint = status.id === "absent"
        ? `${API_BASE}/medecins/checkout`
        : `${API_BASE}/medecins/checkin`;

      const res  = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ statut: status.id }),
      });
      const json = await res.json();
      if (json.success !== false) setSelected(status);
      else console.error("Status update failed:", json.message);
    } catch (err) {
      console.error("Status update error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="status-dropdown" ref={ref}>
      <button
        className={`status-trigger ${open ? "open" : ""}`}
        onClick={() => !loading && setOpen((p) => !p)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="status-dot" style={{ background: selected.color }} />
        <span className="status-label">{loading ? "..." : selected.label}</span>
        <svg
          className={`chevron ${open ? "rotated" : ""}`}
          width="12" height="12" viewBox="0 0 12 12" fill="none"
        >
          <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.8"
            strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {open && (
        <ul className="status-menu" role="listbox">
          {STATUSES.map((status) => (
            <li
              key={status.id}
              className={`status-option ${selected.id === status.id ? "active" : ""}`}
              role="option"
              aria-selected={selected.id === status.id}
              onClick={() => handleSelect(status)}
            >
              <span className="status-dot" style={{ background: status.color }} />
              <span className="status-label">{status.label}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}