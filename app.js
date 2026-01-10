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

loadHome();
