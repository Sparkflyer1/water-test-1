const express = require("express");
const cors = require("cors");
const Parser = require("rss-parser");

const app = express();
app.use(cors());

const PRIMARY_FEED =
  "https://aviationweek.com/awn-rss/feed?field_content_source_target_id%5B%5D=1091";

// Open, bot-friendly fallbacks that still surface Aviation Week items and similar topics
const FALLBACK_FEEDS = [
  // Aviation Week via Google News RSS (public)
  "https://news.google.com/rss/search?q=site%3Aaviationweek.com+(modified+aircraft+OR+STC+OR+%22special+mission%22+OR+%22missionized%22)&hl=en-US&gl=US&ceid=US:en",
  // Broader “modified aircraft / special mission / STC” across reputable sources
  "https://news.google.com/rss/search?q=%28%22modified+aircraft%22+OR+%22special+mission%22+OR+STC+OR+%22missionized+aircraft%22%29+airline+OR+defense+OR+MRO&hl=en-US&gl=US&ceid=US:en",
  // EASA airworthiness / DOA changes often reference mods
  "https://www.easa.europa.eu/en/newsroom-andevents/news/rss.xml"
];

const parser = new Parser({
  headers: {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
    "Accept": "application/rss+xml, application/xml;q=0.9, */*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Cache-Control": "no-cache"
  },
  timeout: 15000
});

app.get("/", (_req, res) => {
  res.send("✅ Opportunities API is running. Try /opportunities and /health");
});

app.get("/health", async (_req, res) => {
  res.json({ ok: true, primary: PRIMARY_FEED, fallbacks: FALLBACK_FEEDS });
});

async function tryFeed(url) {
  const feed = await parser.parseURL(url);
  const items = (feed.items || []).map((it) => ({
    title: it.title || "",
    description: (it.contentSnippet || it.content || "").replace(/\s+/g, " ").trim(),
    buyer: "Aviation",
    disaster_type: "Aviation",
    region: "",
    deadline: "",
    source: feed.title || url,
    link: it.link || ""
  }));
  return items;
}

app.get("/opportunities", async (req, res) => {
  const q = (req.query.q || "").toString().trim().toLowerCase();
  const results = [];

  // 1) Try the protected Aviation Week feed first
  try {
    const items = await tryFeed(PRIMARY_FEED);
    results.push(...items);
  } catch (e) {
    console.warn("Primary feed blocked/unavailable:", e?.message || e);
  }

  // 2) If empty, try fallbacks
  if (results.length === 0) {
    for (const url of FALLBACK_FEEDS) {
      try {
        const items = await tryFeed(url);
        results.push(...items);
        if (results.length > 0) break;
      } catch (e) {
        console.warn("Fallback feed failed:", url, e?.message || e);
      }
    }
  }

  // 3) Filter if q is provided
  let filtered = results;
  if (q) {
    filtered = results.filter((it) => {
      const hay = (it.title + " " + it.description).toLowerCase();
      return hay.includes(q);
    });
  }

  if (filtered.length === 0) {
    // Return 200 with empty array so Squarespace never sees an "error"
    return res.json([]);
  }

  res.json(filtered);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on :${PORT}`));
