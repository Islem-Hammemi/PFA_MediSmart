const express = require("express");
const cors    = require("cors");
const path    = require("path");
require("dotenv").config();

const authRoutes         = require("./routes/authRoutes");
const medecinRoutes      = require("./routes/medecinRoutes");
const patientRoutes      = require("./routes/patientRoutes");
const ticketRoutes       = require("./routes/ticketRoutes");
const evaluationRoutes   = require("./routes/evaluationRoutes");
const rendezVousRoutes   = require("./routes/rendezVousRoutes");
const dossierRoutes      = require("./routes/dossierRoutes");
const planningRoutes     = require("./routes/planningRoutes");
const consultationRoutes = require("./routes/consultationRoutes");
const chatRoutes         = require("./routes/chatRoutes");

const app = express();

app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174"],
  credentials: true,
}));
app.use(express.json());

// ✅ Serve the entire uploads folder (includes uploads/medecins/)
// Photo stored as  /uploads/medecins/filename.jpg
// Served at        http://localhost:5000/uploads/medecins/filename.jpg
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth",          authRoutes);
app.use("/api/medecins",      medecinRoutes);
app.use("/api/tickets",       ticketRoutes);
app.use("/api/evaluations",   evaluationRoutes);
app.use("/api/rendez-vous",   rendezVousRoutes);
app.use("/api/dossiers",      dossierRoutes);
app.use("/api/planning",      planningRoutes);
app.use("/api/consultations", consultationRoutes);
app.use("/api/chat",          chatRoutes);
app.use("/api",               patientRoutes);

app.get("/", (req, res) => res.json({ message: "MediSmart API is running 🚀" }));

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route introuvable." });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Serveur démarré sur http://localhost:${PORT}`));

module.exports = app;