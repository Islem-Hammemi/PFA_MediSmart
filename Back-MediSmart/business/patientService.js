// =============================================
// business/patientService.js
// =============================================
const patientRepository = require('../repository/patientRepository');

// ─── US9 : Tickets ────────────────────────────────────────────
const getMyTickets = async (userId) => {
  const patientId = await patientRepository.getPatientIdByUserId(userId);
  if (!patientId) throw new Error('Profil patient introuvable.');

  const rows = await patientRepository.getTicketsByPatient(patientId);
  return rows.map(row => ({
    ticket_id:  row.ticket_id,
    numero:     row.numero,
    position:   row.position,
    statut:     row.statut,
    created_at: row.created_at,
    medecin: {
      id:         row.medecin_id,
      nom:        row.medecin_nom,
      prenom:     row.medecin_prenom,
      specialite: row.specialite,
    },
  }));
};

// ─── US10 : Dossiers médicaux ─────────────────────────────────
const getMyDossiers = async (userId) => {
  const patientId = await patientRepository.getPatientIdByUserId(userId);
  if (!patientId) throw new Error('Profil patient introuvable.');

  const rows = await patientRepository.getDossiersByPatient(patientId);
  return rows.map(row => ({
    dossier_id:        row.dossier_id,
    date_consultation: row.date_consultation,
    diagnostic:        row.diagnostic,
    traitement:        row.traitement,
    notes:             row.notes,
    medecin: {
      id:         row.medecin_id,
      nom:        row.medecin_nom,
      prenom:     row.medecin_prenom,
      specialite: row.specialite,
    },
  }));
};

// ─── US12 : Logout ────────────────────────────────────────────
const logout = async (token) => {
  if (!token) throw new Error('Token manquant.');
  const affected = await patientRepository.deleteSession(token);
  if (affected === 0) throw new Error('Session introuvable.');
};

// ─── NOUVEAU : Stats dashboard ────────────────────────────────
const getDashboardStats = async (userId) => {
  const patientId = await patientRepository.getPatientIdByUserId(userId);
  if (!patientId) throw new Error('Profil patient introuvable.');
  return await patientRepository.getDashboardStats(patientId);
};

// ─── NOUVEAU : Prochain rendez-vous ──────────────────────────
const getNextAppointment = async (userId) => {
  const patientId = await patientRepository.getPatientIdByUserId(userId);
  if (!patientId) throw new Error('Profil patient introuvable.');
  return await patientRepository.getNextAppointment(patientId);
};

module.exports = {
  getMyTickets,
  getMyDossiers,
  logout,
  getDashboardStats,   // nouveau
  getNextAppointment,  // nouveau
};