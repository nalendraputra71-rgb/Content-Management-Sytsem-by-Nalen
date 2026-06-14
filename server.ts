import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import fs from "fs";
import * as admin from "firebase-admin";
import { getAuth } from "firebase-admin/auth";
import rateLimit from "express-rate-limit";

// Inisialisasi Firebase Admin untuk verifikasi Auth Token JWT (hanya perlu projectId)
try {
  const firebaseConfig = JSON.parse(fs.readFileSync(path.join(process.cwd(), "firebase-applet-config.json"), "utf8"));
  admin.initializeApp({
    projectId: firebaseConfig.projectId
  });
} catch (e) {
  console.error("Gagal inisialisasi Firebase Admin:", e);
}

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Add trust proxy config for rate-limit behind nginx proxy
  app.set('trust proxy', 1 /* number of proxies between user and server */);
  
  app.use(express.json({ limit: "15mb" })); // Mencegah payload besar yang bisa DOS server, but big enough for chat history

  app.post("/api/log-error", (req, res) => {
    fs.writeFileSync("client-error.log", JSON.stringify(req.body, null, 2) + "\n", { flag: "a" });
    res.json({ ok: true });
  });

  app.get("/api/trends", async (req, res) => {
    try {
      const geo = (req.query.geo as string) || "ID";
      const gRes = await fetch(`https://trends.google.com/trending/rss?geo=${geo}`);
      if (!gRes.ok) throw new Error("Failed to fetch RSS from Google");
      const text = await gRes.text();
      res.type("application/xml");
      res.send(text);
    } catch (e: any) {
      console.error("Trends fetch error:", e);
      res.status(500).json({ error: e.message || "Failed to fetch trends" });
    }
  });

  // Strict Rate Limiting khusus untuk route API AI
  const apiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 menit
    max: 20, // max 20 request per menit per IP
    message: { error: "Terlalu banyak permintaan (Rate limit exceeded). Silakan coba lagi nanti." },
    standardHeaders: true,
    legacyHeaders: false,
  });

  // API Route untuk Gemini Proxy
  app.post("/api/gemini", apiLimiter, async (req, res) => {
    try {
      // ---- VERIFIKASI TOKEN ----
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Akses Ditolak: Token Autentikasi tidak ditemukan." });
      }
      
      const idToken = authHeader.split("Bearer ")[1];
      try {
        if (!idToken || idToken.trim() === "") {
          throw new Error("Token kosong");
        }
        await getAuth().verifyIdToken(idToken.trim());
      } catch (error) {
        console.error("Gagal verifikasi token:", error);
        return res.status(403).json({ error: "Akses Ditolak: Token Autentikasi tidak valid atau telah kedaluwarsa." });
      }
      // ----------------------------
  
      const { prompt, model = "gemini-2.5-flash", system, history = [], useSearchGrounding } = req.body;
      
      // Gunakan VITE_GEMINI_API_KEY atau GEMINI_API_KEY dari env
      const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
      
      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY (atau VITE_GEMINI_API_KEY) belum dikonfigurasi di server (Settings > Secrets)." });
      }
  
      // Inisialisasi GoogleGenAI dengan format objek sesuai SDK @google/genai
      const ai = new GoogleGenAI({ apiKey });
      const config: any = {};
      if (system) config.systemInstruction = system;
      if (useSearchGrounding) {
          config.tools = [{ googleSearch: {} }];
      }
  
      let contents: any[] = [];
      if (history && history.length > 0) {
         let validHistory = history.filter((msg: any) => msg.content && typeof msg.content === 'string');
         
         validHistory.forEach((msg: any) => {
            const mappedRole = msg.role === "assistant" ? "model" : "user";
            
            if (contents.length === 0) {
                // Gemini MUST start with a user message
                if (mappedRole === "model") return; 
                contents.push({ role: mappedRole, parts: [{ text: msg.content }] });
            } else if (contents[contents.length - 1].role !== mappedRole) {
                // Alternate roles
                contents.push({ role: mappedRole, parts: [{ text: msg.content }] });
            } else {
                // If same role, append text
                contents[contents.length - 1].parts[0].text += "\n\n" + msg.content;
            }
         });
      }
      
      // Fallback
      if (contents.length === 0) {
         contents = [{ role: "user", parts: [{ text: prompt }] }];
      }
  
      let response;
      let retries = 3;
      while (retries > 0) {
        try {
          response = await ai.models.generateContent({
            model: model,
            contents: contents,
            config: Object.keys(config).length > 0 ? config : undefined
          });
          break; // Success
        } catch (error: any) {
          if (error.status === 503 && retries > 1) {
            retries--;
            await new Promise(resolve => setTimeout(resolve, 2000)); // wait 2 seconds before retry
            continue;
          }
          throw error;
        }
      }
      
      return res.json({ 
        text: response?.text,
        usage: response?.usageMetadata 
      });
    } catch (error: any) {
      console.error("Gemini Proxy Error:", error);
      return res.status(500).json({ error: error.message || "Gagal mendapatkan respon dari AI." });
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
