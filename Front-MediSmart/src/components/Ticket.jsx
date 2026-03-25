import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getToken } from '../services/authService';
import './patient.css';

const API_BASE = "http://localhost:5000/api";

function Ticket() {
  const [ticket,  setTicket]  = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const res  = await fetch(`${API_BASE}/tickets/patient`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        const json = await res.json();

        if (json.success && json.tickets?.length > 0) {
          // Find the first active ticket (en_attente or en_cours)
          const active = json.tickets.find(
            (t) => t.statut === 'en_attente' || t.statut === 'en_cours'
          );
          setTicket(active || null);
        }
      } catch (err) {
        console.error("Erreur ticket:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTicket();
  }, []);

  // ── Loading ───────────────────────────────────────────────
  if (loading) {
    return (
      <div className="ticket-card">
        <div className="ticket-card__side-bar" />
        <div className="ticket-card__body">
          <p style={{ color: '#94a3b8', fontSize: '14px' }}>Loading...</p>
        </div>
      </div>
    );
  }

  // ── No active ticket ──────────────────────────────────────
  if (!ticket) {
    return (
      <div className="ticket-card ticket-card--empty">
        <div className="ticket-card__side-bar ticket-card__side-bar--empty" />
        <div className="ticket-card__body">
          <div className="ticket-card__header">
            <span className="ticket-card__title">Active Ticket</span>
          </div>
          <div className="ticket-card__no-ticket">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none"
              stroke="#cbd5e1" strokeWidth="1.5">
              <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2z"/>
            </svg>
            <p>You don't have any active ticket.</p>
            <a href="/doctors" className="ticket-card__book-link">
              Get a ticket now →
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ── Active ticket ─────────────────────────────────────────
  return (
    <div className="ticket-card">
      <div className="ticket-card__side-bar" />

      <div className="ticket-card__body">
        <div className="ticket-card__header">
          <span className="ticket-card__title">Active Ticket</span>
          <span className="ticket-card__status">
            {ticket.statut === 'en_cours' ? 'In Progress' : 'Waiting'}
          </span>
        </div>

        <div className="ticket-card__middle">
          <div className="ticket-card__info">
            <span className="ticket-card__id">
              #T-2026-{String(ticket.id).padStart(4, '0')}
            </span>
            <span className="ticket-card__doctor">
              {ticket.medecin_nom} · {ticket.specialite}
            </span>
          </div>

          <div className="ticket-card__stats">
            <div className="ticket-card__stat">
              <span className="ticket-card__stat-value">#{ticket.position}</span>
              <span className="ticket-card__stat-label">Position</span>
            </div>
            <div className="ticket-card__stat">
              <span className="ticket-card__stat-value">
                {ticket.position * 4}m
              </span>
              <span className="ticket-card__stat-label">Wait</span>
            </div>
          </div>
        </div>

        <button className="ticket-card__btn" onClick={() => navigate('/queue')}>Track Queue</button>
      </div>
    </div>
  );
}

export default Ticket;