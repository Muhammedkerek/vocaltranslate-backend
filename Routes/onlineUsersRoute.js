const express = require('express');
const router = express.Router();
const OnlineUsersController = require("../controllers/OnlineUsersController");

// Route to get online users
router.get('/online-users', OnlineUsersController.getOnlineUsers);
// Route to update user status
module.exports = router;