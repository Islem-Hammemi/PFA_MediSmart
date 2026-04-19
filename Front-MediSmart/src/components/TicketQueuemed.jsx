import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getToken } from "../services/authService";
import "./doctorspage.css";

const API_BASE = "http://localhost:5000/api";



const ArrowIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M3 8h10M9 4l4 4-4 4" stroke="#4A90D9" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Initials avatar
const getInitials = (name = "") =>
  name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

const AVATAR_COLORS = [
  ["#4a7aff", "#7c5cfc"],
  ["#10b981", "#059669"],
  ["#f59e0b", "#d97706"],
  ["#ec4899", "#db2777"],
  ["#06b6d4", "#0891b2"],
];

const getGradient = (name = "") => {
  const idx = (name.charCodeAt(0) || 0) % AVATAR_COLORS.length;
  const [from, to] = AVATAR_COLORS[idx];
  return `linear-gradient(135deg, ${from}, ${to})`;
};

export default function TicketQueuemed() {
  const navigate = useNavigate();
  const [tickets,  setTickets]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [actioning, setActioning] = useState({}); // { [ticketId]: true }

  // ── Fetch today's queue ────────────────────────────────────
  const fetchQueue = async () => {
    try {
      const res  = await fetch(`${API_BASE}/tickets/today`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const json = await res.json();
   

      if (json.success) {
        // Only keep "en_attente" tickets for display

        setTickets(json.queue.filter((t) => t.statut === "en_attente"));
        
      }
    } catch (err) {
    
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchQueue(); }, []);

  // ── Serve a ticket ─────────────────────────────────────────
  const handleServe = async (ticketId) => {
    setActioning((prev) => ({ ...prev, [ticketId]: true }));
    try {
      const res  = await fetch(`${API_BASE}/tickets/${ticketId}/serve`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const json = await res.json();
      if (json.success) {
        // Remove served ticket from list
        setTickets((prev) => prev.filter((t) => t.id !== ticketId));
      }
    } catch (err) {
      console.error("Serve error:", err);
    } finally {
      setActioning((prev) => ({ ...prev, [ticketId]: false }));
    }
  };

  return (
    <div className="tq-wrapper">
      <div className="tq-card">

        {/* Header */}
        <div className="tq-header">
          <div className="tq-header-left">
            <h2 className="tq-title">Today's Ticket Queue</h2>
            {/*  Dynamic patient count badge */}
            <span className="tq-badge">
              {loading ? "..." : `${tickets.length} Patient${tickets.length !== 1 ? "s" : ""}`}
            </span>
          </div>
          {/*  Navigate to Tickets page */}
          <button className="tq-manage" onClick={() => navigate("/tickets")}>
            Manage <ArrowIcon />
          </button>
        </div>

        {/* Column headers */}
        <div className="tq-table-header">
          <span>Ticket</span>
          <span>Patient</span>
          <span>Checked In</span>
        </div>

        {/* Rows */}
        <div className="tq-list">

          {loading && (
            <p className="tq-empty">Loading...</p>
          )}

          {!loading && tickets.length === 0 && (
            <p className="tq-empty">No patients in queue today.</p>
          )}

          {!loading && tickets.map((ticket) => (
            <div className="tq-row" key={ticket.id}>

              {/* Ticket ID */}
              <span className="tq-ticket-id">{ticket.ticket}</span>

              {/* Patient */}
              <div className="tq-patient">
                
                <span className="tq-name">{ticket.patient_nom}</span>
              </div>

              {/* Check-in time */}
              <span className="tq-time">{ticket.checked_in}</span>

              {/* Serve button */}
              

            </div>
          ))}

        </div>
      </div>
    </div>
  );
}