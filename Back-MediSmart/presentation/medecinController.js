// ============================================================
//  presentation/medecinController.js
// ============================================================
const medecinService = require("../business/medecinService");
const { sendError }  = require("../middleware/errorHandler");

const getMedecins = async (req, res) => {
  try {
    const data = await medecinService.getMedecins(req.query.search);
    return res.status(200).json({ success: true, count: data.length, search: req.query.search || null, data });
  } catch (err) { return sendError(res, err); }
};

const getMedecinsPresents = async (req, res) => {
  try {
    const data = await medecinService.getMedecinsPresents();
    return res.status(200).json({ success: true, count: data.length, data });
  } catch (err) { return sendError(res, err); }
};

const checkIn = async (req, res) => {
  try {
    const medecin = await medecinService.checkInMedecin(req.body.userId);
    return res.status(200).json({ success: true, message: "Availability marked.", data: medecin });
  } catch (err) { return sendError(res, err); }
};

const checkOut = async (req, res) => {
  try {
    const medecin = await medecinService.checkOutMedecin(req.body.userId);
    return res.status(200).json({ success: true, message: "Departure recorded.", data: medecin });
  } catch (err) { return sendError(res, err); }
};

const getMedecinSemaine = async (req, res) => {
  try {
    const data = await medecinService.getMedecinSemaine();
    return res.status(200).json({ success: true, data });
  } catch (err) { return sendError(res, err); }
};

const uploadPhoto = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ success: false, message: "No file was uploaded." });
    const photoPath = `/uploads/medecins/${req.file.filename}`;
    const medecin   = await medecinService.updatePhoto(req.body.userId, photoPath);
    return res.status(200).json({
      success: true,
      message: "Photo updated successfully.",
      photoUrl: `http://localhost:5000${photoPath}`,
      data: medecin,
    });
  } catch (err) { return sendError(res, err); }
};

module.exports = { getMedecins, getMedecinsPresents, checkIn, checkOut, getMedecinSemaine, uploadPhoto };