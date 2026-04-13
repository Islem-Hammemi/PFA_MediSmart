// =============================================
// presentation/authController.js
// =============================================
const authService    = require("../business/authService");
const { sendError }  = require("../middleware/errorHandler");

const registerPatient = async (req, res) => {
  try {
    const { nom, prenom, email, motDePasse, telephone, dateNaissance } = req.body;
    if (!nom || !prenom || !email || !motDePasse) {
      return res.status(400).json({
        success: false,
        message: "First name, last name, email, and password are required.",
      });
    }
    const resultat = await authService.inscrirePatient({ nom, prenom, email, motDePasse, telephone, dateNaissance });
    res.status(201).json({ success: true, message: "Account created successfully.", data: resultat });
  } catch (err) {
    return sendError(res, err);
  }
};

const login = async (req, res) => {
  try {
    const { email, motDePasse } = req.body;
    if (!email || !motDePasse) {
      return res.status(400).json({ success: false, message: "Email and password are required." });
    }
    const resultat = await authService.connecter({ email, motDePasse });
    res.status(200).json({ success: true, data: resultat });
  } catch (err) {
    return sendError(res, err);
  }
};

const logout = async (req, res) => {
  try {
    await authService.deconnecter(req.token);
    res.status(200).json({ success: true, message: "Logged out successfully." });
  } catch (err) {
    return sendError(res, err);
  }
};

const getMe = async (req, res) => {
  res.status(200).json({ success: true, data: req.utilisateur });
};

module.exports = { registerPatient, logout, getMe, login };