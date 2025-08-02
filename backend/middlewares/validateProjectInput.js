import Joi from "joi";
function validateProjectInput(req, res, next) {
  const schema = Joi.object({
    projectId: Joi.string().required(),
    title: Joi.string().min(3).required(),
    description: Joi.string().min(10).required(),
    image: Joi.string().uri().required(),
    githubLink: Joi.string().uri(),
    technologies: Joi.array().items(Joi.string()),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
}
export default validateProjectInput;
