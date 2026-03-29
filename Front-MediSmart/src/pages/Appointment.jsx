// Front-MediSmart/src/pages/Appoinment.jsx
// US9 – Consultation rendez-vous (LASSOUED Syrine)
// Rendu dynamique : appels GET /api/rendez-vous/upcoming et /past

import React, { useState, useEffect } from 'react';
import NavBarpatient from '../components/Navbarpatient';
import Footerr from '../components/Footerr';
import { getToken } from '../services/authService';
import './Appointment.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ── Helpers ────────────────────────────────────────────────────
function getInitials(prenom, nom) {
  if (!prenom && !nom) return '??';
  return ((prenom?.[0] || '') + (nom?.[0] || '')).toUpperCase();
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric',
  });
}

function formatTime(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit',
  });
}

function badgeClass(statut) {
  if (statut === 'confirme')  return 'appt-badge--confirmed';
  if (statut === 'planifie')  return 'appt-badge--confirmed';
  if (statut === 'annule')    return 'appt-badge--pending';
  return 'appt-badge--pending';
}

function badgeLabel(statut) {
  const map = {
    confirme: 'Confirmed',
    planifie: 'Confirmed',
    annule:   'Cancelled',
    termine:  'Completed',
  };
  return map[statut] || statut;
}

// ── Composant principal ────────────────────────────────────────
export default function Appointment() {
  const [tab, setTab]           = useState('upcoming');
  const [list, setList]         = useState([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const [modalRdvId, setModalRdvId] = useState(null);

  // ── Fetch selon l'onglet ─────────────────────────────────────
  useEffect(() => {
    const fetchRdv = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = getToken();
        const res = await fetch(`${API_BASE}/rendez-vous/${tab}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.message || `Erreur ${res.status}`);
        }
        setList(json.data);
      } catch (err) {
        setError('Impossible de charger les rendez-vous.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRdv();
  }, [tab]);

  // ── Ouvrir le modal ──────────────────────────────────────────
  const handleCancel = (rdvId) => setModalRdvId(rdvId);

  // ── Confirmer l'annulation ───────────────────────────────────
  const confirmCancel = async () => {
    const rdvId = modalRdvId;
    setModalRdvId(null);
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/rendez-vous/${rdvId}/annuler`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message);
      setList((prev) =>
        prev.map((item) =>
          item.rdv_id === rdvId ? { ...item, statut: 'annule' } : item
        )
      );
    } catch (err) {
      alert('Erreur lors de l\'annulation : ' + err.message);
    }
  };

  return (
    <div className="appt-root">
      <NavBarpatient />

      {/* Hero */}
      <div className="hero">
        <div className="hero-content">
          <h1 className="titre">My Appointments</h1>
          <p className="pseudo">
            {tab === 'upcoming'
              ? 'Manage your bookings'
              : 'Manage your bookings and tickets'}
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="appt-body">

        {/* Tabs */}
        <div className="appt-tabs">
          <button
            className={`appt-tab${tab === 'upcoming' ? ' appt-tab--active' : ''}`}
            onClick={() => setTab('upcoming')}
          >
            upcoming
          </button>
          <button
            className={`appt-tab${tab === 'past' ? ' appt-tab--active' : ''}`}
            onClick={() => setTab('past')}
          >
            past
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
            Chargement…
          </div>
        )}

        {/* Erreur */}
        {error && (
          <div style={{
            background: '#fef2f2', color: '#b91c1c',
            border: '1px solid #fecaca', borderRadius: 10,
            padding: '14px 18px', fontSize: 14,
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Vide */}
        {!loading && !error && list.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px', color: '#9ca3af', fontSize: 14 }}>
            Aucun rendez-vous {tab === 'upcoming' ? 'à venir' : 'passé'}.
          </div>
        )}

        {/* Cards */}
        {!loading && !error && list.length > 0 && (
          <div className="appt-list">
            {list.map((item) => (
              <div className="appt-card" key={item.rdv_id}>

                <div className="appt-card-left">
                  <div className={`appt-avatar${tab === 'past' ? ' appt-avatar--past' : ''}`}>
                    {getInitials(item.medecin.prenom, item.medecin.nom)}
                  </div>
                  <div className="appt-info">
                    <span className="appt-doctor">
                      Dr. {item.medecin.prenom} {item.medecin.nom}
                    </span>
                    <span className="appt-specialty">{item.medecin.specialite}</span>
                    {tab === 'upcoming' && (
                      <span className={`appt-badge ${badgeClass(item.statut)}`}>
                        {badgeLabel(item.statut)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="appt-card-right">
                  <div className="appt-date-block">
                    <span className="appt-date">{formatDate(item.date_heure)}</span>
                    {tab === 'upcoming' && (
                      <span className="appt-time">{formatTime(item.date_heure)}</span>
                    )}
                    {tab === 'past' && (
                      <span className="appt-completed">Completed</span>
                    )}
                  </div>
                  {tab === 'upcoming' && item.statut !== 'annule' && (
                    <div className="appt-actions">
                      <button
                        className="appt-btn appt-btn--cancel"
                        onClick={() => handleCancel(item.rdv_id)}
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>

              </div>
            ))}
          </div>
        )}

      </div>

      {/* Modal de confirmation */}
      {modalRdvId && (
        <div className="modal-overlay" onClick={() => setModalRdvId(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                  stroke="#ef4444"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p className="modal-title">Cancel appointment?</p>
            <p className="modal-desc">
              This action cannot be undone. The appointment will be permanently cancelled.
            </p>
            <div className="modal-actions">
              <button
                className="modal-btn modal-btn--keep"
                onClick={() => setModalRdvId(null)}
              >
                Keep it
              </button>
              <button
                className="modal-btn modal-btn--confirm"
                onClick={confirmCancel}
              >
                Yes, cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <Footerr />
    </div>
  );
}