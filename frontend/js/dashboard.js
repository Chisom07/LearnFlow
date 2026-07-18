let allCourses = [];
let enrolledCourseIds = new Set();

async function loadDashboard() {
  const me = await request("/auth/me");

  if (me.message) {
    window.location.href = "login.html";
    return;
  }

  if (me.role === "instructor") {
    window.location.href = "instructor.html";
    return;
  }

  const greeting = document.getElementById("dashboardGreeting");
  if (greeting && me.name) {
    greeting.textContent = `Welcome back, ${me.name}. Track progress, continue lessons, and discover new courses.`;
  }

  const data = await request("/dashboard");

  if (data.message) {
    document.getElementById("dashboardCards").innerHTML =
      `<div class="empty-state"><p>${data.message}</p></div>`;
    return;
  }

  const cards = document.getElementById("dashboardCards");
  const scores = document.getElementById("recentScores");
  enrolledCourseIds = new Set(
    (data.enrolled_courses || []).map((course) => Number(course.id))
  );

  if (!data.enrolled_courses?.length) {
    cards.innerHTML = `
      <div class="empty-state">
        <h3>No enrolments yet</h3>
        <p>Browse the catalogue and enrol in your first course.</p>
        <div class="card-actions" style="justify-content:center;">
          <a class="btn" href="courses.html">Browse courses</a>
        </div>
      </div>
    `;
  } else {
    cards.innerHTML = data.enrolled_courses.map((course) => `
      <article class="card">
        <img src="${course.thumbnail || "https://images.pexels.com/photos/5212700/pexels-photo-5212700.jpeg"}" alt="${course.title}">
        <div class="card-content">
          <h3>${course.title}</h3>
          <p>Instructor: ${course.instructor || "—"}</p>
          <p><strong>${course.completion_percentage}%</strong> complete
             (${course.completed_lessons}/${course.total_lessons} lessons)</p>
          <div class="progress"><div style="width:${course.completion_percentage || 0}%"></div></div>
          <div class="card-actions">
          ${
            course.next_lesson
              ? `<a class="btn" href="lesson.html?id=${course.next_lesson.id}">Continue: ${course.next_lesson.title}</a>`
              : `<a class="btn btn-secondary" href="course.html?id=${course.id}">View Course</a>`
          }
            <button
              class="btn btn-ghost"
              type="button"
              onclick="showDashboardCancel(${course.id})"
            >
              Cancel enrolment
            </button>
          </div>
          <div id="cancelCourse-${course.id}" class="cancel-panel" hidden>
            <strong>Cancel enrolment?</strong>
            <p>You will lose access to this course. Saved progress will remain.</p>
            <div class="card-actions">
              <button
                class="btn btn-danger"
                type="button"
                onclick="cancelDashboardEnrolment(${course.id})"
              >
                Yes, cancel
              </button>
              <button
                class="btn btn-secondary"
                type="button"
                onclick="hideDashboardCancel(${course.id})"
              >
                Keep course
              </button>
            </div>
          </div>
        </div>
      </article>
    `).join("");
  }

  if (!data.recent_scores?.length) {
    scores.innerHTML = `<div class="empty-state"><p>No quiz attempts yet.</p></div>`;
  } else {
    scores.innerHTML = data.recent_scores.map((s) => `
      <div class="score-row">
        <div>
          <h3>${s.quiz_title}</h3>
          <p>${s.course_title}</p>
        </div>
        <strong>${s.score}%</strong>
      </div>
    `).join("");
  }

  await loadAvailableCourses();
}

function showDashboardCancel(courseId) {
  document.getElementById(`cancelCourse-${courseId}`).hidden = false;
}

function hideDashboardCancel(courseId) {
  document.getElementById(`cancelCourse-${courseId}`).hidden = true;
}

async function cancelDashboardEnrolment(courseId) {
  const result = await request(`/enrolments/${courseId}`, {
    method: "DELETE"
  });

  if (!result._ok) {
    const panel = document.getElementById(`cancelCourse-${courseId}`);
    panel.className = "cancel-panel enrolment-message-error";
    panel.textContent =
      result.message || "We could not cancel your enrolment.";
    return;
  }

  showMessage("Your enrolment has been cancelled.", "success");
  await loadDashboard();
}

async function loadAvailableCourses() {
  const result = await request("/courses");

  if (!result._ok) {
    document.getElementById("availableCourses").innerHTML =
      `<p>${result.message}</p>`;
    return;
  }

  allCourses = result;

  const categorySelect = document.getElementById("courseCategory");
  const categories = [...new Set(
    allCourses.map((course) => course.category).filter(Boolean)
  )];

  categorySelect.innerHTML = `
    <option value="">All categories</option>
    ${categories.map((category) =>
      `<option value="${category}">${category}</option>`
    ).join("")}
  `;

  filterAvailableCourses();
}

function filterAvailableCourses() {
  const keyword = document.getElementById("courseSearch").value
    .trim()
    .toLowerCase();
  const category = document.getElementById("courseCategory").value;

  const filtered = allCourses.filter((course) => {
    if (enrolledCourseIds.has(Number(course.id))) return false;

    const haystack = [
      course.title,
      course.description,
      course.instructor,
      course.category
    ].join(" ").toLowerCase();

    return haystack.includes(keyword) &&
      (!category || course.category === category);
  });

  const container = document.getElementById("availableCourses");

  if (!filtered.length) {
    container.innerHTML = `
      <div class="empty-state">
        <h3>No courses found</h3>
        <p>Try another search or category.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map((course) => `
    <div class="card">
      <img
        src="${course.thumbnail || "https://images.pexels.com/photos/5212700/pexels-photo-5212700.jpeg"}"
        alt="${course.title}"
      >
      <div class="card-content">
        <span class="course-category">${course.category}</span>
        <h3>${course.title}</h3>
        <p>${course.description.slice(0, 110)}...</p>
        <p><strong>Instructor:</strong> ${course.instructor}</p>
        <p><strong>Price:</strong> ${Number(course.price) === 0 ? "Free" : `$${course.price}`}</p>
        <div class="card-actions">
          <a class="btn btn-secondary" href="course.html?id=${course.id}">
            View Details
          </a>
          <button class="btn" onclick="enrolFromDashboard(${course.id})">
            Enrol Now
          </button>
        </div>
      </div>
    </div>
  `).join("");
}

async function enrolFromDashboard(courseId) {
  const message = document.getElementById("browseMessage");
  const result = await request(`/enrolments/${courseId}`, {
    method: "POST"
  });

  if (result._status === 401) {
    sessionStorage.setItem("pendingEnrolCourseId", courseId);
    redirectToLogin(
      "You have to login/register first to enrol.",
      `course.html?id=${courseId}`
    );
    return;
  }

  if (!result._ok) {
    message.className = "enrolment-message enrolment-message-error";
    message.textContent =
      result.message || "We could not complete your enrolment.";
    return;
  }

  message.className = "enrolment-message enrolment-message-success";
  message.textContent = "You have successfully enrolled in this course.";
  await loadDashboard();
}

document.getElementById("courseSearch")?.addEventListener(
  "input",
  filterAvailableCourses
);
document.getElementById("courseCategory")?.addEventListener(
  "change",
  filterAvailableCourses
);

loadDashboard();
