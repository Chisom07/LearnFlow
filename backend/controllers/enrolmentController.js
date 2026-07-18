const pool = require("../config/db");

exports.enrol = async (req, res) => {
  const course = await pool.query(
    "SELECT id FROM courses WHERE id = $1",
    [req.params.courseId]
  );

  if (!course.rows.length) {
    return res.status(404).json({ message: "Course not found" });
  }

  const existing = await pool.query(
    `SELECT * FROM enrolments
     WHERE student_id=$1 AND course_id=$2`,
    [req.user.id, req.params.courseId]
  );

  if (existing.rows.length) {
    return res.status(400).json({
      message: "Already enrolled"
    });
  }

  const enrol = await pool.query(
    `INSERT INTO enrolments(student_id,course_id)
     VALUES($1,$2)
     RETURNING *`,
    [req.user.id, req.params.courseId]
  );

  res.status(201).json({
    message: "Enrolled successfully",
    enrolment: enrol.rows[0]
  });
};

exports.cancelEnrolment = async (req, res) => {
  const result = await pool.query(
    `DELETE FROM enrolments
     WHERE student_id = $1 AND course_id = $2
     RETURNING id`,
    [req.user.id, req.params.courseId]
  );

  if (!result.rows.length) {
    return res.status(404).json({
      message: "You are not enrolled in this course"
    });
  }

  res.json({
    message: "Enrolment cancelled successfully"
  });
};
