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
    <input placeholder="Search symbol..." />
  `;
}

function loadFavorites() {
  view.innerHTML = `
    <h2>Favorites ❤️</h2>
    <p>Login to save favorites.</p>
  `;
}

function loadSettings() {
  view.innerHTML = `
    <h2>Settings</h2>
    <p>Account system coming next.</p>
  `;
}

loadHome();
