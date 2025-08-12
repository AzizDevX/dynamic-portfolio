import Joi from "joi";
function validateSocialLinksData(req, res, next) {
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ message: "No data provided for validation" });
  }
  const shema = Joi.object({
    SocialIcon: Joi.string()
      .valid(
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
        "Phone"
      )
      .required(),
    SocialLink: Joi.string().uri().required(),
  });
  const { error } = shema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
}
export default validateSocialLinksData;
