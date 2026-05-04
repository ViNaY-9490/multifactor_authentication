const router = require("express").Router();
const auth = require("../middlewares/authmiddleware");
const ctrl = require("../controllers/teamcontroller");

router.post("/", auth, ctrl.createTeam);

module.exports = router;