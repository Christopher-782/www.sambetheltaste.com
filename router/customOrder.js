const customorderSchema = require("../models/customorder");
const customordercontroller = require("../controllers/customerordercontroller");
const express = require("express");
const customorderRouter = express.Router();

customorderRouter.post("/customorders", customordercontroller.customerorder);
customorderRouter.get("/customorders", customordercontroller.getAllOrders);

module.exports = customorderRouter;
