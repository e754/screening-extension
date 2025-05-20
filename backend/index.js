import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import cors from 'cors';
import pdf from 'pdf-parse/lib/pdf-parse.js'; // Modified import path

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

console.log("Server started");


app.post('/gemini', async (req, res) => {
  try {
    const { model, contents } = req.body;

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        contents: [{ role: "user", parts: [{ text: contents }] }],
        generationConfig: {
          temperature: 0,
        },
      },
      {
        headers: { 'Content-Type': 'application/json' },
        params: { key: process.env.GEMINI_API_KEY },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error("Error calling Gemini API:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch from Gemini API" });
  }
});

app.post('/extract-pdf', async (req, res) => {
  try {
    const { pdfUrl } = req.body;
    if (!pdfUrl) return res.status(400).json({ error: 'pdfUrl is required' });

    const response = await axios.get(pdfUrl, { 
      responseType: 'arraybuffer'
    });
    
    const data = await pdf(response.data);
    
    res.json({ 
      success: true,
      text: data.text,
      pageCount: data.numpages
    });
  } catch (error) {
    console.error('Error extracting PDF text:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to extract PDF text',
      details: error.message 
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});