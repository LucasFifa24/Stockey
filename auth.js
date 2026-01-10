const USERS_KEY = "stockey_users";
const SESSION_KEY = "stockey_session";

function getUsers() {
  return JSON.parse(localStorage.getItem(USERS_KEY) || "{}");
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function signUp(username, password) {
  const users = getUsers();
  if (users[username]) {
    alert("User already exists");
    return;
  }
  users[username] = { password, favorites: [], recent: [] };
  saveUsers(users);
  signIn(username, password);
}

function signIn(username, password) {
  const users = getUsers();
  if (!users[username] || users[username].password !== password) {
    alert("Invalid login");
    return;
  }
  localStorage.setItem(SESSION_KEY, username);
  loadHome();
}

function signOut() {
  localStorage.removeItem(SESSION_KEY);
  loadSettings();
}

function getCurrentUser() {
  return localStorage.getItem(SESSION_KEY);
}
