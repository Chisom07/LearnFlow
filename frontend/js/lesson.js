const params = new URLSearchParams(window.location.search);
const lessonId = params.get("id");

const lessonContent = document.getElementById("lessonContent");

async function loadLesson() {

  const courses = await request("/courses");

  let selectedLesson = null;

  for (const course of courses) {

    const detail = await request(`/courses/${course.id}`);

    const found = detail.lessons.find(
      lesson => lesson.id == lessonId
    );

    if (found) {
      selectedLesson = found;
      break;
    }
  }

  if (!selectedLesson) {
    lessonContent.innerHTML = "<h2>Lesson not found</h2>";
    return;
  }

  const embedUrl =
    selectedLesson.youtube_video_url
      .replace("watch?v=", "embed/");

  lessonContent.innerHTML = `
    <div class="card">

      <div class="card-content">

        <h1>${selectedLesson.title}</h1>

        <br>

        <div class="lesson-player">

          <iframe src="${embedUrl}" allowfullscreen></iframe>

        </div>

        <br>

        <p>${selectedLesson.description}</p>

        <br>

        <a class="btn" target="_blank"
          href="${selectedLesson.pdf_resource}">
          Open PDF Resource
        </a>

        <br><br>

        <button class="btn" onclick="completeLesson()">
          Mark Complete
        </button>

      </div>

    </div>
  `;
}

async function completeLesson() {

  const result = await request(
    `/lessons/${lessonId}/complete`,
    {
      method: "POST"
    }
  );

  alert(result.message);
}

loadLesson();