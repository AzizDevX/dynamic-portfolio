import Joi from "joi";
function validateEditHomeData(req, res, next) {
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ message: "No data provided for validation" });
  }
  const schema = Joi.object({
    DisplayName: Joi.string().optional(),
    MainRoles: Joi.array().items(Joi.string()).optional(),
    description: Joi.string().optional(),
    Clients_Counting: Joi.number().optional(),
    Rateing: Joi.number().optional(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
}
export default validateEditHomeData;
