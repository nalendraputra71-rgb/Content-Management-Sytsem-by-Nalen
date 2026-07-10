export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: any, res: any) {
  try {
    const serverModule = await import("../server");
    const app = serverModule.default;
    return app(req, res);
  } catch (error: any) {
    console.error("Vercel Function Error loading server:", error);
    return res.status(500).json({
      error: "Failed to initialize server on Vercel",
      message: error.message,
      stack: error.stack
    });
  }
}
