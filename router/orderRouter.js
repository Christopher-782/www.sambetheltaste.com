// routes/orders.js
const express = require("express");
const router = express.Router();
const Order = require("../models/orders");
const auth = require("../middleware/authmiddleware"); // must set req.user
const customorderController = require("../controllers/customerordercontroller");

// POST /orders - place a new order
router.post("/", auth, async (req, res) => {
  try {
    const {
      products,
      subtotal,
      deliveryFee,
      tax,
      totalAmount,
      deliveryAddress,
    } = req.body;

    if (!products || products.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const order = await Order.create({
      user: req.user._id, // always a registered user
      products,
      subtotal,
      deliveryFee,
      tax,
      totalAmount,
      deliveryAddress,
    });

    res.status(201).json({
      success: true,
      orderId: order._id,
      order,
      message: "Order placed successfully",
    });
  } catch (err) {
    console.error("Order creation failed:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
