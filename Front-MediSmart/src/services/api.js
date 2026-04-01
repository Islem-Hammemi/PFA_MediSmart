
// ygeri les requetes http lel  API

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const http = async (endpoint, options = {}) => {
  const token = localStorage.getItem("medismart_token");
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };
  const res  = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
  const json = await res.json().catch(() => ({ message: "Erreur réseau" }));
  if (!res.ok) throw new Error(json.message || `Erreur ${res.status}`);
  return json;
};

// ── AUTH ─────────────────────────────────────────────────

// POST /api/auth/medecin/login
// Retourne { success, data: { token, utilisateur: { id, medecin_id, nom, prenom, email, specialite, role } } }
export const loginMedecin = async (email, motDePasse) => {
  const json = await http("/auth/medecin/login", {
    method: "POST",
    body: JSON.stringify({ email, motDePasse }),
  });
  localStorage.setItem("medismart_token",   json.data.token);
  localStorage.setItem("medismart_medecin", JSON.stringify(json.data.utilisateur));
  return json.data.utilisateur;
};

// POST /api/auth/logout  (proteger → req.token attaché par middleware)
// sessionRepository.supprimer(hashSHA256(token)) → token révoqué en BDD
export const logoutMedecin = async () => {
  try {
    await http("/auth/logout", { method: "POST" });
  } catch (e) {
    console.warn("Logout serveur :", e.message);
  } finally {
    localStorage.removeItem("medismart_token");
    localStorage.removeItem("medismart_medecin");
  }
};

// GET /api/auth/me  (proteger)
export const getMe = async () => {
  const json = await http("/auth/me");
  return json.data;
};

// ── ÉVALUATIONS ──────────────────────────────────────────

// GET /api/evaluations/medecin/:id
export const getEvaluationsMedecin = async (medecinId) => {
  const json = await http(`/evaluations/medecin/${medecinId}`);
  return json.data ?? json;
};

// ── MÉDECINS ─────────────────────────────────────────────

// GET /api/medecins?search=...
export const getMedecins = async (search = "") => {
  const qs   = search ? `?search=${encodeURIComponent(search)}` : "";
  const json = await http(`/medecins${qs}`);
  return json.data;
};

// GET /api/medecins/semaine  (VW_MEDECIN_SEMAINE + meilleur commentaire)
export const getMedecinSemaine = async () => {
  const json = await http("/medecins/semaine");
  return json.data;
};

// POST /api/medecins/photo  (multer upload.single("photo"), max 2MB)
// Retourne { success, photoUrl: "http://localhost:5000/uploads/medecins/..." }
export const uploadPhotoProfil = async (userId, fichier) => {
  const token    = localStorage.getItem("medismart_token");
  const formData = new FormData();
  formData.append("photo",   fichier);
  formData.append("userId",  userId);
  const res  = await fetch(`${BASE_URL}/medecins/photo`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const json = await res.json().catch(() => ({ message: "Erreur upload" }));
  if (!res.ok) throw new Error(json.message);
  return json;
};