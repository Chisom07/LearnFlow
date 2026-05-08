const pool = require("../config/db");

exports.dashboard = async (req, res) => {
  if (req.user.role === "student") {
    const courses = await pool.query(`
      SELECT courses.*
      FROM enrolments
      JOIN courses ON courses.id = enrolments.course_id
      WHERE enrolments.student_id = $1
    `, [req.user.id]);

    const scores = await pool.query(`
      SELECT * FROM quiz_attempts
      WHERE student_id=$1
      ORDER BY created_at DESC
      LIMIT 5
    `, [req.user.id]);

    return res.json({
      enrolled_courses: courses.rows,
      recent_scores: scores.rows
    });
  }

  const stats = await pool.query(`
    SELECT
      COUNT(courses.id) AS courses,
      COUNT(enrolments.id) AS students
    FROM courses
    LEFT JOIN enrolments
    ON enrolments.course_id = courses.id
    WHERE courses.instructor_id=$1
  `, [req.user.id]);

  res.json(stats.rows[0]);
};