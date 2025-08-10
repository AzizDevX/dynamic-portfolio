import Joi from "joi";
function validateAboutData(req, res, next) {
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ message: "No data provided for validation" });
  }
  const shema = Joi.object({
    AboutUsTitle: Joi.string().optional(),
    AboutUsDescription: Joi.string().optional(),
    AboutSkills: Joi.array().optional(),
  });
  const { error } = shema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
}
export default validateAboutData;
