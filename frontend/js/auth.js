const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

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
        `<p>${data.message}</p>`;
      return;
    }

    window.location.href = "dashboard.html";
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
        `<p>${data.message}</p>`;
      return;
    }

    if (role === "instructor") {
      window.location.href = "instructor.html";
    } else {
      window.location.href = "dashboard.html";
    }
  });
}