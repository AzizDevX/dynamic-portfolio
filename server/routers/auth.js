import bcrypt from "bcrypt";
import express from "express";
import jwt from "jsonwebtoken";
import Admin from "../models/AdminSchema.js";
import LoginValidateInput from "../middlewares/LoginValidateInput.js";
import { v4 as uuidv4 } from "uuid";
import AdminJti from "../models/JtiSchema.js";
const Router = express.Router();

Router.post(
  `/${process.env.Admin_Url}`,
  LoginValidateInput,
  async (req, res) => {
    try {
      const AdminUser = await Admin.findOne({ userName: req.body.userName });
      if (!AdminUser) {
        return res.status(403).json({ message: "Access Denied" });
      }
      const isMatch = await bcrypt.compare(
        req.body.password,
        AdminUser.password
      );
      if (!isMatch) {
        return res.status(403).json({ message: "Access Denied" });
      }
      const jti = uuidv4();
      const token = jwt.sign(
        {
          id: AdminUser._id,
          role: "admin",
          jti: jti,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "6h",
        }
      );

      if (
        process.env.CUSTOM_DOMAIN &&
        process.env.CUSTOM_DOMAIN.trim() !== ""
      ) {
        res.cookie("token", token, {
          httpOnly: true,
          secure: true,
          sameSite: "none",
          maxAge: 21600000, // 6 hours
          path: "/",
        });
      } else {
        res.cookie("token", token, {
          httpOnly: true,
          maxAge: 21600000, // 6h
        });
      }
      const realIp =
        req.headers["cf-connecting-ip"] ||
        (req.headers["x-forwarded-for"]
          ? req.headers["x-forwarded-for"].split(",")[0].trim()
          : null) ||
        req.ip;

      const NewJti = new AdminJti({
        AdminObjectId: AdminUser._id,
        Jti: jti,
        ip: realIp,
        userAgent: req.headers["user-agent"],
        expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6h
      });
      await NewJti.save();
      return res
        .status(200)
        .json({ message: "Logged successfully", cookie: token }); // remove cookie: token in proudction
    } catch (err) {
      return res.status(500).json({ message: "Internal server error" });
    }
  }
);

Router.post(`/logout`, async (req, res) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(404).json({ message: "You have already logged out." });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(400).json({ message: "Invalid Jwt" });
    }
    await AdminJti.deleteOne({ AdminObjectId: decoded.id, Jti: decoded.jti });

    if (process.env.CUSTOM_DOMAIN && process.env.CUSTOM_DOMAIN.trim() !== "") {
      res.clearCookie("token", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/",
        maxAge: 0,
      });
    } else {
      res.clearCookie("token", {
        httpOnly: true,
        maxAge: 0,
      });
    }

    return res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
});
export default Router;
