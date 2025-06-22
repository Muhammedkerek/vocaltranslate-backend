const express = require("express");
const router = express.Router();
const TextToTextController = require("../controllers/TextToTextController");

router.post("/translate-text", TextToTextController.translateText);
module.exports = router;