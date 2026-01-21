const express = require("express");
const bodyParser = require("body-parser");
const masterRoutes = require("./routes/masterRoutes");
const registerRoute = require("./routes/authRoute");
const companyRoute = require("./routes/companyRoute");
const projectRoute = require("./routes/projectRoute.js");

const app = express();
app.use(bodyParser.json());
app.use(express.json());

app.use("/master", masterRoutes);
app.use("/auth", registerRoute);
app.use("/company", companyRoute);
app.use("/taskify", projectRoute);

module.exports = app;
