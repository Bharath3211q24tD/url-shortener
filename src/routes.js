const express = require("express");
const router = express.Router();
const { shorten, redirect, stats, leaderboard } = require("./controller");

router.post("/shorten", shorten);
router.get("/leaderboard", leaderboard);
router.get("/stats/:code", stats);
router.get("/:code", redirect);
module.exports = router;
