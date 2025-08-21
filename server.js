const express = require("express");
const cors = require("cors");
const Parser = require("rss-parser");

const app = express();
app.use(cors());

const parser = new Parser();

// Root route just to confirm API is live
app.get("/", (req, res) => {
  res.send("🌍 Opportunities API is running. Use /opportunities to fetch live data.");
});

// Fetch live opportunities from TED RSS (filtering for aerial)
app.get("/opportunities", async (req, res) => {
  try {
    // RSS feed from TED (CPV 60441000 = air transport services)
    const url = "https://ted.europa.eu/udl?uri=TED:NOTICE:RSS&filter=60441000&scope=ACTIVE";

    const feed = await parser.parseURL(url);

    // Parse items into a cleaner JSON structure
    const items = feed.items.map((item) => ({
      title: item.title || "",
      link: item.link || "",
      pubDate: item.pubDate || "",
      description: item.contentSnippet || "",
    }));

    res.json(items);
  } catch (err) {
    console.error("Error fetching TED RSS:", err.message);
    res.status(500).json({ error: "Failed to fetch live EU opportunities" });
  }
});

// Render sets PORT automatically
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running at https://water-test-1-3m8r.onrender.com (port ${PORT})`);
});
