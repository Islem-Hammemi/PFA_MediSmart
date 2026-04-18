const medecinService = require("../business/medecinService");

const getMedecins = async (req, res) => {
  try {
    const { search } = req.query;
    const data = await medecinService.getMedecins(search);
    return res.status(200).json({ success: true, count: data.length, search: search || null, data });
  } catch (error) {
    console.error("Erreur getMedecins:", error);
    return res.status(500).json({ success: false, message: "Erreur serveur." });
  }
};

const getMedecinsPresents = async (req, res) => {
  try {
    const data = await medecinService.getMedecinsPresents();
    return res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Erreur serveur." });
  }
};

// Legacy checkin — userId in body
const checkIn = async (req, res) => {
  try {
    const { userId } = req.body;
    const medecin = await medecinService.checkInMedecin(userId);
    return res.status(200).json({ success: true, message: "Présence marquée ✅", data: medecin });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

// Legacy checkout — userId in body
const checkOut = async (req, res) => {
  try {
    const { userId } = req.body;
    const medecin = await medecinService.checkOutMedecin(userId);
    return res.status(200).json({ success: true, message: "Départ enregistré 🚪", data: medecin });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const getMedecinSemaine = async (req, res) => {
  try {
    const data = await medecinService.getMedecinSemaine();
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Erreur serveur." });
  }
};

// ✅ FIX — reads userId from token OR body (backward compat)
const uploadPhoto = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ success: false, message: "Aucun fichier envoyé." });

    const userId   = req.utilisateur?.user_id || req.body.userId;
    // ✅ Path must match static serve: app.use("/uploads", express.static("uploads"))
    // So store as /uploads/medecins/filename (relative to uploads root)
    const photoPath = `/uploads/medecins/${req.file.filename}`;
    const medecin  = await medecinService.updatePhoto(userId, photoPath);

    return res.status(200).json({
      success:  true,
      message:  "Photo mise à jour ✅",
      photoUrl: `http://localhost:5000${photoPath}`,
      photo:    photoPath,
      data:     medecin,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

// ✅ GET /api/medecins/mon-statut
const getMonStatut = async (req, res) => {
  try {
    const medecinId = req.utilisateur.medecin_id;
    if (!medecinId)
      return res.status(403).json({ success: false, message: "Accès réservé aux médecins." });
    const statut = await medecinService.getStatut(medecinId);
    return res.json({ success: true, statut });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ POST /api/medecins/checkin-auth (by medecin_id from token)
const checkin = async (req, res) => {
  try {
    const medecinId = req.utilisateur.medecin_id;
    if (!medecinId)
      return res.status(403).json({ success: false, message: "Accès réservé aux médecins." });
    const { statut } = req.body;
    const targetStatut = statut === "en_consultation" ? "en_consultation" : "disponible";
    await medecinService.setStatut(medecinId, targetStatut);
    return res.json({ success: true, statut: targetStatut });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ POST /api/medecins/checkout-auth (by medecin_id from token)
const checkout = async (req, res) => {
  try {
    const medecinId = req.utilisateur.medecin_id;
    if (!medecinId)
      return res.status(403).json({ success: false, message: "Accès réservé aux médecins." });
    await medecinService.setStatut(medecinId, "absent");
    return res.json({ success: true, statut: "absent" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ PUT /api/medecins/profile
const updateProfile = async (req, res) => {
  try {
    const userId = req.utilisateur.user_id;
    if (!userId)
      return res.status(403).json({ success: false, message: "Non autorisé." });
    const { prenom, nom, email, telephone } = req.body;
    if (!prenom || !nom || !email)
      return res.status(400).json({ success: false, message: "prenom, nom et email requis." });
    await medecinService.updateProfile(userId, { prenom, nom, email, telephone });
    return res.json({ success: true, message: "Profil mis à jour." });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ GET /api/medecins/stats
const getStats = async (req, res) => {
  try {
    const data = await medecinService.getStats();
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getMedecins,
  getMedecinsPresents,
  checkIn,
  checkOut,
  getMedecinSemaine,
  uploadPhoto,
  getMonStatut,
  checkin,
  checkout,
  updateProfile,
  getStats,
};