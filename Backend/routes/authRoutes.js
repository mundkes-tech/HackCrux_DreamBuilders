const express = require("express");
const jwt = require("jsonwebtoken");

const authMiddleware = require("../middleware/auth");
const User = require("../models/User");

const router = express.Router();

const createToken = (user) =>
  jwt.sign(
    {
      sub: user._id.toString(),
      email: user.email,
    },
    process.env.JWT_SECRET || "development-secret-change-me",
    {
      expiresIn: "7d",
    }
  );

const serializeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  companyName: user.companyName,
  createdAt: user.createdAt,
});

router.post("/signup", async (req, res, next) => {
  try {
    const { name, email, companyName, password } = req.body;

    if (!name || !email || !companyName || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters long." });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    const user = await User.create({
      name,
      email,
      companyName,
      password,
    });

    const token = createToken(user);
    return res.status(201).json({
      token,
      user: serializeUser(user),
    });
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = createToken(user);
    return res.json({
      token,
      user: serializeUser(user),
    });
  } catch (error) {
    next(error);
  }
});

router.get("/me", authMiddleware, async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.json({ user: serializeUser(user) });
  } catch (error) {
    next(error);
  }
});

module.exports = router;