// ============================================================
//  presentation/patientController.js  — standalone, no other controllers bundled
// ============================================================
const patientService = require('../business/patientService');
const { sendError }  = require('../middleware/errorHandler');

const getMyTickets = async (req, res) => {
  try {
    const data = await patientService.getMyTickets(req.utilisateur.user_id);
    res.status(200).json({ success: true, count: data.length, data });
  } catch (err) { return sendError(res, err); }
};

const getMyDossiers = async (req, res) => {
  try {
    const data = await patientService.getMyDossiers(req.utilisateur.user_id);
    res.status(200).json({ success: true, count: data.length, data });
  } catch (err) { return sendError(res, err); }
};

const logout = async (req, res) => {
  try {
    await patientService.logout(req.token);
    res.status(200).json({ success: true, message: "Logged out successfully." });
  } catch (err) { return sendError(res, err); }
};

const getDashboardStats = async (req, res) => {
  try {
    const data = await patientService.getDashboardStats(req.utilisateur.user_id);
    res.status(200).json({ success: true, data });
  } catch (err) { return sendError(res, err); }
};

const getNextAppointment = async (req, res) => {
  try {
    const data = await patientService.getNextAppointment(req.utilisateur.user_id);
    res.status(200).json({ success: true, data });
  } catch (err) { return sendError(res, err); }
};

module.exports = { getMyTickets, getMyDossiers, logout, getDashboardStats, getNextAppointment };