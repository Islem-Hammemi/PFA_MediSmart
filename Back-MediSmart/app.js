const express = require("express");
const cors    = require("cors");
const path    = require("path");
require("dotenv").config();

const medecinRoutes = require("./routes/medecinRoutes");

const app = express();

// ── Middlewares
app.use(cors());
app.use(express.json());

// ── Fichiers statiques (photos médecins) 
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ── Routes 
const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);
app.use("/medecins", medecinRoutes);

// ── Health check 
app.get("/", (req, res) => {
  res.json({ message: "MediSmart API is running " });
});

// ── 404 handler 
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route introuvable." });
});

// ── Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});

module.exports = app;