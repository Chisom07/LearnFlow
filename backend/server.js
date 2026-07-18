const path = require("path");
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const asyncHandler = require("./utils/asyncHandler");
const errorMiddleware = require("./middleware/errorMiddleware");

const app = express();

app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

app.use(express.static(path.join(__dirname, "..", "frontend")));

require("./config/db");

app.get("/health", asyncHandler(async (req, res) => {
  const pool = require("./config/db");
  await pool.query("SELECT 1");
  res.json({ status: "ok", database: "connected" });
}));

app.use("/auth", require("./routes/authRoutes"));
app.use("/courses", require("./routes/courseRoutes"));
app.use("/enrolments", require("./routes/enrolmentRoutes"));
app.use("/", require("./routes/progressRoutes"));
app.use("/", require("./routes/quizRoutes"));
app.use("/dashboard", require("./routes/dashboardRoutes"));

app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
