import mongoose from "mongoose";
import BlockHistory from "../models/BlockHistorySchema.js";
import crypto from "crypto";

const RATE_LIMIT = {
  POINTS: 3, // Reduced to 3 for better security
  DURATION: 3600, // per 1 hour (in seconds)
};

const BLOCK_DURATIONS = [
  2 * 60 * 60, // 2h first strike
  12 * 60 * 60, // 12h second strike
  48 * 60 * 60, // 48h third strike
  7 * 24 * 60 * 60, // 7 days fourth strike
  Infinity, // forever
];

const memoryStore = new Map();
const suspiciousPatterns = new Map();

setInterval(() => {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT.DURATION * 1000;

  for (const [key, requests] of memoryStore.entries()) {
    const validRequests = requests.filter(
      (timestamp) => timestamp > windowStart
    );
    if (validRequests.length === 0) {
      memoryStore.delete(key);
    } else {
      memoryStore.set(key, validRequests);
    }
  }

  const dayStart = now - 24 * 60 * 60 * 1000;
  for (const [key, timestamp] of suspiciousPatterns.entries()) {
    if (timestamp < dayStart) {
      suspiciousPatterns.delete(key);
    }
  }
}, 10 * 60 * 1000);

function generateFingerprint(req) {
  const components = [
    req.ip || "unknown",
    req.headers?.["user-agent"] || "unknown",
    req.headers?.["accept-language"] || "unknown",
    req.headers?.["accept-encoding"] || "unknown",
    req.headers?.["accept"] || "unknown",
    req.connection?.remotePort || "unknown",
  ];

  return crypto
    .createHash("sha256")
    .update(components.join("|"))
    .digest("hex")
    .substring(0, 16);
}

function getTrackingKeys(req) {
  const ip = req.ip;
  const email = req.body?.address || req.body?.email;
  const fingerprint = generateFingerprint(req);
  const subnet = ip ? ip.split(".").slice(0, 3).join(".") : null; // /24 subnet

  const keys = [];

  if (ip) keys.push(`ip_${ip}`);
  if (email) keys.push(`email_${email}`);
  keys.push(`fp_${fingerprint}`);

  if (subnet) keys.push(`subnet_${subnet}`);

  return keys;
}

function detectSuspiciousBehavior(req, keys) {
  const now = Date.now();
  const ip = req.ip;
  const email = req.body?.address || req.body?.email;
  const userAgent = req.headers?.["user-agent"];

  let suspiciousScore = 0;

  if (email) {
    const emailPattern = `email_pattern_${email}`;
    if (!suspiciousPatterns.has(emailPattern)) {
      suspiciousPatterns.set(emailPattern, { ips: new Set(), firstSeen: now });
    }

    const emailData = suspiciousPatterns.get(emailPattern);
    emailData.ips.add(ip);

    if (emailData.ips.size >= 3 && now - emailData.firstSeen < 3600000) {
      suspiciousScore += 3;
    }
  }

  if (ip) {
    const ipPattern = `ip_pattern_${ip}`;
    if (!suspiciousPatterns.has(ipPattern)) {
      suspiciousPatterns.set(ipPattern, { agents: new Set(), firstSeen: now });
    }

    const ipData = suspiciousPatterns.get(ipPattern);
    ipData.agents.add(userAgent);

    if (ipData.agents.size >= 3 && now - ipData.firstSeen < 3600000) {
      suspiciousScore += 2;
    }
  }

  if (userAgent) {
    const suspicious = [
      "curl",
      "wget",
      "python",
      "bot",
      "crawler",
      "scraper",
      "insomnia",
      "httpie",
    ];

    if (suspicious.some((s) => userAgent.toLowerCase().includes(s))) {
      suspiciousScore += 2;
    }
  }

  // Check for missing common headers
  if (!req.headers?.["accept-language"]) suspiciousScore += 1;
  if (!req.headers?.["accept-encoding"]) suspiciousScore += 1;

  return suspiciousScore;
}

function checkMemoryRateLimit(keys, suspiciousScore) {
  const keyString = keys.join("|");
  const now = Date.now();
  const windowStart = now - RATE_LIMIT.DURATION * 1000;

  if (!memoryStore.has(keyString)) {
    memoryStore.set(keyString, []);
  }

  const requests = memoryStore.get(keyString);
  const validRequests = requests.filter((timestamp) => timestamp > windowStart);

  const effectiveLimit = suspiciousScore >= 3 ? 1 : RATE_LIMIT.POINTS;

  if (validRequests.length >= effectiveLimit) {
    return { exceeded: true, count: validRequests.length, suspiciousScore };
  }

  validRequests.push(now);
  memoryStore.set(keyString, validRequests);
  return { exceeded: false, count: validRequests.length, suspiciousScore };
}

