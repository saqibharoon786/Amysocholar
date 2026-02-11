const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const AppError = require('../utils/appError');

// Function to ensure directory exists
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Base uploads directory
const baseUploadDir = path.join(__dirname, '../uploads');

// Ensure base uploads directory exists
ensureDirectoryExists(baseUploadDir);

// ✅ Configure storage with ALL file types including payout screenshots
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = 'uploads/';
    
    // Determine folder based on file fieldname
    switch (file.fieldname) {
      case 'coverImages':
        folder += 'covers/';
        break;
      case 'pdfFile':
        folder += 'pdfs/';
        break;
      case 'textFile':
        folder += 'texts/';
        break;
      case 'cnicFront':
      case 'cnicBack':
        folder += 'cnic/';
        break;
      case 'image':
        folder += 'profiles/';
        break;
      case 'paymentScreenshot': // ✅ ADDED: Payout screenshot upload
        folder += 'payouts/';
        break;
      default:
        folder += 'others/';
    }
    
    const fullPath = path.join(__dirname, '../', folder);
    
    // Ensure the specific directory exists
    ensureDirectoryExists(fullPath);
    
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    
    // For payout screenshots, add user ID to filename for better organization
    if (file.fieldname === 'paymentScreenshot' && req.user) {
      const userId = req.user.id || 'unknown';
      cb(null, `payout-${userId}-${uniqueSuffix}${ext}`);
    } else {
      cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
  }
});

// ✅ File filter - updated with all supported file types
const fileFilter = (req, file, cb) => {
  // Allowed image types
  const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  const allowedPdfTypes = ['application/pdf'];
  const allowedTextTypes = ['text/plain', 'application/octet-stream'];
  
  // Check file types based on fieldname
  switch (file.fieldname) {
    // Image fields
    case 'coverImages':
    case 'image':
    case 'cnicFront':
    case 'cnicBack':
    case 'paymentScreenshot': // ✅ ADDED
      if (allowedImageTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new AppError('Please upload only images (JPEG, PNG, WEBP, GIF)', 400), false);
      }
      break;
    
    // PDF fields
    case 'pdfFile':
      if (allowedPdfTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new AppError('Please upload only PDF files', 400), false);
      }
      break;
    
    // Text fields
    case 'textFile':
      if (allowedTextTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new AppError('Please upload only text files', 400), false);
      }
      break;
    
    default:
      cb(new AppError('Unsupported file type or field name', 400), false);
  }
};

// Create multer instance
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

// ✅ Convert uploaded images to WebP format (optimize images)
const convertToWebP = async (req, res, next) => {
  try {
    // Skip if no files
    if (!req.file && !req.files) {
      return next();
    }

    const processFile = async (file) => {
      // Only convert image files (skip PDFs, text files, etc.)
      if (file && file.mimetype.startsWith('image/') && !file.mimetype.includes('webp')) {
        const newFilename = file.filename.replace(path.extname(file.filename), '.webp');
        const newPath = path.join(__dirname, '../', file.destination, newFilename);

        await sharp(file.path)
          .toFormat('webp')
          .webp({ quality: 80 })
          .toFile(newPath);

        // Delete original file
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
        
        // Update file object with WebP info
        file.filename = newFilename;
        file.path = newPath;
        file.mimetype = 'image/webp';
        file.originalname = file.originalname.replace(path.extname(file.originalname), '.webp');
      }
    };

    // Process single file
    if (req.file) await processFile(req.file);
    
    // Process multiple files
    if (req.files) {
      const files = Array.isArray(req.files) 
        ? req.files 
        : Object.values(req.files).flat();
      
      for (const file of files) {
        await processFile(file);
      }
    }

    next();
  } catch (err) {
    console.error('Image conversion error:', err);
    next(new AppError('Error processing image file', 500));
  }
};

// ✅ FIXED: Middleware for book file uploads
const uploadFiles = [upload.fields([
  { name: 'coverImages', maxCount: 5 },
  { name: 'pdfFile', maxCount: 1 },
  { name: 'textFile', maxCount: 1 }
]), convertToWebP];

// ✅ Single file upload middleware
const uploadSingle = (fieldName) => {
  return [upload.single(fieldName), convertToWebP];
};

// ✅ Multiple files upload middleware
const uploadMultiple = (fields) => {
  return [upload.fields(fields), convertToWebP];
};

// ✅ CNIC upload middleware
const uploadCNIC = [upload.fields([
  { name: 'cnicFront', maxCount: 1 },
  { name: 'cnicBack', maxCount: 1 }
]), convertToWebP];

// ✅ Profile image upload middleware
const uploadProfile = [upload.single('image'), convertToWebP];

// ✅ ADDED: Payout screenshot upload middleware
const uploadPayoutScreenshot = [upload.single('paymentScreenshot'), convertToWebP];

// ✅ ADDED: Payout screenshot with multiple files
const uploadPayoutScreenshots = [upload.fields([
  { name: 'paymentScreenshot', maxCount: 3 } // Allow multiple screenshots if needed
]), convertToWebP];

// ✅ ADDED: Generic image upload for any image field
const uploadImage = (fieldName, maxCount = 1) => {
  if (maxCount > 1) {
    return [upload.array(fieldName, maxCount), convertToWebP];
  }
  return [upload.single(fieldName), convertToWebP];
};

module.exports = {
  upload,
  uploadFiles,
  uploadSingle,
  uploadMultiple,
  uploadCNIC,
  uploadProfile,
  uploadPayoutScreenshot, // ✅ EXPORTED
  uploadPayoutScreenshots, // ✅ EXPORTED
  uploadImage, // ✅ EXPORTED
  convertToWebP,
  
  // Helper function to get file URL
  getFileUrl: (file) => {
    if (!file) return null;
    return `/${file.path.replace(/\\/g, '/').split('uploads/')[1]}`;
  },
  
  // Helper function to delete file
  deleteFile: (filePath) => {
    try {
      if (filePath && fs.existsSync(path.join(__dirname, '../uploads', filePath))) {
        fs.unlinkSync(path.join(__dirname, '../uploads', filePath));
        return true;
      }
    } catch (error) {
      console.error('Error deleting file:', error);
    }
    return false;
  }
};