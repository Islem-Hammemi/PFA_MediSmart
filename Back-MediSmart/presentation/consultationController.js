// ============================================================
//  presentation/consultationController.js
// ============================================================
const consultationRepository = require('../repository/consultationRepository');
const consultationService    = require('../business/consultationService');
const medecinRepository      = require('../repository/medecinRepository');
const db                     = require('../config/db');
const { sendError }          = require('../middleware/errorHandler');

const _getMedecinId = async (utilisateur) => {
  if (utilisateur.medecin_id) return utilisateur.medecin_id;
  const medecin = await medecinRepository.trouverParId(utilisateur.user_id);
  return medecin?.medecin_id ?? null;
};

const getTodayQueue = async (req, res) => {
  try {
    const medecinId = await _getMedecinId(req.utilisateur);
    if (!medecinId)
      return res.status(403).json({ success: false, message: "Access reserved for doctors." });
    const data = await consultationRepository.getTodayQueue(medecinId);
    const avgTime = await consultationRepository.getAverageConsultationTime(medecinId);
    return res.status(200).json({ success: true, count: data.length, data, avgConsultationTime: avgTime });
  } catch (err) { return sendError(res, err); }
};

const servePatient = async (req, res) => {
  try {
    const medecinId = await _getMedecinId(req.utilisateur);
    if (!medecinId)
      return res.status(403).json({ success: false, message: "Access reserved for doctors." });

    const id = Number(req.params.id);
    const { type } = req.body;

    if (!type || !['ticket', 'rdv'].includes(type))
      return res.status(400).json({ success: false, message: "Please specify whether this is a ticket or appointment." });

    if (type === 'ticket') {
      // Get position
      const [ticketRows] = await db.execute(
        `SELECT position FROM TICKETS WHERE id = ? AND medecin_id = ?`,
        [id, medecinId]
      );
      if (!ticketRows[0])
        return res.status(404).json({ success: false, message: "Ticket not found." });
      const servedPosition = ticketRows[0].position;

      const [result] = await db.execute(
        `UPDATE TICKETS SET statut = 'en_cours' WHERE id = ? AND medecin_id = ? AND statut = 'en_attente'`,
        [id, medecinId]
      );
      if (!result.affectedRows)
        return res.status(404).json({ success: false, message: "Ticket not found or already in progress." });

      // Decrease positions
      await db.execute(
        `UPDATE TICKETS SET position = position - 1 WHERE medecin_id = ? AND statut = 'en_attente' AND position > ?`,
        [medecinId, servedPosition]
      );
    } else {
      const [result] = await db.execute(
        `UPDATE RENDEZ_VOUS SET statut = 'en_cours' WHERE id = ? AND medecin_id = ? AND statut IN ('planifie', 'confirme')`,
        [id, medecinId]
      );
      if (!result.affectedRows)
        return res.status(404).json({ success: false, message: "Appointment not found." });
    }

    return res.json({ success: true, message: "Patient is now in consultation." });
  } catch (err) { return sendError(res, err); }
};

const finishPatient = async (req, res) => {
  try {
    const medecinId = await _getMedecinId(req.utilisateur);
    if (!medecinId)
      return res.status(403).json({ success: false, message: "Access reserved for doctors." });

    const id = Number(req.params.id);
    const { type, notes, diagnostic, traitement, patientId, duration } = req.body;

    if (!type || !['ticket', 'rdv'].includes(type))
      return res.status(400).json({ success: false, message: "Please specify whether this is a ticket or appointment." });

    if (type === 'ticket') {
      await db.execute(
        `UPDATE TICKETS SET statut = 'termine' WHERE id = ? AND medecin_id = ?`,
        [id, medecinId]
      );
    } else {
      await db.execute(
        `UPDATE RENDEZ_VOUS SET statut = 'termine', evaluation_demandee = TRUE WHERE id = ? AND medecin_id = ?`,
        [id, medecinId]
      );
    }

    // Save dossier if any field is filled
    if (patientId && (notes?.trim() || diagnostic?.trim() || traitement?.trim())) {
      await db.execute(
        `INSERT INTO DOSSIERS_MEDICAUX
          (patient_id, medecin_id, date_consultation, diagnostic, traitement, notes, duration)
         VALUES (?, ?, CURDATE(), ?, ?, ?, ?)`,
        [
          Number(patientId),
          medecinId,
          diagnostic?.trim() || null,
          traitement?.trim() || null,
          notes?.trim()      || null,
          duration || 0,
        ]
      );
    }

    return res.json({ success: true, message: "Consultation completed." });
  } catch (err) { return sendError(res, err); }
};

const sauvegarderNotes = async (req, res) => {
  try {
    const { rdv_id, diagnostic, traitement, notes } = req.body;
    if (!rdv_id || isNaN(Number(rdv_id)))
      return res.status(400).json({ success: false, message: "A valid appointment ID is required." });
    const dossier = await consultationService.sauvegarderNotes({
      user_id:    req.utilisateur.user_id,
      rdv_id:     Number(rdv_id),
      diagnostic: diagnostic || null,
      traitement: traitement || null,
      notes:      notes      || null,
    });
    return res.status(201).json({ success: true, message: "Notes saved successfully.", dossier });
  } catch (err) { return sendError(res, err); }
};

module.exports = { getTodayQueue, servePatient, finishPatient, sauvegarderNotes };