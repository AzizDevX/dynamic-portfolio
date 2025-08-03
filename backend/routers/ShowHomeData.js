import HomeData from "../models/HomeDataSchema.js";
import express from "express";
const Router = express.Router();
Router.get("/home/main/data", async (req, res) => {
  try {
    const homeData = await HomeData.findOne();
    if (!homeData) {
      return res.status(404).json({ message: "Home data not found" });
    }
    return res.status(200).json(homeData);
  } catch (error) {
    console.error("Error fetching home data:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});
export default Router;
