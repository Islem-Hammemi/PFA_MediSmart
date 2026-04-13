// =============================================
// routes/rendezVousRoutes.js
// =============================================
const express = require("express");
const router  = express.Router();
const pool    = require("../config/db");  // ← THIS WAS MISSING — caused the silent crash
const ctrl    = require("../presentation/rendezVousController");
const { proteger, autoriserRole } = require("../middleware/authMiddleware");

const patientAuth = [proteger, autoriserRole("patient")];
const medecinAuth = [proteger, autoriserRole("medecin")];

// ── PATIENT ──────────────────────────────────────────────────
router.get("/upcoming",            patientAuth, ctrl.getUpcoming);
router.get("/past",                patientAuth, ctrl.getPast);
router.get("/evaluation-pending",  patientAuth, ctrl.getEvaluationEnAttente);
router.post("/",                   patientAuth, ctrl.reserver);
router.patch("/:id/annuler",       patientAuth, ctrl.annuler);
router.get("/creneaux/:medecinId", patientAuth, ctrl.getCreneaux);
router.post("/creneau",            patientAuth, ctrl.reserverViaCreneau);

// ── PUBLIC — availability check (must be before /:id) ────────
router.get("/disponibilite/:medecinId/:date", async (req, res) => {
  try {
    const { medecinId, date } = req.params;

    const [rows] = await pool.execute(
      `SELECT date_heure FROM RENDEZ_VOUS
       WHERE medecin_id = ?
         AND DATE(date_heure) = ?
         AND statut NOT IN ('annule')`,
      [medecinId, date]
    );

    const booked = rows.map(r => {
      const d = new Date(r.date_heure);
      let h   = d.getHours();
      const m = String(d.getMinutes()).padStart(2, "0");
      const period = h >= 12 ? "PM" : "AM";
      if (h > 12) h -= 12;
      if (h === 0) h = 12;
      return `${String(h).padStart(2, "0")}:${m} ${period}`;
    });

    res.json({ success: true, booked });
  } catch (err) {
    console.error("[disponibilite]", err);
    res.status(500).json({ success: false, booked: [] });
  }
});

// ── MÉDECIN ───────────────────────────────────────────────────
router.get("/medecin/planning",   medecinAuth, ctrl.getPlanningMedecin);
router.get("/medecin/upcoming",   medecinAuth, ctrl.getUpcomingMedecin);
router.get("/medecin/pending",    medecinAuth, ctrl.getPendingMedecin);
router.post("/medecin/reserver",  medecinAuth, ctrl.reserverParMedecin);

router.patch("/:id/confirmer",    medecinAuth, ctrl.confirmer);
router.patch("/:id/refuser",      medecinAuth, ctrl.refuser);
router.patch("/:id/terminer",     medecinAuth, ctrl.terminer);

// ── PATIENT — detail (must stay last to avoid catching /medecin/*) ──
router.get("/:id",                patientAuth, ctrl.getOne);

module.exports = router;