async function checkDatabaseBlocks(keys) {
  if (mongoose.connection.readyState !== 1) return null;

  try {
    const blocks = await BlockHistory.find({
      key: { $in: keys },
      lastBlockedAt: { $exists: true },
    }).lean();

    const now = Date.now();
    const expiredKeys = [];

    for (const block of blocks) {
      const strikes = block.strikes || 1;
      const blockDuration =
        BLOCK_DURATIONS[Math.min(strikes - 1, BLOCK_DURATIONS.length - 1)];

      if (blockDuration === Infinity) {
        return {
          blocked: true,
          permanent: true,
          key: block.key,
          strikes: block.strikes,
        };
      }

      const elapsed = (now - new Date(block.lastBlockedAt).getTime()) / 1000;

      if (elapsed < blockDuration) {
        const remainingSeconds = blockDuration - elapsed;
        return {
          blocked: true,
          permanent: false,
          key: block.key,
          strikes: block.strikes,
          remainingSeconds,
        };
      } else {
        expiredKeys.push(block.key);
      }
    }

    if (expiredKeys.length > 0) {
      await BlockHistory.updateMany(
        { key: { $in: expiredKeys } },
        { $unset: { lastBlockedAt: 1 } }
      );
    }

    return null;
  } catch (error) {
    console.error("Error checking database blocks:", error);
    return null;
  }
}

async function applyStrikes(keys, suspiciousScore) {
  if (mongoose.connection.readyState !== 1) return null;

  try {
    const existingBlocks = await BlockHistory.find(
      { key: { $in: keys } },
      { key: 1, strikes: 1 }
    ).lean();

    const maxStrikes = Math.max(
      0,
      ...existingBlocks.map((b) => b.strikes || 0)
    );

    const strikeMultiplier = suspiciousScore >= 5 ? 2 : 1;
    const newStrikes = Math.min(5, maxStrikes + strikeMultiplier);

    // Update all keys with new strikes
    const updatePromises = keys.map((key) =>
      BlockHistory.findOneAndUpdate(
        { key },
        {
          strikes: newStrikes,
          lastBlockedAt: new Date(),
          suspiciousScore: suspiciousScore,
        },
        { upsert: true, new: true }
      )
    );

    const results = await Promise.allSettled(updatePromises);
    const successfulUpdate = results.find(
      (r) => r.status === "fulfilled"
    )?.value;

    if (successfulUpdate) {
      const blockDuration =
        BLOCK_DURATIONS[Math.min(newStrikes - 1, BLOCK_DURATIONS.length - 1)];

      if (suspiciousScore >= 3) {
        console.warn(
          `🚨 Suspicious activity blocked: ${keys[0]}, score: ${suspiciousScore}, strikes: ${newStrikes}`
        );
      }

      return {
        strikes: newStrikes,
        blockDuration,
        permanent: blockDuration === Infinity,
        suspiciousScore,
      };
    }

    return null;
  } catch (error) {
    console.error("Error applying strikes:", error);
    return null;
  }
}

function formatTime(seconds) {
  if (seconds === Infinity) return "permanently";

  const hours = Math.ceil(seconds / 3600);
  const minutes = Math.ceil(seconds / 60);

  return hours >= 1 ? `${hours} hours` : `${minutes} minutes`;
}

export async function contactLimiter(req, res, next) {
  try {
    const keys = getTrackingKeys(req);
    const suspiciousScore = detectSuspiciousBehavior(req, keys);

    if (suspiciousScore >= 7) {
      await applyStrikes(keys, suspiciousScore);
      return res.status(429).json({
        message: "Request blocked due to suspicious activity.",
      });
    }

    // Check database for existing blocks
    const blockStatus = await checkDatabaseBlocks(keys);

    if (blockStatus?.blocked) {
      if (blockStatus.permanent) {
        return res.status(429).json({
          message: "You are permanently blocked from sending contact messages.",
        });
      } else {
        const timeText = formatTime(blockStatus.remainingSeconds);
        return res.status(429).json({
          message: `You are blocked. Try again after ${timeText}.`,
        });
      }
    }

    const rateLimitResult = checkMemoryRateLimit(keys, suspiciousScore);

    if (!rateLimitResult.exceeded) {
      return next();
    }

    const strikeResult = await applyStrikes(keys, suspiciousScore);

    if (strikeResult) {
      if (strikeResult.permanent) {
        return res.status(429).json({
          message: "Permanently blocked due to repeated violations.",
        });
      } else {
        const timeText = formatTime(strikeResult.blockDuration);
        return res.status(429).json({
          message: `Rate limit exceeded. Blocked for ${timeText}. Strike ${strikeResult.strikes}/5.`,
        });
      }
    }

    return res.status(429).json({
      message: "Rate limit exceeded. Please try again later.",
    });
  } catch (error) {
    console.error("❌ Contact limiter error:", error);
    return next();
  }
}

export default contactLimiter;
