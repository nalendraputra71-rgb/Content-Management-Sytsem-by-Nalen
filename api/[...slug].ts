import { createRequire } from "module";
const require = createRequire(import.meta.url);

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: any, res: any) {
  try {
    let app;
    try {
      // First, try importing from the compiled dist/server.cjs (bundled in production)
      const serverModule = require("../dist/server.cjs");
      app = serverModule.default || serverModule;
    } catch (err1: any) {
      console.warn("Failed to load compiled server.cjs, trying fallback server.ts:", err1.message);
      // Fallback to server.ts
      const serverModule = await import("../server.js");
      app = serverModule.default || serverModule;
    }
    
    // Ensure Express can process the request
    if (typeof app === "function") {
      return app(req, res);
    } else {
      throw new Error("Loaded server module is not an Express app function instance.");
    }
  } catch (error: any) {
    console.error("Vercel Function Error loading server:", error);
    return res.status(500).json({
      error: "Failed to initialize server on Vercel",
      message: error.message,
      stack: error.stack
    });
  }
}
