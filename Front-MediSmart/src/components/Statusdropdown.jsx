import { useState, useRef, useEffect } from "react";
import "./doctorspage.css";
import { getCurrentUser, getToken } from "../services/authService";
 
const API_BASE = "http://localhost:5000/api";
 
const STATUSES = [
  { id: "disponible", label: "Online",  color: "#4ade80" },
  { id: "absent",     label: "Absent",  color: "#f87171" },
];
 
export default function Statusdropdown() {
  const [selected, setSelected] = useState(STATUSES[0]);
  const [open, setOpen]         = useState(false);
  const [loading, setLoading]   = useState(false);
  const ref = useRef(null);
 
  // ── Close on outside click ───────────────────────────────
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
 
  // ── Sync initial status from localStorage ───────────────
  useEffect(() => {
    const user = getCurrentUser();
    if (user?.statut) {
      const match = STATUSES.find((s) => s.id === user.statut);
      if (match) setSelected(match);
    }
  }, []);
 
  // ── Handle status change ─────────────────────────────────
  const handleSelect = async (status) => {
    if (status.id === selected.id) { setOpen(false); return; }
    setOpen(false);
    setLoading(true);
 
    const user     = getCurrentUser();
    const userId   = user?.id;
    const token    = getToken();
    const endpoint = status.id === "disponible" ? "checkin" : "checkout";
 
    try {
      const res  = await fetch(`${API_BASE}/medecins/${endpoint}`, {
        method:  "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:  `Bearer ${token}`,
        },
        body: JSON.stringify({ userId }),
      });
      const json = await res.json();
 
      if (json.success) {
        setSelected(status);
        // Update localStorage so status persists on refresh
        const updated = { ...user, statut: status.id };
        localStorage.setItem("user", JSON.stringify(updated));
      } else {
        alert(json.message || "Erreur lors du changement de statut.");
      }
    } catch (err) {
      alert("Impossible de contacter le serveur.");
    } finally {
      setLoading(false);
    }
  };
 
  return (
    <div className="status-dropdown" ref={ref}>
      <button
        className={`status-trigger ${open ? "open" : ""}`}
        onClick={() => !loading && setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={loading}
      >
        <span className="status-dot" style={{ background: selected.color }} />
        <span className="status-label">
          {loading ? "..." : selected.label}
        </span>
        <svg
          className={`chevron ${open ? "rotated" : ""}`}
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
        >
          <path
            d="M2 4L6 8L10 4"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
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