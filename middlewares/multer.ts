import multer, { FileFilterCallback } from "multer";
import path from "path";
import fs from "fs";
import { Request } from "express";

// ------------------------
// MULTER STORAGE (dynamic folder)
// ------------------------
const storage = multer.diskStorage({
  destination: (req: Request, file, cb) => {
    /**
     * Determine folder dynamically:
     * Example:
     * - user/photo
     * - student/photo
     * - upload/pdf
     * Frontend should send `req.body.folder` or `req.body.type`
     */
    const folderType = req.body.folder || "user"; // default: user
    const fileType = file.mimetype.startsWith("image/") ? "photo" : "pdf"; // detect file type

    const uploadPath = path.join(
      __dirname,
      "../../uploads",
      folderType,
      fileType
    );

    // create folder if not exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${file.fieldname}${ext}`;
    cb(null, name);
  },
});

// ------------------------
// FILE FILTER (optional, images + pdfs)
// ------------------------
const fileFilter = (
  req: Request,
  file: Express.Multer.File, // this works if @types/multer is installed
  cb: FileFilterCallback
) => {
  const allowedImageTypes = /jpeg|jpg|png|gif/;
  const allowedPdfTypes = /pdf/;

  const extName = file.originalname.toLowerCase();
  const mimeType = file.mimetype;

  if (allowedImageTypes.test(extName) && mimeType.startsWith("image/")) {
    cb(null, true);
  } else if (allowedPdfTypes.test(extName) && mimeType === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only image or PDF files are allowed!"));
  }
};

// ------------------------
// EXPORT MULTER INSTANCE
// ------------------------
export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // max 10MB
});
