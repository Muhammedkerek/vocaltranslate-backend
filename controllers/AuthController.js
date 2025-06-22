const User = require("../models/UserSchema");
const express = require("express");
const bcrypt = require("bcrypt");
const SALT_ROUNDS = 10;

exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be 6 or more characters",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await User.create({ email, password: hashedPassword , isLoggedIn:true});
  

    res.status(201).json({
      message: "User registered successfully",
      user: {
        email: user.email,
        userId: user._id,
      },
    });
  } catch (err) {
    res.status(500).json({
      message: "An error occurred during registration",
      error: err.message,
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email});
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    res.status(200).json({
      message: "Login successful",
      user: {
        email: user.email,
        userId: user._id,
      },
    });
    user.isLoggedIn = true;
    await user.save();

    console.log(user.id);
  } catch (err) {
    res
      .status(400)
      .json({ message: "An error occurred during login", error: err.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User found", user: {
      enail:user.email ,
      userId: user._id,
       } });
  } catch (err) {
    res
      .status(400)
      .json({ message: "An error occurred during user retrieval", error: err });
  }
};

exports.logOut = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "Missing userId in request body" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.isLoggedIn = false;
    await user.save();

    res.status(200).json({ message: "User logged out successfully" });
  } catch (err) {
    res.status(400).json({
      message: "An error occurred during logout",
      error: err.message,
    });
  }
};
