import express from "express";
import dotenv from "dotenv";
import dbconnection from "./config/dbConnect.js";
import AddProjectRouter from "./routers/AddProject.js";
const app = express();
app.use(express.json());
dotenv.config();
dbconnection();
const port = process.env.port;

app.get("/", (req, res) => {
  res.send("Server Alive");
});

app.use("/api/admin", AddProjectRouter);

app.listen(port, () => {
  console.log(`Server Alive At port ${port}`);
});
