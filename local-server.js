require("dotenv").config();

const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");

const app = express();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.use(cors());
app.use(express.json());

// test route
app.get("/", (req, res) => {
  res.send("Server is running");
});

// AI chat route
app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;

  try {
    const response = await client.responses.create({
      model: "gpt-4o-mini",
      input: userMessage,
    });

    res.json({ reply: response.output_text });

  } catch (error) {
    console.error(error);
    res.json({ reply: "Error getting AI response" });
  }
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});