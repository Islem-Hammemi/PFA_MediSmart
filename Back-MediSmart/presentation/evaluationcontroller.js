const evaluationService = require("../business/evalService");
 
const createEvaluation = async (req, res) => {
  try {
    const patientId = req.user.id;
 
    const { medecin_id, note, commentaire } = req.body;
 
    if (!medecin_id || note === undefined) {
      return res.status(400).json({
        success: false,
        message: "Les champs medecin_id et note sont obligatoires.",
      });
    }
 
    const evaluation = await evalService.creerEvaluation(
      patientId,
      parseInt(medecin_id), 
      parseInt(note),
      commentaire
    );
 
    return res.status(201).json({
      success: true,
      message: "Évaluation enregistrée avec succès.",
      data: evaluation,
    });
 
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
 
module.exports = { createEvaluation };