import express from "express";
const Router = express.Router();
import aboutUsShema from "../models/AboutUsSchema.js";
import AboutUsSlides from "../models/AboutUsSlidesSchema.js";
import isAdminLogged from "../middlewares/isAdminLogged.js";
import validateAboutData from "../middlewares/EditAboutValidation.js";
import { upload } from "../controllers/storage.js";
import SlidesLogoFolderValidation from "../middlewares/SlidesLogo.js";
import mongoose from "mongoose";
import { access, unlink } from "fs/promises";

Router.post(
  "/aboutslide/add/slide",
  isAdminLogged,
  SlidesLogoFolderValidation,
  upload.single("image"),
  async (req, res) => {
    try {
      const slideImage = req.file?.filename;
      if (!req.file?.filename) {
        return res.status(400).json({ message: "Image/Logo Required" });
      }

      if (!req.body.slideTitle || !req.body.slideDescription) {
        const path = process.cwd();
        const DeleteImage = `${path}` + `/uploads/aboutimg/` + `${slideImage}`;
        await access(DeleteImage);
        await unlink(DeleteImage);
        return res.status(400).json({ message: "All fields Required" });
      }
      const NewSlide = new AboutUsSlides({
        slideImage: slideImage,
        slideTitle: req.body.slideTitle,
        slideDescription: req.body.slideDescription,
      });

      const SavedSlide = await NewSlide.save();

      const FindAllAboutUsSlides = await aboutUsShema.findOne();

      if (!FindAllAboutUsSlides) {
        return res.status(404).json({ message: "aboutUs data not found" });
      }

      FindAllAboutUsSlides.AboutUsSlides.push(SavedSlide._id);

      const PushToAbout = await FindAllAboutUsSlides.save();

      if (!PushToAbout) {
        return res.status(409).json({
          message:
            "The Slide Added But Something Wrong Happned To ADD it in About US PAGE ",
        });
      }
      return res.status(201).json({ message: "About Us Slide Added" });
    } catch {
      return res.status(409).json({ message: "Something Wrong" });
    }
  }
);
Router.delete(
  "/aboutslide/delete/slide/:id",
  isAdminLogged,
  async (req, res) => {
    try {
      const id = req.params.id;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Not Valid Id" });
      }

      const FindSlide = await AboutUsSlides.findById(id);
      if (!FindSlide) {
        return res.status(404).json({ message: "Slide Not Found" });
      }

      const FetchAboutSlides = await aboutUsShema.findOne();

      if (!FetchAboutSlides) {
        return res.status(404).json({
          message: "About Us page data not found",
        });
      }

      const slideExists = FetchAboutSlides.AboutUsSlides.includes(
        FindSlide._id
      );
      if (!slideExists) {
        return res.status(404).json({
          message: "Slide not found in About Us page",
        });
      }

      try {
        const findImg = await AboutUsSlides.findById(id);
        const path = process.cwd();
        const DeleteImage =
          `${path}` + `/uploads/aboutimg/` + `${findImg.slideImage}`;
        await access(DeleteImage);
        await unlink(DeleteImage);
        console.log("Old slideImage Removed");
      } catch (err) {
        console.log("I Cant Remove Old slide Image");
      }

      FetchAboutSlides.AboutUsSlides.pull(FindSlide._id);

      const DeleteFromAboutPage = await FetchAboutSlides.save();

      if (!DeleteFromAboutPage) {
        return res.status(409).json({
          message:
            "Something Wrong I Can't delete This Slide From About Us Page",
        });
      }

      await AboutUsSlides.findByIdAndDelete(FindSlide._id);

      return res.status(200).json({ message: "Slide deleted successfully" });
    } catch (err) {
      console.error("Delete slide error:", err);
      return res
        .status(500)
        .json({ message: "Something Wrong", error: err.message });
    }
  }
);

Router.put(
  "/aboutslide/edit/slide/:id",
  isAdminLogged,
  SlidesLogoFolderValidation,
  upload.single("image"),
  async (req, res) => {
    try {
      const id = req.params.id;
      const image = req.file?.filename;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }

      const FindSlide = await AboutUsSlides.findById(id);
      if (!FindSlide) {
        return res.status(404).json({ message: "Slide Not Found" });
      }

      const NewData = {
        ...req.body,
      };

      if (image) {
        NewData.slideImage = image;
        try {
          const path = process.cwd();
          const DeleteImage =
            `${path}` + `/uploads/aboutimg/` + `${FindSlide.slideImage}`;
          await access(DeleteImage);
          await unlink(DeleteImage);
          console.log("Old Slide Icon Removed");
        } catch (err) {
          console.log("I Cant Remove Old Slide Icon");
        }
      }

      const UpdateSlide = await AboutUsSlides.findByIdAndUpdate(
        FindSlide._id,
        NewData,
        { runValidators: true, new: true }
      );

      if (!UpdateSlide) {
        return res.status(409).json({ message: `Slide Update Has Failed` });
      }

      return res.status(200).json({
        message: `Slide Updated Successfully`,
        updatedSlide: UpdateSlide,
      });
    } catch (err) {
      console.error("Error updating Slide:", err);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

Router.put(
  "/about/edit/aboutdata",
  isAdminLogged,
  validateAboutData,
  async (req, res) => {
    try {
      const IsExistData = await aboutUsShema.findOne();
      if (!IsExistData) {
        res.status(404).json({ error: "About Us data not found" });
        return console.error(
          "About Us data not found You Need to Make [node setup] in backend root directory"
        );
      }
      const newdata = req.body;
      const UpdateData = await aboutUsShema.findByIdAndUpdate(
        IsExistData._id,
        newdata
      );

      if (!UpdateData) {
        return res
          .status(404)
          .json({ error: "Failed to update About Us data" });
      }
      res.status(200).json({
        message: "About Us data updated successfully",
      });
    } catch (error) {
      console.error("Error updating About Us data:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);

export default Router;
