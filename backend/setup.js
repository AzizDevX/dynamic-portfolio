import mongoose from "mongoose";
import HomeData from "./models/HomeDataSchema.js";
import connectDB from "./config/dbConnect.js";
import Stats from "./models/StatsShema.js";
import AboutUsSlides from "./models/AboutUsSlidesSchema.js";
import AboutUs from "./models/AboutUsShema.js";
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

async function setupAboutSlides_DefaultValues() {
  try {
    const existingData = await AboutUsSlides.findOne();
    if (existingData) {
      return console.log(
        "ℹ️ About Slides data already exists. Skipping seeding."
      );
    }

    const SlidesData = [
      {
        slideImage: "defaulticon1.png",
        slideTitle: "Web Development",
        slideDescription:
          "Building responsive and performant web applications using modern technologies and best practices.",
      },
      {
        slideImage: "defaulticon2.png",
        slideTitle: "UI/UX Design",
        slideDescription:
          "Creating intuitive and beautiful user interfaces that provide exceptional user experiences.",
      },
      {
        slideImage: "defaulticon3.png",
        slideTitle: "Performance Optimization",
        slideDescription:
          "Optimizing applications for speed, accessibility, and search engine visibility.",
      },
    ];
    const SaveSlides = await AboutUsSlides.insertMany(SlidesData);
    console.log("✅ About us SLIDES data setup completed successfully.");
  } catch (err) {
    return console.error("❌ Error setting up Stats data:", err);
  }
}

async function setupAboutUs_DefaultValues() {
  try {
    const existingData = await AboutUs.findOne();
    if (existingData) {
      return console.log("ℹ️ About Us data already exists. Skipping seeding.");
    }
    const ImportSlides = await AboutUsSlides.find({});

    const AboutData = new AboutUs({
      AboutUsTitle: "Passionate about creating digital solutions",
      AboutUsDescription:
        "With over 3 years of experience in design, I specialize in crafting modern, intuitive, and visually compelling user interfaces. I'm passionate about clean aesthetics, creative problem-solving, and delivering impactful user experiences through thoughtful design.",
      AboutSkills: [
        "Adobe Photoshop",
        "Adobe Illustrator",
        "Adobe XD",
        "Figma",
        "UI/UX Design",
        "Wireframing",
        "Prototyping",
        "Responsive Design",
      ],
      AboutUsSlides: ImportSlides,
    });

    await AboutData.save();
    console.log("✅ ABOUT US data setup completed successfully.");
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
    const AboutUsData = await AboutUs.findOne();
    const homeData = new HomeData({
      HomeLogo: "default.png",
      DisplayName: "Your Name Here",
      MainRoles: [
        "Full Stack Developer",
        "Designer graphique",
        "Problem Solver",
      ],
      description:
        "Experienced in web development and design. You can customize all this from the Admin Dashboard.",
      Clients_Counting: 11,
      Rateing: 4.8,
      Projects_Counting: 100,
      Experience: "2 years in the industry",
      Technologies_Counting: 10,
      Stats: StatsData,
      AboutUs: AboutUsData,
    });

    await homeData.save();
    console.log("✅ Home data setup completed successfully.");
  } catch (err) {
    console.error("❌ Error setting up home data:", err);
  }
}

async function initializeData() {
  await setupStats_DefaultValues();
  await setupAboutSlides_DefaultValues();
  await setupAboutUs_DefaultValues();
  await setupHomeData_DefaultValues();
  mongoose.connection.close;
  process.exit(0);
}
initializeData();
