import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import cors from 'cors'; // ✅ Import CORS

dotenv.config();

const app = express();

app.use(cors());

app.use(express.json());

const PORT = process.env.PORT || 3001;

app.post('/gemini', async (req, res) => {
  try {
    const { model, contents } = req.body;

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        contents: [{ role: "user", parts: [{ text: contents }] }],
        generationConfig: {
          temperature: 0, // ✅ Deterministic output
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        params: {
          key: process.env.GEMINI_API_KEY,
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error("Error calling Gemini API:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch from Gemini API" });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server listening on http://localhost:${PORT}`);
});
