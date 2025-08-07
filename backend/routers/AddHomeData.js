import express from "express";
import HomeData from "../models/HomeDataSchema.js";
import { upload } from "../controllers/storage.js";
const Router = express.Router();

Router.put("/update/logo", upload.single("image"), async (req, res) => {
  try {
    const image = req.file ? req.file.filename : null;
    if (!image) {
      return res.status(400).json({ error: "Image file is required" });
    }

    return res
      .status(200)
      .json({ message: "logo updated successfully", filename: image });
  } catch (err) {
    console.log("Error in /update/homepage:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

export default Router;
