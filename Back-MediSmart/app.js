// =============================================
// app.js  — VERSION FUSIONNÉE SPRINT 3
// =============================================
require("dotenv").config();

const express = require("express");
const cors    = require("cors");
const path    = require("path");

const app = express();

// ── Middlewares ───────────────────────────────────────────────
app.use(cors({
origin: true,

  credentials: true,
}));
app.use(express.json());

// ── Fichiers statiques ────────────────────────────────────────
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ── Import des routes ─────────────────────────────────────────
const authRoutes         = require("./routes/authRoutes");
const medecinRoutes      = require("./routes/medecinRoutes");
const ticketRoutes       = require("./routes/ticketRoutes");
const evaluationRoutes   = require("./routes/evaluationRoutes");
const rendezVousRoutes   = require("./routes/rendezVousRoutes");
const planningRoutes     = require("./routes/planningRoutes");
const dossierRoutes      = require("./routes/dossierRoutes");
const consultationRoutes = require("./routes/consultationRoutes");
const patientRoutes      = require("./routes/patientRoutes"); // EN DERNIER

// ── Enregistrement des routes ─────────────────────────────────
// IMPORTANT : patientRoutes en dernier car monte sur /api (générique)
app.use("/api/auth",          authRoutes);
app.use("/api/medecins",      medecinRoutes);
app.use("/api/tickets",       ticketRoutes);
app.use("/api/evaluations",   evaluationRoutes);
app.use("/api/rendez-vous",   rendezVousRoutes);
app.use("/api/planning",      planningRoutes);
app.use("/api/dossiers",      dossierRoutes);
app.use("/api/consultations", consultationRoutes);
app.use("/api",               patientRoutes);  // ← toujours en dernier

// ── Health check ──────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ message: "MediSmart API is running" });
});

// ── 404 handler ───────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route introuvable." });
});

// ── Global error handler ──────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("[Global Error]", err);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Erreur interne du serveur.",
  });
});

// ── Start server ──────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});

module.exports = app;