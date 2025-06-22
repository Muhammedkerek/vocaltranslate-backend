const OpenAI = require("openai");
const TextToText = require("../models/textToTextSchema");
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Ensure your API key is stored in .env
});

exports.translateText = async (req, res) => {
  const { text, from, to } = req.body;
  console.log("text", text, "from", from, "to", to);

  if (!text || !from || !to) {
    return res.status(400).json({
      success: false,
      message: "Please provide text, source language, and target language.",
    });
  }

  try {
    // Request translation from OpenAI
    const translationResponse = await openai.chat.completions.create({
      model: "gpt-4", // Using GPT-4 for better results
      messages: [
        {
          role: "system",
          content: `Translate this text from ${from} to ${to}.`,
        },
        { role: "user", content: text },
      ],
    });

    const translatedText =
      translationResponse.choices[0].message.content.trim();
    // Save the translation to the database
    const translationRecord = new TextToText({
      originalText: text,
      translatedText: translatedText,
      sourceLanguage: from,
      targetLanguage: to,
    });

    await translationRecord.save();

    res.status(200).json({
      success: true,
      translatedText,
    });
  } catch (error) {
    console.error("Error during text translation:", error);
    res.status(500).json({
      success: false,
      message: "Error processing text translation.",
      error: error.message,
    });
  }
};
