const medecinService = require("../business/medecinService");



const getMedecins = async (req, res) => {
  try {
    const { search } = req.query;
    const data = await medecinService.getMedecins(search);
    return res.status(200).json({
      success: true,
      count: data.length,
      search: search || null,
      data,
    });
  } catch (error) {
    console.error("Erreur getMedecins:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la récupération des médecins.",
    });
  }
};

const getMedecinsPresents = async (req, res) => {
  try {
    const data = await medecinService.getMedecinsPresents();
    return res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    console.error("Erreur getMedecinsPresents:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la récupération des médecins présents.",
    });
  }
};

const checkIn = async (req, res) => {
  try {
    const { userId } = req.body;
    const medecin = await medecinService.checkInMedecin(userId);
    return res.status(200).json({
      success: true,
      message: "Présence marquée ✅",
      data: medecin,
    });
  } catch (error) {
    console.error("Erreur checkIn:", error);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const checkOut = async (req, res) => {
  try {
    const { userId } = req.body;
    const medecin = await medecinService.checkOutMedecin(userId);
    return res.status(200).json({
      success: true,
      message: "Départ enregistré 🚪",
      data: medecin,
    });
  } catch (error) {
    console.error("Erreur checkOut:", error);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};



// GET /medecins/semaine
const getMedecinSemaine = async (req, res) => {
  try {
    const data = await medecinService.getMedecinSemaine();
    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Erreur getMedecinSemaine:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la récupération du médecin de la semaine.",
    });
  }
};

// POST /medecins/photo
const uploadPhoto = async (req, res) => {
  try {
    // Vérifier que le fichier existe
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Aucun fichier envoyé.",
      });
    }

    const { userId } = req.body;
    const photoPath = `/uploads/medecins/${req.file.filename}`;
    const medecin = await medecinService.updatePhoto(userId, photoPath);

    return res.status(200).json({
      success: true,
      message: "Photo mise à jour ✅",
      photoUrl: `http://localhost:5000${photoPath}`,
      data: medecin,
    });
  } catch (error) {
    console.error("Erreur uploadPhoto:", error);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getMedecins,
  getMedecinsPresents,
  checkIn,
  checkOut,
  getMedecinSemaine,  
  uploadPhoto,        
};