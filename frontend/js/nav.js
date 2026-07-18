(function initNav() {
  async function renderNav() {
    let existing = document.querySelector("nav");
    if (!existing) {
      existing = document.createElement("nav");
      document.body.prepend(existing);
    }

    existing.className = "site-nav";
    existing.setAttribute("aria-label", "Primary");

    const page = (window.location.pathname.split("/").pop() || "index.html");
    const me = typeof request === "function"
      ? await request("/auth/me")
      : { _ok: false };

    const isAuthed = Boolean(me && me._ok && me.id);
    const role = me?.role;

    const link = (href, label) => `
      <a class="nav-link ${page === href ? "active" : ""}" href="${href}">${label}</a>
    `;

    let links = `
      ${link("index.html", "Home")}
      ${link("courses.html", "Courses")}
    `;

    if (isAuthed && role === "student") {
      links += link("dashboard.html", "Dashboard");
    }

    if (isAuthed && role === "instructor") {
      links += link("instructor.html", "Instructor");
    }

    if (!isAuthed) {
      links += `
        ${link("login.html", "Login")}
        <a class="btn" href="register.html">Get Started</a>
      `;
    } else {
      links += `
        <button class="btn btn-ghost" id="logoutBtn" type="button">Logout</button>
      `;
    }

    existing.innerHTML = `
      <a class="logo" href="index.html">Learn<span>Flow</span></a>
      <div class="nav-links">${links}</div>
    `;

    document.getElementById("logoutBtn")?.addEventListener("click", async () => {
      await request("/auth/logout", { method: "POST" });
      window.location.href = "login.html";
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderNav);
  } else {
    renderNav();
  }
})();
