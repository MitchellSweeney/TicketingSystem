const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const router = require("./routes");

const app = express();
const port = process.env.PORT || 3690;

app.use(express.json());
app.use(cors({ origin: true, credentials: true }));
app.use("", router);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = app;
