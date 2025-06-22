const mongoose = require("mongoose");

// Define the Translation Schema
const translationSchema = new mongoose.Schema(
  {
    originalText: {
      type: String,
      required: true, // The transcribed sentence
    },
    translatedText: {
      type: String,
      required: true, // The translated sentence
    },
    sourceLanguage: {
      type: String,
      required: true, // Source language code (e.g., 'en')
    },
    targetLanguage: {
      type: String,
      required: true, // Target language code (e.g., 'fr')
    },
    createdAt: {
      type: Date,
      default: Date.now, // Auto-generated timestamp
    },
  },
  {
    timestamps: true, // Automatically creates `createdAt` and `updatedAt`
  }
);

const Translation = mongoose.model("Translation", translationSchema);
module.exports = Translation;
