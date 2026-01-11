const view = document.getElementById("view");

/* ================= HOME ================= */

function loadHome() {
  view.innerHTML = `
    <h2 class="section-title">Trending</h2>

    <div class="card">
      <strong>BTC</strong>
      <span class="badge buy">BUY</span>
      <p>Strong momentum</p>
    </div>

    <div class="card">
      <strong>ETH</strong>
      <span class="badge buy">BUY</span>
      <p>Bullish continuation</p>
    </div>

    <div class="card">
      <strong>SOL</strong>
      <span class="badge sell">SELL</span>
      <p>Overextended</p>
    </div>

    <h2 class="section-title">Popular</h2>

    <div class="card">AAPL</div>
    <div class="card">TSLA</div>
    <div class="card">SPY</div>
  `;
}

/* ================= SEARCH ================= */

function loadSearch() {
  view.innerHTML = `
    <h2 class="section-title">Search</h2>
    <input id="symbolInput" placeholder="BTC, AAPL, EURUSD=X" />
    <button class="action" onclick="search()">Search</button>
    <div id="result"></div>
  `;
}

async function search() {
  const resultEl = document.getElementById("result");
  const symbol = document
    .getElementById("symbolInput")
    .value
    .trim()
    .toUpperCase();

  if (!symbol) {
    resultEl.innerHTML = `
      <div class="card">Please enter a symbol</div>
    `;
    return;
  }

  resultEl.innerHTML = `<div class="card">Loading...</div>`;

  try {
    const data = await getAsset(symbol);

    if (!data || !data.price) {
      resultEl.innerHTML = `
        <div class="card">
          ❌ Could not find "${symbol}"<br><br>
          <small>Check your spelling or try another symbol</small>
        </div>
      `;
      return;
    }

    let badgeClass = "";
    if (data.signal === "BUY") badgeClass = "buy";
    if (data.signal === "SELL") badgeClass = "sell";

    resultEl.innerHTML = `
      <div class="card">
        <strong>${symbol}</strong>
        <span class="badge ${badgeClass}">${data.signal}</span>
        <p>Price: $${data.price}</p>
        <p>Change: ${data.change.toFixed(2)}%</p>
        <button class="action" onclick="addFavorite('${symbol}')">
          ❤️ Favorite
        </button>
      </div>
    `;
  } catch (err) {
    resultEl.innerHTML = `
      <div class="card">
        ⚠️ Data unavailable<br><br>
        <small>Check your spelling or try again later</small>
      </div>
    `;
  }
}

/* ================= FAVORITES ================= */

function addFavorite(symbol) {
  const data = getUserData();

  if (!data) {
    alert("Sign in first");
    return;
  }

  if (!data.favorites.includes(symbol)) {
    data.favorites.push(symbol);
    saveUserData(data);
    alert("Added to favorites");
  }
}

function loadFavorites() {
  const data = getUserData();

  if (!data || data.favorites.length === 0) {
    view.innerHTML = `
      <div class="card">No favorites yet</div>
    `;
    return;
  }

  view.innerHTML =
    "<h2 class='section-title'>Favorites</h2>" +
    data.favorites
      .map(sym => `<div class="card">${sym}</div>`)
      .join("");
}

/* ================= SETTINGS ================= */

function loadSettings() {
  view.innerHTML = `
    <h2 class="section-title">Account</h2>

    <input id="user" placeholder="Username" />
    <input id="pass" type="password" placeholder="Password" />

    <button class="action" onclick="signUp(user.value, pass.value)">
      Sign Up
    </button>

    <button class="action" onclick="signIn(user.value, pass.value)">
      Sign In
    </button>

    <button class="action" onclick="signOut()">
      Sign Out
    </button>
  `;
}

/* ================= INIT ================= */

loadHome();
