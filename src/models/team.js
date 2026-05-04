const mongoose = require("mongoose");

module.exports = mongoose.model("Team", {
  name: String,
  members: [mongoose.Schema.Types.ObjectId]
});