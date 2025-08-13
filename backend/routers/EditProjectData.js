import express from "express";
const Router = express.Router();
import Project from "../models/ProjectShema.js";
import validateProjectInput from "../middlewares/validateProjectInput.js";
import isAdminLogged from "../middlewares/isAdminLogged.js";
import { upload, verifyFileType } from "../controllers/storage.js";
import PorjectsLogoFolderValidation from "../middlewares/ProjectsLogos.js";
import { access, unlink } from "fs/promises";
import mongoose from "mongoose";
// Route to add a new project
// This route expects a POST request with project details in the request body
Router.post(
  "/projects/add/project",
  isAdminLogged,
  validateProjectInput,
  PorjectsLogoFolderValidation,
  upload.single("image"),
  verifyFileType,
  async (req, res) => {
    try {
      const NewProject = new Project({
        Title: req.body.Title,
        ShortDescription: req.body.ShortDescription,
        Description: req.body.Description,
        Image: req.file?.filename,
        ProjectLink: req.body.ProjectLink,
        Project_technologies: req.body.Project_technologies,
        Porject_Status: req.body.Porject_Status,
        Featured: req.body.Featured,
      });
      const savedProject = await NewProject.save();
      return res.status(201).json(savedProject);
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Internal Server Error", error: error.message });
    }
  }
);

Router.delete("/projects/delete/:id", async (req, res) => {
  try {
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Not Valid Id" });
    }
    const FindProject = await Project.findById(id);
    if (!FindProject) {
      return res.status(404).json({ message: "Project Not Found" });
    }

    if (FindProject.Image != "Nothing") {
      try {
        const path = process.cwd();
        const DeleteImage =
          `${path}` + `/uploads/projectsimg/` + `${FindProject.Image}`;
        await access(DeleteImage);
        await unlink(DeleteImage);
        console.log("Old Project image Removed");
      } catch (err) {
        console.log("I Cant Remove Old Project image");
      }
    }
    await Project.findByIdAndDelete(id);

    return res.status(200).json({ message: `Project Deleted ` });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});

Router.put(
  "/projects/edit/:id",
  isAdminLogged,
  PorjectsLogoFolderValidation,
  upload.single("image"),
  verifyFileType,
  async (req, res) => {
    try {
      const id = req.params.id;
      const image = req.file?.filename;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }

      const FindProject = await Project.findById(id);
      if (!FindProject) {
        return res.status(404).json({ message: "Project Not Found" });
      }

      const NewData = {
        ...req.body,
      };

      if (image) {
        NewData.Image = image;
        try {
          const path = process.cwd();
          const DeleteImage =
            `${path}` + `/uploads/projectsimg/` + `${FindProject.Image}`;
          await access(DeleteImage);
          await unlink(DeleteImage);
          console.log("Old Project Icon Removed");
        } catch (err) {
          console.log("I Cant Remove Old Project Icon");
        }
      }

      const UpdateProjec = await Project.findByIdAndUpdate(
        FindProject._id,
        NewData,
        { runValidators: true, new: true }
      );

      if (!UpdateProjec) {
        return res.status(409).json({ message: `Project Update Failed` });
      }

      return res.status(200).json({
        message: `Project Updated Successfully`,
      });
    } catch (err) {
      console.error("Error updating Project:", err);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

// GET REQ TO SHOW ALL PROJECT FOR Frontend
Router.get("/show/projects", async (req, res) => {
  try {
    const Projects = await Project.find();
    if (Projects.length === 0) {
      return res.status(404).json({ message: "No Projects Found" });
    }
    const FilteredData = Projects.map((doc) => ({
      _id: doc._id,
      Title: doc.Title,
      ShortDescription: doc.ShortDescription,
      Description: doc.Description,
      Image: doc.Image,
      ProjectLink: doc.ProjectLink,
      ProjectLiveUrl: doc.ProjectLiveUrl,
      Project_technologies: doc.Project_technologies,
      Porject_Status: doc.Porject_Status,
      Featured: doc.Featured,
    }));
    return res.status(200).json(FilteredData);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
    return console.log("Something Wrong ", err);
  }
});
export default Router;
