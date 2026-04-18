import React, { useState } from 'react';
import AppointmentDetailModal from './Appointmentdetailmodal';
import './doctorspage.css';



// ── Icons ─────────────────────────────────────────────────────
const FolderIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="#4a7aff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
  </svg>
);

const FileIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
  </svg>
);

// ── Helpers ───────────────────────────────────────────────────
const getInitials = (nom = '') =>
  nom.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();

const getAvatarColor = () => '#CDDCF8';

const getAge = (dateNaissance) => {
  if (!dateNaissance) return null;
  let d;
  if (dateNaissance.includes('-')) {
    d = new Date(dateNaissance);
  } else {
    const [day, month, year] = dateNaissance.split('/');
    d = new Date(`${year}-${month}-${day}`);
  }
  if (isNaN(d)) return null;
  return Math.floor((Date.now() - d.getTime()) / (365.25 * 24 * 3600 * 1000));
};

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  if (dateStr.includes('-') && !dateStr.includes('à')) {
    const d = new Date(dateStr);
    if (!isNaN(d)) return d.toLocaleDateString('fr-FR');
  }
  return dateStr;
};

const STATUT_STYLE = {
  confirme: { label: 'Confirmed', color: '#10b981', bg: '#d1fae5' },
  planifie: { label: 'Planned',   color: '#f59e0b', bg: '#fef3c7' },
  annule:   { label: 'Cancelled', color: '#ef4444', bg: '#fee2e2' },
  termine:  { label: 'Completed', color: '#6366f1', bg: '#ede9fe' },
};

// ── Patient Dossier Popup ─────────────────────────────────────
function PatientDossierPopup({ patient, onClose }) {
  const [selectedRdv, setSelectedRdv] = useState(null);

  const age      = getAge(patient.date_naissance);
  const rdvList  = patient.rendez_vous || [];
  const initials = getInitials(patient.nom_complet);

  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  React.useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape' && !selectedRdv) onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, selectedRdv]);

  return (
    <>
      <div className="pd-backdrop" onClick={handleBackdrop}>
        <div className="pd-modal">

          {/* Header */}
          <div className="pd-header">
            <h3 className="pd-header__title">Patient File</h3>
            <button className="pd-close" onClick={onClose}>
              X
            </button>
          </div>

          {/* Patient info */}
          <div className="pd-patient-info">
            <div
              className="pd-avatar"
style={{ backgroundColor: getAvatarColor(), color: '#365081' }}            >
              {initials}
            </div>
            <div className="pd-patient-details">
              <h4 className="pd-patient-name">{patient.nom_complet}</h4>
              <div className="pd-patient-meta">
                {patient.email && (
                  <span className="pd-meta-item">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                    {patient.email}
                  </span>
                )}
                {patient.telephone && (
                  <span className="pd-meta-item">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.62 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                    {patient.telephone}
                  </span>
                )}
                {patient.date_naissance && (
                  <span className="pd-meta-item">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8"  y1="2" x2="8"  y2="6"/>
                      <line x1="3"  y1="10" x2="21" y2="10"/>
                    </svg>
                    {formatDate(patient.date_naissance)}
                    {age !== null && ` · ${age} years old`}
                  </span>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="pd-stats">
              <div className="pd-stat">
                <span className="pd-stat__value">{patient.nb_rdv ?? rdvList.length}</span>
                <span className="pd-stat__label">Appointments</span>
              </div>
            </div>
          </div>

          {/* Appointments list */}
          <div className="pd-section">
            <h4 className="pd-section__title">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8"  y1="2" x2="8"  y2="6"/>
                <line x1="3"  y1="10" x2="21" y2="10"/>
              </svg>
              Appointments
            </h4>

            {rdvList.length === 0 ? (
              <p className="pd-empty">No appointments recorded.</p>
            ) : (
              <div className="pd-rdv-list">
                {rdvList.map((rdv, i) => {
                  const st = STATUT_STYLE[rdv.statut] || STATUT_STYLE.planifie;
                  return (
                    <div className="pd-rdv-row" key={rdv.id ?? i}>
                      <div className="pd-rdv-left">
                        <span className="pd-rdv-date">{rdv.date_heure}</span>
                        {rdv.motif && (
                          <span className="pd-rdv-motif">{rdv.motif}</span>
                        )}
                      </div>
                      <div className="pd-rdv-right">
                        <span
                          className="pd-rdv-statut"
                          style={{ color: st.color, background: st.bg }}
                        >
                          {st.label}
                        </span>
                        <button
                          className="pd-file-btn"
                          title="View details"
                          onClick={() => setSelectedRdv(rdv)}
                        >
                          View
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Appointment detail modal on top */}
      {selectedRdv && (
        <AppointmentDetailModal
          appointment={selectedRdv}
          onClose={() => setSelectedRdv(null)}
        />
      )}
    </>
  );
}

// ── Patient Card ──────────────────────────────────────────────
function PatientCard({ patient, onOpenFolder }) {
  const age = getAge(patient.date_naissance);

  return (
    <div className="patient-card">
      <button
        className="patient-folder-btn"
        onClick={() => onOpenFolder && onOpenFolder(patient)}
        title="Ouvrir le dossier"
      >
        <FolderIcon />
      </button>

      <div className="patient-info">
        <div
          className="patient-avatar patient-avatar-initials"
style={{ backgroundColor: getAvatarColor(), color: '#365081' }}        >
          {getInitials(patient.nom_complet)}
        </div>
        <div className="patient-details">
          <span className="patient-name">{patient.nom_complet}</span>
          {age !== null && <span className="patient-age">{age} years old</span>}
          {patient.telephone && (
            <span className="patient-phone">{patient.telephone}</span>
          )}
        </div>
      </div>

      <div className="patient-divider" />

      <div className="patient-visit">
        <span className="visit-label">Dernier RDV</span>
        <span className="visit-date">{patient.dernier_rdv || '—'}</span>
        
      </div>
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────
function PatientCardSkeleton() {
  return (
    <div className="patient-card patient-card-skeleton">
      <div className="sk sk-icon" />
      <div className="patient-info">
        <div className="sk sk-avatar" />
        <div className="patient-details">
          <div className="sk sk-name" />
          <div className="sk sk-age" />
        </div>
      </div>
      <div className="patient-divider" />
      <div className="patient-visit">
        <div className="sk sk-label" />
        <div className="sk sk-date" />
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────
export default function PatientList({ patients = [], loading = false }) {
  const [openPatient, setOpenPatient] = useState(null);

  if (loading) {
    return (
      <div className="patient-list-grid">
        {[...Array(6)].map((_, i) => <PatientCardSkeleton key={i} />)}
      </div>
    );
  }

  if (patients.length === 0) {
    return (
      <div className="patient-list-empty">
        <p>Aucun patient enregistré pour l'instant.</p>
      </div>
    );
  }

  return (
    <>
      <div className="patient-list-grid">
        {patients.map((patient) => (
          <PatientCard
            key={patient.patient_id}
            patient={patient}
            onOpenFolder={setOpenPatient}
          />
        ))}
      </div>

      {openPatient && (
        <PatientDossierPopup
          patient={openPatient}
          onClose={() => setOpenPatient(null)}
        />
      )}
    </>
  );
}