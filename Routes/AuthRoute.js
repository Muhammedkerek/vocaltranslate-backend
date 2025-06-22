const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/AuthController");

router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.get("/users/:userId", AuthController.getUserById);
router.post("/logout", AuthController.logOut);

module.exports = router;
