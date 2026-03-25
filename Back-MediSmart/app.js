const express = require("express");
const cors    = require("cors");
const path    = require("path");
require("dotenv").config();

const authRoutes       = require("./routes/authRoutes");
const medecinRoutes    = require("./routes/medecinRoutes");
const patientRoutes    = require("./routes/patientRoutes");
const ticketRoutes     = require("./routes/ticketRoutes");
const evaluationRoutes = require("./routes/evaluationRoutes");

const app = express();

// ── Middlewares ───────────────────────────────────────────────
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174"],
  credentials: true,
}));
app.use(express.json());

// ── Static files (doctor photos) ─────────────────────────────
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ── Routes (order matters!) ───────────────────────────────────
app.use("/api/auth",        authRoutes);
app.use("/api/medecins",    medecinRoutes);
app.use("/api/tickets",     ticketRoutes);      // ✅ before patientRoutes
app.use("/api/evaluations", evaluationRoutes);
app.use("/api",             patientRoutes);     // ✅ last — catches /api/patient/...

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