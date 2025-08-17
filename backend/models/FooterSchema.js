import mongoose from "mongoose";
const aboutUsSlidesSchema = mongoose.Schema(
  {
    FooterTitle: {
      type: String,
      default: "Footer Title",
    },
    FooterDescription: {
      type: String,
      default: "Footer Description",
    },

    OwnerEmail: {
      type: String,
      default: "Your Mail Here",
    },

    OwnerPhone: {
      type: String,
      default: "Your Phone Number Here",
    },
    OwnerAddress: {
      type: String,
      default: "Your Address Here",
    },
    FooterSocialLinks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FooterSocialLinks",
      },
    ],
  },
  { timestamps: true }
);
const Footer = mongoose.model("Footer", aboutUsSlidesSchema);
export default Footer;
