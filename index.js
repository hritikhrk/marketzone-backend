// import everything here
const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
require("express-validator");
//for cross origin resourse sharing

//import config
const config = require("./config");

//app
const app = express();
app.use(express.json());

//database
const mongodbUrl = config.MONGODB_URL.URL;
const mongodbHost = config.MONGODB_URL.HOST;
const connectDB = async () => {
  try {
    await mongoose.connect(mongodbUrl);
    console.log(`Database Connected Successfully: ${mongodbHost}`);
  } catch (err) {
    console.log("Database Connection Error");
    console.log(err);
    process.exit(1);
  }
};
connectDB();

//import routes
const categoryRouter = require("./routes/category.route");
const authRouter = require("./routes/auth.route");
const userRouter = require("./routes/user.route");
const productRouter = require("./routes/product.route");
const orderRouter = require("./routes/order.route");

//routes middleware
app.use("/api", categoryRouter);
app.use("/api", authRouter);
app.use("/api", userRouter);
app.use("/api", productRouter);
app.use("/api", orderRouter);

//handle request here
app.get("/", (req, res) => {
  res.json({
    message: "Market Backend is UP",
    isRunning: true,
  });
});

//creating server and running
app.listen(config.PORT, () =>
  console.log(`Server is running at ${config.URL}`)
);
