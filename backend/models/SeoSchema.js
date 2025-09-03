import mongoose from "mongoose";
const SeoShema = new mongoose.Schema(
  {
    Page: {
      type: String,
      enum: ["home", "projects", "skills", "cv", "contact"],
      required: true,
      trim: true,
      minlength: 1,
      unique: true,
    },
    Title: {
      type: String,
      required: true,
      trim: true,
    },
    Description: {
      type: String,
      trim: true,
    },
    Keywords: {
      type: [String],
      trim: true,
    },
    SocialTitle: {
      type: String,
      trim: true,
    },
    SocialDescription: {
      type: String,
      trim: true,
    },
    PageUrl: {
      type: String,
      trim: true,
    },
    SocialImage: {
      type: String,
      trim: true,
    },
    TwitterTitle: {
      type: String,
      trim: true,
    },
    TwitterDescription: {
      type: String,
      trim: true,
    },
    TwitterImage: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);
const Seo = mongoose.model("Seo", SeoShema);
export default Seo;
