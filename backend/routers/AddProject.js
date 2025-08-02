import express from "express";
const Router = express.Router();
import Project from "../models/ProjectShema.js";
import validateProjectInput from "../middlewares/validateProjectInput.js";
// Route to add a new project
// This route expects a POST request with project details in the request body
Router.post("/add/project", validateProjectInput, async (req, res) => {
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
      technologies: req.body.technologies,
      createdAt: new Date(),
    });
    const savedProject = await NewProject.save();
    return res.status(201).json(savedProject);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});
export default Router;
