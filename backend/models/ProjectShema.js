import mongoose from "mongoose";
const ProjectSchema = new mongoose.Schema(
  {
    projectId: {
      type: String,
      unique: true,
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 100,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 500,
    },
    image: {
      type: String,
      required: true,
      trim: true,
    },
    githubLink: {
      type: String,
      trim: true,
    },
    project_technologies: {
      type: [String],
    },
    createdAt: {
      type: Date,
      required: false,
    },
  },
  { timestamps: true }
);
const Project = mongoose.model("Projects", ProjectSchema);
export default Project;
