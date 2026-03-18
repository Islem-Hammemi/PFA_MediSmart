// =============================================
// middleware/authMiddleware.js
// Middleware JWT - Vérification session & rôles
// US7 : Protéger accès tickets/RDV (patients authentifiés uniquement)
// Vérifie le JWT ET la table SESSIONS (double sécurité)
// =============================================
const jwt         = require("jsonwebtoken");
const patientRepo = require("../repository/patientRepository");
const medecinRepo = require("../repository/medecinRepository");
const sessionRepo = require("../repository/sessionRepository");

// ── Middleware : Vérifier le token JWT ───────────────────────────────────────
const proteger = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Accès non autorisé. Veuillez vous connecter.",
    });
  }

  try {
    // 1. Vérifier la signature JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 2. Vérifier que le token existe en SESSIONS (pas révoqué via logout)
    const session = await sessionRepo.verifier(token);
    if (!session) {
      return res.status(401).json({
        success: false,
        message: "Session expirée ou révoquée. Veuillez vous reconnecter.",
      });
    }

    // 3. Récupérer l'utilisateur selon son rôle
    if (decoded.role === "patient") {
      req.utilisateur = await patientRepo.trouverParId(decoded.id);
    } else if (decoded.role === "medecin") {
      req.utilisateur = await medecinRepo.trouverParId(decoded.id);
    }

    if (!req.utilisateur) {
      return res.status(401).json({
        success: false,
        message: "Utilisateur introuvable. Token invalide.",
      });
    }

    // Attacher le token brut pour le logout
    req.token = token;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Token invalide ou expiré. Veuillez vous reconnecter.",
    });
  }
};

// ── Middleware : Restreindre par rôle ────────────────────────────────────────
const autoriserRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.utilisateur.role)) {
      return res.status(403).json({
        success: false,
        message: `Accès refusé. Cette action est réservée aux : ${roles.join(", ")}.`,
      });
    }
    next();
  };
};

// ── Middleware : Accès tickets/RDV (US7) ─────────────────────────────────────
// Seuls les patients authentifiés peuvent générer un ticket ou prendre un RDV
const protegerTicketRDV = [proteger, autoriserRole("patient")];

const JWT_SECRET = process.env.JWT_SECRET || "medismart_secret_key";
 

const verifyToken = (req, res, next) => {
  
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Accès refusé. Token manquant.",
    });
  }
 

  const token = authHeader.split(" ")[1];
 
  try {
   
    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Token invalide ou expiré.",
    });
  }
};
module.exports = {
  proteger,
  autoriserRole,
  protegerTicketRDV,
  verifyToken}; 

module.exports = { verifyToken };