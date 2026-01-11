function getCurrentUser() {
  return localStorage.getItem("currentUser");
}

function signUp(username, password) {
  if (localStorage.getItem("user_" + username)) {
    alert("User already exists");
    return;
  }
  const data = {
    password,
    favorites: []
  };
  localStorage.setItem("user_" + username, JSON.stringify(data));
  localStorage.setItem("currentUser", username);
  alert("Account created");
}

function signIn(username, password) {
  const data = JSON.parse(localStorage.getItem("user_" + username));
  if (!data || data.password !== password) {
    alert("Invalid login");
    return;
  }
  localStorage.setItem("currentUser", username);
  alert("Signed in");
}

function signOut() {
  localStorage.removeItem("currentUser");
  alert("Signed out");
}

function getUserData() {
  const user = getCurrentUser();
  if (!user) return null;
  return JSON.parse(localStorage.getItem("user_" + user));
}

function saveUserData(data) {
  const user = getCurrentUser();
  if (user) {
    localStorage.setItem("user_" + user, JSON.stringify(data));
  }
}
