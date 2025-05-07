// middlewares/upload.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Dossier de stockage absolu
const UPLOAD_DIR = path.join(__dirname, '../uploads/properties');

// Crée le dossier si nécessaire
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  },
});

module.exports = multer({ storage });
