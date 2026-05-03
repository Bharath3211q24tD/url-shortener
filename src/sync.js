const redis = require("./redis");
const db = require("./db");

async function syncClicks() {
  const entries = await redis.zrevrange("leaderboard", 0, -1, {
    WITHSCORES: true
  });

  if (!entries.length) {
    console.log("🔄 No leaderboard entries to sync");
    return;
  }

  for (let i = 0; i < entries.length; i += 2) {
    const code = entries[i];
    const score = Number(entries[i + 1]);

    db.run(
      "UPDATE urls SET clicks = ? WHERE code = ?",
      [score, code],
      (err) => {
        if (err) {
          console.error(`DB sync failed for ${code}:`, err);
        }
      }
    );
  }

  console.log(`🔄 Synced ${entries.length / 2} leaderboard entries to DB`);
}

module.exports = syncClicks;
