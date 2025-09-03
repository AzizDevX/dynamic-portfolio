import express from "express";
import Seo from "../models/SeoSchema.js";
import isAdminLogged from "../middlewares/isAdminLogged.js";
import EditSeoValidation from "../middlewares/EditSeoValidation.js";
//static Seo
import StaticSeo from "../models/StaticSeo.js";
import EditStaticSeoValidation from "../middlewares/EditStaticSeo.js";
const Router = express.Router();
// Static Seo
Router.put(
  "/edit/static/seo",
  isAdminLogged,
  EditStaticSeoValidation,
  async (req, res) => {
    try {
      const FindStaticSeo = await StaticSeo.findOne({});
      if (!FindStaticSeo) {
        return res
          .status(404)
          .json({ message: "Static Seo Not Found You Need To Do Setup Again" });
      }
      await StaticSeo.findByIdAndUpdate(FindStaticSeo._id, req.body, {
        new: true,
        runValidators: true,
      });
      return res
        .status(200)
        .json({ message: "Static Seo Updated Successfully" });
    } catch (err) {
      return res.status(500).json({ message: "Server Error" });
    }
  }
);

Router.get("/seo/static", async (req, res) => {
  try {
    const findPage = await StaticSeo.findOne({});
    if (!findPage) {
      return res.status(404).json({ message: "Page Not Found " });
    }
    return res.status(200).json(findPage);
  } catch (err) {
    return res.status(500).json({ message: "Server Error" });
  }
});

// Single Pages Seo
Router.put(
  "/edit/seo/:page",
  isAdminLogged,
  EditSeoValidation,
  async (req, res) => {
    try {
      const { page } = req.params;
      const findPage = await Seo.findOne({ Page: page });
      if (!findPage) {
        return res.status(404).json({ message: "Page Not Found " });
      }
      const UpdateSeo = await Seo.findOneAndUpdate({ Page: page }, req.body, {
        new: true,
      });
      return res.status(200).json({ message: "Seo Data Updated Successfully" });
    } catch (err) {
      return res.status(500).json({ message: "Server Error" });
    }
  }
);
Router.get("/seo/:page", async (req, res) => {
  try {
    const { page } = req.params;
    const findPage = await Seo.findOne({ Page: page });
    if (!findPage) {
      return res.status(404).json({ message: "Page Not Found " });
    }
    return res.status(200).json(findPage);
  } catch (err) {
    return res.status(500).json({ message: "Server Error" });
  }
});

export default Router;
