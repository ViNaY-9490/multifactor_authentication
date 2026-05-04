const Team = require("../models/team");

exports.createTeam = async (req, res) => {
  const team = await Team.create({
    name: req.body.name,
    members: [req.user.id]
  });
  res.json(team);
};