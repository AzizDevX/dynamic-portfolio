import mongoose from "mongoose";
const ProjectSchema = new mongoose.Schema(
  {
    Title: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 100,
    },
    Description: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 500,
    },
    Image: {
      type: String,
      required: true,
      trim: true,
    },
    ProjectLink: {
      type: String,
      trim: true,
      require: true,
    },
    Project_technologies: {
      type: [String],
      default: [],
    },
    Featured: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);
const Project = mongoose.model("Projects", ProjectSchema);
export default Project;
