const router = require("express").Router();
const ctrl = require("../controllers/admincontroller");

router.post("/login", ctrl.login);

module.exports = router;