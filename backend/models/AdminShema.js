import mongoose from "mongoose";
const adminShema = mongoose.Schema({
  userName: {
    type: String,
    require: true,
    unique: true,
    minlenth: 4,
    maxlenth: 20,
  },
  password: {
    type: String,
    require: true,
    minlenth: 6,
    maxlenth: 20,
  },
  role: {
    type: String,
    require: true,
    enum: ["admin"],
    default: "admin",
  },
});
const Admin = mongoose.model("Admin", adminShema);
export default Admin;
