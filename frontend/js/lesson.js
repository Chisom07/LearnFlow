const params = new URLSearchParams(window.location.search);
const lessonId = params.get("id");

const lessonContent = document.getElementById("lessonContent");

async function loadLesson() {
  const lesson = await request(`/lessons/${lessonId}`);

  if (lesson.message) {
    lessonContent.innerHTML = `<h2>${lesson.message}</h2>
      <p>Make sure you are logged in as a student and enrolled in this course.</p>`;
    return;
  }

  let embedUrl = lesson.youtube_video_url || "";
  if (embedUrl.includes("watch?v=")) {
    embedUrl = embedUrl.replace("watch?v=", "embed/");
  } else if (embedUrl.includes("youtu.be/")) {
    embedUrl = embedUrl.replace("youtu.be/", "www.youtube.com/embed/");
  }

  lessonContent.innerHTML = `
    <div class="card">
      <div class="card-content">
        <p>${lesson.course_title || ""}</p>
        <h1>${lesson.title}</h1>
        <br>
        <div class="lesson-player">
          <iframe src="${embedUrl}" allowfullscreen></iframe>
        </div>
        <br>
        <p>${lesson.description || ""}</p>
        <br>
        ${
          lesson.pdf_resource
            ? `<a class="btn" target="_blank" href="${lesson.pdf_resource}">Open PDF Resource</a><br><br>`
            : ""
        }
        <button class="btn" onclick="completeLesson()">Mark Complete</button>
        <a class="btn" href="course.html?id=${lesson.course_id}">Back to Course</a>
        <div id="lessonMessage" class="enrolment-message" aria-live="polite"></div>
      </div>
    </div>
  `;
}

async function completeLesson() {
  const result = await request(`/lessons/${lessonId}/complete`, {
    method: "POST"
  });

  const message = document.getElementById("lessonMessage");
  message.className = result._ok
    ? "enrolment-message enrolment-message-success"
    : "enrolment-message enrolment-message-error";
  message.textContent = result._ok
    ? "Lesson marked as complete."
    : result.message || "We could not update your progress.";
}

loadLesson();
