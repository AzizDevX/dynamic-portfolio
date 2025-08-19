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
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BACKEND_PORT = process.env.BACKEND_PORT || 5000;
const FRONTEND_PORT = process.env.FRONTEND_PORT || 3000;

const ipv6Local = `http://[::1]:${FRONTEND_PORT}`;
const ipv4Local = `http://127.0.0.1:${FRONTEND_PORT}`;
const Hostname = `http://localhost:${FRONTEND_PORT}`;
const CustomDomain = process.env.CUSTOM_DOMAIN || "";

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(
  cors({
    origin: [ipv6Local, ipv4Local, Hostname, CustomDomain],
    credentials: true,
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
app.use("/api/", EditHomeData);
app.use("/api/", EditAboutData);
app.use("/api/", AddProjectRouter);
app.use("/api/", EditSkills);
app.use("/api/", EdirCv);
app.use("/api/", EditFooter);
app.use("/api/", Contact);

app.listen(BACKEND_PORT, () => {
  console.log(`Server Alive At port ${BACKEND_PORT}`);
});
