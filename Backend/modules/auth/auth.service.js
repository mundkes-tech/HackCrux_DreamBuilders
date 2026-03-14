// Authentication Service Layer
// Business logic for authentication operations

import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import UserModel from "./user.model.js";
import "dotenv/config.js";

class AuthService {
  async signup(email, password, name, company_name) {
    // Check if user already exists
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      throw new Error("User already exists with this email");
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(password, 10);

    // Create user
    const userData = {
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      company_name,
      role: "user",
      status: "active",
    };

    const result = await UserModel.create(userData);

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: result.insertedId,
        email: email.toLowerCase(),
        name,
        role: "user",
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "24h" }
    );

    return {
      token,
      user: {
        userId: result.insertedId,
        email,
        name,
        company_name,
        role: "user",
      },
      message: "User registered successfully",
    };
  }

  async login(email, password) {
    // Find user by email
    const user = await UserModel.findByEmail(email);
    if (!user) {
      throw new Error("Invalid email or password");
    }

    // Verify password
    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error("Invalid email or password");
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "24h" }
    );

    return {
      token,
      user: {
        userId: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      message: "Login successful",
    };
  }

  async getUserById(userId) {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Don't return password
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async updateUserProfile(userId, updateData) {
    // Don't allow password update through this method
    delete updateData.password;

    await UserModel.updateOne(userId, updateData);

    const user = await UserModel.findById(userId);
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async verifyToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
      return decoded;
    } catch (error) {
      throw new Error("Invalid or expired token");
    }
  }
}

export default new AuthService();
