const mongoose = require("mongoose");

// Define Text-to-Text Translation Schema
const textToTextSchema = new mongoose.Schema(
  {
    originalText: {
      type: String,
      required: true, // The text provided by the user
    },
    translatedText: {
      type: String,
      required: true, // The translated text
    },
    sourceLanguage: {
      type: String,
      required: true, // Language code of the original text (e.g., 'en')
    },
    targetLanguage: {
      type: String,
      required: true, // Language code of the translated text (e.g., 'fr')
    },
    createdAt: {
      type: Date,
      default: Date.now, // Automatically set timestamp
    },
  },
  {
    timestamps: true, // Auto-create `createdAt` and `updatedAt` fields
  }
);

// Create a Mongoose Model
const TextToText = mongoose.model("TextToText", textToTextSchema);

module.exports = TextToText;
