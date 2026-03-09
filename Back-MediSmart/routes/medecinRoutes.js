const express = require("express");
const router  = express.Router();
const multer  = require("multer");
const path    = require("path");

// ── Config Multer ─────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/medecins/");
  },
  filename: (req, file, cb) => {
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
      : cb(new Error("Format invalide. Utilisez JPG, PNG ou WEBP."));
  },
});

// ── Import controller ─────────────────────────────────────
const {
  getMedecins,
  getMedecinsPresents,
  checkIn,
  checkOut,
  getMedecinSemaine, // ← nouveau
  uploadPhoto,       // ← nouveau
} = require("../presentation/medecinController");

// ── Routes existantes ─────────────────────────────────────
router.get("/",          getMedecins);
router.get("/presents",  getMedecinsPresents);
router.post("/checkin",  checkIn);
router.post("/checkout", checkOut);

// ── Nouvelles routes ──────────────────────────────────────
router.get("/semaine",  getMedecinSemaine);
router.post("/photo",   upload.single("photo"), uploadPhoto);

module.exports = router;