import Joi from "joi";
function validateAddStat(req, res, next) {
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ message: "No data provided for validation" });
  }

  const schema = Joi.object({
    StatsNumber: Joi.string().required(),
    StatsLabel: Joi.string().required(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  next();
}
export default validateAddStat;
