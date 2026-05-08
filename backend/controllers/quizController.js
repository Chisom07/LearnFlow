const pool = require("../config/db");

exports.createQuiz = async (req, res) => {
  const quiz = await pool.query(
    `INSERT INTO quizzes(course_id,title)
     VALUES($1,$2)
     RETURNING *`,
    [req.params.id, req.body.title]
  );

  res.json(quiz.rows[0]);
};

exports.addQuestion = async (req, res) => {
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

  res.json(q.rows[0]);
};

exports.submitQuiz = async (req, res) => {
  const questions = await pool.query(
    `SELECT * FROM quiz_questions
     WHERE quiz_id=$1`,
    [req.params.id]
  );

  const answers = req.body.answers;

  let correct = 0;

  questions.rows.forEach((q, index) => {
    if (answers[index] === q.correct_answer) {
      correct++;
    }
  });

  const score = Math.round(
    (correct / questions.rows.length) * 100
  );

  await pool.query(
    `INSERT INTO quiz_attempts
    (quiz_id,student_id,score)
    VALUES($1,$2,$3)`,
    [req.params.id, req.user.id, score]
  );

  res.json({
    score,
    correct_answers: correct,
    total_questions: questions.rows.length
  });
};