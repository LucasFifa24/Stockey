let chart;
let currentTimeframe = '1d';

// Page navigation
function showPage(id) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

// Load home page data
async function loadHome() {
  const trendingSymbols = ["AAPL", "BTC/USD", "SP500"];
  const aiSymbols = ["TSLA", "ETH/USD"];

  const trending = document.getElementById("trending");
  const aiPicks = document.getElementById("aiPicks");

  trending.innerHTML = "";
  aiPicks.innerHTML = "";

  for (const s of trendingSymbols) {
    const d = await getAsset(s);
    if (d.error) continue;

    trending.innerHTML += `
      <div class="card">
        <span>${s}</span>
        <span class="${d.signal.toLowerCase()}">${d.signal}</span>
      </div>
    `;
  }

  for (const s of aiSymbols) {
    const d = await getAsset(s);
    if (d.error) continue;

    aiPicks.innerHTML += `
      <div class="card">
        <span>${s}</span>
        <span class="${d.signal.toLowerCase()}">${d.signal}</span>
      </div>
    `;
  }
}

// Search and display asset data
async function searchAsset() {
  const symbol = document.getElementById("searchInput").value.trim();
  const result = document.getElementById("result");

  result.innerHTML = "Loading...";

  const d = await getAsset(symbol, currentTimeframe);

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

// Load chart for the searched asset
async function loadChart(symbol) {
  const interval = getInterval(currentTimeframe);
  const timeSeries = await getTimeSeries(symbol, interval);

  if (!timeSeries) return;

  const { labels, prices } = timeSeries;

  const ctx = document.getElementById("chart").getContext("2d");

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [{
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

// Change timeframe and reload chart
function changeTimeframe(timeframe) {
  currentTimeframe = timeframe;
  const symbol = document.getElementById("searchInput").value.trim();
  if (symbol) {
    loadChart(symbol);
  }
}

// Map timeframe to interval
function getInterval(timeframe) {
  switch (timeframe) {
    case '1d': return '1min';
    case '1w': return '5min';
    case '1m': return '15min';
    default: return '1min';
  }
}

// Save and load favorites
function addToFavorites(symbol) {
  let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  if (!favorites.includes(symbol)) {
    favorites.push(symbol);
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }
  loadFavorites();
}

function loadFavorites() {
  const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  const favoritesList = document.getElementById("favoritesList");
  favoritesList.innerHTML = '';

  for (const symbol of favorites) {
    favoritesList.innerHTML += `<div class="card">${symbol} <button onclick="removeFromFavorites('${symbol}')">Remove</button></div>`;
  }
}

function removeFromFavorites(symbol) {
  let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  favorites = favorites.filter(item => item !== symbol);
  localStorage.setItem('favorites', JSON.stringify(favorites));
  loadFavorites();
}

// Initialize home page on load
loadHome();
loadFavorites();
