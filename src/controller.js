const db = require("./db");
const redis = require("./redis");
const { nanoid } = require("nanoid");

// shorten URL
function shorten(req, res) {
  const { longUrl } = req.body;
  const code = nanoid(7);

  db.run(
    "INSERT INTO urls (code, long_url) VALUES (?, ?)",
    [code, longUrl],
    function (err) {
      if (err) {
        return res.status(500).json({ error: "DB error" });
      }

      res.json({
        shortUrl: `http://localhost:3000/${code}`
      });
    }
  );
}

// redirect
async function redirect(req, res) {
  const { code } = req.params;

  db.get(
    "SELECT long_url FROM urls WHERE code = ?",
    [code],
    async (err, row) => {
      if (err) return res.status(500).send("DB error");

      if (!row) return res.status(404).send("Not found");

      try {
        await redis.zincrby("leaderboard", 1, code);
      } catch (redisErr) {
        console.error("Redis leaderboard update failed:", redisErr);
      }

      res.redirect(row.long_url);
    }
  );
}

// stats

async function stats(req, res) {
  const { code } = req.params;

  try {
    const score = await redis.zscore("leaderboard", code);

    if (score !== null) {
      return res.json({
        code,
        totalClicks: Number(score)
      });
    }
  } catch (redisErr) {
    console.error("Redis stats fetch failed:", redisErr);
  }

  db.get(
    "SELECT clicks FROM urls WHERE code = ?",
    [code],
    (err, row) => {
      if (err) return res.status(500).json({ error: "DB error" });

      res.json({
        code,
        totalClicks: Number(row?.clicks || 0)
      });
    }
  );
}

// leaderboard 

async function leaderboard(req, res) {
  try {
    const entries = await redis.zrevrange("leaderboard", 0, 9, {
      WITHSCORES: true
    });

    if (!entries.length) {
      return res.json({ count: 0, leaderboard: [] });
    }

    const items = [];
    for (let i = 0; i < entries.length; i += 2) {
      items.push({ code: entries[i], clicks: Number(entries[i + 1]) });
    }

    const codes = items.map((item) => item.code);
    const placeholders = codes.map(() => "?").join(",");

    db.all(
      `SELECT code, long_url FROM urls WHERE code IN (${placeholders})`,
      codes,
      (err, rows) => {
        if (err) {
          return res.status(500).json({ error: "DB error" });
        }

        const urlMap = rows.reduce((acc, row) => {
          acc[row.code] = row.long_url;
          return acc;
        }, {});

        const leaderboard = items.map((item, index) => ({
          rank: index + 1,
          code: item.code,
          longUrl: urlMap[item.code] || null,
          clicks: item.clicks
        }));

        res.json({
          count: leaderboard.length,
          leaderboard
        });
      }
    );
  } catch (redisErr) {
    console.error("Redis leaderboard fetch failed:", redisErr);
    res.status(500).json({ error: "Leaderboard unavailable" });
  }
}

module.exports = { shorten, redirect, stats, leaderboard};
