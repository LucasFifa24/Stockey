let chart;

/* PAGE NAV */
function showPage(id) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

/* HOME */
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

/* SEARCH + CHART */
async function searchAsset() {
  const symbol = document.getElementById("searchInput").value.trim();
  const result = document.getElementById("result");

  result.innerHTML = "Loading...";

  const d = await getAsset(symbol);

  if (!d || d.error) {
    result.innerHTML = `<p class="error">Check your spelling</p>`;
    return;
  }

  result.innerHTML = `
    <div class="card">
      <span>${symbol.toUpperCase()}</span>
      <span class="${d.signal.toLowerCase()}">${d.signal}</span>
    </div>
    <p>Price: $${d.price.toFixed(2)}</p>
    <p>Change: ${d.change.toFixed(2)}%</p>
  `;

  loadChart(symbol);
}

/* CHART LOADER */
async function loadChart(symbol) {
  symbol = symbol.toUpperCase();

  const url = `https://api.twelvedata.com/time_series?symbol=${symbol}&interval=5min&apikey=77ff81accb7449078076fa13c52a3c32`;
  const res = await fetch(url);
  const data = await res.json();

  if (!data.values) return;

  const labels = data.values.map(v => v.datetime).reverse();
  const prices = data.values.map(v => parseFloat(v.close)).reverse();

  const ctx = document.getElementById("chart").getContext("2d");

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: symbol,
        data: prices,
        borderWidth: 2,
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: { display: false }
      }
    }
  });
}

loadHome();
