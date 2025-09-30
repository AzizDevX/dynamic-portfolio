import Joi from "joi";
function validateProjectInput(req, res, next) {
  const schema = Joi.object({
    Title: Joi.string().min(3).required(),
    ShortDescription: Joi.string().min(1).required(),
    Description: Joi.string().min(10).required(),
    Image: Joi.string().uri(),
    ProjectLiveUrl: Joi.string().uri(),
    Project_technologies: Joi.array().items(Joi.string()),
    Porject_Status: Joi.string()
      .default([
        "completed",
        "in progress",
        "planning",
        "planned",
        "on hold",
        "canceled",
        "prototype",
        "launched",
        "metrics",
        "awarded",
        "passed",
        "achievement",
        "archived",
      ])
      .required(),
    Featured: Joi.boolean().default(false),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
}
export default validateProjectInput;
