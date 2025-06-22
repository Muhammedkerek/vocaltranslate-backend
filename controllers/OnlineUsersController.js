const User = require("../models/UserSchema");
const express = require("express");

exports.getOnlineUsers = async (req, res) => {
  try {
    const onlineUsers = await User.find({ isLoggedIn: true } ,'_id email');
    res.status(200).json({
      message: "Online users retrieved successfully",
      onlineUsers,
    });
  } catch (err) {
    res.status(500).json({
      message: "An error occurred while retrieving online users",
      error: err.message,
    });
  }
};