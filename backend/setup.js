import mongoose from "mongoose";
import HomeData from "./models/HomeDataSchema.js";
import connectDB from "./config/dbConnect.js";
import Stats from "./models/StatsSchema.js";
import AboutUsSlides from "./models/AboutUsSlidesSchema.js";
import AboutUs from "./models/AboutUsSchema.js";
import Footer from "./models/FooterSchema.js";
import FooterSocialLinks from "./models/FooterSocialLinksSchema.js";
import Seo from "./models/SeoSchema.js";
import StaticSeo from "./models/StaticSeo.js";
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

    const StatsData = [
      { StatsNumber: "1+", StatsLabel: "Projects Completed" },

      { StatsNumber: "2+", StatsLabel: "Years Experience" },

      { StatsNumber: "3+", StatsLabel: "Happy Clients" },
      { StatsNumber: "4+", StatsLabel: "Technologies" },
    ];
    await Stats.insertMany(StatsData);

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
          "Building responsive and performant web applications using modern technologies and best practices. Always You Can Change this default data from dashboard",
      },
      {
        slideImage: "defaulticon2.png",
        slideTitle: "UI/UX Design",
        slideDescription:
          "Creating intuitive and beautiful user interfaces that provide exceptional user experiences. Always You Can Change this default data from dashboard",
      },
      {
        slideImage: "defaulticon3.png",
        slideTitle: "Performance Optimization",
        slideDescription:
          "Optimizing applications for speed, accessibility, and search engine visibility. Always You Can Change this default data from dashboard",
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
    return console.error("❌ Error setting up About Us data:", err);
  }
}

async function setupFooterSocialLinks_DefaultValues() {
  try {
    const existingData = await FooterSocialLinks.findOne();
    if (existingData) {
      return console.log(
        "ℹ️ Social Links data already exists. Skipping seeding."
      );
    }

    const FooterSocialLinksData = [
      {
        SocialIcon: "Facebook",
        SocialLink: "https://www.facebook.com/yourprofile",
      },
      {
        SocialIcon: "Twitter",
        SocialLink: "https://www.twitter.com/yourprofile",
      },
      {
        SocialIcon: "Instagram",
        SocialLink: "https://www.instagram.com/yourprofile",
      },
      {
        SocialIcon: "LinkedIn",
        SocialLink: "https://www.linkedin.com/in/yourprofile",
      },
    ];

    await FooterSocialLinks.insertMany(FooterSocialLinksData);
    console.log("✅ Footer Social Links setup completed successfully.");
  } catch (err) {
    console.error("❌ Error setting up Footer Social Links data:", err);
  }
}

async function setupFooter_DefaultValues() {
  try {
    const existingData = await Footer.findOne();
    if (existingData) {
      return console.log(
        "ℹ️ Main Footer data already exists. Skipping seeding."
      );
    }
    const ImportSocialLinks = await FooterSocialLinks.find();

    const FooterData = new Footer({
      FooterTitle: "Portfolio",
      FooterDescription:
        "Crafting digital experiences with passion and precision. Let's build something amazing together.",
      OwnerEmail: "contact@portfolio.com",
      OwnerPhone: "+216 1234567",
      OwnerAddress: "Tunisia, Tn",
      FooterSocialLinks: ImportSocialLinks,
    });

    await FooterData.save();
    console.log("✅ Main Footer data setup completed successfully.");
  } catch (err) {
    return console.error("❌ Error setting up Main Footer Data:", err);
  }
}

