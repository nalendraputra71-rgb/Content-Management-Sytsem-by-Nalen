import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  app.post("/api/log-error", (req, res) => {
    fs.writeFileSync("client-error.log", JSON.stringify(req.body, null, 2) + "\n", { flag: "a" });
    res.json({ ok: true });
  });

  // API Route untuk Gemini Proxy
  app.post("/api/gemini", async (req, res) => {
    const { prompt, model = "gemini-2.5-flash", system } = req.body;
    
    // Gunakan VITE_GEMINI_API_KEY atau GEMINI_API_KEY dari env
    const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ error: "GEMINI_API_KEY (atau VITE_GEMINI_API_KEY) belum dikonfigurasi di server (Settings > Secrets)." });
    }

    try {
      // Inisialisasi GoogleGenAI dengan format objek sesuai SDK @google/genai
      const ai = new GoogleGenAI({ apiKey });
      const config: any = {};
      if (system) config.systemInstruction = system;

      const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
        config: Object.keys(config).length > 0 ? config : undefined
      });
      
      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Gemini Proxy Error:", error);
      res.status(500).json({ error: error.message || "Gagal mendapatkan respon dari AI." });
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
