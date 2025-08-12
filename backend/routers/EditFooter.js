import express from "express";
import isAdminLogged from "../middlewares/isAdminLogged.js";
import Footer from "../models/FooterShema.js";
import FooterSocialLinksModel from "../models/FooterSocialLinksShema.js";
import validateSocialLinksData from "../middlewares/SocialLinksValidation.js";
import validateFooterData from "../middlewares/footerdataValidation.js";
import mongoose from "mongoose";
const Router = express.Router();

Router.post(
  "/footer/platform/add",
  isAdminLogged,
  validateSocialLinksData,
  async (req, res) => {
    try {
      const FindFooterData = await Footer.findOne();
      if (!FindFooterData) {
        return res.status(404).json({
          message: "Main Footer Data Not Found You Need To Setup Backend ",
        });
      }

      const NewSocialLink = new FooterSocialLinksModel({
        SocialIcon: req.body.SocialIcon,
        SocialLink: req.body.SocialLink,
      });
      const Saved = await NewSocialLink.save();
      if (!Saved) {
        return res
          .status(409)
          .json({ message: "Something Wrong  NewSocialLink NOT SAVED" });
      }
      FindFooterData.FooterSocialLinks.push(NewSocialLink._id);
      const IsPushed = await FindFooterData.save();
      if (!IsPushed) {
        return res.status(409).json({
          message:
            "Something Wrong Happend When I Push New Link To Main Footer Collection Try Again",
        });
      }
      return res.status(200).json({ message: "New Social Links Added" });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ message: "Something Wrong" });
    }
  }
);
Router.delete(
  "/footer/platform/delete/:id",
  isAdminLogged,
  async (req, res) => {
    try {
      const id = req.params.id;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          message: "Invalid ID format",
        });
      }
      const FindFooterData = await Footer.findOne();
      const FooterSocialLinks = await FooterSocialLinksModel.findOne();
      if (!FindFooterData) {
        return res.status(404).json({
          message: "Main Footer Data Not Found You Need To Setup Backend ",
        });
      }

      if (!FooterSocialLinks) {
        return res.status(404).json({
          message:
            "FooterSocialLinks Data Not Found You Need To Setup Backend ",
        });
      }

      const deletedSocialLink = await FooterSocialLinksModel.findByIdAndDelete(
        id
      );
      if (!deletedSocialLink) {
        return res
          .status(404)
          .json({ message: "I cant Find This Footer Social Links Collection" });
      }
      FindFooterData.FooterSocialLinks.pull(id);
      const DeletedFromFooter = await FindFooterData.save();
      if (!DeletedFromFooter) {
        res.status(409).json({
          message:
            "Footer Social Links Deleted But Something Wrong Happend SO Not DELTED IN MAIN FOOTER COLLECTION",
        });
      }
      return res
        .status(200)
        .json({ message: "Social Links Deleted Successfully" });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ message: "Something Wrong" });
    }
  }
);

Router.put(
  "/footer/platform/edit/:id",
  isAdminLogged,
  validateSocialLinksData,
  async (req, res) => {
    try {
      const id = req.params.id;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          message: "Invalid ID format",
        });
      }
      const FindFooterData = await Footer.findOne();
      const FooterSocialLinks = await FooterSocialLinksModel.findOne();
      if (!FindFooterData) {
        return res.status(404).json({
          message: "Main Footer Data Not Found You Need To Setup Backend ",
        });
      }

      if (!FooterSocialLinks) {
        return res.status(404).json({
          message:
            "FooterSocialLinks Data Not Found You Need To Setup Backend ",
        });
      }

      const UpdateSocialLink = await FooterSocialLinksModel.findByIdAndUpdate(
        id,
        {
          SocialIcon: req.body.SocialIcon,
          SocialLink: req.body.SocialLink,
        },
        { new: true }
      );
      if (!UpdateSocialLink) {
        return res
          .status(404)
          .json({ message: "I cant Find This Footer Social Links Collection" });
      }
      return res
        .status(200)
        .json({ message: "Social Links Deleted Successfully" });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ message: "Something Wrong" });
    }
  }
);

Router.put(
  "/footer/edit/footerdata",
  isAdminLogged,
  validateFooterData,
  async (req, res) => {
    try {
      const FindFooterData = await Footer.findOne();
      if (!FindFooterData) {
        return res.status(404).json({ message: "I cant Find Footer Data" });
      }
      const UpdatesData = { ...req.body };
      await Footer.findByIdAndUpdate(FindFooterData._id, UpdatesData, {
        new: true,
        runValidators: true,
      });
      return res.status(200).json({ message: "Footer Updated Successfully" });
    } catch (err) {
      return res.status(500).json({ message: "Something Wrong" });
    }
  }
);

export default Router;
