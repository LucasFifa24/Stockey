// auth.js

// Function to get the current user from localStorage
function getCurrentUser() {
  const user = localStorage.getItem("currentUser");
  console.log("getCurrentUser called:", user);
  return user;
}

// Function to sign up a new user
function signUp(username, password) {
  console.log("signUp called with username:", username);
  const existingUser = localStorage.getItem(`user_${username}`);
  if (existingUser) {
    console.error("User already exists!");
    return false;
  }

  const userData = { password, favorites: [], recent: [] };
  localStorage.setItem(`user_${username}`, JSON.stringify(userData));
  localStorage.setItem("currentUser", username);
  return true;
}

// Function to sign in an existing user
function signIn(username, password) {
  console.log("signIn called with username:", username);
  const user = JSON.parse(localStorage.getItem(`user_${username}`));
  if (!user) {
    console.error("User not found!");
    return false;
  }

  if (user.password === password) {
    localStorage.setItem("currentUser", username);
    return true;
  } else {
    console.error("Incorrect password!");
    return false;
  }
}

// Function to sign out the current user
function signOut() {
  console.log("signOut called");
  localStorage.removeItem("currentUser");
}

// Function to get the user data
function getUserData() {
  const user = getCurrentUser();
  if (!user) return null;

  const data = JSON.parse(localStorage.getItem(`user_${user}`));
  console.log("getUserData called:", data);
  return data;
}

// Function to save the user data
function saveUserData(data) {
  const user = getCurrentUser();
  if (user) {
    localStorage.setItem(`user_${user}`, JSON.stringify(data));
    console.log("saveUserData called:", data);
  }
}
