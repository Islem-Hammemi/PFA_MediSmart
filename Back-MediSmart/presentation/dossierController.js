// ============================================================
//  presentation/dossierController.js
// ============================================================
const dossierService    = require('../business/dossierService');
const dossierRepository = require('../repository/dossierRepository');
const { sendError }     = require('../middleware/errorHandler');

const getMesPatients = async (req, res) => {
  try {
    const result = await dossierService.getMesPatients(req.utilisateur.user_id);
    return res.status(200).json({ success: true, total: result.total, patients: result.patients });
  } catch (err) { return sendError(res, err); }
};

const getDossierPatient = async (req, res) => {
  try {
    const patient_id = Number(req.params.patient_id);
    if (!patient_id || isNaN(patient_id))
      return res.status(400).json({ success: false, message: "Invalid patient ID." });
    const dossier = await dossierService.getDossierPatient(req.utilisateur.user_id, patient_id);
    return res.status(200).json({ success: true, ...dossier });
  } catch (err) { return sendError(res, err); }
};

const ajouterPatient = async (req, res) => {
  try {
    const result = await dossierService.ajouterPatient(req.utilisateur.user_id, req.body);
    return res.status(201).json({ success: true, message: result.message, patient_id: result.patient_id });
  } catch (err) { return sendError(res, err); }
};

const creerDossier = async (req, res) => {
  try {
    const medecinId = req.utilisateur.medecin_id;
    if (!medecinId)
      return res.status(403).json({ success: false, message: "Access reserved for doctors." });
    const { patientId, diagnostic, traitement, notes } = req.body;
    const dossierId = await dossierRepository.creerDossier({
      patientId: Number(patientId), medecinId, diagnostic, traitement, notes,
    });
    return res.status(201).json({ success: true, dossier_id: dossierId });
  } catch (err) { return sendError(res, err); }
};

const getDossiersPatient = async (req, res) => {
  try {
    const patientId = Number(req.params.patientId);
    if (!patientId || isNaN(patientId))
      return res.status(400).json({ success: false, message: "Invalid patient ID." });
    const data = await dossierRepository.getDossiersByPatientForMedecin(patientId);
    return res.status(200).json({ success: true, count: data.length, data });
  } catch (err) { return sendError(res, err); }
};

module.exports = { getMesPatients, getDossierPatient, ajouterPatient, creerDossier, getDossiersPatient };