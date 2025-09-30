import mongoose from "mongoose";
const FooterSocialLinks = mongoose.Schema({
  SocialIcon: {
    type: String,
    enum: [
      "Facebook",
      "Twitter",
      "Instagram",
      "LinkedIn",
      "Github",
      "Youtube",
      "Mail",
      "Twitch",
      "Globe",
      "Discord",
      "Telegram",
      "Pinterest",
      "Fiverr",
      "Reddit",
      "TikTok",
      "Snapchat",
      "Vimeo",
      "WhatsApp",
      "Slack",
      "Dribbble",
      "Behance",
      "Website",
      "Email",
      "Phone",
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
