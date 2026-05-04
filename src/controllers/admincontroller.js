const admins = require("../data/admins.json");

exports.login = (req, res) => {
  const { username, password } = req.body;

  const admin = admins.find(
    a => a.username === username && a.password === password
  );

  if (!admin) return res.sendStatus(401);

  res.json({ msg: "Admin logged in" });
};