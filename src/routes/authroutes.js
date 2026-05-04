const router = require("express").Router();
const ctrl = require("../controllers/authcontroller");

router.post("/signup", ctrl.signup);
router.post("/login", ctrl.login);
router.post("/verify", ctrl.verifyOTP);

module.exports = router;