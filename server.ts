import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import cors from "cors";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Rate limiter for AI features to prevent API cost blowouts
const aiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 AI requests per windowMs
  message: { error: "Terlalu banyak permintaan AI dari IP ini. Silakan coba lagi nanti." },
  standardHeaders: true,
  legacyHeaders: false,
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Set up Strict CORS (Only allow known origins)
  const allowedOrigins = [
    "http://localhost:3000",
    "https://kreator.next", // Old domain (can keep or remove, let's keep for safety)
    "https://hubifysocial.com",
    "https://www.hubifysocial.com"
  ];
  app.use(cors({
    origin: function(origin, callback) {
      if (!origin || allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.run.app')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  }));

  app.use(express.json({ limit: '10kb' })); // Mencegah Payload raksasa (DDoS padding)

  // API Route untuk Gemini Proxy
  app.post("/api/gemini", aiRateLimiter, async (req, res) => {
    const { prompt, model = "gemini-2.5-flash" } = req.body;
    
    // Strict Input Validation (Prevent NoSQL injection & Payload abuse)
    if (!prompt || typeof prompt !== 'string' || prompt.length > 5000) {
      return res.status(400).json({ error: "Invalid prompt format or size exceeded (max 5000 chars)." });
    }
    
    const allowedModels = ["gemini-2.5-flash", "gemini-2.5-pro"];
    if (typeof model !== 'string' || !allowedModels.includes(model)) {
      return res.status(400).json({ error: "Invalid model specified." });
    }

    // Gunakan VITE_GEMINI_API_KEY atau GEMINI_API_KEY dari env
    const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ error: "Server Configuration Error" }); // Hiding internal config info
    }

    try {
      // Inisialisasi GoogleGenAI dengan format objek sesuai SDK @google/genai
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: model,
        contents: prompt
      });
      
      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Gemini Proxy Error:", error.message || error);
      res.status(500).json({ error: "Gagal mendapatkan respon dari AI. Silakan coba lagi nanti." }); // Safe error message (No Stack Trace)
    }
  });

  // Secure Xendit Webhook Endpoint
  app.post("/api/webhooks/xendit", async (req, res) => {
    // 1. Verify Xendit Callback Token
    const xenditToken = req.headers['x-callback-token'];
    if (xenditToken !== process.env.XENDIT_WEBHOOK_SECRET) {
      return res.status(401).json({ error: "Unauthorized Webhook Call" });
    }

    const event = req.body;
    console.log("Xendit Webhook Received:", event.id);

    try {
      // Here you would use firebase-admin to securely update the user's plan
      // based on event.external_id (which usually contains the user ID)
      // e.g. await admin.firestore().collection('users').doc(userId).update({ plan: 'pro', activeUntil: newDate });

      return res.status(200).json({ status: "success" });
    } catch (err: any) {
      console.error("Webhook processing error", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // Vite middleware untuk development mode
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
