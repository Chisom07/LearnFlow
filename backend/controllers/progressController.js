const pool = require("../config/db");

exports.completeLesson = async (req, res) => {
  const existing = await pool.query(
    `SELECT * FROM lesson_progress
     WHERE lesson_id=$1 AND student_id=$2`,
    [req.params.id, req.user.id]
  );

  if (!existing.rows.length) {
    await pool.query(
      `INSERT INTO lesson_progress
       (lesson_id,student_id,completed_at)
       VALUES($1,$2,NOW())`,
      [req.params.id, req.user.id]
    );
  }

  res.json({
    message: "Lesson completed"
  });
};

exports.getProgress = async (req, res) => {
  const totalLessons = await pool.query(
    `SELECT COUNT(*) FROM lessons WHERE course_id=$1`,
    [req.params.id]
  );

  const completedLessons = await pool.query(
    `SELECT COUNT(*) 
     FROM lesson_progress
     JOIN lessons ON lessons.id = lesson_progress.lesson_id
     WHERE lessons.course_id=$1
     AND lesson_progress.student_id=$2`,
    [req.params.id, req.user.id]
  );

  const total = parseInt(totalLessons.rows[0].count);
  const completed = parseInt(
    completedLessons.rows[0].count
  );

  const nextLesson = await pool.query(
    `SELECT lessons.*
     FROM lessons
     WHERE lessons.course_id=$1
     AND lessons.id NOT IN (
      SELECT lesson_id FROM lesson_progress
      WHERE student_id=$2
     )
     LIMIT 1`,
    [req.params.id, req.user.id]
  );

  res.json({
    completed_lessons: completed,
    total_lessons: total,
    completion_percentage:
      total === 0 ? 0 : Math.round((completed / total) * 100),
    next_lesson: nextLesson.rows[0] || null
  });
};