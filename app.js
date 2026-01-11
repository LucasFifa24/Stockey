function showPage(id) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

/* HOME LOAD */
async function loadHome() {
  const trendingSymbols = ["AAPL", "BTC/USD", "SP500"];
  const aiSymbols = ["TSLA", "ETH/USD"];

  const trending = document.getElementById("trending");
  const aiPicks = document.getElementById("aiPicks");

  trending.innerHTML = "";
  aiPicks.innerHTML = "";

  for (const s of trendingSymbols) {
    const d = await getAsset(s);
    if (!d || d.error) continue;

    trending.innerHTML += `
      <div class="card">
        <span>${s}</span>
        <span class="${d.signal.toLowerCase()}">${d.signal}</span>
      </div>
    `;
  }

  for (const s of aiSymbols) {
    const d = await getAsset(s);
    if (!d || d.error) continue;

    aiPicks.innerHTML += `
      <div class="card">
        <span>${s}</span>
        <span class="${d.signal.toLowerCase()}">${d.signal}</span>
      </div>
    `;
  }
}

/* SEARCH */
async function searchAsset() {
  const input = document.getElementById("searchInput").value.trim();
  const result = document.getElementById("result");
  result.innerHTML = "Loading...";

  const d = await getAsset(input);

  if (!d || d.error) {
    result.innerHTML = `<p class="error">Check your spelling</p>`;
    return;
  }

  result.innerHTML = `
    <div class="card">
      <span>${input.toUpperCase()}</span>
      <span class="${d.signal.toLowerCase()}">${d.signal}</span>
    </div>
    <p>Price: $${d.price.toFixed(2)}</p>
    <p>Change: ${d.change.toFixed(2)}%</p>
  `;
}

loadHome();
