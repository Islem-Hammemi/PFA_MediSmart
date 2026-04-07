// ============================================================
//  dossierRoutes.js  –  Couche Routes
//  Sprint 3 – US14 : Accès dossiers patients (médecin)
//  Responsable : Sarra Othmani
// ============================================================

const express            = require('express');
const router             = express.Router();
const dossierController  = require('../presentation/dossierController');
const { proteger, autoriserRole } = require('../middleware/authMiddleware');

// Middleware : authentifié + rôle médecin uniquement
const protegerMedecin = [proteger, autoriserRole('medecin')];

// US14 : Liste de tous les patients du médecin
router.get('/mes-patients', protegerMedecin, dossierController.getMesPatients);

// US14 : Dossier complet d'un patient spécifique
router.get('/patient/:patient_id', protegerMedecin, dossierController.getDossierPatient);

module.exports = router;