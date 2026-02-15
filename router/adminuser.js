// routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const { login, verifyToken } = require("../controllers/adminregistration");

// POST /api/admin/login
router.post("/admin/login", login);

// // Example protected route
// router.get("/dashboard", verifyToken, (req, res) => {
//   res.json({ message: `Welcome, ${req.admin.username}` });
// });

module.exports = router;
