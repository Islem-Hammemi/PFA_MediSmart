// =============================================
// presentation/authController.js
// Contrôleur HTTP - Authentification
// Reçoit les requêtes → appelle business → répond au client
// =============================================
const authService = require("../business/authService");

// ── US3 : POST /api/auth/patient/register ───────────────────────────────────
const registerPatient = async (req, res) => {
  try {
    const { nom, prenom, email, motDePasse, telephone, dateNaissance} = req.body;

    if (!nom || !prenom || !email || !motDePasse) {
      return res.status(400).json({
        success: false,
        message: "Nom, prénom, email et mot de passe sont obligatoires.",
      });
    }

    const resultat = await authService.inscrirePatient({
      nom, prenom, email, motDePasse, telephone, dateNaissance
    });

    res.status(201).json({
      success: true,
      message: "Compte patient créé avec succès.",
      data: resultat,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/* ── US4 : POST /api/auth/patient/login ──────────────────────────────────────
const loginPatient = async (req, res) => {
  try {
    const { email, motDePasse } = req.body;

    if (!email || !motDePasse) {
      return res.status(400).json({
        success: false,
        message: "Email et mot de passe requis.",
      });
    }

    const resultat = await authService.connecterPatient({ email, motDePasse });

    res.status(200).json({
      success: true,
      message: "Connexion réussie.",
      data: resultat,
    });
  } catch (error) {
    res.status(401).json({ success: false, message: error.message });
  }
};

// ── US5 : POST /api/auth/medecin/login ──────────────────────────────────────
const loginMedecin = async (req, res) => {
  try {
    const { email, motDePasse } = req.body;

    if (!email || !motDePasse) {
      return res.status(400).json({
        success: false,
        message: "Email et mot de passe requis.",
      });
    }

    const resultat = await authService.connecterMedecin({ email, motDePasse });

    res.status(200).json({
      success: true,
      message: "Connexion médecin réussie.",
      data: resultat,
    });
  } catch (error) {
    res.status(401).json({ success: false, message: error.message });
  }
};
*/
// ── Déconnexion : supprime le token de la table SESSIONS ────────────────────
const logout = async (req, res) => {
  try {
    await authService.deconnecter(req.token);
    res.status(200).json({
      success: true,
      message: "Déconnexion réussie.",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET /api/auth/me - Récupérer l'utilisateur connecté ─────────────────────
const getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    data: req.utilisateur,
  });
};

// ── Login unique ─────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, motDePasse } = req.body;
    if (!email || !motDePasse) {
      return res.status(400).json({
        success: false,
        message: "Email et mot de passe requis.",
      });
    }
    const resultat = await authService.connecter({ email, motDePasse });
    res.status(200).json({ success: true, data: resultat });
  } catch (error) {
    res.status(401).json({ success: false, message: error.message });
  }
};

module.exports = {
  registerPatient,
  //loginPatient,
  //loginMedecin,
  logout,
  getMe,
  login,
};