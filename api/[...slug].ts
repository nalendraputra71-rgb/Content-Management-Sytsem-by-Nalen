export const config = {
  api: {
    bodyParser: false,
  },
};

let app;
try {
  // Use the pre-built server.cjs if available (to avoid `@vercel/node` bundling TS again)
  // But since Vercel might not trace dist/server.cjs properly if we use dynamic require,
  // we require ../server.ts and rely on the fact that we hid vite from the tracer.
  app = require("../server").default;
} catch (error) {
  console.error("Failed to load server.ts:", error);
  const express = require("express");
  app = express();
  app.all("*", (req, res) => {
    res.status(500).json({ 
      error: "Failed to initialize server",
      message: error.message,
      stack: error.stack
    });
  });
}
export default app;
