import { useState, useEffect } from "react";
import { getToken } from "../services/authService";
import "./doctorspage.css";

const API_BASE = "http://localhost:5000/api";

const ArrowIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M3 8h10M9 4l4 4-4 4" stroke="#4A90D9" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Format "dd/mm/yyyy à HH:mm" or ISO → "HH:mm"
const extractTime = (dateStr) => {
  if (!dateStr) return "—";
  if (dateStr.includes("à")) {
    const parts = dateStr.split("à");
    return parts[1]?.trim() ?? "—";
  }
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
};

// Initials avatar from full name
const initials = (name = "") =>
  name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

export default function TodaysAppointments({ refreshKey }) {
  const [appointments, setAppointments] = useState([]);
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    const fetch_ = async () => {
      setLoading(true);
      try {
        const res  = await fetch(`${API_BASE}/consultations/today-queue`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        const json = await res.json();

        if (json.success) {
          // Filter to only RDV with statut confirme
          const todayConfirmed = (json.data || []).filter(
            (item) => item.source_type === "rdv" && item.rdv_statut === "confirme"
          );
          setAppointments(todayConfirmed);
        }
      } catch (err) {
        console.error("TodaysAppointments fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetch_();
  }, [refreshKey]); // refetch when parent triggers onUpdated

  return (
    <div className="ta-wrapper">
      <div className="ta-card">

        <div className="ta-header">
          <h2 className="ta-title">Today's Appointments</h2>
        </div>

        <div className="ta-list">

          {loading && (
            <p style={{ color: "#94a3b8", fontSize: "14px", textAlign: "center", padding: "16px 0" }}>
              Loading...
            </p>
          )}

          {!loading && appointments.length === 0 && (
            <p style={{ color: "#94a3b8", fontSize: "14px", textAlign: "center", padding: "16px 0" }}>
              No confirmed appointments today.
            </p>
          )}

          {!loading && appointments.map((apt, i) => (
            <div className="ta-item" key={`${apt.source_id}-${i}`}>
              {/* Avatar with initials */}
              <div className="ta-avatar">
                <div className="ta-avatar-initials">
                  {initials(apt.patient_nom)}
                </div>
              </div>

              {/* Name */}
              <p className="ta-name">{apt.patient_nom}</p>

              {/* Time */}
              <p className="ta-time">
                {extractTime(apt.heure_affichee || apt.heure_prevue)}
              </p>

              {/* Motif badge if present */}
              {apt.motif && (
                <span className="ta-motif" title={apt.motif}>
                  {apt.motif.length > 20 ? apt.motif.slice(0, 20) + "…" : apt.motif}
                </span>
              )}

             
            </div>
          ))}

        </div>
      </div>
    </div>
  );
}