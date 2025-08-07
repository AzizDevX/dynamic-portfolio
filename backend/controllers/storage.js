import multer from "multer";
import fs from "fs";
import path from "path";

const Storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = req.query.folder;
    const dir = `uploads/${folder}`;
    cb(null, dir);
  },

  filename: function (req, file, cb) {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

export const upload = multer({ storage: Storage });
