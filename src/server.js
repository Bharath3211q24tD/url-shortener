require("dotenv").config();
const path = require("path");
const express = require("express");
const app = express();
const routes = require("./routes");
const syncClicks = require("./sync");

const PORT = process.env.PORT || 3000;
const publicPath = path.join(__dirname, "..", "public");

app.use(express.json());
app.use(express.static(publicPath));

app.get("/", (req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

app.use("/", routes);

let syncStarted = false;

if (!syncStarted) {
  syncStarted = true;

  setInterval(async () => {
    try {
      await syncClicks();
    } catch (err) {
      console.error("Sync error:", err);
    }
  }, 30000);

  console.log("🟢 Sync job started once");
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
