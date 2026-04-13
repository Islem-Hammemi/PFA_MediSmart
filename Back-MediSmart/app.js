// =============================================
// app.js  — with global friendly error handler
// =============================================
require("dotenv").config();

const express = require("express");
const cors    = require("cors");
const path    = require("path");

const authRoutes          = require("./routes/authRoutes");
const medecinRoutes       = require("./routes/medecinRoutes");
const patientRoutes       = require("./routes/patientRoutes");
const ticketRoutes        = require("./routes/ticketRoutes");
const evaluationRoutes    = require("./routes/evaluationRoutes");
const rendezVousRoutes    = require("./routes/rendezVousRoutes");
const dossierRoutes       = require("./routes/dossierRoutes");
const planningRoutes      = require("./routes/planningRoutes");
const consultationRoutes  = require("./routes/consultationRoutes");

// ── Centralized error handler ─────────────────────────────────
const { globalErrorHandler } = require("./middleware/errorHandler");

const app = express();

app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174"],
  credentials: true,
}));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth",          authRoutes);
app.use("/api/medecins",      medecinRoutes);
app.use("/api/tickets",       ticketRoutes);
app.use("/api/evaluations",   evaluationRoutes);
app.use("/api/rendez-vous",   rendezVousRoutes);
app.use("/api/planning",      planningRoutes);
app.use("/api/dossiers",      dossierRoutes);
app.use("/api/consultations", consultationRoutes);
app.use("/api",               patientRoutes);

app.get("/", (req, res) => res.json({ message: "MediSmart API is running." }));

// ── 404 ───────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: "This page does not exist." });
});

// ── Global error handler (catches anything that slips through) ─
app.use(globalErrorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

module.exports = app;