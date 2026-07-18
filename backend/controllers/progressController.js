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
  const courseId = req.params.id;

  // Instructors see progress for every enrolled student
  if (req.user.role === "instructor") {
    const course = await pool.query(
      `SELECT id FROM courses
       WHERE id = $1 AND instructor_id = $2`,
      [courseId, req.user.id]
    );

    if (!course.rows.length) {
      return res.status(403).json({
        message: "You can only view progress for your own courses"
      });
    }

    const totalResult = await pool.query(
      `SELECT COUNT(*)::int AS total FROM lessons WHERE course_id=$1`,
      [courseId]
    );
    const total = totalResult.rows[0].total;

    const students = await pool.query(
      `SELECT
         users.id AS student_id,
         users.name,
         users.email,
         COUNT(lesson_progress.id)::int AS completed_lessons,
         CASE
           WHEN $2 = 0 THEN 0
           ELSE ROUND(
             (COUNT(lesson_progress.id)::numeric / $2) * 100
           )::int
         END AS completion_percentage
       FROM enrolments
       JOIN users ON users.id = enrolments.student_id
       LEFT JOIN lessons ON lessons.course_id = enrolments.course_id
       LEFT JOIN lesson_progress
         ON lesson_progress.lesson_id = lessons.id
         AND lesson_progress.student_id = enrolments.student_id
       WHERE enrolments.course_id = $1
       GROUP BY users.id, users.name, users.email
       ORDER BY users.name ASC`,
      [courseId, total]
    );

    return res.json({
      course_id: Number(courseId),
      total_lessons: total,
      students: students.rows
    });
  }

  // Students see their own progress
  const totalLessons = await pool.query(
    `SELECT COUNT(*) FROM lessons WHERE course_id=$1`,
    [courseId]
  );

  const completedLessons = await pool.query(
    `SELECT COUNT(*)
     FROM lesson_progress
     JOIN lessons ON lessons.id = lesson_progress.lesson_id
     WHERE lessons.course_id=$1
     AND lesson_progress.student_id=$2`,
    [courseId, req.user.id]
  );

  const total = parseInt(totalLessons.rows[0].count, 10);
  const completed = parseInt(completedLessons.rows[0].count, 10);

  const nextLesson = await pool.query(
    `SELECT lessons.*
     FROM lessons
     WHERE lessons.course_id=$1
     AND lessons.id NOT IN (
      SELECT lesson_id FROM lesson_progress
      WHERE student_id=$2
     )
     ORDER BY lessons.id ASC
     LIMIT 1`,
    [courseId, req.user.id]
  );

  res.json({
    completed_lessons: completed,
    total_lessons: total,
    completion_percentage:
      total === 0 ? 0 : Math.round((completed / total) * 100),
    next_lesson: nextLesson.rows[0] || null
  });
};
