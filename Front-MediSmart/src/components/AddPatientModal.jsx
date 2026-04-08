// ============================================================
//  AddPatientModal.jsx
//  Formulaire popup pour ajouter un nouveau patient
// ============================================================

import React, { useState, useEffect } from 'react';
import { ajouterPatient } from '../services/dossierAPI';
import './doctorspage.css';

const IconClose = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const INITIAL_FORM = {
  prenom         : '',
  nom            : '',
  email          : '',
  telephone      : '',
  date_naissance : '',
};

export default function AddPatientModal({ onClose, onSuccess }) {
  const [form, setForm]       = useState(INITIAL_FORM);
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  // Fermer avec Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
    setApiError(null);
  };

  /* ── Validation locale ──────────────────────────────── */
  const validate = () => {
    const errs = {};
    if (!form.prenom.trim()) errs.prenom = 'Le prénom est obligatoire.';
    if (!form.nom.trim())    errs.nom    = 'Le nom est obligatoire.';
    if (!form.email.trim())  errs.email  = "L'email est obligatoire.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = "Format d'email invalide.";
    return errs;
  };

  /* ── Soumission ──────────────────────────────────────── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    setApiError(null);
    try {
      const result = await ajouterPatient({
        prenom         : form.prenom.trim(),
        nom            : form.nom.trim(),
        email          : form.email.trim().toLowerCase(),
        telephone      : form.telephone.trim() || undefined,
        date_naissance : form.date_naissance || undefined,
      });
      onSuccess && onSuccess(result);
      onClose();
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="apm-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="apm-modal">

        {/* Header */}
        <div className="apm-header">
          <div>
            <h2 className="apm-title">Nouveau Patient</h2>
            <p className="apm-subtitle">Remplissez les informations du patient</p>
          </div>
          <button className="apm-close-btn" onClick={onClose} aria-label="Fermer">
            <IconClose />
          </button>
        </div>

        {/* Form */}
        <form className="apm-form" onSubmit={handleSubmit} noValidate>

          {/* Erreur API */}
          {apiError && (
            <div className="apm-api-error">⚠ {apiError}</div>
          )}

          {/* Row : Prénom + Nom */}
          <div className="apm-row">
            <div className="apm-field">
              <label className="apm-label" htmlFor="prenom">
                Prénom <span className="apm-required">*</span>
              </label>
              <input
                id="prenom"
                name="prenom"
                type="text"
                className={`apm-input ${errors.prenom ? 'apm-input-error' : ''}`}
                placeholder="ex : Rania"
                value={form.prenom}
                onChange={handleChange}
                autoFocus
              />
              {errors.prenom && <p className="apm-error-msg">{errors.prenom}</p>}
            </div>

            <div className="apm-field">
              <label className="apm-label" htmlFor="nom">
                Nom <span className="apm-required">*</span>
              </label>
              <input
                id="nom"
                name="nom"
                type="text"
                className={`apm-input ${errors.nom ? 'apm-input-error' : ''}`}
                placeholder="ex : Ben Salah"
                value={form.nom}
                onChange={handleChange}
              />
              {errors.nom && <p className="apm-error-msg">{errors.nom}</p>}
            </div>
          </div>

          {/* Email */}
          <div className="apm-field">
            <label className="apm-label" htmlFor="email">
              Email <span className="apm-required">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className={`apm-input ${errors.email ? 'apm-input-error' : ''}`}
              placeholder="ex : rania@example.com"
              value={form.email}
              onChange={handleChange}
            />
            {errors.email && <p className="apm-error-msg">{errors.email}</p>}
          </div>

          {/* Row : Téléphone + Date naissance */}
          <div className="apm-row">
            <div className="apm-field">
              <label className="apm-label" htmlFor="telephone">
                Téléphone <span className="apm-optional">(optionnel)</span>
              </label>
              <input
                id="telephone"
                name="telephone"
                type="tel"
                className="apm-input"
                placeholder="ex : 55 123 456"
                value={form.telephone}
                onChange={handleChange}
              />
            </div>

            <div className="apm-field">
              <label className="apm-label" htmlFor="date_naissance">
                Date de naissance <span className="apm-optional">(optionnel)</span>
              </label>
              <input
                id="date_naissance"
                name="date_naissance"
                type="date"
                className="apm-input"
                value={form.date_naissance}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Info mot de passe */}
          <div className="apm-info-box">
            🔑 Un mot de passe temporaire <strong>Medismart2026!</strong> sera attribué au patient.
            Il pourra le modifier lors de sa première connexion.
          </div>

          {/* Actions */}
          <div className="apm-actions">
            <button type="button" className="apm-btn-cancel" onClick={onClose} disabled={loading}>
              Annuler
            </button>
            <button type="submit" className="apm-btn-submit" disabled={loading}>
              {loading ? (
                <>
                  <span className="apm-spinner" />
                  Création…
                </>
              ) : (
                '+ Créer le patient'
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}