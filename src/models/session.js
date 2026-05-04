const mongoose = require("mongoose");

module.exports = mongoose.model("Session", {
  userId: mongoose.Schema.Types.ObjectId,
  refreshToken: String,
  challengeToken: String,
  otp: String,
  otpExpiry: Date
});