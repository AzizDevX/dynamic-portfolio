import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
async function dbconnection() {
  try {
    await mongoose.connect(process.env.Mongo_URL);
    console.log("Db CONNECTED");
  } catch (err) {
    console.log(`DB NOT CONNECTED ${err}`);
  }
}

export default dbconnection;
