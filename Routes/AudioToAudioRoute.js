const express = require("express");
const router = express.Router();
const { audioToAudio } = require("../controllers/AudioToAudioController");

// POST /api/audio-to-audio
router.post("/", audioToAudio);

module.exports = router;