async function setupHomeData_DefaultValues() {
  try {
    const existingData = await HomeData.findOne();
    if (existingData) {
      return console.log("ℹ️ Home data already exists. Skipping seeding.");
    }

    const StatsData = await Stats.find();
    const AboutUsData = await AboutUs.findOne();
    const homeData = new HomeData({
      HomeLogo: "defaultlogo.gif",
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

async function setupStaticSeo_DefaultValues() {
  try {
    const existingData = await StaticSeo.findOne();
    if (existingData) {
      return console.log(
        "ℹ️ Static Seo data already exists. Skipping seeding."
      );
    }
    const Static = new StaticSeo({
      Author: "Aziz Kammoun",
      WebsiteName: "",
      LangCode: "en",
      Lang: "English",
      CountryCode: "Tn",
      City: "Tunisia",
      Geographic: "33.8869;9.5375",
      ICBM: "33.8869, 9.5375",
    });

    await Static.save();
    console.log("✅ Static Seo data setup completed successfully.");
  } catch (err) {
    console.error("❌ Error setting up Static Seo data:", err);
  }
}

async function setupSeo_DefaultValues() {
  try {
    const existingData = await Seo.findOne();
    if (existingData) {
      return console.log("ℹ️ Seo data already exists. Skipping seeding.");
    }
    const AddSeo = await Seo.insertMany([
      {
        Page: "home",
        Title: `Welcome to my profile`,
        Description: `Hello! Welcome to my personal profile. Explore my background, experiences, and achievements.`,
        Keywords: [
          "personal profile",
          "portfolio",
          "experience",
          "skills",
          "achievements",
        ],
        SocialTitle: `Welcome to my profile`,
        SocialDescription: `Discover more about my background, experiences, and accomplishments.`,
        PageUrl: `https://www...yourdomain.com`,
        SocialImage: "",
        TwitterTitle: `Welcome to my profile`,
        TwitterDescription: `Explore my profile including experiences, skills, and achievements.`,
        TwitterImage: "",
      },
      {
        Page: "projects",
        Title: `My Projects`,
        Description: `Take a look at the projects and initiatives I have worked on.`,
        Keywords: [
          "projects",
          "work",
          "achievements",
          "portfolio",
          "initiatives",
        ],
        SocialTitle: `My Projects`,
        SocialDescription: `Explore the projects I have completed and the work I am proud of.`,
        PageUrl: `https://www...yourdomain.com/projects`,
        SocialImage: "",
        TwitterTitle: `My Projects`,
        TwitterDescription: `Check out the projects and work I have completed.`,
        TwitterImage: "",
      },
      {
        Page: "skills",
        Title: `My Skills`,
        Description: `Learn about the skills and strengths I have developed over time.`,
        Keywords: ["skills", "abilities", "talents", "strengths", "expertise"],
        SocialTitle: `My Skills`,
        SocialDescription: `Discover the abilities and talents I have honed through experience.`,
        PageUrl: `https://www...yourdomain.com/skills`,

        SocialImage: "",
        TwitterTitle: `My Skills`,
        TwitterDescription: `Explore my core skills, abilities, and areas of expertise.`,
        TwitterImage: "",
      },
      {
        Page: "cv",
        Title: `My CV`,
        Description: `View my curriculum vitae, including experiences, education, and achievements.`,
        Keywords: ["cv", "resume", "experience", "education", "achievements"],
        SocialTitle: `My CV`,
        SocialDescription: `Check my CV to learn about my experiences, education, and accomplishments.`,
        PageUrl: `https://www...yourdomain.com/cv`,
        SocialImage: "",
        TwitterTitle: `My CV`,
        TwitterDescription: `Review my professional CV with details on experience and education.`,
        TwitterImage: "",
      },
      {
        Page: "contact",
        Title: `Contact Me`,
        Description: `Get in touch with me for questions, collaborations, or networking.`,
        Keywords: [
          "contact",
          "connect",
          "networking",
          "collaboration",
          "message",
        ],
        SocialTitle: `Contact Me`,
        SocialDescription: `Reach out for inquiries, collaborations, or opportunities.`,
        PageUrl: `https://www...yourdomain.com/contact`,
        SocialImage: "",
        TwitterTitle: `Contact Me`,
        TwitterDescription: `Connect with me for questions, networking, or collaboration opportunities.`,
        TwitterImage: "",
      },
    ]);
    console.log("✅ Seo data setup completed successfully.");
  } catch (err) {
    console.error("❌ Error setting up Seo data:", err);
  }
}

async function initializeData() {
  await setupStats_DefaultValues();
  await setupAboutSlides_DefaultValues();
  await setupAboutUs_DefaultValues();
  await setupFooterSocialLinks_DefaultValues();
  await setupFooter_DefaultValues();
  await setupHomeData_DefaultValues();
  await setupStaticSeo_DefaultValues();
  await setupSeo_DefaultValues();
  mongoose.connection.close;
  process.exit(0);
}
initializeData();
