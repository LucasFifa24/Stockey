const view = document.getElementById("view");

function loadHome() {
  view.innerHTML = `
    <h2>Home</h2>
    <p>Recommended buys & sells will appear here.</p>
  `;
}

function loadSearch() {
  view.innerHTML = `
    <h2>Search</h2>
    <input id="symbol" placeholder="Search symbol (AAPL, BTC, EURUSD)">
    <button onclick="searchSymbol()">Search</button>
    <div id="searchResult"></div>
  `;
}

function loadFavorites() {
  const user = getCurrentUser();

  if (!user) {
    view.innerHTML = "<p>Please sign in to view favorites.</p>";
    return;
  }

  const data = getUserData();

  if (data.favorites.length === 0) {
    view.innerHTML = "<p>No favorites yet ❤️</p>";
    return;
  }

  view.innerHTML = `
    <h2>Favorites ❤️</h2>
    ${data.favorites.map(sym =>
      `<p>${sym}</p>`
    ).join("")}
  `;
}

function loadSettings() {
  const user = getCurrentUser();

  if (user) {
    view.innerHTML = `
      <h2>Settings</h2>
      <p>Logged in as <strong>${user}</strong></p>
      <button onclick="signOut()">Sign Out</button>
    `;
  } else {
    view.innerHTML = `
      <h2>Settings</h2>
      <input id="username" placeholder="Username">
      <input id="password" type="password" placeholder="Password">
      <button onclick="signIn(username.value, password.value)">Sign In</button>
      <button onclick="signUp(username.value, password.value)">Sign Up</button>
    `;
  }
}

function searchSymbol() {
  const symbol = document.getElementById("symbol").value.toUpperCase();
  if (!symbol) return;

  const result = document.getElementById("searchResult");
  const user = getCurrentUser();

  if (user) {
    const data = getUserData();
    if (!data.recent.includes(symbol)) {
      data.recent.unshift(symbol);
      data.recent = data.recent.slice(0, 10);
      saveUserData(data);
    }
  }

  result.innerHTML = `
    <p><strong>${symbol}</strong></p>
    <button onclick="toggleFavorite('${symbol}')">❤️ Favorite</button>
  `;
}
function toggleFavorite(symbol) {
  const data = getUserData();

  if (data.favorites.includes(symbol)) {
    data.favorites = data.favorites.filter(s => s !== symbol);
  } else {
    data.favorites.push(symbol);
  }

  saveUserData(data);
  loadFavorites();
}

loadHome();
