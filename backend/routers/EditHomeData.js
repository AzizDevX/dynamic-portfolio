import express from "express";
import HomeData from "../models/HomeDataSchema.js";
import { upload } from "../controllers/storage.js";
import HomeLogoFolder from "../middlewares/HomeLogo.js";
import { access, unlink } from "fs/promises";
import isAdminLogged from "../middlewares/isAdminLogged.js";
const Router = express.Router();

Router.put(
  "/update/logo",
  isAdminLogged,
  HomeLogoFolder,
  upload.single("image"),
  async (req, res) => {
    try {
      const image = req.file?.filename;
      if (!image) {
        return res.status(400).json({ error: "Image file is required" });
      }

      const DefaultHomeLogo = await HomeData.findOne({
        HomeLogo: { $exists: true },
      });

      if (!DefaultHomeLogo) {
        return res.status(400).json({
          message:
            "You need to complete setup. Run script: ./setup.js in the backend root folder.",
        });
      }

      // Only try to delete old logo if it exists and is valid
      if (
        DefaultHomeLogo.HomeLogo &&
        DefaultHomeLogo.HomeLogo !== "undefined"
      ) {
        const PROJECT_ROOT = process.cwd();
        const OldLogo = `${PROJECT_ROOT}/uploads/${req.query.folder}/${DefaultHomeLogo.HomeLogo}`;

        try {
          await access(OldLogo); // This throws if file doesn't exist
          await unlink(OldLogo); // Delete the file
        } catch (error) {
          if (error.code === "ENOENT") {
          } else {
            console.error("Error deleting old logo:", error);
            // Don't return error here, continue with update
          }
        }
      }

      await HomeData.findByIdAndUpdate(DefaultHomeLogo._id, {
        HomeLogo: image,
      });

      return res
        .status(200)
        .json({ message: "logo updated successfully", filename: image });
    } catch (err) {
      console.log("Error in /update/homepage:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

export default Router;
