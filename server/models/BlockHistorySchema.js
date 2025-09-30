import mongoose from "mongoose";

const BlockHistorySchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    strikes: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    lastBlockedAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

BlockHistorySchema.index({ key: 1, lastBlockedAt: 1 });
BlockHistorySchema.index({ key: 1, strikes: 1 });

BlockHistorySchema.index(
  { createdAt: 1 },
  {
    expireAfterSeconds: 30 * 24 * 60 * 60,
    partialFilterExpression: {
      strikes: { $lt: 5 },
      lastBlockedAt: { $exists: false },
    },
  }
);

BlockHistorySchema.statics.getStats = async function () {
  try {
    const totalRecords = await this.countDocuments();
    const currentlyBlocked = await this.countDocuments({
      lastBlockedAt: { $exists: true },
    });
    const permanentBans = await this.countDocuments({
      strikes: 5,
      lastBlockedAt: { $exists: true },
    });

    const strikeDistribution = await this.aggregate([
      {
        $group: {
          _id: "$strikes",
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return {
      totalRecords,
      currentlyBlocked,
      permanentBans,
      strikeDistribution,
    };
  } catch (error) {
    console.error("Error getting stats:", error);
    return null;
  }
};

BlockHistorySchema.statics.cleanupExpired = async function () {
  const BLOCK_DURATIONS = [
    60 * 60,
    6 * 60 * 60,
    24 * 60 * 60,
    7 * 24 * 60 * 60,
    Infinity,
  ];

  try {
    const now = Date.now();
    const blocksToCheck = await this.find({
      lastBlockedAt: { $exists: true },
      strikes: { $lt: 5 },
    }).lean();

    const expiredKeys = [];

    for (const block of blocksToCheck) {
      const strikes = block.strikes || 1;
      const blockDuration =
        BLOCK_DURATIONS[Math.min(strikes - 1, BLOCK_DURATIONS.length - 1)];

      if (blockDuration !== Infinity) {
        const elapsed = (now - new Date(block.lastBlockedAt).getTime()) / 1000;

        if (elapsed > blockDuration) {
          expiredKeys.push(block.key);
        }
      }
    }

    if (expiredKeys.length > 0) {
      await this.updateMany(
        { key: { $in: expiredKeys } },
        { $unset: { lastBlockedAt: 1 } }
      );
    }

    return expiredKeys.length;
  } catch (error) {
    console.error("Cleanup error:", error);
    return 0;
  }
};

export default mongoose.model("BlockHistory", BlockHistorySchema);
