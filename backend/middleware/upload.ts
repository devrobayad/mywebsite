import multer from 'multer';
import path from 'path';
import fs from 'fs';

const UPLOAD_ROOT = path.join(process.cwd(), 'backend', 'uploads');

// Ensure upload directories exist
const folders = ['profile', 'cv', 'projects', 'logos'];
folders.forEach(folder => {
  const fpath = path.join(UPLOAD_ROOT, folder);
  if (!fs.existsSync(fpath)) {
    fs.mkdirSync(fpath, { recursive: true });
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let subfolder = 'projects';
    if (file.fieldname === 'profilePhoto' || file.fieldname === 'heroPhoto') {
      subfolder = 'profile';
    } else if (file.fieldname === 'cvPdf' || file.fieldname === 'cv') {
      subfolder = 'cv';
    } else if (file.fieldname === 'logo' || file.fieldname === 'headerLogo' || file.fieldname === 'footerLogo' || file.fieldname === 'favicon') {
      subfolder = 'logos';
    }
    cb(null, path.join(UPLOAD_ROOT, subfolder));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (file.fieldname === 'cvPdf' || file.fieldname === 'cv') {
    if (ext === '.pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed for the CV/CV upload!') as any, false);
    }
  } else {
    if (ext === '.png' || ext === '.jpg' || ext === '.jpeg' || ext === '.ico' || ext === '.svg') {
      cb(null, true);
    } else {
      cb(new Error('Only JPG, JPEG, PNG, ICO, and SVG images are allowed!') as any, false);
    }
  }
};

export const uploadMiddleware = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 MB maximum
  }
});
