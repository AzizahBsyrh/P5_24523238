const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();

// =====================
// KONFIGURASI
// =====================
const PORT = process.env.PORT || 3000;

// URL webhook n8n Anda
const N8N_WEBHOOK_URL = "https://grayly-unrisky-shavon.ngrok-free.dev/webhook/ask-openai";

// =====================
// MIDDLEWARE
// =====================
app.use(cors());
app.use(express.json());

// =====================
// HALAMAN CHAT (AI ASSISTANT)
// =====================
app.get("/", (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>AI Assistant</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background: #f5f5f5;
      margin: 0;
      height: 100vh;
      display: flex;
      flex-direction: column;
    }
    header {
      background: #202123;
      color: white;
      padding: 15px;
      text-align: center;
      font-size: 18px;
    }
    #chat {
      flex: 1;
      padding: 20px;
      overflow-y: auto;
    }
    .message {
      max-width: 70%;
      padding: 10px 14px;
      margin-bottom: 12px;
      border-radius: 10px;
      line-height: 1.4;
      white-space: pre-wrap;
    }
    .user {
      background: #007bff;
      color: white;
      margin-left: auto;
    }
    .ai {
      background: #e5e5e5;
      color: black;
      margin-right: auto;
    }
    .input-area {
      display: flex;
      padding: 10px;
      background: white;
      border-top: 1px solid #ccc;
    }
    textarea {
      flex: 1;
      resize: none;
      padding: 10px;
      font-size: 14px;
    }
    button {
      padding: 10px 20px;
      margin-left: 10px;
      font-size: 14px;
      cursor: pointer;
    }
  </style>
</head>
<body>

<header>AI Assistant (Express → n8n → OpenAI)</header>

<div id="chat"></div>

<div class="input-area">
  <textarea id="question" rows="2" placeholder="Tulis pertanyaan..."></textarea>
  <button onclick="send()">Kirim</button>
</div>

<script>
  const chat = document.getElementById("chat");
  const input = document.getElementById("question");

  async function send() {
    const text = input.value.trim();
    if (!text) return;

    // tampilkan pesan user
    chat.innerHTML += '<div class="message user">' + text + '</div>';
    input.value = "";
    chat.scrollTop = chat.scrollHeight;

    // indikator mengetik
    const typing = document.createElement("div");
    typing.className = "message ai";
    typing.innerText = "AI sedang mengetik...";
    chat.appendChild(typing);
    chat.scrollTop = chat.scrollHeight;

    try {
      const res = await fetch("/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text })
      });

      const data = await res.json();

      chat.removeChild(typing);
      chat.innerHTML += '<div class="message ai">' + data.answer + '</div>';
      chat.scrollTop = chat.scrollHeight;

    } catch (err) {
      chat.removeChild(typing);
      chat.innerHTML += '<div class="message ai">Terjadi kesalahan.</div>';
    }
  }

  // tekan Enter untuk kirim
  input.addEventListener("keydown", function(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  });
</script>

</body>
</html>
`);
});

// =====================
// ENDPOINT KIRIM KE n8n
// =====================
app.post("/ask", async (req, res) => {
  const question = req.body.question;

  try {
    const response = await axios.post(N8N_WEBHOOK_URL, {
      question,
    });

    // sesuai workflow n8n Anda
    const answer = response.data.answer;

    res.json({ answer });
  } catch (error) {
    res.status(500).json({
      answer: "Gagal menghubungi AI.",
    });
  }
});

// =====================
// JALANKAN SERVER
// =====================
app.listen(PORT, () => {
  console.log("Server berjalan di http://localhost:" + PORT);
});
