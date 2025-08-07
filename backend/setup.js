import mongoose from "mongoose";
import HomeData from "./models/HomeDataSchema.js";
import connectDB from "./config/dbConnect.js";
import Stats from "./models/StatsShema.js";

async function ConnectDb() {
  try {
    await connectDB();
    console.log("✅ Connected to MongoDB.");
  } catch (err) {
    return console.log("Db Not Connected Try Again");
  }
}
ConnectDb();

async function setupStats_DefaultValues() {
  try {
    const existingData = await Stats.findOne();
    if (existingData) {
      return console.log("ℹ️ Stats data already exists. Skipping seeding.");
    }

    const MainStats = new Stats({
      Stats: [
        { StatsNumber: "1+", StatsLabel: "Projects Completed" },
        { StatsNumber: "2+", StatsLabel: "Years Experience" },
        { StatsNumber: "3+", StatsLabel: "Happy Clients" },
        { StatsNumber: "4+", StatsLabel: "Technologies" },
      ],
    });

    await MainStats.save();
    console.log("✅ Stats data setup completed successfully.");
  } catch (err) {
    return console.error("❌ Error setting up Stats data:", err);
  }
}

async function setupHomeData_DefaultValues() {
  try {
    const existingData = await HomeData.findOne();
    if (existingData) {
      return console.log("ℹ️ Home data already exists. Skipping seeding.");
    }

    const StatsData = await Stats.findOne();
    const homeData = new HomeData({
      HomeLogo: "default.png",
      DisplayName: "Your Name Here",
      MainRoles: ["Full Stack Developer", "Problem Solver", "Tech Enthusiast"],
      description:
        "Experienced in web development and design. You can customize all this from the Admin Dashboard.",
      Clients_Counting: 11,
      Rateing: 4.8,
      Projects_Counting: 100,
      Experience: "2 years in the industry",
      Technologies_Counting: 10,
      Stats: StatsData,
    });

    await homeData.save();
    console.log("✅ Home data setup completed successfully.");
  } catch (err) {
    console.error("❌ Error setting up home data:", err);
  }
}

async function initializeData() {
  await setupStats_DefaultValues();
  await setupHomeData_DefaultValues();
  mongoose.connection.close;
  process.exit(0);
}
initializeData();
