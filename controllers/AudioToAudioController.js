const multer = require("multer");
const path = require("path");
const fs = require("fs");
const OpenAI = require("openai");
const { ensureUploadsFolder, deleteFile, cleanText } = require("../utils/utils");

// Ensure 'uploads' folder exists
const uploadsFolder = path.join(__dirname, "../uploads");
ensureUploadsFolder(uploadsFolder);

// Initialize OpenAI API
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsFolder);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage }).single("audio");

// Main controller function
exports.audioToAudio = (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(500).json({ success: false, message: "Error uploading audio." });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No audio file uploaded." });
    }

    const { from, to } = req.body;
    const filePath = req.file.path;

    try {
      // 1. Transcribe audio to text
      const transcription = await openai.audio.transcriptions.create({
        file: fs.createReadStream(filePath),
        model: "whisper-1",
      });
      const rawText = transcription.text;
      const cleanedText = cleanText(rawText);

      // 2. Translate text
      const translationResponse = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: `Translate this text to ${to || "en"}:` },
          { role: "user", content: cleanedText },
        ],
      });
      const translatedText = translationResponse.choices[0].message.content.trim();

      // 3. Convert translated text to speech (TTS)
      const ttsResponse = await openai.audio.speech.create({
        model: "tts-1",
        input: translatedText,
        voice: "alloy", // You can choose another voice if you want
        response_format: "mp3",
        language: to || "en",
      });

      // 4. Send the audio file back to the client
      res.setHeader("Content-Type", "audio/mpeg");
      ttsResponse.body.pipe(res);

      // Optionally, log or save the translation
      console.log("Original:", rawText);
      console.log("Translated:", translatedText);
    } catch (error) {
      console.error("Error during audio-to-audio:", error);
      res.status(500).json({
        success: false,
        message: "Error processing audio.",
        error: error.message,
      });
    } finally {
      deleteFile(filePath);
    }
  });
};