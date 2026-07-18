const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const authParams = new URLSearchParams(window.location.search);
const returnTo =
  authParams.get("returnTo") || sessionStorage.getItem("returnTo");
const storedMessage = sessionStorage.getItem("authMessage");

if (storedMessage && document.getElementById("message")) {
  document.getElementById("message").innerHTML =
    `<div class="form-message form-message-error">${storedMessage}</div>`;
  sessionStorage.removeItem("authMessage");
}

if (returnTo) {
  const registerLink = document.querySelector('a[href="register.html"]');
  const loginLink = document.querySelector('a[href="login.html"]');
  const encodedReturnTo = encodeURIComponent(returnTo);

  if (registerLink) {
    registerLink.href = `register.html?returnTo=${encodedReturnTo}`;
  }
  if (loginLink) {
    loginLink.href = `login.html?returnTo=${encodedReturnTo}`;
  }
}

function destinationFor(role) {
  if (returnTo) {
    sessionStorage.removeItem("returnTo");
    return returnTo;
  }

  return role === "instructor" ? "instructor.html" : "dashboard.html";
}

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const data = await request("/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email,
        password
      })
    });

    if (data.message) {
      document.getElementById("message").innerHTML =
        `<div class="form-message form-message-error">${data.message}</div>`;
      return;
    }

    window.location.href = destinationFor(data.role);
  });
}

if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const role = document.getElementById("role").value;

    const data = await request("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name,
        email,
        password,
        role
      })
    });

    if (data.message) {
      document.getElementById("message").innerHTML =
        `<div class="form-message form-message-error">${data.message}</div>`;
      return;
    }

    window.location.href = destinationFor(role);
  });
}