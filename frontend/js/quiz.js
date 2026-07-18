const params = new URLSearchParams(window.location.search);
const quizId = params.get("id");

const quizContainer = document.getElementById("quizContainer");

let questions = [];
let answers = [];
let quizMode = "attempt";

function parseOptions(options) {
  if (Array.isArray(options)) return options;
  if (typeof options === "string") {
    try {
      return JSON.parse(options);
    } catch {
      return [];
    }
  }
  return [];
}

async function loadQuiz() {
  if (!quizId) {
    quizContainer.innerHTML = "<h2>Missing quiz id</h2>";
    return;
  }

  const data = await request(`/quizzes/${quizId}/questions`);

  if (data.message) {
    quizContainer.innerHTML = `<h2>${data.message}</h2>`;
    return;
  }

  questions = data.questions || [];
  quizMode = data.mode || "attempt";

  if (!questions.length) {
    quizContainer.innerHTML = "<h2>This quiz has no questions yet.</h2>";
    return;
  }

  quizContainer.innerHTML = `
    <h1>${data.quiz?.title || "Quiz"}</h1>
    ${
      quizMode === "preview"
        ? `<div class="preview-banner">
             <strong>Instructor preview</strong>
             <span>Correct answers are highlighted. Preview attempts are not scored or saved.</span>
           </div>`
        : ""
    }
    <br>
  `;

  quizContainer.innerHTML += questions.map((question, index) => `
    <div class="card" style="margin-bottom:20px;">
      <div class="card-content">
        <h3>${index + 1}. ${question.question}</h3>
        <br>
        ${parseOptions(question.options).map((option) => `
          <div
            class="quiz-option ${
              quizMode === "preview" && option === question.correct_answer
                ? "quiz-option-correct"
                : ""
            }"
            data-index="${index}"
            data-option="${option.replace(/"/g, "&quot;")}"
          >
            ${option}
            ${
              quizMode === "preview" && option === question.correct_answer
                ? "<strong>Correct answer</strong>"
                : ""
            }
          </div>
        `).join("")}
      </div>
    </div>
  `).join("");

  if (quizMode === "preview") {
    quizContainer.innerHTML += `
      <a class="btn btn-secondary" href="course.html?id=${data.quiz.course_id}">
        Back to Course
      </a>
    `;
    return;
  }

  quizContainer.innerHTML += `
    <div id="quizMessage" class="enrolment-message" aria-live="polite"></div>
    <button class="btn" id="submitQuizBtn">Submit Quiz</button>
  `;

  document.querySelectorAll(".quiz-option").forEach((el) => {
    el.addEventListener("click", () => {
      const index = Number(el.dataset.index);
      const option = el.dataset.option;
      answers[index] = option;

      el.parentElement.querySelectorAll(".quiz-option").forEach((opt) => {
        opt.style.background = "";
        opt.style.color = "";
      });
      el.style.background = "#2563eb";
      el.style.color = "white";
    });
  });

  document.getElementById("submitQuizBtn").addEventListener("click", submitQuiz);
}

async function submitQuiz() {
  const message = document.getElementById("quizMessage");

  if (answers.filter(Boolean).length < questions.length) {
    message.className = "enrolment-message enrolment-message-error";
    message.textContent = "Please answer all questions before submitting.";
    message.scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }

  const result = await request(`/quizzes/${quizId}/submit`, {
    method: "POST",
    body: JSON.stringify({ answers })
  });

  if (result.message && result.score === undefined) {
    message.className = "enrolment-message enrolment-message-error";
    message.textContent = result.message;
    return;
  }

  quizContainer.innerHTML = `
    <div class="card">
      <div class="card-content">
        <h2>Your Score: ${result.score}%</h2>
        <p>${result.correct_answers} / ${result.total_questions} correct</p>
        <br>
        <a class="btn" href="dashboard.html">Back to Dashboard</a>
      </div>
    </div>
  `;
}

loadQuiz();
