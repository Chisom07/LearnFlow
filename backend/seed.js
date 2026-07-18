const path = require("path");
const bcrypt = require("bcrypt");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const pool = require("./config/db");

const instructor = {
  name: "Jane Cooper",
  email: "instructor@lms.test",
  password: "password123",
  role: "instructor"
};

const student = {
  name: "Alex Student",
  email: "student@lms.test",
  password: "password123",
  role: "student"
};

const courses = [
  {
    title: "Introduction to Web Development",
    description:
      "Learn the fundamentals of HTML, CSS, and JavaScript to build modern, responsive websites from scratch.",
    category: "Web Development",
    thumbnail:
      "https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg",
    price: 0,
    lessons: [
      {
        title: "How the Web Works",
        description: "Understand clients, servers, and HTTP.",
        youtube_video_url: "https://www.youtube.com/watch?v=hJHvdBlSxug",
        video_title: "How the Internet Works",
        channel_name: "LearnFlow",
        duration: "12:04"
      },
      {
        title: "Your First HTML Page",
        description: "Build a simple page with headings and links.",
        youtube_video_url: "https://www.youtube.com/watch?v=UB1O30fR-EE",
        video_title: "HTML Crash Course",
        channel_name: "LearnFlow",
        duration: "18:30"
      }
    ],
    quiz: {
      title: "Web Development Basics Quiz",
      questions: [
        {
          question: "What does HTML stand for?",
          options: [
            "HyperText Markup Language",
            "High Tech Modern Language",
            "Home Tool Markup Language",
            "Hyperlink Text Module Language"
          ],
          correct_answer: "HyperText Markup Language"
        },
        {
          question: "Which language styles a web page?",
          options: ["HTML", "CSS", "SQL", "Python"],
          correct_answer: "CSS"
        },
        {
          question: "Which protocol is used to request web pages?",
          options: ["FTP", "SMTP", "HTTP", "SSH"],
          correct_answer: "HTTP"
        }
      ]
    }
  },
  {
    title: "Python for Beginners",
    description:
      "A friendly introduction to programming with Python. Covers variables, loops, functions, and simple projects.",
    category: "Programming",
    thumbnail:
      "https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg",
    price: 29.99,
    lessons: [
      {
        title: "Getting Started with Python",
        description: "Install Python and run your first script.",
        youtube_video_url: "https://www.youtube.com/watch?v=kqtD5dpn9C8",
        video_title: "Python in 100 Seconds",
        channel_name: "LearnFlow",
        duration: "09:15"
      }
    ],
    quiz: {
      title: "Python Fundamentals Quiz",
      questions: [
        {
          question: "Which keyword defines a function in Python?",
          options: ["func", "def", "function", "lambda"],
          correct_answer: "def"
        },
        {
          question: "What is the output of print(2 ** 3)?",
          options: ["6", "8", "9", "5"],
          correct_answer: "8"
        }
      ]
    }
  },
  {
    title: "UI/UX Design Essentials",
    description:
      "Discover the core principles of user interface and user experience design to create products people love.",
    category: "Design",
    thumbnail:
      "https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg",
    price: 49.0,
    lessons: [
      {
        title: "Design Thinking Basics",
        description: "The mindset behind great products.",
        youtube_video_url: "https://www.youtube.com/watch?v=_r0VX-aU_T8",
        video_title: "What is UX Design?",
        channel_name: "LearnFlow",
        duration: "14:47"
      }
    ]
  },
  {
    title: "Data Science with SQL",
    description:
      "Master querying, filtering, and aggregating data with SQL to draw insights from real-world datasets.",
    category: "Data",
    thumbnail:
      "https://images.pexels.com/photos/669615/pexels-photo-669615.jpeg",
    price: 39.5,
    lessons: [
      {
        title: "SELECT Fundamentals",
        description: "Read data from tables the right way.",
        youtube_video_url: "https://www.youtube.com/watch?v=HXV3zeQKqGY",
        video_title: "SQL Tutorial for Beginners",
        channel_name: "LearnFlow",
        duration: "20:10"
      }
    ],
    quiz: {
      title: "SQL Basics Quiz",
      questions: [
        {
          question: "Which clause filters rows in SQL?",
          options: ["ORDER BY", "GROUP BY", "WHERE", "HAVING"],
          correct_answer: "WHERE"
        }
      ]
    }
  }
];

