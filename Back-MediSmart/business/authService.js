// =============================================
// business/authService.js
// Logique métier - Authentification
// US3 : Register Patient
// US4 : Login Patient
// US5 : Login Médecin
// US7 : Génération token JWT + sauvegarde en SESSIONS
// =============================================
const jwt           = require("jsonwebtoken");
const bcrypt        = require("bcryptjs");
const patientRepo   = require("../repository/patientRepository");
const medecinRepo   = require("../repository/medecinRepository");
const sessionRepo   = require("../repository/sessionRepository");

// ── Utilitaire : générer un JWT et le sauvegarder en SESSIONS ───────────────
const genererToken = async (userId, role) => {
  const expiresIn = process.env.JWT_EXPIRES_IN || "7d";
  const token = jwt.sign({ id: userId, role }, process.env.JWT_SECRET, { expiresIn });

  // Calculer la date d'expiration pour la table SESSIONS
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 jours

  await sessionRepo.sauvegarder(userId, token, expiresAt);
  return token;
};

// ── US3 : Inscription Patient ────────────────────────────────────────────────
const inscrirePatient = async ({ nom, prenom, email, motDePasse, telephone, dateNaissance }) => {
  // Vérifier unicité email dans USERS
  const existe = await patientRepo.trouverParEmail(email);
  if (existe) {
    throw new Error("Un compte avec cet email existe déjà.");
  }

  // Hasher le mot de passe
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(motDePasse, salt);

  // Créer USERS + PATIENTS en transaction
  const patient = await patientRepo.creer({
    nom,
    prenom,
    email,
    passwordHash,
    telephone,
    dateNaissance
  });

  const token = await genererToken(patient.user_id, patient.role);

  return {
    token,
    utilisateur: {
      id:         patient.user_id,
      patient_id: patient.patient_id,
      nom:        patient.nom,
      prenom:     patient.prenom,
      email:      patient.email,
      role:       patient.role,
    },
  };
};

/* ── US4 : Connexion Patient ──────────────────────────────────────────────────
const connecterPatient = async ({ email, motDePasse }) => {
  const patient = await patientRepo.trouverParEmail(email);
  if (!patient) {
    throw new Error("Email ou mot de passe incorrect.");
  }

  // Comparer avec password_hash (nom de colonne du vrai schéma)
  const valide = await bcrypt.compare(motDePasse, patient.password_hash);
  if (!valide) {
    throw new Error("Email ou mot de passe incorrect.");
  }

  const token = await genererToken(patient.user_id, patient.role);

  return {
    token,
    utilisateur: {
      id:         patient.user_id,
      patient_id: patient.patient_id,
      nom:        patient.nom,
      prenom:     patient.prenom,
      email:      patient.email,
      role:       patient.role,
    },
  };
};

// ── US5 : Connexion Médecin ──────────────────────────────────────────────────
const connecterMedecin = async ({ email, motDePasse }) => {
  const medecin = await medecinRepo.trouverParEmail(email);
  if (!medecin) {
    throw new Error("Email ou mot de passe incorrect.");
  }

  const valide = await bcrypt.compare(motDePasse, medecin.password_hash);
  if (!valide) {
    throw new Error("Email ou mot de passe incorrect.");
  }

  const token = await genererToken(medecin.user_id, medecin.role);

  return {
    token,
    utilisateur: {
      id:           medecin.user_id,
      medecin_id:   medecin.medecin_id,
      nom:          medecin.nom,
      prenom:       medecin.prenom,
      email:        medecin.email,
      specialite:   medecin.specialite,
      role:         medecin.role,
    },
  };
};
*/
// ── Déconnexion : supprimer le token de SESSIONS ────────────────────────────
const deconnecter = async (token) => {
  await sessionRepo.supprimer(token);
};

// ── Login unique (patient ou médecin) ────────────────────────
const connecter = async ({ email, motDePasse }) => {
  // Chercher d'abord dans les patients
  let utilisateur = await patientRepo.trouverParEmail(email);
  
  // Si pas trouvé, chercher dans les médecins
  if (!utilisateur) {
    utilisateur = await medecinRepo.trouverParEmail(email);
  }

  if (!utilisateur) {
    throw new Error("Email ou mot de passe incorrect.");
  }

  const valide = await bcrypt.compare(motDePasse, utilisateur.password_hash);
  if (!valide) {
    throw new Error("Email ou mot de passe incorrect.");
  }

  const token = await genererToken(utilisateur.user_id, utilisateur.role);

  return {
    token,
    role: utilisateur.role, // ← le frontend redirige selon ça
    utilisateur: {
      id:       utilisateur.user_id,
      nom:      utilisateur.nom,
      prenom:   utilisateur.prenom,
      email:    utilisateur.email,
      role:     utilisateur.role,
      patient_id: utilisateur.patient_id || null,   // ← ajouter
      medecin_id: utilisateur.medecin_id || null,   // ← ajouter
    },
  };
};

module.exports = {
  inscrirePatient,
  //connecterPatient,
  //connecterMedecin,
  connecter,
  deconnecter,
};