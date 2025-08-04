import mongoose from "mongoose";
import HomeData from "./models/HomeDataSchema.js";
import connectDB from "./config/dbConnect.js";

async function setupHomeData_DefaultValues() {
  try {
    await connectDB(); // Actually connect to DB
    console.log("✅ Connected to MongoDB.");

    const existingData = await HomeData.findOne();
    if (existingData) {
      console.log("ℹ️ Home data already exists. Skipping seeding.");
      return;
    }

    const homeData = new HomeData({
      DisplayName: "Your Name Here",
      MainRoles: ["Developer", "Designer"],
      description:
        "Experienced in web development and design. You can customize all this from the Admin Dashboard.",
      Clients_Counting: 11,
      Rateing: 4.8,
      Projects_Counting: 100,
      Experience: "2 years in the industry",
      Technologies_Counting: 10,
    });

    await homeData.save();
    console.log("✅ Home data setup completed successfully.");
  } catch (err) {
    console.error("❌ Error setting up home data:", err);
  } finally {
    mongoose.connection.close();
  }
}

setupHomeData_DefaultValues();
