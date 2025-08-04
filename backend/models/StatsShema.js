import mongoose from "mongoose";

const StatsSchema = mongoose.Schema({
  Stats: [
    {
      StatsNumber: {
        type: String,
      },
      StatsLabel: {
        type: String,
      },
    },
  ],
});

const Stats = mongoose.model("Stats", StatsSchema);
export default Stats;
