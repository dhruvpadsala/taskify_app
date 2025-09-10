const express = require("express");
const bodyParser = require("body-parser");
const masterRoutes = require("./routes/masterRoutes");
const registerRoute = require("./routes/authRoute");

const app = express();
app.use(bodyParser.json());
app.use(express.json());

app.use("/master", masterRoutes);
app.use("/auth", registerRoute);

module.exports = app;
