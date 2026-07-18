const pool = require("../config/db");

exports.dashboard = async (req, res) => {
  if (req.user.role === "student") {
    const courses = await pool.query(
      `
      SELECT
        courses.*,
        users.name AS instructor,
        COUNT(DISTINCT lessons.id)::int AS total_lessons,
        COUNT(DISTINCT lesson_progress.id)::int AS completed_lessons,
        CASE
          WHEN COUNT(DISTINCT lessons.id) = 0 THEN 0
          ELSE ROUND(
            (COUNT(DISTINCT lesson_progress.id)::numeric
             / COUNT(DISTINCT lessons.id)) * 100
          )::int
        END AS completion_percentage
      FROM enrolments
      JOIN courses ON courses.id = enrolments.course_id
      JOIN users ON users.id = courses.instructor_id
      LEFT JOIN lessons ON lessons.course_id = courses.id
      LEFT JOIN lesson_progress
        ON lesson_progress.lesson_id = lessons.id
        AND lesson_progress.student_id = enrolments.student_id
      WHERE enrolments.student_id = $1
      GROUP BY courses.id, users.name
      ORDER BY courses.created_at DESC
    `,
      [req.user.id]
    );

    const enrolledWithNext = [];

    for (const course of courses.rows) {
      const nextLesson = await pool.query(
        `
        SELECT lessons.*
        FROM lessons
        WHERE lessons.course_id = $1
        AND lessons.id NOT IN (
          SELECT lesson_id FROM lesson_progress
          WHERE student_id = $2
        )
        ORDER BY lessons.id ASC
        LIMIT 1
      `,
        [course.id, req.user.id]
      );

      enrolledWithNext.push({
        ...course,
        next_lesson: nextLesson.rows[0] || null
      });
    }

    const scores = await pool.query(
      `
      SELECT
        quiz_attempts.id,
        quiz_attempts.score,
        quiz_attempts.created_at,
        quizzes.title AS quiz_title,
        quizzes.course_id,
        courses.title AS course_title
      FROM quiz_attempts
      JOIN quizzes ON quizzes.id = quiz_attempts.quiz_id
      JOIN courses ON courses.id = quizzes.course_id
      WHERE quiz_attempts.student_id = $1
      ORDER BY quiz_attempts.created_at DESC
      LIMIT 5
    `,
      [req.user.id]
    );

    return res.json({
      enrolled_courses: enrolledWithNext,
      recent_scores: scores.rows
    });
  }

  const stats = await pool.query(
    `
    SELECT
      COUNT(DISTINCT courses.id)::int AS courses,
      COUNT(DISTINCT enrolments.id)::int AS students,
      COUNT(DISTINCT lessons.id)::int AS lessons
    FROM courses
    LEFT JOIN enrolments ON enrolments.course_id = courses.id
    LEFT JOIN lessons ON lessons.course_id = courses.id
    WHERE courses.instructor_id = $1
  `,
    [req.user.id]
  );

  const myCourses = await pool.query(
    `
    SELECT
      courses.*,
      COUNT(DISTINCT enrolments.id)::int AS student_count,
      COUNT(DISTINCT lessons.id)::int AS lesson_count
    FROM courses
    LEFT JOIN enrolments ON enrolments.course_id = courses.id
    LEFT JOIN lessons ON lessons.course_id = courses.id
    WHERE courses.instructor_id = $1
    GROUP BY courses.id
    ORDER BY courses.created_at DESC
  `,
    [req.user.id]
  );

  res.json({
    courses: stats.rows[0].courses,
    students: stats.rows[0].students,
    lessons: stats.rows[0].lessons,
    my_courses: myCourses.rows
  });
};
