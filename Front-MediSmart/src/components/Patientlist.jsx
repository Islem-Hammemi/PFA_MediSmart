// ============================================================
//  Patientlist.jsx  –  Liste des patients du médecin
//  Reçoit les données depuis Patients.jsx via props
// ============================================================

import React from 'react';
import './doctorspage.css';

const FolderIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="#4a7aff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
  </svg>
);

/* ── Initiales avatar ──────────────────────────────────── */
const getInitials = (nom = '') =>
  nom.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();

/* ── Couleurs avatar (déterministes sur le nom) ────────── */
const AVATAR_COLORS = [
  ['#4a7aff', '#7c5cfc'],
  ['#10b981', '#059669'],
  ['#f59e0b', '#d97706'],
  ['#ec4899', '#db2777'],
  ['#06b6d4', '#0891b2'],
];
const getAvatarGradient = (nom = '') => {
  const idx = nom.charCodeAt(0) % AVATAR_COLORS.length;
  const [from, to] = AVATAR_COLORS[idx];
  return `linear-gradient(135deg, ${from}, ${to})`;
};

/* ── Formater la date de naissance en âge ──────────────── */
const getAge = (dateNaissance) => {
  if (!dateNaissance) return null;
  // dateNaissance peut être "1990-05-14" (ISO) ou "14/05/1990"
  let d;
  if (dateNaissance.includes('-')) {
    d = new Date(dateNaissance);
  } else {
    const [day, month, year] = dateNaissance.split('/');
    d = new Date(`${year}-${month}-${day}`);
  }
  if (isNaN(d)) return null;
  const age = Math.floor((Date.now() - d.getTime()) / (365.25 * 24 * 3600 * 1000));
  return age;
};

/* ── Carte patient ─────────────────────────────────────── */
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
        {/* Avatar initiales */}
        <div
          className="patient-avatar patient-avatar-initials"
          style={{ background: getAvatarGradient(patient.nom_complet) }}
        >
          {getInitials(patient.nom_complet)}
        </div>
        <div className="patient-details">
          <span className="patient-name">{patient.nom_complet}</span>
          {age !== null && (
            <span className="patient-age">{age} ans</span>
          )}
          {patient.telephone && (
            <span className="patient-phone">{patient.telephone}</span>
          )}
        </div>
      </div>

      <div className="patient-divider" />

      <div className="patient-visit">
        <span className="visit-label">Dernier RDV</span>
        <span className="visit-date">
          {patient.dernier_rdv || '—'}
        </span>
        <span className="visit-count">
          {patient.nb_rdv} rendez-vous
        </span>
      </div>
    </div>
  );
}

/* ── Skeleton de chargement ────────────────────────────── */
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

/* ── Export principal ──────────────────────────────────── */
export default function PatientList({ patients = [], loading = false, onOpenFolder }) {
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
    <div className="patient-list-grid">
      {patients.map((patient) => (
        <PatientCard
          key={patient.patient_id}
          patient={patient}
          onOpenFolder={onOpenFolder}
        />
      ))}
    </div>
  );
}