import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import cors from 'cors';
import pdfjsLib from 'pdfjs-dist/legacy/build/pdf.js';


dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

console.log("test");

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

    const response = await axios.get(pdfUrl, { responseType: 'arraybuffer' });
    const pdfBuffer = response.data;

    // Load PDF document from buffer
    const loadingTask = pdfjsLib.getDocument({ data: pdfBuffer });
    const pdfDocument = await loadingTask.promise;

    let fullText = '';

    // Loop through all pages and extract text
    for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
      const page = await pdfDocument.getPage(pageNum);
      const textContent = await page.getTextContent();

      // Extract text items and concatenate
      const pageText = textContent.items.map(item => item.str).join(' ');
      fullText += pageText + '\n\n';
    }

    res.json({ text: fullText });
  } catch (error) {
    console.error('Error extracting PDF text:', error);
    res.status(500).json({ error: 'Failed to extract PDF text' });
  }
});


app.listen(PORT, () => {
});
