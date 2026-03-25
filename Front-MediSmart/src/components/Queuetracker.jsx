import React, { useEffect, useState, useRef } from "react";
import { getToken } from "../services/authService";
import "./queuetracker.css";

const API_BASE    = "http://localhost:5000/api";
const POLL_MS     = 10000; // refresh every 10 seconds
const MINS_PER_POS = 4;    // estimated minutes per position

function QueueTracker() {
  const [ticket,  setTicket]  = useState(null);   // patient's active ticket
  const [queue,   setQueue]   = useState(null);   // live queue status
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef(null);

  // ── Fetch patient's active ticket ────────────────────────
  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const res  = await fetch(`${API_BASE}/tickets/patient`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        const json = await res.json();
        if (json.success && json.tickets?.length > 0) {
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

  // ── Poll queue status every 10s when ticket is available ─
  useEffect(() => {
    if (!ticket) return;

    const fetchQueue = async () => {
      try {
        // Extract medecin_id from ticket — we need it to query the queue
        // The ticket object has medecin_nom but not medecin_id directly
        // So we use the ticket id to get queue from a separate endpoint
        const res  = await fetch(`${API_BASE}/tickets/queue/${ticket.medecin_id ?? ticket.id}`);
        const json = await res.json();
        if (json.success) setQueue(json.data);
      } catch (err) {
        console.error("Erreur queue:", err);
      }
    };

    fetchQueue();
    intervalRef.current = setInterval(fetchQueue, POLL_MS);
    return () => clearInterval(intervalRef.current);
  }, [ticket]);

  // ── Derived values ────────────────────────────────────────
  const position       = ticket?.position          ?? 3;
  const totalQueue     = queue?.total_queue        ?? 8;
  const servingPos     = queue?.serving_position   ?? 1;
  const peopleAhead    = Math.max(0, position - servingPos - 1);
  const estimatedWait  = position > servingPos
    ? (position - servingPos) * MINS_PER_POS
    : 0;
  const progressPct    = totalQueue > 0
    ? Math.min(100, Math.round((servingPos / totalQueue) * 100))
    : 0;

  const ticketId = ticket
    ? `#T-2026-${String(ticket.id).padStart(4, '0')}`
    : '#T-2026-0000';

  const createdTime = ticket?.date_creation
    ? ticket.date_creation.split(' à ')[1] ?? '—'
    : '—';

  const isActive = ticket?.statut === 'en_cours';

  // ── Loading ───────────────────────────────────────────────
  if (loading) {
    return (
      <div className="qt-wrap">
        <div className="qt-header">
          <span className="qt-header__label">Ticket</span>
          <h2 className="qt-header__id">Loading...</h2>
        </div>
      </div>
    );
  }

  // ── No active ticket ──────────────────────────────────────
  if (!ticket) {
    return (
      <div className="qt-wrap qt-wrap--empty">
        <div className="qt-empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
            stroke="#cbd5e1" strokeWidth="1.5">
            <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2z"/>
          </svg>
          <p>You don't have any active ticket.</p>
          <a href="/doctors" className="qt-empty__link">Get a ticket now →</a>
        </div>
      </div>
    );
  }

  // ── Active ticket ─────────────────────────────────────────
  return (
    <div className="qt-wrap">

      {/* Header */}
      <div className="qt-header">
        <span className="qt-header__label">Ticket</span>
        <h2 className="qt-header__id">{ticketId}</h2>
      </div>

      {/* Doctor */}
      <div className="qt-doctor">
        <h3 className="qt-doctor__name">{ticket.medecin_nom}</h3>
        <p className="qt-doctor__sub">{ticket.specialite} · Today</p>
      </div>

      {/* Position circle */}
      <div className="qt-position-wrap">
        <div className={`qt-circle ${isActive ? "qt-circle--active" : ""}`}>
          <span className="qt-circle__number">{position}</span>
        </div>
        <p className="qt-position__text">
          You are <strong>#{position}</strong> in line
        </p>
        {estimatedWait > 0 ? (
          <p className="qt-position__wait">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            ~{estimatedWait} min wait
          </p>
        ) : (
          <p className="qt-position__wait qt-position__wait--now">
            It's almost your turn!
          </p>
        )}
      </div>

      {/* Queue progress bar */}
      <div className="qt-queue">
        <div className="qt-queue__labels">
          <span>Serving #{servingPos}</span>
          <span>{totalQueue} in queue</span>
        </div>
        <div className="qt-queue__bar">
          <div
            className="qt-queue__fill"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <p className="qt-queue__sub">
          {peopleAhead > 0
            ? `${peopleAhead} ${peopleAhead === 1 ? 'person' : 'people'} ahead of you`
            : "You're next!"}
        </p>
      </div>

      {/* Status timeline */}
      <div className="qt-status">
        <h4 className="qt-status__title">Status</h4>
        <div className="qt-timeline">

          {/* Step 1 — Ticket Created (always done) */}
          <div className="qt-step qt-step--done">
            <div className="qt-step__icon qt-step__icon--done">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <div className="qt-step__line qt-step__line--done" />
            <div className="qt-step__info">
              <span className="qt-step__label">Ticket Created</span>
              <span className="qt-step__time">{createdTime}</span>
            </div>
          </div>

          {/* Step 2 — Waiting (active if en_attente) */}
          <div className={`qt-step ${!isActive ? "qt-step--active" : "qt-step--done"}`}>
            <div className={`qt-step__icon ${!isActive ? "qt-step__icon--active" : "qt-step__icon--done"}`}>
              {!isActive ? (
                <div className="qt-step__dot" />
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              )}
            </div>
            <div className={`qt-step__line ${!isActive ? "" : "qt-step__line--done"}`} />
            <div className="qt-step__info">
              <span className="qt-step__label">Waiting</span>
              {!isActive && <span className="qt-step__time">Now</span>}
            </div>
          </div>

          {/* Step 3 — Your Turn (active if en_cours) */}
          <div className={`qt-step ${isActive ? "qt-step--active" : "qt-step--pending"}`}>
            <div className={`qt-step__icon ${isActive ? "qt-step__icon--active" : "qt-step__icon--pending"}`}>
              {isActive && <div className="qt-step__dot" />}
            </div>
            <div className="qt-step__line" />
            <div className="qt-step__info">
              <span className="qt-step__label">Your Turn</span>
              {isActive && <span className="qt-step__time">Now</span>}
            </div>
          </div>

          {/* Step 4 — Rate Doctor (always pending) */}
          <div className="qt-step qt-step--pending qt-step--last">
            <div className="qt-step__icon qt-step__icon--pending" />
            <div className="qt-step__info">
              <span className="qt-step__label">Rate Doctor</span>
            </div>
          </div>

        </div>
      </div>

      {/* Footer */}
      <div className="qt-notice">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
        Please stay nearby. You'll be notified when it's your turn.
      </div>

    </div>
  );
}

export default QueueTracker;