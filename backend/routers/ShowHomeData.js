import HomeData from "../models/HomeDataSchema.js";
import StatsData from "../models/StatsShema.js";
import express from "express";
const Router = express.Router();
Router.get("/home/main/data", async (req, res) => {
  try {
    const homeData = await HomeData.findOne();
    if (!homeData) {
      return res.status(404).json({ message: "Home data not found" });
    }
    const StatsInfo = await HomeData.findOne().populate("Stats");
    const filteredData = {
      DisplayName: homeData.DisplayName,
      MainRoles: homeData.MainRoles,
      description: homeData.description,
      Clients_Counting: homeData.Clients_Counting,
      Rateing: homeData.Rateing,
      Stats: StatsInfo.Stats,
    };
    return res.status(200).json(filteredData);
  } catch (error) {
    console.error("Error fetching home data:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});
export default Router;
