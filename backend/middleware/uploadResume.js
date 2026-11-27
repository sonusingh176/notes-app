import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = path.join(process.cwd(), "uploads", "resumes");

fs.mkdirSync(uploadDir, { recursive: true });

// Store the file on disk storage.
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const fileName = `${Date.now()}-${file.originalname}`;
        cb(null, fileName);
    },
});

const upload = multer({
    // Store the file in memory instead of saving it on disk.
    //    storage: multer.memoryStorage(),
    storage,

    // Allow only one file up to 2 MB.
    limits: {
        fileSize: 2 * 1024 * 1024,
        files: 1,
    },

    // Check the uploaded file type.
    fileFilter: (req, file, cb) => {
        if (file.mimetype !== "application/pdf") {
            return cb(new Error("Only PDF files are allowed."));
        }

        cb(null, true);
    },

});

export const uploadResume = upload.single("resume");