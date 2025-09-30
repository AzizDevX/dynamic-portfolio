import mongoose from "mongoose";
const aboutUsSlidesSchema = mongoose.Schema(
  {
    slideImage: {
      type: String,
      required: true,
    },
    slideTitle: {
      type: String,
      required: true,
    },
    slideDescription: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const AboutUsSlides = mongoose.model("AboutUsSlides", aboutUsSlidesSchema);
export default AboutUsSlides;
