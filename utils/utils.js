const fs = require("fs");
const path = require("path");
const natural = require("natural");

// Ensure 'uploads' folder exists
const ensureUploadsFolder = (uploadsFolder) => {
  if (!fs.existsSync(uploadsFolder)) {
    fs.mkdirSync(uploadsFolder);
  }
};

// File deletion function
const deleteFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath); // Delete the file
      console.log(`File deleted: ${filePath}`);
    }
  } catch (err) {
    console.error(`Error deleting file: ${filePath}`, err);
  }
};

// Clean text function
const cleanText = (text) => {
  const tokenizer = new natural.WordTokenizer();
  const fillerWords = ["uh", "um", "like", "ah"];
  const tokens = tokenizer
    .tokenize(text)
    .filter((word) => !fillerWords.includes(word.toLowerCase()));

  return tokens.join(" ");
};

module.exports = {
  ensureUploadsFolder,
  deleteFile,
  cleanText,
};
