import jwt from "jsonwebtoken";

function isAdminLogged(req, res, next) {
  try {
    const token = req.cookies.token;
    const isLogged = jwt.verify(token, process.env.JWT_SECRET);
    if (!isLogged) {
      return res.status(401).json({ message: "Access Denied" });
    }
    req.user = isLogged;
    next();
  } catch (err) {
    return res
      .status(401)
      .json({ message: "Invalid or expired token You Need to LOGIN AGAIN" });
  }
}

export default isAdminLogged;
