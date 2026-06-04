require("dotenv").config();
const axios = require("axios");
const express = require("express");
const cors = require("cors");

const app = express();

let chatHistory = [];
const userMemories = {};

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Etera Backend Online 🦊");
});

app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    chatHistory.push({
      role: "user",
      content: message,
    });

    const messages = [
      {
        role: "system",
        content: `
Kamu adalah Etera.

Jawab dalam Bahasa Indonesia.

Berbicara seperti teman ngobrol biasa.

Jangan menggunakan markdown seperti ** atau ##.
Jangan membuat roleplay berlebihan.
Jangan mengulang emoji.
Jangan membuat pembukaan panjang.

Jawab langsung ke inti pertanyaan.

Gunakan bahasa santai, natural, dan mudah dibaca.

Jika pertanyaan sederhana, jawab singkat.
Jika pengguna meminta detail, baru jelaskan panjang.

Jangan menyebut dirimu AI Google, Gemini, atau model bahasa.
`,
      },
      ...chatHistory,
    ];

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "deepseek/deepseek-chat-v3-0324",
        messages: messages,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const reply = response.data.choices[0].message.content;

    chatHistory.push({
      role: "assistant",
      content: reply,
    });

    if (chatHistory.length > 20) {
      chatHistory = chatHistory.slice(-20);
    }

    res.json({
      reply,
    });
  } catch (error) {
    console.log(error.response?.data || error);

    res.json({
      reply: "🦊 Aduh, otak Etera lagi error 😵",
    });
  }
});

app.listen(3000, () => {
  console.log("🦊 Etera Backend berjalan di port 3000");
});