import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadDirectory = path.join(process.cwd(), 'backend', 'uploads');

// Ensure upload directory exists
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

export const imageFilter = (req: any, file: Express.Multer.File, cb: any) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const isMatch = allowedTypes.test(file.mimetype.toLowerCase()) || allowedTypes.test(path.extname(file.originalname).toLowerCase());
  
  if (isMatch) {
    cb(null, true);
  } else {
    cb(new Error('Only standard image formats (JPEG, JPG, PNG, WEBP, GIF) are allowed for profile updates!'), false);
  }
};

export const documentFilter = (req: any, file: Express.Multer.File, cb: any) => {
  const allowedTypes = /pdf|doc|docx|jpeg|jpg|png/;
  const isMatch = allowedTypes.test(file.mimetype.toLowerCase()) || allowedTypes.test(path.extname(file.originalname).toLowerCase());

  if (isMatch) {
    cb(null, true);
  } else {
    cb(new Error('Document transfer error: formats must be clinical PDFs, DOCX, or scan images.'), false);
  }
};

export const uploadProfileImage = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB ceiling
});

export const uploadMedicalCertificate = multer({
  storage,
  fileFilter: documentFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB ceiling
});
