import multer from 'multer';
import { ValidationError } from '../erorrs/authError.js';

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new ValidationError('Solo se permiten imágenes'));
    }
    cb(null, true);
  }
});