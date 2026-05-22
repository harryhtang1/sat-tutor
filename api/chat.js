const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const userMessage = req.body.message;

  try {
    const response = await client.responses.create({
      model: "gpt-4o-mini",
      input: [
        {
          role: "system",
          content: "You are a helpful, concise AI assistant. Be clear and direct."
        },
        {
          role: "user",
          content: userMessage
        }
      ],
    });

    res.status(200).json({ reply: response.output_text });
  } catch (error) {
    console.error(error);
    res.status(500).json({ reply: "Error getting AI response" });
  }
};
