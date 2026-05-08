const params = new URLSearchParams(window.location.search);
const quizId = params.get("id");

const quizContainer =
  document.getElementById("quizContainer");

let questions = [];
let answers = [];

async function loadQuiz() {

  const response = await fetch(
    `http://localhost:5000/quizzes/${quizId}/questions`
  );

  questions = await response.json();

  renderQuiz();
}

function renderQuiz() {

  quizContainer.innerHTML = questions.map(
    (question, index) => `

    <div class="card" style="margin-bottom:20px;">

      <div class="card-content">

        <h3>
          ${index + 1}. ${question.question}
        </h3>

        <br>

        ${JSON.parse(question.options).map(option => `
          <div
            class="quiz-option"
            onclick="selectAnswer(${index}, '${option}')"
          >
            ${option}
          </div>
        `).join("")}

      </div>

    </div>

  `).join("");

  quizContainer.innerHTML += `
    <button class="btn" onclick="submitQuiz()">
      Submit Quiz
    </button>
  `;
}

function selectAnswer(index, answer) {
  answers[index] = answer;
}

async function submitQuiz() {

  const result = await request(
    `/quizzes/${quizId}/submit`,
    {
      method: "POST",
      body: JSON.stringify({
        answers
      })
    }
  );

  quizContainer.innerHTML = `
    <h2>Your Score: ${result.score}%</h2>
  `;
}