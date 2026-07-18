const pool = require("../config/db");
const { questionSchema } = require("../validators/quizValidator");

exports.createQuiz = async (req, res) => {
  if (!req.body.title) {
    return res.status(400).json({ message: "title is required" });
  }

  const quiz = await pool.query(
    `INSERT INTO quizzes(course_id,title)
     VALUES($1,$2)
     RETURNING *`,
    [req.params.id, req.body.title]
  );

  res.status(201).json(quiz.rows[0]);
};

exports.addQuestion = async (req, res) => {
  const { error } = questionSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const ownership = await pool.query(
    `SELECT quizzes.id
     FROM quizzes
     JOIN courses ON courses.id = quizzes.course_id
     WHERE quizzes.id = $1 AND courses.instructor_id = $2`,
    [req.params.id, req.user.id]
  );

  if (!ownership.rows.length) {
    return res.status(403).json({
      message: "You can only add questions to your own quizzes"
    });
  }

  const q = await pool.query(
    `INSERT INTO quiz_questions
    (quiz_id,question,options,correct_answer)
    VALUES($1,$2,$3,$4)
    RETURNING *`,
    [
      req.params.id,
      req.body.question,
      JSON.stringify(req.body.options),
      req.body.correct_answer
    ]
  );

  res.status(201).json(q.rows[0]);
};

exports.getQuestions = async (req, res) => {
  const quiz = await pool.query(
    `SELECT id, course_id, title FROM quizzes WHERE id = $1`,
    [req.params.id]
  );

  if (!quiz.rows.length) {
    return res.status(404).json({ message: "Quiz not found" });
  }

  const includeAnswers = req.quizAccess === "preview";
  const questions = await pool.query(
    `SELECT id, quiz_id, question, options, correct_answer
     FROM quiz_questions
     WHERE quiz_id = $1
     ORDER BY id ASC`,
    [req.params.id]
  );

  res.json({
    quiz: quiz.rows[0],
    mode: includeAnswers ? "preview" : "attempt",
    questions: questions.rows.map((question) => {
      if (includeAnswers) return question;

      const { correct_answer, ...safeQuestion } = question;
      return safeQuestion;
    })
  });
};

exports.submitQuiz = async (req, res) => {
  const questions = await pool.query(
    `SELECT * FROM quiz_questions
     WHERE quiz_id=$1
     ORDER BY id ASC`,
    [req.params.id]
  );

  if (!questions.rows.length) {
    return res.status(400).json({
      message: "This quiz has no questions yet"
    });
  }

  const answers = req.body.answers || [];
  let correct = 0;

  questions.rows.forEach((q, index) => {
    const submitted =
      answers[index] ??
      (Array.isArray(answers)
        ? answers.find((a) => a && a.question_id === q.id)?.answer
        : undefined);

    if (submitted === q.correct_answer) {
      correct++;
    }
  });

  const score = Math.round((correct / questions.rows.length) * 100);

  const attempt = await pool.query(
    `INSERT INTO quiz_attempts
    (quiz_id,student_id,score)
    VALUES($1,$2,$3)
    RETURNING *`,
    [req.params.id, req.user.id, score]
  );

  res.json({
    score,
    correct_answers: correct,
    total_questions: questions.rows.length,
    attempt: attempt.rows[0]
  });
};
