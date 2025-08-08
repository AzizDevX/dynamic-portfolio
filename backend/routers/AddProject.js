import express from "express";
const Router = express.Router();
import Project from "../models/ProjectShema.js";
import validateProjectInput from "../middlewares/validateProjectInput.js";
import isAdminLogged from "../middlewares/isAdminLogged.js";
// Route to add a new project
// This route expects a POST request with project details in the request body
Router.post(
  "/add/project",
  isAdminLogged,
  validateProjectInput,
  async (req, res) => {
    try {
      const NewProject = new Project({
        Title: req.body.Title,
        Description: req.body.Description,
        Image: req.body.Image,
        ProjectLink: req.body.ProjectLink,
        Project_technologies: req.body.Project_technologies,
        Featured: req.body.Featured,
      });
      const savedProject = await NewProject.save();
      return res.status(201).json(savedProject);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Internal Server Error", error: error.message });
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
      Title: doc.Title,
      Description: doc.Description,
      Image: doc.Image,
      ProjectLink: doc.ProjectLink,
      Project_technologies: doc.Project_technologies,
      Featured: doc.Featured,
    }));
    return res.status(200).json(FilteredData);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
    return console.log("Something Wrong ", err);
  }
});
export default Router;
