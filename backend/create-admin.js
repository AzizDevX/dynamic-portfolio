import dotenv from "dotenv";
import bcrypt from "bcrypt";
import readline from "readline";
import dbconnection from "./config/dbConnect.js";
import Admin from "./models/AdminSchema.js";
import mongoose from "mongoose";
dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const adminData = {
  UserName: "",
  Password: "",
};

async function createAdmin() {
  try {
    await dbconnection();
    const AvalibleAdmin = await Admin.findOne({ role: "admin" });
    if (AvalibleAdmin) {
      rl.question(
        "XXX Already an admin exists XXX\nDo you want to delete and recreate it? (y/n):",
        (response) => {
          if (response === "y" || response === "Y") {
            return CreateUserName();
          } else if (response === "n" || response === "N") {
            console.log("❌ Exit without changes");
            mongoose.connection.close();
            return process.exit(0);
          } else {
            console.log("⚠️ Only valid inputs LETTER: y or n");
            mongoose.connection.close();
            return process.exit(0);
          }
        }
      );
    }

    const CreateUserName = async () => {
      rl.question("Admin UserName (min 4 characters): ", (user) => {
        if (user.length < 4 || user.length > 20) {
          console.log(
            " --- ⚠️ Username must be at least 4 characters And Less Than 20 Char. ---"
          );
          return CreateUserName();
        } else {
          adminData.UserName = user;
          CreateUserPass();
        }
      });
    };

    const CreateUserPass = async () => {
      rl.question("Admin Password (min 6 characters): ", (pass) => {
        if (pass.length < 6 || pass.length > 50) {
          console.log(
            " --- ⚠️ Password must be at least 6 characters And Less Than 50 char. ---"
          );
          return CreateUserPass();
        } else {
          rl.close();
          adminData.Password = pass;
          SaveAdmin();
        }
      });
    };

    const SaveAdmin = async () => {
      await Admin.deleteMany({});
      console.log("--- All existing admins deleted And Saveing New Admin.....");

      const salt = await bcrypt.genSalt(14);
      const HashPassword = await bcrypt.hash(adminData.Password, salt);

      const SaveNewAdmin = new Admin({
        userName: adminData.UserName,
        password: HashPassword,
        role: "admin",
      });

      const IsSaved = await SaveNewAdmin.save();
      if (!IsSaved) {
        console.log("❌ Error occurred");
        mongoose.connection.close();
        return process.exit(0);
      } else {
        console.log("✅ New admin created successfully.");
        mongoose.connection.close();
        return process.exit(0);
      }
    };

    CreateUserName();
  } catch (err) {
    console.log("❌ Something Wrong", err);
    rl.close();
  }
}
createAdmin();
