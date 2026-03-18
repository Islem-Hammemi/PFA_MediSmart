const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

/**
 * US3 : Inscription Patient
 * Le back retourne : { success, data: { token, utilisateur } }
 */
export async function register({ nom, prenom, email, password, telephone, dateNaissance }) {
  const response = await fetch(`${API_BASE_URL}/auth/patient/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nom,
      prenom,
      email,
      motDePasse: password,
      telephone,
      dateNaissance,
    }),
  });

  const json = await response.json();
  if (!response.ok || !json.success) {
    throw new Error(json.message || "Erreur lors de l'inscription");
  }

  const { token, utilisateur } = json.data;
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(utilisateur));
  localStorage.setItem("role", utilisateur.role);

  return json.data;
}

/**
 * US4/US5 : Connexion Patient ou Médecin
 * Le back retourne : { success, data: { token, role, utilisateur } }
 */
export async function login({ email, password }) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      motDePasse: password,
    }),
  });

  const json = await response.json();
  if (!response.ok || !json.success) {
    throw new Error(json.message || "Email ou mot de passe incorrect");
  }

  const { token, role, utilisateur } = json.data;
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(utilisateur));
  localStorage.setItem("role", role);

  return json.data; // { token, role, utilisateur }
}

/**
 * Déconnexion
 */
export async function logout() {
  const token = getToken();
  if (token) {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (_) {}
  }
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("role");
}

export function getToken() {
  return localStorage.getItem("token");
}

export function getCurrentUser() {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
}

export function getRole() {
  return localStorage.getItem("role");
}

export function isAuthenticated() {
  return !!getToken();
}