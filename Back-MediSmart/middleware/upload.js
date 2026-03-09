// middleware/upload.js
const multer = require("multer");
const path   = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/medecins/"); // dossier de stockage
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `medecin_${Date.now()}${ext}`); // nom unique
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // max 2MB
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error("Image invalide"));
  },
});

module.exports = upload;