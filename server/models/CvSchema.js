import mongoose from "mongoose";
const CvShema = mongoose.Schema({
  Cv: {
    type: String,
    require: true,
    unique: true,
  },
});
const Cv = mongoose.model("Cv", CvShema);
export default Cv;
