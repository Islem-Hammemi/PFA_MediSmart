// ============================================================
//  dossierAPI.js  –  Couche API (Frontend)
//  Toutes les requêtes liées aux dossiers patients
// ============================================================

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Helper : récupère le token JWT depuis localStorage.
 */
const getHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

/**
 * GET /api/dossiers/mes-patients
 * Retourne la liste des patients du médecin connecté.
 */
export const fetchMesPatients = async () => {
  const res = await fetch(`${BASE_URL}/dossiers/mes-patients`, {
    headers: getHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Erreur lors du chargement des patients.');
  return data; // { success, total, patients }
};

/**
 * GET /api/dossiers/patient/:patient_id
 * Retourne le dossier complet d'un patient.
 */
export const fetchDossierPatient = async (patient_id) => {
  const res = await fetch(`${BASE_URL}/dossiers/patient/${patient_id}`, {
    headers: getHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Erreur lors du chargement du dossier.');
  return data; // { success, patient, dossiers_medicaux, rendez_vous, nb_dossiers, nb_rdvs }
};

/**
 * POST /api/dossiers/ajouter-patient
 * Crée un nouveau compte patient.
 */
export const ajouterPatient = async (patientData) => {
  const res = await fetch(`${BASE_URL}/dossiers/ajouter-patient`, {
    method : 'POST',
    headers: getHeaders(),
    body   : JSON.stringify(patientData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Erreur lors de la création du patient.');
  return data; // { success, message, patient_id }
};
