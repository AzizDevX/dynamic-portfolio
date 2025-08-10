import multer from "multer";
import fs from "fs";
import path from "path";
import { fileTypeFromBuffer } from "file-type";

// Allowed extensions
const allowedExtensions = [
  "png",
  "jpg",
  "jpeg",
  "webp",
  "gif",
  "svg",
  "ico",
  "pdf",
];

// Allowed MIME types (what we consider safe)
const allowedMimeTypes = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "image/x-icon",
  "image/vnd.microsoft.icon",
  "application/pdf",
];

// Special check for SVG (XML-based, not detected by file-type)
function isSVG(buffer) {
  const content = buffer.toString("utf8", 0, Math.min(buffer.length, 1000));
  return (
    content.includes("<svg") ||
    (content.includes("<?xml") && content.includes("<svg"))
  );
}

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
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Simple but effective verification
export const verifyFileType = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  try {
    const filePath = req.file.path;
    const fileExtension = path
      .extname(req.file.originalname)
      .toLowerCase()
      .replace(".", "");

    // 1. Check if extension is allowed
    if (!allowedExtensions.includes(fileExtension)) {
      fs.unlinkSync(filePath);
      return res.status(400).json({
        error: `File extension .${fileExtension} is not allowed`,
        allowedExtensions,
      });
    }

    // 2. Read file and detect actual MIME type
    const buffer = fs.readFileSync(filePath);

    // Handle SVG specially
    if (fileExtension === "svg") {
      if (isSVG(buffer)) {
        console.log(`✅ SVG file verified`);
        return next();
      } else {
        fs.unlinkSync(filePath);
        return res.status(400).json({ error: "Invalid SVG file" });
      }
    }

    // Detect actual file type
    const detectedType = await fileTypeFromBuffer(buffer);

    if (!detectedType) {
      fs.unlinkSync(filePath);
      return res.status(400).json({
        error:
          "Could not determine file type - file may be corrupted or invalid",
      });
    }

    // 3. Check if detected MIME type is allowed (this is the key security check)
    if (!allowedMimeTypes.includes(detectedType.mime)) {
      fs.unlinkSync(filePath);
      return res.status(400).json({
        error: `File type not allowed. Detected: ${detectedType.mime}`,
        detected: detectedType,
        allowedTypes: allowedMimeTypes,
      });
    }

    // If we reach here: extension is allowed + actual content is safe image/PDF
    console.log(
      `✅ File verified - Extension: ${fileExtension}, Actual: ${detectedType.ext}, MIME: ${detectedType.mime}`
    );

    next();
  } catch (error) {
    console.error("File verification error:", error);

    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    return res.status(500).json({
      error: "File verification failed",
      details: error.message,
    });
  }
};
