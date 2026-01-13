// ============================
// CONNFIG
// ============================
const API_KEY = "77ff81accb7449078076fa13c52a3c32";
const RSI_URL = "https://api.twelvedata.com/rsi";
const EMA_URL = "https://api.twelvedata.com/ema";
const SYMBOLS = {
  buy: ["AAPL", "TSLA", "GOOGL"],
  sell: ["AMZN", "NFLX", "META"],
  popular: ["AAPL", "MSFT", "NVDA", "TSLA", "AMD"]
};

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
// HOMEPAGE DATA (REAL SIGNALS)
// ============================
async function loadHomePage() {
  const aiBuyList = document.getElementById("aiBuyList");
  const aiSellList = document.getElementById("aiSellList");
  const popularStocksList = document.getElementById("popularStocksList");

  aiBuyList.innerHTML = "";
  aiSellList.innerHTML = "";
  popularStocksList.innerHTML = "";

  // Fetch and process Buy assets
  for (let symbol of SYMBOLS.buy) {
    const signal = await getSignal(symbol);
    if (signal === "buy") {
      const li = createListItem(symbol);
      aiBuyList.appendChild(li);
    }
  }

  // Fetch and process Sell assets
  for (let symbol of SYMBOLS.sell) {
    const signal = await getSignal(symbol);
    if (signal === "sell") {
      const li = createListItem(symbol);
      aiSellList.appendChild(li);
    }
  }

  // Populate popular stocks (static)
  SYMBOLS.popular.forEach(symbol => {
    const li = createListItem(symbol);
    popularStocksList.appendChild(li);
  });
}

// Helper to create a list item with search functionality
function createListItem(symbol) {
  const li = document.createElement("li");
  li.textContent = symbol;
  li.onclick = () => quickSearch(symbol);
  return li;
}

// ============================
// Fetch Technical Indicators
// ============================
async function getSignal(symbol) {
  try {
    const rsiResponse = await fetch(`${RSI_URL}?symbol=${symbol}&interval=1day&time_period=14&apikey=${API_KEY}`);
    const rsiData = await rsiResponse.json();

    const emaResponse = await fetch(`${EMA_URL}?symbol=${symbol}&interval=1day&time_period=20&apikey=${API_KEY}`);
    const emaData = await emaResponse.json();

    if (!rsiData.values || !emaData.values) return "neutral";

    const latestRSI = parseFloat(rsiData.values[0].rsi);
    const latestEMA = parseFloat(emaData.values[0].ema);
    const latestPrice = parseFloat(rsiData.values[0].close);

    let signal = "neutral";

    if (latestRSI < 30 && latestPrice < latestEMA) {
      signal = "buy";
    } else if (latestRSI > 70 && latestPrice > latestEMA) {
      signal = "sell";
    }

    return signal;

  } catch (error) {
    console.error(`Error fetching data for ${symbol}:`, error);
    return "neutral";
  }
}

// ============================
// SEARCH
// ============================
async function searchAsset(symbol = null) {
  const input = document.getElementById("searchInput");
  const asset = symbol || input.value.trim().toUpperCase();
  if (!asset) return;

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

// ============================
// SWIPE GESTURES
// ============================
let startX = 0;
let startY = 0;

document.addEventListener("touchstart", e => {
  startX = e.touches[0].clientX;
  startY = e.touches[0].clientY;
}, { passive: true });

document.addEventListener("touchend", e => {
  const dx = e.changedTouches[0].clientX - startX;
  const dy = e.changedTouches[0].clientY - startY;

  if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy)) return;

  const current = pages.findIndex(id =>
    document.getElementById(id).classList.contains("active")
  );

  if (dx < 0 && current < pages.length - 1) {
    showPage(pages[current + 1]);
  }

  if (dx > 0 && current > 0) {
    showPage(pages[current - 1]);
  }
});
