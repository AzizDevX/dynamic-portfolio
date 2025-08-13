import express from "express";
import Skills from "../models/SkillsShema.js";
import isAdminLogged from "../middlewares/isAdminLogged.js";
import validateAddSkill from "../middlewares/AddSkillsValidation.js";
import mongoose from "mongoose";
const Router = express.Router();
Router.post(
  "/skills/add/skill",
  isAdminLogged,
  validateAddSkill,
  async (req, res) => {
    try {
      const NewSkill = new Skills({
        Category: req.body.Category,
        SkillName: req.body.SkillName,
        Skill_Level: req.body.Skill_Level,
      });
      await NewSkill.save();
      res.status(201).json({ message: "Skill Added Successfully" });
    } catch (err) {
      return res
        .status(500)
        .json({ message: "Internal Server Error", error: err.message });
    }
  }
);

Router.put("/skills/edit/skill/:id", isAdminLogged, async (req, res) => {
  try {
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    const FindSkill = await Skills.findById(id);
    if (!FindSkill) {
      return res.status(404).json({ message: "Skill Not Found" });
    }
    if (!req.body) {
      return res.status(400).json({ message: "Select Something To Update" });
    }

    const newdata = { ...req.body };
    const updateSkill = await Skills.findByIdAndUpdate(id, newdata, {
      new: true,
      runValidators: true,
    });
    if (!updateSkill) {
      return res
        .status(400)
        .json({ message: "Skill Dosent Updated There is Something Wrong" });
    }
    return res.status(200).json({ message: "Skill Updated Successfully" });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: err.message });
  }
});
Router.delete("/skills/delete/skill/:id", isAdminLogged, async (req, res) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    const findSkill = await Skills.findById(id);
    if (!findSkill) {
      return res.status(404).json({ message: "I cant Find This Skill" });
    }
    const DeleteSkill = await Skills.findByIdAndDelete(id);
    if (!DeleteSkill) {
      return res.status(409).json({ message: "I cant Delete The Skill" });
    }
    return res.status(200).json({ message: "Skill Deleted Successfully" });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: err.message });
  }
});

Router.get("/show/skills", async (req, res) => {
  try {
    const SkillsData = await Skills.find();
    if (!SkillsData) {
      return res.status(404).json("There Is No Skills Added");
    }
    return res.status(200).json({ SkillsData });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: err.message });
  }
});
export default Router;
