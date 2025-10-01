import mongoose from "mongoose";
const ProjectSchema = new mongoose.Schema(
  {
    Title: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
    },
    ShortDescription: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
    },
    Description: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
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
    DisplayOrder: {
      type: Number,
      // uinque: true,
    },
    FeaturedDisplayOrder: {
      type: Number,
      // uinque: true,
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
