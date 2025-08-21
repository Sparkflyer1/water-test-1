const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/opportunities", async (req, res) => {
  const { cpvCodes, keyword, places, size = 10 } = req.body;

  const payload = {
    searchScope: "ACTIVE",
    cpvCodes: cpvCodes || [],
    text: keyword || "",
    language: "EN",
    size,
    places
  };

  try {
    const response = await fetch("https://api.ted.europa.eu/v3/notices/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error(`TED API returned ${response.status}`);

    const data = await response.json();
    if (!data.notices) return res.json([]);

    const results = data.notices.map(n => ({
      title: n.title,
      buyer: (n.contractingAuthorities?.[0]?.name) ?? "N/A",
      cpv: (n.cpvCodes?.[0]?.[0]?.description) ?? "N/A",
      region: (n.placesOfPerformance?.[0]?.description) ?? "N/A",
      deadline: n.deadlineDate || n.publicationDate || "N/A",
      link: n.links?.canonical ?? ""
    }));

    res.json(results);
  } catch (err) {
    console.error("TED API error:", err);
    res.status(500).json({ error: "Failed to fetch TED opportunities" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
