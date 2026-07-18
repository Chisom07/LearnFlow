const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const {
  requireCourseOwnership,
  requireEnrolmentByQuizId,
  requireQuizReadAccess
} = require("../middleware/accessMiddleware");
const asyncHandler = require("../utils/asyncHandler");
const controller = require("../controllers/quizController");

router.post(
  "/courses/:id/quizzes",
  auth,
  role("instructor"),
  requireCourseOwnership,
  asyncHandler(controller.createQuiz)
);

router.post(
  "/quizzes/:id/questions",
  auth,
  role("instructor"),
  asyncHandler(controller.addQuestion)
);

router.get(
  "/quizzes/:id/questions",
  auth,
  requireQuizReadAccess,
  asyncHandler(controller.getQuestions)
);

router.post(
  "/quizzes/:id/submit",
  auth,
  role("student"),
  requireEnrolmentByQuizId,
  asyncHandler(controller.submitQuiz)
);

module.exports = router;
