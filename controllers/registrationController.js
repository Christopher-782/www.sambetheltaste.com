const Registration = require("../models/registrationSchema");
const bcrypt = require("bcrypt");

exports.Userschema = async (req, res) => {
  try {
    const { username, email, phoneNumber, password } = req.body;

    // Simple validation
    if (!username || !email || !phoneNumber || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // 1️⃣ Check if user already exists
    const existingUser = await Registration.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // 2️⃣ Hash password with bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3️⃣ Save user to database
    const newUser = await Registration.create({
      username,
      email,
      phoneNumber,
      password: hashedPassword,
    });

    // 4️⃣ Respond to client
    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: {
        username: newUser.username,
        email: newUser.email,
        phoneNumber: newUser.phoneNumber,
      },
    });
  } catch (err) {
    console.error("Failed to create user:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};
