const User = require("../models/user");
const Session = require("../models/session");
const { hash, compare } = require("../utils/hash");
const tokenService = require("../services/tokenservice");
const otpService = require("../services/otpservice");
const mailService = require("../services/mailservice");
const challengeService = require("../services/challengeservice");


// ================= SIGNUP =================
exports.signup = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ✅ Check existing user
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({
        message: "User already exists"
      });
    }

    const user = await User.create({
      email,
      password: await hash(password)
    });

    res.json({
      message: "Signup successful",
      userId: user._id
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server error"
    });
  }
};


// ================= LOGIN STEP 1 =================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "User not found"
      });
    }

    const ok = await compare(password, user.password);

    if (!ok) {
      return res.status(400).json({
        message: "Wrong password"
      });
    }

    const otp = otpService.generate();
    const challenge = challengeService.generateChallenge();

    await Session.create({
      userId: user._id,
      otp,
      otpExpiry: Date.now() + 5 * 60 * 1000, // 5 min
      challengeToken: challenge
    });

    // 🔥 Debug OTP (remove in production)
    console.log("OTP:", otp);

    await mailService.sendOTP(email, otp);

    res.json({
      message: "OTP sent",
      challengeToken: challenge
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server error"
    });
  }
};


// ================= VERIFY OTP =================
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp, challengeToken } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "User not found"
      });
    }

    const session = await Session.findOne({
      userId: user._id,
      challengeToken
    });

    if (!session) {
      return res.status(400).json({
        message: "Invalid challenge token"
      });
    }

    // ✅ OTP check
    if (session.otp !== otp) {
      return res.status(400).json({
        message: "Invalid OTP"
      });
    }

    // ✅ Expiry check
    if (Date.now() > session.otpExpiry) {
      return res.status(400).json({
        message: "OTP expired"
      });
    }

    // 🔐 Generate tokens
    const access = tokenService.access(user);
    const refresh = tokenService.refresh(user);

    // 🔥 Clean used session (IMPORTANT)
    await Session.deleteOne({ _id: session._id });

    res.json({
      message: "Login successful",
      access,
      refresh
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server error"
    });
  }
};