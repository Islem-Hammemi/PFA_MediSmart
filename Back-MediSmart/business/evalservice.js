const evaluationRepository = require("../repository/patientRepository");
const Evaluation = require("../model/Evaluation");
const creerEvaluation = async (patientId, medecinId, note, commentaire) => {
  if (!Number.isInteger(note) || note < 1 || note > 5) {
    throw new Error("La note doit être un entier entre 1 et 5.");
  }
  const medecinExiste = await evaluationRepository.findMedecinById(medecinId);
  if (!medecinExiste) {
    throw new Error("Médecin introuvable.");
  }
  const dejaEvalue = await evaluationRepository.findEvaluationByPatientAndMedecin(patientId,medecinId);
  if (dejaEvalue) {
    throw new Error("Vous avez déjà évalué ce médecin.");
  }
  const result = await evaluationRepository.insertEvaluation(patientId,medecinId,note,commentaire || null);
  const nouvelleMoyenne = await evaluationRepository.calculateAverageNoteForMedecin(medecinId);
  
  const moyenneArrondie = parseFloat(nouvelleMoyenne.toFixed(2));
  
  await evaluationRepository.updateNoteMoyenneMedecin(medecinId, moyenneArrondie);
 
  return new Evaluation({
    id: result.insertId,
    patient_id: patientId,
    medecin_id: medecinId,
    note,
    commentaire: commentaire || null,
    created_at: new Date(),
  });
};
module.exports = { creerEvaluation };