// middleware/upload.middleware.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage configuration (temporary path before conversion)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only images and PDF files are allowed!'), false);
  }
};

// Multer setup
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// ✅ Convert uploaded images to WebP format
const convertToWebP = async (req, res, next) => {
  try {
    const processFile = async (file) => {
      if (file && file.mimetype.startsWith('image/')) {
        const newFilename = file.filename.replace(path.extname(file.filename), '.webp');
        const newPath = path.join(uploadDir, newFilename);

        await sharp(file.path)
          .toFormat('webp')
          .webp({ quality: 80 })
          .toFile(newPath);

        fs.unlinkSync(file.path); // delete original file
        file.filename = newFilename;
        file.path = newPath;
        file.mimetype = 'image/webp';
      }
    };

    if (req.file) await processFile(req.file);
    if (req.files) {
      const files = Array.isArray(req.files)
        ? req.files
        : Object.values(req.files).flat();
      for (const file of files) await processFile(file);
    }

    next();
  } catch (err) {
    console.error('Image conversion error:', err);
    next(err);
  }
};

module.exports = {
  single: (fieldName) => [upload.single(fieldName), convertToWebP],
  fields: (fields) => [upload.fields(fields), convertToWebP],
  array: (fieldName, maxCount) => [upload.array(fieldName, maxCount), convertToWebP],
};
