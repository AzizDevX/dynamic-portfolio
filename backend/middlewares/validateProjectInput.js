import Joi from "joi";
function validateProjectInput(req, res, next) {
  const schema = Joi.object({
    Title: Joi.string().min(3).required(),
    Description: Joi.string().min(10).required(),
    Image: Joi.string().uri().required(),
    ProjectLink: Joi.string().uri(),
    Project_technologies: Joi.array().items(Joi.string()),
    Featured: Joi.boolean().default(false),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
}
export default validateProjectInput;
