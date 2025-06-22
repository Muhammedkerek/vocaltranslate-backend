const express = require("express");
const router = express.Router();
const AudioToTextController = require("../controllers/AudioToTextController");

router.post("/save-audio-text", AudioToTextController.saveAudioText);
module.exports = router;