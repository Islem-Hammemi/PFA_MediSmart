const express           = require('express');
const router            = express.Router();
const dossierController = require('../presentation/dossierController');
const { proteger, autoriserRole } = require('../middleware/authMiddleware');

const protegerMedecin  = [proteger, autoriserRole('medecin')];
const protegerPatient  = [proteger, autoriserRole('patient')];

// ── PATIENT : son propre dossier ──────────────────────────────
router.get('/me', protegerPatient, dossierController.getDossier);

// ── MEDECIN : ses patients et leurs dossiers ──────────────────
router.get('/mes-patients',               protegerMedecin, dossierController.getMesPatients);
router.get('/patient/:patient_id',        protegerMedecin, dossierController.getDossierPatient);
router.post('/',                          protegerMedecin, dossierController.creerDossier);
router.get('/patient/:patientId/dossiers',protegerMedecin, dossierController.getDossiersPatient);

module.exports = router;