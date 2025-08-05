import express from "express";
const Router = express.Router();
import isAdminLogged from "../middlewares/isAdminLogged.js";

Router.get("/verify/jwt", isAdminLogged, (req, res) => {
  return res.status(200).json({
    message: "Valid Token - Access Granted",
  });
});
export default Router;
