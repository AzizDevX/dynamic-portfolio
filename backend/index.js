import express from "express";
import dotenv from "dotenv";
import dbconnection from "./config/dbConnect.js";
import AddProjectRouter from "./routers/EditProjectData.js";
import AdminLogin from "./routers/auth.js";
import cookieParser from "cookie-parser";
import MainHomeData from "./routers/ShowHomeData.js";
import EditHomeData from "./routers/EditHomeData.js";
import AdminDashboardSecurity from "./routers/AdminDashboard_securityRule.js";
import EditAboutData from "./routers/EditAboutData.js";
import EditFooter from "./routers/EditFooter.js";
import EditSkills from "./routers/EditSkillsData.js";
import EdirCv from "./routers/EditCv.js";
import Contact from "./routers/Contact.js";
import EditSeo from "./routers/EditSeo.js";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BACKEND_PORT = process.env.BACKEND_PORT || 5000;
const FRONTEND_PORT = process.env.FRONTEND_PORT || 3000;

const cleanCustomDomain = () => {
  // Check if CUSTOM_DOMAIN exists and is not empty after trimming
  if (!process.env.CUSTOM_DOMAIN || !process.env.CUSTOM_DOMAIN.trim()) {
    return "";
  }

  let domain = process.env.CUSTOM_DOMAIN.trim() // Remove leading/trailing spaces
    .replace(/\s+/g, "") // Remove any internal spaces
    .toLowerCase(); // Normalize to lowercase

  // Remove trailing slash if present
  if (domain.endsWith("/")) {
    domain = domain.slice(0, -1);
  }

  // If after cleaning it's empty, return empty string
  if (!domain) {
    return "";
  }

  return domain;
};

const customDomain = cleanCustomDomain();

console.log("🔧 CORS Configuration:");
console.log(`📝 Custom Domain: "${customDomain}"`);
console.log(
  `🚀 Mode: ${
    customDomain
      ? "PRODUCTION (Custom Domain Only)"
      : "DEVELOPMENT (Localhost Allowed)"
  }`
);

const app = express();

// Apply security headers middleware before other middlewares
app.use((req, res, next) => {
  // Set Cache-Control headers
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");

  // Set Referrer Policy
  res.setHeader("Referrer-Policy", "no-referrer-when-downgrade");

  // Additional security headers
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");

  next();
});

app.use(cookieParser());
app.use(express.json());

// SINGLE CORS configuration
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, curl, postman, etc.)
      if (!origin) return callback(null, true);

      // If no custom domain is set, allow localhost variations
      if (!customDomain) {
        const localhostOrigins = [
          `http://[::1]:${FRONTEND_PORT}`,
          `http://127.0.0.1:${FRONTEND_PORT}`,
          `http://localhost:${FRONTEND_PORT}`,
        ];

        if (localhostOrigins.includes(origin)) {
          return callback(null, true);
        }

        // Allow flexible localhost matching
        if (
          origin.match(/^http:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/)
        ) {
          return callback(null, true);
        }
      } else {
        // Production mode: only allow custom domain
        if (origin === customDomain) {
          return callback(null, true);
        }

        // Allow variations of custom domain
        try {
          const customUrl = new URL(
            "https://" + customDomain.replace(/^https?:\/\//, "")
          );
          const originUrl = new URL(origin);

          if (
            originUrl.hostname === customUrl.hostname ||
            originUrl.hostname.endsWith("." + customUrl.hostname) ||
            customUrl.hostname.endsWith("." + originUrl.hostname)
          ) {
            return callback(null, true);
          }
        } catch (e) {
          // Invalid URL format, reject
        }
      }

      // Reject all other origins
      return callback(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Origin",
      "X-Requested-With",
      "Content-Type",
      "Accept",
      "Authorization",
      "Cache-Control",
      "Cookie",
      "Pragma",
      "X-Forwarded-For",
      "X-Real-IP",
      "CF-Connecting-IP",
    ],
    exposedHeaders: [
      "Content-Type",
      "Content-Length",
      "Authorization",
      "Set-Cookie",
    ],
    optionsSuccessStatus: 200,
    preflightContinue: false,
    maxAge: 86400,
  })
);

dbconnection();
app.set("trust proxy", true); // for cloudflare or etc ..

app.get("/", (req, res) => {
  res.send("Server Alive");
});

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/", MainHomeData);
app.use("/auth/", AdminLogin);
app.use("/api/", AdminDashboardSecurity);
app.use("/api/", EditSeo);
app.use("/api/", EditHomeData);
app.use("/api/", EditAboutData);
app.use("/api/", AddProjectRouter);
app.use("/api/", EditSkills);
app.use("/api/", EdirCv);
app.use("/api/", EditFooter);
app.use("/api/", Contact);

app.listen(BACKEND_PORT, "127.0.0.1", () => {
  console.log(`Server Alive At port ${BACKEND_PORT}`);
});
