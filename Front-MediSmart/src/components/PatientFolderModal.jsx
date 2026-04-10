// ============================================================
//  PatientFolderModal.jsx
//  Affiche le dossier complet d'un patient :
//    - Profil patient
//    - Rendez-vous passés (avec statut + motif)
//    - Dossiers médicaux (diagnostic, traitement, notes)
// ============================================================

import React, { useEffect, useState } from 'react';
import { fetchDossierPatient } from '../services/dossierAPI';
import './doctorspage.css';
import { Phone } from 'lucide-react';

/* ── Icônes SVG inline ─────────────────────────────────── */
const IconClose = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const IconCalendar = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const IconFile = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
    <polyline points="10 9 9 9 8 9"/>
  </svg>
);
const IconUser = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

/* ── Couleur badge statut RDV ──────────────────────────── */
const statutConfig = {
  planifie : { label: 'Planifié',  color: '#3b82f6' },
  confirme : { label: 'Confirmé', color: '#10b981' },
  annule   : { label: 'Annulé',   color: '#ef4444' },
  termine  : { label: 'Terminé',  color: '#8b5cf6' },
};

/* ── Initiales avatar ──────────────────────────────────── */
const getInitials = (nom = '') =>
  nom.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();

/* ── Composant principal ───────────────────────────────── */
export default function PatientFolderModal({ patientId, onClose }) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [tab, setTab]         = useState('rdv'); // 'rdv' | 'dossiers'

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchDossierPatient(patientId)
      .then((res) => { if (!cancelled) setData(res); })
      .catch((err) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [patientId]);

  // Fermer avec Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="pfm-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="pfm-modal">

        {/* Header */}
        <div className="pfm-header">
          <h2 className="pfm-title">Dossier Patient</h2>
          <button className="pfm-close-btn" onClick={onClose} aria-label="Fermer">
            <IconClose />
          </button>
        </div>

        {/* Body */}
        <div className="pfm-body">
          {loading && (
            <div className="pfm-state">
              <div className="pfm-spinner" />
              <p>Chargement du dossier…</p>
            </div>
          )}

          {error && (
            <div className="pfm-state pfm-error">
              <p>⚠ {error}</p>
              <button className="pfm-retry-btn" onClick={() => { setLoading(true); setError(null); fetchDossierPatient(patientId).then(setData).catch((e) => setError(e.message)).finally(() => setLoading(false)); }}>
                Réessayer
              </button>
            </div>
          )}

          {!loading && !error && data && (
            <>
              {/* Profil patient */}
              <div className="pfm-profile">
                <div className="pfm-avatar">
                  {getInitials(data.patient.nom_complet)}
                </div>
                <div className="pfm-profile-info">
                  <h3 className="pfm-patient-name">{data.patient.nom_complet}</h3>
                  <div className="pfm-profile-meta">
                    <span><IconUser /> {data.patient.email}</span> 
                    {data.patient.telephone && <span> <Phone size={15} /> {data.patient.telephone}</span>}
                    {data.patient.date_naissance && <span>{data.patient.date_naissance}</span>}
                  </div>
                </div>
                <div className="pfm-stats">
                  <div className="pfm-stat">
                    <span className="pfm-stat-value">{data.nb_rdvs}</span>
                    <span className="pfm-stat-label">Rendez-vous</span>
                  </div>
                  <div className="pfm-stat">
                    <span className="pfm-stat-value">{data.nb_dossiers}</span>
                    <span className="pfm-stat-label">Dossiers</span>
                  </div>
                </div>
              </div>

              {/* Onglets */}
              <div className="pfm-tabs">
                <button
                  className={`pfm-tab ${tab === 'rdv' ? 'active' : ''}`}
                  onClick={() => setTab('rdv')}
                >
                  <IconCalendar /> Rendez-vous ({data.nb_rdvs})
                </button>
                <button
                  className={`pfm-tab ${tab === 'dossiers' ? 'active' : ''}`}
                  onClick={() => setTab('dossiers')}
                >
                  <IconFile /> Dossiers médicaux ({data.nb_dossiers})
                </button>
              </div>

              {/* Contenu onglet RDV */}
              {tab === 'rdv' && (
                <div className="pfm-list">
                  {data.rendez_vous.length === 0 ? (
                    <p className="pfm-empty">Aucun rendez-vous enregistré.</p>
                  ) : (
                    data.rendez_vous.map((rdv) => {
                      const cfg = statutConfig[rdv.statut] || { label: rdv.statut, color: '#6b7280' };
                      return (
                        <div className="pfm-card" key={rdv.id}>
                          <div className="pfm-card-top">
                            <span className="pfm-card-date">
                              <IconCalendar /> {rdv.date_heure}
                            </span>
                            <span
                              className="pfm-badge"
                              style={{ background: cfg.color + '20', color: cfg.color, border: `1px solid ${cfg.color}40` }}
                            >
                              {cfg.label}
                            </span>
                          </div>
                          {rdv.motif && (
                            <div className="pfm-card-field">
                              <span className="pfm-field-label">Motif</span>
                              <span className="pfm-field-value">{rdv.motif}</span>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* Contenu onglet Dossiers médicaux */}
              {tab === 'dossiers' && (
                <div className="pfm-list">
                  {data.dossiers_medicaux.length === 0 ? (
                    <p className="pfm-empty">Aucun dossier médical enregistré.</p>
                  ) : (
                    data.dossiers_medicaux.map((d) => (
                      <div className="pfm-card" key={d.id}>
                        <div className="pfm-card-top">
                          <span className="pfm-card-date">
                            <IconCalendar /> {d.date_consultation}
                          </span>
                        </div>
                        {d.diagnostic && (
                          <div className="pfm-card-field">
                            <span className="pfm-field-label">Diagnostic</span>
                            <span className="pfm-field-value">{d.diagnostic}</span>
                          </div>
                        )}
                        {d.traitement && (
                          <div className="pfm-card-field">
                            <span className="pfm-field-label">Traitement</span>
                            <span className="pfm-field-value">{d.traitement}</span>
                          </div>
                        )}
                        {d.notes && (
                          <div className="pfm-card-field">
                            <span className="pfm-field-label">Notes</span>
                            <span className="pfm-field-value pfm-notes">{d.notes}</span>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}