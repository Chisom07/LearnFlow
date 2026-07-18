let selectedCourseId = null;
let selectedCourseTitle = "";

async function loadInstructor() {
  const me = await request("/auth/me");

  if (me.message) {
    window.location.href = "login.html";
    return;
  }

  if (me.role !== "instructor") {
    window.location.href = "dashboard.html";
    return;
  }

  const data = await request("/dashboard");
  const stats = document.getElementById("stats");

  stats.innerHTML = `
    <div class="dashboard-cards">
      <div class="stat-tile"><h3>${data.courses || 0}</h3><p>Courses</p></div>
      <div class="stat-tile"><h3>${data.students || 0}</h3><p>Enrolments</p></div>
      <div class="stat-tile"><h3>${data.lessons || 0}</h3><p>Lessons</p></div>
    </div>
    <section class="section-block">
      <div class="section-heading">
        <div>
          <h2>Your Courses</h2>
          <p>Open a course or add lessons and quizzes.</p>
        </div>
      </div>
      <div class="grid" id="myCourses"></div>
    </section>
  `;

  const list = document.getElementById("myCourses");
  const myCourses = data.my_courses || [];

  list.innerHTML = myCourses.length
    ? myCourses.map((c) => `
        <div class="card instructor-course-card">
          <img
            src="${c.thumbnail || "https://images.pexels.com/photos/5212700/pexels-photo-5212700.jpeg"}"
            alt="${c.title}"
          >
          <div class="card-content instructor-course-content">
            <span class="course-category">${c.category}</span>
            <h3>${c.title}</h3>
            <div class="course-meta">
              <span>${c.student_count} students</span>
              <span>${c.lesson_count} lessons</span>
            </div>

            <div class="instructor-course-actions">
              <a class="btn course-open-btn" href="course.html?id=${c.id}">
                Open Course
              </a>
              <div class="course-manage-actions">
                <button
                  class="manage-action"
                  onclick="showAddLesson(${c.id})"
                  type="button"
                >
                  <span class="manage-action-icon">+</span>
                  <span>
                    <strong>Add lesson</strong>
                    <small>Video or resource</small>
                  </span>
                </button>
                <button
                  class="manage-action"
                  onclick="createQuiz(${c.id})"
                  type="button"
                >
                  <span class="manage-action-icon">?</span>
                  <span>
                    <strong>Add quiz</strong>
                    <small>Test student knowledge</small>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      `).join("")
    : "<p>No courses yet. Create one below.</p>";
}

function setInlineMessage(elementId, text, type) {
  const element = document.getElementById(elementId);
  element.className = `enrolment-message enrolment-message-${type}`;
  element.textContent = text;
}

document.getElementById("courseForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData();
  formData.append("title", document.getElementById("title").value);
  formData.append("description", document.getElementById("description").value);
  formData.append("category", document.getElementById("category").value);
  formData.append("price", document.getElementById("price").value || "0");

  const file = document.getElementById("thumbnail").files[0];
  if (file) formData.append("thumbnail", file);

  const response = await fetch("http://localhost:5000/courses", {
    method: "POST",
    credentials: "include",
    body: formData
  });

  const data = await response.json();

  if (!response.ok) {
    setInlineMessage(
      "courseFormMessage",
      data.message || "We could not create the course.",
      "error"
    );
    return;
  }

  setInlineMessage("courseFormMessage", "Course created successfully.", "success");
  e.target.reset();
  await loadInstructor();
});

function openManager(type, courseId) {
  const courseCards = [...document.querySelectorAll(".instructor-course-card")];
  const card = courseCards.find((item) =>
    item.querySelector(`[onclick*="(${courseId})"]`)
  );

  selectedCourseId = courseId;
  selectedCourseTitle =
    card?.querySelector("h3")?.textContent || `Course #${courseId}`;

  const panel = document.getElementById("courseManager");
  const lessonForm = document.getElementById("lessonForm");
  const quizForm = document.getElementById("quizForm");
  const message = document.getElementById("managerMessage");

  lessonForm.hidden = type !== "lesson";
  quizForm.hidden = type !== "quiz";
  message.className = "enrolment-message";
  message.textContent = "";

  document.getElementById("managerTitle").textContent =
    type === "lesson" ? "Add a lesson" : "Create a quiz";
  document.getElementById("managerSubtitle").textContent =
    selectedCourseTitle;

  panel.hidden = false;
  panel.scrollIntoView({ behavior: "smooth", block: "start" });
}

function showAddLesson(courseId) {
  openManager("lesson", courseId);
}

function createQuiz(courseId) {
  openManager("quiz", courseId);
}

document.getElementById("closeManager")?.addEventListener("click", () => {
  document.getElementById("courseManager").hidden = true;
});

document.getElementById("lessonForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData();
  formData.append("title", document.getElementById("lessonTitle").value);
  formData.append(
    "description",
    document.getElementById("lessonDescription").value
  );
  formData.append(
    "youtube_video_url",
    document.getElementById("lessonYoutubeUrl").value
  );

  const pdf = document.getElementById("lessonPdf").files[0];
  if (pdf) formData.append("pdf_resource", pdf);

  const response = await fetch(
    `http://localhost:5000/courses/${selectedCourseId}/lessons`,
    {
      method: "POST",
      credentials: "include",
      body: formData
    }
  );
  const result = await response.json();

  if (!response.ok) {
    setInlineMessage(
      "managerMessage",
      result.message || "We could not add this lesson.",
      "error"
    );
    return;
  }

  setInlineMessage(
    "managerMessage",
    `Lesson "${result.title}" added successfully.`,
    "success"
  );
  e.target.reset();
  await loadInstructor();
});

document.getElementById("quizForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const title = document.getElementById("quizTitle").value.trim();
  const question = document.getElementById("quizQuestion").value.trim();
  const options = document.getElementById("quizOptions").value
    .split("\n")
    .map((option) => option.trim())
    .filter(Boolean);
  const correctAnswer =
    document.getElementById("quizCorrectAnswer").value.trim();

  if (options.length < 2) {
    setInlineMessage(
      "managerMessage",
      "Enter at least two answer options, one per line.",
      "error"
    );
    return;
  }

  if (!options.includes(correctAnswer)) {
    setInlineMessage(
      "managerMessage",
      "The correct answer must exactly match one of the options.",
      "error"
    );
    return;
  }

  const quiz = await request(`/courses/${selectedCourseId}/quizzes`, {
    method: "POST",
    body: JSON.stringify({ title })
  });

  if (!quiz._ok) {
    setInlineMessage(
      "managerMessage",
      quiz.message || "We could not create this quiz.",
      "error"
    );
    return;
  }

  const result = await request(`/quizzes/${quiz.id}/questions`, {
    method: "POST",
    body: JSON.stringify({
      question,
      options,
      correct_answer: correctAnswer
    })
  });

  if (!result._ok) {
    setInlineMessage(
      "managerMessage",
      `The quiz was created, but its first question failed: ${result.message}`,
      "error"
    );
    return;
  }

  setInlineMessage(
    "managerMessage",
    `Quiz "${quiz.title}" created successfully.`,
    "success"
  );
  e.target.reset();
  await loadInstructor();
});

loadInstructor();
