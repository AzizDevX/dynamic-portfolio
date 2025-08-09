import express from "express";
import HomeData from "../models/HomeDataSchema.js";
import { upload } from "../controllers/storage.js";
import HomeLogoFolder from "../middlewares/HomeLogo.js";
import { access, unlink } from "fs/promises";
import isAdminLogged from "../middlewares/isAdminLogged.js";
import validateEditHomeData from "../middlewares/EditHomeDataValidation.js";
import Stats from "../models/StatsShema.js";
import validateAddStat from "../middlewares/AddStatValidation.js";
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

Router.put(
  "/edit/homedata",
  isAdminLogged,
  validateEditHomeData,
  async (req, res) => {
    try {
      const NewData = req.body;

      const FindOldData = await HomeData.findOne();
      if (!FindOldData || FindOldData.length === 0) {
        return res.status(404).json({ message: "No home data found" });
      }
      const UpdateData = await HomeData.findByIdAndUpdate(
        FindOldData._id,
        NewData,
        { validation: true, runValidators: true, new: true }
      );

      if (!UpdateData) {
        return res.status(404).json({ message: "Failed to update home data" });
      }
      return res.status(200).json({
        message: "Home data updated successfully",
        data: UpdateData,
      });
    } catch (err) {
      res.status(500).json({ error: "Internal Server Error" });
      return console.error("Error updating home data:", err);
    }
  }
);

Router.post(
  "/homedata/add/stat",
  isAdminLogged,
  validateAddStat,
  async (req, res) => {
    try {
      const NewStatData = new Stats({
        StatsNumber: req.body.StatsNumber,
        StatsLabel: req.body.StatsLabel,
      });
      const savedData = await NewStatData.save();

      if (!savedData) {
        return res.status(400).json({ message: "Failed to save stat data" });
      }

      const HomeDataRecord = await HomeData.findOne();
      if (!HomeDataRecord) {
        return res.status(404).json({ message: "Home data not found" });
      }

      HomeDataRecord.Stats.push(savedData._id);
      await HomeDataRecord.save();

      return res.status(201).json({ message: "Stat data added successfully" });
    } catch (error) {
      console.error("Error adding home data:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

// Router.delete(
//   "/homedata/delete/stat/:id",
//   isAdminLogged,
// );

// Router.put(
//   "/homedata/update/stat/:id",
//   isAdminLogged,
//   validateAddStat,
//   async (req, res) => {}
// );

export default Router;
