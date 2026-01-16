// ============================
// COONFIG
// ============================
const API_KEY = "77ff81accb7449078076fa13c52a3c32";
const BASE_URL = "https://api.twelvedata.com/time_series";

let currentSymbol = "";
let currentInterval = "5min";
let chartInstance = null;

const pages = ["home", "search", "favorites"];

// ============================
// PAGE NAVIGATION (SAFE)
// ============================
function showPage(pageId, navButton = null) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));

  document.getElementById(pageId).classList.add("active");

  if (navButton) {
    navButton.classList.add("active");
  } else {
    document
      .querySelector(`.nav-btn[onclick*="${pageId}"]`)
      ?.classList.add("active");
  }
}

// ============================
// HOMEPAGE DATA
// ============================
function loadHomePage() {
  const aiBuyAssets = ["AAPL", "TSLA", "GOOGL"];
  const aiSellAssets = ["AMZN", "NFLX", "META"];
  const popularStocks = ["AAPL", "MSFT", "NVDA", "TSLA", "AMD"];

  const aiBuyList = document.getElementById("aiBuyList");
  const aiSellList = document.getElementById("aiSellList");
  const popularStocksList = document.getElementById("popularStocksList");

  aiBuyList.innerHTML = "";
  aiSellList.innerHTML = "";
  popularStocksList.innerHTML = "";

  [...aiBuyAssets, ...aiSellAssets, ...popularStocks].forEach(sym => {
    const li = document.createElement("li");
    li.textContent = sym;
    li.onclick = () => quickSearch(sym);
  });

  aiBuyAssets.forEach(sym => {
    const li = document.createElement("li");
    li.textContent = sym;
    li.onclick = () => quickSearch(sym);
    aiBuyList.appendChild(li);
  });

  aiSellAssets.forEach(sym => {
    const li = document.createElement("li");
    li.textContent = sym;
    li.onclick = () => quickSearch(sym);
    aiSellList.appendChild(li);
  });

  popularStocks.forEach(sym => {
    const li = document.createElement("li");
    li.textContent = sym;
    li.onclick = () => quickSearch(sym);
    popularStocksList.appendChild(li);
  });
}

function quickSearch(symbol) {
  showPage("search");

  // ✅ WAIT for page to activate before searching
  requestAnimationFrame(() => {
    document.getElementById("searchInput").value = symbol;
    searchAsset(symbol);
  });
}

loadHomePage();

// ============================
// SEARCH
// ============================
async function searchAsset(symbol = null) {
  const input = document.getElementById("searchInput");
  const asset = symbol || input.value.trim().toUpperCase();
  if (!asset) return;
// ============================
// TIMEFRAMES
// ============================
function setTimeframe(interval) {
  currentInterval = interval;

  // Only reload if something is already searched
  if (currentSymbol) {
    searchAsset(currentSymbol);
  }
}

  currentSymbol = asset;
  document.getElementById("chartContainer").hidden = true;
  document.getElementById("favBtn").hidden = true;
  document.getElementById("assetInfo").innerHTML = "Loading…";

  try {
    const url = `${BASE_URL}?symbol=${asset}&interval=${currentInterval}&apikey=${API_KEY}&outputsize=60`;
    const res = await fetch(url);
    const data = await res.json();

    if (!data.values) return showInvalid(asset);

    renderAsset(asset, data.values.reverse());
  } catch {
    showInvalid(asset);
  }
}

// ============================
// INVALID SEARCH
// ============================
function showInvalid(symbol) {
  document.getElementById("assetInfo").innerHTML =
    `<p style="color:#ff6b6b">❌ "${symbol}" not found.</p>`;

  document.getElementById("chartContainer").hidden = true;
  document.getElementById("favBtn").hidden = true;

  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }
}

// ============================
// RENDER ASSET
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
      plugins: { legend: { display: false } }
    }
  });
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
  favs = favs.includes(currentSymbol)
    ? favs.filter(f => f !== currentSymbol)
    : [...favs, currentSymbol];

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

  list.innerHTML = favs.length ? "" : "<p>No favorites yet</p>";

  favs.forEach(sym => {
    const div = document.createElement("div");
    div.textContent = sym;
    div.onclick = () => quickSearch(sym);
    list.appendChild(div);
  });
}

renderFavorites();
