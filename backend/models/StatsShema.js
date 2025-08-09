import mongoose from "mongoose";

const StatsSchema = mongoose.Schema(
  {
    StatsNumber: {
      type: String,
      required: true,
    },
    StatsLabel: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Stats = mongoose.model("Stats", StatsSchema);
export default Stats;
