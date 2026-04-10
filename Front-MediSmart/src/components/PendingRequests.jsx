import { useState, useEffect } from "react";
import { getToken } from "../services/authService";
import "./doctorspage.css";

const API_BASE = "http://localhost:5000/api";

const ConfirmIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <circle cx="9" cy="9" r="8" stroke="#22c55e" strokeWidth="1.6" fill="none"/>
    <path d="M5.5 9l2.5 2.5 4.5-5" stroke="#22c55e" strokeWidth="1.6"
      strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const DeclineIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <circle cx="9" cy="9" r="8" stroke="#f87171" strokeWidth="1.6" fill="none"/>
    <path d="M6 6l6 6M12 6l-6 6" stroke="#f87171" strokeWidth="1.6" strokeLinecap="round"/>
  </svg>
);

const AlertIcon = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <circle cx="11" cy="11" r="10" stroke="#f59e0b" strokeWidth="1.8" fill="none"/>
    <path d="M11 7v5" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round"/>
    <circle cx="11" cy="15" r="1" fill="#f59e0b"/>
  </svg>
);

export default function PendingRequests({ onUpdated }) {
  const [requests,  setRequests]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [actioning, setActioning] = useState({}); // { [rdvId]: true }

  // ── Fetch pending requests ─────────────────────────────────
  const fetchPending = async () => {
    try {
      const res  = await fetch(`${API_BASE}/rendez-vous/medecin/pending`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const json = await res.json();
      if (json.success) setRequests(json.data || []);
    } catch (err) {
      console.error("Fetch pending error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPending(); }, []);

  // ── Action: confirm or refuse ──────────────────────────────
  const handleAction = async (rdvId, action) => {
    setActioning((prev) => ({ ...prev, [rdvId]: true }));
    try {
      const endpoint = action === "confirm"
        ? `${API_BASE}/rendez-vous/${rdvId}/confirmer`
        : `${API_BASE}/rendez-vous/${rdvId}/refuser`;

      const res  = await fetch(endpoint, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);

      // Remove from list immediately
      setRequests((prev) => prev.filter((r) => r.rdv_id !== rdvId));

      // Notify parent (dashboard, WeeklyAgenda) to refresh
      if (onUpdated) onUpdated();

    } catch (err) {
      console.error(`Action ${action} failed:`, err);
    } finally {
      setActioning((prev) => ({ ...prev, [rdvId]: false }));
    }
  };

  // ── Format date ────────────────────────────────────────────
  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    // Could be "dd/mm/yyyy à HH:mm" or ISO
    if (dateStr.includes("à")) return dateStr;
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    return d.toLocaleDateString("fr-FR", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };

  const initials = (name = "") =>
    name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="pr-wrapper">
      <div className="pr-card">

        <div className="pr-header">
          <span className="pr-alert-icon"><AlertIcon /></span>
          <h2 className="pr-title">Pending Requests</h2>
          {requests.length > 0 && (
            <span className="pr-badge">
              ({requests.length} awaiting your confirmation)
            </span>
          )}
        </div>

        <div className="pr-list">
          {loading && <p className="pr-empty">Loading...</p>}

          {!loading && requests.length === 0 && (
            <p className="pr-empty">No pending requests.</p>
          )}

          {!loading && requests.map((req) => {
            const name = req.patient
              ? `${req.patient.prenom ?? ""} ${req.patient.nom ?? ""}`.trim()
              : (req.patient_nom || "Patient");
            const isActioning = actioning[req.rdv_id];

            return (
              <div className="pr-item" key={req.rdv_id}>
                {/* Avatar */}
                <div className="pr-avatar-initials">
                  {initials(name)}
                </div>

                {/* Info */}
                <div className="pr-info">
                  <p className="pr-name">{name}</p>
                  <p className="pr-desc">
                    {req.motif || "No reason specified"} &nbsp;·&nbsp;
                    <strong>{formatDate(req.date_heure_formatee || req.date_heure)}</strong>
                  </p>
                </div>

                {/* Actions */}
                <div className="pr-actions">
                  <button
                    className="pr-btn confirm"
                    onClick={() => handleAction(req.rdv_id, "confirm")}
                    disabled={isActioning}
                  >
                    <ConfirmIcon />
                    {isActioning ? "..." : "Confirm"}
                  </button>
                  <button
                    className="pr-btn decline"
                    onClick={() => handleAction(req.rdv_id, "refuse")}
                    disabled={isActioning}
                  >
                    <DeclineIcon />
                    {isActioning ? "..." : "Decline"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}