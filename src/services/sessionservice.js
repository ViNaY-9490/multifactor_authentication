const Session = require("../models/session");
const crypto = require("crypto");

// 🔐 Hash helper (never store raw tokens)
const hash = (value) => {
  return crypto.createHash("sha256").update(value).digest("hex");
};

// 🆕 Create session (after login step 1)
exports.createSession = async ({
  userId,
  otp,
  challengeToken,
  ip,
  userAgent
}) => {
  return await Session.create({
    userId,
    otp,
    otpExpiry: Date.now() + 5 * 60 * 1000, // 5 mins
    challengeToken,
    ip,
    userAgent,
    trustLevel: "low"
  });
};

// ✅ Verify OTP + Challenge (step 2 login)
exports.verifySession = async ({
  userId,
  otp,
  challengeToken
}) => {
  const session = await Session.findOne({
    userId,
    challengeToken
  });

  if (!session) {
    throw new Error("Invalid session or challenge token");
  }

  if (session.otp !== otp) {
    throw new Error("Invalid OTP");
  }

  if (Date.now() > session.otpExpiry) {
    throw new Error("OTP expired");
  }

  // Promote trust level after verification
  session.trustLevel = "high";

  await session.save();

  return session;
};

// 🔁 Attach refresh token (after successful login)
exports.attachRefreshToken = async (sessionId, refreshToken) => {
  const hashed = hash(refreshToken);

  return await Session.findByIdAndUpdate(
    sessionId,
    { refreshToken: hashed },
    { new: true }
  );
};

// 🔄 Rotate refresh token
exports.rotateRefreshToken = async (oldToken, newToken) => {
  const oldHashed = hash(oldToken);
  const newHashed = hash(newToken);

  const session = await Session.findOne({
    refreshToken: oldHashed
  });

  if (!session) {
    throw new Error("Invalid refresh token");
  }

  session.refreshToken = newHashed;

  await session.save();

  return session;
};

// 🔍 Validate refresh token
exports.validateRefreshToken = async (token) => {
  const hashed = hash(token);

  const session = await Session.findOne({
    refreshToken: hashed
  });

  if (!session) {
    throw new Error("Invalid or expired session");
  }

  return session;
};

// 🚨 Detect anomaly (basic)
exports.checkAnomaly = (session, { ip, userAgent }) => {
  let risk = 0;

  if (session.ip !== ip) risk += 40;
  if (session.userAgent !== userAgent) risk += 30;

  return risk;
};

// 🚪 Logout single session
exports.deleteSession = async (sessionId) => {
  return await Session.findByIdAndDelete(sessionId);
};

// 🚪 Logout all sessions of a user
exports.deleteAllUserSessions = async (userId) => {
  return await Session.deleteMany({ userId });
};

// 📊 Get active sessions (for UI / dashboard)
exports.getUserSessions = async (userId) => {
  return await Session.find({ userId }).select(
    "ip userAgent trustLevel createdAt"
  );
};