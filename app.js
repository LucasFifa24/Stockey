const view = document.getElementById("view");
let priceInterval = null;

/* ---------- HOME ---------- */
async function loadHome() {
  const btc = await getCryptoPrice("BTC");
  const eth = await getCryptoPrice("ETH");

  view.innerHTML = `
    <h2>Home</h2>

    <div class="section">
      <div class="card row"><span>BTC</span><span>$${btc ?? "—"}</span></div>
      <div class="card row"><span>ETH</span><span>$${eth ?? "—"}</span></div>
    </div>
  `;
}

/* ---------- SEARCH ---------- */
function loadSearch() {
  view.innerHTML = `
    <h2>Search</h2>
    <input id="symbol" placeholder="BTC, ETH, SOL" />
    <button onclick="searchSymbol()">Search</button>
    <div id="searchResult"></div>
  `;
}

async function searchSymbol() {
  const symbol = document.getElementById("symbol").value.toUpperCase();
  if (!symbol) return;

  const result = document.getElementById("searchResult");
  const price = await getCryptoPrice(symbol);

  let ai = null;
  try {
    ai = await getAIBias(symbol);
  } catch {}

  const user = getCurrentUser();
  let isFav = false;

  if (user) {
    const data = getUserData();
    isFav = data.favorites.includes(symbol);
  }

  result.innerHTML = `
    <div class="card">
      <strong>${symbol}</strong>
      <p>Price: <span id="livePrice">$${price ?? "—"}</span></p>
      ${
        ai
          ? `<p>🤖 ${ai.bias}<br>Change: ${ai.change}%</p>`
          : ""
      }
      ${
        user
          ? `<button onclick="toggleFavorite('${symbol}')">
              ${isFav ? "💔 Unfavorite" : "❤️ Favorite"}
            </button>`
          : `<p>Sign in to favorite</p>`
      }
    </div>
  `;

  clearInterval(priceInterval);
  priceInterval = setInterval(async () => {
    const p = await getCryptoPrice(symbol);
    const el = document.getElementById("livePrice");
    if (el && p) el.innerText = `$${p}`;
  }, 20000);
}

/* ---------- FAVORITES ---------- */
function toggleFavorite(symbol) {
  const data = getUserData();
  if (data.favorites.includes(symbol)) {
    data.favorites = data.favorites.filter(s => s !== symbol);
  } else {
    data.favorites.push(symbol);
  }
  saveUserData(data);
  searchSymbol();
}

function loadFavorites() {
  const user = getCurrentUser();
  if (!user) {
    view.innerHTML = "<p>Please sign in.</p>";
    return;
  }

  const favs = getUserData().favorites;

  view.innerHTML = `
    <h2>Favorites</h2>
    ${
      favs.length === 0
        ? "<p>No favorites yet.</p>"
        : favs.map(f => `
            <div class="card row">
              <span>${f}</span>
              <button class="secondary" onclick="goToSymbol('${f}')">View</button>
            </div>
          `).join("")
    }
  `;
}

/* ---------- SETTINGS ---------- */
function loadSettings() {
  const user = getCurrentUser();

  view.innerHTML = user
    ? `
      <p>Signed in as <strong>${user}</strong></p>
      <button onclick="signOut(); loadHome()">Sign out</button>
    `
    : `
      <input id="u" placeholder="Username">
      <input id="p" placeholder="Password" type="password">
      <button onclick="signUp(u.value,p.value);loadHome()">Sign up</button>
      <button onclick="signIn(u.value,p.value)&&loadHome()">Sign in</button>
    `;
}

function goToSymbol(sym) {
  loadSearch();
  setTimeout(() => {
    document.getElementById("symbol").value = sym;
    searchSymbol();
  }, 100);
}

/* ---------- START ---------- */
loadHome();
