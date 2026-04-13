// ============================================================
//  middleware/errorHandler.js
//  Centralized friendly error messages — no technical leakage
// ============================================================

// ── MySQL error code → friendly message ─────────────────────
const MYSQL_MESSAGES = {
  ER_DUP_ENTRY:             "This slot is already taken. Please choose another time.",
  ER_NO_REFERENCED_ROW_2:   "The referenced record no longer exists.",
  ER_ROW_IS_REFERENCED_2:   "This record is linked to other data and cannot be deleted.",
  ER_BAD_NULL_ERROR:        "Some required fields are missing.",
  ER_DATA_TOO_LONG:         "One of your inputs is too long.",
  ER_ACCESS_DENIED_ERROR:   "Database access denied. Please contact support.",
  ER_NO_SUCH_TABLE:         "A system error occurred. Please contact support.",
  ECONNREFUSED:             "Cannot reach the database. Please try again later.",
  ETIMEDOUT:                "The request timed out. Please try again.",
  ECONNRESET:               "Connection was interrupted. Please try again.",
};

// ── Business error keyword → friendly message ────────────────
const BUSINESS_MESSAGES = [
  // Auth
  { match: /email.*existe|compte.*existe/i,         msg: "An account with this email already exists." },
  { match: /email.*mot de passe incorrect/i,        msg: "Incorrect email or password." },
  { match: /token.*invalide|token.*expiré/i,        msg: "Your session has expired. Please log in again." },
  { match: /non autorisé|unauthorized/i,            msg: "You are not authorized to perform this action." },

  // Appointments
  { match: /rdv.*introuvable|rendez-vous.*introuvable/i, msg: "Appointment not found." },
  { match: /déjà.*rdv|rdv.*déjà/i,                 msg: "You already have an appointment at this time." },
  { match: /médecin.*indisponible|indisponible/i,   msg: "The doctor is unavailable at this time." },
  { match: /date.*passé|dans le futur/i,            msg: "Please select a future date and time." },
  { match: /annulé|déjà annulé/i,                  msg: "This appointment has already been cancelled." },
  { match: /créneau.*introuvable/i,                 msg: "This time slot no longer exists." },
  { match: /créneau.*réservé|créneau.*passé/i,      msg: "This slot is already taken or has passed." },

  // Tickets
  { match: /ticket.*actif|ticket.*aujourd/i,        msg: "You already have an active ticket today." },
  { match: /médecin.*absent/i,                      msg: "This doctor is currently absent. Please choose another." },
  { match: /ticket.*introuvable/i,                  msg: "Ticket not found." },
  { match: /ticket.*en cours/i,                     msg: "This ticket is already being served." },

  // Evaluations
  { match: /déjà.*évalué|évaluation.*existante/i,   msg: "You have already submitted a review for this visit." },
  { match: /note.*entre 1.*5|note.*entier/i,        msg: "Please provide a rating between 1 and 5." },
  { match: /rdv.*terminé|pas.*terminé/i,            msg: "You can only review completed appointments." },

  // Patient / Dossier
  { match: /profil.*patient.*introuvable/i,         msg: "Your patient profile was not found." },
  { match: /profil.*médecin.*introuvable/i,         msg: "Doctor profile not found." },
  { match: /patient.*introuvable/i,                 msg: "Patient not found." },
  { match: /accès.*refusé|accès.*réservé/i,         msg: "Access denied." },
  { match: /prénom.*nom.*email.*obligatoires/i,     msg: "First name, last name, and email are required." },
  { match: /email.*existe.*déjà/i,                  msg: "A patient with this email already exists." },

  // Consultation / Dossier
  { match: /statut.*rdv.*invalide/i,                msg: "Notes can only be added to confirmed or completed appointments." },
  { match: /au moins un champ/i,                    msg: "Please fill in at least one field (diagnosis, treatment, or notes)." },

  // Generic
  { match: /requis|obligatoire/i,                   msg: "Some required fields are missing." },
  { match: /invalide/i,                             msg: "One of the submitted values is invalid." },
];

// ── Translate any error into a user-friendly message ─────────
const friendlyMessage = (err) => {
  // MySQL errors
  if (err.code && MYSQL_MESSAGES[err.code]) {
    return MYSQL_MESSAGES[err.code];
  }

  // Duplicate entry (MySQL unique constraint)
  if (err.code === "ER_DUP_ENTRY" || (err.message && /duplicate entry/i.test(err.message))) {
    return "This slot is already taken. Please choose another time.";
  }

  // Business logic errors — match keywords
  if (err.message) {
    for (const rule of BUSINESS_MESSAGES) {
      if (rule.match.test(err.message)) return rule.msg;
    }
  }

  // statusCode-based fallbacks
  if (err.statusCode === 401) return "Please log in to continue.";
  if (err.statusCode === 403) return "You do not have permission to do this.";
  if (err.statusCode === 404) return "The requested item was not found.";
  if (err.statusCode === 409) return "A conflict occurred. Please refresh and try again.";
  if (err.statusCode === 400) return "The submitted data is invalid. Please check your inputs.";

  return "Something went wrong. Please try again.";
};

// ── HTTP status resolver ──────────────────────────────────────
const httpStatus = (err) => {
  if (err.code === "ER_DUP_ENTRY") return 409;
  if (err.statusCode) return err.statusCode;
  if (/not found|introuvable/i.test(err.message || "")) return 404;
  if (/unauthorized|non autorisé/i.test(err.message || "")) return 401;
  if (/forbidden|accès refusé/i.test(err.message || "")) return 403;
  if (/conflict|déjà/i.test(err.message || "")) return 409;
  return 500;
};

// ── Express global error handler (use as last app.use) ────────
const globalErrorHandler = (err, req, res, next) => {
  // Always log the real error server-side
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.path}`, err);

  const status  = httpStatus(err);
  const message = friendlyMessage(err);

  res.status(status).json({ success: false, message });
};

// ── Controller-level try/catch helper ────────────────────────
// Usage: return sendError(res, err);
const sendError = (res, err) => {
  console.error(err);
  const status  = httpStatus(err);
  const message = friendlyMessage(err);
  return res.status(status).json({ success: false, message });
};

module.exports = { globalErrorHandler, sendError, friendlyMessage };