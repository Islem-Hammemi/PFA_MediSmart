// ============================================================
//  presentation/consultationController.js  — FIXED Sprint 3
//
//  Corrections :
//   1. getTodayQueue : medecin_id récupéré via medecinRepository
//      (req.utilisateur contient user_id, pas medecin_id directement
//       dans certaines configurations middleware — on résout les deux cas)
//   2. Codes HTTP uniformisés (403 vs 401 cohérents avec les routes)
// ============================================================
const consultationRepository = require('../repository/consultationRepository');
const consultationService    = require('../business/consultationService');
const medecinRepository      = require('../repository/medecinRepository');

// ─── GET /api/consultations/today-queue ──────────────────────
const getTodayQueue = async (req, res) => {
  try {
    // FIX : le middleware peut exposer medecin_id directement (token enrichi)
    // ou seulement user_id. On supporte les deux cas.
    let medecin_id = req.utilisateur.medecin_id || null;

    if (!medecin_id) {
      // Fallback : résoudre depuis user_id
      const medecin = await medecinRepository.trouverParId(req.utilisateur.user_id);
      if (!medecin) {
        return res.status(403).json({
          success: false,
          message: 'Accès réservé aux médecins.',
        });
      }
      medecin_id = medecin.medecin_id;
    }

    const data = await consultationRepository.getTodayQueue(medecin_id);
    return res.status(200).json({ success: true, count: data.length, data });

  } catch (err) {
    console.error('[consultationController.getTodayQueue]', err);
    return res.status(500).json({ success: false, message: 'Erreur interne du serveur.' });
  }
};

// ─── POST /api/consultations/notes ───────────────────────────
// Body : { rdv_id, diagnostic?, traitement?, notes? }
const sauvegarderNotes = async (req, res) => {
  try {
    const { rdv_id, diagnostic, traitement, notes } = req.body;

    if (!rdv_id || isNaN(Number(rdv_id))) {
      return res.status(400).json({
        success: false,
        message: 'Le champ rdv_id est requis et doit être un nombre.',
      });
    }

    const dossier = await consultationService.sauvegarderNotes({
      user_id   : req.utilisateur.user_id,
      rdv_id    : Number(rdv_id),
      diagnostic: diagnostic || null,
      traitement: traitement || null,
      notes     : notes      || null,
    });

    return res.status(201).json({
      success: true,
      message: 'Notes de consultation sauvegardées.',
      dossier,
    });

  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ success: false, message: err.message });
    }
    console.error('[consultationController.sauvegarderNotes]', err);
    return res.status(500).json({ success: false, message: 'Erreur interne du serveur.' });
  }
};

module.exports = {
  getTodayQueue,
  sauvegarderNotes,
};