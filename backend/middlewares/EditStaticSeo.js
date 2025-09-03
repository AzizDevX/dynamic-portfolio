import Joi from "joi";
function EditStaticSeoValidation(req, res, next) {
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ message: "No data provided for validation" });
  }
  const SeoSchema = Joi.object({
    Author: Joi.string().allow("", null),
    WebsiteName: Joi.string().allow("", null),
    LangCode: Joi.string().max(2).allow("", null),
    Lang: Joi.string().allow("", null),
    CountryCode: Joi.string().max(2).allow("", null),
    City: Joi.string().allow("", null),
    Geographic: Joi.string().allow("", null),
    ICBM: Joi.string().allow("", null),
  });
  const { error } = SeoSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
}
export default EditStaticSeoValidation;
