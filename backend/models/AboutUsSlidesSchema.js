import mongoose from "mongoose";
const aboutUsSlidesSchema = mongoose.Schema(
  {
    slideImage: {
      type: String,
    },
    slideTitle: {
      type: String,
    },
    slideDescription: {
      type: String,
    },
  },
  { timestamps: true }
);

const AboutUsSlides = mongoose.model("AboutUsSlides", aboutUsSlidesSchema);
export default AboutUsSlides;
