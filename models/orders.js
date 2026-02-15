// models/orders.js
const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    products: [
      {
        product: { type: String, required: true },
        quantity: { type: Number, default: 1 },
      },
    ],
    subtotal: { type: Number, required: true },
    deliveryFee: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    deliveryAddress: { type: String, required: true },
    status: { type: String, default: "PENDING" },
  },
  { timestamps: true },
); // <-- adds createdAt and updatedAt automatically

module.exports = mongoose.model("Order", orderSchema);
