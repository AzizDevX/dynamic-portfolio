import Joi from "joi";
function LoginValidateInput(req, res, next) {
  if (!req.body) {
    return res
      .status(400)
      .json({ message: "UserName and Password are required" });
  }

  const loginSchema = Joi.object({
    userName: Joi.string().min(4).max(20).required(),
    password: Joi.string().min(6).max(50).required(),
  });

  const { error } = loginSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  next();
}

export default LoginValidateInput;
