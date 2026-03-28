// =============================================
// presentation/patientController.js
// =============================================
const patientService = require('../business/patientService');

// ─── US9 : GET /api/tickets/patient ──────────────────────────
const getMyTickets = async (req, res) => {
  try {
    const data = await patientService.getMyTickets(req.utilisateur.user_id);
    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── US10 : GET /api/dossiers/patient ────────────────────────
const getMyDossiers = async (req, res) => {
  try {
    const data = await patientService.getMyDossiers(req.utilisateur.user_id);
    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── US12 : POST /api/logout ─────────────────────────────────
const logout = async (req, res) => {
  try {
    await patientService.logout(req.token);
    res.status(200).json({ success: true, message: 'Déconnexion réussie.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── NOUVEAU : GET /api/patient/dashboard/stats ───────────────
const getDashboardStats = async (req, res) => {
  try {
    const data = await patientService.getDashboardStats(req.utilisateur.user_id);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── NOUVEAU : GET /api/patient/dashboard/next-appointment ────
const getNextAppointment = async (req, res) => {
  try {
    const data = await patientService.getNextAppointment(req.utilisateur.user_id);
    res.status(200).json({ success: true, data }); // data = null si aucun RDV
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getMyTickets,
  getMyDossiers,
  logout,
  getDashboardStats,   // nouveau
  getNextAppointment,  // nouveau
};