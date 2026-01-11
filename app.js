const view = document.getElementById("view");

function loadHome() {
  view.innerHTML = `
    <h2>Market Picks</h2>
    <div class="card">BTC – Strong Momentum</div>
    <div class="card">ETH – Bullish Trend</div>
    <div class="card">SOL – High Volume</div>
  `;
}

function loadSearch() {
  view.innerHTML = `
    <h2>Search</h2>
    <input id="symbolInput" placeholder="BTC, ETH, SOL" />
    <button class="action" onclick="search()">Search</button>
    <div id="result"></div>
  `;
}

async function search() {
  const symbol = document.getElementById("symbolInput").value.toUpperCase();
  const price = await getCryptoPrice(symbol);
  if (!price) {
    document.getElementById("result").innerHTML = "Symbol not found";
    return;
  }

  document.getElementById("result").innerHTML = `
    <div class="card">
      <strong>${symbol}</strong>
      <p>Price: $${price}</p>
      <button class="action" onclick="addFavorite('${symbol}')">❤️ Favorite</button>
    </div>
  `;
}

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
    view.innerHTML = "<p>No favorites yet</p>";
    return;
  }

  view.innerHTML =
    "<h2>Favorites</h2>" +
    data.favorites.map(s => `<div class="card">${s}</div>`).join("");
}

function loadSettings() {
  view.innerHTML = `
    <h2>Account</h2>
    <input id="user" placeholder="Username" />
    <input id="pass" placeholder="Password" type="password" />
    <button class="action" onclick="signUp(user.value, pass.value)">Sign Up</button>
    <button class="action" onclick="signIn(user.value, pass.value)">Sign In</button>
    <button class="action" onclick="signOut()">Sign Out</button>
  `;
}

// load app
loadHome();
