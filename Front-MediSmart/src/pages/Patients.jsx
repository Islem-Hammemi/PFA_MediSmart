// ============================================================
//  Patients.jsx  –  Page de gestion des patients (médecin)
//  Sprint 3 – US14 + US15
//  Responsable : Sarra Othmani
// ============================================================

import React, { useState, useEffect, useCallback } from 'react';
import './patients.css';

import Navbarmedecin        from '../components/Navbarmedecin';
import Searchbarrepatients  from '../components/Searchbarrepatients';
import PatientList          from '../components/Patientlist';
import Addpatientbutton     from '../components/Addpatientbutton';
import Footerr              from '../components/Footerr';
import PatientFolderModal   from '../components/PatientFolderModal';
import AddPatientModal      from '../components/AddPatientModal';

import { fetchMesPatients } from '../services/dossierAPI';

export default function Patients() {
  /* ── State ──────────────────────────────────────────── */
  const [patients, setPatients]             = useState([]);
  const [filtered, setFiltered]             = useState([]);
  const [loading, setLoading]               = useState(true);
  const [fetchError, setFetchError]         = useState(null);

  // Dossier ouvert
  const [selectedPatient, setSelectedPatient] = useState(null); // { patient_id, nom_complet, … }

  // Modale ajout patient
  const [showAddModal, setShowAddModal]     = useState(false);

  // Toast notification
  const [toast, setToast]                   = useState(null); // { type: 'success'|'error', msg }

  /* ── Chargement initial ─────────────────────────────── */
  const loadPatients = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const data = await fetchMesPatients();
      setPatients(data.patients);
      setFiltered(data.patients);
    } catch (err) {
      setFetchError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadPatients(); }, [loadPatients]);

  /* ── Recherche locale ───────────────────────────────── */
  const handleSearch = (query) => {
    const q = query.toLowerCase().trim();
    if (!q) {
      setFiltered(patients);
    } else {
      setFiltered(
        patients.filter(
          (p) =>
            p.nom_complet?.toLowerCase().includes(q) ||
            p.email?.toLowerCase().includes(q) ||
            p.telephone?.includes(q)
        )
      );
    }
  };

  /* ── Ouvrir dossier patient ─────────────────────────── */
  const handleOpenFolder = (patient) => {
    setSelectedPatient(patient);
  };

  /* ── Fermer dossier ─────────────────────────────────── */
  const handleCloseFolder = () => {
    setSelectedPatient(null);
  };

  /* ── Succès ajout patient ───────────────────────────── */
  const handlePatientAdded = (result) => {
    showToast('success', `Patient créé avec succès (ID : ${result.patient_id})`);
    loadPatients(); // Recharger la liste
  };

  /* ── Toast ──────────────────────────────────────────── */
  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  /* ── Render ─────────────────────────────────────────── */
  return (
    <div className="patients-page">
      <Navbarmedecin />

      {/* Hero */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Smart Patient <span className="hero-title-two">Management</span>
          </h1>
          <p className="hero-subtitle">
            Streamline patient information, track medical records, and deliver better care with ease.
          </p>
        </div>
      </section>

      {/* Barre de recherche + bouton */}
      <div className="patients-toolbar">
        <Searchbarrepatients onSearch={handleSearch} />
        <Addpatientbutton onClick={() => setShowAddModal(true)} />
      </div>

      {/* Compteur */}
      {!loading && !fetchError && (
        <p className="patients-count">
          {filtered.length === patients.length
            ? `${patients.length} patient${patients.length > 1 ? 's' : ''}`
            : `${filtered.length} résultat${filtered.length > 1 ? 's' : ''} sur ${patients.length}`}
        </p>
      )}

      {/* Erreur de chargement */}
      {fetchError && (
        <div className="patients-error">
          <p>⚠ {fetchError}</p>
          <button onClick={loadPatients}>Réessayer</button>
        </div>
      )}

      {/* Liste patients */}
      <PatientList
        patients={filtered}
        loading={loading}
        onOpenFolder={handleOpenFolder}
      />

      <br /><br /><br /><br />
      <Footerr />

      {/* ── Modale dossier patient ─────────────────────── */}
      {selectedPatient && (
        <PatientFolderModal
          patientId={selectedPatient.patient_id}
          onClose={handleCloseFolder}
        />
      )}

      {/* ── Modale ajout patient ───────────────────────── */}
      {showAddModal && (
        <AddPatientModal
          onClose={() => setShowAddModal(false)}
          onSuccess={handlePatientAdded}
        />
      )}

      {/* ── Toast notification ─────────────────────────── */}
      {toast && (
        <div className={`patients-toast patients-toast-${toast.type}`}>
          {toast.type === 'success' ? '✓' : '⚠'} {toast.msg}
        </div>
      )}
    </div>
  );
}