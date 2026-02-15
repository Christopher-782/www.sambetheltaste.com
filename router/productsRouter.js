const express = require("express");
const router = express.Router();
const Product = require("../models/products");
const multer = require("multer");
const XLSX = require("xlsx");

// ✅ Define multer storage
const upload = multer({
  dest: "uploads/", // make sure this folder exists
});

// ================= GET PRODUCTS =================
router.get("/products", async (req, res) => {
  try {
    const category = req.query.category;
    const filter = category ? { category } : {};
    const products = await Product.find(filter);
    res.json({ products });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= UPLOAD PRODUCTS =================
router.post("/upload-products", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const data = XLSX.utils.sheet_to_json(sheet);

    await Product.insertMany(data);

    res.json({ success: true, message: "Products uploaded successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Upload failed" });
  }
});

module.exports = router;
