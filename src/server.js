const app = require("./app");

require("dotenv").config();

const PORT = process.env.PORT || 5000;

app.use(require("./middlewares/errorHandler"));

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
