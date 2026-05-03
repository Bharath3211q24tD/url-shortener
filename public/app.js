const shortenForm = document.getElementById("shorten-form");
const longUrlInput = document.getElementById("longUrl");
const shortenResult = document.getElementById("shorten-result");
const leaderboardTable = document.getElementById("leaderboard-table");
const leaderboardBody = leaderboardTable.querySelector("tbody");
const leaderboardLoading = document.getElementById("leaderboard-loading");
const statsForm = document.getElementById("stats-form");
const statsCodeInput = document.getElementById("statsCode");
const statsResult = document.getElementById("stats-result");

async function fetchLeaderboard() {
  leaderboardLoading.hidden = false;
  leaderboardTable.hidden = true;
  leaderboardBody.innerHTML = "";

  try {
    const response = await fetch("/leaderboard");
    const data = await response.json();

    leaderboardLoading.hidden = true;

    if (!data.leaderboard || !data.leaderboard.length) {
      leaderboardLoading.textContent = "No leaderboard entries yet.";
      return;
    }

    data.leaderboard.forEach((item) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${item.rank}</td>
        <td><code>${item.code}</code></td>
        <td><a href="/${item.code}" target="_blank" rel="noreferrer">${item.longUrl}</a></td>
        <td>${item.clicks}</td>
      `;
      leaderboardBody.appendChild(row);
    });

    leaderboardTable.hidden = false;
  } catch (err) {
    leaderboardLoading.textContent = "Unable to load leaderboard.";
    console.error(err);
  }
}

shortenForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  shortenResult.textContent = "Shortening…";

  try {
    const response = await fetch("/shorten", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ longUrl: longUrlInput.value.trim() })
    });

    const data = await response.json();

    if (!response.ok) {
      shortenResult.textContent = data.error || "Unable to shorten URL.";
      return;
    }

    shortenResult.innerHTML = `Short URL: <a href="${data.shortUrl}" target="_blank" rel="noreferrer">${data.shortUrl}</a>`;
    longUrlInput.value = "";
    fetchLeaderboard();
  } catch (err) {
    shortenResult.textContent = "Network error while shortening.";
    console.error(err);
  }
});

statsForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  statsResult.textContent = "Fetching stats…";

  try {
    const code = statsCodeInput.value.trim();
    const response = await fetch(`/stats/${encodeURIComponent(code)}`);
    const data = await response.json();

    if (!response.ok) {
      statsResult.textContent = data.error || "Could not load stats.";
      return;
    }

    statsResult.innerHTML = `Code: <code>${data.code}</code><br />Total Clicks: <strong>${data.totalClicks}</strong>`;
  } catch (err) {
    statsResult.textContent = "Network error while loading stats.";
    console.error(err);
  }
});

fetchLeaderboard();
