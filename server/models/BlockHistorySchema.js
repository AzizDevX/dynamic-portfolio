import mongoose from "mongoose";

const BLOCK_DURATIONS = [
  2 * 60 * 60, // 2 hours - Strike 1
  12 * 60 * 60, // 12 hours - Strike 2
  48 * 60 * 60, // 48 hours - Strike 3
  7 * 24 * 60 * 60, // 7 days - Strike 4
  Infinity, // Forever - Strike 5
];

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
    suspiciousScore: {
      type: Number,
      default: 0,
      min: 0,
    },
    metadata: {
      ip: String,
      email: String,
      userAgent: String,
      blockReason: String,
    },
  },
  {
    timestamps: true,
  }
);

BlockHistorySchema.index({ key: 1, lastBlockedAt: 1 });
BlockHistorySchema.index({ key: 1, strikes: 1 });
BlockHistorySchema.index({ lastBlockedAt: 1, strikes: 1 });

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

    const suspiciousScoreAvg = await this.aggregate([
      {
        $match: { suspiciousScore: { $exists: true, $gt: 0 } },
      },
      {
        $group: {
          _id: null,
          avgScore: { $avg: "$suspiciousScore" },
          maxScore: { $max: "$suspiciousScore" },
        },
      },
    ]);

    return {
      totalRecords,
      currentlyBlocked,
      permanentBans,
      strikeDistribution,
      suspiciousScore: suspiciousScoreAvg[0] || { avgScore: 0, maxScore: 0 },
    };
  } catch (error) {
    console.error("Error getting stats:", error);
    return null;
  }
};

BlockHistorySchema.statics.cleanupExpired = async function () {
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

      if (blockDuration === Infinity) continue;

      const elapsed = (now - new Date(block.lastBlockedAt).getTime()) / 1000;

      if (elapsed > blockDuration) {
        expiredKeys.push(block.key);
      }
    }

    if (expiredKeys.length > 0) {
      const result = await this.updateMany(
        { key: { $in: expiredKeys } },
        { $unset: { lastBlockedAt: 1 } }
      );

      console.log(`✅ Unblocked ${expiredKeys.length} expired blocks`);
      return expiredKeys.length;
    }

    return 0;
  } catch (error) {
    console.error("❌ Cleanup error:", error);
    return 0;
  }
};

BlockHistorySchema.statics.unblock = async function (key) {
  try {
    const result = await this.updateOne(
      { key },
      {
        $unset: { lastBlockedAt: 1 },
        $set: { strikes: 0 },
      }
    );
    return result.modifiedCount > 0;
  } catch (error) {
    console.error("Error unblocking:", error);
    return false;
  }
};

BlockHistorySchema.statics.getBlockInfo = async function (key) {
  try {
    const block = await this.findOne({ key }).lean();

    if (!block || !block.lastBlockedAt) {
      return { blocked: false, key };
    }

    const strikes = block.strikes || 1;
    const blockDuration =
      BLOCK_DURATIONS[Math.min(strikes - 1, BLOCK_DURATIONS.length - 1)];

    if (blockDuration === Infinity) {
      return {
        blocked: true,
        permanent: true,
        strikes,
        key,
      };
    }

    const now = Date.now();
    const elapsed = (now - new Date(block.lastBlockedAt).getTime()) / 1000;
    const remaining = blockDuration - elapsed;

    if (remaining > 0) {
      return {
        blocked: true,
        permanent: false,
        strikes,
        remainingSeconds: remaining,
        key,
      };
    }

    return { blocked: false, expired: true, key };
  } catch (error) {
    console.error("Error getting block info:", error);
    return null;
  }
};

export default mongoose.model("BlockHistory", BlockHistorySchema);
