import Joi from "joi";
function EditSeoValidation(req, res, next) {
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ message: "No data provided for validation" });
  }
  const SeoSchema = Joi.object({
    Title: Joi.string().required(),
    Description: Joi.string().allow("", null),
    Keywords: Joi.array().items(Joi.string()).allow(null),
    SocialTitle: Joi.string().allow("", null),
    SocialDescription: Joi.string().allow("", null),
    PageUrl: Joi.string().uri().allow("", null),
    SocialImage: Joi.string().uri().allow("", null),
    TwitterTitle: Joi.string().allow("", null),
    TwitterDescription: Joi.string().allow("", null),
    TwitterImage: Joi.string().uri().allow("", null),
  });
  const { error } = SeoSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
}
export default EditSeoValidation;
