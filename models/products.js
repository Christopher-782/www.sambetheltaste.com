const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  id: String,
  name: String,
  price: Number,
  category: String,
  image: String,
  description: String,
});

module.exports = mongoose.model("Product", productSchema);
