import express from "express";
import Project from "../models/ProjectShema.js";
const Router = express.Router();
Router.delete("/delete/:id", async (req, res) => {
  const id = await Project.findOne({ projectId: req.params.id });
  if (!id) {
    return res.status(404).json({ message: "Project Not Found" });
  }
  const DeleteProject = await Project.findByIdAndDelete(id._id);
  return res
    .status(200)
    .json({ message: `Project Deleted : ${DeleteProject}` });
});
export default Router;
