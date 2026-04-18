const express = require("express");
const router  = express.Router();
const multer  = require("multer");
const path    = require("path");
const { proteger, autoriserRole } = require("../middleware/authMiddleware");

// ── Multer — saves to uploads/medecins/ ───────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/medecins/"),
  filename:    (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `medecin_${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    allowed.includes(file.mimetype)
      ? cb(null, true)
      : cb(new Error("Format invalide. JPG, PNG ou WEBP seulement."));
  },
});

const medecinAuth = [proteger, autoriserRole("medecin")];

const ctrl = require("../presentation/medecinController");

// ── Public ────────────────────────────────────────────────────
router.get("/",         ctrl.getMedecins);
router.get("/presents", ctrl.getMedecinsPresents);
router.get("/semaine",  ctrl.getMedecinSemaine);
router.get("/stats",    ctrl.getStats);

// ── Legacy (userId in body — kept for backward compat) ────────
router.post("/checkin",  ctrl.checkIn);
router.post("/checkout", ctrl.checkOut);

// ── Photo upload (optional token — works both ways) ───────────
router.post("/photo", upload.single("photo"), ctrl.uploadPhoto);

// ── Authenticated medecin ─────────────────────────────────────
router.get("/mon-statut",    medecinAuth, ctrl.getMonStatut);
router.post("/checkin-auth", medecinAuth, ctrl.checkin);
router.post("/checkout-auth",medecinAuth, ctrl.checkout);
router.put("/profile",       medecinAuth, ctrl.updateProfile);

module.exports = router;