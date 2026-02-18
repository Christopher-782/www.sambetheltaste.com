const CustomOrder = require("../models/customorder");

exports.customerorder = async (req, res) => {
  try {
    const { fullnameInput, phonenumberInput, orderInput } = req.body;

    const newOrder = await CustomOrder.create({
      name: fullnameInput,
      phoneNumber: phonenumberInput,
      order: orderInput,
    });

    console.log(newOrder);

    res.status(201).json({
      success: true,
      message: "Custom order received successfully",
      data: newOrder,
    });
  } catch (err) {
    console.log("Failed to receive", err.message);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// GET ALL ORDERS
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await CustomOrder.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
