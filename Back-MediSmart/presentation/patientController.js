

const patientService = require('../business/patientService');

// US9
const getMyTickets = async (req, res) => {
  try {
    const tickets = await patientService.getMyTickets(req.utilisateur.user_id); // ← fix
    return res.status(200).json({ success: true, data: tickets });
  } catch (err) {
    const status = err.message === 'Profil patient introuvable.' ? 400 : 500;
    return res.status(status).json({ success: false, message: err.message });
  }
};

// US10
const getMyDossiers = async (req, res) => {
  try {
    const dossiers = await patientService.getMyDossiers(req.utilisateur.user_id); // ← fix
    return res.status(200).json({ success: true, data: dossiers });
  } catch (err) {
    const status = err.message === 'Profil patient introuvable.' ? 400 : 500;
    return res.status(status).json({ success: false, message: err.message });
  }
};

// US12
const logout = async (req, res) => {
  try {
    await patientService.logout(req.token); // ← fix (middleware attache req.token)
    return res.status(200).json({ success: true, message: 'Déconnexion réussie.' });
  } catch (err) {
    const status = err.message === 'Token manquant.' ? 400
                 : err.message === 'Session introuvable.' ? 404
                 : 500;
    return res.status(status).json({ success: false, message: err.message });
  }
};

module.exports = { getMyTickets, getMyDossiers, logout };