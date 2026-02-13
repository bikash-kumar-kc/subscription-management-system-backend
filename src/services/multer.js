import multer from "multer";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpg", "image/png", "image/jpg"];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true); // ACCEPT FILES...
  } else {
    cb(new Error("Only JPG, JPEG, and PNG files are allowed"), false);
  }
};

const upload = multer({
  dest: path.resolve(__dirname, "../../public/resources"),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: fileFilter,
});

export default upload;
