# LearnFlow — Student Learning Management System

**Structure learning. Power progress.**

A full-stack learning management system where instructors create courses with video lessons and quizzes, and students enrol, track progress, and submit assessments.

Built for edtech-style workflows similar to platforms like Udemy or uLesson.

---

## Features

### For instructors
- Create and manage courses with optional Cloudinary thumbnails
- Add lessons with YouTube video validation (title, thumbnail, channel, duration)
- Attach PDF resources to lessons
- Create quizzes with multiple-choice questions
- Preview quizzes (read-only, with correct answers highlighted)
- View enrolment stats and per-student progress

### For students
- Browse and search the course catalogue by category
- Enrol in or cancel enrolment from courses
- Watch lessons, open PDF resources, and mark lessons complete
- Track completion percentage and next lesson
- Take quizzes and view recent scores on the dashboard

### Platform
- JWT authentication with httpOnly cookies
- Role-based access control (`student` / `instructor`)
- Enrolment-based access to lessons, progress, and quizzes
- YouTube Data API v3 and Cloudinary integrations
- Seeded demo data for quick local testing

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js, Express.js |
| Database | PostgreSQL |
| Auth | JWT, bcrypt, cookie-parser |
| Validation | Joi |
| Uploads | Multer + Cloudinary |
| Video metadata | YouTube Data API v3 |
| Frontend | HTML, CSS, JavaScript |

---

## Prerequisites

- [Node.js](https://nodejs.org/) 18 or newer
- npm
- [PostgreSQL](https://www.postgresql.org/) 14+

---

## Getting Started

### 1. Clone and install

```bash
git clone <your-repository-url>
cd student-lms
npm install
```

### 2. Create the database

```bash
psql -U postgres -c "CREATE DATABASE lmsdb;"
psql -U postgres -d lmsdb -f backend/database.sql
```

### 3. Configure environment variables

Copy the example file and edit values as needed:

```bash
cp backend/.env.example backend/.env
```

`backend/.env`:

```env
PORT=5000
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/lmsdb
JWT_SECRET=replace_with_a_long_random_secret
YOUTUBE_API_KEY=your_youtube_api_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

| Variable | Required | Purpose |
|---|---|---|
| `PORT` | No (default `5000`) | Server port |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Yes | Signs auth tokens |
| `YOUTUBE_API_KEY` | Yes* | Validates lesson video URLs |
| `CLOUDINARY_*` | Yes* | Course thumbnail / PDF uploads |

\*Needed when creating lessons with YouTube links or uploading files. Browsing and demo seed data work without live API calls.

### 4. Seed demo data

```bash
npm run seed
```

### 5. Start the server

```bash
npm start
```

Open [http://localhost:5000](http://localhost:5000)

For development with auto-reload:

```bash
npm run dev
```

---

## Demo Accounts

After seeding:

| Role | Email | Password |
|---|---|---|
| Instructor | `instructor@lms.test` | `password123` |
| Student | `student@lms.test` | `password123` |

The student account is pre-enrolled in sample courses with partial progress and quizzes ready to take.

---

## Scripts

| Command | Description |
|---|---|
| `npm start` | Start the production server |
| `npm run dev` | Start with Nodemon (auto-reload) |
| `npm run seed` | Insert demo users, courses, lessons, and quizzes |

---

## API Overview

Base URL: `http://localhost:5000`

Auth uses an httpOnly cookie named `token`. Browser requests should send `credentials: "include"`.

### Auth

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/auth/register` | Public | Create account (`student` or `instructor`) |
| `POST` | `/auth/login` | Public | Sign in and set auth cookie |
| `POST` | `/auth/logout` | Public | Clear auth cookie |
| `GET` | `/auth/me` | Authenticated | Current user profile |

### Courses & lessons

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/courses` | Public | List courses |
| `GET` | `/courses/:id` | Public | Course detail, lessons, and quizzes |
| `POST` | `/courses` | Instructor | Create course (optional `thumbnail` file) |
| `POST` | `/courses/:id/lessons` | Instructor (owner) | Add lesson; validates YouTube URL |
| `GET` | `/lessons/:id` | Enrolled student | Lesson detail |
| `POST` | `/lessons/:id/complete` | Enrolled student | Mark lesson complete |

### Enrolments & progress

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/enrolments/:courseId` | Student | Enrol in a course |
| `DELETE` | `/enrolments/:courseId` | Student | Cancel enrolment |
| `GET` | `/courses/:id/progress` | Student (enrolled) / Instructor (owner) | Completion %; next lesson or per-student progress |

### Quizzes

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/courses/:id/quizzes` | Instructor (owner) | Create quiz |
| `POST` | `/quizzes/:id/questions` | Instructor (owner) | Add MCQ question |
| `GET` | `/quizzes/:id/questions` | Enrolled student / Instructor (owner preview) | Fetch questions |
| `POST` | `/quizzes/:id/submit` | Enrolled student | Submit answers, store score |

### Dashboard & health

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/dashboard` | Authenticated | Student learning summary or instructor stats |
| `GET` | `/health` | Public | Server and database status |

---

## Frontend Pages

| Page | Path | Purpose |
|---|---|---|
| Home | `/` or `/index.html` | Landing + featured courses |
| Catalogue | `/courses.html` | Search and filter courses |
| Course detail | `/course.html?id=` | Enrol, lessons, quizzes |
| Lesson player | `/lesson.html?id=` | Video + mark complete |
| Quiz | `/quiz.html?id=` | Attempt or instructor preview |
| Student dashboard | `/dashboard.html` | Progress, scores, discovery |
| Instructor dashboard | `/instructor.html` | Create courses, lessons, quizzes |
| Auth | `/login.html`, `/register.html` | Sign in / create account |

The Express server serves the `frontend/` folder as static files, so one process powers both API and UI.

---

## Project Structure

```
student-lms/
├── backend/
│   ├── config/           # Database and Cloudinary setup
│   ├── controllers/      # Request handlers
│   ├── middleware/       # Auth, roles, enrolment access, uploads, errors
│   ├── routes/           # Express route definitions
│   ├── services/         # YouTube Data API helper
│   ├── validators/       # Joi schemas
│   ├── utils/            # JWT helpers and async wrapper
│   ├── database.sql      # Schema
│   ├── seed.js           # Demo data
│   ├── server.js         # App entry point
│   ├── .env.example
│   └── .env              # Local secrets (not committed)
├── frontend/
│   ├── css/
│   ├── js/
│   └── *.html
├── package.json
└── README.md
```

---

## Access Control Notes

- **Instructors** manage only their own courses, lessons, and quizzes.
- **Students** must be enrolled to open lessons, complete progress, or take quizzes.
- Instructors can **preview** their own quizzes (answers visible) but cannot submit scored attempts.
- Guests can browse the catalogue; enrolment redirects them to login/register first.

---

## Troubleshooting

| Issue | Fix |
|---|---|
| `password authentication failed` | Update `DATABASE_URL` with your real PostgreSQL username/password |
| `Cannot GET /` after restart | Confirm `npm start` is running from the project root |
| YouTube lesson creation fails | Check `YOUTUBE_API_KEY` and that the URL is a valid YouTube watch/short link |
| Upload fails | Verify Cloudinary credentials in `.env` |
| Port already in use | Stop the other process on port `5000`, or change `PORT` |

---

## License

MIT
