// ============================================================
//  dossierRoutes.js  –  Couche Routes
//  Sprint 3 – US14 : Accès dossiers patients (médecin)
//  + US15 : Ajout d'un nouveau patient
//  Responsable : Sarra Othmani
// ============================================================

const express           = require('express');
const router            = express.Router();
const dossierController = require('../presentation/dossierController');
const { proteger, autoriserRole } = require('../middleware/authMiddleware');

const protegerMedecin = [proteger, autoriserRole('medecin')];

// US14 : Liste de tous les patients du médecin
router.get('/mes-patients', protegerMedecin, dossierController.getMesPatients);

// US14 : Dossier complet d'un patient spécifique
router.get('/patient/:patient_id', protegerMedecin, dossierController.getDossierPatient);

// US15 : Ajouter un nouveau patient (créer compte + profil)
router.post('/ajouter-patient', protegerMedecin, dossierController.ajouterPatient);
// Smart Consultation : Sauvegarder notes de consultation
router.post('/', protegerMedecin, dossierController.creerDossier);

// Consulter tous les dossiers d'un patient (vue médecin)
router.get('/patient/:patientId/dossiers', protegerMedecin, dossierController.getDossiersPatient);

module.exports = router;