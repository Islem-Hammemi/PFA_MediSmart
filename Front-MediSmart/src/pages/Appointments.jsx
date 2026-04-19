import { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import './Appointments.css';
import NavBarpatient from '../components/Navbarpatient';
import Footerr from '../components/Footerr';
import PastAppointmentDetail from '../components/PastAppointmentDetail';
import { getToken } from '../services/authService';
import { Calendar, Clock2 } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

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

// ── File icon ─────────────────────────────────────────────────
const FileIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
);

// ── CancelModal ───────────────────────────────────────────────
function CancelModal({ appointment, onConfirm, onClose, loading }) {
  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 2v4"/><path d="M16 2v4"/>
            <rect width="18" height="18" x="3" y="4" rx="2"/>
            <path d="M3 10h18"/>
          </svg>
        </div>
        <h2 className="modal-title">Cancel Appointment?</h2>
        <p className="modal-desc">
          Are you sure you want to cancel your appointment with{' '}
          <strong>Dr. {appointment.medecin.prenom} {appointment.medecin.nom}</strong>{' '}
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
    </div>,
    document.body
  );
}

// ── EmptyState ────────────────────────────────────────────────
function EmptyState({ tab }) {
  return (
    <div className="appt-empty">
      <div className="appt-empty-icon">{tab === 'upcoming' ? <Calendar /> : <Clock2 />}</div>
      {tab === 'upcoming' ? (
        <>
          <p className="appt-empty-title">No upcoming appointments</p>
          <p className="appt-empty-sub">Your schedule is clear.</p>
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

// ── Main component ────────────────────────────────────────────
function Appointments() {
  const [tab, setTab]                 = useState('upcoming');
  const [upcoming, setUpcoming]       = useState([]);
  const [past, setPast]               = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [toCancel, setToCancel]       = useState(null);
  const [cancelling, setCancelling]   = useState(false);
  const [error, setError]             = useState(null);
  const [detailRdv, setDetailRdv]     = useState(null);

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

  useEffect(() => {
    fetchUpcoming();
    fetchPast();
    const onCancelled = () => fetchUpcoming();
    const onBooked    = () => { fetchUpcoming(); };
    window.addEventListener('appointment-cancelled', onCancelled);
    window.addEventListener('appointment-booked',    onBooked);
    return () => {
      window.removeEventListener('appointment-cancelled', onCancelled);
      window.removeEventListener('appointment-booked',    onBooked);
    };
  }, [fetchUpcoming, fetchPast]);

  const handleCancelConfirm = async () => {
    if (!toCancel) return;
    setCancelling(true);
    try {
      const res  = await fetch(`${API_BASE}/rendez-vous/${toCancel.rdv_id}/annuler`, {
        method: 'PATCH', headers: authHeaders(),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      setUpcoming((prev) => prev.filter((a) => a.rdv_id !== toCancel.rdv_id));
      setToCancel(null);
      window.dispatchEvent(new Event('appointment-cancelled'));
    } catch (err) {
      alert(err.message || 'Could not cancel appointment.');
    } finally {
      setCancelling(false);
    }
  };

  const list   = tab === 'upcoming' ? upcoming : past;
  const isPast = tab === 'past';

  // Only blur when cancel modal is open — NOT when detail modal is open
  const blurPage = !!toCancel;

  return (
    <div className='dashbackcolor'>
      {/*  Page content — only blurred for cancel modal */}
      <div className={`appt-list${blurPage ? ' appt-blurred' : ''}`}>
        <NavBarpatient upcomingCount={upcoming.length} />

        {/* Hero */}
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

        {/* Body */}
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
                        {isPast && item.source_type === 'ticket' && (
                          <span className="appt-motif">Ticket consultation</span>
                        )}
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

                      <div className="appt-actions">
                        {isPast && (
                          <button
                            className="appt-btn appt-btn--file"
                            onClick={() => setDetailRdv(item)}
                            title="View appointment details"
                          >
                            <FileIcon />
                            Details
                          </button>
                        )}
                        {!isPast && (
                          <button
                            className="appt-btn appt-btn--cancel"
                            onClick={() => setToCancel(item)}
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

        <Footerr />
      </div>

      {/* ✅ Modals rendered via portal — always outside blur, never blurred */}
      {toCancel && (
        <CancelModal
          appointment={toCancel}
          onConfirm={handleCancelConfirm}
          onClose={() => setToCancel(null)}
          loading={cancelling}
        />
      )}

      {detailRdv && (
        <PastAppointmentDetail
          appointment={detailRdv}
          onClose={() => setDetailRdv(null)}
        />
      )}
    </div>
  );
}

export default Appointments;