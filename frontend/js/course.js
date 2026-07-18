const params = new URLSearchParams(window.location.search);
const courseId = params.get("id");

const courseDetail = document.getElementById("courseDetail");
const lessonList = document.getElementById("lessonList");

async function loadCourse() {
  const course = await request(`/courses/${courseId}`);
  const me = await request("/auth/me");
  const quizAction = me._ok && me.role === "instructor"
    ? "Preview Quiz"
    : "Take Quiz";

  if (course.message) {
    courseDetail.innerHTML = `<h2>${course.message}</h2>`;
    return;
  }

  let progressHtml = "";
  let isEnrolled = false;
  try {
    const progress = await request(`/courses/${courseId}/progress`);
    if (!progress.message) {
      if (progress.students) {
        progressHtml = `
          <br>
          <h3>Student Progress</h3>
          ${progress.students.map((s) => `
            <p>${s.name}: <strong>${s.completion_percentage}%</strong>
            (${s.completed_lessons}/${progress.total_lessons})</p>
          `).join("")}
        `;
      } else {
        isEnrolled = true;
        progressHtml = `
          <br>
          <p><strong>Your progress:</strong> ${progress.completion_percentage}%
          (${progress.completed_lessons}/${progress.total_lessons} lessons)</p>
          ${
            progress.next_lesson
              ? `<p>Next lesson: ${progress.next_lesson.title}</p>`
              : "<p>All lessons completed</p>"
          }
        `;
      }
    }
  } catch {
    // not logged in or not enrolled — ignore
  }

  courseDetail.innerHTML = `
    <div class="card">
      <img src="${course.thumbnail || "https://images.pexels.com/photos/5212700/pexels-photo-5212700.jpeg"}">
      <div class="card-content">
        <h1>${course.title}</h1>
        <br>
        <p>${course.description}</p>
        <br>
        <p><strong>Instructor:</strong> ${course.instructor}</p>
        <p><strong>Category:</strong> ${course.category}</p>
        <p><strong>Price:</strong> $${course.price}</p>
        <br>
        ${
          isEnrolled
            ? `<button class="btn btn-secondary" onclick="showCancelEnrolment()">
                 Cancel enrolment
               </button>`
            : me.role === "instructor"
              ? ""
              : `<button class="btn" onclick="enrolCourse()">Enrol Now</button>`
        }
        <div id="enrolmentMessage" class="enrolment-message" aria-live="polite"></div>
        <div id="cancelEnrolmentPanel" class="cancel-panel" hidden>
          <div>
            <strong>Cancel this enrolment?</strong>
            <p>You will lose access to lessons and quizzes. Your saved progress will remain if you enrol again.</p>
          </div>
          <div class="card-actions">
            <button class="btn btn-danger" onclick="cancelEnrolment()" type="button">
              Yes, cancel enrolment
            </button>
            <button class="btn btn-secondary" onclick="hideCancelEnrolment()" type="button">
              Keep course
            </button>
          </div>
        </div>
        ${progressHtml}
      </div>
    </div>
  `;

  lessonList.innerHTML = (course.lessons || []).map((lesson) => `
    <div class="card" style="margin-top:20px;">
      <div class="card-content">
        <h3>${lesson.title}</h3>
        <p>${lesson.description || ""}</p>
        <br>
        <img
          src="${lesson.video_thumbnail || course.thumbnail || "https://images.pexels.com/photos/5212700/pexels-photo-5212700.jpeg"}"
          style="width:100%;border-radius:10px;"
        >
        <br><br>
        <a class="btn" href="lesson.html?id=${lesson.id}">Start Lesson</a>
      </div>
    </div>
  `).join("") || "<p>No lessons yet.</p>";

  if (course.quizzes?.length) {
    lessonList.innerHTML += `
      <br><br>
      <h2>Quizzes</h2>
      ${course.quizzes.map((quiz) => `
        <div class="card" style="margin-top:20px;">
          <div class="card-content">
            <h3>${quiz.title}</h3>
            <br>
            <a class="btn" href="quiz.html?id=${quiz.id}">${quizAction}</a>
          </div>
        </div>
      `).join("")}
    `;
  }
}

function showCancelEnrolment() {
  document.getElementById("cancelEnrolmentPanel").hidden = false;
}

function hideCancelEnrolment() {
  document.getElementById("cancelEnrolmentPanel").hidden = true;
}

async function cancelEnrolment() {
  const result = await request(`/enrolments/${courseId}`, {
    method: "DELETE"
  });
  const message = document.getElementById("enrolmentMessage");

  if (!result._ok) {
    message.className = "enrolment-message enrolment-message-error";
    message.textContent =
      result.message || "We could not cancel your enrolment.";
    return;
  }

  hideCancelEnrolment();
  message.className = "enrolment-message enrolment-message-success";
  message.textContent = "Your enrolment has been cancelled.";
  setTimeout(loadCourse, 700);
}

async function enrolCourse() {
  const result = await request(`/enrolments/${courseId}`, {
    method: "POST"
  });

  const message = document.getElementById("enrolmentMessage");

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
      result.message || "We could not complete your enrolment. Please try again.";
    return;
  }

  sessionStorage.removeItem("pendingEnrolCourseId");
  message.className = "enrolment-message enrolment-message-success";
  message.textContent = "Enrolment successful. Welcome to the course!";
  setTimeout(loadCourse, 800);
}

async function maybeAutoEnrol() {
  const pendingId = sessionStorage.getItem("pendingEnrolCourseId");
  if (!pendingId || String(pendingId) !== String(courseId)) return;

  const me = await request("/auth/me");
  if (!me._ok || me.role !== "student") return;

  sessionStorage.removeItem("pendingEnrolCourseId");
  await enrolCourse();
}

loadCourse().then(maybeAutoEnrol);
