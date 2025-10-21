import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import path from "path";
import session from "express-session";

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static("public"));
app.use(
  session({
    secret: "kumru-secret-key",
    resave: false,
    saveUninitialized: true,
  })
);

// Endpoint for chat messages
app.post("/api/chat", async (req, res) => {
  const userMessage = req.body.message;
  if (!userMessage) return res.status(400).json({ error: "No message provided" });

  // Initialize chat history for this session
  if (!req.session.messages) {
    req.session.messages = [
      {
        role: "system",
        content: `VNGRS firması tarafından 2025 yılında Türkçe için tamamen sıfırdan, pre-training ve instruction fine-tuning adımlarını izleyerek, yani hiçbir transfer learning yöntemi kullanılmadan,
        7.4 milyar parametreli, 16,384 token context length'e sahip model mimarim Mistral v0.3 ve LLaMA-3'e dayanıyor, yani decoder-only bir mimariye sahibim.
        Aslen Türkçe, ikinci dil olarak da İngilizce biliyorum`
      }
    ];
  }

  // Add user's new message to conversation
  req.session.messages.push({ role: "user", content: userMessage });

  try {
    const response = await axios.post("http://localhost:8000/v1/chat/completions", {
      model: "vngrs-ai/Kumru-2B",
      messages: req.session.messages
    });

    const reply = response.data.choices[0].message.content;

    // Add assistant reply to session
    req.session.messages.push({ role: "assistant", content: reply });

    res.json({ reply });
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({ error: "Error calling vLLM API" });
  }
});

app.listen(PORT, () => console.log(`🚀 Web chat running at http://localhost:${PORT}`));
