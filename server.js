const express = require("express");
const cors = require("cors");
const Parser = require("rss-parser");

const app = express();
app.use(cors());

const FEED_URL =
  process.env.FEED_URL ||
  "https://aviationweek.com/awn-rss/feed?field_content_source_target_id%5B%5D=1091";

const parser = new Parser({
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
    "Accept": "application/rss+xml, application/xml;q=0.9, */*;q=0.8"
  },
  timeout: 15000
});

app.get("/", (_req, res) => {
  res.send("✅ Opportunities API is running. Try /opportunities");
});

app.get("/health", (_req, res) => {
  res.json({ ok: true, feed: FEED_URL });
});

app.get("/opportunities", async (req, res) => {
  try {
    const q = (req.query.q || "").toString().trim().toLowerCase();

    // Fetch & parse the RSS
    const feed = await parser.parseURL(FEED_URL);

    // Map to a consistent, Squarespace-friendly shape
    let items = (feed.items || []).map((it) => {
      return {
        title: it.title || "",
        description: (it.contentSnippet || it.content || "").replace(/\s+/g, " ").trim(),
        buyer: "Aviation Week",
        disaster_type: "Aviation",
        region: "",
        deadline: "",
        source: "Aviation Week – Source 1091",
        link: it.link || ""
      };
    });

    // Optional keyword filter (e.g., ?q=modified%20aircraft OR ?q=aerial)
    if (q) {
      items = items.filter((it) => {
        const hay = (it.title + " " + it.description).toLowerCase();
        return hay.includes(q);
      });
    }

    res.json(items);
  } catch (e) {
    console.error("RSS fetch/parse failed:", e?.message || e);
    res.status(502).json({ error: "Failed to fetch Aviation
