const express = require("express");
const cors    = require("cors");
const path    = require("path");
require("dotenv").config();

const authRoutes          = require("./routes/authRoutes");
const medecinRoutes       = require("./routes/medecinRoutes");
const patientRoutes       = require("./routes/patientRoutes");
const ticketRoutes        = require("./routes/ticketRoutes");
const evaluationRoutes    = require("./routes/evaluationRoutes");
const rendezVousRoutes    = require("./routes/rendezVousRoutes");
const dossierRoutes       = require("./routes/dossierRoutes");
const planningRoutes      = require("./routes/planningRoutes");
const consultationRoutes  = require("./routes/consultationRoutes");
const chatRoutes          = require("./routes/chatRoutes");  // ✅ Import chat routes 

const app = express();

// ── Middlewares ───────────────────────────────────────────────
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174"],
  credentials: true,
}));
app.use(express.json());

// ── Static files ──────────────────────────────────────────────
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ── Routes ───────────────────────────────────────────────────
app.use("/api/auth",          authRoutes);
app.use("/api/medecins",      medecinRoutes);
app.use("/api/tickets",       ticketRoutes);
app.use("/api/evaluations",   evaluationRoutes);
app.use("/api/rendez-vous",   rendezVousRoutes);
app.use("/api/dossiers",      dossierRoutes);
app.use("/api/planning",      planningRoutes);
app.use("/api/consultations", consultationRoutes);
app.use("/api/chat",          chatRoutes);   // ✅ POST /api/chat
app.use("/api",               patientRoutes);

// ── Health check ──────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ message: "MediSmart API is running 🚀" });
});

// ── 404 handler ───────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route introuvable." });
});

// ── Start server ──────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});

module.exports = app;