import mongoose from "mongoose";
import BlockHistory from "../models/BlockHistorySchema.js";
import crypto from "crypto";

const RATE_LIMIT = {
  POINTS: 3,
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

// Known VPN/Proxy IP ranges (add more as needed)
const VPN_INDICATORS = [
  // Common VPN providers
  "vpn",
  "proxy",
  "tor",
  "anonymizer",
  // Data center hosting
  "amazonaws",
  "digitalocean",
  "linode",
  "vultr",
  // Known VPN ASNs patterns
  "ovh",
  "hetzner",
];

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

// Enhanced fingerprint with more browser characteristics
function generateFingerprint(req) {
  const components = [
    req.ip || "unknown",
    req.headers?.["user-agent"] || "unknown",
    req.headers?.["accept-language"] || "unknown",
    req.headers?.["accept-encoding"] || "unknown",
    req.headers?.["accept"] || "unknown",
    // Additional fingerprinting data
    req.headers?.["sec-ch-ua"] || "unknown", // Browser hints
    req.headers?.["sec-ch-ua-mobile"] || "unknown",
    req.headers?.["sec-ch-ua-platform"] || "unknown",
  ];

  return crypto
    .createHash("sha256")
    .update(components.join("|"))
    .digest("hex")
    .substring(0, 16);
}

// NEW: Detect if request is coming from VPN/Proxy
function detectVPNProxy(req) {
  const ip = req.ip;
  const headers = req.headers;

  let vpnScore = 0;

  // Check for proxy headers
  const proxyHeaders = [
    "x-forwarded-for",
    "x-real-ip",
    "via",
    "forwarded",
    "x-proxy-id",
    "x-proxyuser-ip",
  ];

  for (const header of proxyHeaders) {
    if (headers[header]) {
      vpnScore += 1;
    }
  }

  // Check hostname for VPN indicators (requires reverse DNS lookup in production)
  // For now, check if IP is in common VPN ranges
  // You could integrate with VPN detection APIs like:
  // - IPHub.info
  // - GetIPIntel.net
  // - IP2Proxy

  // Check for missing browser headers (VPNs/proxies sometimes strip these)
  if (!headers["accept-language"]) vpnScore += 1;
  if (!headers["sec-ch-ua"]) vpnScore += 1;

  return vpnScore;
}

// NEW: Enhanced email validation
function validateEmail(email) {
  if (!email) return { valid: false, suspicious: 0 };

  let suspiciousScore = 0;

  // Check for disposable email domains
  const disposableDomains = [
    "tempmail",
    "throwaway",
    "10minutemail",
    "guerrillamail",
    "mailinator",
    "maildrop",
    "trashmail",
    "yopmail",
  ];

  const domain = email.split("@")[1]?.toLowerCase();
  if (domain && disposableDomains.some((d) => domain.includes(d))) {
    suspiciousScore += 3;
  }

  // Check for suspicious patterns
  if (/\d{5,}/.test(email)) suspiciousScore += 1; // Many numbers
  if (email.length > 50) suspiciousScore += 1; // Very long email
  if ((email.match(/\./g) || []).length > 3) suspiciousScore += 1; // Too many dots

  return { valid: true, suspicious: suspiciousScore };
}

function getTrackingKeys(req) {
  const ip = req.ip;
  const email = req.body?.address || req.body?.email;
  const fingerprint = generateFingerprint(req);
  const subnet = ip ? ip.split(".").slice(0, 3).join(".") : null;

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

  // NEW: Check for VPN/Proxy
  const vpnScore = detectVPNProxy(req);
  suspiciousScore += vpnScore;

  // NEW: Validate email
  if (email) {
    const emailValidation = validateEmail(email);
    suspiciousScore += emailValidation.suspicious;
  }

  // Track email across multiple IPs (VPN hopping detection)
  if (email) {
    const emailPattern = `email_pattern_${email}`;
    if (!suspiciousPatterns.has(emailPattern)) {
      suspiciousPatterns.set(emailPattern, { ips: new Set(), firstSeen: now });
    }

    const emailData = suspiciousPatterns.get(emailPattern);
    emailData.ips.add(ip);

    // If same email from 3+ different IPs in 1 hour = VPN hopping
    if (emailData.ips.size >= 3 && now - emailData.firstSeen < 3600000) {
      suspiciousScore += 4; // Higher penalty for VPN hopping
      console.warn(
        `🚨 VPN hopping detected: ${email} from ${emailData.ips.size} IPs`
      );
    }
  }

  // Track IP pattern
  if (ip) {
    const ipPattern = `ip_pattern_${ip}`;
    if (!suspiciousPatterns.has(ipPattern)) {
      suspiciousPatterns.set(ipPattern, {
        agents: new Set(),
        emails: new Set(),
        firstSeen: now,
      });
    }

    const ipData = suspiciousPatterns.get(ipPattern);
    ipData.agents.add(userAgent);
    if (email) ipData.emails.add(email);

    // Multiple user agents from same IP (device spoofing)
    if (ipData.agents.size >= 3 && now - ipData.firstSeen < 3600000) {
      suspiciousScore += 2;
    }

    // Multiple emails from same IP
    if (ipData.emails.size >= 3 && now - ipData.firstSeen < 3600000) {
      suspiciousScore += 3;
    }
  }

  // Check for bot user agents
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
      "postman",
    ];

    if (suspicious.some((s) => userAgent.toLowerCase().includes(s))) {
      suspiciousScore += 2;
    }
  }

  // Missing common headers
  if (!req.headers?.["accept-language"]) suspiciousScore += 1;
  if (!req.headers?.["accept-encoding"]) suspiciousScore += 1;

  return suspiciousScore;
}

function checkMemoryRateLimit(keys, suspiciousScore) {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT.DURATION * 1000;

  let maxCount = 0;
  let limitExceeded = false;

  // Stricter limits for suspicious requests
  const effectiveLimit =
    suspiciousScore >= 5 ? 1 : suspiciousScore >= 3 ? 2 : RATE_LIMIT.POINTS;

  for (const key of keys) {
    if (!memoryStore.has(key)) {
      memoryStore.set(key, []);
    }

    const requests = memoryStore.get(key);
    const validRequests = requests.filter(
      (timestamp) => timestamp > windowStart
    );

    if (validRequests.length >= effectiveLimit) {
      limitExceeded = true;
      maxCount = Math.max(maxCount, validRequests.length);
    }
  }

  if (limitExceeded) {
    return { exceeded: true, count: maxCount, suspiciousScore };
  }

  for (const key of keys) {
    const requests = memoryStore.get(key);
    const validRequests = requests.filter(
      (timestamp) => timestamp > windowStart
    );
    validRequests.push(now);
    memoryStore.set(key, validRequests);
    maxCount = Math.max(maxCount, validRequests.length);
  }

  return { exceeded: false, count: maxCount, suspiciousScore };
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

    // Harsher penalties for high suspicious scores
    const strikeMultiplier =
      suspiciousScore >= 7 ? 3 : suspiciousScore >= 5 ? 2 : 1;
    const newStrikes = Math.min(5, maxStrikes + strikeMultiplier);

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

    // Block immediately if extremely suspicious
    if (suspiciousScore >= 8) {
      await applyStrikes(keys, suspiciousScore);
      return res.status(429).json({
        message: "Request blocked due to suspicious activity.",
      });
    }

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
