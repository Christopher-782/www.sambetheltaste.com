const dotenv = require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const axios = require("axios");
const path = require("path");
const app = express();
const userRouter = require("./router/userRouter");
const productRoutes = require("./router/productsRouter");
const orderRoutes = require("./router/orderRouter");
const loginRouter = require("./router/login");
const adminrouter = require("./router/adminOrder");
const authMiddleware = require("./middleware/authmiddleware");
const adminRouter = require("./router/adminuser");
mongoose
  .connect(process.env.MONGO)
  .then(() => {
    console.log("MONGO IS CONNECTED");
  })
  .catch((err) => {
    console.log(`MONGO CONNECTION FAILED:`, err.message);
  });

app.use(express.json());
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});
app.use("/", userRouter);
app.use("/", loginRouter);
app.use("/", productRoutes);
app.use("/orders", orderRoutes);
app.use("/", adminrouter);

app.listen(process.env.PORT, () => {
  console.log("server is running");
});
