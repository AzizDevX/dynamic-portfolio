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
      const IsUsedId = await Project.findOne({ projectId: req.body.projectId });
      if (IsUsedId) {
        return res
          .status(400)
          .json({ message: "Id Must be Unique Try Again with Other ID" });
      }
      const NewProject = new Project({
        projectId: req.body.projectId,
        title: req.body.title,
        description: req.body.description,
        image: req.body.image,
        githubLink: req.body.githubLink,
        project_technologies: req.body.project_technologies,
        createdAt: new Date(),
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
      projectId: doc.projectId,
      title: doc.title,
      description: doc.description,
      image: doc.image,
      githubLink: doc.githubLink,
      project_technologies: doc.project_technologies,
    }));
    return res.status(200).json(FilteredData);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
    return console.log("Something Wrong ", err);
  }
});
export default Router;
