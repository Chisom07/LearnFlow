const pool = require("../config/db");

exports.enrol = async (req, res) => {
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

  res.json(enrol.rows[0]);
};