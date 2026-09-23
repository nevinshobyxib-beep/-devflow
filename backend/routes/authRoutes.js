const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middleware/authMiddleware");
const validator = require("validator");
const router = express.Router();

router.post("/register", async (req, res,next) => {
  try {
   const { name, email, password } = req.body;

if (!name || !email || !password) {
  return res.status(400).json({
    message: "Name, email and password are required"
  });
}

if (!validator.isEmail(email)) {
  return res.status(400).json({
    message: "Please enter a valid email"
  });
}

if (password.length < 6) {
  return res.status(400).json({
    message: "Password must be at least 6 characters"
  });
}

const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
 } catch (error) {
  next(error);
}
});
router.post("/login", async (req, res,next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Invalid email or password"
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(400).json({
        message: "Invalid email or password"
      });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token
    });
  } catch (error) {
    next(error);
  }
});
router.get("/profile", authMiddleware, async (req, res,next) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
 } catch (error) {
  next(error);
}
});
router.put("/profile", authMiddleware, async (req, res,next) => {
  try {
    const { name, email } = req.body;

if (!name || !email) {
  return res.status(400).json({
    message: "Name and email are required"
  });
}

if (!validator.isEmail(email)) {
  return res.status(400).json({
    message: "Please enter a valid email"
  });
}

const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    user.name = name;
    user.email = email;

    await user.save();

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
 } catch (error) {
  next(error);
}
});

module.exports = router;