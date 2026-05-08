const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

const controller = require("../controllers/quizController");

router.post(
  "/courses/:id/quizzes",
  auth,
  role("instructor"),
  controller.createQuiz
);

router.post(
  "/quizzes/:id/questions",
  auth,
  role("instructor"),
  controller.addQuestion
);

router.post(
  "/quizzes/:id/submit",
  auth,
  role("student"),
  controller.submitQuiz
);

module.exports = router;