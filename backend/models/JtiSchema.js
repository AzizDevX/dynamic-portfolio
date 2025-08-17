import mongoose from "mongoose";
const JtiSchema = mongoose.Schema(
  {
    AdminObjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    Jti: {
      type: String,
      required: true,
      unique: true,
    },
    ip: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);
JtiSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
const AdminJti = mongoose.model("AdminJti", JtiSchema);
export default AdminJti;
