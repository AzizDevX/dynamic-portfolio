import Joi from "joi";
function validateAddSkill(req, res, next) {
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ message: "No data provided for validation" });
  }
  const schema = Joi.object({
    Category: Joi.string().min(1).required(),
    SkillName: Joi.string().min(1).required(),
    Skill_Level: Joi.number().required(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
}
export default validateAddSkill;
