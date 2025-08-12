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
    ShortDescription: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 200,
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
      default: "Nothing",
      trim: true,
    },
    ProjectLiveUrl: {
      type: String,
      trim: true,
      require: false,
      default: "",
    },
    Project_technologies: {
      type: [String],
      default: [],
    },
    Porject_Status: {
      type: String,
      enum: [
        "completed",
        "in progress",
        "planning",
        "planned",
        "on hold",
        "canceled",
        "prototype",
        "launched",
        "metrics",
        "awarded",
        "passed",
        "achievement",
        "archived",
      ],
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
