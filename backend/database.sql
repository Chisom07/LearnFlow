CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  password TEXT,
  role VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE courses (
  id SERIAL PRIMARY KEY,
  instructor_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255),
  description TEXT,
  category VARCHAR(255),
  thumbnail TEXT,
  price NUMERIC,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE lessons (
  id SERIAL PRIMARY KEY,
  course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(255),
  description TEXT,
  youtube_video_url TEXT,
  video_title TEXT,
  video_thumbnail TEXT,
  channel_name TEXT,
  duration TEXT,
  pdf_resource TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE enrolments (
  id SERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (student_id, course_id)
);

CREATE TABLE lesson_progress (
  id SERIAL PRIMARY KEY,
  lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
  student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  completed_at TIMESTAMP,
  UNIQUE (lesson_id, student_id)
);

CREATE TABLE quizzes (
  id SERIAL PRIMARY KEY,
  course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE quiz_questions (
  id SERIAL PRIMARY KEY,
  quiz_id INTEGER REFERENCES quizzes(id) ON DELETE CASCADE,
  question TEXT,
  options JSONB,
  correct_answer TEXT
);

CREATE TABLE quiz_attempts (
  id SERIAL PRIMARY KEY,
  quiz_id INTEGER REFERENCES quizzes(id) ON DELETE CASCADE,
  student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  score INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);