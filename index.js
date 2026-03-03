import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import "dotenv/config";

const app = express();
const PORT = process.env.PORT || 3001;
const GEM_API_KEY = process.env.GEM_API_KEY;

if (!GEM_API_KEY) {
  console.error("❌ Missing GEM_API_KEY in environment variables");
  process.exit(1);
}

app.use(cors({
  origin: "*",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.all("/gem/*", async (req, res) => {
  const gemPath = req.path.replace(/^\/gem/, "");
  const queryString = new URLSearchParams(req.query).toString();
  const url = `https://api.gem.com${gemPath}${queryString ? "?" + queryString : ""}`;

  try {
    const response = await fetch(url, {
      method: req.method,
      headers: {
        "X-API-Key": GEM_API_KEY,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: req.method !== "GET" ? JSON.stringify(req.body) : undefined,
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    res.status(500).json({ error: "Proxy request failed", message: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Gem proxy running on http://localhost:${PORT}`);
});
