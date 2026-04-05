
const rendezVousService = require("../business/rendezVousService");



// ─── GET /api/rendez-vous/upcoming ───────────────────────────
const getUpcoming = async (req, res) => {
  try {
    const data = await rendezVousService.getUpcoming(req.utilisateur.user_id);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/rendez-vous/past ───────────────────────────────
const getPast = async (req, res) => {
  try {
    const data = await rendezVousService.getPast(req.utilisateur.user_id);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/rendez-vous/:id ────────────────────────────────
const getOne = async (req, res) => {
  try {
    const data = await rendezVousService.getOne(
      Number(req.params.id),
      req.utilisateur.user_id
    );
    res.json({ success: true, data });
  } catch (err) {
    res.status(404).json({ success: false, message: err.message });
  }
};

// ─── POST /api/rendez-vous ───────────────────────────────────
// Body : { medecinId, dateHeure, motif? }  ← ancien mode sans créneau
const reserver = async (req, res) => {
  try {
    const result = await rendezVousService.reserver(
      req.utilisateur.user_id,
      req.body
    );
    res.status(201).json({ success: true, ...result });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ─── PATCH /api/rendez-vous/:id/annuler ──────────────────────
const annuler = async (req, res) => {
  try {
    const result = await rendezVousService.annuler(
      Number(req.params.id),
      req.utilisateur.user_id
    );
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ─── GET /api/rendez-vous/evaluation-pending ─────────────────
const getEvaluationEnAttente = async (req, res) => {
  try {
    const data = await rendezVousService.getEvaluationEnAttente(
      req.utilisateur.user_id
    );
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// ─── GET /api/rendez-vous/creneaux/:medecinId ────────────────
// US17 – créneaux disponibles d'un médecin
// Accessible : patient authentifié
const getCreneaux = async (req, res) => {
  try {
    const medecinId = Number(req.params.medecinId);
    if (!medecinId || isNaN(medecinId)) {
      return res.status(400).json({
        success: false,
        message: "medecinId invalide.",
      });
    }
    const data = await rendezVousService.getCreneaux(medecinId);
    res.json({ success: true, count: data.length, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── POST /api/rendez-vous/creneau ───────────────────────────
// US18 – prise de RDV via créneau (avec validation + transaction)
// Body : { medecinId: int, creneauId: int, motif?: string }
const reserverViaCreneau = async (req, res) => {
  try {
    const { medecinId, creneauId, motif } = req.body;

    if (!medecinId || !creneauId) {
      return res.status(400).json({
        success: false,
        message: "medecinId et creneauId sont requis.",
      });
    }

    const result = await rendezVousService.reserverViaCreneau(
      req.utilisateur.user_id,
      { medecinId: Number(medecinId), creneauId: Number(creneauId), motif }
    );

    res.status(201).json(result);
  } catch (err) {
    // Conflit = 409
    const status =
      err.message.includes("déjà réservé") || err.message.includes("Conflit")
        ? 409
        : 400;
    res.status(status).json({ success: false, message: err.message });
  }
};

// ─── GET /api/rendez-vous/medecin/planning ───────────────────
// US13 – planning complet du médecin connecté
const getPlanningMedecin = async (req, res) => {
  try {
    const medecinId = req.utilisateur.medecin_id;
    if (!medecinId) {
      return res.status(403).json({
        success: false,
        message: "Accès réservé aux médecins.",
      });
    }
    const data = await rendezVousService.getPlanningMedecin(medecinId);
    res.json({ success: true, count: data.length, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/rendez-vous/medecin/upcoming ───────────────────
// US19 – prochains RDV du médecin connecté
const getUpcomingMedecin = async (req, res) => {
  try {
    const medecinId = req.utilisateur.medecin_id;
    if (!medecinId) {
      return res.status(403).json({
        success: false,
        message: "Accès réservé aux médecins.",
      });
    }
    const data = await rendezVousService.getUpcomingMedecin(medecinId);
    res.json({ success: true, count: data.length, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  
  getUpcoming,
  getPast,
  getOne,
  reserver,
  annuler,
  getEvaluationEnAttente,
  // ── Nouveaux Sprint 3 – Backend 1 ──
  getCreneaux,
  reserverViaCreneau,
  getPlanningMedecin,
  getUpcomingMedecin,
};