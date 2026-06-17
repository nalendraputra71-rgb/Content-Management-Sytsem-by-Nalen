import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import fs from "fs";
import admin from "firebase-admin";
import { getAuth } from "firebase-admin/auth";
import { rateLimit } from "express-rate-limit";

dotenv.config();

function initFirebase() {
  if (admin.getApps().length === 0) {
    let projectId = process.env.FIREBASE_PROJECT_ID;
    if (!projectId) {
      const configPath = path.join(process.cwd(), "firebase-applet-config.json");
      if (fs.existsSync(configPath)) {
        const firebaseConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));
        projectId = firebaseConfig.projectId;
      }
    }
    if (projectId) {
      admin.initializeApp({ projectId });
      console.log("Firebase Admin initialized lazily with projectId:", projectId);
    } else {
      throw new Error("FIREBASE_PROJECT_ID is not set in environment or config.");
    }
  }
}

const app = express();

app.set('trust proxy', 1 /* number of proxies between user and server */);
app.use(express.json({ limit: "15mb" })); // Mencegah payload besar yang bisa DOS server, but big enough for chat history

// Define routes once
const apiRoutes = express.Router();

apiRoutes.get("/trends", async (req, res) => {
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
apiRoutes.post("/gemini", apiLimiter, async (req, res) => {
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
      try {
        initFirebase();
      } catch (initErr: any) {
        return res.status(500).json({ error: "Sistem belum dikonfigurasi sepenuhnya. " + initErr.message });
      }
      await getAuth().verifyIdToken(idToken.trim());
    } catch (error) {
      console.error("Gagal verifikasi token:", error);
      return res.status(401).json({ error: "Akses Ditolak: Token Autentikasi tidak valid atau telah kedaluwarsa." });
    }
    // ----------------------------

    const { prompt, model = "gemini-2.0-flash", system, history = [], useSearchGrounding } = req.body;
    
    // Prioritize custom Gemini_API_Key from user
    let apiKeyName = "Gemini_API_Key";
    let apiKey = process.env.Gemini_API_Key;
    
    if (!apiKey) {
      if (process.env.VITE_GEMINI_API_KEY) {
        apiKeyName = "VITE_GEMINI_API_KEY";
        apiKey = process.env.VITE_GEMINI_API_KEY;
      } else {
        apiKeyName = "GEMINI_API_KEY";
        apiKey = process.env.GEMINI_API_KEY;
      }
    }
    
    console.log(`[API KEY INFO] Menggunakan kunci: ${apiKeyName} (Prefix: ${apiKey ? apiKey.substring(0, 6) : "none"}). Jika Anda menggunakan kunci gratis, batas limit berlaku.`);

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
      text: response?.text || "Tidak ada respon dari model",
      usage: response?.usageMetadata 
    });
  } catch (error: any) {
    const isQuotaError = error?.status === 429 || error?.message?.includes("429") || error?.message?.includes("quota") || error?.message?.includes("Quota");
    
    if (!isQuotaError) {
      console.error("Gemini Proxy Error:", error);
    }
    
    if (isQuotaError) {
       return res.status(429).json({ error: `Maaf, kuota API Gemini telah habis (Quota Exceeded). Key yang digunakan: ${apiKeyName}. Jika Anda menggunakan API Key gratis, batas limit Google berlaku (15/menit).`});
    }
    
    return res.status(500).json({ error: error?.message || "Gagal mendapatkan respon dari AI." });
  }
});

// Mount the routes to both /api and / to handle standard and Vercel routing
app.use("/api", apiRoutes);
app.use("/", apiRoutes);

// 404 handler for API routes
app.use((req, res, next) => {
  if (req.url.startsWith("/api") || process.env.VERCEL) {
    res.status(404).json({ error: `API Route not found in Express: ${req.method} ${req.originalUrl || req.url}` });
  } else {
    next();
  }
});

// Generic error handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error("Unhandled Express Error:", err);
  res.status(500).json({ error: "Internal Server Error", details: err.message });
});

export default app;

// Only start the server natively if not running on Vercel
if (!process.env.VERCEL) {
  async function startServer() {
    const PORT = 3000;

    // Vite middleware untuk development mode
    if (process.env.NODE_ENV !== "production") {
      const { createServer: createViteServer } = await import("vite");
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
}
