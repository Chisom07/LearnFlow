const container = document.getElementById("coursesContainer");
const search = document.getElementById("search");
const categoryFilter = document.getElementById("categoryFilter");

let courses = [];

async function loadCourses() {
  courses = await request("/courses");

  renderCourses(courses);

  const categories = [
    ...new Set(courses.map(course => course.category))
  ];

  categories.forEach(category => {
    categoryFilter.innerHTML += `
      <option value="${category}">${category}</option>
    `;
  });
}

function renderCourses(data) {
  container.innerHTML = data.map(course => `
    <div class="card">
    //   <img src="${course.thumbnail}" alt="">
    <img src="${course.thumbnail || 'https://images.pexels.com/photos/5212700/pexels-photo-5212700.jpeg'}">

      <div class="card-content">

        <h3>${course.title}</h3>

        <p>${course.description.substring(0, 120)}...</p>

        <br>

        <p><strong>Instructor:</strong> ${course.instructor}</p>

        <p><strong>Lessons:</strong> ${course.lesson_count}</p>

        <p><strong>Students:</strong> ${course.student_count}</p>

        <p><strong>Price:</strong> $${course.price}</p>

        <br>

        <a class="btn" href="course.html?id=${course.id}">
          View Course
        </a>

      </div>
    </div>
  `).join("");
}

search.addEventListener("input", filterCourses);
categoryFilter.addEventListener("change", filterCourses);

function filterCourses() {
  const keyword = search.value.toLowerCase();
  const category = categoryFilter.value;

  const filtered = courses.filter(course => {
    const matchesSearch =
      course.title.toLowerCase().includes(keyword);

    const matchesCategory =
      !category || course.category === category;

    return matchesSearch && matchesCategory;
  });

  renderCourses(filtered);
}

loadCourses();