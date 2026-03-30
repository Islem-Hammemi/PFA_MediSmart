import { useEffect, useState, useCallback } from 'react';
import './Appointments.css';
import NavBarpatient from '../components/Navbarpatient';
import Footerr from '../components/Footerr';
import { getToken } from '../services/authService';
import {Calendar , Clock2} from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

// ── helpers ──────────────────────────────────────────────────────────────────
const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getToken()}`,
});

const formatDate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
};

const formatTime = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
};

const initials = (nom, prenom) =>
  `${(prenom || '').charAt(0)}${(nom || '').charAt(0)}`.toUpperCase();

// ── CancelModal ───────────────────────────────────────────────────────────────
function CancelModal({ appointment, onConfirm, onClose, loading }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-calendar-icon lucide-calendar"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>
        </div>
        <h2 className="modal-title">Cancel Appointment?</h2>
        <p className="modal-desc">
          Are you sure you want to cancel your appointment with{' '}
          <strong>
            Dr. {appointment.medecin.prenom} {appointment.medecin.nom}
          </strong>{' '}
          on <strong>{formatDate(appointment.date_heure)}</strong> at{' '}
          <strong>{formatTime(appointment.date_heure)}</strong>?
        </p>
        <p className="modal-warn">This action cannot be undone.</p>
        <div className="modal-actions">
          <button className="modal-btn modal-btn--back" onClick={onClose} disabled={loading}>
            Keep it
          </button>
          <button
            className="modal-btn modal-btn--confirm"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Cancelling…' : 'Yes, cancel'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── EmptyState ────────────────────────────────────────────────────────────────
function EmptyState({ tab }) {
  return (
    <div className="appt-empty">
      <div className="appt-empty-icon">{tab === 'upcoming' ? <Calendar /> : <Clock2 />}</div>
      {tab === 'upcoming' ? (
        <>
          <p className="appt-empty-title">No upcoming appointments</p>
          <p className="appt-empty-sub">
            Your schedule is clear.{' '}
            
          </p>
        </>
      ) : (
        <>
          <p className="appt-empty-title">No past appointments yet</p>
          <p className="appt-empty-sub">Your visit history will appear here.</p>
        </>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
function Appointments() {
  const [tab, setTab]               = useState('upcoming');
  const [upcoming, setUpcoming]     = useState([]);
  const [past, setPast]             = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [toCancel, setToCancel]     = useState(null);   // appointment being cancelled
  const [cancelling, setCancelling] = useState(false);
  const [error, setError]           = useState(null);

  // ── fetch helpers ────────────────────────────────────────────────────────
  const fetchUpcoming = useCallback(async () => {
    setLoadingList(true);
    setError(null);
    try {
      const res  = await fetch(`${API_BASE}/rendez-vous/upcoming`, { headers: authHeaders() });
      const json = await res.json();
      if (json.success) setUpcoming(json.data);
      else throw new Error(json.message);
    } catch (err) {
      setError(err.message || 'Failed to load upcoming appointments.');
    } finally {
      setLoadingList(false);
    }
  }, []);

  const fetchPast = useCallback(async () => {
    setLoadingList(true);
    setError(null);
    try {
      const res  = await fetch(`${API_BASE}/rendez-vous/past`, { headers: authHeaders() });
      const json = await res.json();
      if (json.success) setPast(json.data);
      else throw new Error(json.message);
    } catch (err) {
      setError(err.message || 'Failed to load past appointments.');
    } finally {
      setLoadingList(false);
    }
  }, []);

  // load both on mount so stats are always fresh
  useEffect(() => {
    fetchUpcoming();
    fetchPast();
  }, [fetchUpcoming, fetchPast]);

  // ── cancel flow ──────────────────────────────────────────────────────────
  const handleCancelConfirm = async () => {
    if (!toCancel) return;
    setCancelling(true);
    try {
      const res  = await fetch(`${API_BASE}/rendez-vous/${toCancel.rdv_id}/annuler`, {
        method:  'PATCH',
        headers: authHeaders(),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);

      // optimistically remove from upcoming list
      setUpcoming((prev) => prev.filter((a) => a.rdv_id !== toCancel.rdv_id));
      setToCancel(null);

      // notify Stats component (and any other listener) that the count changed
      window.dispatchEvent(new Event('appointment-cancelled'));
    } catch (err) {
      alert(err.message || 'Could not cancel appointment.');
    } finally {
      setCancelling(false);
    }
  };

  const list = tab === 'upcoming' ? upcoming : past;

  return (
    <div className={`appt-list${toCancel ? ' appt-blurred' : ''}`}>
      <NavBarpatient upcomingCount={upcoming.length} />

      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Your Care<span className="hero-title-two"> Schedule</span>
          </h1>
          <p className="hero-subtitle">
            Stay on top of your medical appointments with a clear, organized view
            and real-time updates designed for your convenience.
          </p>
        </div>
      </section>

      {/* ── Body ── */}
      <div className="appt-body">

        {/* Tabs */}
        <div className="appt-tabs">
          <button
            className={`appt-tab${tab === 'upcoming' ? ' appt-tab--active' : ''}`}
            onClick={() => setTab('upcoming')}
          >
            Upcoming
          </button>
          <button
            className={`appt-tab${tab === 'past' ? ' appt-tab--active' : ''}`}
            onClick={() => setTab('past')}
          >
            Past
          </button>
        </div>

        {/* List */}
        {loadingList ? (
          <div className="appt-loading">
            <span className="appt-spinner" />
            Loading…
          </div>
        ) : error ? (
          <div className="appt-error">{error}</div>
        ) : list.length === 0 ? (
          <EmptyState tab={tab} />
        ) : (
          <div className="appt-cards">
            {list.map((item) => {
              const avatarText = initials(item.medecin.nom, item.medecin.prenom);
              const isPast     = tab === 'past';

              return (
                <div className="appt-card" key={item.rdv_id}>

                  <div className="appt-card-left">
                    <div className={`appt-avatar${isPast ? ' appt-avatar--past' : ''}`}>
                      {avatarText}
                    </div>
                    <div className="appt-info">
                      <span className="appt-doctor">
                        Dr. {item.medecin.prenom} {item.medecin.nom}
                      </span>
                      <span className="appt-specialty">{item.medecin.specialite}</span>
                      {!isPast && item.motif && (
                        <span className="appt-motif">{item.motif}</span>
                      )}
                      {!isPast && (
                        <span className={`appt-badge appt-badge--${item.statut}`}>
                          {item.statut.charAt(0).toUpperCase() + item.statut.slice(1)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="appt-card-right">
                    <div className="appt-date-block">
                      <span className="appt-date">{formatDate(item.date_heure)}</span>
                      {!isPast && (
                        <span className="appt-time">{formatTime(item.date_heure)}</span>
                      )}
                      {isPast && (
                        <span className="appt-completed">
                          {item.statut === 'annule' ? 'Cancelled' : 'Completed'}
                        </span>
                      )}
                    </div>

                    {!isPast && (
                      <div className="appt-actions">
                        <button
                          className="appt-btn appt-btn--cancel"
                          onClick={() => setToCancel(item)}
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      <Footerr />

      {/* ── Cancel Modal ── */}
      {toCancel && (
        <CancelModal
          appointment={toCancel}
          onConfirm={handleCancelConfirm}
          onClose={() => setToCancel(null)}
          loading={cancelling}
        />
      )}
    </div>
  );
}

export default Appointments;