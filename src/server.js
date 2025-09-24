const app = require("./app");

require("dotenv").config();

const PORT = process.env.PORT || 5000;

app.use(require("./middlewares/errorHandler"));
app.use(require("./middlewares/validateAceesToken"));

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
