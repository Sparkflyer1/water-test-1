const express = require("express");
const cors = require("cors");
const Parser = require("rss-parser");

const app = express();
app.use(cors());

const parser = new Parser();

app.get("/", (req, res) => {
  res.send("🌍 Opportunities API is running. Try /opportunities");
});

app.get("/opportunities", async (req, res) => {
  try {
    // TED EU tenders RSS feed
    const feed = await parser.parseURL("https://ted.europa.eu/TED/rss/en/RSS.xml");

    // Take first 5 opportunities and clean up fields
    const results = feed.items.slice(0, 5).map(item => ({
      title: item.title || "Untitled",
      buyer: item.creator || "N/A",
      disaster_type: "Procurement", // TED doesn’t classify disasters
      region: item.title?.match(/-\s([^,]+)/)?.[1] || "EU",
      deadline: item.pubDate || "N/A",
      link: item.link
    }));

    res.json(results);
  } catch (err) {
    console.error("EU TED fetch error:", err);
    res.status(500).json({ error: "Failed to fetch live EU opportunities" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
