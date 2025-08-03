import express from "express";
import dotenv from "dotenv";
import dbconnection from "./config/dbConnect.js";
import AddProjectRouter from "./routers/AddProject.js";
import DeleteProject from "./routers/DeleteProject.js";
import AdminLogin from "./routers/auth.js";
import cookieParser from "cookie-parser";
import MainHomeData from "./routers/ShowHomeData.js";
const app = express();
app.use(cookieParser());
app.use(express.json());
dotenv.config();
dbconnection();
const port = process.env.port;

app.get("/", (req, res) => {
  res.send("Server Alive");
});

app.use("/", AdminLogin);
app.use("/", MainHomeData);
app.use("/api/", AddProjectRouter);
app.use("/api/", DeleteProject);

app.listen(port, () => {
  console.log(`Server Alive At port ${port}`);
});
