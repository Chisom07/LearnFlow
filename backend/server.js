const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const app = express();

app.use(cors({
  origin: "*",
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

app.use("/auth", require("./routes/authRoutes"));
app.use("/courses", require("./routes/courseRoutes"));
app.use("/enrolments", require("./routes/enrolmentRoutes"));
app.use("/", require("./routes/progressRoutes"));
app.use("/", require("./routes/quizRoutes"));
app.use("/dashboard", require("./routes/dashboardRoutes"));

app.listen(process.env.PORT, () => {
  console.log(`Server running on ${process.env.PORT}`);
});