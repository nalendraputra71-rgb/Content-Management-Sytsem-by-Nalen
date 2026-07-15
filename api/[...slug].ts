export const config = {
  runtime: "nodejs",
  api: {
    bodyParser: false,
  },
};

let app;
try {
  app = require("../dist/server.cjs").default || require("../dist/server.cjs");
} catch (error) {
  console.error("Failed to load server.cjs:", error);
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
