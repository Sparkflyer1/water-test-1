const express = require("express");
const cors = require("cors");
const RSSParser = require("rss-parser");

const app = express();
app.use(cors());
const parser = new RSSParser();

app.get("/", (req, res) => {
  res.send("🌍 Opportunities API is running. Try /opportunities");
});

app.get("/opportunities", async (req, res) => {
  try {
    const feedUrl = "https://ted.europa.eu/en/search/result?classification-cpv=60441000&search-scope=ACTIVE&format=RSS";
    const feed = await parser.parseURL(feedUrl);

    const opportunities = feed.items.map(item => ({
      title: item.title,
      link: item.link,
      pubDate: item.pubDate,
      description: item.contentSnippet || item.content
    }));

    res.json(opportunities);
  } catch (err) {
    console.error("RSS Fetch Error:", err.message);
    res.status(500).json({ error: "Failed to fetch live EU opportunities" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
