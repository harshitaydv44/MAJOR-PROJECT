const multer = require('multer');
const path = require('path');

// Memory storage for direct streaming to Cloudinary or memory processing
const storage = multer.memoryStorage();

// File filter (images, PDFs, documents)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp|pdf|doc|docx/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  }
  cb(new Error('Only images (JPEG, PNG, WEBP) and documents (PDF, DOC) are permitted'));
};

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter
});

module.exports = upload;
