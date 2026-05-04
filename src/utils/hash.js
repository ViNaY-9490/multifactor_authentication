const bcrypt = require("bcrypt");

exports.hash = (p) => bcrypt.hash(p, 10);
exports.compare = (p, h) => bcrypt.compare(p, h);