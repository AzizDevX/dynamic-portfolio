import mongoose from "mongoose";
const FooterSocialLinks = mongoose.Schema({
  SocialIcon: {
    type: String,
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
