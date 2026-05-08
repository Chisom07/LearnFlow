const params = new URLSearchParams(window.location.search);
const courseId = params.get("id");

const courseDetail = document.getElementById("courseDetail");
const lessonList = document.getElementById("lessonList");

async function loadCourse() {
  const course = await request(`/courses/${courseId}`);

  courseDetail.innerHTML = `
    <div class="card">

    //   <img src="${course.thumbnail}">
    <img src="${course.thumbnail || 'https://images.pexels.com/photos/5212700/pexels-photo-5212700.jpeg'}">

      <div class="card-content">

        <h1>${course.title}</h1>

        <br>

        <p>${course.description}</p>

        <br>

        <p><strong>Instructor:</strong> ${course.instructor}</p>

        <p><strong>Category:</strong> ${course.category}</p>

        <p><strong>Price:</strong> $${course.price}</p>

        <br>

        <button class="btn" onclick="enrolCourse()">
          Enrol Now
        </button>

      </div>
    </div>
  `;

  lessonList.innerHTML = course.lessons.map(lesson => `
    <div class="card" style="margin-top:20px;">

      <div class="card-content">

        <h3>${lesson.title}</h3>

        <p>${lesson.description}</p>

        <br>

        <img
          src="${lesson.video_thumbnail}"
          style="width:100%;border-radius:10px;"
        >

        <br><br>

        <a class="btn" href="lesson.html?id=${lesson.id}">
          Start Lesson
        </a>

      </div>
    </div>
  `).join("");
}

async function enrolCourse() {
  const result = await request(
    `/enrolments/${courseId}`,
    {
      method: "POST"
    }
  );

  alert(result.message || "Enrolled successfully");
}

loadCourse();