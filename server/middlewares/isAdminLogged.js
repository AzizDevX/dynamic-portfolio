import jwt from "jsonwebtoken";
import AdminJti from "../models/JtiSchema.js";
async function isAdminLogged(req, res, next) {
  try {
    const token = req.cookies.token;
    const isLogged = jwt.verify(token, process.env.JWT_SECRET);
    if (!isLogged) {
      const access = false;
      return res.status(401).json({ message: "Access Denied ", access });
    }
    const session = await AdminJti.findOne({
      AdminObjectId: isLogged.id,
      Jti: isLogged.jti,
    });
    if (!session) {
      const access = false;
      return res
        .status(401)
        .json({ message: "Access Denied Token Expired", access });
    }
    req.user = isLogged;
    next();
  } catch (err) {
    const access = false;
    return res.status(401).json({
      message: "Invalid or expired token You Need to LOGIN AGAIN",
      access,
    });
  }
}

export default isAdminLogged;
