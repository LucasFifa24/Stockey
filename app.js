/* =========================
   CONFIG
========================= */
const TWELVE_API_KEY = "77ff81accb7449078076fa13c52a3c32";

/* =========================
   PAGE NAVIGATION
========================= */
const pages = document.querySelectorAll(".page");
const navButtons = document.querySelectorAll(".nav-btn");

function showPage(pageId) {
  pages.forEach(p => p.classList.remove("active", "slide-in"));
  const page = document.getElementById(pageId);
  page.classList.add("active", "slide-in");

  navButtons.forEach(b => b.classList.remove("active"));
  document.querySelector(`[data-page="${pageId}"]`).classList.add("active");
}

navButtons.forEach(btn => {
  btn.addEventListener("click", () => showPage(btn.dataset.page));
});

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
   SEARCH + FAVORITES
========================= */
const searchInput = document.getElementById("searchInput");
const searchResult = document.getElementById("searchResult");
const assetName = document.getElementById("assetName");
const assetPrice = document.getElementById("assetPrice");
const searchError = document.getElementById("searchError");
const favBtn = document.getElementById("favBtn");
const favoritesList = document.getElementById("favoritesList");

let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
let currentSymbol = null;

/* =========================
   TWELVE DATA FETCH
========================= */
async function fetchTwelveData(symbol) {
  const url =
    `https://api.twelvedata.com/time_series` +
    `?symbol=${symbol}` +
    `&interval=5min` +
    `&outputsize=60` +
    `&apikey=${TWELVE_API_KEY}`;

  const res = await fetch(url);
  const data = await res.json();

  if (!data.values) throw new Error("No data");

  return data.values.reverse();
}

/* =========================
   CHART
========================= */
const chart = document.getElementById("chart");
const ctx = chart.getContext("2d");

function clearChart() {
  ctx.clearRect(0, 0, chart.width, chart.height);
  chart.style.display = "none";
}

function drawChart(values) {
  ctx.clearRect(0, 0, chart.width, chart.height);

  const prices = values.map(v => Number(v.close));
  const max = Math.max(...prices);
  const min = Math.min(...prices);
  const padding = 20;

  const up = prices[prices.length - 1] >= prices[0];
  ctx.strokeStyle = up ? "#2ee59d" : "#ff6b6b";
  ctx.lineWidth = 2;
  ctx.shadowColor = ctx.strokeStyle;
  ctx.shadowBlur = 10;

  ctx.beginPath();
  prices.forEach((price, i) => {
    const x =
      padding +
      (i / (prices.length - 1)) * (chart.width - padding * 2);
    const y =
      chart.height -
      padding -
      ((price - min) / (max - min)) *
        (chart.height - padding * 2);

    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });

  ctx.stroke();
  ctx.shadowBlur = 0;
}

/* =========================
   SEARCH HANDLER
========================= */
searchInput.addEventListener("keydown", async (e) => {
  if (e.key !== "Enter") return;

  clearChart(); // Clear chart immediately when starting a new search

  const symbol = searchInput.value.trim().toUpperCase();
  searchError.textContent = "";
  searchResult.style.display = "none";

  if (!symbol) return;

  try {
    const values = await fetchTwelveData(symbol);
    const latest = values[values.length - 1];

    currentSymbol = symbol;
    assetName.textContent = symbol;
    assetPrice.textContent = `$${latest.close}`;
    searchResult.style.display = "block";
    chart.style.display = "block";

    drawChart(values);
    updateFavButton();

  } catch {
    searchError.textContent = "Check your spelling or symbol availability";
    clearChart();
  }
});

/* =========================
   FAVORITES
========================= */
function updateFavButton() {
  if (favorites.includes(currentSymbol)) {
    favBtn.textContent = "♥";
    favBtn.classList.add("active");
  } else {
    favBtn.textContent = "♡";
    favBtn.classList.remove("active");
  }
}

favBtn.addEventListener("click", () => {
  if (!currentSymbol) return;

  if (favorites.includes(currentSymbol)) {
    favorites = favorites.filter(f => f !== currentSymbol);
  } else {
    favorites.push(currentSymbol);
  }

  localStorage.setItem("favorites", JSON.stringify(favorites));
  updateFavButton();
  renderFavorites();
});

function renderFavorites() {
  if (favorites.length === 0) {
    favoritesList.textContent = "No favorites yet";
    return;
  }

  favoritesList.innerHTML = "";
  favorites.forEach(symbol => {
    const card = document.createElement("div");
    card.className = "card";
    card.textContent = symbol;

    card.onclick = () => {
      showPage("page-search");
      searchInput.value = symbol;
      searchInput.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
    };

    favoritesList.appendChild(card);
  });
}

renderFavorites();
