import multer from "multer";
import fs from "fs";
import path from "path";

const Storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = req.query.folder;
    const dir = `uploads/${folder}`;

    // Ensure directory exists
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    cb(null, dir);
  },

  filename: function (req, file, cb) {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

export const upload = multer({
  storage: Storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});
