import mongoose from "mongoose";
const FooterSocialLinks = mongoose.Schema({
  SocialIcon: {
    type: String,
    enum: [
      "Facebook",
      "Twitter",
      "Instagram",
      "LinkedIn",
      "GitHub",
      "YouTube",
      "Mail",
      "Twitch",
      "Globe",
    ],
    required: true,
  },
  SocialLink: {
    type: String,
    required: true,
  },
});
const FooterSocialLinksModel = mongoose.model(
  "FooterSocialLinks",
  FooterSocialLinks
);
export default FooterSocialLinksModel;
