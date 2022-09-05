const dotenv = require("dotenv");
dotenv.config();

PORT = process.env.PORT || 5000;
MONGODB_URL = { URL: process.env.MONGODB_URL, HOST: "CLOUD" } || {
  URL: "mongodb://localhost:27017/marketzone",
  HOST: "LOCAL",
};
URL = process.env.HOST_URL || "http://localhost:5000";
JWT_SECRET_KEY =
  process.env.JWT_SECRET_KEY || "60963010-08bd-11ed-bee6-df935beb76ca";

module.exports = { PORT, MONGODB_URL, URL, JWT_SECRET_KEY };
