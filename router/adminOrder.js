const express = require("express");
const router = express.Router();
const Order = require("../models/orders");
const auth = require("../middleware/authmiddleware");

// Get all orders (admin)
router.get("/orders", auth, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name username email phoneNumber address")
      // get user details
      .sort({ date: -1 });

    res.json({ success: true, orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/orders/:id", auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    order.status = req.body.status;
    await order.save();
    res.json({ success: true, order });
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
