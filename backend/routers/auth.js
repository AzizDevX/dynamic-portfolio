import bcrypt from "bcrypt";
import express from "express";
import jwt from "jsonwebtoken";
import Admin from "../models/AdminShema.js";
import LoginValidateInput from "../middlewares/LoginValidateInput.js";
const Router = express.Router();

Router.post(
  `/${process.env.Admin_Url}`,
  LoginValidateInput,
  async (req, res) => {
    const AdminUser = await Admin.findOne({ userName: req.body.userName });
    if (!AdminUser) {
      return res.status(403).json({ message: "Access Denied" });
    }
    const isMatch = await bcrypt.compare(req.body.password, AdminUser.password);
    if (!isMatch) {
      return res.status(403).json({ message: "Access Denied" });
    }
    const token = jwt.sign(
      {
        id: AdminUser._id,
        role: "admin",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "6h",
      }
    );

    res.cookie("token", token, {
      httpOnly: true,
      // secure: true, // only in HTTPS
      // sameSite: "Strict",
      maxAge: 21600000, // 6h
    });

    return res
      .status(200)
      .json({ message: "Logged successfully", cookie: token }); // remove cookie: token in proudction
  }
);
export default Router;
