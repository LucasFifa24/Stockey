/* =========================
   PAGE NAVIGATION + ANIMATION
========================= */
const pages = document.querySelectorAll(".page");
const navButtons = document.querySelectorAll(".nav-btn");

function showPage(pageId) {
  pages.forEach(page => {
    page.classList.remove("active", "slide-in");
  });

  const target = document.getElementById(pageId);
  target.classList.add("active", "slide-in");

  navButtons.forEach(btn => btn.classList.remove("active"));
  document.querySelector(`[data-page="${pageId}"]`).classList.add("active");
}

navButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    showPage(btn.dataset.page);
  });
});

/* =========================
   CLOCK
========================= */
function updateClock() {
  const now = new Date();
  document.getElementById("clock").textContent =
    now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
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

searchInput?.addEventListener("keydown", async (e) => {
  if (e.key !== "Enter") return;

  const symbol = searchInput.value.trim().toUpperCase();
  searchError.textContent = "";
  searchResult.style.display = "none";

  if (!symbol) return;

  try {
    // MOCK price (safe, no API errors)
    const price = (Math.random() * 1000).toFixed(2);

    currentSymbol = symbol;
    assetName.textContent = symbol;
    assetPrice.textContent = `$${price}`;
    searchResult.style.display = "block";
     
    const data = generateMockData();
    drawChart(data);

    updateFavButton();
  } catch {
    searchError.textContent = "Check your spelling or symbol";
  }
});

function updateFavButton() {
  if (favorites.includes(currentSymbol)) {
    favBtn.textContent = "♥";
    favBtn.classList.add("active");
  } else {
    favBtn.textContent = "♡";
    favBtn.classList.remove("active");
  }
}

favBtn?.addEventListener("click", () => {
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

/* =========================
   FAVORITES PAGE
========================= */
function renderFavorites() {
  if (favorites.length === 0) {
    favoritesList.textContent = "No favorites yet";
    return;
  }

  favoritesList.innerHTML = "";
  favorites.forEach(symbol => {
    const div = document.createElement("div");
    div.className = "card";
    div.textContent = symbol;

    div.onclick = () => {
      showPage("page-search");
      searchInput.value = symbol;
      searchInput.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
    };

    favoritesList.appendChild(div);
  });
}

renderFavorites();


/* =========================
   SIMPLE PRICE CHART
========================= */
const chart = document.getElementById("chart");
const ctx = chart.getContext("2d");

function generateMockData() {
  let price = Math.random() * 100 + 50;
  return Array.from({ length: 30 }, () => {
    price += (Math.random() - 0.5) * 5;
    return price;
  });
}

function drawChart(data) {
  ctx.clearRect(0, 0, chart.width, chart.height);

  const padding = 20;
  const max = Math.max(...data);
  const min = Math.min(...data);

  ctx.beginPath();
  ctx.strokeStyle = "#2ee59d";
  ctx.lineWidth = 2;

  data.forEach((value, index) => {
    const x =
      padding +
      (index / (data.length - 1)) * (chart.width - padding * 2);
    const y =
      chart.height -
      padding -
      ((value - min) / (max - min)) *
        (chart.height - padding * 2);

    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });

  ctx.shadowColor = "#2ee59d";
  ctx.shadowBlur = 10;
  ctx.stroke();
  ctx.shadowBlur = 0;
}

