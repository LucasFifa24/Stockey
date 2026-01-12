/* =========================
   CONFIG
========================= */
const TWELVE_API_KEY = "77ff81accb7449078076fa13c52a3c32";

/* =========================
   PAGE NAV
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

/* =========================
   TIMEFRAME CONFIG
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

  if (!data.values) throw new Error("Invalid");

  return data.values.reverse();
}

/* =========================
   CHART
========================= */
function clearChart() {
  ctx.clearRect(0, 0, chart.width, chart.height);
  chart.style.display = "none";
}

function drawChart(values) {
  ctx.clearRect(0, 0, chart.width, chart.height);

  const prices = values.map(v => Number(v.close));
  const max = Math.max(...prices);
  const min = Math.min(...prices);
  const pad = 20;

  ctx.strokeStyle =
    prices[prices.length - 1] >= prices[0] ? "#2ee59d" : "#ff6b6b";
  ctx.lineWidth = 2;

  ctx.beginPath();
  prices.forEach((p, i) => {
    const x = pad + (i / (prices.length - 1)) * (chart.width - pad * 2);
    const y =
      chart.height -
      pad -
      ((p - min) / (max - min)) * (chart.height - pad * 2);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });

  ctx.stroke();
}

/* =========================
   SEARCH
========================= */
searchInput.addEventListener("keydown", async (e) => {
  if (e.key !== "Enter") return;

  clearChart();
  searchError.textContent = "";

  const symbol = searchInput.value.trim().toUpperCase();
  if (!symbol) return;

  try {
    const values = await fetchData(symbol);
    const latest = values[values.length - 1];

    currentSymbol = symbol;
    assetName.textContent = symbol;
    assetPrice.textContent = `$${latest.close}`;
    searchResult.style.display = "block";

    chart.style.display = "block";
    drawChart(values);
    updateFavBtn();
  } catch {
    searchError.textContent = "Check your spelling or symbol";
    clearChart();
  }
});

/* =========================
   TIMEFRAME SWITCH
========================= */
tfButtons.forEach(btn => {
  btn.addEventListener("click", async () => {
    if (!currentSymbol) return;

    tfButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    currentTF = btn.dataset.tf;
    clearChart();

    try {
      const values = await fetchData(currentSymbol);
      chart.style.display = "block";
      drawChart(values);
    } catch {
      clearChart();
    }
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
  favorites.forEach(s => {
    const div = document.createElement("div");
    div.className = "card";
    div.textContent = s;
    div.onclick = () => {
      showPage("page-search");
      searchInput.value = s;
      searchInput.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
    };
    favoritesList.appendChild(div);
  });
}

renderFavorites();
clearChart();