import mongoose from "mongoose";
const homeDataSchema = mongoose.Schema({
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
  Projects_Counting: {
    type: Number,
    default: 0,
  },
  Experience: {
    type: String,
  },
  Technologies_Counting: {
    type: Number,
    default: 0,
  },
});
const HomeData = mongoose.model("HomePageData", homeDataSchema);
export default HomeData;
