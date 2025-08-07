import mongoose from "mongoose";
const homeDataSchema = mongoose.Schema({
  HomeLogo: {
    type: String,
  },
  DisplayName: {
    type: String,
  },
  MainRoles: {
    type: [String],
  },
  description: {
    type: String,
  },
  Clients_Counting: {
    type: Number,
    default: 0,
  },
  Rateing: {
    type: Number,
    default: 0,
  },
  Stats: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Stats",
  },
  AboutUs: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AboutUs",
  },
});
const HomeData = mongoose.model("HomePageData", homeDataSchema);
export default HomeData;
