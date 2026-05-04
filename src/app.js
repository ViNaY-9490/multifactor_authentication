const express = require("express");
const app = express();
const cors = require("cors");
const auth = require("./middlewares/authmiddleware");
app.use(cors());

app.use(express.json());


app.get("/protected", auth, (req, res) => {
  res.json({
    msg: "You are authenticated",
    user: req.user
  });
});

app.use("/auth", require("./routes/authRoutes"));
app.use("/team", require("./routes/teamRoutes"));
app.use("/admin", require("./routes/adminRoutes"));

module.exports = app;