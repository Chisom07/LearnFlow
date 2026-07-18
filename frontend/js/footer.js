document.addEventListener("DOMContentLoaded", () => {
  if (document.querySelector(".site-footer")) return;

  const year = new Date().getFullYear();
  const footer = document.createElement("footer");
  footer.className = "site-footer";
  footer.innerHTML = `
    <div class="footer-inner">
      <div class="footer-brand">
        <a class="logo" href="index.html">Learn<span>Flow</span></a>
        <p>Structure learning. Power progress. A modern course platform for students and instructors.</p>
      </div>

      <div class="footer-links">
        <div>
          <h4>Explore</h4>
          <a href="courses.html">Course Catalogue</a>
          <a href="dashboard.html">Student Dashboard</a>
          <a href="instructor.html">Instructor Hub</a>
        </div>
        <div>
          <h4>Account</h4>
          <a href="login.html">Login</a>
          <a href="register.html">Register</a>
        </div>
        <div>
          <h4>Categories</h4>
          <a href="courses.html?category=Web%20Development">Web Development</a>
          <a href="courses.html?category=Programming">Programming</a>
          <a href="courses.html?category=Design">Design</a>
          <a href="courses.html?category=Data">Data</a>
        </div>
      </div>
    </div>

    <div class="footer-bottom">
      <p>&copy; ${year} LearnFlow. All rights reserved.</p>
      <p>Built for modern online learning.</p>
    </div>
  `;

  document.body.appendChild(footer);
});
