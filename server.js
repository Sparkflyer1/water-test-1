const express = require("express");
const cors = require("cors");
const RSSParser = require("rss-parser");

const app = express();
app.use(cors());
const parser = new RSSParser();

const aviationFeedUrl =
  "https://aviationweek.com/awn-rss/feed?field_content_source_target_id%5B%5D=1091";

app.get("/", (_req, res) => {
  res.send("Aviation Opportunities API is running. Visit /opportunities.");
});

app.get("/opportunities", async (_req, res) => {
  try {
    const feed = await parser.parseURL(aviationFeedUrl);
    const items = (feed.items || []).map(item => ({
      title: item.title || "",
      link: item.link || "",
      pubDate: item.pubDate || "",
      source: "Aviation Week – Source 1091",
      description: item.contentSnippet || item.content || ""
    }));
    res.json({ count: items.length, results: items });
  } catch (err) {
    console.error("Error fetching Aviation Week feed:", err.message || err);
    res
      .status(500)
      .json({ error: "Failed to fetch Aviation Week aviation feed" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server live on https://water-test-1-3m8r.onrender.com`);
});
