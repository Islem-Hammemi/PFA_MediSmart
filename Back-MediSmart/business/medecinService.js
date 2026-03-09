const medecinRepository = require("../repository/medecinRepository");

// ── existantes ────────────────────────────────────────────

const getMedecins = async (search) => {
  if (!search || search.trim() === "") {
    return await medecinRepository.findAll();
  }
  const keyword = `%${search.trim()}%`;
  return await medecinRepository.findBySearch(keyword);
};

const getMedecinsPresents = async () => {
  return await medecinRepository.findPresents();
};

const checkInMedecin = async (userId) => {
  if (!userId) throw new Error("userId requis");
  return await medecinRepository.checkIn(userId);
};

const checkOutMedecin = async (userId) => {
  if (!userId) throw new Error("userId requis");
  return await medecinRepository.checkOut(userId);
};

// ── NOUVEAU ───────────────────────────────────────────────

// Médecin de la semaine (meilleure note + plus de tickets)
const getMedecinSemaine = async () => {
  return await medecinRepository.getMedecinSemaine();
};

// Upload photo du médecin
const updatePhoto = async (userId, photoPath) => {
  if (!userId)    throw new Error("userId requis");
  if (!photoPath) throw new Error("photoPath requis");
  return await medecinRepository.updatePhoto(userId, photoPath);
};

module.exports = {
  getMedecins,           // existant
  getMedecinsPresents,   // existant
  checkInMedecin,        // existant
  checkOutMedecin,       // existant
  getMedecinSemaine,     // nouveau
  updatePhoto,           // nouveau
};