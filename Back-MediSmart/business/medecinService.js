const medecinRepository = require("../repository/medecinRepository");

const getMedecins = async (search) => {
  if (!search || search.trim() === "") return await medecinRepository.findAll();
  const keyword = `%${search.trim()}%`;
  return await medecinRepository.findBySearch(keyword);
};

const getMedecinsPresents = async () => await medecinRepository.findPresents();

const checkInMedecin = async (userId) => {
  if (!userId) throw new Error("userId requis");
  return await medecinRepository.checkIn(userId);
};

const checkOutMedecin = async (userId) => {
  if (!userId) throw new Error("userId requis");
  return await medecinRepository.checkOut(userId);
};

const getMedecinSemaine = async () => await medecinRepository.getMedecinSemaine();

const updatePhoto = async (userId, photoPath) => {
  if (!userId)    throw new Error("userId requis");
  if (!photoPath) throw new Error("photoPath requis");
  return await medecinRepository.updatePhoto(userId, photoPath);
};

// ✅ get statut by medecin_id
const getStatut = async (medecinId) => {
  const row = await medecinRepository.getStatutById(medecinId);
  return row?.statut ?? "absent";
};

// ✅ set statut by medecin_id
const setStatut = async (medecinId, statut) => {
  const allowed = ["disponible", "en_consultation", "absent"];
  if (!allowed.includes(statut)) throw new Error(`Statut invalide: ${statut}`);
  await medecinRepository.updateStatut(medecinId, statut);
};

// ✅ update profile fields (prenom, nom, email, telephone)
const updateProfile = async (user_id, { prenom, nom, email, telephone }) => {
  await medecinRepository.updateUserProfile(user_id, { prenom, nom, email, telephone });
};

// ✅ dashboard stats
const getStats = async () => await medecinRepository.getStats();

module.exports = {
  getMedecins,
  getMedecinsPresents,
  checkInMedecin,
  checkOutMedecin,
  getMedecinSemaine,
  updatePhoto,
  getStatut,
  setStatut,
  updateProfile,
  getStats,
};