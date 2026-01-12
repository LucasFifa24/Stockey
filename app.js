/* =========================
   CONFIG
========================= */
const TWELVE_API_KEY = "77ff81accb7449078076fa13c52a3c32";
const REFRESH_INTERVAL = 20000; // 20 seconds

/* =========================
   NAVIGATION
========================= */
const pages = document.querySelectorAll(".page");
const navButtons = document.querySelectorAll(".nav-btn");

function showPage(id) {
  pages.forEach(p => p.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  navButtons.forEach(b => b.classList.remove("active"));
  document.querySelector(`[data-page="${id}"]`).classList.add("active");
}

navButtons.forEach(b =>
  b.addEventListener("click", () => showPage(b.dataset.page))
);

/* =========================
   CLOCK
========================= */
function updateClock() {
  document.getElementById("clock").textContent =
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
setInterval(updateClock, 1000);
updateClock();

/* =========================
   ELEMENTS
========================= */
const searchInput = document.getElementById("searchInput");
const searchResult = document.getElementById("searchResult");
const assetName = document.getElementById("assetName");
const assetPrice = document.getElementById("assetPrice");
const searchError = document.getElementById("searchError");
const favBtn = document.getElementById("favBtn");
const favoritesList = document.getElementById("favoritesList");
const chart = document.getElementById("chart");
const ctx = chart.getContext("2d");
const tfButtons = document.querySelectorAll(".tf-btn");

/* =========================
   STATE
========================= */
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
let currentSymbol = null;
let currentTF = "1D";
let refreshTimer = null;

/* =========================
   TIMEFRAMES
========================= */
const TF_MAP = {
  "1D": { interval: "5min", size: 60 },
  "1W": { interval: "15min", size: 80 },
  "1M": { interval: "1h", size: 120 }
};

/* =========================
   DATA FETCH
========================= */
async function fetchData(symbol) {
  const tf = TF_MAP[currentTF];
  const url =
    `https://api.twelvedata.com/time_series` +
    `?symbol=${symbol}` +
    `&interval=${tf.interval}` +
    `&outputsize=${tf.size}` +
    `&apikey=${TWELVE_API_KEY}`;

  const res = await fetch(url);
  const data = await res.json();
  if (!data.values) throw new Error("Invalid symbol");
  return data.values.reverse();
}

/* =========================
   CHART HELPERS
========================= */
function clearChart() {
  ctx.clearRect(0, 0, chart.width, chart.height);
  chart.style.display = "none";
}

function drawCandles(values) {
  ctx.clearRect(0, 0, chart.width, chart.height);

  const pad = 20;
  const candleWidth = (chart.width - pad * 2) / values.length;

  const highs = values.map(v => +v.high);
  const lows = values.map(v => +v.low);
  const max = Math.max(...highs);
  const min = Math.min(...lows);

  function y(price) {
    return (
      chart.height -
      pad -
      ((price - min) / (max - min)) *
        (chart.height - pad * 2)
    );
  }

  values.forEach((v, i) => {
    const open = +v.open;
    const close = +v.close;
    const high = +v.high;
    const low = +v.low;

    const color = close >= open ? "#2ee59d" : "#ff6b6b";
    ctx.strokeStyle = color;
    ctx.fillStyle = color;

    const x = pad + i * candleWidth + candleWidth / 2;

    // Wick
    ctx.beginPath();
    ctx.moveTo(x, y(high));
    ctx.lineTo(x, y(low));
    ctx.stroke();

    // Body
    const bodyTop = y(Math.max(open, close));
    const bodyHeight = Math.abs(y(open) - y(close)) || 1;
    ctx.fillRect(
      x - candleWidth * 0.3,
      bodyTop,
      candleWidth * 0.6,
      bodyHeight
    );
  });
}

/* =========================
   LOAD & REFRESH
========================= */
async function loadSymbol(symbol) {
  clearChart();
  searchError.textContent = "";

  try {
    const values = await fetchData(symbol);
    const last = values[values.length - 1];

    currentSymbol = symbol;
    assetName.textContent = symbol;
    assetPrice.textContent = `$${last.close}`;
    searchResult.style.display = "block";

    chart.style.display = "block";
    drawCandles(values);
    updateFavBtn();
    startAutoRefresh();
  } catch {
    clearChart();
    searchError.textContent = "Check your spelling or symbol";
    stopAutoRefresh();
  }
}

/* =========================
   AUTO REFRESH
========================= */
function startAutoRefresh() {
  stopAutoRefresh();
  refreshTimer = setInterval(() => {
    if (currentSymbol) loadSymbol(currentSymbol);
  }, REFRESH_INTERVAL);
}

function stopAutoRefresh() {
  if (refreshTimer) clearInterval(refreshTimer);
  refreshTimer = null;
}

/* =========================
   SEARCH
========================= */
searchInput.addEventListener("keydown", (e) => {
  if (e.key !== "Enter") return;
  const symbol = searchInput.value.trim().toUpperCase();
  if (symbol) loadSymbol(symbol);
});

/* =========================
   TIMEFRAME SWITCH
========================= */
tfButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    if (!currentSymbol) return;
    tfButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentTF = btn.dataset.tf;
    loadSymbol(currentSymbol);
  });
});

/* =========================
   FAVORITES
========================= */
function updateFavBtn() {
  favBtn.textContent = favorites.includes(currentSymbol) ? "♥" : "♡";
}

favBtn.onclick = () => {
  if (!currentSymbol) return;
  favorites.includes(currentSymbol)
    ? favorites = favorites.filter(f => f !== currentSymbol)
    : favorites.push(currentSymbol);

  localStorage.setItem("favorites", JSON.stringify(favorites));
  updateFavBtn();
  renderFavorites();
};

function renderFavorites() {
  favoritesList.innerHTML = favorites.length ? "" : "No favorites yet";
  favorites.forEach(sym => {
    const card = document.createElement("div");
    card.className = "card";
    card.textContent = sym;
    card.onclick = () => {
      showPage("page-search");
      searchInput.value = sym;
      loadSymbol(sym);
    };
    favoritesList.appendChild(card);
  });
}

renderFavorites();
clearChart();