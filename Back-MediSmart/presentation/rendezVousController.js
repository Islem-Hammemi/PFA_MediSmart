// =============================================
// presentation/rendezVousController.js — MERGED CLEAN
// =============================================

const rendezVousService = require("../business/rendezVousService");

// ══════════════════════════════════════════════
// PATIENT
// ══════════════════════════════════════════════

const getUpcoming = async (req, res) => {
  try {
    const data = await rendezVousService.getUpcoming(req.utilisateur.user_id);
    res.json({ success: true, data });
  } catch (err) {
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

const getPast = async (req, res) => {
  try {
    const data = await rendezVousService.getPast(req.utilisateur.user_id);
    res.json({ success: true, data });
  } catch (err) {
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

const getOne = async (req, res) => {
  try {
    const data = await rendezVousService.getOne(
      Number(req.params.id),
      req.utilisateur.user_id
    );
    res.json({ success: true, data });
  } catch (err) {
    res.status(err.statusCode || 404).json({ success: false, message: err.message });
  }
};

const reserver = async (req, res) => {
  try {
    const result = await rendezVousService.reserver(
      req.utilisateur.user_id,
      req.body
    );
    res.status(201).json({ success: true, ...result });
  } catch (err) {
    const isConflict = err.message.includes("déjà");
    res.status(isConflict ? 409 : 400).json({ success: false, message: err.message });
  }
};

const annuler = async (req, res) => {
  try {
    const result = await rendezVousService.annuler(
      Number(req.params.id),
      req.utilisateur.user_id
    );
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(err.statusCode || 400).json({ success: false, message: err.message });
  }
};

const getEvaluationEnAttente = async (req, res) => {
  try {
    const data = await rendezVousService.getEvaluationEnAttente(
      req.utilisateur.user_id
    );
    res.json({ success: true, data });
  } catch (err) {
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

// ══════════════════════════════════════════════
// CRÉNEAUX
// ══════════════════════════════════════════════

const getCreneaux = async (req, res) => {
  try {
    const medecinId = Number(req.params.medecinId);
    if (!medecinId || isNaN(medecinId))
      return res.status(400).json({ success: false, message: "medecinId invalide." });

    const data = await rendezVousService.getCreneaux(medecinId);
    res.json({ success: true, count: data.length, data });
  } catch (err) {
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

const reserverViaCreneau = async (req, res) => {
  try {
    const { medecinId, creneauId, motif } = req.body;

    if (!medecinId || !creneauId)
      return res.status(400).json({ success: false, message: "medecinId et creneauId requis." });

    const result = await rendezVousService.reserverViaCreneau(
      req.utilisateur.user_id,
      { medecinId: Number(medecinId), creneauId: Number(creneauId), motif }
    );

    res.status(201).json(result);
  } catch (err) {
    const status = err.message.includes("Conflit") ? 409 : 400;
    res.status(status).json({ success: false, message: err.message });
  }
};

// ══════════════════════════════════════════════
// MÉDECIN
// ══════════════════════════════════════════════

const getPlanningMedecin = async (req, res) => {
  try {
    const { medecin_id: medecinId } = req.utilisateur;

    if (!medecinId)
      return res.status(403).json({ success: false, message: "Accès réservé aux médecins." });

    const data = await rendezVousService.getPlanningMedecin(medecinId);
    res.json({ success: true, count: data.length, data });
  } catch (err) {
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

const getUpcomingMedecin = async (req, res) => {
  try {
    const { medecin_id: medecinId } = req.utilisateur;

    if (!medecinId)
      return res.status(403).json({ success: false, message: "Accès réservé aux médecins." });

    const data = await rendezVousService.getUpcomingMedecin(medecinId);
    res.json({ success: true, count: data.length, data });
  } catch (err) {
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

const getPendingMedecin = async (req, res) => {
  try {
    const { medecin_id: medecinId } = req.utilisateur;

    if (!medecinId)
      return res.status(403).json({ success: false, message: "Accès réservé aux médecins." });

    const data = await rendezVousService.getPendingMedecin(medecinId);
    res.json({ success: true, count: data.length, data });
  } catch (err) {
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

// ✅ using your service logic
const confirmer = async (req, res) => {
  try {
    const { medecin_id: medecinId } = req.utilisateur;

    const result = await rendezVousService.changerStatut(
      Number(req.params.id),
      medecinId,
      "confirme",
      ["planifie"]
    );

    res.json({ success: true, ...result });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const refuser = async (req, res) => {
  try {
    const { medecin_id: medecinId } = req.utilisateur;

    const result = await rendezVousService.changerStatut(
      Number(req.params.id),
      medecinId,
      "annule",
      ["planifie", "confirme"]
    );

    res.json({ success: true, ...result });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const terminer = async (req, res) => {
  try {
    const { medecin_id: medecinId } = req.utilisateur;

    const result = await rendezVousService.changerStatut(
      Number(req.params.id),
      medecinId,
      "termine",
      ["confirme"]
    );

    res.json({ success: true, ...result });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ✅ your feature
const reserverParMedecin = async (req, res) => {
  try {
    const { medecin_id: medecinId } = req.utilisateur;

    const { patientId, dateHeure, motif } = req.body;

    const result = await rendezVousService.reserverParMedecin({
      medecinId,
      patientId: Number(patientId),
      dateHeure,
      motif,
    });

    res.status(201).json({ success: true, ...result });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

module.exports = {
  getUpcoming,
  getPast,
  getOne,
  reserver,
  annuler,
  getEvaluationEnAttente,
  getCreneaux,
  reserverViaCreneau,
  getPlanningMedecin,
  getUpcomingMedecin,
  getPendingMedecin,
  confirmer,
  refuser,
  terminer,
  reserverParMedecin,
};