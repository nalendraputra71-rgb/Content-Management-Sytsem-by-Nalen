export const config = {
  api: {
    bodyParser: false,
  },
};

let app;
try {
  app = require("../server").default || require("../server");
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
