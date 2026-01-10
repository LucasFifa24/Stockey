function getCurrentUser() {
  return localStorage.getItem("currentUser");
}

function signUp(username, password) {
  localStorage.setItem(
    `user_${username}`,
    JSON.stringify({ password, favorites: [], recent: [] })
  );
  localStorage.setItem("currentUser", username);
}

function signIn(username, password) {
  const user = JSON.parse(localStorage.getItem(`user_${username}`));
  if (!user || user.password !== password) return false;
  localStorage.setItem("currentUser", username);
  return true;
}

function signOut() {
  localStorage.removeItem("currentUser");
}

function getUserData() {
  const user = getCurrentUser();
  return JSON.parse(localStorage.getItem(`user_${user}`));
}

function saveUserData(data) {
  const user = getCurrentUser();
  localStorage.setItem(`user_${user}`, JSON.stringify(data));
}
