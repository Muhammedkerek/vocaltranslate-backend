const multer = require("multer");
const path = require("path");
const fs = require("fs");
const OpenAI = require("openai");
const { ensureUploadsFolder, deleteFile, cleanText } = require("../utils/utils");
const Translation = require("../models/translationSchema");

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
    cb(null, path.join(__dirname, "../uploads")); // Save in the 'uploads' folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
  },
});


const upload = multer({ storage }).single("audio");



exports.saveAudioText = (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error("Error uploading audio:", err);
      return res.status(500).json({ success: false, message: "Error uploading audio." });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: "No audio file uploaded." });
    }

    const { from, to } = req.body; // Get 'from' and 'to' languages from request body
    const filePath = req.file.path;

    try {
      // Step 1: Transcribe Audio
      const transcription = await openai.audio.transcriptions.create({
        file: fs.createReadStream(filePath),
        model: "whisper-1",
        
      });

      const rawText = transcription.text;
      const cleanedText = cleanText(rawText);

      // Step 2: Translate Cleaned Text
      const translationResponse = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: `Translate this text to ${to || "en"}:` },
          { role: "user", content: cleanedText },
        ],
      });

      const translatedText = translationResponse.choices[0].message.content.trim();

      const translationRecord = new Translation({
        originalText: cleanedText,
        translatedText: translatedText,
        sourceLanguage: from || "en",
        targetLanguage: to || "en",
      });

      await translationRecord.save();

      // Step 3: Respond to Client
      res.status(200).json({
        success: true,
        message: "Audio file transcribed and translated successfully!",
        transcription: rawText,
        cleanedText: cleanedText,
        translatedText: translatedText,
      });

      console.log("Original:", rawText);
      console.log("Cleaned:", cleanedText);
      console.log("Translated:", translatedText);
    } catch (error) {
      console.error("Error during transcription/translation:", error);
      res.status(500).json({
        success: false,
        message: "Error processing audio.",
        error: error.message,
      });
    } 
    finally{
      deleteFile(filePath);
    }
  });
};
