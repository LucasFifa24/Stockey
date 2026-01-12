
// ============================
// CONFIG
// ============================
const API_KEY = "77ff81accb7449078076fa13c52a3c32";
const BASE_URL = "https://api.twelvedata.com/time_series";

let currentSymbol = "";
let currentInterval = "5min";
let chartInstance = null;

// ============================
// PAGE NAVIGATION
// ============================
function showPage(pageId) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.getElementById(pageId).classList.add("active");

  document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
  event.target.closest(".nav-btn").classList.add("active");
}

// ============================
// SEARCH
// ============================
async function searchAsset(symbol = null) {
  const input = document.getElementById("searchInput");
  const asset = symbol || input.value.trim().toUpperCase();

  if (!asset) return;

  currentSymbol = asset;
  document.getElementById("chart").hidden = true;
  document.getElementById("assetInfo").innerHTML = "Loading…";

  try {
    const url = `${BASE_URL}?symbol=${asset}&interval=${currentInterval}&apikey=${API_KEY}&outputsize=50`;
    const res = await fetch(url);
    const data = await res.json();

    if (!data.values) {
      showInvalid(asset);
      return;
    }

    renderAsset(asset, data.values.reverse());
  } catch (err) {
    showInvalid(asset);
  }
}

// ============================
// INVALID SEARCH HANDLER
// ============================
function showInvalid(symbol) {
  document.getElementById("assetInfo").innerHTML =
    `<p style="color:#ff6b6b">❌ "${symbol}" not found. Check spelling.</p>`;

  document.getElementById("chartContainer").hidden = true;
  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }
}

// ============================
// RENDER DATA
// ============================
function renderAsset(symbol, values) {
  const last = values[values.length - 1];

  document.getElementById("assetInfo").innerHTML = `
    <h3>${symbol}</h3>
    <p>Price: <strong>$${last.close}</strong></p>
  `;

  drawChart(values);
  document.getElementById("chartContainer").hidden = false;
  document.getElementById("favBtn").hidden = false;
  updateFavButton();
}

// ============================
// CHART
// ============================
function drawChart(values) {
  const ctx = document.getElementById("chart").getContext("2d");

  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels: values.map(v => v.datetime),
      datasets: [{
        label: currentSymbol,
        data: values.map(v => v.close),
        borderColor: "#2ee59d",
        backgroundColor: "rgba(46,229,157,0.1)",
        tension: 0.25,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: "#9aa1c7" } },
        y: { ticks: { color: "#9aa1c7" } }
      }
    }
  });
}

// ============================
// TIMEFRAMES
// ============================
function setTimeframe(interval) {
  currentInterval = interval;
  if (currentSymbol) searchAsset(currentSymbol);
}

// ============================
// FAVORITES
// ============================
function getFavorites() {
  return JSON.parse(localStorage.getItem("favorites") || "[]");
}

function saveFavorites(favs) {
  localStorage.setItem("favorites", JSON.stringify(favs));
}

function toggleFavorite() {
  let favs = getFavorites();

  if (favs.includes(currentSymbol)) {
    favs = favs.filter(f => f !== currentSymbol);
  } else {
    favs.push(currentSymbol);
  }

  saveFavorites(favs);
  updateFavButton();
  renderFavorites();
}

function updateFavButton() {
  const favs = getFavorites();
  document.getElementById("favBtn").textContent =
    favs.includes(currentSymbol) ? "💔 Unfavorite" : "❤️ Favorite";
}

function renderFavorites() {
  const list = document.getElementById("favoritesList");
  const favs = getFavorites();

  list.innerHTML = "";

  if (!favs.length) {
    list.innerHTML = "<p>No favorites yet</p>";
    return;
  }

  favs.forEach(sym => {
    const div = document.createElement("div");
    div.textContent = sym;
    div.onclick = () => {
      showPage("search");
      document.getElementById("searchInput").value = sym;
      searchAsset(sym);
    };
    list.appendChild(div);
  });
}

// ============================
// INIT
// ============================
renderFavorites();
