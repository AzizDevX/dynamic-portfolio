import mongoose from "mongoose";
const aboutUsShema = mongoose.Schema(
  {
    AboutUsTitle: {
      type: String,
    },
    AboutUsDescription: {
      type: String,
    },
    AboutSkills: {
      type: [String],
    },
    AboutUsSlides: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "AboutUsSlides",
      },
    ],
  },
  { timestamps: true }
);

const AboutUs = mongoose.model("AboutUs", aboutUsShema);
export default AboutUs;
