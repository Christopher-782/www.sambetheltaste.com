const express = require("express");
const registrationController = require("../controllers/registrationController");
const router = express.Router();

// REGISTRATION
router.post("/users", registrationController.Userschema);

module.exports = router;
