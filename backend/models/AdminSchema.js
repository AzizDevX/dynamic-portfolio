import mongoose from "mongoose";
const adminSchema = mongoose.Schema({
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
    maxlenth: 50,
  },
  role: {
    type: String,
    require: true,
    enum: ["admin"],
    default: "admin",
  },
});
const Admin = mongoose.model("Admin", adminSchema);
export default Admin;
