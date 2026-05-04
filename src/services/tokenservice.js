const jwt = require("jsonwebtoken");

exports.access = (user) =>
  jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "10m" });

exports.refresh = (user) =>
  jwt.sign({ id: user._id }, process.env.REFRESH_SECRET, { expiresIn: "7d" });