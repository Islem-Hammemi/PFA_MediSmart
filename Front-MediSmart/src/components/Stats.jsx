import { useEffect, useState } from 'react';
import { getToken } from '../services/authService';
import './patient.css';

const API_BASE = "http://localhost:5000/api";

function Stats() {
  const [stats,   setStats]   = useState({ upcoming: 0, activeTickets: 0, pastVisits: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res  = await fetch(`${API_BASE}/patient/dashboard/stats`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        const json = await res.json();
        if (json.success) setStats(json.data);
      } catch (err) {
        console.error("Erreur stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="stats-grid">
      <div className="stats-card">
        <span className="stats-card__value">
          {loading ? "—" : stats.upcoming}
        </span>
        <span className="stats-card__label">Upcoming</span>
      </div>

      <div className="stats-card">
        <span className="stats-card__value stats-card__value--accent">
          {loading ? "—" : stats.activeTickets}
        </span>
        <span className="stats-card__label">Active Ticket</span>
      </div>

      <div className="stats-card">
        <span className="stats-card__value">
          {loading ? "—" : stats.pastVisits}
        </span>
        <span className="stats-card__label">Past Visits</span>
      </div>
    </div>
  );
}

export default Stats;
 

