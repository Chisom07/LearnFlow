const pool = require("../config/db");
const { validateYoutubeVideo } = require("../services/youtubeService");

exports.createCourse = async (req, res) => {
  const { title, description, category, price } = req.body;

  const thumbnail = req.file?.path || "";

  const result = await pool.query(
    `INSERT INTO courses
    (title,description,category,thumbnail,price,instructor_id)
    VALUES($1,$2,$3,$4,$5,$6)
    RETURNING *`,
    [
      title,
      description,
      category,
      thumbnail,
      price,
      req.user.id
    ]
  );

  res.json(result.rows[0]);
};

exports.addLesson = async (req, res) => {
  const {
    title,
    description,
    youtube_video_url
  } = req.body;

  const metadata = await validateYoutubeVideo(
    youtube_video_url
  );

  const pdf = req.file?.path || "";

  const lesson = await pool.query(
    `INSERT INTO lessons
    (
      course_id,
      title,
      description,
      youtube_video_url,
      video_title,
      video_thumbnail,
      channel_name,
      duration,
      pdf_resource
    )
    VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)
    RETURNING *`,
    [
      req.params.id,
      title,
      description,
      youtube_video_url,
      metadata.title,
      metadata.thumbnail,
      metadata.channel,
      metadata.duration,
      pdf
    ]
  );

  res.json(lesson.rows[0]);
};

exports.getCourses = async (req, res) => {
  const result = await pool.query(`
    SELECT
      courses.*,
      users.name AS instructor,
      COUNT(DISTINCT lessons.id) AS lesson_count,
      COUNT(DISTINCT enrolments.id) AS student_count
    FROM courses
    LEFT JOIN users ON users.id = courses.instructor_id
    LEFT JOIN lessons ON lessons.course_id = courses.id
    LEFT JOIN enrolments ON enrolments.course_id = courses.id
    GROUP BY courses.id, users.name
    ORDER BY courses.created_at DESC
  `);

  res.json(result.rows);
};

exports.getCourse = async (req, res) => {
  const course = await pool.query(
    `SELECT courses.*, users.name AS instructor
     FROM courses
     JOIN users ON users.id = courses.instructor_id
     WHERE courses.id=$1`,
    [req.params.id]
  );

  const lessons = await pool.query(
    `SELECT * FROM lessons WHERE course_id=$1`,
    [req.params.id]
  );

  res.json({
    ...course.rows[0],
    lessons: lessons.rows
  });
};