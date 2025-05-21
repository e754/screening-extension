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

console.log("gpt4-mini?");
app.post('/gpt4-mini', async (req, res) => {
  try {
    const { model, contents } = req.body;
    console.log("request recieved");
    if (!model || !contents) {
      return res.status(400).json({ error: "Missing 'model' or 'contents' in request body." });
    }
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: model, // e.g. "gpt-4.1-mini"
        messages: [
          { role: "user", content: contents }
        ],
        temperature: 0
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
        }
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error("Error calling GPT-4.1 Mini API:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch from GPT-4.1 Mini API" });
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