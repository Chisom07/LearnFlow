const pool = require("../config/db");

exports.requireEnrolmentByCourseId = async (req, res, next) => {
  try {
    const courseId = req.params.courseId || req.params.id;

    const enrolment = await pool.query(
      `SELECT id FROM enrolments
       WHERE student_id = $1 AND course_id = $2`,
      [req.user.id, courseId]
    );

    if (!enrolment.rows.length) {
      return res.status(403).json({
        message: "You must be enrolled in this course"
      });
    }

    next();
  } catch (err) {
    next(err);
  }
};

exports.requireEnrolmentByLessonId = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT enrolments.id
       FROM lessons
       JOIN enrolments ON enrolments.course_id = lessons.course_id
       WHERE lessons.id = $1 AND enrolments.student_id = $2`,
      [req.params.id, req.user.id]
    );

    if (!result.rows.length) {
      return res.status(403).json({
        message: "You must be enrolled in this course"
      });
    }

    next();
  } catch (err) {
    next(err);
  }
};

exports.requireEnrolmentByQuizId = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT enrolments.id
       FROM quizzes
       JOIN enrolments ON enrolments.course_id = quizzes.course_id
       WHERE quizzes.id = $1 AND enrolments.student_id = $2`,
      [req.params.id, req.user.id]
    );

    if (!result.rows.length) {
      return res.status(403).json({
        message: "You must be enrolled in this course"
      });
    }

    next();
  } catch (err) {
    next(err);
  }
};

exports.requireQuizReadAccess = async (req, res, next) => {
  try {
    if (req.user.role === "student") {
      const enrolment = await pool.query(
        `SELECT enrolments.id
         FROM quizzes
         JOIN enrolments ON enrolments.course_id = quizzes.course_id
         WHERE quizzes.id = $1 AND enrolments.student_id = $2`,
        [req.params.id, req.user.id]
      );

      if (!enrolment.rows.length) {
        return res.status(403).json({
          message: "You must be enrolled in this course"
        });
      }

      req.quizAccess = "student";
      return next();
    }

    if (req.user.role === "instructor") {
      const ownership = await pool.query(
        `SELECT quizzes.id
         FROM quizzes
         JOIN courses ON courses.id = quizzes.course_id
         WHERE quizzes.id = $1 AND courses.instructor_id = $2`,
        [req.params.id, req.user.id]
      );

      if (!ownership.rows.length) {
        return res.status(403).json({
          message: "You can only preview quizzes from your own courses"
        });
      }

      req.quizAccess = "preview";
      return next();
    }

    return res.status(403).json({ message: "Forbidden" });
  } catch (err) {
    next(err);
  }
};

exports.requireCourseOwnership = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT id FROM courses
       WHERE id = $1 AND instructor_id = $2`,
      [req.params.id, req.user.id]
    );

    if (!result.rows.length) {
      return res.status(403).json({
        message: "You can only manage your own courses"
      });
    }

    next();
  } catch (err) {
    next(err);
  }
};
