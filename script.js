// Navigation
function goToSignup() {
    window.location.href = "signup.html";
}

function goToLogin() {
    window.location.href = "login.html";
}

// Signup
const signupForm = document.getElementById("signupForm");
if (signupForm) {
    signupForm.addEventListener("submit", function(e) {
        e.preventDefault();

        const username = document.getElementById("signupUsername").value;
        const password = document.getElementById("signupPassword").value;

        localStorage.setItem("username", username);
        localStorage.setItem("password", password);

        alert("Account created!");
        window.location.href = "login.html";
    });
}

// Login
const loginForm = document.getElementById("loginForm");
if (loginForm) {
    loginForm.addEventListener("submit", function(e) {
        e.preventDefault();

        const username = document.getElementById("loginUsername").value;
        const password = document.getElementById("loginPassword").value;

        const storedUser = localStorage.getItem("username");
        const storedPass = localStorage.getItem("password");

        if (username === storedUser && password === storedPass) {
            window.location.href = "home.html";
        } else {
            alert("Invalid login");
        }
    });
}

// Logout
function logout() {
    window.location.href = "login.html";
}