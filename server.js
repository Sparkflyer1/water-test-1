const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());

// Temporary demo data (replace later with live feeds)
const opportunities = [
  {
    title: "Air Cargo Charter for Relief Supplies",
    buyer: "World Food Programme",
    disaster_type: "Flood",
    region: "Mozambique",
    deadline: "2025-09-10",
    link: "https://www.ungm.org/Notice/12345"
  },
  {
    title: "Emergency Aerial Survey for Drought Assessment",
    buyer: "USAID",
    disaster_type: "Drought",
    region: "Kenya",
    deadline: "2025-09-20",
    link: "https://sam.gov/example"
  },
  {
    title: "Aerial Firefighting Support",
    buyer: "Ministry of Interior, Greece",
    disaster_type: "Snowmelt",
    region: "Greece",
    deadline: "2025-09-15",
    link: "https://ted.europa.eu/example"
  }
];

app.get("/", (req, res) => {
  res.send("🌍 Opportunities API is running. Try /opportunities");
});

app.get("/opportunities", (req, res) => {
  res.json(opportunities);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
