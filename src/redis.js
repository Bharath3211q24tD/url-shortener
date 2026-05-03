const { createClient } = require("redis");

const client = createClient({
  url: process.env.REDIS_URL || "redis://127.0.0.1:6379"
});

client.connect();

client.on("error", (err) => {
  console.error("Redis error:", err);
});

module.exports = client;