async function upsertUser(user) {
  const hashed = await bcrypt.hash(user.password, 10);
  const result = await pool.query(
    `INSERT INTO users (name, email, password, role)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, role = EXCLUDED.role
     RETURNING id`,
    [user.name, user.email, hashed, user.role]
  );
  return result.rows[0].id;
}

async function seedCourse(course, instructorId) {
  let courseId;
  const existing = await pool.query(
    "SELECT id FROM courses WHERE title = $1",
    [course.title]
  );

  if (existing.rows.length) {
    courseId = existing.rows[0].id;
    console.log(`Using existing course: ${course.title}`);
  } else {
    const courseResult = await pool.query(
      `INSERT INTO courses
       (title, description, category, thumbnail, price, instructor_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [
        course.title,
        course.description,
        course.category,
        course.thumbnail,
        course.price,
        instructorId
      ]
    );
    courseId = courseResult.rows[0].id;

    for (const lesson of course.lessons) {
      await pool.query(
        `INSERT INTO lessons
         (course_id, title, description, youtube_video_url,
          video_title, video_thumbnail, channel_name, duration)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          courseId,
          lesson.title,
          lesson.description,
          lesson.youtube_video_url,
          lesson.video_title,
          course.thumbnail,
          lesson.channel_name,
          lesson.duration
        ]
      );
    }

    console.log(`Added course: ${course.title}`);
  }

  if (course.quiz) {
    const quizExists = await pool.query(
      `SELECT id FROM quizzes WHERE course_id = $1 AND title = $2`,
      [courseId, course.quiz.title]
    );

    if (!quizExists.rows.length) {
      const quiz = await pool.query(
        `INSERT INTO quizzes (course_id, title) VALUES ($1, $2) RETURNING id`,
        [courseId, course.quiz.title]
      );

      for (const q of course.quiz.questions) {
        await pool.query(
          `INSERT INTO quiz_questions (quiz_id, question, options, correct_answer)
           VALUES ($1, $2, $3, $4)`,
          [
            quiz.rows[0].id,
            q.question,
            JSON.stringify(q.options),
            q.correct_answer
          ]
        );
      }

      console.log(`  + quiz: ${course.quiz.title}`);
    }
  }

  return courseId;
}

async function ensureEnrolment(studentId, courseId) {
  const existing = await pool.query(
    `SELECT id FROM enrolments WHERE student_id = $1 AND course_id = $2`,
    [studentId, courseId]
  );

  if (!existing.rows.length) {
    await pool.query(
      `INSERT INTO enrolments (student_id, course_id) VALUES ($1, $2)`,
      [studentId, courseId]
    );
  }
}

async function ensureLessonProgress(studentId, courseId) {
  const lesson = await pool.query(
    `SELECT id FROM lessons WHERE course_id = $1 ORDER BY id ASC LIMIT 1`,
    [courseId]
  );

  if (!lesson.rows[0]) return;

  const existing = await pool.query(
    `SELECT id FROM lesson_progress WHERE lesson_id = $1 AND student_id = $2`,
    [lesson.rows[0].id, studentId]
  );

  if (!existing.rows.length) {
    await pool.query(
      `INSERT INTO lesson_progress (lesson_id, student_id, completed_at)
       VALUES ($1, $2, NOW())`,
      [lesson.rows[0].id, studentId]
    );
  }
}

async function seed() {
  try {
    const instructorId = await upsertUser(instructor);
    const studentId = await upsertUser(student);

    const courseIds = [];
    for (const course of courses) {
      courseIds.push(await seedCourse(course, instructorId));
    }

    for (const courseId of courseIds.slice(0, 2)) {
      await ensureEnrolment(studentId, courseId);
      await ensureLessonProgress(studentId, courseId);
    }

    console.log("\nSeeding complete.");
    console.log(`Instructor -> ${instructor.email} / ${instructor.password}`);
    console.log(`Student    -> ${student.email} / ${student.password}`);
  } catch (err) {
    console.error("Seeding failed:", err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

seed();
